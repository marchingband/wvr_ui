import React from 'react';
import {Text} from '../components/text'
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {noteToName, noteToOctave} from '../helpers/noteToName'
import {WAV_ITEM_SIZE} from '../modules/constants'

export const WavBoardItem = observer(({voiceIndex,noteIndex}) => 
    <div 
        style={
            container(
                store.wavBoardSelected == noteIndex, // selected
                store.getNote(voiceIndex,noteIndex).playing, // playing
                store.wavBoardRange.includes(noteIndex), // range
                store.wavBoardInterpolationTarget == noteIndex // interp target
            )
        }
        // onClick={()=>store.wavBoardSelected = noteIndex}
        onClick={({shiftKey,altKey,metaKey})=>{
            if(shiftKey && altKey){
                store.wavBoardsetInterpolationTarget(noteIndex)
            }else if(shiftKey){
                store.wavBoardRangeSelect(noteIndex)
            }else if(altKey){
                store.wavBoardAddToSelection(noteIndex)
            }else{
                store.wavBoardClearRange()
                store.wavBoardSelected = noteIndex
            }
        }}
    >
        <Text medium primary style={{margin:2}}>
            {`${noteToName(noteIndex)} ${noteToOctave(noteIndex)}`}
        </Text>
        <Text medium primary style={{margin:2}}>
            {noteIndex}
        </Text>
        <Text medium primary style={{margin:2}}>
            {
                store.getNote(voiceIndex,noteIndex).rack?
                    store.getNote(voiceIndex,noteIndex).rack.name ? 
                        store.getNote(voiceIndex,noteIndex).rack.name.slice(0,10) :
                        'untitled' :
                    store.getNote(voiceIndex,noteIndex).name.slice(0,10) || 'empty'
            }
        </Text>
    </div>
)

const container = (selected,playing,range,interp) => ({
    flex:1,
    height:WAV_ITEM_SIZE,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    margin:2,
    border:`1px solid ${interp?'red':range?'gold':selected?'gold':store.theme.primary}`,
    cursor:'pointer',
    borderRadius:4,
    boxShadow:`0px 0px ${selected ? 10 : 3}px ${interp?'red':range?'gold':selected?'gold':'white'}`,
    backgroundColor:playing?'gold':store.theme.backgroundColor
})