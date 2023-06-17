var fs = require("fs");
var header = "const char MAIN_page[] PROGMEM = R\"=====(\n"
var footer = "\n)=====\";"
fs.readFile('index_top.html',(err1, index_top)=>{
    if (err1) throw err1;
    fs.readFile('index_bottom.html',(err2, index_bottom)=>{
        if (err2) throw err2;
        fs.readFile('./output/bundle.min.js',(err3, bundle)=>{
            if (err3) throw err3;
            let h = header + index_top + bundle + index_bottom + footer;
            let html = index_top + bundle + index_bottom;
            fs.writeFile('./output/wvr_ui.h', h, (err) => {
                if (err) throw err;
                console.log('Successfully wrote wvr_ui.h to ./output');
            })
            fs.writeFile('./output/wvr_ui.html', html, (err) => {
                if (err) throw err;
                console.log('Successfully wrote wvr_ui.html to ./output');
            })
        })
    })
})