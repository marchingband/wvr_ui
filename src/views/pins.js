import React from 'react';
import {PinConfigView} from '../components/pinConfigView'
import {MCU} from '../components/mcu'
import {MKR} from '../components/mkr'


export const Pins = () => 
    <div style={container}>
        <PinConfigView/>
        {process.env.MKR ? <MKR/> : <MCU/>}
    </div>

const container = {
    flex:1,
    display:'flex',
    flexDirection:'row'
}