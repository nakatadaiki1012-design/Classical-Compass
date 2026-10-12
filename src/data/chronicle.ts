import { COMPOSERS } from './composers';
import {
  CHRONICLE_RAW,
  CHRONICLE_RAW_LATE,
  WORLD_EVENTS,
  RawEntry
} from './chronicleData';
import { Composer, Composition } from '../types';

/** 年表・地図に出す「できごと」1件 */
export type YearEventKind = 'birth' | 'death' | 'work' | 'episode' | 'world';

export interface YearEvent {
  id: string;
  year: number;
  kind: YearEventKind;
  title: string;
  text?: string;
  composerId?: string;
  /** 試聴できる作品の場合、その作品（クリックで解説・試聴） */
  playable?: Composition;
}

/** 追加データ（試聴なしの主要作品とエピソード）。作曲家IDごと */
const ALL_RAW: Record<string, RawEntry[]> = { ...CHRONICLE_RAW, ...CHRONICLE_RAW_LATE };

/** 作曲家1人分のできごと（誕生・没年・作品・エピソード）を年順に返す */
export function buildComposerEvents(composer: Composer): YearEvent[] {
  const events: YearEvent[] = [];

  events.push({
    id: `${composer.id}-birth`,
    year: composer.birthYear,
    kind: 'birth',
    composerId: composer.id,
    title: `${composer.shortName}が誕生`,
    text: composer.birthPlace ? `${composer.birthPlace}で生まれる。` : undefined
  });
  events.push({
    id: `${composer.id}-death`,
    year: composer.deathYear,
    kind: 'death',
    composerId: composer.id,
    title: `${composer.shortName}が亡くなる`,
    text: composer.deathPlace
      ? `${composer.deathPlace}で、${composer.deathYear - composer.birthYear}歳で亡くなる。`
      : undefined
  });

  composer.works.forEach(work => {
    events.push({
      id: `${composer.id}-play-${work.id}`,
      year: work.year,
      kind: 'work',
      composerId: composer.id,
      title: work.title,
      text: work.description,
      playable: work
    });
  });

  composer.milestones?.forEach((m, idx) => {
    events.push({
      id: `${composer.id}-ms-${idx}`,
      year: m.year,
      kind: 'episode',
      composerId: composer.id,
      title: m.event
    });
  });

  (ALL_RAW[composer.id] || []).forEach((entry, idx) => {
    const [year, kind, title, text] = entry;
    events.push({
      id: `${composer.id}-ch-${idx}`,
      year,
      kind: kind === 'w' ? 'work' : 'episode',
      composerId: composer.id,
      title,
      text
    });
  });

  return events.sort((a, b) => a.year - b.year);
}

const WORLD: YearEvent[] = WORLD_EVENTS.map(([year, title, text], idx) => ({
  id: `world-${idx}`,
  year,
  kind: 'world' as const,
  title,
  text
}));

/** 全作曲家＋世界のできごと（年順） */
export const ALL_EVENTS: YearEvent[] = [
  ...COMPOSERS.flatMap(buildComposerEvents),
  ...WORLD
].sort((a, b) => a.year - b.year);

const BY_YEAR = new Map<number, YearEvent[]>();
ALL_EVENTS.forEach(ev => {
  const list = BY_YEAR.get(ev.year);
  if (list) list.push(ev);
  else BY_YEAR.set(ev.year, [ev]);
});

/** その年のできごと */
export function getEventsForYear(year: number): YearEvent[] {
  return BY_YEAR.get(year) || [];
}

/** その年にできごとが無いときのための、前後で最も近いできごと（音楽のものを優先） */
export function getNearestEvents(year: number): { prev?: YearEvent; next?: YearEvent } {
  const music = ALL_EVENTS.filter(e => e.kind !== 'world');
  let prev: YearEvent | undefined;
  let next: YearEvent | undefined;
  for (const ev of music) {
    if (ev.year < year) prev = ev;
    else if (ev.year > year) {
      next = ev;
      break;
    }
  }
  return { prev, next };
}

/** 作曲家の主要作品・エピソードを「年ごと」にまとめる（名鑑・地図ポップアップ用） */
export function getComposerEvents(composerId: string): YearEvent[] {
  const composer = COMPOSERS.find(c => c.id === composerId);
  return composer ? buildComposerEvents(composer) : [];
}

