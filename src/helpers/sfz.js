import parseSFZ from 'sfz-parser'

export const handleSFZ = async e => {

    let numFiles = e.target.files.length
    let files = []
    for(let i=0;i<numFiles;i++){
        files.push(e.target.files[i])
    }

    const sfzFile = files.find(f=>f.name.split(".")[1] == "sfz")
    if(!sfzFile)return 0;

    const regions = await readSFZ(sfzFile).catch(e=>{return 0})
    regions.forEach(handleRegion)

}

const handleRegion = ({amp_veltrack, hirand, hivel, key, loop_mode, lorand, lovel, sample, volume}) => {
    

}

const readSFZ = file => new Promise(res=>{
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = text => {
        const xmlString = text.target.result
        const data = parseSFZ( xmlString );
        res(data)
    };
})