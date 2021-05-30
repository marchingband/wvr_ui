import React, { useState, useRef, useEffect } from 'react';
import {Text} from '../components/text'
import { store } from '../modules/store';
import {Button} from './button'
import {uploadFirmwareAndGUI} from '../wvr/uploadFirmwareAndGUI'
import {bootFromEMMC} from '../wvr/bootFromEMMC'


export const Firmware = ({num,f}) => {
    const selected = num == store.currentFirmwareIndex
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
                style={{...titleProps,cursor:firmware?'pointer':'default'}}
                onClick={()=>{
                    if(firmware){
                        const newName = window.prompt("rename binary?")
                        newName && setName(newName)
                    }
                }}
            />
            <Button
                title="boot"
                onClick={()=>bootFromEMMC(num)}
                disabled={f.free}
            />
            <Button
                title={"upload"}
                onClick={()=>uploadFirmwareAndGUI({
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
            <Button
                title={GUI?GUI.name:store.websites.slice()[num].name?store.websites.slice()[num].name:"select gui"}
                onClick={()=>{GUIFileInput.current.click()}}
            />

            {/* INVISIBLE INPUTS */}
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