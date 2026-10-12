import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Globe2, Music2 } from 'lucide-react';
import { Composer, Composition } from '../types';
import { COMPOSERS, getComposerById } from '../data/composers';
import { getEventsForYear, getNearbyMusicEvents, getNearestEvents, YearEvent, YearEventKind } from '../data/chronicle';
import { ComposerPortrait } from './ComposerPortrait';

interface YearEventsPanelProps {
  year: number;
  /** 絞り込み中の作曲家ID（null なら全員） */
  visibleComposerIds: Set<string> | null;
  /** 地図画面など、画面の中に置くとき（閉じられず、下に固定もしない） */
  embedded?: boolean;
  /** 開閉を外から操作するとき（省略すると、この部品の中で管理する） */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectComposer: (composerId: string, year?: number) => void;
  onOpenWork: (work: Composition, composer: Composer) => void;
  onJumpToYear: (year: number) => void;
}

const KIND_ORDER: Record<YearEventKind, number> = { work: 0, episode: 1, birth: 2, death: 3, world: 4 };

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
  embedded = false,
  open,
  onOpenChange,
  onSelectComposer,
  onOpenWork,
  onJumpToYear
}) => {
  // 画面が狭いときは最初は閉じておく
  const [innerOpen, setInnerOpen] = useState<boolean>(
    () => typeof window === 'undefined' || window.innerWidth >= 768
  );
  const isOpen = open ?? innerOpen;
  const setIsOpen = (next: boolean | ((v: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(isOpen) : next;
    if (onOpenChange) onOpenChange(value);
    else setInnerOpen(value);
  };

  const { musicEvents, worldEvents } = useMemo(() => {
    const all = getEventsForYear(year);
    return {
      musicEvents: all
        .filter(
          e => e.kind !== 'world' && (!visibleComposerIds || (e.composerId && visibleComposerIds.has(e.composerId)))
        )
        .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]),
      worldEvents: all.filter(e => e.kind === 'world')
    };
  }, [year, visibleComposerIds]);

  const nearest = useMemo(
    () => (musicEvents.length === 0 ? getNearestEvents(year) : {}),
    [musicEvents.length, year]
  );

  // その年の音楽の記録が少ないときは、近い年の作品・できごとを補う
  const nearbyEvents = useMemo(
    () => (musicEvents.length < 3 ? getNearbyMusicEvents(year, { range: 6, limit: 6, composerIds: visibleComposerIds }) : []),
    [musicEvents.length, year, visibleComposerIds]
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
      else onSelectComposer(composer.id, ev.year);
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
    <div
      id={embedded ? 'year-events-detail' : undefined}
      className={
        embedded
          ? 'rounded-2xl bg-[#100d0a] border border-[#3a2d1c]'
          : 'shrink-0 bg-[#100d0a] border-t border-[#3a2d1c] shadow-[0_-8px_24px_rgba(0,0,0,0.5)] z-30'
      }
    >
      {/* 見出し（タップで開閉） */}
      <button
        onClick={() => !embedded && setIsOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-3 px-4 md:px-6 py-2.5 text-left ${embedded ? 'cursor-default' : ''}`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="font-classical-display font-bold text-base md:text-lg text-[#f5ebd9] whitespace-nowrap">
            {embedded ? `${year}年の作曲と大きな出来事` : `${year}年のできごと`}
          </span>
          <span className="text-xs text-[#b5aa9b] whitespace-nowrap">
            {total > 0 ? `音楽 ${musicEvents.length}件 ・ 世界 ${worldEvents.length}件` : '記録なし'}
          </span>
        </span>
        {!embedded && (
          <span className="flex items-center gap-1 text-xs text-[#c99738] shrink-0">
            {isOpen ? '閉じる' : '開く'}
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </span>
        )}
      </button>

      {(isOpen || embedded) && (
        <div className={`px-4 md:px-6 pb-4 space-y-3 ${embedded ? '' : 'max-h-[30vh] overflow-y-auto'}`}>
          {/* この年に生きていた作曲家と年齢 */}
          <div className="flex items-start gap-2">
            <span className="text-[11px] font-bold text-[#a3978a] shrink-0 pt-1">存命:</span>
            <div className="flex flex-wrap gap-1.5">
              {aliveComposers.length === 0 && <span className="text-xs text-[#a3978a] pt-0.5">登録された作曲家はいません</span>}
              {aliveComposers.map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelectComposer(c.id, year)}
                  className="px-2 py-0.5 rounded-full bg-[#1c1712] border border-[#33291c] text-xs text-[#e8dec8] hover:border-[#c99738]/60"
                >
                  {c.shortName}
                  <span className="text-[#a3978a]">（{year - c.birthYear}歳）</span>
                </button>
              ))}
            </div>
          </div>

          {total === 0 ? (
            <div className="rounded-lg bg-[#17130f] border border-[#2c2318] p-4 text-sm text-[#b5aa9b] space-y-3">
              <p>この年の記録はまだありません。近い年のできごと:</p>
              {nearbyEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {nearbyEvents.map(ev => {
                    const composer = ev.composerId ? getComposerById(ev.composerId) : undefined;
                    const badge = KIND_LABEL[ev.kind];
                    return (
                      <button
                        key={ev.id}
                        onClick={() => onJumpToYear(ev.year)}
                        className="w-full text-left flex gap-2.5 p-2.5 rounded-lg bg-[#14110d] border border-[#271f16] hover:border-[#c99738]/50 transition-colors"
                        title={`${ev.year}年へ移動`}
                      >
                        <span className="shrink-0 w-12 text-right text-[11px] font-mono font-bold text-[#e6b95c]">
                          {ev.year}年
                        </span>
                        <span className="min-w-0 text-xs text-[#d6cdbd] leading-snug">
                          <span className={`mr-1.5 px-1 rounded border text-[10px] font-bold ${badge.className}`}>
                            {badge.label}
                          </span>
                          {composer && <span className="text-[#a3978a]">{composer.shortName}　</span>}
                          <span className="font-semibold text-[#f5ebd9]">{ev.title}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
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
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#c99738]">
                  <Music2 className="w-3.5 h-3.5" />
                  <span>作曲・音楽のできごと</span>
                </div>
                {musicEvents.length === 0 ? (
                  <p className="text-xs text-[#a3978a]">この年の音楽の記録はありません。</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{musicEvents.map(renderMusicEvent)}</div>
                )}
                {nearbyEvents.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-[#a3978a]">
                      この年の記録が少ないため、近い年の作品・できごと
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {nearbyEvents.map(ev => {
                        const composer = ev.composerId ? getComposerById(ev.composerId) : undefined;
                        const badge = KIND_LABEL[ev.kind];
                        return (
                          <button
                            key={ev.id}
                            onClick={() => onJumpToYear(ev.year)}
                            className="w-full text-left flex gap-2.5 p-2.5 rounded-lg bg-[#14110d] border border-[#271f16] hover:border-[#c99738]/50 transition-colors"
                            title={`${ev.year}年へ移動`}
                          >
                            <span className="shrink-0 w-12 text-right text-[11px] font-mono font-bold text-[#e6b95c]">
                              {ev.year}年
                            </span>
                            <span className="min-w-0 text-xs text-[#d6cdbd] leading-snug">
                              <span className={`mr-1.5 px-1 rounded border text-[10px] font-bold ${badge.className}`}>
                                {badge.label}
                              </span>
                              {composer && <span className="text-[#a3978a]">{composer.shortName}　</span>}
                              <span className="font-semibold text-[#f5ebd9]">{ev.title}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
