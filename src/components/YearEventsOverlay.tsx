import React, { useMemo, useState } from 'react';
import { yearText, yearTick } from '../utils/yearLabel';
import { Composer, Composition } from '../types';
import { getVisibleComposers, getComposerById } from '../data/composers';
import { getEventsForYear, getNearbyMusicEvents, YearEvent, YearEventKind } from '../data/chronicle';
import { KIND_LABEL } from './eventStyles';
import { EventDetailModal } from './EventDetailModal';
import { PeriodModal } from './PeriodModal';
import { getPeriodsAt, MusicPeriod } from '../data/musicPeriods';
import { useJapanMode } from '../utils/japanMode';

interface YearEventsOverlayProps {
  year: number;
  /** 絞り込み中の作曲家ID（null なら全員） */
  visibleComposerIds: Set<string> | null;
  /** true なら、画面の中に置く普通の欄（地図画面用）。false なら年表の下に重ねる半透明の窓 */
  inline?: boolean;
  onSelectComposer: (composerId: string, year?: number) => void;
  onOpenWork: (work: Composition, composer: Composer) => void;
  onJumpToYear: (year: number) => void;
}

const KIND_ORDER: Record<YearEventKind, number> = { world: 0, work: 1, episode: 2, birth: 3, death: 4 };

const HISTORY_TAG = { label: '音楽史', className: 'bg-[#2b2210] text-[#f0cd78] border-[#6b5420]' };

/**
 * その年のできごとを「新聞の見出し」程度に1行ずつ並べる窓。
 * 見出しをタップすると、くわしい記事（EventDetailModal）が開く。
 */
export const YearEventsOverlay: React.FC<YearEventsOverlayProps> = ({
  year,
  visibleComposerIds,
  inline = false,
  onSelectComposer,
  onOpenWork,
  onJumpToYear
}) => {
  const [selected, setSelected] = useState<YearEvent | null>(null);
  const [openPeriod, setOpenPeriod] = useState<MusicPeriod | null>(null);
  const japanMode = useJapanMode();
  // この頃の主流の音楽（時代）。新しく始まった時代から最大2つ
  const periods = useMemo(() => getPeriodsAt(year, japanMode).slice(0, 3), [year, japanMode]);

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
      getVisibleComposers().filter(
        c => c.birthYear <= year && year <= c.deathYear && (!visibleComposerIds || visibleComposerIds.has(c.id))
      ).sort((a, b) => a.birthYear - b.birthYear),
    [year, visibleComposerIds]
  );

  // 見出し1行（種類・人名・短い題だけ）。くわしくはタップで
  const headline = (ev: YearEvent, opts: { showYear?: boolean } = {}) => {
    const composer = ev.composerId ? getComposerById(ev.composerId) : undefined;
    const isHistory = ev.kind === 'world' && ev.title.startsWith('【音楽史】');
    const badge = isHistory ? HISTORY_TAG : KIND_LABEL[ev.kind];
    const title = ev.title.replace('【音楽史】', '');
    return (
      <button
        key={ev.id + (opts.showYear ? '-near' : '')}
        onClick={() => setSelected(ev)}
        title={title}
        className="flex items-center gap-1.5 text-left px-1 py-[3px] rounded min-w-0 hover:bg-white/10"
      >
        <span className={`shrink-0 px-1 rounded border text-[10px] font-bold leading-4 whitespace-nowrap ${badge.className}`}>
          {badge.label}
        </span>
        <span className="truncate text-[12.5px] leading-snug">
          {opts.showYear && <span className="font-mono font-bold text-[#e6b95c] mr-1">{ev.year}</span>}
          {composer && <span className="text-[#b9ad9c]">{composer.shortName}　</span>}
          <span className="font-bold text-[#f5ebd9]">{title}</span>
        </span>
      </button>
    );
  };

  return (
    <>
      <div
        className={
          inline
            ? 'rounded-2xl bg-[#100d0a]/90 border border-[#3a2d1c] text-[#f5ebd9]'
            : 'absolute bottom-0 inset-x-0 z-40 bg-[#0b0806]/70 backdrop-blur-sm border-t border-[#c99738]/25 text-[#f5ebd9]'
        }
        aria-label={`${year}年のできごと`}
      >
        {/* 見出し：年・件数・存命の作曲家（年齢つき）を1行に */}
        <div className="flex items-center gap-2 px-3 py-1 border-b border-white/5">
          <span className="shrink-0 font-classical-display font-bold text-sm whitespace-nowrap">{yearText(year)}のできごと</span>
          <span className="shrink-0 text-[11px] text-[#b5aa9b] whitespace-nowrap">
            {events.length > 0 ? `${events.length}件・タップでくわしく` : '記録なし'}
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

        {/* この頃の主流の音楽（時代）。タップで用語の解説 */}
        {periods.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-[3px] border-b border-white/5 overflow-x-auto scrollbar-none">
            <span className="shrink-0 text-[10px] font-bold text-[#e6b95c]">この頃の主流</span>
            {periods.map(p => (
              <button
                key={p.id}
                onClick={() => setOpenPeriod(p)}
                title={p.mainstream}
                className="shrink-0 flex items-center gap-1 px-2 rounded-full border text-[11.5px] text-[#f5ebd9] whitespace-nowrap hover:bg-white/10"
                style={{ borderColor: p.color + 'aa' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
                <span className="font-bold">{p.name.replace('日本：', '日本・').split('（')[0]}</span>
                <span className="text-[#b9ad9c] hidden md:inline">{p.mainstream.split('、')[0]}</span>
              </button>
            ))}
          </div>
        )}

        {/* 見出しの一覧（狭いときは1列、広いと2〜3列） */}
        <div
          className={`overflow-y-auto px-2 py-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2 content-start ${
            inline ? 'max-h-[40vh]' : 'max-h-[22vh] md:max-h-[24vh]'
          }`}
        >
          {events.map(ev => headline(ev))}
          {events.length === 0 && nearby.length === 0 && (
            <span className="col-span-full text-[12px] text-[#a3978a] px-1 py-1">この年の記録はありません。</span>
          )}
          {nearby.length > 0 && (
            <>
              <div className="col-span-full text-[10px] font-bold text-[#a3978a] px-1 pt-1">
                {events.length === 0 ? 'この年の記録はありません。近い年の見出し' : '近い年の見出し'}
              </div>
              {nearby.map(ev => headline(ev, { showYear: true }))}
            </>
          )}
        </div>
      </div>

      {openPeriod && (
        <PeriodModal
          period={openPeriod}
          onClose={() => setOpenPeriod(null)}
          onOpenComposer={id => onSelectComposer(id, year)}
        />
      )}

      {selected && (
        <EventDetailModal
          event={selected}
          currentYear={year}
          onClose={() => setSelected(null)}
          onOpenComposer={onSelectComposer}
          onOpenWork={onOpenWork}
          onJumpToYear={onJumpToYear}
        />
      )}
    </>
  );
};
