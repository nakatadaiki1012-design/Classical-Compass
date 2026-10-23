import React, { useState, useMemo, useEffect, useRef } from 'react';
import { yearText, yearTick } from '../utils/yearLabel';
import { COMPOSERS, getVisibleComposers } from '../data/composers';
import { EUROPEAN_CITIES } from '../data/cities';
import { ERAS, getEraById } from '../data/eras';
import { EUROPE_COUNTRY_PATHS } from '../data/europePaths';
import { ComposerPortrait } from './ComposerPortrait';
import { MapPersonPopup } from './MapPersonPopup';
import { useBackClose } from '../utils/backStack';
import { isJapanOnly } from '../utils/japanMode';
import { getPeriodsAt } from '../data/musicPeriods';
import { periodShortName } from '../data/glossary';
import { ComposerHoverCard, HoverCardHandle } from './ComposerHoverCard';
import { hasAudio } from '../utils/hasAudio';
import { YearEventsOverlay } from './YearEventsOverlay';
import { YearTopicsBar } from './YearTopicsBar';
import { getWhereabouts, isOffMap, Whereabouts } from '../data/itinerary';
import { getComposerEventsAround } from '../data/chronicle';
import { SVG_W, SVG_H, projectGeoToSvg } from '../data/mapProjection';
import { useAudio } from '../context/AudioContext';
import { writeUrlState } from '../utils/urlState';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronRight,
  BookOpen,
  MapPin,
  Volume2,
  Calendar,
  Filter,
  UserCheck,
  Heart,
  Flame,
  X
} from 'lucide-react';
import { Composer, Composition } from '../types';

interface EuropeMapViewProps {
  onSelectComposer: (composerId: string, year?: number) => void;
  /** アドレス（#year=…）で指定された、最初に見る年 */
  initialYear?: number;
}

/** 地図の上に出る説明の札（まとめ札・人物の説明）を、文字が読みやすいよう大きくする倍率 */
const POPUP_ZOOM = 1.4;

