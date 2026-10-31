import {songs} from './songs.js';

export const DIFFICULTIES=['Fácil','Médio','Difícil'];
export function createMusicLibrary(){
 return [1,2,3,4].flatMap(players=>songs[players].map(([title,artist,edition,difficulty],index)=>({id:`original-${players}-${index}`,title,artist,edition,difficulty,players})));
}
export function getMusicLibrary(saved){
 if(!Array.isArray(saved))return createMusicLibrary();
 const seen=new Set();
 return saved.filter(song=>song&&typeof song.title==='string'&&song.title.trim()&&typeof song.artist==='string'&&song.artist.trim()&&[1,2,3,4].includes(Number(song.players))).map((song,index)=>{
  let id=typeof song.id==='string'&&song.id&&!seen.has(song.id)?song.id:`saved-${index}`;
  while(seen.has(id))id+='-copy';seen.add(id);
  return {id,title:song.title.trim(),artist:song.artist.trim(),edition:typeof song.edition==='string'?song.edition:'',difficulty:DIFFICULTIES.includes(song.difficulty)?song.difficulty:'Médio',players:Number(song.players)};
 });
}
export function chooseLibrarySong(pool,current,random=()=>{const value=new Uint32Array(1);crypto.getRandomValues(value);return value[0]/4294967296}){
 if(!pool.length)return null;
 const entries=pool.map((song,index)=>({song,index}));
 const available=entries.filter(({song})=>current?.id?song.id!==current.id:!(song.title===current?.title&&song.artist===current?.artist));
 const choices=available.length?available:entries;
 return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];
}
export function reorderMusic(library,sourceId,targetId){
 const source=library.find(song=>song.id===sourceId),target=library.find(song=>song.id===targetId);
 if(!source||!target||source.players!==target.players||sourceId===targetId)return library;
 const next=[...library],from=next.findIndex(song=>song.id===sourceId),to=next.findIndex(song=>song.id===targetId);
 next.splice(from,1);next.splice(to,0,source);return next;
}
