import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Composer, EraId } from '../types';
import { COMPOSERS } from '../data/composers';
import { ERAS, getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { useAudio } from '../context/AudioContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Play,
  RotateCcw,
  Search,
  Filter,
  Info
} from 'lucide-react';

interface TimelineViewProps {
  onSelectComposer: (composerId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack } = useAudio();

  // Timeline coordinate space
  const MIN_YEAR = 1650;
  const MAX_YEAR = 1960;
  const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

  // Zoom scale: pixels per year
  const [zoomScale, setZoomScale] = useState(4.2); // default 4.2px per year => ~1300px base
  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [hoveredComposer, setHoveredComposer] = useState<Composer | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const initialTouchDistRef = useRef<number | null>(null);

  // Filter composers
  const filteredComposers = useMemo(() => {
    return COMPOSERS.filter(c => {
      if (selectedEra !== 'all' && c.era !== selectedEra) return false;
      if (selectedCountry !== 'all' && !c.country.includes(selectedCountry)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q) || c.originalName.toLowerCase().includes(q);
        const matchesWork = c.works.some(w => w.title.toLowerCase().includes(q) || w.originalTitle.toLowerCase().includes(q));
        if (!matchesName && !matchesWork) return false;
      }
      return true;
    }).sort((a, b) => a.birthYear - b.birthYear);
  }, [selectedEra, selectedCountry, searchQuery]);

  // Countries for filter dropdown
  const countries = useMemo(() => {
    const list = Array.from(new Set(COMPOSERS.map(c => c.nationalityJa.split(' / ')[0])));
    return list;
  }, []);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoomScale(prev => {
      const next = Math.max(2.2, Math.min(12, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleResetZoom = () => {
    setZoomScale(4.2);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  };

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Don't drag if clicking buttons or interactive elements
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Pinch-to-zoom on touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialTouchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / initialTouchDistRef.current;
      if (Math.abs(ratio - 1) > 0.05) {
        setZoomScale(prev => {
          const next = prev * (ratio > 1 ? 1.04 : 0.96);
          return Math.max(2.2, Math.min(12, next));
        });
        initialTouchDistRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    initialTouchDistRef.current = null;
  };

  // Wheel zoom with Ctrl or Alt, or standard horizontal wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.4 : -0.4;
        setZoomScale(prev => Math.max(2.2, Math.min(12, prev + zoomDelta)));
      } else if (Math.abs(e.deltaX) < Math.abs(e.deltaY) && !e.shiftKey) {
        // Horizontal scroll with wheel
        el.scrollLeft += e.deltaY * 0.7;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const timelineWidth = TOTAL_YEARS * zoomScale;
  const leftPadding = 260; // composer label column width

  // Generate decade marks (1650, 1660, 1670, ... 1950)
  const decadeMarks = useMemo(() => {
    const marks: { year: number; x: number; isMajor: boolean }[] = [];
    for (let yr = 1650; yr <= 1950; yr += 10) {
      marks.push({
        year: yr,
        x: (yr - MIN_YEAR) * zoomScale,
        isMajor: yr % 50 === 0
      });
    }
    return marks;
  }, [zoomScale]);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] select-none">
      {/* Top Filter and Zoom Toolbar */}
      <div className="bg-[#191613] border-b border-[#2e2924] px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9c9388] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="作曲家や楽曲を検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#241f19] border border-[#3d362e] rounded px-2.5 py-1.5 pl-8 text-xs text-[#f5ebd9] placeholder-[#7d7366] focus:outline-none focus:border-[#c99738] w-44 md:w-56"
            />
          </div>

          {/* Era Select */}
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
                  {era.name} ({era.startYear}〜{era.endYear})
                </option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div className="hidden sm:flex items-center gap-1.5 bg-[#241f19] border border-[#3d362e] rounded px-2 py-1 text-xs">
            <span className="text-[#9c9388]">国:</span>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="bg-transparent text-[#f5ebd9] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1e1b18]">全ての国</option>
              {countries.map(c => (
                <option key={c} value={c} className="bg-[#1e1b18]">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Era Legend & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Era color dots legend */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-[#9c9388]">
            {ERAS.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEra(selectedEra === e.id ? 'all' : e.id)}
                className={`flex items-center gap-1.5 transition-opacity ${
                  selectedEra === 'all' || selectedEra === e.id ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                <span>{e.name.replace('音楽', '')}</span>
              </button>
            ))}
          </div>

          {/* Zoom buttons */}
          <div className="flex items-center gap-1 bg-[#241f19] border border-[#3d362e] rounded p-0.5">
            <button
              onClick={() => handleZoom(-0.8)}
              className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="縮小 (ズームアウト)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-[#c99738] px-1.5">
              {Math.round((zoomScale / 4.2) * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.8)}
              className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors"
              title="拡大 (ズームイン)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#302a22] rounded transition-colors ml-0.5"
              title="縮尺リセット"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Timeline Canvas / Scroller */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 overflow-x-auto overflow-y-auto timeline-grab relative bg-[#121110]"
      >
        <div
          className="relative min-h-full pb-28"
          style={{ width: `${timelineWidth + leftPadding + 100}px` }}
        >
          {/* Era Background Shading Bands */}
          <div className="absolute inset-y-0 left-[260px] pointer-events-none opacity-20">
            {ERAS.map(era => {
              const startX = Math.max(0, (era.startYear - MIN_YEAR) * zoomScale);
              const width = (era.endYear - era.startYear) * zoomScale;
              return (
                <div
                  key={era.id}
                  className="absolute top-0 bottom-0 border-l border-r border-[#ffffff0a]"
                  style={{
                    left: `${startX}px`,
                    width: `${width}px`,
                    backgroundColor: era.bgLight
                  }}
                >
                  <div
                    className="p-2 text-xs font-classical-serif font-bold tracking-widest uppercase opacity-70"
                    style={{ color: era.color }}
                  >
                    {era.nameEn} ({era.startYear} - {era.endYear})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Year Ruler Header */}
          <div className="sticky top-0 z-20 bg-[#161412]/95 backdrop-blur-md border-b border-[#2e2924] flex items-center h-12 shadow-md">
            {/* Left corner spacer */}
            <div className="w-[260px] shrink-0 px-4 flex items-center justify-between border-r border-[#2e2924] text-xs font-medium text-[#9c9388]">
              <span>作曲家 / 生涯</span>
              <span className="text-[10px] text-[#7d7366]">生年順</span>
            </div>

            {/* Decade markings bar */}
            <div className="relative flex-1 h-full">
              {decadeMarks.map(mark => (
                <div
                  key={mark.year}
                  className="absolute top-0 bottom-0 flex flex-col justify-end pb-1.5"
                  style={{ left: `${mark.x}px` }}
                >
                  <div
                    className={`w-[1px] ${
                      mark.isMajor ? 'h-5 bg-[#c99738]/60' : 'h-3 bg-[#423a30]'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono mt-0.5 -translate-x-1/2 ${
                      mark.isMajor
                        ? 'text-[#f5ebd9] font-bold'
                        : 'text-[#7d7366]'
                    }`}
                  >
                    {mark.year}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Grid Lines across rows */}
          <div className="absolute top-12 bottom-0 left-[260px] pointer-events-none">
            {decadeMarks.map(mark => (
              <div
                key={`grid-${mark.year}`}
                className={`absolute top-0 bottom-0 w-[1px] ${
                  mark.isMajor ? 'bg-[#2a241c]' : 'bg-[#1b1814]'
                }`}
                style={{ left: `${mark.x}px` }}
              />
            ))}
          </div>

          {/* Composers Rows */}
          <div className="relative divide-y divide-[#1e1b18]">
            {filteredComposers.map((composer, idx) => {
              const era = getEraById(composer.era);
              const barLeft = Math.max(0, (composer.birthYear - MIN_YEAR) * zoomScale);
              const barWidth = Math.max(48, (composer.deathYear - composer.birthYear) * zoomScale);
              const age = composer.deathYear - composer.birthYear;

              return (
                <div
                  key={composer.id}
                  onMouseEnter={() => setHoveredComposer(composer)}
                  onMouseLeave={() => setHoveredComposer(null)}
                  className={`flex items-center h-20 transition-colors group relative ${
                    hoveredComposer?.id === composer.id ? 'bg-[#1a1714]' : 'hover:bg-[#161412]'
                  }`}
                >
                  {/* Left Column: Composer Info Card */}
                  <div className="w-[260px] shrink-0 px-4 flex items-center justify-between border-r border-[#241f19] bg-[#141210]/90 z-10 h-full">
                    <button
                      onClick={() => onSelectComposer(composer.id)}
                      className="flex items-center gap-3 text-left min-w-0 group/info hover:opacity-90"
                    >
                      <ComposerPortrait
                        composer={composer}
                        size="sm"
                        showOrnateBorder={true}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#f5ebd9] truncate group-hover/info:text-[#c99738] transition-colors">
                            {composer.shortName}
                          </p>
                          <span className="text-xs">{composer.flag}</span>
                        </div>
                        <p className="text-[10px] text-[#9c9388] font-mono tabular-nums truncate">
                          {composer.birthYear} - {composer.deathYear} ({age}歳)
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => onSelectComposer(composer.id)}
                      className="p-1 text-[#7d7366] hover:text-[#c99738] transition-colors rounded"
                      title="詳細・経歴を見る"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right: Lifespan Bar & Work Markers */}
                  <div className="relative flex-1 h-full flex items-center">
                    {/* The Lifespan Bar */}
                    <div
                      onClick={() => onSelectComposer(composer.id)}
                      className="absolute h-9 rounded-md cursor-pointer transition-all hover:brightness-110 shadow-sm flex items-center px-3 group/bar overflow-visible"
                      style={{
                        left: `${barLeft}px`,
                        width: `${barWidth}px`,
                        backgroundColor: era.color,
                        background: `linear-gradient(90deg, ${era.color}ee, ${era.color}bb)`
                      }}
                    >
                      {/* Inner Name Label if bar is wide enough */}
                      <span className="text-xs font-semibold text-white drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                        {composer.shortName} ({age}年)
                      </span>

                      {/* Quick Play First Work Button */}
                      {composer.works[0] && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            playTrack(composer.works[0], composer);
                          }}
                          className="ml-auto w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center shrink-0 transition-transform hover:scale-110"
                          title={`代表曲再生: ${composer.works[0].title}`}
                        >
                          <Play className="w-3 h-3 fill-current translate-x-0.5" />
                        </button>
                      )}

                      {/* Work Pinpoints along the lifespan bar */}
                      {composer.works.map(work => {
                        const workOffset = Math.max(0, (work.year - composer.birthYear) * zoomScale);
                        const isCurrentWork = currentTrack?.work.id === work.id;

                        return (
                          <div
                            key={work.id}
                            onClick={e => {
                              e.stopPropagation();
                              playTrack(work, composer);
                            }}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group/pin cursor-pointer z-10"
                            style={{ left: `${workOffset}px` }}
                            title={`${work.year}年: ${work.title} (${work.city})`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#121110] transition-transform group-hover/pin:scale-125 ${
                                isCurrentWork
                                  ? 'bg-white text-black ring-2 ring-[#c99738]'
                                  : 'bg-[#181512] text-[#f5ebd9] hover:bg-[#c99738]'
                              }`}
                            >
                              <span className="text-[8px] font-bold">♪</span>
                            </div>

                            {/* Floating Work Label Card on Hover */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/pin:flex flex-col bg-[#1c1916] border border-[#3d362e] rounded shadow-xl p-2 w-48 pointer-events-none z-30">
                              <span className="text-[11px] font-bold text-[#f5ebd9] leading-tight">
                                {work.title}
                              </span>
                              <span className="text-[10px] text-[#c99738] mt-0.5">
                                {work.year}年 · {work.city}で作曲
                              </span>
                              <span className="text-[9px] text-[#9c9388] mt-1 line-clamp-2">
                                {work.description}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
