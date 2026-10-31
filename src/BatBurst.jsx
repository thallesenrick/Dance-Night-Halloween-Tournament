import React,{useEffect,useState} from 'react';
import './bat-burst.css';
const random=(min,max)=>min+Math.random()*(max-min);
const round=value=>Math.round(value*10)/10;
function makeBats(width,height){
 return Array.from({length:14},(_,i)=>{
  const start={x:(i+random(.15,.85))/14*width,y:height+random(65,140)};
  const middle={x:Math.max(-width*.1,Math.min(width*1.1,start.x+random(-width*.35,width*.35))),y:height*random(.38,.63)};
  const exit=Math.random();
  const end=exit<.2?{x:-120,y:height*random(.03,.3)}:exit>.8?{x:width+120,y:height*random(.03,.3)}:{x:width*random(.02,.98),y:-130};
  const control1={x:start.x+random(-width*.14,width*.14),y:height*random(.74,.9)};
  const control2={x:middle.x+random(-width*.1,width*.1),y:middle.y+height*random(.12,.22)};
  // Reflect the preceding control point so the two Bézier curves meet smoothly.
  const control3={x:middle.x*2-control2.x,y:middle.y*2-control2.y};
  const control4={x:end.x+random(-width*.12,width*.12),y:end.y+height*random(.18,.32)};
  const point=p=>`${round(p.x)} ${round(p.y)}`;
  return {path:`path("M${point(start)} C${point(control1)} ${point(control2)} ${point(middle)} C${point(control3)} ${point(control4)} ${point(end)}")`,size:random(35,73),duration:random(3.1,4.35),delay:random(0,.65),flap:random(.17,.29),phase:random(-.5,0),bank:random(.7,1.15),color:i%5===0?'#8e668f':i%3===0?'#35213f':'#17111d'};
 });
}
function makeSparkles(width,height){
 return Array.from({length:30},(_,i)=>({x:(i%6+random(.12,.88))/6*width,y:(Math.floor(i/6)+random(.1,.9))/5*height,size:random(22,40),delay:random(.05,.95),duration:random(1.25,2.1),turn:random(-25,25),color:['#f5b800','#ffd43b','#ffca0a'][i%3]}));
}
function BatShape(){return <svg viewBox="0 0 160 100" fill="currentColor"><g className="bat-wing"><path d="M80 44C61 25 35 13 6 8C16 29 13 43 3 56C23 45 36 50 43 70C55 57 66 63 80 85Z"/></g><g transform="translate(160 0) scale(-1 1)"><g className="bat-wing bat-wing-right"><path d="M80 44C61 25 35 13 6 8C16 29 13 43 3 56C23 45 36 50 43 70C55 57 66 63 80 85Z"/></g></g><path d="M70 39L70 20L79 36L90 20L90 39C97 53 91 76 80 88C69 76 63 53 70 39Z"/><circle cx="76" cy="45" r="1.7" fill="#eac2d4" stroke="none"/><circle cx="84" cy="45" r="1.7" fill="#eac2d4" stroke="none"/></svg>}
function SparkleShape(){return <svg viewBox="0 0 64 64" fill="none"><path d="M30 3C32.2 21.2 37.4 26.8 55 29C37.4 31.2 32.2 36.8 30 55C27.8 36.8 22.6 31.2 5 29C22.6 26.8 27.8 21.2 30 3Z" fill="currentColor" stroke="#ba8100" strokeWidth=".6"/><path d="M30 15C31.2 24.1 34.1 27.8 43 29C34.1 30.2 31.2 33.9 30 43C28.8 33.9 25.9 30.2 17 29C25.9 27.8 28.8 24.1 30 15Z" fill="#fff36b"/><path d="M14 13L19 18M41 40L47 46M14 45L19 40M42 17L47 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M53 5L54.6 11.4L61 13L54.6 14.6L53 21L51.4 14.6L45 13L51.4 11.4Z" fill="currentColor"/><path d="M10 48L11.3 53.7L17 55L11.3 56.3L10 62L8.7 56.3L3 55L8.7 53.7Z" fill="currentColor"/><circle cx="54" cy="48" r="2" fill="#ffd928"/><circle cx="6" cy="14" r="1.3" fill="#ffd928"/></svg>}
export default function BatBurst({kind='bats',onDone}){
 const [particles]=useState(()=>kind==='sparkles'?makeSparkles(window.innerWidth,window.innerHeight):makeBats(window.innerWidth,window.innerHeight));
 useEffect(()=>{const timer=setTimeout(onDone,kind==='sparkles'?3500:5400);return()=>clearTimeout(timer)},[kind,onDone]);
 if(kind==='sparkles')return <div className="theme-particles sparkle-burst" aria-hidden="true">{particles.map((p,i)=><span key={i} className="theme-sparkle" style={{left:p.x,top:p.y,width:p.size,'--sparkle-delay':`${p.delay}s`,'--sparkle-duration':`${p.duration}s`,'--sparkle-turn':`${p.turn}deg`,color:p.color}}><SparkleShape/></span>)}</div>;
 return <div className="theme-particles bat-burst" aria-hidden="true">{particles.map((p,i)=><span className="bat-flight" key={i} style={{width:p.size,height:p.size*.625,offsetPath:p.path,'--bat-delay':`${p.delay}s`,'--bat-duration':`${p.duration}s`,'--bat-flap':`${p.flap}s`,'--bat-phase':`${p.phase}s`,'--bat-bank':`${p.bank}s`,color:p.color}}><span className="bat-body"><BatShape/></span></span>)}</div>;
}

