# qrboy
a tiny game console architecture + emulator that fits entire games on a QR code

> note: if you're here just for the games, head over to the `games/` directory and see the [running](#running) section!

![Printed out](images/printedout.png)
![Running](images/running.png)

## what is this?
this is an imaginary console and its emulator that fits, along with the game, on a single qr code. it uses a `data:` URL to load the game in a browser.

## running
on iPhone, i found [this app](https://apps.apple.com/gb/app/qr-code-barcode-image-scanner/id1503971118) to work relatively well, though it has some ads. you scan the qr code, copy its contents, then paste it in chrome (safari doesn't seem to support `data:` URLs; make sure not to use the "enter from clipboard" button and paste manually) and enjoy!!

on Android, you can use Google Lens (likely preinstalled) to scan the QR codes, which will give you the option to copy their contents, or use the [Binary Eye](https://play.google.com/store/apps/details?id=de.markusfisch.android.binaryeye&hl=en) app which will do the same but more efficiently and reliably. then, copy the `data:` URL and paste it in your browser of choice (make sure not to search it!) and enjoy!!

## developing
do `npm i qrboy -g` (make sure npm is instaled!). now you can compile programs from sembly, my own assembly-like language, using `qrcode-sembly`.

see the `docs/` directory for basic documentation and `examples/` for examples.

knowing CHIP-8 development helps! go learn that first if you don't get it, it's also pretty easy and is supported way better by its community