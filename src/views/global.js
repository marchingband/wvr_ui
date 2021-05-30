import React, { useState, useRef } from 'react';
import {Text} from '../components/text'
import {observer} from 'mobx-react-lite'
import {uploadRecoveryFirmware} from '../wvr/uploadFirmwareAndGUI'
import {Button} from '../components/button'
export const Global = observer(() => {
    const [firmware,setFirmware] = useState(null)
    const firmwareFileInput = useRef(null)
    return(
        <div style={container}>
            <Text>
                GLOBAL SETTINGS
            </Text>
            <div style={{display:'flex',flexDirection:'row',margin:20}}>
                <Button
                    warn
                    title="update recovery firmware"
                    style={{cursor:firmware?'pointer':'default',width:300}}
                    onClick={()=>{
                        if(!firmware) return
                        if(!window.confirm("update recovery firmware!?")) return
                        uploadRecoveryFirmware({fileHandle:firmware})
                    }}
                    disabled={!firmware}
                />
                <Button
                    style={{width:300}}
                    title={firmware ? firmware.name : "select recovery firmware"}
                    onClick={()=>{firmwareFileInput.current.click()}}
                />
            </div>
            <input 
                ref={firmwareFileInput}
                type="file" 
                onChange={e=>setFirmware(e.target.files[0])}
                style={{display:'none'}}
                accept=".bin"
            />

        </div>
    )
})

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column'
}
