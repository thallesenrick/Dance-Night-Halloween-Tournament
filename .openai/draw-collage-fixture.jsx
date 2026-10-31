import React from 'react';
import {createRoot} from 'react-dom/client';
import ParticipantDraw from '../src/ParticipantDraw.jsx';
export function mountDrawFixture(){const host=document.createElement('div');document.body.append(host);const root=createRoot(host);root.render(<ParticipantDraw players={['Lucas','Cynthia','Abraão','Pablo','Amélia Carmesina','Marília 🎃','João','Nina'].map((name,index)=>({id:'draw-'+index,name}))} onComplete={()=>{}} onCancel={()=>root.unmount()}/>);return()=>{root.unmount();host.remove()}}
