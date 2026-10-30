export const rank = (players,group) => players.filter(p=>p.group===group).sort((a,b)=>(b.score??-1)-(a.score??-1)||a.seed-b.seed);
export function qualify(players){
 if(players.length!==8 || ['A','B'].some(g=>players.filter(p=>p.group===g).length!==4)) throw Error('Cada chave precisa ter quatro participantes.');
 if(players.some(p=>p.score===null)) throw Error('Registre todas as pontuações antes de continuar.');
 const a=rank(players,'A'),b=rank(players,'B');
 for(const list of [a,b]) if(list[0].score===list[1].score || list[1].score===list[2].score) throw Error('Há empate na classificação. Faça uma rodada de desempate e atualize as pontuações.');
 return [[a[0].id,b[1].id],[b[0].id,a[1].id]];
}
