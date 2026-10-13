import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { yearText, yearTick } from '../utils/yearLabel';
import { Composer, Composition, EraId } from '../types';
import { getVisibleComposers } from '../data/composers';
import { ERAS, getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { YearEventsOverlay } from './YearEventsOverlay';
import { hasAudio } from '../utils/hasAudio';
import { YearTopicsBar } from './YearTopicsBar';
import { useAudio } from '../context/AudioContext';
import { MUSIC_PERIODS, MusicPeriod } from '../data/musicPeriods';
import { PeriodModal } from './PeriodModal';
import { getWorkTrivia } from '../data/trivia';
import { ComposerHoverCard, HoverCardHandle } from './ComposerHoverCard';
import { useJapanMode } from '../utils/japanMode';
import { useSettings } from '../utils/appSettings';
import { countryOf, countryColor } from '../data/composerMeta';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Play,
  Pause,
  Sparkles,
  Compass,
  Layers,
  ChevronRight,
  Maximize2,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface TimelineViewProps {
  onSelectComposer: (composerId: string, year?: number) => void;
}

interface ActiveNearItem {
  composer: Composer;
  x: number;
  y: number;
  diff: number;
}

interface StrandItem {
  composer: Composer;
  birthX: number;
  deathX: number;
  width: number;
  y: number;
  z: number;
  depthNorm: number;
  opacity: number;
  strokeThickness: number;
  isForeground: boolean;
  yearDiff: number;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectComposer: onSelectComposerWithYear }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  const MIN_YEAR = -600;
  const BASE_ZOOM = 7.0;
  const MIN_ZOOM = 3.0;
  const MAX_ZOOM = 36.0;
  const MAX_YEAR = 2010;
  const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

  // View style
  const [viewStyle, setViewStyle] = useState<'3d-bundle' | 'panorama'>('panorama');

  // Zoom scale (pixels per year): default 12.0px/year
  // 横の拡大率（1年あたりの幅）。小さいほど広い範囲が一度に見える
  const [zoomScale, setZoomScale] = useState<number>(BASE_ZOOM);
  // 縦の拡大率（段の高さ）。1が標準
  const [rowScale, setRowScale] = useState<number>(1);
  const MIN_ROW_SCALE = 0.35;
  const MAX_ROW_SCALE = 1.6;
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Auto-rotating set to FALSE by default so it doesn't spin arbitrarily without scrolling ("勝手に回転はしなくてよい")
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // 検索・表示設定パネルの開閉（普段は閉じて画面をすっきり見せる）
  const [showSettings, setShowSettings] = useState<boolean>(false);


  // User adjustable cylinder radius (default 165px for a broad, readable 3D bundle!)
  const [cylinderRadius, setCylinderRadius] = useState<number>(165);

  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focalYear, setFocalYear] = useState<number>(1787);
  const focalYearRef = useRef<number>(1787);
  focalYearRef.current = focalYear;

  // 人物を開くときは、いま見ている年（中心年）も一緒に渡し、「その年の様子」を見せる
  const onSelectComposer = useCallback(
    (composerId: string) => onSelectComposerWithYear(composerId, focalYear),
    [onSelectComposerWithYear, focalYear]
  );

  // Episode modal for single-tap on composition points
  const [focusedEpisodeWork, setFocusedEpisodeWork] = useState<{
    work: Composition;
    composer: Composer;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth scroll & dragging state with inertia
  const scrollPosRef = useRef<number>(0);
  const targetScrollPosRef = useRef<number>(0);
  const rotAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  const horizontalPadding = 500; // ample space for edge needle positioning
  const timelineTotalWidth = TOTAL_YEARS * zoomScale;

  // Filter composers
  const filteredComposers = useMemo(() => {
    return getVisibleComposers().filter(c => {
      if (selectedEra !== 'all' && c.era !== selectedEra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q) || c.originalName.toLowerCase().includes(q);
        const matchesWork = c.works.some(w => w.title.toLowerCase().includes(q));
        const matchesMilestone = c.milestones?.some(m => m.event.toLowerCase().includes(q));
        if (!matchesName && !matchesWork && !matchesMilestone) return false;
      }
      return true;
    }).sort((a, b) => a.birthYear - b.birthYear || a.deathYear - b.deathYear);
  }, [selectedEra, searchQuery]);

  // 検索・時代で絞り込み中のときだけ、できごと欄もその作曲家に絞る
  const visibleComposerIds = useMemo(
    () => (selectedEra === 'all' && !searchQuery.trim() ? null : new Set(filteredComposers.map(c => c.id))),
    [filteredComposers, selectedEra, searchQuery]
  );

  // Current era based on focal year
  const currentEra = useMemo(() => {
    return ERAS.find(e => focalYear >= e.startYear && focalYear <= e.endYear) || ERAS[2];
  }, [focalYear]);

  // 年を「指定して」移動したとき（ツマミ・±10・目盛りのタップ・ジャンプ）だけ、その年に生きている人の段が見える位置へ縦にも動かす。
  // 自分で縦にスクロールしたり、横にドラッグしているときは動かさない。
  const alignRowsRef = useRef<(year: number) => void>(() => {});
  const alignTimerRef = useRef<number | undefined>(undefined);
  const alignRows = useCallback((year: number) => {
    window.clearTimeout(alignTimerRef.current);
    alignTimerRef.current = window.setTimeout(() => alignRowsRef.current(year), 400);
  }, []);

  // Jump to specific year smoothly
  const scrollToYear = useCallback((targetYear: number) => {
    if (!containerRef.current) return;
    alignRows(targetYear);
    const clientWidth = containerRef.current.clientWidth;
    const targetPixel = (targetYear - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
    targetScrollPosRef.current = Math.max(0, targetPixel);
    scrollPosRef.current = Math.max(0, targetPixel);
    containerRef.current.scrollLeft = Math.max(0, targetPixel);
    setFocalYear(targetYear);
  }, [zoomScale, horizontalPadding]);

  // 目盛りを触ったときなど、なめらかに動いてその年にフォーカスする
  const animateToYear = useCallback(
    (targetYear: number) => {
      if (!containerRef.current) return;
      const clientWidth = containerRef.current.clientWidth;
      const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, targetYear));
      alignRows(clamped);
      const targetPixel = (clamped - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
      velocityRef.current = { vx: 0, vy: 0 };
      targetScrollPosRef.current = Math.max(0, targetPixel);
    },
    [zoomScale, horizontalPadding, alignRows]
  );

  // 最初は1787年（モーツァルトの頃）に合わせる。拡大・縮小したときも、いま見ている年を中心に保つ
  useEffect(() => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth;
      const initialPixel = (focalYearRef.current - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
      containerRef.current.scrollLeft = Math.max(0, initialPixel);
      scrollPosRef.current = initialPixel;
      targetScrollPosRef.current = initialPixel;
    }
  }, [zoomScale]);

  // 画面上の横位置 → 年
  const clientXToYear = (clientX: number): number | null => {
    const container = containerRef.current;
    if (!container) return null;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left + container.scrollLeft;
    return Math.round(MIN_YEAR + (x - horizontalPadding) / zoomScale);
  };

  // 年表や目盛りを軽くタップ（クリック）すると、そこにフォーカスが移る。ドラッグのあとは何もしない
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const handleCanvasClick = (e: React.MouseEvent) => {
    const moved = Math.hypot(e.clientX - pointerDownPosRef.current.x, e.clientY - pointerDownPosRef.current.y);
    if (moved > 6) return;
    const year = clientXToYear(e.clientX);
    if (year !== null && year >= MIN_YEAR - 5 && year <= MAX_YEAR + 5) animateToYear(year);
  };

  // マウスを乗せた位置に、年を示す薄い線を出す（押せることが分かるように）
  const hoverLineRef = useRef<HTMLDivElement | null>(null);
  const hoverLabelRef = useRef<HTMLSpanElement | null>(null);
  const updateHoverGuide = (clientX: number | null) => {
    const line = hoverLineRef.current;
    const label = hoverLabelRef.current;
    const container = containerRef.current;
    if (!line || !label || !container) return;
    if (clientX === null) {
      line.style.display = 'none';
      return;
    }
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left + container.scrollLeft;
    const year = Math.round(MIN_YEAR + (x - horizontalPadding) / zoomScale);
    if (year < MIN_YEAR || year > MAX_YEAR) {
      line.style.display = 'none';
      return;
    }
    line.style.display = 'block';
    line.style.left = `${(year - MIN_YEAR) * zoomScale + horizontalPadding}px`;
    label.textContent = `${yearText(year)}へ`;
  };

  // 指でのスクロール（スマホ）やトラックパッドで動かしたときも、中心の年を追従させる
  const handleContainerScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    if (Math.abs(container.scrollLeft - scrollPosRef.current) > 2) {
      scrollPosRef.current = container.scrollLeft;
      targetScrollPosRef.current = container.scrollLeft;
      velocityRef.current = { vx: 0, vy: 0 };
    }
  };

  // Handle Dragging / Swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.pageX, y: e.pageY, time: performance.now() };
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateHoverGuide(isDraggingRef.current ? null : e.clientX);
    if (!isDraggingRef.current) return;
    e.preventDefault();

    const now = performance.now();
    const dt = Math.max(1, now - lastMousePosRef.current.time);
    const dx = e.pageX - lastMousePosRef.current.x;
    const dy = e.pageY - lastMousePosRef.current.y;

    targetScrollPosRef.current = Math.max(0, targetScrollPosRef.current - dx);

    if (viewStyle === '3d-bundle') {
      rotAngleRef.current += dy * 0.008;
      setRotationAngle(rotAngleRef.current);
    }

    velocityRef.current = { vx: -dx / dt, vy: dy / dt };
    lastMousePosRef.current = { x: e.pageX, y: e.pageY, time: now };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };
  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    updateHoverGuide(null);
  };

  // Main 60fps Animation Loop
  useEffect(() => {
    let animId: number;
    const container = containerRef.current;

    const renderLoop = () => {
      // 1. Smooth lerp for scroll position (Inertia)
      if (!isDraggingRef.current && Math.abs(velocityRef.current.vx) > 0.05) {
        targetScrollPosRef.current += velocityRef.current.vx * 12;
        velocityRef.current.vx *= 0.92; // friction
      }

      const diff = targetScrollPosRef.current - scrollPosRef.current;
      scrollPosRef.current += diff * 0.22; // smooth spring lerp

      if (container && Math.abs(diff) > 0.5) {
        container.scrollLeft = scrollPosRef.current;
      }

      // 2. Compute focal year at center of screen
      if (container) {
        const clientWidth = container.clientWidth;
        const centerPixel = scrollPosRef.current + clientWidth / 2 - horizontalPadding;
        const currentYear = Math.round(MIN_YEAR + centerPixel / zoomScale);
        const clamped = Math.max(MIN_YEAR, Math.min(MAX_YEAR, currentYear));
        setFocalYear(clamped);

        // 3. SYNCHRONIZED CYLINDER ROTATION:
        // Automatically rotate cylinder during horizontal scroll so that active composers for focalYear come to the front/top!
        if (viewStyle === '3d-bundle') {
          const count = filteredComposers.length;
          if (count > 0) {
            if (isAutoRotating) {
              // Manual continuous spinning option if explicitly toggled on
              rotAngleRef.current += 0.012;
            } else if (!isDraggingRef.current) {
              // いま見ている年にいちばん「ちょうど」生きている作曲家（生涯の中ほどが年に近い人）を、正面の真ん中に持ってくる
              let focusIdx = -1;
              let best = Infinity;
              filteredComposers.forEach((c, idx) => {
                const alive = c.birthYear <= clamped && clamped <= c.deathYear;
                const score = alive
                  ? Math.abs((c.birthYear + c.deathYear) / 2 - clamped)
                  : 10000 + Math.min(Math.abs(c.birthYear - clamped), Math.abs(c.deathYear - clamped));
                if (score < best) {
                  best = score;
                  focusIdx = idx;
                }
              });
              if (focusIdx >= 0) {
                const baseAngle = (focusIdx / count) * Math.PI * 2;
                const desiredRotation = -baseAngle;
                let delta = desiredRotation - rotAngleRef.current;
                delta = Math.atan2(Math.sin(delta), Math.cos(delta));
                rotAngleRef.current += delta * 0.12; // なめらかに回って、フォーカスした人が真ん中に来る
              }
            }
            setRotationAngle(rotAngleRef.current);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [zoomScale, horizontalPadding, isAutoRotating, viewStyle, filteredComposers]);

  // 3D：一人ひとりの間隔（前面で約 spacing px）を確保するよう、人数に合わせて筒を大きくする
  const bundleSpacing = Math.round(cylinderRadius * 0.2); // スライダーで間隔を調整（初期値で約33px）
  const bundleRadius = Math.max(120, Math.round((filteredComposers.length * bundleSpacing) / (2 * Math.PI)));
  const bundleCenterY = bundleRadius + 60;
  const bundleHeight = bundleRadius * 2 + 120;

  // Compute 3D strand layout and active proximity bubbles
  const { bundle3DData, activeNearComposer } = useMemo<{
    bundle3DData: StrandItem[];
    activeNearComposer: ActiveNearItem | null;
  }>(() => {
    const centerY = bundleCenterY;
    const cylinderRadius = bundleRadius;
    const count = filteredComposers.length;

    let nearest: ActiveNearItem | null = null;

    const strands = filteredComposers.map((composer, idx) => {
      const baseAngle = (idx / Math.max(1, count)) * Math.PI * 2;
      const currentAngle = baseAngle + rotationAngle;

      const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const deathX = (composer.deathYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const width = Math.max(48, deathX - birthX);

      const y = centerY + Math.sin(currentAngle) * cylinderRadius;
      const z = Math.cos(currentAngle) * cylinderRadius;

      const depthNorm = (z + cylinderRadius) / (cylinderRadius * 2);
      const opacity = 0.35 + depthNorm * 0.65;
      const strokeThickness = Math.max(14, 14 + depthNorm * 14);
      const isForeground = z > -15;

      // Proximity check for focal balloon
      const yearDiff = Math.abs(focalYear - composer.birthYear);
      if (yearDiff <= 12) {
        if (!nearest || yearDiff < nearest.diff) {
          nearest = { composer, x: birthX, y, diff: yearDiff };
        }
      }

      return {
        composer,
        birthX,
        deathX,
        width,
        y,
        z,
        depthNorm,
        opacity,
        strokeThickness,
        isForeground,
        yearDiff
      };
    }).sort((a, b) => a.z - b.z);

    return { bundle3DData: strands, activeNearComposer: nearest };
  }, [filteredComposers, rotationAngle, zoomScale, horizontalPadding, focalYear, bundleRadius, bundleCenterY]);

  // 一覧表示: 生まれた年が遅い人ほど下の段に置く（1人1段）。左上から右下へ階段のように流れる
  // 時代の帯（年表の目盛りの下）。重なる時代は段を分けて並べる
  const japanMode = useJapanMode();
  const [openPeriod, setOpenPeriod] = useState<MusicPeriod | null>(null);
  const hoverCardRef = useRef<HoverCardHandle>(null);
  const { colorBy } = useSettings();
  // 国ごとの色分けのときの凡例（いま表示している人の国だけ）
  const countryLegend = useMemo(() => {
    const names = new Set(filteredComposers.map(c => countryOf(c)));
    return [...names].sort((a, b) => a.localeCompare(b, 'ja'));
  }, [filteredComposers]);
  const BAND_LANE_H = 14;
  const { bandSegments, bandLanes } = useMemo(() => {
    const place = (list: MusicPeriod[], firstLane: number) => {
      const laneEnds: number[] = [];
      return list.map(p => {
        let lane = laneEnds.findIndex(end => end <= p.start);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = p.end;
        return { period: p, lane: lane + firstLane };
      });
    };
    const inRange = (p: MusicPeriod) => p.end > MIN_YEAR && p.start < MAX_YEAR;
    const west = place(MUSIC_PERIODS.filter(p => p.region === 'west' && inRange(p)).sort((a, b) => a.start - b.start), 0);
    const westLanes = west.reduce((m, s) => Math.max(m, s.lane + 1), 0);
    const jp = japanMode
      ? place(MUSIC_PERIODS.filter(p => p.region === 'japan' && inRange(p)).sort((a, b) => a.start - b.start), westLanes)
      : [];
    const all = [...west, ...jp];
    return { bandSegments: all, bandLanes: all.reduce((m, s) => Math.max(m, s.lane + 1), 0) };
  }, [japanMode]);
  const BAND_H = bandLanes * BAND_LANE_H + 3;

  const PANO_TOP = 44 + BAND_H;
  const PANO_ROW_HEIGHT = Math.round(34 * rowScale);
  const compactRows = PANO_ROW_HEIGHT < 26; // 縦に縮めたときは、肖像や♪を小さくして文字だけにする
  const { panoramaBars, panoramaRowCount } = useMemo(() => {
    const bars = filteredComposers.map((composer, row) => {
      const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const deathX = (composer.deathYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const width = Math.max(150, deathX - birthX);
      return { composer, birthX, width, row };
    });
    return { panoramaBars: bars, panoramaRowCount: bars.length };
  }, [filteredComposers, zoomScale, horizontalPadding]);

  alignRowsRef.current = (year: number) => {
    const container = containerRef.current;
    if (!container || viewStyle !== 'panorama') return;
    const alive = panoramaBars.filter(b => b.composer.birthYear <= year && year <= b.composer.deathYear);
    if (alive.length === 0) return;
    const top = PANO_TOP + alive[0].row * PANO_ROW_HEIGHT;
    const visibleFrom = container.scrollTop;
    const visibleTo = container.scrollTop + container.clientHeight;
    // すでに先頭の人が見える位置にあれば、動かさない
    if (top >= visibleFrom + BAND_H && top < visibleTo - 120) return;
    container.scrollTo({ top: Math.max(0, top - 42 - BAND_H), behavior: 'smooth' });
  };

  // 3Dに切り替えたとき・間隔を変えたときは、フォーカスする人が通る「中心線」が画面の真ん中に来るよう縦に合わせる
  useEffect(() => {
    if (viewStyle !== '3d-bundle') return;
    const container = containerRef.current;
    if (container) container.scrollTop = Math.max(0, bundleCenterY - container.clientHeight / 2 + 20);
  }, [viewStyle, bundleCenterY]);

  // 開いたときも、いま見ている年に生きている人の段が見える位置に合わせる
  useEffect(() => {
    alignRows(focalYearRef.current);
  }, [alignRows]);

  // 2本指のピンチ（スマホ）や、Ctrl＋ホイール／トラックパッドのピンチで、年表を拡大・縮小する
  const zoomRef = useRef(zoomScale);
  zoomRef.current = zoomScale;
  const rowRef = useRef(rowScale);
  rowRef.current = rowScale;
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +z.toFixed(2)));
    const clampRow = (z: number) => Math.min(MAX_ROW_SCALE, Math.max(MIN_ROW_SCALE, +z.toFixed(2)));
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    // 指を開く向きで、横（年）・縦（段の高さ）・両方を決める
    let start: { d: number; zoom: number; row: number; mode: 'x' | 'y' | 'both' } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
        const dy = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        start = {
          d: dist(e.touches),
          zoom: zoomRef.current,
          row: rowRef.current,
          mode: angle < 30 ? 'x' : angle > 60 ? 'y' : 'both'
        };
        isDraggingRef.current = false;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !start) return;
      e.preventDefault();
      const r = dist(e.touches) / start.d;
      if (start.mode !== 'y') setZoomScale(clampZoom(start.zoom * r));
      if (start.mode !== 'x') setRowScale(clampRow(start.row * r));
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) start = null;
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return; // ピンチ操作は ctrlKey つきのホイールとして届く
      e.preventDefault();
      const f = Math.exp(-e.deltaY * 0.004);
      // Shift を押しながらなら縦、そのままなら横
      if (e.shiftKey) setRowScale(clampRow(rowRef.current * f));
      else setZoomScale(clampZoom(zoomRef.current * f));
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Generate fine-grained year ticks
  const yearTicks = useMemo(() => {
    const ticks: {
      year: number;
      x: number;
      type: 'major-50' | 'decade-10' | 'half-decade-5' | 'single-1';
      label?: string;
    }[] = [];

    for (let yr = MIN_YEAR; yr <= MAX_YEAR; yr++) {
      const x = (yr - MIN_YEAR) * zoomScale + horizontalPadding;

      if (yr % 50 === 0) {
        ticks.push({ year: yr, x, type: 'major-50', label: yearTick(yr) });
      } else if (yr % 10 === 0) {
        ticks.push({ year: yr, x, type: 'decade-10', label: yearTick(yr) });
      } else if (yr % 5 === 0) {
        ticks.push({ year: yr, x, type: 'half-decade-5', label: yearTick(yr) });
      } else if (zoomScale >= 14.0) {
        ticks.push({ year: yr, x, type: 'single-1' });
      }
    }
    return ticks;
  }, [zoomScale, horizontalPadding]);

  // Quick jump historical milestones
  const iconicComposers = [
    { id: 'machaut', name: 'マショー', year: 1300 },
    { id: 'josquin', name: 'ジョスカン', year: 1450 },
    { id: 'monteverdi', name: 'モンテヴェルディ', year: 1567 },
    { id: 'vivaldi', name: 'ヴィヴァルディ', year: 1678 },
    { id: 'bach', name: 'バッハ', year: 1685 },
    { id: 'mozart', name: 'モーツァルト', year: 1756 },
    { id: 'beethoven', name: 'ベートーヴェン', year: 1770 },
    { id: 'chopin', name: 'ショパン', year: 1810 },
    { id: 'tchaikovsky', name: 'チャイコフスキー', year: 1840 },
    { id: 'debussy', name: 'ドビュッシー', year: 1862 },
    { id: 'stravinsky', name: 'ストラヴィンスキー', year: 1882 },
    { id: 'takemitsu', name: '武満徹', year: 1930 }
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-45px)] select-none bg-[#090807] overflow-hidden font-sans">
      {/* Top bar: 年・時代・ツマミだけを常に表示。検索や設定は「検索・設定」を押したときだけ出る */}
      <div className="bg-[#14100c]/95 backdrop-blur-xl border-b border-[#302519] px-4 md:px-6 py-2.5 shrink-0 z-30 shadow-lg">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="order-1 flex items-center gap-2.5 shrink-0">
            <span className="font-classical-display font-mono font-bold text-2xl text-[#f5ebd9] tabular-nums">
              {yearText(focalYear)}
            </span>
            {currentEra && (
              <span
                className="px-2.5 py-0.5 rounded text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: currentEra.color }}
              >
                {currentEra.name}
              </span>
            )}
          </div>

          <div className="order-3 w-full md:order-2 md:w-auto md:flex-1 flex items-center gap-2.5">
            <button
              onClick={() => scrollToYear(Math.max(MIN_YEAR, focalYear - 10))}
              className="px-2 py-1 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-xs font-mono transition-colors shrink-0"
              title="10年戻る"
            >
              −10
            </button>
            <button
              onClick={() => scrollToYear(Math.max(MIN_YEAR, Math.min(MAX_YEAR, focalYear - 1)))}
              className="px-2 py-1 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-xs font-mono transition-colors shrink-0"
              title="1年戻る"
            >
              −1
            </button>
            <input
              type="range"
              min={MIN_YEAR}
              max={MAX_YEAR}
              value={focalYear}
              onChange={e => scrollToYear(parseInt(e.target.value, 10))}
              className="flex-1 h-2.5 bg-[#1f1812] accent-[#c99738] rounded-lg cursor-pointer"
              aria-label="年代"
            />
            <button
              onClick={() => scrollToYear(Math.max(MIN_YEAR, Math.min(MAX_YEAR, focalYear + 1)))}
              className="px-2 py-1 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-xs font-mono transition-colors shrink-0"
              title="1年進む"
            >
              +1
            </button>
            <button
              onClick={() => scrollToYear(Math.min(MAX_YEAR, focalYear + 10))}
              className="px-2.5 py-1 rounded bg-[#1e1711] hover:bg-[#2b2118] border border-[#3d3021] text-[#bdb1a1] hover:text-[#f5ebd9] text-xs font-mono transition-colors shrink-0"
              title="10年進む"
            >
              +10
            </button>
          </div>

          <button
            onClick={() => setShowSettings(v => !v)}
            className={`order-2 ml-auto md:order-3 md:ml-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors shrink-0 ${
              showSettings
                ? 'bg-[#c99738] border-[#e6b95c] text-black'
                : 'bg-[#1e1711] border-[#3d3021] text-[#e8dec8] hover:border-[#c99738]/60'
            }`}
          >
            {showSettings ? <X className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
            <span>検索・設定</span>
            {!showSettings && visibleComposerIds && (
              <span className="px-1.5 rounded-full bg-[#c99738] text-black text-[10px]">絞込中</span>
            )}
          </button>
        </div>

        {showSettings && (
          <div className="mt-2.5 pt-2.5 border-t border-[#2a2015] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#a3978a]">検索（作曲家・曲名・できごと）</span>
              <span className="relative">
                <Search className="w-3.5 h-3.5 text-[#bdb1a1] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="例: モーツァルト、運命、革命"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e1711] border border-[#3d3021] rounded-lg px-3 py-2 pl-8 text-sm text-[#f5ebd9] placeholder-[#8f8476] focus:outline-none focus:border-[#c99738]"
                />
              </span>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#a3978a]">時代で絞り込む</span>
              <select
                value={selectedEra}
                onChange={e => setSelectedEra(e.target.value as EraId | 'all')}
                className="bg-[#1e1711] border border-[#3d3021] rounded-lg px-3 py-2 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#c99738] cursor-pointer"
              >
                <option value="all" className="bg-[#1a140f]">全時代（{getVisibleComposers().length}名）</option>
                {ERAS.map(era => (
                  <option key={era.id} value={era.id} className="bg-[#1a140f]">
                    {era.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#a3978a]">作曲家の時代へジャンプ</span>
              <select
                value=""
                onChange={e => {
                  if (e.target.value) scrollToYear(parseInt(e.target.value, 10));
                }}
                className="bg-[#1e1711] border border-[#3d3021] rounded-lg px-3 py-2 text-sm text-[#f5ebd9] focus:outline-none focus:border-[#c99738] cursor-pointer"
              >
                <option value="">選んでください</option>
                {iconicComposers.map(item => (
                  <option key={item.id} value={item.year} className="bg-[#1a140f]">
                    {item.name}（{item.year}年）
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-[#a3978a]">表示のしかた</span>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-[#1e1711] border border-[#3d3021] rounded-lg p-0.5">
                  {([
                    { id: 'panorama', label: '見やすい一覧', Icon: Layers },
                    { id: '3d-bundle', label: '3D', Icon: Compass }
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setViewStyle(id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-bold transition-all ${
                        viewStyle === id
                          ? 'bg-gradient-to-r from-[#c99738] via-[#e6b95c] to-[#9e7220] text-black'
                          : 'text-[#bdb1a1] hover:text-[#f5ebd9]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-[#1e1711] border border-[#3d3021] rounded-lg p-1">
                  <button
                    onClick={() => setZoomScale(prev => Math.max(MIN_ZOOM, +(prev / 1.25).toFixed(2)))}
                    className="p-1 text-[#bdb1a1] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded"
                    title="縮小"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-[#c99738] px-1 w-12 text-center">
                    {Math.round((zoomScale / BASE_ZOOM) * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale(prev => Math.min(MAX_ZOOM, +(prev * 1.25).toFixed(2)))}
                    className="p-1 text-[#bdb1a1] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded"
                    title="拡大"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <span className="w-px h-4 bg-[#3d3021] mx-0.5" />
                  <button
                    onClick={() => setRowScale(prev => Math.max(MIN_ROW_SCALE, +(prev / 1.25).toFixed(2)))}
                    className="px-1.5 py-0.5 text-[11px] font-bold text-[#bdb1a1] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded"
                    title="縦に縮める"
                  >
                    縦−
                  </button>
                  <button
                    onClick={() => setRowScale(prev => Math.min(MAX_ROW_SCALE, +(prev * 1.25).toFixed(2)))}
                    className="px-1.5 py-0.5 text-[11px] font-bold text-[#bdb1a1] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded"
                    title="縦に広げる"
                  >
                    縦＋
                  </button>
                  <button
                    onClick={() => { setZoomScale(BASE_ZOOM); setRowScale(1); }}
                    className="p-1 text-[#bdb1a1] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded"
                    title="標準に戻す"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {viewStyle === '3d-bundle' && (
                <div className="flex items-center gap-2 mt-1">
                  <Maximize2 className="w-3.5 h-3.5 text-[#c99738]" />
                  <input
                    type="range"
                    min="100"
                    max="260"
                    step="5"
                    value={cylinderRadius}
                    onChange={e => setCylinderRadius(parseInt(e.target.value))}
                    className="w-24 h-1.5 accent-[#c99738] cursor-pointer"
                    title="3D：人どうしの間隔"
                  />
                  <button
                    onClick={() => setIsAutoRotating(!isAutoRotating)}
                    className={`px-2 py-0.5 rounded-md font-bold ${
                      isAutoRotating ? 'bg-[#c99738] text-black' : 'bg-[#2b2118] text-[#bdb1a1] hover:text-white'
                    }`}
                  >
                    {isAutoRotating ? '回転を止める' : '回転させる'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* その年の重要なできごとを短く（くわしくは下の欄） */}
      <div className="shrink-0 bg-[#100d0a] border-b border-[#261e14] px-4 md:px-6">
        <YearTopicsBar
          year={focalYear}
          visibleComposerIds={visibleComposerIds}
          onJumpToYear={animateToYear}
          onOpenComposer={onSelectComposerWithYear}
          onOpenWork={(work, composer) => setFocusedEpisodeWork({ work, composer })}
        />
      </div>

      {/* 国ごとの色分けのときの凡例 */}
      {colorBy === 'country' && (
        <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-[#100d0a] border-b border-[#261e14] px-4 md:px-6 py-1">
          <span className="shrink-0 text-[11px] font-bold text-[#c99738]">色＝現在の国</span>
          {countryLegend.map(name => (
            <span key={name} className="shrink-0 flex items-center gap-1 text-[11px] text-[#d6cdbd]">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: countryColor(name) }} />
              {name}
            </span>
          ))}
        </div>
      )}

      {/* 年表の本体。その年のできごとの窓は、この上に半透明で重ねる */}
      <div className="relative flex-1 min-h-0 flex flex-col">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onPointerDownCapture={e => {
          pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={handleCanvasClick}
        onScroll={handleContainerScroll}
        className={`flex-1 min-h-0 overflow-x-auto overflow-y-auto timeline-grab relative bg-[#0b0907] [touch-action:pan-x_pan-y]`}
      >
        <div
          className="relative min-h-full"
          style={{
            width: `${timelineTotalWidth + horizontalPadding * 2}px`,
            height: viewStyle === 'panorama' ? `${PANO_TOP + panoramaRowCount * PANO_ROW_HEIGHT + 240}px` : `${bundleHeight}px`
          }}
        >
          {/* Center Golden Focal Needle */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${(focalYear - MIN_YEAR) * zoomScale + horizontalPadding}px`
            }}
          >
            <div className="sticky top-0 bg-gradient-to-b from-[#e6b95c] to-[#c99738] text-black font-mono text-[11px] font-extrabold px-2.5 py-0.5 rounded-b shadow-xl flex items-center gap-1 border-x border-b border-[#f0d48d]">
              <span>▼</span>
              <span>{yearText(focalYear)}</span>
            </div>
            <div className="w-[2px] flex-1 bg-gradient-to-b from-[#c99738] via-[#e6b95c]/60 to-transparent shadow-[0_0_12px_#c99738]" />
          </div>

          {/* マウスを乗せた位置の年を示す薄い線（クリックでそこにフォーカス） */}
          <div
            ref={hoverLineRef}
            className="absolute top-0 bottom-0 w-px bg-[#e6b95c]/35 pointer-events-none z-[25]"
            style={{ display: 'none' }}
          >
            <span
              ref={hoverLabelRef}
              className="sticky top-10 ml-1 block w-max px-1.5 py-0.5 rounded bg-[#1e1711]/95 border border-[#c99738]/50 text-[11px] font-mono text-[#e6b95c] whitespace-nowrap"
            />
          </div>

          {/* Era Bands in Background */}
          <div className="absolute inset-y-0 pointer-events-none opacity-20">
            {ERAS.map(era => {
              const startX = (era.startYear - MIN_YEAR) * zoomScale + horizontalPadding;
              const width = (era.endYear - era.startYear) * zoomScale;
              return (
                <div
                  key={era.id}
                  className="absolute top-0 bottom-0 border-l border-r border-white/10"
                  style={{
                    left: `${startX}px`,
                    width: `${width}px`,
                    backgroundColor: era.bgLight
                  }}
                >
                  <div
                    className="p-3 text-xs font-serif font-bold tracking-widest uppercase"
                    style={{ color: era.color }}
                  >
                    {era.nameEn} ({era.startYear}〜{era.endYear})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fine-Grained Sticky Year Ruler Header */}
          <div className="sticky top-0 z-20 bg-[#120e0b]/95 backdrop-blur-md border-b border-[#2b2118] h-9 flex items-center shadow-sm">
            {yearTicks.map(t => {
              if (t.type === 'single-1') {
                return (
                  <div
                    key={`t-${t.year}`}
                    className="absolute bottom-0 h-1.5 w-[1px] bg-[#2d2218]"
                    style={{ left: `${t.x}px` }}
                  />
                );
              }
              if (t.type === 'half-decade-5') {
                return (
                  <div
                    key={`t-${t.year}`}
                    className="absolute bottom-0 flex flex-col items-center justify-end pb-0.5"
                    style={{ left: `${t.x}px` }}
                  >
                    <div className="h-2.5 w-[1px] bg-[#423324]" />
                    {zoomScale >= 16.0 && (
                      <span className="text-[8px] font-mono text-[#a3978a] -translate-x-1/2">
                        {t.year}
                      </span>
                    )}
                  </div>
                );
              }

              const is50 = t.type === 'major-50';
              // 縮小しているときは、20年ごとの目盛りにだけ数字を出す（重なり防止）
              const showLabel = is50 || zoomScale >= 5 || t.year % 20 === 0;
              return (
                <div
                  key={`t-${t.year}`}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pb-0.5"
                  style={{ left: `${t.x}px` }}
                >
                  <div
                    className={`w-[1px] ${
                      is50 ? 'h-4 bg-[#c99738]' : 'h-3 bg-[#5e4c3a]'
                    }`}
                  />
                  <span
                    className={`text-xs font-mono -translate-x-1/2 ${
                      is50 ? 'text-[#f5ebd9] font-extrabold' : 'text-[#b5aa9b]'
                    } ${showLabel ? '' : 'invisible'}`}
                  >
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 時代の帯：タップすると、その時代の主流の音楽と用語が開く */}
          <div className="sticky z-20 h-0" style={{ top: 36 }}>
            <div
              className="absolute left-0 top-0 w-full bg-[#0f0b08]/95 border-b border-[#2b2118]"
              style={{ height: BAND_H }}
            >
              {bandSegments.map(({ period, lane }) => {
                const s = Math.max(period.start, MIN_YEAR);
                const e = Math.min(period.end, MAX_YEAR);
                return (
                  <button
                    key={period.id}
                    onClick={ev => {
                      ev.stopPropagation();
                      setOpenPeriod(period);
                    }}
                    title={`${period.name}：${period.mainstream}`}
                    className="absolute rounded-sm text-left overflow-clip whitespace-nowrap text-[10px] font-bold leading-[13px] text-white/95 hover:brightness-125"
                    style={{
                      left: (s - MIN_YEAR) * zoomScale + horizontalPadding,
                      width: Math.max(6, (e - s) * zoomScale - 1),
                      top: 1 + lane * BAND_LANE_H,
                      height: BAND_LANE_H - 1,
                      background: period.color + 'cc'
                    }}
                  >
                    {/* 帯の左端が画面の外に出ても、時代名は画面の左端について来る */}
                    <span className="sticky left-1 px-1 inline-block">
                      {period.name.replace('日本：', '日本・').split('（')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Fine Grid Lines across canvas */}
          <div className="absolute bottom-0 inset-x-0 pointer-events-none" style={{ top: 36 + BAND_H }}>
            {yearTicks
              .filter(t => t.type === 'major-50' || t.type === 'decade-10')
              .map(t => (
                <div
                  key={`grid-${t.year}`}
                  className={`absolute top-0 bottom-0 w-[1px] ${
                    t.type === 'major-50' ? 'bg-[#241a13]' : 'bg-[#17110c]'
                  }`}
                  style={{ left: `${t.x}px` }}
                />
              ))}
          </div>

          {/* ========================================================
              MODE 1: 3D CYLINDRICAL TWISTED BUNDLE (広々とした3D筒年表)
             ======================================================== */}
          {viewStyle === '3d-bundle' && (
            <div className="relative pt-2" style={{ height: bundleHeight }}>
              {/* Central Glowing Core Line */}
              <div
                className="absolute left-0 right-0 h-[2px] pointer-events-none bg-gradient-to-r from-transparent via-[#c99738]/40 to-transparent"
                style={{
                  top: bundleCenterY,
                  boxShadow: '0 0 24px rgba(201, 151, 56, 0.3)'
                }}
              />

              {/* Render 3D Strands for each composer */}
              {bundle3DData.map(item => {
                const {
                  composer,
                  birthX,
                  deathX,
                  width,
                  y,
                  opacity,
                  strokeThickness,
                  isForeground
                } = item;

                const era = getEraById(composer.era);

                return (
                  <React.Fragment key={composer.id}>
                    {/* The 3D Lifespan Ribbon Strand */}
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                          onSelectComposer(composer.id);
                        } else {
                          clickTimeoutRef.current = setTimeout(() => {
                            clickTimeoutRef.current = null;
                            onSelectComposer(composer.id);
                          }, 250);
                        }
                      }}
                      onDoubleClick={e => {
                        e.stopPropagation();
                        if (clickTimeoutRef.current) {
                          clearTimeout(clickTimeoutRef.current);
                          clickTimeoutRef.current = null;
                        }
                        onSelectComposer(composer.id);
                      }}
                      className={`absolute rounded-full cursor-pointer transition-all duration-75 flex items-center group/strand will-change-transform ${
                        isForeground ? 'hover:brightness-125 hover:scale-[1.02]' : 'hover:opacity-90'
                      }`}
                      style={{
                        left: `${birthX}px`,
                        top: `${y - strokeThickness / 2}px`,
                        width: `${Math.max(64, width)}px`,
                        height: `${strokeThickness}px`,
                        opacity: opacity,
                        zIndex: isForeground ? 10 + Math.round(item.depthNorm * 12) : 2,
                        background: `linear-gradient(90deg, ${era.accentColor}, ${era.color}, #18130e)`,
                        boxShadow: isForeground
                          ? `0 2px 8px ${era.color}55, 0 0 12px ${era.color}33`
                          : 'none'
                      }}
                      title={`${composer.name} (${composer.birthYear}〜${composer.deathYear})\nシングルタップ/ダブルタップで作曲家詳細を開きます`}
                    >
                      {/* Portrait Avatar on Strand */}
                      {isForeground && (
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 shrink-0 z-20 pointer-events-none">
                          <ComposerPortrait
                            composer={composer}
                            size="xs"
                            showOrnateBorder={true}
                            className="ring-2 ring-[#c99738] shadow-lg scale-110"
                          />
                        </div>
                      )}

                      {/* Composer Name & Flag Label on Strand */}
                      <div className="pl-6 pr-3 flex items-center gap-1.5 overflow-hidden w-full pointer-events-none">
                        <span className="text-[11px] drop-shadow-md shrink-0">{composer.flag}</span>
                        <span className="text-[11px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate tracking-wide">
                          {composer.shortName}
                        </span>
                        {width > 120 && isForeground && (
                          <span className="text-[10px] font-mono text-white/80 font-semibold drop-shadow shrink-0 ml-auto">
                            {composer.birthYear}〜{composer.deathYear}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Major Composition Works & Milestones Markers along the strand */}
                    {isForeground && (
                      <div
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${birthX}px`,
                          top: `${y}px`,
                          zIndex: 15 + Math.round(item.depthNorm * 12)
                        }}
                      >
                        {/* Render Major Works (作曲年ポイント/点) along the lifespan */}
                        {composer.works.map(w => {
                          const workOffsetX = (w.year - composer.birthYear) * zoomScale;
                          return (
                            <div
                              key={w.id}
                              onClick={e => {
                                e.stopPropagation();
                                if (clickTimeoutRef.current) {
                                  clearTimeout(clickTimeoutRef.current);
                                  clickTimeoutRef.current = null;
                                  onSelectComposer(composer.id);
                                } else {
                                  clickTimeoutRef.current = setTimeout(() => {
                                    clickTimeoutRef.current = null;
                                    setFocusedEpisodeWork({ work: w, composer });
                                  }, 220);
                                }
                              }}
                              onDoubleClick={e => {
                                e.stopPropagation();
                                if (clickTimeoutRef.current) {
                                  clearTimeout(clickTimeoutRef.current);
                                  clickTimeoutRef.current = null;
                                }
                                onSelectComposer(composer.id);
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 group/work cursor-pointer"
                              style={{ left: `${workOffsetX}px` }}
                              title={`${w.year}年 作曲: ${w.title} (${w.city})\nシングルタップ: エピソード解説\nダブルタップ: 作曲家詳細`}
                            >
                              <div className="w-4 h-4 rounded-full bg-[#16120e] border-2 border-[#e6b95c] flex items-center justify-center text-[8px] font-bold text-[#e6b95c] group-hover/work:scale-150 transition-all shadow-lg ring-2 ring-[#c99738]/50">
                                ♪
                              </div>
                              {/* Hover Tooltip displaying composition title + year */}
                              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/work:flex flex-col bg-[#16120e]/95 border border-[#c99738] rounded-lg p-2.5 w-52 shadow-2xl backdrop-blur-md pointer-events-none z-50">
                                <span className="text-[11px] font-bold text-white truncate">{w.title}</span>
                                <span className="text-[10px] text-[#c99738] font-mono mt-0.5">{w.year}年 作曲 · {w.city}</span>
                                <span className="text-[8px] text-[#bdb1a1] mt-0.5">タップ: エピソード解説 / ダブルタップ: 名鑑</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Render Historical Milestones */}
                        {composer.milestones?.map((m, mIdx) => {
                          const mOffsetX = (m.year - composer.birthYear) * zoomScale;
                          return (
                            <div
                              key={mIdx}
                              onClick={e => {
                                e.stopPropagation();
                                onSelectComposer(composer.id);
                              }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 group/mile cursor-pointer"
                              style={{ left: `${mOffsetX}px` }}
                              title={`${m.year}年: ${m.event}`}
                            >
                              <div className="w-2.5 h-2.5 rounded-full bg-white/90 border border-[#16120e] hover:bg-[#c99738] hover:scale-150 transition-all shadow-sm" />
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden group-hover/mile:flex flex-col bg-[#16120e]/95 border border-[#382f25] rounded-lg p-2 w-48 shadow-2xl backdrop-blur-md pointer-events-none z-50">
                                <span className="text-[11px] font-bold text-[#c99738]">{m.year}年:</span>
                                <span className="text-[10px] text-[#e8dec8] leading-tight">{m.event}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* ========================================================
              MODE 2: PANORAMA DETAIL TIMELINE (パノラマ詳細年表)
             ======================================================== */}
          {viewStyle === 'panorama' && (
            <div className="absolute inset-x-0 top-0">
              {panoramaBars.map(({ composer, birthX, width, row }) => {
                const era = getEraById(composer.era);
                const isAlive = composer.birthYear <= focalYear && focalYear <= composer.deathYear;

                return (
                  <div
                    key={composer.id}
                    className="absolute flex items-center group/pano"
                    onMouseEnter={e => hoverCardRef.current?.show(composer.id, focalYear, e.clientX, e.clientY)}
                    onMouseMove={e => hoverCardRef.current?.move(e.clientX, e.clientY)}
                    onMouseLeave={() => hoverCardRef.current?.hide()}
                    style={{
                      left: `${birthX}px`,
                      width: `${width}px`,
                      top: `${PANO_TOP + row * PANO_ROW_HEIGHT}px`,
                      height: `${PANO_ROW_HEIGHT - 6}px`
                    }}
                  >
                    {/* Ribbon Bar */}
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        onSelectComposer(composer.id);
                      }}
                      className={`absolute inset-0 rounded-lg cursor-pointer flex items-center pl-1 pr-3 border transition-all hover:brightness-125 shadow-md ${
                        isAlive ? 'border-white/60' : 'border-white/15'
                      }`}
                      style={{
                        background:
                          colorBy === 'country'
                            ? `linear-gradient(90deg, ${countryColor(countryOf(composer))}, ${countryColor(countryOf(composer))}bb)`
                            : `linear-gradient(90deg, ${era.color}, ${era.accentColor})`,
                        opacity: isAlive ? 1 : 0.8
                      }}
                      title={`${composer.name} (${composer.birthYear}〜${composer.deathYear})`}
                    >
                      {!compactRows && <ComposerPortrait composer={composer} size="xs" className="shrink-0 mr-2" />}
                      <span className={`${compactRows ? 'text-[10px] leading-none pl-1' : 'text-[12px]'} font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate`}>
                        {width >= 560 ? composer.name : composer.shortName}
                      </span>
                      {width >= 290 && (
                        <span className="text-xs font-mono text-white/85 pl-2 shrink-0 font-semibold drop-shadow">
                          {composer.birthYear}年〜
                        </span>
                      )}
                      {width >= 290 && (
                        <span className="text-xs font-mono text-white/85 ml-auto pl-3 shrink-0 font-semibold drop-shadow">
                          〜{composer.deathYear}年
                        </span>
                      )}
                    </div>

                    {/* Composition Dots on the bar's lower edge (kept clear of the name) */}
                    {composer.works.map(w => {
                      const workOffsetX = (w.year - composer.birthYear) * zoomScale;
                      return (
                        <div
                          key={w.id}
                          onClick={e => {
                            e.stopPropagation();
                            setFocusedEpisodeWork({ work: w, composer });
                          }}
                          className={`absolute ${compactRows ? '-bottom-1' : '-bottom-2'} -translate-x-1/2 cursor-pointer z-20 group/panodot`}
                          style={{ left: `${workOffsetX}px` }}
                          title={`${w.year}年: ${w.title}（タップで解説）`}
                        >
                          <div className={`${compactRows ? 'w-2 h-2' : 'w-4 h-4 text-[9px]'} rounded-full bg-[#120e0b] border border-[#f0d48d] text-[#f0d48d] font-bold flex items-center justify-center hover:scale-150 transition-transform shadow-md`}>
                            {!compactRows && '♪'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

        {/* その年のできごと（音楽＋世界）。小さく半透明で、年表の下に重ねる */}
        <YearEventsOverlay
          year={focalYear}
          visibleComposerIds={visibleComposerIds}
          onSelectComposer={onSelectComposerWithYear}
          onOpenWork={(work, composer) => setFocusedEpisodeWork({ work, composer })}
          onJumpToYear={animateToYear}
        />
      </div>

      <ComposerHoverCard ref={hoverCardRef} />

      {openPeriod && (
        <PeriodModal
          period={openPeriod}
          onClose={() => setOpenPeriod(null)}
          onOpenComposer={id => onSelectComposerWithYear(id, focalYear)}
        />
      )}

      {/* Partial Episode Modal (Single-Tap Action on composition points) */}
      {focusedEpisodeWork && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setFocusedEpisodeWork(null)}
        >
          <div
            className="bg-[#181512] border border-[#c99738] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[#f5ebd9] space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#2e261e] pb-3">
              <div className="flex items-center gap-3">
                <ComposerPortrait composer={focusedEpisodeWork.composer} size="sm" />
                <div>
                  <span className="text-[11px] text-[#c99738] font-bold">
                    {focusedEpisodeWork.composer.name}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {focusedEpisodeWork.work.title}
                  </h3>
                  <p className="text-xs text-[#b5aa9b] font-mono">
                    {focusedEpisodeWork.work.originalTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFocusedEpisodeWork(null)}
                className="text-[#b5aa9b] hover:text-white p-1 rounded-full text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Quick Metadata Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#c99738] border border-[#c99738]/40 font-mono font-bold">
                作曲年: {focusedEpisodeWork.work.year}年
              </span>
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#c99738] border border-[#c99738]/40 font-mono">
                生没年: {focusedEpisodeWork.composer.birthYear}〜{focusedEpisodeWork.composer.deathYear}年 (享年{focusedEpisodeWork.composer.deathYear - focusedEpisodeWork.composer.birthYear}歳)
              </span>
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#e8dec8] border border-[#382e23]">
                作曲都市: {focusedEpisodeWork.work.city}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#e8dec8] border border-[#382e23]">
                ジャンル: {focusedEpisodeWork.work.genreJa}
              </span>
            </div>

            {/* Audio Snippet Preview */}
            {hasAudio(focusedEpisodeWork.work) ? (
            <div className="bg-[#110f0d] p-3 rounded-lg border border-[#2e251c] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playTrack(focusedEpisodeWork.work, focusedEpisodeWork.composer)}
                  className="w-8 h-8 rounded-full bg-[#c99738] text-black flex items-center justify-center font-bold shadow hover:bg-[#e6b95c] transition-colors"
                >
                  {isPlaying && currentTrack?.work.id === focusedEpisodeWork.work.id ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <div className="text-xs">
                  <span className="font-bold text-[#f5ebd9] block">試聴・フレーズ再生</span>
                  <span className="text-[11px] text-[#b5aa9b]">Web Audio API リアルタイムシンセ</span>
                </div>
              </div>
            </div>
            ) : null}

            {/* Detailed Episode Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                作品誕生のエピソード・時代背景
              </h4>
              <p className="text-xs text-[#d1c6b6] leading-relaxed bg-[#110f0d] p-3 rounded-lg border border-[#241e17]">
                {focusedEpisodeWork.work.description}
              </p>
              {getWorkTrivia(focusedEpisodeWork.composer.id, focusedEpisodeWork.work) && (
                <p className="text-xs text-[#d9cfbd] leading-relaxed bg-[#241e17] p-3 rounded-lg border border-[#3a2f20]">
                  <span className="font-bold text-[#e6b95c] mr-1">蘊蓄</span>
                  {getWorkTrivia(focusedEpisodeWork.composer.id, focusedEpisodeWork.work)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFocusedEpisodeWork(null)}
                className="px-4 py-2 rounded text-xs text-[#b5aa9b] hover:text-[#f5ebd9] transition-colors"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  const compId = focusedEpisodeWork.composer.id;
                  setFocusedEpisodeWork(null);
                  onSelectComposer(compId);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c99738] text-black font-bold text-xs hover:bg-[#dbaa44] transition-all shadow-lg"
              >
                <span>作曲家「{focusedEpisodeWork.composer.shortName}」の全名鑑を開く</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
