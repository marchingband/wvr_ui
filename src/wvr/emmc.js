import axios from 'axios'
import {initStore} from '../wvr/init'
import { store } from '../modules/store'

export const deleteFirmware = async num => {
    console.log("deleting from EMMC slot " + num)
    let res = await fetch(
        "/deleteFirmware",
        {
            method: "GET",
            headers: {
                "index":num
            }
        }
    )
    .catch(e=>console.log(e))
    store.deleteFirmware(num)
}

export const bootFromEMMC = async num => {
    console.log("booting from EMMC slot " + num)
    let res = await fetch(
        "/bootFromEmmc",
        {
            method: "GET",
            headers: {
                "index":num
            }
        }
    )
    .catch(e=>console.log(e))
}

export const restoreEMMC = async handle => {
    store.loadProgress = 0
    store.loadingTitle = `Restoring eMMC from image ${handle.name}`
    store.setLoading(true)
    let success = true
    await axios.post(
        "/restoreEMMC",
        handle,
        {
            onUploadProgress: p=>store.onProgress(p.loaded / p.total),
            headers:{
                'Content-Type': 'application/octet-stream',
                'size':handle.size,
            },
        }
    )
    .catch(e=>{
        console.log(e)
        success = false
    })
    success && alert("eMMC restored successfully, please reset WVR and refresh browser")
    store.setLoading(false)
}

export const resetEMMC = async() =>{
    const response = await fetch('http://192.168.5.18/emmcReset', {
        method: 'get',
    });
    alert("eMMC on WVR has been reset, please refresh the browser")
}
