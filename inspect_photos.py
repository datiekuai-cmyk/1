import pathlib
root = pathlib.Path('d:/1')
for folder_name in ['角色照片', 'frontend/角色照片']:
    folder = root / folder_name
    print(folder_name)
    for name in sorted(p.name for p in folder.iterdir() if p.is_file()):
        if '啦' in name or '拉' in name or '隊' in name or '队' in name or '員' in name or '员' in name or '小丑' in name or '騎士' in name or '傑克' in name or '心理' in name:
            print(repr(name))
    print()
