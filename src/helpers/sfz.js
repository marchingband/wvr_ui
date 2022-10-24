import parseSFZ from 'sfz-parser'
import { ASR_LOOP, HALT, IGNORE, LINEAR, LOOP, ONE_SHOT, RETRIGGER } from '../modules/constants';
import { store } from '../modules/store';
import { makeName, path2name } from './makeName';
import { analyzeWav } from '../audio/analyzeWav';

const fromDb = db => {
    const vol = 100 - Math.round((db - 6) / -1.51) // db range -144 to 6
    return Math.min(100, Math.max(0, vol)) // clamp to 0-100
}

const getLoopMode = ({loop_mode, loop_end}) => {
    if(!loop_mode){
        return loop_end ? LOOP : ONE_SHOT
    }
    if(["no_loop", "one_shot"].includes(loop_mode)){
        return ONE_SHOT
    }
    if(loop_mode == "loop_continuous"){
        return LOOP
    }
    return ASR_LOOP
}

const getNoteOffMode = ({loop_mode, loop_end}) => {
    if(!loop_mode){
        if(loop_end){
            return IGNORE
        }
        return HALT
    }
    if(["one_shot", "loop_sustain"].includes(loop_mode)){
        return IGNORE
    }
    return HALT   
}

const makeConfig = async ({pitch, region, filehandle}) => {
    const { pitch_keycenter, hivel, loop_mode, volume, group, reverb_wet, disto_wet, pan, loop_start, loop_end, polyphony_stealing} = region
    const loopMode = getLoopMode({loop_mode, loop_end})
    const config = {
        filehandle,
        volume: fromDb(parseInt(volume)) || 100,
        muteGroup: parseInt(group) || 0,
        name: makeName(filehandle.name),
        size: filehandle.size,
        empty: 0,
        pitch: pitch ? pitch - parseInt(pitch_keycenter) : 0, // amount of pitchshift
        verb: parseInt(reverb_wet) || 0,
        dist: parseInt(disto_wet) || 0,
        pan: parseInt(pan) || 0,
        retrigger: RETRIGGER,
        priority: parseInt(polyphony_stealing) || 0,
        responseCurve: LINEAR,
        // loop_mode
        // no_loop: no looping will be performed. Sample will play straight from start to end, or until note off, whatever reaches first.
        // one_shot: sample will play from start to end, ignoring note off. This is commonly used for drums. This mode is engaged automatically if the count opcode is defined.
        // loop_continuous: once the player reaches sample loop point, the loop will play until note expiration. This includes looping during the release phase.
        // loop_sustain: the player will play the loop while the note is held, by keeping it depressed or by using the sustain pedal (CC64). During the release phase, there’s no looping.
        noteOff: getNoteOffMode({loop_mode, loop_end}),
        mode: loopMode,
    }
    if(hivel){
        config.breakpoint = hivel
    }
    if(loopMode == ASR_LOOP){
        const len = await analyzeWav(filehandle)
        config.loopStart = parseInt(loop_start) || 0
        config.loopEnd = parseInt(loop_end) || len
    }
    return config
}

export const handleSFZ = async e => {
    let numFiles = e.target.files.length
    let sfzFile;
    let files = []
    for(let i=0;i<numFiles;i++){
        const file = e.target.files[i]
        console.log(file.name)
        if(file.name.split(".")[1] == "sfz"){
            // pick first sfz
            sfzFile = sfzFile ? sfzFile : file;
        } else {
            // not sfz must be a sound file
            files.push(e.target.files[i])
        }
    }
    if(!sfzFile) return Promise.reject("Np .sfz file found");
    if(!files.length) return Promise.reject("no sound files found");

    const regions = await readSFZ(sfzFile).catch(e=>{return Promise.reject("no readable .sfz file")})
    if(!regions.length){return Promise.reject("no regions extraced from .sfz")}
    
    const cont = confirm(`found ${sfzFile.name} and ${files.length} files, continue to allocate these files?`)
    if(!cont) return;

    // sort all the regions into notes
    const notes = {}
    for(let region of regions){
        const { pitch_keycenter, key, lokey, hikey, hivel, trigger, sample } = region
        const filehandle = files.find(f=>path2name(f.name) == path2name(sample.trim()))
        if(!filehandle){
            console.log("cant find " + sample)
            continue
        }
        if(trigger) continue; // if any trigger value is present its assumed others are expected so reject
        if(hivel){ // its (probably) a rack
            if(pitch_keycenter){ // it's an interpolated rack
                for(let p = lokey; p <= hikey; p++){
                    notes[p] = notes[p] || {} // initialize new note
                    notes[p].rack = notes[p].rack || [] // initialize the rack
                    notes[p].rack.push(await makeConfig({pitch: p, region, filehandle}))
                }
            } else { // its a normal rack
                notes[key] = notes[key] || {} // initialize new notes
                notes[key].rack = notes[key].rack || [] // initialize the rack
                notes[key].rack.push(await makeConfig({region, filehandle}))
            }
        } else if(pitch_keycenter){ // it's interpolated
            for(let p = lokey; p <= hikey; p++){
                notes[p] = await makeConfig({pitch: p, region, filehandle})
            }
        } else { // its a singleton note
            notes[key] = await makeConfig({region, filehandle})
        }
    }

    // process the notes into racks
    Object.keys(notes).forEach(key=>{
        const note = notes[key]
        if(note.rack){ // its rack-like
            const sortedRacks = note.rack
                .reduce((acc, cur)=>!acc.find(x=>x.breakpoint == cur.breakpoint) ? [...acc, cur] : acc, []) // remove duplicate breakpoints
                .sort((a, b) => a.breakpoint - b.breakpoint)
            if(sortedRacks.length == 1){ // it's a fake rack
                const noteData = {
                    ...sortedRacks[0],
                    isRack: -1,
                }
                store.voices[store.currentVoice][key] = {...store.voices[store.currentVoice][key], ...noteData}
            } else { // it's actaully a rack
                const noteData = {
                    isRack: -2, // it is a rack that needs to have a number assigned by wvr
                    empty: 0,
                    // it takes on the config of the first sound,
                    pitch: sortedRacks[0].pitch, 
                    volume: sortedRacks[0].volume,
                    pan: sortedRacks[0].pan,
                    dist: sortedRacks[0].dist,
                    muteGroup: sortedRacks[0].muteGroup,
                    retrigger: sortedRacks[0].retrigger,
                    priority: sortedRacks[0].priority,
                    responseCurve: sortedRacks[0].responseCurve,
                    noteOff: sortedRacks[0].noteOff,
                    mode: sortedRacks[0].mode,
                    rack: {
                        name: sortedRacks[0].name, // it takes on the config of the sounds
                        num_layers: sortedRacks.length,
                        break_points: [0, ...sortedRacks.map(r=>r.breakpoint)],
                        layers: sortedRacks.map(({filehandle, name, size})=>({filehandle, name, size, empty: 0}))
                    }
                }
                store.voices[store.currentVoice][key] = {...store.voices[store.currentVoice][key], ...noteData}
            }
        } else { // its a normal note
            const noteData = {
                ...note,
                isRack: -1,
            }
            store.voices[store.currentVoice][key] = {...store.voices[store.currentVoice][key], ...noteData}
        }
    })
    store.voiceNeedsUpdate()
    console.log(store.getVoices())
}

const readSFZ = file => new Promise((res, rej)=>{
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = text => {
        const xmlString = text.target.result
        const data = parseSFZ( xmlString );
        res(data)
    };
    fileReader.onerror = rej
    fileReader.onabort = rej
})