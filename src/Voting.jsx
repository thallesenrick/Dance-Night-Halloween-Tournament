import React,{useEffect,useState} from 'react';
import VotingResults from './VotingResults.jsx';
import VotingExperience from './VotingExperience.jsx';
import VotingPairs from './VotingPairs.jsx';
import {ClipboardList,Users,Vote,ChartNoAxesColumnIncreasing,ChevronRight,Play,ArrowLeft} from 'lucide-react';
import {createId} from './id.js';
import {initialVoting} from './voting.js';
import './voting.css';
import './voting-scrapbook.css';
import './voting-experience.css';
import './voting-layout.css';
import './voting-dashboard.css';
export default function Voting({players,avatar,onAdd,onHome,themeControl,notice}){
 const [data,setData]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem('halloween-voting-v1'));if(Array.isArray(saved?.questions)&&Array.isArray(saved?.ballots))return saved}catch{}return initialVoting()});
 const [tab,setTab]=useState('hub'),[title,setTitle]=useState(''),[count,setCount]=useState(1);
 const experiences=[
  {id:'settings',label:'Formulário',icon:ClipboardList,description:'Configure as perguntas e as categorias da noite.'},
  {id:'participants',label:'Participantes',icon:Users,description:'Cadastre as pessoas e suas fotos.'},
  {id:'vote',label:'Votação',icon:Vote,description:'Escolha seus favoritos e envie seus votos.'},
  {id:'results',label:'Resultados',icon:ChartNoAxesColumnIncreasing,description:'Acompanhe os pontos no gráfico animado.'}
 ];
 const current=experiences.find(item=>item.id===tab);
 const navigate=id=>setTab(id);
 useEffect(()=>{try{localStorage.setItem('halloween-voting-v1',JSON.stringify(data))}catch{notice('Não foi possível salvar a votação. Mantenha esta aba aberta.')}},[data,notice]);
 const saveBallot=answers=>setData(d=>({...d,ballots:[...d.ballots,{id:createId(),answers,at:Date.now()}]}));
 return <main className={`voting-screen scrapbook-voting voting-dashboard ${tab==='hub'?'is-hub':''} ${tab==='results'?'is-results':''} ${tab==='vote'?'is-ballot':''}`}><header className="voting-header"><button className="voting-back" onClick={()=>tab==='hub'?onHome():setTab('hub')}><ArrowLeft size={18} aria-hidden="true"/> Voltar</button><div className="voting-top-actions"><button className="voting-launch" aria-current={tab==='vote'?'page':undefined} onClick={()=>navigate('vote')}><Play size={18} fill="currentColor" aria-hidden="true"/> Iniciar votação</button>{themeControl}</div></header><section className="voting-intro"><p>OS FAVORITOS DA NOITE</p><h1>{current?current.label:'A noite é'} <em>{current?'da noite.':'sua.'}</em></h1><p>{current?current.description:'Prepare o formulário, reúna os participantes e descubra os favoritos.'}</p></section>{tab!=='vote'&&<nav className={tab==='hub'?'voting-experiences':'voting-experiences compact'} aria-label="Experiências da votação">{experiences.filter(item=>item.id!=='vote').map(item=><button key={item.id} aria-current={tab===item.id?'page':undefined} onClick={()=>navigate(item.id)}><span className="experience-icon" aria-hidden="true"><item.icon strokeWidth={1.35}/></span><span><strong>{item.label}</strong><small>{item.description}</small></span><ChevronRight className="experience-arrow" aria-hidden="true" strokeWidth={1.8}/></button>)}</nav>}
 {tab==='participants'&&<section className="voting-card"><div className="vote-results-heading"><div><p>OS ROSTOS DA FESTA</p><h2>Participantes cadastrados</h2><p>{players.length} {players.length===1?'pessoa pronta':'pessoas prontas'} para aparecer nas opções de voto.</p></div><button onClick={onAdd}>+ Cadastrar participante</button></div>{players.length?<ul className="voting-participants">{players.map(p=><li key={p.id}><span className="vote-avatar">{avatar(p)}</span><strong>{p.name}</strong></li>)}</ul>:<div className="vote-participants-empty"><Users aria-hidden="true" size={56}/><h3>A festa começa com as pessoas.</h3><p>Cadastre o primeiro participante com nome e foto.</p><button onClick={onAdd}>Cadastrar primeira pessoa</button></div>}<p className="vote-local-note">Este cadastro também é compartilhado com o torneio.</p></section>}
 {tab==='participants'&&<VotingPairs players={players} duos={data.duos||[]} avatar={avatar} onChange={duos=>setData(d=>({...d,duos}))}/>}
 {tab==='vote'&&<VotingExperience startImmediately duos={data.duos||[]} questions={data.questions} players={players} avatar={avatar} onSubmit={saveBallot} onParticipants={()=>setTab('participants')} onForm={()=>setTab('settings')}/>}
 {tab==='results'&&<VotingResults duos={data.duos||[]} questions={data.questions} ballots={data.ballots} players={players} avatar={avatar}/>}
 {tab==='settings'&&<section className="voting-card"><p>SEU FORMULÁRIO</p><h2>As categorias da noite</h2><p>Participantes e fotos são compartilhados com o torneio. As perguntas ficam bloqueadas após o primeiro envio para preservar os votos.</p><ul className="vote-questions">{data.questions.map(q=><li key={q.id}><span>{q.title}<small>{q.count===2?'Duas pessoas':'Uma pessoa'}</small></span><button disabled={data.ballots.length>0} onClick={()=>{setData(d=>({...d,questions:d.questions.filter(x=>x.id!==q.id)}))}} aria-label={`Remover ${q.title}`}>Remover</button></li>)}</ul><form className="vote-question-form" onSubmit={e=>{e.preventDefault();if(!title.trim()||data.ballots.length)return;setData(d=>({...d,questions:[...d.questions,{id:createId(),title:title.trim(),count}]}));setTitle('')}}><label>Pergunta<input required maxLength={120} placeholder="Ex.: Melhor fantasia em dupla" value={title} disabled={data.ballots.length>0} onChange={e=>setTitle(e.target.value)}/></label><label>Resposta<select value={count} disabled={data.ballots.length>0} onChange={e=>setCount(Number(e.target.value))}><option value={1}>Uma pessoa</option><option value={2}>Duas pessoas (dupla)</option></select></label><button disabled={data.ballots.length>0||!title.trim()}>Adicionar pergunta</button></form><p className="vote-local-note">Os votos ficam neste navegador. Não há sincronização entre aparelhos nem bloqueio por identidade: use o tablet como urna compartilhada.</p></section>}
 </main>;
}

