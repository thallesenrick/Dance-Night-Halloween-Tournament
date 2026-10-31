import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRound,newGroup,validateRound,toggleWinner,assignPlayer,loadTournament} from './tournament.js';
test('permite cinco com dois classificados, três com um e dois com um na mesma rodada',()=>{
 const ids=Array.from({length:10},(_,i)=>String(i));let r=createRound(ids);r.groups=[newGroup('Cinco'),newGroup('Três'),newGroup('Dois')];r.groups[0].advance=2;
 ids.forEach((id,i)=>{r=assignPlayer(r,id,r.groups[i<5?0:i<8?1:2].id)});
 for(const [gi,id] of [[0,'0'],[0,'1'],[1,'5'],[2,'8']])r=toggleWinner(r,r.groups[gi].id,id);
 assert.deepEqual(validateRound(r),['0','1','5','8']);const next=createRound(validateRound(r),1);assert.equal(next.pool.length,4);assert.equal(next.name,'Rodada 2');
});
test('limita seleções às vagas, permite desmarcar e mover entre chaves',()=>{
 let r=createRound(['a','b','c']);r.groups.push(newGroup('B'));for(const id of r.pool)r=assignPlayer(r,id,r.groups[0].id);
 r=toggleWinner(r,r.groups[0].id,'a');assert.throws(()=>toggleWinner(r,r.groups[0].id,'b'));
 r=toggleWinner(r,r.groups[0].id,'a');r=toggleWinner(r,r.groups[0].id,'b');r=assignPlayer(r,'b',r.groups[1].id);
 assert.deepEqual(r.groups[0].winners,[]);assert.deepEqual(r.groups[1].players,['b']);assert.equal(r.groups[0].players.includes('b'),false);
});
test('impede confirmar pessoas sem chave, chave vazia, vagas inválidas e seleções incompletas',()=>{
 let r=createRound(['a','b']);assert.throws(()=>validateRound(r));r.pool.forEach(id=>{r=assignPlayer(r,id,r.groups[0].id)});assert.throws(()=>validateRound(r));
 r=toggleWinner(r,r.groups[0].id,'a');assert.deepEqual(validateRound(r),['a']);r.groups[0].advance=3;assert.throws(()=>validateRound(r));r.groups[0].advance=1;r.groups.push(newGroup());assert.throws(()=>validateRound(r));
});
test('permite classificar todos e bloqueia mudanças por clique após confirmação',()=>{
 let r=createRound(['a','b']);r.groups[0].players=['a','b'];r.groups[0].advance=2;r=toggleWinner(r,r.groups[0].id,'a');r=toggleWinner(r,r.groups[0].id,'b');assert.deepEqual(validateRound(r),['a','b']);r.confirmed=true;assert.deepEqual(toggleWinner(r,r.groups[0].id,'a'),r);
});
test('migra mapa antigo preservando participantes e vencedores',()=>{
 const d=loadTournament({players:[{id:'a'},{id:'b'}],rounds:[[{players:['a','b'],winner:'a'}]]});assert.deepEqual(validateRound(d.rounds[0]),['a']);assert.equal(d.players.length,2);
});
