import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Search, X } from 'lucide-react';
import {
  TERMS,
  WikiTarget,
  backlinksOf,
  contemporariesOf,
  getComposer,
  getPeriod,
  getTerm,
  periodsOfComposer,
  searchWiki,
  targetKey,
  targetsIn,
  titleOf,
  composerText
} from '../data/glossary';
import { MUSIC_PERIODS } from '../data/musicPeriods';
import { HISTORY_AXES } from '../data/historyAxes';
import { imageKeyFor } from '../data/imageHints';
import { closeWiki, openComposerDetail, openWiki, useWikiState, wikiBack, wikiForward, wikiJump } from '../utils/wikiStore';
import { LinkedText, WikiLink } from './LinkedText';
import { WikiThumb } from './WikiImage';
import { PeriodImage, periodRange } from './PeriodDetail';
import { ComposerPortrait } from './ComposerPortrait';

const KIND_LABEL: Record<string, string> = { term: '用語', composer: '作曲家', period: '時代', home: '用語集' };
const KIND_COLOR: Record<string, string> = {
  term: 'bg-[#2b2210] text-[#f0cd78] border-[#6b5420]',
  composer: 'bg-[#13243d] text-[#9cc4f5] border-[#2c4f80]',
  period: 'bg-[#2a1a3a] text-[#d1a8f5] border-[#5c3b80]'
};

const Chip: React.FC<{ target: WikiTarget }> = ({ target }) => (
  <button
    onClick={() => openWiki(target)}
    className={`px-2 py-0.5 rounded-full border text-[12px] hover:brightness-125 ${KIND_COLOR[target.kind] ?? ''}`}
  >
    {titleOf(target)}
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-1.5">
    <h4 className="text-xs font-bold text-[#e6b95c]">{title}</h4>
    {children}
  </section>
);

const wikipediaUrl = (q: string) => `https://ja.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`;

// ---------------- 各ページの中身 ----------------
const TermPage: React.FC<{ id: string }> = ({ id }) => {
  const term = getTerm(id);
  if (!term) return <p className="text-sm text-[#a3978a]">このページは見つかりません。</p>;
  const joined = term.texts.map(t => t.text).join('\n');
  const related = targetsIn(joined, [targetKeyOfTerm(id)]);
  const back = backlinksOf({ kind: 'term', id });
  const periods = term.texts.filter(t => t.periodId).map(t => ({ kind: 'period', id: t.periodId! }) as WikiTarget);
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {term.texts.map((t, i) => (
            <div key={i}>
              <p className="text-sm leading-relaxed text-[#e1d8c7]">
                <LinkedText text={t.text} exclude={[targetKeyOfTerm(id)]} />
              </p>
              <p className="text-[11px] text-[#8f8476]">出典：{t.from}</p>
            </div>
          ))}
        </div>
        <WikiThumb imageKey={imageKeyFor(id)} className="shrink-0 w-24 h-24 self-start" />
      </div>
      {periods.length > 0 && (
        <Section title="この用語が出てくる時代">
          <div className="flex flex-wrap gap-1.5">
            {periods.map(p => (
              <Chip key={targetKey(p)} target={p} />
            ))}
          </div>
        </Section>
      )}
      {related.length > 0 && (
        <Section title="この説明に出てくる言葉">
          <div className="flex flex-wrap gap-1.5">
            {related.map(t => (
              <Chip key={targetKey(t)} target={t} />
            ))}
          </div>
        </Section>
      )}
      {back.length > 0 && (
        <Section title={`この言葉に触れているページ（${back.length}）`}>
          <div className="flex flex-wrap gap-1.5">
            {back.slice(0, 30).map(t => (
              <Chip key={targetKey(t)} target={t} />
            ))}
          </div>
        </Section>
      )}
      <a
        href={wikipediaUrl(id.replace(/（.*?）/g, ''))}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-[#9cc4f5] hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        ウィキペディアで「{id.replace(/（.*?）/g, '')}」を調べる
      </a>
    </div>
  );
};
const targetKeyOfTerm = (id: string) => `term:${id}`;

