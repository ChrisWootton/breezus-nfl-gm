/* Breezus NFL GM v4.7 - authoritative lineup source + actual bench */
(function(){
'use strict';
if(window.__gm47Booted)return; window.__gm47Booted=true;
const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const safe=(f,d)=>{try{return f()}catch{return d}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function roster(){return safe(()=>S.rosters.find(r=>String(r.owner_id)===String(S.me?.user_id)),null)||safe(()=>S.mine,null)||safe(()=>S.rosters.find(r=>r.roster_id===S.me?.roster_id),null)}
function raw(id){return safe(()=>window.player(id),null)||safe(()=>S.players?.[String(id)],{})||{}}
function pname(id){const p=raw(id);return safe(()=>window.pn(id),null)||p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||String(id)}
function pos(id){const p=raw(id),x=safe(()=>window.position(id),null)||p.position||'';return ['DST','D/ST','DEFENSE'].includes(String(x).toUpperCase())?'DEF':String(x).toUpperCase()}
function team(id){return String(raw(id).team||'FA').toUpperCase()}
function status(id){return String(safe(()=>window.playerStatus(id)?.label,null)||raw(id).status||'AVAILABLE').toUpperCase()}
function projection(id){return num(safe(()=>window.expectedPoints(id),0))}
function starterCandidates(r){
 const out=[];
 [r?.starters,S?.mine?.starters].forEach(a=>{if(Array.isArray(a)&&a.length)out.push(a)});
 const rid=String(r?.roster_id||'');
 [S?.matchups,S?.currentMatchups,S?.matchup].forEach(m=>{
   const arr=Array.isArray(m)?m:[m];
   arr.forEach(x=>{if(x&&(!rid||String(x.roster_id)===rid)&&Array.isArray(x.starters)&&x.starters.length)out.push(x.starters)});
 });
 return out.find(a=>Array.isArray(a)&&a.some(x=>x&&String(x)!=='0'))||[];
}
function starters(){return starterCandidates(roster()).map(String).filter(x=>x&&x!=='0')}
function lineupSlots(){
 const a=safe(()=>S.league?.roster_positions,[])||safe(()=>S.roster_positions,[])||safe(()=>S.settings?.roster_positions,[])||[];
 return a.map(String).filter(x=>!['BN','IR','TAXI'].includes(x.toUpperCase()));
}
function bench(){const r=roster(),all=[...new Set((r?.players||[]).map(String).filter(Boolean))],start=new Set(starters());return all.filter(id=>!start.has(id))}
function css(){if(document.getElementById('gm47-style'))return;const s=document.createElement('style');s.id='gm47-style';s.textContent=`#lineup .gm47-wrap{margin-top:10px}.gm47-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.gm47-count{background:#e4faf3;color:#146b55;border-radius:99px;padding:4px 8px;font-size:9px;font-weight:950;white-space:nowrap}.gm47-note{font-size:11px;color:var(--muted,#746e79);line-height:1.45;margin:6px 0 10px}.gm47-section{margin-top:16px}.gm47-row{display:flex;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid var(--line,#e6e0da);padding:11px 0}.gm47-row:first-child{border-top:0}.gm47-main{min-width:0}.gm47-slot{display:inline-block;background:#f0ece8;border-radius:7px;padding:4px 7px;font-size:10px;font-weight:950;margin-right:7px}.gm47-name{font-weight:850}.gm47-meta{display:block;color:var(--muted,#746e79);font-size:10px;margin-top:3px}.gm47-proj{font-weight:950;white-space:nowrap}.gm47-empty{color:var(--muted,#746e79);font-size:11px}`;document.head.appendChild(s)}
function render(){
 const el=document.getElementById('lineup'),r=roster();if(!el||!r)return;css();
 const st=starters(),slots=lineupSlots(),b=bench();
 const starterRows=slots.map((slot,i)=>{const id=st[i]||null;if(!id)return `<div class="gm47-row"><div class="gm47-main"><span class="gm47-slot">${esc(slot)}</span><span class="gm47-empty">Empty starter slot</span></div></div>`;return `<div class="gm47-row"><div class="gm47-main"><span class="gm47-slot">${esc(slot)}</span><span class="gm47-name">${esc(pname(id))}</span><span class="gm47-meta">${esc(pos(id))} · ${esc(team(id))} · ${esc(status(id))}</span></div><strong class="gm47-proj">${projection(id).toFixed(1)}</strong></div>`}).join('');
 const benchRows=b.map(id=>`<div class="gm47-row"><div class="gm47-main"><span class="gm47-slot">BN</span><span class="gm47-name">${esc(pname(id))}</span><span class="gm47-meta">${esc(pos(id))} · ${esc(team(id))} · ${esc(status(id))}</span></div><strong class="gm47-proj">${projection(id).toFixed(1)}</strong></div>`).join('');
 el.innerHTML=`<div class="card gm47-wrap"><div class="gm47-head"><div><h2>Lineup Lab</h2><div class="gm47-note">Live Sleeper lineup and actual bench. Starter data is taken from your roster, with the current matchup as a fallback.</div></div><span class="gm47-count">${st.length} STARTERS · ${b.length} BENCH</span></div><div class="gm47-section"><h3>Current Lineup</h3><div>${starterRows||'<div class="gm47-empty">Sleeper starter data is still loading.</div>'}</div></div><div class="gm47-section"><div class="gm47-head"><h3>Actual Bench</h3><span class="gm47-count">${b.length}</span></div><div>${benchRows||'<div class="gm47-empty">No players outside the current starters array.</div>'}</div></div></div>`;
}
function boot(){render();let last='';setInterval(()=>{const r=roster(),sig=JSON.stringify({players:r?.players||[],starters:r?.starters||[],leagueSlots:safe(()=>S.league?.roster_positions,[])||[],matchups:S?.matchups||S?.currentMatchups||null,week:S?.week});if(sig!==last){last=sig;render()}else if(document.getElementById('lineup')&&!document.querySelector('#lineup .gm47-wrap'))render()},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
