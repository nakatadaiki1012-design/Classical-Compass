"""
地図の背景に重ねる「川・湖・地名」を作り、src/data/europeFeatures.ts に書き出す。
元データは Natural Earth（パブリックドメイン）の GeoJSON。投影は src/data/mapProjection.ts と同じ。

使い方:  python3 scripts/build-map-features.py <Natural Earth の geojson を置いたフォルダ>
必要なファイル: ne_50m_rivers_lake_centerlines / ne_10m_rivers_lake_centerlines / ne_50m_lakes （それぞれ .geojson）
"""
import json, math, sys

SRC = sys.argv[1].rstrip('/') + '/'
SCALE, TX, TY = 1000.0717878647097, 209.45454545454544, 1370.6467849023627
MINLON, MAXLON, MINLAT, MAXLAT = -12, 43, 36, 61.5
PAD = 3  # 範囲の少し外まで描く


def proj(lon, lat):
    lat = max(min(lat, 80), -80)
    return (SCALE * math.radians(lon) + TX, TY - SCALE * math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


def load(name):
    return json.load(open(SRC + name + '.geojson'))['features']


def lines(geom):
    if not geom:
        return []
    t, c = geom['type'], geom['coordinates']
    if t == 'LineString':
        return [c]
    if t == 'MultiLineString':
        return c
    if t == 'Polygon':
        return [c[0]]
    if t == 'MultiPolygon':
        return [p[0] for p in c]
    return []


def inside(p):
    return MINLON - PAD <= p[0] <= MAXLON + PAD and MINLAT - PAD <= p[1] <= MAXLAT + PAD


def clip(line):
    """範囲の外に出た部分を切り落とす（つながった部分ごとに分ける）"""
    out, cur = [], []
    for p in line:
        if inside(p):
            cur.append(p)
        else:
            if len(cur) > 1:
                out.append(cur)
            cur = []
    if len(cur) > 1:
        out.append(cur)
    return out


def simplify(pts, eps):
    """Douglas-Peucker：見た目の変わらない範囲で点を減らす"""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        best, bi = 0, -1
        for i in range(a + 1, b):
            # 始点と終点が同じ（輪になっている）ときは、始点からの距離で測る
            d = abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / L if L > 1e-6 else math.hypot(pts[i][0] - x1, pts[i][1] - y1)
            if d > best:
                best, bi = d, i
        if best > eps:
            keep[bi] = True
            stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def fmt(v):
    s = f'{v:.1f}'
    return s[:-2] if s.endswith('.0') else s


def path(line, eps, close=False):
    pts = simplify([proj(*p[:2]) for p in line], eps)
    if len(pts) < 2:
        return ''
    return 'M' + 'L'.join(f'{fmt(x)} {fmt(y)}' for x, y in pts) + ('Z' if close else '')


# ---------- 川 ----------
# 太い川（rank 1）と、音楽史でよく出てくる細めの川（rank 2）
RIVERS_50M = {
    'Danube': 1, 'Donau': 1, 'Rhine': 1, 'Rhein': 1, 'Rhin': 1, 'Waal': 1, 'Volga': 1, 'Dnipro': 1, 'Dnepre': 1,
    'Elbe': 1, 'Seine': 1, 'Loire': 1, 'Rhône': 1, 'Po': 1, 'Vistula': 1, 'Oder': 1, 'Thames': 1, 'Tajo': 1, 'Tejo': 1,
    'Ebro': 1, 'Don': 2, 'Neva': 2, 'Daugava': 2, 'Dniester': 2, 'Drava': 2, 'Tisza': 2, 'Tisa': 2, 'Duero': 2,
    'Garonne': 2, 'Glomma': 2
}
RIVERS_10M = {'Vltava': 2, 'Main': 2, 'Tevere': 2, 'Inn': 2, 'Mosel': 2, 'Sava': 2, 'Weser': 2, 'Marne': 2}
rivers = {1: [], 2: []}
for f in load('ne_50m_rivers_lake_centerlines'):
    rank = RIVERS_50M.get(f['properties'].get('name'))
    if rank:
        for ln in lines(f['geometry']):
            for part in clip(ln):
                rivers[rank].append(path(part, 0.45))
for f in load('ne_10m_rivers_lake_centerlines'):
    rank = RIVERS_10M.get(f['properties'].get('name'))
    if rank and f['properties'].get('featurecla') == 'River':
        for ln in lines(f['geometry']):
            for part in clip(ln):
                rivers[rank].append(path(part, 0.45))

# ---------- 湖 ----------
LAKES = {'Lake Ladoga', 'Lake Onega', 'Vänern', 'Vättern', 'Mälaren', 'Lake Peipus', 'Lake Pskov', 'Lake Geneva',
         'Bodensee', 'Lake Balaton', 'IJsselmeer', "Lake Il'Men'", 'Rybinsk Reservoir', 'Lake Saimaa', 'Päijänne',
         'Lough Neagh', 'Kremenchuk Reservoir', 'Lake Beloye'}
lakes = []
for f in load('ne_50m_lakes'):
    if f['properties'].get('name') in LAKES:
        for ln in lines(f['geometry']):
            if all(inside(p) for p in ln):
                lakes.append(path(ln, 0.3, True))

# ---------- 地名（kind: c=国, s=海, m=山脈, r=川 / lv: 1=いつも, 2=少し拡大, 3=さらに拡大） ----------
LABELS = [
    # 国（今の国境の名前）
    ('c', 1, 'フランス', 2.4, 46.7), ('c', 1, 'ドイツ', 9.3, 52.45), ('c', 1, 'イタリア', 11.4, 43.55),
    ('c', 1, 'スペイン', -3.7, 41.6), ('c', 1, 'イギリス', -1.6, 53.3), ('c', 1, 'ポーランド', 18.6, 53.2),
    ('c', 1, 'ロシア', 37.5, 53.6), ('c', 1, 'ウクライナ', 31.5, 49.2), ('c', 1, 'スウェーデン', 15.2, 59.2),
    ('c', 1, 'ノルウェー', 8.8, 60.6), ('c', 1, 'フィンランド', 26.0, 61.3), ('c', 1, 'オーストリア', 14.3, 47.3),
    ('c', 1, 'ハンガリー', 19.6, 46.75), ('c', 1, 'チェコ', 15.7, 49.45), ('c', 1, 'ルーマニア', 24.9, 45.9),
    ('c', 1, 'トルコ', 32.5, 39.3), ('c', 1, 'ギリシャ', 22.0, 39.5),
    ('c', 2, 'ポルトガル', -8.1, 39.7), ('c', 2, 'アイルランド', -8.0, 53.2), ('c', 2, 'オランダ', 5.7, 52.4),
    ('c', 2, 'ベルギー', 4.6, 50.6), ('c', 2, 'スイス', 8.2, 46.8), ('c', 2, 'デンマーク', 9.2, 56.1),
    ('c', 2, 'ベラルーシ', 28.0, 53.5), ('c', 2, 'リトアニア', 23.9, 55.3), ('c', 2, 'ラトビア', 25.6, 56.9),
    ('c', 2, 'エストニア', 25.8, 58.7), ('c', 2, 'スロバキア', 19.5, 48.7), ('c', 2, 'クロアチア', 16.4, 45.5),
    ('c', 2, 'セルビア', 20.8, 44.0), ('c', 2, 'ブルガリア', 25.2, 42.7), ('c', 2, 'ボスニア', 17.8, 44.2),
    ('c', 3, 'スロベニア', 14.8, 46.1), ('c', 3, 'モルドバ', 28.5, 47.2), ('c', 3, 'アルバニア', 20.0, 41.1),
    ('c', 3, '北マケドニア', 21.7, 41.6), ('c', 3, 'モンテネグロ', 19.3, 42.8), ('c', 3, 'ルクセンブルク', 6.1, 49.8),
    # 海
    ('s', 1, '大西洋', -9.3, 47.3), ('s', 1, '北海', 3.0, 56.3), ('s', 1, 'バルト海', 18.6, 56.3),
    ('s', 1, '地中海', 5.5, 38.4), ('s', 1, '黒海', 34.0, 43.3), ('s', 2, 'アドリア海', 15.3, 43.2),
    ('s', 2, 'ビスケー湾', -4.6, 45.3), ('s', 2, 'エーゲ海', 25.0, 38.6), ('s', 2, 'ティレニア海', 12.2, 39.9),
    ('s', 3, 'イギリス海峡', -1.6, 50.1),
    # 山脈
    ('m', 3, 'アルプス山脈', 9.6, 46.35), ('m', 3, 'ピレネー山脈', 0.6, 42.65), ('m', 3, 'カルパティア山脈', 24.6, 47.6),
    ('m', 3, 'アペニン山脈', 13.4, 42.4), ('m', 3, 'ディナル・アルプス', 18.2, 43.6), ('m', 3, 'バルカン山脈', 25.0, 42.75),
    ('m', 3, 'スカンディナヴィア山脈', 9.0, 61.6),
    # 川
    ('r', 2, 'ドナウ川', 23.3, 43.85), ('r', 2, 'ライン川', 8.25, 48.9), ('r', 2, 'セーヌ川', 1.2, 49.3),
    ('r', 2, 'エルベ川', 11.75, 52.9), ('r', 2, 'ヴォルガ川', 36.0, 57.2),
    ('r', 3, 'ドナウ川', 15.2, 48.25), ('r', 3, 'ロワール川', 0.5, 47.4), ('r', 3, 'ローヌ川', 4.8, 44.5),
    ('r', 3, 'ポー川', 10.0, 45.05), ('r', 3, 'テムズ川', -1.0, 51.6), ('r', 3, 'ヴィスワ川', 19.0, 53.3),
    ('r', 3, 'オーデル川', 14.6, 52.6), ('r', 3, 'ドニエプル川', 33.0, 49.1), ('r', 3, 'テージョ川', -5.0, 39.8),
    ('r', 3, 'エブロ川', -1.0, 41.8), ('r', 3, 'ヴルタヴァ（モルダウ）川', 14.4, 49.35), ('r', 3, 'マイン川', 9.9, 49.85),
    ('r', 3, 'ネヴァ川', 30.9, 59.85), ('r', 3, 'ティサ川', 20.3, 46.6), ('r', 3, 'モーゼル川', 6.7, 49.75),
    ('r', 3, 'テヴェレ川', 12.4, 42.3), ('r', 3, 'イン川', 12.2, 47.75)
]
labels = []
for kind, lv, ja, lon, lat in LABELS:
    x, y = proj(lon, lat)
    labels.append(f'{{k:"{kind}",lv:{lv},t:"{ja}",x:{fmt(x)},y:{fmt(y)}}}')

out = f'''/**
 * 地図の背景に重ねる「川・湖・地名」。scripts/build-map-features.py が作るので、手で書き換えない。
 * 元データは Natural Earth（パブリックドメイン）。投影は mapProjection.ts と同じ（960×696）。
 */
export interface MapLabel {{
  /** c=国, s=海, m=山脈, r=川 */
  k: 'c' | 's' | 'm' | 'r';
  /** 1=いつも出す, 2=少し拡大したら, 3=さらに拡大したら */
  lv: 1 | 2 | 3;
  t: string;
  x: number;
  y: number;
}}

/** 大きな川（1本の path にまとめてある） */
export const RIVERS_MAJOR = {json.dumps(''.join(rivers[1]))};
/** 少し細い川（拡大したら出す） */
export const RIVERS_MINOR = {json.dumps(''.join(rivers[2]))};
/** 湖 */
export const LAKES = {json.dumps(''.join(lakes))};

export const MAP_LABELS: MapLabel[] = [
  {(',' + chr(10) + '  ').join(labels)}
];
'''
open('src/data/europeFeatures.ts', 'w').write(out)
print('rivers', len(''.join(rivers[1])), len(''.join(rivers[2])), 'lakes', len(''.join(lakes)), 'total', len(out))
