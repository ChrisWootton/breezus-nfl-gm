/* Breezus NFL GM v7.1 - Trade Analyzer
   Up to 2 players per side, league-aware immediate + dynasty impact.
*/
(function(){
'use strict';
if(window.__gmTradeAnalyzer7)return;
window.__gmTradeAnalyzer7=true;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String))];
const ep=id=>typeof expectedPoints==='function'?Number(expectedPoints(id))||0:0;
const ds=id=>typeof dynastyScore==='function'?Number(dynastyScore(id))||0:0;
const pos=id=>typeof position==='function'?position(id):player(id)?.position||'';
const name=id=>typeof pn==='function'?pn(id):player(id)?.full_name||id;

function css(){
 if($('gm7-trade-style'))return;
 const s=document.createElement('style');s.id='gm7-trade-style';s.textContent=`
.gm7ta{background:#fff;border:1px solid var(--line);border-radius:17px;padding:14px;margin-bottom:12px}.gm7ta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.gm7ta select{width:100%;min-height:155px;border:1px solid var(--line);border-radius:10px;padding:7px;background:#fff;font-size:11px}.gm7ta label{display:block;font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;margin-bottom:5px}.gm7ta-actions{display:flex;gap:8px;align-items:center;margin-top:10px}.gm7ta-btn{border:0;background:var(--p);color:#fff;border-radius:10px;padding:9px 12px;font-weight:900;font-size:10px}.gm7ta-result{margin-top:12px;padding:12px;border-radius:12px;background:#faf9f7;border:1px solid var(--line)}.gm7ta-score{font-size:23px;font-weight:950}.gm7ta-cols{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:9px}.gm7ta-k{padding:9px;background:#fff;border:1px solid var(--line);border-radius:10px}.gm7ta-k b{display:block;font-size:16px}.gm7ta-k span{font-size:8px;color:var(--muted);text-transform:uppercase;font-weight:900}@media(max-width:700px){.gm7ta-grid,.gm7ta-cols{grid-template-columns:1fr}}`;
 document.head.appendChild(s);
}
function options(ids){return uniq(ids).filter(id=>['QB','RB','WR','TE','DEF','K'].includes(pos(id))).sort((a,b)=>ds(b)-ds(a)).map(id=>`<option value="${esc(id)}">${esc(name(id))} · ${esc(pos(id))} · Dyn ${ds(id)}</option>`).join('')}
function selected(id){return [...($(id)?.selectedOptions||[])].map(o=>String(o.value)).slice(0,2)}
function rosterAfter(roster,give,get){return {...roster,players:uniq([...(roster.players||[]).filter(id=>!give.includes(String(id))),...get])}}
function analyse(){
 const otherId=$('gm7ta-team')?.value;
 const other=(S.rosters||[]).find(r=>String(r.roster_id)===String(otherId));
 if(!other){$('gm7ta-result').innerHTML='<b>Select a league mate first.</b>';return}
 const give=selected('gm7ta-give'),get=selected('gm7ta-get');
 if(!give.length||!get.length){$('gm7ta-result').innerHTML='<b>Select at least one player on each side.</b>';return}
 const currentMy=typeof optimiseRoster==='function'?Number(optimiseRoster(S.mine).score)||0:0;
 const currentOther=typeof optimiseRoster==='function'?Number(optimiseRoster(other).score)||0:0;
 const nextMy=rosterAfter(S.mine,give,get),nextOther=rosterAfter(other,get,give);
 const newMy=typeof optimiseRoster==='function'?Number(optimiseRoster(nextMy).score)||0:0;
 const newOther=typeof optimiseRoster==='function'?Number(optimiseRoster(nextOther).score)||0:0;
 const weekly=newMy-currentMy,oppWeekly=newOther-currentOther;
 const dynGive=give.reduce((a,id)=>a+ds(id),0),dynGet=get.reduce((a,id)=>a+ds(id),0),dyn=dynGet-dynGive;
 let verdict='NEEDS REVIEW',cls='gm7ta-amber';
 if(weekly>=1&&dyn>=0){verdict='POSITIVE FIT';cls='gm7ta-green'}
 if(weekly<-.75&&dyn<0){verdict='AVOID';cls='gm7ta-red'}
 const balance=Math.abs(dyn);
 const fairness=balance<=5?'Balanced on the GM dynasty model':dyn>5?'You receive more dynasty value':'You give more dynasty value';
 $('gm7ta-result').innerHTML=`<div><span class="pill ${cls}">${verdict}</span> <b style="margin-left:6px">${esc(fairness)}</b></div><div class="gm7ta-cols"><div class="gm7ta-k"><b>${weekly>=0?'+':''}${weekly.toFixed(1)}</b><span>Your weekly lineup impact</span></div><div class="gm7ta-k"><b>${dyn>=0?'+':''}${dyn.toFixed(0)}</b><span>Your dynasty value swing</span></div><div class="gm7ta-k"><b>${oppWeekly>=0?'+':''}${oppWeekly.toFixed(1)}</b><span>Their weekly impact</span></div></div><p class="note" style="margin-top:9px"><b>You send:</b> ${give.map(name).map(esc).join(', ')}<br><b>You receive:</b> ${get.map(name).map(esc).join(', ')}<br><b>GM read:</b> ${weekly>=1?'The move improves your optimal lineup. ':'The move does not improve your optimal lineup enough to justify itself on the current weekly model. '}${dyn>=0?'The dynasty asset balance is in your favour or neutral.':'You are giving up more dynasty value than you receive.'}</p><p class="meta">This analyzer models roster impact from the current Breezus player model. It does not know private trade offers, manager preferences or unreturned draft-pick details.</p>`;
}
function render(){
 if(!S?.mine||!S?.players||!Object.keys(S.players||{}).length)return;
 css();const page=$('trades');if(!page)return;
 let box=$('gm7-trade-analyzer');
 if(!box){box=document.createElement('div');box.id='gm7-trade-analyzer';page.insertBefore(box,page.firstChild)}
 const teams=(S.rosters||[]).filter(r=>r.roster_id!==S.mine?.roster_id);
 box.className='gm7ta';
 box.innerHTML=`<div class="title"><div><h2>Trade Analyzer</h2><p class="note">Test a real offer before you send it. The GM recalculates both rosters after the swap.</p></div><span class="pill blue">DYNASTY + WEEKLY</span></div><div class="gm7ta-grid" style="margin-top:10px"><div><label>League mate</label><select id="gm7ta-team"><option value="">Choose a team…</option>${teams.map(r=>`<option value="${esc(r.roster_id)}">${esc(tn(r))}</option>`).join('')}</select></div><div><label>Model notes</label><div class="mutedbox">Select up to 2 players each side. Weekly impact uses the current league scoring and lineup optimiser. Dynasty impact uses the current Breezus dynasty model.</div></div></div><div class="gm7ta-grid" style="margin-top:10px"><div><label>You send</label><select id="gm7ta-give" multiple>${options(S.mine.players)}</select></div><div><label>You receive</label><select id="gm7ta-get" multiple><option disabled>Select a league mate first</option></select></div></div><div class="gm7ta-actions"><button class="gm7ta-btn" id="gm7ta-run">ANALYSE TRADE</button><span class="meta" id="gm7ta-help">Choose a team to populate their roster.</span></div><div id="gm7ta-result" class="gm7ta-result"><span class="meta">No trade analysed yet.</span></div>`;
 const team=$('gm7ta-team'),get=$('gm7ta-get');
 team.onchange=()=>{const r=teams.find(x=>String(x.roster_id)===String(team.value));get.innerHTML=r?options(r.players):'<option disabled>Select a league mate first</option>';};
 $('gm7ta-run').onclick=analyse;
}
function boot(){let n=0;const t=setInterval(()=>{render();if(++n>100)clearInterval(t)},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1300));else setTimeout(boot,1300);
})();