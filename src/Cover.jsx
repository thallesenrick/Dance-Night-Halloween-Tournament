import React from 'react';
import {ArrowUpRight} from 'lucide-react';
import './cover-controls.css';
export default function Cover({onStart,onVote}){
 return <main className="collage-cover" aria-label="Halloween Ball Night">
  <img className="collage-art" src="/halloween-collage.png" alt="Colagem vintage de Halloween com bolas de disco, gatos pretos, esqueletos, abóboras e estrelas" fetchPriority="high"/>
  <div className="cover-floating" aria-hidden="true">
   <span className="floating-piece foil-star star-one">✦</span>
   <span className="floating-piece foil-star star-two">✶</span>
   <span className="floating-piece ink-star star-three">✦</span>
   <span className="floating-piece little-spark spark-one">✧</span>
   <span className="floating-piece little-spark spark-two">✧</span>
   <div className="floating-piece cutout-disco"><div className="disco-thread"/><div className="disco-mirror"/><span className="disco-spark">✦</span></div>
   <svg className="floating-piece paper-bat" viewBox="0 0 150 80"><path d="M75 35 65 20 64 36C43 22 28 14 5 8 15 28 9 42 3 49 25 39 34 49 39 61 50 48 63 61 75 75 87 61 100 48 111 61 116 49 125 39 147 49 141 42 135 28 145 8 122 14 107 22 86 36L85 20Z" fill="#211716"/><circle cx="71" cy="42" r="1.5" fill="#dda543"/><circle cx="79" cy="42" r="1.5" fill="#dda543"/></svg>
  </div>
  <section className="cover-invite"><p className="cover-kicker">YOU'RE INVITED TO THE</p><h1>Halloween<span>Ball Night</span></h1><p className="cover-note">Uma noite para dançar até o além.</p>
   <div className="cover-actions"><button className="cover-start" onClick={onStart} aria-label="Começar o torneio"><span className="cover-button-label">Torneio</span><ArrowUpRight className="cover-button-arrow" size={24} aria-hidden="true"/></button><button className="cover-start cover-vote" onClick={onVote}><span className="cover-button-label">Votação</span><ArrowUpRight className="cover-button-arrow" size={24} aria-hidden="true"/></button></div>
  </section>
 </main>;
}


