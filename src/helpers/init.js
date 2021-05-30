import { store } from "../modules/store";
import axios from 'axios'
import {isJson} from './isJson'
import {handleRPCIn} from '../wvr/rpc'
export var ws;
var res; 

export const init = async () => {
    // console.log(window.innerWidth)
    store.handleResize() 
    window.addEventListener('resize', ()=>store.handleResize());
    initWebSockets();
    res = await initStore();
}

export const initStore = async () => {
    store.loading = true
    store.loadingTitle = "loading from WVR"

    const res = await axios({
        method:'get',
        url:'/fsjson',
        responseType: 'json',
        // onDownloadProgress:p=>store.onProgress(p)
    }).catch(e=>{
        console.log("couldnt connect to WVR")
        store.loading = false
    })
    if(!res){
        store.loading = false
        return false
    }
    console.log("found wvr")
    console.log(res.data)
    console.log('40:')
    console.log(res.data.voices[0][40])
    console.log('41:')
    console.log(res.data.voices[0][41])
    
    store.onConnect(res.data)
    store.loading=false
    return true
}

const initWebSockets = async() => {
    ws = new WebSocket("ws://192.168.4.1/ws");
    ws.onopen = e => console.log("ws connected : ", e)
    // ws.onerror = e => ws = initWebSockets()
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

}
