import logging
import sys
from pathlib import Path

log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

try:
    from loguru import logger as loguru_logger
    logger = loguru_logger
except ImportError:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s - %(message)s"))
    
    file_handler = logging.FileHandler(log_dir / "crawler.log", encoding="utf-8")
    file_handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)-8s | %(name)s - %(message)s"))
    
    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler, file_handler]
    )
    logger = logging.getLogger("tourism_crawler")

__all__ = ["logger"]
