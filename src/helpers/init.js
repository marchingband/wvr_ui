import { store } from "../modules/store";
import axios from 'axios'
import {isJson} from './isJson'
import {handleRPCIn} from '../wvr/rpc'
import {WVR_IP} from '../modules/constants'
export var ws;

export const init = async () => {
    store.handleResize() 
    window.addEventListener('resize', ()=>store.handleResize());
    await initWebSockets();
    await initStore();
}

export const initStore = async () => {
    store.loading = true
    let voices = []
    store.loadProgress = 0
    for(let i=0; i<16; i++){
        let voice = await loadVoice(i)
        voices.push(voice)
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
        timeout:5000,
    })    
    .catch(e=>{
        console.log(e)
        retry = true
    })
    if(retry){
        console.log("retry load voice " + i)
        return await loadVoice(i)
    }
    // throttle requests a little
    // await new Promise(res=>setTimeout(()=>res(),100))
    store.loadProgress = store.loadProgress + 5
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
