import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'
import useHover from './useHover'
import {toPcm, toPcmFX, play} from '../helpers/toPcm.js'
import {Pins,defaultPinConfig} from '../components/pins.js'
import {drawWave} from '../helpers/drawWave.js'
import {Update} from './update.js'

// const _url = "data:image/png;base64," + data
// fetch(_url).then(r=>r.blob()).then(b=>myUrl = URL.createObjectURL(b))
// console.log(data)
/**
 *  midi note manager:
 *   choose file, set pitch, set volume
 *   select damping algorythm
 *   select pruning algorythm
 *   add reverb / compression / eq
 *   test playback
 *   choose already saved file
 *   make it a rack
 *  hardware trigger manager
 *   set latched / looped / retrigger
 *   set debounce / touch thresholds / adc for piezo thresholds
 *   save as number for ID
 *  serial trigger manager
 *   copy / paste fileID
 *   select pruning algorythm / priority
 *   set buffersize / latency ?
 *   save as number for ID
 */

var config = {
    numBanks : 1,
    banks: [
        [
            {
                note:1,
                size:1,
                start:1,
                isRack:0
            },
        ],
    ],


}
const MAX_BANKS = 16
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

const ws = new WebSocket("ws://192.168.4.1/ws");
ws.onopen = e => {
    console.log("ws connected : ", e)
    ws.send("we are connected")
}

const isJson = x => {
    try{
        JSON.parse(x)
    } catch (e) {
        return false
    }
    return true
}

const initWebSockets = state =>{
    ws.onmessage = ({data}) => {
        if(!isJson(data)){
            console.log(data)
        } else {
            const msg = JSON.parse(data)
            if(msg.log){
                console.log(msg.log)
            } else {
                console.log(msg)
            }
        }
    }
}

const onSelectFile = ({state,e,note,bank}) => {
    // cut name to 20 characters, keep file type suffix
    const name =  
        e.target.files[0].name.slice(0,-4).substring(0,20) + 
        e.target.files[0].name.slice(-4)
    state.setUploads([
        // if there is already an upload for this note/bank, remove it
        ...[...state.uploads].filter(x=>x.bank != bank || x.note != note.note), 
        // add the new file
        {
            fileHandle: e.target.files[0],
            bank: state.currentBank,
            note: note.note,
            name: name
        }
    ])
    let banks = [...state.banks]
    banks[state.currentBank][note.note].filename = name
    state.setBanks(banks)
}

const sync = async ({state}) => {
    if(!state.uploads.length){
        return alert("nothing to sync")
    }
    state.setUploading(true)
    for(let {fileHandle,bank,note,name} of state.uploads)
    {
        // convert to stereo 44.1k raw PCM
        var pcmFileHandle = await toPcm(fileHandle)

        // convert to stereo 44.1k raw PCM with FX
        // var pcmFileHandle = await toPcmFX({f:fileHandle,state})
        // var pcmFileHandle = fileHandle
        .catch(e=>alert(e))
        var size = pcmFileHandle.size
        await axios.post(
            "http://192.168.4.1/addwav",
            pcmFileHandle,
            {
                onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
                headers:{
                    'Content-Type': 'text/plain',
                    'size':size,
                    'name':name,
                    'voice':bank,
                    'note':note,
                }
            }
        )
        .catch(e=>{})
        // .catch(e=>alert('File Uplaod Failed \n' + e ))
    }
    state.setUploads([])
    state.setUploading(false)
    fetchFS({state})
}

const updateBanks = ({state,data}) =>{
    var newBanks = []
    data.forEach(bank=>{
        var newBank = []
        bank.forEach((note,noteNum)=>{
            const {name=''} = note
            newBank.push({
                note:noteNum,
                noteName:noteNames[noteNum%12],
                filename:name,
            })
        })
        newBanks.push(newBank)
    })
    state.setBanks(newBanks)
}

const flash = ({hit,state}) => {
    const {code,chan,note,velo} = hit
    console.log(hit)
    let banks = [...state.banks]
    banks[chan][note].flash = true
    state.setBanks(banks)
}

const uploadFirmware = async ({file,state}) => {
    state.setUploading(true)
    await axios.post(
        "http://192.168.4.1/update",
        file,
        {
            onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
            headers:{
                'Content-Type': 'text/plain'
            }
        }
    )
    .catch(e=>alert('File Uplaod Failed \n' + e ))
    state.setUploading(false)
}

