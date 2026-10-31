import React from 'react';
import {createRoot} from 'react-dom/client';
import ShapeGrid from '../src/vendor/react-bits/ShapeGrid.jsx';
export function mountGrid(){const host=document.createElement('div');host.id='hover-grid-fixture';host.style.cssText='position:fixed;left:0;top:0;width:1000px;height:500px;background:white;z-index:100';document.body.append(host);const root=createRoot(host);root.render(<ShapeGrid interactive={false} speed={0} direction="none" intro={false} fade={0} lineColor="#888888" hoverColor="#ff0000" hoverFillColor="#ff0000" fillOpacity={1} radius={4} glow={1} clickCascade={true}/>);return()=>{root.unmount();host.remove()}}
