var fs = require('fs');
var pako = require('pako');

fs.readFile('./output/bundle.min.js',(err, bundle)=>{
    if (err) throw err;
    const zip = pako.gzip(bundle)
    var out = "#define BUNDLE_LEN " + zip.length + "\n" + "const uint8_t BUNDLE[] PROGMEM = {"
    zip.forEach(x=>{
        const char = Buffer.from([x]).toString('hex').toUpperCase()
        out += "0x" + char + ", "
    })
    out += "};"
    fs.writeFile('./output/bundle2.h', out, (err2) => {
        if (err2) throw err2;
        console.log('Successfully wrote bundle.h to ./output');
    })
})
