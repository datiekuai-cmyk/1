from pathlib import Path
import json

root = Path(r'd:/1')
with (root / 'backend_characters.json').open('r', encoding='utf-8') as f:
    data = json.load(f)
chars = data['survivors'] + data['hunters']

names = {p.name for p in (root / '角色照片').iterdir() if p.is_file()}
names2 = {p.name for p in (root / 'frontend' / '角色照片').iterdir() if p.is_file()}
names = names | names2

aliases = {
    'cheerleader': '拉拉队员.png',
    'clown_hunter': '“小丑”.png',
    'knight': '“騎士”.png',
    'jack': '“傑克”.png',
    'psychologist': '“心理學家”.png',
    'recorder': '“記錄員”.png',
    'escape_master': '“逃脫大師”.png',
    'pharoh_lady': '“法羅女士”.png',
    'philanthropist': '“慈善家”.png',
    'billiard_player': '“檯球手”.png',
    'apostle': '“使徒”.png',
    'dentist': '“牙醫”.png',
    'doctor_hunter': '“博士”.png',
    'dream_hunter': '“噩夢”.png',
    'fool_gold': '“愚人金”.png',
    'queen_bee': '“女王蜂”.png',
    'lame_sheep': '“跛腳羊”.png',
    'noisy': '“喧囂”.png',
    'little_girl': '“小女孩”.png',
    'weeping_clown': '哭泣小丑.png',
    'fire_investigator': '火災調查員.png',
    'acrobat': '雜技演員.png',
    'entomologist': '昆蟲學者.png',
    'opera_singer': '歌劇演員.png',
    'magic_lantern_operator': '幻燈師.png',
    'meteorologist': '氣象學家.png',
    'airman': '空軍.png',
    'adventurer': '冒險家.png',
    'doctor': '醫生.png',
    'lawyer': '律師.png',
    'gardener': '園丁.png',
    'magician': '魔術師.png',
    'mercenary': '傭兵.png',
    'mechanic': '機械師.png',
    'forward': '前鋒.png',
    'perfumer': '調香師.png',
    'embalmer': '入殮師.png',
    'prospector': '勘探員.png',
    'bartender': '調酒師.png',
    'postman': '郵差.png',
    'painter': '畫家.png',
    'batter': '擊球手.png',
    'novelist': '小說家.png',
    'journalist': '記者.png',
    'aviator': '飛行家.png',
    'puppeteer': '木偶師.png',
    'matador': '鬥牛士.png',
    'mime': '默劇藝人.png',
    'factory_manager': '廠長.png',
    'deer_head': '鹿頭.png',
    'red_butterfly': '紅蝶.png',
    'hastur': '黃衣之主.png',
    'photographer': '攝影師.png',
    'mad_eye': '瘋眼.png',
    'dream_witch': '夢之女巫.png',
    'crybaby': '愛哭鬼.png',
    'red_lady': '紅夫人.png',
    'guard_26': '26號守衛.png',
    'broken_wheel': '破輪.png',
    'fishwoman': '漁女.png',
    'wax_sculptor': '蠟像師.png',
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
    'professor': '教授.png',
    'antique_dealer': '古董商.png',
    'composer': '作曲家.png',
    'archer': '弓箭手.png',
    'violinist': '小提琴家.png',
    'sculptor': '雕刻家.png',
    'evil_reptile': '孽蜥.png',
    'grocery_merchant': '雜貨商.png',
    'spider': '蜘蛛.png',
    'shadow_of_time_and_space': '時空之影.png',
    'shade_umbrella_soul': '宿傘之魂.png',
    'night_watcher': '守夜人.png',
    'hermit': '隱士.png',
    'lucky_person': '幸運兒.png',
    'billiard_player': '“檯球手”.png',
    'apostle': '“使徒”.png',
    'dentist': '“牙醫”.png',
    'doctor_hunter': '“博士”.png',
    'dream_hunter': '“噩夢”.png',
    'fool_gold': '“愚人金”.png',
    'queen_bee': '“女王蜂”.png',
    'lame_sheep': '“跛腳羊”.png',
    'noisy': '“喧囂”.png',
    'little_girl': '“小女孩”.png',
}

mapping = {}
for ch in chars:
    cid = ch['character_id']
    if cid in aliases:
        mapping[cid] = aliases[cid]
        continue
    prof = ch.get('profession', '')
    for cand in [f'{prof}.png', f'{cid}.png', f'{prof}.jpg', f'{cid}.jpg']:
        if cand in names:
            mapping[cid] = cand
            break
    else:
        mapping[cid] = f'{cid}.png'

out = root / 'frontend' / 'js' / 'character-image-map.js'
out.write_text('window.CHARACTER_IMAGE_MAP = {\n', encoding='utf-8')
with out.open('a', encoding='utf-8') as f:
    for cid in sorted(mapping):
        name = mapping[cid].replace('\\', '\\\\').replace("'", "\\'")
        f.write(f"  '{cid}': '{name}',\n")
    f.write('};\n')

print('wrote', len(mapping), 'entries')
