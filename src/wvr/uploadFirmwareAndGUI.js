import axios from 'axios'
import {initStore} from '../helpers/init'
import {store} from '../modules/store'

export const uploadFirmwareAndGUI = async ({index,firmwareFileHandle,GUIFileHandle,name}) => {
    console.log(`found ${
        (firmwareFileHandle && GUIFileHandle) ? "firmware and GUI files" :
        firmwareFileHandle ? "firmware file" :
        GUIFileHandle ? "GUI file" :
        "no firmware and no GUI files"
    }`)
    if(firmwareFileHandle){
        console.log("uploading firmware")
        if(name){
            var formdata = new FormData();
            // this will override the file name
            formdata.append('file', firmwareFileHandle, name);
            let file = formdata.get('file')
            await uploadFirmware({index,firmwareFileHandle:file})
        } else {
            await uploadFirmware({index,firmwareFileHandle})
        }
        console.log("done uploading firmware slot " + index)
        // formdata.entries(x=>console.log(x))
        // for (var [key, value] of formdata.entries()) {
        //     console.log(key,value);
        //  }
    }
    if(GUIFileHandle){
        console.log("uploading GUI")
        await uploadGUI({index,GUIFileHandle})
        console.log("done uploading GUI slot " + index)
    }
    // firmwareFileHandle = undefined
    // await initStore()
}

const uploadFirmware = async ({index,firmwareFileHandle}) => {
    store.loading = true
    store.loadProgress = 0
    store.loadingTitle = "uploading firmware"
    let res = await axios.post(
        "/addfirmware",
        // "http://192.168.4.1/addfirmware",
        firmwareFileHandle,
        {
            onUploadProgress: p=>store.onProgress(p.loaded / p.total),
            headers:{
                'Content-Type': 'text/html',
                'firmware-size' : firmwareFileHandle.size,
                'firmware-name' : firmwareFileHandle.name.substring(0,23),
                'slot-index' : index
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    console.log(res)
    if(res.status == 204){
        let firmwares = store.firmwares.slice()
        firmwares[index].free = 0
        firmwares[index].corrupt = 0
        store.firmwares.replace(firmwares)
    }
    store.loading = false
}

export const uploadRecoveryFirmware = async ({fileHandle}) => {
    store.loading = true
    store.loadProgress = 0
    store.loadingTitle = "uploading recovery firmware"
    let res = await axios.post(
        "/updaterecoveryfirmware",
        // "http://192.168.4.1/updaterecoveryfirmware",
        fileHandle,
        {
            onUploadProgress: p=>store.onProgress(p.loaded / p.total),
            headers:{
                'Content-Type': 'text/html',
                'firmware-size' : fileHandle.size
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    store.loading=false
}

const uploadGUI = async ({index,GUIFileHandle}) => {
    const res = await axios.post(
        "/addgui",
        // "http://192.168.4.1/addgui",
        GUIFileHandle,
        {
            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{
                'Content-Type': 'text/html',
                'slot-index' : index,
                'gui-size' : gui.size,
                'gui-name' : gui.name.substring(0,23)
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
}

export const forceUploadFirmware = async({fileHandle}) => {
    store.loading = true
    store.loadProgress = 0
    store.loadingTitle = "uploading firmware"
    let res = await axios.post(
        "/update",
        // "http://192.168.4.1/updaterecoveryfirmware",
        fileHandle,
        {
            onUploadProgress: p=>store.onProgress(p.loaded / p.total),
            headers:{
                'Content-Type': 'text/html',
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    store.loading=false
    window.alert("Upload complete, please refresh browser")
}