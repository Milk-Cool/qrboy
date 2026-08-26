#!/usr/bin/env node

import { parseArgs } from "util";
import fs from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { spawnSync } from "child_process";

const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
        output: {
            type: "string",
            short: "o",
            default: "-"
        },
        raw: {
            type: "boolean",
            short: "r",
            default: false
        },
        pad: {
            type: "string",
            short: "p",
            default: "2048"
        },
        ln: {
            type: "boolean",
            short: "l",
            default: false
        },
        url: {
            type: "boolean",
            short: "u",
            default: false
        },
        size: {
            type: "boolean",
            short: "s",
            default: false
        }
    }
});

if(positionals.length === 0) {
    console.error("No input files specified, exiting!");
    process.exit(1);
}
const code = fs.readFileSync(positionals[0], "utf-8").split("\n").map(x => x.split(";")[0].trim());

const NUMBER_REGEX = /^(\d+|0x[0-9a-fA-F]+|0b[01]+)$/;
const parseNumber = (str: string) => str.startsWith("0b")
    ? parseInt(str.slice(2), 2)
    : parseInt(str); // hex values are handled by `parseInt` correctly
const REGISTER_REGEX = /^R[0-7]$/;
const MARKER_REGEX = /^\w+:$/;
const POINTER_REGEX = /^@\w+$/;
const out: (number | ["address", number] | ["marker" | "pointer", string])[] = [];
type TokenType = "number" | "register" | "marker" | "pointer";
class ExpectationError extends Error {};
class DerivationError extends Error {};
class AddressError extends Error {};
class PointerError extends Error {};
let n = 0;
const expect = (str: string, mask: string): [TokenType, any] => {
    if(mask.includes("n") && str.match(NUMBER_REGEX)) return ["number", parseNumber(str)];
    else if(mask.includes("r") && str.match(REGISTER_REGEX)) return ["register", parseInt(str[1])];
    else if(mask.includes("m") && str.match(MARKER_REGEX)) return ["marker", str.slice(0, -1)];
    else if(mask.includes("p") && str.match(POINTER_REGEX)) return ["pointer", str.slice(1)];
    throw new ExpectationError(`Unknown or wrong argument type at line ${n}`);
};
const derive = <T>(args: string[], cases: Record<string, (values: any[]) => T>) => {
    for(const [k, v] of Object.entries(cases)) {
        try {
            if(args.length !== k.length) continue;
            let i = 0, values = [];
            for(const mask of k.split("")) values.push(expect(args[i++], mask)[1]);
            return v(values);
        } catch(e) {
            if(!(e instanceof ExpectationError)) throw e;
        };
    }
    throw new DerivationError(`Unknown or wrong argument set at line ${n}`);
};
const revBits = (n: number) => {
    let o = 0;
    for(let i = 0; i < 8; i++) {
        o <<= 1;
        o |= (n >> i) & 1;
    }
    return o;
};
for(const line of code) {
    n++;
    const split = line.split(/\s+/g);
    if(split.length < 1) continue;
    const instr = split[0];
    const args = split.slice(1);
    try {
        derive([instr], {
            n: v => out.push(["address", v[0]]),
            m: v => out.push(["marker", v[0]]),
        });
        continue;
    } catch(e) {
        if(!(e instanceof DerivationError)) throw e;
    }
    if(instr === "clr") out.push(0b00010000, 0b00000000);
    else if(instr === "ret") out.push(0b00010001, 0b00000000);
    else if(instr === "jump"|| instr === "jmp") derive(args, {
        p: v => out.push(0b10000000, ["pointer", v[0]]),
        n: v => out.push(0b10000000 | (v[0] >> 8), v[0]),
    });
    else if(instr === "call") derive(args, {
        p: v => out.push(0b10001000, ["pointer", v[0]]),
        n: v => out.push(0b10001000 | (v[0] >> 8), v[0]),
    });
    else if(instr === "seq") derive(args, {
        rn: v => out.push(0b10010000 | v[0], v[1]),
        rr: v => out.push(0b01000000, (v[0] << 3) | v[1]),
    });
    else if(instr === "sneq") derive(args, {
        rn: v => out.push(0b10011000 | v[0], v[1]),
        rr: v => out.push(0b01000001, (v[0] << 3) | v[1]),
    });
    else if(instr === "set" || instr === "mov") derive(args, {
        rn: v => out.push(0b10100000 | v[0], v[1]),
        rr: v => out.push(0b01000101, (v[0] << 3) | v[1]),
    });
    else if(instr === "add") derive(args, {
        rn: v => out.push(0b10101000 | v[0], v[1]),
        rr: v => out.push(0b01000010, (v[0] << 3) | v[1]),
    });
    else if(instr === "sub") derive(args, {
        rn: v => out.push(0b10101000 | v[0], -v[1]),
        rr: v => out.push(0b01000011, (v[0] << 3) | v[1]),
    });
    else if(instr === "subr") derive(args, {
        rr: v => out.push(0b01000100, (v[0] << 3) | v[1]),
    });
    else if(instr === "or") derive(args, {
        rr: v => out.push(0b01000110, (v[0] << 3) | v[1]),
    });
    else if(instr === "and") derive(args, {
        rr: v => out.push(0b01000111, (v[0] << 3) | v[1]),
    });
    else if(instr === "xor") derive(args, {
        rr: v => out.push(0b01001000, (v[0] << 3) | v[1]),
    });
    else if(instr === "bsr") derive(args, {
        rr: v => out.push(0b01001001, (v[0] << 3) | v[1]),
    });
    else if(instr === "bsl") derive(args, {
        rr: v => out.push(0b01001010, (v[0] << 3) | v[1]),
    });
    else if(instr === "setp" || instr === "movp") derive(args, {
        p: v => out.push(0b10110000, ["pointer", v[0]]),
        n: v => out.push(0b10110000 | (v[0] >> 8), v[0]),
    });
    else if(instr === "setp0" || instr === "movp0") derive(args, {
        p: v => out.push(0b10111000, ["pointer", v[0]]),
        n: v => out.push(0b10111000 | (v[0] >> 8), v[0]),
    });
    else if(instr === "andr") derive(args, {
        rn: v => out.push(0b11000000 | v[0], v[1]),
    });
    else if(instr === "draw") derive(args, {
        rrn: v => out.push(0b11110000 | (v[0] << 1) | (v[1] >> 2), ((v[1] & 3) << 6) | v[2]),
    });
    else if(instr === "sbp") derive(args, {
        r: v => out.push(0b00100000, v[0]),
        n: v => out.push(0b00100010, v[0]),
    });
    else if(instr === "sbnp") derive(args, {
        r: v => out.push(0b00100001, v[0]),
        n: v => out.push(0b00100011, v[0]),
    });
    else if(instr === "setb" || instr === "movb") derive(args, {
        r: v => out.push(0b00100100, v[0]),
    });
    else if(instr === "setdr" || instr === "movdr") derive(args, {
        r: v => out.push(0b00100101, v[0]),
    });
    else if(instr === "setd" || instr === "movd") derive(args, {
        r: v => out.push(0b00100110, v[0]),
    });
    else if(instr === "sets" || instr === "movs") derive(args, {
        r: v => out.push(0b00100111, v[0]),
    });
    else if(instr === "addp") derive(args, {
        r: v => out.push(0b00101000, v[0]),
    });
    else if(instr === "dcm") derive(args, {
        r: v => out.push(0b00101001, v[0]),
    });
    else if(instr === "psav") derive(args, {
        r: v => out.push(0b00101010, v[0]),
    });
    else if(instr === "plod") derive(args, {
        r: v => out.push(0b00101011, v[0]),
    });
    else if(instr === "db") out.push(...args.map(parseNumber));
    else if(instr === "dbr") out.push(...args.map(x => revBits(parseNumber(x))));
}

