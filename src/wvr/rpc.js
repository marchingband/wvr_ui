import { ws } from "../helpers/init";
import { store } from "../modules/store";

const RPC_NOTE_ON     = 0;
const RPC_NOTE_OFF    = 1;
const RPC_VOICE_UP    = 2
const RPC_VOICE_DOWN  = 3
const RPC_WIFI_TOGGLE = 4

export const handleRPCIn = json => {
    if(json.procedure == undefined){
        console.log("rpc received no procedure field")
        return
    }
    if(json.procedure == RPC_NOTE_ON){
        const {voice,note,velocity} = json
        console.log("note on ",voice,note,velocity)
        store.noteOn(voice,note)
    }
    if(json.procedure == RPC_NOTE_OFF){
        const {voice,note} = json
        console.log("note off ",voice,note)    
        store.noteOff(voice,note)
    }
}

export const RPCOut = json => ws.send(JSON.stringify(json))