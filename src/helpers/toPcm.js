// import verb_url from '../verb.wav'

export function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
};

const get_verb_array_buffer = async() =>{
    const res = await fetch(verb_url)
    return await res.arrayBuffer()
}

export const make_verb_array_buffer = ( {ctx, duration=1.5, decay=2.0, reverse=false} ) => {
    var sampleRate = ctx.sampleRate;
    var length = sampleRate * duration;
    var impulse = ctx.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++){
        var n = reverse ? length - i : i;
        impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
        impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
}


export const play = async({state,setPlaying}) => new Promise(async(res,rej)=>{
    var data = state.uploads.find(x=>x.note==state.selectedNote.note.note && x.bank==state.selectedNote.bank)
    if(data == undefined || data.fileHandle == undefined){
        setPlaying(false)
        return res(null)
    }
    var f = data.fileHandle
    var distLevel = parseInt(data.dist) || 0
    var verb_gain_value = parseFloat(data.verb_gain) || 0
    var playbackRate = semitones_to_float(parseInt(data.pitchShift || 0))
    console.log("playback rate : " + playbackRate)
    console.log(typeof playbackRate)
    var input_reader = new FileReader();
    input_reader.onload = async(e) => {
        var ctx = new AudioContext({sampleRate:44100});
        var src = ctx.createBufferSource()
        var dist = ctx.createWaveShaper()
        dist.curve = makeDistortionCurve(distLevel/10)
        dist.oversample=('4x')
        var verb = ctx.createConvolver()
        // var verb_array = Uint8Array.from(atob(verb_data), c => c.charCodeAt(0))
        // var verb_data_buffer = await ctx.decodeAudioData(verb_array.buffer)

        // var verb_array_buffer = await get_verb_array_buffer()
        // var verb_data_buffer = await ctx.decodeAudioData(verb_array_buffer)
        
        var verb_data_buffer = make_verb_array_buffer({ctx})

        verb.buffer = verb_data_buffer
        var verb_gain = ctx.createGain()
        src.buffer = await ctx.decodeAudioData(e.target.result);
        src.connect(verb)
        src.connect(dist)
        verb.connect(verb_gain)
        verb_gain.gain.value = verb_gain_value / 100
        verb_gain.connect(ctx.destination)
        dist.connect(ctx.destination)
        src.playbackRate.value = playbackRate
        src.onended=()=>setPlaying(null)
        src.start()
        res(src)
    }
    input_reader.readAsArrayBuffer(f);
})

var semitones_to_float = semitones => {
    const semitone_ratio = Math.pow(2,1/12)
    return Math.pow(semitone_ratio, semitones)
}

export const toPcmFX = async({fileHandle:f,pitch,dist,verb}) => new Promise(async(res,rej)=>{
    // var data = state.uploads.find(x=>x.note==state.selectedNote.note.note && x.bank==state.selectedNote.bank)
    // if(data == undefined || data.fileHandle == undefined){
    //     return res(null)
    // }
    // var f = data.fileHandle
    // var distLevel = parseInt(data.dist) || 0
    // var verb_gain_value = parseFloat(data.verb_gain) || 0
    var playbackRate = semitones_to_float(pitch)
    var reverb_length = 1
    var input_reader = new FileReader();
    input_reader.onload = async(e) => {
        var ctx = new AudioContext({sampleRate:44100});
        var buf1 = await ctx.decodeAudioData(e.target.result);
        var off_ctx = new OfflineAudioContext(
                2,
                // (buf1.length * (1/pitch)) + (44100 * reverb_length),
                (buf1.length * (1/playbackRate)) + (44100 * reverb_length),
                44100
            );
        var off_source = off_ctx.createBufferSource();
        off_source.playbackRate.value = playbackRate
        off_source.buffer = buf1

        var distortion = off_ctx.createWaveShaper()
        distortion.curve = makeDistortionCurve(dist/10)
        distortion.oversample=('4x')

        var reverb = off_ctx.createConvolver()
        // var verb_array = Uint8Array.from(atob(verb_data), c => c.charCodeAt(0))
        // var verb_data_buffer = await ctx.decodeAudioData(verb_array.buffer)

        var reverb_data_buffer = make_verb_array_buffer({ctx})
        reverb.buffer = reverb_data_buffer


        var reverb_gain = off_ctx.createGain()
        reverb_gain.gain.value = verb / 100

        off_source.connect(reverb)
        off_source.connect(distortion)
        reverb.connect(reverb_gain)
        reverb_gain.connect(off_ctx.destination)
        distortion.connect(off_ctx.destination)

        off_source.start(0)
        off_ctx.oncomplete = e => {
            var buf2 = e.renderedBuffer
            var audio_blob = bufferToPcmStereo(buf2, 0, buf2.length)
            var file = new File([audio_blob],'noName')
            res(file)
        }
        off_ctx.startRendering()
    }
    input_reader.readAsArrayBuffer(f);
})

export const toPcm = f => new Promise((res,rej)=>{
    var input_reader = new FileReader();
    input_reader.onload = async(e) => {
        var ctx = new AudioContext({sampleRate:44100});
        var audio_buffer = await ctx.decodeAudioData(e.target.result);
        console.log("audio_buffer is " + audio_buffer.length + " samples")
        console.log("and " + audio_buffer.numberOfChannels + " channels")
        var audio_blob;
        if(audio_buffer.numberOfChannels == 1){
            audio_blob = bufferToPcmMono(audio_buffer, 0, audio_buffer.length);
        } else if(audio_buffer.numberOfChannels == 2){
            audio_blob = bufferToPcmStereo(audio_buffer, 0, audio_buffer.length);
        } else {
            rej("file has " + audio_buffer.numberOfChannels + " channels, must be mono or stereo")
        }
        var file = new File([audio_blob],'noName')
        res(file);
    }
    input_reader.readAsArrayBuffer(f);
})

var bufferToPcmStereo = (abuffer, offset, len) => {
    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        pos = 0;
    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // update data chunk
        pos += 2;
        }
        offset++                                     // next source sample
    }
    return new Blob([buffer], {type: "audio/wav"});
}

var bufferToPcmMono = (abuffer, offset, len) => {
    var length = len * 2 * 2,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        sample,
        pos = 0;

    var channel = abuffer.getChannelData(0);

    while(pos < length) {
        sample = Math.max(-1, Math.min(1, channel[offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // update data chunk
        pos += 2;
        view.setInt16(pos, sample, true);          // update data chunk
        pos += 2;
        offset++                                     // next source sample
    }
    return new Blob([buffer], {type: "audio/wav"});
}
