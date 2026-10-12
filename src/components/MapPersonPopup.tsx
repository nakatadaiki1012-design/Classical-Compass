import React, { useMemo } from 'react';
import { ChevronRight, Pause, Play, X } from 'lucide-react';
import { Composer } from '../types';
import { Whereabouts } from '../data/itinerary';
import { ComposerPortrait } from './ComposerPortrait';
import { KIND_LABEL } from './YearEventsPanel';
import { ComposerYearSnapshot } from './ComposerYearSnapshot';
import { useAudio } from '../context/AudioContext';

interface MapPersonPopupProps {
  composer: Composer;
  year: number;
  where: Whereabouts;
  onClose: () => void;
  onOpenProfile: (composerId: string) => void;
}

/** 地図のピンを押したときに出る、「その年この人は何をしていたか」の小さな説明カード */
export const MapPersonPopup: React.FC<MapPersonPopupProps> = ({
  composer,
  year,
  where,
  onClose,
  onOpenProfile
}) => {
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const age = year - composer.birthYear;

  // 試聴: その年に一番近い作品
  const nearestWork = useMemo(
    () => [...composer.works].sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year))[0],
    [composer.works, year]
  );
  const isThisPlaying = nearestWork ? isPlaying && currentTrack?.work.id === nearestWork.id : false;

  return (
    <div
      className="relative md:absolute md:top-3 md:right-3 md:w-[360px] md:max-h-[calc(100%-1.5rem)] mt-3 md:mt-0 overflow-y-auto rounded-2xl bg-[#171410]/97 border border-[#c99738]/70 shadow-2xl shadow-black/70 z-20"
      role="dialog"
      aria-label={`${composer.name}について`}
    >
      <button
        onClick={onClose}
        className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-[#bdb1a1] hover:text-white hover:bg-[#2b241c]"
        aria-label="閉じる"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-4 space-y-3.5">
        {/* だれが・いつ・どこで */}
        <div className="flex items-center gap-3 pr-8">
          <ComposerPortrait composer={composer} size="md" showOrnateBorder={true} className="shrink-0" />
          <div className="min-w-0">
            <div className="text-base font-bold text-[#f5ebd9] font-classical-display leading-snug">
              {composer.flag} {composer.shortName}
            </div>
            <div className="text-xs text-[#d6cdbd] mt-0.5">
              {year}年・{age}歳　📍{where.place.ja}
            </div>
            <div className="text-[11px] text-[#a3978a] mt-0.5">
              {composer.birthYear}〜{composer.deathYear}年（享年{composer.deathYear - composer.birthYear}歳）
            </div>
          </div>
        </div>

        {year === composer.birthYear && (
          <div className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${KIND_LABEL.birth.className}`}>
            この年に生まれました
          </div>
        )}
        {year === composer.deathYear && (
          <div className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${KIND_LABEL.death.className}`}>
            この年に亡くなりました
          </div>
        )}

        <ComposerYearSnapshot composer={composer} year={year} />

        {/* 操作 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {nearestWork && (
            <button
              onClick={() => playTrack(nearestWork, composer)}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#c99738] hover:bg-[#dbaa44] text-black text-xs font-bold"
            >
              {isThisPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="truncate">{isThisPlaying ? '停止' : `曲を聴く（${nearestWork.year}年）`}</span>
            </button>
          )}
          <button
            onClick={() => onOpenProfile(composer.id)}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#241e18] hover:bg-[#332b22] border border-[#c99738]/60 text-[#e8dec8] text-xs font-bold"
          >
            <span>くわしい紹介</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#c99738]" />
          </button>
        </div>
      </div>
    </div>
  );
};
