import {createId} from './id.js';
export function syncBoard(board){
 const next=structuredClone(board),resolved=new Set();
 function visit(g,path=new Set()){
 if(resolved.has(g.id))return;
 if(path.has(g.id))throw Error('As ligações não podem formar um ciclo.');
 const trail=new Set(path);trail.add(g.id);
 const parents=(g.sources||[]).map(id=>next.groups.find(x=>x.id===id));
 if(parents.some(p=>!p))throw Error('Chave de origem não encontrada.');
 parents.forEach(p=>visit(p,trail));
 const players=[...new Set([...(g.manualPlayers||[]),...parents.flatMap(p=>p.winners)])];
 if(players.length!==g.players.length||players.some((id,i)=>id!==g.players[i]))g.winners=[];
 g.players=players;resolved.add(g.id);
 }
 next.groups.forEach(g=>visit(g));return next;
}
export function boardGroup(name,x=40,y=40){return {id:createId(),name,x,y,players:[],manualPlayers:[],sources:[],winners:[]};}
export function battle(board,a,b){
 if(a===b)throw Error('Escolha duas chaves diferentes.');
 if(board.groups.some(g=>g.sources?.includes(a)&&g.sources?.includes(b)))throw Error('Essas chaves já têm um confronto.');
 const first=board.groups.find(g=>g.id===a),second=board.groups.find(g=>g.id===b);
 if(!first||!second)throw Error('Chave não encontrada.');
 const target=boardGroup(`${first.name} × ${second.name}`,Math.max(first.x,second.x)+360,Math.max(40,(first.y+second.y)/2));target.sources=[a,b];
 return syncBoard({groups:[...board.groups,target]});
}
export function boardWinner(board,gid,id){const next=structuredClone(board),g=next.groups.find(x=>x.id===gid);if(!g?.players.includes(id))return next;g.winners=g.winners.includes(id)?g.winners.filter(x=>x!==id):[...g.winners,id];return syncBoard(next);}
export function initialBoard(data){
 if(data.board)return syncBoard(data.board);
 const groups=data.rounds.flatMap((r,ri)=>r.groups.map((g,i)=>({...boardGroup(g.name,40+ri*370,40+i*380),players:[...g.players],manualPlayers:[...g.players],winners:[...g.winners]})));
 return {groups};
}
export function connectSpaces(board,from,to){
 if(from===to)throw Error('Ligue dois espaços diferentes.');
 const next=structuredClone(board),target=next.groups.find(g=>g.id===to);
 if(!target||!next.groups.some(g=>g.id===from))throw Error('Espaço não encontrado.');
 if(target.sources.includes(from))return next;
 if(target.manualPlayers.length)throw Error('Este espaço já tem uma pessoa. Use um espaço vazio para receber vencedores.');
 target.sources.push(from);return syncBoard(next);
}
export function distributePlayers(board,ids,random=Math.random){
 if(!ids.length)throw Error('Cadastre pelo menos uma pessoa.');
 if(new Set(ids).size!==ids.length)throw Error('Há pessoas duplicadas na lista.');
 const next=structuredClone(board),spaces=next.groups.filter(g=>!g.sources.length);
 if(spaces.length<ids.length)throw Error(`Desenhe mais ${ids.length-spaces.length} espaço(s) inicial(is) para colocar todas as pessoas.`);
 const shuffle=list=>{for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list};
 const order=shuffle([...ids]),slots=shuffle([...spaces]);next.groups.forEach(g=>{g.manualPlayers=[];g.players=[];g.winners=[]});
 slots.forEach((g,i)=>{g.manualPlayers=order[i]?[order[i]]:[]});return syncBoard(next);
}
// Preset follows the supplied eight-entry, two-group reference layout.
export function createRoundOf16Board(){
 const rows=[40,220,400,580];
 const left=rows.map((y,i)=>boardGroup(`Vaga ${i+1}`,90,y));
 const right=rows.map((y,i)=>boardGroup(`Vaga ${i+5}`,1010,y));
 const a=boardGroup('Chave A',320,220),b=boardGroup('Chave B',780,220);
 a.sources=left.map(g=>g.id);b.sources=right.map(g=>g.id);
 const final=boardGroup('Final',550,220);final.sources=[a.id,b.id];
 const champion=boardGroup('Campeão',550,740);champion.sources=[final.id];
 return syncBoard({groups:[...left,...right,a,b,final,champion]});
}


// The last competitive match may feed a single display slot for the champion.
export function isChampionshipMatch(board,id){
 const group=board.groups.find(g=>g.id===id);
 if(!group)return false;
 const destinations=board.groups.filter(g=>g.sources.includes(id));
 if(!destinations.length)return group.sources.length>0;
 return destinations.length===1&&destinations[0].sources.length===1&&!board.groups.some(g=>g.sources.includes(destinations[0].id));
}
