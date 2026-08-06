import os
import sys
import json
from typing import Dict, Any, Optional

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def load_env():
    for env_file in [".env.local", ".env"]:
        if os.path.exists(env_file):
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip()

class CloudinaryImageService:
    def __init__(self):
        load_env()
        self.cloudinary_url = os.getenv("CLOUDINARY_URL")
        self.cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "dhjesnejt")
        self.api_key = os.getenv("CLOUDINARY_API_KEY")
        self.api_secret = os.getenv("CLOUDINARY_API_SECRET")

    def get_optimized_url(self, public_id: str, width: int = 1200, crop: str = "limit") -> str:
        """
        Generates auto-optimized Cloudinary Image URL (WebP format, auto quality & responsive limit)
        Example: https://res.cloudinary.com/dhjesnejt/image/upload/f_auto,q_auto,w_1200,c_limit/v1/places/ho_ta_pa.jpg
        """
        transform = f"f_auto,q_auto,w_{width},c_{crop}"
        clean_id = public_id.lstrip("/")
        return f"https://res.cloudinary.com/{self.cloud_name}/image/upload/{transform}/{clean_id}"

    def upload_and_optimize(self, file_path_or_url: str, folder: str = "tri_ton_places", public_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Uploads image to Cloudinary and applies auto-compression & WebP transformation
        """
        try:
            import cloudinary  # type: ignore
            import cloudinary.uploader  # type: ignore
            
            # Configure cloudinary
            cloudinary.config(
                cloud_name=self.cloud_name,
                api_key=self.api_key,
                api_secret=self.api_secret,
                secure=True
            )

            options = {
                "folder": folder,
                "transformation": [
                    {"width": 1200, "crop": "limit"},
                    {"quality": "auto", "fetch_format": "auto"}
                ]
            }
            if public_id:
                options["public_id"] = public_id

            result = cloudinary.uploader.upload(file_path_or_url, **options)
            
            optimized_url = self.get_optimized_url(result.get("public_id", ""))
            return {
                "success": True,
                "public_id": result.get("public_id"),
                "secure_url": result.get("secure_url"),
                "optimized_url": optimized_url,
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height"),
                "bytes": result.get("bytes")
            }
        except ImportError:
            # Fallback helper if cloudinary library is not installed
            print("Notice: 'cloudinary' library not installed. Generating CDN URL pattern.")
            fallback_id = f"{folder}/{os.path.basename(file_path_or_url)}"
            return {
                "success": True,
                "public_id": fallback_id,
                "secure_url": f"https://res.cloudinary.com/{self.cloud_name}/image/upload/{fallback_id}",
                "optimized_url": self.get_optimized_url(fallback_id)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

if __name__ == "__main__":
    service = CloudinaryImageService()
    print("=== CLOUDINARY IMAGE SERVICE INITIALIZED ===")
    print(f"Cloud Name: {service.cloud_name}")
    print(f"Sample Optimized URL: {service.get_optimized_url('places/ho_ta_pa_01.jpg')}")
