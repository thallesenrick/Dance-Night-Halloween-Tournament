import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message)});
const canvasSample=()=>page.locator('.notebook-grid canvas').evaluate(canvas=>{const d=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let hash=2166136261,count=0;for(let i=3;i<d.length;i+=4){if(d[i])count++;if(i%23===3)hash=Math.imul(hash^d[i],16777619)>>>0}return {hash,count,width:canvas.width,height:canvas.height}});
try{
 await page.goto('http://127.0.0.1:5174/');await page.getByRole('button',{name:'Começar o torneio',exact:true}).click();await page.getByRole('button',{name:/Criar torneio/}).click();await page.waitForFunction(()=>document.querySelector('.notebook-grid canvas')?.width>100);
 const one=await canvasSample();await page.waitForTimeout(500);const two=await canvasSample();if(!two.count||one.hash===two.hash)throw Error('Notebook grid is not drawn or moving');console.log('GRID',one,two);
 await page.screenshot({path:'.openai/roulette-qa/notebook-light.png'});
 const toggle=page.getByRole('switch',{name:'Modo escuro',exact:true});await toggle.click();await page.locator('.bat-burst').waitFor({timeout:5000});await toggle.click();await page.locator('.sparkle-burst').waitFor({timeout:5000});
 const colors=await page.locator('.theme-sparkle').evaluateAll(ns=>ns.map(n=>getComputedStyle(n).color));const yellow=new Set(['rgb(245, 184, 0)','rgb(255, 212, 59)','rgb(255, 202, 10)']);if(colors.length!==30||colors.some(c=>!yellow.has(c)))throw Error('Sparkles are not all yellow');await page.waitForTimeout(700);await page.screenshot({path:'.openai/roulette-qa/yellow-sparkles.png'});await page.locator('.sparkle-burst').waitFor({state:'detached',timeout:5000});
 await toggle.click();await page.locator('.bat-burst').waitFor({timeout:5000});const dark=await canvasSample();if(!dark.count)throw Error('Dark grid invisible');await page.screenshot({path:'.openai/roulette-qa/notebook-dark.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const stillOne=await canvasSample();await page.waitForTimeout(350);const stillTwo=await canvasSample();if(stillOne.hash!==stillTwo.hash)throw Error('Reduced motion grid is moving');
 await page.getByRole('button',{name:'Adicionar slot',exact:true}).click();await page.mouse.click(700,160);if(await page.locator('.space-node').count()!==13)throw Error('Grid blocks slot placement');
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: actual React Bits canvas grid moves, yellow-only glints, light/dark rendering, reduced motion and click-through slot creation');
}finally{await browser.close()}

