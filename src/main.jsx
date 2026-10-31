import React,{useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Plus,Camera,X,Upload} from 'lucide-react';
import {loadTournament} from './tournament';
import {syncBoard,initialBoard} from './board';
import Tournament from './Tournament.jsx';
import Cover from './Cover.jsx';
import './style.css';
const empty={players:[],rounds:[]};
function App(){
 const [data,setData]=useState(()=>{try{const old=JSON.parse(localStorage.getItem('halloween-v1'));return loadTournament(old)}catch{return empty}});
 const [started,setStarted]=useState(false),[modal,setModal]=useState(false),[name,setName]=useState(''),[photo,setPhoto]=useState(''),[camera,setCamera]=useState(false),[notice,setNotice]=useState('');

 const video=useRef(null),stream=useRef(null),file=useRef(null);
 useEffect(()=>{try{localStorage.setItem('halloween-v1',JSON.stringify(data))}catch{setNotice('Memória cheia. Exporte o torneio para preservar os dados.')}},[data]);
 useEffect(()=>()=>stream.current?.getTracks().forEach(t=>t.stop()),[]);
 const stop=()=>{stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;setCamera(false)};
 const close=()=>{stop();setModal(false);setName('');setPhoto('')};
 async function startCamera(){try{stop();stream.current=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});setCamera(true)}catch{setNotice('Permita o acesso à câmera ou envie uma foto.')}}
 const capture=()=>{const v=video.current;if(!v?.videoWidth)return;const c=document.createElement('canvas');c.width=c.height=480;const side=Math.min(v.videoWidth,v.videoHeight);c.getContext('2d').drawImage(v,(v.videoWidth-side)/2,(v.videoHeight-side)/2,side,side,0,0,480,480);setPhoto(c.toDataURL('image/jpeg',.82));stop()};
 const add=e=>{e.preventDefault();if(!name.trim())return;const p={id:crypto.randomUUID(),name:name.trim(),photo};setData(d=>({...d,players:[...d.players,p]}));close()};
 const avatar=p=>p?.photo?<img src={p.photo} alt={p.name}/>:<span className="initial">{p?.name?.slice(0,1)||'?'}</span>;
 const begin=()=>{if(data.players.length||data.board?.groups.length||data.rounds.length){try{localStorage.setItem('halloween-backup',JSON.stringify(data))}catch{setNotice('Não foi possível guardar o mapa anterior. Exporte ou libere espaço antes de iniciar outro torneio.');return}}setData({players:[],rounds:[],board:{groups:[]}});setStarted(true)};
 return <div className={started?'app sandbox-app':'app welcome-app'}>{!started?<Cover onStart={begin}/>:<main className="sandbox-screen"><Tournament data={data} setData={setData} avatar={avatar} notice={setNotice} onAdd={()=>setModal(true)}/></main>}
 {notice&&<div className="toast" role="alert">{notice}<button onClick={()=>setNotice('')} aria-label="Fechar aviso"><X/></button></div>}
 {modal&&<div className="overlay" onClick={close}><section className="modal quick-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e=>e.stopPropagation()}><button className="close" onClick={close} aria-label="Fechar"><X/></button><div className="eyebrow">UM NOVO ESPÍRITO NA PISTA</div><h2 id="modal-title">Adicionar participante</h2><div className="photo-preview">{camera?<video ref={el=>{video.current=el;if(el&&stream.current)el.srcObject=stream.current}} autoPlay muted playsInline/>:photo?<img src={photo} alt="Foto do participante"/>:<Camera size={36}/>}</div><div className="photo-actions"><button onClick={camera?capture:startCamera}><Camera size={16}/>{camera?'Capturar foto':'Abrir câmera'}</button><button onClick={()=>file.current.click()}><Upload size={16}/> Enviar foto</button><input ref={file} type="file" hidden accept="image/*" onChange={e=>{const f=e.target.files[0];if(!f?.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=480;const side=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,480,480);setPhoto(c.toDataURL('image/jpeg',.82));stop()};img.src=reader.result};reader.readAsDataURL(f)}}/></div><form onSubmit={add}><label>Nome do participante<input autoFocus maxLength={32} required placeholder="Nome" value={name} onChange={e=>setName(e.target.value)}/></label><button className="gold" type="submit" disabled={!name.trim()}><Plus size={16}/> Adicionar</button></form></section></div>}</div>
}
createRoot(document.getElementById('root')).render(<App/>);

