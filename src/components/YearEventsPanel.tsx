import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Globe2, Music2 } from 'lucide-react';
import { Composer, Composition } from '../types';
import { COMPOSERS, getComposerById } from '../data/composers';
import { getEventsForYear, getNearestEvents, YearEvent, YearEventKind } from '../data/chronicle';
import { ComposerPortrait } from './ComposerPortrait';

interface YearEventsPanelProps {
  year: number;
  /** 絞り込み中の作曲家ID（null なら全員） */
  visibleComposerIds: Set<string> | null;
  onSelectComposer: (composerId: string) => void;
  onOpenWork: (work: Composition, composer: Composer) => void;
  onJumpToYear: (year: number) => void;
}

export const KIND_LABEL: Record<YearEventKind, { label: string; className: string }> = {
  birth: { label: '誕生', className: 'bg-[#16301f] text-[#86efac] border-[#2c5a3b]' },
  death: { label: '没', className: 'bg-[#35202b] text-[#fbcfe8] border-[#5e3a4c]' },
  work: { label: '作品', className: 'bg-[#33280f] text-[#f0cd78] border-[#6b5420]' },
  episode: { label: 'できごと', className: 'bg-[#16263d] text-[#a9cdfb] border-[#2f4b73]' },
  world: { label: '世界', className: 'bg-[#2a2622] text-[#d1c6b6] border-[#4a4238]' }
};

