/* Breezus NFL GM Live Availability Guard v1.5 */
(function(){
  'use strict';
  let busy=false,last=0,ownedTeams=new Set(),ownedIds=new Set(),liveVerified=false;
  function ready(){return typeof S!=='undefined'&&S&&S.league&&Array.isArray(S.rosters)&&S.players&&Object.keys(S.players).length>0}
  function lid(){return String(S.league?.league_id||S.league?.leagueId||document.getElementById('leagueId')?.value||'').trim()}
  function player(id){const k=String(id);return S.players?.[k]||Object.values(S.players||{}).find(p=>String(p?.player_id||p?.id||'')===k)||null}
  function isDef(id){const p=player(id);const x=String(p?.position||'').toUpperCase();return x==='DEF'||x==='DST'||x==='D/ST'||x==='DEFENSE'}
  function team(id){return String(player(id)?.team||'').toUpperCase().trim()}
  function publish(){
    window.gmLiveOwnedDefTeams=new Set(ownedTeams);
    window.gmLiveOwnedDefIds=new Set(ownedIds);
    window.gmLiveAvailabilityVerified=liveVerified;
    try{window.dispatchEvent(new CustomEvent('gm-live-availability',{detail:{teams:[...ownedTeams],verified:liveVerified}}))}catch(e){}
  }
  function seedLocalOwnership(){
    ownedTeams=new Set();ownedIds=new Set();
    (S.rosters||[]).forEach(r=>(r.players||[]).forEach(id=>{
      const k=String(id);ownedIds.add(k);if(isDef(k)&&team(k))ownedTeams.add(team(k));
    }));
    publish();
  }
  function buildOwnership(rs,txLists){
    ownedTeams=new Set();ownedIds=new Set();
    const rostered=new Set();
    (rs||[]).forEach(r=>(r.players||[]).forEach(id=>{
      const k=String(id);rostered.add(k);ownedIds.add(k);
      if(isDef(k)&&team(k))ownedTeams.add(team(k));
    }));
    const txOwner=new Map();
    (txLists||[]).flat().filter(Boolean).slice().sort((a,b)=>Number(a.created||0)-Number(b.created||0)).forEach(t=>{
      const status=String(t.status||'complete').toLowerCase();
      if(status&&status!=='complete'&&status!=='success')return;
      Object.keys(t.drops||{}).forEach(id=>{const k=String(id);if(isDef(k))txOwner.delete(k)});
      Object.keys(t.adds||{}).forEach(id=>{const k=String(id);if(isDef(k))txOwner.set(k,t.adds[id])});
    });
    txOwner.forEach((rosterId,id)=>{
      if(rostered.has(String(id)))return;
      const t=team(id);if(t)ownedTeams.add(t);
    });
    publish();
  }
  async function get(path){
    const sep=path.includes('?')?'&':'?';
    const fresh=path+sep+'_gmts='+Date.now();
    const r=await fetch('/api/sleeper?path='+encodeURIComponent(fresh),{cache:'no-store',headers:{Accept:'application/json'}});
    if(!r.ok)throw Error('Sleeper '+r.status);return r.json();
  }
  async function refresh(force){
    if(!ready()||busy)return;
    if(!force&&Date.now()-last<10000)return;
    busy=true;
    try{
      const id=lid(),week=Math.max(1,Number(S.week||1));
      const txWeeks=Array.from({length:week},(_,i)=>i+1);
      const results=await Promise.allSettled([
        get('/league/'+id+'/rosters'),
        ...txWeeks.map(w=>get('/league/'+id+'/transactions/'+w))
      ]);
      const rr=results[0];
      const rs=rr.status==='fulfilled'&&Array.isArray(rr.value)?rr.value:null;
      if(rs&&rs.length){
        S.rosters=rs;
        if(S.me)S.mine=rs.find(r=>String(r.owner_id)===String(S.me.user_id))||S.mine;
        liveVerified=true;
      }else liveVerified=false;
      const txLists=results.slice(1).map(x=>x.status==='fulfilled'&&Array.isArray(x.value)?x.value:[]);
      buildOwnership(rs||S.rosters,txLists);
      last=Date.now();
    }catch(e){
      liveVerified=false;
      publish();
      console.warn('Live availability refresh failed',e);
    }finally{busy=false}
  }
  window.gmRefreshLiveAvailability=refresh;
  function boot(){
    if(!ready())return;
    seedLocalOwnership();
    refresh(true);
    setInterval(()=>refresh(false),10000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
