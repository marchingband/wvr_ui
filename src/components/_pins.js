import React, { useState, useRef, useEffect } from 'react';

const ONE_SHOT = 0
const LOOP = 1
const PING_PONG = 2

const RETRIGGER = 0
const RESTART = 1
const IGNORE = 2


const notes = []
for(let x=0;x<127;x++){
    notes.push(x)
}

const priorities = []
for(let x =0;x<10;x++){
    priorities.push(x)
}

const retriggerModes = [

]

const defaultPinConfig = {
    0:{
        name:'GND',
    },
    1:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D0',
    },
    2:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D1',
    },
    3:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D2',
    },
    4:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D3',
    },
    5:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D4',
    },
    6:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D5',
    },
    7:{
        touch:false,
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D6 A0* T3',
    },
    8:{
        name:'RX/MIDI',
    },
    9:{
        name:'RX/MIDI VREF',
    },
    10:{
        name:'9V',
    },
    11:{
        name:'GND',
    },
    12:{
        name:'3.3v',
    },
    13:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D7 A1*',
    },
    14:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D8 A2*',
    },
    15:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D9 A3*',
    },
    16:{
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D10 A4*',
    },
    17:{
        touch:false,
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D11 A5 T0',
    },
    18:{
        touch:false,
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D12 A6 T1',
    },
    19:{
        touch:false,
        note:0,
        rising:false,
        mode:ONE_SHOT,
        retrigger:RETRIGGER,
        priority:0,
        name:'D13 A7 T2',
    },
    20:{
        name:'AUDIO R',
    },
    21:{
        name:'AUDIO L',
    },
}

