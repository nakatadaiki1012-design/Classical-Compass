import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ExternalLink, Headphones, MapPin, Sparkles, X } from 'lucide-react';
import { Composer, Composition } from '../types';
import { ComposerPortrait } from './ComposerPortrait';
import { getWorkTrivia } from '../data/trivia';
import { getWorkGuide } from '../data/workGuides';
import { getComposerEvents } from '../data/chronicle';
import { getFreeMediaLinks, mayBeCopyrighted } from '../utils/freeMedia';
import { yearText } from '../utils/yearLabel';

interface WorkModalProps {
  work: Composition;
  composer: Composer;
  onClose: () => void;
  onOpenComposer?: (composerId: string, year?: number) => void;
}

/** 曲の解説ポップアップ：曲の話・聴きどころ・蘊蓄・著作権フリー音源へのリンク */
export const WorkModal: React.FC<WorkModalProps> = ({ work, composer, onClose, onOpenComposer }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const trivia = getWorkTrivia(composer.id, work);
  const guide = getWorkGuide(composer.id, work);
  const links = getFreeMediaLinks(composer, work);
  const age = work.year - composer.birthYear;
  // この曲の前後2年に、同じ人に起きた出来事（曲の背景として）
  const around = getComposerEvents(composer.id)
    .filter(e => e.kind === 'episode' && e.text && Math.abs(e.year - work.year) <= 2)
    .slice(0, 2);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      onClick={onClose}
    >
      <article
        className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl bg-[#17130f] border border-[#c99738]/60 shadow-2xl text-[#f5ebd9]"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full text-[#bdb1a1] hover:text-white hover:bg-[#2b241c]"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 pr-8">
            <ComposerPortrait composer={composer} size="sm" />
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#c99738]">{composer.name}</div>
              <h3 className="text-base font-bold leading-snug">{work.title}</h3>
              <p className="text-xs text-[#b5aa9b] font-serif italic">{work.originalTitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#c99738] border border-[#c99738]/40 font-mono font-bold">
              {yearText(work.year)} 作曲（{age > 0 ? `${age}歳` : '生まれる前'}）
            </span>
            <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#e8dec8] border border-[#382e23]">{work.genreJa}</span>
            <span className="px-2.5 py-1 rounded bg-[#261f18] text-[#e8dec8] border border-[#382e23] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#c99738]" />
              {work.city}
            </span>
          </div>

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              どんな曲？
            </h4>
            <p className="text-[13px] text-[#d1c6b6] leading-relaxed bg-[#110f0d] p-3 rounded-lg border border-[#241e17]">{work.description}</p>
          </section>

          {guide.text && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                {guide.specific ? '聴きどころ' : '聴き方のヒント'}
              </h4>
              <p className="text-[13px] text-[#d9cfbd] leading-relaxed bg-[#1d1812] p-3 rounded-lg border border-[#2e251a]">{guide.text}</p>
            </section>
          )}

          {trivia && (
            <p className="text-[13px] text-[#d9cfbd] leading-relaxed bg-[#241e17] p-3 rounded-lg border border-[#3a2f20]">
              <span className="font-bold text-[#e6b95c] mr-1">蘊蓄</span>
              {trivia}
            </p>
          )}

          {around.length > 0 && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#c99738]">このころの{composer.shortName}</h4>
              {around.map(e => (
                <p key={e.id} className="text-xs text-[#b5aa9b] leading-relaxed">
                  <span className="font-mono text-[#e6b95c]">{yearText(e.year)}</span>　{e.title}
                  <span className="block text-[#a3978a] mt-0.5">{e.text}</span>
                </p>
              ))}
            </section>
          )}

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              著作権フリーの音源・動画・楽譜を探す
            </h4>
            <ul className="space-y-1.5">
              {links.map(l => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#1d1812] hover:bg-[#2a2218] border border-[#2e251a] text-[13px]"
                  >
                    <span className="min-w-0">
                      <span className="block font-bold text-[#f0e4cc]">{l.label}</span>
                      <span className="block text-[11px] text-[#a3978a]">{l.note}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#c99738] shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-[#a3978a] leading-relaxed">
              ※ 検索結果のページが開きます。曲によっては見つからないことがあります。
              {mayBeCopyrighted(composer)
                ? '比較的新しい作曲家の作品は、録音や楽譜に権利があり、自由に使える音源がほとんどない場合があります。'
                : '作曲者の没後70年以上たっているので曲自体は自由に使えますが、録音には権利がある場合があるため、各ページの表示を確認してください。'}
            </p>
          </section>

          {onOpenComposer && (
            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenComposer(composer.id, work.year);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#c99738] hover:bg-[#dbaa44] text-black text-xs font-bold"
              >
                <span>{composer.shortName}のくわしい紹介へ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </article>
    </div>,
    document.body
  );
};
