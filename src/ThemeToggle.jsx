import React from 'react';
import {Sun,Moon} from 'lucide-react';
export default function ThemeToggle({theme,onToggle,disabled=false}){
 const dark=theme==='dark';
 return <button type="button" className="theme-toggle" disabled={disabled} role="switch" aria-label="Modo escuro" aria-checked={dark} onClick={onToggle} title={dark?'Ativar modo claro':'Ativar modo escuro'}><span className="theme-toggle-track" aria-hidden="true"><span className="theme-toggle-thumb"/><Sun className="theme-sun" size={18}/><Moon className="theme-moon" size={18}/></span></button>;
}

