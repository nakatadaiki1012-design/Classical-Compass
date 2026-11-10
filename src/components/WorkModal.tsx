import React, { Suspense, lazy, useEffect, useState } from 'react';
import { hasWorkStory } from '../data/workStories';

// 名曲の物語（地図の国境データが大きいので、開いたときに読み込む）
const StoryModal = lazy(() => import('./StoryModal').then(m => ({ default: m.StoryModal })));
import { createPortal } from 'react-dom';
import { BookOpen, ChevronRight, ExternalLink, Film, Headphones, Landmark, Loader2, MapPin, Pause, Play, Sparkles, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { formatDuration, getRecording, recordingPageUrl } from '../utils/recordings';
import { Composer, Composition } from '../types';
import { ComposerPortrait } from './ComposerPortrait';
import { useBackClose } from '../utils/backStack';
import { LinkedText } from './LinkedText';
import { getWorkTrivia } from '../data/trivia';
import { getWorkGuide } from '../data/workGuides';
import { getWorkLegacy } from '../data/workLegacy';
import { getWorkMedia } from '../data/workExtras';
import { getComposerEvents } from '../data/chronicle';
import { getFreeMediaLinks } from '../utils/freeMedia';
import { yearText } from '../utils/yearLabel';

interface WorkModalProps {
  work: Composition;
  composer: Composer;
  onClose: () => void;
  onOpenComposer?: (composerId: string, year?: number) => void;
}

/** 曲の解説ポップアップ：曲の話・聴きどころ・蘊蓄・音源を探すリンク */
export const WorkModal: React.FC<WorkModalProps> = ({ work, composer, onClose, onOpenComposer }) => {
  useBackClose(true, onClose);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ex = [`composer:${composer.id}`];
  const trivia = getWorkTrivia(composer.id, work);
  const guide = getWorkGuide(composer.id, work);
  const legacy = getWorkLegacy(work.id);
  const [storyOpen, setStoryOpen] = useState(false);
  const media = getWorkMedia(composer.id, work);
  const links = getFreeMediaLinks(composer, work);
  const rec = getRecording(work.id);
  const { playTrack, currentTrack, isPlaying, isLoading } = useAudio();
  const isThis = currentTrack?.work.id === work.id;
  const age = work.year - composer.birthYear;
  // この曲の前後2年に、同じ人に起きた出来事（曲の背景として）
  const around = getComposerEvents(composer.id)
    .filter(e => e.kind === 'episode' && e.text && Math.abs(e.year - work.year) <= 2)
    .slice(0, 2);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3"
      style={{ paddingBottom: 'calc(var(--player-h, 0px) + 0.75rem)' }}
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

          {/* 録音を聴く（ウィキメディア・コモンズの、自由に使える録音） */}
          {rec && (
            <div className="rounded-xl bg-[#241c12] border border-[#c99738]/60 p-3 flex items-center gap-3">
              <button
                onClick={() => playTrack(work, composer)}
                className="w-12 h-12 shrink-0 rounded-full bg-[#c99738] hover:bg-[#dbaa44] text-black flex items-center justify-center shadow-lg active:scale-95"
                aria-label={isThis && isPlaying ? '一時停止' : 'この曲を聴く'}
              >
                {isThis && isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isThis && isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-[#f5ebd9]">
                  {isThis && isPlaying ? '再生中' : 'この曲を聴く'}
                  <span className="ml-2 text-xs font-normal font-mono text-[#c9bfb0]">{formatDuration(rec.dur)}</span>
                </div>
                <div className="text-[11px] text-[#b5aa9b] leading-snug mt-0.5">
                  {rec.note && !work.title.includes(rec.note) && <span className="text-[#e6b95c]">{rec.note}・</span>}
                  <a href={recordingPageUrl(rec)} target="_blank" rel="noopener noreferrer" className="hover:text-[#c99738] hover:underline">
                    {rec.performer ? `演奏: ${rec.performer}・` : ''}Wikimedia Commons（{rec.license}）
                  </a>
                </div>
              </div>
            </div>
          )}

          {hasWorkStory(work.id) && (
            <button
              onClick={() => setStoryOpen(true)}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-[#c99738] to-[#e6b95c] text-[#161412] text-left shadow-lg hover:brightness-110 active:scale-[0.99]"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-bold">この曲の物語を読む</span>
                <span className="block text-[11px] opacity-80">誕生から今まで・地図と読み上げ付き</span>
              </span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          )}

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              どんな曲？
            </h4>
            <p className="text-[13px] text-[#d1c6b6] leading-relaxed bg-[#110f0d] p-3 rounded-lg border border-[#241e17]"><LinkedText text={work.description} exclude={ex} /></p>
          </section>

          {legacy && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                音楽史の中での役割
              </h4>
              <div className="bg-[#1d1812] rounded-lg border border-[#c99738]/35 divide-y divide-[#2e251a]">
                <p className="p-3 text-[13px] text-[#d9cfbd] leading-relaxed">
                  <span className="inline-block mr-1.5 mb-0.5 px-1.5 py-px rounded text-[10px] font-bold bg-[#c99738]/20 text-[#e6b95c] align-middle">
                    当時
                  </span>
                  <LinkedText text={legacy.then} exclude={ex} />
                </p>
                <p className="p-3 text-[13px] text-[#d9cfbd] leading-relaxed">
                  <span className="inline-block mr-1.5 mb-0.5 px-1.5 py-px rounded text-[10px] font-bold bg-[#c99738]/20 text-[#e6b95c] align-middle">
                    その後
                  </span>
                  <LinkedText text={legacy.after} exclude={ex} />
                </p>
              </div>
            </section>
          )}

          {guide.text && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" />
                {guide.specific ? '聴きどころ' : '聴き方のヒント'}
              </h4>
              <p className="text-[13px] text-[#d9cfbd] leading-relaxed bg-[#1d1812] p-3 rounded-lg border border-[#2e251a]"><LinkedText text={guide.text} exclude={ex} /></p>
            </section>
          )}

          {trivia && (
            <p className="text-[13px] text-[#d9cfbd] leading-relaxed bg-[#241e17] p-3 rounded-lg border border-[#3a2f20]">
              <span className="font-bold text-[#e6b95c] mr-1">蘊蓄</span>
              <LinkedText text={trivia} exclude={ex} />
            </p>
          )}

          {media.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5" />
                こんなところで使われている
              </h4>
              <ul className="space-y-1.5">
                {media.map(m => (
                  <li key={m} className="text-[13px] text-[#d9cfbd] leading-relaxed bg-[#1d1812] px-3 py-2 rounded-lg border border-[#2e251a]">
                    <LinkedText text={m} exclude={ex} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {around.length > 0 && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#c99738]">このころの{composer.shortName}</h4>
              {around.map(e => (
                <p key={e.id} className="text-xs text-[#b5aa9b] leading-relaxed">
                  <span className="font-mono text-[#e6b95c]">{yearText(e.year)}</span>　{e.title}
                  <span className="block text-[#a3978a] mt-0.5"><LinkedText text={e.text!} exclude={ex} /></span>
                </p>
              ))}
            </section>
          )}

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-[#c99738] flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              {rec ? 'ほかの演奏・動画・楽譜を探す' : '音源・動画・楽譜を探す'}
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
      {storyOpen && (
        <Suspense fallback={null}>
          <StoryModal composer={composer} work={work} zClass="z-[75]" onClose={() => setStoryOpen(false)} />
        </Suspense>
      )}
    </div>,
    document.body
  );
};
