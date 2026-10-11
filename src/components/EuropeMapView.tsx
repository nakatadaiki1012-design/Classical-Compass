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
  Info,
  Calendar,
  Layers,
  MapPin,
  Volume2
} from 'lucide-react';
import { Composer, Composition } from '../types';

interface EuropeMapViewProps {
  onSelectComposer: (composerId: string) => void;
}

// Precise geographic projection for SVG [960 x 640]
// Matches the exact bounding box in europePaths.ts: lon [-11, 42], lat [35, 65]
const minLon = -11;
const maxLon = 42;
const minLat = 35;
const maxLat = 65;
const SVG_W = 960;
const SVG_H = 640;

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
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>('mozart');

  // Episode popup modal state
  const [focusedEpisodeWork, setFocusedEpisodeWork] = useState<{
    work: Composition;
    composer: Composer;
  } | null>(null);

  const timerRef = useRef<number | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      }, 500 / playbackSpeed);
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

  // Active composer map pins & episode popups
  // Takes into account composer city relocation: Mozart in Salzburg/Vienna/Prague, Chopin in Warsaw/Paris, etc.
  const composerMapData = useMemo(() => {
    const pins: {
      composer: Composer;
      cityStay: Composer['cities'][0];
      x: number;
      y: number;
      cityNameJa: string;
      activeWorksInYear: Composition[];
    }[] = [];

    // Group active composers by city to prevent overlap (collision fan-out)
    const cityGroups: Record<string, Composer[]> = {};

    activeComposers.forEach(composer => {
      // Find current city stay for composer in currentYear
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
          const radius = Math.min(36, 20 + groupSize * 4);
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

  const selectedComposer = useMemo(() => {
    return COMPOSERS.find(c => c.id === selectedComposerId) || activeComposers[0] || COMPOSERS[0];
  }, [selectedComposerId, activeComposers]);

  // Click & Double-click handler for pin points
  const handlePinClick = (composer: Composer) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Double click detected! Open full detailed page
      onSelectComposer(composer.id);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        // Single tap -> select composer
        setSelectedComposerId(composer.id);
      }, 250);
    }
  };

  // Work point tap handler on composer ribbon
  const handleWorkPointClick = (work: Composition, composer: Composer) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onSelectComposer(composer.id);
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = null;
        setFocusedEpisodeWork({ work, composer });
      }, 250);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] bg-[#121110] overflow-hidden select-none">
      {/* Left Column: Europe Map with Relocation Pins & Direct Episode Popups */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#2e2924] relative">
        {/* Top Time Travel Year Controller Bar */}
        <div className="bg-[#191613] border-b border-[#2e2924] px-4 md:px-8 py-3 flex flex-col gap-2.5 z-20 shrink-0 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Year & Era badge */}
            <div className="flex items-center gap-3">
              <span className="font-classical-display font-bold text-2xl md:text-3xl text-[#f5ebd9] tracking-wider font-mono">
                {currentYear}年
              </span>
              <div
                className="px-2.5 py-0.5 rounded text-xs font-semibold text-white shadow-sm flex items-center gap-1.5"
                style={{ backgroundColor: currentEra.color }}
              >
                <span>{currentEra.name}</span>
                <span className="opacity-75 text-[10px]">({currentEra.nameEn})</span>
              </div>
              <span className="text-xs text-[#9c9388] hidden sm:inline">
                欧州存命の巨匠: <strong className="text-[#f5ebd9]">{activeComposers.length}名</strong>
              </span>
            </div>

            {/* Playback Controls & Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingTimeTravel(!isPlayingTimeTravel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/50 text-[#f5ebd9] text-xs font-medium transition-colors"
              >
                {isPlayingTimeTravel ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current text-[#c99738]" />
                    <span>時系列停止</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-[#c99738]" />
                    <span>年代を自動巡行</span>
                  </>
                )}
              </button>

              <div className="flex items-center bg-[#241f19] border border-[#3d362e] rounded p-0.5 text-[11px]">
                {[1, 2, 4].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded transition-colors ${
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
                onClick={() => setCurrentYear(1787)}
                className="p-1.5 text-[#9c9388] hover:text-[#f5ebd9] hover:bg-[#241f19] rounded transition-colors"
                title="1787年（モーツァルト絶頂期）へ戻る"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Timeline Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#7d7366]">1300年</span>
            <input
              type="range"
              min={1300}
              max={1990}
              value={currentYear}
              onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-[#2a241c] accent-[#c99738] rounded-lg cursor-pointer transition-all"
            />
            <span className="text-[11px] font-mono text-[#7d7366]">1990年</span>
          </div>

          {/* Quick Era Jump Milestones */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-[#7d7366] text-[10px] shrink-0 mr-1 font-bold">歴史的画期:</span>
            {milestones.map(m => (
              <button
                key={m.year}
                onClick={() => setCurrentYear(m.year)}
                className={`px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                  Math.abs(currentYear - m.year) <= 2
                    ? 'bg-[#c99738]/20 border-[#c99738] text-[#f5ebd9]'
                    : 'bg-[#1e1b18] border-[#332c24] text-[#9c9388] hover:text-[#f5ebd9]'
                }`}
              >
                {m.year}年: {m.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Map Canvas with Accurate European Outlines & Relocation Episode Pins */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0908] flex items-center justify-center p-2">
          <svg
            viewBox="0 0 960 640"
            className="w-full h-full max-h-[630px] object-contain drop-shadow-2xl select-none"
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
            <rect width="960" height="640" fill="url(#oceanGlow)" />

            {/* Grid Lines */}
            <line x1="0" y1="160" x2="960" y2="160" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="0" y1="320" x2="960" y2="320" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="0" y1="480" x2="960" y2="480" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="240" y1="0" x2="240" y2="640" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="480" y1="0" x2="480" y2="640" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="720" y1="0" x2="720" y2="640" stroke="#1c1813" strokeWidth="1" strokeDasharray="3 5" />

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

            {/* Japan Inset */}
            <g transform="translate(800, 420)">
              <rect
                x="-8"
                y="-8"
                width="155"
                height="100"
                rx="8"
                fill="#161310"
                stroke="#3d3328"
                strokeWidth="1.2"
              />
              <text x="69" y="12" fill="#c99738" fontSize="10" textAnchor="middle" fontWeight="bold">
                日本 (Japan Inset)
              </text>
            </g>

            {/* European Cities Reference Dots */}
            {Object.values(EUROPEAN_CITIES).map(city => {
              const [cx, cy] = projectGeoToSvg(city.coordinates[0], city.coordinates[1]);
              return (
                <g key={city.id} className="opacity-45 pointer-events-none">
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

            {/* RENDER ACTIVE COMPOSER PORTRAIT PINS & EPISODE POPUPS ON MAP */}
            {composerMapData.map(pin => {
              const { composer, cityStay, x, y, cityNameJa, activeWorksInYear } = pin;
              const era = getEraById(composer.era);
              const isSelected = selectedComposerId === composer.id;
              const isHovered = hoveredComposerId === composer.id;
              const hasActiveWork = activeWorksInYear.length > 0;

              return (
                <g
                  key={composer.id}
                  onClick={() => handlePinClick(composer)}
                  onDoubleClick={() => onSelectComposer(composer.id)}
                  onMouseEnter={() => setHoveredComposerId(composer.id)}
                  onMouseLeave={() => setHoveredComposerId(null)}
                  className="cursor-pointer group"
                  filter="url(#pinShadow)"
                >
                  {/* Pulsating Era Glow Ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={hasActiveWork ? 28 : isSelected ? 24 : 18}
                    fill={era.color}
                    opacity={hasActiveWork ? 0.45 : isSelected ? 0.35 : isHovered ? 0.25 : 0.15}
                    className="animate-pulse transition-all duration-300"
                  />

                  {/* Pin Stem */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={y + 18}
                    stroke={era.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx={x} cy={y + 18} r="3" fill="#ffffff" stroke={era.color} strokeWidth="1.5" />

                  {/* Portrait Avatar Circle Marker */}
                  <foreignObject
                    x={x - (isSelected ? 20 : 16)}
                    y={y - (isSelected ? 20 : 16)}
                    width={isSelected ? 40 : 32}
                    height={isSelected ? 40 : 32}
                    className="overflow-visible"
                  >
                    <div
                      className={`w-full h-full rounded-full transition-all duration-300 flex items-center justify-center shadow-2xl ${
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

                  {/* Composer Name & City Tag */}
                  <g transform={`translate(${x}, ${y + 28})`}>
                    <rect
                      x="-44"
                      y="-1"
                      width="88"
                      height="16"
                      rx="8"
                      fill="#14110e"
                      stroke={isSelected ? '#ffffff' : era.color}
                      strokeWidth="1"
                      opacity="0.9"
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

                  {/* MAP EPISODE POPUP CARD: Floating on Map at the Relocation City! */}
                  {(isSelected || isHovered || hasActiveWork) && (
                    <foreignObject
                      x={x - 110}
                      y={y - 115}
                      width="220"
                      height="92"
                      className="overflow-visible pointer-events-auto z-50"
                    >
                      <div
                        onClick={e => {
                          e.stopPropagation();
                          if (hasActiveWork) {
                            setFocusedEpisodeWork({ work: activeWorksInYear[0], composer });
                          } else {
                            setSelectedComposerId(composer.id);
                          }
                        }}
                        className="bg-[#181410]/95 border border-[#c99738] rounded-xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col justify-between text-[#f5ebd9] hover:border-white transition-all cursor-pointer scale-100 hover:scale-105"
                      >
                        <div className="flex items-center justify-between gap-1 border-b border-[#30261c] pb-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[10px]">{composer.flag}</span>
                            <span className="text-[11px] font-bold text-white truncate">
                              {composer.shortName}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-[#c99738] bg-[#292015] px-1.5 py-0.2 rounded shrink-0">
                            {cityNameJa} · {currentYear}年
                          </span>
                        </div>

                        {/* Episode or Work text */}
                        <div className="my-1">
                          {hasActiveWork ? (
                            <div>
                              <div className="text-[10px] font-bold text-[#f5ebd9] truncate flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-[#c99738] shrink-0" />
                                <span>『{activeWorksInYear[0].title}』</span>
                              </div>
                              <p className="text-[9px] text-[#b3a594] line-clamp-2 leading-tight mt-0.5">
                                {activeWorksInYear[0].description}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <div className="text-[9px] font-bold text-[#c99738] truncate">
                                {cityStay?.role || '滞在・音楽活動'}
                              </div>
                              <p className="text-[9px] text-[#b3a594] line-clamp-2 leading-tight mt-0.5">
                                {cityStay?.notableEvent || composer.biography}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-[#c99738] pt-1 border-t border-[#261f17]">
                          <span>タップ: エピソード解説</span>
                          <span className="font-bold">ダブルタップ: 名鑑 ▶</span>
                        </div>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 bg-[#181512]/95 backdrop-blur-md border border-[#332c24] rounded-lg p-3 text-[11px] text-[#9c9388] shadow-2xl space-y-1.5 z-20 max-w-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c99738] animate-ping" />
              <span className="text-[#f5ebd9] font-medium">{currentYear}年 滞在地・作曲エピソードポップアップ</span>
            </div>
            <div className="text-[10px] text-[#b0a495] space-y-0.5">
              <div>・作曲者が滞在都市を移ると、ポップアップも自動的に移動します</div>
              <div>・シングルタップ: 右パネル / 解説モーダル表示</div>
              <div>・ダブルタップ: 作曲家の詳細大名鑑を開く</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Selected Composer & Masterworks Inspector */}
      <div className="w-full lg:w-96 bg-[#161412] flex flex-col overflow-y-auto divide-y divide-[#241f19] shrink-0">
        {selectedComposer ? (
          <>
            {/* Header profile banner */}
            <div
              className="p-5 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${getEraById(selectedComposer.era).color}33, #161412)`
              }}
            >
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    onDoubleClick={() => onSelectComposer(selectedComposer.id)}
                    className="cursor-pointer"
                    title="ダブルタップで詳細ページへ"
                  >
                    <ComposerPortrait composer={selectedComposer} size="lg" showOrnateBorder={true} />
                  </div>
                  <div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded text-white inline-block mb-1 shadow-sm"
                      style={{ backgroundColor: getEraById(selectedComposer.era).color }}
                    >
                      {getEraById(selectedComposer.era).name}
                    </span>
                    <h2 className="font-classical-display font-bold text-lg text-[#f5ebd9] leading-tight">
                      {selectedComposer.name}
                    </h2>
                    <p className="text-xs text-[#9c9388] mt-0.5 font-mono">
                      {selectedComposer.birthYear} 〜 {selectedComposer.deathYear}年 ({selectedComposer.nationalityJa})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectComposer(selectedComposer.id)}
                  className="px-2.5 py-1 rounded bg-[#2b241c] hover:bg-[#3d3327] border border-[#c99738]/50 text-[#c99738] text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow"
                  title="全詳細プロフィール名鑑ページを開く"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>名鑑詳細</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Biography snippet */}
              <p className="text-xs text-[#d1c6b6] mt-3 leading-relaxed">
                {selectedComposer.biography}
              </p>
            </div>

            {/* Composer Bar with Composition Masterworks Points */}
            <div className="p-5 space-y-3 bg-[#191613]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  生涯バー & 代表曲の作曲年ポイント
                </h3>
                <span className="text-[10px] text-[#9c9388] font-mono">
                  {selectedComposer.works.length}曲
                </span>
              </div>

              {/* Visual Lifespan Timeline Bar with Composition Dots */}
              <div className="bg-[#12100e] border border-[#302820] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#8a7e70]">
                  <span>{selectedComposer.birthYear}年 (誕生)</span>
                  <span>{selectedComposer.deathYear}年 (没)</span>
                </div>

                {/* The Lifespan Bar Container */}
                <div
                  className="relative h-6 rounded-full overflow-visible flex items-center px-2 cursor-pointer"
                  onDoubleClick={() => onSelectComposer(selectedComposer.id)}
                  style={{
                    background: `linear-gradient(90deg, ${getEraById(selectedComposer.era).color}ee, ${getEraById(selectedComposer.era).color}77)`
                  }}
                  title="ダブルタップで作曲家の詳細名鑑を開く"
                >
                  <span className="text-[10px] font-bold text-white drop-shadow z-10 pointer-events-none">
                    {selectedComposer.shortName}
                  </span>

                  {/* Composition Nodes / Points along the bar */}
                  {selectedComposer.works.map(work => {
                    const lifespan = Math.max(1, selectedComposer.deathYear - selectedComposer.birthYear);
                    const pct = Math.max(5, Math.min(95, ((work.year - selectedComposer.birthYear) / lifespan) * 100));

                    return (
                      <div
                        key={work.id}
                        onClick={e => {
                          e.stopPropagation();
                          handleWorkPointClick(work, selectedComposer);
                        }}
                        className="absolute -translate-x-1/2 cursor-pointer group/dot"
                        style={{ left: `${pct}%` }}
                      >
                        <div className="w-4 h-4 rounded-full bg-[#161310] border-2 border-[#ffffff] text-[#c99738] flex items-center justify-center text-[8px] font-bold group-hover/dot:scale-125 transition-transform shadow-lg">
                          ♪
                        </div>

                        {/* Hover Tooltip */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover/dot:flex flex-col bg-[#161310] border border-[#c99738] rounded-md p-2 w-48 shadow-2xl z-50 pointer-events-none text-left">
                          <span className="text-[10px] font-bold text-white truncate">
                            {work.title}
                          </span>
                          <span className="text-[9px] text-[#c99738] font-mono mt-0.5">
                            作曲年: {work.year}年 ({work.city})
                          </span>
                          <span className="text-[9px] text-[#9c9388] mt-1 line-clamp-2 leading-tight">
                            {work.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-[#8a7e70] text-center pt-1 flex items-center justify-center gap-1">
                  <span>ポイント(♪)を<strong>タップ</strong>でエピソード、<strong>ダブルタップ</strong>で全詳細</span>
                </div>
              </div>
            </div>

            {/* List of Works with Composition Years and Single-Tap Episode details */}
            <div className="p-5 space-y-3 flex-1 bg-[#141210]">
              <span className="text-xs font-bold text-[#f5ebd9] block">
                代表的傑作リスト ({selectedComposer.works.length}作品)
              </span>

              <div className="space-y-2.5">
                {selectedComposer.works.map(work => (
                  <div
                    key={work.id}
                    onClick={() => handleWorkPointClick(work, selectedComposer)}
                    onDoubleClick={() => onSelectComposer(selectedComposer.id)}
                    className="p-3 rounded-lg bg-[#1b1815] border border-[#2e2720] hover:border-[#c99738]/60 transition-colors cursor-pointer group/card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#c99738] bg-[#29221b] px-1.5 py-0.5 rounded">
                          {work.year}年 作曲
                        </span>
                        <h4 className="text-xs font-bold text-[#f5ebd9] mt-1 group-hover/card:text-[#c99738] transition-colors">
                          {work.title}
                        </h4>
                        <p className="text-[11px] text-[#9c9388] font-mono mt-0.5">
                          {work.originalTitle} · {work.city}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#c99738] shrink-0 font-medium opacity-0 group-hover/card:opacity-100 transition-opacity">
                        解説 ▶
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9c9388] mt-2 leading-relaxed">
                      {work.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Major Life Milestones */}
            {selectedComposer.milestones && selectedComposer.milestones.length > 0 && (
              <div className="p-5 bg-[#12100e]">
                <span className="text-xs font-bold text-[#c99738] block mb-2">
                  生涯の主な出来事・足跡
                </span>
                <div className="space-y-1.5 text-xs text-[#b8ad9e]">
                  {selectedComposer.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#c99738] font-bold w-12 shrink-0">
                        {m.year}年
                      </span>
                      <span className="text-xs">{m.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-xs text-[#7d7366]">
            地図上の作曲家ピンを選択してください
          </div>
        )}
      </div>

      {/* Partial Episode & Composition Modal (Single-Tap Action) */}
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

            {/* Audio Snippet Preview */}
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
                  <span className="text-[10px] text-[#9c9388]">Web Audio API リアルタイムシンセ</span>
                </div>
              </div>
            </div>

            {/* Detailed Episode Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                作品誕生のエピソード・背景
              </h4>
              <p className="text-xs text-[#d1c6b6] leading-relaxed bg-[#110f0d] p-3 rounded-lg border border-[#241e17]">
                {focusedEpisodeWork.work.description}
              </p>
            </div>

            {/* Actions */}
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
