#!/usr/bin/env python3
"""
Main Entry Point for Tri Ton TikTok Scraper Engine
Run: python -m tourism_crawler.tiktok_scraper.main
"""

import sys
import os

# Configure stdout for Vietnamese unicode in Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from tourism_crawler.tiktok_scraper.scraper import TriTonTikTokScraper

def main():
    print("=" * 60)
    print("  DU LỊCH TRI TÔN AI — DYNAMIC TIKTOK SCRAPER ENGINE (v1.0.0)")
    print("=" * 60)
    
    scraper = TriTonTikTokScraper()
    total = scraper.run_all()
    print(f"\n🎯 [FINISHED] Successfully processed {total} discovery videos.")

if __name__ == "__main__":
    main()