const fetchFS = async ({state}) => {
    state.setDownloading(true)
    const res = await axios({
        method:'get', url:'/fsjson', responseType: 'json',
        onDownloadProgress:p=>state.setProgress((p.loaded / p.total * 100).toFixed(0))
    // }).catch(e=>alert('Failed to connect to Waver\n' + e ))
    }).catch(e=>{})
    console.log(res)
    if(res && res.data){
        console.log(res.data)
        state.setFs(res.data)
        updateBanks({state,data:res.data.voices})
    } 
    state.setDownloading(false)
}

const emptyBank = () => {
    let bank = []
    for (var i = 0; i < 128; i++) {
        bank.push({ note: i, filename: '', noteName: noteNames[i%12] })
    }
    return(bank)
}

const dummyBank = () => {
    const dummyBank = []
    for (var i = 0; i < 128; i++) {
        dummyBank.push({
            note: i,
            filename: i % 2 == 0 ? '012345678901234567890123.wav' : '',
            noteName : noteNames[i%12]
        })
    }
    return dummyBank
}

const App = () => {
    // const [view,setView] = useState('home')
    const [view,setView] = useState('home')
    const [banks,setBanks] = useState([emptyBank()])
    // const [banks,setBanks] = useState([dummyBank()])
    const [currentBank,setCurrentBank] = useState(0)
    const [selectedNote,setSelectedNote] = useState({})
    const [showNoteMenu,setShowNoteMenu] = useState(false)
    const [uploads, setUploads] = useState([])
    const [fs,setFs] = useState([])
    const [uploading,setUploading] = useState(false)
    const [downloading,setDownloading] = useState(false)
    const [progress,setProgress] = useState(0)
    const [pinConfig,setPinConfig] = useState(defaultPinConfig)
    const state = {
        banks,setBanks,currentBank,setCurrentBank,selectedNote,setSelectedNote,showNoteMenu,setShowNoteMenu,
        uploads,setUploads,fs,setFs,uploading,setUploading,progress,setProgress,downloading,setDownloading,
        view,setView,pinConfig,setPinConfig
    }
    useEffect(()=>{
        fetchFS({state})
    },[])
    useEffect(()=>{
        initWebSockets(state)
    },[banks])
    return (
        <div style={{width:'100%',display:'flex',flexDirection:'column',minWidth:'1100px'}}>
                {/* <img src={`data:image/png;base64,${data}`}/> */}
                {/* {myUrl && <img src={myUrl} height={100} width={100}/>} */}
                {/* <img src={image} height={100} width={100} /> */}
                <div style={{flex:1, margin:'10px', marginTop:'0px',transform:'translateX(0)'}}>
                <div style={{width:'100%',display:'flex',flexDirection:'row',alignItems:'center'}}>
                    <ButtonPanel state={state}/>
                    <h1 style={{marginLeft:'30px'}}>WVR v2</h1>
                </div>
                {view=='home' &&
                    <div>
                        <BankSelect state={state}/>
                        <Bank state={state} />
                    </div>
                }
                {view=='pins' &&
                    <Pins state={state}/>
                }
                {view=='update' &&
                    <Update state={state} fetchFS={fetchFS}/>
                }
                {uploading && <Overlay text={`Uploading : ${progress}%`} state={state}/>}
                {downloading && <Overlay text={`Downloading : ${progress}%`} state={state}/>}
                {showNoteMenu && <NoteMenu state={state}/>}
            </div>
        </div>
    )
}

const ButtonPanel = ({state}) => {
    const fileInput = useRef(null)
    return(
        <div style={{display:'flex',flexDirection:'row',alignItems:'flex-start'}}>
            <div
                style={buttonBar}
                onClick={()=>fetchFS({state})}
            >
                RESET
            </div>
            <div
                style={buttonBar}
                onClick={()=>sync({state})}
            >
                SYNC
            </div>
            <div
                style={buttonBar}
                // onClick={()=>fileInput.current.click()}
                onClick={()=>state.setView("update")}
            >
                UPLOAD FIRMWARE
            </div>
            <div
                style={buttonBar}
                onClick={()=>state.setView(state.view=='home'?"pins":'home')}
            >
                {state.view=='home'?"PINS":'HOME'}
            </div>
            <input 
                ref={fileInput} type="file" 
                onChange={e=>uploadFirmware({file:e.target.files[0],state})}
                style={{display:'none'}}
            />
        </div>
    )
}

