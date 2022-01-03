import React, { useState, useRef, useEffect } from 'react';
import {Text} from '../components/text'
import { store } from '../modules/store';
import {Button} from './button'
import {uploadFirmware} from '../wvr/uploadFirmware'
import {bootFromEMMC, deleteFirmware} from '../wvr/emmc'


export const Firmware = ({num,f}) => {
    const isCurrent = num == store.metadata.currentFirmwareIndex
    const [firmware,setFirmware] = useState(null)
    const [GUI,setGUI] = useState(null)
    const [name,setName] = useState(null)
    const firmwareFileInput = useRef(null)
    const GUIFileInput = useRef(null)
    return(
    <div style={container}>
        <div style={row}>
            <Text primary med style={{marginRight:20}}>
                {"slot " + num}
            </Text>
            <Button
                warn
                title={name?name:firmware?firmware.name:f.name?f.name:"empty"}
                style={{...titleProps,cursor:firmware?'pointer':'default', width:200}}
                onClick={()=>{
                    if(firmware){
                        const newName = window.prompt("rename binary?")
                        newName && setName(newName)
                    }
                }}
            />
            <Button
                title="boot"
                onClick={()=>{
                    bootFromEMMC(num)
                    store.loadProgress = 0
                    store.loadingTitle = `booting from slot ${num}`
                    store.loading = true
                    let int = setInterval(()=>{
                        if(store.loadProgress == 100)
                        {
                            clearInterval(int)
                        } else {
                            store.onProgress(store.loadProgress/100 + 0.1)
                        }
                    },2000)
                    setTimeout(()=>{
                        store.loading = false
                        if(window.confirm("boot complete, refresh page?"))
                        {
                            location.reload()
                        }
                    },20000)
                }}
                disabled={f.free}
            />
            <Button
                title={"upload"}
                onClick={()=>uploadFirmware({
                    index:num,
                    firmwareFileHandle:firmware,
                    GUIFileHandle:GUI,
                    name:name
                })}
                disabled={!firmware && !GUI}
            />
            <Button
                title={"select binary"}
                onClick={()=>{firmwareFileInput.current.click()}}
            />
            {f.name &&
                <Button
                    warn
                    title={"delete"}
                    onClick={()=>window.confirm("Delete firmware in slot " + num + "?") && deleteFirmware(num)}
                    style={{width:50}}
                />
            }
            {isCurrent &&
                <Text style={{marginLeft:20}}>
                    {"<- current"}
                </Text>
            }
            <input 
                ref={firmwareFileInput}
                type="file" 
                onChange={e=>setFirmware(e.target.files[0])}
                style={{display:'none'}}
                accept=".bin"
                />
            <input 
                ref={GUIFileInput}
                type="file" 
                onChange={e=>setGUI(e.target.files[0])}
                style={{display:'none'}}
                accept=".html"
            />
        </div>
    </div>
    )
}

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column',
    // alignItems:'center',
    margin:20,
    marginBottom:0 
}

const row = {
    flex:1,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
}

const titleProps = {
    border:'none'
}