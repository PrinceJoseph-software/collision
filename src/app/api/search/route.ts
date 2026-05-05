import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API Key not configured' }, { status: 500 });
    }

    // Search for the best audio match on YouTube
    // We add "topic" or "lyrics" to get higher quality audio results
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + ' audio')}&type=video&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: 'No match found' }, { status: 404 });
    }

    const videoId = data.items[0].id.videoId;
    const title = data.items[0].snippet.title;

    return NextResponse.json({
      videoId,
      title,
      // We'll use a public, reliable stream proxy for the actual audio data
      // In a full production app, you'd host your own instance of a stream proxy
      streamUrl: `https://yt-stream-proxy.p.rapidapi.com/download?id=${videoId}` 
    });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search for audio' }, { status: 500 });
  }
}