const ComposerPage: React.FC<{ id: string }> = ({ id }) => {
  const c = getComposer(id);
  if (!c) return <p className="text-sm text-[#a3978a]">このページは見つかりません。</p>;
  const self = `composer:${id}`;
  const periods = periodsOfComposer(id);
  const mates = contemporariesOf(c);
  const terms = targetsIn(composerText(c), [self]).filter(t => t.kind === 'term');
  const back = backlinksOf({ kind: 'composer', id });
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ComposerPortrait composer={c} size="sm" />
        <div className="text-sm">
          <div className="font-bold text-[#f5ebd9]">
            <span className="emoji">{c.flag}</span> {c.name}
          </div>
          <div className="text-xs text-[#a3978a] font-serif italic">{c.originalName}</div>
          <div className="text-xs text-[#b5aa9b]">
            {c.birthYear}〜{c.deathYear}年 ・ {c.nationalityJa}
          </div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-[#e1d8c7]">
        <LinkedText text={c.biography} exclude={[self]} />
      </p>
      <Section title="作風">
        <p className="text-[13px] leading-relaxed text-[#d6cdbd]">
          <LinkedText text={c.musicalStyle} exclude={[self]} />
        </p>
        <ul className="list-disc pl-5 text-[13px] text-[#d6cdbd] space-y-0.5">
          {c.keyFeatures.map(f => (
            <li key={f}>
              <LinkedText text={f} exclude={[self]} />
            </li>
          ))}
        </ul>
      </Section>
      {periods.length > 0 && (
        <Section title="この人が活躍した時代">
          <div className="flex flex-wrap gap-1.5">
            {periods.map(p => (
              <Chip key={p.id} target={{ kind: 'period', id: p.id }} />
            ))}
          </div>
        </Section>
      )}
      {mates.length > 0 && (
        <Section title="同じ時代の人">
          <div className="flex flex-wrap gap-1.5">
            {mates.map(m => (
              <Chip key={m.id} target={{ kind: 'composer', id: m.id }} />
            ))}
          </div>
        </Section>
      )}
      {terms.length > 0 && (
        <Section title="関連する用語">
          <div className="flex flex-wrap gap-1.5">
            {terms.map(t => (
              <Chip key={targetKey(t)} target={t} />
            ))}
          </div>
        </Section>
      )}
      <Section title="代表曲">
        <ul className="text-[13px] text-[#d6cdbd] space-y-0.5">
          {c.works.map(w => (
            <li key={w.id}>
              ・{w.title}（{w.year}年）
            </li>
          ))}
        </ul>
      </Section>
      {back.length > 0 && (
        <Section title={`この人の名前が出てくるページ（${back.length}）`}>
          <div className="flex flex-wrap gap-1.5">
            {back.slice(0, 30).map(t => (
              <Chip key={targetKey(t)} target={t} />
            ))}
          </div>
        </Section>
      )}
      <button
        onClick={() => openComposerDetail(id)}
        className="px-3 py-2 rounded-lg bg-[#c99738] hover:bg-[#dbaa44] text-black text-xs font-bold"
      >
        {c.shortName}の名鑑（作品・年ごとのエピソード）を開く
      </button>
    </div>
  );
};

