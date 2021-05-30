import React from 'react';
import uuid from 'uuid';
import axios from 'axios';

class App extends React.Component {
  constructor(props){
    super(props)
    this.state={
      points:[],
      count:0
    }
  }
  componentDidMount(){
    const ws = new WebSocket('ws://'+location.hostname+':3600/')
    ws.onmessage=m=>{
      console.log(m.data)
      this.setState({count:m.data})
    }
  }
  render(){
  return (
    <div className="App">
        {/* <Fader range={500}/> */}
        <Shells count={this.state.count}/>
    </div>
  )};
}

export default App;

const notesLUT = {
  one:{voice:0,note:40},
  two:{voice:0,note:41},
  three:{voice:0,note:42},
  four:{voice:0,note:43},
  five:{voice:0,note:44},
  six:{voice:0,note:45},
}

class Shells extends React.Component{
  constructor(props){
    super(props)
    this.state={
      fileHandles:{},
      progress:0,
      uploading:false,
      uploadFileName:'',
      uploadFailed:false,
      loadingJSON:true,
      fs:[],
      fileNames:[]
    }
  }
  async componentDidMount(){
    await this.refreshFS()
    this.setState({loadingJSON:false})
  }
  render(){
    const { fileNames, loadingJSON, uploading } = this.state
    if(loadingJSON){
      return(
          <Overlay name="DOWNLOADING FILE DATA" progress={this.state.progress}/>
      )
    }
    return(
      <div style={{padding:50}}>
        <h1>WELCOME TO THE SHELLS CONTROL PANEL</h1>
        <h1>{'count: '+this.props.count}</h1>
        <Ota uploadFirmware={this.uploadFirmware}/>
        <div
          style={{
            width:900,height:600,border:'2px solid black',display:'flex',
            flexDirection:'column',justifyContent:'space-evenly',backgroundColor:'#FEFAF3'
          }}
        >
          {
            uploading && <Overlay name={"UPLOADING " + this.state.uploadFileName} progress={this.state.progress}/>
          }
          <div style={{display:'flex',flexDirection:'row',justifyContent:'space-evenly'}}>
            <Pad id={'one'} filename={fileNames[0]} onSelectFile={this.onSelectFile} onClickPlay={this.onClickPlay}/>
            <Pad id={'two'} filename={fileNames[1]} onSelectFile={this.onSelectFile} onClickPlay={this.onClickPlay}/>
            <Pad id={'three'} filename={fileNames[2]} onSelectFile={this.onSelectFile} onClickPlay={this.onClickPlay}/>
          </div>
          <div style={{display:'flex',flexDirection:'row',justifyContent:'space-evenly'}}>
            <Pad id={'four'} filename={fileNames[3]} onSelectFile={this.onSelectFile} onClickPlay={this.onClickPlay}/>
            <Pad id={'five'} filename={fileNames[4]} onSelectFile={this.onSelectFile} onClickPlay={this.onClickPlay}/>
            <Pad id={'six'} filename={fileNames[5]} onSelectFile={this.onSelectFile} onClickPlay={this.onClickPlay}/>
          </div>
        </div>
        <div
          style={{
            width:100,height:30,border:'1px solid black',marginTop:10,
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer'
          }}
          onClick={async ()=>{
            this.uploadFiles()
          }}
        >
          UPLOAD
        </div>
      </div>
    )
  }
  uploadFirmware = async({filename,fileHandle})=>{
    this.setState({uploading:true})
    await axios({
      method:'post',
      url:'/addfirmware',
      data: fileHandle,
      headers: {
        file: JSON.stringify({filename})
      },
      onUploadProgress: (p) => {
        const progress = (p.loaded / p.total * 100).toFixed(0)
        this.setState({progress}) 
      }
    }).catch(e=>{
      console.log(e);
      this.setState({uploadFailed:true})
      alert('File Uplaod Failed \n' + e )
    })
    this.setState({uploading:false})
  }
  refreshFS = async()=> {
    const res = await axios({
      method:'get',
      url:'/fsjson',
      responseType: 'json',
      onDownloadProgress:p=>{
        const progress = (p.loaded / p.total * 100).toFixed(0)
        this.setState({progress}) 
      }
    }).catch(e=>{
      console.log(e);
      this.setState({loadingJSON:false})
      alert('Failed to fetch file data from Waver\n' + e )
    })
    console.log(res.data)
    if(res && res.data){
      this.setState({fs:res.data[0]})
    }
    var fileNames=[];
    Object.keys(notesLUT).forEach((x,i)=>{
      fileNames[i]=res.data[0][notesLUT[x].note].name
    })
    this.setState({fileHandles:{},fileNames})
  }
  onClickPlay = id => {
    const {fileSystem} = this.state
    if(!fileSystem[id]){
      console.log('no file data')
      return
    }
    const {size, startPage} = fileSystem[id]
    fetch(
      '/shellsplay',
      {
        method: 'POST',
        headers:{
          file:JSON.stringify({size,startPage})
        }
      })
    .catch(e=>console.log(e))
  }
  onSelectFile = (fileHandle,id) => {
    var {fileHandles,fileNames} = this.state
    fileHandles[id] = fileHandle
    var index;
    Object.keys(notesLUT).forEach((x,i)=>{
      if(x==id){
        fileNames[i]=fileHandle.name
      }
    })
    this.setState({fileHandles,fileNames})
  }
  uploadFiles = async() => {
    this.setState({uploading:true})
    var fileHandles = this.state.fileHandles    
    for(let id of Object.keys(fileHandles)){
      var {name,size} = fileHandles[id];
      name = name.split('.')[0].substring(0,18);
      const {voice,note} = notesLUT[id];
      this.setState({uploadFileName:name})
      await axios({
        method:'post',
        url:'/addwav',
        data: fileHandles[id],
        headers: {
          file: JSON.stringify({size,name,voice,note})
        },
        onUploadProgress: (p) => {
          const progress = (p.loaded / p.total * 100).toFixed(0)
          this.setState({progress}) 
        }
      }).catch(e=>{
        console.log(e);
        this.setState({uploadFailed:true})
        alert('File Uplaod Failed \n' + e )
      })
    }
    this.setState({loadingJSON:true})
    await this.refreshFS()
    this.setState({uploading:false,loadingJSON:false})
  }
}

