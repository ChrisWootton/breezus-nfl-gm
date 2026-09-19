/* Breezus NFL GM v6.1 - Waiver GM */
(function(){
'use strict';
if(window.__gm61WaiverBooted)return;
window.__gm61WaiverBooted=true;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const P=id=>{try{return window.player(id)||S.players?.[String(id)]||{}}catch(e){return S.players?.[String(id)]||{}}};
const name=id=>{try{return window.pn(id)||P(id).full_name||String(id)}catch(e){return P(id).full_name||String(id)}};
const pos=id=>String(P(id).position||'').toUpperCase();
const proj=id=>{try{return num(window.expectedPoints(id))}catch(e){return 0}};
const rank=id=>{try{return num(window.rank(id))||999}catch(e){return 999}};
const dyn=id=>{try{return num(window.dynastyScore(id))}catch(e){return 0}};
const owned=()=>[...(S.mine?.players||[])].map(String);
const unavailable=id=>/OUT|IR|PUP|SUSP|INACTIVE/.test(String(P(id).status||P(id).injury_status||'').toUpperCase());

function pool(){
 const own=new Set(owned()), hot={};
 (S.adds||[]).forEach(x=>hot[String(x.player_id)]=num(x.count));
 const source=S.waiverPool||[];
 return source.map(x=>String(x?.p?.player_id||'')).filter(id=>id&&!own.has(id)&&pos(id)&&proj(id)>0&&!unavailable(id)).map(id=>({
  id:id,pos:pos(id),proj:proj(id),rank:rank(id),dyn:dyn(id),hot:hot[id]||0
 }));
}
function impact(add,drop){
 try{
  const before=window.optimiseRoster(S.mine)?.score||0;
  const players=owned().filter(id=>id!==String(drop));players.push(String(add));
  const after=window.optimiseRoster(Object.assign({},S.mine,{players:players}))?.score||0;
  return after-before;
 }catch(e){return 0}
}
function drops(add){
 return owned().filter(id=>!unavailable(id)).map(id=>({id:id,gain:impact(add,id)})).sort((a,b)=>a.gain-b.gain);
}
function bid(gain,hot){
 const budget=num(S.league?.settings?.waiver_budget||S.league?.settings?.faab_budget)||100;
 let pct=gain>=5?.15:gain>=2?.10:gain>=.75?.05:.02;
 pct+=Math.min(.04,hot/2500);
 return Math.max(1,Math.min(Math.round(budget*.3),Math.round(budget*pct)));
}
function render(){
 const el=document.getElementById('waivers');
 if(!el||!S.mine||!Object.keys(S.players||{}).length)return;
 const current=num(window.optimiseRoster?.(S.mine)?.score);
 const rows=pool().map(x=>{
  const d=drops(x.id)[0], gain=d?d.gain:0;
  const verdict=gain>=5?'ADD NOW':gain>=2?'ADD':gain>=.75?'WATCH':'PASS';
  const cls=verdict==='PASS'?'amber':verdict==='WATCH'?'blue':'green';
  return {x:x,d:d,gain:gain,verdict:verdict,cls:cls,bid:bid(gain,x.hot)};
 }).sort((a,b)=>b.gain-a.gain).slice(0,20);
 const budget=num(S.league?.settings?.waiver_budget||S.league?.settings?.faab_budget)||100;
 let html='<div class="gm61-head"><div><div class="gm61-kicker">WAIVER GM 6.1</div><h3 style="margin:2px 0">Roster-impact adds</h3><div class="gm61-note">Each target is tested against your actual roster, including the best drop candidate.</div></div><div class="gm61-stat"><b>'+current.toFixed(1)+'</b><span>current optimal</span></div><div class="gm61-stat"><b>'+rows.filter(r=>r.gain>=2).length+'</b><span>meaningful adds</span></div></div>';
 html+=rows.map((r,i)=>'<div class="gm61-row"><div class="gm61-rank">'+(i+1)+'</div><div><div class="gm61-top"><b>'+esc(name(r.x.id))+'</b><span class="gm61-pill '+r.cls+'">'+r.verdict+'</span></div><div class="gm61-meta">'+esc(r.x.pos)+' · '+esc(P(r.x.id).team||'FA')+' · '+r.x.proj.toFixed(1)+' proj · rank #'+r.x.rank+(r.x.hot?' · '+r.x.hot+' trending adds':'')+'</div><div class="gm61-gain">Team impact <b>'+(r.gain>=0?'+':'')+r.gain.toFixed(1)+'</b> points</div><div class="gm61-meta">'+(r.d?'Drop: <b>'+esc(name(r.d.id))+'</b> · '+proj(r.d.id).toFixed(1)+' proj':'No safe drop candidate identified')+'</div></div><div class="gm61-bid"><b>$'+r.bid+'</b><span>FAAB</span></div></div>').join('');
 el.innerHTML=html||'<div class="empty">No actionable free agents returned.</div>';
 const b=document.getElementById('waiverBudget');
 if(b)b.innerHTML='<b>FAAB planning budget:</b> '+budget+' units. Bids scale with estimated roster gain and recent add activity.';
}
function css(){
 if(document.getElementById('gm61-waiver-style'))return;
 const s=document.createElement('style');s.id='gm61-waiver-style';
 s.textContent='.gm61-head{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;background:linear-gradient(135deg,#17002f,#32174f);color:#fff;border-radius:16px;padding:14px;margin-bottom:10px}.gm61-kicker{font-size:9px;font-weight:950;color:#21c69c}.gm61-note{font-size:10px;color:#d8d0e0}.gm61-stat{text-align:center;padding:8px 10px;border:1px solid rgba(255,255,255,.15);border-radius:11px}.gm61-stat b{display:block;font-size:20px}.gm61-stat span{font-size:9px;color:#d8d0e0}.gm61-row{display:grid;grid-template-columns:28px 1fr auto;gap:10px;align-items:center;border-top:1px solid #e6e0da;padding:12px 0}.gm61-rank{font-weight:950;color:#746e79}.gm61-top{display:flex;justify-content:space-between;gap:8px;align-items:center}.gm61-meta{font-size:10px;color:#746e79;margin-top:4px}.gm61-gain{font-size:11px;margin-top:7px}.gm61-gain b{color:#146b55}.gm61-bid{text-align:center;background:#f7f4f1;border-radius:11px;padding:8px 11px}.gm61-bid b{display:block;font-size:18px}.gm61-bid span{font-size:8px;color:#746e79;font-weight:900}.gm61-pill{padding:5px 7px;border-radius:99px;font-size:9px;font-weight:950;white-space:nowrap}.gm61-pill.green{background:#e4faf3;color:#146b55}.gm61-pill.blue{background:#eaf0ff;color:#294da7}.gm61-pill.amber{background:#fff1d1;color:#82590e}@media(max-width:650px){.gm61-head{grid-template-columns:1fr 1fr}.gm61-head>div:first-child{grid-column:1/-1}.gm61-row{grid-template-columns:24px 1fr}.gm61-bid{grid-column:2;text-align:left;width:max-content}}';
 document.head.appendChild(s);
}
function boot(){
 css();let last='';
 (function tick(){
  if(S.mine&&Object.keys(S.players||{}).length){
   const sig=JSON.stringify({players:S.mine.players||[],adds:S.adds||[],week:S.week,proj:S.projections||{}});
   if(sig!==last){last=sig;try{render()}catch(e){console.error('Waiver GM',e)}}
   else if(document.getElementById('waivers')&&!document.querySelector('.gm61-row'))try{render()}catch(e){}
  }
  setTimeout(tick,2000);
 })();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();