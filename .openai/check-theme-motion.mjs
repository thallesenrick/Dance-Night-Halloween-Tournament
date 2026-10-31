import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5174/');await page.getByRole('button',{name:'Começar o torneio',exact:true}).click();await page.getByRole('button',{name:/Criar torneio/}).click();
 if(await page.locator('.dashboard-float').count())throw Error('Dashboard floating stickers remain');if(await page.locator('.party-roster h2>span').count())throw Error('Sidebar floating star remains');
 const toggle=page.getByRole('switch',{name:'Modo escuro',exact:true});
 await toggle.click();await page.waitForFunction(()=>document.documentElement.classList.contains('theme-transitioning'));
 const animation=await page.evaluate(()=>{const element=document.documentElement;const style=getComputedStyle(element,'::view-transition-new(root)');return {mask:style.maskImage,originX:element.style.getPropertyValue('--theme-origin-x'),animations:element.getAnimations({subtree:true}).map(a=>a.effect?.pseudoElement)}});console.log('RADIAL',JSON.stringify(animation));if(!animation.mask.includes('radial-gradient'))throw Error('Radial mask missing');
 await page.locator('.bat-burst').waitFor({timeout:5000});const flights=await page.locator('.bat-flight').evaluateAll(ns=>ns.map(n=>({path:n.style.offsetPath,duration:n.style.getPropertyValue('--bat-duration'),flap:n.style.getPropertyValue('--bat-flap')})));if(flights.length!==14||new Set(flights.map(n=>n.path)).size!==14||flights.some(n=>!n.path.includes('C')))throw Error('Bats are not randomized cubic paths');
 if(flights.some(n=>Number(n.path.match(/M[\d.\-]+ ([\d.\-]+)/)?.[1])<768))throw Error('Bats do not start below screen');
 await page.waitForTimeout(1100);await page.screenshot({path:'.openai/roulette-qa/natural-bats.png'});await page.locator('.bat-burst').waitFor({state:'detached',timeout:7000});
 await toggle.click();await page.locator('.sparkle-burst').waitFor({timeout:5000});if(await page.locator('.theme-sparkle svg').count()!==30)throw Error('Missing light sparkles');await page.screenshot({path:'.openai/roulette-qa/light-sparkles.png'});await page.locator('.sparkle-burst').waitFor({state:'detached',timeout:5000});
 await page.emulateMedia({reducedMotion:'reduce'});await toggle.click();if(await page.locator('.theme-particles').count()||await page.locator('.theme-transitioning').count())throw Error('Motion ignored accessibility setting');if(await page.locator('html').getAttribute('data-theme')!=='dark')throw Error('Reduced motion theme not changed');
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: radial reveal, bottom-up randomized curves, natural bat variety, sparkle cleanup, no dashboard floaters, reduced motion');
}finally{await browser.close()}
