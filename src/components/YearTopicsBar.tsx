import React, { useMemo, useState } from 'react';
import { Composition, Composer } from '../types';
import { EventDetailModal } from './EventDetailModal';
import { getYearTopics, YearTopic } from '../data/chronicle';

interface YearTopicsBarProps {
  year: number;
  visibleComposerIds: Set<string> | null;
  /** 近い年のトピックを押したとき、その年へ移動する */
  onJumpToYear?: (year: number) => void;
  /** トピックをタップして開く詳しい説明からの移動先 */
  onOpenComposer?: (composerId: string, year?: number) => void;
  onOpenWork?: (work: Composition, composer: Composer) => void;
}

const TAG_STYLE: Record<YearTopic['tag'], { label: string; className: string }> = {
  world: { label: '世界', className: 'bg-[#2a2622] text-[#d1c6b6] border-[#4a4238]' },
  history: { label: '音楽史', className: 'bg-[#2b2210] text-[#f0cd78] border-[#6b5420]' },
  birth: { label: '誕生', className: 'bg-[#16301f] text-[#86efac] border-[#2c5a3b]' },
  death: { label: '没', className: 'bg-[#35202b] text-[#fbcfe8] border-[#5e3a4c]' },
  work: { label: '作品', className: 'bg-[#33280f] text-[#f0cd78] border-[#6b5420]' },
  episode: { label: '音楽', className: 'bg-[#16263d] text-[#a9cdfb] border-[#2f4b73]' }
};

/** その年の重要なできごとを、短い一行（横にスクロールできる）で見せる帯。くわしくは下の欄へ */
export const YearTopicsBar: React.FC<YearTopicsBarProps> = ({
  year,
  visibleComposerIds,
  onJumpToYear,
  onOpenComposer,
  onOpenWork
}) => {
  const [selected, setSelected] = useState<YearTopic | null>(null);
  const { topics, hiddenCount, near } = useMemo(
    () => getYearTopics(year, { limit: 4, composerIds: visibleComposerIds }),
    [year, visibleComposerIds]
  );

  const chip = (t: YearTopic, key: string, extra?: React.ReactNode, onClick?: () => void) => {
    const style = TAG_STYLE[t.tag];
    const Tag = onClick ? 'button' : 'div';
    return (
      <Tag
        key={key}
        {...(onClick ? { onClick, type: 'button' as const } : {})}
        title={t.full}
        className={`shrink-0 max-w-[17rem] flex items-center gap-1.5 pl-1 pr-2.5 py-0.5 rounded-full bg-[#1a150f] border border-[#33291c] ${
          onClick ? 'hover:border-[#c99738]/60 transition-colors' : ''
        }`}
      >
        <span className={`px-1.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${style.className}`}>
          {style.label}
        </span>
        <span className="truncate text-xs text-[#e8dec8]">
          {t.who && <span className="text-[#a3978a]">{t.who}　</span>}
          {extra}
          {t.label}
        </span>
      </Tag>
    );
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5" aria-label={`${year}年のトピック`}>
      <span className="shrink-0 text-[11px] font-bold text-[#c99738] whitespace-nowrap">{year}年のトピック</span>
      {topics.map(t => chip(t, t.id, undefined, () => setSelected(t)))}
      {topics.length === 0 && near && chip(near, near.id, <span className="text-[#a3978a]">{near.year}年　</span>, () => setSelected(near))}
      {topics.length === 0 && !near && <span className="text-xs text-[#a3978a]">この年の主なできごとの記録はありません</span>}
      {hiddenCount > 0 && <span className="shrink-0 text-xs text-[#a3978a] whitespace-nowrap">ほか{hiddenCount}件は下に</span>}
      {selected && (
        <EventDetailModal
          event={selected.event}
          currentYear={year}
          onClose={() => setSelected(null)}
          onOpenComposer={(id, y) => onOpenComposer?.(id, y)}
          onOpenWork={(w, c) => (onOpenWork ? onOpenWork(w, c) : onOpenComposer?.(c.id, w.year))}
          onJumpToYear={y => onJumpToYear?.(y)}
        />
      )}
    </div>
  );
};
