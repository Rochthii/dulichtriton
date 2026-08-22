# -*- coding: utf-8 -*-
"""
Auditing Script: Deep-scan all TSX/TS files for hardcoded Vietnamese strings in UI
"""

import os
import re
import sys

VN_CHARS_REGEX = re.compile(r'[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]')

EXCLUDE_DIRS = [
    os.path.join("frontend", "src", "lib", "i18n"),
    os.path.join("frontend", "src", "data"),
    os.path.join("node_modules"),
    os.path.join(".next"),
    os.path.join("data"),
]

def is_excluded(filepath):
    for d in EXCLUDE_DIRS:
        if d in filepath:
            return True
    return False

def scan_files():
    findings = []
    src_dir = os.path.join("frontend", "src")
    
    for root, _, files in os.walk(src_dir):
        for file in files:
            if not (file.endswith(".tsx") or file.endswith(".ts")):
                continue
                
            filepath = os.path.join(root, file)
            if is_excluded(filepath):
                continue
                
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                
            for line_idx, line in enumerate(lines):
                line_str = line.strip()
                # Skip comments
                if line_str.startswith("//") or line_str.startswith("/*") or line_str.startswith("*"):
                    continue
                
                # Check for Vietnamese characters
                if VN_CHARS_REGEX.search(line_str):
                    # Check if it's not inside a console.log, or comments
                    findings.append({
                        "file": filepath,
                        "line": line_idx + 1,
                        "text": line_str[:120]
                    })
                    
    return findings

def main():
    findings = scan_files()
    print(f"Total hardcoded Vietnamese strings found: {len(findings)}\n")
    
    # Group by file
    grouped = {}
    for f in findings:
        grouped.setdefault(f["file"], []).append(f)
        
    for file, items in sorted(grouped.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"--- {file} : {len(items)} hardcoded occurrences ---")

if __name__ == "__main__":
    main()
