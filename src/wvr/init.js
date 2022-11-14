import axios from 'axios'
import { store } from "../modules/store";
import {isJson} from '../helpers/isJson'
import {handleRPCIn} from '../wvr/rpc'
import {WVR_IP} from '../modules/constants'
import {initWebMidi} from '../modules/webMidi'

export var ws;

export const init = async () => {
    store.handleResize() 
    window.addEventListener('resize', ()=>store.handleResize());
    await initWebSockets();
    await initStore();
    // if (store.isRecoveryMode) return;
    // initWebMidi()
}

export const initStore = async () => {
    store.loading = true
    let voices = []
    store.loadProgress = 0
    // for(let i=0; i<16; i++){
    //     let voice = await loadVoice(i)
    //     voices.push(voice)
    // }
    // let voicesEmpty = voices.every(x=>x.length == 0)
    // if(voicesEmpty){
    //     store.isRecoveryMode = true
    // }
    // axios({
    //     method:'get',
    //     url:'/getVoiceData',
    // })
    store.loadingTitle = `Loading config`
    // store.loadProgress = 90
    let {data:config} = await axios({
        method:'get',
        url:'/configjson',
        responseType: 'json',
    })
    .catch(e=>{
        console.log(e)
        store.loading = false
    })
    store.loading = false
    let res = await axios({
        method:'get',
        url:'/getVoiceData',
        responseType: 'blob'
    })
    handleWSBlob(res.data)
    // console.log(res.data)

    // console.log({voices,...config})
    // store.onConnect({
    //     voices,
    //     ...config
    // })
    // store.logData()
    // store.loading = false
    // console.log(JSON.stringify(voices[0][40], null, 2))
}

// export const loadVoice = async i => {
//     store.loadingTitle = `Loading voice ${i+1}`
//     let retry = false
//     let res = await axios({
//         method:'get',
//         url:'/voicejson',
//         responseType: 'json',
//         headers:{
//             "voice": i
//         },
//         timeout:2000,
//     })    
//     .catch(e=>{ // silly AsyncServer was too busy doing something else (who knows what) to handle this and returned an error just because
//         console.log(e)
//         retry = true
//     })
//     if(res && res.data == null){ // silly AsyncServer returned no error code but just made data=null just because
//         retry = true
//     }
//     if(retry){
//         console.log("retry load voice " + i)
//         return await loadVoice(i)
//     }
//     store.loadProgress = store.loadProgress + 5
//     // console.log(res.data)
//     return res.data
// }

const initWebSockets = async() => {
    ws = new WebSocket(`ws://${WVR_IP}/ws`);
    ws.onopen = e => console.log("ws connected : ", e)
    ws.onclose = () => {
        console.error("closed socket")
        initWebSockets()
    }
    ws.onmessage = ({data}) => {
        if(data instanceof Blob){
            handleWSBlob(data)
        } else {
            return(console.log("not a blob"))
        }
    }
    window.onbeforeunload = function() {
        ws.onclose = function () {}; // disable onclose handler first
        ws.close();
        console.log("unload")
    };
}

const handleWSBlob = async blob => {
    const data = await readBlob(blob)
    var arr = new Uint8Array(data)
    console.log(arr)
    const length = arr.length;
    let p = 0
    while(p < length){
        let ret = {}
        ret.lut_index = (arr[p] << 8) & arr[p+1]
        ret.name = String.fromCharCode(...arr.slice(p+2, p+26).filter(x=>x))
        ret.length = a32toi(arr.slice(p+26, p+30))
        ret.start_block = a32toi(arr.slice(p+30, p+34))
        ret.loop_start = a32toi(arr.slice(p+34, p+38))
        ret.loop_end = a32toi(arr.slice(p+38, p+42))
        ret.playback_mode = a32toi(arr.slice(p+42, p+46))
        ret.noteoff_meaning = a32toi(arr.slice(p+46, p+50))
        ret.response_curve = a32toi(arr.slice(p+50, p+54))
        ret.priority = arr[p+54]
        ret.mute_group = arr[p+55]
        ret.empty = arr[p+56]
        ret.breakpoint = arr[p+57]
        ret.chance = arr[p+58]
        console.table(ret)
        p+=66;
    }
}

const readBlob = data => new Promise(res=>{
    var reader = new FileReader
    reader.onloadend = function(){
        res(reader.result)
    }
    reader.readAsArrayBuffer(data)
})

const a32toi = arr => (arr[3] << 24) + (arr[2] << 16) + (arr[1] << 8) + arr[0]
/*
2 -- 0, 1, -> wav_lut index
24 - 98, 101, 101, 112, 46, 119, 97, 118, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -> name
36, 55, 1, 0, -> length
132, 164, 0, 0, ->start_block
0, 0, 0, 0, -> loop_start
0, 0, 0, 0, -> loop_end
0, 0, 0, 0, -> playback_mode
0, 0, 0, 0, -> retrigger mode
0, 0, 0, 0, -> noteoff_meaning
0, 0, 0, 0, -> response_curve
0, -> priority
0, -> mutegroop
0, -> empty
0, -> breakpoint
0, -> chance
121, 96, 236,
 0, 0, 0, 0

*/