const BASE = 'https://github.com/nflverse/nflverse-data/releases/download/player_stats';

function season(value) {
  const s = String(value || '2026');
  return /^20\d{2}$/.test(s) ? s : '2026';
}

function csv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += c;
  }
  if (cell || row.length) { row.push(cell); if (row.some(Boolean)) rows.push(row); }
  if (!rows.length) return [];
  const head = rows.shift().map(x => x.trim());
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
}

export async function onRequestGet(context) {
  const s = season(new URL(context.request.url).searchParams.get('season'));
  const urls = [
    `${BASE}/stats_player_reg_${s}.csv`,
    `https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_${s}.csv`
  ];
  for (const url of urls) {
    try {
      const r = await fetch(url, { headers: { Accept: 'text/csv' } });
      if (!r.ok) continue;
      const rows = csv(await r.text()).map(x => ({
        season: Number(x.season || s), week: Number(x.week || 0),
        player_id: String(x.player_id || x.gsis_id || ''),
        player_name: String(x.player_display_name || x.player_name || ''),
        position: String(x.position || '').toUpperCase(),
        team: String(x.team || '').toUpperCase(),
        opponent_team: String(x.opponent_team || '').toUpperCase(),
        fantasy_points: Number(x.fantasy_points || 0),
        fantasy_points_ppr: Number(x.fantasy_points_ppr || 0)
      })).filter(x => x.week > 0 && x.team && x.opponent_team);
      return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' } });
    } catch (e) {}
  }
  return new Response(JSON.stringify([]), { status: 502, headers: { 'content-type': 'application/json; charset=utf-8' } });
}
