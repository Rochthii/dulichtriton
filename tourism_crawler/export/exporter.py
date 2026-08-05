from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseExporter(ABC):
    """Abstract Base Class for Exporters."""

    @abstractmethod
    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        pass
