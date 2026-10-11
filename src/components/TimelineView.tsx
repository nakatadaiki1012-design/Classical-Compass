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
  ChevronLeft,
  Maximize2
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

  // User adjustable cylinder radius (default 165px for a broad, readable 3D bundle!)
  const [cylinderRadius, setCylinderRadius] = useState<number>(165);

  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [focalYear, setFocalYear] = useState<number>(1787);

  // Partial episode modal for single-tap on composition points
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

  // Handle Dragging / Swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.pageX, y: e.pageY, time: performance.now() };
    velocityRef.current = { vx: 0, vy: 0 };
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
    const centerY = 230; // Center offset for expanded 500px container
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
      // Prominent, thick 3D ribbons (16px to 38px thick!)
      const strokeThickness = Math.max(16, 18 + depthNorm * 20);
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
  }, [filteredComposers, rotationAngle, zoomScale, horizontalPadding, focalYear, cylinderRadius]);

  // Generate fine-grained year ticks
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
    <div className="flex flex-col h-[calc(100vh-130px)] select-none bg-[#090807] overflow-hidden font-sans">
      {/* Top Controls Toolbar */}
      <div className="bg-[#14100c]/95 backdrop-blur-xl border-b border-[#302519] px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30 shrink-0 shadow-lg">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#1e1711] border border-[#3d3021] rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => setViewStyle('3d-bundle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewStyle === '3d-bundle'
                  ? 'bg-gradient-to-r from-[#c99738] via-[#e6b95c] to-[#9e7220] text-black shadow-md'
                  : 'text-[#a89b8c] hover:text-[#f5ebd9]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D立体束ね年表</span>
            </button>
            <button
              onClick={() => setViewStyle('panorama')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewStyle === 'panorama'
                  ? 'bg-gradient-to-r from-[#c99738] via-[#e6b95c] to-[#9e7220] text-black shadow-md'
                  : 'text-[#a89b8c] hover:text-[#f5ebd9]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>パノラマ詳細年表</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#a89b8c] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="作曲家・名曲・エピソード検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#1e1711] border border-[#3d3021] rounded-lg px-3 py-1.5 pl-8 text-xs text-[#f5ebd9] placeholder-[#807262] focus:outline-none focus:border-[#c99738] w-44 md:w-52 shadow-inner"
            />
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1.5 bg-[#1e1711] border border-[#3d3021] rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#c99738]" />
            <select
              value={selectedEra}
              onChange={e => setSelectedEra(e.target.value as EraId | 'all')}
              className="bg-transparent text-[#f5ebd9] focus:outline-none cursor-pointer text-xs font-medium"
            >
              <option value="all" className="bg-[#1a140f]">全時代 ({COMPOSERS.length}名)</option>
              {ERAS.map(era => (
                <option key={era.id} value={era.id} className="bg-[#1a140f]">
                  {era.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Focal Year Readout */}
          <div className="flex items-center gap-2 bg-[#1e1711] border border-[#3d3021] px-3 py-1.5 rounded-lg text-xs shadow-inner">
            <span className="text-[10px] text-[#807262] uppercase tracking-wider font-semibold">中心焦点:</span>
            <span className="font-mono font-bold text-[#c99738] text-sm">{focalYear}年</span>
          </div>

          {/* 3D Bundle Controls */}
          {viewStyle === '3d-bundle' && (
            <div className="flex items-center gap-2 bg-[#1e1711] border border-[#3d3021] rounded-lg px-2.5 py-1 text-xs">
              <span className="text-[10px] text-[#c99738] font-bold flex items-center gap-1">
                <Maximize2 className="w-3 h-3" />
                筒サイズ:
              </span>
              <input
                type="range"
                min="100"
                max="260"
                step="5"
                value={cylinderRadius}
                onChange={e => setCylinderRadius(parseInt(e.target.value))}
                className="w-20 h-1.5 bg-[#0e0b08] accent-[#c99738] rounded cursor-pointer"
                title="3D筒の直径を拡大・縮小（作曲家間の距離を広げます）"
              />
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all shadow ${
                  isAutoRotating ? 'bg-[#c99738] text-black' : 'text-[#a89b8c] hover:text-white bg-[#2b2118]'
                }`}
              >
                {isAutoRotating ? '回転停止' : '自動回転'}
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#1e1711] border border-[#3d3021] rounded-lg p-1">
            <button
              onClick={() => setZoomScale(prev => Math.max(6.0, prev - 2.0))}
              className="p-1 text-[#a89b8c] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded transition-colors"
              title="年代を縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-[#c99738] px-1.5">
              {zoomScale.toFixed(0)}px/年
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(36.0, prev + 2.0))}
              className="p-1 text-[#a89b8c] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded transition-colors"
              title="年代を細かく拡大（横に長く）"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(12.0)}
              className="p-1 text-[#a89b8c] hover:text-[#f5ebd9] hover:bg-[#2c2218] rounded transition-colors"
              title="標準幅に戻す"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Bar */}
      <div className="bg-[#0f0c09] border-b border-[#241c13] px-4 md:px-6 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none shrink-0 z-20">
        <span className="text-[#807262] text-[10px] shrink-0 font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#c99738]" />
          主要作曲家へジャンプ:
        </span>
        {iconicComposers.map(item => {
          const isCurrentFocal = Math.abs(focalYear - item.year) <= 4;
          return (
            <button
              key={item.id}
              onClick={() => scrollToYear(item.year)}
              className={`px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-all flex items-center gap-1 text-[10px] ${
                isCurrentFocal
                  ? 'bg-gradient-to-r from-[#c99738] to-[#e6b95c] border-[#f0d48d] text-black font-extrabold shadow-md scale-105'
                  : 'bg-[#18130e] border-[#2e2317] text-[#b3a492] hover:text-[#f5ebd9] hover:border-[#c99738]/50'
              }`}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[9px] opacity-75">({item.year})</span>
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
        className="flex-1 overflow-x-auto overflow-y-hidden timeline-grab relative bg-[#0b0907]"
      >
        <div
          className="relative h-full min-h-[500px]"
          style={{ width: `${timelineTotalWidth + horizontalPadding * 2}px` }}
        >
          {/* Center Golden Focal Needle */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${(focalYear - MIN_YEAR) * zoomScale + horizontalPadding}px`
            }}
          >
            <div className="bg-gradient-to-b from-[#e6b95c] to-[#c99738] text-black font-mono text-[10px] font-extrabold px-2.5 py-0.5 rounded-b shadow-xl flex items-center gap-1 border-x border-b border-[#f0d48d]">
              <span>▼</span>
              <span>{focalYear}年</span>
            </div>
            <div className="w-[2px] flex-1 bg-gradient-to-b from-[#c99738] via-[#e6b95c]/60 to-transparent shadow-[0_0_12px_#c99738]" />
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
                      <span className="text-[8px] font-mono text-[#736353] -translate-x-1/2">
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
                      is50 ? 'h-4 bg-[#c99738]' : 'h-3 bg-[#5e4c3a]'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono -translate-x-1/2 ${
                      is50 ? 'text-[#f5ebd9] font-extrabold' : 'text-[#9c8e7e]'
                    }`}
                  >
                    {t.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Vertical Fine Grid Lines across canvas */}
          <div className="absolute top-9 bottom-0 inset-x-0 pointer-events-none">
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
            <div className="relative pt-2 h-[520px]">
              {/* Central Glowing Core Line */}
              <div
                className="absolute left-0 right-0 top-[230px] h-[2px] pointer-events-none bg-gradient-to-r from-transparent via-[#c99738]/40 to-transparent"
                style={{
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
                        <span className="text-[10px] drop-shadow-md shrink-0">{composer.flag}</span>
                        <span className="text-[11px] font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate tracking-wide">
                          {composer.shortName}
                        </span>
                        {width > 120 && isForeground && (
                          <span className="text-[9px] font-mono text-white/80 font-semibold drop-shadow shrink-0 ml-auto">
                            {composer.birthYear}〜{composer.deathYear}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Works & Milestones Markers along the strand */}
                    {isForeground && (
                      <div
                        className="absolute pointer-events-auto"
                        style={{
                          left: `${birthX}px`,
                          top: `${y}px`,
                          zIndex: 15 + Math.round(item.depthNorm * 12)
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
                              <div className="w-4 h-4 rounded-full bg-[#16120e] border-2 border-[#c99738] flex items-center justify-center text-[8px] font-bold text-[#c99738] group-hover/work:scale-150 transition-all shadow-md">
                                ♪
                              </div>
                              {/* Hover Tooltip displaying composition title + year */}
                              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/work:flex flex-col bg-[#16120e]/95 border border-[#c99738] rounded-lg p-2.5 w-52 shadow-2xl backdrop-blur-md pointer-events-none z-50">
                                <span className="text-[11px] font-bold text-white truncate">{w.title}</span>
                                <span className="text-[9px] text-[#c99738] font-mono mt-0.5">{w.year}年 作曲 · {w.city}</span>
                                <span className="text-[8px] text-[#a89b8c] mt-0.5">タップ: 解説 / ダブルタップ: 詳細</span>
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
                              <div className="w-2.5 h-2.5 rounded-full bg-white/80 border border-[#16120e] hover:bg-[#c99738] hover:scale-150 transition-all shadow-sm" />
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden group-hover/mile:flex flex-col bg-[#16120e]/95 border border-[#382f25] rounded-lg p-2 w-48 shadow-2xl backdrop-blur-md pointer-events-none z-50">
                                <span className="text-[10px] font-bold text-[#c99738]">{m.year}年:</span>
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

              {/* Compact Proximity Balloon for Focal Composer */}
              {activeNearComposer && (
                <div
                  onClick={() => onSelectComposer(activeNearComposer.composer.id)}
                  className="absolute pointer-events-auto cursor-pointer z-50 transition-all duration-150 -translate-x-1/2 -translate-y-12"
                  style={{
                    left: `${activeNearComposer.x}px`,
                    top: `${Math.max(60, Math.min(380, activeNearComposer.y))}px`
                  }}
                >
                  <div
                    className="bg-[#18130e]/95 border-2 rounded-xl p-2.5 shadow-2xl flex items-center gap-3 backdrop-blur-md w-48 transition-all hover:scale-105"
                    style={{
                      borderColor: getEraById(activeNearComposer.composer.era).accentColor,
                      boxShadow: `0 6px 20px rgba(0,0,0,0.85), 0 0 16px ${getEraById(activeNearComposer.composer.era).color}66`
                    }}
                  >
                    <div className="relative shrink-0">
                      <ComposerPortrait
                        composer={activeNearComposer.composer}
                        size="sm"
                        showOrnateBorder={true}
                        className="ring-2 ring-[#c99738]"
                      />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <span
                        className="text-[8px] font-extrabold px-1.5 py-0.2 rounded text-black inline-block uppercase"
                        style={{ backgroundColor: getEraById(activeNearComposer.composer.era).accentColor }}
                      >
                        {activeNearComposer.composer.birthYear}年 誕生
                      </span>
                      <h4 className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                        {activeNearComposer.composer.shortName}
                      </h4>
                      {activeNearComposer.composer.works[0] && (
                        <div className="mt-1 flex items-center gap-1 text-[9px] text-[#c99738] px-1.5 py-0.5 rounded bg-[#241c14] border border-[#c99738]/30">
                          <span className="truncate max-w-[120px]">
                            代表作: {activeNearComposer.composer.works[0].title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] mx-auto"
                    style={{ borderTopColor: getEraById(activeNearComposer.composer.era).accentColor }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white mx-auto animate-ping"
                    style={{ backgroundColor: getEraById(activeNearComposer.composer.era).color }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              MODE 2: PANORAMA EXPANDED VIEW (パノラマ詳細年表)
             ======================================================== */}
          {viewStyle === 'panorama' && (
            <div className="relative pt-3 pb-16 divide-y divide-[#1f1811] overflow-y-auto max-h-[500px]">
              {filteredComposers.map(composer => {
                const era = getEraById(composer.era);
                const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
                const width = (composer.deathYear - composer.birthYear) * zoomScale;
                const age = composer.deathYear - composer.birthYear;

                return (
                  <div
                    key={composer.id}
                    className="flex items-center h-16 hover:bg-[#16110c] transition-colors relative group"
                  >
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className="absolute h-8 rounded-lg cursor-pointer transition-all hover:brightness-125 flex items-center px-2.5 shadow-md overflow-visible"
                      style={{
                        left: `${birthX}px`,
                        width: `${Math.max(48, width)}px`,
                        backgroundColor: era.color,
                        background: `linear-gradient(90deg, ${era.accentColor}, ${era.color})`
                      }}
                    >
                      <div className="flex items-center gap-2 mr-2 shrink-0">
                        <ComposerPortrait composer={composer} size="xs" />
                        <span className="text-xs font-bold text-white drop-shadow truncate">
                          {composer.shortName} ({age}歳)
                        </span>
                      </div>

                      {/* Milestones */}
                      {composer.milestones?.map((m, mIdx) => {
                        const mOffsetX = (m.year - composer.birthYear) * zoomScale;
                        return (
                          <div
                            key={mIdx}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/m cursor-pointer"
                            style={{ left: `${mOffsetX}px` }}
                            title={`${m.year}年: ${m.event}`}
                          >
                            <div className="w-2 h-2 rounded-full bg-white shadow-md hover:scale-150 transition-transform" />
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group/m:flex flex-col bg-[#16120e] border border-[#382f25] rounded-lg p-1.5 w-40 shadow-xl z-30 pointer-events-none">
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

      {/* Partial Episode & Composition Modal (Single-Tap Action) */}
      {focusedEpisodeWork && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setFocusedEpisodeWork(null)}
        >
          <div
            className="bg-[#18130e] border-2 border-[#c99738] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[#33281c] pb-4">
              <div className="flex items-center gap-3">
                <ComposerPortrait composer={focusedEpisodeWork.composer} size="md" showOrnateBorder={true} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#c99738]">
                      {focusedEpisodeWork.composer.name}
                    </span>
                    <span className="text-xs">{focusedEpisodeWork.composer.flag}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {focusedEpisodeWork.work.title}
                  </h3>
                  <p className="text-xs text-[#a89b8c] font-mono">
                    {focusedEpisodeWork.work.originalTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFocusedEpisodeWork(null)}
                className="text-[#a89b8c] hover:text-white p-1 rounded-full text-xl leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Metadata Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-[#261e16] text-[#c99738] border border-[#c99738]/40 font-mono font-bold">
                作曲年: {focusedEpisodeWork.work.year}年
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#261e16] text-[#e8dec8] border border-[#3d3021]">
                都市: {focusedEpisodeWork.work.city}
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#261e16] text-[#e8dec8] border border-[#3d3021]">
                ジャンル: {focusedEpisodeWork.work.genreJa}
              </span>
            </div>

            {/* Detailed Episode Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                楽曲・エピソードの解説
              </h4>
              <p className="text-xs text-[#d1c6b6] leading-relaxed bg-[#110e0b] p-4 rounded-xl border border-[#2b2118]">
                {focusedEpisodeWork.work.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#2b2118]">
              <span className="text-[11px] text-[#a89b8c]">
                ヒント: ポイントやStrandをダブルタップすると作曲家ページを開きます
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFocusedEpisodeWork(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#a89b8c] hover:text-[#f5ebd9] transition-colors"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    const compId = focusedEpisodeWork.composer.id;
                    setFocusedEpisodeWork(null);
                    onSelectComposer(compId);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c99738] via-[#e6b95c] to-[#9e7220] text-black font-extrabold text-xs hover:brightness-110 transition-all shadow-lg"
                >
                  <span>「{focusedEpisodeWork.composer.shortName}」の全人生ページを開く</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
