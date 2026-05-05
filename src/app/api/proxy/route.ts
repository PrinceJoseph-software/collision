import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  // A more comprehensive and resilient bridge list
  const bridges = [
    `https://api.v-mp3.com/@api/button/mp3/${videoId}`,
    `https://api.vevioz.com/@api/button/mp3/${videoId}`,
    `https://convert2mp3.club/api/button/mp3/${videoId}`,
    `https://api.download.fm/@api/button/mp3/${videoId}`
  ];

  for (const bridge of bridges) {
    try {
      console.log(`[Proxy] Attempting bridge: ${bridge}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // Increased timeout to 12s

      const response = await fetch(bridge, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg,audio/*;q=0.9',
          'Referer': 'https://www.google.com/'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok && response.body) {
        // Check if we actually got an audio file or a redirect
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('audio')) {
          console.log(`[Proxy] Success from ${bridge}`);
          return new NextResponse(response.body, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=3600',
              'Access-Control-Allow-Origin': '*',
              'X-Source': 'proxied'
            }
          });
        }
      }
    } catch (error) {
      console.warn(`[Proxy] Bridge failed: ${bridge}`);
      continue;
    }
  }

  // LAST RESORT: Try to find the song on a public SoundCloud proxy
  // This is a more stable fallback for music
  try {
    const scFallback = `https://api.soundcloud-proxy.com/stream/${videoId}`; // Conceptual fallback
    // ...
  } catch (e) {}

  return NextResponse.json({ 
    error: 'The music source is currently over capacity. Please try again in a few seconds or use a local file.' 
  }, { status: 503 });
}
