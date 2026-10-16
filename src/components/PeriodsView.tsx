import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { MUSIC_PERIODS } from '../data/musicPeriods';
import { HISTORY_AXES } from '../data/historyAxes';
import { PeriodModal } from './PeriodModal';
import { WikiThumb, HoverImage } from './WikiImage';
import { imageKeyFor } from '../data/imageHints';
import { useJapanMode } from '../utils/japanMode';
import { useWorldMode } from '../utils/worldMode';
import { PeriodDetail, PeriodImage, periodRange } from './PeriodDetail';
import { LinkedText, WikiLink } from './LinkedText';

interface PeriodsViewProps {
  onSelectComposer: (composerId: string) => void;
}

/** 音楽史の時代ごとに、主流の音楽と用語をまとめた画面（勉強用） */
export const PeriodsView: React.FC<PeriodsViewProps> = ({ onSelectComposer }) => {
  const japanMode = useJapanMode();
  const worldMode = useWorldMode();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  // 学び方：時代ごと／テーマ（軸）ごと
  const [mode, setMode] = useState<'periods' | 'instrument' | 'texture' | 'theory' | 'form' | 'japan' | 'world'>('periods');
  const [modalPeriodId, setModalPeriodId] = useState<string | null>(null);
  const axis = HISTORY_AXES.find(a => a.id === mode);

  const q = query.trim();
  const periods = useMemo(
    () =>
      MUSIC_PERIODS.filter(p => p.region === 'west' || (p.region === 'japan' && japanMode) || (p.region === 'world' && worldMode))
        .filter(p => !q || (p.name + p.mainstream + p.summary + p.terms.map(t => t.join('')).join('')).includes(q))
        .sort((a, b) => {
          const rank = (r: string) => (r === 'west' ? 0 : r === 'japan' ? 1 : 2);
          return a.region === b.region ? a.start - b.start : rank(a.region) - rank(b.region);
        }),
    [japanMode, worldMode, q]
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-5 pb-20">
      <div className="space-y-1 pb-3 border-b border-[#2e2924]">
        <h2 className="font-classical-display font-bold text-xl md:text-2xl text-[#f5ebd9]">音楽史（時代・テーマ別）</h2>
        <p className="text-xs text-[#b5aa9b]">
          古代から現代まで、その時代に主流だった音楽と、試験によく出る用語をまとめました。時代の名前をタップすると開きます。
          {(!japanMode || !worldMode) && '（上の「日本音楽史」「世界の音楽」ボタンをオンにすると、日本の伝統音楽や世界各地の音楽も加わります）'}
        </p>
        <div className="relative pt-2">
          <Search className="w-3.5 h-3.5 text-[#b5aa9b] absolute left-2.5 top-1/2 translate-y-[-30%]" />
          <input
            type="text"
            placeholder="用語を検索（例：フーガ、レオナン、ピアノ）"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setOpenId(null);
            }}
            className="w-full bg-[#241f19] border border-[#3d362e] rounded px-2.5 py-2 pl-8 text-sm text-[#f5ebd9] placeholder-[#8f8476] focus:outline-none focus:border-[#c99738]"
          />
        </div>
      </div>

      {/* 学び方の切り替え */}
      <div className="flex flex-wrap gap-1.5">
        {[{ id: 'periods', name: '時代ごと', icon: '🕰' }, ...HISTORY_AXES.filter(a => (a.id !== 'japan' || japanMode) && (a.id !== 'world' || worldMode))].map(t => (
          <button
            key={t.id}
            onClick={() => {
              setMode(t.id as typeof mode);
              setOpenId(null);
            }}
            aria-pressed={mode === t.id}
            className={`px-3 py-1.5 rounded-lg border text-[13px] font-bold transition-colors ${
              mode === t.id
                ? 'bg-[#c99738] border-[#c99738] text-[#161412]'
                : 'bg-[#241f19] border-[#3d362e] text-[#d6cdbd] hover:text-[#f5ebd9]'
            }`}
          >
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      {axis && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#d6cdbd]"><LinkedText text={axis.intro} /></p>
          <details className="rounded-xl border border-[#3a2f20] bg-[#181512] px-4 py-2" open={!!q}>
            <summary className="cursor-pointer text-sm font-bold text-[#e6b95c]">覚えておきたい用語（{axis.terms.length}）</summary>
            <dl className="mt-2 space-y-1.5">
              {axis.terms
                .filter(([t, d]) => !q || (t + d).includes(q))
                .map(([term, desc]) => (
                  <div key={term} className="rounded bg-white/[0.04] px-2.5 py-1.5 flex gap-2.5">
                    <div className="min-w-0 flex-1">
                      <dt className="text-[13px] font-bold text-[#f5ebd9]">
                        <HoverImage imageKey={imageKeyFor(term)}><WikiLink target={{ kind: 'term', id: term }}>{term}</WikiLink></HoverImage>
                      </dt>
                      <dd className="text-[12.5px] leading-relaxed text-[#c9bfb0]"><LinkedText text={desc} exclude={[`term:${term}`]} /></dd>
                    </div>
                    <WikiThumb imageKey={imageKeyFor(term)} className="shrink-0 w-16 h-16 self-center" />
                  </div>
                ))}
            </dl>
          </details>
          <ol className="relative ml-2 border-l border-[#3a2f20] space-y-3">
            {[...axis.entries]
              .sort((a, b) => a[0] - b[0])
              .filter(([, when, title, text]) => !q || (when + title + text).includes(q))
              .map(([sort, when, title, text, periodId]) => {
                const period = MUSIC_PERIODS.find(pp => pp.id === periodId);
                return (
                  <li key={sort + title} className="relative pl-5">
                    <span
                      className="absolute -left-[6px] top-2 w-3 h-3 rounded-full ring-4 ring-[#121110]"
                      style={{ background: period?.color || '#c99738' }}
                    />
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[#e6b95c]">{when}</span>
                      {period && (
                        <button
                          onClick={() => setModalPeriodId(period.id)}
                          className="px-2 rounded-full border text-[11px] text-[#e8dec8] hover:bg-white/10"
                          style={{ borderColor: period.color + 'aa' }}
                          title="この時代の解説を開く"
                        >
                          {period.name.replace('日本：', '日本・').split('（')[0]}
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-bold text-[#f5ebd9] leading-snug">
                          <HoverImage imageKey={imageKeyFor(title)}>{title}</HoverImage>
                        </div>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#c9bfb0]"><LinkedText text={text} /></p>
                      </div>
                      <WikiThumb imageKey={imageKeyFor(title)} className="shrink-0 w-24 h-24 self-start" />
                    </div>
                  </li>
                );
              })}
          </ol>
        </div>
      )}

      {mode === 'periods' && periods.map((p, i) => {
        const open = openId === p.id || !!q;
        const showRegionHead = i === 0 || periods[i - 1].region !== p.region;
        return (
          <React.Fragment key={p.id}>
            {showRegionHead && (
              <h3 className="font-classical-display font-bold text-base text-[#e6b95c] pt-2">
                {p.region === 'west' ? '西洋音楽史' : p.region === 'japan' ? '日本音楽史' : '世界の音楽'}
              </h3>
            )}
            <section className="rounded-xl border bg-[#181512]" style={{ borderColor: p.color + '66' }}>
              <button
                onClick={() => setOpenId(open && !q ? null : p.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3"
                aria-expanded={open}
              >
                <PeriodImage periodId={p.id} captionless className="shrink-0 w-16 h-16 [&_img]:h-16" />
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-mono font-bold text-[#e6b95c]">{periodRange(p)}</span>
                  <span className="block font-classical-display font-bold text-[15px] text-[#f5ebd9]">{p.name}</span>
                  <span className="block text-[12.5px] text-[#c9bfb0] mt-0.5">主流：{p.mainstream}</span>
                </span>
                <span className="text-[#a3978a] text-xs shrink-0 mt-1">{open ? '閉じる' : '開く'}</span>
              </button>
              {open && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5">
                  <PeriodDetail period={p} filter={q} onOpenComposer={onSelectComposer} />
                </div>
              )}
            </section>
          </React.Fragment>
        );
      })}
      {mode === 'periods' && periods.length === 0 && <p className="text-sm text-[#a3978a]">「{q}」に当てはまる時代・用語はありません。</p>}
      {modalPeriodId && (() => {
        const mp = MUSIC_PERIODS.find(x => x.id === modalPeriodId);
        return mp ? (
          <PeriodModal period={mp} onClose={() => setModalPeriodId(null)} onOpenComposer={id => onSelectComposer(id)} />
        ) : null;
      })()}
    </div>
  );
};
