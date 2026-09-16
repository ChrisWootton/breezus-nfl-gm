/* Breezus NFL GM Live Availability Guard v1.1 */
(function(){
  'use strict';
  let busy=false,last=0,ownedTeams=new Set(),ownedIds=new Set();
  function ready(){return typeof S!=='undefined'&&S&&S.league&&Array.isArray(S.rosters)&&S.players&&Object.keys(S.players).length>0}
  function lid(){return String(S.league?.league_id||S.league?.leagueId||document.getElementById('leagueId')?.value||'').trim()}
  function player(id){const k=String(id);return S.players?.[k]||Object.values(S.players||{}).find(p=>String(p?.player_id||p?.id||'')===k)||null}
  function isDef(id){const p=player(id);const x=String(p?.position||'').toUpperCase();return x==='DEF'||x==='DST'||x==='D/ST'||x==='DEFENSE'}
  function team(id){return String(player(id)?.team||'').toUpperCase().trim()}
  function buildOwnership(rs,tx){
    ownedTeams=new Set();ownedIds=new Set();
    const rostered=new Set();
    (rs||[]).forEach(r=>(r.players||[]).forEach(id=>{
      const k=String(id);rostered.add(k);ownedIds.add(k);
      if(isDef(k)&&team(k))ownedTeams.add(team(k));
    }));
    const txOwner=new Map();
    (tx||[]).slice().sort((a,b)=>Number(a.created||0)-Number(b.created||0)).forEach(t=>{
      Object.keys(t.drops||{}).forEach(id=>{const k=String(id);if(isDef(k))txOwner.delete(k)});
      Object.keys(t.adds||{}).forEach(id=>{const k=String(id);if(isDef(k))txOwner.set(k,t.adds[id])});
    });
    txOwner.forEach((rosterId,id)=>{
      if(rostered.has(String(id)))return;
      const t=team(id);if(t)ownedTeams.add(t);
    });
  }
  async function get(path){
    const r=await fetch('/api/sleeper?path='+encodeURIComponent(path),{cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)throw Error('Sleeper '+r.status);return r.json();
  }
  function hideUnavailable(){
    const roots=[document.getElementById('gm25-def-compare'),document.getElementById('gm25-def-streaming')].filter(Boolean);
    roots.forEach(root=>{
      root.querySelectorAll('.gm25cmprow,.gm25defrow').forEach(row=>{
        const el=row.querySelector('.gm25cmpname,.gm25defname');
        const t=String(el?.textContent||'').trim().toUpperCase();
        if(ownedTeams.has(t))row.remove();
      });
      root.querySelectorAll('.gm25cmpweek,.gm25defweek').forEach(w=>{
        w.querySelectorAll('.gm25cmprow,.gm25defrow').forEach((row,i)=>{
          const rank=row.querySelector('.gm25cmpmeta,.gm25defrank');if(rank)rank.textContent=String(i+1);
        });
      });
    });
    const trend=document.getElementById('gm25-trending');
    if(trend){
      trend.querySelectorAll('.gm25trendcard').forEach(card=>{
        const title=String(card.querySelector('.gm25trendname')?.textContent||'').trim().toUpperCase();
        if(title!=='DEFENCE'&&title!=='DEF')return;
        card.querySelectorAll('.gm25trendrow').forEach(row=>{
          const name=String(row.querySelector('.gm25trendname')?.textContent||'').trim();
          const id=Object.keys(S.players||{}).find(k=>String(S.players[k]?.full_name||'').trim()===name);
          const t=id?team(id):'';
          if(t&&ownedTeams.has(t))row.remove();
        });
        card.querySelectorAll('.gm25trendrow').forEach((row,i)=>{
          const rank=row.querySelector('.gm25trendrank');if(rank)rank.textContent=String(i+1);
        });
      });
    }
  }
  async function refresh(force){
    if(!ready()||busy)return;
    if(!force&&Date.now()-last<15000){hideUnavailable();return}
    busy=true;
    try{
      const id=lid(),week=Number(S.week||1);
      const results=await Promise.allSettled([get('/league/'+id+'/rosters'),get('/league/'+id+'/transactions/'+week)]);
      const rs=results[0].status==='fulfilled'&&Array.isArray(results[0].value)?results[0].value:S.rosters;
      const tx=results[1].status==='fulfilled'&&Array.isArray(results[1].value)?results[1].value:(S.tx||[]);
      S.rosters=rs;if(S.me)S.mine=rs.find(r=>String(r.owner_id)===String(S.me.user_id))||S.mine;
      buildOwnership(rs,tx);last=Date.now();hideUnavailable();
      try{window.dispatchEvent(new CustomEvent('gm-live-availability',{detail:{teams:[...ownedTeams]}}))}catch(e){}
    }catch(e){console.warn('Live availability guard failed',e);hideUnavailable()}
    finally{busy=false}
  }
  window.gmRefreshLiveAvailability=refresh;
  function boot(){
    const target=document.getElementById('waiversPage')||document.body;
    try{new MutationObserver(()=>hideUnavailable()).observe(target,{childList:true,subtree:true});}catch(e){}
    refresh(true);
    setInterval(()=>refresh(false),15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
