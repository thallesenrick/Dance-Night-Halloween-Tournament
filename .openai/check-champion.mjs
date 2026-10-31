import {chromium} from 'playwright-core';
import {createRoundOf16Board,syncBoard} from '../src/board.js';
let board=createRoundOf16Board();board.groups[0].manualPlayers=['luna'];board.groups[4].manualPlayers=['sol'];board=syncBoard(board);board.groups[0].winners=['luna'];board.groups[4].winners=['sol'];board=syncBoard(board);board.groups[8].winners=['luna'];board.groups[9].winners=['sol'];board=syncBoard(board);
const photo='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e9b6cb"/><circle cx="100" cy="77" r="40" fill="#53354e"/><path d="M20 200C20 110 180 110 180 200" fill="#53354e"/></svg>').toString('base64');
const data={players:[{id:'luna',name:'Luna',photo},{id:'sol',name:'Sol',photo}],rounds:[],board};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.addInitScript(data=>{localStorage.setItem('halloween-v1',JSON.stringify(data));localStorage.setItem('halloween-theme','dark')},data);
 await page.goto('http://127.0.0.1:5174/');await page.getByRole('button',{name:'Começar o torneio',exact:true}).click();await page.getByRole('button',{name:'Adicionar slot',exact:true}).waitFor();if(await page.getByRole('button',{name:'Quadrado',exact:true}).count())throw Error('Old label remains');
 const final=page.locator('.space-node').filter({has:page.locator('input[value="Final"]')});await final.getByRole('button',{name:'Marcar vitória de Luna',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Campeão da noite!',exact:true});await dialog.waitFor();const image=dialog.getByRole('img',{name:'Foto de Luna',exact:true});if(await image.getAttribute('src')!==photo)throw Error('Champion photo missing');
 await page.waitForTimeout(4600);if(!await dialog.isVisible())throw Error('Champion celebration auto-closed');if(await page.locator('.champion-confetti>i').count()!==80)throw Error('Confetti missing');
 await page.screenshot({path:'.openai/roulette-qa/champion-desktop.png'});
 for(const viewport of [{width:390,height:700},{width:1366,height:600}]){await page.setViewportSize(viewport);const b=await page.locator('.champion-card').boundingBox();if(b.x<0||b.y<0||b.x+b.width>viewport.width+1||b.y+b.height>viewport.height+1)throw Error('Champion card overflow at'+viewport.width);}
 await page.getByRole('button',{name:'Voltar para a pista',exact:true}).click();await dialog.waitFor({state:'detached'});const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('halloween-v1')));if(!saved.board.groups.find(g=>g.name==='Final').winners.includes('luna'))throw Error('Lost final result');
 await page.setViewportSize({width:1366,height:768});const champion=page.locator('.space-node').filter({has:page.locator('input[value="Campeão"]')});await champion.getByRole('button',{name:'Marcar vitória de Luna',exact:true}).click();await dialog.waitFor();await page.keyboard.press('Escape');await dialog.waitFor({state:'detached'});
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: Add slot label, final winner photo, persistent champion modal, confetti, manual close and Escape, saved results, compact viewports');
}finally{await browser.close()}
