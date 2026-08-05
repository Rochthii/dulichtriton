import asyncio
import json
import os
from tourism_crawler.crawler.facebook.facebook_share_scraper import FacebookShareScraper
from tourism_crawler.config.logging import logger

async def main():
    urls = [
        "https://www.facebook.com/share/1JfR7eSkXr/",
        "https://www.facebook.com/share/1HQweR5FCt/"
    ]
    
    logger.info("Starting Facebook Share Crawling Task...")
    scraper = FacebookShareScraper(headless=True)
    results = await scraper.scrape_facebook_urls(urls)
    
    os.makedirs("data", exist_ok=True)
    output_file = "data/facebook_crawled_shares.json"
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        
    print(f"SUCCESS: Crawled {len(results)} Facebook Share links!")
    print(f"Saved to: {output_file}")
    for res in results:
        print(f"-> URL: {res['source_url']} | Title: {res['title']} | Mentioned Places: {res['places_mentioned']}")

if __name__ == "__main__":
    asyncio.run(main())
