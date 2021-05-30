import React from 'react';
import {observer} from 'mobx-react-lite'
import {Text} from '../components/text'

export const Stack = observer(({items}) => 
    <div style={column}>
        {
            items.map((item,i)=>
                <Text 
                    key={i} 
                    medium 
                    primary 
                    style={text}
                >
                    {item}
                </Text>
            )
        }
    </div>
)

const text = {
    margin:4
}

const column = {
    display:'flex',
    flexDirection:'column',
    alignItems:'flex-start',
}

