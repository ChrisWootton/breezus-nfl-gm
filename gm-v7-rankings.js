/* Breezus NFL GM v7.2 - Player Rankings */
(function(){
'use strict';
if(window.__gmRankings7)return;
window.__gmRankings7=true;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const pos=id=>typeof position==='function'?position(id):player(id)?.position||'';
const name=id=>typeof pn==='function'?pn(id):player(id)?.full_name||id;
const er=id=>typeof expertRank==='function'?num(expertRank(id),999):999;
const ep=id=>typeof expectedPoints==='function'?num(expectedPoints(id)):0;
const dy=id=>typeof dynastyScore==='function'?num(dynastyScore(id)):0;
function css(){if($('gm7r-style'))return;const s=document.createElement('style');s.id='gm7r-style';s.textContent=`.gm7r table{font-size:12px}.gm7r .filters{display:grid;grid-template-columns:1fr 140px 140px;gap:8px}.gm7r .filters input,.gm7r .filters select{width:100%;padding:10px;border:1px solid var(--line);border-radius:9px;background:#fff}@media(max-width:700px){.gm7r .filters{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function activate(){document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$('gm7-rankings').classList.add('active');document.querySelectorAll('.nav button[data-p]').forEach(x=>x.classList.toggle('active',x.dataset.p==='gm7-rankings'));window.scrollTo({top:0,behavior:'smooth'})}
function renderRows(){
 const q=($('gm7r-q')?.value||'').toLowerCase().trim(),pfil=$('gm7r-pos')?.value||'ALL',mode=$('gm7r-mode')?.value||'WEEKLY';
 const rows=Object.values(S.players||{}).filter(p=>{
   const id=String(p.player_id||'');if(!id||p.active===false)return false;
   if(!['QB','RB','WR','TE'].includes(p.position))return false;
   if(pfil!=='ALL'&&p.position!==pfil)return false;
   return !q||String(p.full_name||'').toLowerCase().includes(q)||String(p.team||'').toLowerCase().includes(q);
 }).sort((a,b)=>mode==='DYNASTY'?dy(b.player_id)-dy(a.player_id):mode==='PROJECTION'?ep(b.player_id)-ep(a.player_id):er(a.player_id)-er(b.player_id)).slice(0,250);
 $('gm7r-count').textContent=rows.length+' shown';
 $('gm7r-body').innerHTML=rows.map((p,i)=>{const id=String(p.player_id),st=typeof playerStatus==='function'?playerStatus(id):null;const read=st?.label==='OUT'?'OUT':mode==='DYNASTY'?(dy(id)>=70?'CORE':dy(id)>=50?'HOLD':'DEVELOP'):(er(id)<=20?'START':er(id)<=50?'FLEX':'DEPTH');return`<tr><td><b>${i+1}</b></td><td><b>${esc(name(id))}</b><br><span class="meta">${esc(p.team||'FA')} · age ${p.age??'—'}</span></td><td>${p.position}</td><td>#${er(id)}</td><td>${ep(id).toFixed(1)}</td><td>${dy(id)}</td><td><span class="pill ${st?.label==='OUT'?'red':read==='CORE'||read==='START'?'green':read==='HOLD'||read==='FLEX'?'blue':'amber'}">${read}</span></td></tr>`}).join('')||'<tr><td colspan="7">No players found.</td></tr>';
}
function render(){if(!S||!S.players||!Object.keys(S.players||{}).length)return;css();let page=$('gm7-rankings');if(!page){page=document.createElement('section');page.id='gm7-rankings';page.className='page';document.querySelector('main')?.appendChild(page)}page.innerHTML=`<div class="gm7r card"><div class="title"><div><h2>Player Rankings</h2><p class="note">Live player database with weekly model output and dynasty value. Rankings are a decision aid, not a claim of expert consensus.</p></div><span class="pill green" id="gm7r-count">—</span></div><div class="filters" style="margin:10px 0"><input id="gm7r-q" placeholder="Search player or team"><select id="gm7r-pos"><option>ALL</option><option>QB</option><option>RB</option><option>WR</option><option>TE</option></select><select id="gm7r-mode"><option value="WEEKLY">Weekly rank</option><option value="PROJECTION">GM projection</option><option value="DYNASTY">Dynasty value</option></select></div><div class="tablewrap"><table><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>Rank</th><th>Proj</th><th>Dynasty</th><th>Read</th></tr></thead><tbody id="gm7r-body"></tbody></table></div></div>`;['gm7r-q','gm7r-pos','gm7r-mode'].forEach(id=>$(id).oninput=renderRows);renderRows()}
function addNav(){const nav=document.querySelector('.nav');if(!nav||nav.querySelector('[data-p="gm7-rankings"]'))return;const b=document.createElement('button');b.type='button';b.dataset.p='gm7-rankings';b.textContent='📊 Rankings';b.onclick=activate;const players=nav.querySelector('[data-p="playersPage"]');if(players)players.parentNode.insertBefore(b,players.nextSibling);else nav.appendChild(b)}
function boot(){addNav();let n=0;const t=setInterval(()=>{addNav();render();if(++n>100)clearInterval(t)},500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1500));else setTimeout(boot,1500);
})();