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
        {store.isRecoveryMode &&
            <RecoveryModeHome/>
        }
    </div>
)

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column',
    position:'relative',
    justifyContent:'space-around',
    padding:0,
    margin:0
}