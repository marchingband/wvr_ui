import React from 'react';
import {observer} from 'mobx-react-lite'
import {WavBoard} from '../components/wavBoard'
import {FileDetails} from '../components/fileDetails'
import {VoiceMenu} from '../components/voiceMenu'
import {ws} from '../helpers/init'

export const Home = observer(() =>
    <div style={container}>
        {/* <div 
            style={{width:50,height:50,backgroundColor:'red'}}
            onClick={()=>{
                ws.send(JSON.stringify({procedure:1}))
            }}
        /> */}
        <VoiceMenu/>
        <WavBoard/>
        <FileDetails/>
        <div style={{width:'100%',height:20,marginBottom:'auto'}}/>
    </div>
)

const container = {
    width:'100%',
    height:'100%',
    display:'flex',
    flexDirection:'column',
}