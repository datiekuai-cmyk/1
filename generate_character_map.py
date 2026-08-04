import json
import pathlib

root = pathlib.Path('d:/1')
with open(root / 'backend_characters.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

characters = data.get('survivors', []) + data.get('hunters', [])
photo_names = set()
for folder in [root / '角色照片', root / 'frontend' / '角色照片']:
    if folder.exists():
        for p in folder.iterdir():
            if p.is_file():
                photo_names.add(p.name)

pairs = []
for ch in characters:
    cid = ch['character_id']
    profession = ch.get('profession', '')
    if not profession:
        continue

    candidates = [f'{profession}.png', f'{cid}.png']
    found = None
    for candidate in candidates:
        if candidate in photo_names:
            found = candidate
            break
    if not found:
        # fallback to whatever exists for this profession in a simplified form
        for name in [profession, profession.replace('隊', '队'), profession.replace('員', '员'), profession.replace('學', '学'), profession.replace('畫', '画')]:
            candidate = f'{name}.png'
            if candidate in photo_names:
                found = candidate
                break
    if not found:
        found = f'{cid}.png'
    pairs.append((cid, found))

out_path = root / 'frontend' / 'js' / 'character-image-map.js'
out_path.write_text("window.CHARACTER_IMAGE_MAP = {\n", encoding='utf-8')
with out_path.open('a', encoding='utf-8') as fh:
    for cid, filename in pairs:
        escaped = filename.replace('\\', '\\\\').replace("'", "\\'")
        fh.write(f"  '{cid}': '{escaped}',\n")
    fh.write("};\n")

print(f'wrote {len(pairs)} entries to {out_path}')
