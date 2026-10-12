import React, { useMemo } from 'react';
import { Composer } from '../types';
import { getWhereabouts } from '../data/itinerary';
import { getComposerEvents } from '../data/chronicle';
import { KIND_LABEL } from './eventStyles';

interface ComposerYearSnapshotProps {
  composer: Composer;
  year: number;
}

/** 「この年、この人はどこで何をしていたか」をまとめて見せる部品（地図のポップアップと人物詳細で共通） */
export const ComposerYearSnapshot: React.FC<ComposerYearSnapshotProps> = ({ composer, year }) => {
  const where = useMemo(() => getWhereabouts(composer, year), [composer, year]);

  // その年に近いできごとを最大4件（生誕・没年は、その年のときだけ）
  const { events, hasExactYear } = useMemo(() => {
    const list = getComposerEvents(composer.id).filter(
      e => !(e.kind === 'birth' || e.kind === 'death') || e.year === year
    );
    const sorted = [...list].sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year) || a.year - b.year);
    return {
      events: sorted.slice(0, 4).sort((a, b) => a.year - b.year),
      hasExactYear: list.some(e => e.year === year)
    };
  }, [composer.id, year]);

  return (
    <div className="space-y-3.5">
      {/* いる場所：滞在か旅行か、いつからいつまでか、移動してきた年か */}
      {where && (
        <div className="rounded-lg bg-[#1d1812] border border-[#2e251a] px-3 py-2.5 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span
              className={`px-1.5 py-0.5 rounded border font-bold ${
                where.isTrip
                  ? 'bg-[#33280f] text-[#f0cd78] border-[#6b5420]'
                  : 'bg-[#16263d] text-[#a9cdfb] border-[#2f4b73]'
              }`}
            >
              {where.isTrip ? '旅行・遠征・留学中' : '滞在中'}
            </span>
            {where.isEstimated ? (
              <span className="px-1.5 py-0.5 rounded border border-[#4a4238] text-[#d1c6b6] font-bold">推定</span>
            ) : (
              <span className="text-[#a3978a] font-mono">
                {where.startYear}〜{where.endYear}年
              </span>
            )}
            {where.movedFrom && (
              <span className="text-[#e6b95c] font-bold">この年に{where.movedFrom.ja}から移動</span>
            )}
          </div>
          <p className="text-xs text-[#e8dec8] leading-relaxed">
            <span className="font-bold text-[#c99738]">{where.place.ja}：</span>
            {where.note}
          </p>
          {where.isEstimated && (
            <p className="text-[11px] text-[#a3978a] leading-relaxed">
              この年の居場所の記録がないため、近い年（{where.basedOnYear}年）の居場所を表示しています。
            </p>
          )}
        </div>
      )}

      {/* この頃に何をしたか */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-[#c99738]">
          {hasExactYear ? `${year}年のできごと` : 'この年に近いできごと'}
        </div>
        {events.map(ev => {
          const badge = KIND_LABEL[ev.kind];
          return (
            <div key={ev.id} className="flex gap-2.5">
              <div className="shrink-0 w-14 text-right">
                <div className="text-[11px] font-mono font-bold text-[#e6b95c]">{ev.year}年</div>
                <span
                  className={`inline-block mt-0.5 px-1 rounded border text-[10px] font-bold whitespace-nowrap ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[#f5ebd9] leading-snug">{ev.title}</div>
                {ev.text && <p className="text-xs text-[#b5aa9b] leading-relaxed line-clamp-2 mt-0.5">{ev.text}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
