[![CC BY-SA 4.0][cc-by-sa-shield]][cc-by-sa]

[cc-by-sa]: http://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://licensebuttons.net/l/by-sa/4.0/88x31.png
[cc-by-sa-shield]: https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg

# wvr_ui
Web GUI for WVR audio platform.

npm install

npm run dev -> run webpack dev server

npm run build -> build and gzip bundle.h into ./output

now copy output/bundle.h into Arduino/libraries/WVR/src/  
compile and upload new binary to WVR (using FTDI, curl, or the WVR firmware tab in the UI)
WVR will now serve the UI you built
