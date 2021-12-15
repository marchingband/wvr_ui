var fs = require('fs');
var pako = require('pako');

fs.readFile('./output/bundle.min.js',(err, bundle)=>{
    if (err) throw err;
    const zip = pako.gzip(bundle)
    fs.writeFile('./output/bundle.min.js.gz', zip,(err)=>{
        console.log(err || "Successfully wrote bundle.min.js.gz to ./output" )
    })
    var out = "#define BUNDLE_LEN " + zip.length + "\n" + "const uint8_t BUNDLE[] PROGMEM = {"
    zip.forEach(x=>{
        const char = Buffer.from([x]).toString('hex').toUpperCase()
        out += "0x" + char + ", "
    })
    out += "};"
    fs.writeFile('./output/bundle.h', out, (err2) => {
        if (err2) throw err2;
        console.log('Successfully wrote bundle.h to ./output');
    })
})
