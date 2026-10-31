import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1887,height:860}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5174/');await page.getByRole('button',{name:'Começar o torneio'}).click();await page.getByRole('button',{name:/Criar torneio/}).click();if(await page.locator('.canvas-tools .roster-count').count())throw Error('Participant count still in toolbar');
 await page.getByRole('button',{name:'Recolher participantes',exact:true}).click();await page.getByRole('button',{name:'Expandir participantes (0)',exact:true}).click();
 const fit=await page.locator('.map-zoom>span').innerText();console.log('DEFAULT ZOOM',fit);
 const nodes=await page.locator('.space-node').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}}));const sidebar=await page.locator('.party-roster').boundingBox();if(nodes.some(n=>n.left<0||n.right>sidebar.x||n.top<90||n.bottom>780))throw Error('Default map does not fit');
 await page.screenshot({path:'.openai/roulette-qa/dashboard-default.png'});
 await page.getByRole('button',{name:'Selecionar próxima música',exact:true}).click();await page.locator('.roulette-collage-base').evaluate(image=>image.decode());
 const platter=await page.locator('.scrap-platter').boundingBox();if(Math.abs(platter.width-platter.height)>1)throw Error('Record is not round');
 await page.locator('.scrap-spin').hover();await page.waitForTimeout(600);const animation=await page.locator('.scrap-spin .music-note').first().evaluate(n=>getComputedStyle(n).animationName);if(animation!=='music-note-rise')throw Error('Notes do not animate on hover');await page.screenshot({path:'.openai/roulette-qa/round-record-hover.png'});
 await page.emulateMedia({reducedMotion:'reduce'});if(await page.locator('.scrap-spin .music-button-fx').evaluate(n=>getComputedStyle(n).display)!=='none')throw Error('Reduced motion unsupported');await page.emulateMedia({reducedMotion:'no-preference'});
 for(const people of [1,2,3,4]){const button=page.getByRole('button',{name:people+(people===1?' pessoa':' pessoas'),exact:true});await button.click();if(await button.getAttribute('aria-pressed')!=='true')throw Error('Filter '+people);}
 await page.locator('.scrap-target select').selectOption({label:'Chave A'});
 await page.locator('.scrap-spin').click();await page.locator('.record-sector.is-selected').waitFor({timeout:8000});
 const pulse=await page.locator('.record-sector.is-selected').evaluate(n=>({name:getComputedStyle(n).animationName,count:getComputedStyle(n).animationIterationCount}));if(pulse.name!=='selected-song-flash'||pulse.count!=='2')throw Error('Winning song does not flash twice');if(await page.locator('.chosen-modal').count())throw Error('Result appeared before reveal');if(!await page.locator('.scrap-spin').isDisabled())throw Error('Spin unlocked during reveal');

 await page.getByRole('heading',{name:'Música escolhida',exact:true}).waitFor({timeout:9000});const result=await page.locator('.chosen-modal>strong').innerText();console.log('CHOSEN',result);await page.getByRole('heading',{name:'Música escolhida',exact:true}).waitFor({state:'detached',timeout:5500});
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('halloween-v1')));if(saved.board.groups.find(g=>g.name==='Chave A').song.title!==result)throw Error('Group assignment failed');
 for(const viewport of [{width:1366,height:768},{width:1912,height:826}]){await page.setViewportSize(viewport);await page.waitForTimeout(100);const bounds=await page.locator('.scrap-roulette').boundingBox();if(bounds.y<0||bounds.y+bounds.height>viewport.height+1)throw Error('Modal overflow');await page.screenshot({path:`.openai/roulette-qa/reference-${viewport.width}.png`})}
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: filters, spin, assigned song, 4-second result dismissal, desktop viewport fit');
}finally{await browser.close()}




