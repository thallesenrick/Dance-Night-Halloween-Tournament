import {createId} from './id.js';
export const newGroup = (name='Nova chave') => ({id:createId(),name,players:[],advance:1,winners:[]});
export function createRound(ids,index=0){return {name:`Rodada ${index+1}`,pool:[...ids],groups:[newGroup('Chave A')],confirmed:false};}
export function validateRound(round){
 if(!round.pool.length)throw Error('Adicione participantes à rodada.');
 if(!round.groups.length)throw Error('Crie pelo menos uma chave.');
 const assigned=round.groups.flatMap(g=>g.players);
 if(new Set(assigned).size!==assigned.length||assigned.length!==round.pool.length||round.pool.some(id=>!assigned.includes(id)))throw Error('Distribua todos os participantes, uma vez cada, entre as chaves.');
 for(const g of round.groups){
 if(!g.players.length)throw Error(`A chave ${g.name} está vazia.`);
 if(!Number.isInteger(g.advance)||g.advance<1||g.advance>g.players.length)throw Error(`Defina quantos avançam em ${g.name}, entre 1 e ${g.players.length}.`);
 if(g.winners.length!==g.advance||new Set(g.winners).size!==g.winners.length||g.winners.some(id=>!g.players.includes(id)))throw Error(`Escolha ${g.advance} classificado(s) em ${g.name}.`);
 }
 return round.groups.flatMap(g=>g.winners);
}
export function toggleWinner(round,groupId,id){
 const next=structuredClone(round),g=next.groups.find(g=>g.id===groupId);
 if(next.confirmed||!g?.players.includes(id))return next;
 if(g.winners.includes(id))g.winners=g.winners.filter(x=>x!==id);
 else {if(g.winners.length>=g.advance)throw Error('Desmarque um classificado para escolher outro, ou aumente as vagas.');g.winners.push(id);}
 return next;
}
export function assignPlayer(round,id,target){
 const next=structuredClone(round);
 if(next.confirmed||!next.pool.includes(id)||(target&&!next.groups.some(g=>g.id===target)))return next;
 next.groups.forEach(g=>{g.players=g.players.filter(x=>x!==id);g.winners=g.winners.filter(x=>x!==id)});
 if(target)next.groups.find(g=>g.id===target).players.push(id);
 return next;
}
export function loadTournament(saved){
 if(!saved)return {players:[],rounds:[]};
 const rounds=(saved.rounds||[]).map((r,i)=>Array.isArray(r)?{name:`Rodada ${i+1}`,pool:r.flatMap(m=>m.players).filter(Boolean),groups:r.filter(m=>m.players.some(Boolean)).map((m,j)=>({id:`legacy-${i}-${j}`,name:`Chave ${j+1}`,players:m.players.filter(Boolean),advance:1,winners:m.winner?[m.winner]:[]})),confirmed:false}:r).filter(r=>r.pool.length);
 return {...saved,players:saved.players||[],rounds};
}
