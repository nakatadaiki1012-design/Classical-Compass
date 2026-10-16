import { MUSIC_PERIODS, MusicPeriod } from './musicPeriods';
import { HISTORY_AXES } from './historyAxes';
import { COMPOSERS } from './composers';
import { Composer } from '../types';
import { EXTRA_TERMS, TERM_DETAILS, TermCategory } from './glossaryExtra';

/**
 * ウィキペディアのように、文章の中の言葉から、用語・作曲家・時代のページへ飛ぶための索引。
 * 用語は「音楽史」のデータ（時代ごとの用語・テーマごとの用語）から自動で集める。
 */

export type WikiTarget =
  | { kind: 'home' }
  | { kind: 'term'; id: string }
  | { kind: 'composer'; id: string }
  | { kind: 'period'; id: string };

export const targetKey = (t: WikiTarget): string => (t.kind === 'home' ? 'home' : `${t.kind}:${t.id}`);

export interface TermText {
  text: string;
  /** どこの用語集に載っていたか（時代名 or テーマ名） */
  from: string;
  periodId?: string;
}
export interface TermEntry {
  id: string; // 用語そのもの
  texts: TermText[];
  aliases: string[];
  /** ひとことで（基礎用語のみ） */
  short?: string;
  /** くわしく */
  detail?: string;
  /** 代表的な曲・人 */
  examples?: string[];
  cat?: TermCategory;
  /** 文章の中で自動リンクにしない */
  nolink?: boolean;
}

export const TERMS = new Map<string, TermEntry>();

const baseName = (s: string) => s.replace(/（[^）]*）/g, '').trim();
const aliasesOf = (name: string): string[] => {
  const out = new Set<string>([name, baseName(name)]);
  const inner = [...name.matchAll(/（([^）]*)）/g)].map(m => m[1]);
  inner.forEach(i => i.split(/[・、，, ／/]/).forEach(p => p.trim().length >= 3 && out.add(p.trim())));
  return [...out].filter(a => a.length >= 3 || (a.length >= 2 && /[ァ-ヶ一-龠]{2}/.test(a) && a === name));
};

const addTerm = (name: string, text: string, from: string, periodId?: string) => {
  let e = TERMS.get(name);
  if (!e) {
    e = { id: name, texts: [], aliases: aliasesOf(name) };
    TERMS.set(name, e);
  }
  if (!e.texts.some(t => t.text === text)) e.texts.push({ text, from, periodId });
};

MUSIC_PERIODS.forEach(p => p.terms.forEach(([n, t]) => addTerm(n, t, p.name, p.id)));
HISTORY_AXES.forEach(a => a.terms.forEach(([n, t]) => addTerm(n, t, `テーマ：${a.name}`)));

// 基礎用語（楽器・形式・理論など）を加える
EXTRA_TERMS.forEach(x => {
  const e = TERMS.get(x.name) ?? { id: x.name, texts: [], aliases: aliasesOf(x.name) };
  e.short = x.short;
  e.detail = e.detail ?? x.detail;
  e.examples = e.examples ?? x.examples;
  e.cat = x.cat;
  e.nolink = x.nolink;
  x.aliases?.forEach(a => !e.aliases.includes(a) && e.aliases.push(a));
  TERMS.set(x.name, e);
});
// すでにある用語に「くわしく」「例」を足す
Object.entries(TERM_DETAILS).forEach(([name, d]) => {
  const e = TERMS.get(name);
  if (!e) return;
  e.detail = d.detail ?? e.detail;
  e.examples = d.examples ?? e.examples;
});

// ----- 作曲家・時代の別名 -----
const composerAliases = (c: Composer): string[] => {
  const out = new Set<string>();
  [c.name, c.shortName].forEach(n => n && out.add(n));
  const last = c.name.split('・').pop();
  if (last) out.add(last);
  return [...out].filter(a => a.length >= 3);
};
/** 時代の短い名前（「日本：」「世界：」の頭は外す） */
export const periodShortName = (p: MusicPeriod): string =>
  p.name.replace(/^(日本|世界)：/, '').split(/[：（]/)[0].trim();
const periodAliases = (p: MusicPeriod): string[] => {
  const base = periodShortName(p);
  return [...new Set([p.name, base])].filter(a => a.length >= 3);
};

// ----- 文章の中から探すための索引（別名 → 行き先） -----
const ALIAS = new Map<string, WikiTarget>();
COMPOSERS.forEach(c => composerAliases(c).forEach(a => !ALIAS.has(a) && ALIAS.set(a, { kind: 'composer', id: c.id })));
TERMS.forEach(e => !e.nolink && e.aliases.forEach(a => !ALIAS.has(a) && ALIAS.set(a, { kind: 'term', id: e.id })));
MUSIC_PERIODS.forEach(p => periodAliases(p).forEach(a => !ALIAS.has(a) && ALIAS.set(a, { kind: 'period', id: p.id })));

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LINK_RE = new RegExp(
  [...ALIAS.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRe)
    .join('|'),
  'g'
);

