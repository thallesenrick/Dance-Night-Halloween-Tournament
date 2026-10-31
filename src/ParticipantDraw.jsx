import React,{useEffect,useId,useRef,useState} from 'react';
import {X} from 'lucide-react';
import './participant-draw.css';

const DURATION=4100;
const PHASES=['Preparando os papéis','Embaralhando os nomes','Revelando os slots'];
const TICKETS=[
 {x:172,y:59,rotate:-6},{x:102,y:96,rotate:-19},{x:252,y:87,rotate:17},
 {x:133,y:131,rotate:9},{x:267,y:132,rotate:-9},{x:209,y:112,rotate:9},
];

export default function ParticipantDraw({players=[],onComplete,onCancel}){
 const id=useId().replace(/:/g,'');
 const panel=useRef(null),cancelButton=useRef(null),frame=useRef(0),settled=useRef(false);
 const callbacks=useRef({onComplete,onCancel});
 callbacks.current={onComplete,onCancel};
 const [names]=useState(()=>players.slice(0,6).map((player,i)=>({id:player.id??i,name:player.name?.trim()||`Participante ${i+1}`})));
 const [count]=useState(players.length);
 const [progress,setProgress]=useState(0);
 const phase=progress<24?0:progress<84?1:2;

 const cancel=()=>{
  if(settled.current)return;
  settled.current=true;
  cancelAnimationFrame(frame.current);
  callbacks.current.onCancel?.();
 };

 useEffect(()=>{
  const start=performance.now();
  let stopped=false,lastPaint=-100;
  const tick=now=>{
   if(stopped||settled.current)return;
   const next=Math.min(100,(now-start)/DURATION*100);
   if(now-lastPaint>=32||next===100){setProgress(next);lastPaint=now}
   if(next===100){
    settled.current=true;
    callbacks.current.onComplete?.();
   }else frame.current=requestAnimationFrame(tick);
  };
  frame.current=requestAnimationFrame(tick);
  return()=>{stopped=true;cancelAnimationFrame(frame.current)};
 },[]);

 useEffect(()=>{
  const previous=document.activeElement;
  const previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  cancelButton.current?.focus();
  const keydown=event=>{
   if(event.key==='Escape'){
    event.preventDefault();
    if(!settled.current){settled.current=true;cancelAnimationFrame(frame.current);callbacks.current.onCancel?.()}
   }else if(event.key==='Tab'){
    // The cancel control is the only focusable element in this short dialog.
    event.preventDefault();
    cancelButton.current?.focus();
   }
  };
  document.addEventListener('keydown',keydown);
  return()=>{
   document.removeEventListener('keydown',keydown);
   document.body.style.overflow=previousOverflow;
   if(previous?.isConnected&&typeof previous.focus==='function')previous.focus();
  };
 },[]);

 return <div className="participant-draw-overlay">
  <section ref={panel} className={`participant-draw-card participant-draw-phase-${phase}`} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
   <button ref={cancelButton} className="participant-draw-cancel" type="button" aria-label="Cancelar sorteio" onClick={cancel}><X size={21} aria-hidden="true"/></button>
   <span className="participant-draw-kicker">QUE A SORTE ENTRE NA DANÇA ✦</span>
   <h2 id={`${id}-title`}>Sorteando participantes</h2>
   <p id={`${id}-description`} className="participant-draw-description">Um papel para cada pessoa. Um lugar na pista.</p>

   <div className="participant-draw-art" aria-hidden="true">
    <span className="participant-draw-count">{count} {count===1?'nome no saco':'nomes no saco'}</span>
    <svg className="participant-draw-bag" viewBox="0 0 460 320" fill="none">
     <defs>
      <linearGradient id={`${id}-bag`} x1="122" y1="162" x2="355" y2="280" gradientUnits="userSpaceOnUse"><stop stopColor="#ead4ad"/><stop offset=".49" stopColor="#d4b488"/><stop offset="1" stopColor="#b38a62"/></linearGradient>
      <linearGradient id={`${id}-side`} x1="108" y1="220" x2="156" y2="222" gradientUnits="userSpaceOnUse"><stop stopColor="#936b4c"/><stop offset="1" stopColor="#d5b88c"/></linearGradient>
      <pattern id={`${id}-paper`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 1H5M1 4H3" stroke="#5f3e28" strokeOpacity=".06" strokeWidth=".65"/></pattern>
     </defs>
     <ellipse cx="231" cy="298" rx="137" ry="10" fill="#503344" opacity=".13"/>
     <g className="participant-draw-sack">
      <path d="M106 141Q112 120 137 119L321 119Q348 120 355 142L347 186H115L106 141Z" fill="#c5a176" stroke="#805f47" strokeWidth="2"/>
      <ellipse cx="230" cy="141" rx="124" ry="24" fill="#694a43" stroke="#9c7652" strokeWidth="3"/>
      {names.map((player,i)=>{
       const ticket=TICKETS[i];
       const label=player.name.length>17?`${player.name.slice(0,16)}…`:player.name;
       return <g key={player.id} transform={`translate(${ticket.x} ${ticket.y}) rotate(${ticket.rotate} 55 23)`}>
        <g className="participant-draw-ticket" style={{'--ticket-delay':`${i*-.22}s`,'--ticket-turn':`${i%2?-7:7}deg`,'--ticket-lift':`${14+i%3*5}px`}}>
         <path d="M1 2L107 0L111 43L5 47L1 2Z" fill={i%3===1?'#efc8d9':'#fff1da'} stroke="#a98a72" strokeWidth="1"/>
         <path d="M12 34L99 31" stroke="#bd9f93" strokeWidth="1" strokeDasharray="2 3"/>
         <text x="55" y="23" textAnchor="middle" fill="#543847" fontFamily="'Courier New',monospace" fontSize={label.length>12?9:11} fontWeight="700">{label}</text>
         <circle cx="9" cy="10" r="2" fill="#b37d9e" opacity=".6"/>
        </g>
       </g>;
      })}
      <path d="M106 145L125 151L142 146L161 154L182 149L203 156L225 149L247 155L269 149L289 154L311 148L331 153L354 145Q341 178 342 206L349 271Q230 309 111 271L119 204Q121 177 106 145Z" fill={`url(#${id}-bag)`} stroke="#8b674c" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M106 145L125 151L146 192L137 263L111 271L119 204Q121 177 106 145Z" fill={`url(#${id}-side)`} opacity=".75"/>
      <path d="M331 153L317 197L328 271L349 271L342 206Q341 178 354 145L331 153Z" fill="#79533c" opacity=".18"/>
      <path d="M144 170L154 205L146 273M316 174L308 207L319 275M126 270Q230 293 333 270" stroke="#8f694b" strokeWidth="1.2" strokeDasharray="3 4" opacity=".6"/>
      <path d="M127 164Q228 181 334 164" stroke="#f5e6c8" strokeWidth="3" opacity=".55"/>
      <path d="M111 271Q230 309 349 271L342 206Q341 178 354 145L331 153L311 148L289 154L269 149L247 155L225 149L203 156L182 149L161 154L142 146L125 151L106 145Q121 177 119 204L111 271Z" fill={`url(#${id}-paper)`}/>
      <g transform="rotate(-6 230 223)">
       <path d="M177 197L282 195L284 248L179 251L177 197Z" fill="#f9ebd2" stroke="#b78973" strokeWidth="1"/>
       <path d="M186 204L274 203L275 241L187 243L186 204Z" stroke="#b57998" strokeWidth="1.5" strokeDasharray="4 2"/>
       <text x="231" y="220" textAnchor="middle" fill="#7e4d65" fontFamily="Georgia,serif" fontSize="14" fontWeight="700" letterSpacing="2">BOA</text>
       <text x="231" y="236" textAnchor="middle" fill="#7e4d65" fontFamily="Georgia,serif" fontSize="15" fontWeight="700" letterSpacing="1.4">SORTE!</text>
       <path d="M203 190L248 188L250 201L205 204L203 190Z" fill="#cb8eaca8"/>
      </g>
      <path d="M112 170C86 157 75 174 87 181C99 188 104 170 91 163M348 171C373 157 386 174 373 182C361 189 356 170 370 164" stroke="#8b674c" strokeWidth="3" strokeLinecap="round"/>
      <path d="M163 260L171 257M290 184L295 181M295 258L302 260M160 184L163 187" stroke="#fff0cc" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
     </g>
     <g className="participant-draw-doodle" stroke="#b9873d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M69 115L71 105L74 115L84 118L74 121L71 132L68 122L58 119L69 115Z"/><path d="M381 93L383 85L386 93L394 96L386 99L383 107L380 99L372 96L381 93Z"/><path d="M366 222L369 211M377 225L385 217M372 237L386 235"/></g>
    </svg>
   </div>

   <div className="participant-draw-progress-copy">
    <p className="participant-draw-phase" role="status" aria-live="polite" aria-atomic="true">{PHASES[phase]}<span className="participant-draw-dots" aria-hidden="true">…</span></p>
    <span className="participant-draw-percent" aria-hidden="true">{Math.floor(progress)}<small>%</small></span>
   </div>
   <div className="participant-draw-progress" role="progressbar" aria-label="Sorteio dos participantes" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress)} aria-valuetext={`${Math.floor(progress)}% — ${PHASES[phase]}`}>
    <span style={{transform:`scaleX(${progress/100})`}}/>
   </div>
   <div className="participant-draw-steps" aria-hidden="true">
    {['Papéis prontos','Misturando tudo','Cada um no seu slot'].map((label,i)=><span key={label} className={i<=phase?'is-active':''}><i/>{label}</span>)}
   </div>
  </section>
 </div>;
}
