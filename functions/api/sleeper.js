const BASE = 'https://api.sleeper.app/v1';

function withTimeout(promise, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return Promise.race([
    promise(controller.signal),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Sleeper upstream timed out.')), ms + 50))
  ]).finally(() => clearTimeout(timer));
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.searchParams.get('path');

  if (!path || !path.startsWith('/') || path.includes('..')) {
    return Response.json({ error: 'Missing or invalid Sleeper API path.' }, { status: 400 });
  }

  try {
    const upstream = await withTimeout(signal => fetch(BASE + path, {
      signal,
      headers: { 'Accept': 'application/json', 'User-Agent': 'BreezusChrist-NFL-GM/1.0' }
    }), path === '/players/nfl' ? 30000 : 12000);

    const text = await upstream.text();
    const headers = new Headers({
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': path === '/players/nfl' ? 'public, max-age=86400, s-maxage=86400' : 'no-store'
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Sleeper returned ${upstream.status}`, status: upstream.status, path }), {
        status: upstream.status,
        headers
      });
    }

    if (!text || text.trim() === 'null') {
      return new Response(JSON.stringify({ error: 'Sleeper returned an empty/null response.', path }), {
        status: 502,
        headers
      });
    }

    return new Response(text, { status: 200, headers });
  } catch (err) {
    const detail = err?.name === 'AbortError' ? 'Sleeper request timed out.' : (err instanceof Error ? err.message : String(err));
    return Response.json({ error: 'Unable to reach Sleeper.', detail }, { status: 504 });
  }
}
