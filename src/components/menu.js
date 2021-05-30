import React from 'react'
import { Text } from '../components/text.js'
import { sync } from '../wvr/sync'
import { store } from '../modules/store'
import {observer} from 'mobx-react-lite'

export const Menu = observer(() => 
    <div style={container}>
        <MenuButton onClick={()=>store.view="home"}>
            SOUNDS
        </MenuButton>
        <MenuButton onClick={()=>store.view="pins"}>
            PINS
        </MenuButton>
        <Text large secondary onClick={()=>store.view="global"} style={{cursor:'pointer'}}>
            WVR
        </Text>
        <MenuButton onClick={()=>store.view="firmware"}>
            FIRMWARE
        </MenuButton>
        <MenuButton 
            onClick={()=>sync()} 
            highlight={store.configNeedsUpdate}
        >
            SYNC
        </MenuButton>
    </div>
)

const MenuButton = observer(props => 
    <div 
        style={menuButton} 
        onClick={props.onClick}
    >
        <Text medium primary underline={props.highlight}>
            {props.children}
        </Text>
    </div>
)

const menuButton = {
    cursor:'pointer',
}

const container = {
    width:'100%',
    height: 50,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-evenly',
    backgroundColor: store.theme.backgroundColor
}