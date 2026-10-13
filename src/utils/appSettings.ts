import { useSyncExternalStore } from 'react';

/** 見た目の設定（テーマ・フォント・文字の大きさ・年表の色分け）。この端末に覚えておく */
export interface AppSettings {
  theme: 'dark' | 'light';
  font: 'default' | 'gothic' | 'mincho' | 'maru' | 'ud';
  size: 's' | 'm' | 'l';
  colorBy: 'era' | 'country';
}

const KEY = 'cc-settings-v1';
const DEFAULTS: AppSettings = { theme: 'light', font: 'default', size: 'm', colorBy: 'era' };

const load = (): AppSettings => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return DEFAULTS;
  }
};

let settings: AppSettings = load();
const listeners = new Set<() => void>();

/** 設定を <html> の属性に反映する（CSS 側で見た目を切り替える） */
const apply = () => {
  const el = document.documentElement;
  el.dataset.theme = settings.theme;
  el.dataset.font = settings.font;
  el.dataset.size = settings.size;
};
if (typeof document !== 'undefined') apply();

export const getSettings = () => settings;

export const updateSettings = (patch: Partial<AppSettings>) => {
  settings = { ...settings, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* 保存できなくても動く */
  }
  apply();
  listeners.forEach(l => l());
};

export const useSettings = (): AppSettings =>
  useSyncExternalStore(
    cb => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => settings
  );
