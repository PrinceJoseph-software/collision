import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  // A more robust list of pro-grade bridges
  const sources = [
    `https://api.v-mp3.com/@api/button/mp3/${videoId}`,
    `https://api.vevioz.com/@api/button/mp3/${videoId}`,
    `https://convert2mp3.club/api/button/mp3/${videoId}`,
    `https://api.download.fm/@api/button/mp3/${videoId}`
  ];

  for (const source of sources) {
    try {
      console.log(`Attempting failover proxy from: ${source}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per source

      const response = await fetch(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
          'Referer': 'https://google.com'
        },
        signal: controller.signal,
        next: { revalidate: 3600 }
      });

      clearTimeout(timeoutId);

      if (response.ok && response.body) {
        console.log(`Success! Streaming from ${source}`);
        return new NextResponse(response.body, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (error) {
      console.error(`Source ${source} failed or timed out. Trying next...`);
      continue;
    }
  }

  return NextResponse.json({ 
    error: 'All audio bridges are currently busy or unavailable. Please try again in a few moments.' 
  }, { status: 503 });
}
