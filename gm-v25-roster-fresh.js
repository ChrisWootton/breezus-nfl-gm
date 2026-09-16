/* Breezus NFL GM Live Roster Freshness v1.0 */
(function(){
  'use strict';
  let busy=false,last=0;
  function ready(){return typeof S!=='undefined'&&S&&S.league&&Array.isArray(S.rosters)&&S.me}
  function leagueId(){return String(S.league?.league_id||S.league?.leagueId||document.getElementById('leagueId')?.value||'').trim()}
  function fingerprint(rs){return (rs||[]).map(r=>String(r.roster_id)+':'+(r.owner_id||'')+':'+(r.players||[]).map(String).sort().join(',')).sort().join('|')}
  async function refresh(force){
    if(busy||!ready())return false;
    if(!force&&Date.now()-last<45000)return false;
    const lid=leagueId();if(!lid)return false;
    busy=true;
    try{
      const url='/api/sleeper?path='+encodeURIComponent('/league/'+lid+'/rosters');
      const r=await fetch(url,{cache:'no-store',headers:{Accept:'application/json'}});
      if(!r.ok)throw Error('Roster refresh HTTP '+r.status);
      const rs=await r.json();
      if(!Array.isArray(rs)||!rs.length)throw Error('Roster refresh returned no rosters');
      const before=fingerprint(S.rosters),after=fingerprint(rs);
      S.rosters=rs;
      if(S.me)S.mine=rs.find(x=>String(x.owner_id)===String(S.me.user_id))||S.mine;
      last=Date.now();
      if(before!==after){
        try{window.dispatchEvent(new CustomEvent('gm-roster-updated',{detail:{at:last}}))}catch(e){}
      }
      return true;
    }catch(e){console.warn('Live roster refresh failed',e);return false}
    finally{busy=false}
  }
  window.gmRefreshRosterState=refresh;
  window.gmRosterRefreshPromise=refresh(true);
  setInterval(()=>refresh(false),60000);
})();
