import React,{useState,useEffect,useLayoutEffect,useRef,useMemo} from 'react';
import {X,Users,Music,Music2,Disc3,RefreshCw,Pencil} from 'lucide-react';
import {getMusicLibrary,chooseLibrarySong} from './music-library.js';
import MusicLibraryEditor from './MusicLibraryEditor.jsx';
import './roulette.css';
import {startRouletteSound} from './roulette-sound.js';
const MARKER_ANGLE=130;
const SPIN_MS=5200;
const REVEAL_MS=1200;
function lines(text,length=16){const words=text.split(' '),result=[];let row='';for(const word of words){if(row&&row.length+word.length+1>length){result.push(row);row=word}else row+=(row?' ':'')+word}if(row)result.push(row);return result.slice(0,3)}
function MusicButtonEffects(){return <span className="music-button-fx" aria-hidden="true"><i className="music-wave"/><i className="music-wave music-wave-late"/>{Array.from({length:7},(_,i)=>{const Note=i%2?Music:Music2;return <span key={i} className="music-note" style={{left:`${8+i*14}%`,'--note-x':`${(i-3)*17}px`,'--note-tilt':`${(i%2?1:-1)*(14+i*4)}deg`,'--note-delay':`${i*.16}s`}}><Note size={21+i%3*4} strokeWidth={1.8}/></span>})}</span>}
function Record({pool,rotation,highlightIndex}){
 const angle=360/Math.max(1,pool.length),radius=255;
 const point=a=>[280+radius*Math.sin(a*Math.PI/180),280-radius*Math.cos(a*Math.PI/180)];
 return <svg className="scrap-record" viewBox="0 0 560 560" preserveAspectRatio="none" aria-hidden="true">
 <defs><radialGradient id="record-rim"><stop offset="0" stopColor="#39302b"/><stop offset=".86" stopColor="#161515"/><stop offset=".91" stopColor="#6f5c42"/><stop offset=".94" stopColor="#191716"/><stop offset=".98" stopColor="#c0a376"/><stop offset="1" stopColor="#201c19"/></radialGradient><radialGradient id="record-pink"><stop stopColor="#dda1ba"/><stop offset="1" stopColor="#bc7398"/></radialGradient><filter id="vinyl-grain"><feTurbulence baseFrequency=".65" numOctaves="3" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".14"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter><clipPath id="vinyl-circle"><circle cx="280" cy="280" r="255"/></clipPath></defs>
 <g className="scrap-record-rotor" style={{transform:`rotate(${rotation}deg)`}}><circle cx="280" cy="280" r="279" fill="url(#record-rim)"/>
 <g filter="url(#vinyl-grain)">{pool.map(({id,title,artist},i)=>{const start=point(i*angle),end=point((i+1)*angle);const dark=i===2||i===6;return <g key={id} className={'record-sector'+(highlightIndex===i?' is-selected':'')}><path d={pool.length===1?'M280 25 A255 255 0 1 1 280 535 A255 255 0 1 1 280 25 Z':`M280 280 L${start.join(' ')} A${radius} ${radius} 0 0 1 ${end.join(' ')} Z`} fill={dark?'#2c2826':i%3===0?'#c88ea8':'#eddfc6'} stroke="#8b735a" strokeWidth="1"/><g transform={`translate(280 280) rotate(${i*angle+angle/2})`} fill={dark?'#f0e4cd':'#27211f'}><text textAnchor="middle" y="-192" fontSize="12" fontFamily="Arial, sans-serif">{artist.length>23?artist.slice(0,22)+'…':artist}</text><text textAnchor="middle" fontSize="14" fontFamily="Arial, sans-serif">{lines(title).map((line,j)=><tspan key={j} x="0" y={-173+j*17}>{line}</tspan>)}</text></g></g>})}</g>
 <g clipPath="url(#vinyl-circle)" opacity=".12">{Array.from({length:47},(_,i)=><circle key={i} cx="280" cy="280" r={73+i*4} fill="none" stroke="#493c2e" strokeWidth=".65"/>)}</g>
 <circle cx="280" cy="280" r="74" fill="#171515" stroke="#ac9672" strokeWidth="2"/><circle cx="280" cy="280" r="59" fill="url(#record-pink)" stroke="#e1c2a1" strokeWidth="1"/>
 <g transform="translate(280 280)"><text x="-37" y="-22" fill="#f9e4b6" fontSize="19">✦</text><text x="25" y="-29" fill="#f9e4b6" fontSize="17">✧</text><text x="30" y="25" fill="#f9e4b6" fontSize="20">✦</text><circle r="28" fill="#30272a" stroke="#e5cfac" strokeWidth="2"/>{[-16,-8,0,8,16].map((v,i)=><g key={v}><path d={`M${v} -24 V24`} stroke={i%2?'#e6d3b5':'#7d716b'} strokeWidth="5"/><path d={`M-24 ${v} H24`} stroke="#d3c7b1" strokeWidth="2"/></g>)}<circle r="28" fill="none" stroke="#201b1b" strokeWidth="3"/><path d="M0 29 V43 M-8 43 H8" stroke="#201b1b" strokeWidth="3"/><circle cy="-43" r="3" fill="#f5e3bb"/><circle r="4" fill="#efdfbf"/></g>
 </g></svg>;
}
function Tonearm(){return <svg className="scrap-tonearm" viewBox="0 0 250 440" aria-hidden="true"><defs><linearGradient id="arm-metal"><stop stopColor="#655442"/><stop offset=".25" stopColor="#e8d7b9"/><stop offset=".5" stopColor="#9b8a72"/><stop offset=".7" stopColor="#f7e8cd"/><stop offset="1" stopColor="#675645"/></linearGradient><radialGradient id="arm-pivot"><stop stopColor="#f0dfc0"/><stop offset=".3" stopColor="#948472"/><stop offset=".4" stopColor="#211e1b"/><stop offset=".7" stopColor="#25211e"/><stop offset=".8" stopColor="#ccb898"/><stop offset="1" stopColor="#171615"/></radialGradient></defs><circle cx="150" cy="55" r="44" fill="#1b1817" stroke="#cbb18b" strokeWidth="2"/><circle cx="150" cy="55" r="34" fill="url(#arm-pivot)"/><g className="scrap-arm-moving"><path d="M150 55 C155 165 137 272 74 370" fill="none" stroke="#141111" strokeWidth="19"/><path d="M150 55 C155 165 137 272 74 370" fill="none" stroke="url(#arm-metal)" strokeWidth="11"/><path d="M146 76 L155 76" stroke="#30261e" strokeWidth="8"/><g transform="translate(74 370) rotate(35)"><rect x="-14" y="-27" width="28" height="48" rx="3" fill="#d58eae" stroke="#211c1c" strokeWidth="4"/><path d="M-7 -18 H5 M-5 -6 H8 M-6 6 H5" stroke="#3d2b34" strokeWidth="2"/><rect x="-11" y="19" width="22" height="8" fill="#211c1c"/><path d="M0 27 V30" stroke="#e8d7bb" strokeWidth="3"/></g></g><circle cx="150" cy="55" r="6" fill="#d7c7aa" stroke="#4b4035"/></svg>}
export default function MusicRoulette({data,setData,groups}){
 const [open,setOpen]=useState(false),[count,setCount]=useState(4),[target,setTarget]=useState(''),[spinning,setSpinning]=useState(false),[rotation,setRotation]=useState(0),[chosen,setChosen]=useState(null),[revealing,setRevealing]=useState(null),[scale,setScale]=useState(1),[editing,setEditing]=useState(false);
 const library=useMemo(()=>getMusicLibrary(data.musicLibrary),[data.musicLibrary]),pool=library.filter(song=>song.players===count);
 const dialog=useRef(null),launcher=useRef(null),timer=useRef(null),revealTimer=useRef(null),resultTimer=useRef(null),resultDialog=useRef(null),stopSound=useRef(null);
 const busy=spinning||!!revealing;
 const current=target?groups.find(g=>g.id===target)?.song:data.currentSong;
 const currentLabel=current?`${current.artist} – ${current.title}`:'Qual vai ser o próximo hit?';
 useEffect(()=>()=>{clearTimeout(timer.current);clearTimeout(revealTimer.current);clearTimeout(resultTimer.current);stopSound.current?.()},[]);
 useEffect(()=>{if(!chosen)return;resultDialog.current?.focus();resultTimer.current=setTimeout(()=>setChosen(null),4000);return()=>{clearTimeout(resultTimer.current);dialog.current?.focus()}},[chosen]);
 useEffect(()=>{if(!open)return;const previous=document.activeElement;dialog.current?.focus();return()=>previous?.focus()},[open]);
 useLayoutEffect(()=>{if(!open)return;const update=()=>setScale(dialog.current.clientWidth/1536);update();const observer=new ResizeObserver(update);observer.observe(dialog.current);return()=>observer.disconnect()},[open]);
 const close=()=>{if(!busy&&!chosen&&!editing)setOpen(false)};
 const spin=()=>{
  if(busy||chosen||editing||!pool.length)return;
  const selected=chooseLibrarySong(pool,current);
  const stop=(MARKER_ANGLE-(selected.index+.5)*(360/pool.length)+360)%360;
  stopSound.current?.();stopSound.current=startRouletteSound(SPIN_MS);
  setRotation(r=>r+2520+((stop-r%360+360)%360));setSpinning(true);
  timer.current=setTimeout(()=>{stopSound.current?.();stopSound.current=null;const song={...selected.song};setData(d=>({...d,currentSong:song,board:target?{...(d.board||{}),groups:(d.board?.groups||groups).map(g=>g.id===target?{...g,song}:g)}:d.board}));setSpinning(false);setRevealing({index:selected.index,song});revealTimer.current=setTimeout(()=>{setRevealing(null);setChosen(song)},REVEAL_MS)},SPIN_MS);
 };
 const trap=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const items=[...dialog.current.querySelectorAll('button:not(:disabled),select:not(:disabled)')],first=items[0],last=items.at(-1);if(!first){e.preventDefault();return}if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===dialog.current)){e.preventDefault();first.focus()}}};
 return <>
 <div className="music-dock"><button ref={launcher} className="music-launch" onClick={()=>setOpen(true)}><MusicButtonEffects/><span className="mini-vinyl"><Disc3 size={38}/></span><span>Selecionar próxima música</span><Music2 size={17}/></button></div>
 {open&&<div className={'overlay reference-music-overlay'+(editing?' has-music-editor':'')} onClick={close}><section ref={dialog} tabIndex={-1} className="scrap-roulette" role="dialog" aria-modal={!editing} aria-hidden={editing||undefined} inert={editing||undefined} aria-labelledby="roulette-title" onClick={e=>e.stopPropagation()} onKeyDown={trap}>
 <div className={'roulette-stage '+(spinning?'is-spinning':'')} style={{transform:`scale(${scale})`,'--roulette-ui-scale':scale}}>
 <img className="roulette-collage-base" src="/roulette-collage-base.png" alt=""/>
 <h2 id="roulette-title" className="roulette-a11y">Roleta de Músicas</h2>
 <button className="scrap-close" disabled={busy} onClick={close} aria-label="Fechar roleta"><X size={35}/></button>
 <div className="scrap-current" aria-live="polite"><span>{spinning?'O disco está girando…':revealing?'É essa!':'Música atual:'}</span><strong title={currentLabel} style={{fontSize:Math.min(20,540/currentLabel.length)}}>{currentLabel}</strong></div>
 <div className="scrap-filters"><p>Selecione o número de pessoas na rodada:</p><div>{[4,3,2,1].map(n=><button key={n} disabled={busy} aria-pressed={count===n} className={count===n?'selected':''} onClick={()=>setCount(n)}><Users size={27}/>{n} {n===1?'pessoa':'pessoas'}</button>)}</div></div>
 <div className="scrap-platter"><Record pool={pool} rotation={rotation} highlightIndex={revealing?.index}/></div><Tonearm/>
 <button type="button" className="scrap-edit" disabled={busy} onClick={()=>setEditing(true)} aria-label="Editar músicas" title="Editar músicas" aria-haspopup="dialog" aria-expanded={editing}><Pencil size={28}/></button>
 {!pool.length&&<p className="scrap-catalog-message">Nenhuma música para {count} {count===1?'pessoa':'pessoas'}.<span>Use o lápis para adicionar seus hits.</span></p>}
 <button className="scrap-spin" disabled={busy||!pool.length} onClick={spin}><Music2 size={31}/><span>{spinning?'Sorteando música…':revealing?'Música escolhida!':'Selecionar próxima música'}</span><RefreshCw className="scrap-spin-icon" size={29}/><MusicButtonEffects/></button>
 {groups.length>0&&<label className="scrap-target">Música para a chave <select disabled={busy} value={target} onChange={e=>setTarget(e.target.value)}><option value="">Sorteio livre</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>}
 </div></section>{editing&&<MusicLibraryEditor library={library} initialCount={count} onClose={()=>setEditing(false)} onSave={updated=>setData(previous=>({...previous,musicLibrary:updated}))}/>}</div>}
 {chosen&&<div className="overlay chosen-overlay" onClick={()=>setChosen(null)}><section ref={resultDialog} tabIndex={-1} className="chosen-modal" role="dialog" aria-modal="true" aria-labelledby="chosen-title" aria-describedby="chosen-description" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')setChosen(null);if(e.key==='Tab'){e.preventDefault();resultDialog.current?.querySelector('button')?.focus()}}}><button className="roulette-close" onClick={()=>setChosen(null)} aria-label="Fechar música escolhida"><X/></button><Disc3 className="chosen-disc" size={64}/><p>AGORA É SÓ DANÇAR ✦</p><h2 id="chosen-title">Música escolhida</h2><strong>{chosen.title}</strong><span id="chosen-description">{chosen.artist}</span><small>{chosen.edition} · {chosen.difficulty} · {chosen.players} {chosen.players===1?'pessoa':'pessoas'}</small><div className="chosen-countdown"/><p>Fecha automaticamente em 4 segundos</p></section></div>}
 </>;
}





