/* Breezus NFL GM Product v1
   Single decision layer for the existing core app. No data engine replacement.
*/
(function(){
'use strict';
if(window.__gmProductV1)return;window.__gmProductV1=true;
const $=id=>document.getElementById(id),n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function ready(){return typeof S!=='undefined'&&S&&S.mine&&Array.isArray(S.mine.players)&&S.players}
function player(id){return S.players?.[String(id)]||{}}
function name(id){const p=player(id);return p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||String(id)}
function pos(id){return String(player(id).position||'').toUpperCase().replace('DST','DEF').replace('D/ST','DEF')}
function starters(){return new Set((S.mine.starters||[]).map(String).filter(Boolean))}
function projection(id){
 const x=S.projections?.[String(id)]||{};
 const s=S.league?.scoring_settings||{};
 const rec=n(s.rec);
 const key=rec>=.9?'pts_ppr':rec>=.4?'pts_half_ppr':'pts_std';
 const direct=n(x[key],0);
 if(direct)return direct;
 return n(x.pts_ppr??x.pts_half_ppr??x.pts_std??0);
}
function health(id){
 const p=player(id),s=String(p.status||'').toUpperCase(),i=String(p.injury_status||'').toUpperCase();
 if(s==='OUT'||i==='OUT')return'OUT';
 if(i==='IR'||s==='IR')return'IR';
 if(i==='DOUBTFUL')return'DOUBTFUL';
 if(i==='QUESTIONABLE')return'QUESTIONABLE';
 return'AVAILABLE';
}
function roster(){return(S.mine.players||[]).map(String).filter(id=>player(id).position)}
function bench(){const st=starters();return roster().filter(id=>!st.has(id)&&health(id)!=='IR').sort((a,b)=>projection(b)-projection(a))}
function currentScore(){return [...starters()].reduce((a,id)=>a+projection(id),0)}
function bestScore(){return n(S.best?.score,0)}
function nav(id){const b=document.querySelector('.nav button[data-p="'+id+'"]');if(b)b.click()}
function css(){if($('gm-product-style'))return;const s=document.createElement('style');s.id='gm-product-style';s.textContent=`
.gmp{margin:0 0 12px}.gmp-shell{background:#101722;color:#f5f7fa;border:1px solid #273342;border-radius:20px;overflow:hidden;box-shadow:0 14px 42px rgba(17,25,39,.16)}.gmp-head{padding:18px 19px;background:radial-gradient(circle at 90% 0,rgba(99,230,190,.16),transparent 32%),linear-gradient(135deg,#101722,#172231)}.gmp-eyebrow{font-size:9px;font-weight:950;letter-spacing:.16em;color:#63e6be}.gmp-title{font-size:25px;font-weight:950;letter-spacing:-.045em;margin:4px 0}.gmp-sub{font-size:10px;color:#a6b0bd;line-height:1.5;max-width:760px}.gmp-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:9px;padding:10px 18px}.gmp-card{background:#151d27;border:1px solid #293543;border-radius:14px;padding:12px}.gmp-card h3{margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#dce2e9}.gmp-primary{font-size:17px;font-weight:950}.gmp-note{font-size:9px;color:#8f9baa;line-height:1.5;margin-top:3px}.gmp-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:0 18px 10px}.gmp-kpi{background:#151d27;border:1px solid #293543;border-radius:12px;padding:9px}.gmp-kpi b{display:block;font-size:18px}.gmp-kpi span{display:block;color:#8f9baa;font-size:8px;font-weight:900;text-transform:uppercase;margin-top:2px}.gmp-action{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid #26313d}.gmp-action:first-child{border-top:0}.gmp-action b{font-size:10px}.gmp-pill{font-size:8px;font-weight:950;padding:4px 7px;border-radius:99px;white-space:nowrap}.gmp-green{color:#63e6be;background:rgba(99,230,190,.1);border:1px solid rgba(99,230,190,.25)}.gmp-amber{color:#f4c96b;background:rgba(244,201,107,.1);border:1px solid rgba(244,201,107,.2)}.gmp-red{color:#ff9b9b;background:rgba(255,90,90,.1);border:1px solid rgba(255,90,90,.2)}.gmp-blue{color:#9eb8ff;background:rgba(122,162,255,.1);border:1px solid rgba(122,162,255,.2)}.gmp-buttons{display:flex;gap:7px;flex-wrap:wrap;padding:0 18px 16px}.gmp-btn{border:1px solid #2b3744;background:#151d27;color:#eef3f7;border-radius:10px;padding:9px 11px;font-size:9px;font-weight:900}.gmp-btn:hover{border-color:#63e6be}@media(max-width:850px){.gmp-head{padding:15px 12px}.gmp-title{font-size:21px}.gmp-grid{grid-template-columns:1fr;padding:8px 12px}.gmp-kpis{grid-template-columns:repeat(2,1fr);padding:0 12px 9px}.gmp-buttons{padding:0 12px 12px}}`;
document.head.appendChild(s)}
function render(){
 if(!ready())return;
 const dash=$('dash');if(!dash)return;
 css();
 let root=$('gmp-root');
 if(!root){root=document.createElement('div');root.id='gmp-root';root.className='gmp';dash.insertBefore(root,dash.firstChild)}
 const cur=currentScore(),best=bestScore(),gain=best?best-cur:0,st=starters(),bn=bench();
 const out=[...st].filter(id=>health(id)==='OUT'||health(id)==='IR');
 const q=[...st].filter(id=>health(id)==='QUESTIONABLE'||health(id)==='DOUBTFUL');
 const orders=Array.isArray(S.orders)?S.orders:[];
 const adds=Array.isArray(S.waiverPool)?S.waiverPool:[],trades=Array.isArray(S.tradeTargets)?S.tradeTargets:[];
 let mode='HOLD';
 if(out.length||gain>=2)mode='ACT NOW';
 else if(q.length||adds.length||trades.length)mode='REVIEW';
 const primary=out.length?{title:'Fix your lineup',note:out.slice(0,2).map(name).join(' and ')+' need checking before lock.',tab:'lineup',pill:'URGENT',cls:'gmp-red'}:
 gain>=2?{title:'Improve the lineup',note:'The current model sees '+gain.toFixed(1)+' projected points available.',tab:'lineup',pill:'+'+gain.toFixed(1),cls:'gmp-green'}:
 trades.length?{title:'Explore a trade',note:'The league scan has roster-aware targets available.',tab:'trades',pill:String(trades.length)+' TARGETS',cls:'gmp-blue'}:
 adds.length?{title:'Scan waivers',note:'There are available players worth comparing against your roster.',tab:'waiversPage',pill:'WAIVER',cls:'gmp-blue'}:
 {title:'Hold and monitor',note:'No high-impact move is currently detected by the loaded data.',tab:'match',pill:'HOLD',cls:'gmp-green'};
 const lineupText=gain>0?'Best legal lineup: '+best.toFixed(1)+' vs '+cur.toFixed(1):'No measurable lineup gain yet';
 const rosterText=roster().length+' players · '+st.size+' starters · '+bn.length+' bench';
 const healthText=out.length?out.length+' unavailable':q.length?q.length+' questionable':'No urgent starter flags';
 root.innerHTML=`<div class="gmp-shell"><div class="gmp-head"><div class="gmp-eyebrow">NFL GM · DECISION CENTRE</div><div class="gmp-title">What should I do right now?</div><div class="gmp-sub">One decision layer over the live Sleeper roster. It prioritises the highest-impact action instead of showing you another pile of statistics.</div></div><div class="gmp-kpis"><div class="gmp-kpi"><b>${mode}</b><span>Priority</span></div><div class="gmp-kpi"><b>${best?best.toFixed(1):'—'}</b><span>Best lineup</span></div><div class="gmp-kpi"><b>${gain>0?'+'+gain.toFixed(1):'—'}</b><span>Available gain</span></div><div class="gmp-kpi"><b>${roster().length}</b><span>Roster size</span></div></div><div class="gmp-grid"><div class="gmp-card"><h3>GM recommendation</h3><div class="gmp-action"><div><div class="gmp-primary">${esc(primary.title)}</div><div class="gmp-note">${esc(primary.note)}</div></div><span class="gmp-pill ${primary.cls}">${esc(primary.pill)}</span></div><div class="gmp-note">${esc(lineupText)} · ${esc(rosterText)}</div></div><div class="gmp-card"><h3>Roster health</h3><div class="gmp-action"><div><b>Starter availability</b><div class="gmp-note">${esc(healthText)}</div></div><span class="gmp-pill ${out.length?'gmp-red':q.length?'gmp-amber':'gmp-green'}">${out.length?'CHECK':q.length?'WATCH':'OK'}</span></div><div class="gmp-action"><div><b>GM orders</b><div class="gmp-note">${orders.length} actions generated by the core engine</div></div><span class="gmp-pill gmp-blue">${orders.length}</span></div></div></div><div class="gmp-buttons"><button class="gmp-btn" data-gmp="${primary.tab}">OPEN PRIORITY →</button><button class="gmp-btn" data-gmp="lineup">LINEUP</button><button class="gmp-btn" data-gmp="waiversPage">WAIVERS</button><button class="gmp-btn" data-gmp="trades">TRADES</button><button class="gmp-btn" data-gmp="dynastyPage">DYNASTY</button><button class="gmp-btn" data-gmp="leaguePage">LEAGUE</button></div></div>`;
 root.querySelectorAll('[data-gmp]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.gmp)));
}
function boot(){render();setInterval(render,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
})();