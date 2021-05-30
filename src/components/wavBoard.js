import React from 'react';
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {WavBoardItem} from '../components/wavBoardItem'
import ArrowRight from '../svg/arrow.svg';

export const WavBoard = observer(()=>{    
    return(
    <div style={container}>
        <WavBoardButton left/>
        {
            Array(store.numWavPerPage).fill()
            .map((_,i)=>
                <WavBoardItem
                    key={i}
                    voiceIndex={store.currentVoice} 
                    noteIndex={store.wavBoardIndex + i}
                />
            )
        }
        <WavBoardButton right/>
    </div>
)})

const WavBoardButton = props => 
    <div 
        style={button} 
        onClick={()=>store.scrollWavBoard(props.right)}
    >
        <img 
            height={25}
            src={ArrowRight}
            style={{
                transform:props.right?[]:['rotate(180deg)'],
                userSelect:'none'
            }}
        />
    </div>

const button = {
    width:50,
    height:50,
    borderRadius:26,
    border:`2px solid ${store.theme.secondary}`,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    cursor:'pointer',
    margin:10,
}

const container = {
    width:'100%',
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-around',
    alignItems:'center'
}