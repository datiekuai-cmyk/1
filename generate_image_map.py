import os, json, re
from pathlib import Path

root = Path(r'd:\1')
chars_path = root / 'data' / 'characters.full.json'
photos_dir = root / '角色照片'
with chars_path.open('r', encoding='utf-8') as f:
    chars = json.load(f)
files = {p.name for p in photos_dir.iterdir() if p.is_file()}

known = {
    'doctor': '醫生.png',
    'lawyer': '律師.png',
    'philanthropist': '慈善家.png',
    'gardener': '園丁.png',
    'magician': '魔術師.png',
    'adventurer': '冒險家.png',
    'mercenary': '傭兵.png',
    'airman': '空軍.png',
    'mechanic': '機械師.png',
    'forward': '前鋒.png',
    'perfumer': '調香師.png',
    'embalmer': '入殮師.png',
    'prospector': '勘探員.png',
    'curse_user': '咒術師.png',
    'acrobat': '雜技演員.png',
    'bartender': '調酒師.png',
    'postman': '郵差.png',
    'entomologist': '昆蟲學者.png',
    'painter': '畫家.png',
    'batter': '擊球手.png',
    'psychologist': '心理學家.png',
    'novelist': '小說家.png',
    'journalist': '記者.png',
    'aviator': '飛行家.png',
    'cheerleader': '啦啦隊員.png',
    'puppeteer': '木偶師.png',
    'fire_investigator': '火災調查員.png',
    'pharoh_lady': '法羅女士.png',
    'knight': '騎士.png',
    'meteorologist': '氣象學家.png',
    'escape_master': '逃脫大師.png',
    'magic_lantern_operator': '幻燈師.png',
    'matador': '鬥牛士.png',
    'mime': '默劇藝人.png',
    'factory_manager': '廠長.png',
    'clown_hunter': '小丑.png',
    'deer_head': '鹿頭.png',
    'jack': '傑克.png',
    'red_butterfly': '紅蝶.png',
    'hastur': '黃衣之主.png',
    'shade_umbrella_soul': '宿伞之魂.png',
    'photographer': '攝影師.png',
    'mad_eye': '瘋眼.png',
    'dream_witch': '夢之女巫.png',
    'crybaby': '愛哭鬼.png',
    'red_lady': '紅夫人.png',
    'guard_26': '26號守衛.png',
    'broken_wheel': '破輪.png',
    'fishwoman': '漁女.png',
    'wax_sculptor': '蠟像師.png',
    'lucky_person': '幸运儿.png',
    'blind_girl': '盲女.png',
    'priestess': '祭司.png',
    'cowboy': '牛仔.png',
    'dancer': '舞女.png',
    'prophet': '先知.png',
    'wildling': '野人.png',
    'first_mate': '大副.png',
    'tomb_keeper': '守墓人.png',
    'prisoner': '囚徒.png',
    'toy_merchant': '玩具商.png',
    'patient': '病患.png',
    'little_girl': '小女孩.png',
    'weeping_clown': '哭泣小丑.png',
    'professor': '教授.png',
    'antique_dealer': '古董商.png',
    'composer': '作曲家.png',
    'archer': '弓箭手.png',
    'apostle': '使徒.png',
    'violinist': '小提琴家.png',
    'sculptor': '雕刻家.png',
    'doctor_hunter': '牙医.png',
    'dream_hunter': '噩梦.png',
    'recorder': '记录员.png',
    'hermit': '隐士.png',
    'night_watcher': '守夜人.png',
    'opera_singer': '歌剧演员.png',
    'fool_gold': '愚人金.png',
    'shadow_of_time_and_space': '时空之影.png',
    'lame_sheep': '跛脚羊.png',
    'noisy': '喧嚣.png',
    'grocery_merchant': '杂货商.png',
    'billiard_player': '台球手.png',
    'queen_bee': '女王蜂.png',
    'dentist': '牙医.png',
    'spider': '蜘蛛.png',
    'evil_reptile': '孽蜥.png',
    'fool_gold': '愚人金.png',
}

punctuation = '“”"\'`\\/'

def sanitize(value):
    return ''.join(ch for ch in str(value) if ch not in punctuation).strip()

mapping = {}
for char in chars:
    cid = char['character_id']
    if cid in known and known[cid] in files:
        mapping[cid] = known[cid]
        continue

    candidates = []
    for key in ['profession', 'manor_name', 'alias', 'real_name']:
        val = char.get(key)
        if val:
            s = sanitize(val)
            if s:
                candidates.extend([s + '.png', s + '.jpg'])
                candidates.extend([s.replace(' ', '') + '.png', s.replace(' ', '') + '.jpg'])
    candidates.extend([cid + '.png', cid + '.jpg'])
    for cand in candidates:
        if cand in files:
            mapping[cid] = cand
            break
    if cid not in mapping:
        # fallback: partial match by profession or manor name
        prof = sanitize(char.get('profession') or '').lower()
        for name in sorted(files):
            if prof and prof in name.lower():
                mapping[cid] = name
                break
        if cid not in mapping:
            manor = sanitize(char.get('manor_name') or '').lower()
            for name in sorted(files):
                if manor and manor in name.lower():
                    mapping[cid] = name
                    break

out_path = root / 'frontend' / 'js' / 'character-image-map.js'
out_path.write_text('window.CHARACTER_IMAGE_MAP = {\n' + ',\n'.join([f"  '{cid}': '{mapping[cid]}'" for cid in sorted(mapping)]) + '\n};\n', encoding='utf-8')
print(f'wrote {len(mapping)} mappings to {out_path}')
