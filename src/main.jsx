import {createId} from './id.js';
import React,{useState,useEffect,useLayoutEffect,useRef,useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import {X} from 'lucide-react';
import {loadTournament} from './tournament';
import {syncBoard,initialBoard} from './board';
import Tournament from './Tournament.jsx';
import Cover from './Cover.jsx';
import ParticipantModal from './ParticipantModal.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import BatBurst from './BatBurst.jsx';
import {revealTheme} from './theme-transition.js';
import './style.css';
import './theme.css';
import './toolbar.css';
import './retro-cursors.css';
import './retro-scrollbars.css';
const empty={players:[],rounds:[]};
const nameSegmenter=new Intl.Segmenter('pt-BR',{granularity:'grapheme'});
const nameInitial=name=>nameSegmenter.segment(name||'')[Symbol.iterator]().next().value?.segment||'?';
function App(){
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('halloween-theme')==='dark'?'dark':'light'}catch{return 'light'}});
 useLayoutEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;try{localStorage.setItem('halloween-theme',theme)}catch{}},[theme]);
 const [batBurst,setBatBurst]=useState(null),[themeSwitching,setThemeSwitching]=useState(false);
 const activeTransition=useRef(null);
 useEffect(()=>()=>activeTransition.current?.skipTransition(),[]);
 const dismissBats=useCallback(()=>setBatBurst(null),[]);
 const toggleTheme=async event=>{
  if(themeSwitching)return;
  const next=theme==='dark'?'light':'dark',r=event.currentTarget.getBoundingClientRect();
  setBatBurst(null);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setTheme(next);return}
  setThemeSwitching(true);
  try{await revealTheme({x:r.left+r.width/2,y:r.top+r.height/2,update:()=>setTheme(next),onStart:t=>{activeTransition.current=t}});setBatBurst({id:Date.now(),kind:next==='dark'?'bats':'sparkles'})}
  finally{activeTransition.current=null;setThemeSwitching(false)}
 };
 const themeControl=<ThemeToggle theme={theme} onToggle={toggleTheme} disabled={themeSwitching}/>;
 const [data,setData]=useState(()=>{try{const old=JSON.parse(localStorage.getItem('halloween-v1'));return loadTournament(old)}catch{return empty}});
 const [started,setStarted]=useState(false),[modal,setModal]=useState(false),[notice,setNotice]=useState('');

 useEffect(()=>{try{localStorage.setItem('halloween-v1',JSON.stringify(data))}catch{setNotice('Memória cheia. Exporte o torneio para preservar os dados.')}},[data]);
 const close=()=>setModal(false);
 const add=participant=>{setData(d=>({...d,players:[...d.players,{...participant,id:createId()}]}));close()};
 const avatar=p=>p?.photo?<img src={p.photo} alt={p.name}/>:<span className="initial">{nameInitial(p?.name)}</span>;
 const begin=()=>setStarted(true);
 const goHome=()=>{close();setStarted(false)};
 return <div className={started?'app sandbox-app':'app welcome-app'}>{!started?<><Cover onStart={begin}/><div className="home-theme-control">{themeControl}</div></>:<main className="sandbox-screen"><Tournament data={data} setData={setData} avatar={avatar} notice={setNotice} onAdd={()=>setModal(true)} onHome={goHome} themeControl={themeControl} theme={theme}/></main>}
 {batBurst&&<BatBurst key={batBurst.id} kind={batBurst.kind} onDone={dismissBats}/>}{notice&&<div className="toast" role="alert">{notice}<button onClick={()=>setNotice('')} aria-label="Fechar aviso"><X/></button></div>}
 {modal&&<ParticipantModal onClose={close} onSave={add}/>}</div>
}
createRoot(document.getElementById('root')).render(<App/>);