const Overlay = ({name='',progress=0}) =>
  <div
    style={{
      position:'absolute',width:'100%',height:'100%',top:0,left:0,zIndex:100,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
    }}
  >
    <div
      style={{position:'absolute',width:'100%',height:'100%',top:0,left:0,backgroundColor:'white',opacity:0.8}}
    />
    <div
      style={{
        border:'3px solid black', padding:50, backgroundColor:'white',zIndex:110,
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'
      }}
    >
      <div>
        {name}
      </div>
      <div>
        {"PROGRESS : " + progress + '%'}
      </div>
    </div>
  </div>

class Pad extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return(
      <div
        style={{
          width:260,height:260,border:'3px solid gray',display:'flex',
          justifyContent:'center',alignItems:'center',flexDirection:'column',
          backgroundColor:'#FFFCF8',cursor:'pointer'
        }}
        onClick = {()=>this.uploadInput.click()}
      >
        <input 
          ref={i=>this.uploadInput=i}
          type="file" 
          onChange={e=>{
            this.props.onSelectFile(e.target.files[0],this.props.id)
            // this.setState({
            //   fileName: e.target.files[0].name,
            //   fileHandle: e.target.files[0]
            // })
          }}
          style={{display:'none'}}
        />
        <div>
          {this.props.filename || "No FIle Selected"}
        </div>
        <div
          style={{
            width:100,height:30,border:'1px solid black',marginTop:10,
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer'
          }}
          onClick={e=>{
            e.stopPropagation()
            this.props.onClickPlay(this.props.id)
          }}
          >
            PLAY
        </div>
      </div>
    )
  }
}

class Ota extends React.Component{
  constructor(props){
    super(props)
    this.state={
      filename:'',
      fileHandle:undefined
    }
  }
  render(){
    return(
      <div
        style={{
          width:360,height:40,border:'3px solid gray',display:'flex',
          justifyContent:'center',alignItems:'center',flexDirection:'row',
          backgroundColor:'#FFFCF8'
        }}
      >
        <input 
          ref={i=>this.uploadInput=i}
          type="file" 
          onChange={e=>{
            this.setState({
              filename: e.target.files[0].name,
              fileHandle: e.target.files[0]
            })
          }}
          style={{display:'none'}}
        />
        <div
          style = {{border:'1px solid black',cursor:'pointer'}}
          onClick = {()=>this.uploadInput.click()}
        >
          {this.state.filename || "Select OTA .bin file"}
        </div>
        <div 
          style={{border:'1px solid black',cursor:'pointer'}}
          onClick={()=>{
            const {fileHandle,filename} = this.state
            if(fileHandle == undefined || filename == ''){
              return
            }
            this.props.uploadFirmware({fileHandle,filename})
          }}
        >
          UPLOAD
        </div>
      </div>
    )
  }
}

