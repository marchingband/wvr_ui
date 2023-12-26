import React, {useState} from 'react';
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {noteToName} from '../helpers/noteToName'
import {Stack} from './stack'
import {Button} from './button'
import {NOTE_OFF,ONE_SHOT,LOOP,PAUSE,RETRIGGER,RESTART,NONE,HALT,IGNORE,PRIORITIES,
    NUM_LAYERS,LINEAR,FIXED,SQUARE_ROOT,INV_SQUARE_ROOT} from '../modules/constants'
import {SelectNum} from '../components/select'
import {Slider} from './slider'

export const RackDetails = observer(() => {
    const {mode,retrigger,noteOff,responseCurve,priority,muteGroup,rack,dist,verb,pitch,vol,pan} = store.getCurrentNote()
    const {name,num_layers} = rack
    const [showSettings, setShowSettings] = useState(true)
    const allowMultiple = store.wavBoardRange.length > 1 && store.wavBoardInterpolationTarget == undefined
    return(
        <div style={container}>
            <div style={row}>
                <Stack items={["voice","note name","note number","rack name"]}/>
                <Stack items={[
                    store.currentVoice,
                    noteToName(store.wavBoardSelected) || '',
                    store.wavBoardSelected || '',
                    name || 'untitled'
                ]}/>
                {
                    showSettings &&
                        <div style={{...column,marginLeft:'auto'}}>
                            <SelectNum
                                label='mode'
                                value={mode}
                                onChange={e=>store.setCurrentNoteProp('mode',e)}
                            >
                                <option value={ONE_SHOT}>one-shot</option>
                                <option value={LOOP}>loop</option>
                            </SelectNum>
                            <SelectNum
                                label='retrigger mode'
                                value={retrigger}
                                onChange={e=>store.setCurrentNoteProp('retrigger',e)}
                            >
                                <option value={RETRIGGER}>retrigger</option>
                                <option value={RESTART}>restart</option>
                                <option value={NONE}>ignore</option>
                                <option value={NOTE_OFF}>note-off</option>
                            </SelectNum>
                            <SelectNum
                                label='note-off'
                                value={noteOff}
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
                                <option value={SQUARE_ROOT}>square root</option>
                                <option value={INV_SQUARE_ROOT}>inv square root</option>
                                <option value={FIXED}>fixed</option>
                            </SelectNum>
                            <SelectNum
                                label='priority'
                                value={priority}
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
                            <SelectNum
                                value={muteGroup}
                                label='exclusive group'
                                onChange={e=>store.setCurrentNoteProp('muteGroup',e)}
                            >
                                {
                                    Array(128).fill().map((_,x)=>
                                        <option value={x} key={x}>
                                            {x || "none"}
                                        </option>    
                                    )
                                }
                            </SelectNum>
                            <SelectNum
                                label='number of layers'
                                value={num_layers}
                                onChange={e=>store.setCurrentRackNumLayers(e)}
                            >
                                {
                                    NUM_LAYERS.map(x=>
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
                        onClick={()=>store.convertCurrentToNonRack()}
                        title="make non-rack"
                    />
                    <Button
                        onClick={()=>{
                            const name = window.prompt("name")
                            name && store.setCurrentRackName(name)
                        }}
                        title="set rack name"
                    />
                    {/* only show if filehandle */}
                    <Button
                        title={showSettings ? "show effects" :"show settings"}
                        onClick={()=>setShowSettings(!showSettings)}
                    />
                    <Button
                        warn
                        title="delete"
                        onClick={()=>{
                            if(window.confirm("clear this note?")){
                                store.clearCurrentNote()
                            }
                        }}
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
                </div>
            </div>
        </div>
)})

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column',
    marginLeft:70,
    marginRight:70,
    marginTop:30,
    marginBottom:30,
}

const column = {
    display:'flex',
    flexDirection:'column',
    alignItems:'flex-start',

}
const row = {
    display:'flex',
    flexDirection:'row',
}
const Select_style = {
    width:120,
    height:25,
    margin:2,
    marginLeft:'auto',
    marginRight:30,
    color:store.theme.primary,
    backgroundColor:store.theme.backgroundColor
}

const setting_style = {
    width:300,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    marginLeft:20,
    color:store.theme.primary
}
