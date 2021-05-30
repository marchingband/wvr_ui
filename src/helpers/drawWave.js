// buff is an AudioBuffer

export const drawWave = ({ctx,filehandle,width,height}) => {
   var context = ctx
   var input_reader = new FileReader();
   input_reader.onload = async(e) => {
      var ctx = new AudioContext({sampleRate:44100});
      var buff = await ctx.decodeAudioData(e.target.result);
      draw({buff,context,width,height})
   }
   input_reader.readAsArrayBuffer(filehandle);
}

const draw = ({buff,context,width,height}) => {
   var canvasHeight = height
   var canvasWidth = width

   var drawLines = 500;
   var leftChannel = buff.getChannelData(0); // Float32Array describing left channel     
   context.save();
   context.clearRect(0,0,canvasWidth,canvasHeight)
   context.strokeStyle = '#46a0ba';
   context.globalCompositeOperation = 'lighter';
   context.translate(0,canvasHeight / 2);
   context.lineWidth=1;
   var totallength = leftChannel.length;
   var eachBlock = Math.floor(totallength / drawLines);
   var lineGap = (canvasWidth/drawLines);

   context.beginPath();
   for(var i=0;i<=drawLines;i++){
      var audioBuffKey = Math.floor(eachBlock * i);
       var x = i*lineGap;
       var y = leftChannel[audioBuffKey] * canvasHeight / 2;
       context.moveTo( x, y );
       context.lineTo( x, (y*-1) );
   }
   context.stroke();
   context.restore();
}