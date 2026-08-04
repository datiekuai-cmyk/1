import json
import os
import difflib
import re

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

desired = {prof + ext for prof in name_map.values() for ext in ['.png', '.jpg', '.jpeg']}
not_desired = [f for f in files if f not in desired]
print('not desired', len(not_desired))
for f in not_desired:
    key = re.sub(r'[“”"\.\s]', '', f)
    choices = [(d, difflib.SequenceMatcher(None, key, re.sub(r'[“”"\.\s]', '', d)).ratio()) for d in desired]
    choices.sort(key=lambda x: x[1], reverse=True)
    print(f, '=>', choices[:5])
