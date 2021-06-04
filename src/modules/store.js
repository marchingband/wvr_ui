import {observable, configure, toJS} from 'mobx'
import {themes} from './themes.js'
import {WAV_ITEM_SIZE} from './constants'
import {clamp} from '../helpers/clamp.js'
import {makeName} from '../helpers/makeName'
import {defaultVoices, defaultPinConfig, defaultMetadata} from '../helpers/makeDefaultStores'

configure({
    enforceActions: "never",
})

export const store = observable(
    {
        view:'home',
        theme:themes.dark,

        loading:false,
        setLoading:function(x){this.loading=x},
        loadProgress:0,
        loadingTitle:"",
        configNeedsUpdate:false,

        numWavPerPage:6,
        currentVoice:0,

        wavBoardIndex:40,
        wavBoardSelected:40,
        rackBoardIndex:0,
        rackBoardSelected:0,
        pinConfigSelected:0,
        currentFirmwareIndex:-1,
        currentWebsiteIndex:-1,

        voices:defaultVoices(),
        // config:defaultConfig(),
        firmwares:observable([]),
        websites:observable([]),
        pinConfig:observable(defaultPinConfig),
        metadata:observable(defaultMetadata),

        getVoices:function(){
            return toJS(this.voices)
        },
        getMetadata:function(){
            return toJS(this.metadata)
        },

        onConnect:function(data){onConnect(this,data)},
        onProgress:function(p){onProgress(this,p)},
        scrollWavBoard:function(right){scrollWavBoard(this,right)},
        scrollRackBoard:function(right){scrollRackBoard(this,right)},
        handleResize:function(){handleResize(this)},
        setCurrentVoiceProp:function(prop,val){setCurrentVoiceProp(this,prop,val)},
        convertCurrentToRack:function(){convertCurrentToRack(this)},
        convertCurrentToNonRack:function(){convertCurrentToNonRack(this)},
        setBreakPoint:function(i,val){setBreakPoint(this,i,val)},
        setRackNumLayers:function(x){setRackNumLayers(this,x)},
        setRackName:function(x){setRackName(this,x)},
        getNote:function(voice,note){return getNote(this,voice,note)},
        getCurrentNote:function(){return getCurrentNote(this)},
        getRackBreakPoint:function(i){return getRackBreakPoint(this,i)},
        getRackLayer:function(i){return getRackLayer(this,i)},
        getCurrentRackLayer:function(){return getCurrentRackLayer(this)},
        setCurrentRackFile:function(f){setCurrentRackFile(this,f)},
        setCurrentWavFile:function(f){setCurrentWavFile(this,f)},
        getCurrentPin:function(){return getCurrentPin(this)},
        getPinConfig:function(){return getPinConfig(this)},
        setCurrentPinProp:function(prop,val){setCurrentPinProp(this,prop,val)},
        setCurrentNoteProp:function(prop,val){setCurrentNoteProp(this,prop,val)},
        setMetadataField:function(prop,val){setMetadataField(this,prop,val)},
        noteOn:function(voice, note){noteOn(this,voice,note)},
        noteOff:function(voice, note){noteOff(this,voice,note)},
    }
)

const onConnect = (self,data) => {
    const voices = toJS(self.voices)
    // keep the fx vars by merging the objects
    const newVoices = voices.map((v,i)=>
        v.map((n,ni)=>(
            {
                ...n,
                ...data.voices[i][ni]
            }
        ))
    )
    self.voices.replace(newVoices)
    self.firmwares.replace(data.firmwares)
    self.websites.replace(data.websites)
    self.pinConfig.replace(data.pinConfig)
    self.metadata = data.metadata
    self.currentFirmwareIndex = data.currentFirmwareIndex
    self.currentWebsiteIndex = data.currentWebsiteIndex
}

const onProgress = (self,p) => {
    const percent = (p.loaded / p.total * 100).toFixed(0)
    // console.log(percent)
    if(percent==100){
        self.loading = false
        self.loadProgress = 0
        self.loadingTitle = ""
        return
    }
    self.loadProgress = percent
}

const scrollWavBoard = (self,right) =>
    self.wavBoardIndex = right ?
        Math.min(128 - self.numWavPerPage,self.wavBoardIndex + self.numWavPerPage) :
        Math.max(0,self.wavBoardIndex - self.numWavPerPage)

const scrollRackBoard = (self,right) => {
    const { num_layers } = self.voices.slice()[self.currentVoice][self.wavBoardIndex].rack
    self.rackBoardIndex = right ?
        clamp(self.rackBoardIndex + self.numWavPerPage, 0, num_layers - self.numWavPerPage) :
        clamp(self.rackBoardIndex - self.numWavPerPage, 0, num_layers - self.numWavPerPage)
}

const handleResize = self => 
    self.numWavPerPage = Math.floor((window.innerWidth-120) / WAV_ITEM_SIZE)

const setCurrentVoiceProp = (self,prop,val) => {
    const voices = self.voices.slice()
    voices[self.currentVoice][self.wavBoardSelected][prop] = val
    self.voices.replace(voices)
    self.configNeedsUpdate = true
}

const convertCurrentToRack = self => {
    const voices = self.voices.slice()
    voices[self.currentVoice][self.wavBoardSelected].isRack = -2 
    voices[self.currentVoice][self.wavBoardSelected].rack = {
        num_layers : 2,
        break_points : observable([0,50,127]),
        layers : observable([{name:'',size:0},{name:'',size:0}])
    }
    self.voices.replace(voices)
    self.configNeedsUpdate = true
}

