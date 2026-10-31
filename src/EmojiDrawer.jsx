import React,{useEffect,useRef,useState} from 'react';
import {X,Search,Smile,Check} from 'lucide-react';
import './emoji-drawer.css';

const categories=[
 {id:'halloween',name:'Halloween',icon:'🎃',items:[['🎃','abóbora halloween'],['👻','fantasma'],['🦇','morcego'],['💀','caveira'],['☠️','pirata caveiras'],['🧙','bruxa magia'],['🧛','vampiro'],['🧟','zumbi'],['🕷️','aranha'],['🕸️','teia de aranha'],['🐈‍⬛','gato preto'],['🧹','vassoura'],['🔮','bola cristal magia'],['🕯️','vela'],['🍬','bala doces'],['🍭','pirulito doce'],['🧚','fada'],['😈','diabinho'],['👹','monstro'],['🖤','coração preto']]},
 {id:'faces',name:'Carinhas',icon:'😊',items:[['😀','sorriso feliz'],['😃','alegre sorriso'],['😄','rindo sorriso'],['😁','feliz dentes'],['😆','risada'],['😂','rindo lágrimas'],['🤣','gargalhada'],['😊','sorriso tímido'],['😎','óculos estiloso'],['🥰','apaixonado amor'],['😍','olhos coração'],['😘','beijo'],['😜','piscando língua'],['🤪','maluco diversão'],['🥳','festa aniversário'],['🤩','olhos estrelas'],['🤗','abraço'],['🤭','risadinha'],['🫶','mãos coração'],['👽','alienígena']]},
 {id:'party',name:'Na pista',icon:'🪩',items:[['🪩','globo espelhado disco'],['🎵','nota musical música'],['🎶','notas musicais música'],['🎧','fone dj'],['🎤','microfone cantor'],['💃','dançarina dança'],['🕺','dançarino dança'],['🎉','festa confete'],['🎊','confetes comemoração'],['✨','brilhos estrelas'],['🌟','estrela brilhante'],['⭐','estrela'],['🔥','fogo'],['⚡','raio energia'],['👑','coroa campeão'],['🏆','troféu vencedor'],['🍸','drink coquetel'],['🍹','bebida tropical'],['🥂','brinde taças'],['🌈','arco íris']]},
 {id:'hearts',name:'Amor & cia.',icon:'💖',items:[['❤️','coração vermelho amor'],['🩷','coração rosa'],['💖','coração brilhante'],['💜','coração roxo'],['💛','coração amarelo'],['🧡','coração laranja'],['💙','coração azul'],['💚','coração verde'],['🤍','coração branco'],['🤎','coração marrom'],['💘','coração flecha'],['💝','coração presente'],['💞','corações girando'],['💕','dois corações'],['🌙','lua'],['🦋','borboleta'],['🌸','flor rosa'],['🌻','girassol'],['🐰','coelho'],['🐱','gato gatinho']]}
];
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();

export default function EmojiDrawer({name,onSelect,onClose,message}){
 const panel=useRef(null),searchInput=useRef(null),tabs=useRef({});
 const [category,setCategory]=useState('halloween'),[search,setSearch]=useState('');
 const query=normalize(search),items=(query?categories.flatMap(group=>group.items):categories.find(group=>group.id===category).items).filter(([emoji,label])=>!query||normalize(label).includes(query)||emoji.includes(query));
 useEffect(()=>{searchInput.current?.focus()},[]);
 const keydown=event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose()}
  if(event.key==='Tab'){
   const elements=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')].filter(element=>element.tabIndex>=0&&element.getClientRects().length),first=elements[0],last=elements.at(-1);
   if(!elements.includes(document.activeElement)){event.preventDefault();(event.shiftKey?last:first)?.focus()}else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
 };
 return <div className="emoji-drawer-backdrop" onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)onClose()}}><section ref={panel} className="emoji-drawer" role="dialog" aria-modal="true" aria-labelledby="emoji-drawer-title" onKeyDown={keydown}>
  <div className="emoji-drawer-heading"><Smile size={30} aria-hidden="true"/><div><span>UM TOQUE SEU ✦</span><h3 id="emoji-drawer-title">Emojis para o nome</h3></div><button type="button" className="emoji-drawer-close" aria-label="Fechar emojis" onClick={onClose}><X size={22}/></button></div>
  <p className="emoji-drawer-intro">Escolha seus favoritos. Pode misturar!</p>
  <div className="emoji-name-preview" aria-live="polite"><span>ASSIM VAI FICAR</span><strong>{name||'Seu nome + sua vibe'}</strong></div>
  <label className="emoji-drawer-search"><Search size={18} aria-hidden="true"/><input ref={searchInput} type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar emoji…" aria-label="Buscar emoji"/></label>
  <div className="emoji-drawer-tabs" role="tablist" aria-label="Categorias de emojis">{categories.map((group,index)=><button key={group.id} ref={element=>{tabs.current[group.id]=element}} id={'emoji-tab-'+group.id} type="button" role="tab" aria-controls="emoji-drawer-grid" aria-selected={!query&&group.id===category} tabIndex={group.id===category?0:-1} title={group.name} onClick={()=>{setCategory(group.id);setSearch('')}} onKeyDown={event=>{let next;if(event.key==='ArrowRight')next=(index+1)%categories.length;else if(event.key==='ArrowLeft')next=(index+categories.length-1)%categories.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=categories.length-1;if(next!==undefined){event.preventDefault();setCategory(categories[next].id);setSearch('');tabs.current[categories[next].id]?.focus()}}}><span aria-hidden="true">{group.icon}</span><small>{group.name}</small></button>)}</div>
  <div id="emoji-drawer-grid" className="emoji-drawer-grid" role="tabpanel" aria-label={query?'Resultados da busca de emojis':categories.find(group=>group.id===category).name}>{items.map(([emoji,label])=><button key={emoji} type="button" className="emoji-choice" title={label} aria-label={'Adicionar emoji: '+label} onClick={()=>onSelect(emoji)}>{emoji}</button>)}{!items.length&&<p className="emoji-no-results">Nenhum emoji por aqui. Tente outro nome.</p>}</div>
  <p className="emoji-drawer-message" role="status">{message||'Adicione quantos quiser, até 32 caracteres no nome.'}</p>
  <button type="button" className="emoji-drawer-done" onClick={onClose}><Check size={19}/>Pronto</button>
 </section></div>;
}
