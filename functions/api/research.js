const NFL_RSS = 'https://www.nfl.com/?format=rss';
const NFL_NEWS = 'https://www.nfl.com/news';

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

export async function onRequestGet(context) {
  const url=new URL(context.request.url);
  const names=(url.searchParams.get('names')||'').split('|').map(x=>x.trim().toLowerCase()).filter(Boolean);
  try {
    const r=await fetch(NFL_RSS,{headers:{'User-Agent':'BreezusChrist-NFL-GM/1.0'}});
    const xml=await r.text();
    const items=extractItems(xml);
    const alerts=items.filter(x=>names.some(n=>n.length>3 && x.title.toLowerCase().includes(n))).slice(0,12);
    return Response.json({source:'NFL.com RSS',updated:new Date().toISOString(),alerts,headlines:items.slice(0,12)},{headers:{'Cache-Control':'public, max-age=120'}});
  } catch(e) {
    return Response.json({source:'NFL.com RSS',updated:new Date().toISOString(),alerts:[],headlines:[],error:String(e)},{status:200});
  }
}
