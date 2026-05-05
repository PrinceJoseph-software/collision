import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // 1. Search YouTube for official audio
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' official audio')}&type=video&maxResults=1&key=${apiKey}`;
    
    const ytResponse = await fetch(ytUrl);
    const ytData = await ytResponse.json();

    let results = [];

    if (ytData.items && ytData.items.length > 0) {
      results.push({
        source: 'youtube',
        id: ytData.items[0].id.videoId,
        title: ytData.items[0].snippet.title
      });
    }

    // 2. Search SoundCloud as a fallback
    // We can use a public search scraper or simply return a hint to the frontend
    // For now, we'll return the YouTube result and a "Search Hint"
    
    if (results.length === 0) {
      return NextResponse.json({ error: 'No audio match found for this track.' }, { status: 404 });
    }

    return NextResponse.json({
      match: results[0],
      alternative: null // Could be a SoundCloud ID in the future
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
