/* Breezus NFL GM decision engine v2
   Purpose: turn the existing Sleeper/model data into a short, ranked weekly plan.
   No new projection source. No replacement engine. Uses the core model already loaded by index.html.
*/
(function(){
'use strict';
if(window.__gmDecisionV2)return;
window.__gmDecisionV2=true;

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String))];
const pos=id=>typeof position==='function'?position(id):player(id)?.position||'';
const ep=id=>typeof expectedPoints==='function'?num(expectedPoints(id)):0;
const rank=id=>typeof expertRank==='function'?num(expertRank(id),250):250;
const ds=id=>typeof dynastyScore==='function'?num(dynastyScore(id)):0;
const name=id=>typeof pn==='function'?pn(id):player(id)?.full_name||id;
const health=id=>typeof playerStatus==='function'?playerStatus(id):null;
const slots=()=>typeof rosterSlots==='function'?rosterSlots():[];
const starters=()=>new Set((S.mine?.starters||[]).filter(Boolean).map(String));
const legal=(id,slot)=>typeof eligible==='function'?eligible(id,slot):false;

function css(){
 if($('gm-v2-style'))return;
 const s=document.createElement('style');s.id='gm-v2-style';
 s.textContent=`
.gmv2{margin:0 0 12px}.gmv2-shell{background:#101722;color:#f4f7fa;border:1px solid #283544;border-radius:20px;overflow:hidden;box-shadow:0 16px 45px rgba(16,23,34,.16)}
.gmv2-head{padding:19px;background:radial-gradient(circle at 92% 0,rgba(99,230,190,.18),transparent 34%),linear-gradient(135deg,#101722,#172331)}
.gmv2-eyebrow{font-size:9px;font-weight:950;letter-spacing:.16em;color:#63e6be}.gmv2-title{font-size:25px;font-weight:950;letter-spacing:-.045em;margin:4px 0}.gmv2-sub{font-size:10px;line-height:1.55;color:#aab5c1;max-width:820px}
.gmv2-kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;padding:10px 18px}.gmv2-kpi{background:#151e29;border:1px solid #293644;border-radius:12px;padding:9px}.gmv2-kpi b{display:block;font-size:17px}.gmv2-kpi span{display:block;font-size:8px;color:#8f9baa;text-transform:uppercase;font-weight:900;margin-top:2px}
.gmv2-body{display:grid;grid-template-columns:1.2fr .8fr;gap:9px;padding:0 18px 10px}.gmv2-card{background:#151e29;border:1px solid #293644;border-radius:14px;padding:12px}.gmv2-card h3{font-size:10px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 7px;color:#dce3ea}
.gmv2-action{display:grid;grid-template-columns:30px 1fr auto;gap:9px;padding:10px 0;border-top:1px solid #27323e;align-items:start}.gmv2-action:first-child{border-top:0}.gmv2-num{width:24px;height:24px;border-radius:8px;background:#202b38;display:grid;place-items:center;font-size:10px;font-weight:950;color:#9eb8ff}.gmv2-main{font-size:11px;font-weight:950}.gmv2-reason{font-size:9px;color:#98a4b1;line-height:1.5;margin-top:2px}.gmv2-impact{font-size:9px;font-weight:950;white-space:nowrap}.gmv2-green{color:#63e6be}.gmv2-amber{color:#f4c96b}.gmv2-red{color:#ff9b9b}.gmv2-blue{color:#9eb8ff}
.gmv2-buttons{display:flex;gap:7px;flex-wrap:wrap;padding:0 18px 16px}.gmv2-btn{border:1px solid #2b3846;background:#151e29;color:#eef3f7;border-radius:10px;padding:9px 11px;font-size:9px;font-weight:900}.gmv2-btn:hover{border-color:#63e6be}
@media(max-width:850px){.gmv2-head{padding:15px 12px}.gmv2-title{font-size:21px}.gmv2-kpis{grid-template-columns:repeat(2,1fr);padding:8px 12px}.gmv2-body{grid-template-columns:1fr;padding:0 12px 9px}.gmv2-buttons{padding:0 12px 12px}}
`;
 document.head.appendChild(s);
}

