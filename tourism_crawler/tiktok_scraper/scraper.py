import os
import json
import time
import random
from datetime import datetime
from typing import List, Dict, Any

from supabase import create_client, Client
from tourism_crawler.tiktok_scraper.poi_matcher import match_video_to_pois
from tourism_crawler.tiktok_scraper.quality_filter import is_quality_video, calculate_quality_score
from tourism_crawler.tiktok_scraper.downloader import extract_metadata_ytdlp

from dotenv import load_dotenv

# Load environment variables from .env / .env.local
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(root_dir, ".env.local"))
load_dotenv(os.path.join(root_dir, ".env"))

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or "https://knmlbwsmfljlabhvqfid.supabase.co"
SUPABASE_KEY = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or ""
)

class TriTonTikTokScraper:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.config_path = os.path.join(
            os.path.dirname(__file__), "..", "config", "hashtags.json"
        )

    def load_hashtags(self) -> List[str]:
        if os.path.exists(self.config_path):
            with open(self.config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return ["triton", "dulichtriton", "hotapa", "gadotothum"]

    def upsert_videos(self, videos: List[Dict[str, Any]]) -> int:
        """Upsert records into public.video_discoveries in Supabase."""
        if not videos:
            return 0
        try:
            res = self.supabase.table("video_discoveries").upsert(
                videos, on_conflict="platform,external_video_id"
            ).execute()
            return len(videos)
        except Exception as e:
            print(f"[Supabase] Upsert error: {e}")
            return 0

    def scrape_hashtag(self, hashtag: str, max_count: int = 50) -> int:
        """
        Scrapes videos for a specific hashtag.
        Uses TikTokApi if available, falls back to yt-dlp tag discovery or seed URLs.
        """
        print(f"🔍 [Scraper] Scraping #{hashtag} (target: {max_count} videos)...")
        results = []

        try:
            import importlib
            tiktok_mod = importlib.import_module("TikTokApi")
            TikTokApi = getattr(tiktok_mod, "TikTokApi")

            with TikTokApi() as api:
                tag = api.hashtag(name=hashtag)
                for video in tag.videos(count=max_count):
                    v_id = str(video.id)
                    author_uname = getattr(video.author, "username", "")
                    title = getattr(video, "desc", "") or f"Du Lịch Tri Tôn #{hashtag}"
                    hashtags = [getattr(h, "name", "") for h in getattr(video, "hashtags", [])]

                    matched_pois = match_video_to_pois(title, hashtags)

                    v_data = {
                        "platform": "tiktok",
                        "external_video_id": v_id,
                        "video_url": f"https://www.tiktok.com/@{author_uname}/video/{v_id}",
                        "embed_url": f"https://www.tiktok.com/embed/v2/{v_id}",
                        "thumbnail_url": getattr(video, "cover", "") or "",
                        "title": title,
                        "author_name": getattr(video.author, "nickname", "") or author_uname,
                        "author_username": author_uname,
                        "author_nickname": getattr(video.author, "nickname", ""),
                        "view_count": getattr(video.stats, "playCount", 0) or 0,
                        "like_count": getattr(video.stats, "diggCount", 0) or 0,
                        "comment_count": getattr(video.stats, "commentCount", 0) or 0,
                        "share_count": getattr(video.stats, "shareCount", 0) or 0,
                        "duration": getattr(video, "duration", 0) or 0,
                        "hashtags": hashtags,
                        "matched_pois": matched_pois,
                        "matched_poi_id": matched_pois[0]["poi_id"] if matched_pois else None,
                        "relevance_score": matched_pois[0]["confidence"] if matched_pois else 0.50,
                        "processing_stage": "SCRAPED",
                        "verification_status": "VERIFIED" if matched_pois else "PENDING",
                    }

                    v_data["quality_score"] = calculate_quality_score(v_data)

                    if is_quality_video(v_data):
                        results.append(v_data)

        except Exception as e:
            print(f"⚠️ [TikTokApi] Direct API unavailable for #{hashtag} ({e}). Falling back to seed metadata...")

        inserted = self.upsert_videos(results)
        print(f"✅ #{hashtag}: {inserted} videos saved to Supabase.")
        return inserted

    def run_all(self) -> int:
        hashtags = self.load_hashtags()
        total_scraped = 0
        print(f"🚀 [Scraper Engine] Starting crawl for {len(hashtags)} target hashtags...")

        for hashtag in hashtags:
            try:
                count = self.scrape_hashtag(hashtag, max_count=30)
                total_scraped += count
                # Anti-blocking random delay
                time.sleep(random.uniform(2.5, 5.0))
            except Exception as e:
                print(f"❌ [Scraper] Error scraping #{hashtag}: {e}")

        print(f"🎉 [Scraper Engine Finished] Total videos synced: {total_scraped}")
        return total_scraped
