import React, { useState, useMemo, useEffect, useRef } from 'react';
import { COMPOSERS } from '../data/composers';
import { EUROPEAN_CITIES } from '../data/cities';
import { ERAS, getEraById } from '../data/eras';
import { EUROPE_COUNTRY_PATHS } from '../data/europePaths';
import { ComposerPortrait } from './ComposerPortrait';
import { useAudio } from '../context/AudioContext';
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
  UserCheck
} from 'lucide-react';
import { Composer, Composition } from '../types';

interface EuropeMapViewProps {
  onSelectComposer: (composerId: string) => void;
}

// Precise geographic projection for SVG [960 x 540]
const minLon = -11;
const maxLon = 42;
const minLat = 35;
const maxLat = 65;
const SVG_W = 960;
const SVG_H = 540;

const projectGeoToSvg = (lon: number, lat: number): [number, number] => {
  const clampedLat = Math.max(34, Math.min(66, lat));
  const clampedLon = Math.max(-12, Math.min(43, lon));
  const x = ((clampedLon - minLon) / (maxLon - minLon)) * SVG_W;
  const y = ((maxLat - clampedLat) / (maxLat - minLat)) * SVG_H;
  return [Math.round(x), Math.round(y)];
};

export const EuropeMapView: React.FC<EuropeMapViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();

  const [currentYear, setCurrentYear] = useState<number>(1787); // Default to Mozart's iconic year
  const [isPlayingTimeTravel, setIsPlayingTimeTravel] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [hoveredComposerId, setHoveredComposerId] = useState<string | null>(null);
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const episodeSectionRef = useRef<HTMLDivElement | null>(null);

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
          if (prev >= 1990) {
            setIsPlayingTimeTravel(false);
            return 1990;
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
    return ERAS.find(e => currentYear >= e.startYear && currentYear <= e.endYear) || ERAS[2];
  }, [currentYear]);

  // Active composers living in currentYear
  const activeComposers = useMemo(() => {
    return COMPOSERS.filter(c => currentYear >= c.birthYear && currentYear <= c.deathYear);
  }, [currentYear]);

  // Active composer map pins with accurate relocation city positioning & composed work labels
  const composerMapData = useMemo(() => {
    const pins: {
      composer: Composer;
      cityStay: Composer['cities'][0];
      x: number;
      y: number;
      cityNameJa: string;
      activeWorksInYear: Composition[];
    }[] = [];

    // Group active composers by city to prevent overlap
    const cityGroups: Record<string, Composer[]> = {};

    activeComposers.forEach(composer => {
      const currentStay = composer.cities.find(
        s => currentYear >= s.startYear && currentYear <= s.endYear
      ) || composer.cities[0];

      const cityNameKey = currentStay?.cityName.toLowerCase() || 'vienna';
      if (!cityGroups[cityNameKey]) cityGroups[cityNameKey] = [];
      cityGroups[cityNameKey].push(composer);
    });

    Object.entries(cityGroups).forEach(([cityNameKey, group]) => {
      const cityData = Object.values(EUROPEAN_CITIES).find(
        c => c.name.toLowerCase() === cityNameKey || c.id === cityNameKey
      ) || EUROPEAN_CITIES['vienna'];

      const [baseX, baseY] = projectGeoToSvg(cityData.coordinates[0], cityData.coordinates[1]);
      const groupSize = group.length;

      group.forEach((composer, index) => {
        let x = baseX;
        let y = baseY;

        if (groupSize > 1) {
          const angle = (index / groupSize) * Math.PI * 2 - Math.PI / 2;
          const radius = Math.min(32, 18 + groupSize * 4);
          x = baseX + Math.cos(angle) * radius;
          y = baseY + Math.sin(angle) * radius;
        }

        const currentStay = composer.cities.find(
          s => currentYear >= s.startYear && currentYear <= s.endYear
        ) || composer.cities[0];

        // Find works composed in or near currentYear (+/- 2 years)
        const activeWorksInYear = composer.works.filter(
          w => Math.abs(w.year - currentYear) <= 2
        );

        pins.push({
          composer,
          cityStay: currentStay,
          x: Math.round(x),
          y: Math.round(y),
          cityNameJa: currentStay?.cityNameJa || cityData.nameJa,
          activeWorksInYear
        });
      });
    });

    return pins;
  }, [activeComposers, currentYear]);

  // Composition Episodes list for currentYear
  const compositionEpisodes = useMemo(() => {
    const list: {
      composer: Composer;
      work: Composition;
      cityStay: Composer['cities'][0];
      cityNameJa: string;
      isExactYear: boolean;
    }[] = [];

    activeComposers.forEach(composer => {
      const currentStay = composer.cities.find(
        s => currentYear >= s.startYear && currentYear <= s.endYear
      ) || composer.cities[0];

      // Exact year compositions
      const exactWorks = composer.works.filter(w => w.year === currentYear);
      exactWorks.forEach(work => {
        list.push({
          composer,
          work,
          cityStay: currentStay,
          cityNameJa: currentStay?.cityNameJa || work.city,
          isExactYear: true
        });
      });

      // Nearby year compositions (+/- 2 years) if no exact match
      if (exactWorks.length === 0) {
        const nearbyWorks = composer.works.filter(w => Math.abs(w.year - currentYear) <= 2);
        nearbyWorks.forEach(work => {
          list.push({
            composer,
            work,
            cityStay: currentStay,
            cityNameJa: currentStay?.cityNameJa || work.city,
            isExactYear: false
          });
        });
      }
    });

    return list;
  }, [activeComposers, currentYear]);

  // Filtered episodes if a specific composer is selected on map
  const displayedEpisodes = useMemo(() => {
    if (selectedComposerId) {
      const filtered = compositionEpisodes.filter(e => e.composer.id === selectedComposerId);
      if (filtered.length > 0) return filtered;

      // Fallback: if no work in currentYear for selected composer, show all their works
      const comp = COMPOSERS.find(c => c.id === selectedComposerId);
      if (comp) {
        const currentStay = comp.cities.find(
          s => currentYear >= s.startYear && currentYear <= s.endYear
        ) || comp.cities[0];

        return comp.works.map(work => ({
          composer: comp,
          work,
          cityStay: currentStay,
          cityNameJa: currentStay?.cityNameJa || work.city,
          isExactYear: work.year === currentYear
        }));
      }
    }
    return compositionEpisodes;
  }, [compositionEpisodes, selectedComposerId, currentYear]);

  const handlePinClick = (composerId: string) => {
    if (selectedComposerId === composerId) {
      setSelectedComposerId(null); // Toggle off filter
    } else {
      setSelectedComposerId(composerId);
      // Scroll smoothly down to episode section
      if (episodeSectionRef.current) {
        episodeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121110] text-[#f5ebd9] select-none pb-12">
      {/* 1. Top Year Controller & Milestone Bar */}
      <div className="bg-[#191613] border-b border-[#2e2924] px-4 md:px-8 py-3.5 flex flex-col gap-3 shadow-lg sticky top-0 z-30 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Year & Era badge */}
          <div className="flex items-center gap-3">
            <span className="font-classical-display font-bold text-3xl md:text-4xl text-[#f5ebd9] tracking-wider font-mono">
              {currentYear}年
            </span>
            <div
              className="px-3 py-1 rounded-md text-xs font-bold text-white shadow-md flex items-center gap-1.5"
              style={{ backgroundColor: currentEra.color }}
            >
              <span>{currentEra.name}</span>
              <span className="opacity-80 text-[10px]">({currentEra.nameEn})</span>
            </div>
            <span className="text-xs text-[#9c9388] hidden sm:inline">
              存命の巨匠: <strong className="text-[#f5ebd9] font-mono">{activeComposers.length}名</strong>
            </span>
          </div>

          {/* Time Travel Auto Play & Speed Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlayingTimeTravel(!isPlayingTimeTravel)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/50 text-[#f5ebd9] text-xs font-bold transition-all shadow-md active:scale-95"
            >
              {isPlayingTimeTravel ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-[#c99738]" />
                  <span>年代進行を停止</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-[#c99738]" />
                  <span>年代を自動巡行</span>
                </>
              )}
            </button>

            <div className="flex items-center bg-[#241f19] border border-[#3d362e] rounded-lg p-0.5 text-[11px]">
              {[1, 2, 4].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-[#c99738] text-[#161412] font-bold'
                      : 'text-[#9c9388] hover:text-[#f5ebd9]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentYear(1787);
                setSelectedComposerId(null);
              }}
              className="p-2 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#241f19] rounded-lg transition-colors"
              title="1787年（モーツァルト絶頂期）へ戻る"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#8a7f70]">1300年</span>
          <input
            type="range"
            min={1300}
            max={1990}
            value={currentYear}
            onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
            className="flex-1 h-2 bg-[#2a241c] accent-[#c99738] rounded-lg cursor-pointer transition-all"
          />
          <span className="text-xs font-mono text-[#8a7f70]">1990年</span>
        </div>

        {/* Historical Milestone Shortcut Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-[#8a7f70] text-[10px] shrink-0 mr-1 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#c99738]" />
            歴史的画期:
          </span>
          {milestones.map(m => (
            <button
              key={m.year}
              onClick={() => {
                setCurrentYear(m.year);
                setSelectedComposerId(null);
              }}
              className={`px-2.5 py-1 rounded-md border whitespace-nowrap transition-all text-xs ${
                Math.abs(currentYear - m.year) <= 2
                  ? 'bg-[#c99738]/20 border-[#c99738] text-[#f5ebd9] font-bold'
                  : 'bg-[#1e1b18] border-[#332c24] text-[#9c9388] hover:text-[#f5ebd9]'
              }`}
            >
              {m.year}年: {m.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main SVG Europe Map Canvas (地図のほう: その年の作曲を表示) */}
      <div className="relative bg-[#0a0908] border-b border-[#2e2924] flex items-center justify-center p-2 md:p-4 overflow-hidden">
        <div className="w-full max-w-6xl relative">
          <svg
            viewBox="0 0 960 540"
            className="w-full h-auto max-h-[580px] object-contain drop-shadow-2xl select-none"
          >
            <defs>
              <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#181512" />
                <stop offset="100%" stopColor="#080706" />
              </radialGradient>

              <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Ocean / Background */}
            <rect width="960" height="540" fill="url(#oceanGlow)" />

            {/* Grid Lines */}
            <line x1="0" y1="135" x2="960" y2="135" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="0" y1="270" x2="960" y2="270" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="0" y1="405" x2="960" y2="405" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="240" y1="0" x2="240" y2="540" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="480" y1="0" x2="480" y2="540" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="720" y1="0" x2="720" y2="540" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />

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
                <g key={city.id} className="opacity-40 pointer-events-none">
                  <circle cx={cx} cy={cy} r="2.5" fill="#8c7e6d" />
                  <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#8c7e6d"
                    fontFamily="sans-serif"
                    fontWeight="500"
                  >
                    {city.nameJa}
                  </text>
                </g>
              );
            })}

            {/* MAP COMPOSER PINS WITH INTEGRATED COMPOSITION TAGS (その年の作曲を地図上に明記) */}
            {composerMapData.map(pin => {
              const { composer, cityStay, x, y, cityNameJa, activeWorksInYear } = pin;
              const era = getEraById(composer.era);
              const isSelected = selectedComposerId === composer.id;
              const isHovered = hoveredComposerId === composer.id;
              const topWork = activeWorksInYear[0];

              return (
                <g
                  key={composer.id}
                  onClick={() => handlePinClick(composer.id)}
                  onMouseEnter={() => setHoveredComposerId(composer.id)}
                  onMouseLeave={() => setHoveredComposerId(null)}
                  className="cursor-pointer group"
                  filter="url(#pinShadow)"
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

                  {/* ON-MAP COMPOSITION BADGE (地図上の作曲表示: クリーンで邪魔にならないタグ) */}
                  <g transform={`translate(${x}, ${y + 24})`}>
                    {topWork ? (
                      /* Highlighted composition tag if piece composed in/near currentYear */
                      <g>
                        <rect
                          x="-65"
                          y="0"
                          width="130"
                          height="20"
                          rx="10"
                          fill="#181410"
                          stroke={isSelected ? '#ffffff' : '#c99738'}
                          strokeWidth="1.2"
                          opacity="0.95"
                          className="shadow-lg"
                        />
                        <text
                          x="0"
                          y="13"
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {composer.shortName}: 『{topWork.title.length > 10 ? topWork.title.substring(0, 9) + '…' : topWork.title}』
                        </text>
                      </g>
                    ) : (
                      /* Regular city stay tag */
                      <g>
                        <rect
                          x="-45"
                          y="0"
                          width="90"
                          height="16"
                          rx="8"
                          fill="#14110e"
                          stroke={isSelected ? '#ffffff' : era.color}
                          strokeWidth="1"
                          opacity="0.85"
                        />
                        <text
                          x="0"
                          y="11"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill={isSelected ? '#ffffff' : '#f5ebd9'}
                        >
                          {composer.shortName} ({cityNameJa})
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Map Status Bar */}
          <div className="absolute bottom-3 left-3 bg-[#181512]/90 backdrop-blur-md border border-[#332c24] rounded-lg px-3 py-1.5 text-xs text-[#9c9388] flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#c99738] animate-ping" />
            <span>地図上のピンをタップすると、下の「作曲エピソード」が絞り込まれます</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Composition Episode Section (下には作曲のエピソードが出るように) */}
      <div
        ref={episodeSectionRef}
        className="max-w-6xl mx-auto w-full px-4 md:px-8 pt-8 space-y-6"
      >
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2e2820] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#c99738] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>{currentYear}年の欧州音楽史</span>
            </div>
            <h2 className="text-xl md:text-2xl font-classical-display font-bold text-[#f5ebd9] mt-1 flex items-center gap-2">
              <span>作曲のエピソード & 誕生秘話</span>
              <span className="text-xs font-mono font-normal text-[#9c9388] bg-[#241f19] px-2.5 py-0.5 rounded-full border border-[#382f25]">
                {displayedEpisodes.length}件のエピソード
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

        {/* Composition Episode Cards Grid */}
        {displayedEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedEpisodes.map(({ composer, work, cityStay, cityNameJa, isExactYear }) => {
              const era = getEraById(composer.era);
              const isCurrentPlaying = isPlaying && currentTrack?.work.id === work.id;

              return (
                <div
                  key={`${composer.id}-${work.id}`}
                  className="bg-[#181512] border border-[#332b22] hover:border-[#c99738]/80 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Top: Composer Identity & Location */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#29221b] pb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ComposerPortrait
                        composer={composer}
                        size="md"
                        showOrnateBorder={true}
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{composer.flag}</span>
                          <span className="text-xs font-bold text-[#f5ebd9] truncate">
                            {composer.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#9c9388] font-mono">
                          <span className="text-[#c99738] font-bold">
                            📍 {cityNameJa}
                          </span>
                          <span>·</span>
                          <span>{work.year}年 作曲</span>
                          {isExactYear && (
                            <span className="bg-[#c99738]/20 text-[#c99738] border border-[#c99738]/40 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              {currentYear}年 誕生!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Audio Play Button */}
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
                  </div>

                  {/* Work Title & Genre */}
                  <div>
                    <span className="text-[10px] font-mono text-[#c99738] font-bold uppercase tracking-wider block">
                      {work.genreJa} · {work.city}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-[#c99738] transition-colors">
                      『{work.title}』
                    </h3>
                    <p className="text-xs text-[#9c9388] font-mono">
                      {work.originalTitle}
                    </p>
                  </div>

                  {/* COMPOSITION EPISODE NARRATIVE (作曲のエピソード) */}
                  <div className="bg-[#110f0d] border border-[#272019] rounded-xl p-3.5 space-y-1.5">
                    <span className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{work.year}年 作曲エピソード & 背景</span>
                    </span>
                    <p className="text-xs text-[#d1c6b6] leading-relaxed">
                      {work.description}
                    </p>
                    {cityStay?.notableEvent && (
                      <p className="text-[11px] text-[#9c9388] border-t border-[#221c16] pt-1.5 mt-1.5 italic">
                        💡 当時の滞在エピソード: {cityStay.notableEvent}
                      </p>
                    )}
                  </div>

                  {/* Card Bottom Action: SEPARATE BUTTON TO OPEN COMPOSER PROFILE (作曲者自体の紹介は別ボタンで飛ぶようにして) */}
                  <div className="pt-2 border-t border-[#29221b] flex items-center justify-end">
                    <button
                      onClick={() => onSelectComposer(composer.id)}
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
            <p className="text-sm text-[#9c9388]">
              {currentYear}年における対象作曲家・作品のエピソードは登録されていません。
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
  );
};
