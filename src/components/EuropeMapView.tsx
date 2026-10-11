import React, { useState, useMemo, useEffect, useRef } from 'react';
import { COMPOSERS } from '../data/composers';
import { EUROPEAN_CITIES } from '../data/cities';
import { ERAS, getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import {
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
  Compass,
  Layers
} from 'lucide-react';
import { Composer, Composition } from '../types';

interface EuropeMapViewProps {
  onSelectComposer: (composerId: string) => void;
}

// Projection: Longitude (-10 to 42) and Latitude (35 to 62) to SVG coordinates [960 x 640]
const projectGeoToSvg = (lon: number, lat: number): [number, number] => {
  const minLon = -10;
  const maxLon = 42;
  const minLat = 35;
  const maxLat = 62;

  const svgWidth = 960;
  const svgHeight = 640;

  const x = ((lon - minLon) / (maxLon - minLon)) * svgWidth;
  const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

  return [Math.round(x), Math.round(y)];
};

export const EuropeMapView: React.FC<EuropeMapViewProps> = ({ onSelectComposer }) => {
  const [currentYear, setCurrentYear] = useState<number>(1787); // Default to Mozart's iconic year
  const [isPlayingTimeTravel, setIsPlayingTimeTravel] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [hoveredComposerId, setHoveredComposerId] = useState<string | null>(null);
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>('mozart');
  const [hoveredWork, setHoveredWork] = useState<{ title: string; year: number; composerName: string } | null>(null);
  const timerRef = useRef<number | null>(null);

  // Notable historical milestones for quick jump across 700 years of music history!
  const milestones = [
    { year: 1365, title: 'マショー『ノートルダム・ミサ曲』(中世)', era: 'medieval' },
    { year: 1502, title: 'ジョスカン『アヴェ・マリア』(ルネサンス)', era: 'renaissance' },
    { year: 1607, title: 'モンテヴェルディ歌劇『オルフェオ』(バロック)', era: 'baroque' },
    { year: 1723, title: 'バッハ ライプツィヒ就任 & ヴィヴァルディ『四季』', era: 'baroque' },
    { year: 1787, title: 'モーツァルト『ドン・ジョヴァンニ』&『アイネ・クライネ』', era: 'classical' },
    { year: 1808, title: 'ベートーヴェン『運命』ウィーン初演', era: 'classical' },
    { year: 1838, title: 'ショパン パリでのノクターン傑作群', era: 'romantic' },
    { year: 1876, title: 'チャイコフスキー『白鳥の湖』& ワーグナー バイロイト開場', era: 'late-romantic' },
    { year: 1893, title: 'ドヴォルザーク『新世界より』', era: 'late-romantic' },
    { year: 1913, title: 'ストラヴィンスキー『春の祭典』初演', era: 'modern' },
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

  // Active composer pins mapped to European map coordinates with collision offset logic!
  const composerPins = useMemo(() => {
    const pins: {
      composer: Composer;
      cityStay?: Composer['cities'][0];
      x: number;
      y: number;
      cityNameJa: string;
      isActiveInYear: boolean;
    }[] = [];

    // Group active composers by city to prevent pin overlap (collision fan-out)
    const cityGroups: Record<string, Composer[]> = {};

    activeComposers.forEach(composer => {
      // Find where composer is staying in currentYear
      const currentStay = composer.cities.find(
        s => currentYear >= s.startYear && currentYear <= s.endYear
      ) || composer.cities[0];

      const cityName = currentStay?.cityName.toLowerCase() || 'vienna';
      if (!cityGroups[cityName]) cityGroups[cityName] = [];
      cityGroups[cityName].push(composer);
    });

    // Calculate positions with radial fan-out for multiple composers in same city
    Object.entries(cityGroups).forEach(([cityNameKey, group]) => {
      const cityData = Object.values(EUROPEAN_CITIES).find(
        c => c.name.toLowerCase() === cityNameKey || c.id === cityNameKey
      ) || EUROPEAN_CITIES['vienna'];

      const [baseX, baseY] = projectGeoToSvg(cityData.coordinates[0], cityData.coordinates[1]);
      const groupSize = group.length;

      group.forEach((composer, index) => {
        let x = baseX;
        let y = baseY;

        // Smart radial offset if 2+ composers share a city!
        if (groupSize > 1) {
          const angle = (index / groupSize) * Math.PI * 2 - Math.PI / 2;
          const radius = Math.min(32, 18 + groupSize * 4);
          x = baseX + Math.cos(angle) * radius;
          y = baseY + Math.sin(angle) * radius;
        }

        const currentStay = composer.cities.find(
          s => currentYear >= s.startYear && currentYear <= s.endYear
        ) || composer.cities[0];

        pins.push({
          composer,
          cityStay: currentStay,
          x: Math.round(x),
          y: Math.round(y),
          cityNameJa: currentStay?.cityNameJa || cityData.nameJa,
          isActiveInYear: true
        });
      });
    });

    return pins;
  }, [activeComposers, currentYear]);

  const selectedComposer = useMemo(() => {
    return COMPOSERS.find(c => c.id === selectedComposerId) || activeComposers[0] || COMPOSERS[0];
  }, [selectedComposerId, activeComposers]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] bg-[#121110] overflow-hidden select-none">
      {/* Left/Main Column: Europe Map Base with Interactive Composer Pins */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#2e2924] relative">
        {/* Top Time Travel Year Controller Bar */}
        <div className="bg-[#191613] border-b border-[#2e2924] px-4 md:px-8 py-3 flex flex-col gap-2.5 z-20 shrink-0">
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
            <span className="text-[#7d7366] text-[10px] shrink-0 mr-1">歴史的画期:</span>
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

        {/* Map Canvas with European Base & Composer Portrait Pins */}
        <div className="flex-1 relative overflow-hidden bg-[#0e0c0a] flex items-center justify-center p-2">
          {/* Work Year Tooltip Display */}
          {hoveredWork && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#191511]/95 border border-[#c99738] px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs text-[#f5ebd9]">
              <Sparkles className="w-4 h-4 text-[#c99738] animate-pulse" />
              <span className="font-bold text-[#c99738]">{hoveredWork.composerName}</span>
              <span>『{hoveredWork.title}』</span>
              <span className="font-mono bg-[#c99738] text-black font-bold px-1.5 py-0.2 rounded text-[11px]">
                {hoveredWork.year}年 作曲
              </span>
            </div>
          )}

          <svg
            viewBox="0 0 960 640"
            className="w-full h-full max-h-[620px] object-contain drop-shadow-2xl select-none"
          >
            <defs>
              <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a1714" />
                <stop offset="100%" stopColor="#0b0a08" />
              </radialGradient>

              <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Ocean / Background */}
            <rect width="960" height="640" fill="url(#oceanGlow)" />

            {/* Stylized European Landmass Paths */}
            {/* British Isles */}
            <path
              d="M 190 230 Q 180 200 210 170 Q 240 150 225 180 Q 220 220 245 240 Q 220 270 190 250 Z"
              fill="#1e1914"
              stroke="#2f261e"
              strokeWidth="1.5"
            />
            {/* Scandinavia & Nordic */}
            <path
              d="M 290 60 Q 350 40 390 80 Q 430 120 370 190 Q 330 210 310 160 Q 290 110 290 60 Z"
              fill="#1e1914"
              stroke="#2f261e"
              strokeWidth="1.5"
            />
            {/* Continental Europe */}
            <path
              d="M 180 330 Q 210 310 270 290 Q 340 270 430 280 Q 570 270 730 240 Q 830 270 850 440 Q 760 480 630 490 Q 510 470 440 440 Q 390 480 330 510 Q 250 530 190 490 Q 150 440 180 330 Z"
              fill="#201b15"
              stroke="#382d22"
              strokeWidth="1.5"
            />
            {/* Italian Peninsula */}
            <path
              d="M 380 410 Q 410 440 440 480 Q 470 530 440 540 Q 410 510 380 460 Z"
              fill="#201b15"
              stroke="#382d22"
              strokeWidth="1.5"
            />
            {/* Iberian Peninsula */}
            <path
              d="M 80 430 Q 160 420 180 460 Q 160 540 100 530 Q 70 490 80 430 Z"
              fill="#1d1813"
              stroke="#30261d"
              strokeWidth="1.5"
            />

            {/* Inset Box for Japan (Takemitsu and modern Asian connection) */}
            <g transform="translate(810, 380)">
              <rect
                x="-10"
                y="-10"
                width="140"
                height="110"
                rx="8"
                fill="#161310"
                stroke="#3d3328"
                strokeWidth="1"
              />
              <text x="60" y="10" fill="#c99738" fontSize="10" textAnchor="middle" fontWeight="bold">
                日本 (Japan)
              </text>
            </g>

            {/* Latitude/Longitude Aesthetic Grid Lines */}
            <line x1="0" y1="170" x2="960" y2="170" stroke="#181410" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="0" y1="330" x2="960" y2="330" stroke="#181410" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="0" y1="490" x2="960" y2="490" stroke="#181410" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="270" y1="0" x2="270" y2="640" stroke="#181410" strokeWidth="1" strokeDasharray="3 5" />
            <line x1="540" y1="0" x2="540" y2="640" stroke="#181410" strokeWidth="1" strokeDasharray="3 5" />

            {/* European Cities Reference Dots & Names */}
            {Object.values(EUROPEAN_CITIES).map(city => {
              const [cx, cy] = projectGeoToSvg(city.coordinates[0], city.coordinates[1]);
              return (
                <g key={city.id} className="opacity-40 pointer-events-none">
                  <circle cx={cx} cy={cy} r="2.5" fill="#7a6e5f" />
                  <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fontSize="8"
                    fill="#7a6e5f"
                    fontFamily="sans-serif"
                  >
                    {city.nameJa}
                  </text>
                </g>
              );
            })}

            {/* RENDER ACTIVE COMPOSER PORTRAIT PINS ON MAP FOR CURRENT YEAR */}
            {composerPins.map(pin => {
              const { composer, cityStay, x, y, cityNameJa } = pin;
              const era = getEraById(composer.era);
              const isSelected = selectedComposerId === composer.id;
              const isHovered = hoveredComposerId === composer.id;

              return (
                <g
                  key={composer.id}
                  onClick={() => setSelectedComposerId(composer.id)}
                  onMouseEnter={() => setHoveredComposerId(composer.id)}
                  onMouseLeave={() => setHoveredComposerId(null)}
                  className="cursor-pointer group"
                  filter="url(#pinShadow)"
                >
                  {/* Pulsating Era Glow Ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 26 : 20}
                    fill={era.color}
                    opacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.15}
                    className="animate-pulse transition-all duration-300"
                  />

                  {/* Pin Stem line pointing to ground */}
                  <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={y + 18}
                    stroke={era.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Ground Pin Dot */}
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

                  {/* Composer Name & City Label Below Pin */}
                  <g transform={`translate(${x}, ${y + 28})`}>
                    <rect
                      x="-42"
                      y="-1"
                      width="84"
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
                      {composer.shortName}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 bg-[#181512]/95 backdrop-blur-md border border-[#332c24] rounded-lg p-3 text-[11px] text-[#9c9388] shadow-2xl space-y-1.5 z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c99738] animate-ping" />
              <span className="text-[#f5ebd9] font-medium">{currentYear}年 在住の作曲家肖像ピン</span>
            </div>
            <div className="text-[10px] text-[#82776a]">
              ピンをタップすると作品と解説カードが表示されます
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
                  <ComposerPortrait composer={selectedComposer} size="lg" showOrnateBorder={true} />
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
                  title="全詳細プロフィール"
                >
                  <span>名鑑</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Biography snippet */}
              <p className="text-xs text-[#d1c6b6] mt-3 leading-relaxed line-clamp-3">
                {selectedComposer.biography}
              </p>
            </div>

            {/* Composer Bar with Composition Masterworks Points (代表曲の作曲年) */}
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
                  className="relative h-6 rounded-full overflow-visible flex items-center px-2"
                  style={{
                    background: `linear-gradient(90deg, ${getEraById(selectedComposer.era).color}ee, ${getEraById(selectedComposer.era).color}77)`
                  }}
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
                        onMouseEnter={() =>
                          setHoveredWork({
                            title: work.title,
                            year: work.year,
                            composerName: selectedComposer.shortName
                          })
                        }
                        onMouseLeave={() => setHoveredWork(null)}
                        className="absolute -translate-x-1/2 cursor-pointer group/dot"
                        style={{ left: `${pct}%` }}
                      >
                        {/* Interactive Dot */}
                        <div className="w-4 h-4 rounded-full bg-[#161310] border-2 border-[#ffffff] text-[#c99738] flex items-center justify-center text-[8px] font-bold group-hover/dot:scale-125 transition-transform shadow-lg">
                          ♪
                        </div>

                        {/* Hover Tooltip displaying composition title + year */}
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

                <div className="text-[10px] text-[#7a6e5f] text-center italic pt-1">
                  バー上の「♪」ポイントにカーソルを置くと、代表曲の作曲年が表示されます
                </div>
              </div>
            </div>

            {/* List of Works with Composition Years */}
            <div className="p-5 space-y-3 flex-1 bg-[#141210]">
              <span className="text-xs font-bold text-[#f5ebd9] block">
                代表的傑作リスト ({selectedComposer.works.length}作品)
              </span>

              <div className="space-y-2.5">
                {selectedComposer.works.map(work => (
                  <div
                    key={work.id}
                    className="p-3 rounded-lg bg-[#1b1815] border border-[#2e2720] hover:border-[#c99738]/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#c99738] bg-[#29221b] px-1.5 py-0.5 rounded">
                          {work.year}年 作曲
                        </span>
                        <h4 className="text-xs font-bold text-[#f5ebd9] mt-1">
                          {work.title}
                        </h4>
                        <p className="text-[11px] text-[#9c9388] font-mono mt-0.5">
                          {work.originalTitle} · {work.city}
                        </p>
                      </div>
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
    </div>
  );
};
