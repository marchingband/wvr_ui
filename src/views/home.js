import React from 'react';
import {observer} from 'mobx-react-lite'
import {WavBoard} from '../components/wavBoard'
import {FileDetails} from '../components/fileDetails'
import {VoiceMenu} from '../components/voiceMenu'
import { store } from '../modules/store';
import {RecoveryModeHome} from '../components/recoveryMode'

export const Home = observer(() =>
    <div style={container}>
        <VoiceMenu/>
        <WavBoard/>
        <FileDetails/>
        <div style={{width:'100%',height:20,marginBottom:'auto'}}/>
        {store.isRecoveryMode &&
            <RecoveryModeHome/>
        }
    </div>
)

const container = {
    width:'100%',
    height:'100%',
    display:'flex',
    flexDirection:'column',
    position:'relative'
}