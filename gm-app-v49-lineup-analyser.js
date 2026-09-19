/* Breezus NFL GM v6.0 - reliable lineup decision engine */
(function(){
'use strict';
if(window.__gm60Booted)return; window.__gm60Booted=true;

const esc=v=>String(v??'').replace(/[&<>\\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]));
const safe=(fn,d)=>{try{return fn()}catch(e){return d}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;

function roster(){return safe(()=>S.rosters.find(r=>String(r.owner_id)===String(S.me?.user_id))||S.mine,null);}
function raw(id){return safe(()=>window.player(id),null)||safe(()=>S.players?.[String(id)],{})||{};}
function pname(id){const p=raw(id);return safe(()=>window.pn(id),null)||p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||String(id);}
function pos(id){const p=raw(id);const x=safe(()=>window.position(id),null)||p.position||'';return String(x).toUpperCase()==='D/ST'?'DEF':String(x).toUpperCase();}
function team(id){return String(raw(id).team||'FA').toUpperCase();}
function health(id){return String(safe(()=>window.playerStatus(id)?.label,null)||raw(id).status||raw(id).injury_status||'AVAILABLE').toUpperCase();}
function proj(id){return num(safe(()=>window.expectedPoints(id),0));}
function ids(){return [...new Set((roster()?.players||[]).map(String).filter(Boolean))];}
function starters(){return (roster()?.starters||[]).map(String);}
function slots(){return (safe(()=>S.league?.roster_positions,[])||[]).map(String).filter(x=>!['BN','IR','TAXI'].includes(x.toUpperCase()));}
function bench(){const st=new Set(starters().filter(x=>x&&x!=='0'));return ids().filter(id=>!st.has(id));}

function unavailable(id){
 const h=health(id), p=raw(id);
 return /\bOUT\b|\bIR\b|\bPUP\b|\bSUSP\b|\bINACTIVE\b|\bDOUBTFUL\b/.test(h)
   || ['OUT','IR','PUP','SUSP','INACTIVE','DOUBTFUL'].includes(String(p.injury_status||'').toUpperCase());
}
function eligible(id,slot){
 const p=pos(id),s=String(slot).toUpperCase();
 if(s==='FLEX'||s==='W/R/T'||s==='RB/WR/TE')return ['RB','WR','TE'].includes(p);
 if(s==='SUPER_FLEX'||s==='S-FLEX'||s==='SUPERFLEX')return ['QB','RB','WR','TE'].includes(p);
 if(s==='REC_FLEX'||s==='WR/TE')return ['WR','TE'].includes(p);
 if(s==='RB/WR')return ['RB','WR'].includes(p);
 if(s==='IDP_FLEX')return ['DL','LB','DB','IDP'].includes(p);
 return p===s;
}

function optimise(){
 const ss=slots();
 const candidates=ids().map(id=>({id,v:proj(id),p:pos(id)}))
   .filter(x=>x.p&&x.v>0&&!unavailable(x.id));
 let best={score:-Infinity,assign:[]};

 // Put restrictive slots first. This prevents FLEX from consuming players needed by fixed slots.
 const ordered=ss.map((slot,i)=>({slot,i})).sort((a,b)=>{
   const ac=candidates.filter(x=>eligible(x.id,a.slot)).length;
   const bc=candidates.filter(x=>eligible(x.id,b.slot)).length;
   return ac-bc;
 });
 function walk(i,used,assign,total){
   if(i>=ordered.length){
     if(total>best.score)best={score:total,assign:assign.slice()};
     return;
   }
   const slot=ordered[i].slot;
   const cs=candidates.filter(x=>!used.has(x.id)&&eligible(x.id,slot)).sort((a,b)=>b.v-a.v).slice(0,30);
   if(!cs.length){walk(i+1,used,assign,total);return;}
   for(const x of cs){
     used.add(x.id);assign.push({id:x.id,slot});
     walk(i+1,used,assign,total+x.v);
     assign.pop();used.delete(x.id);
   }
 }
 walk(0,new Set(),[],0);
 best.assign.sort((a,b)=>ss.indexOf(a.slot)-ss.indexOf(b.slot));
 return best;
}

function assignmentByIndex(best){
 const m={};(best?.assign||[]).forEach(x=>{m[x.index]=x.id;});
 return m;
}
function currentScore(){return starters().reduce((t,id)=>t+(id&&id!=='0'?proj(id):0),0);}
function currentMap(){const m={};const st=starters(),ss=slots();ss.forEach((slot,i)=>{m[i]=st[i]&&st[i]!=='0'?st[i]:null;});return m;}
function currentLegalScore(){
 const m=currentMap(),used=new Set(),score=0;
 Object.entries(m).forEach(([slot,id])=>{
   if(id&&!used.has(id)&&eligible(id,slot)&&!unavailable(id)){score+=proj(id);used.add(id);}
 });
 return score;
}

function bestReplacement(slot,currentId,bestMap){
 const target=bestMap[slot];
 if(target&&target!==currentId)return target;
 const used=new Set(Object.values(currentMap()).filter(Boolean));
 return bench().filter(id=>!used.has(id)&&eligible(id,slot)&&!unavailable(id)).sort((a,b)=>proj(b)-proj(a))[0]||null;
}
function decision(slot,id,bestMap){
 if(!id)return {label:'EMPTY SLOT',cls:'red',reason:'This starting slot is empty.',rep:bestReplacement(slot,null,bestMap)};
 if(unavailable(id)){
   const rep=bestReplacement(slot,id,bestMap);
   return {label:'REPLACE',cls:'red',reason:`${pname(id)} is marked ${health(id)}. An unavailable starter should not be left in the lineup.`,rep};
 }
 const target=bestMap[slot];
 if(target&&target!==id){
   const gain=proj(target)-proj(id);
   if(gain>=3)return {label:'MOVE',cls:'red',reason:`${pname(target)} projects ${proj(target).toFixed(1)} vs ${proj(id).toFixed(1)} in this slot.`,rep:target};
   if(gain>=1)return {label:'CONSIDER',cls:'amber',reason:`${pname(target)} has a ${gain.toFixed(1)} point projection edge in this slot.`,rep:target};
 }
 if(/QUESTIONABLE|DOUBTFUL/.test(health(id)))return {label:'MONITOR',cls:'amber',reason:`${pname(id)} is ${health(id)}. Recheck before kickoff.`,rep:null};
 return {label:'HOLD',cls:'green',reason:'No meaningful legal improvement was found from the current roster.',rep:null};
}

function css(){
 if(document.getElementById('gm60-style'))return;
 const s=document.createElement('style');s.id='gm60-style';
 s.textContent=`
 #lineup .gm60-wrap{margin-top:10px}
 .gm60-hero{display:grid;grid-template-columns:1.5fr 1fr;gap:10px}
 .gm60-card,.gm60-section{background:#fff;border:1px solid #e6e0da;border-radius:15px;padding:13px;margin-top:10px}
 .gm60-kpi{font-size:30px;font-weight:950;line-height:1}
 .gm60-sub,.gm60-meta{font-size:10px;color:#746e79;margin-top:5px}
 .gm60-title,.gm60-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
 .gm60-slot{background:#f0ece8;border-radius:7px;padding:4px 7px;font-size:9px;font-weight:950;margin-right:7px}
 .gm60-pill{padding:5px 8px;border-radius:99px;font-size:9px;font-weight:950;white-space:nowrap}
 .gm60-green{background:#e4faf3;color:#146b55}.gm60-amber{background:#fff1d1;color:#82590e}.gm60-red{background:#fdeaea;color:#9d2929}.gm60-blue{background:#eaf0ff;color:#294da7}
 .gm60-reason{font-size:11px;color:#4f4951;margin-top:8px;line-height:1.45}
 .gm60-move{margin-top:8px;padding:9px;border-radius:10px;background:#f7f4f1;font-size:11px;line-height:1.45}
 .gm60-row{display:flex;justify-content:space-between;gap:10px;align-items:center;border-top:1px solid #eee9e5;padding:10px 0}
 .gm60-row:first-child{border-top:0}.gm60-right{text-align:right}.gm60-muted{font-size:11px;color:#746e79}
 @media(max-width:850px){.gm60-hero{grid-template-columns:1fr}}
 `;
 document.head.appendChild(s);
}

function render(){
 const el=document.getElementById('lineup');if(!el||!roster())return;
 css();
 const best=optimise(), bestMap=assignmentByIndex(best), cmap=currentMap();
 const legalCurrent=currentLegalScore(), rawCurrent=currentScore();
 const gain=Math.max(0,best.score-legalCurrent);
 const decisions=slots().map(slot=>({slot,id:cmap[slot],d:decision(slot,cmap[slot],bestMap)}));
 const moves=decisions.filter(x=>x.d.label==='MOVE'||x.d.label==='CONSIDER'||x.d.label==='REPLACE'||x.d.label==='EMPTY SLOT');
 const urgent=decisions.filter(x=>x.d.label==='REPLACE'||x.d.label==='EMPTY SLOT');

 const rows=decisions.map(x=>{
   const d=x.d,id=x.id,rep=d.rep;
   return `<div class="gm60-card">
    <div class="gm60-title"><div><span class="gm60-slot">${esc(x.slot)}</span><b>${id?esc(pname(id)):'Empty'}</b>
    ${id?`<span class="gm60-meta">${esc(pos(id))} · ${esc(team(id))} · ${proj(id).toFixed(1)} projected · ${esc(health(id))}</span>`:''}</div>
    <span class="gm60-pill gm60-${d.cls}">${esc(d.label)}</span></div>
    <div class="gm60-reason">${esc(d.reason)}</div>
    ${rep&&rep!==id?`<div class="gm60-move"><b>GM MOVE</b><br>${id?esc(pname(id))+' → ':''}<strong>${esc(pname(rep))}</strong><br><span class="gm60-meta">${proj(rep).toFixed(1)} projected${id?' vs '+proj(id).toFixed(1)+' · '+(proj(rep)-proj(id)>=0?'+':'')+(proj(rep)-proj(id)).toFixed(1):''}</span></div>`:''}
   </div>`;
 }).join('');

 const bestRows=slots().map((slot,index)=>{
   const id=bestMap[index];const current=cmap[index];
   return `<div class="gm60-row"><span><span class="gm60-slot">${esc(slot)}</span> <b>${id?esc(pname(id)):'Empty'}</b><br><span class="gm60-meta">${id?esc(pos(id))+' · '+proj(id).toFixed(1)+' projected':''}</span></span>
   <span class="gm60-pill gm60-${id===current?'green':'blue'}">${id===current?'HOLD':'OPTIMAL'}</span></div>`;
 }).join('');

 const benchPlayers=bench().map(id=>({id,v:proj(id)})).sort((a,b)=>b.v-a.v);
 const benchWatch=new Set(decisions.filter(x=>x.target&&x.target!==x.id).map(x=>x.target));
 const benchRows=benchPlayers.map((x,i)=>
   `<div class="gm60-row"><span><b>${i+1}. ${esc(pname(x.id))}</b> ${benchWatch.has(x.id)?'<span class="gm60-pill gm60-blue">LINEUP WATCH</span>':''}<br><span class="gm60-meta">${esc(pos(x.id))} · ${esc(team(x.id))} · ${esc(health(x.id))}</span></span><b>${x.v.toFixed(1)}</b></div>`
 ).join('');

 el.innerHTML=`<div class="gm60-wrap">
  <div class="gm60-hero">
   <div class="gm60-card"><div class="gm60-meta">LINEUP GM</div><div class="gm60-kpi">${urgent.length?urgent.length+' urgent':'LINEUP SET'}</div>
    <div class="gm60-sub">Current legal projection ${legalCurrent.toFixed(1)} · Optimal ${best.score.toFixed(1)} · Available upside ${gain>0?'+'+gain.toFixed(1):'0.0'}</div>
   </div>
   <div class="gm60-card"><div class="gm60-meta">ROSTER CHECK</div><div class="gm60-kpi">${moves.length}</div>
    <div class="gm60-sub">${urgent.length} urgent · ${moves.length-urgent.length<0?0:moves.length-urgent.length} optimisation calls</div>
   </div>
  </div>

  <div class="gm60-section"><div class="gm60-head"><h2 style="margin:0">What I would start</h2><span class="gm60-pill gm60-green">${slots().length} SLOTS</span></div>
   <div class="gm60-meta">The optimizer respects your Sleeper roster slots, position eligibility, duplicate-player prevention and unavailable-player checks.</div>
   ${bestRows}
  </div>

  <div class="gm60-section"><div class="gm60-head"><h2 style="margin:0">Your Bench</h2><span class="gm60-pill gm60-blue">${benchPlayers.length} PLAYERS</span></div>
   <div class="gm60-meta">These are the actual Sleeper roster players who are not currently starting. They are ranked by projected points.</div>
   ${benchRows||'<div class="gm60-muted" style="margin-top:10px">Sleeper returned no players outside your current starters.</div>'}
  </div>

  <h2 style="margin-top:20px">Start / Sit Decisions</h2>
  ${rows||'<div class="gm60-card">No lineup slots were returned.</div>'}
  ${rawCurrent!==legalCurrent?`<div class="gm60-card"><b>Roster data check</b><div class="gm60-reason">Sleeper's current starter list contains a player in a slot they are not legally eligible for, or an unavailable starter. Breezus calculates the legal current score separately so the improvement figure is not overstated.</div></div>`:''}
 </div>`;
}

function boot(){
 let last='';
 const tick=()=>{
   const r=roster();if(!r){setTimeout(tick,1000);return;}
   const sig=JSON.stringify({players:r.players||[],starters:r.starters||[],slots:S.league?.roster_positions||[],week:S.week,projections:S.projections||{}});
   if(sig!==last){last=sig;render();}
   else if(document.getElementById('lineup')&&!document.querySelector('#lineup .gm60-wrap'))render();
   setTimeout(tick,1500);
 };
 tick();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();