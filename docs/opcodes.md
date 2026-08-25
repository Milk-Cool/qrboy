# Opcodes

Most of these are taken from CHIP-8

7 registers, timers decrement every 50ms

|Bits|Sembly|Description|Argument bits count|
|-|-|-|-|
|00010000XXXXXXXX||Clear the screen|0|
|00010001XXXXXXXX||Return from function|0|
|10000||Jump to address|11|
|10001||Cal function at address|11|
|10010||Skip opcode if register equals to 8bit number|3+8=11|
|10011||Skip opcode if register doesn't equal to 8bit number|3+8=11|
|01000000XX||Skip opcode if register equals another register|3+3=6|
|01000001XX||Skip opcode if register doesn't equal another register|3+3=6|
|10100||Set register to 8bit number|3+8=11|
|10101||Add 8bit number to register, set R7 to overflow|3+8=11|
|01000010XX||Add another register to register, set R7 to overflow|3+3=6|
|01000011XX||Subtract another register from register, set R7 to underflow|3+3=6|
|01000100XX||Set register to another register minus it, set R7 to underflow|3+3=6|
|01000101XX||Set register to the value of another register|3+3=6|
|01000110XX||Set register to the value of it OR another register|3+3=6|
|01000111XX||Set register to the value of it AND another register|3+3=6|
|01001000XX||Set register to the value of it XOR another register|3+3=6|
|01001001XX||Set register to the value of another register, shift right and set R7 to the bit shifted out|3+3=6|
|01001010XX||Set register to the value of another register, shift left and set R7 to the bit shifted out|3+3=6|
|10110||Set P to address|11|
|10111||Set P to address plus R0|11|
|11000||Set register to random byte AND specified byte|3+8=11|
|1111||Draw 8 by number sprite, loaded from P, at X = register Y = another register|3+3+6=12|
|00100000XXXXX||Skip opcode if button from register is pressed|3|
|00100001XXXXX||Skip opcode if button from register is not pressed|3|
|00100010XXXXX||Skip opcode if button from value is pressed|3|
|00100011XXXXX||Skip opcode if button from value is not pressed|3|
|00100100XXXXX||Block execution until button is pressed, then store button number to register|3|
|00100101XXXXX||Set register to value of the delay timer|3|
|00100110XXXXX||Set value of the delay timer to register|3|
|00100111XXXXX||Set value of the sound timer to register, sound is played until it reaches 0|3|
|00101000XXXXX||Add register value to P|3|
|00101001XXXXX||Store value in register to P, P+1 and P+2 as hundreds, tens and ones respectively|3|
|00101010XXXXX||Store values from R0-RX to memory from P and add X+1 to P|3|
|00101011XXXXX||Read values to R0-RX from memory from P and add X+1 to P|3|

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