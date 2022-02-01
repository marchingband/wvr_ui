# wvr_ui
Web GUI for WVR audio platform.

npm install

npm run dev -> run webpack dev server

npm run build -> build and gzip bundle.h into ./output

now copy output/bundle.h into Arduino/libraries/WVR/src/
compile and upload new binary to WVR (using FTDI, curl, or the WVR firmware tab in the UI)
WVR will now serve the UI you built
