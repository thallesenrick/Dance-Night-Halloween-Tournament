import {test} from 'node:test';import assert from 'node:assert/strict';import {qualify} from './tournament.js';
const players=()=>Array.from({length:8},(_,i)=>({id:i,group:i<4?'A':'B',score:1000-i*10,seed:i}));
test('cruza primeiro A com segundo B e primeiro B com segundo A',()=>assert.deepEqual(qualify(players()),[[0,5],[4,1]]));
test('impede classificação sem oito jogadores',()=>assert.throws(()=>qualify(players().slice(1))));
test('impede pontuação incompleta',()=>{let p=players();p[7].score=null;assert.throws(()=>qualify(p))});
test('exige desempate na linha de corte',()=>{let p=players();p[2].score=p[1].score;assert.throws(()=>qualify(p))});
test('impede chaves desbalanceadas',()=>{let p=players();p[0].group='B';assert.throws(()=>qualify(p))});
