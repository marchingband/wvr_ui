import React, { useRef, useEffect, useState } from 'react';
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {noteToName, noteToOctave} from '../helpers/noteToName'
import {drawWave} from '../helpers/drawWave'
import {Stack} from './stack'
import {Button} from './button'
import {Slider} from './slider'
import {auditionLocal, auditionDisk} from '../audio/audition'
import {NOTE_OFF,ONE_SHOT,LOOP,PING_PONG,RETRIGGER,RESTART,NONE,HALT,IGNORE,
    PRIORITIES,LINEAR,FIXED,ROOT_SQUARE} from '../modules/constants'
import {SelectNum} from '../components/select'

export const WavDetails = observer(() => {
    const filePicker = useRef(null)
    const directoryPicker = useRef(null)
    const canvas = useRef(null)
    const [showSettings, setShowSettings] = useState(true)
    const {name,size,filehandle,mode,retrigger,noteOff,responseCurve,priority,dist,verb,pitch,vol,pan} = store.getCurrentNote()
    const range = store.wavBoardRange.length > 0
    const allowMultiple = store.wavBoardRange.length > 1 && store.wavBoardInterpolationTarget == undefined
    useEffect(()=>{
        // hide FX screen when switching to a note with no file upload selected
        if(!filehandle){
            setShowSettings(true)
        }
    })
    useEffect(()=>{
        // draw the wav when a file is selected
        const ctx = canvas.current.getContext('2d')
        filehandle ? 
            drawWave({
                ctx,
                filehandle,
                width:canvas.current.width,
                height:canvas.current.height
            }) : 
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
    })
    return(
        <div style={container}>
            <input 
                ref={filePicker}
                multiple = { allowMultiple }
                type="file" 
                onChange={e=>{
                    e && store.setCurrentWavFile(e.target.files)
                }}
                style={{display:'none'}}
                />
            <input 
                ref={directoryPicker}
                multiple
                type="file" 
                // onChange={e=>console.log(e.target.files)}
                onChange={e=>e && store.bulkUploadRacks(e)}
                style={{display:'none'}}
                directory="" 
                webkitdirectory=""
            />
            <div style={row}>
                <Stack items={[
                    "voice",
                    "note name",
                    "note number",
                    "file name",
                    "file size"
                    ]}
                />
                <Stack items={[
                    store.currentVoice,
                    range ? "range" : `${noteToName(store.wavBoardSelected)} ${noteToOctave(store.wavBoardSelected)}` || '',
                    range ? "range" : store.wavBoardSelected || '',
                    range ? "range" : name || 'empty',
                    range ? "range" : size.toLocaleString() + ' bytes' || ''
                ]}/>
                {
                    showSettings &&
                        <div style={{...column,marginLeft:'auto'}}>
                            <SelectNum
                                value={mode}
                                onChange={e=>store.setCurrentNoteProp('mode',e)}
                                label="mode"
                            >
                                <option value={ONE_SHOT}>one-shot</option>
                                <option value={LOOP}>loop</option>
                                <option value={PING_PONG}>ping-pong</option>
                            </SelectNum>
                            <SelectNum
                                value={retrigger}
                                label='retrigger mode'
                                onChange={e=>store.setCurrentNoteProp('retrigger',e)}
                            >
                                <option value={RETRIGGER}>retrigger</option>
                                <option value={RESTART}>restart</option>
                                <option value={NONE}>ignore</option>
                                <option value={NOTE_OFF}>note-off</option>
                            </SelectNum>
                            <SelectNum
                                value={noteOff}
                                label='note-off'
                                onChange={e=>store.setCurrentNoteProp('noteOff',e)}
                            >
                                <option value={IGNORE}>ignore</option>
                                <option value={HALT}>halt</option>
                            </SelectNum>
                            <SelectNum
                                value={responseCurve}
                                label='response curve'
                                onChange={e=>store.setCurrentNoteProp('responseCurve',e)}
                            >
                                <option value={LINEAR}>linear</option>
                                <option value={ROOT_SQUARE}>root square</option>
                                <option value={FIXED}>fixed</option>
                            </SelectNum>
                            <SelectNum
                                value={priority}
                                label='priority'
                                onChange={e=>store.setCurrentNoteProp('priority',e)}
                            >
                                {
                                    PRIORITIES.map(x=>
                                        <option value={x} key={x}>
                                            {x}
                                        </option>    
                                    )
                                }
                            </SelectNum>
                        </div>
                }
                {
                    !showSettings &&
                        <div style={{...column,marginLeft:'auto'}}>
                            <Slider 
                                min={0} max={100}
                                onChange={e=>store.setCurrentNoteProp("dist",e)}
                                value={dist}
                                label="dist"
                            />
                            <Slider 
                                min={0} max={100}
                                onChange={e=>store.setCurrentNoteProp("verb",e)}
                                value={verb}
                                label="verb"
                            />
                            <Slider 
                                min={-50} max={50}
                                onChange={e=>store.setCurrentNoteProp("pitch",e)}
                                value={pitch}
                                label="pitch"
                            />
                            <Slider 
                                min={0} max={100}
                                onChange={e=>store.setCurrentNoteProp("vol",e)}
                                value={vol}
                                label="vol"
                            />
                            <Slider 
                                min={-100} max={100}
                                onChange={e=>store.setCurrentNoteProp("pan",e)}
                                value={pan}
                                label="pan"
                            />
                        </div>
                }
                <div style={{...column,marginLeft:'auto'}}>
                    <Button
                        title={allowMultiple ? "select files": "select file"}
                        // onClick={()=>filePicker.current.click()}
                        onClick={({shiftKey,altKey,metaKey})=>{
                            if(shiftKey){
                                if(store.wavBoardRange.length < 2){
                                    window.alert("Please select range of notes to enable bulk rack upload")
                                    return
                                }
                                directoryPicker.current.click()
                            } else {
                                filePicker.current.click()
                            } 
                        }}
                    />
                    <Button
                        title="create rack"
                        onClick={()=>{
                            if(store.getNumRackSlotsOpen() > 0){
                                store.convertCurrentToRack()
                            } else {
                                window.alert("You are all out of rack slots!")
                            }
                        }}
                    />
                    <Button
                        title="audition"
                        onClick={()=>{
                            if(store.getCurrentNote().filehandle){
                                auditionLocal(store.getCurrentNote().filehandle)
                                .catch(e=>console.log(e))
                            } else if(!store.getCurrentNote().empty){
                                auditionDisk()
                            } else {
                                console.log('empty')
                            }
                        }}
                    />
                    <Button
                        warn
                        // style={{border:"1px solid red"}}
                        title="delete"
                        onClick={()=>{
                            if(allowMultiple ? window.confirm(`clear ${store.wavBoardRange.length} selected notes?`) : window.confirm("clear this note?")){
                                if(allowMultiple){
                                    store.clearSelectedNotes()
                                }else{
                                    store.clearCurrentNote()
                                }
                            }
                        }}
                    />
                    {store.getCurrentNote().filehandle &&
                        <Button
                            title={showSettings ? "show effects" :"show settings"}
                            onClick={()=>setShowSettings(!showSettings)}
                        />
                    }
                </div>
            </div>
            <canvas 
                ref={canvas} 
                width={window.innerWidth}
            />
        </div>
)})

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column',
    margin:70,
    marginTop:40,
    marginBottom:40,
}

const column = {
    display:'flex',
    flexDirection:'column',
    alignItems:'flex-start',

}
const row = {
    display:'flex',
    flexDirection:'row'
}