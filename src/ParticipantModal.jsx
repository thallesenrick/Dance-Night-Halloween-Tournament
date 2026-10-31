import React,{useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Check,X,Smile} from 'lucide-react';
import CameraStudio from './CameraStudio.jsx';
import EmojiDrawer from './EmojiDrawer.jsx';
import './participant-modal.css';
const stopTracks=stream=>stream?.getTracks().forEach(track=>track.stop());
const nameSegmenter=new Intl.Segmenter('pt-BR',{granularity:'grapheme'});
const nameGraphemes=value=>[...nameSegmenter.segment(value)];
const limitName=value=>nameGraphemes(value).slice(0,32).map(part=>part.segment).join('');
const safeSelection=(value,start,end)=>{
 const boundaries=[...nameGraphemes(value).map(part=>part.index),value.length];
 const before=index=>boundaries.filter(boundary=>boundary<=index).at(-1)??0;
 const after=index=>boundaries.find(boundary=>boundary>=index)??value.length;
 return start===end?{start:after(start),end:after(end)}:{start:before(start),end:after(end)};
};
export default function ParticipantModal({onClose,onSave}){
 const [name,setName]=useState(''),[photo,setPhoto]=useState(''),[stream,setStream]=useState(null),[cameraState,setCameraState]=useState('loading'),[cameraError,setCameraError]=useState(''),[photoError,setPhotoError]=useState(''),[uploading,setUploading]=useState(false),[emojisOpen,setEmojisOpen]=useState(false),[emojiMessage,setEmojiMessage]=useState('');
 const panel=useRef(null),nameInput=useRef(null),fileInput=useRef(null),streamRef=useRef(null),mounted=useRef(false),cameraRequest=useRef(0),photoRequest=useRef(0),nameSelection=useRef({start:0,end:0}),restoreNameFocus=useRef(false);
 const stopCamera=useCallback(()=>{cameraRequest.current++;stopTracks(streamRef.current);streamRef.current=null;setStream(null)},[]);
 const startCamera=useCallback(async()=>{
  const request=++cameraRequest.current;
  stopTracks(streamRef.current);streamRef.current=null;setStream(null);setCameraState('loading');setCameraError('');
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw Error('unavailable');
   const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:720}},audio:false});
   if(!mounted.current||request!==cameraRequest.current){stopTracks(next);return}
   streamRef.current=next;setStream(next);setCameraState('live');
  }catch(error){
   if(!mounted.current||request!==cameraRequest.current)return;
   setCameraState('error');setCameraError(error.name==='NotAllowedError'?'Permita o acesso à câmera ou envie uma foto ao lado.':error.name==='NotFoundError'?'Não encontramos uma câmera. Você pode enviar uma foto ao lado.':'Não foi possível abrir a câmera. Tente novamente ou envie uma foto.');
  }
 },[]);
 useEffect(()=>{
  mounted.current=true;startCamera();
  return()=>{mounted.current=false;cameraRequest.current++;photoRequest.current++;stopTracks(streamRef.current);streamRef.current=null};
 },[startCamera]);
 useEffect(()=>{const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';nameInput.current?.focus();return()=>{document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus()}},[]);
 const capture=image=>{photoRequest.current++;setUploading(false);setPhoto(image);setPhotoError('');if(fileInput.current)fileInput.current.value='';stopCamera();setCameraState('captured')};
 const retake=()=>{photoRequest.current++;setUploading(false);setPhoto('');setPhotoError('');if(fileInput.current)fileInput.current.value='';startCamera()};
 const upload=async event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){setPhotoError('Escolha um arquivo de imagem.');event.target.value='';return}
  const request=++photoRequest.current,url=URL.createObjectURL(file);setUploading(true);setPhotoError('');
  try{
   const image=new Image();image.src=url;await image.decode();
   if(!mounted.current||request!==photoRequest.current)return;
   const canvas=document.createElement('canvas');canvas.width=canvas.height=480;const side=Math.min(image.naturalWidth,image.naturalHeight);
   if(!side)throw Error('empty image');
   canvas.getContext('2d').drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,480,480);
   setPhoto(canvas.toDataURL('image/jpeg',.88));stopCamera();setCameraState('captured');
  }catch{
   if(mounted.current&&request===photoRequest.current){setPhotoError('Não conseguimos ler essa foto. Tente uma imagem JPG, PNG ou WebP.');if(fileInput.current)fileInput.current.value=''}
  }finally{URL.revokeObjectURL(url);if(mounted.current&&request===photoRequest.current)setUploading(false)}
 };
 const openEmojis=()=>{
  const input=nameInput.current;nameSelection.current=safeSelection(name,input?.selectionStart??name.length,input?.selectionEnd??name.length);
  restoreNameFocus.current=true;setEmojiMessage('');setEmojisOpen(true);
 };
 const insertEmoji=emoji=>{
  const selected=safeSelection(name,nameSelection.current.start,nameSelection.current.end);
  const next=name.slice(0,selected.start)+emoji+name.slice(selected.end);
  if(nameGraphemes(next).length>32){setEmojiMessage('Seu nome já tem 32 caracteres. Apague um pouco para adicionar outro emoji.');return}
  const caret=selected.start+emoji.length;nameSelection.current={start:caret,end:caret};setName(next);setEmojiMessage('');
 };
 useLayoutEffect(()=>{
  if(emojisOpen||!restoreNameFocus.current)return;
  restoreNameFocus.current=false;nameInput.current?.focus();nameInput.current?.setSelectionRange(nameSelection.current.start,nameSelection.current.end);
 },[emojisOpen]);
 const save=event=>{event.preventDefault();if(!name.trim()||uploading)return;onSave({name:name.trim(),photo})};
 const keydown=event=>{
  if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();onClose()}
  if(event.key==='Tab'){
   const elements=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')].filter(n=>n.getClientRects().length),first=elements[0],last=elements.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
 };
 return <div className="participant-modal-overlay" onClick={event=>{if(event.target===event.currentTarget&&!emojisOpen)onClose()}}><section ref={panel} className="participant-modal" role="dialog" aria-modal={!emojisOpen} aria-hidden={emojisOpen||undefined} inert={emojisOpen||undefined} aria-labelledby="participant-title" onKeyDown={keydown}><button type="button" className="participant-modal-close" aria-label="Fechar cadastro" onClick={onClose}><X size={23}/></button><CameraStudio stream={stream} photo={photo} onPhoto={capture} onRetake={retake} cameraState={cameraState} cameraError={cameraError} onRetry={retake}/><div className="participant-details"><span className="participant-kicker">UM NOVO ESPÍRITO NA PISTA</span><h2 id="participant-title">Adicionar participante</h2><p className="participant-intro">Foto, nome e bora pra pista.</p><form className="participant-form" onSubmit={save}><div className="participant-name-label"><label htmlFor="participant-name">Nome do participante</label><div className="participant-name-field"><input id="participant-name" ref={nameInput} value={name} onChange={event=>setName(limitName(event.target.value))} onSelect={event=>{nameSelection.current={start:event.currentTarget.selectionStart??0,end:event.currentTarget.selectionEnd??0}}} placeholder="Como você se chama?" required autoComplete="off" aria-describedby="participant-name-limit"/><button type="button" className="participant-name-emoji" aria-label="Adicionar emojis ao nome" title="Adicionar emojis ao nome" aria-haspopup="dialog" aria-expanded={emojisOpen} onClick={openEmojis}><Smile size={22} aria-hidden="true"/></button></div><span id="participant-name-limit" className="participant-name-limit">Até 32 caracteres. Use a carinha para adicionar emojis ao nome.</span></div><label className="participant-upload-label">Ou envie uma foto<input ref={fileInput} className="participant-upload" type="file" accept="image/*" onChange={upload}/></label><p className="participant-photo-feedback" role={photoError?'alert':'status'}>{photoError||(uploading?'Preparando sua foto…':photo?'Foto pronta para salvar.':'Tire uma foto ou envie uma imagem. A foto é opcional.')}</p><button type="submit" className="participant-save" disabled={!name.trim()||uploading}><Check size={20}/>{uploading?'Preparando foto…':'Salvar participante'}</button></form></div></section>{emojisOpen&&<EmojiDrawer name={name} message={emojiMessage} onSelect={insertEmoji} onClose={()=>setEmojisOpen(false)}/>}</div>;
}
