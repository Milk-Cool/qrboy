#!/usr/bin/env node

import { minify } from "html-minifier";
import QRCode from "qrcode";
import { parseArgs } from "util";
import fs from "fs";
import { join } from "path";

const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
        output: {
            type: "string",
            short: "o",
            default: "-"
        },
        pad: {
            type: "string",
            short: "p",
            default: "512"
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
        hex: {
            type: "boolean",
            short: "h",
            default: false
        }
    }
});

if(positionals.length === 0) {
    console.error("No input files specified, exiting!");
    process.exit(1);
}
const binary = fs.readFileSync(positionals[0]);
const base64 = (values.hex
    ? Buffer.from(binary.toString("ascii").replace(/\s+/g, ""), "hex")
    : binary).toString("base64").replaceAll("=", "");

if(!values.pad.match(/^\d+$/)) {
    console.error("--pad seems to be invalid, exiting!");
    process.exit(1);
}
const emulator = fs.readFileSync(join(import.meta.dirname, "emulator.html"), "utf-8")
    .replaceAll("\"$BASE64\"", JSON.stringify(base64))
    .replaceAll("\"$PAD\"", values.pad);
const url = "data:text/html," + minify(emulator, {
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    collapseWhitespace: true
}).replaceAll("%", "%25").replaceAll("#", "%23") + (values.ln ? "\n" : "");

const qrOpts: QRCode.QRCodeOptions = { errorCorrectionLevel: "L" };
if(values.url) {
    if(values.output === "-") process.stdout.write(url);
    else fs.writeFileSync(values.output, url);
} else {
    if(values.output === "-") process.stdout.write(await QRCode.toBuffer(url, qrOpts));
    else fs.writeFileSync(values.output, await QRCode.toBuffer(url, qrOpts));
}