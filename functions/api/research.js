const NFL_RSS = 'https://www.nfl.com/?format=rss';
const SLEEPER_PROJECTIONS = 'https://api.sleeper.com/projections/nfl';

function clean(s = '') {
  return s.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
}

function extractItems(xml = '') {
  const out = [];
  const re = /<item[\s\S]*?<\/item>/gi;
  for (const item of xml.match(re) || []) {
    const title = (item.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
    const link = (item.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1];
    const date = (item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1];
    if (title) out.push({ title: clean(title), link: clean(link || ''), date: clean(date || '') });
  }
  return out.slice(0, 25);
}

function projectionMap(data = []) {
  const out = {};
  const list = Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.values(data) : []);
  for (const x of list) {
    const id = String(x?.player_id || x?.playerId || x?.id || '');
    if (id) out[id] = x;
  }
  return out;
}

async function fetchBounded(url, options = {}, ms = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const names = (url.searchParams.get('names') || '').split('|').map(x => x.trim().toLowerCase()).filter(Boolean).slice(0, 80);
  const season = url.searchParams.get('season') || '2026';
  const week = url.searchParams.get('week') || '1';
  const seasonType = 'regular';
  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K'];
  const projectionUrl = new URL(`${SLEEPER_PROJECTIONS}/${encodeURIComponent(season)}/${encodeURIComponent(week)}`);
  projectionUrl.searchParams.set('season_type', seasonType);
  positions.forEach(pos => projectionUrl.searchParams.append('position[]', pos));

  const result = {
    source: 'NFL.com RSS + Sleeper weekly projections',
    updated: new Date().toISOString(),
    alerts: [],
    headlines: [],
    projections: {},
    projectionMeta: { season, week, season_type: seasonType, count: 0 },
    warnings: []
  };

  const [rssResult, projResult] = await Promise.allSettled([
    fetchBounded(NFL_RSS, { headers: { 'User-Agent': 'BreezusChrist-NFL-GM/1.0', 'Accept': 'application/rss+xml,text/xml;q=0.9,*/*;q=0.8' } }),
    fetchBounded(projectionUrl.toString(), { headers: { 'User-Agent': 'BreezusChrist-NFL-GM/1.0', 'Accept': 'application/json' } })
  ]);

  if (rssResult.status === 'fulfilled' && rssResult.value.ok) {
    try {
      const xml = await rssResult.value.text();
      const items = extractItems(xml);
      result.alerts = items.filter(x => names.some(n => n.length > 3 && x.title.toLowerCase().includes(n))).slice(0, 12);
      result.headlines = items.slice(0, 12);
    } catch (e) {
      result.warnings.push('NFL news feed could not be parsed.');
    }
  } else {
    result.warnings.push('NFL news feed timed out or was unavailable.');
  }

  if (projResult.status === 'fulfilled' && projResult.value.ok) {
    try {
      const data = await projResult.value.json();
      result.projections = projectionMap(data);
      result.projectionMeta.count = Object.keys(result.projections).length;
      if (!result.projectionMeta.count) result.warnings.push('No weekly projections were returned by Sleeper.');
    } catch (e) {
      result.warnings.push('Sleeper projections returned unreadable data.');
    }
  } else {
    result.projectionMeta.error = projResult.status === 'fulfilled' ? `Sleeper projections HTTP ${projResult.value.status}` : 'Sleeper projections timed out or were unavailable.';
    result.warnings.push('Weekly projections were unavailable, so the GM used Sleeper roster and player data instead.');
  }

  return Response.json(result, { headers: { 'Cache-Control': 'public, max-age=120, s-maxage=120' } });
}
