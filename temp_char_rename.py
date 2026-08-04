import json
import os

with open('backend_characters.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chars = []
if isinstance(data, dict):
    for v in data.values():
        if isinstance(v, list):
            chars.extend(v)
elif isinstance(data, list):
    chars = data

name_map = {c['character_id']: c['profession'] for c in chars if c.get('character_id') and c.get('profession')}

folder = os.path.join('frontend', '角色照片')
files = sorted(os.listdir(folder))
existing = set(files)
desired = {prof + ext for prof in name_map.values() for ext in ['.png', '.jpg', '.jpeg']}

print('Total chars:', len(name_map))

missing = [cid for cid, prof in sorted(name_map.items()) if not any((prof + ext) in existing for ext in ['.png', '.jpg', '.jpeg'])]
print('Missing files for characters:', len(missing))
print(missing[:30])

print('Existing not desired count:', len([f for f in files if f not in desired]))
print('Existing files sample not desired:')
for f in files:
    if f not in desired:
        print(' ', f)

print('\nSample character -> target file name:')
for cid, prof in sorted(name_map.items())[:40]:
    print(cid, '->', prof + '.png')
