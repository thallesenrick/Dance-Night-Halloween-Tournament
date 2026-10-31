import {flushSync} from 'react-dom';
import './theme-transition.css';
// Reveal the real new page through a feathered radial mask, keeping its old snapshot below.
export async function revealTheme({x,y,update,onStart}){
 const root=document.documentElement;
 if(!document.startViewTransition||window.matchMedia('(prefers-reduced-motion: reduce)').matches){update();return}
 root.style.setProperty('--theme-origin-x',`${x}px`);
 root.style.setProperty('--theme-origin-y',`${y}px`);
 root.classList.add('theme-transitioning');
 let transition;
 try{
  transition=document.startViewTransition(()=>flushSync(update));onStart?.(transition);
  await transition.ready;
  const radius=Math.hypot(Math.max(x,window.innerWidth-x),Math.max(y,window.innerHeight-y))+130;
  root.animate({'--theme-reveal-radius':['0px',`${radius}px`]},{duration:1100,easing:'cubic-bezier(.22,.68,.18,1)',fill:'both',pseudoElement:'::view-transition-new(root)'});
  await transition.finished;
 }catch{
  transition?.skipTransition();update();
 }finally{
  root.classList.remove('theme-transitioning');root.style.removeProperty('--theme-origin-x');root.style.removeProperty('--theme-origin-y');
 }
}
