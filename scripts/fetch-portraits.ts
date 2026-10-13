/**
 * 肖像画の画像ファイルを持っていない作曲家の画像を、ビルドの前に集めて public/portraits に保存する。
 * （GitHub Actions のビルド中に実行。失敗しても、ビルド自体は止めない）
 *
 * 集め方：コモンズのファイル名（commonsPortraits.ts）→ ウィキペディア英語版の代表画像 → 日本語版の代表画像
 */
import fs from 'node:fs';
import path from 'node:path';
import { COMPOSERS } from '../src/data/composers';
import { COMMONS_PORTRAITS } from '../src/data/commonsPortraits';

const UA = 'ClassicalCompass/1.0 (https://github.com/nakatadaiki1012-design/Classical-Compass; educational timeline app)';
const OUT = path.resolve('public/portraits');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function download(url: string): Promise<Buffer | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    if (!r.ok) return null;
    if (!(r.headers.get('content-type') || '').startsWith('image/')) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length > 2000 ? buf : null;
  } catch {
    return null;
  }
}

async function wikiThumb(lang: 'en' | 'ja', title: string): Promise<string> {
  const api =
    `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=thumbnail&pithumbsize=500` +
    `&redirects=1&format=json&titles=${encodeURIComponent(title)}`;
  try {
    const r = await fetch(api, { headers: { 'User-Agent': UA } });
    if (!r.ok) return '';
    const j: any = await r.json();
    const pages = Object.values(j?.query?.pages || {}) as { thumbnail?: { source?: string } }[];
    return pages.find(p => p.thumbnail?.source)?.thumbnail?.source || '';
  } catch {
    return '';
  }
}

/** コモンズのファイルを検索し、題名に人物名（または手がかり）が含まれる画像のURLを返す */
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
async function commonsSearch(query: string, keys: string[]): Promise<string[]> {
  const api =
    `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=15&format=json` +
    `&srsearch=${encodeURIComponent(query)}`;
  try {
    const r = await fetch(api, { headers: { 'User-Agent': UA } });
    if (!r.ok) return [];
    const j: any = await r.json();
    const titles: string[] = (j?.query?.search || []).map((x: { title: string }) => x.title);
    return titles
      .filter(t => /\.(jpe?g|png)$/i.test(t))
      .filter(t => keys.some(k => norm(t).includes(norm(k))))
      .map(t => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(t.replace(/^File:/, ''))}?width=500`);
  } catch {
    return [];
  }
}

/** 検索で見つけるときの手がかり（題名にこれらのどれかが含まれるファイルだけを使う） */
const SEARCH_KEYS: Record<string, string[]> = {
  takemitsu: ['takemitsu']
};

/**
 * 正しい肖像画が見つからない（検索すると別のもの、たとえばキノコやクレーターの写真が出てしまう）人。
 * 画像は取得せず、頭文字の表示にする。
 */
const NO_PORTRAIT = new Set(['leonin', 'perotin', 'zeami', 'kanami', 'ikuta-kengyo', 'gabrieli', 'pachelbel', 'takemoto-gidayu', 'yatsuhashi']);

let got = 0;
let missed: string[] = [];
for (const c of COMPOSERS) {
  if (c.portraitUrl || NO_PORTRAIT.has(c.id)) continue;
  const file = path.join(OUT, `${c.id}.jpg`);
  if (fs.existsSync(file)) continue;

  const urls: string[] = [];
  const commons = COMMONS_PORTRAITS[c.id];
  if (commons) urls.push(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons)}?width=500`);

  let buf: Buffer | null = null;
  for (const u of urls) {
    buf = await download(u);
    if (buf) break;
    await sleep(300);
  }
  if (!buf) {
    const en = await wikiThumb('en', c.originalName);
    if (en) buf = await download(en);
    await sleep(300);
  }
  if (!buf) {
    const ja = await wikiThumb('ja', c.name.replace(/\s/g, ''));
    if (ja) buf = await download(ja);
    await sleep(300);
  }
  if (!buf) {
    const keys = SEARCH_KEYS[c.id];
    for (const q of keys ? [c.originalName, keys[0]] : []) {
      for (const u of await commonsSearch(q, keys)) {
        buf = await download(u);
        if (buf) break;
        await sleep(300);
      }
      if (buf) break;
    }
  }
  if (buf) {
    fs.writeFileSync(file, buf);
    got++;
    console.log(`ok   ${c.id}`);
  } else {
    missed.push(c.id);
    console.log(`miss ${c.id}`);
  }
}
console.log(`portraits: saved ${got}, missed ${missed.length}${missed.length ? ' (' + missed.join(', ') + ')' : ''}`);