export const EuropeMapView: React.FC<EuropeMapViewProps> = ({ onSelectComposer, initialYear }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const [currentYear, setCurrentYear] = useState<number>(initialYear ?? (isJapanOnly() ? 1620 : 1787)); // 最初はモーツァルトの頃（日本音楽史のみなら江戸初め）

  // いま見ている年をアドレスに書いておく（自動再生中は書きすぎないよう、少し待ってから）
  useEffect(() => {
    const t = window.setTimeout(() => writeUrlState({ year: currentYear }), 300);
    return () => window.clearTimeout(t);
  }, [currentYear]);
  const [isPlayingTimeTravel, setIsPlayingTimeTravel] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [hoveredComposerId, setHoveredComposerId] = useState<string | null>(null);
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const [showStories, setShowStories] = useState<boolean>(false);
  useBackClose(showStories, () => setShowStories(false));
  useBackClose(!!selectedComposerId, () => setSelectedComposerId(null));

  // Historical milestones across 700 years
  const milestones = [
    { year: 1365, title: 'マショー『ノートルダム・ミサ曲』(中世)', era: 'medieval' },
    { year: 1562, title: 'パレストリーナ『教皇マルチェルスのミサ』(ルネサンス)', era: 'renaissance' },
    { year: 1607, title: 'モンテヴェルディ歌劇『オルフェオ』(バロック)', era: 'baroque' },
    { year: 1723, title: 'バッハ ライプツィヒ就任 & ヴィヴァルディ『四季』', era: 'baroque' },
    { year: 1787, title: 'モーツァルト『ドン・ジョヴァンニ』&『アイネ・クライネ』', era: 'classical' },
    { year: 1808, title: 'ベートーヴェン『運命』ウィーン初演', era: 'classical' },
    { year: 1830, title: 'ベルリオーズ『幻想交響曲』初演', era: 'romantic' },
    { year: 1838, title: 'ショパン パリでのノクターン傑作群', era: 'romantic' },
    { year: 1876, title: 'チャイコフスキー『白鳥の湖』& ワーグナー バイロイト開場', era: 'late-romantic' },
    { year: 1896, title: 'R.シュトラウス『ツァラトゥストラ』初演', era: 'late-romantic' },
    { year: 1913, title: 'ストラヴィンスキー『春の祭典』初演', era: 'modern' },
    { year: 1943, title: 'バルトーク『管弦楽のための協奏曲』', era: 'modern' },
    { year: 1967, title: '武満徹『ノヴェンバー・ステップス』(現代)', era: 'modern' }
  ];

  // Auto time travel slideshow
  useEffect(() => {
    if (isPlayingTimeTravel) {
      timerRef.current = window.setInterval(() => {
        setCurrentYear(prev => {
          if (prev >= 2030) {
            setIsPlayingTimeTravel(false);
            return 2030;
          }
          return prev + 1;
        });
      }, 600 / playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingTimeTravel, playbackSpeed]);

  // Current era based on year
  const currentEra = useMemo(() => {
    const jp = isJapanOnly() ? getPeriodsAt(currentYear, true, false, true)[0] : undefined;
    if (jp) return { name: periodShortName(jp), color: jp.color };
    return ERAS.find(e => currentYear >= e.startYear && currentYear <= e.endYear) || ERAS[2];
  }, [currentYear]);

  // Active composers living in currentYear
  const activeComposers = useMemo(() => {
    return getVisibleComposers().filter(c => currentYear >= c.birthYear && currentYear <= c.deathYear);
  }, [currentYear]);

  // 地図の拡大・移動。k = 拡大率（1が全体）、(vx, vy) = 見えている範囲の左上（地図の座標）
  const [view, setView] = useState<{ k: number; vx: number; vy: number }>({ k: 1, vx: 0, vy: 0 });
  const { k, vx, vy } = view;
  const MAX_K = 6;
  const svgRef = useRef<SVGSVGElement | null>(null);
  // 地図を小さく表示しているとき、札や文字まで小さくなってボケるので、その分だけ少し大きく描く
  const [pxScale, setPxScale] = useState(1);
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      // 地図は枠の中に縦横比を保って収まるので、幅と高さのうち小さいほうの比率が実際の縮尺
      const r = el.getBoundingClientRect();
      setPxScale(Math.min(r.width / SVG_W, r.height / SVG_H) || 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const boost = Math.min(1.35, Math.max(1, 0.7 / pxScale));
  const sc = boost / k; // 拡大しても、札や文字の大きさが画面の上で変わらないようにするための倍率
  const hoverCardRef = useRef<HoverCardHandle>(null);
  const didPanRef = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const clampView = (v: { k: number; vx: number; vy: number }) => {
    const kk = Math.min(MAX_K, Math.max(1, v.k));
    return {
      k: kk,
      vx: Math.min(SVG_W - SVG_W / kk, Math.max(0, v.vx)),
      vy: Math.min(SVG_H - SVG_H / kk, Math.max(0, v.vy))
    };
  };

  /** 画面上の点（clientX/Y）を中心に、倍率を factor 倍にする */
  const zoomAt = (factor: number, clientX?: number, clientY?: number) => {
    const el = svgRef.current;
    const cur = viewRef.current;
    const nk = Math.min(MAX_K, Math.max(1, cur.k * factor));
    if (!el) {
      setView(clampView({ ...cur, k: nk }));
      return;
    }
    const rect = el.getBoundingClientRect();
    const fx = clientX === undefined ? 0.5 : (clientX - rect.left) / rect.width;
    const fy = clientY === undefined ? 0.5 : (clientY - rect.top) / rect.height;
    const wx = cur.vx + fx * (SVG_W / cur.k);
    const wy = cur.vy + fy * (SVG_H / cur.k);
    setView(clampView({ k: nk, vx: wx - fx * (SVG_W / nk), vy: wy - fy * (SVG_H / nk) }));
  };

  // マウスでドラッグして動かす（拡大しているときだけ）
  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (viewRef.current.k <= 1 || !svgRef.current) return;
    const start = { x: e.clientX, y: e.clientY, ...viewRef.current };
    const rect = svgRef.current.getBoundingClientRect();
    didPanRef.current = false;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (!didPanRef.current && Math.hypot(dx, dy) < 4) return;
      didPanRef.current = true;
      setView(
        clampView({
          k: start.k,
          vx: start.vx - (dx / rect.width) * (SVG_W / start.k),
          vy: start.vy - (dy / rect.height) * (SVG_H / start.k)
        })
      );
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.setTimeout(() => (didPanRef.current = false), 0);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // 2本指のピンチで拡大縮小、拡大中は1本指で移動。Ctrl＋ホイール（トラックパッドのピンチ）でも拡大縮小
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    let pinch: { d: number } | null = null;
    let pan: { x: number; y: number } | null = null;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinch = { d: dist(e.touches) };
        pan = null;
      } else if (e.touches.length === 1 && viewRef.current.k > 1) {
        pan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        didPanRef.current = false;
      }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinch) {
        e.preventDefault();
        const d = dist(e.touches);
        zoomAt(d / pinch.d, (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
        pinch.d = d;
        didPanRef.current = true;
      } else if (e.touches.length === 1 && pan) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const cur = viewRef.current;
        const dx = e.touches[0].clientX - pan.x;
        const dy = e.touches[0].clientY - pan.y;
        if (Math.hypot(dx, dy) > 3) didPanRef.current = true;
        pan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setView(clampView({ k: cur.k, vx: cur.vx - (dx / rect.width) * (SVG_W / cur.k), vy: cur.vy - (dy / rect.height) * (SVG_H / cur.k) }));
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinch = null;
      if (e.touches.length === 0) {
        pan = null;
        window.setTimeout(() => (didPanRef.current = false), 50);
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY);
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
      el.removeEventListener('wheel', onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 地図に出す人物。その年の居場所（滞在・旅行）に合わせて位置が動く。
  // 地図の範囲の外（アメリカ・日本など）は、「地図の外」の枠に表示する。
  // 同じ場所に人が集中しているときは、1つの「まとめ札」にして、都市を指示線で指す。
  const { composerMapData, offMapBox, clusters } = useMemo(() => {
    interface Entry {
      composer: Composer;
      where: Whereabouts;
      activeWorksInYear: Composition[];
    }
    const entries: Entry[] = [];
    activeComposers.forEach(composer => {
      const where = getWhereabouts(composer, currentYear);
      if (!where) return;
      entries.push({
        composer,
        where,
        activeWorksInYear: composer.works.filter(w => Math.abs(w.year - currentYear) <= 2)
      });
    });

    type Pin = Entry & { x: number; y: number; trueX: number; trueY: number; offMap: boolean; clusterId?: string; level: 0 | 1 | 2; compact?: boolean };
    interface Cluster {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      cols: number;
      trueX: number;
      trueY: number;
      placeName: string;
      members: Entry[];
    }
    const pins: Pin[] = [];
    const clusters: Cluster[] = [];

    // 画面の上での大きさが変わらないよう、拡大しているときは地図の上での大きさを小さくして場所を探す
    const s = boost / k;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    const free = (x: number, y: number, w: number, h: number) =>
      placed.every(q => Math.abs(q.x - x) >= (q.w + w) / 2 + 4 * s || Math.abs(q.y - y) >= (q.h + h) / 2 + 4 * s);
    const ANGLES = [-45, 45, -135, 135, -90, 90, 0, 180, -22, 22, -158, 158, -68, 68, -112, 112];
    /** 本当の場所のまわりで、斜めも含めて近い順に空いている場所を探す */
    const findSpot = (tx: number, ty: number, w: number, h: number, firstRing: number, maxRing = 24): [number, number] | null => {
      for (let ring = firstRing; ring <= maxRing; ring++) {
        for (const deg of ANGLES) {
          const rad = (deg * Math.PI) / 180;
          const x = tx + Math.cos(rad) * ring * w * 0.75;
          const y = ty + Math.sin(rad) * ring * h * 0.9;
          const inside = x - w / 2 > 10 && x + w / 2 < SVG_W - 10 && y - h / 2 > 6 && y + h / 2 < SVG_H - 6;
          if (inside && free(x, y, w, h)) return [x, y];
        }
      }
      return null;
    };

    const onMap = entries
      .filter(e => !isOffMap(e.where.place))
      .map(e => {
        const [tx, ty] = projectGeoToSvg(e.where.place.lon, e.where.place.lat);
        return { e, tx, ty };
      });

    // 近い人どうしをグループにする（画面の上で約36px以内）
    const parent = onMap.map((_, i) => i);
    const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < onMap.length; i++) {
      for (let j = i + 1; j < onMap.length; j++) {
        if (Math.hypot(onMap[i].tx - onMap[j].tx, onMap[i].ty - onMap[j].ty) < 36 * s) parent[find(i)] = find(j);
      }
    }
    const groups = new Map<number, typeof onMap>();
    onMap.forEach((item, i) => {
      const root = find(i);
      groups.set(root, [...(groups.get(root) || []), item]);
    });

    // 4人以上が集中している場所は「まとめ札」
    const CARD_ROW = 28;
    const singles: typeof onMap = [];
    groups.forEach(list => {
      if (list.length < 4) {
        singles.push(...list);
        return;
      }
      const cx = list.reduce((a, b) => a + b.tx, 0) / list.length;
      const cy = list.reduce((a, b) => a + b.ty, 0) / list.length;
      const cols = list.length > 7 ? 2 : 1;
      const rows = Math.ceil(list.length / cols);
      const wScreen = (cols * 108 + 16) * POPUP_ZOOM;
      const hScreen = (26 + rows * CARD_ROW) * POPUP_ZOOM;
      const id = `cluster-${clusters.length}`;
      const nearest = list.reduce((best, cur) =>
        Math.hypot(cur.tx - cx, cur.ty - cy) < Math.hypot(best.tx - cx, best.ty - cy) ? cur : best
      );
      clusters.push({
        id,
        x: cx,
        y: cy,
        w: wScreen * s,
        h: hScreen * s,
        cols,
        trueX: cx,
        trueY: cy,
        placeName: nearest.e.where.place.ja,
        members: list
          .map(i => i.e)
          .sort((a, b) => a.composer.birthYear - b.composer.birthYear)
      });
    });

    // 地図の外にいる人の枠（右下）も場所をふさぐので、先に押さえておく
    {
      const offCount = entries.filter(e => isOffMap(e.where.place)).length;
      if (offCount > 0) {
        const ow = Math.max(Math.min(offCount, 3) * 124 + 24, 240);
        const oh = 34 + Math.ceil(offCount / 3) * 84;
        placed.push({ x: SVG_W - 10 - ow / 2, y: SVG_H - 10 - oh / 2, w: ow, h: oh });
      }
    }

    // まとめ札を先に置く（大きいので、よい場所を先に取る）
    clusters
      .sort((a, b) => b.members.length - a.members.length)
      .forEach(c => {
        const [x, y] = findSpot(c.trueX, c.trueY, c.w, c.h, 1) ?? [c.trueX, c.trueY];
        c.x = x;
        c.y = y;
        placed.push({ x, y, w: c.w, h: c.h });
        c.members.forEach(m => {
          pins.push({ ...m, x, y, trueX: c.trueX, trueY: c.trueY, offMap: false, clusterId: c.id, level: 0 });
        });
      });

    // 残りの人は、1人ずつの札。拡大して場所に余裕があるときは、肖像画の隣に名前（段階1）、
    // さらに余裕があれば、その頃にしていたこと・作曲したもの（段階2）まで広げる
    const LABEL_W = 104 * s;
    const LABEL_H = 82 * s; // 肖像（上）から名前の札（下）まで
    const LABEL_DY = 14 * s; // 札の中心は、肖像の中心より少し下
    // [段階, 画面上の幅, 高さ, 探す範囲（リング数）]
    const LEVELS: [1 | 2, number, number, number][] = [
      [2, 360, 95, 1],
      [1, 210, 48, 2]
    ];
    singles
      .sort((a, b) => a.ty - b.ty || a.tx - b.tx)
      .forEach(({ e, tx, ty }) => {
        let done = false;
        if (k >= 2) {
          for (const [level, wPx, hPx, maxRing] of LEVELS) {
            if (level === 2 && k < 3.2) continue;
            const w = wPx * s;
            const h = hPx * s;
            const shift = (w / 2 - 20 * s); // 肖像（左端）が本当の場所の近くに来るようにずらす
            const spot = findSpot(tx + shift, ty, w, h, 0, maxRing);
            if (spot) {
              placed.push({ x: spot[0], y: spot[1], w, h });
              pins.push({ ...e, x: spot[0] - w / 2 + 20 * s, y: spot[1], trueX: tx, trueY: ty, offMap: false, level });
              done = true;
              break;
            }
          }
        }
        if (done) return;
        const spotFull = findSpot(tx, ty + LABEL_DY, LABEL_W, LABEL_H, 0);
        if (spotFull) {
          placed.push({ x: spotFull[0], y: spotFull[1], w: LABEL_W, h: LABEL_H });
          pins.push({ ...e, x: Math.round(spotFull[0]), y: Math.round(spotFull[1] - LABEL_DY), trueX: tx, trueY: ty, offMap: false, level: 0 });
          return;
        }
        // 札を置く場所がないときは、重ならないよう顔写真だけにする（名前はタップ・カーソルで見られる）
        const AV = 32 * s;
        const [ax, ay] = findSpot(tx, ty, AV, AV, 0) ?? [tx, ty];
        placed.push({ x: ax, y: ay, w: AV, h: AV });
        pins.push({ ...e, x: Math.round(ax), y: Math.round(ay), trueX: tx, trueY: ty, offMap: false, level: 0, compact: true });
      });

    // 地図の外の枠（右下）
    const off = entries.filter(e => isOffMap(e.where.place));
    let box: { x: number; y: number; w: number; h: number } | null = null;
    if (off.length > 0) {
      const cols = Math.min(off.length, 3);
      const rows = Math.ceil(off.length / 3);
      const w = Math.max(cols * 124 + 24, 240);
      const h = 34 + rows * 84;
      box = { x: SVG_W - 10 - w, y: SVG_H - 10 - h, w, h };
      off.forEach((e, index) => {
        const colsInRow = Math.min(3, off.length - Math.floor(index / 3) * 3);
        const startX = box!.x + (w - colsInRow * 124) / 2 + 62;
        const x = startX + (index % 3) * 124;
        const y = box!.y + 34 + 30 + Math.floor(index / 3) * 84;
        pins.push({ ...e, x: Math.round(x), y: Math.round(y), trueX: x, trueY: y, offMap: true, level: 0 });
      });
    }
    return { composerMapData: pins, offMapBox: box, clusters };
  }, [activeComposers, currentYear, k, boost]);

  // Active composer full story data for currentYear (生没年、生誕エピソード、最期エピソード、作曲エピソード)
  const composerLifeStories = useMemo(() => {
    return activeComposers.map(composer => {
      const currentStay = composer.cities.find(
        s => currentYear >= s.startYear && currentYear <= s.endYear
      ) || composer.cities[0];

      // Exact or nearby works
      const exactWork = composer.works.find(w => w.year === currentYear);
      const nearbyWork = composer.works.find(w => Math.abs(w.year - currentYear) <= 2);
      const fallbackWork = composer.works[0];

      const work = exactWork || nearbyWork || fallbackWork;
      const isExactYear = exactWork !== undefined;

      return {
        composer,
        work,
        cityStay: currentStay,
        cityNameJa: currentStay?.cityNameJa || work?.city || composer.country,
        isExactYear,
        ageInYear: currentYear - composer.birthYear,
        lifespan: composer.deathYear - composer.birthYear
      };
    });
  }, [activeComposers, currentYear]);

  // Filtered stories if a specific composer is selected on map
  const displayedStories = useMemo(() => {
    if (selectedComposerId) {
      const filtered = composerLifeStories.filter(s => s.composer.id === selectedComposerId);
      if (filtered.length > 0) return filtered;

      // Fallback if composer not in active list (e.g. historical jump)
      const comp = COMPOSERS.find(c => c.id === selectedComposerId);
      if (comp) {
        const currentStay = comp.cities[0];
        return [{
          composer: comp,
          work: comp.works[0],
          cityStay: currentStay,
          cityNameJa: currentStay?.cityNameJa || comp.country,
          isExactYear: comp.works.some(w => w.year === currentYear),
          ageInYear: currentYear - comp.birthYear,
          lifespan: comp.deathYear - comp.birthYear
        }];
      }
    }
    return composerLifeStories;
  }, [composerLifeStories, selectedComposerId, currentYear]);

  // 地図の表示エリアの大きさ（小・中・大）。この端末に覚えておく
  const MAP_SIZES = { s: { label: '小', vh: 30 }, m: { label: '中', vh: 46 }, l: { label: '大', vh: 70 } } as const;
  const [mapSize, setMapSize] = useState<keyof typeof MAP_SIZES>(() => {
    try {
      const v = localStorage.getItem('cc-map-size');
      return v === 's' || v === 'm' || v === 'l' ? v : 'm';
    } catch {
      return 'm';
    }
  });
  const changeMapSize = (v: keyof typeof MAP_SIZES) => {
    setMapSize(v);
    try {
      localStorage.setItem('cc-map-size', v);
    } catch {
      /* 保存できなくても動く */
    }
  };

  const handlePinClick = (composerId: string) => {
    if (didPanRef.current) return; // ドラッグで動かした直後のクリックは無視
    setSelectedComposerId(prev => (prev === composerId ? null : composerId));
  };

  // 年を動かして、選んだ作曲家がその年に存命でなくなったらポップアップを閉じる
  useEffect(() => {
    if (!selectedComposerId) return;
    const c = COMPOSERS.find(x => x.id === selectedComposerId);
    if (!c || currentYear < c.birthYear || currentYear > c.deathYear) setSelectedComposerId(null);
  }, [currentYear, selectedComposerId]);

  // ポップアップに出す人物（地図上の位置の都市名も使う）
  const popupPin = composerMapData.find(pin => pin.composer.id === selectedComposerId) || null;

  return (
    <div className="flex flex-col min-h-screen bg-[#121110] text-[#f5ebd9] select-none pb-16">
      {/* 1. Top Year Controller & Milestone Bar */}
      <div className="bg-[#191613] border-b border-[#2e2924] px-4 md:px-8 py-2 flex flex-col gap-1.5 shadow-lg sticky top-0 z-30 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          {/* Year & Era badge */}
          <div className="flex items-center gap-3">
            <span className="font-classical-display font-bold text-2xl md:text-3xl text-[#f5ebd9] tracking-wider font-mono whitespace-nowrap">
              {yearText(currentYear)}
            </span>
            <div
              className="px-3 py-1 rounded-md text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              style={{ backgroundColor: currentEra.color }}
            >
              <span>{currentEra.name}</span>
            </div>
            <span className="text-xs text-[#b5aa9b] hidden sm:inline">
              存命の巨匠: <strong className="text-[#f5ebd9] font-mono">{activeComposers.length}名</strong>
            </span>
          </div>

          <div className="order-last basis-full sm:order-none sm:basis-auto sm:flex-1 min-w-0 flex items-center gap-1.5">
          <span className="hidden sm:inline shrink-0 whitespace-nowrap text-[11px] font-mono text-[#a3978a]">{yearText(-600)}</span>
          <button
            onClick={() => setCurrentYear(y => Math.max(-600, Math.min(2030, y - 10)))}
            className="px-1.5 py-0.5 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-[11px] font-mono shrink-0"
          >
            −10
          </button>
          <button
            onClick={() => setCurrentYear(y => Math.max(-600, Math.min(2030, y - 1)))}
            className="px-1.5 py-0.5 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-[11px] font-mono shrink-0"
          >
            −1
          </button>
          <input
            type="range"
            min={-600}
            max={2030}
            value={currentYear}
            onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
            className="flex-1 min-w-0 h-2 bg-[#2a241c] accent-[#c99738] rounded-lg cursor-pointer transition-all"
          />
          <button
            onClick={() => setCurrentYear(y => Math.max(-600, Math.min(2030, y + 1)))}
            className="px-1.5 py-0.5 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-[11px] font-mono shrink-0"
          >
            +1
          </button>
          <button
            onClick={() => setCurrentYear(y => Math.max(-600, Math.min(2030, y + 10)))}
            className="px-1.5 py-0.5 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-[11px] font-mono shrink-0"
          >
            +10
          </button>
          <span className="hidden sm:inline shrink-0 whitespace-nowrap text-[11px] font-mono text-[#a3978a]">2030年</span>
        </div>

          {/* 自動再生・画期ジャンプ（速度は再生中だけ表示して画面をすっきり） */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md bg-[#241f19] border border-[#3d362e] p-0.5 text-[11px]">
            <span className="px-1 text-[#a3978a]">地図の大きさ</span>
            {(Object.keys(MAP_SIZES) as (keyof typeof MAP_SIZES)[]).map(key => (
              <button
                key={key}
                onClick={() => changeMapSize(key)}
                className={`px-2 py-0.5 rounded ${mapSize === key ? 'bg-[#c99738] text-[#161412] font-bold' : 'text-[#bdb1a1] hover:text-[#f5ebd9]'}`}
              >
                {MAP_SIZES[key].label}
              </button>
            ))}
            </div>
            <select
              value=""
              onChange={e => {
                if (e.target.value) {
                  setCurrentYear(parseInt(e.target.value, 10));
                  setSelectedComposerId(null);
                }
              }}
              className="bg-[#241f19] border border-[#3d362e] rounded-md px-1.5 py-0.5 text-[11px] text-[#e8dec8] focus:outline-none focus:border-[#c99738] cursor-pointer max-w-[120px] sm:max-w-[150px]"
              aria-label="有名な年へジャンプ"
            >
              <option value="">有名な年へ</option>
              {milestones.map(m => (
                <option key={m.year} value={m.year} className="bg-[#1a140f]">
                  {m.year}年　{m.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsPlayingTimeTravel(!isPlayingTimeTravel)}
              title="年代を自動で進める" className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/50 text-[#f5ebd9] text-[11px] font-bold whitespace-nowrap transition-all active:scale-95"
            >
              {isPlayingTimeTravel ? (
                <>
                  <Pause className="w-3 h-3 fill-current text-[#c99738]" />
                  <span>停止</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current text-[#c99738]" />
                  <span>自動再生</span>
                </>
              )}
            </button>

            {isPlayingTimeTravel && (
              <div className="flex items-center bg-[#241f19] border border-[#3d362e] rounded-lg p-0.5 text-[11px]">
                {[1, 2, 4].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-[#c99738] text-[#161412] font-bold'
                        : 'text-[#b5aa9b] hover:text-[#f5ebd9]'
                    }`}
                  >
                    {spd}倍
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* その年の重要なできごとを短く（くわしくは下の欄） */}
        <YearTopicsBar
          year={currentYear}
          visibleComposerIds={null}
          onJumpToYear={year => {
            setCurrentYear(year);
            setSelectedComposerId(null);
          }}
          onOpenComposer={onSelectComposer}
        />
      </div>

      {/* 2. Main SVG Europe Map Canvas (地図のほう: 生没年＆その年の作曲を表示) */}
      <div className="relative bg-[#0a0908] border-b border-[#2e2924] flex items-center justify-center p-2 md:p-4 overflow-hidden">
        <div className="w-full max-w-6xl relative">
          <svg
            ref={svgRef}
            viewBox={`${vx} ${vy} ${SVG_W / k} ${SVG_H / k}`}
            className={`w-full h-auto object-contain select-none ${k > 1 ? 'cursor-grab' : ''}`}
            style={{ maxHeight: `max(220px, ${MAP_SIZES[mapSize].vh}vh)` }}
            onMouseDown={handleMapMouseDown}
            textRendering="geometricPrecision"
          >
            <defs>
              <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#181512" />
                <stop offset="100%" stopColor="#080706" />
              </radialGradient>

              <marker id="moveArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e6b95c" />
              </marker>

              <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Ocean / Background */}
            <rect width={SVG_W} height={SVG_H} fill="url(#oceanGlow)" />

            {/* 緯度・経度の目盛り線（5度ごとの緯度線、10度ごとの経度線） */}
            {[40, 45, 50, 55, 60].map(lat => {
              const y = projectGeoToSvg(0, lat)[1];
              return <line key={`lat-${lat}`} x1="0" y1={y} x2={SVG_W} y2={y} stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />;
            })}
            {[-10, 0, 10, 20, 30, 40].map(lon => {
              const x = projectGeoToSvg(lon, 0)[0];
              return <line key={`lon-${lon}`} x1={x} y1="0" x2={x} y2={SVG_H} stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />;
            })}

            {/* European Country Outlines */}
            <g id="european-countries-accurate">
              {EUROPE_COUNTRY_PATHS.map((country, idx) => (
                <path
                  key={idx}
                  d={country.d}
                  fill="#1e1813"
                  stroke="#382e23"
                  strokeWidth="1.2"
                  className="hover:fill-[#272019] transition-colors"
                >
                  <title>{country.name}</title>
                </path>
              ))}
            </g>

            {/* European Cities Reference Dots & Names */}
            {Object.values(EUROPEAN_CITIES).map(city => {
              const [cx, cy] = projectGeoToSvg(city.coordinates[0], city.coordinates[1]);
              return (
                <g key={city.id} className="opacity-70 pointer-events-none max-md:hidden">
                  <circle cx={cx} cy={cy} r={2.5 * sc} fill="#8c7e6d" />
                  <text
                    x={cx}
                    y={cy + 10 * sc}
                    textAnchor="middle"
                    fontSize={10 * sc}
                    fill="#a89a88"
                    fontFamily="sans-serif"
                    fontWeight="500"
                  >
                    {city.nameJa}
                  </text>
                </g>
              );
            })}

            {/* 引っ越し・旅立ちの年は、前の滞在先からの点線の矢印で「移動」を見せる */}
            {composerMapData
              .filter(p => p.where.movedFrom && !p.offMap && !p.clusterId && !isOffMap(p.where.movedFrom))
              .map(p => {
                const [fx, fy] = projectGeoToSvg(p.where.movedFrom!.lon, p.where.movedFrom!.lat);
                return (
                  <g key={`move-${p.composer.id}`} className="pointer-events-none">
                    <line
                      x1={fx}
                      y1={fy}
                      x2={p.x}
                      y2={p.y}
                      stroke="#e6b95c"
                      strokeWidth="2"
                      strokeDasharray="7 6"
                      opacity="0.75"
                      markerEnd="url(#moveArrow)"
                    />
                    <circle cx={fx} cy={fy} r="4" fill="#e6b95c" opacity="0.8" />
                  </g>
                );
              })}

            {/* 札を避けて少しずらした人には、本当の場所との間に細い線と点を表示 */}
            {composerMapData
              .filter(p => !p.offMap && !p.clusterId && Math.hypot(p.x - p.trueX, p.y - p.trueY) > 6 * sc)
              .map(p => (
                <g key={`leader-${p.composer.id}`} className="pointer-events-none">
                  <line x1={p.trueX} y1={p.trueY} x2={p.x} y2={p.y} stroke="#bdb1a1" strokeWidth={1.2 * sc} opacity="0.7" />
                  <circle cx={p.trueX} cy={p.trueY} r={3.5 * sc} fill="#f5ebd9" stroke="#14110e" strokeWidth={sc} />
                </g>
              ))}

            {/* 人が集中している都市：都市を指す線と人数の丸 */}
            {clusters.map(c => (
              <g key={`cl-line-${c.id}`} className="pointer-events-none">
                <line x1={c.trueX} y1={c.trueY} x2={c.x} y2={c.y} stroke="#e6b95c" strokeWidth={1.6 * sc} opacity="0.85" />
                <circle cx={c.trueX} cy={c.trueY} r={9 * sc} fill="#e6b95c" stroke="#14110e" strokeWidth={1.5 * sc} />
                <text x={c.trueX} y={c.trueY + 4 * sc} textAnchor="middle" fontSize={11 * sc} fontWeight="bold" fill="#14110e">
                  {c.members.length}
                </text>
              </g>
            ))}

            {/* 地図の外（アメリカ・日本など）にいる人の枠 */}
            {offMapBox && (
              <g className="pointer-events-none" transform={`translate(${vx} ${vy}) scale(${sc})`}>
                <rect
                  x={offMapBox.x}
                  y={offMapBox.y}
                  width={offMapBox.w}
                  height={offMapBox.h}
                  rx="12"
                  fill="#14110e"
                  stroke="#c99738"
                  strokeWidth="1.2"
                  strokeDasharray="5 4"
                  opacity="0.92"
                />
                <text x={offMapBox.x + 14} y={offMapBox.y + 22} fontSize="12" fontWeight="bold" fill="#e6b95c">
                  地図の外にいる人（遠方）
                </text>
              </g>
            )}

            {/* MAP COMPOSER PINS WITH LIFESPAN & COMPOSITION (生没年＆作曲を地図上に明記) */}
            {composerMapData.filter(pin => !pin.clusterId).map(pin => {
              const { composer, where, x, y, offMap, activeWorksInYear, level, compact } = pin;
              const era = getEraById(composer.era);
              const isSelected = selectedComposerId === composer.id;
              const isHovered = hoveredComposerId === composer.id;
              const topWork = activeWorksInYear[0];

              return (
                <g
                  key={composer.id}
                  transform={offMap ? `translate(${vx} ${vy}) scale(${sc})` : `translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}
                  onClick={() => handlePinClick(composer.id)}
                  onMouseEnter={e => {
                    setHoveredComposerId(composer.id);
                    hoverCardRef.current?.show(composer.id, currentYear, e.clientX, e.clientY);
                  }}
                  onMouseMove={e => hoverCardRef.current?.move(e.clientX, e.clientY)}
                  onMouseLeave={() => {
                    setHoveredComposerId(null);
                    hoverCardRef.current?.hide();
                  }}
                  className="cursor-pointer group"
                >
                  {/* Pulsating Era Glow Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={topWork ? 26 : isSelected ? 22 : 16}
                    fill={era.color}
                    opacity={topWork ? 0.45 : isSelected ? 0.4 : isHovered ? 0.3 : 0.15}
                    className="animate-pulse transition-all duration-300"
                  />

                  {/* Pin Stem */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={y + 16}
                    stroke={isSelected ? '#ffffff' : era.color}
                    strokeWidth={isSelected ? '3' : '2'}
                    strokeLinecap="round"
                  />
                  <circle cx={x} cy={y + 16} r="2.5" fill="#ffffff" stroke={era.color} strokeWidth="1.5" />

                  {/* 記録がなく、近い年の居場所から推定しているときは点線の輪 */}
                  {where.isEstimated && (
                    <circle cx={x} cy={y} r="21" fill="none" stroke="#d6cdbd" strokeWidth="1.2" strokeDasharray="3 3" />
                  )}

                  {/* Portrait Avatar Marker */}
                  <foreignObject
                    x={x - (isSelected ? 18 : 15)}
                    y={y - (isSelected ? 18 : 15)}
                    width={isSelected ? 36 : 30}
                    height={isSelected ? 36 : 30}
                    className="overflow-visible"
                  >
                    <div
                      className={`w-full h-full rounded-full transition-all duration-300 flex items-center justify-center shadow-xl ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121110] scale-110 z-30'
                          : isHovered
                          ? 'ring-2 ring-[#c99738] scale-105 z-20'
                          : 'ring-1 ring-[#c99738]/60 hover:ring-[#c99738]'
                      }`}
                      style={{ backgroundColor: era.color }}
                    >
                      <ComposerPortrait
                        composer={composer}
                        size="sm"
                        showOrnateBorder={false}
                        className="w-full h-full"
                      />
                    </div>
                  </foreignObject>

                  {/* 長期の旅行・遠征・留学中は「旅」のバッジ */}
                  {where.isTrip && (
                    <g>
                      <circle cx={x + 15} cy={y - 15} r="9" fill="#c99738" stroke="#14110e" strokeWidth="1.5" />
                      <text x={x + 15} y={y - 11.5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#14110e">
                        旅
                      </text>
                    </g>
                  )}

                  {/* ON-MAP LABEL: name on line 1, composition (or years) on line 2, box sized to fit */}
                  {/* 拡大して余裕があるとき：肖像画の隣に名前（段階1）、その頃していたこと・作曲したもの（段階2） */}
                  {level >= 1 && (() => {
                    const ev = getComposerEventsAround(composer.id, currentYear, 3).find(
                      e => e.kind === 'work' || e.kind === 'episode'
                    );
                    const doing = topWork
                      ? `♪ ${topWork.title}`
                      : ev
                      ? `${ev.year}年 ${ev.title}`
                      : where.note;
                    const chars = [...doing];
                    const lines = [chars.slice(0, 19).join(''), chars.slice(19, 38).join('') + (chars.length > 38 ? '…' : '')].filter(Boolean);
                    const boxW = level === 2 ? 224 : 130;
                    const boxH = level === 2 ? 20 + lines.length * 13 + 16 : 28;
                    return (
                      <g transform={`translate(${x + 20}, ${y - (boxH * POPUP_ZOOM) / 2}) scale(${POPUP_ZOOM})`} className="pointer-events-none">
                        <rect width={boxW} height={boxH} rx="8" fill="#14110e" stroke={isSelected ? '#ffffff' : topWork ? '#c99738' : era.color} strokeWidth="1.1" opacity="0.94" />
                        <text x="12" y="17" fontSize="13" fontWeight="bold" fill="#ffffff">
                          {composer.shortName}
                          <tspan fontSize="10" fontWeight="600" fill="#c9bfb0" dx="6">
                            {currentYear - composer.birthYear}歳
                          </tspan>
                        </text>
                        {level === 2 && (
                          <>
                            <text x="12" y="32" fontSize="9.5" fill="#a89a88">
                              📍 {where.place.ja}{where.isTrip ? '・旅行中' : ''}
                            </text>
                            {lines.map((ln, i) => (
                              <text key={i} x="12" y={46 + i * 13} fontSize="10.5" fontWeight="600" fill={topWork ? '#e6b95c' : '#e8dec8'}>
                                {ln}
                              </text>
                            ))}
                          </>
                        )}
                      </g>
                    );
                  })()}

                  {level === 0 && !(compact && !isSelected) && (() => {
                    const line1 = composer.shortName;
                    const workTitle = topWork
                      ? topWork.title.length > 10 ? topWork.title.substring(0, 9) + '…' : topWork.title
                      : '';
                    const crowded = composerMapData.length > 8 && !isSelected && !topWork;
                    const line2 = topWork
                      ? `♪ ${workTitle}`
                      : offMap
                      ? where.place.ja
                      : where.isTrip
                      ? `${where.place.ja}・旅行中`
                      : `${composer.birthYear}〜${composer.deathYear}`;
                    // CJK glyphs are ~1em wide, digits/latin ~0.6em
                    const textWidth = (text: string, size: number) =>
                      [...text].reduce((w, ch) => w + (/[\x00-\x7F]/.test(ch) ? 0.6 : 1) * size, 0);
                    const boxWidth = crowded ? textWidth(line1, 12) + 16 : Math.max(textWidth(line1, 12), textWidth(line2, 10)) + 18;
                    return (
                      <g transform={`translate(${x}, ${y + 22})`} className={isSelected ? undefined : 'max-md:hidden'}>
                        <rect
                          x={-boxWidth / 2}
                          y="0"
                          width={boxWidth}
                          height={crowded ? 20 : 32}
                          rx="7"
                          fill="#14110e"
                          stroke={isSelected ? '#ffffff' : topWork ? '#c99738' : era.color}
                          strokeWidth={isSelected ? 1.6 : 1.1}
                          opacity="0.94"
                        />
                        <text x="0" y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                          {line1}
                        </text>
                        {!crowded && (
                        <text
                          x="0"
                          y="27"
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="600"
                          fill={topWork ? '#e6b95c' : '#c9bfb0'}
                        >
                          {line2}
                        </text>
                        )}
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* 人が集中している都市の「まとめ札」：中の名前をタップするとその人の説明が開く */}
            {clusters.map(c => {
              const rows = Math.ceil(c.members.length / c.cols);
              const W = (c.w * k) / (POPUP_ZOOM * boost);
              const H = (c.h * k) / (POPUP_ZOOM * boost);
              return (
                <g key={`cl-card-${c.id}`} transform={`translate(${c.x} ${c.y}) scale(${sc * POPUP_ZOOM})`}>
                  <rect filter="url(#pinShadow)" x={-W / 2} y={-H / 2} width={W} height={H} rx="10" fill="#14110e" stroke="#e6b95c" strokeWidth="1.4" opacity="0.96" />
                  <text x={-W / 2 + 10} y={-H / 2 + 17} fontSize="12" fontWeight="bold" fill="#e6b95c">
                    {c.placeName}　{c.members.length}人
                  </text>
                  {c.members.map((m, i) => {
                    const col = Math.floor(i / rows);
                    const row = i % rows;
                    const mx = -W / 2 + 10 + col * 108;
                    const my = -H / 2 + 26 + row * 28;
                    const era = getEraById(m.composer.era);
                    const selected = selectedComposerId === m.composer.id;
                    return (
                      <g
                        key={m.composer.id}
                        className="cursor-pointer"
                        onClick={() => handlePinClick(m.composer.id)}
                        onMouseEnter={e => {
                          setHoveredComposerId(m.composer.id);
                          hoverCardRef.current?.show(m.composer.id, currentYear, e.clientX, e.clientY);
                        }}
                        onMouseMove={e => hoverCardRef.current?.move(e.clientX, e.clientY)}
                        onMouseLeave={() => {
                          setHoveredComposerId(null);
                          hoverCardRef.current?.hide();
                        }}
                      >
                        <rect
                          x={mx - 4}
                          y={my}
                          width="104"
                          height="27"
                          rx="6"
                          fill={selected ? '#3a2d1c' : hoveredComposerId === m.composer.id ? '#2a2118' : 'transparent'}
                          stroke={selected ? '#ffffff' : 'none'}
                        />
                        <foreignObject x={mx} y={my + 2} width="24" height="24">
                          <ComposerPortrait composer={m.composer} size="xs" showOrnateBorder={false} />
                        </foreignObject>
                        <circle cx={mx + 22} cy={my + 22} r="3.2" fill={era.color} stroke="#14110e" strokeWidth="1" />
                        <text x={mx + 30} y={my + 17} fontSize="11" fontWeight="bold" fill="#ffffff">
                          {m.composer.shortName.length > 6 ? m.composer.shortName.slice(0, 6) + '…' : m.composer.shortName}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          <ComposerHoverCard ref={hoverCardRef} />

          {/* 拡大・縮小のボタン */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
            <button
              onClick={() => zoomAt(1.5)}
              className="w-8 h-8 rounded bg-[#241f19]/90 border border-[#3d362e] text-[#f5ebd9] text-lg font-bold hover:bg-[#382f23]"
              aria-label="地図を拡大"
            >
              ＋
            </button>
            <button
              onClick={() => zoomAt(1 / 1.5)}
              className="w-8 h-8 rounded bg-[#241f19]/90 border border-[#3d362e] text-[#f5ebd9] text-lg font-bold hover:bg-[#382f23]"
              aria-label="地図を縮小"
            >
              −
            </button>
            {k > 1 && (
              <button
                onClick={() => setView({ k: 1, vx: 0, vy: 0 })}
                className="w-8 h-8 rounded bg-[#241f19]/90 border border-[#3d362e] text-[#bdb1a1] text-[10px] font-bold hover:bg-[#382f23]"
                aria-label="全体に戻す"
              >
                全体
              </button>
            )}
          </div>

          {/* 人物ポップアップ: 広い画面では地図の右上に重ねて、狭い画面では地図の下に表示 */}
          {popupPin && (
            <MapPersonPopup
              composer={popupPin.composer}
              year={currentYear}
              where={popupPin.where}
              onClose={() => setSelectedComposerId(null)}
              onOpenProfile={id => onSelectComposer(id, currentYear)}
            />
          )}
        </div>
      </div>

      {/* 3-a. その年の作曲と大きな出来事（音楽・世界） */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-6">
        <YearEventsOverlay
          inline
          year={currentYear}
          visibleComposerIds={null}
          onSelectComposer={onSelectComposer}
          onOpenWork={(_work, composer) => onSelectComposer(composer.id, currentYear)}
          onJumpToYear={year => {
            setCurrentYear(year);
            setSelectedComposerId(null);
          }}
        />
      </div>

      {/* 3-b. 地図の下: この年に活動した人の一覧。くわしい物語は別画面で見る */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-classical-display font-bold text-[#f5ebd9]">
            {currentYear}年に活動していた作曲家
            <span className="ml-2 text-xs font-mono font-normal text-[#bdb1a1] bg-[#241f19] px-2.5 py-0.5 rounded-full border border-[#382f25]">
              {activeComposers.length}名
            </span>
          </h2>
          <button
            onClick={() => {
              setSelectedComposerId(null);
              setShowStories(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#241e18] hover:bg-[#332b22] border border-[#c99738]/60 text-[#e8dec8] text-xs font-bold transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#c99738]" />
            <span>生い立ち・最期・作曲の物語を別画面で見る</span>
            <ChevronRight className="w-4 h-4 text-[#c99738]" />
          </button>
        </div>

        {activeComposers.length === 0 ? (
          <p className="text-sm text-[#bdb1a1]">この年に活動していた登録済みの作曲家はいません。年を動かしてみてください。</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeComposers.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedComposerId(prev => (prev === c.id ? null : c.id))}
                className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border text-xs transition-colors ${
                  selectedComposerId === c.id
                    ? 'bg-[#c99738]/20 border-[#c99738] text-[#f5ebd9]'
                    : 'bg-[#1c1712] border-[#33291c] text-[#e8dec8] hover:border-[#c99738]/60'
                }`}
              >
                <ComposerPortrait composer={c} size="xs" />
                <span className="font-semibold">{c.shortName}</span>
                <span className="text-[#a3978a]">{currentYear - c.birthYear}歳</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 別画面: この年の物語（生い立ち・最期・作曲のエピソード） */}
      {showStories && (
        <div className="fixed inset-0 z-50 bg-[#121110] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#191613]/95 backdrop-blur-md border-b border-[#2e2924] px-4 md:px-8 py-3 flex items-center justify-between gap-3">
            <span className="font-classical-display font-bold text-lg text-[#f5ebd9]">
              {currentYear}年の物語
            </span>
            <button
              onClick={() => setShowStories(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241e18] hover:bg-[#332b22] border border-[#3d362e] text-[#e8dec8] text-xs font-bold"
            >
              <X className="w-4 h-4" />
              <span>地図にもどる</span>
            </button>
          </div>
          <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-6 pb-24 space-y-6">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2e2820] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#c99738] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>{currentYear}年 巨匠たちの生没年・生涯の物語 & 作曲背景</span>
            </div>
            <h2 className="text-xl md:text-2xl font-classical-display font-bold text-[#f5ebd9] mt-1 flex items-center gap-2">
              <span>生誕・最期のエピソード & 代表曲</span>
              <span className="text-xs font-mono font-normal text-[#b5aa9b] bg-[#241f19] px-2.5 py-0.5 rounded-full border border-[#382f25]">
                {displayedStories.length}名の物語
              </span>
            </h2>
          </div>

          {/* Filter Status Reset Button */}
          {selectedComposerId && (
            <button
              onClick={() => setSelectedComposerId(null)}
              className="px-3 py-1.5 rounded-lg bg-[#29221b] hover:bg-[#382e24] border border-[#c99738]/50 text-[#c99738] text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>すべての作曲家のエピソードを表示</span>
            </button>
          )}
        </div>

        {/* Composer Life & Composition Story Cards Grid */}
        {displayedStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedStories.map(({ composer, work, cityStay, cityNameJa, isExactYear, ageInYear, lifespan }) => {
              const era = getEraById(composer.era);
              const isCurrentPlaying = work ? (isPlaying && currentTrack?.work.id === work.id) : false;

              return (
                <div
                  key={composer.id}
                  className="bg-[#181512] border border-[#332b22] hover:border-[#c99738]/80 rounded-2xl p-5 shadow-2xl transition-all flex flex-col justify-between space-y-5 group"
                >
                  {/* Card Header: Composer Portrait, Name, Lifespan Badge */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#29221b] pb-3.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <ComposerPortrait
                        composer={composer}
                        size="md"
                        showOrnateBorder={true}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base emoji">{composer.flag}</span>
                          <span className="text-sm font-bold text-[#f5ebd9] truncate font-classical-display">
                            {composer.name}
                          </span>
                        </div>

                        {/* 生没年 (Birth - Death Years) & Current Year Age */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
                          <span className="bg-[#292117] text-[#c99738] border border-[#c99738]/40 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                            生没年: {composer.birthYear}年 〜 {composer.deathYear}年（享年{lifespan}歳）
                          </span>
                          <span className="bg-[#1f1a14] text-[#bdb1a1] px-2 py-0.5 rounded font-mono text-[11px]">
                            {currentYear}年当時は{ageInYear}歳
                          </span>
                        </div>

                        {/* Birthplace & Deathplace */}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#b5aa9b]">
                          {composer.birthPlace && (
                            <span>誕生地: <strong className="text-[#d1c6b6]">{composer.birthPlace}</strong></span>
                          )}
                          {composer.deathPlace && (
                            <span>· 没地: <strong className="text-[#d1c6b6]">{composer.deathPlace}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio Play Button (if work available) */}
                    {work && hasAudio(work) && (
                      <button
                        onClick={() => playTrack(work, composer)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg transition-all shrink-0 ${
                          isCurrentPlaying
                            ? 'bg-white text-black scale-105 ring-2 ring-[#c99738]'
                            : 'bg-[#c99738] text-black hover:bg-[#dbaa44] hover:scale-105'
                        }`}
                        title={isCurrentPlaying ? '一時停止' : 'フレーズ試聴'}
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* 1. 生誕・生い立ちのエピソード (どのように生まれたか) */}
                  <div className="bg-[#13110e] border border-[#2d251c] rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#86efac]">
                      <span>🌱</span>
                      <span>生誕・生い立ちのエピソード（どのように生まれたか）</span>
                    </div>
                    <p className="text-xs text-[#d1c6b6] leading-relaxed">
                      {composer.birthEpisode || `${composer.birthYear}年、${composer.birthPlace || composer.country}にて誕生。幼少期より類稀なる音楽的才能を開花させた。`}
                    </p>
                  </div>

                  {/* 2. 最期・逝去のエピソード (どのように亡くなったか) */}
                  <div className="bg-[#13110e] border border-[#2d251c] rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#fbcfe8]">
                      <span>🕯️</span>
                      <span>最期・逝去のエピソード（どのように亡くなったか）</span>
                    </div>
                    <p className="text-xs text-[#d1c6b6] leading-relaxed">
                      {composer.deathEpisode || `${composer.deathYear}年、${composer.deathPlace || composer.country}にて${lifespan}歳で永眠。その音楽的遺産は後世に大きな影響を与え続けている。`}
                    </p>
                  </div>

                  {/* 3. 作曲・滞在エピソード ({currentYear}年) */}
                  {work && (
                    <div className="bg-[#15120e] border border-[#382d20] rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>当時の作曲・活動エピソード</span>
                        </span>
                        <span className="text-[11px] font-mono text-[#c99738] bg-[#292015] px-2 py-0.5 rounded">
                          {work.year}年 作曲 · 📍 {cityNameJa}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">
                        『{work.title}』
                      </h4>
                      <p className="text-xs text-[#d1c6b6] leading-relaxed">
                        {work.description}
                      </p>
                      {cityStay?.notableEvent && (
                        <p className="text-[11px] text-[#b5aa9b] border-t border-[#261f17] pt-1.5 mt-1 italic">
                          💡 当時の滞在背景: {cityStay.notableEvent}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Card Bottom: 作曲者の紹介は別ボタンで飛ぶようにして */}
                  <div className="pt-2 border-t border-[#29221b] flex items-center justify-end">
                    <button
                      onClick={() => onSelectComposer(composer.id, currentYear)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#241e18] hover:bg-[#332b22] border border-[#c99738]/60 text-[#c99738] hover:text-[#f5ebd9] text-xs font-bold transition-all shadow-md group/btn"
                    >
                      <UserCheck className="w-4 h-4 text-[#c99738]" />
                      <span>作曲家「{composer.shortName}」の全プロフィール・名鑑を見る</span>
                      <ChevronRight className="w-4 h-4 text-[#c99738] group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#181512] border border-[#2e2820] rounded-2xl p-12 text-center space-y-3">
            <p className="text-sm text-[#b5aa9b]">
              {currentYear}年において存命の対象作曲家は登録されていません。
            </p>
            <button
              onClick={() => setSelectedComposerId(null)}
              className="px-4 py-2 rounded-lg bg-[#c99738] text-black font-bold text-xs"
            >
              すべての作品エピソードを表示
            </button>
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
};
