import React,{useState,useRef,useEffect,useCallback} from 'react';
import {Plus,Square,MousePointer2,Link2,Shuffle,Trash2,Users,ArrowRight,X,GitFork,PanelRightClose,PanelRightOpen,Home} from 'lucide-react';
import {boardGroup,boardWinner,syncBoard,initialBoard,connectSpaces,distributePlayers,createRoundOf16Board,isChampionshipMatch} from './board';
import MusicRoulette from './MusicRoulette.jsx';
import Victory from './Victory.jsx';
import NotebookGrid from './NotebookGrid.jsx';
import ParticipantDraw from './ParticipantDraw.jsx';
import './dashboard-layout.css';
export default function Tournament({data,setData,avatar,notice,onAdd,onHome,themeControl,theme}){
 const board=data.board||initialBoard(data),[tool,setTool]=useState('select'),[link,setLink]=useState(null),[cursor,setCursor]=useState(null),[roster,setRoster]=useState(true);
 const drag=useRef(null),connection=useRef(null),canvas=useRef(null),scroll=useRef(null),rosterPanel=useRef(null),rosterControl=useRef(null),rosterInteracted=useRef(false);
  const [scale,setScale]=useState(.65),[pan,setPan]=useState({x:25,y:155}),[victory,setVictory]=useState(null),[draw,setDraw]=useState(null);
 const panning=useRef(null),autoFit=useRef(true),suppressClick=useRef(false);
 const dismissVictory=useCallback(()=>setVictory(null),[]);
 const fit=useCallback(()=>{
  const viewport=scroll.current;if(!viewport||!canvas.current)return;
  const nodes=[...canvas.current.querySelectorAll('.space-node')];
  const left=nodes.length?Math.min(...nodes.map(n=>n.offsetLeft))-12:0;
  const right=nodes.length?Math.max(...nodes.map(n=>n.offsetLeft+n.offsetWidth))+12:500;
  const upper=nodes.length?Math.min(...nodes.map(n=>n.offsetTop))-18:0;
  const lower=nodes.length?Math.max(...nodes.map(n=>n.offsetTop+n.offsetHeight))+12:350;
  const sidebarWidth=roster?(rosterPanel.current?.offsetWidth||(viewport.clientWidth<800?215:230)):48;
  const margin=20,top=viewport.clientWidth<800?140:125,bottom=85;
  const availableWidth=Math.max(100,viewport.clientWidth-sidebarWidth-margin*2);
  const availableHeight=Math.max(100,viewport.clientHeight-top-bottom);
  const next=Math.max(.08,Math.min(.7,availableWidth/(right-left),availableHeight/(lower-upper)));
  setScale(next);setPan({x:margin+(availableWidth-(right-left)*next)/2-left*next,y:top+(availableHeight-(lower-upper)*next)/2-upper*next});autoFit.current=true;
 },[roster]);
 const toggleRoster=()=>{rosterInteracted.current=true;setRoster(value=>!value)};
 useEffect(()=>{if(rosterInteracted.current)rosterControl.current?.focus()},[roster]);
 useEffect(()=>{if(autoFit.current&&!drag.current)fit()},[board.groups,fit]);
 useEffect(()=>{const observer=new ResizeObserver(()=>{if(autoFit.current)fit()});if(scroll.current)observer.observe(scroll.current);return()=>observer.disconnect()},[fit]);
 const zoom=(factor,anchor)=>{autoFit.current=false;const next=Math.max(.08,Math.min(2,scale*factor));const center=anchor||{x:scroll.current.clientWidth/2,y:scroll.current.clientHeight/2};setPan(p=>({x:center.x-(center.x-p.x)*next/scale,y:center.y-(center.y-p.y)*next/scale}));setScale(next)};
 useEffect(()=>{const el=scroll.current;const wheel=e=>{if(e.target.closest('input,select'))return;e.preventDefault();const r=el.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),{x:e.clientX-r.left,y:e.clientY-r.top})};el?.addEventListener('wheel',wheel,{passive:false});return()=>el?.removeEventListener('wheel',wheel)},[scale,pan]);
 const person=id=>data.players.find(p=>p.id===id);
 const save=fn=>{try{const next=fn(structuredClone(board));setData(d=>({...d,board:next}));return true}catch(e){notice(e.message);return false}};
 const point=e=>{const r=canvas.current.getBoundingClientRect();return {x:Math.max(15,(e.clientX-r.left)/scale),y:Math.max(15,(e.clientY-r.top)/scale)}};
 const addAt=p=>save(b=>{b.groups.push(boardGroup('Espaço '+(b.groups.length+1),p.x,p.y));return b});
 const finishLink=id=>{if(!link)return;save(b=>connectSpaces(b,link,id));setLink(null);setCursor(null)};
 const remove=id=>save(b=>{b.groups=b.groups.filter(g=>g.id!==id);b.groups.forEach(g=>g.sources=g.sources.filter(s=>s!==id));return syncBoard(b)});
 const distribute=()=>{
  if(draw)return;
  if(board.groups.some(g=>g.players.length)&&!confirm('Sortear novamente as pessoas e limpar os vencedores?'))return;
  try{const result=distributePlayers(board,data.players.map(p=>p.id));setDraw({result,players:[...data.players]})}catch(error){notice(error.message)}
 };
 const cancelDraw=useCallback(()=>setDraw(null),[]);
 const completeDraw=useCallback(()=>{
  if(!draw)return;
  autoFit.current=true;drag.current=null;connection.current=null;setLink(null);setCursor(null);setTool('select');
  setData(d=>({...d,board:draw.result}));setDraw(null);
 },[draw,setData]);
 const width=Math.max(1500,...board.groups.map(g=>g.x+450)),height=Math.max(1000,...board.groups.map(g=>g.y+500+g.players.length*120));
 const createPreset=()=>{if(board.groups.length&&!confirm('Substituir o desenho atual pelo modelo de oitavas? As conexoes e os resultados atuais serao apagados. A lista de participantes sera mantida.'))return;if(save(()=>createRoundOf16Board())){autoFit.current=true;setTool('select');setLink(null);setCursor(null);drag.current=null;connection.current=null;scroll.current?.scrollTo({left:0,top:0,behavior:'smooth'})}};
 const source=board.groups.find(g=>g.id===link);
 return <div className="party-workspace"><NotebookGrid theme={theme}/><aside className="party-toolbar"><button className="home-button" title="Início" onClick={onHome} aria-label="Voltar para o início"><Home size={20}/></button><div className="canvas-tools"><button title="Selecionar e arrastar" className={tool==='select'?'active':''} onClick={()=>{setTool('select');setLink(null)}}><MousePointer2 size={18}/></button><button draggable title="Adicionar slot: clique no mapa ou arraste para posicionar" onDragStart={e=>{e.dataTransfer.setData('text/plain','new-space');e.dataTransfer.effectAllowed='copy'}} className={tool==='square'?'active':''} onClick={()=>{setTool('square');setLink(null)}}><Square size={18}/> Adicionar slot</button><button className={tool==='link'?'active':''} onClick={()=>setTool('link')}><Link2 size={18}/> Conectar</button><button className="preset-button" onClick={createPreset} title="Gerar o desenho de oito vagas, duas chaves, final e campe?o"><GitFork size={17}/><span>Criar torneio <span className="preset-subtitle">oitavas de final</span></span></button>{themeControl}</div></aside>
 {link&&<button className="cancel-wire" onClick={()=>{setLink(null);setCursor(null)}}><X size={14}/> Cancelar ligação</button>}
 <section ref={scroll} className={'party-canvas-scroll tool-'+tool} aria-label="Canvas de desenho do torneio" onClick={e=>{if(suppressClick.current){suppressClick.current=false;return}if(tool==='square'&&!e.target.closest('.space-node'))addAt(point(e))}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'}} onDrop={e=>{e.preventDefault();if(e.dataTransfer.getData('text/plain')==='new-space')addAt(point(e))}} onPointerDown={e=>{if((tool!=='select'&&e.button!==1)||e.target.closest('.space-node,.wire-hit'))return;e.preventDefault();autoFit.current=false;panning.current={x:e.clientX,y:e.clientY,pan};suppressClick.current=false;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(panning.current){const p=panning.current;const dx=e.clientX-p.x,dy=e.clientY-p.y;if(Math.abs(dx)+Math.abs(dy)>4)suppressClick.current=true;setPan({x:p.pan.x+dx,y:p.pan.y+dy});return}if(link)setCursor(point(e));if(!drag.current)return;const d=drag.current;save(b=>{const g=b.groups.find(g=>g.id===d.id);g.x=Math.max(15,d.x+(e.clientX-d.mx)/scale);g.y=Math.max(15,d.y+(e.clientY-d.my)/scale);return b})}} onPointerUp={e=>{panning.current=null;drag.current=null;if(connection.current){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-input]');if(target){save(b=>connectSpaces(b,connection.current,target.dataset.input));setLink(null);setCursor(null)}connection.current=null;}}} onPointerCancel={()=>{panning.current=null;drag.current=null;connection.current=null;setLink(null);setCursor(null)}}><div ref={canvas} className="party-canvas" style={{width,height,transform:`translate(${pan.x}px,${pan.y}px) scale(${scale})`}}>
 <svg className="space-wires" width={width} height={height}><defs><marker id="party-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="#e99e37"/></marker></defs>{board.groups.flatMap(target=>target.sources.map(id=>{const from=board.groups.find(g=>g.id===id);if(!from)return null;const x=from.x+190,y=from.y+70,tx=target.x,ty=target.y+70,mid=(x+tx)/2;return <g key={id+target.id}><path d={`M${x} ${y} C${mid} ${y} ${mid} ${ty} ${tx} ${ty}`} stroke="#e99e37" strokeWidth="3" fill="none" markerEnd="url(#party-arrow)"/><path className="wire-hit" d={`M${x} ${y} C${mid} ${y} ${mid} ${ty} ${tx} ${ty}`} stroke="transparent" strokeWidth="18" fill="none" role="button" tabIndex="0" aria-label="Remover ligação" onClick={e=>{e.stopPropagation();save(b=>{b.groups.find(g=>g.id===target.id).sources=b.groups.find(g=>g.id===target.id).sources.filter(s=>s!==id);return syncBoard(b)})}} onKeyDown={e=>{if(e.key==='Enter'||e.key==='Delete')save(b=>{b.groups.find(g=>g.id===target.id).sources=b.groups.find(g=>g.id===target.id).sources.filter(s=>s!==id);return syncBoard(b)})}}/></g>}))}{source&&cursor&&<path d={`M${source.x+190} ${source.y+70} L${cursor.x} ${cursor.y}`} stroke="#f4c158" strokeWidth="2" strokeDasharray="6 6"/>}</svg>
 {board.groups.map((g,i)=><section className={'space-node '+(link===g.id?'connecting':'')+(g.winners.length?' has-winner':'')} key={g.id} style={{left:g.x,top:g.y}} onClick={e=>{e.stopPropagation();if(tool==='link'){if(link)finishLink(g.id);else setLink(g.id)}}}><div className="space-tape"/><div className="space-grip" onPointerDown={e=>{if(e.target.closest('button,input')||tool==='link')return;autoFit.current=false;drag.current={id:g.id,x:g.x,y:g.y,mx:e.clientX,my:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}}><span>⠿ {String(i+1).padStart(2,'0')}</span><button aria-label="Excluir espaço" onClick={()=>remove(g.id)}><X size={13}/></button></div><input aria-label="Nome do espaço" value={g.name} onChange={e=>save(b=>{b.groups.find(x=>x.id===g.id).name=e.target.value;return b})}/>
 <button className="space-port input-port" data-input={g.id} aria-label={'Entrada de '+g.name} onClick={e=>{e.stopPropagation();finishLink(g.id)}}/>
 <button className="space-port output-port" aria-label={'Ligar saída de '+g.name} onPointerDown={e=>{e.stopPropagation();connection.current=g.id;setLink(g.id);setCursor(point(e))}} onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setLink(g.id)}}/>
 {g.players.length?g.players.map(id=>{const p=person(id);return <button key={id} className={'space-person '+(g.winners.includes(id)?'winner':g.winners.length?'loser':'')} aria-pressed={g.winners.includes(id)} aria-label={'Marcar vitória de '+p?.name} onClick={e=>{e.stopPropagation();if(save(b=>boardWinner(b,g.id,id))&&!g.winners.includes(id))setVictory({name:p?.name,photo:p?.photo||'',final:isChampionshipMatch(board,g.id),key:crypto.randomUUID()})}}><div className="slot-photo">{avatar(p)}</div><strong>{p?.name}</strong>{g.winners.includes(id)&&<span className="winner-stamp">WINNER ✦</span>}</button>}):<div className="empty-slot waiting-card"><div className="waiting-avatar"><Users size={30}/></div><span className="waiting-text">Aguardando…</span></div>}
 {g.song&&<div className="space-song"><span>♫ MÚSICA DA CHAVE</span><strong>{g.song.title}</strong><small>{g.song.artist} · {g.song.players} pessoas</small></div>}<small className="space-footer">{g.sources.length?g.sources.map(id=>board.groups.find(x=>x.id===id)?.name).join(' × '):'VAGA INICIAL'}</small></section>)}</div></section>
 {roster&&<aside id="participant-sidebar" ref={rosterPanel} className="party-roster"><div className="roster-tape"/><div className="roster-heading"><span className="paper-label">GUEST LIST</span><div className="roster-heading-actions"><span className="sidebar-participant-count" aria-label={data.players.length+' participantes'}><Users size={15}/><b>{data.players.length}</b></span><button ref={rosterControl} className="sidebar-collapse" onClick={toggleRoster} aria-label="Recolher participantes" aria-controls="participant-sidebar" aria-expanded="true" title="Recolher participantes"><PanelRightClose size={19}/></button></div></div><h2>Os convidados</h2><p>Foto, nome e bora pra pista.</p><button className="roster-add" onClick={()=>onAdd()}><Plus size={17}/> Adicionar participante</button><div className="guest-list">{data.players.map((p,i)=><div className="guest" key={p.id}><span className="guest-number">{String(i+1).padStart(2,'0')}</span><div className="avatar">{avatar(p)}</div><strong>{p.name}</strong><button aria-label={'Remover '+p.name} onClick={()=>{if(board.groups.some(g=>g.players.includes(p.id))){notice('Esta pessoa já está no torneio. Remova o espaço ou sorteie novamente após editar o mapa.');return}setData(d=>({...d,players:d.players.filter(x=>x.id!==p.id)}))}}><Trash2 size={13}/></button></div>)}{!data.players.length&&<div className="guest-empty">A lista está aberta.<br/>Quem vem dançar?</div>}</div><div className="roster-bottom"><div><b>{data.players.length}</b> pessoas <span> / </span><b>{board.groups.filter(g=>!g.sources.length).length}</b> vagas iniciais</div><button className="place-button" disabled={!!draw} aria-busy={!!draw} onClick={distribute}><Shuffle size={17}/> {draw?'Sorteando…':'Sortear participantes'} <ArrowRight size={16}/></button></div></aside>}
 {!roster&&<button ref={rosterControl} className="sidebar-expand" onClick={toggleRoster} aria-label={'Expandir participantes ('+data.players.length+')'} aria-controls="participant-sidebar" aria-expanded="false" title="Expandir participantes"><PanelRightOpen size={20}/><span><Users size={15}/>{data.players.length}</span></button>}
  <div className="map-zoom" aria-label="Zoom do mapa"><button onClick={()=>zoom(.8)} aria-label="Diminuir zoom">−</button><span>{Math.round(scale*100)}%</span><button onClick={()=>zoom(1.25)} aria-label="Aumentar zoom">+</button><button onClick={fit}>Ajustar à tela</button></div>
 {draw&&<ParticipantDraw players={draw.players} onComplete={completeDraw} onCancel={cancelDraw}/>}
 {victory&&<Victory key={victory.key} winner={victory} onDone={dismissVictory}/>}
 <MusicRoulette data={data} setData={setData} groups={board.groups}/><div className="canvas-legend"><span>●</span> Saída → entrada para ligar <span>✦</span> Clique no rosto para marcar vitória</div></div>;
}















