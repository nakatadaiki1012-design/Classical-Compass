import React from 'react';
import { LAKES, MAP_LABELS, MOUNTAINS, RIVERS_MAJOR, RIVERS_MINOR } from '../data/europeFeatures';

/**
 * 地図の背景の「川・湖・山脈・地名」。国の形（europePaths）の上、ピンや札の下に重ねる。
 * sc : 拡大しても線や文字の太さが画面の上で変わらないようにする倍率（親の地図と同じもの）
 * labelSc : 地名の文字の倍率（スマホでは sc より控えめにして、ピンの邪魔をしない）
 * k  : いまの拡大率。拡大するほど、細かい地名（小さな国・山脈・川の名前）が出てくる
 */
const MapBackdropBase: React.FC<{ sc: number; k: number; labelSc?: number; idPrefix?: string }> = ({ sc, k, labelSc = sc, idPrefix = 'mb' }) => {
  const level = k >= 2.4 ? 3 : k >= 1.5 ? 2 : 1;
  const hatch = `${idPrefix}-ridge`;
  return (
    <g className="pointer-events-none">
      <defs>
        {/* 山脈の中に並べる「山」の印 */}
        <pattern id={hatch} width={8 * labelSc} height={6.5 * labelSc} patternUnits="userSpaceOnUse">
          <path
            d="M1 5.5L3.5 2L6 5.5"
            transform={`scale(${labelSc})`}
            fill="none"
            stroke="#8f7a5c"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>

      <path d={MOUNTAINS} fill="#3a2e21" opacity={0.6} />
      <path d={MOUNTAINS} fill={`url(#${hatch})`} opacity={0.5} />

      <path d={RIVERS_MAJOR} fill="none" stroke="#4d86b3" strokeWidth={1.3 * labelSc} strokeLinecap="round" strokeLinejoin="round" />
      {level >= 2 && (
        <path d={RIVERS_MINOR} fill="none" stroke="#4d86b3" strokeWidth={0.9 * labelSc} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      )}
      <path d={LAKES} fill="#0d2033" stroke="#4d86b3" strokeWidth={0.7 * labelSc} />

      {MAP_LABELS.filter(l => l.lv <= level).map((l, i) => {
        const style =
          l.k === 'c'
            ? { size: l.lv === 1 ? 13 : 10, fill: '#b9a78c', spacing: 0.3, weight: 700, italic: false, opacity: 0.6 }
            : l.k === 's'
              ? { size: l.lv === 1 ? 11 : 9, fill: '#6a9cc4', spacing: 0.35, weight: 500, italic: true, opacity: 0.9 }
              : l.k === 'm'
                ? { size: 8.5, fill: '#c2a678', spacing: 0.12, weight: 500, italic: false, opacity: 0.85 }
                : { size: 8, fill: '#7fb0d8', spacing: 0.05, weight: 500, italic: true, opacity: 0.9 };
        return (
          <text
            key={i}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            fontSize={style.size * labelSc}
            fontWeight={style.weight}
            fontStyle={style.italic ? 'italic' : undefined}
            letterSpacing={`${style.spacing}em`}
            fill={style.fill}
            opacity={style.opacity}
            fontFamily="sans-serif"
          >
            {l.t}
          </text>
        );
      })}
    </g>
  );
};

export const MapBackdrop = React.memo(MapBackdropBase);
