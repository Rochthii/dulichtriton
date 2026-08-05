import os
from tourism_crawler.export.json_export import JSONExporter


def test_json_exporter(tmp_path):
    output_file = str(tmp_path / "test_export.json")
    records = [{"id": "PL001", "name": "Hồ Tà Pạ"}]
    
    exporter = JSONExporter()
    exporter.export(records, output_file)
    
    assert os.path.exists(output_file)
