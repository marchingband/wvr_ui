import parseSFZ from 'sfz-parser'
import { store } from '../modules/store';

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
            // not sfz must be a sound file
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
        // notes[key] = notes[key] || {} // initialize new notes
        if(hivel){ // its a rack
            if(pitch_keycenter){ // it's an interpolated rack
                for(let p = lokey; pitch <= hikey; p++){
                    notes[p] = notes[p] || {} // initialize new note
                    notes[p].rack = notes[p].rack || [] // initialize the rack
                    notes[p].rack.push({
                        fileHandle,
                        volume,
                        loop_mode,
                        name: makeName(fileHandle.name),
                        size: fileHandle.size,
                        empty: 0,
                        breakpoint: hivel,
                        pitch: p - pitch_keycenter, // amount of pitchshift
                    })
                }
            } else { // its a normal rack
                notes[key] = notes[key] || {} // initialize new notes
                notes[key].rack = notes[key].rack || [] // initialize the rack
                notes[key].rack.push({
                    fileHandle,
                    volume,
                    loop_mode,
                    name: makeName(fileHandle.name),
                    size: fileHandle.size,
                    empty: 0,
                    breakpoint: hivel,
                    pitch: 0
                })
            }
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
        } else { // its a singleton note
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
    Object.keys(notes).forEach(key=>{
        const note = notes[key]
        if(note.racks){ // its a rack
            const sortedRacks = note.racks.sort((a, b) => a.breakpoint > b.breakpoint)
            const noteData = {
                isRack: -2, // it is a rack that needs to have a number assigned by wvr
                empty: 0,
                name: note.racks[0].name, // it takes on the name of the file
                pitch: note,
                rack: {
                    num_layers: sortedRacks.length,
                    break_points: sortedRacks.map(r=>r.breakpoint),
                    layers: sortedRacks.map(({fileHandle, name, size})=>({fileHandle, name, size, empty: 0}))
                }
            }
            store.notes[key].replace(noteData)
        } else { // its a normal note
            const {name, size, fileHandle, pitch} = note
            const noteData = {
                fileHandle,
                isRack: -1,
                empty: 0,
                name,
                size,
                pitch
            }
        }
    })
    console.log(notes)
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