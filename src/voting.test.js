import test from 'node:test';
import assert from 'node:assert/strict';
import {validBallot,resultsFor,presentationRanking,registeredPairs} from './voting.js';
const players=[{id:'a',name:'Ana'},{id:'b',name:'Bia'},{id:'c',name:'Caio'}];
const questions=[{id:'single',count:1},{id:'duo',count:2}];
test('presentation handles percentages, shared places and zero votes',()=>{
 const ranked=presentationRanking([{id:'a',score:4},{id:'b',score:2},{id:'c',score:2},{id:'d',score:0}]);
 assert.deepEqual(ranked.map(p=>p.place),[1,2,2,4]);
 assert.deepEqual(ranked.map(p=>p.percent),[50,25,25,0]);
 assert.equal(ranked[1].tied,true);
 assert.equal(presentationRanking([{score:0}])[0].percent,0);
 assert.deepEqual(presentationRanking([]),[]);
});
test('requires all categories and two distinct registered people for a duo',()=>{
 assert.equal(validBallot(questions,{single:['a'],duo:['a','b']},players),true);
 for(const duo of [[],['a'],['a','a'],['a','missing'],['a','b','c']])assert.equal(validBallot(questions,{single:['a'],duo},players),false);
 assert.equal(validBallot(questions,{duo:['a','b']},players),false);
 assert.equal(validBallot([],{},players),false);
});
test('tallies complete duos and keeps categories separate',()=>{
 const ballots=[{answers:{single:['c'],duo:['a','b']}},{answers:{single:['b'],duo:['a','c']}}];
 assert.deepEqual(resultsFor(questions[1],ballots,players,[{members:['a','b']},{members:['a','c']}]).map(p=>[p.members.map(m=>m.id),p.score]),[[['a','b'],1],[['a','c'],1]]);
 assert.deepEqual(resultsFor(questions[0],ballots,players).map(p=>[p.id,p.score]),[['b',1],['c',1],['a',0]]);
});
test('ignores deleted participants and repeated IDs within a stored answer',()=>{
 assert.deepEqual(resultsFor(questions[1],[{answers:{duo:['a','a','deleted']}}],players),[]);
});
test('counts reversed pair order as the same duo and retains zero-vote registered duos',()=>{
 const ballots=[{answers:{duo:['a','b']}},{answers:{duo:['b','a']}},{answers:{duo:['a','c']}}];
 const duos=[{members:['b','c']},{members:['a','b']}];
 const ranking=presentationRanking(resultsFor(questions[1],ballots,players,duos));
 assert.deepEqual(ranking.map(p=>p.score),[2,0]);
 assert.equal(ranking[0].percent,100);
 assert.deepEqual(ranking[0].members.map(p=>p.id),['a','b']);
 assert.equal(registeredPairs([{members:['a','b']},{members:['b','a']},{members:['a','a']},{members:['a','missing']}],players).length,1);
});
test('shows exactly three registered duos despite historical votes for other pairs',()=>{
 const people=[...players,{id:'d',name:'Dani'}];
 const duos=[{members:['a','b']},{members:['a','c']},{members:['b','c']}];
 const ballots=[{answers:{duo:['a','b']}},{answers:{duo:['a','d']}},{answers:{duo:['b','d']}}];
 const result=resultsFor(questions[1],ballots,people,duos);
 assert.equal(result.length,3);
 assert.deepEqual(result.map(p=>p.score),[1,0,0]);
 assert.deepEqual(resultsFor(questions[1],ballots,people,[]),[]);
});
