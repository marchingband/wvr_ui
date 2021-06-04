import React, { useRef, useEffect } from 'react';
import {store} from '../modules/store.js'

export const Slider = props =>
    <div style={container}>
        <div style={label}>
            {`${props.label} : ${props.value}`}
        </div>
        <input type="range" min={props.min} max={props.max} step={1} style={{width:300}}
            onChange={e=>props.onChange(parseInt(e.target.value))}
            value={props.value}
        />
    </div>

const container = {
    width:400,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    margin:4,
    color:store.theme.primary
}

const label = {
    marginLeft:'auto',
    marginRight:30
}