const MCU = ({pin,setPin}) => {
    const [top,setTop] = useState(false)
    return(
        <div>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                {top?"TOP VIEW":"BOTTOM VIEW"}
                <div
                    style={{border:'1px solid black',padding:5,cursor:'pointer',margin:10}}
                    onClick={()=>setTop(!top)}
                >
                    FLIP
                </div>
            </div>
            <div 
                style={{
                    width:300,height:550,border:'1px solid black',margin:'auto',display:'flex',
                    flexDirection:'column',backgroundColor:'#303030',color:'white'
                }}
            >
                <div style={{display:'flex',width:'100%',marginTop:50}}>
                    <div style={{height:'100%',marginRight:'auto',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>

                        {
                            Object.values(defaultPinConfig)
                            .filter((_,x)=>top?x>10:x<11)
                            .map((p,num)=>
                                <div style={{display:'flex',flexDirection:'row',alignItems:'center'}} key={num}>
                                    {p.note != undefined ?
                                        <div 
                                            style={{
                                                width:15,height:15,margin:10,
                                                // border:'1px solid red',
                                                borderRadius:8,cursor:'pointer',
                                                backgroundColor:!top?num==pin?'gold':'white':num+11==pin?'gold':'white'
                                            }}
                                            onClick={()=>setPin(top?num+11:num)}
                                        />
                                        :
                                        <div 
                                            style={{width:15,height:15,margin:10,
                                                border:'1px solid white',
                                                borderRadius:8}}
                                        />
                                    }

                                    {p.name}
                                </div>
                            )
                        }
                    </div>
                    <div style={{height:'100%',marginLeft:'auto',display:'flex',flexDirection:'column',justifyContent:'space-around'}}>
                        {
                            Object.values(defaultPinConfig)
                            .filter((_,x)=>top?x<11:x>10)
                            .map((p,num)=>
                                <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'center'}} key={num}>
                                    {p.name}
                                    {p.note != undefined ?
                                        <div 
                                            style={{
                                                width:15,height:15,margin:10,
                                                // border:'1px solid red',
                                                borderRadius:8,cursor:'pointer',
                                                backgroundColor:top?num==pin?'gold':'white':num+11==pin?'gold':'white'
                                            }}
                                            onClick={()=>setPin(top?num:num+11)}
                                        />
                                        :
                                        <div 
                                            style={{width:15,height:15,margin:10,
                                                border:'1px solid white',
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
                            backgroundColor:'white',color:'black',fontSize:40,fontFamily:'sans-serif',
                            fontWeight:100
                        }}
                    >
                        {top?'usb':'WVR'}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Pins = ({state}) => {
    const {pinConfig:config,setPinConfig:setConfig} = state
    const [pin,setPin] = useState(1)
    return(
<div style={{flex:1,display:'flex',flexDirection:'row'}}>
    <div style={{
        margin:20,width:300,display:'flex',alignItems:'center',
        flexDirection:'column',border:'1px solid green',padding:5,
        marginTop:50,marginRight:30
    }}>
        <b>PIN {config[pin].name}</b>
        <div style={{height:20}}/>
        <div style={setting_style}>
            <label>
                note 
            </label>
            <select
                style={select_style}
                value={config[pin].note}
                onChange={e=>{
                    let _config = {...config}
                    _config[pin].note = e.target.value
                    setConfig(_config)
                }}
            >
                {
                    notes.map(x=>
                        <option 
                            key={x}
                            value={x}
                        >
                            {getNote(x)}
                        </option>    
                    )
                }
            </select>
        </div>
        <div style={setting_style}>
            <label>mode </label>
            <select
                style={select_style}
                value={config[pin].mode}
                onChange={e=>{
                    let _config = {...config}
                    _config[pin].mode = e.target.value
                    setConfig(_config)
                }}
            >
                <option value={ONE_SHOT}>one-shot</option>
                <option value={LOOP}>loop</option>
                <option value={PING_PONG}>ping-pong</option>
            </select>
        </div>
        <div style={setting_style}>
            <label>retrigger mode </label>
            <select
                style={select_style}
                value={config[pin].retrigger}
                onChange={e=>{
                    let _config = {...config}
                    _config[pin].retrigger = e.target.value
                    setConfig(_config)
                }}
            >
                <option value={RETRIGGER}>retrigger</option>
                <option value={RESTART}>restart</option>
                <option value={IGNORE}>ignore</option>
            </select>
        </div>
        <div style={setting_style}>
            <label>priority </label>
            <select
                style={select_style}
                value={config[pin].priority}
                onChange={e=>{
                    let _config = {...config}
                    _config[pin].priority = e.target.value
                    setConfig(_config)
                }}
            >
                {
                    priorities.map(x=>
                        <option value={x} key={x}>
                            {x}
                        </option>    
                    )
                }
            </select>
        </div>

        {config[pin].touch != undefined &&
            <div style={setting_style}>
                <label>touch or digital </label>
                <select
                    style={select_style}
                    value={config[pin].touch?'touch':'digital'}
                    onChange={e=>{
                        let _config = {...config}
                        _config[pin].touch = e.target.value == 'touch'
                        setConfig(_config)
                    }}
                >
                    <option value="touch">touch</option>
                    <option value="digital">digital</option>
                </select>
            </div>
        }
        {(config[pin].touch == undefined || config[pin].touch == false) &&
            <div style={setting_style}>
                <label>edge </label>
                <select
                    style={select_style}
                    value={config[pin].rising?'rising':'falling'}
                    onChange={e=>{
                        let _config = {...config}
                        _config[pin].rising = e.target.value == 'rising'
                        setConfig(_config)
                    }}
                >
                    <option value="rising">rising</option>
                    <option value="falling">falling</option>
                </select>
            </div>
        }
    </div>
    <MCU pin={pin} setPin={setPin}/>
</div>    
)
}

const select_style = {
    width:120,
    height:25,
    margin:5,
    marginLeft:'auto',
    marginRight:30
}
const setting_style = {
    width:300,
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    marginLeft:20
}


const noteNames = {
    0:'C',
    1:'C#',
    2:'D',
    3:'D#',
    4:'E',
    5:'F',
    6:'F#',
    7:'G',
    8:'G#',
    9:'A',
    10:'A#',
    11:'B',
}

const getNoteName = x => noteNames[x % 12]
const getOctave = x => Math.floor(x / 12) - 2
const getNote = x => `${x} ${getNoteName(x)} ${getOctave(x)}`

module.exports = {Pins,defaultPinConfig}