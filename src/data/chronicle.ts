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
