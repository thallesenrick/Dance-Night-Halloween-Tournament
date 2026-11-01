// A quiet mechanical ratchet, synthesized locally with the same easing as the disc.
const cubic=(first,second,t)=>3*(1-t)**2*t*first+3*(1-t)*t*t*second+t*t*t;
function tickTime(progress){
 let low=0,high=1;
 for(let i=0;i<24;i++){const middle=(low+high)/2;if(cubic(.015,1,middle)<progress)low=middle;else high=middle}
 return cubic(.22,.08,(low+high)/2);
}
export function startRouletteSound(durationMs=5200){
 const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!Audio)return()=>{};
 let context,source,timer,stopped=false;
 const stop=()=>{
  if(stopped)return;stopped=true;clearTimeout(timer);
  try{source?.stop()}catch{}
  if(context&&context.state!=='closed')try{const closing=context.close();closing?.catch(()=>{})}catch{}
 };
 try{
  context=new Audio();
  // Resume inside the original click, so Android's autoplay policy can unlock audio.
  context.resume().catch(stop);
  const seconds=Number.isFinite(durationMs)&&durationMs>0?durationMs/1000:5.2,start=context.currentTime+.01,end=start+seconds;
  const master=context.createGain();master.gain.value=.4;master.connect(context.destination);
  source=context.createBufferSource();source.loop=true;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*.3),context.sampleRate),samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  source.buffer=buffer;
  const clickFilter=context.createBiquadFilter();clickFilter.type='bandpass';clickFilter.frequency.value=1700;clickFilter.Q.value=.85;
  const clicks=context.createGain();clicks.gain.setValueAtTime(.0001,start);source.connect(clickFilter);clickFilter.connect(clicks);clicks.connect(master);
  const times=Array.from({length:72},(_,i)=>start+tickTime(i/72)*seconds);
  times.forEach((time,index)=>{
   const next=times[index+1]??end,length=Math.min(.018,(next-time)*.7),level=.34+.09*Math.sin(index*1.7)**2;
   clicks.gain.setValueAtTime(.0001,time);clicks.gain.linearRampToValueAtTime(level,time+.001);clicks.gain.exponentialRampToValueAtTime(.0001,time+length);
  });
  const motorFilter=context.createBiquadFilter();motorFilter.type='lowpass';motorFilter.Q.value=.5;
  motorFilter.frequency.setValueAtTime(950,start);motorFilter.frequency.linearRampToValueAtTime(1550,start+seconds*.12);motorFilter.frequency.exponentialRampToValueAtTime(260,end);
  const motor=context.createGain();motor.gain.setValueAtTime(.0001,start);motor.gain.linearRampToValueAtTime(.04,start+.06);motor.gain.setValueAtTime(.03,start+seconds*.7);motor.gain.exponentialRampToValueAtTime(.0001,end);
  source.connect(motorFilter);motorFilter.connect(motor);motor.connect(master);
  master.gain.setValueAtTime(.4,start);master.gain.setValueAtTime(.4,end-.04);master.gain.linearRampToValueAtTime(0,end);
  source.onended=stop;source.start(start);source.stop(end);timer=setTimeout(stop,seconds*1000+100);
  return stop;
 }catch{stop();return()=>{}}
}
