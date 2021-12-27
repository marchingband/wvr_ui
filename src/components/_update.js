import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'

export const Update = ({state,fetchFS}) => {
    return(
        <div>
            {
                state.fs.firmwares.map((f,i)=><Firmware id={i} i={i} f={f} state={state} fetchFs={fetchFS}/>)
            }
            {/* <form method = "POST" action = "http://192.168.4.1/multi" enctype="multipart/form-data">
                    <input type="file" name="data" data-multiple-caption="{count} files selected" multiple/>
                    <input type="submit" name="upload" value="Upload" title = "Upload Files"/>
            </form>	 */}
            <input 
                type="file" 
                onChange={e=>uploadRack(e.target.files[0])}
            />
        </div>
    )
}

const Firmware = ({i,f,state,fetchFS}) => {
    const [firmware,setFirmware] = useState()
    const [GUI,setGUI] = useState()
    const firmwareFileInput = useRef(null)
    const GUIFileInput = useRef(null)

    return(
        <div style={{display:'flex',flexDirection:'row'}}>
            <input 
                ref={firmwareFileInput}
                type="file" 
                onChange={e=>setFirmware(e.target.files[0])}
                style={{display:'none'}}
            />
            <input 
                ref={GUIFileInput}
                type="file" 
                onChange={e=>setGUI(e.target.files[0])}
                style={{display:'none'}}
            />
            <div
                style={{bordeRadius:15,width:30,height:30,border:"2px solid red",cursor:'pointer',...center}}
                onClick={()=>bootFirmware(i)}
            >
                B
            </div>
            <div
                style={{width:200,height:30,border:"1px solid blue",cursor:'pointer',...center}}
                onClick={()=>firmwareFileInput.current.click()}
            >
                {firmware?firmware.name:f.name?f.name:"empty"}
            </div>
            <div
                style={{paddingInline:10, width:200,height:30,border:"1px solid blue",cursor:'pointer',...center}}
                onClick={()=>GUIFileInput.current.click()}
            >
                {GUI?GUI.name:state.fs.websites[i].name?state.fs.websites[i].name:"empty"}
            </div>
            <div
                style={{paddingInline:10,height:30,border:"1px solid blue",cursor:'pointer',...center}}
                onClick={async ()=>{
                    await uploadFirmware(firmware,i)
                    fetchFS()
                }}
            >
                upload firmware
            </div>
            <div
                style={{paddingInline:10,height:30,border:"1px solid blue",cursor:'pointer',...center}}
                onClick={async()=>{
                    await uploadGUI(GUI,i)
                    fetchFS()
                }}
            >
                upload GUI
            </div>
        </div>
    )
}

const upload = async (firmware, GUI) => {
    if(!firmware || !GUI){
        console.log("files not found")
        return
    }
    console.log("starting upload")
    console.log("firmware:");
    console.log(firmware);
    console.log("GUI:");
    console.log(GUI);
    let res = await axios.post(
        "http://192.168.4.1/addfirmware",
        firmware,
        {
            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{
                'Content-Type': 'text/javascript',
                'firmware-size' : firmware.size,
                'firmware-name' : firmware.name.substring(0,23),
                // 'gui-size' : GUI.size,
                // 'gui-name' : GUI.name.substring(0,23),
                'slot-index' : 0
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    console.log('firmware fetch res:')
    console.log(res)
    res = await axios.post(
        "http://192.168.4.1/addgui",
        GUI,
        {
            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{
                'Content-Type': 'text/plain',
                'gui-size' : GUI.size,
                'gui-name' : GUI.name.substring(0,23),
                'slot-index' : 0
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    console.log("gui fetch res")
    console.log(res)
}

const uploadFirmware = async (firmware,index) => {
    if(!firmware){
        console.log("files not found")
        return
    }
    console.log("starting upload")
    console.log("firmware:");
    console.log(firmware);
    let res = await axios.post(
        "http://192.168.4.1/addfirmware",
        firmware,
        {
            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{
                'Content-Type': 'text/html',
                'firmware-size' : firmware.size,
                'firmware-name' : firmware.name.substring(0,23),
                'slot-index' : index
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    console.log('firmware fetch res:')
    console.log(res)
}

const uploadGUI = async (gui,index) => {
    if(!gui){
        console.log("files not found")
        return
    }
    console.log("starting upload")
    console.log("GUI:");
    console.log(gui);
    const res = await axios.post(
        "http://192.168.4.1/addgui",
        gui,
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
    console.log("gui fetch res")
    console.log(res)
}

const bootFirmware = i => {
    fetch(
        "http://192.168.4.1/bootFromEmmc",
        {
            method: "GET",
            headers: {
                "index":i
            }
        }
    )
}

const uploadRack = async file => {
    console.log("starting upload rack")
    const json = JSON.stringify({
        name:"test rack title",
        breakPoints:[0,50,100,127],
    })
    const res = await axios.post(
        "http://192.168.4.1/addrack",
        file,
        {
            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{
                'Content-Type': 'text/html',
                'name' : "test name",
                'voice' : 12,
                'note' : 12,
                'layer' : 2,
                'rack-json': json,
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    console.log("gui fetch res")
    console.log(res)
}

const center = {display:'flex',alignItems:'center',justifyContent:'center',marginLeft:10,marginRight:10,}