const convertCurrentToNonRack = self => {
    const voices = self.voices.slice()
    voices[self.currentVoice][self.wavBoardSelected].isRack = -1
    self.voices.replace(voices)
    self.configNeedsUpdate = true
}

const setBreakPoint = (self,i,val) => {
    const voices = self.voices.slice()
    var break_points = voices[self.currentVoice][self.wavBoardSelected].rack.break_points.slice()
    break_points[i+1] = val
    voices[self.currentVoice][self.wavBoardSelected].rack.break_points.replace(break_points)
    self.configNeedsUpdate = true
}

const setRackNumLayers = (self,x) => {
    const voices = self.voices.slice()
    const layers = (Array(x).fill().map(()=>({
        file:undefined,
        name:"",
        size:0
    })))
    const break_points = Array(x+1).fill().map((_,b)=>
        b == 0 ? 0 : b==x ? 127 : Math.floor(b * (127 / x))
    )
    voices[self.currentVoice][self.wavBoardSelected].rack.layers.replace(layers)
    voices[self.currentVoice][self.wavBoardSelected].rack.break_points.replace(break_points)
    voices[self.currentVoice][self.wavBoardSelected].rack.num_layers = x
    self.voices.replace(voices)
    self.configNeedsUpdate = true
}

const setRackName = (self, name) =>{
    const voices = self.voices.slice()
    voices[self.currentVoice][self.wavBoardSelected].rack.name = name
    self.voices.replace(voices)
    self.configNeedsUpdate = true
}

const getNote = (self,voice,note) => self.voices.slice()[voice][note]

const getCurrentNote = self => self.voices.slice()[self.currentVoice][self.wavBoardSelected]

const getRackBreakPoint = (self,i) => {
    const voices = self.voices.slice()
    if(
        !voices[self.currentVoice][self.wavBoardSelected].rack ||
        !voices[self.currentVoice][self.wavBoardSelected].rack.break_points
    ){
        return undefined
    }
    const num = voices[self.currentVoice][self.wavBoardSelected].rack.num_layers || 0
    if(i<0 || i > num) return undefined
    return voices[self.currentVoice][self.wavBoardSelected].rack.break_points.slice()[i] ||
    0
}

const getRackLayer = (self,i) => {
    const voices = self.voices.slice()
    if(
        !voices[self.currentVoice][self.wavBoardSelected].rack ||
        !voices[self.currentVoice][self.wavBoardSelected].rack.layers ||
        !voices[self.currentVoice][self.wavBoardSelected].rack.layers.slice()[i]
    ){
        // rackBoardSelected is too high for this notes layers
        self.rackBoardSelected = 0
        return ({name:"empty",size:0})
    } 
    return voices[self.currentVoice][self.wavBoardSelected].rack.layers.slice()[i]
}

const getCurrentRackLayer = self => {
    const voices = self.voices.slice()
    if(
        !voices[self.currentVoice][self.wavBoardSelected].rack ||
        !voices[self.currentVoice][self.wavBoardSelected].rack.layers ||
        !voices[self.currentVoice][self.wavBoardSelected].rack.layers.slice()[self.rackBoardSelected]
    ){
        self.rackBoardSelected = 0
        return ({name:"empty",size:0})
    } 
    return voices[self.currentVoice][self.wavBoardSelected].rack.layers.slice()[self.rackBoardSelected]
}

const setCurrentRackFile = (self,file) => {
    var newVoices = self.voices.slice()
    var newLayers  = newVoices[self.currentVoice][self.wavBoardSelected].rack.layers.slice()
    newLayers[self.rackBoardSelected].filehandle = file
    newLayers[self.rackBoardSelected].name = makeName(file.name)
    newLayers[self.rackBoardSelected].size = file.size
    newVoices[self.currentVoice][self.wavBoardSelected].rack.layers.replace(newLayers)
    store.voices.replace(newVoices)
    self.configNeedsUpdate = true
}

const setCurrentWavFile = (self,file) => {
    const voices = self.voices.slice()
    voices[self.currentVoice][self.wavBoardSelected].filehandle = file
    voices[self.currentVoice][self.wavBoardSelected].name = makeName(file.name)
    voices[self.currentVoice][self.wavBoardSelected].size = file.size
    self.voices.replace(voices)
    self.configNeedsUpdate = true
}

const getCurrentPin = self => self.pinConfig.slice()[self.pinConfigSelected]

const getPinConfig = self => toJS(self.pinConfig)

const setCurrentPinProp = (self,prop,val) => {
    const pins = self.pinConfig.slice()
    pins[self.pinConfigSelected][prop] = val
    self.pinConfig.replace(pins)
    self.configNeedsUpdate = true
}

const setCurrentNoteProp = (self,prop,val) => {
    // const voices = self.voices.slice()
    // voices[self.currentVoice][self.wavBoardSelected][prop] = val
    // self.voices.replace(voices)
    self.voices[self.currentVoice][self.wavBoardSelected][prop] = val
    self.configNeedsUpdate = true
}
const noteOn = (self, voice, note) => {
    // const voices = toJS(self.voices)
    self.voices[voice][note].playing = true
    // self.voices.replace(voices)
}
const noteOff = (self, voice, note) => {
    // const voices = toJS(self.voices)
    self.voices[voice][note].playing = false
    // self.voices.replace(voices)
}

const setMetadataField = (self, prop, val) => {
    self.metadata[prop] = val
    self.configNeedsUpdate = true
}