const NoteMenu = ({state}) => {
    const fileInput = useRef(null)
    const fileInput1 = useRef(null)
    const fileInput2 = useRef(null)
    const fileInput3 = useRef(null)
    const canvas = useRef(null)
    const [playing,setPlaying] = useState(null)
    const {bank,note} = state.selectedNote
    const {note:noteNum,noteName,filename,isRack} = note
    const needsSync = state.uploads.some(x=>x.bank == state.currentBank && x.note==note.note)
    const data = state.uploads.find(x=>x.bank == bank && x.note == noteNum) || {}
    var fileData;
    if(needsSync){
        fileData = state.uploads.filter(x=>x.note==noteNum && x.bank == state.currentBank)[0]
    } else if(state.fs[state.currentBank]){
        fileData = state.fs[state.currentBank][note]
    }
    useEffect(()=>{
        if(!canvas.current || !needsSync){return}
        const ctx = canvas.current.getContext("2d")
        drawWave({ctx:ctx,f:fileData.fileHandle})
    },[canvas,needsSync,fileData])
    return(
<React.Fragment>
    
    {isRack && 
        <div
            style={{
                position:"fixed",top:30,left:630,width:'300px',height:'600px',zIndex:2,
                backgroundColor:'white',border: '2px solid green',...center,...text
            }}
        >
            <input 
                ref={fileInput1}
                type="file" 
                // style={{display:'none'}}
            />
            <input 
                ref={fileInput2}
                type="file" 
                // style={{display:'none'}}
            />
            <input 
                ref={fileInput3}
                type="file" 
                // style={{display:'none'}}
                // onChange={e=>onSelectFile({e,state,note,bank})}
            />
            <div
                onClick={async()=>{
                    const json = JSON.stringify({
                        name:"test rack title 1",
                        breakPoints:[0,50,100,127],
                    })

                    var res = await axios.post(
                        "http://192.168.4.1/addrack",
                        fileInput1.current.files[0],
                        {
                            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
                            headers:{
                                'Content-Type': 'text/html',
                                'name' : "test name",
                                'voice' : bank,
                                'note' : note.note,
                                'layer' : 0,
                                'rack-json': json,
                            }
                        }
                    )
                    .catch(e=>alert('File Uplaod Failed \n' + e ))
                    console.log("res")
                    console.log(res)
                    res = await axios.post(
                        "http://192.168.4.1/addrack",
                        fileInput2.current.files[0],
                        {
                            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
                            headers:{
                                'Content-Type': 'text/html',
                                'name' : "test name",
                                'voice' : bank,
                                'note' : note.note,
                                'layer' : 1,
                                'rack-json': json,
                            }
                        }
                    )
                    .catch(e=>alert('File Uplaod Failed \n' + e ))
                    console.log("res")
                    console.log(res)
                    res = await axios.post(
                        "http://192.168.4.1/addrack",
                        fileInput3.current.files[0],
                        {
                            // onUploadProgress: p=>state.setProgress((p.loaded / p.total * 100).toFixed(0)),
                            headers:{
                                'Content-Type': 'text/html',
                                'name' : "test name",
                                'voice' : bank,
                                'note' : note.note,
                                'layer' : 2,
                                'rack-json': json,
                            }
                        }
                    )
                    .catch(e=>alert('File Uplaod Failed \n' + e ))
                    console.log("res")
                    console.log(res)
                
                }}
            >
                SUBMIT
            </div>

        </div>
    }
    <div
        style={{
            position:"fixed",top:30,left:30,width:'600px',height:'600px',zIndex:2,
            backgroundColor:'white',border: '2px solid green',...center,...text
        }}
    >
        <div
            style={{
                width:'100px',height:'30px',border:'1px solid black',marginBottom:'10px',
                cursor:'pointer',borderRadius:'3px',...center,...text, fontSize:'14px'
            }}
            onClick={()=>{
                let banks = [...state.banks]
                console.log("TP")
                console.log(banks[bank][note.note])
                banks[bank][note.note].isRack = 1 
                state.setBanks(banks)            
            }}
        >
            MAKE RACK
        </div>

        <h1>{`${noteNum} (${noteName}${(Math.floor(noteNum/12)-2)})`}</h1>
        <div style={text}>{'BANK ' + (bank+1)}</div>
        <div style={{...center,display:'flex',flexDirection:'row'}}>
            <div style={text}>{filename || 'NO FILE SELECTED'}</div>
            <div 
                style={{...center,border:'1px solid black',width:'20px',marginLeft:'5px',height:'20px',cursor:'pointer'}}
                onClick={()=>fileInput.current.click()}
            >
                ø
            </div>
        </div>
        {needsSync &&
            <div style={{border:'1px solid black',margin:'auto'}}>
                <canvas ref={canvas} width={500} height={150} />
            </div>
        }
        <div style={{marginTop:'auto'}}>
            { "PITCH SHIFT : " + (data.pitchShift > 0 ? '+' : '') + (data.pitchShift || 0) }
        </div>
        <input
            style={{marginBottom:20}}
            defaultValue={0}
            type='range'
            min='-12'
            max='12'
            onChange={e=>{
                // const data = state.uploads.find(x=>x.bank == bank && x.note == noteNum)
                if(data == undefined){return}
                data.pitchShift = e.target.value
                state.setUploads([
                    // if there is already an upload for this note/bank, remove it
                    ...[...state.uploads].filter(x=>x.bank != bank || x.note != note.note), 
                    // add the new file
                    data
                ])
            }}
        />
        <div>
            { "DISTORTION : " + (data.dist/100 || 0) }
        </div>
        <input
            style={{marginBottom:20}}
            defaultValue={0}
            type='range'
            min='0'
            max='1000'
            onChange={e=>{
                // const data = state.uploads.find(x=>x.bank == bank && x.note == noteNum)
                if(data == undefined){return}
                data.dist = e.target.value
                state.setUploads([
                    // if there is already an upload for this note/bank, remove it
                    ...[...state.uploads].filter(x=>x.bank != bank || x.note != note.note), 
                    // add the new file
                    data
                ])
            }}
        />
        <div>
            { "REVERB : " + (data.verb_gain/100 || 0)}
        </div>
        <input
            style={{marginBottom:20}}
            defaultValue={0}
            type='range'
            min='0'
            max='1000'
            onChange={e=>{
                // const data = state.uploads.find(x=>x.bank == bank && x.note == noteNum)
                if(data == undefined){return}
                data.verb_gain = e.target.value
                state.setUploads([
                    // if there is already an upload for this note/bank, remove it
                    ...[...state.uploads].filter(x=>x.bank != bank || x.note != note.note), 
                    // add the new file
                    data
                ])
            }}
        />
        <div
            style={{
                width:'100px',height:'30px',border:'1px solid black',marginBottom:'10px',
                cursor:'pointer',borderRadius:'3px',...center,...text, fontSize:'14px'
            }}
            onClick={()=>{
                if(!playing){
                    play({state,setPlaying})
                    .then(src=>setPlaying(src))
                } else {
                    playing.stop()
                    setPlaying(null)
                }
            }}
        >
            {playing?"STOP":"PLAY"}
        </div>
        <div
            style={{
                width:'100px',height:'30px',border:'1px solid black',marginBottom:'10px',
                cursor:'pointer',borderRadius:'3px',...center,...text, fontSize:'14px'
            }}
            onClick={()=>state.setShowNoteMenu(false)}
        >
            DONE
        </div>

        <input 
            ref={fileInput}
            type="file" 
            style={{display:'none'}}
            onChange={e=>onSelectFile({e,state,note,bank})}
        />
    </div>
</React.Fragment>
)}

