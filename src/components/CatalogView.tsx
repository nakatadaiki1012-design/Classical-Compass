import React, { useState, useMemo } from 'react';
import { Composer, EraId } from '../types';
import { getVisibleComposers } from '../data/composers';
import { ERAS, getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { COMPOSER_YOMI, REGIONS, regionOf, gyoOf } from '../data/composerMeta';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Search, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { yearText } from '../utils/yearLabel';

interface CatalogViewProps {
  onSelectComposer: (composerId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ onSelectComposer }) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudio();

  const [selectedEra, setSelectedEra] = useState<EraId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'birth' | 'kana' | 'region'>('birth');

  const filtered = useMemo(() => {
    return getVisibleComposers().filter(c => {
      if (selectedEra !== 'all' && c.era !== selectedEra) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q) || c.originalName.toLowerCase().includes(q);
        const matchWorks = c.works.some(w => w.title.toLowerCase().includes(q));
        if (!matchName && !matchWorks) return false;
      }
      return true;
    });
  }, [selectedEra, searchQuery]);

  // 並べ替え（生まれ順／五十音順／出身地域順）。地域・五十音のときは見出しをつける
  const groups = useMemo(() => {
    const byBirth = (a: Composer, b: Composer) => a.birthYear - b.birthYear || a.deathYear - b.deathYear;
    const yomi = (c: Composer) => COMPOSER_YOMI[c.id] || c.shortName;
    if (sortMode === 'birth') return [{ key: '', title: '', items: [...filtered].sort(byBirth) }];
    if (sortMode === 'kana') {
      const sorted = [...filtered].sort((a, b) => yomi(a).localeCompare(yomi(b), 'ja'));
      const out: { key: string; title: string; items: Composer[] }[] = [];
      sorted.forEach(c => {
        const g = gyoOf(yomi(c));
        const last = out[out.length - 1];
        if (last && last.key === g) last.items.push(c);
        else out.push({ key: g, title: g, items: [c] });
      });
      return out;
    }
    return REGIONS.map(r => ({
      key: r.id,
      title: r.name + (r.note ? `（${r.note}）` : ''),
      items: filtered.filter(c => regionOf(c) === r.id).sort(byBirth)
    })).filter(g => g.items.length > 0);
  }, [filtered, sortMode]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2924]">
        <div>
          <h2 className="font-classical-display font-bold text-xl md:text-2xl text-[#f5ebd9]">
            クラシック作曲家 名鑑
          </h2>
          <p className="text-xs text-[#b5aa9b] mt-1">
            バロックから20世紀まで、西洋音楽史を築いた大作曲家たちの生涯と名曲アーカイブ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#b5aa9b] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="作曲家や作品名を検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#241f19] border border-[#3d362e] rounded px-2.5 py-2 pl-8 text-sm text-[#f5ebd9] placeholder-[#8f8476] focus:outline-none focus:border-[#c99738] w-48 md:w-56"
            />
          </div>

          {/* 並べ替え */}
          <div className="flex items-center gap-1 bg-[#241f19] border border-[#3d362e] rounded p-0.5 text-xs">
            {([['birth', '生まれ順'], ['kana', '五十音順'], ['region', '出身地域順']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSortMode(id)}
                className={`px-2.5 py-1.5 rounded transition-colors ${
                  sortMode === id ? 'bg-[#c99738] text-black font-bold' : 'text-[#bdb1a1] hover:text-[#f5ebd9]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Era Filter */}
          <div className="flex items-center gap-1.5 bg-[#241f19] border border-[#3d362e] rounded px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#c99738]" />
            <select
              value={selectedEra}
              onChange={e => setSelectedEra(e.target.value as EraId | 'all')}
              className="bg-transparent text-[#f5ebd9] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#1e1b18]">全ての時代 ({getVisibleComposers().length})</option>
              {ERAS.map(e => (
                <option key={e.id} value={e.id} className="bg-[#1e1b18]">
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Composers */}
      {groups.map(group => (
      <section key={group.key || 'all'} className="space-y-3">
        {group.title && (
          <h3 className="font-classical-display font-bold text-base text-[#e6b95c] border-b border-[#2e2924] pb-1.5">
            {group.title}
            <span className="ml-2 text-xs font-normal text-[#a3978a]">{group.items.length}人</span>
          </h3>
        )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {group.items.map(composer => {
          const era = getEraById(composer.era);
          const age = composer.deathYear - composer.birthYear;
          const firstWork = composer.works[0];
          const isThisTrackActive = firstWork && currentTrack?.work.id === firstWork.id;

          return (
            <div
              key={composer.id}
              className="group bg-[#181512] border border-[#2b251e] hover:border-[#c99738]/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              <div>
                {/* Top card bar: Era & Lifespan */}
                <div className="flex items-center justify-between pb-3 border-b border-[#241e18]">
                  <span
                    className="text-[11px] font-semibold flex items-center gap-1.5"
                    style={{ color: era.accentColor }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: era.color }}
                    />
                    {era.name}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums text-[#a3978a]">
                    {yearText(composer.birthYear)} - {yearText(composer.deathYear)}（{age}歳）
                  </span>
                </div>

                {/* Composer info + portrait */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => onSelectComposer(composer.id)}
                    className="shrink-0 transition-transform group-hover:scale-105"
                  >
                    <ComposerPortrait composer={composer} size="lg" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => onSelectComposer(composer.id)}
                      className="text-left group/title"
                    >
                      <h3 className="font-classical-display font-bold text-[15px] leading-snug text-[#f5ebd9] group-hover/title:text-[#c99738] transition-colors">
                        {composer.name}
                      </h3>
                      <p className="text-xs font-serif italic text-[#a3978a] truncate">
                        {composer.originalName}
                      </p>
                    </button>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-[#b5aa9b]">
                      <span className="emoji">{composer.flag}</span>
                      <span>{composer.country}</span>
                    </div>
                  </div>
                </div>

                {/* Highlights tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {composer.keyFeatures.slice(0, 2).map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-[#201a15] text-[#d6cdbd] border border-[#30271e] truncate max-w-full"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Short bio preview */}
                <p className="text-[13px] text-[#c9bfb0] mt-3 line-clamp-3 leading-relaxed">
                  {composer.biography}
                </p>
              </div>

              {/* Bottom Card Actions: Representative work title & composition year + Full Details */}
              <div className="mt-5 pt-3 border-t border-[#241e18] flex items-center justify-between gap-2">
                {firstWork ? (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#201a15] text-[#c99738] text-xs font-medium border border-[#30271e] truncate min-w-0"
                    title={`代表作: ${firstWork.title} (${firstWork.year}年)`}
                  >
                    <Sparkles className="w-3 h-3 text-[#c99738] shrink-0" />
                    <span className="truncate">{firstWork.title} ({firstWork.year}年)</span>
                  </div>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => onSelectComposer(composer.id)}
                  className="px-2 py-1 rounded text-[#b5aa9b] hover:text-[#f5ebd9] hover:bg-[#241e18] transition-colors shrink-0 flex items-center text-xs gap-1 font-bold"
                >
                  <span>名鑑詳細</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </section>
      ))}
    </div>
  );
};
