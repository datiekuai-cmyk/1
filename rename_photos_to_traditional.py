import json
import os
import re
from opencc import OpenCC

cc = OpenCC('s2t')
with open('backend_characters.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = []
if isinstance(data, dict):
    for v in data.values():
        if isinstance(v, list):
            chars.extend(v)
elif isinstance(data, list):
    chars = data

entries = []
seen = set()
for c in chars:
    prof = c.get('profession')
    if not prof:
        continue
    if prof in seen:
        continue
    seen.add(prof)
    entries.append((c.get('character_id'), prof))

folders = [os.path.join('角色照片'), os.path.join('frontend', '角色照片')]
for folder in folders:
    if not os.path.exists(folder):
        continue
    files = sorted(os.listdir(folder))
    for cid, prof in entries:
        target_ext = None
        source_name = None
        for f in files:
            if not os.path.isfile(os.path.join(folder, f)):
                continue
            name, ext = os.path.splitext(f)
            if ext.lower() not in {'.png', '.jpg', '.jpeg'}:
                continue
            if f == f'{prof}{ext}':
                source_name = None
                target_ext = ext
                break
            normalized_name = re.sub(r'[“”"\s]', '', name)
            normalized_prof = re.sub(r'[“”"\s]', '', prof)
            if normalized_name == normalized_prof or name == prof or cc.convert(name) == prof or name == cc.convert(prof):
                source_name = f
                target_ext = ext
                break
        if not target_ext:
            continue
        target_name = f'{prof}{target_ext}'
        src_path = os.path.join(folder, source_name) if source_name else None
        dst_path = os.path.join(folder, target_name)
        if source_name is None:
            continue
        if os.path.abspath(src_path) == os.path.abspath(dst_path):
            continue
        if os.path.exists(dst_path):
            os.remove(src_path)
            print(f'{folder}: removed duplicate {src_path}')
        else:
            os.rename(src_path, dst_path)
            print(f'{folder}: {source_name} -> {target_name}')
print('Done')
