import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Composer, EraId } from '../types';
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
  Eye,
  Sliders
} from 'lucide-react';

interface TimelineViewProps {
  onSelectComposer: (composerId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  // Timeline year limits
  const MIN_YEAR = 1650;
  const MAX_YEAR = 1960;
  const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

  // View modes: '3d-bundle' (3D立体回転・束ねスパイラル) | 'panorama' (クラシック俯瞰)
  const [viewStyle, setViewStyle] = useState<'3d-bundle' | 'panorama'>('3d-bundle');

  // Zoom scale: pixels per year
  const [zoomScale, setZoomScale] = useState(5.5); // default 5.5px per year
  const [rotationAngle, setRotationAngle] = useState(0); // 3D rotation in radians
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [focalYear, setFocalYear] = useState<number>(1787); // Center focal year
  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; initialAngle: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    initialAngle: 0
  });

  // Filter composers
  const filteredComposers = useMemo(() => {
    return COMPOSERS.filter(c => {
      if (selectedEra !== 'all' && c.era !== selectedEra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q) || c.originalName.toLowerCase().includes(q);
        const matchesWork = c.works.some(w => w.title.toLowerCase().includes(q));
        if (!matchesName && !matchesWork) return false;
      }
      return true;
    }).sort((a, b) => a.birthYear - b.birthYear);
  }, [selectedEra, searchQuery]);

  // Total canvas width
  const timelineWidth = TOTAL_YEARS * zoomScale;
  const horizontalPadding = 400; // padding on each side so center needle can reach 1650 and 1950

  // Update focal year from container scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, clientWidth } = containerRef.current;
    const centerPixel = scrollLeft + clientWidth / 2 - horizontalPadding;
    const computedYear = Math.round(MIN_YEAR + centerPixel / zoomScale);
    const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, computedYear));
    setFocalYear(clampedYear);

    // Dynamic rotation coupling with horizontal scroll:
    // As you scroll along the years, the bundle slightly twists/revolves in 3D!
    if (viewStyle === '3d-bundle' && !isDraggingRef.current) {
      setRotationAngle(prev => (scrollLeft * 0.0018) % (Math.PI * 2));
    }
  }, [zoomScale, horizontalPadding, viewStyle]);

  // Jump to specific composer birth year with smooth animation
  const scrollToYear = useCallback((targetYear: number) => {
    if (!containerRef.current) return;
    const clientWidth = containerRef.current.clientWidth;
    const targetPixel = (targetYear - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
    containerRef.current.scrollTo({
      left: Math.max(0, targetPixel),
      behavior: 'smooth'
    });
  }, [zoomScale, horizontalPadding]);

  // Dragging to scroll / rotate in 3D
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if ((e.target as HTMLElement).closest('button, input, select, a')) return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.pageX,
      y: e.pageY,
      scrollLeft: containerRef.current.scrollLeft,
      initialAngle: rotationAngle
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();

    const dx = e.pageX - dragStartRef.current.x;
    const dy = e.pageY - dragStartRef.current.y;

    // Horizontal drag pans time
    containerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;

    // Vertical drag rotates the 3D cylindrical bundle!
    if (viewStyle === '3d-bundle') {
      const angleDelta = dy * 0.012;
      setRotationAngle(dragStartRef.current.initialAngle + angleDelta);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Auto rotation loop if active
  useEffect(() => {
    if (!isAutoRotating || viewStyle !== '3d-bundle') return;
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 0.02) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating, viewStyle]);

  // Decade markings
  const decadeMarks = useMemo(() => {
    const marks: { year: number; x: number; isMajor: boolean }[] = [];
    for (let yr = 1650; yr <= 1950; yr += 10) {
      marks.push({
        year: yr,
        x: (yr - MIN_YEAR) * zoomScale + horizontalPadding,
        isMajor: yr % 50 === 0
      });
    }
    return marks;
  }, [zoomScale, horizontalPadding]);

  // Compute 3D cylinder positions for each composer
  const bundle3DData = useMemo(() => {
    const cylinderRadius = 150; // Radius of 3D bundle
    const count = filteredComposers.length;

    return filteredComposers.map((composer, idx) => {
      // Angular spacing around cylinder
      const baseAngle = (idx / count) * Math.PI * 2;
      const currentAngle = baseAngle + rotationAngle;

      const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const deathX = (composer.deathYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const width = deathX - birthX;

      // 3D coordinates on cylinder surface
      // Y is vertical offset from center (240px)
      // Z is depth (-radius to +radius)
      const centerY = 240;
      const y = centerY + Math.sin(currentAngle) * cylinderRadius;
      const z = Math.cos(currentAngle) * cylinderRadius; // > 0 is front, < 0 is back

      // Normalized depth for lighting and opacity
      const depthNorm = (z + cylinderRadius) / (cylinderRadius * 2); // 0 (back) to 1 (front)
      const opacity = 0.25 + depthNorm * 0.75;
      const strokeThickness = Math.max(5, 7 + depthNorm * 11);
      const isForeground = z > 0;

      // Proximity to current focal year (for birth year magnification gimmick!)
      const yearDiff = Math.abs(focalYear - composer.birthYear);
      const isProximityActive = yearDiff <= 22; // within 22 years of birth year!
      // Proximity factor 0 to 1
      const proximity = isProximityActive ? Math.max(0, 1 - yearDiff / 22) : 0;
      // Scale from 1.0 up to 2.2!
      const bubbleScale = 1.0 + proximity * 1.25;

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
        yearDiff,
        isProximityActive,
        proximity,
        bubbleScale
      };
    }).sort((a, b) => a.z - b.z); // Render background strands first, foreground last!
  }, [filteredComposers, rotationAngle, zoomScale, horizontalPadding, focalYear]);

  // Quick jump icons for top historical figures
  const iconicComposers = [
    { id: 'bach', name: 'バッハ', year: 1685 },
    { id: 'vivaldi', name: 'ヴィヴァルディ', year: 1678 },
    { id: 'mozart', name: 'モーツァルト', year: 1756 },
    { id: 'beethoven', name: 'ベートーヴェン', year: 1770 },
    { id: 'chopin', name: 'ショパン', year: 1810 },
    { id: 'liszt', name: 'リスト', year: 1811 },
    { id: 'tchaikovsky', name: 'チャイコフスキー', year: 1840 },
    { id: 'debussy', name: 'ドビュッシー', year: 1862 },
    { id: 'stravinsky', name: 'ストラヴィンスキー', year: 1882 }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] select-none bg-[#100e0c]">
      {/* Top Toolbar: View Switcher, 3D Rotation Controls & Search */}
      <div className="bg-[#181512] border-b border-[#2e2924] px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30">
        {/* Left: View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#241f19] border border-[#3d362e] rounded-lg p-0.5">
            <button
              onClick={() => setViewStyle('3d-bundle')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                viewStyle === '3d-bundle'
                  ? 'bg-[#c99738] text-[#121110] shadow-sm'
                  : 'text-[#9c9388] hover:text-[#f5ebd9]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D立体束ね回転年表</span>
            </button>
            <button
              onClick={() => setViewStyle('panorama')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                viewStyle === 'panorama'
                  ? 'bg-[#c99738] text-[#121110] shadow-sm'
                  : 'text-[#9c9388] hover:text-[#f5ebd9]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>パノラマ比較年表</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9c9388] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="作曲家や作品を検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#241f19] border border-[#3d362e] rounded px-2.5 py-1.5 pl-8 text-xs text-[#f5ebd9] placeholder-[#7d7366] focus:outline-none focus:border-[#c99738] w-40 md:w-52"
            />
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1.5 bg-[#241f19] border border-[#3d362e] rounded px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#c99738]" />
            <select
              value={selectedEra}
              onChange={e => setSelectedEra(e.target.value as EraId | 'all')}
              className="bg-transparent text-[#f5ebd9] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1e1b18]">全ての時代 ({COMPOSERS.length})</option>
              {ERAS.map(era => (
                <option key={era.id} value={era.id} className="bg-[#1e1b18]">
                  {era.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: 3D Rotation Knob, Zoom & Year Cursor */}
        <div className="flex items-center gap-3">
          {/* Focal Year Readout */}
          <div className="hidden sm:flex items-center gap-2 bg-[#221c17] border border-[#383025] px-3 py-1 rounded">
            <span className="text-[10px] text-[#7d7366]">視点中心:</span>
            <span className="text-xs font-mono font-bold text-[#c99738]">{focalYear}年</span>
          </div>

          {/* 3D Bundle Angle Controls (Visible in 3D mode) */}
          {viewStyle === '3d-bundle' && (
            <div className="flex items-center gap-2 bg-[#241f19] border border-[#3d362e] rounded px-2.5 py-1 text-xs">
              <Sliders className="w-3 h-3 text-[#c99738]" />
              <span className="text-[10px] text-[#9c9388] hidden md:inline">3D立体アングル:</span>
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.05"
                value={rotationAngle}
                onChange={e => setRotationAngle(parseFloat(e.target.value))}
                className="w-16 md:w-20 h-1.5 bg-[#141210] accent-[#c99738] rounded cursor-pointer"
                title="上下ドラッグでも3D回転可能"
              />
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                  isAutoRotating ? 'bg-[#c99738] text-black font-bold' : 'text-[#9c9388] hover:text-white'
                }`}
                title="自動3D回転"
              >
                {isAutoRotating ? '回転停止' : '自動回転'}
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#241f19] border border-[#3d362e] rounded p-0.5">
            <button
              onClick={() => setZoomScale(prev => Math.max(2.8, prev - 0.8))}
              className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="縮小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-[#c99738] px-1">
              {Math.round((zoomScale / 5.5) * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(14, prev + 0.8))}
              className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="拡大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(5.5)}
              className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="リセット"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Bar: Composer Birth Year Shortcuts */}
      <div className="bg-[#141210] border-b border-[#241f19] px-4 md:px-8 py-1.5 flex items-center gap-2 overflow-x-auto text-[11px] scrollbar-none z-20">
        <span className="text-[#7d7366] text-[10px] shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#c99738]" />
          生誕年へジャンプ:
        </span>
        {iconicComposers.map(item => {
          const isCurrentFocal = Math.abs(focalYear - item.year) <= 8;
          return (
            <button
              key={item.id}
              onClick={() => scrollToYear(item.year)}
              className={`px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isCurrentFocal
                  ? 'bg-[#c99738] border-[#e6b95c] text-[#121110] font-bold shadow-md scale-105'
                  : 'bg-[#1b1814] border-[#302820] text-[#a39888] hover:text-[#f5ebd9] hover:border-[#c99738]/50'
              }`}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[9px] opacity-80">({item.year}年)</span>
            </button>
          );
        })}
      </div>

      {/* Main Timeline View Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 overflow-x-auto overflow-y-auto timeline-grab relative bg-[#100e0c]"
      >
        <div
          className="relative min-h-[520px] h-full"
          style={{ width: `${timelineWidth + horizontalPadding * 2}px` }}
        >
          {/* Central Focal Year Needle Indicator (Center Crosshair) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${(focalYear - MIN_YEAR) * zoomScale + horizontalPadding}px`
            }}
          >
            {/* Glowing Golden Needle Head */}
            <div className="bg-[#c99738] text-[#121110] font-mono text-[11px] font-bold px-2 py-0.5 rounded-b shadow-lg flex items-center gap-1">
              <span>▼</span>
              <span>{focalYear}年</span>
            </div>
            {/* Illuminated Center Line */}
            <div className="w-[2px] flex-1 bg-gradient-to-b from-[#c99738] via-[#e6b95c]/60 to-transparent shadow-[0_0_8px_#c99738]" />
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
                    className="p-3 text-xs font-classical-serif font-bold tracking-widest uppercase opacity-80"
                    style={{ color: era.color }}
                  >
                    {era.nameEn} ({era.startYear}〜{era.endYear})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Year Ruler Header */}
          <div className="sticky top-0 z-20 bg-[#141210]/95 backdrop-blur-md border-b border-[#2e2924] h-10 flex items-center shadow-md">
            {decadeMarks.map(mark => (
              <div
                key={mark.year}
                className="absolute top-0 bottom-0 flex flex-col justify-end pb-1"
                style={{ left: `${mark.x}px` }}
              >
                <div
                  className={`w-[1px] ${
                    mark.isMajor ? 'h-4 bg-[#c99738]' : 'h-2 bg-[#423a30]'
                  }`}
                />
                <span
                  className={`text-[10px] font-mono -translate-x-1/2 ${
                    mark.isMajor ? 'text-[#f5ebd9] font-bold' : 'text-[#7d7366]'
                  }`}
                >
                  {mark.year}
                </span>
              </div>
            ))}
          </div>

          {/* Vertical Time Grid Lines */}
          <div className="absolute top-10 bottom-0 inset-x-0 pointer-events-none">
            {decadeMarks.map(mark => (
              <div
                key={`grid-${mark.year}`}
                className={`absolute top-0 bottom-0 w-[1px] ${
                  mark.isMajor ? 'bg-[#241f19]' : 'bg-[#161310]'
                }`}
                style={{ left: `${mark.x}px` }}
              />
            ))}
          </div>

          {/* ========================================================
              MODE 1: 3D CYLINDRICAL TWISTED BUNDLE (立体束ね回転年表)
             ======================================================== */}
          {viewStyle === '3d-bundle' && (
            <div className="relative pt-6 pb-20 h-[480px]">
              {/* Central Cylindrical Core Glow Axis */}
              <div
                className="absolute left-0 right-0 top-[240px] h-1 pointer-events-none bg-gradient-to-r from-transparent via-[#c99738]/20 to-transparent"
                style={{
                  boxShadow: '0 0 30px rgba(201, 151, 56, 0.15)'
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
                  z,
                  opacity,
                  strokeThickness,
                  isForeground,
                  isProximityActive,
                  proximity,
                  bubbleScale
                } = item;

                const era = getEraById(composer.era);
                const isSelected = selectedComposer?.id === composer.id;

                return (
                  <React.Fragment key={composer.id}>
                    {/* The 3D Volumetric Lifespan Strand / Ribbon */}
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className={`absolute rounded-full cursor-pointer transition-all duration-150 flex items-center group/strand ${
                        isForeground ? 'hover:brightness-125' : 'hover:opacity-90'
                      }`}
                      style={{
                        left: `${birthX}px`,
                        top: `${y - strokeThickness / 2}px`,
                        width: `${Math.max(48, width)}px`,
                        height: `${strokeThickness}px`,
                        opacity: opacity,
                        zIndex: isForeground ? 10 + Math.round(item.depthNorm * 10) : 2,
                        background: `linear-gradient(180deg, ${era.accentColor}dd, ${era.color}ee, #100e0c)`,
                        boxShadow: isForeground
                          ? `0 2px 8px ${era.color}55, 0 0 12px ${era.color}33`
                          : 'none'
                      }}
                      title={`${composer.name} (${composer.birthYear}〜${composer.deathYear})`}
                    >
                      {/* Composer Label directly on strand (if wide enough) */}
                      {width > 120 && isForeground && (
                        <span className="text-[10px] font-semibold text-white drop-shadow-md px-2 truncate">
                          {composer.shortName}
                        </span>
                      )}
                    </div>

                    {/* ========================================================
                        BIRTH YEAR PROXIMITY MAGNIFICATION GIMMICK (肖像画の吹き出し)
                       ======================================================== */}
                    <div
                      className={`absolute -translate-x-1/2 transition-transform duration-200 pointer-events-auto ${
                        isProximityActive ? 'z-40' : 'z-10'
                      }`}
                      style={{
                        left: `${birthX}px`,
                        top: `${y}px`,
                        transform: `translate(-50%, -50%) scale(${bubbleScale})`,
                        transformOrigin: 'bottom center'
                      }}
                    >
                      {isProximityActive ? (
                        /* EXPANDED MAGNIFIED SPEECH BUBBLE (生まれ年に接近した時の大迫力吹き出し！) */
                        <div
                          onClick={() => onSelectComposer(composer.id)}
                          className="relative flex flex-col items-center group/bubble cursor-pointer -translate-y-12"
                        >
                          {/* Floating Speech Bubble Card */}
                          <div
                            className="bg-[#1a1714]/95 border-2 rounded-xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md min-w-[210px] max-w-[250px] transition-all hover:brightness-110"
                            style={{
                              borderColor: era.accentColor,
                              boxShadow: `0 8px 24px rgba(0,0,0,0.8), 0 0 20px ${era.color}66`
                            }}
                          >
                            {/* Large Public Domain Portrait with glowing ring */}
                            <div className="relative shrink-0">
                              <ComposerPortrait
                                composer={composer}
                                size="md"
                                showOrnateBorder={true}
                                className="ring-2 ring-[#c99738]"
                              />
                              <div className="absolute -bottom-1 -right-1 bg-[#121110] border border-[#c99738] rounded-full p-0.5 text-[10px]">
                                {composer.flag}
                              </div>
                            </div>

                            {/* Speech Bubble Information */}
                            <div className="min-w-0 flex-1 text-left">
                              <div className="flex items-center gap-1">
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.2 rounded text-white"
                                  style={{ backgroundColor: era.color }}
                                >
                                  {composer.birthYear}年 誕生！
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-[#f5ebd9] truncate mt-0.5 group-hover/bubble:text-[#c99738] transition-colors">
                                {composer.shortName}
                              </h4>
                              <p className="text-[10px] text-[#9c9388] truncate font-serif italic">
                                {composer.originalName}
                              </p>

                              {/* Quick 1-click play representative work */}
                              {composer.works[0] && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    playTrack(composer.works[0], composer);
                                  }}
                                  className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#c99738] hover:text-[#fff] px-2 py-0.5 rounded bg-[#27211a] hover:bg-[#382f24] border border-[#c99738]/40 transition-colors"
                                  title="名曲を試聴"
                                >
                                  <Play className="w-2.5 h-2.5 fill-current" />
                                  <span className="truncate max-w-[100px]">{composer.works[0].title}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Speech Bubble Pointer Tail (吹き出しの三角の尖先) */}
                          <div
                            className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px]"
                            style={{ borderTopColor: era.accentColor }}
                          />

                          {/* Birth Coordinate Glowing Beacon on Strand */}
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 border-white animate-pulse"
                            style={{ backgroundColor: era.color }}
                          />
                        </div>
                      ) : (
                        /* COMPACT RESTING MEDALLION on Strand */
                        <button
                          onClick={() => onSelectComposer(composer.id)}
                          className="relative p-0.5 rounded-full bg-[#161412] border border-[#3d362e] hover:border-[#c99738] hover:scale-125 transition-all shadow group/node"
                          title={`${composer.name} 生誕 (${composer.birthYear}年)`}
                        >
                          <ComposerPortrait composer={composer} size="sm" showOrnateBorder={false} />
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* ========================================================
              MODE 2: PANORAMA FLAT VIEW (クラシック俯瞰年表)
             ======================================================== */}
          {viewStyle === 'panorama' && (
            <div className="relative pt-6 pb-24 divide-y divide-[#1e1b18]">
              {filteredComposers.map((composer, idx) => {
                const era = getEraById(composer.era);
                const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
                const width = (composer.deathYear - composer.birthYear) * zoomScale;
                const age = composer.deathYear - composer.birthYear;

                const yearDiff = Math.abs(focalYear - composer.birthYear);
                const isProximityActive = yearDiff <= 20;
                const bubbleScale = isProximityActive ? 1.0 + (1 - yearDiff / 20) * 0.9 : 1.0;

                return (
                  <div
                    key={composer.id}
                    className="flex items-center h-16 hover:bg-[#161412] transition-colors relative group"
                  >
                    {/* Strand line */}
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className="absolute h-8 rounded-lg cursor-pointer transition-all hover:brightness-110 flex items-center px-3 shadow"
                      style={{
                        left: `${birthX}px`,
                        width: `${Math.max(48, width)}px`,
                        backgroundColor: era.color,
                        background: `linear-gradient(90deg, ${era.color}ee, ${era.color}bb)`
                      }}
                    >
                      <span className="text-xs font-semibold text-white drop-shadow truncate mr-2">
                        {composer.shortName} ({age}年)
                      </span>
                    </div>

                    {/* Magnified speech bubble near birth year */}
                    {isProximityActive && (
                      <div
                        className="absolute z-40 -translate-x-1/2 -translate-y-10 pointer-events-auto"
                        style={{
                          left: `${birthX}px`,
                          transform: `scale(${bubbleScale})`
                        }}
                      >
                        <div
                          onClick={() => onSelectComposer(composer.id)}
                          className="bg-[#1a1714] border-2 rounded-lg p-2 shadow-xl flex items-center gap-2 cursor-pointer"
                          style={{ borderColor: era.accentColor }}
                        >
                          <ComposerPortrait composer={composer} size="sm" />
                          <div className="text-left min-w-0">
                            <span className="text-[9px] font-bold text-[#c99738] block font-mono">
                              {composer.birthYear}年 誕生！
                            </span>
                            <span className="text-xs font-bold text-white truncate block">
                              {composer.shortName}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
