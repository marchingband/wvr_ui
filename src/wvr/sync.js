import { store } from '../modules/store.js';
import {toPcmFX} from '../helpers/toPcm.js'
import axios from 'axios'
import { loadVoice } from '../helpers/init.js';
import { default_fx } from '../helpers/makeDefaultStores.js';

export const sync = async() => {
    store.resetSelected()
    store.loadProgress = 0
    store.loadingTitle = "Syncing to WVR"
    store.setLoading(true)
    await uploadWavs()
    await uploadPinConfig()
    await uploadVoiceConfig()
    await uploadMetadata()
    store.setLoading(false)
    resetFileHandles()
    store.voicesNeedUpdate.replace(Array(16).fill(false))
    store.wavBoardInterpolationTarget = undefined
    store.wavBoardRange.replace([])
    store.wavBoardSelected = 40
    store.wavBoardIndex = 40
    store.rackBoardIndex= 0,
    store.rackBoardSelected= 0,
    store.rackBoardRange.replace([]),

    window.alert("sync completed")
    store.logData()
    // let reset = confirm("sync complete, refresh page?")
    // if(reset) location.reload()
}

export const syncRecoveryMode = async() => {
    store.loadProgress = 0
    store.loadingTitle = "Syncing to WVR"
    store.setLoading(true)
    await uploadPinConfig()
    await uploadVoiceConfig()
    await uploadMetadata()
    store.setLoading(false)
    window.alert("sync completed")
    store.logData()
}

const uploadPinConfig = async() => {
    store.loadingTitle = "syncing pin config to WVR"
    store.loadProgress = 0
    const pinConfig = store.getPinConfig()
    const json = JSON.stringify(pinConfig)
    await axios.post(
        "/updatePinConfig",
        json,
        {
            onUploadProgress: p=>store.onProgress(p.loaded / p.total),
            headers:{'Content-Type': 'text/plain'}
        }
    )
    .catch(e=>console.log(e))
}

const uploadMetadata = async() => {
    store.loadingTitle = "syncing metadata to WVR"
    store.loadProgress = 0
    const meta = store.getMetadata()
    const json = JSON.stringify(meta)
    await axios.post(
        "/updateMetadata",
        json,
        {
            onUploadProgress: p=>{
                store.onProgress(p.loaded / p.total )
                if(p.loaded == p.total){
                    store.loadingTitle = "data sent, waiting for WVR to save"
                    store.loadProgress = 0
                }
            },
            headers:{'Content-Type': 'text/plain'}
        }
    )
    .catch(e=>console.log(e))
    store.loadingTitle = "complete"
}

const uploadSingleVoiceConfig = async(numVoice) => {
    let retry = false
    const voices = store.getVoices()
    const json = JSON.stringify(voices[numVoice])
    await axios.post(
        "/updateSingleVoiceConfig",
        json,
        {
            onUploadProgress: p=>{
                store.onProgress(p.loaded / p.total)
            },
            headers:{
                'Content-Type': 'text/plain',
                'numVoice' : numVoice
            }
        }
    )
    .catch(e=>{
        console.log(e)
        console.log("retry")
        retry=true
    })
    // retry && await uploadSingleVoiceConfig(numVoice)
}

const uploadVoiceConfig = async() => {
    let voicesNeedUpdate = store.getVoicesNeedUpdate()

    // upload each voice config
    for(let i=0; i<16; i++){
        if(!voicesNeedUpdate[i]){
            continue
        }
        store.loadingTitle = `syncing voice ${i + 1} config : send`
        store.loadProgress = 0
        await uploadSingleVoiceConfig(i)
    }

    // now download each voice config
    for(let i=0; i<16; i++){
        if(!voicesNeedUpdate[i]){
            continue
        }
        store.loadingTitle = `syncing voice ${i + 1} config : load`
        store.loadProgress = 0
        // donwload the new voice JSON
        let voice = await loadVoice(i)
        // fold in reset fx data
        let newVoices = store.getVoices()
        newVoices[i] = newVoices[i].map((_,j)=>({
            ...default_fx,
            ...voice[j]
        }))
        store.voices.replace(newVoices)
    }
}

const uploadWavs = async () => {
    const uploads = []
    const voices = store.getVoices()
    store.loadProgress = 0
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
                        pitch:n.pitch,
                        vol:n.vol,
                        pan:n.pan    
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
                            pitch:n.pitch,
                            vol:n.vol,
                            pan:n.pan    
                        })
                    }
                })
            }
        })
    })
    for(let [i, {fileHandle,voice,note,name,isRack,rackData,pitch,verb,dist,pan,vol}] of uploads.entries())
    {
        store.loadProgress = 0
        store.loadingTitle = `rendering to audio ${i+1} of ${uploads.length}`
        // var pcm2 = await toPcm(fileHandle)
        var pcm = await toPcmFX({fileHandle,pitch,dist,verb,pan,vol})
        .catch(e=>console.log(e))
        store.loadingTitle = `syncing to WVR ${i+1} of ${uploads.length}`
        var size = pcm.size
        if(isRack == -1){
            // not a rack
            await axios.post(
                "/addwav",
                pcm,
                {
                    onUploadProgress: p=>store.onProgress(p.loaded / p.total),
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
            await axios.post(
                "/addrack",
                // "http://192.168.4.1/addrack",
                pcm,
                {
                    onUploadProgress: p=> store.onProgress( p.loaded / p.total ),
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
}

const resetFileHandles = () => {
    let voices = store.getVoices()
    voices.forEach((voice,i)=>{
        voice.forEach((note,j)=>{
            if(note.filehandle){
                delete voices[i][j].filehandle
            }
            if(note.rack && note.rack.layers){
                note.rack.layers.forEach((layer,k)=>{
                    if(layer.filehandle){
                        delete voices[i][j].rack.layers[k].filehandle
                    }
                })
            }
        })
    })
    store.voices.replace(voices)
}