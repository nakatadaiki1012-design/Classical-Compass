import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Composer, Composition, EraId } from '../types';
import { COMPOSERS } from '../data/composers';
import { ERAS, getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { useAudio } from '../context/AudioContext';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Filter,
  Play,
  Pause,
  Sparkles,
  Compass,
  Layers,
  ChevronRight,
  Sliders,
  ChevronLeft
} from 'lucide-react';

interface TimelineViewProps {
  onSelectComposer: (composerId: string) => void;
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

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  const MIN_YEAR = 1300;
  const MAX_YEAR = 1990;
  const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

  // View style
  const [viewStyle, setViewStyle] = useState<'3d-bundle' | 'panorama'>('3d-bundle');

  // Zoom scale (pixels per year): increased to 12.0 by default, up to 35px/year for fine granularity!
  const [zoomScale, setZoomScale] = useState<number>(12.0);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true); // Auto-rotating active by default so 3D bundle visibly spins smoothly!
  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focalYear, setFocalYear] = useState<number>(1787);

  // Partial episode modal for single-tap on composition points
  const [focusedEpisodeWork, setFocusedEpisodeWork] = useState<{
    work: Composition;
    composer: Composer;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth scroll & dragging state with inertia
  const scrollPosRef = useRef<number>(0);
  const targetScrollPosRef = useRef<number>(0);
  const rotAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });

  const horizontalPadding = 500; // ample space so needle can reach 1650 and 1960
  const timelineTotalWidth = TOTAL_YEARS * zoomScale;

  // Filter composers
  const filteredComposers = useMemo(() => {
    return COMPOSERS.filter(c => {
      if (selectedEra !== 'all' && c.era !== selectedEra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q) || c.originalName.toLowerCase().includes(q);
        const matchesWork = c.works.some(w => w.title.toLowerCase().includes(q));
        const matchesMilestone = c.milestones?.some(m => m.event.toLowerCase().includes(q));
        if (!matchesName && !matchesWork && !matchesMilestone) return false;
      }
      return true;
    }).sort((a, b) => a.birthYear - b.birthYear);
  }, [selectedEra, searchQuery]);

  // Jump to specific year smoothly
  const scrollToYear = useCallback((targetYear: number) => {
    if (!containerRef.current) return;
    const clientWidth = containerRef.current.clientWidth;
    const targetPixel = (targetYear - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
    targetScrollPosRef.current = Math.max(0, targetPixel);
  }, [zoomScale, horizontalPadding]);

  // Initial center on 1787 (Mozart / Classical peak)
  useEffect(() => {
    if (containerRef.current) {
      const clientWidth = containerRef.current.clientWidth;
      const initialPixel = (1787 - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
      containerRef.current.scrollLeft = Math.max(0, initialPixel);
      scrollPosRef.current = initialPixel;
      targetScrollPosRef.current = initialPixel;
    }
  }, [zoomScale]);

  // Mouse wheel handling: horizontal smooth scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = e.deltaY < 0 ? 1.5 : -1.5;
        setZoomScale(prev => Math.max(6.0, Math.min(38.0, prev + delta)));
      } else {
        const scrollDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        targetScrollPosRef.current = Math.max(0, targetScrollPosRef.current + scrollDelta * 1.5);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Dragging event handlers with momentum
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select, a')) return;
    isDraggingRef.current = true;
    velocityRef.current = { vx: 0, vy: 0 };
    lastMousePosRef.current = { x: e.pageX, y: e.pageY, time: performance.now() };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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

  // Main 60fps Animation Loop (eliminates jitter / カクつき completely)
  useEffect(() => {
    let animId: number;
    const container = containerRef.current;

    const renderLoop = () => {
      // 1. Smooth lerp for scroll position (Inertia & Silkiness)
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

        // 3. 3D cylindrical twist & continuous rotation
        if (viewStyle === '3d-bundle') {
          if (isAutoRotating) {
            rotAngleRef.current += 0.018; // smooth auto-orbit rotation
            setRotationAngle(rotAngleRef.current);
          } else if (!isDraggingRef.current) {
            // subtle living drift so the bundle always feels 3D and dynamic
            rotAngleRef.current += 0.005;
            setRotationAngle(rotAngleRef.current);
          }
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [zoomScale, horizontalPadding, isAutoRotating, viewStyle]);

  // Compute 3D strand layout and active proximity bubbles
  const { bundle3DData, activeNearComposer } = useMemo<{
    bundle3DData: StrandItem[];
    activeNearComposer: ActiveNearItem | null;
  }>(() => {
    const cylinderRadius = 78; // compact radius so it fits comfortably within view
    const centerY = 135;
    const count = filteredComposers.length;

    let nearest: ActiveNearItem | null = null;

    const strands = filteredComposers.map((composer, idx) => {
      const baseAngle = (idx / Math.max(1, count)) * Math.PI * 2;
      const currentAngle = baseAngle + rotationAngle;

      const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const deathX = (composer.deathYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const width = Math.max(40, deathX - birthX);

      const y = centerY + Math.sin(currentAngle) * cylinderRadius;
      const z = Math.cos(currentAngle) * cylinderRadius;

      const depthNorm = (z + cylinderRadius) / (cylinderRadius * 2);
      const opacity = 0.28 + depthNorm * 0.72;
      const strokeThickness = Math.max(5, 6 + depthNorm * 8);
      const isForeground = z > -10;

      // Proximity check for focal balloon gimmick:
      // within 12 years of focal needle
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
  }, [filteredComposers, rotationAngle, zoomScale, horizontalPadding, focalYear]);

  // Generate fine-grained year marks:
  // - 1-year ticks
  // - 5-year medium ticks
  // - 10-year major decade ticks
  // - 50-year major era landmarks
  const yearTicks = useMemo(() => {
    const ticks: {
      year: number;
      x: number;
      type: 'major-50' | 'decade-10' | 'half-decade-5' | 'single-1';
      label?: string;
    }[] = [];

    for (let yr = 1300; yr <= 1990; yr++) {
      const x = (yr - MIN_YEAR) * zoomScale + horizontalPadding;

      if (yr % 50 === 0) {
        ticks.push({ year: yr, x, type: 'major-50', label: `${yr}` });
      } else if (yr % 10 === 0) {
        ticks.push({ year: yr, x, type: 'decade-10', label: `${yr}` });
      } else if (yr % 5 === 0) {
        ticks.push({ year: yr, x, type: 'half-decade-5', label: `${yr}` });
      } else if (zoomScale >= 14.0) {
        // Show 1-year fine ticks when zoomed in!
        ticks.push({ year: yr, x, type: 'single-1' });
      }
    }
    return ticks;
  }, [zoomScale, horizontalPadding]);

  // Quick jump historical milestones across 700 years
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
    <div className="flex flex-col h-[calc(100vh-130px)] select-none bg-[#0f0d0b] overflow-hidden">
      {/* Top Controls Toolbar (Compact, Elegant, Single-Row) */}
      <div className="bg-[#161311] border-b border-[#29221b] px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 z-30 shrink-0">
        {/* Left: View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#201a14] border border-[#332a21] rounded-md p-0.5">
            <button
              onClick={() => setViewStyle('3d-bundle')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                viewStyle === '3d-bundle'
                  ? 'bg-[#c99738] text-[#121110] shadow-sm'
                  : 'text-[#9c9388] hover:text-[#f5ebd9]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D立体束ね年表</span>
            </button>
            <button
              onClick={() => setViewStyle('panorama')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                viewStyle === 'panorama'
                  ? 'bg-[#c99738] text-[#121110] shadow-sm'
                  : 'text-[#9c9388] hover:text-[#f5ebd9]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>パノラマ詳細年表</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9c9388] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="作曲家・出来事・曲名検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#201a14] border border-[#332a21] rounded px-2 py-1 pl-7 text-xs text-[#f5ebd9] placeholder-[#7d7366] focus:outline-none focus:border-[#c99738] w-40 md:w-48"
            />
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1 bg-[#201a14] border border-[#332a21] rounded px-2 py-1 text-xs">
            <Filter className="w-3 h-3 text-[#c99738]" />
            <select
              value={selectedEra}
              onChange={e => setSelectedEra(e.target.value as EraId | 'all')}
              className="bg-transparent text-[#f5ebd9] focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#1a1612]">全時代 ({COMPOSERS.length})</option>
              {ERAS.map(era => (
                <option key={era.id} value={era.id} className="bg-[#1a1612]">
                  {era.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Center Year Readout, 3D Tilt & Horizontal Zoom Scale */}
        <div className="flex items-center gap-2.5">
          {/* Focal Year Readout */}
          <div className="flex items-center gap-1.5 bg-[#201a14] border border-[#332a21] px-2.5 py-1 rounded text-xs">
            <span className="text-[10px] text-[#7d7366]">視点:</span>
            <span className="font-mono font-bold text-[#c99738] text-sm">{focalYear}年</span>
          </div>

          {viewStyle === '3d-bundle' && (
            <div className="flex items-center gap-1.5 bg-[#201a14] border border-[#332a21] rounded px-2 py-0.5 text-xs">
              <Sliders className="w-3 h-3 text-[#c99738]" />
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.05"
                value={rotationAngle}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  rotAngleRef.current = val;
                  setRotationAngle(val);
                }}
                className="w-16 h-1 bg-[#12100d] accent-[#c99738] rounded cursor-pointer"
                title="3D回転アングル（上下ドラッグでも回転）"
              />
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  isAutoRotating ? 'bg-[#c99738] text-black font-bold' : 'text-[#9c9388] hover:text-white'
                }`}
              >
                {isAutoRotating ? '停止' : '自動回転'}
              </button>
            </div>
          )}

          {/* Granular Zoom Scale Controller (Fine/Wide) */}
          <div className="flex items-center gap-0.5 bg-[#201a14] border border-[#332a21] rounded p-0.5">
            <button
              onClick={() => setZoomScale(prev => Math.max(6.0, prev - 2.0))}
              className="p-1 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#2b231c] rounded transition-colors"
              title="年代を縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#c99738] px-1.5">
              {zoomScale.toFixed(0)}px/年
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(36.0, prev + 2.0))}
              className="p-1 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#2b231c] rounded transition-colors"
              title="年代を細かく拡大（横に長く）"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(12.0)}
              className="p-1 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#2b231c] rounded transition-colors"
              title="標準幅に戻す"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Bar: Composer Birth Year Shortcuts */}
      <div className="bg-[#12100d] border-b border-[#241e17] px-4 md:px-6 py-1 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0 z-20">
        <span className="text-[#7d7366] text-[10px] shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#c99738]" />
          生誕年へジャンプ:
        </span>
        {iconicComposers.map(item => {
          const isCurrentFocal = Math.abs(focalYear - item.year) <= 4;
          return (
            <button
              key={item.id}
              onClick={() => scrollToYear(item.year)}
              className={`px-2 py-0.5 rounded-full border whitespace-nowrap transition-all flex items-center gap-1 text-[10px] ${
                isCurrentFocal
                  ? 'bg-[#c99738] border-[#e6b95c] text-[#121110] font-bold shadow'
                  : 'bg-[#181410] border-[#2c241c] text-[#a39888] hover:text-[#f5ebd9]'
              }`}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[9px] opacity-80">({item.year})</span>
            </button>
          );
        })}
      </div>

      {/* Main Timeline View Canvas & Scroller Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 overflow-x-auto overflow-y-hidden timeline-grab relative bg-[#0d0b09]"
      >
        <div
          className="relative h-full min-h-[350px]"
          style={{ width: `${timelineTotalWidth + horizontalPadding * 2}px` }}
        >
          {/* Center Golden Focal Needle */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${(focalYear - MIN_YEAR) * zoomScale + horizontalPadding}px`
            }}
          >
            <div className="bg-[#c99738] text-[#121110] font-mono text-[10px] font-bold px-2 py-0.5 rounded-b shadow-lg flex items-center gap-1">
              <span>▼</span>
              <span>{focalYear}年</span>
            </div>
            <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#c99738] via-[#e6b95c]/60 to-transparent shadow-[0_0_8px_#c99738]" />
          </div>

          {/* Era Bands in Background */}
          <div className="absolute inset-y-0 pointer-events-none opacity-15">
            {ERAS.map(era => {
              const startX = (era.startYear - MIN_YEAR) * zoomScale + horizontalPadding;
              const width = (era.endYear - era.startYear) * zoomScale;
              return (
                <div
                  key={era.id}
                  className="absolute top-0 bottom-0 border-l border-r border-white/5"
                  style={{
                    left: `${startX}px`,
                    width: `${width}px`,
                    backgroundColor: era.bgLight
                  }}
                >
                  <div
                    className="p-2.5 text-[11px] font-classical-serif font-bold tracking-widest uppercase opacity-80"
                    style={{ color: era.color }}
                  >
                    {era.nameEn} ({era.startYear}〜{era.endYear})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fine-Grained Sticky Year Ruler Header */}
          <div className="sticky top-0 z-20 bg-[#12100d]/95 backdrop-blur-md border-b border-[#29221b] h-8 flex items-center shadow-sm">
            {yearTicks.map(t => {
              if (t.type === 'single-1') {
                return (
                  <div
                    key={`t-${t.year}`}
                    className="absolute bottom-0 h-1 w-[1px] bg-[#29221b]"
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
                    <div className="h-2 w-[1px] bg-[#3d3328]" />
                    {zoomScale >= 16.0 && (
                      <span className="text-[8px] font-mono text-[#665a4d] -translate-x-1/2">
                        {t.year}
                      </span>
                    )}
                  </div>
                );
              }

              const is50 = t.type === 'major-50';
              return (
                <div
                  key={`t-${t.year}`}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pb-0.5"
                  style={{ left: `${t.x}px` }}
                >
                  <div
                    className={`w-[1px] ${
                      is50 ? 'h-3.5 bg-[#c99738]' : 'h-2.5 bg-[#524434]'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono -translate-x-1/2 ${
                      is50 ? 'text-[#f5ebd9] font-bold' : 'text-[#8a7c6c]'
                    }`}
                  >
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Vertical Fine Grid Lines across canvas */}
          <div className="absolute top-8 bottom-0 inset-x-0 pointer-events-none">
            {yearTicks
              .filter(t => t.type === 'major-50' || t.type === 'decade-10')
              .map(t => (
                <div
                  key={`grid-${t.year}`}
                  className={`absolute top-0 bottom-0 w-[1px] ${
                    t.type === 'major-50' ? 'bg-[#211a14]' : 'bg-[#15110d]'
                  }`}
                  style={{ left: `${t.x}px` }}
                />
              ))}
          </div>

          {/* ========================================================
              MODE 1: 3D CYLINDRICAL TWISTED BUNDLE (細かく横に長い立体束)
             ======================================================== */}
          {viewStyle === '3d-bundle' && (
            <div className="relative pt-2 h-[290px]">
              {/* Central Glowing Core Line */}
              <div
                className="absolute left-0 right-0 top-[135px] h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-[#c99738]/25 to-transparent"
                style={{
                  boxShadow: '0 0 20px rgba(201, 151, 56, 0.2)'
                }}
              />

              {/* Render 3D Strands for each composer with Fine-Grained Milestones! */}
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
                    {/* The 3D Lifespan Ribbon */}
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className={`absolute rounded-full cursor-pointer transition-all duration-75 flex items-center will-change-transform ${
                        isForeground ? 'hover:brightness-125' : 'hover:opacity-90'
                      }`}
                      style={{
                        left: `${birthX}px`,
                        top: `${y - strokeThickness / 2}px`,
                        width: `${Math.max(36, width)}px`,
                        height: `${strokeThickness}px`,
                        opacity: opacity,
                        zIndex: isForeground ? 10 + Math.round(item.depthNorm * 10) : 2,
                        background: `linear-gradient(180deg, ${era.accentColor}ee, ${era.color}dd, #12100e)`,
                        boxShadow: isForeground
                          ? `0 1px 4px ${era.color}44, 0 0 8px ${era.color}22`
                          : 'none'
                      }}
                      title={`${composer.name} (${composer.birthYear}〜${composer.deathYear})`}
                    >
                      {/* Composer Short Name Label on Strand */}
                      {width > 80 && isForeground && (
                        <span className="text-[9px] font-semibold text-white drop-shadow px-2 truncate pointer-events-none">
                          {composer.shortName}
                        </span>
                      )}
                    </div>

                    {/* Fine-Grained Milestones & Composition Markers along the strand! */}
                    {isForeground && (
                      <div
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${birthX}px`,
                          top: `${y}px`,
                          zIndex: 15
                        }}
                      >
                        {/* Render Major Works along the years */}
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
                                  // Double click -> open full composer modal
                                  onSelectComposer(composer.id);
                                } else {
                                  clickTimeoutRef.current = setTimeout(() => {
                                    clickTimeoutRef.current = null;
                                    // Single click -> open partial episode modal
                                    setFocusedEpisodeWork({ work: w, composer });
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
                              className="absolute -translate-x-1/2 -translate-y-1/2 group/work cursor-pointer"
                              style={{ left: `${workOffsetX}px` }}
                              title={`${w.year}年 作曲: ${w.title} (${w.city})\nシングルタップ: エピソード解説\nダブルタップ: 作曲家詳細`}
                            >
                              <div className="w-3.5 h-3.5 rounded-full bg-[#161310] border border-[#c99738] flex items-center justify-center text-[7px] text-[#c99738] group-hover/work:scale-125 transition-transform shadow">
                                ♪
                              </div>
                              {/* Hover Tooltip displaying composition title + year */}
                              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover/work:flex flex-col bg-[#161310] border border-[#c99738] rounded-md p-2 w-48 shadow-2xl pointer-events-none z-50">
                                <span className="text-[10px] font-bold text-white truncate">{w.title}</span>
                                <span className="text-[9px] text-[#c99738] font-mono mt-0.5">{w.year}年 作曲 · {w.city}</span>
                                <span className="text-[8px] text-[#8a7e70] mt-0.5">タップ: 解説 / ダブルタップ: 詳細</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Render Fine-Grained Historical Milestones */}
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
                              <div className="w-2 h-2 rounded-full bg-white/70 hover:bg-[#c99738] hover:scale-150 transition-all shadow-sm" />
                              {/* Tooltip for Milestone */}
                              <div className="absolute top-3 left-1/2 -translate-x-1/2 hidden group-hover/mile:flex flex-col bg-[#161310] border border-[#382f25] rounded p-1.5 w-44 shadow-xl pointer-events-none z-50">
                                <span className="text-[9px] font-bold text-[#c99738]">{m.year}年:</span>
                                <span className="text-[9px] text-[#e8dec8] leading-tight">{m.event}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* ========================================================
                  COMPACT BIRTH MAGNIFICATION BALLOON (画面内に収まる吹き出し)
                 ======================================================== */}
              {activeNearComposer && (
                <div
                  onClick={() => onSelectComposer(activeNearComposer.composer.id)}
                  className="absolute pointer-events-auto cursor-pointer z-50 transition-all duration-150 -translate-x-1/2 -translate-y-10"
                  style={{
                    left: `${activeNearComposer.x}px`,
                    top: `${Math.max(48, Math.min(230, activeNearComposer.y))}px`
                  }}
                >
                  <div
                    className="bg-[#181512]/95 border rounded-lg p-2 shadow-2xl flex items-center gap-2.5 backdrop-blur-md w-44 transition-all hover:brightness-110"
                    style={{
                      borderColor: getEraById(activeNearComposer.composer.era).accentColor,
                      boxShadow: `0 4px 16px rgba(0,0,0,0.8), 0 0 14px ${getEraById(activeNearComposer.composer.era).color}55`
                    }}
                  >
                    {/* Local Downloaded Portrait */}
                    <div className="relative shrink-0">
                      <ComposerPortrait
                        composer={activeNearComposer.composer}
                        size="sm"
                        showOrnateBorder={true}
                        className="ring-1 ring-[#c99738]"
                      />
                    </div>

                    {/* Information */}
                    <div className="min-w-0 flex-1 text-left">
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.2 rounded text-white inline-block"
                        style={{ backgroundColor: getEraById(activeNearComposer.composer.era).color }}
                      >
                        {activeNearComposer.composer.birthYear}年 誕生
                      </span>
                      <h4 className="text-[11px] font-bold text-[#f5ebd9] truncate leading-tight mt-0.5">
                        {activeNearComposer.composer.shortName}
                      </h4>
                      {activeNearComposer.composer.works[0] && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-[#c99738] px-1.5 py-0.5 rounded bg-[#241e17] border border-[#c99738]/30">
                          <span className="truncate max-w-[110px]">
                            代表作: {activeNearComposer.composer.works[0].title} ({activeNearComposer.composer.works[0].year}年)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pointer Tail */}
                  <div
                    className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto"
                    style={{ borderTopColor: getEraById(activeNearComposer.composer.era).accentColor }}
                  />

                  {/* Beacon Dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full border border-white mx-auto animate-ping"
                    style={{ backgroundColor: getEraById(activeNearComposer.composer.era).color }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              MODE 2: PANORAMA EXPANDED VIEW (細かく横に長い詳細年表)
             ======================================================== */}
          {viewStyle === 'panorama' && (
            <div className="relative pt-2 pb-16 divide-y divide-[#1e1b18] overflow-y-auto max-h-[320px]">
              {filteredComposers.map(composer => {
                const era = getEraById(composer.era);
                const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
                const width = (composer.deathYear - composer.birthYear) * zoomScale;
                const age = composer.deathYear - composer.birthYear;

                return (
                  <div
                    key={composer.id}
                    className="flex items-center h-14 hover:bg-[#161310] transition-colors relative group"
                  >
                    {/* The Lifespan Bar */}
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className="absolute h-6 rounded-md cursor-pointer transition-all hover:brightness-110 flex items-center px-2 shadow overflow-visible"
                      style={{
                        left: `${birthX}px`,
                        width: `${Math.max(36, width)}px`,
                        backgroundColor: era.color,
                        background: `linear-gradient(90deg, ${era.color}ee, ${era.color}bb)`
                      }}
                    >
                      <span className="text-[10px] font-semibold text-white drop-shadow truncate mr-2">
                        {composer.shortName} ({age}年)
                      </span>

                      {/* Milestones on the bar */}
                      {composer.milestones?.map((m, mIdx) => {
                        const mOffsetX = (m.year - composer.birthYear) * zoomScale;
                        return (
                          <div
                            key={mIdx}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/m cursor-pointer"
                            style={{ left: `${mOffsetX}px` }}
                            title={`${m.year}年: ${m.event}`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm hover:scale-150 transition-transform" />
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden group/m:flex flex-col bg-[#161310] border border-[#382f25] rounded p-1 w-36 shadow-lg z-30 pointer-events-none">
                              <span className="text-[9px] font-bold text-[#c99738]">{m.year}年</span>
                              <span className="text-[8px] text-white leading-tight">{m.event}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Partial Episode & Composition Modal (Single-Tap Action on Timeline Nodes) */}
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
                  <p className="text-xs text-[#9c9388] font-mono">
                    {focusedEpisodeWork.work.originalTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFocusedEpisodeWork(null)}
                className="text-[#9c9388] hover:text-white p-1 rounded-full text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Quick Metadata Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#c99738] border border-[#c99738]/40 font-mono font-bold">
                作曲年: {focusedEpisodeWork.work.year}年
              </span>
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#e8dec8] border border-[#382e23]">
                作曲都市: {focusedEpisodeWork.work.city}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#e8dec8] border border-[#382e23]">
                ジャンル: {focusedEpisodeWork.work.genreJa}
              </span>
            </div>

            {/* Detailed Episode Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                楽曲・エピソードの解説
              </h4>
              <p className="text-xs text-[#d1c6b6] leading-relaxed bg-[#110f0d] p-3 rounded-lg border border-[#241e17]">
                {focusedEpisodeWork.work.description}
              </p>
            </div>

            {/* Actions: View Composer Full Page */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFocusedEpisodeWork(null)}
                className="px-4 py-2 rounded text-xs text-[#9c9388] hover:text-[#f5ebd9] transition-colors"
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
                <span>作曲家「{focusedEpisodeWork.composer.shortName}」の詳しいページを開く</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
