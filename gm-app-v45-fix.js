/* Breezus NFL GM v4.5 - authoritative Sleeper bench renderer */
(function(){
'use strict';
if(window.__gm45Booted)return; window.__gm45Booted=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=(f,d)=>{try{return f()}catch{return d}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;
function roster(){
  return safe(()=>S.rosters.find(r=>String(r.owner_id)===String(S.me?.user_id))||S.mine,null)||safe(()=>S.mine,null);
}
function allPlayers(){
  const r=roster();
  return [...new Set((r?.players||[]).map(String).filter(Boolean))];
}
function starterSet(){
  const r=roster();
  return new Set((r?.starters||[]).map(String).filter(id=>id&&id!=='0'));
}
function rawPlayer(id){return safe(()=>window.player(id),null)||safe(()=>S.players?.[String(id)],{})||{};}
function playerName(id){
  const p=rawPlayer(id);
  return safe(()=>window.pn(id),null)||p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||String(id);
}
function position(id){
  const p=rawPlayer(id);
  const x=safe(()=>window.position(id),null)||p.position||'';
  return ['DST','D/ST','DEFENSE'].includes(String(x).toUpperCase())?'DEF':String(x).toUpperCase();
}
function team(id){return String(rawPlayer(id).team||'FA').toUpperCase();}
function status(id){return String(safe(()=>window.playerStatus(id)?.label,null)||rawPlayer(id).status||'AVAILABLE').toUpperCase();}
function projection(id){return num(safe(()=>window.expectedPoints(id),0));}
function bench(){
  const starts=starterSet();
  return allPlayers().filter(id=>!starts.has(id));
}
function benchSlots(){
  const positions=safe(()=>S.league?.roster_positions,[])||[];
  return positions.filter(x=>String(x).toUpperCase()==='BN').length;
}
function css(){
  if(document.getElementById('gm45-style'))return;
  const s=document.createElement('style');s.id='gm45-style';
  s.textContent=`
  #lineup .gm45-wrap{margin-top:10px}
  .gm45-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
  .gm45-count{background:#e4faf3;color:#146b55;border-radius:99px;padding:4px 8px;font-size:9px;font-weight:950;white-space:nowrap}
  .gm45-note{font-size:11px;color:var(--muted,#746e79);line-height:1.45;margin:6px 0 10px}
  .gm45-grid{display:grid;gap:0}
  .gm45-row{display:flex;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid var(--line,#e6e0da);padding:11px 0}
  .gm45-row:first-child{border-top:0}
  .gm45-main{min-width:0}
  .gm45-slot{display:inline-block;background:#f0ece8;border-radius:7px;padding:4px 7px;font-size:10px;font-weight:950;margin-right:7px}
  .gm45-name{font-weight:850}
  .gm45-meta{display:block;color:var(--muted,#746e79);font-size:10px;margin-top:3px}
  .gm45-proj{font-weight:950;white-space:nowrap}
  .gm45-empty{color:var(--muted,#746e79);font-size:11px}
  `;
  document.head.appendChild(s);
}
function render(){
  const el=document.getElementById('lineup');
  const r=roster();
  if(!el||!r)return;
  css();
  const b=bench();
  const slots=Math.max(benchSlots(),b.length);
  if(!b.length){
    el.innerHTML=`<div class="card gm45-wrap"><div class="gm45-head"><div><h2>Lineup Lab</h2><div class="gm45-note">Sleeper reports no players outside the current starters array.</div></div><span class="gm45-count">0 BENCH</span></div></div>`;
    return;
  }
  const rows=Array.from({length:slots},(_,i)=>{
    const id=b[i];
    if(!id)return `<div class="gm45-row"><div class="gm45-main"><span class="gm45-slot">BN</span><span class="gm45-empty">Empty bench slot</span></div></div>`;
    return `<div class="gm45-row"><div class="gm45-main"><span class="gm45-slot">BN</span><span class="gm45-name">${esc(playerName(id))}</span><span class="gm45-meta">${esc(position(id))} · ${esc(team(id))} · ${esc(status(id))}</span></div><strong class="gm45-proj">${projection(id).toFixed(1)}</strong></div>`;
  }).join('');
  el.innerHTML=`<div class="card gm45-wrap"><div class="gm45-head"><div><h2>Lineup Lab</h2><div class="gm45-note">Your actual Sleeper bench. Every player comes directly from your roster and is excluded only if they are already in the starters array.</div></div><span class="gm45-count">${b.length} BENCH PLAYERS</span></div><div class="gm45-grid">${rows}</div></div>`;
}
function boot(){
  render();
  let last='';
  setInterval(()=>{
    const r=roster();
    const sig=JSON.stringify({players:r?.players||[],starters:r?.starters||[],week:S.week});
    if(sig!==last){last=sig;render();}
    else if(document.getElementById('lineup')&&!document.querySelector('#lineup .gm45-wrap'))render();
  },1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
