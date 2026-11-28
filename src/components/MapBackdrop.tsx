import React from 'react';
import { LAKES, MAP_LABELS, RIVERS_MAJOR, RIVERS_MINOR } from '../data/europeFeatures';
import type { HistoricalBorders } from '../utils/useHistoricalBorders';

/**
 * 地図の背景の「川・湖・当時の国境・地名」。国の形（europePaths＝今の国境）の上、ピンや札の下に重ねる。
 * sc      : 線の太さの倍率（拡大しても画面の上で太さが変わらないように。親の地図と同じもの）
 * labelSc : 地名の文字の倍率（スマホでは sc より控えめにして、ピンの邪魔をしない）
 * k       : いまの拡大率。拡大するほど、細かい地名が出てくる
 * history : 当時の国境（なければ今の国境だけ）
 */
interface Props {
  sc: number;
  k: number;
  labelSc?: number;
  history?: HistoricalBorders | null;
}

type Box = [number, number, number, number];
const overlaps = (a: Box, b: Box) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

const MapBackdropBase: React.FC<Props> = ({ sc, k, labelSc = sc, history }) => {
  const level = k >= 2.4 ? 3 : k >= 1.5 ? 2 : 1;
  const hasHistory = !!history;

  // 文字が重ならないように、置ける名前だけを選ぶ（当時の国名 → 海 → 今の国名 → 川・山脈 の順に優先）
  const taken: Box[] = [];
  const place = (t: string, x: number, y: number, size: number, spacing: number) => {
    const w = t.length * size * (1 + spacing) * 0.5 + size * 0.4;
    const h = size * 0.62;
    const box: Box = [x - w, y - h * 1.3, x + w, y + h * 0.5];
    if (taken.some(b => overlaps(b, box))) return false;
    taken.push(box);
    return true;
  };

  const histLabels = (history?.l ?? [])
    .filter(l => l.lv <= level)
    .map(l => ({ ...l, size: (l.lv === 1 ? 12.5 : 10.5) * labelSc }))
    .filter(l => place(l.t, l.x, l.y, l.size, 0.12));

  const order = { s: 0, c: 1, r: 2, m: 3 } as const;
  const modern = MAP_LABELS.filter(l => l.lv <= level)
    .sort((a, b) => order[a.k] - order[b.k] || a.lv - b.lv)
    .map(l => {
      const st =
        l.k === 'c'
          ? hasHistory
            ? { size: 9.5, fill: '#9a8a74', spacing: 0.25, weight: 500, italic: false, opacity: 0.75 }
            : { size: l.lv === 1 ? 13 : 10, fill: '#b9a78c', spacing: 0.3, weight: 700, italic: false, opacity: 0.6 }
          : l.k === 's'
            ? { size: l.lv === 1 ? 11 : 9, fill: '#6a9cc4', spacing: 0.35, weight: 500, italic: true, opacity: 0.9 }
            : l.k === 'm'
              ? { size: 8.5, fill: '#a89270', spacing: 0.12, weight: 500, italic: false, opacity: 0.8 }
              : { size: 8, fill: '#7fb0d8', spacing: 0.05, weight: 500, italic: true, opacity: 0.9 };
      return { ...l, st, size: st.size * labelSc };
    })
    .filter(l => place(l.t, l.x, l.y, l.size, l.st.spacing));

  return (
    <g className="pointer-events-none">
      <path d={RIVERS_MAJOR} fill="none" stroke="#4d86b3" strokeWidth={1.3 * labelSc} strokeLinecap="round" strokeLinejoin="round" />
      {level >= 2 && (
        <path d={RIVERS_MINOR} fill="none" stroke="#4d86b3" strokeWidth={0.9 * labelSc} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      )}
      <path d={LAKES} fill="#0d2033" stroke="#4d86b3" strokeWidth={0.7 * labelSc} />

      {history && (
        <path
          d={history.d}
          fill="none"
          stroke="#c99738"
          strokeWidth={1.6 * labelSc}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.75}
        />
      )}

      {modern.map((l, i) => (
        <text
          key={`m${i}`}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          fontSize={l.size}
          fontWeight={l.st.weight}
          fontStyle={l.st.italic ? 'italic' : undefined}
          letterSpacing={`${l.st.spacing}em`}
          fill={l.st.fill}
          opacity={l.st.opacity}
          fontFamily="sans-serif"
        >
          {l.t}
        </text>
      ))}
      {histLabels.map((l, i) => (
        <text
          key={`h${i}`}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          fontSize={l.size}
          fontWeight={700}
          letterSpacing="0.12em"
          fill="#d9a84a"
          stroke="#2a2219"
          strokeWidth={2.6 * labelSc}
          paintOrder="stroke"
          strokeLinejoin="round"
          opacity={0.95}
          fontFamily="'Shippori Mincho', 'Noto Serif JP', serif"
        >
          {l.t}
        </text>
      ))}
    </g>
  );
};

export const MapBackdrop = React.memo(MapBackdropBase);
