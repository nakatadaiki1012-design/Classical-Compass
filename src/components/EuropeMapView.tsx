import React, { useState, useMemo, useEffect, useRef } from 'react';
import { COMPOSERS } from '../data/composers';
import { EUROPEAN_CITIES } from '../data/cities';
import { ERAS, getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { useAudio } from '../context/AudioContext';
import {
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Music,
  Calendar,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { Composer, Composition } from '../types';

interface EuropeMapViewProps {
  onSelectComposer: (composerId: string) => void;
}

// Projection: Longitude (-10 to 40) and Latitude (36 to 62) to SVG coordinates [1000 x 750]
const projectGeoToSvg = (lon: number, lat: number): [number, number] => {
  const minLon = -10;
  const maxLon = 38;
  const minLat = 37;
  const maxLat = 61;

  const svgWidth = 920;
  const svgHeight = 640;

  // Simple Mercator-like normalized mapping
  const x = ((lon - minLon) / (maxLon - minLon)) * svgWidth;
  const y = ((maxLat - lat) / (maxLat - minLat)) * svgHeight;

  return [Math.round(x), Math.round(y)];
};

export const EuropeMapView: React.FC<EuropeMapViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack } = useAudio();

  const [currentYear, setCurrentYear] = useState<number>(1787); // Default to Mozart's iconic year
  const [isPlayingTimeTravel, setIsPlayingTimeTravel] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedCityId, setSelectedCityId] = useState<string | null>('vienna');
  const timerRef = useRef<number | null>(null);

  // Notable historical milestones for quick jump
  const milestones = [
    { year: 1723, title: 'バッハがライプツィヒへ & ヴィヴァルディ『四季』', era: 'baroque' },
    { year: 1787, title: 'モーツァルト『ドン・ジョヴァンニ』&『アイネ・クライネ』', era: 'classical' },
    { year: 1808, title: 'ベートーヴェン『運命』ウィーン初演', era: 'classical' },
    { year: 1838, title: 'ショパン パリでのノクターン傑作群', era: 'romantic' },
    { year: 1876, title: 'チャイコフスキー『白鳥の湖』& ワーグナー バイロイト開場', era: 'late-romantic' },
    { year: 1893, title: 'ドヴォルザーク『新世界より』& チャイコフスキー『悲愴』', era: 'late-romantic' },
    { year: 1913, title: 'ストラヴィンスキー『春の祭典』パリ初演大暴動', era: 'modern' }
  ];

  // Auto time travel slideshow
  useEffect(() => {
    if (isPlayingTimeTravel) {
      timerRef.current = window.setInterval(() => {
        setCurrentYear(prev => {
          if (prev >= 1950) {
            setIsPlayingTimeTravel(false);
            return 1950;
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
    return ERAS.find(e => currentYear >= e.startYear && currentYear <= e.endYear) || ERAS[1];
  }, [currentYear]);

  // Active composers living in currentYear
  const activeComposers = useMemo(() => {
    return COMPOSERS.filter(c => currentYear >= c.birthYear && currentYear <= c.deathYear);
  }, [currentYear]);

  // Works composed around currentYear (within ±2 years window)
  const nearbyWorks = useMemo(() => {
    const list: { work: Composition; composer: Composer }[] = [];
    COMPOSERS.forEach(composer => {
      composer.works.forEach(work => {
        if (Math.abs(work.year - currentYear) <= 2) {
          list.push({ work, composer });
        }
      });
    });
    return list;
  }, [currentYear]);

  // Map of active cities and who is residing/working there in currentYear
  const cityActivities = useMemo(() => {
    const record: Record<
      string,
      {
        city: (typeof EUROPEAN_CITIES)[string];
        composers: { composer: Composer; role: string; event: string }[];
        works: { work: Composition; composer: Composer }[];
      }
    > = {};

    Object.values(EUROPEAN_CITIES).forEach(city => {
      record[city.id] = {
        city,
        composers: [],
        works: []
      };
    });

    // Match composers
    activeComposers.forEach(composer => {
      composer.cities.forEach(stay => {
        const cityKey = Object.keys(EUROPEAN_CITIES).find(
          k => EUROPEAN_CITIES[k].name.toLowerCase() === stay.cityName.toLowerCase()
        );
        if (cityKey && currentYear >= stay.startYear && currentYear <= stay.endYear) {
          if (!record[cityKey]) {
            record[cityKey] = { city: EUROPEAN_CITIES[cityKey], composers: [], works: [] };
          }
          record[cityKey].composers.push({
            composer,
            role: stay.role,
            event: stay.notableEvent
          });
        }
      });
    });

    // Match works around this year
    nearbyWorks.forEach(item => {
      const cityKey = Object.keys(EUROPEAN_CITIES).find(
        k => EUROPEAN_CITIES[k].name.toLowerCase() === item.work.city.toLowerCase()
      );
      if (cityKey) {
        if (!record[cityKey]) {
          record[cityKey] = { city: EUROPEAN_CITIES[cityKey], composers: [], works: [] };
        }
        record[cityKey].works.push(item);
      }
    });

    return record;
  }, [activeComposers, nearbyWorks, currentYear]);

  const selectedCityData = selectedCityId ? cityActivities[selectedCityId] : null;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-130px)] bg-[#121110] overflow-hidden select-none">
      {/* Left/Main Column: Time Travel Controls & European Vector Map */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#2e2924] relative">
        {/* Time Travel Year Controller Bar */}
        <div className="bg-[#191613] border-b border-[#2e2924] px-4 md:px-8 py-3 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Year & Era display */}
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
                存命の巨匠: <strong className="text-[#f5ebd9]">{activeComposers.length}名</strong>
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
                    <span>歴史年代を巡る</span>
                  </>
                )}
              </button>

              {/* Speed toggle */}
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

          {/* Interactive Year Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#7d7366]">1650</span>
            <input
              type="range"
              min={1650}
              max={1950}
              value={currentYear}
              onChange={e => setCurrentYear(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-[#2a241c] accent-[#c99738] rounded-lg cursor-pointer transition-all"
            />
            <span className="text-[11px] font-mono text-[#7d7366]">1950</span>
          </div>

          {/* Quick Era Jump Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
            <span className="text-[#7d7366] text-[10px] shrink-0 mr-1">主な画期:</span>
            {milestones.map(m => (
              <button
                key={m.year}
                onClick={() => setCurrentYear(m.year)}
                className={`px-2 py-0.5 rounded border whitespace-nowrap transition-colors ${
                  Math.abs(currentYear - m.year) <= 1
                    ? 'bg-[#c99738]/20 border-[#c99738] text-[#f5ebd9]'
                    : 'bg-[#1e1b18] border-[#332c24] text-[#9c9388] hover:text-[#f5ebd9]'
                }`}
              >
                {m.year}年: {m.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Vector Map Canvas */}
        <div className="flex-1 relative overflow-auto bg-[#100e0c] flex items-center justify-center p-2">
          {/* Subtle Map Backing Grid & Continent Vector Art */}
          <svg
            viewBox="0 0 920 640"
            className="w-full h-full max-h-[600px] object-contain drop-shadow-2xl select-none"
          >
            <defs>
              <radialGradient id="waterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1a1815" />
                <stop offset="100%" stopColor="#0d0c0a" />
              </radialGradient>
              <filter id="cityGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean / Landmass Backing */}
            <rect width="920" height="640" fill="url(#waterGlow)" />

            {/* Stylized European Landmass Outlines */}
            {/* British Isles */}
            <path
              d="M 180 240 Q 170 210 200 180 Q 230 160 215 190 Q 210 230 235 250 Q 210 280 180 260 Z"
              fill="#1d1915"
              stroke="#2e2720"
              strokeWidth="1.5"
            />
            {/* Scandinavia */}
            <path
              d="M 280 70 Q 340 50 380 90 Q 420 130 360 200 Q 320 220 300 170 Q 280 120 280 70 Z"
              fill="#1d1915"
              stroke="#2e2720"
              strokeWidth="1.5"
            />
            {/* Continental Europe & Mediterranean */}
            <path
              d="M 170 340 Q 200 320 260 300 Q 330 280 420 290 Q 560 280 720 250 Q 820 280 840 450 Q 750 490 620 500 Q 500 480 430 450 Q 380 490 320 520 Q 240 540 180 500 Q 140 450 170 340 Z"
              fill="#1f1b16"
              stroke="#352e26"
              strokeWidth="1.5"
            />
            {/* Italian Peninsula */}
            <path
              d="M 370 420 Q 400 450 430 490 Q 460 540 430 550 Q 400 520 370 470 Z"
              fill="#1f1b16"
              stroke="#352e26"
              strokeWidth="1.5"
            />
            {/* Iberian Peninsula */}
            <path
              d="M 70 440 Q 150 430 170 470 Q 150 550 90 540 Q 60 500 70 440 Z"
              fill="#1c1814"
              stroke="#2d261e"
              strokeWidth="1.5"
            />

            {/* Major European Rivers / Aesthetics Lines */}
            {/* Rhine & Danube stylized paths */}
            <path
              d="M 280 300 Q 320 340 310 400"
              fill="none"
              stroke="#151310"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <path
              d="M 340 390 Q 420 390 530 420 Q 640 430 720 440"
              fill="none"
              stroke="#151310"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Latitude/Longitude Subtle Grid */}
            <line x1="0" y1="180" x2="920" y2="180" stroke="#181512" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="0" y1="340" x2="920" y2="340" stroke="#181512" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="0" y1="500" x2="920" y2="500" stroke="#181512" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="260" y1="0" x2="260" y2="640" stroke="#181512" strokeWidth="1" strokeDasharray="2 4" />
            <line x1="520" y1="0" x2="520" y2="640" stroke="#181512" strokeWidth="1" strokeDasharray="2 4" />

            {/* Render European Music Hubs / Cities */}
            {Object.values(EUROPEAN_CITIES).map(city => {
              const [cx, cy] = projectGeoToSvg(city.coordinates[0], city.coordinates[1]);
              const activity = cityActivities[city.id];
              const composerCount = activity?.composers.length || 0;
              const hasWorks = (activity?.works.length || 0) > 0;
              const isSelected = selectedCityId === city.id;

              return (
                <g
                  key={city.id}
                  onClick={() => setSelectedCityId(city.id)}
                  className="cursor-pointer group"
                >
                  {/* Glowing active halo if works were composed here this year */}
                  {hasWorks && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="18"
                      fill="#c99738"
                      opacity="0.2"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 10 : composerCount > 0 ? 7 : 4}
                    fill={
                      isSelected
                        ? '#f5ebd9'
                        : composerCount > 0
                        ? '#c99738'
                        : '#5e5447'
                    }
                    stroke="#121110"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-300 group-hover:scale-125"
                  />

                  {/* Composer presence indicator dot */}
                  {composerCount > 0 && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="3"
                      fill="#121110"
                    />
                  )}

                  {/* Musical note marker if landmark composition in this era */}
                  {hasWorks && (
                    <g transform={`translate(${cx + 4}, ${cy - 16})`}>
                      <rect
                        x="-3"
                        y="-10"
                        width="18"
                        height="14"
                        rx="3"
                        fill="#c99738"
                        stroke="#121110"
                        strokeWidth="1"
                      />
                      <text
                        x="6"
                        y="0"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#121110"
                        textAnchor="middle"
                      >
                        ♪
                      </text>
                    </g>
                  )}

                  {/* City Label */}
                  <text
                    x={cx}
                    y={cy + (isSelected ? 16 : 14)}
                    textAnchor="middle"
                    fontSize={isSelected ? '12' : composerCount > 0 ? '11' : '9'}
                    fontWeight={composerCount > 0 ? '600' : '400'}
                    fill={isSelected ? '#ffffff' : composerCount > 0 ? '#f5ebd9' : '#85786a'}
                    className="pointer-events-none drop-shadow font-sans transition-all"
                  >
                    {city.nameJa}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 bg-[#181512]/90 backdrop-blur-md border border-[#332c24] rounded-lg p-2.5 text-[11px] text-[#9c9388] shadow-xl space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#c99738]" />
              <span className="text-[#f5ebd9]">巨匠が活動・滞在中の都市</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 rounded bg-[#c99738] text-[8px] text-[#121110] font-bold inline-flex items-center justify-center">♪</span>
              <span className="text-[#f5ebd9]">この年代に代表作を作曲</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Selected City & Composer Chronicle Inspector */}
      <div className="w-full lg:w-96 bg-[#161412] flex flex-col overflow-y-auto divide-y divide-[#241f19]">
        {/* City Header */}
        {selectedCityData ? (
          <div className="p-4 md:p-5 bg-[#1a1714]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#c99738]" />
                <h3 className="font-classical-display font-bold text-lg text-[#f5ebd9]">
                  {selectedCityData.city.nameJa}
                </h3>
                <span className="text-xs text-[#9c9388]">({selectedCityData.city.name})</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-[#241f19] border border-[#332c24] text-[#c99738]">
                {selectedCityData.city.countryJa}
              </span>
            </div>
            <p className="text-xs text-[#9c9388] mt-2 leading-relaxed">
              {selectedCityData.city.description}
            </p>
          </div>
        ) : (
          <div className="p-5 text-center text-xs text-[#7d7366]">
            地図上の都市ピンをクリックすると、滞在作曲家と作曲された作品が表示されます
          </div>
        )}

        {/* Landmark Compositions in this city around this year */}
        {selectedCityData && selectedCityData.works.length > 0 && (
          <div className="p-4 md:p-5 bg-[#1c1814] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#c99738] flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                {currentYear}年前後にここで作曲された名曲
              </span>
              <span className="text-[10px] text-[#9c9388] font-mono">
                {selectedCityData.works.length}曲
              </span>
            </div>

            <div className="space-y-2">
              {selectedCityData.works.map(({ work, composer }) => {
                const isCurrent = currentTrack?.work.id === work.id;
                return (
                  <div
                    key={work.id}
                    className="p-2.5 rounded bg-[#241f19] border border-[#383025] hover:border-[#c99738]/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#f5ebd9] truncate">
                          {work.title}
                        </p>
                        <p className="text-[11px] text-[#c99738] mt-0.5 flex items-center gap-1.5">
                          <span>{composer.name}</span>
                          <span>·</span>
                          <span>{work.year}年</span>
                        </p>
                      </div>
                      <button
                        onClick={() => playTrack(work, composer)}
                        className="w-7 h-7 rounded-full bg-[#c99738] hover:bg-[#dba844] text-[#121110] flex items-center justify-center shrink-0 transition-transform hover:scale-105 shadow"
                        title="試聴"
                      >
                        <Play className="w-3 h-3 fill-current translate-x-0.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#9c9388] mt-2 line-clamp-2 leading-relaxed">
                      {work.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Composers active in this city around this year */}
        {selectedCityData && (
          <div className="p-4 md:p-5 flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#f5ebd9] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c99738]" />
                {currentYear}年にこの都市で活動中の作曲家
              </span>
              <span className="text-[10px] text-[#9c9388]">
                {selectedCityData.composers.length}名
              </span>
            </div>

            {selectedCityData.composers.length === 0 ? (
              <p className="text-xs text-[#7d7366] italic py-3">
                この年（{currentYear}年）には、記録された常駐作曲家はいません。年代スライダーを動かしてみてください。
              </p>
            ) : (
              <div className="space-y-2.5">
                {selectedCityData.composers.map(({ composer, role, event }) => {
                  const era = getEraById(composer.era);
                  return (
                    <div
                      key={composer.id}
                      className="p-3 rounded-lg bg-[#1f1a15] border border-[#302820] hover:border-[#c99738]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectComposer(composer.id)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          <ComposerPortrait composer={composer} size="sm" />
                          <div>
                            <span className="text-xs font-bold text-[#f5ebd9] group-hover:text-[#c99738] transition-colors">
                              {composer.name}
                            </span>
                            <span className="text-[10px] text-[#9c9388] block font-mono">
                              {composer.birthYear}〜{composer.deathYear}年
                            </span>
                          </div>
                        </button>

                        <button
                          onClick={() => onSelectComposer(composer.id)}
                          className="text-[#9c9388] hover:text-[#f5ebd9] p-1"
                          title="詳細プロフィール"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2 text-[11px] text-[#9c9388] space-y-0.5 bg-[#171310] p-2 rounded">
                        <p><strong className="text-[#c99738]">役割:</strong> {role}</p>
                        <p><strong className="text-[#c99738]">出来事:</strong> {event}</p>
                      </div>

                      {/* Instant Play Composer Works */}
                      {composer.works[0] && (
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#262019]">
                          <span className="text-[10px] text-[#7d7366] truncate max-w-[180px]">
                            代表作: {composer.works[0].title}
                          </span>
                          <button
                            onClick={() => playTrack(composer.works[0], composer)}
                            className="flex items-center gap-1 text-[10px] text-[#c99738] hover:underline"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>試聴する</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Contemporaries across Europe during currentYear */}
        <div className="p-4 md:p-5 bg-[#141210]">
          <span className="text-xs font-semibold text-[#f5ebd9] block mb-2">
            {currentYear}年 当時の全欧州の存命音楽家 ({activeComposers.length}名)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeComposers.map(c => {
              const era = getEraById(c.era);
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectComposer(c.id)}
                  className="px-2 py-1 rounded bg-[#1e1b18] hover:bg-[#28231e] border border-[#332b22] text-[11px] text-[#e8dec8] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: era.color }} />
                  <span>{c.shortName}</span>
                  <span className="text-[9px] text-[#7d7366] font-mono">
                    ({currentYear - c.birthYear}歳)
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
