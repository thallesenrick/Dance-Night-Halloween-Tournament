import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5174/');
 const toggle=page.getByRole('switch',{name:'Modo escuro',exact:true});await toggle.waitFor();if(await toggle.getAttribute('aria-checked')!=='false')throw Error('Initial theme');
 await toggle.click();await page.locator('.bat-burst').waitFor();if(await page.locator('.bat-flight svg').count()!==14)throw Error('Missing SVG bats');await page.locator('.bat-burst').waitFor({state:'detached',timeout:5000});
 if(await page.locator('html').getAttribute('data-theme')!=='dark')throw Error('Theme not set');
 await page.getByRole('button',{name:'Começar o torneio',exact:true}).click();await page.getByRole('button',{name:/Criar torneio/}).click();
 if(await page.locator('.home-button').innerText())throw Error('Home has visible text');if(await page.locator('.theme-toggle').innerText())throw Error('Theme switch has visible text');if(await page.locator('.party-toolbar').evaluate(n=>getComputedStyle(n,'::before').clipPath)==='none')throw Error('No torn-paper bar');if(await page.getByText('Uma pessoa por espaço inicial, por sorteio.',{exact:false}).count())throw Error('Sidebar helper text remains');
 if(await page.getByText('THE TOURNAMENT LAB',{exact:false}).count())throw Error('Old label remains');
 await page.getByRole('button',{name:'Adicionar participante',exact:true}).click();await page.getByRole('textbox',{name:'Nome do participante'}).fill('Luna');await page.getByRole('button',{name:'Adicionar',exact:true}).click();
 await page.locator('input[aria-label="Nome do espaço"]').first().fill('Grupo salvo');
 const before=await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('halloween-v1'))));
 const darkBg=await page.locator('.space-node').first().evaluate(n=>getComputedStyle(n).background);
 await page.screenshot({path:'.openai/roulette-qa/theme-dark-dashboard.png'});
 await page.getByRole('button',{name:'Voltar para o início',exact:true}).click();await page.getByRole('button',{name:'Começar o torneio',exact:true}).waitFor();if(await toggle.getAttribute('aria-checked')!=='true')throw Error('Theme changed at home');
 await page.screenshot({path:'.openai/roulette-qa/theme-dark-home.png'});await page.reload();await page.getByRole('button',{name:'Começar o torneio',exact:true}).click();
 if(await page.locator('input[aria-label="Nome do espaço"]').first().inputValue()!=='Grupo salvo')throw Error('Lost board after navigation');
 if(await page.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('halloween-v1'))))!==before)throw Error('Lost saved data');
 if(await toggle.getAttribute('aria-checked')!=='true')throw Error('Theme not persistent');await toggle.click();const lightBg=await page.locator('.space-node').first().evaluate(n=>getComputedStyle(n).background);if(darkBg===lightBg)throw Error('Card theme unchanged');
 for(const size of [{width:390,height:740},{width:320,height:700}]){await page.setViewportSize(size);await page.waitForTimeout(100);const controls=await page.locator('.party-toolbar button').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom}}));if(controls.some(r=>r.left<0||r.right>size.width+1))throw Error('Toolbar overflow at'+size.width);const sidebar=await page.locator('.party-roster').boundingBox();if(Math.max(...controls.map(r=>r.bottom))>sidebar.y)throw Error('Toolbar overlaps sidebar at'+size.width+' '+JSON.stringify({controls,sidebar}))}
 if(errors.length)throw Error(errors.join('\n'));await page.emulateMedia({reducedMotion:'reduce'});await toggle.click();if(await page.locator('.bat-burst').count())throw Error('Bats do not respect reduced motion');await toggle.click();await page.emulateMedia({reducedMotion:'no-preference'});
 console.log('PASS: unified toolbar, icon-only home and theme slider, SVG bats cleanup and reduced motion, saved navigation, mobile fit');
}finally{await browser.close()}


