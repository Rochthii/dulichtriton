import { NextRequest, NextResponse } from 'next/server';

function inferLocationCategory(title: string): string {
  if (!title) return 'Tri Tôn, An Giang';
  const t = title.toLowerCase();
  if (t.includes('tà pạ') || t.includes('tuyệt tình cốc') || t.includes('núi tô')) return 'Tà Pạ';
  if (t.includes('gà đốt') || t.includes('ô thum') || t.includes('kiều tiên') || t.includes('cháo bò') || t.includes('bún nước lèo') || t.includes('đu đủ đâm') || t.includes('bánh bò')) return 'Ẩm Thực';
  if (t.includes('chùa rô') || t.includes('đua bò') || t.includes('lễ hội')) return 'Lễ Hội';
  if (t.includes('koh kas') || t.includes('cổng trời')) return 'Chùa Koh Kas';
  if (t.includes('núi cô tô') || t.includes('phụng hoàng sơn')) return 'Núi Cô Tô';
  if (t.includes('thốt nốt') || t.includes('ô lâm')) return 'Cây Thốt Nốt';
  if (t.includes('soài so') || t.includes('soài chek')) return 'Tà Pạ';
  if (t.includes('ba chúc') || t.includes('tức dụp')) return 'Văn Hóa';
  return 'Tri Tôn, An Giang';
}

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
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Không thể lấy dữ liệu oEmbed từ TikTok. Kiểm tra lại đường dẫn URL!' }, { status: res.status });
    }

    const data = await res.json();

    // Extract raw video ID
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

    const inferredLocation = inferLocationCategory(data.title || '');

    return NextResponse.json({
      ...data,
      extractedVideoId: videoId,
      inferredLocation,
    });
  } catch (error: unknown) {
    console.error('[TikTok oEmbed Error]:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống khi bóc tách oEmbed TikTok' }, { status: 500 });
  }
}
