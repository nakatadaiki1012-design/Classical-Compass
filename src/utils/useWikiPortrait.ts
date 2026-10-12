import { useEffect, useState } from 'react';
import { Composer } from '../types';

/**
 * 肖像画の画像ファイルを持っていない作曲家のために、ウィキペディアの
 * 記事の代表画像（多くは著作権切れの肖像画）を、表示するときに取ってくる。
 * 一度取れたものは端末に覚えておくので、2回目以降は通信しない。
 */
const CACHE_KEY = 'cc-wiki-portraits-v2';
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

/** ウィキペディア（言語ごと）で、記事の代表画像（サムネイル）のURLを探す */
const lookup = async (lang: 'en' | 'ja', title: string): Promise<string> => {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=400` +
    `&redirects=1&format=json&origin=*&titles=${encodeURIComponent(title)}`;
  try {
    const r = await fetch(api);
    if (!r.ok) return '';
    const j = await r.json();
    const pages = Object.values(j?.query?.pages || {}) as { thumbnail?: { source?: string } }[];
    return pages.find(p => p.thumbnail?.source)?.thumbnail?.source || '';
  } catch {
    return '';
  }
};

/** 英語版 → 日本語版の順に探す（日本の作曲家などは日本語版に画像があることが多い） */
const fetchPortrait = (key: string): Promise<string> => {
  const found = pending.get(key);
  if (found) return found;
  const [en, ja] = key.split('|');
  const p = (async () => {
    let url = en ? await lookup('en', en) : '';
    if (!url && ja) url = await lookup('ja', ja);
    memory.set(key, url);
    if (url) saveStore(key, url);
    return url;
  })();
  pending.set(key, p);
  return p;
};

/** 画像ファイルがない作曲家の肖像画のURL（まだ・取れない場合は ''） */
export function useWikiPortrait(composer: Composer): string {
  const title = composer.portraitUrl ? '' : `${composer.originalName}|${composer.name.replace(/\s/g, '')}`;
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
