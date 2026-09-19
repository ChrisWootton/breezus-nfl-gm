/* Breezus NFL GM v7.0 - unified decision engine */
(function(){
'use strict';
if(window.__breezusV7Engine)return;
window.__breezusV7Engine=true;

const V7={version:'7.0',ready:false,model:null};
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const sid=v=>String(v??'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const player=id=>S.players?.[sid(id)]||{};
const name=id=>player(id).full_name||[player(id).first_name,player(id).last_name].filter(Boolean).join(' ')||sid(id);
const pos=id=>String(player(id).position||'').toUpperCase()==='D/ST'?'DEF':String(player(id).position||'').toUpperCase();
const rank=id=>{const x=n(player(id).search_rank);return x>0?x:250};
const age=id=>n(player(id).age)||0;
const status=id=>String(player(id).injury_status||player(id).status||'AVAILABLE').toUpperCase();
const proj=id=>n(window.expectedPoints?.(id));
const unavailable=id=>/OUT|IR|PUP|SUSP|INACTIVE|DOUBTFUL/.test(status(id));
const slots=()=> (S.league?.roster_positions||[]).map(String).filter(x=>!['BN','IR','TAXI','RESERVE'].includes(x.toUpperCase()));
const roster=()=>S.mine||null;
const ids=()=>[...new Set((roster()?.players||[]).map(sid).filter(Boolean))];
function eligible(id,slot){
 const p=pos(id),s=String(slot).toUpperCase();
 if(['FLEX','W/R/T','RB/WR/TE'].includes(s))return ['RB','WR','TE'].includes(p);
 if(['SUPER_FLEX','S-FLEX','SUPERFLEX'].includes(s))return ['QB','RB','WR','TE'].includes(p);
 if(['REC_FLEX','WR/TE'].includes(s))return ['WR','TE'].includes(p);
 if(s==='RB/WR')return ['RB','WR'].includes(p);
 if(s==='IDP_FLEX')return ['DL','LB','DB','IDP'].includes(p);
 return p===s;
}
function optimise(ro){
 if(!ro)return {score:0,assign:[]};
 const ss=slots(), cand=[...new Set((ro.players||[]).map(sid))].map(id=>({id,v:proj(id)})).filter(x=>x.id&&x.v>0&&!unavailable(x.id));
 const ordered=ss.map((slot,index)=>({slot,index,choices:cand.filter(x=>eligible(x.id,slot)).length})).sort((a,b)=>a.choices-b.choices);
 let best={score:0,assign:[]};
 function walk(i,used,out,total){
  if(i===ordered.length){if(total>best.score)best={score:total,assign:out.slice()};return}
  const q=ordered[i], choices=cand.filter(x=>!used.has(x.id)&&eligible(x.id,q.slot)).sort((a,b)=>b.v-a.v).slice(0,24);
  if(!choices.length){walk(i+1,used,out,total);return}
  for(const x of choices){used.add(x.id);out.push({id:x.id,slot:q.slot,index:q.index,score:x.v});walk(i+1,used,out,total+x.v);out.pop();used.delete(x.id)}
 }
 walk(0,new Set(),[],0);best.assign.sort((a,b)=>a.index-b.index);return best;
}
function current(ro){
 const ss=slots(),st=(ro?.starters||[]).map(sid),out=[];
 ss.forEach((slot,index)=>{const id=st[index]&&st[index]!=='0'?st[index]:null;out.push({id,slot,index,score:id?proj(id):0})});
 return out;
}
function lineup(){
 const ro=roster(),best=optimise(ro),cur=current(ro),legal=cur.reduce((t,x)=>t+(x.id&&eligible(x.id,x.slot)&&!unavailable(x.id)?x.score:0),0);
 const bm=new Map(best.assign.map(x=>[x.index,x.id]));
 const decisions=cur.map(x=>{
  const target=bm.get(x.index);
  if(!x.id)return {type:'EMPTY',slot:x.slot,target,reason:'Starting slot is empty.'};
  if(unavailable(x.id))return {type:'REPLACE',slot:x.slot,id:x.id,target,reason:name(x.id)+' is '+status(x.id)+'.'};
  if(target&&target!==x.id){
   const gain=proj(target)-proj(x.id);
   if(gain>=3)return {type:'MOVE',slot:x.slot,id:x.id,target,gain,reason:name(target)+' projects '+gain.toFixed(1)+' more.'};
   if(gain>=1)return {type:'CONSIDER',slot:x.slot,id:x.id,target,gain,reason:name(target)+' has a '+gain.toFixed(1)+' point edge.'};
  }
  if(/QUESTIONABLE|DOUBTFUL/.test(status(x.id)))return {type:'MONITOR',slot:x.slot,id:x.id,reason:'Check status before kickoff.'};
  return {type:'HOLD',slot:x.slot,id:x.id};
 });
 const starters=new Set(cur.map(x=>x.id).filter(Boolean)),bench=ids().filter(id=>!starters.has(id)).map(id=>({id,watch:best.assign.some(x=>x.id===id)}));
 return {best,cur,legal,gain:Math.max(0,best.score-legal),decisions,bench};
}
function dynasty(id){
 const p=player(id),r=rank(id),a=age(id),pp=pos(id),base=Math.max(0,100-r*.22),ageAdj=['RB'].includes(pp)?Math.max(0,8-Math.max(0,a-24)*3):Math.max(0,8-Math.max(0,a-26)*1.5);
 const injury=unavailable(id)?-12:status(id).includes('QUESTIONABLE')?-4:0;
 return Math.round(Math.max(0,Math.min(100,base+ageAdj+injury)));
}
function needs(){
 const ss=slots(), counts={};ids().forEach(id=>{const p=pos(id);counts[p]=(counts[p]||0)+1});
 return ['QB','RB','WR','TE','DEF'].map(p=>({p,count:counts[p]||0,required:ss.filter(s=>s===p).length})).map(x=>({...x,need:Math.max(0,x.required+1-x.count)})).sort((a,b)=>b.need-a.need);
}
function waivers(){
 const pool=(S.waiverPool||[]).slice(); if(!pool.length)return [];
 const model=pool.map(w=>{const id=sid(w.p?.player_id||w.player_id);const score=n(w.score)+Math.max(0,50-rank(id))*.25+dynasty(id)*.1;return {id,score,trend:n(w.hot||w.count),position:pos(id),projection:proj(id)}});
 const nd=needs();return model.filter(x=>x.id&&!unavailable(x.id)).sort((a,b)=>b.score-a.score).slice(0,30).map((x,i)=>{
  const drop=ids().filter(id=>!unavailable(id)).sort((a,b)=>proj(a)-proj(b))[0]||null;
  const improvement=x.projection-(drop?proj(drop):0), need=nd.find(z=>z.p===x.position);
  return {...x,rank:i+1,drop,improvement,need:need?.need||0,faab:Math.max(1,Math.min(30,Math.round(2+x.score/10+(need?.need||0)*4)))};
 });
}
function trades(){
 const mine=ids(), counts={};mine.forEach(id=>{const p=pos(id);counts[p]=(counts[p]||0)+1});
 const weak=needs().filter(x=>x.need>0).map(x=>x.p);
 const targets=[];
 S.rosters.filter(r=>r.roster_id!==roster()?.roster_id).forEach(r=>{
  const rp=r.players||[];
  weak.forEach(p=>rp.filter(id=>pos(id)===p&&!unavailable(id)).sort((a,b)=>dynasty(b)-dynasty(a)).slice(0,3).forEach(id=>{
   const surplus=mine.filter(x=>pos(x)===pos(id)).sort((a,b)=>dynasty(b)-dynasty(a))[0];
   if(surplus)targets.push({id,team:r.roster_id,offer:surplus,value:dynasty(id),reason:'Addresses your '+p+' need while offering a player from your deeper '+pos(surplus)+' group.'});
  });
 });
 return targets.filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).sort((a,b)=>b.value-a.value).slice(0,15);
}
function league(){
 return (S.rosters||[]).map(r=>({id:r.roster_id,name:window.tn?.(r)||('Roster '+r.roster_id),record:(r.settings?.wins||0)+'-'+(r.settings?.losses||0),pf:n(r.settings?.fpts),strength:optimise(r).score})).sort((a,b)=>b.strength-a.strength);
}
function matchup(){
 const mine=lineup(),opp=optimise(S.opp),by=(assign)=>assign.reduce((o,x)=>{const p=pos(x.id);o[p]=(o[p]||0)+x.score;return o},{}),a=by(mine.best.assign),b=by(opp.assign);
 return {mine,opp,by:a,oppBy:b,total:Object.values(a).reduce((x,y)=>x+y,0),oppTotal:Object.values(b).reduce((x,y)=>x+y,0)};
}
function build(){
 const l=lineup(),w=waivers(),t=trades(),m=matchup(),lg=league(),need=needs();
 const orders=[];
 l.decisions.filter(x=>['MOVE','REPLACE','EMPTY'].includes(x.type)).forEach(x=>orders.push({type:'LINEUP',priority:x.type==='REPLACE'?'URGENT':'ACTION',text:x.target?'Start '+name(x.target)+' at '+x.slot:'Fix '+x.slot+' slot'}));
 w.filter(x=>x.need>0||x.rank<=3).slice(0,4).forEach(x=>orders.push({type:'WAIVER',priority:x.need>0?'ACTION':'WATCH',text:'Add '+name(x.id)+(x.drop?' and consider dropping '+name(x.drop):'')}));
 t.slice(0,3).forEach(x=>orders.push({type:'TRADE',priority:'EXPLORE',text:'Explore '+name(x.id)+' from another roster'}));
 need.filter(x=>x.need>0).slice(0,3).forEach(x=>orders.push({type:'NEED',priority:'INFO',text:'Depth need: '+x.p}));
 return {lineup:l,waivers:w,trades:t,matchup:m,league:lg,needs:need,orders};
}
function boot(){try{if(!S||!S.mine||!S.players)return;V7.model=build();V7.ready=true;window.BREEZUS_V7=V7;window.dispatchEvent(new Event('breezus:v7-ready'))}catch(e){console.error('Breezus v7 engine',e)}}
window.BREEZUS_V7=V7;window.addEventListener('breezus:refresh',boot);
if(S.mine&&Object.keys(S.players||{}).length)boot();
})();
