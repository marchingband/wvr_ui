import React, { useRef, useEffect } from 'react';
import {store} from '../modules/store.js'

export const Checkbox = props =>
    <div style={container}>
        <div style={label}>
            {`${props.label}:`}
        </div>
        <div style={{width:300}}>
            <input
                type="checkbox"
                checked={props.value}
                onChange={e=>store.setCurrentNoteProp("reverse",e.target.checked)}
            />
        </div>
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