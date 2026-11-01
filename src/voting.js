export const initialVoting=()=>({questions:[{id:'costume',title:'Melhor fantasia',count:1},{id:'duo',title:'Melhor fantasia em dupla',count:2}],ballots:[]});
export function validBallot(questions,answers,players){
 const ids=new Set(players.map(p=>p.id));
 return questions.length>0&&questions.every(q=>Array.isArray(answers[q.id])&&answers[q.id].length===q.count&&new Set(answers[q.id]).size===q.count&&answers[q.id].every(id=>ids.has(id)));
}
export const pairKey=ids=>JSON.stringify([...ids].sort());
export function registeredPairs(duos,players){
 const people=new Map(players.map(p=>[p.id,p]));
 const unique=new Map();
 for(const duo of duos||[]){const ids=duo.members;if(!Array.isArray(ids)||ids.length!==2||ids[0]===ids[1]||!ids.every(id=>people.has(id)))continue;const members=[...ids].sort().map(id=>people.get(id));const id=pairKey(ids);unique.set(id,{id,name:members.map(p=>p.name).join(' & '),members})}
 return [...unique.values()];
}
export function resultsFor(question,ballots,players,duos=[]){
 if(question.count===2){
  const scores=new Map(registeredPairs(duos,players).map(p=>[p.id,{...p,score:0}]));
  for(const ballot of ballots){const ids=ballot.answers[question.id];if(!Array.isArray(ids)||ids.length!==2)continue;const entry=scores.get(pairKey(ids));if(entry)entry.score++}
  return [...scores.values()].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pt-BR'));
 }
 const scores=new Map(players.map(p=>[p.id,0]));
 for(const ballot of ballots)for(const id of new Set(ballot.answers[question.id]||[]))if(scores.has(id))scores.set(id,scores.get(id)+1);
 return players.map(p=>({...p,score:scores.get(p.id)})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'pt-BR'));
}
export function presentationRanking(sorted){
 const total=sorted.reduce((sum,p)=>sum+p.score,0);
 return sorted.map((p,index)=>({...p,place:sorted.findIndex(other=>other.score===p.score)+1,tied:sorted.some((other,i)=>i!==index&&other.score===p.score),percent:total?p.score/total*100:0}));
}
