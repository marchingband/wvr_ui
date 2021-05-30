import { store } from '../modules/store.js';
import {toPcm, toPcmFX} from '../helpers/toPcm.js'
import axios from 'axios'
import {toJS} from 'mobx'

export const sync = async() => {
    store.loadingTitle = "syncing to WVR"
    store.setLoading(true)
    await uploadWavs()
    await uploadVoiceConfig()
    await uploadPinConfig()
    store.setLoading(false)
    let reset = confirm("sync complete, refresh page?")
    if(reset) location.reload()
}

const uploadPinConfig = async() => {
    const pinConfig = store.getPinConfig()
    // console.log(pinConfig)
    const json = JSON.stringify(pinConfig)
    await axios.post(
        "/updatePinConfig",
        // "http://192.168.4.1/updatePinConfig",
        json,
        {
            // onUploadProgress: p=>store.onProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{'Content-Type': 'text/plain'}
        }
    )
    .catch(e=>console.log(e))
}

const uploadVoiceConfig = async() => {
    const voices = store.getVoices()
    const json = JSON.stringify(voices)
    await axios.post(
        "/updateVoiceConfig",
        // "http://192.168.4.1/updateVoiceConfig",
        json,
        {
            // onUploadProgress: p=>store.onProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{'Content-Type': 'text/plain'}
        }
    )
    .catch(e=>console.log(e))

}

const uploadWavs = async () => {
    const uploads = []
    const voices = store.getVoices()
    voices.forEach((v,vi)=>{
        v.forEach((n,ni)=>{
            if(n.isRack == -1){
                // not a rack
                if(n.filehandle){
                    uploads.push({
                        fileHandle: n.filehandle,
                        voice: vi,
                        note: ni,
                        name: n.name,
                        isRack: -1,
                        dist: n.dist,
                        verb: n.verb,
                        pitch:n.pitch
                    })
                }
            } else if(n.rack.layers) {
                // a rack
                n.rack.layers.forEach((l,li)=>{
                    if(l.filehandle){
                        uploads.push({
                            fileHandle: l.filehandle,
                            voice: vi,
                            note: ni,
                            name: l.name,
                            isRack: li,
                            rackData: n,
                            dist: n.dist,
                            verb: n.verb,
                            pitch:n.pitch    
                        })
                    }
                })
            }
        })
    })
    for(let {fileHandle,voice,note,name,isRack,rackData,pitch,verb,dist} of uploads)
    {
        // var pcm = await toPcm(fileHandle)
        var pcm = await toPcmFX({fileHandle,pitch,dist,verb})
        .catch(e=>console.log(e))
        var size = pcm.size
        if(isRack == -1){
            // not a rack
            await axios.post(
                "/addwav",
                // "http://192.168.4.1/addwav",
                pcm,
                {
                    onUploadProgress: p=>store.onProgress((p.loaded / p.total * 100).toFixed(0)),
                    headers:{
                        'Content-Type': 'text/plain',
                        'size':size,
                        'name':name,
                        'voice':voice,
                        'note':note,
                    }
                }
            )
            .catch(e=>console.log(e))
        } else {
            // a rack
            const json = JSON.stringify({
                name:rackData.rack.name || "",
                breakPoints:rackData.rack.break_points,
            })
            const res = await axios.post(
                "/addrack",
                // "http://192.168.4.1/addrack",
                pcm,
                {
                    // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
                    headers:{
                        'Content-Type': 'text/html',
                        'name' : name,
                        'voice' : voice,
                        'note' : note,
                        'layer' : isRack,
                        'rack-json': json,
                    }
                }
            )
            .catch(e=>console.log(e))        
        }
    }
    // console.log(uploads)
}