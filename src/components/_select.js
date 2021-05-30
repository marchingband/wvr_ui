import React from 'react';
import {observer} from 'mobx-react-lite'
import {store} from '../modules/store.js'

export const Select = observer(({value,min,max,onChange,style={}}) =>
    <div style={style}>
        <select 
            style={select}
            onChange={e=>onChange(parseInt(e.target.value))}
            value={value}
        >
            {Array(max-min+1).fill().map((_,i)=>
                <option key={i} value={i+min}>{i+min}</option>
            )}
        </select>
    </div>

)

const select = {
    margin:10,
    border:`1px solid ${store.theme.primary}`,
    borderRadius:3,
    outline:'none',
    width:70,
    backgroundColor:store.theme.backgroundColor,
    color:'white',
    padding:6,
    boxShadow:`0px 0px 2px white`,
    marginRight:20
}
