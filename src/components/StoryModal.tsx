import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, ChevronLeft, ChevronRight, Globe2, Loader2, Pause, Play, PlayCircle, X } from 'lucide-react';
import { Composer, Composition } from '../types';
import { getStory, StoryChapter } from '../data/stories';
import { EUROPE_COUNTRY_PATHS } from '../data/europePaths';
import { SVG_H, SVG_W, isOffMapLonLat, projectGeoToSvg } from '../data/mapProjection';
import { getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';
import { LinkedText } from './LinkedText';
import { WorkModal } from './WorkModal';
import { useBackClose } from '../utils/backStack';
import { useWikiImage } from '../utils/useWikiPortrait';
import { useAudio } from '../context/AudioContext';
import { hasAudio } from '../utils/hasAudio';
import { yearText } from '../utils/yearLabel';

/** 自動で次の章へ進むまでの時間（ミリ秒） */
const AUTO_MS = 16000;

interface Cam {
  cx: number;
  cy: number;
  k: number;
  mx: number;
  my: number;
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** 物語の地図：章が進むと、肖像が次の場所へ移動し、地図もそれを追いかける */
const StoryMap: React.FC<{ composer: Composer; chapters: StoryChapter[]; index: number }> = ({
  composer,
  chapters,
  index
}) => {
  const pts = useMemo(
    () =>
      chapters.map(c => ({
        p: projectGeoToSvg(c.place.lon, c.place.lat),
        off: isOffMapLonLat(c.place.lon, c.place.lat),
        name: c.place.ja
      })),
    [chapters]
  );
  const cur = pts[index];
  const era = getEraById(composer.era);

  // カメラの目標：今の場所を中心に、ひとつ前の場所も入るくらいの拡大率
  const target = useMemo((): Cam => {
    if (cur.off) return { cx: SVG_W / 2, cy: SVG_H / 2, k: 1, mx: SVG_W / 2, my: SVG_H / 2 };
    const prev = pts
      .slice(0, index)
      .reverse()
      .find(q => !q.off);
    const dist = prev ? Math.hypot(prev.p[0] - cur.p[0], prev.p[1] - cur.p[1]) : 0;
    const span = Math.max(240, dist * 2.4);
    const k = Math.min(3.2, Math.max(1, SVG_W / span));
    const cx = prev && dist * 2.4 > 240 ? (prev.p[0] + cur.p[0]) / 2 : cur.p[0];
    const cy = prev && dist * 2.4 > 240 ? (prev.p[1] + cur.p[1]) / 2 : cur.p[1];
    return { cx, cy, k, mx: cur.p[0], my: cur.p[1] };
  }, [cur, index, pts]);

  const [cam, setCam] = useState<Cam>(target);
  const camRef = useRef(cam);
  camRef.current = cam;
  useEffect(() => {
    const from = camRef.current;
    const start = performance.now();
    const DUR = 1100;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const e = ease(t);
      const lerp = (a: number, b: number) => a + (b - a) * e;
      setCam({
        cx: lerp(from.cx, target.cx),
        cy: lerp(from.cy, target.cy),
        k: lerp(from.k, target.k),
        mx: lerp(from.mx, target.mx),
        my: lerp(from.my, target.my)
      });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // 地図の枠の大きさ（スマホでは小さく描かれるので、印や文字をそのぶん大きくする）
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [boxW, setBoxW] = useState(SVG_W);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      // 「slice」で枠いっぱいに描くので、幅と高さの大きいほうの比率が実際の縮尺
      if (r.width > 10) setBoxW(Math.max(r.width, (r.height * SVG_W) / SVG_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const boost = Math.min(2.4, Math.max(1, (0.9 * SVG_W) / boxW));

  const vw = SVG_W / cam.k;
  const vh = SVG_H / cam.k;
  const s = boost / cam.k; // 拡大しても、印や文字の大きさが画面上で変わらないように
  const onMapPast = pts.slice(0, index + 1).filter(q => !q.off);
  const route = onMapPast.map(q => q.p);
  const D = 46 * s;

  return (
    <div ref={boxRef} className="relative w-full h-full bg-[#081623] overflow-hidden">
      <svg
        viewBox={`${cam.cx - vw / 2} ${cam.cy - vh / 2} ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
        aria-label={`${composer.shortName}の足どりの地図`}
      >
        <rect x={-4000} y={-4000} width={9000} height={9000} fill="#0b1c2c" />
        {EUROPE_COUNTRY_PATHS.map((c, i) => (
          <path key={i} d={c.d} fill="#2a2219" stroke="#5a4a37" strokeWidth={0.9 * s} />
        ))}

        {/* これまでの足どり */}
        {route.length >= 2 && (
          <polyline
            points={route.map(p => p.join(',')).join(' ')}
            fill="none"
            stroke="#e6b95c"
            strokeWidth={2.2 * s}
            strokeDasharray={`${7 * s} ${5 * s}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.85}
          />
        )}

        {/* 訪れた場所・これから訪れる場所 */}
        {pts.map((q, i) => {
          if (q.off || i === index) return null;
          const past = i < index;
          // 同じ場所の重複は1回だけ描く
          if (pts.findIndex(o => o.name === q.name) !== i && !past) return null;
          return (
            <g key={i} opacity={past ? 1 : 0.45}>
              <circle cx={q.p[0]} cy={q.p[1]} r={(past ? 4.5 : 3.5) * s} fill={past ? '#e6b95c' : '#8a7a63'} stroke="#120e0b" strokeWidth={1.2 * s} />
              {past && q.name !== cur.name && (
                <text
                  x={q.p[0]}
                  y={q.p[1] - 8 * s}
                  textAnchor="middle"
                  fontSize={11 * s}
                  fill="#e8dec8"
                  stroke="#0b1c2c"
                  strokeWidth={3 * s}
                  paintOrder="stroke"
                  fontWeight={700}
                >
                  {q.name}
                </text>
              )}
            </g>
          );
        })}

        {/* いまの場所：肖像（前の場所からすべるように移動する） */}
        {!cur.off && (
          <g>
            <circle cx={cam.mx} cy={cam.my} r={D * 0.75} fill="#e6b95c" opacity={0.18}>
              <animate attributeName="r" values={`${D * 0.6};${D * 0.95};${D * 0.6}`} dur="2.4s" repeatCount="indefinite" />
            </circle>
            <foreignObject x={cam.mx - D / 2} y={cam.my - D / 2} width={D} height={D} className="overflow-visible">
              <div
                className="w-full h-full rounded-full ring-2 ring-[#e6b95c] shadow-xl overflow-hidden"
                style={{ backgroundColor: era.color }}
              >
                <ComposerPortrait composer={composer} size="sm" showOrnateBorder={false} className="w-full h-full" />
              </div>
            </foreignObject>
            <text
              x={cam.mx}
              y={cam.my + D / 2 + 15 * s}
              textAnchor="middle"
              fontSize={14 * s}
              fill="#f5ebd9"
              stroke="#0b1c2c"
              strokeWidth={4 * s}
              paintOrder="stroke"
              fontWeight={800}
            >
              {cur.name}
            </text>
          </g>
        )}
      </svg>

      {/* 地図の範囲の外（アメリカ・日本など） */}
      {cur.off && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-3 rounded-xl bg-[#17130f]/95 border border-[#c99738]/60 px-4 py-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#e6b95c] shrink-0" style={{ backgroundColor: era.color }}>
              <ComposerPortrait composer={composer} size="sm" showOrnateBorder={false} className="w-full h-full" />
            </div>
            <div>
              <div className="text-[11px] text-[#b5aa9b] flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5" />
                地図の外
              </div>
              <div className="text-base font-bold text-[#f5ebd9]">{cur.name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** 章の写真（ウィキペディアの記事の代表画像）。取れなければ何も出さない */
const ChapterImage: React.FC<{ imageKey?: string; caption?: string }> = ({ imageKey, caption }) => {
  const url = useWikiImage(imageKey || '');
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (!imageKey || !url || failed) return null;
  return (
    <figure className="rounded-xl overflow-hidden border border-[#3a2f20] bg-[#110d0a]">
      <img
        src={url}
        alt={caption || ''}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full max-h-64 object-contain bg-black/30"
      />
      {caption && <figcaption className="px-3 py-1.5 text-[11px] text-[#b5aa9b]">{caption}</figcaption>}
    </figure>
  );
};

/**
 * 人生の物語：章ごとに人生を語り、地図で足どりを追いかける。
 * その時期に作った曲を並べ、録音があればその場で聴ける。
 */
export const StoryModal: React.FC<{ composer: Composer; onClose: () => void }> = ({ composer, onClose }) => {
  useBackClose(true, onClose);
  const story = useMemo(() => getStory(composer), [composer]);
  const chapters = story.chapters;
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const [openWork, setOpenWork] = useState<Composition | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const dotsRef = useRef<HTMLDivElement | null>(null);
  const { playTrack, currentTrack, isPlaying, isLoading } = useAudio();

  const cur = chapters[index];
  const last = chapters.length - 1;
  const go = (i: number) => setIndex(Math.max(0, Math.min(last, i)));

  // 章が変わったら、文章を先頭に戻し、章の印を見える位置へ
  useEffect(() => {
    textRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    const dot = dotsRef.current?.querySelector<HTMLElement>(`[data-dot="${index}"]`);
    dot?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  // 自動で読み進める
  useEffect(() => {
    if (!auto) return;
    if (index >= last) {
      setAuto(false);
      return;
    }
    const t = window.setTimeout(() => setIndex(i => Math.min(last, i + 1)), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [auto, index, last]);

  // キーボードの ← → で章を移動、Esc で閉じる
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (openWork) return;
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, openWork, onClose]);

  if (!cur) return null;

  const ageText =
    cur.year > composer.deathYear
      ? `没後${cur.year - composer.deathYear}年`
      : cur.end > cur.year
        ? `${Math.max(0, cur.year - composer.birthYear)}〜${Math.min(cur.end, composer.deathYear) - composer.birthYear}歳`
        : `${Math.max(0, cur.year - composer.birthYear)}歳`;
  const yearRange = cur.end > cur.year ? `${yearText(cur.year)}〜${yearText(cur.end)}` : yearText(cur.year);
  const ex = [`composer:${composer.id}`];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] bg-[#0d0a08] flex flex-col text-[#f5ebd9]"
      style={{ paddingBottom: 'var(--player-h, 0px)' }}
      role="dialog"
      aria-label={`${composer.name}の人生の物語`}
    >
      {/* 見出し */}
      <header className="shrink-0 flex items-center gap-3 px-3 sm:px-5 py-2 border-b border-[#2e2924] bg-[#17130f]">
        <ComposerPortrait composer={composer} size="sm" showOrnateBorder={false} className="w-9 h-9" />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-[#c99738] font-bold flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            人生の物語{story.written ? '' : '（記録から作成）'}
          </div>
          <div className="text-sm sm:text-base font-bold truncate">
            {composer.name}
            <span className="ml-2 text-[11px] font-normal text-[#b5aa9b] font-mono">
              {composer.birthYear}〜{composer.deathYear}
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-[#b5aa9b] shrink-0">
          {index + 1} / {chapters.length}
        </span>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#b5aa9b] hover:text-white hover:bg-[#2b241c]" aria-label="閉じる">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* 本体：スマホは上に地図・下に文章。広い画面は左に地図・右に文章 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <div className="shrink-0 h-[34vh] lg:h-auto lg:flex-1 border-b lg:border-b-0 lg:border-r border-[#2e2924]">
          <StoryMap composer={composer} chapters={chapters} index={index} />
        </div>

        <div ref={textRef} className="flex-1 min-h-0 overflow-y-auto lg:max-w-[560px] xl:max-w-[640px]">
          <article key={index} className="p-4 sm:p-6 space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-[#c99738]/20 text-[#e6b95c] font-bold font-mono">{yearRange}</span>
              <span className="px-2 py-0.5 rounded bg-[#241f19] text-[#d9cfbd]">{ageText}</span>
              <span className="px-2 py-0.5 rounded bg-[#241f19] text-[#d9cfbd]">
                {cur.place.ja}
                {cur.isTrip ? '（旅）' : ''}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-classical-display font-bold leading-snug">{cur.title}</h2>

            <ChapterImage imageKey={cur.image} caption={cur.caption} />

            <p className="text-[15px] leading-[1.9] text-[#e3d9c6]">
              <LinkedText text={cur.text} exclude={ex} />
            </p>

            {cur.works.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs font-bold text-[#c99738]">この時期に生まれた曲</h3>
                <ul className="space-y-1.5">
                  {cur.works.map(w => {
                    const can = hasAudio(w);
                    const isThis = currentTrack?.work.id === w.id;
                    return (
                      <li key={w.id} className="flex items-center gap-2 rounded-lg bg-[#1d1812] border border-[#2e251a] px-2 py-1.5">
                        {can ? (
                          <button
                            onClick={() => playTrack(w, composer)}
                            className="w-8 h-8 shrink-0 rounded-full bg-[#c99738] text-[#161412] flex items-center justify-center active:scale-95"
                            aria-label={isThis && isPlaying ? `${w.title}を一時停止` : `${w.title}を聴く`}
                          >
                            {isThis && isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isThis && isPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current translate-x-px" />
                            )}
                          </button>
                        ) : (
                          <span className="w-8 h-8 shrink-0 rounded-full border border-[#3a2f20] text-[#8a7a63] flex items-center justify-center text-sm">♪</span>
                        )}
                        <button onClick={() => setOpenWork(w)} className="min-w-0 flex-1 text-left">
                          <div className="text-[13px] font-bold text-[#f5ebd9] truncate">{w.title}</div>
                          <div className="text-[11px] text-[#b5aa9b]">
                            {yearText(w.year)}・{w.genreJa}
                            {can ? '・聴けます' : ''}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {index === last && (
              <p className="text-center text-xs text-[#8a7a63] pt-2">― おわり ―</p>
            )}
          </article>
        </div>
      </div>

      {/* 操作：前へ・章の印・次へ・自動で進む */}
      <footer className="shrink-0 border-t border-[#2e2924] bg-[#17130f] px-2 sm:px-4 py-2 flex items-center gap-2">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="h-10 px-2 sm:px-3 rounded-lg border border-[#3a2f20] flex items-center gap-1 text-sm disabled:opacity-30 hover:bg-[#2b241c]"
          aria-label="前の章"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">前へ</span>
        </button>

        <div ref={dotsRef} className="flex-1 min-w-0 overflow-x-auto flex items-center gap-1 px-1 py-1 [scrollbar-width:none]">
          {chapters.map((c, i) => (
            <button
              key={i}
              data-dot={i}
              onClick={() => go(i)}
              title={`${yearText(c.year)} ${c.title}`}
              className={`shrink-0 h-7 rounded-full px-2 text-[10px] font-mono font-bold transition-colors ${
                i === index
                  ? 'bg-[#c99738] text-[#161412]'
                  : i < index
                    ? 'bg-[#3a2f20] text-[#e6b95c]'
                    : 'bg-[#221c16] text-[#8a7a63]'
              }`}
            >
              {c.year}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAuto(a => !a)}
          className={`h-10 px-2 rounded-lg border flex items-center gap-1 text-xs ${
            auto ? 'border-[#c99738] text-[#e6b95c] bg-[#2b241c]' : 'border-[#3a2f20] text-[#b5aa9b]'
          }`}
          aria-label={auto ? '自動で進むのを止める' : '自動で進む'}
          title={auto ? '自動で進むのを止める' : '自動で読み進める'}
        >
          {auto ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
          <span className="hidden sm:inline">{auto ? '止める' : '自動'}</span>
        </button>

        <button
          onClick={() => (index === last ? onClose() : go(index + 1))}
          className="h-10 px-3 rounded-lg bg-[#c99738] text-[#161412] font-bold flex items-center gap-1 text-sm hover:bg-[#dba844]"
          aria-label={index === last ? '物語を閉じる' : '次の章'}
        >
          <span>{index === last ? 'おわり' : '次へ'}</span>
          {index !== last && <ChevronRight className="w-4 h-4" />}
        </button>
      </footer>

      {openWork && <WorkModal work={openWork} composer={composer} onClose={() => setOpenWork(null)} />}
    </div>,
    document.body
  );
};
