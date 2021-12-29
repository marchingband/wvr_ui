import React, { useState, useRef, useEffect } from 'react';
import {Text} from '../components/text'
import { store } from '../modules/store';
import {Firmware} from '../components/firmware'
import {observer} from 'mobx-react-lite'

export const Firmwares = observer(() => 
    <div style={container}>
        <Text>
            FIRMWARE MANAGER
        </Text>
        {
            store.metadata.currentFirmwareIndex == -1 &&
            <Text small warn style={{marginTop:10}}>
                * current running firmware was force-uploaded
            </Text>
        }
        {
            store.firmwares.slice().map((f,i)=>
                <Firmware key={i} num={i} f={f}/>
            )
        }
    </div>
)

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column'
}
