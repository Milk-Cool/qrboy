# Sembly

See [opcodes section](opcodes.md) for the instructions list, as well as examples. Some quick notes though:

- Each instruction comes on a new line
- Just typing a number on a line will force the following code to start with the address from that number
- You can use labels (`label:`) for dynamic address references
- You can also point to them (`jmp @label`) from various instructions
- You can use `db` with any amount of arguments to store raw bytes
- You can use `dbr` to store them with reversed bit orders (useful for sprites!)