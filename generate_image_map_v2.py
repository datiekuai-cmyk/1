import json
import os
import re
from pathlib import Path
from difflib import SequenceMatcher
from opencc import OpenCC

root = Path(r'd:\1')
chars_path = root / 'data' / 'characters.full.json'
photos_dir = root / '角色照片'
with chars_path.open('r', encoding='utf-8') as f:
    chars = json.load(f)
files = [p.name for p in photos_dir.iterdir() if p.is_file()]

converter = OpenCC('t2s')
punctuation = '“”‘’"`\\/，。？！：；（）()[]【】『』「」'


def normalize(text: str) -> str:
    if not text:
        return ''
    s = ''.join(ch for ch in str(text) if ch not in punctuation)
    s = re.sub(r'\s+', '', s)
    return s.strip()


def simplify(text: str) -> str:
    if not text:
        return ''
    return converter.convert(text)

normalized_files = []
for name in files:
    base = os.path.splitext(name)[0]
    norm = normalize(base)
    simp = simplify(norm)
    normalized_files.append({
        'name': name,
        'base': base,
        'norm': norm,
        'simp': simp,
        'ext': os.path.splitext(name)[1].lower()
    })

mapping = {}
unmapped = []

for char in chars:
    cid = char['character_id']
    fields = [char.get(k) for k in ['profession', 'manor_name', 'alias', 'real_name'] if char.get(k)]
    candidates = set()
    for val in fields:
        raw = normalize(val)
        if raw:
            candidates.add(raw)
            candidates.add(simplify(raw))
    candidates.add(cid)

    found = None
    for candidate in sorted(candidates, key=len, reverse=True):
        for ext in ['.png', '.jpg']:
            name = f'{candidate}{ext}'
            if name in files:
                found = name
                break
        if found:
            break

    if not found:
        cand_norms = [normalize(c) for c in candidates]
        cand_sims = [simplify(c) for c in cand_norms]
        for file_info in normalized_files:
            if any(c == file_info['norm'] or c == file_info['simp'] for c in cand_norms + cand_sims):
                found = file_info['name']
                break

    if not found:
        for file_info in normalized_files:
            if any(c in file_info['norm'] or c in file_info['simp'] for c in cand_norms + cand_sims):
                found = file_info['name']
                break

    if not found:
        # 特殊繁簡/變體對應
        special_equivalents = {
            '啦啦隊員': '拉拉隊員',
            '啦啦队员': '拉拉队员',
        }
        for cand in cand_norms + cand_sims:
            if cand in special_equivalents:
                alt = special_equivalents[cand]
                for file_info in normalized_files:
                    if alt == file_info['norm'] or alt == file_info['simp']:
                        found = file_info['name']
                        break
            if found:
                break

    if not found:
        best = None
        best_ratio = 0.0
        for file_info in normalized_files:
            for cand in cand_norms + cand_sims + [cid]:
                ratio = SequenceMatcher(None, cand, file_info['norm']).ratio()
                if ratio > best_ratio and ratio >= 0.6:
                    best_ratio = ratio
                    best = file_info['name']
        if best:
            found = best

    if found:
        mapping[cid] = found
    else:
        unmapped.append((cid, fields))

out_path = root / 'frontend' / 'js' / 'character-image-map.js'
with out_path.open('w', encoding='utf-8') as f:
    f.write('window.CHARACTER_IMAGE_MAP = {\n')
    for cid in sorted(mapping):
        f.write(f"  '{cid}': '{mapping[cid]}',\n")
    f.write('};\n')

print(f'wrote {len(mapping)} mappings to {out_path}')
print('unmapped:', len(unmapped))
for cid, fields in unmapped:
    print(cid, fields)
