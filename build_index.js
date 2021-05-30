var fs = require("fs");
var header = "const char MAIN_page[] PROGMEM = R\"=====(\n"
var footer = "\n)=====\";"
fs.readFile('index_top.html',(err1, index_top)=>{
    if (err1) throw err1;
    fs.readFile('index_bottom.html',(err2, index_bottom)=>{
        if (err2) throw err2;
        fs.readFile('./output/bundle.min.js',(err3, bundle)=>{
            if (err3) throw err3;
            let html = header + index_top + bundle + index_bottom + footer;
            fs.writeFile('./output/wvr_ui.h', html, (err) => {
                if (err) throw err;
                console.log('Successfully wrote wvr_ui.h to ./output');
            })
        })
    })
})