import React,{useEffect,useId,useRef,useState} from 'react';
import {X} from 'lucide-react';
import './participant-draw.css';

const DURATION=4100;
const PHASES=['Preparando os papéis','Embaralhando os nomes','Revelando os slots'];
const TICKETS=[{x:172,y:59,rotate:-6},{x:102,y:96,rotate:-19},{x:252,y:87,rotate:17},{x:133,y:131,rotate:9},{x:267,y:132,rotate:-9},{x:209,y:112,rotate:9}];
const segmenter=new Intl.Segmenter('pt-BR',{granularity:'grapheme'});
const ticketLabel=name=>{const characters=[...segmenter.segment(name)].map(part=>part.segment);return characters.length>17?characters.slice(0,16).join('')+'…':name};

export default function ParticipantDraw({players=[],onComplete,onCancel}){
 const id=useId().replace(/:/g,'');
 const panel=useRef(null),cancelButton=useRef(null),frame=useRef(0),settled=useRef(false);
 const callbacks=useRef({onComplete,onCancel});callbacks.current={onComplete,onCancel};
 const [names]=useState(()=>players.slice(0,6).map((player,i)=>({id:player.id??i,name:player.name?.trim()||`Participante ${i+1}`})));
 const [count]=useState(players.length),[progress,setProgress]=useState(0);
 const phase=progress<24?0:progress<84?1:2;
 const cancel=()=>{if(settled.current)return;settled.current=true;cancelAnimationFrame(frame.current);callbacks.current.onCancel?.()};
 useEffect(()=>{
  const start=performance.now();let stopped=false,lastPaint=-100;
  const tick=now=>{
   if(stopped||settled.current)return;
   const next=Math.min(100,(now-start)/DURATION*100);
   if(now-lastPaint>=32||next===100){setProgress(next);lastPaint=now}
   if(next===100){settled.current=true;callbacks.current.onComplete?.()}else frame.current=requestAnimationFrame(tick);
  };
  frame.current=requestAnimationFrame(tick);
  return()=>{stopped=true;cancelAnimationFrame(frame.current)};
 },[]);
 useEffect(()=>{
  const previous=document.activeElement,previousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';cancelButton.current?.focus();
  const keydown=event=>{
   if(event.key==='Escape'){event.preventDefault();if(!settled.current){settled.current=true;cancelAnimationFrame(frame.current);callbacks.current.onCancel?.()}}
   else if(event.key==='Tab'){event.preventDefault();cancelButton.current?.focus()}
  };
  document.addEventListener('keydown',keydown);
  return()=>{document.removeEventListener('keydown',keydown);document.body.style.overflow=previousOverflow;if(previous?.isConnected)previous.focus()};
 },[]);
 return <div className="participant-draw-overlay"><section ref={panel} className={`participant-draw-card participant-draw-phase-${phase}`} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
  <img className="participant-draw-frame" src="/participant-draw-collage.png" alt="" aria-hidden="true"/>
  <button ref={cancelButton} className="participant-draw-cancel" type="button" aria-label="Cancelar sorteio" onClick={cancel}><X size={24} aria-hidden="true"/></button>
  <span className="participant-draw-kicker">QUE A SORTE ENTRE NA DANÇA ✦</span>
  <h2 id={`${id}-title`}>Sorteando <span>participantes</span></h2>
  <p id={`${id}-description`} className="participant-draw-description">Um papel para cada pessoa. Um lugar na pista. <span aria-hidden="true">♡</span></p>
  <div className="participant-draw-art" aria-hidden="true">
   <svg className="participant-draw-bag" viewBox="0 0 460 320" fill="none"><defs><clipPath id={`${id}-bag-front`}><path d="M84 149Q230 176 376 149L380 314H80Z"/></clipPath></defs>
    <g className="participant-draw-sack"><image href="/participant-draw-kraft.png" x="84" y="127" width="292" height="178" preserveAspectRatio="none"/>
     {names.map((player,i)=>{const ticket=TICKETS[i],label=ticketLabel(player.name);return <g key={player.id} transform={`translate(${ticket.x} ${ticket.y}) rotate(${ticket.rotate} 55 23)`}><g className="participant-draw-ticket" style={{'--ticket-delay':`${i*-.22}s`,'--ticket-turn':`${i%2?-7:7}deg`,'--ticket-lift':`${14+i%3*5}px`}}>
      <path d="M1 2L107 0L111 43L101 45L88 42L76 46L64 43L52 47L36 43L23 47L5 45Z" fill={i%3===1?'#e9b8cf':'#efdfc3'} stroke="#9e8069" strokeWidth="1.2"/>
      <path d="M12 34L99 31" stroke="#a57c7b" strokeWidth="1" strokeDasharray="2 3"/>
      <text x="55" y="23" textAnchor="middle" fill="#302322" fontFamily="'Courier New',monospace" fontSize={label.length>12?10:13} fontWeight="700">{label}</text><circle cx="9" cy="10" r="2" fill="#b37d9e" opacity=".65"/>
     </g></g>})}
     <image href="/participant-draw-kraft.png" x="84" y="127" width="292" height="178" preserveAspectRatio="none" clipPath={`url(#${id}-bag-front)`}/>
     <g transform="rotate(-7 230 232)">
      <path d="M163 195L296 193L300 270L283 273L264 270L244 275L226 272L207 276L168 271Z" fill="#eadbc1" stroke="#a38a73" strokeWidth="1"/>
      <path d="M172 204L289 203L291 263L176 266Z" stroke="#c27b9f" strokeWidth="2" strokeDasharray="6 3"/>
      <path d="M187 188L242 185L245 199L189 203Z" fill="#cf7ba2"/><path d="M182 191L248 188L250 201L184 204Z" fill="#da8fb496"/>
      <text x="231" y="230" textAnchor="middle" fill="#2c2423" fontFamily="'Courier New',monospace" fontSize="21" fontWeight="700">BOA</text><text x="231" y="254" textAnchor="middle" fill="#2c2423" fontFamily="'Courier New',monospace" fontSize="22" fontWeight="700">SORTE!</text>
      <path d="M284 252C272 243 273 234 280 236C285 237 284 243 284 243C284 243 287 235 293 239C300 244 285 255 284 260" stroke="#c17ba0" strokeWidth="2.4" strokeLinecap="round"/>
     </g>
    </g>
    <g className="participant-draw-doodle" stroke="#cb738e" strokeWidth="3" strokeLinecap="round"><path d="M80 198L67 187M76 215L59 210M77 233L62 235M362 110L370 94M374 120L388 110M378 135L395 133"/></g>
   </svg>
   <span className="participant-draw-count">{count} {count===1?'nome no saco':'nomes no saco'}</span>
  </div>
  <div className="participant-draw-progress-copy"><p className="participant-draw-phase" role="status" aria-live="polite" aria-atomic="true">{PHASES[phase]}<span aria-hidden="true">…</span></p><span className="participant-draw-percent" aria-hidden="true">{Math.floor(progress)}<small>%</small></span></div>
  <div className="participant-draw-progress" role="progressbar" aria-label="Sorteio dos participantes" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.floor(progress)} aria-valuetext={`${Math.floor(progress)}% — ${PHASES[phase]}`}><span style={{transform:`scaleX(${progress/100})`}}/></div>
  <div className="participant-draw-steps" aria-hidden="true">{['Papéis prontos','Misturando tudo','Cada um no seu slot'].map((label,i)=><span key={label} className={i<=phase?'is-active':''}><i/>{label}</span>)}</div>
 </section></div>;
}
