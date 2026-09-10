const NFL_RSS = 'https://www.nfl.com/?format=rss';
const SLEEPER_PROJECTIONS = 'https://api.sleeper.com/projections/nfl';

function clean(s='') { return s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim(); }
function extractItems(xml='') {
  const out=[];
  const re=/<item[\s\S]*?<\/item>/gi;
  for(const item of xml.match(re)||[]) {
    const title=(item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1];
    const link=(item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)||[])[1];
    const date=(item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)||[])[1];
    if(title) out.push({title:clean(title),link:clean(link||''),date:clean(date||'')});
  }
  return out.slice(0,25);
}
function projectionMap(data=[]) {
  const out={};
  const list=Array.isArray(data)?data:(data&&typeof data==='object'?Object.values(data):[]);
  for(const x of list){
    const id=String(x?.player_id||x?.playerId||x?.id||'');
    if(id)out[id]=x;
  }
  return out;
}

export async function onRequestGet(context) {
  const url=new URL(context.request.url);
  const names=(url.searchParams.get('names')||'').split('|').map(x=>x.trim().toLowerCase()).filter(Boolean);
  const season=url.searchParams.get('season')||'2026';
  const week=url.searchParams.get('week')||'1';
  const seasonType='regular';
  const positions=['QB','RB','WR','TE','DEF','K'];
  const projectionUrl=new URL(`${SLEEPER_PROJECTIONS}/${encodeURIComponent(season)}/${encodeURIComponent(week)}`);
  projectionUrl.searchParams.set('season_type',seasonType);
  positions.forEach(pos=>projectionUrl.searchParams.append('position[]',pos));

  const result={source:'NFL.com RSS + Sleeper weekly projections',updated:new Date().toISOString(),alerts:[],headlines:[],projections:{},projectionMeta:{season,week,season_type:seasonType}};
  try {
    const [rssResp,projResp]=await Promise.allSettled([
      fetch(NFL_RSS,{headers:{'User-Agent':'BreezusChrist-NFL-GM/1.0'}}),
      fetch(projectionUrl.toString(),{headers:{'User-Agent':'BreezusChrist-NFL-GM/1.0','Accept':'application/json'}})
    ]);
    if(rssResp.status==='fulfilled' && rssResp.value.ok){
      const xml=await rssResp.value.text();
      const items=extractItems(xml);
      result.alerts=items.filter(x=>names.some(n=>n.length>3 && x.title.toLowerCase().includes(n))).slice(0,12);
      result.headlines=items.slice(0,12);
    }
    if(projResp.status==='fulfilled' && projResp.value.ok){
      const data=await projResp.value.json();
      result.projections=projectionMap(data);
      result.projectionMeta.count=Object.keys(result.projections).length;
    } else if(projResp.status==='fulfilled') {
      result.projectionMeta.error=`Sleeper projections HTTP ${projResp.value.status}`;
    } else {
      result.projectionMeta.error=String(projResp.reason||'Sleeper projections unavailable');
    }
  } catch(e) {
    result.error=String(e);
  }
  return Response.json(result,{headers:{'Cache-Control':'public, max-age=120'}});
}