export interface TextPart {
  text: string;
  target?: WikiTarget;
}

/** 文章を「ふつうの文字」と「リンクにする言葉」に分ける。同じ行き先へのリンクは、最初の1回だけ。 */
export function linkify(text: string, exclude: string[] = []): TextPart[] {
  const parts: TextPart[] = [];
  const seen = new Set<string>(exclude);
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const target = ALIAS.get(m[0]);
    if (!target) continue;
    const key = targetKey(target);
    if (seen.has(key)) continue;
    seen.add(key);
    const i = m.index ?? 0;
    if (i > last) parts.push({ text: text.slice(last, i) });
    parts.push({ text: m[0], target });
    last = i + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts.length ? parts : [{ text }];
}

/** 文章に出てくるリンク先の一覧（重複なし） */
export const targetsIn = (text: string, exclude: string[] = []): WikiTarget[] =>
  linkify(text, exclude).flatMap(p => (p.target ? [p.target] : []));

// ----- ページの中身を作るための関数 -----
export const getTerm = (id: string) => TERMS.get(id);
export const getPeriod = (id: string) => MUSIC_PERIODS.find(p => p.id === id);
export const getComposer = (id: string) => COMPOSERS.find(c => c.id === id);

export const composerText = (c: Composer): string =>
  [c.biography, c.musicalStyle, ...c.keyFeatures, ...c.works.map(w => w.title + w.description)].join('\n');

/** 「この言葉に触れているページ」（ウィキペディアの「リンク元」） */
let BACKLINK_CACHE: Map<string, WikiTarget[]> | null = null;
export function backlinksOf(target: WikiTarget): WikiTarget[] {
  if (!BACKLINK_CACHE) {
    const m = new Map<string, WikiTarget[]>();
    const add = (to: WikiTarget, from: WikiTarget) => {
      const k = targetKey(to);
      if (targetKey(from) === k) return;
      const list = m.get(k) || [];
      if (!list.some(x => targetKey(x) === targetKey(from))) list.push(from);
      m.set(k, list);
    };
    TERMS.forEach(e => {
      const from: WikiTarget = { kind: 'term', id: e.id };
      [...e.texts.map(t => t.text), e.short ?? '', e.detail ?? ''].forEach(t => targetsIn(t).forEach(to => add(to, from)));
    });
    MUSIC_PERIODS.forEach(p => {
      const from: WikiTarget = { kind: 'period', id: p.id };
      targetsIn([p.summary, p.mainstream, ...p.events.map(e => e[1])].join('\n')).forEach(to => add(to, from));
    });
    COMPOSERS.forEach(c => {
      const from: WikiTarget = { kind: 'composer', id: c.id };
      targetsIn(composerText(c)).forEach(to => add(to, from));
    });
    BACKLINK_CACHE = m;
  }
  return BACKLINK_CACHE.get(targetKey(target)) || [];
}

export function titleOf(t: WikiTarget): string {
  if (t.kind === 'term') return t.id;
  if (t.kind === 'composer') return getComposer(t.id)?.shortName ?? t.id;
  if (t.kind === 'period') { const p = getPeriod(t.id); return p ? periodShortName(p) : t.id; }
  return '用語集';
}

/** 検索：用語・作曲家・時代から */
export function searchWiki(query: string): WikiTarget[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hit = (s: string) => s.toLowerCase().includes(q);
  const out: { t: WikiTarget; score: number }[] = [];
  TERMS.forEach(e => {
    const nameHit = hit(e.id);
    if (nameHit || e.aliases.some(hit) || [e.short, e.detail, ...e.texts.map(x => x.text)].some(x => x && hit(x))) out.push({ t: { kind: 'term', id: e.id }, score: nameHit ? 0 : 2 });
  });
  COMPOSERS.forEach(c => {
    if (hit(c.name) || hit(c.shortName) || hit(c.originalName)) out.push({ t: { kind: 'composer', id: c.id }, score: 1 });
  });
  MUSIC_PERIODS.forEach(p => {
    if (hit(p.name)) out.push({ t: { kind: 'period', id: p.id }, score: 1 });
  });
  return out.sort((a, b) => a.score - b.score).slice(0, 40).map(x => x.t);
}

export const periodsOfComposer = (id: string): MusicPeriod[] => MUSIC_PERIODS.filter(p => p.composerIds.includes(id));

/** 同時代の人（文字で書かれているので、名前から作曲家を探す） */
export function contemporariesOf(c: Composer): Composer[] {
  return c.contemporaries
    .map(n => COMPOSERS.find(x => x.shortName === n || x.name === n || x.name.endsWith('・' + n)))
    .filter((x): x is Composer => !!x && x.id !== c.id);
}