const BankSelect = ({state}) => {
    return(
        <div
            style={{
                flex:1,height:'20px',border:'1px solid black',marginBottom:'3px',marginRight:'2px',display:'flex',
                flexDirection:'row',boxSizing: 'border-box',
            }}
        >
            {state.banks.map((_,i)=>
                <div
                    key={i}
                    style={{
                        height:'100%',width:'70px',border:`1px solid ${state.currentBank==i?
                        'orange':'yellow'}`,boxSizing:'border-box',cursor:'pointer',...center,...text
                    }}
                    onClick={()=>state.setCurrentBank(i)}
                >
                    {"bank " + (i+1)}
                </div>
        )}
            {/* <div
                style={{
                    height:'100%',width:'70px',border:'1px solid orange',boxSizing:'border-box',
                    marginLeft:'auto',cursor:'pointer',...center,...text
                }}
                onClick={()=>{
                    if(state.banks.length<MAX_BANKS){
                        state.setBanks([...state.banks,emptyBank()])
                    } else {
                        alert("maximum banks : 16")
                    }
                }}
            >
                {"ADD BANK"}
            </div>   */}
        </div>
)}

const Note = ({ note, state }) => {
    const [hRef1, h1] = useHover();
    const [hRef2, h2] = useHover();
    const [hRef3, h3] = useHover();
    const fileInput = useRef(null)
    const needsSync = state.uploads.some(x=>x.bank == state.currentBank && x.note==note.note)
    const [flash,setFlash] = useState(false)
    useEffect(()=>{
        if(note.flash){
            setFlash(note.flash)
            setTimeout(()=>{
                setFlash(false)
            },1000)
        }
    },[note,state])
    return (
        <div
            style={{
                minWidth:'0px',flex:1,height: '50px',border: `1px solid ${h1?'yellow':'grey'}`,
                display: 'flex',margin: '2px', marginLeft:'0px',flexDirection: 'column',
                transform:'translateX(0px)',cursor:'default',backgroundColor:flash?'red':needsSync?'yellow':'white'
            }}
            ref={hRef1}
        >
            <input 
                ref={fileInput}
                type="file" 
                style={{display:'none'}}
                onChange={e=>onSelectFile({e, state, note, bank:state.currentBank})}
            />
            <div 
                style={{
                    width:'100%',height:'70%',cursor: 'pointer',boxSizing: 'border-box',
                    border: `1px solid ${h2?'yellow':'orange'}`,
                    textAlign: 'center', color: note.filename ? 'black' : 'grey',
                    wordWrap:'break-word', textOverflow:'ellipsis',overflow:'hidden',...text
                }}
                ref={hRef2}
                onClick={()=>fileInput.current.click()}
            >
                {note.filename || "select file"}
            </div>
            <div style={{...center,flexDirection:'row',marginTop:'auto'}}>
                <div style={{textAlign: 'center',flex:1,...center,...text,color:'grey',cursor:'default'}}>
                    {`${note.note} : ${note.noteName}${(Math.floor(note.note/12)-2)}`}
                </div>
                <div 
                    style={{
                        width:'20px',height:'20px',cursor: 'pointer',
                        border: `1px solid ${h3?'yellow':'blue'}`,marginLeft:'auto',...center,...text,
                        borderRadius:'3px',boxSizing: 'border-box',textAlign: 'center',lineHeight:1.4,
                    }}
                    ref={hRef3}
                    onClick={()=>{
                        state.setSelectedNote({note, bank:state.currentBank})
                        // state.setSelectedNote({...note, bank:state.currentBank})
                        state.setShowNoteMenu(true)
                    }}
                >
                    ø
                </div>
            </div>
        </div>
    )
}

