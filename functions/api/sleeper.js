const BASE = 'https://api.sleeper.app/v1';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const path = url.searchParams.get('path');

  if (!path || !path.startsWith('/')) {
    return Response.json(
      { error: 'Missing or invalid Sleeper API path.' },
      { status: 400 }
    );
  }

  const target = BASE + path;

  try {
    const upstream = await fetch(target, {
      headers: { 'Accept': 'application/json' }
    });

    const text = await upstream.text();

    const headers = new Headers({
      'Content-Type':
        upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store'
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: `Sleeper returned ${upstream.status}`,
          status: upstream.status,
          path
        }),
        { status: upstream.status, headers }
      );
    }

    return new Response(text, {
      status: 200,
      headers
    });

  } catch (err) {
    return Response.json(
      {
        error: 'Unable to reach Sleeper.',
        detail: err instanceof Error ? err.message : String(err)
      },
      { status: 502 }
    );
  }
}
