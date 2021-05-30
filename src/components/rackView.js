import React from 'react';
import {observer} from 'mobx-react-lite'
import {RackBoard} from './rackBoard'
import {RackItemDetails} from '../components/RackItemDetails'
import { RackDetails } from './rackDetails';

export const RackView = observer(() => 
        <div style={container}>
            <RackDetails/>
            <RackBoard/>
            <RackItemDetails/>
        </div>
)

const container = {
    flex:1,
    display:'flex',
    flexDirection:'column',
}