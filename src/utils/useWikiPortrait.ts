import { useEffect, useState } from 'react';
import { Composer } from '../types';

/**
 * 肖像画の画像ファイルを持っていない作曲家のために、ウィキペディアの
 * 記事の代表画像（多くは著作権切れの肖像画）を、表示するときに取ってくる。
 * 一度取れたものは端末に覚えておくので、2回目以降は通信しない。
 */
const CACHE_KEY = 'cc-wiki-portraits-v1';
const memory = new Map<string, string>(); // 値が '' なら「画像なし」
const pending = new Map<string, Promise<string>>();

const loadStore = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveStore = (key: string, url: string) => {
  try {
    const store = loadStore();
    store[key] = url;
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    /* 保存できなくても表示には影響しない */
  }
};

const fetchPortrait = (title: string): Promise<string> => {
  const found = pending.get(title);
  if (found) return found;
  const p = fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`)
    .then(r => (r.ok ? r.json() : null))
    .then(j => (j?.thumbnail?.source as string | undefined) || '')
    .catch(() => '')
    .then(url => {
      memory.set(title, url);
      if (url) saveStore(title, url);
      return url;
    });
  pending.set(title, p);
  return p;
};

/** 画像ファイルがない作曲家の肖像画のURL（まだ・取れない場合は ''） */
export function useWikiPortrait(composer: Composer): string {
  const title = composer.portraitUrl ? '' : composer.originalName;
  const [url, setUrl] = useState<string>(() => {
    if (!title) return '';
    return memory.get(title) ?? loadStore()[title] ?? '';
  });

  useEffect(() => {
    if (!title) return;
    let alive = true;
    const known = memory.get(title) ?? loadStore()[title];
    if (known) {
      setUrl(known);
      return;
    }
    fetchPortrait(title).then(u => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [title]);

  return url;
}
