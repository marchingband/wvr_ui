import parseSFZ from 'sfz-parser'

export const handleSFZ = async e => {

    let numFiles = e.target.files.length
    let sfzFile;
    let files = []
    for(let i=0;i<numFiles;i++){
        const file = e.target.files[i]
        if(file.name.split(".")[1] == "sfz"){
            // pick first sfz
            if(!sfzFile){
                sfzFile = file
            }
        } else {
            // not sfz
            files.push(e.target.files[i])
        }
    }
    if(!sfzFile || !files.length) return 0;

    const regions = await readSFZ(sfzFile).catch(e=>{return 0})
    const notes = {}

    // sort all the regions into notes
    regions.forEach(region=>{
        const fileHandle = files.find(f=>region.sample.includes(f.name))
        const { pitch_keycenter, key, lokey, hikey, hivel, loop_mode, volume} = region
        if(!notes[key]){
            notes[key] = {} // initialize new notes
        }
        if(hivel){ // its a rack
            if(!notes[key].rack){
                notes[key].rack = [] // initialize the rack
            }
            notes[key].rack.push({
                fileHandle,
                volume,
                loop_mode,
                name: makeName(fileHandle.name),
                size: fileHandle.size,
                empty: 0,
                breakpoint: hivel,
                pitch:0
            })
        } else if(pitch_keycenter){ // it's interpolated
            for(let p = lokey; pitch <= hikey; p++){
                notes[p] = {
                    fileHandle,
                    volume,
                    loop_mode,
                    pitch: p - pitch_keycenter, // amount of pitchshift
                    name: makeName(fileHandle.name),
                    size: fileHandle.size,
                    empty: 0,
                }
            }
        } else { // singleton note
            notes[key] = {
                fileHandle,
                volume,
                loop_mode,
                name: makeName(fileHandle.name),
                size: fileHandle.size,
                empty: 0,
            }
        }
    })

    // process the notes into racks
    Object.keys(notes).forEach(note=>{
        if(note.racks){ // its a rack
            const sortedRacks = note.racks.sort((a, b) => a.breakpoint > b.breakpoint)
            const noteData = {
                isRack: -2,
                empty: 0,
                rack: {
                    num_layers: sortedRacks.length,
                    break_points: sortedRacks.map(r=>r.breakpoint),
                    layers: sortedRacks.map(({fileHandle, name, size})=>({fileHandle, name, size, empty: 0}))
                }
            }
        } else {

        }
    })
    console.log(notes)
}

const handleRegion = ({amp_veltrack, hirand, hivel, key, loop_mode, lorand, lovel, sample, volume, fileHandle}) => {
    const breakpoint = hivel
    const note = key

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