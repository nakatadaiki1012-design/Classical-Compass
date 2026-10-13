import { useSyncExternalStore } from 'react';

/**
 * 「世界の音楽」オプション。オンにすると、クラシック・日本以外の地域の音楽家（ハワイ、インド、中南米、アフリカなど）と
 * 世界の音楽のトピックも表示する。設定はこの端末に覚えておく。
 */
const KEY = 'cc-world-music';
let value = false;
try {
  value = localStorage.getItem(KEY) === '1';
} catch {
  /* 読めなくても動く */
}

const listeners = new Set<() => void>();

export const isWorldMode = () => value;

export const setWorldMode = (next: boolean) => {
  value = next;
  try {
    localStorage.setItem(KEY, next ? '1' : '0');
  } catch {
    /* 保存できなくても動く */
  }
  listeners.forEach(l => l());
};

export const useWorldMode = (): boolean =>
  useSyncExternalStore(
    cb => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => value
  );
