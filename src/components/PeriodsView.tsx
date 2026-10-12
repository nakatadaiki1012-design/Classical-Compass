import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { MUSIC_PERIODS } from '../data/musicPeriods';
import { useJapanMode } from '../utils/japanMode';
import { PeriodDetail, periodRange } from './PeriodDetail';

interface PeriodsViewProps {
  onSelectComposer: (composerId: string) => void;
}

/** 音楽史の時代ごとに、主流の音楽と用語をまとめた画面（勉強用） */
export const PeriodsView: React.FC<PeriodsViewProps> = ({ onSelectComposer }) => {
  const japanMode = useJapanMode();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const q = query.trim();
  const periods = useMemo(
    () =>
      MUSIC_PERIODS.filter(p => p.region === 'west' || japanMode)
        .filter(p => !q || (p.name + p.mainstream + p.summary + p.terms.map(t => t.join('')).join('')).includes(q))
        .sort((a, b) => (a.region === b.region ? a.start - b.start : a.region === 'west' ? -1 : 1)),
    [japanMode, q]
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full space-y-5 pb-20">
      <div className="space-y-1 pb-3 border-b border-[#2e2924]">
        <h2 className="font-classical-display font-bold text-xl md:text-2xl text-[#f5ebd9]">音楽史（時代と用語）</h2>
        <p className="text-xs text-[#b5aa9b]">
          古代から現代まで、その時代に主流だった音楽と、試験によく出る用語をまとめました。時代の名前をタップすると開きます。
          {!japanMode && '（日本音楽史は、上の「日本音楽史」ボタンをオンにすると加わります）'}
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

      {periods.map((p, i) => {
        const open = openId === p.id || !!q;
        const showRegionHead = i === 0 || periods[i - 1].region !== p.region;
        return (
          <React.Fragment key={p.id}>
            {showRegionHead && (
              <h3 className="font-classical-display font-bold text-base text-[#e6b95c] pt-2">
                {p.region === 'west' ? '西洋音楽史' : '日本音楽史'}
              </h3>
            )}
            <section className="rounded-xl border bg-[#181512]" style={{ borderColor: p.color + '66' }}>
              <button
                onClick={() => setOpenId(open && !q ? null : p.id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3"
                aria-expanded={open}
              >
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
      {periods.length === 0 && <p className="text-sm text-[#a3978a]">「{q}」に当てはまる時代・用語はありません。</p>}
    </div>
  );
};
