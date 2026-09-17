/* Breezus NFL GM v4.4 - replace legacy BN slots with real Sleeper bench */
(function(){
'use strict';
if(window.__gm44Booted)return; window.__gm44Booted=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=(f,d)=>{try{return f()}catch{return d}};
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const norm=x=>{x=String(x||'').toUpperCase();return ['DST','D/ST','DEFENSE'].includes(x)?'DEF':x};
const retired=new Set(['todd gurley','andrew luck','ben roethlisberger','eli manning','philip rivers','frank gore','marshawn lynch','adrian peterson','rob gronkowski','julian edelman','antonio brown','aj green','dez bryant','cam newton','jj watt','j.j. watt','drew brees','matt ryan','aaron donald','leonard fournette','leveon bell']);
function roster(){return safe(()=>S.rosters.find(r=>String(r.owner_id)===String(S.me.user_id))||S.mine,null)}
function player(id){return safe(()=>window.player(id)||S.players[String(id)],{})}
function name(id){const p=player(id);return safe(()=>window.pn(id),p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||id)}
function pos(id){const p=player(id);return norm(safe(()=>window.position(id),p.position))}
function team(id){return String(player(id).team||'FA').toUpperCase()}
function health(id){return String(safe(()=>window.playerStatus(id)?.label,player(id).status||'AVAILABLE')).toUpperCase()}
function projection(id){return num(safe(()=>window.expectedPoints(id),0))}
function isCurrent(id){const p=player(id),n=name(id).toLowerCase(),h=health(id);return !!id&&!retired.has(n)&&!h.includes('RETIRED')&&String(p.injury_status||'').toUpperCase()!=='RET'}
function allPlayers(){return [...new Set((roster()?.players||[]).map(String).filter(Boolean))]}
function starters(){return new Set((roster()?.starters||[]).map(String).filter(x=>x&&x!=='0'))}
function bench(){const s=starters();return allPlayers().filter(id=>!s.has(id)&&isCurrent(id)).sort((a,b)=>projection(b)-projection(a))}
function style(){if(document.getElementById('gm44-style'))return;const s=document.createElement('style');s.id='gm44-style';s.textContent=`#lineup .gm44-wrap{margin-top:10px}.gm44-bench-grid{display:grid;gap:0}.gm44-slot-row{display:flex;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid var(--line,#e6e0da);padding:11px 0}.gm44-slot-row:first-child{border-top:0}.gm44-left{min-width:0}.gm44-slot{display:inline-block;background:#f0ece8;border-radius:7px;padding:4px 7px;font-size:10px;font-weight:950;margin-right:7px}.gm44-name{font-weight:850}.gm44-meta{display:block;color:var(--muted,#746e79);font-size:10px;margin-top:3px}.gm44-proj{font-weight:950;white-space:nowrap}.gm44-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.gm44-count{background:#e4faf3;color:#146b55;border-radius:99px;padding:4px 8px;font-size:9px;font-weight:950}.gm44-note{font-size:11px;color:var(--muted,#746e79);line-height:1.45;margin:6px 0 10px}.gm44-empty{padding:12px;background:#faf9f7;border-radius:10px;color:var(--muted,#746e79);font-size:11px}`;document.head.appendChild(s)}
function render(){const el=document.getElementById('lineup');if(!el)return;style();const r=roster();if(!r)return;const b=bench();const positions=(r.roster_positions||[]).filter(x=>String(x).toUpperCase()==='BN');const slotCount=Math.max(positions.length,b.length);if(!slotCount)return;const rows=Array.from({length:slotCount},(_,i)=>{const id=b[i];return `<div class="gm44-slot-row"><div class="gm44-left"><span class="gm44-slot">BN</span>${id?`<span class="gm44-name">${esc(name(id))}</span><span class="gm44-meta">${esc(pos(id))} · ${esc(team(id))} · ${esc(health(id))}</span>`:'<span class="gm44-name">Empty</span><span class="gm44-meta">No additional bench player</span>'}</div>${id?`<strong class="gm44-proj">${projection(id).toFixed(1)}</strong>`:''}</div>`}).join('');el.innerHTML=`<div class="card gm44-wrap"><div class="title gm44-head"><div><h2>Lineup Lab</h2><div class="note">Your actual Sleeper bench, shown in the BN slots. These are roster players, not eligibility placeholders.</div></div><span class="gm44-count">${b.length} BENCH PLAYERS</span></div><div class="gm44-bench-grid">${rows}</div></div>`}
function boot(){render();let last='';setInterval(()=>{const r=roster(),sig=JSON.stringify({p:r?.players,s:r?.starters,w:S.week});if(sig!==last){last=sig;render()}else if(document.getElementById('lineup')&&!document.querySelector('#lineup .gm44-wrap'))render()},1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
