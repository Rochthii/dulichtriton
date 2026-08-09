import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tiktokUrl = searchParams.get('url');

  if (!tiktokUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl.trim())}`;
    const res = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch TikTok oEmbed metadata' }, { status: res.status });
    }

    const data = await res.json();

    // Extract raw video ID from HTML if present
    let videoId = '';
    const idMatch = tiktokUrl.match(/\/video\/(\d+)/);
    if (idMatch && idMatch[1]) {
      videoId = idMatch[1];
    } else if (data.html) {
      const htmlMatch = data.html.match(/data-video-id="(\d+)"/);
      if (htmlMatch && htmlMatch[1]) {
        videoId = htmlMatch[1];
      }
    }

    return NextResponse.json({
      ...data,
      extractedVideoId: videoId,
    });
  } catch (error: unknown) {
    console.error('[TikTok oEmbed Error]:', error);
    return NextResponse.json({ error: 'Internal oEmbed Error' }, { status: 500 });
  }
}
