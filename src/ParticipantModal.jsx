import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Check,X} from 'lucide-react';
import CameraStudio from './CameraStudio.jsx';
import './participant-modal.css';
const stopTracks=stream=>stream?.getTracks().forEach(track=>track.stop());
export default function ParticipantModal({onClose,onSave}){
 const [name,setName]=useState(''),[photo,setPhoto]=useState(''),[stream,setStream]=useState(null),[cameraState,setCameraState]=useState('loading'),[cameraError,setCameraError]=useState(''),[photoError,setPhotoError]=useState(''),[uploading,setUploading]=useState(false);
 const panel=useRef(null),nameInput=useRef(null),fileInput=useRef(null),streamRef=useRef(null),mounted=useRef(false),cameraRequest=useRef(0),photoRequest=useRef(0);
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
 const save=event=>{event.preventDefault();if(!name.trim()||uploading)return;onSave({name:name.trim(),photo})};
 const keydown=event=>{
  if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();onClose()}
  if(event.key==='Tab'){
   const elements=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)')].filter(n=>n.getClientRects().length),first=elements[0],last=elements.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  }
 };
 return <div className="participant-modal-overlay" onClick={event=>{if(event.target===event.currentTarget)onClose()}}><section ref={panel} className="participant-modal" role="dialog" aria-modal="true" aria-labelledby="participant-title" onKeyDown={keydown}><button type="button" className="participant-modal-close" aria-label="Fechar cadastro" onClick={onClose}><X size={23}/></button><CameraStudio stream={stream} photo={photo} onPhoto={capture} onRetake={retake} cameraState={cameraState} cameraError={cameraError} onRetry={retake}/><div className="participant-details"><span className="participant-kicker">UM NOVO ESPÍRITO NA PISTA</span><h2 id="participant-title">Adicionar participante</h2><p className="participant-intro">Foto, nome e bora pra pista.</p><form className="participant-form" onSubmit={save}><label className="participant-name-label">Nome do participante<input ref={nameInput} value={name} onChange={e=>setName(e.target.value)} placeholder="Como você se chama?" maxLength={32} required autoComplete="off"/></label><label className="participant-upload-label">Ou envie uma foto<input ref={fileInput} className="participant-upload" type="file" accept="image/*" onChange={upload}/></label><p className="participant-photo-feedback" role={photoError?'alert':'status'}>{photoError||(uploading?'Preparando sua foto…':photo?'Foto pronta para salvar.':'Tire uma foto ou envie uma imagem. A foto é opcional.')}</p><button type="submit" className="participant-save" disabled={!name.trim()||uploading}><Check size={20}/>{uploading?'Preparando foto…':'Salvar participante'}</button></form></div></section></div>;
}
