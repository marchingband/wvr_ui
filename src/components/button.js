import React from 'react';
import {Text} from '../components/text'
import {store} from '../modules/store.js'

export const Button = ({onClick,title="",style={},disabled=false,warn=false}) =>
    <div 
        style={{...button(disabled),...style}}
        onClick={()=>!disabled && onClick()}
    >
        <Text secondary={!disabled && !warn} primary={disabled && !warn} warn={warn}>
            {title}
        </Text>
    </div>

const button = disabled => ({
    width:100,
    height:20,
    margin:4,
    marginLeft:0,
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    border:`1px solid ${store.theme.primary}`,
    borderRadius:3,
    padding:5,
    paddingLeft:10,
    paddingRight:10,
    boxShadow:`0px 0px 2px white`,
    cursor:disabled?'default':'pointer',
    marginBottom:0
})
