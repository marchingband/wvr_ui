import axios from 'axios'
import { store } from "../modules/store";
import {isJson} from '../helpers/isJson'
import {handleRPCIn} from '../wvr/rpc'
import {WVR_IP,NUM_VOICES} from '../modules/constants'
import {initWebMidi} from '../modules/webMidi'

export var ws;

export const init = async () => {
    store.handleResize() 
    window.addEventListener('resize', ()=>store.handleResize());
    await initStore();
    if (store.isRecoveryMode) return;
    await initWebSockets();
    initWebMidi()
}

export const initStore = async () => {
    store.loading = true
    let voices = []
    store.loadProgress = 0
    for(let i=0; i<NUM_VOICES; i++){
        let voice = await loadVoice(i)
        voices.push(voice)
    }
    let voicesEmpty = voices.every(x=>x.length == 0)
    if(voicesEmpty){
        store.isRecoveryMode = true
    }
    store.loadingTitle = `Loading config`
    store.loadProgress = 90
    let {data:config} = await axios({
        method:'get',
        url:'/configjson',
        responseType: 'json',
    })
    .catch(e=>{
        console.log(e)
        store.loading = false
    })
    console.log({voices,...config})
    store.onConnect({
        voices,
        ...config
    })
    // store.logData()
    store.loading = false
    // console.log(JSON.stringify(voices[0][40], null, 2))
}

export const loadVoice = async i => {
    store.loadingTitle = `Loading voice ${i+1}`
    let retry = false
    let res = await axios({
        method:'get',
        url:'/voicejson',
        responseType: 'json',
        headers:{
            "voice": i
        },
        timeout:2000,
    })    
    .catch(e=>{ // silly AsyncServer was too busy doing something else (who knows what) to handle this and returned an error just because
        console.log(e)
        retry = true
    })
    if(res && res.data == null){ // silly AsyncServer returned no error code but just made data=null just because
        retry = true
    }
    if(retry){
        console.log("retry load voice " + i)
        return await loadVoice(i)
    }
    store.loadProgress = store.loadProgress + 5
    // console.log(res.data)
    return res.data
}

const initWebSockets = async() => {
    ws = new WebSocket(`ws://${WVR_IP}/ws`);
    ws.onopen = e => console.log("ws connected : ", e)
    ws.onclose = () => {
        console.error("closed socket")
        initWebSockets()
    }
    ws.onmessage = ({data}) => {
        if(!isJson(data)){
            console.log(data)
        } else {
            const msg = JSON.parse(data)
            if(msg.log != undefined){
                console.log(msg.log)
            } else if(msg.procedure != undefined){
                handleRPCIn(msg)
            } else {
                console.log(msg)
            }
        }
    }
    window.onbeforeunload = function() {
        ws.onclose = function () {}; // disable onclose handler first
        ws.close();
        console.log("unload")
    };
}
