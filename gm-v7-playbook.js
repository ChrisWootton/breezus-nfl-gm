/* Breezus NFL GM v7.0 - My Playbook
   League-aware operating system built on the existing core model.
*/
(function(){
'use strict';
if(window.__gmPlaybook7)return;
window.__gmPlaybook7=true;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String))];
const pos=id=>typeof position==='function'?position(id):player(id)?.position||'';
const ep=id=>typeof expectedPoints==='function'?num(expectedPoints(id)):0;
const ds=id=>typeof dynastyScore==='function'?num(dynastyScore(id)):0;
const rank=id=>typeof expertRank==='function'?num(expertRank(id),250):250;
const name=id=>typeof pn==='function'?pn(id):player(id)?.full_name||id;
const health=id=>typeof playerStatus==='function'?playerStatus(id):null;

function css(){
 if($('gm7-style'))return;
 const s=document.createElement('style');s.id='gm7-style';
 s.textContent=`
.gm7{margin-bottom:12px}.gm7-shell{background:#fff;border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--shadow)}
.gm7-hero{padding:18px;background:linear-gradient(135deg,var(--p),#32174f);color:#fff}.gm7-ey{font-size:9px;font-weight:950;letter-spacing:.15em;color:var(--g)}.gm7-title{font-size:25px;font-weight:950;letter-spacing:-.04em;margin:3px 0}.gm7-sub{font-size:11px;color:#d8d0e0;line-height:1.5;max-width:900px}
.gm7-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:10px;padding:10px}.gm7-card{border:1px solid var(--line);border-radius:15px;padding:12px;background:#fff}.gm7-card h3{font-size:10px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px}.gm7-card p{margin:0}.gm7-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:10px}.gm7-kpi{background:#faf9f7;border:1px solid var(--line);border-radius:12px;padding:10px}.gm7-kpi b{display:block;font-size:18px}.gm7-kpi span{font-size:8px;color:var(--muted);font-weight:900;text-transform:uppercase}
.gm7-row{display:grid;grid-template-columns:1fr auto;gap:8px;border-top:1px solid var(--line);padding:9px 0}.gm7-row:first-child{border-top:0}.gm7-main{font-size:11px;font-weight:900}.gm7-meta{font-size:9px;color:var(--muted);line-height:1.45;margin-top:2px}.gm7-pill{font-size:8px;font-weight:950;padding:4px 7px;border-radius:99px;height:max-content;white-space:nowrap}.gm7-green{background:#e4faf3;color:#146b55}.gm7-blue{background:#eaf0ff;color:#294da7}.gm7-amber{background:#fff1d1;color:#82590e}.gm7-red{background:#fdeaea;color:#9d2929}.gm7-purple{background:#efe7ff;color:#5d3196}.gm7-bars{display:grid;gap:7px}.gm7-barline{display:grid;grid-template-columns:34px 1fr 42px;gap:7px;align-items:center;font-size:9px;font-weight:900}.gm7-bar{height:8px;background:#eee9e5;border-radius:99px;overflow:hidden}.gm7-bar i{display:block;height:100%;background:var(--g)}.gm7-actions{display:flex;gap:7px;flex-wrap:wrap;padding:0 10px 12px}.gm7-btn{border:1px solid var(--line);background:#fff;border-radius:9px;padding:8px 10px;font-size:9px;font-weight:900}.gm7-btn:hover{background:#f8f5f2}@media(max-width:850px){.gm7-grid{grid-template-columns:1fr}.gm7-kpis{grid-template-columns:repeat(2,1fr)}.gm7-title{font-size:21px}}
`;
 document.head.appendChild(s);
}
function activate(id){
 const p=$(id);if(!p)return;
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
 p.classList.add('active');
 document.querySelectorAll('.nav button[data-p]').forEach(x=>x.classList.toggle('active',x.dataset.p===id));
 window.scrollTo({top:0,behavior:'smooth'});
}
function teamAge(){
 const ids=uniq(S.mine?.players).filter(id=>['QB','RB','WR','TE'].includes(pos(id)));
 const ages=ids.map(id=>num(player(id).age,0)).filter(x=>x>0);
 return ages.length?ages.reduce((a,b)=>a+b,0)/ages.length:null;
}
function direction(){
 const teams=S.rosters||[], mine=S.mine;
 const w=num(mine?.settings?.wins),l=num(mine?.settings?.losses);
 const record=(w+l)?w/(w+l):.5;
 const strengths=teams.map(r=>typeof projection==='function'?num(projection(r)):0).filter(x=>x>0);
 const avg=strengths.length?strengths.reduce((a,b)=>a+b,0)/strengths.length:0;
 const mineStr=typeof projection==='function'?num(projection(mine)):0;
 const age=teamAge();
 if(record>=.65&&(mineStr>=avg||!avg))return{label:'CONTENDER',cls:'green',reason:'Your record and current starter strength support a win-now approach.'};
 if(record<=.35&&(mineStr<avg||!avg))return{label:'REBUILD / RESET',cls:'purple',reason:'Your current record and starter strength suggest protecting long-term assets may be more useful than forcing short-term upgrades.'};
 return{label:'BALANCED',cls:'blue',reason:'The roster has enough current value to compete without requiring an aggressive all-in move.'};
}
function positionalStrength(){
 const ps=['QB','RB','WR','TE'];
 const mine={};ps.forEach(p=>mine[p]=0);
 const league={};ps.forEach(p=>league[p]=[]);
 (S.rosters||[]).forEach(r=>{
   const best={};uniq(r.players).filter(id=>ps.includes(pos(id))).forEach(id=>{const p=pos(id);best[p]=Math.max(best[p]||0,ep(id))});
   ps.forEach(p=>{league[p].push(best[p]||0);if(r.roster_id===S.mine?.roster_id)mine[p]=best[p]||0});
 });
 return ps.map(p=>{const vals=league[p].filter(x=>x>0).sort((a,b)=>a-b);const med=vals.length?vals[Math.floor(vals.length/2)]:0;return{p,value:mine[p],median:med,edge:mine[p]-med}}).sort((a,b)=>a.edge-b.edge);
}
function waiverPlan(){
 const owned=new Set((S.rosters||[]).flatMap(r=>(r.players||[]).map(String)));
 const trend=new Map((S.adds||[]).map(x=>[String(x.player_id),num(x.count)]));
 const st=new Set(uniq(S.mine?.starters));
 const drops=uniq(S.mine?.players).filter(id=>!st.has(id)&&['QB','RB','WR','TE','DEF','K'].includes(pos(id))).sort((a,b)=>ds(a)-ds(b));
 const drop=drops[0];
 const base=typeof optimiseRoster==='function'?num(optimiseRoster(S.mine).score):0;
 return Object.values(S.players||{}).filter(p=>{
   const id=String(p.player_id||'');
   return id&&!owned.has(id)&&['QB','RB','WR','TE','DEF','K'].includes(p.position)&&typeof waiverEligible==='function'&&waiverEligible(p,trend.has(id));
 }).map(p=>{
   const id=String(p.player_id),hyp={...S.mine,players:uniq([...(S.mine?.players||[]),id]).filter(x=>x!==String(drop))};
   const after=typeof optimiseRoster==='function'?num(optimiseRoster(hyp).score):base;
   const gain=after-base,hot=trend.get(id)||0;
   return{id,gain,hot,drop};
 }).filter(x=>x.gain>.25||x.hot>=3).sort((a,b)=>b.gain-a.gain||b.hot-a.hot).slice(0,5);
}
function tradeBoard(){
 const my=uniq(S.mine?.players),counts={};my.forEach(id=>{const p=pos(id);if(p)counts[p]=(counts[p]||0)+1});
 const slots=typeof rosterSlots==='function'?rosterSlots():[],required={};slots.forEach(s=>required[s]=(required[s]||0)+1);
 const surplus=Object.keys(counts).filter(p=>['QB','RB','WR','TE'].includes(p)&&counts[p]>num(required[p])+1).sort((a,b)=>(counts[b]-num(required[b]))-(counts[a]-num(required[a])));
 const rows=[];
 (S.rosters||[]).filter(r=>r.roster_id!==S.mine?.roster_id).forEach(r=>{
   const rc={};uniq(r.players).forEach(id=>{const p=pos(id);if(p)rc[p]=(rc[p]||0)+1});
   const need=['QB','RB','WR','TE'].map(p=>({p,n:Math.max(0,num(required[p])-num(rc[p]))})).sort((a,b)=>b.n-a.n)[0];
   if(!need?.n||!surplus.length)return;
   const from=surplus[0];
   const targets=uniq(r.players).filter(id=>pos(id)===need.p&&ds(id)>=45).sort((a,b)=>ds(b)-ds(a)).slice(0,2);
   targets.forEach(id=>rows.push({team:tn(r),id,from,need:need.p,score:ds(id),why:`${tn(r)} needs ${need.p}; you have ${counts[from]} ${from}s.`}));
 });
 return rows.sort((a,b)=>b.score-a.score).slice(0,6);
}
function pickCapital(){
 const picks=(S.picks||[]).filter(x=>Number(x.roster_id)===Number(S.mine?.roster_id));
 const counts={};picks.forEach(p=>{const k=String(p.season||'')+' R'+String(p.round||'');counts[k]=(counts[k]||0)+1});
 return Object.keys(counts).sort().map(k=>({k,n:counts[k]}));
}
function weeklyPlan(){
 const a=[];
 const gain=typeof S.best==='object'&&typeof expectedPoints==='function'?num(S.best.score)-uniq(S.mine?.starters).reduce((t,id)=>t+num(expectedPoints(id)),0):0;
 if(gain>=1)a.push({title:'Set the optimal lineup',reason:`There is ${gain.toFixed(1)} projected-point improvement available.`,cls:'green',tab:'lineup'});
 const flagged=uniq(S.mine?.starters).filter(id=>{const h=health(id);return h?.label==='OUT'||h?.label==='BENCH'});
 if(flagged.length)a.push({title:`Fix ${name(flagged[0])}`,reason:health(flagged[0])?.reason||'Starter status needs attention before lock.',cls:'red',tab:'lineup'});
 const wa=waiverPlan();if(wa[0])a.push({title:`Check ${name(wa[0].id)} on waivers`,reason:`Estimated +${wa[0].gain.toFixed(1)} lineup points after the drop.`,cls:'blue',tab:'waiversPage'});
 const tr=tradeBoard();if(tr[0])a.push({title:`Explore ${name(tr[0].id)}`,reason:tr[0].why,cls:'purple',tab:'trades'});
 if(!a.length)a.push({title:'Hold and monitor',reason:'No high-confidence move is currently supported by the loaded league data.',cls:'blue',tab:'dash'});
 return a.slice(0,4);
}
function render(){
 if(!S?.mine||!S?.players||!Object.keys(S.players||{}).length)return;
 css();
 let page=$('gm7-playbook');
 if(!page){
   page=document.createElement('section');page.id='gm7-playbook';page.className='page';
   const main=document.querySelector('main');if(!main)return;main.appendChild(page);
 }
 const d=direction(), strengths=positionalStrength(), wa=waiverPlan(), tr=tradeBoard(), picks=pickCapital(), plan=weeklyPlan(), age=teamAge();
 const actionHtml=plan.map((x,i)=>`<div class="gm7-row"><div><div class="gm7-main">${i+1}. ${esc(x.title)}</div><div class="gm7-meta">${esc(x.reason)}</div></div><span class="gm7-pill gm7-${x.cls}">OPEN</span></div>`).join('');
 const strengthHtml=strengths.map(x=>{const pct=x.median?Math.max(8,Math.min(100,(x.value/x.median)*50)):25;return`<div class="gm7-barline"><span>${x.p}</span><div class="gm7-bar"><i style="width:${pct}%"></i></div><span>${x.edge>=0?'+':''}${x.edge.toFixed(1)}</span></div>`}).join('');
 const waHtml=wa.map((x,i)=>`<div class="gm7-row"><div><div class="gm7-main">${i+1}. ${esc(name(x.id))}</div><div class="gm7-meta">${pos(x.id)} · ${x.gain>=0?'+':''}${x.gain.toFixed(1)} lineup gain${x.hot?' · '+x.hot+' trending adds':''}${x.drop?' · drop '+esc(name(x.drop)):''}</div></div><span class="gm7-pill gm7-blue">ADD</span></div>`).join('')||'<div class="gm7-meta">No waiver move clears the current threshold.</div>';
 const trHtml=tr.map((x,i)=>`<div class="gm7-row"><div><div class="gm7-main">${i+1}. ${esc(name(x.id))}</div><div class="gm7-meta">${esc(x.team)} · needs ${x.need} · offer from your ${x.from} surplus · dynasty ${x.score}</div></div><span class="gm7-pill gm7-purple">EXPLORE</span></div>`).join('')||'<div class="gm7-meta">No obvious mutually compatible trade partner detected.</div>';
 const pickHtml=picks.length?picks.map(x=>`<span class="gm7-pill gm7-blue">${esc(x.k)} ×${x.n}</span>`).join(' '):'<span class="gm7-meta">No future picks returned by Sleeper.</span>';
 page.innerHTML=`<div class="gm7"><div class="gm7-shell">
 <div class="gm7-hero"><div class="gm7-ey">BREEZUS · MY PLAYBOOK</div><div class="gm7-title">Your fantasy operating system</div><div class="gm7-sub">One league-aware view of what to do, why to do it, where your roster is strong or weak, and which moves are worth investigating. This is the deeper layer behind the weekly GM report.</div></div>
 <div class="gm7-kpis"><div class="gm7-kpi"><b><span class="gm7-pill gm7-${d.cls}">${d.label}</span></b><span>Team direction</span></div><div class="gm7-kpi"><b>${age?age.toFixed(1):'—'}</b><span>Avg skill age</span></div><div class="gm7-kpi"><b>${wa.length}</b><span>Waiver plays</span></div><div class="gm7-kpi"><b>${tr.length}</b><span>Trade matches</span></div></div>
 <div class="gm7-grid"><div class="gm7-card"><h3>This week's playbook</h3>${actionHtml}</div><div class="gm7-card"><h3>Team direction</h3><p class="gm7-meta">${esc(d.reason)}</p><div style="margin-top:10px" class="gm7-meta"><b>Positional strength vs league median</b></div><div class="gm7-bars" style="margin-top:8px">${strengthHtml}</div></div></div>
 <div class="gm7-grid"><div class="gm7-card"><h3>Waiver planner</h3>${waHtml}</div><div class="gm7-card"><h3>Trade market</h3>${trHtml}</div></div>
 <div class="gm7-grid"><div class="gm7-card"><h3>Dynasty capital</h3><p class="gm7-meta">Future picks currently attributed to your roster</p><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${pickHtml}</div></div><div class="gm7-card"><h3>What the GM is protecting</h3><p class="gm7-meta">Do not sell a productive starter solely because you have depth. Trade recommendations are surfaced when the other team has a positional need and your roster has surplus.</p><p class="gm7-meta" style="margin-top:7px">Waiver recommendations are measured by the change to your optimal lineup, not just the player's generic rank.</p></div></div>
 <div class="gm7-actions"><button class="gm7-btn" data-gm7="lineup">LINEUP LAB</button><button class="gm7-btn" data-gm7="waiversPage">WAIVER GM</button><button class="gm7-btn" data-gm7="trades">TRADE FINDER</button><button class="gm7-btn" data-gm7="dynastyPage">DYNASTY</button><button class="gm7-btn" data-gm7="leaguePage">LEAGUE</button></div>
 </div></div>`;
 page.querySelectorAll('[data-gm7]').forEach(b=>b.onclick=()=>activate(b.dataset.gm7));
 addNav();
}
function addNav(){
 const nav=document.querySelector('.nav');if(!nav||nav.querySelector('[data-p="gm7-playbook"]'))return;
 const b=document.createElement('button');b.type='button';b.dataset.p='gm7-playbook';b.textContent='📘 My Playbook';
 b.onclick=()=>activate('gm7-playbook');
 const dash=nav.querySelector('[data-p="dash"]');if(dash)dash.parentNode.insertBefore(b,dash.nextSibling);else nav.prepend(b);
}
function boot(){
 addNav();
 let n=0;const t=setInterval(()=>{addNav();render();if(++n>100)clearInterval(t)},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
})();