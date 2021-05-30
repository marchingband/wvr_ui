import React, { useRef, useEffect } from 'react';
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {drawWave} from '../helpers/drawWave'
import {Button} from './button'
import {Stack} from './stack'
import { clamp } from '../helpers/clamp';
import {auditionDisk, auditionLocal} from '../audio/audition'
import {SelectNum} from '../components/select'

export const RackItemDetails = observer(() => {
    const filePicker = useRef(null)
    const canvas = useRef(null)
    const rackFileData = store.getRackLayer(store.rackBoardSelected)
    const self = store.getRackBreakPoint(store.rackBoardSelected + 1)
    const next = store.getRackBreakPoint(store.rackBoardSelected + 2) || 128
    const prev = store.getRackBreakPoint(store.rackBoardSelected)
    const max = clamp( (next -1) || 127, 0, 127 )
    const min = clamp( (prev +1) || 0  , 0, 127 )

    useEffect(()=>{
        const filehandle = rackFileData.filehandle
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
                type="file" 
                onChange={e=>store.setCurrentRackFile(e.target.files[0])}
                style={{display:'none'}}
            />
            <div style={row}>
                <Stack items={[
                        "layer",
                        "file name",
                        "file size"
                ]}/>
                <Stack items={[
                        store.rackBoardSelected,
                        rackFileData.name || 'empty',
                        rackFileData.size.toLocaleString() + ' bytes' || ''
                ]}/>
                <div style={{...column,marginLeft:'auto'}}>
                    <SelectNum
                        label='break point'
                        value={self}
                        onChange={e=>store.setBreakPoint(store.rackBoardSelected,e)}
                    >
                        {Array(max-min+1).fill().map((_,i)=>
                            <option key={i} value={i+min}>{i+min}</option>
                        )}                    
                    </SelectNum>
                </div>
                <div style={{...column,marginLeft:'auto'}}>
                    <Button
                        title="select file"
                        onClick={()=>filePicker.current.click()}
                    />
                    <Button
                        title="audition"
                        onClick={()=>{
                            if(store.getCurrentRackLayer().filehandle){
                                auditionLocal(store.getCurrentRackLayer().filehandle)
                            } else if(store.getCurrentNote().isRack > -1){
                                auditionDisk()
                            } else {
                                console.log('empty')
                            }
                        }}
                    />
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
const select_style = {
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