class Picker extends React.Component{
  constructor(props){
    super(props)
    this.state={
      fileName:'',
      fileHandle:null
    }
  }
  render(){
    return(
      <div
        style={{
          height:20,width:100,border:'1px solid blue',position:'absolute',
          left:30,top:20+this.props.position
        }}
        onClick = {()=>this.uploadInput.click()}
      >
        <input 
          ref={(ref) => { this.uploadInput = ref; }} 
          type="file" 
          onChange={e=>{
            console.log(e.target.files[0])
            console.log("name")
            console.log(e.target.files[0].name)
            this.setState({fileName:e.target.files[0].name})
          }}
          style={{display:'none'}}
        />
          {this.state.fileName}
      </div>
    )
  }
}

class Point extends React.Component{
  constructor(props){
    super(props)
    this.state={
      val:       0,
      lastVal:   0,
      inDrag :   false,
      dragStart: 0,
    }
  }
  render(){return(
    <div>
      <div 
        style={{
          height:5,width:10,border:'1px solid blue',position:'absolute',
          left:15,top:20+this.state.val,backgroundColor:this.props.selected?'red':'white'
        }}
        onMouseDown={this.handleMouseDown} 
      >
        <div style={{transform:'translate(50px,-8px)',userSelect:'none'}}>{((this.state.val*127)/this.props.max).toFixed(0)}</div>
      </div>
    </div>
  )}
  handleMouseDown=e=>{
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    let lastVal = this.state.val
    this.setState({
      inDrag: true,
      dragStart: e.clientY,
      lastVal: lastVal,
    });
    this.props.setSelected && this.props.setSelected(this.props.id)
  };
  handleMouseMove=e=>{
    if(this.state.inDrag){
      let drag = e.clientY - this.state.dragStart
      let val = Math.max(0,Math.min(this.props.max,(this.state.lastVal+drag)))
      this.props.onChange && this.props.onChange(val,this.props.id)
      this.setState({val})
    }
  }
  handleMouseUp=e=>{
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.setState({isDragging: false});
  }
}

class Fader extends React.Component{
  constructor(){
    super()
    this.state={
      points:[],
      selected:0,
    }
  }
  render(){return(
    <div style={{padding:20}}>
      <div style={{width:40,height:this.props.range+40,border:'1px solid red',position:'relative'}}>
        <div style={{height:this.props.range,width:0,border:'0px solid green',borderLeftWidth:1,position:'absolute',left:20,top:20}}/>
        {
          this.state.points.map((x,i)=>
            <Point 
              key={x.id}
              id={x.id}
              selected={this.state.selected==x.id} 
              setSelected={this.setSelected}
              max={this.props.range}
              onChange={this.onChange}
            />)
        }
        {
          this.calculatePickers([...this.state.points]).map(x=>
            <Picker
              position={x}
              key={uuid()}
            />
            )
        }
      </div>
      <div
        style={{height:40,width:40,border:'1px solid blue'}}
        onClick = {()=>{
          var newPoint = {val:0, id:uuid()}
          var points = [...this.state.points, newPoint]
          this.setState({points})
        }}
      >
        new
      </div>
      <div
        style={{height:40,width:40,border:'1px solid blue'}}
        onClick={()=>{
          var points = [...this.state.points].filter(x=>x.id != this.state.selected)
          this.setState({points})
        }}
      >
        remove
      </div>

    </div>
  )}
  setSelected=x=>this.setState({selected:x})
  onChange=(val,id)=>{
    const points = [...this.state.points]
    points.filter(x=>x.id==id)[0].val=val
    // newPoint.val=val
    // const newPoints = [...points.filter(x=>x.id!=id),newPoint]
    this.setState({points})
  }
  calculatePickers=points=>{
    var pickers = []
    if(points.length<2){
      return pickers
    }
    const vals = points.map(x=>x.val).sort((a,b)=>a-b)
    for(var i=0;i<(points.length-1);i++){
      const a = vals[i]
      const b = vals[i+1]
      const val = ((b-a) / 2) + a
      pickers.push(val)
    }
    return pickers
  }
}