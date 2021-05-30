import React from 'react';
import {observer} from 'mobx-react-lite'
import {store} from '../modules/store.js'
import {WavDetails} from './wavDetails'
import {RackView} from './rackView'

export const FileDetails = observer(() => 
    <div style={container}>
        {
            store.getCurrentNote().isRack == -1 ? 
                <WavDetails/> :
                <RackView/>
        }
    </div>
)

const container = {
    flex:1,
    width:'100%',
    display:'flex',
    flexDirection:'column',
}