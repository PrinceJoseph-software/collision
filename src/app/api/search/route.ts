import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // 1. Search YouTube (Primary)
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' audio')}&type=video&maxResults=1&key=${apiKey}`;
    const ytResponse = await fetch(ytUrl);
    const ytData = await ytResponse.json();

    let ytResult = null;
    if (ytData.items && ytData.items.length > 0) {
      ytResult = {
        source: 'youtube',
        id: ytData.items[0].id.videoId,
        title: ytData.items[0].snippet.title
      };
    }

    // 2. Search SoundCloud (Fallback)
    // Using a public, no-auth search endpoint
    const scUrl = `https://api-v2.soundcloud.com/search/queries?q=${encodeURIComponent(query)}&client_id=YOUR_CLIENT_ID`;
    // Note: Since we don't have a SC client ID, we'll use a scraper logic in the proxy if needed.
    // For now, we'll rely on the YouTube result but mark it for "Deep Proxying"

    if (!ytResult) {
      return NextResponse.json({ error: 'No audio match found' }, { status: 404 });
    }

    return NextResponse.json({ match: ytResult });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
