export const analyzeWav = async (filehandle) => {
    return new Promise (async (res,rej)=>{
        var input_reader = new FileReader();
        input_reader.onload = async(e) => {
            var ctx = new AudioContext({sampleRate:44100});
            var buff = await ctx.decodeAudioData(e.target.result);
            var leftChannel = buff.getChannelData(0); // Float32Array describing left channel
            var length = leftChannel.length;
            res(length)
        }
        input_reader.readAsArrayBuffer(filehandle);
    })
}