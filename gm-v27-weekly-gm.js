/* Breezus NFL GM data service v2.9 */
(function(){
'use strict';
if(window.__gm27DataService)return;
window.__gm27DataService=true;
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const urls={games:['https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv','https://cdn.jsdelivr.net/gh/nflverse/nfldata@master/data/games.csv'],stats:['https://github.com/nflverse/nflverse-data/releases/download/stats_player/stats_player.csv','https://cdn.jsdelivr.net/gh/nflverse/nflverse-data@master/data/stats_player.csv']};
function parseCSV(text){const rows=[];let row=[],cell='',q=false;for(let i=0;i<text.length;i++){const c=text[i],nx=text[i+1];if(c==='"'){if(q&&nx==='"'){cell+='"';i++}else q=!q}else if(c===','&&!q){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&nx==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell=''}else cell+=c}if(cell||row.length){row.push(cell);rows.push(row)}if(!rows.length)return[];const h=rows.shift().map(x=>x.trim());return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]??''])))}
async function fetchText(url,timeout){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout||12000);try{const r=await fetch(url,{cache:'no-store',signal:ctl.signal});if(!r.ok)throw Error(String(r.status));return await r.text()}finally{clearTimeout(timer)}}
async function load(){if(window.__gm27DataReady)return;let games=[];for(const u of urls.games){try{games=parseCSV(await fetchText(u,10000));if(games.length>200)break}catch(e){}}window.__gm27Games=games.map(g=>({season:n(g.season),week:n(g.week),home_team:String(g.home_team||'').toUpperCase(),away_team:String(g.away_team||'').toUpperCase(),home_score:n(g.home_score),away_score:n(g.away_score),spread_line:n(g.spread_line),total_line:n(g.total_line)}));let stats=[];for(const u of urls.stats){try{stats=parseCSV(await fetchText(u,16000));if(stats.length>1000)break}catch(e){}}window.__gm27Stats=stats;window.__gm27StatsReady=stats.length>1000;window.__gm27DataReady=true;window.__gm27DataSeason=2026;window.dispatchEvent(new Event('gm-data-ready'))}
window.__gm27DataPromise=load();
})();