import React from 'react';
import { observer } from "mobx-react-lite";
import { Text } from '../components/text'

export const RecoveryModeHome = observer(()=>
    <div style={container}>
        <Text large warn>WVR IS IN</Text>
        <Text large warn>RECOVERY MODE</Text>
        <Text medium secondary>(sounds are not loaded and cannot be changed)</Text>
    </div>
)

const container = {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    zIndex:10,
    backgroundColor:'black',
    color:'white',
    fontSize:50,
    opacity:0.7,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'column'
}