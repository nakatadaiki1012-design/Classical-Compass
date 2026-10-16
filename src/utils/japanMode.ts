import { useSyncExternalStore } from 'react';

/**
 * 「日本音楽史」オプション（3段階）。
 * - off  : 西洋音楽だけ
 * - on   : 西洋音楽に、日本の伝統音楽の人物とトピックを加える
 * - only : 日本の音楽だけ（日本の作曲家・日本音楽史の時代とトピック）
 * 設定はこの端末に覚えておく。
 */
export type JapanLevel = 'off' | 'on' | 'only';
const KEY = 'cc-japan-history';
let level: JapanLevel = 'off';
try {
  const v = localStorage.getItem(KEY);
  level = v === '1' || v === 'on' ? 'on' : v === 'only' ? 'only' : 'off';
} catch {
  /* 読めなくても動く */
}

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const isJapanMode = () => level !== 'off';
export const isJapanOnly = () => level === 'only';
export const getJapanLevel = () => level;

export const setJapanLevel = (next: JapanLevel) => {
  level = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* 保存できなくても動く */
  }
  listeners.forEach(l => l());
};
export const setJapanMode = (on: boolean) => setJapanLevel(on ? 'on' : 'off');

export const useJapanLevel = (): JapanLevel => useSyncExternalStore(subscribe, () => level);
export const useJapanMode = (): boolean => useSyncExternalStore(subscribe, () => level !== 'off');
export const useJapanOnly = (): boolean => useSyncExternalStore(subscribe, () => level === 'only');

/** 日本の人物かどうか（日本の伝統音楽の人物、または日本の作曲家） */
export const isJapanesePerson = (c: { category?: string; nationalityJa: string }) =>
  c.category === 'japan-trad' || c.nationalityJa === '日本';
