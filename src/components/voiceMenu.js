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


const VoiceButton = observer(({i}) => 
    <div 
        style={voiceButton(i)}
        onClick={()=>store.currentVoice = i}    
    >
        <Text primary small>
            {i}
        </Text>
    </div>
)
const voiceButton = i => ({
    flex:1,
    display:'flex',
    height:30,
    border:`1px solid ${i==store.currentVoice?'white':store.theme.primary}`,
    margin:5,
    borderRadius:2,
    alignItems:'center',
    justifyContent:'center',
    marginLeft:  i== 0  ? 76 : 2,
    marginRight: i== 15 ? 76 : 2,
    boxShadow:`0px 0px ${i==store.currentVoice?10:2}px white`,
    cursor:'pointer',
    userSelect:'none',
})

const container = {
    width:'100%',
    display:'flex',
    flexDirection:'row',
}
