import os
import re

def find_hindi_in_files(directory):
    hindi_pattern = re.compile(r'[\u0900-\u097F]+')
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.html', '.css')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        for line_num, line in enumerate(f, 1):
                            if hindi_pattern.search(line):
                                print(f"{path}:{line_num}: {line.strip()}")
                except Exception:
                    pass

find_hindi_in_files('d:/scalegrad/hackathon/frontend/src')
