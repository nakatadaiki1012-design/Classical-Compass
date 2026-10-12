import { useSyncExternalStore } from 'react';

/**
 * 「日本音楽史」オプション。オンにすると、日本の伝統音楽の人物（八橋検校など）と
 * 日本音楽史のトピックも表示する。設定はこの端末に覚えておく。
 */
const KEY = 'cc-japan-history';
let value = false;
try {
  value = localStorage.getItem(KEY) === '1';
} catch {
  /* 読めなくても動く */
}

const listeners = new Set<() => void>();

export const isJapanMode = () => value;

export const setJapanMode = (next: boolean) => {
  value = next;
  try {
    localStorage.setItem(KEY, next ? '1' : '0');
  } catch {
    /* 保存できなくても動く */
  }
  listeners.forEach(l => l());
};

export const useJapanMode = (): boolean =>
  useSyncExternalStore(
    cb => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => value
  );
