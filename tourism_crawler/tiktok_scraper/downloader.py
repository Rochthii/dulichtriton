import json
import subprocess
from typing import Dict, Any, Optional

def extract_metadata_ytdlp(video_url: str) -> Optional[Dict[str, Any]]:
    """
    Sử dụng yt-dlp CLI làm backup extractor khi TikTok API bị rate-limit.
    Trả về dict metadata chuẩn hoặc None nếu lỗi.
    """
    try:
        cmd = [
            "yt-dlp",
            "--dump-json",
            "--no-warnings",
            "--skip-download",
            video_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        if result.returncode == 0 and result.stdout:
            data = json.loads(result.stdout)
            return {
                "external_video_id": data.get("id") or "",
                "title": data.get("title") or data.get("description") or "",
                "author_username": data.get("uploader_id") or data.get("uploader") or "",
                "author_nickname": data.get("uploader") or "",
                "view_count": data.get("view_count") or 0,
                "like_count": data.get("like_count") or 0,
                "comment_count": data.get("comment_count") or 0,
                "thumbnail_url": data.get("thumbnail") or "",
                "duration": data.get("duration") or 0,
                "video_url": video_url,
            }
    except Exception as e:
        print(f"[yt-dlp] Error extracting {video_url}: {e}")
    return None
