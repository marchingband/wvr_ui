import React, { useRef, useEffect, useState } from 'react';
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {noteToName, noteToOctave} from '../helpers/noteToName'
import {clamp} from '../helpers/clamp'
import {drawWave} from '../audio/drawWave'
import {Stack} from './stack'
import {Button} from './button'
import {Slider} from './slider'
import {auditionLocal, auditionDisk} from '../audio/audition'
import {NOTE_OFF,ONE_SHOT,LOOP,PING_PONG,ASR_LOOP,RETRIGGER,RESTART,NONE,HALT,IGNORE,
    PRIORITIES,LINEAR,FIXED,SQUARE_ROOT,INV_SQUARE_ROOT} from '../modules/constants'
import {SelectNum} from '../components/select'
import {NumberInput} from '../components/numberInput'

export const WavDetails = observer(() => {
    const filePicker = useRef(null)
    const directoryPicker = useRef(null)
    const canvas = useRef(null)
    const [showSettings, setShowSettings] = useState(true)
    const {name,size,filehandle,mode,retrigger,noteOff,responseCurve,priority,muteGroup,dist,verb,pitch,vol,pan,loopStart,loopEnd,empty,samples} = store.getCurrentNote()
    const range = store.wavBoardRange.length > 0
    const allowMultiple = store.wavBoardRange.length > 1 && store.wavBoardInterpolationTarget == undefined
    const maxSampleIndex = filehandle ? samples : size / 4 // if this is a fresh file, we use the wav analyzer, if its been synced already, we use the raw file size, as the headers have been stripped already
    useEffect(()=>{
        // hide FX screen when switching to a note with no file upload selected
        if(!filehandle){
            setShowSettings(true)
        }
    })
    useEffect(()=>{
        // draw the wav when a file is selected
        const ctx = canvas.current.getContext('2d')
        // console.log(mode)
        // console.log(mode == ASR_LOOP)
        filehandle ? 
            drawWave({
                ctx,
                filehandle,
                loopStart,
                loopEnd,
                showLoop: mode == ASR_LOOP,
                width: canvas.current.width,
                height: canvas.current.height
            }) : 
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
    })
    return(
        <div style={container}>
            <input 
                ref={filePicker}
                multiple = { true }
                type="file" 
                onChange={async e=>{
                    e.persist()
                    if(!e.target.files.length) return
                    const ret = await store.setCurrentWavFile(e.target.files)
                    if(ret == false){ // file dialog dismissed
                        e.target.value = null
                    }
                }}
                style={{display:'none'}}
            />
            <input 
                ref={directoryPicker}
                multiple
                type="file" 
                // onChange={e=>console.log(e.target.files)}
                onChange={async e=>{
                    e.persist()
                    if(!e.target.files.length) return
                    const ret = await store.bulkUploadRacks(e)
                    if(ret == false){ // file dialog dismissed
                        e.target.value = null
                    }
                }}
                style={{display:'none'}}
                directory="" 
                webkitdirectory=""
            />
            <div style={row}>
                <Stack 
                    items={[
                        "voice",
                        "note name",
                        "note number",
                        "file name",
                        "file size"
                    ]}
                />
                <Stack 
                    items={[
                        store.currentVoice,
                        range ? "range" : `${noteToName(store.wavBoardSelected)} ${noteToOctave(store.wavBoardSelected)}` || '',
                        range ? "range" : store.wavBoardSelected || '',
                        range ? "range" : name || 'empty',
                        range ? "range" : size.toLocaleString() + ' bytes' || ''
                    ]}
                />
                {
                    showSettings &&
                        <div style={{...column,marginLeft:'auto'}}>
                            <SelectNum
                                value={mode}
                                onChange={e=>store.setCurrentNoteProp('mode',e)}
                                label="mode"
                                style={{width:270}}
                            >
                                <option value={ONE_SHOT}>one-shot</option>
                                <option value={LOOP}>loop</option>
                                {/* <option value={PING_PONG}>ping-pong</option> */}
                                <option value={ASR_LOOP}>ASR loop</option>
                            </SelectNum>
                            <SelectNum
                                value={retrigger}
                                label='retrigger mode'
                                onChange={e=>store.setCurrentNoteProp('retrigger',e)}
                                style={{width:270}}
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
                                style={{width:270}}
                            >
                                <option value={IGNORE}>{ mode==ASR_LOOP ? "release" : "ignore"}</option>
                                <option value={HALT}>halt</option>
                            </SelectNum>
                            <SelectNum
                                value={responseCurve}
                                label='response curve'
                                onChange={e=>store.setCurrentNoteProp('responseCurve',e)}
                                style={{width:270}}
                            >
                                <option value={LINEAR}>linear</option>
                                <option value={SQUARE_ROOT}>square root</option>
                                <option value={INV_SQUARE_ROOT}>inv square root</option>
                                <option value={FIXED}>fixed</option>
                            </SelectNum>
                            <SelectNum
                                value={priority}
                                label='priority'
                                onChange={e=>store.setCurrentNoteProp('priority',e)}
                                style={{width:270}}
                            >
                                {
                                    PRIORITIES.map(x=>
                                        <option value={x} key={x}>
                                            {x}
                                        </option>    
                                    )
                                }
                            </SelectNum>
                            <SelectNum
                                value={muteGroup}
                                label='exclusive group'
                                onChange={e=>store.setCurrentNoteProp('muteGroup',e)}
                                style={{width:270}}
                            >
                                {
                                    Array(128).fill().map((_,x)=>
                                        <option value={x} key={x}>
                                            {x || "none"}
                                        </option>    
                                    )
                                }
                            </SelectNum>
                            {(mode == ASR_LOOP) && (empty == false) && 
                            // only show ASR-looping settings for files on WVR
                                <div>
                                    <NumberInput
                                        style={{width:270}}
                                        label = "loop start"
                                        val = {loopStart || 1}
                                        onChange = {val=>store.setCurrentNoteProp("loopStart",val)}
                                        onSubmit = {()=>{
                                            // ASR LOOP breaks if there is no A or no R, so we must ensure there is at least 1 sample for each section
                                            let val = clamp(loopStart, 1, Math.max(loopEnd - 2, 1))
                                            store.setCurrentNoteProp("loopStart",val)
                                        }}
                                        />
                                    <NumberInput
                                        style={{width:270}}
                                        label = "loop end"
                                        val = {loopEnd || 2}
                                        onChange = {val=>store.setCurrentNoteProp("loopEnd",clamp(val, 1, maxSampleIndex - 1))}
                                        onSubmit = {()=>{
                                            // ASR LOOP breaks if there is no A or no R, so we must ensure there is at least 1 sample for each section
                                            let val = clamp(loopEnd, Math.min(loopStart + 1, maxSampleIndex - 1), maxSampleIndex - 1)
                                            store.setCurrentNoteProp("loopEnd",val)
                                        }}
                                    />
                                </div>
                            }
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
                            if(shiftKey && altKey){
                                // TODO interpolate racks

                            } else if(shiftKey){
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
    marginLeft:70,
    marginRight:70,
    marginTop:30,
    // marginBottom:30,
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