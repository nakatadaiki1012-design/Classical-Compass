import React, { useMemo } from 'react';
import { Composer, Composition } from '../types';
import { COMPOSERS, getComposerById } from '../data/composers';
import { getEventsForYear, getNearbyMusicEvents, YearEvent, YearEventKind } from '../data/chronicle';
import { KIND_LABEL } from './YearEventsPanel';

interface YearEventsOverlayProps {
  year: number;
  /** 絞り込み中の作曲家ID（null なら全員） */
  visibleComposerIds: Set<string> | null;
  onSelectComposer: (composerId: string, year?: number) => void;
  onOpenWork: (work: Composition, composer: Composer) => void;
  onJumpToYear: (year: number) => void;
}

const KIND_ORDER: Record<YearEventKind, number> = { world: 0, work: 1, episode: 2, birth: 3, death: 4 };

const HISTORY_TAG = { label: '音楽史', className: 'bg-[#2b2210] text-[#f0cd78] border-[#6b5420]' };

/**
 * 年表の下に重ねて出す、小さくて半透明の「その年のできごと」窓。
 * 1件を1〜2行で詰めて並べ、世界のできごと→作品→エピソードの順に、できるだけ多く見せる。
 */
export const YearEventsOverlay: React.FC<YearEventsOverlayProps> = ({
  year,
  visibleComposerIds,
  onSelectComposer,
  onOpenWork,
  onJumpToYear
}) => {
  const events = useMemo(() => {
    return getEventsForYear(year)
      .filter(e => e.kind === 'world' || !visibleComposerIds || (e.composerId && visibleComposerIds.has(e.composerId)))
      .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  }, [year, visibleComposerIds]);

  const musicCount = events.filter(e => e.kind !== 'world').length;

  const nearby = useMemo(
    () => (musicCount < 4 ? getNearbyMusicEvents(year, { range: 6, limit: 6, composerIds: visibleComposerIds }) : []),
    [musicCount, year, visibleComposerIds]
  );

  const alive = useMemo(
    () =>
      COMPOSERS.filter(
        c => c.birthYear <= year && year <= c.deathYear && (!visibleComposerIds || visibleComposerIds.has(c.id))
      ).sort((a, b) => a.birthYear - b.birthYear),
    [year, visibleComposerIds]
  );

  const item = (ev: YearEvent, opts: { showYear?: boolean } = {}) => {
    const composer = ev.composerId ? getComposerById(ev.composerId) : undefined;
    const isHistory = ev.kind === 'world' && ev.title.startsWith('【音楽史】');
    const badge = isHistory ? HISTORY_TAG : KIND_LABEL[ev.kind];
    const title = ev.title.replace('【音楽史】', '');
    const age = composer && ev.kind !== 'birth' ? ev.year - composer.birthYear : null;

    const handleClick = () => {
      if (opts.showYear) onJumpToYear(ev.year);
      else if (composer && ev.playable) onOpenWork(ev.playable, composer);
      else if (composer) onSelectComposer(composer.id, ev.year);
    };

    return (
      <button
        key={ev.id + (opts.showYear ? '-near' : '')}
        onClick={handleClick}
        title={opts.showYear ? `${ev.year}年へ移動` : undefined}
        className={`flex items-start gap-1.5 text-left px-1 py-0.5 rounded min-w-0 ${
          ev.kind === 'world' && !opts.showYear ? 'cursor-default' : 'hover:bg-white/10'
        }`}
      >
        <span className={`mt-px shrink-0 px-1 rounded border text-[10px] font-bold leading-4 whitespace-nowrap ${badge.className}`}>
          {badge.label}
        </span>
        <span className="block min-w-0 text-[12px] leading-[1.35] line-clamp-2">
          {opts.showYear && <span className="font-mono font-bold text-[#e6b95c] mr-1">{ev.year}</span>}
          {composer && (
            <span className="text-[#b9ad9c]">
              {composer.shortName}
              {age !== null && <span className="text-[#8f8476]">({age})</span>}{' '}
            </span>
          )}
          <span className="font-bold text-[#f5ebd9]">{title}</span>
          {ev.text && <span className="text-[#9c9184]">　{ev.text}</span>}
        </span>
      </button>
    );
  };

  return (
    <div
      className="absolute bottom-0 inset-x-0 z-40 bg-[#0b0806]/70 backdrop-blur-sm border-t border-[#c99738]/25 text-[#f5ebd9]"
      aria-label={`${year}年のできごと`}
    >
      {/* 見出し：年・件数・存命の作曲家（年齢つき）を1行に */}
      <div className="flex items-center gap-2 px-3 py-1 border-b border-white/5">
        <span className="shrink-0 font-classical-display font-bold text-sm whitespace-nowrap">{year}年のできごと</span>
        <span className="shrink-0 text-[11px] text-[#b5aa9b] whitespace-nowrap">
          {events.length > 0 ? `${events.length}件` : '記録なし'}
        </span>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 min-w-0">
          <span className="shrink-0 text-[10px] font-bold text-[#a3978a]">存命</span>
          {alive.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectComposer(c.id, year)}
              className="shrink-0 px-1.5 rounded-full border border-white/10 hover:border-[#c99738]/60 text-[11px] text-[#e8dec8] whitespace-nowrap"
            >
              {c.shortName}
              <span className="text-[#a3978a]">{year - c.birthYear}</span>
            </button>
          ))}
        </div>
      </div>

      {/* できごとの一覧（狭いときは1列、広いと2〜3列） */}
      <div className="max-h-[22vh] md:max-h-[24vh] overflow-y-auto px-2 py-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2 content-start">
        {events.map(ev => item(ev))}
        {events.length === 0 && nearby.length === 0 && (
          <span className="col-span-full text-[12px] text-[#a3978a] px-1 py-1">この年の記録はありません。</span>
        )}
        {nearby.length > 0 && (
          <>
            <div className="col-span-full text-[10px] font-bold text-[#a3978a] px-1 pt-1">
              {events.length === 0 ? 'この年の記録はありません。近い年の作品・できごと' : '近い年の作品・できごと'}
            </div>
            {nearby.map(ev => item(ev, { showYear: true }))}
          </>
        )}
      </div>
    </div>
  );
};
