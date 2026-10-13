import { createPortal } from 'react-dom';
import { yearText, yearTick } from '../utils/yearLabel';
import React, { useEffect, useMemo } from 'react';
import { MapPin, Music, UserRound, X } from 'lucide-react';
import { Composer, Composition } from '../types';
import { getComposerById } from '../data/composers';
import { getWhereabouts } from '../data/itinerary';
import { YearEvent } from '../data/chronicle';
import { ComposerPortrait } from './ComposerPortrait';
import { KIND_LABEL } from './eventStyles';
import { getWorkTrivia } from '../data/trivia';
import { getComposerEvents } from '../data/chronicle';
import { getEraById } from '../data/eras';

interface EventDetailModalProps {
  event: YearEvent;
  /** 見ている年（出来事の年と違うとき、「この年へ移動」を出す） */
  currentYear: number;
  onClose: () => void;
  onOpenComposer: (composerId: string, year?: number) => void;
  onOpenWork: (work: Composition, composer: Composer) => void;
  onJumpToYear: (year: number) => void;
}

const HISTORY_TAG = { label: '音楽史', className: 'bg-[#2b2210] text-[#f0cd78] border-[#6b5420]' };

/** 見出しをタップしたときに開く、くわしい記事（新聞の見出し→本文のイメージ） */
export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  currentYear,
  onClose,
  onOpenComposer,
  onOpenWork,
  onJumpToYear
}) => {
  // Escキーで閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const composer = event.composerId ? getComposerById(event.composerId) : undefined;
  const isHistory = event.kind === 'world' && event.title.startsWith('【音楽史】');
  const badge = isHistory ? HISTORY_TAG : KIND_LABEL[event.kind];
  const title = event.title.replace('【音楽史】', '');
  const age = composer && event.kind !== 'birth' ? event.year - composer.birthYear : null;

  // 本文：説明があればそれを、誕生・没年なら生い立ち・最期のエピソードを、なければその頃の居場所を
  const { body, extra } = useMemo(() => {
    let text = event.text || '';
    if (composer) {
      if (event.kind === 'birth' && composer.birthEpisode) text = composer.birthEpisode;
      if (event.kind === 'death' && composer.deathEpisode) text = composer.deathEpisode;
    }
    const where = composer ? getWhereabouts(composer, event.year) : null;

    // 説明が用意されていないできごとは、その人の年譜・居場所・時代の情報から説明を組み立てる
    if (!text && composer) {
      const parts: string[] = [];
      const ageNow = event.year - composer.birthYear;
      parts.push(
        `${composer.name}（${composer.birthYear}〜${composer.deathYear}年）が${ageNow}歳のときのできごと。` +
          (where ? `この頃は、${where.place.ja}で暮らしていた。${where.note}。` : '')
      );
      const related = getComposerEvents(composer.id)
        .filter(e => e.id !== event.id && e.text && e.kind !== 'birth' && e.kind !== 'death' && Math.abs(e.year - event.year) <= 3)
        .sort((a, b) => Math.abs(a.year - event.year) - Math.abs(b.year - event.year))
        .slice(0, 2);
      related.forEach(e => parts.push(`【${e.year}年】${e.title}\n${e.text}`));
      const era = getEraById(composer.era);
      parts.push(`${composer.biography.split('。')[0]}。`);
      parts.push(`この時代（${era.name}）：${era.description}`);
      text = parts.join('\n\n');
    }
    return {
      body: text,
      extra: where ? `${event.year}年ごろの居場所：${where.place.ja}（${where.note}）` : ''
    };
  }, [event, composer]);

  // 親の要素に隠れないよう、画面全体の一番上（body 直下）に出す
  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <article
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-[#17130f] border border-[#c99738]/60 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-[#bdb1a1] hover:text-white hover:bg-[#2b241c]"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 space-y-3.5">
          {/* 新聞の欄外のような小さな見出し行 */}
          <div className="flex flex-wrap items-center gap-2 text-xs pr-8">
            <span className="font-mono font-bold text-[#e6b95c] text-sm">{yearText(event.year)}</span>
            <span className={`px-1.5 py-0.5 rounded border text-[11px] font-bold ${badge.className}`}>{badge.label}</span>
          </div>

          <h2 className="font-classical-display font-bold text-xl leading-snug text-[#f5ebd9]">{title}</h2>

          {composer && (
            <div className="flex items-center gap-2.5 py-2 border-y border-[#2e251a]">
              <ComposerPortrait composer={composer} size="sm" showOrnateBorder={false} />
              <div className="min-w-0 text-sm">
                <div className="font-bold text-[#f5ebd9]">{composer.name}</div>
                <div className="text-xs text-[#a3978a]">
                  {age !== null ? `${age}歳（${composer.birthYear}〜${composer.deathYear}年）` : `${composer.birthYear}〜${composer.deathYear}年`}
                </div>
              </div>
            </div>
          )}

          {body ? (
            <p className="text-sm text-[#d6cdbd] leading-relaxed whitespace-pre-line">{body}</p>
          ) : (
            <p className="text-sm text-[#a3978a]">この見出しの、くわしい記事はまだありません。</p>
          )}

          {composer && event.playable && getWorkTrivia(composer.id, event.playable) && (
            <p className="rounded-lg bg-[#241e17] border border-[#3a2f20] px-3 py-2 text-[12.5px] leading-relaxed text-[#d9cfbd]">
              <span className="font-bold text-[#e6b95c] mr-1">蘊蓄</span>
              {getWorkTrivia(composer.id, event.playable)}
            </p>
          )}

          {extra && (
            <p className="text-xs text-[#b5aa9b] leading-relaxed rounded-lg bg-[#1d1812] border border-[#2e251a] px-3 py-2 flex gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#c99738] shrink-0 mt-0.5" />
              <span>{extra}</span>
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {composer && event.playable && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWork(event.playable!, composer);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#c99738] hover:bg-[#dbaa44] text-black text-xs font-bold"
              >
                <Music className="w-4 h-4" />
                <span>曲の解説を見る</span>
              </button>
            )}
            {composer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenComposer(composer.id, event.year);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#241e18] hover:bg-[#332b22] border border-[#c99738]/60 text-[#e8dec8] text-xs font-bold"
              >
                <UserRound className="w-4 h-4 text-[#c99738]" />
                <span>{composer.shortName}のくわしい紹介</span>
              </button>
            )}
            {event.year !== currentYear && (
              <button
                onClick={() => {
                  onClose();
                  onJumpToYear(event.year);
                }}
                className="px-3 py-2 rounded-lg bg-[#241e18] hover:bg-[#332b22] border border-[#3d362e] text-[#e8dec8] text-xs font-bold"
              >
                {event.year}年へ移動
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
    ,
    document.body
  );
};
