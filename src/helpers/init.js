import { store } from "../modules/store";
import axios from 'axios'
import {isJson} from './isJson'
import {handleRPCIn} from '../wvr/rpc'
import {WVR_IP} from '../modules/constants'
export var ws;
var res; 

export const init = async () => {
    // console.log(window.innerWidth)
    store.handleResize() 
    window.addEventListener('resize', ()=>store.handleResize());
    await initWebSockets();
    await initStore();
}

export const initStore = async () => {
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
    // console.log(window.location.hostname)
    ws = new WebSocket(`ws://${window.location.hostname}/ws`);
    // ws = new WebSocket(`ws://${WVR_IP}/ws`);
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