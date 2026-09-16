const BASE = 'https://api.sleeper.app';

function validSeason(value) {
  const s = String(value || '2026');
  return /^20\d{2}$/.test(s) ? s : '2026';
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const season = validSeason(url.searchParams.get('season'));
  const upstreamUrl = `${BASE}/schedule/nfl/regular/${season}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BreezusChrist-NFL-GM/3.1'
      }
    });
    const text = await upstream.text();
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=300'
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({
        error: `Sleeper schedule returned ${upstream.status}`,
        season
      }), { status: upstream.status, headers });
    }

    return new Response(text || '[]', { status: 200, headers });
  } catch (err) {
    return Response.json({
      error: 'Unable to reach Sleeper schedule.',
      detail: err instanceof Error ? err.message : String(err),
      season
    }, { status: 504 });
  }
}
