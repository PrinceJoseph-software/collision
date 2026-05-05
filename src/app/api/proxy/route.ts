import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('id');

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  // List of redundant bridge sources to try server-side
  const sources = [
    `https://api.v-mp3.com/@api/button/mp3/${videoId}`,
    `https://api.vevioz.com/@api/button/mp3/${videoId}`,
    `https://api.mp3.io/@api/button/mp3/${videoId}`
  ];

  for (const source of sources) {
    try {
      console.log(`Proxying audio from: ${source}`);
      const response = await fetch(source, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (response.ok) {
        // Return the stream directly to the frontend
        return new NextResponse(response.body, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (error) {
      console.error(`Failed to fetch from ${source}:`, error);
      continue; // Try next source
    }
  }

  return NextResponse.json({ error: 'Failed to fetch audio from all sources' }, { status: 502 });
}
