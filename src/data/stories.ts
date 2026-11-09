import { Composer, Composition } from '../types';
import { PLACES, Place } from './places';
import { getStays } from './itinerary';
import { LIFE_EPISODES } from './lifeEpisodes';
import { getComposerEvents } from './chronicle';
import { WRITTEN_STORIES, StoryAside } from './storiesWritten';
import { WRITTEN_STORIES_2 } from './storiesWritten2';
import { STORY_ASIDES } from './storiesAsides';

const ALL_WRITTEN = { ...WRITTEN_STORIES, ...WRITTEN_STORIES_2 };
import { imageKeyFor } from './imageHints';

/** 人生の物語の1章 */
export interface StoryChapter {
  year: number;
  end: number;
  place: Place;
  title: string;
  text: string;
  /** 写真の手がかり（'英語版の記事名|日本語版の記事名'） */
  image?: string;
  caption?: string;
  /** 人柄・作風のルーツなどの囲み */
  aside?: StoryAside;
  /** この期間に作曲した曲 */
  works: Composition[];
  /** 旅行・遠征 */
  isTrip?: boolean;
}

export interface Story {
  chapters: StoryChapter[];
  /** 手で書いた物語か（false なら記録から自動で組み立てたもの） */
  written: boolean;
}

const worksIn = (composer: Composer, from: number, to: number) =>
  composer.works.filter(w => w.year >= from && w.year <= to).sort((a, b) => a.year - b.year);

/** 手で書いた物語 */
const fromWritten = (composer: Composer): Story | null => {
  const list = ALL_WRITTEN[composer.id];
  if (!list) return null;
  const chapters = list
    .map(c => {
      const place = PLACES[c.place];
      if (!place) return null;
      const end = c.end ?? c.year;
      return {
        year: c.year,
        end,
        place,
        title: c.title,
        text: c.text,
        image: c.image,
        caption: c.caption,
        aside: c.aside ?? STORY_ASIDES[`${composer.id}:${c.title}`],
        // 死後の章（復活など）には曲を並べない
        works: c.year > composer.deathYear ? [] : worksIn(composer, c.year, end)
      } as StoryChapter;
    })
    .filter((c): c is StoryChapter => !!c);
  // どの章にも入らなかった曲は、いちばん近い章に入れる
  const used = new Set(chapters.flatMap(c => c.works.map(w => w.id)));
  composer.works
    .filter(w => !used.has(w.id))
    .forEach(w => {
      const lifeChapters = chapters.filter(c => c.year <= composer.deathYear);
      const best = lifeChapters.reduce<StoryChapter | null>((b, c) => {
        const d = w.year < c.year ? c.year - w.year : w.year > c.end ? w.year - c.end : 0;
        const bd = !b ? Infinity : w.year < b.year ? b.year - w.year : w.year > b.end ? w.year - b.end : 0;
        return d < bd ? c : b;
      }, null);
      if (best) best.works.push(w);
    });
  chapters.forEach(c => c.works.sort((a, b) => a.year - b.year));
  return { chapters, written: true };
};

const firstSentence = (t: string) => {
  const i = t.indexOf('。');
  return i > 0 && i < 80 ? t.slice(0, i + 1) : t;
};

/** 2つの文章に、10文字以上同じ部分があるか（同じ話のくり返しを避ける） */
const overlaps = (a: string, b: string) => {
  const x = a.replace(/[\s、。「」『』（）]/g, '');
  const y = b.replace(/[\s、。「」『』（）]/g, '');
  for (let i = 0; i + 10 <= y.length; i += 3) if (x.includes(y.slice(i, i + 10))) return true;
  return false;
};

/** 記録（滞在・エピソード・生と死の話）から、章を自動で組み立てる */
const fromRecords = (composer: Composer): Story => {
  const stays = getStays(composer);
  // 同じ場所に続けているときは1つにまとめる
  const merged: typeof stays = [];
  stays.forEach(s => {
    const last = merged[merged.length - 1];
    if (last && last.place.ja === s.place.ja && s.start <= last.end + 1 && !s.isTrip && !last.isTrip) {
      last.end = Math.max(last.end, s.end);
      if (s.note && !last.note.includes(s.note)) last.note = `${last.note}。${s.note}`.replace(/。。/g, '。');
    } else merged.push({ ...s });
  });
  // 期間が重なる記録（長く住んだ町の途中の旅など）は、年順に並べ直して区切りを整える
  merged.sort((a, b) => a.start - b.start);

  const life = LIFE_EPISODES[composer.id];
  const episodes = getComposerEvents(composer.id).filter(e => e.kind === 'episode' && (e.text || e.title));
  const usedEp = new Set<string>();

  const chapters: StoryChapter[] = merged.map((s, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === merged.length - 1;
    const end = isLast ? Math.max(s.end, composer.deathYear) : s.end;
    const parts: string[] = [];
    if (isFirst && life?.birthEpisode) parts.push(life.birthEpisode);
    if (s.note) parts.push(s.note.endsWith('。') ? s.note : `${s.note}。`);
    episodes
      .filter(e => e.year >= s.start && e.year <= end && !usedEp.has(e.id))
      // 滞在のひとことと同じ話はくり返さない
      .filter(e => !overlaps(parts.join(''), e.text || e.title))
      .slice(0, 3)
      .forEach(e => {
        usedEp.add(e.id);
        parts.push(`${e.year}年、${e.text ? firstSentence(e.text) : e.title}`.replace(/。?$/, '。'));
      });
    if (isLast && life?.deathEpisode) parts.push(life.deathEpisode);
    const title = isFirst
      ? `${s.place.ja}に生まれる`
      : s.isTrip
        ? `${s.place.ja}への旅`
        : isLast && s.start <= composer.deathYear
          ? `${s.place.ja}での晩年`
          : `${s.place.ja}へ`;
    return {
      year: isFirst ? Math.min(s.start, composer.birthYear) : s.start,
      end,
      place: s.place,
      title,
      text: parts.join(''),
      image: imageKeyFor(s.note) || undefined,
      works: worksIn(composer, isFirst ? composer.birthYear : s.start, end),
      isTrip: s.isTrip
    };
  });

  // どの章にも入らなかった曲は、作曲した年をふくむ（なければ近い）章へ
  const used = new Set(chapters.flatMap(c => c.works.map(w => w.id)));
  composer.works
    .filter(w => !used.has(w.id))
    .forEach(w => {
      let best: StoryChapter | null = null;
      let bd = Infinity;
      chapters.forEach(c => {
        const d = w.year < c.year ? c.year - w.year : w.year > c.end ? w.year - c.end : 0;
        if (d < bd) {
          bd = d;
          best = c;
        }
      });
      if (best) (best as StoryChapter).works.push(w);
    });
  chapters.forEach(c => c.works.sort((a, b) => a.year - b.year));
  return { chapters, written: false };
};

const cache = new Map<string, Story>();

/** その作曲家の人生の物語（章の並び） */
export function getStory(composer: Composer): Story {
  const hit = cache.get(composer.id);
  if (hit) return hit;
  const story = fromWritten(composer) ?? fromRecords(composer);
  cache.set(composer.id, story);
  return story;
}
