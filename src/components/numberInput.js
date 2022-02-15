import React, { useState } from 'react';
import {store} from '../modules/store.js'
import { Text } from './text.js';

export const NumberInput = props => {
    return(
        <div style={{...container, ...props.style}}>
            <Text primary>
                {props.label}
            </Text>
            <input {...props}
                type="text"
                onChange={e=>props.onChange(parseInt(e.target.value) || 0)}
                style={select_style}
                value = {props.val}
                onBlur={()=>props.onSubmit()}
            />
        </div>
)}

const container = {
    width:300,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    marginLeft:20,
    color:store.theme.primary,
}

const select_style = {
    width:112,
    height:19,
    margin:2,
    marginLeft:'auto',
    marginRight:30,
    color:store.theme.primary,
    backgroundColor:store.theme.backgroundColor,
    border:"1px solid grey",
    paddingLeft:4
}