export const YearEventsPanel: React.FC<YearEventsPanelProps> = ({
  year,
  visibleComposerIds,
  onSelectComposer,
  onOpenWork,
  onJumpToYear
}) => {
  // 画面が狭いときは最初は閉じておく
  const [isOpen, setIsOpen] = useState<boolean>(
    () => typeof window === 'undefined' || window.innerWidth >= 768
  );

  const { musicEvents, worldEvents } = useMemo(() => {
    const all = getEventsForYear(year);
    return {
      musicEvents: all.filter(
        e => e.kind !== 'world' && (!visibleComposerIds || (e.composerId && visibleComposerIds.has(e.composerId)))
      ),
      worldEvents: all.filter(e => e.kind === 'world')
    };
  }, [year, visibleComposerIds]);

  const nearest = useMemo(
    () => (musicEvents.length === 0 ? getNearestEvents(year) : {}),
    [musicEvents.length, year]
  );

  const aliveComposers = useMemo(
    () =>
      COMPOSERS.filter(
        c => c.birthYear <= year && year <= c.deathYear && (!visibleComposerIds || visibleComposerIds.has(c.id))
      ).sort((a, b) => a.birthYear - b.birthYear),
    [year, visibleComposerIds]
  );

  const renderMusicEvent = (ev: YearEvent) => {
    const composer = ev.composerId ? getComposerById(ev.composerId) : undefined;
    const badge = KIND_LABEL[ev.kind];
    const age = composer && ev.kind !== 'birth' ? ev.year - composer.birthYear : null;

    const handleClick = () => {
      if (!composer) return;
      if (ev.playable) onOpenWork(ev.playable, composer);
      else onSelectComposer(composer.id);
    };

    return (
      <button
        key={ev.id}
        onClick={handleClick}
        className="w-full text-left flex gap-3 p-3 rounded-lg bg-[#17130f] border border-[#2c2318] hover:border-[#c99738]/60 hover:bg-[#1c1712] transition-colors"
      >
        {composer && <ComposerPortrait composer={composer} size="xs" className="shrink-0 mt-0.5" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className={`px-1.5 py-0.5 rounded border font-bold ${badge.className}`}>{badge.label}</span>
            {composer && (
              <span className="text-[#d6cdbd] font-semibold">
                {composer.shortName}
                {age !== null && <span className="text-[#a3978a] font-normal">（{age}歳）</span>}
              </span>
            )}
          </div>
          <div className="text-[13px] font-bold text-[#f5ebd9] mt-1 leading-snug">{ev.title}</div>
          {ev.text && <p className="text-xs text-[#b5aa9b] mt-0.5 leading-relaxed line-clamp-2">{ev.text}</p>}
        </div>
      </button>
    );
  };

  const total = musicEvents.length + worldEvents.length;

  return (
    <div className="shrink-0 bg-[#100d0a] border-t border-[#3a2d1c] shadow-[0_-8px_24px_rgba(0,0,0,0.5)] z-30">
      {/* 見出し（タップで開閉） */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 md:px-6 py-2.5 text-left"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="font-classical-display font-bold text-base md:text-lg text-[#f5ebd9] whitespace-nowrap">
            {year}年のできごと
          </span>
          <span className="text-xs text-[#b5aa9b] whitespace-nowrap">
            {total > 0 ? `音楽 ${musicEvents.length}件 ・ 世界 ${worldEvents.length}件` : '記録なし'}
          </span>
        </span>
        <span className="flex items-center gap-1 text-xs text-[#c99738] shrink-0">
          {isOpen ? '閉じる' : '開く'}
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 md:px-6 pb-4 max-h-[30vh] overflow-y-auto space-y-3">
          {/* この年に生きていた作曲家と年齢 */}
          <div className="flex items-start gap-2">
            <span className="text-[11px] font-bold text-[#a3978a] shrink-0 pt-1">存命:</span>
            <div className="flex flex-wrap gap-1.5">
              {aliveComposers.length === 0 && <span className="text-xs text-[#a3978a] pt-0.5">登録された作曲家はいません</span>}
              {aliveComposers.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectComposer(c.id)}
                  className="px-2 py-0.5 rounded-full bg-[#1c1712] border border-[#33291c] text-xs text-[#e8dec8] hover:border-[#c99738]/60"
                >
                  {c.shortName}
                  <span className="text-[#a3978a]">（{year - c.birthYear}歳）</span>
                </button>
              ))}
            </div>
          </div>

          {total === 0 ? (
            <div className="rounded-lg bg-[#17130f] border border-[#2c2318] p-4 text-sm text-[#b5aa9b] space-y-2">
              <p>この年の記録はまだありません。近い年のできごと:</p>
              <div className="flex flex-wrap gap-2">
                {nearest.prev && (
                  <button
                    onClick={() => onJumpToYear(nearest.prev!.year)}
                    className="text-left px-3 py-2 rounded-lg bg-[#1c1712] border border-[#33291c] hover:border-[#c99738]/60 text-xs text-[#e8dec8]"
                  >
                    ◀ {nearest.prev.year}年　{nearest.prev.title}
                  </button>
                )}
                {nearest.next && (
                  <button
                    onClick={() => onJumpToYear(nearest.next!.year)}
                    className="text-left px-3 py-2 rounded-lg bg-[#1c1712] border border-[#33291c] hover:border-[#c99738]/60 text-xs text-[#e8dec8]"
                  >
                    {nearest.next.year}年　{nearest.next.title} ▶
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#c99738]">
                  <Music2 className="w-3.5 h-3.5" />
                  <span>音楽のできごと</span>
                </div>
                {musicEvents.length === 0 ? (
                  <p className="text-xs text-[#a3978a]">この年の音楽の記録はありません。</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{musicEvents.map(renderMusicEvent)}</div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#d1c6b6]">
                  <Globe2 className="w-3.5 h-3.5" />
                  <span>世界のできごと</span>
                </div>
                {worldEvents.length === 0 ? (
                  <p className="text-xs text-[#a3978a]">この年の記録はありません。</p>
                ) : (
                  worldEvents.map(ev => (
                    <div key={ev.id} className="p-3 rounded-lg bg-[#17130f] border border-[#2c2318]">
                      <div className="text-[13px] font-bold text-[#f5ebd9] leading-snug">{ev.title}</div>
                      {ev.text && <p className="text-xs text-[#b5aa9b] mt-0.5 leading-relaxed">{ev.text}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
