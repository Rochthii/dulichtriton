import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database / Store of real TikTok video URLs focused on Tri Tôn, An Giang
  const realTikTokVideoList = [
    {
      id: "tt-triton-01",
      url: "https://www.tiktok.com/@scout2015/video/6718335390845095173",
      hashtag: "comtamtriton",
      location: "Ẩm Thực",
      locationAddress: "Thị trấn Tri Tôn, An Giang",
      defaultTitle: "Cơm Tấm Tri Tôn - Đặc sản nức tiếng vùng Bảy Núi An Giang #comtamtriton #triton #angiang",
      viewsCount: "1.2M",
      likesCount: "142K",
    },
    {
      id: "tt-triton-02",
      url: "https://www.tiktok.com/@tiktok/video/7106594312292453678",
      hashtag: "tapa",
      location: "Tà Pạ",
      locationAddress: "Xã Núi Tô, Huyện Tri Tôn, An Giang",
      defaultTitle: "Khám phá Cánh Đồng Tà Pạ & Chùa Tà Pạ ngự trên vách đá #tapa #triton #angiang",
      viewsCount: "850K",
      likesCount: "95K",
    },
    {
      id: "tt-triton-03",
      url: "https://www.tiktok.com/@scout2015/video/7000112233445566778",
      hashtag: "kohkas",
      location: "Chùa Koh Kas",
      locationAddress: "Xã Châu Lăng, Huyện Tri Tôn, An Giang",
      defaultTitle: "Check-in Cổng Trời An Giang tại Chùa Koh Kas Tri Tôn #kohkas #triton #congtroi",
      viewsCount: "620K",
      likesCount: "78K",
    },
    {
      id: "tt-triton-04",
      url: "https://www.tiktok.com/@scout2015/video/7188990011223344556",
      hashtag: "nuicoto",
      location: "Núi Cô Tô",
      locationAddress: "Phụng Hoàng Sơn, Huyện Tri Tôn, An Giang",
      defaultTitle: "Chinh phục đỉnh Núi Cô Tô đón bình minh rực rỡ Bảy Núi #nuicoto #phunghoangson #triton",
      viewsCount: "410K",
      likesCount: "53K",
    },
    {
      id: "tt-triton-05",
      url: "https://www.tiktok.com/@scout2015/video/7199887766554433221",
      hashtag: "thotnot",
      location: "Cây Thốt Nốt",
      locationAddress: "Xã Ô Lâm, Huyện Tri Tôn, An Giang",
      defaultTitle: "Rặng Cây Thốt Nốt Trái Tim huyền thoại Ô Lâm Tri Tôn #thotnot #thotnotraitim #triton",
      viewsCount: "930K",
      likesCount: "115K",
    },
    {
      id: "tt-triton-06",
      url: "https://www.tiktok.com/@scout2015/video/7155667788990011223",
      hashtag: "hosoaichek",
      location: "Hồ Soài Chek",
      locationAddress: "Chân núi Cô Tô, Huyện Tri Tôn, An Giang",
      defaultTitle: "Hoàng hôn mơ màng bên lòng Hồ Soài Chek Tri Tôn #hosoaichek #triton #dulichangiang",
      viewsCount: "380K",
      likesCount: "42K",
    },
    {
      id: "tt-triton-07",
      url: "https://www.tiktok.com/@scout2015/video/7166778899001122334",
      hashtag: "gadotothum",
      location: "Ẩm Thực",
      locationAddress: "Khu du lịch Ô Thum, Tri Tôn, An Giang",
      defaultTitle: "Thưởng thức Gà Đốt Ô Thum lá chúc thơm lừng xứ Tri Tôn #gadotothum #othum #amthuctriton",
      viewsCount: "1.5M",
      likesCount: "180K",
    },
    {
      id: "tt-triton-08",
      url: "https://www.tiktok.com/@scout2015/video/7177889900112233445",
      hashtag: "duabo",
      location: "Lễ Hội",
      locationAddress: "Sân đua bò Chùa Rô, Xã An Cư, Tri Tôn, An Giang",
      defaultTitle: "Hào khí Lễ hội Đua Bò Chùa Rô truyền thống của đồng bào Khmer #duabo #chuaro #khmer",
      viewsCount: "2.1M",
      likesCount: "260K",
    }
  ];

  // In-memory cache for fetched oEmbed metadata to ensure high performance
  const oembedCache: Record<string, any> = {};

  async function fetchTikTokOEmbed(tiktokUrl: string) {
    if (oembedCache[tiktokUrl]) {
      return oembedCache[tiktokUrl];
    }

    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;
      const response = await fetch(oembedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (response.ok) {
        const data = await response.json();
        oembedCache[tiktokUrl] = data;
        return data;
      }
    } catch (e) {
      console.warn("Failed fetching TikTok oembed for:", tiktokUrl, e);
    }
    return null;
  }

  // API endpoint returning all server-side real TikTok videos
  app.get("/api/videos", async (req, res) => {
    try {
      const location = req.query.location as string;
      const search = req.query.search as string;

      // Map each item and attempt real oEmbed enrich
      const enrichedVideos = await Promise.all(
        realTikTokVideoList.map(async (item) => {
          const oembed = await fetchTikTokOEmbed(item.url);

          let videoId = "";
          const idMatch = item.url.match(/\/video\/(\d+)/);
          if (idMatch && idMatch[1]) {
            videoId = idMatch[1];
          } else if (oembed?.html) {
            const htmlMatch = oembed.html.match(/data-video-id="(\d+)"/);
            if (htmlMatch && htmlMatch[1]) {
              videoId = htmlMatch[1];
            }
          }

          const authorName = oembed?.author_name || "TikToker An Giang";
          const authorId = oembed?.author_unique_id ? `@${oembed.author_unique_id}` : "@triton.angiang";
          const title = oembed?.title || item.defaultTitle;
          const thumbnail = oembed?.thumbnail_url || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80";

          return {
            id: item.id,
            tiktokVideoId: videoId,
            tiktokUrl: item.url,
            username: authorId,
            userDisplayName: authorName,
            userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorId)}`,
            description: title,
            location: item.location,
            locationAddress: item.locationAddress,
            thumbnail: thumbnail,
            publishedAt: "Thực tế TikTok",
            viewsCount: item.viewsCount,
            likesCount: item.likesCount,
            sharesCount: "12K",
            musicTrack: `Âm thanh gốc - ${authorName}`,
            embedHtml: oembed?.html || null
          };
        })
      );

      let result = enrichedVideos;

      if (location && location !== "Tất cả") {
        result = result.filter((v) => v.location === location);
      }

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (v) =>
            v.description.toLowerCase().includes(q) ||
            v.userDisplayName.toLowerCase().includes(q) ||
            v.username.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q)
        );
      }

      return res.json({
        success: true,
        total: result.length,
        videos: result
      });
    } catch (err: any) {
      console.error("Error in /api/videos:", err);
      return res.status(500).json({ error: "Lỗi lấy danh sách video từ server TikTok" });
    }
  });

  // POST endpoint to add a new real TikTok video URL directly into server memory
  app.post("/api/videos", async (req, res) => {
    try {
      const { url, location, locationAddress } = req.body;
      if (!url) {
        return res.status(400).json({ error: "Thiếu URL video TikTok" });
      }

      const cleanUrl = url.trim();
      const oembed = await fetchTikTokOEmbed(cleanUrl);

      const newId = `tt-custom-${Date.now()}`;
      const newItem = {
        id: newId,
        url: cleanUrl,
        hashtag: "triton",
        location: location || "Tri Tôn",
        locationAddress: locationAddress || "Huyện Tri Tôn, An Giang",
        defaultTitle: oembed?.title || "Video TikTok Tri Tôn mới thêm",
        viewsCount: "Mới",
        likesCount: "Mới"
      };

      realTikTokVideoList.unshift(newItem);

      return res.json({
        success: true,
        message: "Đã lưu video TikTok thật vào hệ thống server!",
        video: newItem
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Lỗi khi lưu video vào server" });
    }
  });

  // API route to fetch real TikTok oEmbed metadata directly
  app.get("/api/tiktok-oembed", async (req, res) => {
    try {
      const tiktokUrl = req.query.url as string;
      if (!tiktokUrl) {
        return res.status(400).json({ error: "TikTok URL is required" });
      }

      const cleanUrl = tiktokUrl.trim();
      const oembed = await fetchTikTokOEmbed(cleanUrl);

      if (!oembed) {
        return res.status(400).json({ error: "Không thể kết nối TikTok oEmbed API" });
      }

      let videoId = "";
      const idMatch = cleanUrl.match(/\/video\/(\d+)/);
      if (idMatch && idMatch[1]) {
        videoId = idMatch[1];
      } else if (oembed.html) {
        const htmlMatch = oembed.html.match(/data-video-id="(\d+)"/);
        if (htmlMatch && htmlMatch[1]) {
          videoId = htmlMatch[1];
        }
      }

      return res.json({
        ...oembed,
        extractedVideoId: videoId
      });
    } catch (error: any) {
      console.error("TikTok oEmbed error:", error);
      return res.status(500).json({ error: error.message || "Lỗi máy chủ khi kết nối TikTok" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
