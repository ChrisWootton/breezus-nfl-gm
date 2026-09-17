/* Breezus NFL GM v4.3 - integration fixes: real bench, refresh, mobile-safe navigation */
(function(){
'use strict';
if(window.__gm43Booted)return; window.__gm43Booted=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const norm=x=>{x=String(x||'').toUpperCase();return ['DST','D/ST','DEFENSE'].includes(x)?'DEF':x};
const POS=['QB','RB','WR','TE','DEF'];
const retired=new Set(['todd gurley','andrew luck','ben roethlisberger','eli manning','philip rivers','frank gore','marshawn lynch','adrian peterson','rob gronkowski','julian edelman','antonio brown','aj green','dez bryant','cam newton','jj watt','j.j. watt','drew brees','matt ryan','aaron donald','leonard fournette','leveon bell']);
function safe(f,d){try{return f()}catch{return d}}
function roster(){return safe(()=>S.rosters.find(r=>String(r.owner_id)===String(S.me.user_id))||S.mine,null)}
function player(id){return safe(()=>window.player(id)||S.players[String(id)],{})}
function name(id){const p=player(id);return safe(()=>window.pn(id),p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||id)}
function pos(id){const p=player(id);return norm(safe(()=>window.position(id),p.position))}
function team(id){return String(player(id).team||'FA').toUpperCase()}
function status(id){return String(safe(()=>window.playerStatus(id)?.label,player(id).status||'AVAILABLE')).toUpperCase()}
function projected(id){return num(safe(()=>window.expectedPoints(id),0))}
function current(id){const p=player(id),n=name(id).toLowerCase(),st=status(id);return !!id&&!retired.has(n)&&!st.includes('RETIRED')&&String(p.injury_status||'').toUpperCase()!=='RET'}
function actualBench(){const r=roster();if(!r)return[];const all=[...new Set((r.players||[]).map(String).filter(Boolean))];const starts=new Set((r.starters||[]).map(String).filter(x=>x&&x!=='0'));return all.filter(id=>!starts.has(id)&&current(id)).sort((a,b)=>projected(b)-projected(a))}
function benchMarkup(){const b=actualBench();if(!b.length)return '<div class="g43-empty">No actual bench players are present in the Sleeper roster.</div>';return b.map((id,i)=>`<div class="g43-bench-row"><div><span class="g43-rank">${i+1}</span><b>${esc(name(id))}</b><span class="g43-meta">${esc(pos(id))} · ${esc(team(id))} · ${esc(status(id))}</span></div><strong>${projected(id).toFixed(1)}</strong></div>`).join('')}
function injectStyle(){if(document.getElementById('gm43-style'))return;const s=document.createElement('style');s.id='gm43-style';s.textContent=`.g43-bench{margin-top:14px;border-top:1px solid #e6e0da;padding-top:12px}.g43-bench-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:7px}.g43-bench-head h3{margin:0}.g43-bench-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #eee9e5}.g43-bench-row:first-child{border-top:0}.g43-rank{display:inline-block;min-width:20px;color:#746e79;font-size:10px;font-weight:900}.g43-meta{display:block;color:#746e79;font-size:10px;margin-top:3px}.g43-empty{padding:12px;border-radius:10px;background:#faf9f7;color:#746e79;font-size:11px}.g43-refresh{position:fixed;right:14px;bottom:14px;z-index:1200;border:0;border-radius:12px;padding:11px 14px;background:#17002f;color:#fff;font-weight:900;box-shadow:0 8px 25px rgba(23,0,47,.22)}@media(max-width:850px){.g43-refresh{right:10px;bottom:82px;padding:9px 11px;font-size:10px}}` ;document.head.appendChild(s)}
function replaceOldBench(){document.querySelectorAll('#gm40 .g42-section').forEach(sec=>{const h=sec.querySelector('h3');if(h&&/actual bench/i.test(h.textContent||'')){sec.classList.add('g43-bench');sec.innerHTML='<div class="g43-bench-head"><h3>Actual Bench</h3><span class="g42-pill g42-blue">SLEEPER</span></div>'+benchMarkup();}})}
function addRefresh(){if(document.getElementById('gm43-refresh'))return;const b=document.createElement('button');b.id='gm43-refresh';b.className='g43-refresh';b.textContent='↻ Refresh GM';b.title='Refresh Sleeper data and recalculate the GM';b.onclick=()=>{const run=document.getElementById('run');if(run){run.click();setTimeout(()=>location.reload(),900)}else location.reload()};document.body.appendChild(b)}
function sync(){injectStyle();replaceOldBench();addRefresh();document.body.classList.add('gm43-ready')}
function boot(){sync();const mo=new MutationObserver(()=>{if(!window.__gm43Syncing){window.__gm43Syncing=true;requestAnimationFrame(()=>{window.__gm43Syncing=false;sync()})}});mo.observe(document.body,{childList:true,subtree:true});setInterval(sync,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