const Octave = ({ octave, state }) =>
    <div 
        style={{
            width: `${octave.length/12 * 100}%`,height: '100%',display: 'flex',flexDirection: 'row',
            justifyContent:'space-between'
        }}
    >
        {octave.map((n, i) => <Note key={i} note={n} state={state}/>)}
    </div>

const Bank = ({ state }) => {
    const bank = state.banks[state.currentBank]
    var octaves = []
    for (let i = 0; i < bank.length; i += 12) {
        octaves.push(bank.slice(i, i + 12))
    }
    return (
        <div style={{flex:1,height: '90%',display: 'flex',flexDirection: 'column',}}>
            {octaves.map((o, i) => <Octave key={i} octave={o} state={state}/>)}
        </div>
    )
}

const Overlay = ({state, text:script}) => 
    <div
        style={{
            position:'absolute',top:'0px',left:'0px',width:'100%',height:'100%',zIndex:3,
            backgroundColor:'white',opacity:0.8,...text,...center,fontSize:'30px'
        }}
    >
        {script}
    </div>


var center = { 
    display:'flex',
    flexDirection:'column',
    alignItems: 'center',
    justifyContent: 'center'
},

text = {	
    fontFamily: '"Helvetica Neue", arial, sans-serif',
    fontWeight: 400,
    color: '#444',
    fontSize:'12px'
},

buttonBar = {
    width:'150px',
    height:'40px',
    borderRadius:'2px',
    margin:'5px',
    marginLeft:'0px',
    cursor:'pointer',
    ...text,...center,
    fontSize:'14px',
    color:'white',
    backgroundColor:'grey'
}

export default App