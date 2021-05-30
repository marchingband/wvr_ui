var fs = require('fs')
let buff = fs.readFileSync('verb.wav');
let base64data = buff.toString('base64');
let fileData = `export default "${base64data}" `
fs.writeFileSync('./b64.js',fileData)
