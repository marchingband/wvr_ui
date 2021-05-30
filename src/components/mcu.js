import React, {useState} from 'react';
import { store } from '../modules/store';
import {observer} from 'mobx-react-lite'
import { Text } from './text.js'
import {pinNames} from '../modules/constants'

const mcuPins = () => [{name:'GND'},{i:0},{i:1},{i:2},{i:3},{i:4},{i:5},
    {i:6},{name:'RX/MIDI'},{name:'RX/MIDI VREF'},{name:'9V'},{name:'GND'},
    {name:'3.3v'},{i:7},{i:8},{i:9},{i:10},{i:11},{i:12},{i:13},
    {name:'AUDIO R'},{name:'AUDIO L'}
]

export const MCU = observer(() => {
    const [top,setTop] = useState(false)
    const pin = store.pinConfigSelected
    return(
        <div>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                <Text medium primary>
                    {top?"TOP VIEW":"BOTTOM VIEW"}
                </Text>
                <div
                    style={{padding:5,cursor:'pointer',margin:10}}
                    onClick={()=>setTop(!top)}
                >
                    <Text medium secondary>
                        FLIP
                    </Text>
                </div>
            </div>
            <div 
                style={{
                    width:300,height:550,margin:'auto',display:'flex',
                    flexDirection:'column',backgroundColor:'#303030',color:store.theme.primary
                }}
            >
                <div style={{display:'flex',width:'100%',marginTop:50}}>
                    
                    {/* left side */}
                    <div style={{height:'100%',marginRight:'auto',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>
                        {
                            mcuPins()
                            .filter((_,x)=>top?x>10:x<11)
                            .map((p,num)=>
                                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}} key={num}>
                                    {p.i != undefined ?
                                        <div 
                                            style={{
                                                width:15,height:15,margin:10,
                                                borderRadius:8,cursor:'pointer',
                                                backgroundColor:p.i==pin?store.theme.tertiary:store.theme.primary
                                        }}
                                            onClick={()=>store.pinConfigSelected = p.i}
                                        />
                                        :
                                        <div 
                                            style={{width:15,height:15,margin:10,
                                                border:`1px solid ${store.theme.primary}`,
                                                borderRadius:8}}
                                        />
                                    }

                                    {p.name || pinNames[p.i]}
                                </div>
                            )
                        }
                    </div>

                    {/* right side */}
                    <div style={{height:'100%',marginLeft:'auto',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>
                        {
                            mcuPins()
                            .filter((_,x)=>top?x<11:x>10)
                            .map((p,num)=>
                                <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}} key={num}>
                                    {p.name || pinNames[p.i]}
                                    {p.i ?
                                        <div 
                                            style={{
                                                width:15,height:15,margin:10,
                                                borderRadius:8,cursor:'pointer',
                                                backgroundColor:p.i==pin?store.theme.tertiary:store.theme.primary
                                        }}
                                            onClick={()=>store.pinConfigSelected = p.i}
                                        />
                                        :
                                        <div 
                                            style={{width:15,height:15,margin:10,
                                                border:`1px solid ${store.theme.primary}`,
                                                borderRadius:8}}
                                        />

                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:100}}>
                    <div 
                        style={{
                            width:160,height:60,display:'flex',alignItems:'center',justifyContent:'center',
                            backgroundColor:store.theme.primary,color:'black',fontSize:40,fontFamily:'sans-serif',
                            fontWeight:100
                        }}
                    >
                        {top?'usb':'WVR'}
                    </div>
                </div>
            </div>
        </div>
    )
})
