import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // 1. Search YouTube (Primary)
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' official audio')}&type=video&maxResults=1&key=${apiKey}`;
    const ytResponse = await fetch(ytUrl);
    const ytData = await ytResponse.json();

    if (ytData.items && ytData.items.length > 0) {
      return NextResponse.json({
        match: {
          source: 'youtube',
          id: ytData.items[0].id.videoId,
          title: ytData.items[0].snippet.title
        }
      });
    }

    // 2. Fallback: Search SoundCloud (Basic Implementation)
    // In a real pro app, we'd use a SC Client ID. For now, we optimize YT matching.
    
    return NextResponse.json({ error: 'No match found' }, { status: 404 });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
