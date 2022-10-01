import React, { useState, useRef, useEffect } from 'react';
import {Text} from '../components/text'
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'

export const VoiceMenu = () =>
    <div style={container}>
        {
            Array(16).fill().map((_,i)=>
                <VoiceButton key={i} i={i}/>
            )
        }
    </div>


const VoiceButton = observer(({i}) => {
    const downloadJSONRef = useRef()
    const uploadJSONRef = useRef()
    return(
        <div 
            style={voiceButton(i)}
            onClick={({shiftKey,altKey,metaKey})=>{
                if(shiftKey && altKey){
                    if(!window.confirm("load voice config from disk?")) return
                    uploadJSONRef.current.click()
                }else if(shiftKey){
                    if(!window.confirm("save voice config to disk?")) return
                    const data = store.getVoiceData(i)
                    const json = JSON.stringify(data, null, 2)
                    const blob = new Blob([json], {type:'application/json'})
                    const href = URL.createObjectURL(blob)
                    downloadJSONRef.current.href = href
                    downloadJSONRef.current.download = "wvr.json"
                    downloadJSONRef.current.click()
                } else {
                    store.currentVoice = i
                    store.resetSelected()
                }
            }}
        >
            <a  
                download
                ref={downloadJSONRef}
            />
            <input 
                ref={uploadJSONRef}
                type="file" 
                onChange={e=>{
                    if(e.target.files.length < 1) return
                    const file = e.target.files[0]
                    const fileReader = new FileReader();
                    fileReader.readAsText(file, "UTF-8");
                    fileReader.onload = e => {
                        console.log("reading file")
                        const data = JSON.parse(e.target.result)
                        store.setVoiceData(i, data)
                    };
                }}
                style={{display:'none'}}
                accept=".json"
            />
            <Text primary small>
                {i+1}
            </Text>
        </div>
    )
})
const voiceButton = i => ({
    flex:1,
    display:'flex',
    height:30,
    border:`1px solid ${i==store.currentVoice?'gold':store.theme.primary}`,
    margin:5,
    borderRadius:2,
    alignItems:'center',
    justifyContent:'center',
    marginLeft:  i== 0  ? 76 : 2,
    marginRight: i== 15 ? 76 : 2,
    boxShadow:`0px 0px ${i==store.currentVoice?10:2}px gold`,
    cursor:'pointer',
    userSelect:'none',
})

const container = {
    width:'100%',
    display:'flex',
    flexDirection:'row',
}
