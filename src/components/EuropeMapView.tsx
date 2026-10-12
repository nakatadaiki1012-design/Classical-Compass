import React, { useState, useMemo, useEffect, useRef } from 'react';
import { COMPOSERS } from '../data/composers';
import { EUROPEAN_CITIES } from '../data/cities';
import { ERAS, getEraById } from '../data/eras';
import { EUROPE_COUNTRY_PATHS } from '../data/europePaths';
import { ComposerPortrait } from './ComposerPortrait';
import { MapPersonPopup } from './MapPersonPopup';
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
  UserCheck,
  Heart,
  Flame,
  X
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
  const [showStories, setShowStories] = useState<boolean>(false);

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
          // Lay out side by side (max 3 per row) so the name labels under each pin don't collide
          const cols = Math.min(groupSize, 3);
          const col = index % cols;
          const row = Math.floor(index / cols);
          x = baseX + (col - (cols - 1) / 2) * 112;
          y = baseY + row * 78;
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

  const handlePinClick = (composerId: string) => {
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
            </div>
            <span className="text-xs text-[#b5aa9b] hidden sm:inline">
              存命の巨匠: <strong className="text-[#f5ebd9] font-mono">{activeComposers.length}名</strong>
            </span>
          </div>

          {/* 自動再生・画期ジャンプ（速度は再生中だけ表示して画面をすっきり） */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value=""
              onChange={e => {
                if (e.target.value) {
                  setCurrentYear(parseInt(e.target.value, 10));
                  setSelectedComposerId(null);
                }
              }}
              className="bg-[#241f19] border border-[#3d362e] rounded-lg px-2.5 py-1.5 text-xs text-[#e8dec8] focus:outline-none focus:border-[#c99738] cursor-pointer max-w-[150px] sm:max-w-[190px]"
              aria-label="有名な年へジャンプ"
            >
              <option value="">有名な年へジャンプ</option>
              {milestones.map(m => (
                <option key={m.year} value={m.year} className="bg-[#1a140f]">
                  {m.year}年　{m.title}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsPlayingTimeTravel(!isPlayingTimeTravel)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/50 text-[#f5ebd9] text-xs font-bold transition-all shadow-md active:scale-95"
            >
              {isPlayingTimeTravel ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-[#c99738]" />
                  <span>停止</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-[#c99738]" />
                  <span>年代を自動で進める</span>
                </>
              )}
            </button>

            {isPlayingTimeTravel && (
              <div className="flex items-center bg-[#241f19] border border-[#3d362e] rounded-lg p-0.5 text-[11px]">
                {[1, 2, 4].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 rounded transition-colors ${
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

        {/* Timeline Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#a3978a]">1300年</span>
          <input
            type="range"
            min={1300}
            max={1990}
            value={currentYear}
            onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
            className="flex-1 h-2 bg-[#2a241c] accent-[#c99738] rounded-lg cursor-pointer transition-all"
          />
          <span className="text-xs font-mono text-[#a3978a]">1990年</span>
        </div>
      </div>

      {/* 2. Main SVG Europe Map Canvas (地図のほう: 生没年＆その年の作曲を表示) */}
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
                <g key={city.id} className="opacity-70 pointer-events-none max-md:hidden">
                  <circle cx={cx} cy={cy} r="2.5" fill="#8c7e6d" />
                  <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#a89a88"
                    fontFamily="sans-serif"
                    fontWeight="500"
                  >
                    {city.nameJa}
                  </text>
                </g>
              );
            })}

            {/* MAP COMPOSER PINS WITH LIFESPAN & COMPOSITION (生没年＆作曲を地図上に明記) */}
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

                  {/* ON-MAP LABEL: name on line 1, composition (or years) on line 2, box sized to fit */}
                  {(() => {
                    const line1 = composer.shortName;
                    const workTitle = topWork
                      ? topWork.title.length > 10 ? topWork.title.substring(0, 9) + '…' : topWork.title
                      : '';
                    const line2 = topWork ? `♪ ${workTitle}` : `${composer.birthYear}〜${composer.deathYear}`;
                    // CJK glyphs are ~1em wide, digits/latin ~0.6em
                    const textWidth = (text: string, size: number) =>
                      [...text].reduce((w, ch) => w + (/[\x00-\x7F]/.test(ch) ? 0.6 : 1) * size, 0);
                    const boxWidth = Math.max(textWidth(line1, 12), textWidth(line2, 10)) + 18;
                    return (
                      <g transform={`translate(${x}, ${y + 22})`} className={isSelected ? undefined : 'max-md:hidden'}>
                        <rect
                          x={-boxWidth / 2}
                          y="0"
                          width={boxWidth}
                          height="32"
                          rx="7"
                          fill="#14110e"
                          stroke={isSelected ? '#ffffff' : topWork ? '#c99738' : era.color}
                          strokeWidth={isSelected ? 1.6 : 1.1}
                          opacity="0.94"
                        />
                        <text x="0" y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ffffff">
                          {line1}
                        </text>
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
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* 人物ポップアップ: 広い画面では地図の右上に重ねて、狭い画面では地図の下に表示 */}
          {popupPin && (
            <MapPersonPopup
              composer={popupPin.composer}
              year={currentYear}
              cityStay={popupPin.cityStay}
              cityNameJa={popupPin.cityNameJa}
              onClose={() => setSelectedComposerId(null)}
              onOpenProfile={onSelectComposer}
            />
          )}

          {/* Map Status Bar */}
          {!popupPin && (
            <div className="absolute bottom-3 left-3 bg-[#181512]/90 backdrop-blur-md border border-[#332c24] rounded-lg px-3 py-1.5 text-xs text-[#d6cdbd] flex items-center gap-2 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-[#c99738] animate-ping" />
              <span>人物をタップすると、その人が何をしたかが出ます</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. 地図の下: この年に活動した人の一覧。くわしい物語は別画面で見る */}
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
                          <span className="text-base">{composer.flag}</span>
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
                    {work && (
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
