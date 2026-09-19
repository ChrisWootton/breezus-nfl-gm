/* Breezus NFL GM v5.5 - non-flat defense scoring
   Uses weekly Sleeper projections by player ID, actual roster/team mapping and schedule matchups.
   Missing values are estimated from available inputs instead of silently defaulting every team to 63.
*/
(function(){
'use strict';
if(window.__gm55DefenseBooted)return;window.__gm55DefenseBooted=true;
const $=id=>document.getElementById(id),n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const TEAMS='ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WAS'.split(' '),TSET=new Set(TEAMS);
const key=v=>String(v||'').toUpperCase().trim().replace(/^LA$/,'LAR').replace(/^JAC$/,'JAX');
let schedule=[],research={},loaded=false,loading=false;
function ready(){return typeof S!=='undefined'&&S&&Array.isArray(S.rosters)&&S.rosters.length&&S.players&&Object.keys(S.players).length&&S.me}
function roster(){return S.rosters.find(r=>String(r.owner_id)===String(S.me.user_id))||S.mine}
function raw(id){return S.players?.[String(id)]||{}}
function pos(id){return String(raw(id).position||'').toUpperCase().replace('D/ST','DEF').replace('DST','DEF').replace('DEFENSE','DEF')}
function team(id){return key(raw(id).team)}
function pname(id){const p=raw(id);return p.full_name||[p.first_name,p.last_name].filter(Boolean).join(' ')||id}
function week(){return n(S.week||S.league?.week,1)||1}
function season(){return n(S.season||S.league?.season,2026)||2026}
function fields(g){return{week:n(g?.week??g?.week_number??g?.game_week),home:key(g?.home_team??g?.homeTeam??g?.home??g?.team_home),away:key(g?.away_team??g?.awayTeam??g?.away??g?.team_away),total:n(g?.total_line??g?.totalLine??g?.over_under??g?.total),spread:n(g?.spread_line??g?.spreadLine??g?.spread),hs:n(g?.home_score??g?.homeScore??g?.home_points,NaN),as:n(g?.away_score??g?.awayScore??g?.away_points,NaN),date:g?.date??g?.start_time??g?.startTime??g?.game_time??g?.kickoff??null,status:String(g?.status||'').toLowerCase()}}
function gameFor(t,w){return schedule.find(g=>{const x=fields(g);return x.week===w&&(x.home===key(t)||x.away===key(t))})||null}
function opp(g,t){const x=fields(g);return x.home===key(t)?x.away:x.home}
function startMs(g){const v=fields(g).date;if(!v)return null;if(typeof v==='number')return v<100000000000?v*1000:v;const ms=Date.parse(v);return Number.isFinite(ms)?ms:null}
function started(g){if(!g)return true;const x=fields(g);if(['final','post','completed','closed','cancelled','canceled','in_progress','live'].some(s=>x.status.includes(s)))return true;const ms=startMs(g);return !!(ms&&ms<=Date.now())}
function proj(id){const p=research[String(id)]||{};return n(p.pts_ppr??p.fantasy_points_ppr??p.fpts_ppr??p.pts_half_ppr??p.pts_std??p.fantasy_points??p.fpts,0)}
function projTeam(t){let total=0;for(const [id,p] of Object.entries(S.players||{})){if(key(p?.team)!==key(t))continue;const x=pos(id);if(!['QB','RB','WR','TE'].includes(x))continue;const v=proj(id);if(v>0)total+=v}return total}
function rosterDef(){return(roster()?.players||[]).map(String).filter(id=>pos(id)==='DEF'&&TSET.has(team(id))).map(id=>({id,team:team(id),name:pname(id)}))}
function ownedTeams(){const out=new Set();(S.rosters||[]).forEach(r=>(r.players||[]).forEach(id=>{if(pos(id)==='DEF'&&TSET.has(team(id)))out.add(team(id))}));return out}
function allDefIds(){const map=new Map();Object.entries(S.players||{}).forEach(([id,p])=>{const t=key(p?.team);if(t&&TSET.has(t)&&pos(id)==='DEF'&&!map.has(t))map.set(t,String(id))});return map}
function offensiveStrength(t,w){
 const base=projTeam(t);
 if(base>0)return Math.max(14,Math.min(38,base*.55+18));
 const vals={QB:0,RB:0,WR:0,TE:0};
 for(const [id,p] of Object.entries(S.players||{})){
  if(key(p?.team)!==key(t))continue;
  const q=String(p?.position||'').toUpperCase();
  if(!(q in vals))continue;
  const r=n(p?.search_rank,999);
  if(r<1||r>400)continue;
  const weight=q==='QB'?1.7:q==='WR'?1.15:q==='RB'?1.0:.85;
  vals[q]+=Math.max(0,(401-r)/400)*weight;
 }
 const talent=vals.QB*7+Math.min(vals.RB,2.8)*3.5+Math.min(vals.WR,4.5)*2.4+Math.min(vals.TE,1.2)*2.2;
 let scores=[];
 for(const g of schedule){const x=fields(g);if(x.week>=w||!x.home||!x.away)continue;if(x.home===key(t)&&Number.isFinite(x.hs))scores.push(x.hs);if(x.away===key(t)&&Number.isFinite(x.as))scores.push(x.as)}
 const historical=scores.length?scores.reduce((a,v)=>a+v,0)/scores.length:23;
 return Math.max(14,Math.min(38,18+talent*.65+(historical-23)*.35));
}
function defenceStrength(t,w){let allowed=[],taken=[];for(const g of schedule){const x=fields(g);if(x.week>=w||!x.home||!x.away)continue;if(x.home===key(t)&&Number.isFinite(x.hs)&&Number.isFinite(x.as)){taken.push(x.hs);allowed.push(x.as)}if(x.away===key(t)&&Number.isFinite(x.hs)&&Number.isFinite(x.as)){taken.push(x.as);allowed.push(x.hs)}}if(allowed.length)return Math.max(0,Math.min(100,62-(allowed.reduce((a,v)=>a+v,0)/allowed.length-23)*3+(taken.reduce((a,v)=>a+v,0)/taken.length-23)*.5));return 50}
function expectedOpponent(t,w){const g=gameFor(t,w);if(!g)return 23;const o=opp(g,t),x=fields(g);if(x.total>0&&Number.isFinite(x.spread))return Math.max(10,Math.min(38,x.total/2+(x.home===key(t)?x.spread/2:-x.spread/2)));return offensiveStrength(o,w)}
function qbProfile(t){
 let best=null;
 for(const [id,p] of Object.entries(S.players||{})){
  if(key(p?.team)!==key(t)||String(p?.position||'').toUpperCase()!=='QB')continue;
  const r=n(p?.search_rank,999);
  if(!best||r<best.rank)best={id,rank:r,name:pname(id)};
 }
 if(!best)return {rank:null,score:50,name:null};
 const q=Math.max(0,Math.min(100,best.rank<=50?45+(best.rank-1)*.45:67.5+Math.min(32.5,(best.rank-50)*.35)));
 return {rank:best.rank,score:q,name:best.name};
}
function dstQuality(id){
 const r=n(raw(id)?.search_rank,999);
 if(r>=999)return 50;
 return Math.max(25,Math.min(95,96-r*.7));
}
function score(t,id,w){
 const g=gameFor(t,w);if(!g)return null;
 const x=fields(g),o=opp(g,t),oppPts=expectedOpponent(t,w),def=defenceStrength(t,w),dp=proj(id),qb=qbProfile(o);
 const matchup=Math.max(0,Math.min(100,100-(oppPts-14)*3.2));
 const vegas=x.total>0?Math.max(0,Math.min(100,100-(x.total-38)*4.2)):50;
 const spread=x.spread!==0?Math.max(0,Math.min(100,50+(x.home===key(t)?-x.spread:x.spread)*4)):50;
 const home=x.home===key(t)?100:35;
 const defProj=dp>0?Math.max(35,Math.min(80,35+dp*5)):Math.max(35,Math.min(80,55-(oppPts-23)*2.5));
 const quality=dstQuality(id);
 const value=Math.round(Math.max(0,Math.min(100,matchup*.30+vegas*.18+spread*.10+def*.14+quality*.11+defProj*.10+qb.score*.04+home*.03)));
 return{team:key(t),id,name:pname(id),opp:o,home:x.home===key(t),oppPts,proj:dp,score:value,start:startMs(g),total:x.total,spread:x.spread,qbRank:qb.rank,qbName:qb.name,dstQuality:quality};
}
async function fetchJson(url){const c=new AbortController(),timer=setTimeout(()=>c.abort(),9000);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(timer)}}
async function load(){if(loaded||loading||!ready())return;loading=true;const w=week();try{const data=await fetchJson('/api/nfl-schedule?season='+season());schedule=Array.isArray(data)?data:(data?.games||data?.schedule||[]);research={};for(const wk of[w,w+1,w+2]){try{const r=await fetchJson('/api/research?season='+season()+'&week='+wk);Object.assign(research,r?.projections||{})}catch(e){}}loaded=true}catch(e){console.warn('DEF v5.5 load failed',e)}finally{loading=false;render()}}
function css(){if($('gm55-style'))return;const s=document.createElement('style');s.id='gm55-style';s.textContent=`#defensePage .gm55-card{background:#fff;border:1px solid var(--line);border-radius:17px;padding:14px;margin-bottom:12px}.gm55-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.gm55-week{border:1px solid var(--line);border-radius:15px;padding:12px;background:#faf9f7}.gm55-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.gm55-current{margin-top:8px;padding:9px;border-radius:10px;background:#e4faf3;color:#146b55;font-size:10px;line-height:1.4}.gm55-best{margin-top:8px;padding:9px;border-radius:10px;background:#efe7ff;color:#5d3196;font-size:10px;line-height:1.4}.gm55-row{display:grid;grid-template-columns:20px 1fr auto;gap:7px;align-items:center;border-top:1px solid var(--line);padding:9px 0}.gm55-rank{font-size:10px;color:var(--muted);font-weight:900}.gm55-name{font-size:11px;font-weight:900}.gm55-meta{font-size:9px;color:var(--muted);margin-top:2px}.gm55-score{text-align:right;font-size:12px;font-weight:950}.gm55-tag{display:inline-block;font-size:8px;font-weight:950;border-radius:99px;padding:3px 5px;margin-left:4px}.gm55-better{background:#123a31!important;color:#bff8e9!important;border:1px solid #2b7e6a}.gm55-similar{background:#2a3038!important;color:#f2f5f8!important;border:1px solid #46515e}.gm55-worse{background:#4a2026!important;color:#ffd0d5!important;border:1px solid #7b3842}.gm55-note{font-size:10px;color:var(--muted);line-height:1.5;margin-top:10px}@media(max-width:850px){.gm55-grid{grid-template-columns:1fr}#defensePage .gm55-card{padding:12px}}`;document.head.appendChild(s)}
function ensure(){let page=$('defensePage');if(!page){page=document.createElement('section');page.id='defensePage';page.className='page';document.querySelector('main')?.appendChild(page)}if(!page.__gm55){page.__gm55=true;page.innerHTML='<div id="gm55-defense"></div>'}}
function weekBlock(w){const mine=rosterDef(),owned=ownedTeams(),defs=allDefIds(),current=mine.map(x=>score(x.team,x.id,w)).filter(Boolean).sort((a,b)=>b.score-a.score)[0]||null;const free=[];defs.forEach((id,t)=>{if(owned.has(t))return;const g=gameFor(t,w);if(!g)return;if(w===week()&&started(g))return;const r=score(t,id,w);if(r)free.push(r)});free.sort((a,b)=>b.score-a.score||a.oppPts-b.oppPts);const top=free.slice(0,8);let h=`<div class="gm55-week"><div class="gm55-head"><b>WEEK ${w}</b><span class="gm55-meta">${free.length} free ${w===week()?'& ready':''}</span></div>`;if(current)h+=`<div class="gm55-current"><b>YOUR ${current.team}</b> ${current.home?'vs':'@'} ${current.opp} · opponent ${current.oppPts.toFixed(1)} · GM score ${current.score}</div>`;if(!top.length)return h+'<div class="gm55-note">No currently free D/ST with an eligible game for this week.</div></div>';const best=top[0],delta=current?best.score-current.score:null;if(current&&delta>=4)h+=`<div class="gm55-best"><b>GM STREAM:</b> ${best.team} ${best.home?'vs':'@'} ${best.opp} · ${best.score} · +${delta} vs your DEF</div>`;h+=top.map((x,i)=>{const d=delta===null?null:x.score-current.score;const tag=d===null?'FREE':d>=4?'BETTER +'+d:d<=-4?'WORSE '+d:'SIMILAR '+(d>=0?'+':'')+d;const cls=d>=4?'gm55-better':d<=-4?'gm55-worse':'gm55-similar';return`<div class="gm55-row"><span class="gm55-rank">${i+1}</span><div><span class="gm55-name">${x.team}</span><span class="gm55-tag ${cls}">${tag}</span><div class="gm55-meta">${x.home?'vs':'@'} ${x.opp} · opp ${x.oppPts.toFixed(1)} · ${x.qbRank?'QB #'+x.qbRank+' · ':''}${x.total?'total '+x.total.toFixed(1)+' · ':''}proj ${x.proj>0?x.proj.toFixed(1):'modelled'}</div></div><span class="gm55-score">${x.score}</span></div>`}).join('');return h+'</div>'}
function render(){if(!ready())return;ensure();css();const box=$('gm55-defense');if(!box)return;if(!loaded){box.innerHTML='<div class="gm55-card"><h2>Defense Streaming</h2><div class="note">Loading live projections and schedule…</div></div>';load();return}const w=week(),mine=rosterDef();box.innerHTML=`<div class="gm55-card"><div class="title"><div><h2>Defense Streaming</h2><div class="note">Free D/ST only. Current-week games already started are removed.</div></div><span class="pill green">LIVE GM v5.5</span></div><div class="gm55-current" style="background:#f8f6f4;color:var(--ink)"><b>YOUR DEFENCE:</b> ${mine.map(x=>x.team).join(' · ')||'None detected'}</div><div class="gm55-grid">${[w,w+1,w+2].map(weekBlock).join('')}</div><div class="gm55-note"><b>GM score:</b> opponent scoring environment, Vegas total/spread, defensive baseline, D/ST quality, QB profile, projection and home field. It is a relative streaming signal, not an official fantasy projection.</div></div>`}
function boot(){css();ensure();render();let i=0;const t=setInterval(()=>{render();if(++i>50)clearInterval(t)},600);window.addEventListener('gm-live-availability',()=>{loaded=false;render()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
