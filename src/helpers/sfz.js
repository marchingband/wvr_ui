import parseSFZ from 'sfz-parser'
import { store } from '../modules/store';
import { makeName } from './makeName';

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
    console.log(regions)

    // sort all the regions into notes
    const notes = {}
    regions.forEach(region=>{
        const filehandle = files.find(f=>region.sample.includes(f.name))
        const { pitch_keycenter, key, lokey, hikey, hivel, loop_mode, volume, group} = region
        // notes[key] = notes[key] || {} // initialize new notes
        if(hivel){ // its (probably) a rack
            if(pitch_keycenter){ // it's an interpolated rack
                for(let p = lokey; pitch <= hikey; p++){
                    notes[p] = notes[p] || {} // initialize new note
                    notes[p].rack = notes[p].rack || [] // initialize the rack
                    notes[p].rack.push({
                        filehandle,
                        volume,
                        group,
                        loop_mode,
                        name: makeName(filehandle.name),
                        size: filehandle.size,
                        empty: 0,
                        breakpoint: hivel,
                        pitch: p - pitch_keycenter, // amount of pitchshift
                    })
                }
            } else { // its a normal rack
                notes[key] = notes[key] || {} // initialize new notes
                notes[key].rack = notes[key].rack || [] // initialize the rack
                notes[key].rack.push({
                    filehandle,
                    volume,
                    group,
                    loop_mode,
                    name: makeName(filehandle.name),
                    size: filehandle.size,
                    empty: 0,
                    breakpoint: hivel,
                    pitch: 0
                })
            }
        } else if(pitch_keycenter){ // it's interpolated
            for(let p = lokey; pitch <= hikey; p++){
                notes[p] = {
                    filehandle,
                    volume,
                    group,
                    loop_mode,
                    pitch: p - pitch_keycenter, // amount of pitchshift
                    name: makeName(filehandle.name),
                    size: filehandle.size,
                    empty: 0,
                }
            }
        } else { // its a singleton note
            notes[key] = {
                filehandle,
                volume,
                group,
                loop_mode,
                name: makeName(filehandle.name),
                size: filehandle.size,
                empty: 0,
            }
        }
    })

    // process the notes into racks
    Object.keys(notes).forEach(key=>{
        const note = notes[key]
        if(note.rack){ // its a rack
            const sortedRacks = note.rack
                .map(x=>({
                    ...x, 
                    breakpoint: parseInt(x.breakpoint),
                    group: parseInt(x.group),
                    volume: parseInt(x.volume)
                })) // make sure its not a string
                .reduce((acc, cur)=>!acc.find(x=>x.breakpoint == cur.breakpoint) ? [...acc, cur] : acc, []) // remove duplicate breakpoints
                .sort((a, b) => a.breakpoint - b.breakpoint)
            if(sortedRacks.length == 1){ // it's a fake rack
                const {filehandle, name, size, pitch, group, volume} = sortedRacks[0] // there is only one
                const noteData = {
                    filehandle,
                    isRack: -1,
                    volume: volume || 127,
                    muteGroup: group || 0,
                    empty: 0,
                    name,
                    size,
                    pitch: pitch || 0
                }
                store.voices[store.currentVoice][key] = {...store.voices[store.currentVoice][key], ...noteData}
            } else { // it's actaully a rack
                const noteData = {
                    isRack: -2, // it is a rack that needs to have a number assigned by wvr
                    empty: 0,
                    pitch: sortedRacks[0].pitch || 0, // it takes on the config of the first file,
                    volume: sortedRacks[0].volume || 127,
                    muteGroup: sortedRacks[0].group || 0,
                    rack: {
                        name: sortedRacks[0].name, // it takes on the name of the files
                        num_layers: sortedRacks.length,
                        break_points: [0, ...sortedRacks.map(r=>r.breakpoint)],
                        layers: sortedRacks.map(({filehandle, name, size})=>({filehandle, name, size, empty: 0}))
                    }
                }
                store.voices[store.currentVoice][key] = {...store.voices[store.currentVoice][key], ...noteData}
            }
        } else { // its a normal note
            const {name, size, filehandle, pitch, group, volume} = note
            const noteData = {
                filehandle,
                isRack: -1,
                volume: volume || 127,
                muteGroup: group || 0,
                empty: 0,
                name,
                size,
                pitch
            }
            store.voices[store.currentVoice][key] = {...store.voices[store.currentVoice][key], ...noteData}
        }
    })
    store.voiceNeedsUpdate()
    console.log(store.getVoices())
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