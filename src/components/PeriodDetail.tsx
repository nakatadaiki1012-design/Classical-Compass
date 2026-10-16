import React from 'react';
import { MusicPeriod, PERIOD_IMAGE } from '../data/musicPeriods';
import { useWikiImage } from '../utils/useWikiPortrait';
import { WikiThumb, HoverImage } from './WikiImage';
import { imageKeyFor } from '../data/imageHints';
import { getComposerById } from '../data/composers';
import { LinkedText, WikiLink } from './LinkedText';

/** 年の表記（紀元前も読みやすく） */
export const yearLabel = (y: number) => (y < 0 ? `紀元前${-y}年` : y >= 2030 ? '現在' : `${y}年`);
export const periodRange = (p: MusicPeriod) => `${yearLabel(p.start)}〜${yearLabel(p.end)}`;

interface PeriodDetailProps {
  period: MusicPeriod;
  /** 用語を絞り込む文字（音楽史画面の検索用） */
  filter?: string;
  onOpenComposer?: (composerId: string) => void;
}

/** 時代の画像（ウィキペディアの代表画像）。取れないときは何も出さない */
export const PeriodImage: React.FC<{ periodId: string; className?: string; captionless?: boolean }> = ({
  periodId,
  className = '',
  captionless
}) => {
  const key = PERIOD_IMAGE[periodId] || '';
  const url = useWikiImage(key);
  const [failed, setFailed] = React.useState(false);
  if (!url || failed) return null;
  return (
    <figure className={className}>
      <img
        src={url}
        alt={key.split('|')[1] || key.split('|')[0]}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-w-full max-h-72 w-auto h-auto mx-auto object-contain rounded-lg border border-white/10"
      />
      {!captionless && (
        <figcaption className="mt-1 text-[10px] text-[#8f8476]">画像：ウィキペディア「{key.split('|')[1]}」より</figcaption>
      )}
    </figure>
  );
};

/** ひとつの時代の説明（主流の音楽・用語・できごと・作曲家） */
export const PeriodDetail: React.FC<PeriodDetailProps> = ({ period, filter = '', onOpenComposer }) => {
  const q = filter.trim();
  const terms = q ? period.terms.filter(([t, d]) => (t + d).includes(q)) : period.terms;
  const composers = period.composerIds
    .map(id => getComposerById(id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  return (
    <div className="space-y-4 text-[#e8dec8]">
      <PeriodImage periodId={period.id} />
      <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: period.color + '88', background: period.color + '18' }}>
        <span className="text-[11px] font-bold text-[#e6b95c] mr-2">主流の音楽</span>
        <span className="font-bold text-[#f5ebd9]"><LinkedText text={period.mainstream} exclude={[`period:${period.id}`]} /></span>
      </div>
      <p className="text-sm leading-relaxed text-[#d6cdbd]"><LinkedText text={period.summary} exclude={[`period:${period.id}`]} /></p>

      <section>
        <h4 className="text-xs font-bold text-[#e6b95c] mb-1.5">覚えておきたい用語（{terms.length}）</h4>
        <dl className="space-y-1.5">
          {terms.map(([term, desc]) => (
            <div key={term} className="rounded bg-white/[0.04] px-2.5 py-1.5 flex gap-2.5">
              <div className="min-w-0 flex-1">
                <dt className="text-[13px] font-bold text-[#f5ebd9]">
                  <HoverImage imageKey={imageKeyFor(term)}><WikiLink target={{ kind: 'term', id: term }}>{term}</WikiLink></HoverImage>
                </dt>
                <dd className="text-[12.5px] leading-relaxed text-[#c9bfb0]"><LinkedText text={desc} exclude={[`period:${period.id}`, `term:${term}`]} /></dd>
              </div>
              <WikiThumb imageKey={imageKeyFor(term)} className="shrink-0 w-16 h-16 self-center" />
            </div>
          ))}
          {terms.length === 0 && <p className="text-xs text-[#a3978a]">「{q}」に当てはまる用語はありません。</p>}
        </dl>
      </section>

      <section>
        <h4 className="text-xs font-bold text-[#e6b95c] mb-1.5">この時代のできごと</h4>
        <ul className="space-y-1">
          {period.events.map(([when, text]) => (
            <li key={when + text} className="flex gap-2 text-[12.5px] leading-snug">
              <span className="shrink-0 w-24 font-mono font-bold text-[#e6b95c]">{when}</span>
              <HoverImage imageKey={imageKeyFor(when + text)} className="text-[#d6cdbd]"><LinkedText text={text} exclude={[`period:${period.id}`]} /></HoverImage>
            </li>
          ))}
        </ul>
      </section>

      {(composers.length > 0 || (period.otherPeople && period.otherPeople.length > 0)) && (
        <section>
          <h4 className="text-xs font-bold text-[#e6b95c] mb-1.5">この時代の作曲家・人物</h4>
          <div className="flex flex-wrap gap-1.5">
            {composers.map(c => (
              <button
                key={c.id}
                onClick={() => onOpenComposer?.(c.id)}
                className="px-2 py-0.5 rounded-full border border-[#c99738]/50 text-[12px] text-[#f5ebd9] hover:bg-[#c99738]/20"
              >
                {c.shortName}
              </button>
            ))}
            {period.otherPeople?.map(n => (
              <span key={n} className="px-2 py-0.5 rounded-full border border-white/10 text-[12px] text-[#b9ad9c]">
                {n}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
