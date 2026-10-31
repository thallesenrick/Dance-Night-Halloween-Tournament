import {createId} from './id.js';
import React,{useEffect,useRef,useState} from 'react';
import {X,Users,Search,Disc3,Plus,Pencil,Trash2,GripVertical,Check,ArrowLeft} from 'lucide-react';
import {DIFFICULTIES,reorderMusic} from './music-library.js';
import './music-editor.css';

export default function MusicLibraryEditor({library,initialCount,onClose,onSave}){
 const [draft,setDraft]=useState(()=>library.map(song=>({...song}))),[count,setCount]=useState(initialCount),[search,setSearch]=useState(''),[form,setForm]=useState(null),[feedback,setFeedback]=useState(''),[discard,setDiscard]=useState(null),[dragged,setDragged]=useState(null);
 const panel=useRef(null),searchInput=useRef(null),titleInput=useRef(null),discardButton=useRef(null),tabRefs=useRef({}),initialForm=useRef('');
 const formChanged=Boolean(form)&&JSON.stringify(form)!==initialForm.current;
 const visible=draft.filter(song=>song.players===count&&`${song.title} ${song.artist}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').includes(search.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim()));
 useEffect(()=>{const previous=document.activeElement;searchInput.current?.focus();return()=>{if(previous?.isConnected)previous.focus()}},[]);
 useEffect(()=>{setDraft(library.map(song=>({...song})))},[library]);
 useEffect(()=>{(form?titleInput:searchInput).current?.focus()},[Boolean(form)]);
 useEffect(()=>{if(discard)discardButton.current?.focus()},[discard]);
 useEffect(()=>{if(panel.current&&!panel.current.contains(document.activeElement))(discard?discardButton:form?titleInput:searchInput).current?.focus()},[draft,form,discard,count,search]);
 const requestClose=()=>{if(formChanged)setDiscard('close');else onClose()};
 const resetForm=()=>{setForm(null);setDiscard(null);setFeedback('')};
 const cancelForm=()=>{if(formChanged)setDiscard('form');else resetForm()};
 const changeTab=n=>{if(form){setFeedback('Conclua ou cancele a edição da música antes de trocar de aba.');return}setCount(n);setSearch('');setFeedback('');setDiscard(null)};
 const edit=song=>{initialForm.current=JSON.stringify(song);setForm({...song});setFeedback('');setDiscard(null)};
 const add=()=>edit({id:'',title:'',artist:'',edition:'',difficulty:'Médio',players:count});
 const commit=next=>{setDraft(next);onSave(next)};
 const saveSong=event=>{
  event.preventDefault();if(!form.title.trim()||!form.artist.trim())return;
  const entry={...form,id:form.id||createId(),title:form.title.trim(),artist:form.artist.trim(),edition:form.edition.trim()};
  commit(form.id?draft.map(song=>song.id===form.id?entry:song):[...draft,entry]);setCount(entry.players);setSearch('');setForm(null);setDiscard(null);setFeedback('Música salva.');
 };
 const remove=id=>{commit(draft.filter(song=>song.id!==id));setFeedback('Música removida.')};
 const reorder=(from,to)=>{const next=reorderMusic(draft,from,to);if(next!==draft){commit(next);setFeedback('Ordem atualizada.')}};
 const keydown=event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(discard)setDiscard(null);else if(form)cancelForm();else requestClose()}
  if(event.key==='Tab'){
   const items=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')].filter(n=>n.getClientRects().length),first=items[0],last=items.at(-1);
   if(!items.includes(document.activeElement)){event.preventDefault();(event.shiftKey?last:first)?.focus()}
   else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
 };
 return <div className="music-editor-backdrop" onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)requestClose()}}><section ref={panel} className="music-editor" role="dialog" aria-modal="true" aria-labelledby="music-editor-title" onKeyDown={keydown}>
  <header className="music-editor-header"><div className="music-editor-heading"><Disc3 size={42} aria-hidden="true"/><div><h3 id="music-editor-title">Editar roleta de músicas</h3><p>Sua seleção, do seu jeito. Prepare os próximos hits.</p></div></div><button type="button" className="music-editor-close" aria-label="Fechar edição de músicas" onClick={requestClose}><X size={23}/></button></header>
  <div className="music-editor-tabs" role="tablist" aria-label="Músicas por participantes">{[1,2,3,4].map(n=><button ref={node=>{tabRefs.current[n]=node}} key={n} type="button" role="tab" id={'music-tab-'+n} aria-controls="music-editor-panel" aria-selected={count===n} tabIndex={count===n?0:-1} disabled={Boolean(form)&&count!==n} onClick={()=>changeTab(n)} onKeyDown={event=>{let next;if(event.key==='ArrowRight')next=n%4+1;else if(event.key==='ArrowLeft')next=(n+2)%4+1;else if(event.key==='Home')next=1;else if(event.key==='End')next=4;if(next){event.preventDefault();if(!form){changeTab(next);tabRefs.current[next]?.focus()}}}}><Users size={17}/><span>{n} {n===1?'pessoa':'pessoas'}</span><small>{draft.filter(song=>song.players===n).length}</small></button>)}</div>
  <div id="music-editor-panel" role="tabpanel" aria-labelledby={'music-tab-'+count} className="music-editor-body">
   {form?<form className="music-song-form" onSubmit={saveSong}><h4>{form.id?'Editar música':'Adicionar música'}</h4><label>Nome da música<input ref={titleInput} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} maxLength={120} required placeholder="Qual é o próximo hit?"/></label><label>Artista<input value={form.artist} onChange={e=>setForm({...form,artist:e.target.value})} maxLength={120} required placeholder="Quem canta?"/></label><div className="music-song-form-grid"><label>Participantes<select value={form.players} onChange={e=>setForm({...form,players:Number(e.target.value)})}>{[1,2,3,4].map(n=><option key={n} value={n}>{n} {n===1?'pessoa':'pessoas'}</option>)}</select></label><label>Dificuldade<select value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}>{DIFFICULTIES.map(value=><option key={value}>{value}</option>)}</select></label><label>Edição do Just Dance<input value={form.edition} onChange={e=>setForm({...form,edition:e.target.value})} maxLength={24} placeholder="Ex.: JD2025"/></label></div><div className="music-song-form-actions"><button type="button" className="music-form-cancel" onClick={cancelForm}><ArrowLeft size={17}/>Cancelar</button><button type="submit" className="music-form-save" disabled={!form.title.trim()||!form.artist.trim()}><Check size={18}/>{form.id?'Salvar alterações':'Salvar música'}</button></div></form>:<><div className="music-editor-toolbar"><label className="music-editor-search"><Search size={19} aria-hidden="true"/><input ref={searchInput} type="search" aria-label="Buscar música" placeholder="Buscar música ou artista…" value={search} onChange={event=>setSearch(event.target.value)}/></label></div><p id="music-reorder-hint" className="roulette-a11y">Arraste pela alça ou use as setas para cima e para baixo para reordenar.</p><div className="music-editor-list" role="list" aria-label={'Lista de músicas para '+count+' '+(count===1?'pessoa':'pessoas')}>{visible.map((song,index)=><div className={'music-editor-row'+(dragged===song.id?' is-dragging':'')} key={song.id} role="listitem" data-song-id={song.id} onDragOver={event=>{if(dragged){event.preventDefault();event.dataTransfer.dropEffect='move'}}} onDrop={event=>{event.preventDefault();if(dragged)reorder(dragged,song.id);setDragged(null)}}><button type="button" className="music-row-grip" draggable aria-label={'Reordenar '+song.title} aria-describedby="music-reorder-hint" title="Arraste ou use ↑ e ↓ para reordenar" onDragStart={event=>{setDragged(song.id);event.dataTransfer.setData('text/plain',song.id);event.dataTransfer.effectAllowed='move'}} onDragEnd={()=>setDragged(null)} onKeyDown={event=>{if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();const other=visible[index+(event.key==='ArrowUp'?-1:1)];if(other)reorder(song.id,other.id)}}}><GripVertical size={17}/></button><div className="music-row-copy"><strong>{song.title}</strong><span>{song.artist}</span></div><button type="button" className="music-row-edit" aria-label={'Editar '+song.title} onClick={()=>edit(song)}><Pencil size={18}/></button><button type="button" className="music-row-delete" aria-label={'Excluir '+song.title} onClick={()=>remove(song.id)}><Trash2 size={18}/></button></div>)}{!visible.length&&<div className="music-editor-empty"><Disc3 size={36}/><strong>{search?'Nenhuma música encontrada.':'A pista está esperando seus hits.'}</strong><p>{search?'Tente outro nome ou artista.':'Adicione a primeira música desta categoria.'}</p></div>}</div></>}
  </div>
  <p className="roulette-a11y" role="status" aria-live="polite">{feedback}</p>
  {(discard||!form)&&<footer className="music-editor-footer">{discard?<div className="music-editor-discard" role="alert"><p>Descartar a edição desta música?</p><button ref={discardButton} type="button" onClick={()=>setDiscard(null)}>Continuar editando</button><button type="button" onClick={()=>{if(discard==='close')onClose();else resetForm()}}>Descartar edição</button></div>:<div className="music-editor-actions"><button type="button" className="music-editor-add" onClick={add}><Plus size={20}/>Adicionar música</button></div>}</footer>}
 </section></div>;
}