const PeriodPage: React.FC<{ id: string }> = ({ id }) => {
  const p = getPeriod(id);
  if (!p) return <p className="text-sm text-[#a3978a]">このページは見つかりません。</p>;
  const self = `period:${id}`;
  const back = backlinksOf({ kind: 'period', id });
  const idx = MUSIC_PERIODS.filter(x => x.region === p.region).sort((a, b) => a.start - b.start);
  const at = idx.findIndex(x => x.id === id);
  const prev = at > 0 ? idx[at - 1] : null;
  const next = at >= 0 && at < idx.length - 1 ? idx[at + 1] : null;
  return (
    <div className="space-y-4">
      <PeriodImage periodId={p.id} />
      <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: p.color + '88', background: p.color + '18' }}>
        <span className="text-[11px] font-bold text-[#e6b95c] mr-2">主流の音楽</span>
        <span className="font-bold text-[#f5ebd9]">
          <LinkedText text={p.mainstream} exclude={[self]} />
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[#e1d8c7]">
        <LinkedText text={p.summary} exclude={[self]} />
      </p>
      <Section title={`用語（${p.terms.length}）`}>
        <dl className="space-y-1.5">
          {p.terms.map(([n, d]) => (
            <div key={n} className="rounded bg-white/[0.04] px-2.5 py-1.5">
              <dt className="text-[13px] font-bold">
                <WikiLink target={{ kind: 'term', id: n }}>{n}</WikiLink>
              </dt>
              <dd className="text-[12.5px] leading-relaxed text-[#c9bfb0]">
                <LinkedText text={d} exclude={[self, `term:${n}`]} />
              </dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title="できごと">
        <ul className="space-y-1">
          {p.events.map(([when, text]) => (
            <li key={when + text} className="flex gap-2 text-[12.5px] leading-snug">
              <span className="shrink-0 w-24 font-mono font-bold text-[#e6b95c]">{when}</span>
              <span className="text-[#d6cdbd]">
                <LinkedText text={text} exclude={[self]} />
              </span>
            </li>
          ))}
        </ul>
      </Section>
      {(p.composerIds.length > 0 || p.otherPeople?.length) && (
        <Section title="この時代の作曲家・人物">
          <div className="flex flex-wrap gap-1.5">
            {p.composerIds.map(cid => (
              <Chip key={cid} target={{ kind: 'composer', id: cid }} />
            ))}
            {p.otherPeople?.map(n => (
              <span key={n} className="px-2 py-0.5 rounded-full border border-white/10 text-[12px] text-[#b9ad9c]">
                {n}
              </span>
            ))}
          </div>
        </Section>
      )}
      <div className="flex flex-wrap gap-2">
        {prev && (
          <button onClick={() => openWiki({ kind: 'period', id: prev.id })} className="px-2.5 py-1 rounded border border-white/15 text-xs text-[#d6cdbd] hover:bg-white/10">
            ← 前の時代：{prev.name.split(/[：（]/)[0]}
          </button>
        )}
        {next && (
          <button onClick={() => openWiki({ kind: 'period', id: next.id })} className="px-2.5 py-1 rounded border border-white/15 text-xs text-[#d6cdbd] hover:bg-white/10">
            次の時代：{next.name.split(/[：（]/)[0]} →
          </button>
        )}
      </div>
      {back.length > 0 && (
        <Section title={`この時代に触れているページ（${back.length}）`}>
          <div className="flex flex-wrap gap-1.5">
            {back.slice(0, 30).map(t => (
              <Chip key={targetKey(t)} target={t} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

const HomePage: React.FC = () => {
  const west = MUSIC_PERIODS.filter(p => p.region === 'west').sort((a, b) => a.start - b.start);
  const others = MUSIC_PERIODS.filter(p => p.region !== 'west').sort((a, b) => a.start - b.start);
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[#d6cdbd]">
        音楽の用語・作曲家・時代を、リンクをたどって調べられます。上の検索欄に言葉を入れるか、下から選んでください。上の「←」「→」で、見たページに戻れます。
      </p>
      <Section title="時代から探す（西洋）">
        <div className="flex flex-wrap gap-1.5">
          {west.map(p => (
            <Chip key={p.id} target={{ kind: 'period', id: p.id }} />
          ))}
        </div>
      </Section>
      {others.length > 0 && (
        <Section title="日本・世界の音楽の時代">
          <div className="flex flex-wrap gap-1.5">
            {others.map(p => (
              <Chip key={p.id} target={{ kind: 'period', id: p.id }} />
            ))}
          </div>
        </Section>
      )}
      {HISTORY_AXES.map(a => (
        <Section key={a.id} title={`${a.icon} ${a.name}の用語`}>
          <div className="flex flex-wrap gap-1.5">
            {a.terms.map(([n]) => (
              <Chip key={n} target={{ kind: 'term', id: n }} />
            ))}
          </div>
        </Section>
      ))}
      <Section title={`すべての用語（${TERMS.size}）`}>
        <div className="flex flex-wrap gap-1.5">
          {[...TERMS.keys()]
            .sort((a, b) => a.localeCompare(b, 'ja'))
            .map(n => (
              <Chip key={n} target={{ kind: 'term', id: n }} />
            ))}
        </div>
      </Section>
    </div>
  );
};

// ---------------- 外枠 ----------------
export const WikiPanel: React.FC = () => {
  const { open, stack, index } = useWikiState();
  const [query, setQuery] = useState('');
  const current = stack[index];
  const results = useMemo(() => searchWiki(query), [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeWiki();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => setQuery(''), [index]);

  if (!open || !current) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3" onClick={closeWiki}>
      <article
        className="relative w-full max-w-2xl h-[88vh] sm:h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#14100c] border border-[#c99738]/60 shadow-2xl text-[#f5ebd9]"
        onClick={e => e.stopPropagation()}
      >
        {/* 上のバー：戻る・進む・検索・閉じる */}
        <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 border-b border-white/10">
          <button onClick={wikiBack} disabled={index <= 0} aria-label="前のページに戻る" className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={wikiForward} disabled={index >= stack.length - 1} aria-label="次のページへ進む" className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30">
            <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => openWiki({ kind: 'home' })} aria-label="用語集のトップ" title="用語集のトップ" className="p-1.5 rounded hover:bg-white/10">
            <BookOpen className="w-4 h-4 text-[#e6b95c]" />
          </button>
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#8f8476] absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="用語・作曲家・時代を検索"
              className="w-full bg-[#241f19] border border-[#3d362e] rounded px-2 py-1.5 pl-7 text-sm placeholder-[#8f8476] focus:outline-none focus:border-[#c99738]"
            />
          </div>
          <button onClick={closeWiki} aria-label="閉じる" className="p-1.5 rounded hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 見たページの足あと */}
        {stack.length > 1 && (
          <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto text-[11px] border-b border-white/5 whitespace-nowrap">
            <span className="text-[#8f8476] shrink-0">足あと：</span>
            {stack.map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[#8f8476]">›</span>}
                <button
                  onClick={() => wikiJump(i)}
                  className={`px-1.5 py-0.5 rounded ${i === index ? 'bg-[#c99738] text-black font-bold' : 'text-[#c9bfb0] hover:bg-white/10'}`}
                >
                  {titleOf(t)}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {query.trim() ? (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#e6b95c]">「{query.trim()}」の検索結果（{results.length}）</h4>
              {results.length === 0 && <p className="text-sm text-[#a3978a]">見つかりませんでした。</p>}
              <ul className="space-y-1">
                {results.map(t => (
                  <li key={targetKey(t)}>
                    <button onClick={() => openWiki(t)} className="w-full text-left px-2.5 py-1.5 rounded bg-white/[0.04] hover:bg-white/10 text-sm flex items-center gap-2">
                      <span className={`px-1.5 rounded border text-[10px] ${KIND_COLOR[t.kind]}`}>{KIND_LABEL[t.kind]}</span>
                      <span className="font-bold">{titleOf(t)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div>
                <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${KIND_COLOR[current.kind] ?? ''}`}>{KIND_LABEL[current.kind]}</span>
                <h2 className="mt-1.5 font-classical-display font-bold text-xl leading-snug">
                  {current.kind === 'term'
                    ? current.id
                    : current.kind === 'composer'
                    ? getComposer(current.id)?.name
                    : current.kind === 'period'
                    ? getPeriod(current.id)?.name
                    : '音楽の用語集'}
                </h2>
                {current.kind === 'period' && getPeriod(current.id) && (
                  <div className="text-[11px] font-mono font-bold text-[#e6b95c]">{periodRange(getPeriod(current.id)!)}</div>
                )}
              </div>
              {current.kind === 'term' && <TermPage id={current.id} />}
              {current.kind === 'composer' && <ComposerPage id={current.id} />}
              {current.kind === 'period' && <PeriodPage id={current.id} />}
              {current.kind === 'home' && <HomePage />}
            </>
          )}
        </div>
      </article>
    </div>,
    document.body
  );
};
