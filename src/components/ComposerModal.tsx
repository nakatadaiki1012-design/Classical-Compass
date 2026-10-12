import React from 'react';
import { Composer } from '../types';
import { getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { useAudio } from '../context/AudioContext';
import {
  X,
  Play,
  Pause,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  Music,
  Users
} from 'lucide-react';

interface ComposerModalProps {
  composer: Composer | null;
  onClose: () => void;
  onSelectComposer: (composerId: string) => void;
}

export const ComposerModal: React.FC<ComposerModalProps> = ({
  composer,
  onClose,
  onSelectComposer
}) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  if (!composer) return null;

  const era = getEraById(composer.era);
  const age = composer.deathYear - composer.birthYear;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#161412] border border-[#383127] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header / Close */}
        <div className="px-6 py-4 bg-[#1f1a15] border-b border-[#30281f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: era.color }}
            />
            <span className="text-xs font-semibold" style={{ color: era.accentColor }}>
              {era.name} ({era.startYear}〜{era.endYear})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#b5aa9b] hover:text-[#f5ebd9] hover:bg-[#2b241c] rounded-lg transition-colors"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          {/* Hero Section: Portrait & Identity */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start pb-6 border-b border-[#29221a]">
            {/* Portrait with classical ornate medallion */}
            <div className="shrink-0 flex flex-col items-center">
              <ComposerPortrait
                composer={composer}
                size="xl"
                showOrnateBorder={true}
                className="shadow-2xl ring-4 ring-[#c99738]/40"
              />
              <div className="mt-3 text-center max-w-[200px] bg-[#1a1714] border border-[#332a20] rounded-lg p-2">
                <span className="text-[11px] font-semibold text-[#c99738] block">
                  著作権フリー（パブリックドメイン）
                </span>
                <span className="text-[11px] text-[#b5aa9b] block mt-0.5">
                  {composer.portraitPainter || '歴史的肖像画（18〜19世紀原画）'}
                </span>
                <span className="text-[10px] text-[#a3978a] block">
                  {composer.portraitAttribution || '没後70年以上経過・公有財産'}
                </span>
              </div>
            </div>

            {/* Name, Bio highlights */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="text-xl">{composer.flag}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#241f19] text-[#c99738] font-mono">
                  {composer.country}
                </span>
                <span className="text-xs text-[#b5aa9b] font-mono tabular-nums">
                  {composer.birthYear}年 - {composer.deathYear}年（享年{age}歳）
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-classical-display font-bold text-[#f5ebd9] mt-2">
                {composer.name}
              </h2>
              <p className="text-sm font-serif italic text-[#c99738] tracking-wider mt-0.5">
                {composer.originalName}
              </p>

              {composer.historicalQuote && (
                <blockquote className="mt-4 p-3 rounded bg-[#1f1a15] border-l-2 border-[#c99738] text-xs md:text-sm font-serif italic text-[#d6cdbd] leading-relaxed text-left">
                  {composer.historicalQuote}
                </blockquote>
              )}

              {/* Key Traits Badges */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                {composer.keyFeatures.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-[#241f19] border border-[#383025] text-[#e8dec8] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-[#c99738]" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Representative Works & Interactive Player */}
          <div className="space-y-4">
            <h3 className="text-base font-classical-display font-bold text-[#f5ebd9] flex items-center gap-2">
              <Music className="w-4 h-4 text-[#c99738]" />
              <span>代表曲・主要作品（試聴プレーヤー連動）</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {composer.works.map(work => {
                const isCurrent = currentTrack?.work.id === work.id;
                return (
                  <div
                    key={work.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrent
                        ? 'bg-[#241f19] border-[#c99738] ring-1 ring-[#c99738]'
                        : 'bg-[#1b1713] border-[#2e261e] hover:border-[#473c2f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#141210] text-[#c99738] font-semibold">
                          {work.genreJa} · {work.year}年
                        </span>
                        <h4 className="text-sm font-bold text-[#f5ebd9] mt-1.5 leading-snug">
                          {work.title}
                        </h4>
                        <p className="text-[11px] font-serif italic text-[#a3978a] truncate">
                          {work.originalTitle}
                        </p>
                      </div>

                      {/* Composition Year Badge */}
                      <span className="px-2.5 py-1 rounded bg-[#241e19] border border-[#c99738]/40 text-[#c99738] font-mono font-bold text-xs shrink-0">
                        {work.year}年 作曲
                      </span>
                    </div>

                    <p className="text-xs text-[#a39888] mt-3 leading-relaxed">
                      {work.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-[#262019] flex items-center justify-between text-[11px] text-[#a3978a]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#c99738]" />
                        <span>作曲地: {work.city}</span>
                      </span>
                      <span className="font-mono text-[11px] text-[#c99738]">
                        ジャンル: {work.genreJa}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Detailed Biography (経歴) */}
          <div className="space-y-3">
            <h3 className="text-base font-classical-display font-bold text-[#f5ebd9] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c99738]" />
              <span>生涯と経歴</span>
            </h3>
            <p className="text-sm text-[#d4cbbe] leading-relaxed whitespace-pre-line p-4 rounded-lg bg-[#191612] border border-[#2b241c]">
              {composer.biography}
            </p>
          </div>

          {/* Section: Musical Style & Innovation (音楽的特徴) */}
          <div className="space-y-3">
            <h3 className="text-base font-classical-display font-bold text-[#f5ebd9] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#c99738]" />
              <span>音楽的特徴と革新性</span>
            </h3>
            <div className="p-4 rounded-lg bg-[#191612] border border-[#2b241c]">
              <p className="text-sm text-[#d4cbbe] leading-relaxed">
                {composer.musicalStyle}
              </p>
            </div>
          </div>

          {/* Section: European Journey & City Stays (活動拠点と都市) */}
          <div className="space-y-3">
            <h3 className="text-base font-classical-display font-bold text-[#f5ebd9] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c99738]" />
              <span>主な活動拠点と都市（ヨーロッパ音楽史）</span>
            </h3>
            <div className="space-y-2">
              {composer.cities.map((city, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#191612] border border-[#2b241c] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-bold text-[#f5ebd9] flex items-center gap-1.5">
                      <span className="text-[#c99738]">{city.cityNameJa}</span>
                      <span className="text-[#b5aa9b] font-normal">({city.country})</span>
                      <span className="text-[11px] font-mono text-[#a3978a]">
                        {city.startYear}〜{city.endYear}年
                      </span>
                    </span>
                    <p className="text-xs text-[#a39888] mt-1">{city.notableEvent}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-[#241f19] text-[#c99738] self-start sm:self-auto shrink-0 font-medium">
                    {city.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Contemporaries (同時代の音楽家たち) */}
          {composer.contemporaries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-classical-display font-bold text-[#f5ebd9] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#c99738]" />
                <span>同時代の作曲家・交流</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {composer.contemporaries.map((name, idx) => {
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-[#221c17] border border-[#332a20] text-xs text-[#e8dec8]"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
