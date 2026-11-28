"""
「当時の国境」のデータを作る。
元データ: historical-basemaps（Andre Ourednik ほか、GPL-3.0）https://github.com/aourednik/historical-basemaps
  年ごとの世界の国境（world_1783.geojson など）から、ヨーロッパの範囲を切り出し、
  国と国の境目の線（海岸線は除く）と、国名の位置を、この地図（mapProjection.ts と同じ投影）に合わせて書き出す。

出力:
  public/borders/<年>.json   … { y: 年, d: 境目の線(SVG path), l: [{t:国名, x, y, lv}] }
  src/data/historicalBorderYears.ts … データのある年の一覧

使い方:  pip install shapely
         python3 scripts/build-historical-borders.py <historical-basemaps の geojson フォルダ>
国名の日本語訳は scripts/historicalNamesJa.json（ないものは名前を出さない）。
"""
import json, math, os, sys
from shapely.geometry import shape, box, Polygon, MultiPolygon, LineString, MultiLineString
from shapely.ops import unary_union, polylabel, linemerge
from shapely.validation import make_valid
import shapely
import numpy as np

SRC = sys.argv[1].rstrip('/') + '/'
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
NAMES = json.load(open(os.path.join(HERE, 'historicalNamesJa.json')))
SCALE, TX, TY = 1000.0717878647097, 209.45454545454544, 1370.6467849023627
CLIP = box(-16, 33, 47, 65)  # 地図（経度 -12〜43、緯度 36〜61.5）より少し広く
YEAR_MIN, YEAR_MAX = -700, 2010


def proj_xy(x, y):
    x = SCALE * math.radians(x) + TX
    y = TY - SCALE * math.log(math.tan(math.pi / 4 + math.radians(y) / 2))
    return x, y


def to_svg(geom):
    return shapely.transform(geom, lambda c: np.array([proj_xy(x, y) for x, y in c]))


def fmt(v):
    s = f'{v:.1f}'
    return s[:-2] if s.endswith('.0') else s


def polys_of(g):
    if isinstance(g, Polygon):
        return [g]
    if isinstance(g, MultiPolygon):
        return list(g.geoms)
    if hasattr(g, 'geoms'):
        return [p for x in g.geoms for p in polys_of(x)]
    return []


def lines_of(g):
    if isinstance(g, LineString):
        return [g]
    if isinstance(g, MultiLineString) or hasattr(g, 'geoms'):
        return [l for x in g.geoms for l in lines_of(x)]
    return []


# ---------- 今の国境（地図に描いている europePaths.ts の線そのもの） ----------
import re
SNAP = 4.0  # 今の国境からこれ以内（地図上の点の数）を通る昔の国境は、今の国境の線に置きかえる


def modern_borders():
    src = open(os.path.join(ROOT, 'src', 'data', 'europePaths.ts')).read()
    polys = []
    for d in re.findall(r'"d":"([^"]+)"', src):
        for ring in re.findall(r'M([^MZ]+)Z?', d):
            pts = [tuple(map(float, p.split())) for p in ring.split('L') if p.strip()]
            if len(pts) >= 3:
                g = Polygon(pts)
                polys.append(g if g.is_valid else g.buffer(0))
    countries = [p for p in polys if not p.is_empty]
    land = unary_union([c.buffer(0) for c in countries])
    lines = unary_union([c.boundary for c in countries]).difference(land.boundary.buffer(1.0))
    return lines


MODERN = modern_borders()
MODERN_ZONE = MODERN.buffer(SNAP)

years = []
for f in os.listdir(SRC):
    if f.startswith('world_') and f.endswith('.geojson'):
        t = f[6:-8]
        y = -int(t[2:]) if t.startswith('bc') else int(t)
        if YEAR_MIN <= y <= YEAR_MAX:
            years.append((y, f))
years.sort()

out_dir = os.path.join(ROOT, 'public', 'borders')
os.makedirs(out_dir, exist_ok=True)
total = 0
for y, f in years:
    states = {}
    for ft in json.load(open(SRC + f))['features']:
        if not ft['geometry']:
            continue
        g = make_valid(shape(ft['geometry'])).intersection(CLIP)
        g = MultiPolygon([p for p in polys_of(g) if p.area > 1e-5])
        if g.is_empty:
            continue
        g = make_valid(to_svg(g)).buffer(0)
        name = (ft['properties'].get('NAME') or '').strip() or f'_{len(states)}'
        states[name] = unary_union([states[name], g]) if name in states else g
    # 境目の線 = すべての国の輪郭 − 陸地全体の外側の輪郭（海岸線）
    land = unary_union([s.buffer(0) for s in states.values()])
    borders = unary_union([s.boundary for s in states.values()]).difference(land.boundary.buffer(3.5))
    d = ''
    # 今の国境とほぼ同じところは、今の国境の線をそのまま使う（2本の線がずれて並ばないように）
    far = borders.difference(MODERN_ZONE)
    same = MODERN.intersection(borders.buffer(SNAP))
    borders = unary_union([g for g in (far, same) if not g.is_empty])
    merged = linemerge(lines_of(borders)) if not borders.is_empty else borders
    for ln in lines_of(merged):
        ln = ln.simplify(0.5)
        cs = list(ln.coords)
        if len(cs) < 2 or ln.length < 2:
            continue
        d += 'M' + 'L'.join(f'{fmt(a)} {fmt(b)}' for a, b in cs)
    # 国名：日本語訳があり、地図の中にある程度の広さがある国だけ
    view = to_svg(box(-12, 36, 43, 61.5))
    labels = []
    for name, g in states.items():
        ja = NAMES.get(name)
        # 同じ名前でも、時代によって呼び名が変わる国
        if name == 'Germany' and y < 1919:
            ja = 'ドイツ帝国'
        if name == 'Italy' and y < 1946:
            ja = 'イタリア王国'
        if name in ('France', 'Spain', 'Portugal', 'Sweden', 'Denmark', 'Norway', 'Hungary', 'Poland') and y < 1789 and ja and not ja.endswith('王国'):
            ja = ja + '王国'
        if not ja:
            continue
        gv = g.intersection(view)
        a = gv.area
        if a < 1200:
            continue
        big = max(polys_of(gv), key=lambda p: p.area)
        pt = polylabel(big, tolerance=1.5)
        lv = 1 if a >= 15000 else 2 if a >= 4000 else 3
        labels.append({'t': ja, 'x': round(pt.x, 1), 'y': round(pt.y, 1), 'lv': lv})
    labels.sort(key=lambda l: l['lv'])
    data = json.dumps({'y': y, 'd': d, 'l': labels}, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(out_dir, f'{y}.json'), 'w').write(data)
    total += len(data.encode())
    print(y, len(d), len(labels))

open(os.path.join(out_dir, 'LICENSE.txt'), 'w').write(
    'このフォルダの国境データは historical-basemaps（https://github.com/aourednik/historical-basemaps）\n'
    'を加工したものです。元データのライセンスは GNU General Public License v3.0 です。\n'
    'Derived from historical-basemaps by Andre Ourednik and contributors, licensed under GPL-3.0.\n'
    'Generated by scripts/build-historical-borders.py.\n')
ys = ', '.join(str(y) for y, _ in years)
open(os.path.join(ROOT, 'src', 'data', 'historicalBorderYears.ts'), 'w').write(
    '/** 「当時の国境」のデータ（public/borders/<年>.json）がある年。scripts/build-historical-borders.py が作る */\n'
    f'export const HISTORICAL_BORDER_YEARS: number[] = [{ys}];\n')
print('total bytes', total)
