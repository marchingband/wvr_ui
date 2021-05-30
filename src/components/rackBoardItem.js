import React from 'react';
import {Text} from '../components/text'
import {store} from '../modules/store.js'
import {observer} from 'mobx-react-lite'
import {WAV_ITEM_SIZE} from '../modules/constants'

export const RackBoardItem = observer(({i}) => 
    <div 
        style={container(store.rackBoardSelected == i)}
        onClick={()=>store.rackBoardSelected = i}
    >
        <Text medium primary style={{margin:2}}>
            {` layer ${i}`}
        </Text>
        <Text medium primary style={{margin:2}}>
            {store.getRackLayer(i).name.slice(0,10) || 'empty'}
        </Text>
        <Text medium primary style={{margin:2}}>
            {"< " + (store.getRackBreakPoint(i+1) || 127)}
        </Text>
    </div>
)

const container = selected => ({
    flex:1,
    height:WAV_ITEM_SIZE,
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    margin:2,
    border:`1px solid ${selected ? 'white' : store.theme.primary}`,
    cursor:'pointer',
    borderRadius:4,
    boxShadow:`0px 0px ${selected ? 10 : 3}px white`
})