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
  Sliders
} from 'lucide-react';

interface TimelineViewProps {
  onSelectComposer: (composerId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  const MIN_YEAR = 1650;
  const MAX_YEAR = 1960;
  const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

  // View style: 3D bundle vs classic flat panorama
  const [viewStyle, setViewStyle] = useState<'3d-bundle' | 'panorama'>('3d-bundle');

  // Zoom scale (pixels per year)
  const [zoomScale, setZoomScale] = useState(4.8);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [focalYear, setFocalYear] = useState<number>(1787);
  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; scrollLeft: number; initialAngle: number }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    initialAngle: 0
  });

  const rafScrollRef = useRef<number | null>(null);
  const rotAngleRef = useRef(rotationAngle);
  rotAngleRef.current = rotationAngle;

  const horizontalPadding = 320; // padding on each side
  const timelineWidth = TOTAL_YEARS * zoomScale;

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

  // Jump to specific year smoothly
  const scrollToYear = useCallback((targetYear: number) => {
    if (!containerRef.current) return;
    const clientWidth = containerRef.current.clientWidth;
    const targetPixel = (targetYear - MIN_YEAR) * zoomScale + horizontalPadding - clientWidth / 2;
    containerRef.current.scrollTo({
      left: Math.max(0, targetPixel),
      behavior: 'smooth'
    });
  }, [zoomScale, horizontalPadding]);

  // High performance RAF scroll listener (eliminates stutter / カクカク)
  const handleScroll = useCallback(() => {
    if (rafScrollRef.current) return;

    rafScrollRef.current = requestAnimationFrame(() => {
      rafScrollRef.current = null;
      if (!containerRef.current) return;

      const { scrollLeft, clientWidth } = containerRef.current;
      const centerPixel = scrollLeft + clientWidth / 2 - horizontalPadding;
      const computedYear = Math.round(MIN_YEAR + centerPixel / zoomScale);
      const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, computedYear));

      setFocalYear(clampedYear);

      // Subtle 3D rotation coupling
      if (viewStyle === '3d-bundle' && !isDraggingRef.current) {
        setRotationAngle(prev => (scrollLeft * 0.0012) % (Math.PI * 2));
      }
    });
  }, [zoomScale, horizontalPadding, viewStyle]);

  // Dragging to scroll / rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if ((e.target as HTMLElement).closest('button, input, select, a')) return;

    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.pageX,
      y: e.pageY,
      scrollLeft: containerRef.current.scrollLeft,
      initialAngle: rotAngleRef.current
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();

    const dx = e.pageX - dragStartRef.current.x;
    const dy = e.pageY - dragStartRef.current.y;

    containerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;

    if (viewStyle === '3d-bundle') {
      const angleDelta = dy * 0.01;
      setRotationAngle(dragStartRef.current.initialAngle + angleDelta);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Auto rotation loop
  useEffect(() => {
    if (!isAutoRotating || viewStyle !== '3d-bundle') return;
    let animId: number;
    const loop = () => {
      setRotationAngle(prev => (prev + 0.015) % (Math.PI * 2));
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating, viewStyle]);

  // Compute 3D cylinder positions (Radius ~85px, CenterY ~150px) to comfortably fit on screen
  const bundle3DData = useMemo(() => {
    const cylinderRadius = 82; // Compact radius so it fits neatly in viewport
    const centerY = 145; // Center Y inside 300px canvas height
    const count = filteredComposers.length;

    return filteredComposers.map((composer, idx) => {
      const baseAngle = (idx / Math.max(1, count)) * Math.PI * 2;
      const currentAngle = baseAngle + rotationAngle;

      const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const deathX = (composer.deathYear - MIN_YEAR) * zoomScale + horizontalPadding;
      const width = Math.max(36, deathX - birthX);

      const y = centerY + Math.sin(currentAngle) * cylinderRadius;
      const z = Math.cos(currentAngle) * cylinderRadius; // > 0 front, < 0 back

      const depthNorm = (z + cylinderRadius) / (cylinderRadius * 2);
      const opacity = 0.3 + depthNorm * 0.7;
      const strokeThickness = Math.max(5, 6 + depthNorm * 8); // compact 6px to 14px
      const isForeground = z > -15;

      // Proximity to current focal year: trigger blowout bubble when within 16 years
      const yearDiff = Math.abs(focalYear - composer.birthYear);
      const isProximityActive = yearDiff <= 16;
      const proximity = isProximityActive ? Math.max(0, 1 - yearDiff / 16) : 0;
      // Controlled, compact scale (1.0 to max 1.25, avoiding oversized overflow)
      const bubbleScale = 1.0 + proximity * 0.25;

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
    }).sort((a, b) => a.z - b.z); // Render background strands first
  }, [filteredComposers, rotationAngle, zoomScale, horizontalPadding, focalYear]);

  // Decade marks
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

  // Quick jump historical milestones
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
    <div className="flex flex-col h-[calc(100vh-130px)] select-none bg-[#100e0c] overflow-hidden">
      {/* Top Toolbar: View Switcher, 3D Rotation & Search (Compact 1-row) */}
      <div className="bg-[#181512] border-b border-[#2e2924] px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 z-30 shrink-0">
        {/* Left: View Mode Toggle & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#241f19] border border-[#3d362e] rounded-md p-0.5">
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
              <span>パノラマ年表</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9c9388] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="作曲家・作品検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#241f19] border border-[#3d362e] rounded px-2 py-1 pl-7 text-xs text-[#f5ebd9] placeholder-[#7d7366] focus:outline-none focus:border-[#c99738] w-36 md:w-44"
            />
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1 bg-[#241f19] border border-[#3d362e] rounded px-2 py-1 text-xs">
            <Filter className="w-3 h-3 text-[#c99738]" />
            <select
              value={selectedEra}
              onChange={e => setSelectedEra(e.target.value as EraId | 'all')}
              className="bg-transparent text-[#f5ebd9] focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-[#1e1b18]">全時代 ({COMPOSERS.length})</option>
              {ERAS.map(era => (
                <option key={era.id} value={era.id} className="bg-[#1e1b18]">
                  {era.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Controls & Center Year */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#221c17] border border-[#383025] px-2.5 py-1 rounded text-xs">
            <span className="text-[10px] text-[#7d7366]">中心視点:</span>
            <span className="font-mono font-bold text-[#c99738]">{focalYear}年</span>
          </div>

          {viewStyle === '3d-bundle' && (
            <div className="flex items-center gap-1.5 bg-[#241f19] border border-[#3d362e] rounded px-2 py-0.5 text-xs">
              <Sliders className="w-3 h-3 text-[#c99738]" />
              <input
                type="range"
                min="0"
                max={Math.PI * 2}
                step="0.05"
                value={rotationAngle}
                onChange={e => setRotationAngle(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#141210] accent-[#c99738] rounded cursor-pointer"
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

          {/* Zoom buttons */}
          <div className="flex items-center gap-0.5 bg-[#241f19] border border-[#3d362e] rounded p-0.5">
            <button
              onClick={() => setZoomScale(prev => Math.max(2.8, prev - 0.6))}
              className="p-1 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="縮小"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono text-[#c99738] px-1">
              {Math.round((zoomScale / 4.8) * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(prev => Math.min(12, prev + 0.6))}
              className="p-1 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="拡大"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomScale(4.8)}
              className="p-1 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="リセット"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Jump Bar: Composer Birth Year Shortcuts (Compact) */}
      <div className="bg-[#141210] border-b border-[#241f19] px-4 md:px-6 py-1 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none shrink-0 z-20">
        <span className="text-[#7d7366] text-[10px] shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#c99738]" />
          生誕年へ:
        </span>
        {iconicComposers.map(item => {
          const isCurrentFocal = Math.abs(focalYear - item.year) <= 8;
          return (
            <button
              key={item.id}
              onClick={() => scrollToYear(item.year)}
              className={`px-2 py-0.5 rounded-full border whitespace-nowrap transition-all flex items-center gap-1 text-[10px] ${
                isCurrentFocal
                  ? 'bg-[#c99738] border-[#e6b95c] text-[#121110] font-bold shadow'
                  : 'bg-[#1b1814] border-[#302820] text-[#a39888] hover:text-[#f5ebd9]'
              }`}
            >
              <span>{item.name}</span>
              <span className="font-mono text-[9px] opacity-80">({item.year})</span>
            </button>
          );
        })}
      </div>

      {/* Main Timeline View Area (No vertical scrollbars, fits viewport cleanly) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 overflow-x-auto overflow-y-hidden timeline-grab relative bg-[#100e0c]"
      >
        <div
          className="relative h-full min-h-[360px]"
          style={{ width: `${timelineWidth + horizontalPadding * 2}px` }}
        >
          {/* Central Focal Year Needle Indicator */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center"
            style={{
              left: `${(focalYear - MIN_YEAR) * zoomScale + horizontalPadding}px`
            }}
          >
            <div className="bg-[#c99738] text-[#121110] font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-b shadow-md flex items-center gap-0.5">
              <span>▼</span>
              <span>{focalYear}年</span>
            </div>
            <div className="w-[1.5px] flex-1 bg-gradient-to-b from-[#c99738] via-[#e6b95c]/50 to-transparent shadow-[0_0_6px_#c99738]" />
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
                    className="p-2 text-[10px] font-classical-serif font-bold tracking-widest uppercase opacity-75"
                    style={{ color: era.color }}
                  >
                    {era.nameEn} ({era.startYear}〜{era.endYear})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Year Ruler Header */}
          <div className="sticky top-0 z-20 bg-[#141210]/95 backdrop-blur-md border-b border-[#2e2924] h-8 flex items-center shadow-sm">
            {decadeMarks.map(mark => (
              <div
                key={mark.year}
                className="absolute top-0 bottom-0 flex flex-col justify-end pb-0.5"
                style={{ left: `${mark.x}px` }}
              >
                <div
                  className={`w-[1px] ${
                    mark.isMajor ? 'h-3 bg-[#c99738]' : 'h-1.5 bg-[#423a30]'
                  }`}
                />
                <span
                  className={`text-[9px] font-mono -translate-x-1/2 ${
                    mark.isMajor ? 'text-[#f5ebd9] font-bold' : 'text-[#7d7366]'
                  }`}
                >
                  {mark.year}
                </span>
              </div>
            ))}
          </div>

          {/* Vertical Time Grid Lines */}
          <div className="absolute top-8 bottom-0 inset-x-0 pointer-events-none">
            {decadeMarks.map(mark => (
              <div
                key={`grid-${mark.year}`}
                className={`absolute top-0 bottom-0 w-[1px] ${
                  mark.isMajor ? 'bg-[#241f19]' : 'bg-[#151210]'
                }`}
                style={{ left: `${mark.x}px` }}
              />
            ))}
          </div>

          {/* ========================================================
              MODE 1: 3D CYLINDRICAL TWISTED BUNDLE (コンパクト・滑らか立体)
             ======================================================== */}
          {viewStyle === '3d-bundle' && (
            <div className="relative pt-2 h-[310px]">
              {/* Central Glowing Core Line */}
              <div
                className="absolute left-0 right-0 top-[145px] h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-[#c99738]/25 to-transparent"
                style={{
                  boxShadow: '0 0 16px rgba(201, 151, 56, 0.15)'
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
                      {width > 90 && isForeground && (
                        <span className="text-[9px] font-semibold text-white drop-shadow px-2 truncate">
                          {composer.shortName}
                        </span>
                      )}
                    </div>

                    {/* ========================================================
                        COMPACT PROXIMITY SPEECH BUBBLE (画面に収まる上品な吹き出し)
                       ======================================================== */}
                    <div
                      className={`absolute -translate-x-1/2 transition-transform duration-150 pointer-events-auto ${
                        isProximityActive ? 'z-40' : 'z-10'
                      }`}
                      style={{
                        left: `${birthX}px`,
                        top: `${Math.max(48, Math.min(240, y))}px`,
                        transform: `translate(-50%, -50%) scale(${bubbleScale})`,
                        transformOrigin: 'bottom center'
                      }}
                    >
                      {isProximityActive ? (
                        /* ELEGANT COMPACT POPUP BUBBLE */
                        <div
                          onClick={() => onSelectComposer(composer.id)}
                          className="relative flex flex-col items-center group/bubble cursor-pointer -translate-y-8"
                        >
                          <div
                            className="bg-[#181512]/95 border rounded-lg p-2 shadow-xl flex items-center gap-2 backdrop-blur-md w-44 transition-all hover:brightness-110"
                            style={{
                              borderColor: era.accentColor,
                              boxShadow: `0 4px 14px rgba(0,0,0,0.8), 0 0 12px ${era.color}44`
                            }}
                          >
                            {/* Portrait */}
                            <div className="relative shrink-0">
                              <ComposerPortrait
                                composer={composer}
                                size="sm"
                                showOrnateBorder={true}
                                className="ring-1 ring-[#c99738]"
                              />
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1 text-left">
                              <span
                                className="text-[8px] font-bold px-1 py-0.2 rounded text-white inline-block"
                                style={{ backgroundColor: era.color }}
                              >
                                {composer.birthYear}年 誕生
                              </span>
                              <h4 className="text-[11px] font-bold text-[#f5ebd9] truncate leading-tight mt-0.5 group-hover/bubble:text-[#c99738]">
                                {composer.shortName}
                              </h4>
                              {composer.works[0] && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    playTrack(composer.works[0], composer);
                                  }}
                                  className="mt-1 flex items-center gap-1 text-[9px] text-[#c99738] hover:text-[#fff] px-1.5 py-0.5 rounded bg-[#241e17] border border-[#c99738]/30 transition-colors"
                                  title="試聴"
                                >
                                  <Play className="w-2 h-2 fill-current" />
                                  <span className="truncate max-w-[85px]">{composer.works[0].title}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Pointer Tail */}
                          <div
                            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px]"
                            style={{ borderTopColor: era.accentColor }}
                          />

                          {/* Birth Coordinate Dot on Strand */}
                          <div
                            className="w-2.5 h-2.5 rounded-full border border-white"
                            style={{ backgroundColor: era.color }}
                          />
                        </div>
                      ) : (
                        /* Compact quiet node */
                        <button
                          onClick={() => onSelectComposer(composer.id)}
                          className="w-4 h-4 rounded-full bg-[#181512] border border-[#3d362e] hover:border-[#c99738] hover:scale-125 transition-all flex items-center justify-center text-[7px] text-[#c99738] shadow"
                          title={`${composer.name} (${composer.birthYear}年)`}
                        >
                          ●
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* ========================================================
              MODE 2: PANORAMA FLAT VIEW (コンパクト俯瞰)
             ======================================================== */}
          {viewStyle === 'panorama' && (
            <div className="relative pt-2 pb-16 divide-y divide-[#1e1b18] overflow-y-auto max-h-[320px]">
              {filteredComposers.map(composer => {
                const era = getEraById(composer.era);
                const birthX = (composer.birthYear - MIN_YEAR) * zoomScale + horizontalPadding;
                const width = (composer.deathYear - composer.birthYear) * zoomScale;
                const age = composer.deathYear - composer.birthYear;

                const yearDiff = Math.abs(focalYear - composer.birthYear);
                const isProximityActive = yearDiff <= 16;

                return (
                  <div
                    key={composer.id}
                    className="flex items-center h-12 hover:bg-[#161412] transition-colors relative group"
                  >
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className="absolute h-6 rounded-md cursor-pointer transition-all hover:brightness-110 flex items-center px-2.5 shadow"
                      style={{
                        left: `${birthX}px`,
                        width: `${Math.max(36, width)}px`,
                        backgroundColor: era.color,
                        background: `linear-gradient(90deg, ${era.color}ee, ${era.color}bb)`
                      }}
                    >
                      <span className="text-[10px] font-semibold text-white drop-shadow truncate mr-1">
                        {composer.shortName} ({age}年)
                      </span>
                    </div>

                    {isProximityActive && (
                      <div
                        className="absolute z-40 -translate-x-1/2 -translate-y-6 pointer-events-auto"
                        style={{ left: `${birthX}px` }}
                      >
                        <div
                          onClick={() => onSelectComposer(composer.id)}
                          className="bg-[#1a1714] border rounded p-1 shadow-lg flex items-center gap-1.5 cursor-pointer"
                          style={{ borderColor: era.accentColor }}
                        >
                          <span className="text-[8px] font-bold text-[#c99738]">
                            {composer.birthYear}年
                          </span>
                          <span className="text-[10px] font-bold text-white truncate">
                            {composer.shortName}
                          </span>
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
