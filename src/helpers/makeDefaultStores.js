import {observable} from 'mobx'
import {IGNORE, NOTE_ON, ONE_SHOT, RETRIGGER, EDGE_FALLING, EDGE_NONE, ROOT_SQUARE} from '../modules/constants'
import { store } from '../modules/store'

export const defaultVoices = () => {
    const voices = []
    for(let i=0;i<16;i++){
        let voice = []
        for(let j=0;j<128;j++){
            voice.push({
                name:'',
                size:0,
                isRack:-1,
                mode:ONE_SHOT,
                retrigger:RETRIGGER,
                noteOff:IGNORE,
                responseCurve:ROOT_SQUARE,
                loopStart:1,
                loopEnd:2,
                samples:0,
                priority:0,
                muteGroup:0,
                dist:0,
                verb:0,
                pitch:0,
                vol:100,
                pan:0
            })
        }
        voices[i]=observable(voice)
    }
    return observable(voices)
}

export const default_fx = {
    dist:0,
    verb:0,
    pitch:0,
    vol:100,
    pan:0
}

export const fillVoices = () => {
    let voice = []
    for(let i=0;i<128;i++){
        let note = {
            name:'1234567890123456789012',
            size:0,
            isRack:-1,
            mode:ONE_SHOT,
            retrigger:RETRIGGER,
            noteOff:IGNORE,
            responseCurve:ROOT_SQUARE,
            priority:0,
            empty:0,
            isRack:i,
            rack:{
                breakPoints:Array(33).fill().map((x,i)=>i),
                free:0,
                name: "1234567890123456789012",
                num_layers: 32,
                layers:[]
            },
        }
        for(let j=0; j<32; j++){
            note.rack.layers[j] = {
                name:"1234567890123456789012",
                empty: 0,
                size: 1234567
            }
        }
        voice.push(note)
    }
    console.log(voice)
    const voices = [voice,[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]
    store.voices.replace(voices)
}


export const defaultPinConfig = [
    {
        name:'GND',
    },
    {
        note:40,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D0',
        debounce:60
    },
    {
        note:41,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D1',
        debounce:60
    },
    {
        note:42,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D2',
        debounce:60
    },
    {
        note:43,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D3',
        debounce:60
    },
    {
        note:44,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D4',
        debounce:60
    },
    {
        note:45,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D5',
        debounce:60
    },
    {
        touch:false,
        note:46,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D6 A0* T3',
        debounce:60
    },
    {
        name:'RX/MIDI',
    },
    {
        name:'RX/MIDI VREF',
    },
    {
        name:'9V',
    },
    {
        name:'GND',
    },
    {
        name:'3.3v',
    },
    {
        note:47,
        velocity:127,
        edge:EDGE_NONE,
        action:NOTE_ON,
        name:'D7 A1*',
        debounce:60
    },
    {
        note:48,
        velocity:127,
        edge:EDGE_NONE,
        action:NOTE_ON,
        name:'D8 A2*',
        debounce:60
    },
    {
        note:49,
        velocity:127,
        edge:EDGE_NONE,
        action:NOTE_ON,
        name:'D9 A3*',
        debounce:60
    },
    {
        note:50,
        velocity:127,
        edge:EDGE_NONE,
        action:NOTE_ON,
        name:'D10 A4*',
        debounce:60
    },
    {
        touch:false,
        note:51,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D11 A5 T0',
        debounce:60
    },
    {
        touch:false,
        note:52,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D12 A6 T1',
        debounce:60
    },
    {
        touch:false,
        note:53,
        velocity:127,
        edge:EDGE_FALLING,
        action:NOTE_ON,
        name:'D13 A7 T2',
        debounce:60
    },
    {
        name:'AUDIO R',
    },
    {
        name:'AUDIO L',
    },
]

export const defaultMetadata = {
    globalVolume : 127,
    shouldCheckStrappingPin : 1,
    recoveryModeStrappingPin : 1,
    wLogVerbosity : 3,
    wifiStartsOn : 1,
    midiChannel : 0,
}