function currentScore(){return uniq(S.mine?.starters).reduce((t,id)=>t+ep(id),0)}
function bestScore(){return num(S.best?.score)}
function lineupGain(){return bestScore()-currentScore()}
function playerStatusText(id){
 const h=health(id);
 if(!h)return 'available';
 return String(h.reason||h.label||h.status||'status flagged').toLowerCase();
}
function starterActions(){
 const out=[];
 const current=uniq(S.mine?.starters);
 const best=(S.best?.assign||[]).filter(x=>x.id);
 best.forEach(x=>{
   const old=current[best.findIndex(y=>y.slot===x.slot)];
   if(String(old)!==String(x.id)){
     const delta=ep(x.id)-ep(old);
     if(delta>=0.75){
       out.push({kind:'LINEUP',impact:delta,priority:delta>=3?100:80,title:`Start ${name(x.id)} at ${x.slot}`,reason:`${ep(x.id).toFixed(1)} projected points vs ${old?ep(old).toFixed(1):'0.0'} from the current slot occupant`,tab:'lineup'});
     }
   }
 });
 current.forEach(id=>{
   const h=health(id);
   if(h?.label==='OUT'||h?.label==='BENCH'){
     out.push({kind:'INJURY',impact:9,priority:120,title:`Remove ${name(id)} from your lineup`,reason:playerStatusText(id),tab:'lineup'});
   }
 });
 return out;
}
function bestDrop(){
 const st=starters();
 return uniq(S.mine?.players).filter(id=>!st.has(id)&&['QB','RB','WR','TE','DEF','K'].includes(pos(id)))
   .filter(id=>!health(id)||!['OUT','BENCH'].includes(health(id)?.label))
   .sort((a,b)=>ds(a)-ds(b)||ep(a)-ep(b))[0]||null;
}
function waiverActions(){
 const owned=new Set((S.rosters||[]).flatMap(r=>(r.players||[]).map(String)));
 const trend=new Map((S.adds||[]).map(x=>[String(x.player_id),num(x.count)]));
 const pool=Object.values(S.players||{}).filter(p=>{
   const id=String(p.player_id||'');
   return id&&!owned.has(id)&&['QB','RB','WR','TE','DEF','K'].includes(p.position)&&typeof waiverEligible==='function'&&waiverEligible(p,trend.has(id));
 });
 const drop=bestDrop();
 const base=bestScore();
 return pool.map(p=>{
   const id=String(p.player_id);
   const hypot={...S.mine,players:uniq([...(S.mine?.players||[]),id]).filter(x=>String(x)!==String(drop))};
   const withAdd=typeof optimiseRoster==='function'?num(optimiseRoster(hypot).score):base;
   const gain=withAdd-base;
   const hot=trend.get(id)||0;
   const fit=gain+(hot>=5?0.6:hot>=2?0.2:0);
   return {id,gain,hot,fit,drop};
 }).filter(x=>x.gain>=0.25||x.hot>=3).sort((a,b)=>b.fit-a.fit).slice(0,6).map(x=>({
   kind:'WAIVER',impact:x.gain,priority:x.gain>=2?85:65,title:`Add ${name(x.id)}`,reason:`${x.gain>=0?'+':''}${x.gain.toFixed(1)} lineup points after an add/drop${x.drop?' · drop '+name(x.drop):''}${x.hot?' · '+x.hot+' trending adds':''}`,tab:'waiversPage'
 }));
}
function tradeActions(){
 const my=uniq(S.mine?.players);
 const counts={};my.forEach(id=>{const p=pos(id);if(p)counts[p]=(counts[p]||0)+1});
 const required={};slots().forEach(s=>{required[s]=(required[s]||0)+1});
 const needs=(r)=>{
   const c={};uniq(r?.players).forEach(id=>{const p=pos(id);if(p)c[p]=(c[p]||0)+1});
   return ['QB','RB','WR','TE'].map(p=>({p,need:Math.max(0,(required[p]||0)-num(c[p]))})).filter(x=>x.need>0);
 };
 const surplus=['QB','RB','WR','TE'].filter(p=>num(counts[p])>num(required[p])+1);
 const out=[];
 (S.rosters||[]).filter(r=>r.roster_id!==S.mine?.roster_id).forEach(r=>{
   const ns=needs(r); if(!ns.length)return;
   const targetPos=ns.sort((a,b)=>b.need-a.need)[0].p;
   if(!surplus.length)return;
   const sourcePos=surplus.sort((a,b)=>num(counts[b])-num(required[b])-num(counts[a])+num(required[a]))[0];
   const targets=uniq(r.players).filter(id=>pos(id)===targetPos&&ds(id)>=45).sort((a,b)=>ds(b)-ds(a)).slice(0,2);
   targets.forEach(id=>{
     out.push({kind:'TRADE',impact:ds(id),priority:55,title:`Shop ${sourcePos} to ${tn(r)} for ${name(id)}`,reason:`${tn(r)} is short at ${targetPos}; you have ${counts[sourcePos]} ${sourcePos}s. Do not offer until value is checked.`,tab:'trades'});
   });
 });
 return out.sort((a,b)=>b.impact-a.impact).slice(0,4);
}
function dynastyAction(){
 const players=uniq(S.mine?.players).filter(id=>['QB','RB','WR','TE'].includes(pos(id)));
 if(!players.length)return null;
 const old=players.filter(id=>!starters().has(id)).sort((a,b)=>ds(a)-ds(b))[0];
 if(!old)return null;
 const h=health(old);
 if(h?.label==='OUT')return null;
 return {kind:'DYNASTY',impact:ds(old),priority:40,title:`Review ${name(old)}`,reason:`Lowest dynasty score among your non-starters: ${ds(old)}. Compare against the waiver pool before cutting a roster asset.`,tab:'dynastyPage'};
}
function build(){
 if(!S.mine||!S.players||!Object.keys(S.players).length)return [];
 const a=[...starterActions(),...waiverActions(),...tradeActions()];
 const d=dynastyAction();if(d)a.push(d);
 const seen=new Set();
 return a.sort((x,y)=>y.priority-a.priority||y.impact-x.impact).filter(x=>{const k=x.kind+'|'+x.title;if(seen.has(k))return false;seen.add(k);return true}).slice(0,5);
}
function render(){
 if(!S?.mine||!S?.players||!Object.keys(S.players).length)return;
 css();
 const dash=$('dash');if(!dash)return;
 let root=$('gm-v2-root');
 if(!root){root=document.createElement('div');root.id='gm-v2-root';root.className='gmv2';dash.insertBefore(root,dash.firstChild)}
 const actions=build();
 const gain=lineupGain();
 const win=num(S.sim?.pct,null);
 const roster=uniq(S.mine.players);
 const st=uniq(S.mine.starters);
 const urgent=actions.filter(x=>x.kind==='INJURY').length;
 const headline=urgent?'FIX THE LINEUP':gain>=1?'SET THE BEST LINEUP':actions.some(x=>x.kind==='WAIVER')?'CHECK THE WIRE':actions.some(x=>x.kind==='TRADE')?'WORK THE TRADE MARKET':'HOLD';
 const headlineReason=urgent?'A current starter has a status that needs action before lock.':gain>=1?`The optimiser identifies ${gain.toFixed(1)} points available versus the current Sleeper lineup.`:actions[0]?.reason||'No high-impact action is currently supported by the loaded data.';
 const actionHtml=actions.length?actions.map((x,i)=>`<div class="gmv2-action"><span class="gmv2-num">${i+1}</span><div><div class="gmv2-main">${esc(x.title)}</div><div class="gmv2-reason">${esc(x.reason)}</div></div><span class="gmv2-impact ${x.kind==='INJURY'?'gmv2-red':x.kind==='LINEUP'?'gmv2-green':x.kind==='WAIVER'?'gmv2-blue':'gmv2-amber'}">${x.kind}</span></div>`).join(''):`<div class="gmv2-reason">No actionable move passed the model thresholds. That is preferable to inventing a move.</div>`;
 root.innerHTML=`<div class="gmv2-shell">
 <div class="gmv2-head"><div class="gmv2-eyebrow">NFL GM · WEEKLY PLAN</div><div class="gmv2-title">${headline}</div><div class="gmv2-sub">${esc(headlineReason)} This panel uses the existing league scoring, Sleeper roster, weekly projections, player status, lineup optimiser, waiver pool and league rosters.</div></div>
 <div class="gmv2-kpis"><div class="gmv2-kpi"><b>${actions.length}</b><span>Moves found</span></div><div class="gmv2-kpi"><b>${gain>=0?'+':''}${gain.toFixed(1)}</b><span>Lineup points</span></div><div class="gmv2-kpi"><b>${st.length}/${slots().length}</b><span>Slots filled</span></div><div class="gmv2-kpi"><b>${roster.length}</b><span>Roster size</span></div><div class="gmv2-kpi"><b>${win==null?'—':win.toFixed(0)+'%'}</b><span>Win model</span></div></div>
 <div class="gmv2-body"><div class="gmv2-card"><h3>Ranked actions</h3>${actionHtml}</div><div class="gmv2-card"><h3>Decision rules</h3><div class="gmv2-reason">1. Fix unavailable or benched starters first.</div><div class="gmv2-reason">2. Take a lineup gain only when the replacement is legal.</div><div class="gmv2-reason">3. Waiver value is measured after the drop, not from player rank alone.</div><div class="gmv2-reason">4. Trade targets must match an actual league need and your surplus.</div><div class="gmv2-reason">5. Dynasty assets are protected unless the move creates a clear roster gain.</div></div></div>
 <div class="gmv2-buttons"><button class="gmv2-btn" data-gm2="lineup">OPEN LINEUP</button><button class="gmv2-btn" data-gm2="waiversPage">OPEN WAIVERS</button><button class="gmv2-btn" data-gm2="trades">OPEN TRADES</button><button class="gmv2-btn" data-gm2="dynastyPage">OPEN DYNASTY</button><button class="gmv2-btn" data-gm2="match">OPEN MATCHUP</button></div></div>`;
 root.querySelectorAll('[data-gm2]').forEach(b=>b.onclick=()=>typeof nav==='function'&&nav(b.dataset.gm2));
}
function autoRun(){
 if(window.__gmAutoRun)return;
 const run=$('run');
 if(!run)return;
 window.__gmAutoRun=true;
 try{
   if(!S.best) run.click();
 }catch(e){console.warn('GM auto run',e)}
}
function boot(){
 css();
 render();
 setTimeout(autoRun,1400);
 let ticks=0;const timer=setInterval(()=>{render();autoRun();if(++ticks>120)clearInterval(timer)},2500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
})();