/** 指定年の前後 range 年に、その作曲家が何をしたか（地図ポップアップ用） */
export function getComposerEventsAround(
  composerId: string,
  year: number,
  range = 2
): YearEvent[] {
  return getComposerEvents(composerId).filter(
    e => e.kind !== 'birth' && e.kind !== 'death'
      ? Math.abs(e.year - year) <= range
      : e.year === year
  );
}

/** その年に近い年の音楽のできごと（記録の少ない年の補足用）。近い順に最大 limit 件 */
export function getNearbyMusicEvents(
  year: number,
  options: { range?: number; limit?: number; composerIds?: Set<string> | null } = {}
): YearEvent[] {
  const { range = 6, limit = 6, composerIds = null } = options;
  return ALL_EVENTS.filter(
    e =>
      e.kind !== 'world' &&
      e.year !== year &&
      Math.abs(e.year - year) <= range &&
      (!composerIds || (e.composerId && composerIds.has(e.composerId))) &&
      // 誕生・没年より、作品とできごとを優先する
      (e.kind === 'work' || e.kind === 'episode')
  )
    .sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year) || a.year - b.year)
    .slice(0, limit);
}

/** 「その年のトピック」1件（短い一行表示用） */
export interface YearTopic {
  id: string;
  /** 'world' | 'history'（音楽史） | 音楽のできごとの種類 */
  tag: 'world' | 'history' | 'birth' | 'death' | 'work' | 'episode';
  /** 作曲家名（音楽のできごとのとき） */
  who?: string;
  /** 短くした見出し */
  label: string;
  /** 省略せずに表示するための全文 */
  full: string;
  year: number;
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const RANK: Record<YearEventKind, number> = { work: 1, episode: 2, birth: 3, death: 3, world: 0 };

/**
 * その年の重要なできごとを、短いトピックとして最大 limit 件返す。
 * 世界のできごと（フランス革命など）を先に、次に音楽のできごとを選ぶ。
 * その年に何もなければ、近い年（前後6年）の世界のできごとを1件返す（nearYear 付き）。
 */
export function getYearTopics(
  year: number,
  options: { limit?: number; composerIds?: Set<string> | null } = {}
): { topics: YearTopic[]; hiddenCount: number; near?: YearTopic } {
  const { limit = 4, composerIds = null } = options;
  const all = getEventsForYear(year);
  const toTopic = (e: YearEvent): YearTopic => {
    const composer = e.composerId ? COMPOSERS.find(c => c.id === e.composerId) : undefined;
    const isHistory = e.kind === 'world' && e.title.startsWith('【音楽史】');
    const title = e.title.replace('【音楽史】', '');
    return {
      id: e.id,
      tag: e.kind === 'world' ? (isHistory ? 'history' : 'world') : e.kind,
      who: composer?.shortName,
      label: clip(title, 20),
      full: composer ? `${composer.shortName}：${title}` : title,
      year: e.year
    };
  };

  const world = all.filter(e => e.kind === 'world').map(toTopic);
  const music = all
    .filter(e => e.kind !== 'world' && (!composerIds || (e.composerId && composerIds.has(e.composerId))))
    .sort((a, b) => RANK[a.kind] - RANK[b.kind] || (a.playable ? -1 : 0) - (b.playable ? -1 : 0))
    .map(toTopic);

  const slots = Math.max(limit - world.length, 2);
  // 音楽のできごとは、同じ作曲家ばかりにならないよう、まず別々の人から選ぶ
  const seen = new Set<string>();
  const firstPerPerson = music.filter(t => {
    const key = t.who || t.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const rest = music.filter(t => !firstPerPerson.includes(t));
  const musicPicked = [...firstPerPerson, ...rest].slice(0, slots);
  const topics = [...world.slice(0, limit), ...musicPicked].slice(0, limit);
  const hiddenCount = world.length + music.length - topics.length;

  let near: YearTopic | undefined;
  if (topics.length === 0) {
    const cand = ALL_EVENTS.filter(e => e.kind === 'world' && Math.abs(e.year - year) <= 6 && e.year !== year).sort(
      (a, b) => Math.abs(a.year - year) - Math.abs(b.year - year)
    )[0];
    if (cand) near = toTopic(cand);
  }
  return { topics, hiddenCount: Math.max(0, hiddenCount), near };
}
