import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createMusicLibrary,getMusicLibrary,chooseLibrarySong,reorderMusic} from './music-library.js';

const track=(id,players=1)=>({id,title:'Música '+id,artist:'Artista '+id,edition:'JD2025',difficulty:'Médio',players});

test('carrega as quatro categorias originais sem restaurar uma lista apagada intencionalmente',()=>{
 const original=createMusicLibrary();
 assert.equal(original.length,40);
 assert.equal(new Set(original.map(song=>song.id)).size,40);
 for(const players of [1,2,3,4])assert.equal(original.filter(song=>song.players===players).length,10);
 assert.deepEqual(getMusicLibrary(undefined),original);
 assert.deepEqual(getMusicLibrary([]),[]);
 const saved=getMusicLibrary(original);saved[0].title='Minha edição';
 assert.notEqual(createMusicLibrary()[0].title,saved[0].title);
});

test('normaliza catálogo salvo e gera identificadores únicos sem modificar os dados de origem',()=>{
 const saved=[{id:'saved-1',title:'  A  ',artist:'  Cantora  ',players:'2'},
  {title:'B',artist:'Banda',players:2,difficulty:'Desconhecida'},
  {id:'saved-1',title:'C',artist:'DJ',players:4,difficulty:'Difícil'},
  {title:' ',artist:'Sem título',players:1},{title:'Sem artista',players:1},
  {title:'Fora da categoria',artist:'DJ',players:5},null];
 const snapshot=structuredClone(saved),result=getMusicLibrary(saved);
 assert.equal(result.length,3);
 assert.equal(new Set(result.map(song=>song.id)).size,3);
 assert.equal(result[0].title,'A');assert.equal(result[0].artist,'Cantora');assert.equal(result[0].players,2);
 assert.equal(result[0].edition,'');assert.equal(result[1].difficulty,'Médio');assert.equal(result[2].difficulty,'Difícil');
 assert.deepEqual(saved,snapshot);
 assert.deepEqual(getMusicLibrary(result),result);
});

test('categoria vazia não sorteia e categoria com uma música continua utilizável após repetir',()=>{
 assert.equal(chooseLibrarySong([],null,()=>{throw Error('Não deveria sortear uma categoria vazia');}),null);
 const song=track('solo');
 assert.deepEqual(chooseLibrarySong([song],song,()=>.95),{song,index:0});
});

test('evita a música atual por identificador e preserva o índice original do setor escolhido',()=>{
 const pool=[track('a'),track('b'),track('c')],snapshot=structuredClone(pool);
 assert.deepEqual(chooseLibrarySong(pool,pool[0],()=>0),{song:pool[1],index:1});
 assert.deepEqual(chooseLibrarySong(pool,pool[1],()=>.999),{song:pool[2],index:2});
 assert.deepEqual(chooseLibrarySong(pool,null,()=>0),{song:pool[0],index:0});
 assert.deepEqual(chooseLibrarySong(pool,null,()=>.999),{song:pool[2],index:2});
 assert.deepEqual(pool,snapshot);
});

test('reconhece a música atual salva anteriormente sem identificador e diferencia artistas',()=>{
 const pool=[track('a'),{...track('b'),title:'Música a'},track('c')];
 const legacy={title:pool[0].title,artist:pool[0].artist};
 assert.deepEqual(chooseLibrarySong(pool,legacy,()=>0),{song:pool[1],index:1});
});

test('reordena em ambos os sentidos mantendo categorias e dados originais',()=>{
 const pool=[track('a'),track('b'),track('c'),track('duo',2)],snapshot=structuredClone(pool);
 assert.deepEqual(reorderMusic(pool,'a','c').map(song=>song.id),['b','c','a','duo']);
 assert.deepEqual(reorderMusic(pool,'c','a').map(song=>song.id),['c','a','b','duo']);
 assert.deepEqual(pool,snapshot);
 for(const [from,to] of [['a','duo'],['a','a'],['missing','a'],['a','missing']])assert.deepEqual(reorderMusic(pool,from,to),pool);
});