let buf = Buffer.alloc(0);
for(const el of out) {
    if(typeof el === "number")
        buf = Buffer.concat([buf, Buffer.from([el & 0xff])]);
    else if(el[0] === "address") {
        if(buf.length > el[1]) throw new AddressError(`Can't fit to ${el[0]} bytes since preceding code is larger!`);
        buf = Buffer.concat([buf, Buffer.alloc(el[1] - buf.length)]);
    } else if(el[0] === "pointer") {
        let n = 0, flag = false;
        for(const subel of out) {
            if(typeof subel === "number") n++;
            else if(subel[0] === "address") n = subel[1];
            else if(subel[0] === "pointer") n++;
            else if(subel[0] === "marker" && subel[1] === el[1]) {
                flag = true;
                break;
            }
        }
        if(!flag) throw new PointerError(`Marker not found: ${el[1]}`);
        buf[buf.length - 1] |= n >> 8;
        buf = Buffer.concat([buf, Buffer.from([n & 0xff])]);
    }
}

if(!values.pad.match(/^\d+$/)) {
    console.error("--pad seems to be invalid, exiting!");
    process.exit(1);
}

if(values.size) process.stderr.write(`Program size is ${buf.length}B\n`);

if(values.raw) {
    if(values.output === "-") process.stdout.write(buf);
    else fs.writeFileSync(values.output, buf);
} else {
    const p = join(tmpdir(), "qr-" + randomBytes(8).toString("hex") + ".bin");
    fs.writeFileSync(p, buf);
    const options = [["u", values.url], ["l", values.ln]].filter(x => x[1]).map(x => x[0]).join("");
    const { status } = spawnSync("qrboy-embed", [p, "-p", values.pad, "-o", values.output].concat(options ? ["-" + options] : []), { stdio: "inherit" });
    if(status !== 0) process.exit(3);
}