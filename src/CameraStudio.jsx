import React,{useEffect,useRef,useState} from 'react';
import {Camera,RotateCcw,Sparkles,ChevronDown} from 'lucide-react';

const effects=[
 {id:'none',name:'Sem efeito'},
 {id:'bunny',name:'Coelhinho'},
 {id:'hearts',name:'Corações'},
 {id:'skulls',name:'Caveiras'},
 {id:'devil',name:'Chifrinhos'},
 {id:'cat',name:'Gatinho'},
 {id:'angel',name:'Anjinho'}
];

export default function CameraStudio({stream,photo,onPhoto,onRetake,cameraState,cameraError,onRetry}){
 const video=useRef(null),overlay=useRef(null),engine=useRef(null),selected=useRef(0);
 const [effect,setEffect]=useState(0),[readyStream,setReadyStream]=useState(null),[arReady,setArReady]=useState(false),[tracking,setTracking]=useState('loading');
 const [arError,setArError]=useState(''),[mediaError,setMediaError]=useState(''),[captureError,setCaptureError]=useState('');
 const live=Boolean(stream)&&cameraState==='live'&&!photo;
 const ready=live&&readyStream===stream&&!mediaError;

 useEffect(()=>{
  const element=video.current;
  let cancelled=false;
  setReadyStream(null);setArReady(false);setTracking('loading');setArError('');setMediaError('');setCaptureError('');
  if(element){
   element.srcObject=stream||null;
   if(stream)element.play().catch(()=>{if(!cancelled)setMediaError('Não foi possível exibir a câmera. Tente abrir novamente.');});
  }
  return()=>{
   cancelled=true;
   if(element?.srcObject===stream)element.srcObject=null;
  };
 },[stream]);

 useEffect(()=>{
  if(!ready){setArReady(false);return;}
  let cancelled=false,instance=null;
  const dispose=()=>{
   if(!instance)return;
   const current=instance;instance=null;
   if(engine.current===current)engine.current=null;
   current.dispose();
  };
  (async()=>{
   try{
    const {createFaceEffects}=await import('./faceEffects');
    if(cancelled)return;
    const created=await createFaceEffects(video.current,overlay.current,status=>{
     if(cancelled)return;
     setTracking(status);
     setArError(status==='error'?'Filtros indisponíveis. Você pode fotografar sem efeito.':'');
    });
    if(cancelled){created.dispose();return;}
    instance=created;engine.current=created;
    created.setEffect(effects[selected.current].id);
    setArReady(true);setTracking('searching');
   }catch(error){
    dispose();
    if(cancelled)return;
    console.error('3D effects initialization failed:',error);
    selected.current=0;setEffect(0);setArReady(false);setTracking('error');
    setArError('Filtros indisponíveis. Você pode fotografar sem efeito.');
   }
  })();
  return()=>{cancelled=true;dispose();};
 },[ready,stream]);

 const choose=index=>{
  selected.current=index;setEffect(index);setCaptureError('');setArError('');
  engine.current?.setEffect(effects[index].id);
  setTracking(arReady?'searching':'loading');
 };
 const capture=()=>{
  const source=video.current;
  if(!ready||!source?.videoWidth||(effect>0&&(!arReady||tracking!=='tracking')))return;
  try{
   engine.current?.render();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=480;
   const context=canvas.getContext('2d');
   if(!context)throw new Error('Photo canvas unavailable');
   const side=Math.min(source.videoWidth,source.videoHeight),sx=(source.videoWidth-side)/2,sy=(source.videoHeight-side)/2;
   context.translate(480,0);context.scale(-1,1);
   context.drawImage(source,sx,sy,side,side,0,0,480,480);
   if(effect>0){
    const accessory=overlay.current,ratio=accessory.width/source.videoWidth;
    context.drawImage(accessory,sx*ratio,sy*ratio,side*ratio,side*ratio,0,0,480,480);
   }
   setCaptureError('');
   onPhoto(canvas.toDataURL('image/jpeg',.9));
  }catch{
   setCaptureError('Não foi possível tirar a foto. Tente novamente.');
  }
 };
 const canCapture=ready&&(effect===0||(arReady&&tracking==='tracking'));
 const error=cameraError||mediaError;
 const unavailable=cameraState==='error'||Boolean(error);
 const showPlaceholder=!photo&&(!ready||unavailable);
 const status=photo?'Foto pronta!':captureError||arError||(!ready?'':!arReady?'Carregando filtros…':effect===0?'Escolha um filtro ou tire sua foto.':tracking==='tracking'?'Seu filtro está acompanhando o rosto.':'Olhe para a câmera para encaixar o filtro.');

 return <div className="participant-camera" data-camera-state={cameraState}>
  <span className="participant-camera-tag">PHOTO BOOTH ✦</span>
  <div className="participant-camera-view">
   <div className="participant-camera-live">
    <video ref={video} className="participant-camera-video" autoPlay muted playsInline aria-hidden="true" onLoadedData={event=>{
     if(live&&event.currentTarget.srcObject===stream&&event.currentTarget.videoWidth)setReadyStream(stream);
    }} onError={()=>{setReadyStream(null);setMediaError('A câmera foi interrompida. Tente abrir novamente.');}}/>
    <canvas ref={overlay} className="participant-camera-ar" aria-hidden="true" hidden={!live||effect===0}/>
   </div>
   {photo&&<img className="participant-camera-photo" src={photo} alt="Prévia da foto do participante"/>}
   {!photo&&<div className="participant-camera-guide" aria-hidden="true"/>}
   {showPlaceholder&&<div className="participant-camera-placeholder">
    <Camera aria-hidden="true"/>
    <div className="participant-camera-placeholder-copy"><strong>{unavailable?'Vamos tentar de novo?':'Prepare o seu melhor sorriso'}</strong><p>{error||(unavailable?'Não foi possível abrir a câmera. Você também pode enviar uma foto ao lado.':'Abrindo a câmera…')}</p></div>
    {unavailable&&<button type="button" className="participant-camera-retry" onClick={onRetry}><RotateCcw aria-hidden="true"/>Tentar novamente</button>}
   </div>}
   <p className="participant-camera-status" role="status" aria-live="polite">{status}</p>
   <div className="participant-camera-controls">
    {!photo&&<label className="participant-filter-control" htmlFor="participant-camera-filter" title="Filtros da câmera">
     <Sparkles aria-hidden="true"/>
     <select id="participant-camera-filter" aria-label="Filtros da câmera" value={effect} disabled={!ready||Boolean(photo)} onChange={event=>choose(Number(event.target.value))}>
      {effects.map((item,index)=><option key={item.id} value={index} disabled={index>0&&!arReady}>{item.name}</option>)}
     </select>
     <ChevronDown className="participant-filter-chevron" aria-hidden="true"/>
    </label>}
    {photo?<button type="button" className="participant-retake" onClick={onRetake}><RotateCcw aria-hidden="true"/>Tirar outra foto</button>:<button type="button" className="participant-camera-shutter" disabled={!canCapture} onClick={capture} aria-label="Tirar foto"><span aria-hidden="true"/></button>}
   </div>
  </div>
 </div>;
}
