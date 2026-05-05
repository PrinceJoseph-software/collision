import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  // A comprehensive list of redundant bridges
  const sources = [
    `https://api.v-mp3.com/@api/button/mp3/${videoId}`,
    `https://api.vevioz.com/@api/button/mp3/${videoId}`,
    `https://convert2mp3.club/api/button/mp3/${videoId}`,
    `https://api.download.fm/@api/button/mp3/${videoId}`,
    `https://loader.to/api/button/mp3/${videoId}`
  ];

  for (const source of sources) {
    try {
      console.log(`[Proxy] Attempting source: ${source}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 second timeout

      const response = await fetch(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg,audio/*;q=0.9',
          'Referer': 'https://www.google.com/'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok && response.body) {
        console.log(`[Proxy] Success from ${source}`);
        return new NextResponse(response.body, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'X-Audio-Source': 'proxied-bridge'
          }
        });
      }
    } catch (error) {
      console.warn(`[Proxy] Source failed or timed out: ${source}`);
      continue;
    }
  }

  return NextResponse.json({ 
    error: 'All audio sources are currently unavailable. This track might be restricted in your region.' 
  }, { status: 503 });
}
