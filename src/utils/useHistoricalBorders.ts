import { useEffect, useState } from 'react';
import { HISTORICAL_BORDER_YEARS } from '../data/historicalBorderYears';
import { getAssetUrl } from './assets';

/** 「当時の国境」1年ぶんのデータ（public/borders/<年>.json） */
export interface HistoricalBorders {
  /** データの年（この年ごろの国境） */
  y: number;
  /** 国と国の境目の線（SVG path） */
  d: string;
  /** 当時の国名。lv: 1=いつも, 2=少し拡大したら, 3=さらに拡大したら */
  l: { t: string; x: number; y: number; lv: 1 | 2 | 3 }[];
}

/** 今と同じ国境とみなす年（これより後は「当時の国境」を出さない） */
export const MODERN_FROM = 1994;

/** その年に使う「当時の国境」のデータの年（その年以前でいちばん近いもの） */
export const borderYearFor = (year: number): number | null => {
  let best: number | null = null;
  for (const y of HISTORICAL_BORDER_YEARS) if (y <= year) best = y;
  return best !== null && best < MODERN_FROM ? best : null;
};

const cache = new Map<number, HistoricalBorders>();
const pending = new Map<number, Promise<HistoricalBorders | null>>();

const load = (y: number): Promise<HistoricalBorders | null> => {
  const hit = pending.get(y);
  if (hit) return hit;
  const p = fetch(getAssetUrl(`borders/${y}.json`))
    .then(r => (r.ok ? r.json() : null))
    .then((data: HistoricalBorders | null) => {
      if (data) cache.set(y, data);
      return data;
    })
    .catch(() => null);
  pending.set(y, p);
  return p;
};

/** その年ごろの国境（読み込み中・該当なしは null）。必要になった年のぶんだけ読み込む */
export function useHistoricalBorders(year: number, enabled = true): HistoricalBorders | null {
  const by = enabled ? borderYearFor(year) : null;
  const [data, setData] = useState<HistoricalBorders | null>(() => (by !== null ? cache.get(by) ?? null : null));
  useEffect(() => {
    if (by === null) {
      setData(null);
      return;
    }
    const hit = cache.get(by);
    if (hit) {
      setData(hit);
      return;
    }
    let alive = true;
    load(by).then(d => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [by]);
  return data && data.y === by ? data : by === null ? null : data;
}
