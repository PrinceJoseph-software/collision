import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    // Extract Spotify track ID
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid Spotify URL' }, { status: 400 });
    }
    const trackId = match[1];

    // 1. Get Spotify Access Token
    const authString = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const { access_token } = await tokenResponse.json();

    // 2. Get Track Metadata
    const trackResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });
    const trackData = await trackResponse.json();

    // 3. Get Audio Features (for BPM)
    const featuresResponse = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: { 'Authorization': `Bearer ${access_token}` },
    });
    const featuresData = await featuresResponse.json();

    return NextResponse.json({
      name: trackData.name,
      artist: trackData.artists[0].name,
      albumArt: trackData.album.images[0]?.url,
      bpm: Math.round(featuresData.tempo),
      id: trackId,
    });

  } catch (error) {
    console.error('Spotify API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch Spotify metadata' }, { status: 500 });
  }
}
