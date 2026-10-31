import React,{useEffect,useId,useRef} from 'react';
import {Shuffle,X} from 'lucide-react';
import './redraw-confirm.css';

export default function RedrawConfirm({onCancel,onConfirm}){
 const id=useId(),overlay=useRef(null),panel=useRef(null),cancelButton=useRef(null),settled=useRef(false),callbacks=useRef({onCancel,onConfirm});
 callbacks.current={onCancel,onConfirm};
 const respond=accepted=>{if(settled.current)return;settled.current=true;(accepted?callbacks.current.onConfirm:callbacks.current.onCancel)()};
 useEffect(()=>{
  const previous=document.activeElement,overflow=document.body.style.overflow;
  const siblings=[...(overlay.current?.parentElement?.children||[])].filter(node=>node!==overlay.current).map(node=>({node,inert:node.inert}));
  siblings.forEach(({node})=>{node.inert=true});document.body.style.overflow='hidden';cancelButton.current?.focus();
  return()=>{siblings.forEach(({node,inert})=>{node.inert=inert});document.body.style.overflow=overflow;if(previous?.isConnected&&!previous.matches(':disabled'))previous.focus()};
 },[]);
 const keydown=event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();respond(false)}
  if(event.key==='Tab'){
   const buttons=[...panel.current.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);
   if(!buttons.includes(document.activeElement)){event.preventDefault();(event.shiftKey?last:first)?.focus()}
   else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
 };
 return <div ref={overlay} className="redraw-confirm-overlay" onClick={event=>{if(event.target===event.currentTarget)respond(false)}}><section ref={panel} className="redraw-confirm" role="alertdialog" aria-modal="true" aria-labelledby={id+'-title'} aria-describedby={id+'-description '+id+'-note'} onKeyDown={keydown}>
  <button type="button" className="redraw-confirm-close" aria-label="Fechar confirmação do sorteio" onClick={()=>respond(false)}><X size={22} aria-hidden="true"/></button>
  <div className="redraw-confirm-mark" aria-hidden="true"><Shuffle size={34}/></div>
  <span className="redraw-confirm-kicker">MAIS UMA RODADA ✦</span>
  <h2 id={id+'-title'} className="redraw-confirm-title">Sortear novamente?</h2>
  <p id={id+'-description'} className="redraw-confirm-description">Sortear novamente as pessoas e limpar os vencedores?</p>
  <p id={id+'-note'} className="redraw-confirm-note">A lista de convidados e o desenho das chaves serão mantidos.</p>
  <div className="redraw-confirm-actions"><button ref={cancelButton} type="button" className="redraw-confirm-cancel" onClick={()=>respond(false)}>Cancelar</button><button type="button" className="redraw-confirm-accept" onClick={()=>respond(true)}><Shuffle size={18} aria-hidden="true"/>Sortear novamente</button></div>
 </section></div>;
}
