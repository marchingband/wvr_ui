import { ws } from "../wvr/init";
import { store } from "../modules/store";

var midiAccess = null;  // global MIDIAccess object

function onMIDISuccess( midi ) {
  console.log( "MIDI ready!" );
  midiAccess = midi;  // store in the global (in real usage, would probably keep in an object instance)
  listInputsAndOutputs();
  startMidi()    
}

function onMIDIFailure(msg) {
  console.log( "Failed to get MIDI access - " + msg );
}

function listInputsAndOutputs() {
    var inputs = []
    for (var entry of midiAccess.inputs) {
      var input = entry[1];
      inputs.push(input.name)
      console.log( "Input port [type:'" + input.type + "'] id:'" + input.id +
        "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
        "' version:'" + input.version + "'" );
    }
  
    for (var entry of midiAccess.outputs) {
      var output = entry[1];
      console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
        "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
        "' version:'" + output.version + "'" );
    }
    
    console.log({inputs})
    store.midiInputs = inputs
}

function onMIDIMessage( event ) {
    // var str = "MIDI message received at timestamp " + event.timeStamp + "[" + event.data.length + " bytes]: ";
    // for (var i=0; i<event.data.length; i++) {
    //   str += "0x" + event.data[i].toString(16) + " ";
    // }
    // console.log( str );

    // since event.data is a typed array buffer, and since websockets can send 
    // raw array buffers natively, we can simply:
    ws.send(event.data)
    // isnt that a pleasant surprise?
}
  
function startMidi() {
    midiAccess.inputs.forEach(entry => entry.onmidimessage = onMIDIMessage);
}

const initWebMidi = async () => {
  if(!navigator.requestMIDIAccess){
    store.midiInputs = []
    console.log("MIDI Access forbidden - see WVR documentation to enable Web MIDI")
    return
  }
  try{
    navigator.requestMIDIAccess().then( onMIDISuccess, onMIDIFailure )
  } catch (e){
    store.midiInputs = []
    console.log("requestMIDIaccess Error " + e)
  }
}

module.exports = {initWebMidi}