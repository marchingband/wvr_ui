import React from 'react'
import { noteToName, noteToOctave } from '../helpers/noteToName'
import { store } from '../modules/store'
import {observer} from 'mobx-react-lite'
import {EDGE_RISING,EDGE_FALLING,EDGE_NONE,NOTES,VELOCITIES,NOTE_ON,BANK_UP,BANK_DOWN,WIFI_ON,WIFI_OFF,
    TOGGLE_WIFI,VOLUME_UP,VOLUME_DOWN,MUTE_ON,MUTE_OFF,TOGGLE_MUTE,SOFT,pinNames} from '../modules/constants'
import { Text } from './text.js'
import {SelectNum} from '../components/select'

export const PinConfigView = observer(() => {
    const pin = store.getCurrentPin()
    return(
        <div style={container}>
            <Text medium primary>
                {`PIN ${pinNames[store.pinConfigSelected]}`}
            </Text>
            <div style={{height:20}}/>
            <div style={setting_style}>
                <SelectNum
                    label="note"
                    value={pin.note}
                    onChange={e=>store.setCurrentPinProp('note',e)}
                >
                    {
                        NOTES.map(x=>
                            <option 
                                key={x}
                                value={x}
                            >
                                {`${noteToName(x)} ${noteToOctave(x)}`}
                            </option>    
                        )
                    }
                </SelectNum>
            </div>
            <div style={setting_style}>
                <SelectNum
                    label='velocity'
                    value={pin.velocity}
                    onChange={e=>store.setCurrentPinProp('velocity',e)}
                >

                    {
                        VELOCITIES.map(x=>
                            <option 
                                key={x}
                                value={x}
                            >
                                {x}
                            </option>    
                        )
                    }
                </SelectNum>
            </div>
            <div style={setting_style}>
                <SelectNum
                    label="action"
                    value={pin.action}
                    onChange={e=>store.setCurrentPinProp('action',e)}
                >
                    <option value={NOTE_ON}>note-on</option>
                    <option value={BANK_UP}>bank up</option>
                    <option value={BANK_DOWN}>bank down</option>
                    <option value={WIFI_ON}>wifi on</option>
                    <option value={WIFI_OFF}>wifi off</option>
                    <option value={TOGGLE_WIFI}>toggle wifi</option>
                    <option value={VOLUME_UP}>volume up</option>
                    <option value={VOLUME_DOWN}>volume down</option>
                    <option value={MUTE_ON}>mute</option>
                    <option value={MUTE_OFF}>unmute</option>
                    <option value={TOGGLE_MUTE}>toggle mute</option>
                    <option value={SOFT}>soft</option>
                </SelectNum>
            </div>
            {pin.touch != -1 &&
                <div style={setting_style}>
                    <SelectNum
                        label="touch or digital"
                        value={pin.touch}
                        onChange={e=>store.setCurrentPinProp('touch',e)}
                    >
                        <option value={1}>touch</option>
                        <option value={0}>digital</option>
                    </SelectNum>
                </div>
            }
            <div style={setting_style}>
                <SelectNum
                    label="edge"
                    value={pin.edge}
                    onChange={e=>store.setCurrentPinProp("edge",e)}
                >
                    <option value={EDGE_RISING}>rising</option>
                    <option value={EDGE_FALLING}>falling</option>
                    <option value={EDGE_NONE}>none</option>
                </SelectNum>
            </div>
            <div style={setting_style}>
                <SelectNum
                    label='debounce (ms)'
                    value={pin.debounce}
                    onChange={e=>store.setCurrentPinProp('debounce',e)}
                >

                    {
                        Array(1001).fill().map((_,x)=>
                            <option 
                                key={x}
                                value={x}
                            >
                                {x}
                            </option>    
                        )
                    }
                </SelectNum>
            </div>

        </div>
)})

const container = {
    margin:20,
    width:300,
    display:'flex',
    alignItems:'center',
    flexDirection:'column',
    // border:'1px solid green',
    padding:5,
    marginTop:50,
    marginRight:30
}

const select_style = {
    width:120,
    height:25,
    margin:5,
    marginLeft:'auto',
    marginRight:30,
    color:store.theme.primary,
    backgroundColor:store.theme.backgroundColor
}

const setting_style = {
    width:300,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    marginLeft:20,
    color:store.theme.primary
}
