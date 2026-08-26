# Opcodes

Most of these are taken from CHIP-8

7 registers, timers decrement every 50ms

|Bits|Sembly|Description|Argument bits count|
|-|-|-|-|
|00010000XXXXXXXX|`clr`|Clear the screen|0|
|00010001XXXXXXXX|`ret`|Return from function|0|
|10000|`jump A`, `jmp A`|Jump to address|11|
|10001|`call A`|Call function at address|11|
|10010|`seq R N`|Skip opcode if register equals to 8bit number|3+8=11|
|10011|`sneq R N`|Skip opcode if register doesn't equal to 8bit number|3+8=11|
|01000000XX|`seq R R`|Skip opcode if register equals another register|3+3=6|
|01000001XX|`sneq R R`|Skip opcode if register doesn't equal another register|3+3=6|
|10100|`set R N`, `mov R N`|Set register to 8bit number|3+8=11|
|10101|`add R N`|Add 8bit number to register, set R7 to overflow|3+8=11|
|01000010XX|`add R R`|Add another register to register, set R7 to overflow|3+3=6|
|01000011XX|`sub R R`|Subtract another register from register, set R7 to underflow|3+3=6|
|01000100XX|`subr R R`|Set register to another register minus it, set R7 to underflow|3+3=6|
|01000101XX|`set R R`, `mov R R`|Set register to the value of another register|3+3=6|
|01000110XX|`or R R`|Set register to the value of it OR another register|3+3=6|
|01000111XX|`and R R`|Set register to the value of it AND another register|3+3=6|
|01001000XX|`xor R R`|Set register to the value of it XOR another register|3+3=6|
|01001001XX|`bsr R R`|Set register to the value of another register, shift right and set R7 to the bit shifted out|3+3=6|
|01001010XX|`bsl R R`|Set register to the value of another register, shift left and set R7 to the bit shifted out|3+3=6|
|10110|`setp A`|Set P to address|11|
|10111|`setp0 A`|Set P to address plus R0|11|
|11000|`andr R N`|Set register to random byte AND specified byte|3+8=11|
|1111|`draw R R N`|Draw 8 by number plus 1 sprite, loaded from P, at X = register Y = another register|3+3+6=12|
|00100000XXXXX|`sbp R`|Skip opcode if button from register is pressed|3|
|00100001XXXXX|`sbnp R`|Skip opcode if button from register is not pressed|3|
|00100010XXXXX|`sbp N`|Skip opcode if button from value is pressed|3|
|00100011XXXXX|`sbnp N`|Skip opcode if button from value is not pressed|3|
|00100100XXXXX|`setb R`, `movb R`|Block execution until button is pressed, then store button number to register|3|
|00100101XXXXX|`setdr R`, `movdr R`|Set register to value of the delay timer|3|
|00100110XXXXX|`setd R`, `movd R`|Set value of the delay timer to register|3|
|00100111XXXXX|`sets R`, `movs R`|Set value of the sound timer to register, background is white until it reaches 0|3|
|00101000XXXXX|`addp R`|Add register value to P|3|
|00101001XXXXX|`dcm R`|Store value in register to P, P+1 and P+2 as hundreds, tens and ones respectively|3|
|00101010XXXXX|`psav R`|Store values from R0-RX to memory from P and add X+1 to P|3|
|00101011XXXXX|`plod R`|Read values to R0-RX from memory from P and add X+1 to P|3|

## Leftovers
|Bits|Argument bits count
|-|-|
|11001|11|
|11010|11|
|11011|11|
|11100|11|
|11101|11|
|01Y||
|001Y||
|0001Y||