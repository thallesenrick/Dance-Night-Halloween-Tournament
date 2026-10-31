import {test} from 'node:test';
import assert from 'node:assert/strict';
import {boardGroup,battle,boardWinner,syncBoard,initialBoard} from './board.js';
function fixture(){const a=boardGroup('A'),b=boardGroup('B');a.manualPlayers=['a','b','c'];b.manualPlayers=['d','e'];return syncBoard({groups:[a,b]})}
test('liga duas chaves e reúne múltiplos vencedores no confronto',()=>{let b=fixture();const [a,c]=b.groups;b=battle(b,a.id,c.id);assert.equal(b.groups[2].players.length,0);b=boardWinner(b,a.id,'a');b=boardWinner(b,a.id,'b');b=boardWinner(b,c.id,'d');assert.deepEqual(b.groups[2].players,['a','b','d']);assert.deepEqual(b.groups[2].sources,[a.id,c.id]);assert.throws(()=>battle(b,a.id,c.id));assert.throws(()=>battle(b,a.id,a.id));});
test('corrigir origem atualiza todos os confrontos dependentes e limpa seus resultados',()=>{let b=fixture();const [a,c]=b.groups;b=boardWinner(b,a.id,'a');b=boardWinner(b,c.id,'d');b=battle(b,a.id,c.id);const duel=b.groups[2];b=boardWinner(b,duel.id,'a');b=battle(b,duel.id,c.id);assert.deepEqual(b.groups[3].players,['a','d']);b=boardWinner(b,a.id,'a');assert.deepEqual(b.groups[2].players,['d']);assert.deepEqual(b.groups[2].winners,[]);assert.deepEqual(b.groups[3].players,['d']);});
test('permite marcar e desmarcar vários vencedores sem limite fixo',()=>{let b=fixture();const id=b.groups[0].id;for(const p of ['a','b','c'])b=boardWinner(b,id,p);assert.equal(b.groups[0].winners.length,3);b=boardWinner(b,id,'b');assert.deepEqual(b.groups[0].winners,['a','c']);});
test('bloqueia ciclos e preserva mapa salvo e migração anterior',()=>{const b=fixture();b.groups[0].sources=[b.groups[1].id];b.groups[1].sources=[b.groups[0].id];assert.throws(()=>syncBoard(b));const d=fixture();assert.deepEqual(initialBoard({board:d}),d);const migrated=initialBoard({rounds:[{groups:[{name:'A',players:['a'],winners:['a']}]}]});assert.deepEqual(migrated.groups[0].winners,['a']);});
import {connectSpaces,distributePlayers} from './board.js';
test('desenha ligações antes de preencher, bloqueia ciclos e encaminha vencedores',()=>{let b={groups:[boardGroup('1'),boardGroup('2'),boardGroup('Final')]};const [a,c,f]=b.groups;b=connectSpaces(b,a.id,f.id);b=connectSpaces(b,c.id,f.id);assert.throws(()=>connectSpaces(b,f.id,a.id));b=distributePlayers(b,['a','b'],()=>.1);assert.equal(b.groups[2].players.length,0);b=boardWinner(b,a.id,b.groups[0].players[0]);b=boardWinner(b,c.id,b.groups[1].players[0]);assert.equal(b.groups[2].players.length,2);assert.equal(new Set(b.groups.flatMap(g=>g.manualPlayers)).size,2);});
test('sorteia uma pessoa por espaço inicial sem duplicação e preserva espaços futuros',()=>{let b={groups:[boardGroup('1'),boardGroup('2'),boardGroup('3'),boardGroup('Final')]};b=connectSpaces(b,b.groups[0].id,b.groups[3].id);const result=distributePlayers(b,['a','b'],()=>.3);assert.deepEqual(result.groups.flatMap(g=>g.manualPlayers).sort(),['a','b']);assert.ok(result.groups.every(g=>g.manualPlayers.length<=1));assert.deepEqual(result.groups[3].manualPlayers,[]);assert.equal(result.groups.filter(g=>g.players.length).length,2);assert.deepEqual(b.groups.flatMap(g=>g.players),[]);});
test('sorteio recusa falta de vagas e lista vazia sem alterar o mapa',()=>{const b={groups:[boardGroup('1')]};assert.throws(()=>distributePlayers(b,['a','b']));assert.throws(()=>distributePlayers(b,[]));assert.throws(()=>distributePlayers(b,['a','a']));assert.deepEqual(b.groups[0].players,[]);});
import {createRoundOf16Board} from './board.js';
test('modelo da referência gera oito vagas e todas as ligações até o campeão',()=>{
 let b=createRoundOf16Board();assert.equal(b.groups.length,12);assert.equal(b.groups.filter(g=>!g.sources.length).length,8);assert.equal(b.groups.reduce((sum,g)=>sum+g.sources.length,0),11);assert.equal(new Set(b.groups.map(g=>g.id)).size,12);
 const roots=b.groups.filter(g=>!g.sources.length);assert.equal(roots.filter(g=>g.x===90).length,4);assert.equal(roots.filter(g=>g.x===1010).length,4);
 b=distributePlayers(b,Array.from({length:8},(_,i)=>`p${i}`),()=>.2);
 for(const g of b.groups.filter(g=>!g.sources.length))b=boardWinner(b,g.id,g.players[0]);
 for(const index of [8,9,10])b=boardWinner(b,b.groups[index].id,b.groups[index].players[0]);
 assert.equal(b.groups[8].players.length,4);assert.equal(b.groups[9].players.length,4);assert.equal(b.groups[10].players.length,2);assert.equal(b.groups[11].players.length,1);
 assert.notEqual(createRoundOf16Board().groups[0].id,roots[0].id);
});


import {isChampionshipMatch} from './board.js';
test('reconhece a final e o slot de campeão sem comemorar título em vagas ou semifinais',()=>{
 const board=createRoundOf16Board();
 for(const group of board.groups.slice(0,10))assert.equal(isChampionshipMatch(board,group.id),false);
 assert.equal(isChampionshipMatch(board,board.groups[10].id),true);
 assert.equal(isChampionshipMatch(board,board.groups[11].id),true);
 assert.equal(isChampionshipMatch(board,'missing'),false);
 const single=boardGroup('Vaga avulsa');assert.equal(isChampionshipMatch({groups:[single]},single.id),false);
 const direct=structuredClone(board);direct.groups=direct.groups.slice(0,11);assert.equal(isChampionshipMatch(direct,direct.groups[10].id),true);
});
