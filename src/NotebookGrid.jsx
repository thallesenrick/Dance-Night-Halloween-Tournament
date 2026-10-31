import React,{memo,useEffect,useState} from 'react';
import ShapeGrid from './vendor/react-bits/ShapeGrid';
import './notebook-grid.css';
export default memo(function NotebookGrid({theme='light'}){
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 const dark=theme==='dark';
 return <div className="notebook-grid" aria-hidden="true"><ShapeGrid key={reduced?'still':'moving'} shape="square" cellSize={16} lineWidth={.6} direction="diagonal" speed={.05} lineColor={dark?'rgba(222,177,213,.12)':'rgba(132,111,156,.12)'} interactive={false} hoverColor="transparent" hoverFillColor="transparent" fillOpacity={0} radius={0} trail={.25} glow={0} twinkle={0} clickCascade={false} intro={false} fade={.5} paused={reduced} dpr={Math.min(window.devicePixelRatio||1,1.5)} backgroundColor="transparent"/></div>;
});

