import { store } from "../modules/store";
import axios from 'axios'
import {isJson} from './isJson'
import {handleRPCIn} from '../wvr/rpc'
import {WVR_IP} from '../modules/constants'
export var ws;
var res; 

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
        store.loadingTitle = `Loading voices ${i+1}`
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
            retry = true
        })
        if(retry){
            i--;
            continue
        }
        voices.push(res.data)
        store.loadProgress = store.loadProgress + 5
    }
    store.loadingTitle = `Loading config`
    store.loadProgress = 90
    let res = await axios({
        method:'get',
        url:'/configjson',
        responseType: 'json',
        // onDownloadProgress: p=>{
        //     let size = p.target.getResponseHeader("size")
        //     store.onProgress(p.loaded / size)
        // }
    })
    .catch(e=>{
        console.log(e)
        store.loading = false
    })

    store.onConnect({
        voices,
        ...res.data
    })
    // console.log(voices[0])
    store.loading = false
}

export const _initStore = async () => {
    store.loadProgress = 0
    store.loadingTitle = "Loading from WVR"
    store.loading = true
    const res = await axios({
        method:'get',
        url:'/fsjson',
        responseType: 'json',
        onDownloadProgress: p=>{
            let size = p.target.getResponseHeader("size")
            store.onProgress(p.loaded / size)
        }
    })
    .then(r=>{
        // console.log(r)
        return r
    })
    .catch(e=>{
        console.log("couldnt connect to WVR")
        store.loading = false
    })
    if(!res){
        store.loading = false
        return false
    }
    console.log("found wvr")
    console.log(res.data)
    // console.log('40:')
    // console.log(res.data.voices[0][40])
    store.onConnect(res.data)
    store.loading=false
    console.log("done fsjson")
    return true
}

const initWebSockets = async() => {
    ws = new WebSocket(`ws://${WVR_IP}/ws`);
    // ws = new WebSocket("ws://192.168.4.1/ws");
    ws.onopen = e => console.log("ws connected : ", e)
    // ws.onerror = e => ws = initWebSockets()
    ws.onclose = () => {
        console.error("closed socket")
        initWebSockets()
    }
    ws.onmessage = ({data}) => {
        
        // console.log(data)
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

}
