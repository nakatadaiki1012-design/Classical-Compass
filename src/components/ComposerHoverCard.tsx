import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { getComposerById } from '../data/composers';
import { getWhereabouts } from '../data/itinerary';
import { getComposerEventsAround } from '../data/chronicle';
import { getEraById } from '../data/eras';
import { ComposerPortrait } from './ComposerPortrait';

export interface HoverCardHandle {
  show: (composerId: string, year: number, clientX: number, clientY: number) => void;
  move: (clientX: number, clientY: number) => void;
  hide: () => void;
}

/**
 * パソコンでカーソルを合わせたときに出る、人物の小さな説明。
 * 位置の更新はカードの style を直接書き換えるので、動かしても画面全体は再描画されない。
 */
export const ComposerHoverCard = forwardRef<HoverCardHandle>((_props, ref) => {
  const [state, setState] = useState<{ id: string; year: number } | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  const place = () => {
    const el = boxRef.current;
    if (!el) return;
    const w = el.offsetWidth || 300;
    const h = el.offsetHeight || 150;
    let left = pos.current.x + 18;
    let top = pos.current.y + 18;
    if (left + w > window.innerWidth - 8) left = pos.current.x - w - 18;
    if (top + h > window.innerHeight - 8) top = pos.current.y - h - 18;
    el.style.left = `${Math.max(8, left)}px`;
    el.style.top = `${Math.max(8, top)}px`;
  };

  useImperativeHandle(ref, () => ({
    show: (id, year, x, y) => {
      // タッチ操作では出さない（マウスのときだけ）
      if (!window.matchMedia('(hover: hover)').matches) return;
      pos.current = { x, y };
      setState({ id, year });
      requestAnimationFrame(place);
    },
    move: (x, y) => {
      pos.current = { x, y };
      place();
    },
    hide: () => setState(null)
  }));

  if (!state) return null;
  const composer = getComposerById(state.id);
  if (!composer) return null;
  const year = state.year;
  const era = getEraById(composer.era);
  const where = getWhereabouts(composer, year);
  const near = getComposerEventsAround(composer.id, year, 2).find(e => e.kind === 'work' || e.kind === 'episode');
  const alive = composer.birthYear <= year && year <= composer.deathYear;

  return (
    <div
      ref={el => {
        boxRef.current = el;
        if (el) place();
      }}
      className="fixed z-[70] w-72 pointer-events-none rounded-xl bg-[#14100c]/95 backdrop-blur border border-[#c99738]/60 shadow-2xl p-3 text-[#f5ebd9]"
      style={{ left: -999, top: -999 }}
    >
      <div className="flex items-center gap-3">
        <ComposerPortrait composer={composer} size="md" showOrnateBorder={false} />
        <div className="min-w-0">
          <div className="font-classical-display font-bold text-sm leading-snug">{composer.name}</div>
          <div className="text-[11px] italic text-[#a3978a] truncate">{composer.originalName}</div>
          <div className="text-[11px] font-mono text-[#e6b95c]">
            {composer.birthYear}〜{composer.deathYear}
            {alive && <span className="text-[#c9bfb0]">　{year}年は{year - composer.birthYear}歳</span>}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] space-y-1">
        <div>
          <span className="font-bold" style={{ color: era.accentColor }}>{era.name}</span>
          <span className="text-[#a3978a]">　{composer.flag} {composer.country}</span>
        </div>
        {alive && where && (
          <div className="text-[#d6cdbd]">
            📍 {where.place.ja}
            {where.isTrip ? '（旅行中）' : ''}
            {where.isEstimated ? '（推定）' : ''}
          </div>
        )}
        {near && (
          <div className="text-[#d6cdbd] leading-snug">
            <span className="font-mono text-[#e6b95c]">{near.year}</span> {near.title}
          </div>
        )}
        <div className="text-[#b9ad9c] leading-snug">{composer.keyFeatures[0]}</div>
        <div className="text-[10px] text-[#8f8476]">クリックでくわしく</div>
      </div>
    </div>
  );
});
ComposerHoverCard.displayName = 'ComposerHoverCard';
