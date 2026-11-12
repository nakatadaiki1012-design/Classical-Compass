/**
 * データの「うっかりミス」を自動で見つける検査。`npm run check` で実行（ビルドの前にも動く）。
 *
 * 見つけるもの（エラー：ビルドを止める）
 *   - 作曲家 ID の重複
 *   - 生年が没年より後
 *   - 時代（era）が存在しない
 *   - 作品 ID の重複
 *   - いくつかのファイルに分けたデータ（場所・物語・名曲の物語・滞在記録・年表）で、同じ id が2回登場
 *   - 物語・滞在記録が、存在しない場所や作曲家を指している
 *   - 物語の章の題名や本文が空、年が逆、囲みの種類がおかしい
 *   - 物語の囲み（storiesAsides.ts）が、存在しない章を指している
 *   - 場所の緯度・経度がおかしい
 * 見つけるもの（注意：表示するだけ）
 *   - 作品の作曲年が生涯の外
 *   - 滞在した都市の期間が生涯の外、または始まりと終わりが逆
 */
import { COMPOSERS } from '../src/data/composers';
import { ERAS } from '../src/data/eras';
import { RECORDINGS } from '../src/data/recordings';
import { WORK_LEGACY } from '../src/data/workLegacy';
import { WORK_STORIES, WORK_STORY_PARTS } from '../src/data/workStories';
import { PLACES, PLACE_PARTS } from '../src/data/places';
import { STORY_PARTS } from '../src/data/stories';
import { STORY_ASIDES } from '../src/data/storiesAsides';
import { ITINERARY_PARTS, ITINERARY_RAW } from '../src/data/itinerary';
import { CHRONICLE_PARTS } from '../src/data/chronicle';
import { LIFE_EPISODES } from '../src/data/lifeEpisodes';
import { MUSIC_PERIODS } from '../src/data/musicPeriods';
import { WORK_TRIVIA, COMPOSER_TRIVIA } from '../src/data/trivia';
import { GUIDES } from '../src/data/workGuides';
import { MEDIA, EXTRA_TRIVIA } from '../src/data/workExtras';
import { findDuplicateKeys, mergeParts, Parts } from '../src/data/mergeParts';
import type { WrittenChapter } from '../src/data/storiesWritten';

const errors: string[] = [];
const warnings: string[] = [];

const eraIds = new Set(ERAS.map(e => e.id));
const composerIds = new Set<string>();
const workIds = new Map<string, string>();

for (const c of COMPOSERS) {
  const who = `${c.name}（${c.id}）`;
  if (composerIds.has(c.id)) errors.push(`作曲家 ID が重複: ${c.id}`);
  composerIds.add(c.id);

  if (c.birthYear > c.deathYear) errors.push(`${who}: 生年 ${c.birthYear} が没年 ${c.deathYear} より後`);
  if (!eraIds.has(c.era)) errors.push(`${who}: 時代 "${c.era}" が eras.ts にない`);

  for (const w of c.works) {
    const prev = workIds.get(w.id);
    if (prev) errors.push(`作品 ID が重複: ${w.id}（${prev} と ${who}）`);
    workIds.set(w.id, who);
    if (w.year < c.birthYear || w.year > c.deathYear) {
      warnings.push(`${who}: 作品「${w.title}」の年 ${w.year} が生涯（${c.birthYear}〜${c.deathYear}）の外`);
    }
  }

  for (const s of c.cities) {
    if (s.startYear > s.endYear) warnings.push(`${who}: ${s.cityNameJa} の滞在期間が逆（${s.startYear}〜${s.endYear}）`);
    if (s.startYear < c.birthYear || s.endYear > c.deathYear) {
      warnings.push(`${who}: ${s.cityNameJa} の滞在（${s.startYear}〜${s.endYear}）が生涯の外`);
    }
  }
}

// 録音（data/recordings.ts）が、実在する作品に結びついているか
for (const [workId, r] of Object.entries(RECORDINGS)) {
  if (!workIds.has(workId)) errors.push(`録音 "${workId}" に対応する作品がない`);
  if (!/^[0-9a-f]\/[0-9a-f]{2}\/./.test(r.path)) errors.push(`録音 "${workId}" のパスの形がおかしい: ${r.path}`);
  if (!r.license) errors.push(`録音 "${workId}" にライセンスが書かれていない`);
}

// 「音楽史の中での役割」（data/workLegacy.ts）が、実在する作品に結びついているか
for (const workId of Object.keys(WORK_LEGACY)) {
  if (!workIds.has(workId)) errors.push(`音楽史の役割 "${workId}" に対応する作品がない`);
}
// 名曲の物語（data/workStories.ts）が、実在する作品に結びついているか
for (const workId of Object.keys(WORK_STORIES)) {
  if (!workIds.has(workId)) errors.push(`名曲の物語 "${workId}" に対応する作品がない`);
}

// ---------- ファイルに分けたデータで、同じ id が2回出てこないか ----------
const dupCheck = (label: string, parts: Parts<unknown>) =>
  findDuplicateKeys(parts).forEach(d => errors.push(`${label} "${d.key}" が2か所にある（${d.files.join(' と ')}）。後のほうが前を上書きしてしまう`));
dupCheck('場所', PLACE_PARTS);
dupCheck('人生の物語', STORY_PARTS);
dupCheck('名曲の物語', WORK_STORY_PARTS);
dupCheck('滞在記録', ITINERARY_PARTS);
dupCheck('年表のできごと', CHRONICLE_PARTS);

// ---------- 場所 ----------
for (const [id, p] of Object.entries(PLACES)) {
  if (!p.ja) errors.push(`場所 "${id}" に日本語名がない`);
  if (!(p.lat >= -90 && p.lat <= 90 && p.lon >= -180 && p.lon <= 180)) errors.push(`場所 "${id}" の緯度・経度がおかしい（${p.lat}, ${p.lon}）`);
}

// ---------- 滞在記録 ----------
for (const [cid, list] of Object.entries(ITINERARY_RAW)) {
  if (!composerIds.has(cid)) errors.push(`滞在記録 "${cid}" に対応する作曲家がない`);
  for (const [start, end, placeId] of list) {
    if (!PLACES[placeId]) errors.push(`滞在記録 ${cid}: 場所 "${placeId}" が places にない（地図に出ない）`);
    if (start > end) errors.push(`滞在記録 ${cid}: ${placeId} の期間が逆（${start}〜${end}）`);
  }
}

// ---------- 物語（人生・名曲） ----------
const ASIDE_LABELS = new Set(['人柄', '作風のルーツ', 'こぼれ話']);
const checkChapters = (label: string, list: WrittenChapter[]) => {
  if (!list.length) errors.push(`${label}: 章が1つもない`);
  list.forEach((c, i) => {
    const at = `${label} 第${i + 1}章「${c.title}」`;
    if (!PLACES[c.place]) errors.push(`${at}: 場所 "${c.place}" が places にない（この章が消えてしまう）`);
    if (!c.title?.trim()) errors.push(`${at}: 題名が空`);
    if (!c.text?.trim()) errors.push(`${at}: 本文が空`);
    if (c.end !== undefined && c.end < c.year) errors.push(`${at}: 年が逆（${c.year}〜${c.end}）`);
    if (c.aside && (!ASIDE_LABELS.has(c.aside.label) || !c.aside.text?.trim())) errors.push(`${at}: 囲みの種類か本文がおかしい`);
    if (i > 0 && c.year < list[i - 1].year) warnings.push(`${at}: 前の章（${list[i - 1].year}年）より年が前`);
  });
};
const allStories = mergeParts(STORY_PARTS);
for (const [cid, list] of Object.entries(allStories)) {
  if (!composerIds.has(cid)) errors.push(`人生の物語 "${cid}" に対応する作曲家がない`);
  checkChapters(`人生の物語 ${cid}`, list);
}
for (const [wid, list] of Object.entries(WORK_STORIES)) checkChapters(`名曲の物語 ${wid}`, list);
for (const key of Object.keys(STORY_ASIDES)) {
  const [cid, ...rest] = key.split(':');
  const title = rest.join(':');
  if (!allStories[cid]?.some(c => c.title === title)) errors.push(`物語の囲み "${key}" に対応する章がない（題名を変えた？）`);
}
for (const c of COMPOSERS) if (!allStories[c.id]) warnings.push(`${c.name}（${c.id}）: 手で書いた人生の物語がない（記録から自動で組み立てる）`);

// ---------- 作曲家 id で結びつくデータ ----------
const needComposer = (label: string, id: string) => {
  if (!composerIds.has(id)) errors.push(`${label}: 作曲家 "${id}" がいない`);
};
Object.keys(LIFE_EPISODES).forEach(id => needComposer('人生のエピソード', id));
Object.keys(COMPOSER_TRIVIA).forEach(id => needComposer('作曲家の蘊蓄', id));
Object.keys(mergeParts(CHRONICLE_PARTS)).forEach(id => needComposer('年表のできごと', id));
MUSIC_PERIODS.forEach(p => p.composerIds.forEach(id => needComposer(`音楽の時代「${p.name ?? p.id}」`, id)));

// 曲名の一部で結びつくデータ（蘊蓄・聴きどころ・映画やCM）
const worksOf = new Map(COMPOSERS.map(c => [c.id, c.works]));
const checkMatch = (label: string, list: { composer: string; match: string }[]) =>
  list.forEach(t => {
    needComposer(label, t.composer);
    const works = worksOf.get(t.composer) ?? [];
    if (t.match && !works.some(w => w.title.includes(t.match))) warnings.push(`${label}: ${t.composer} に「${t.match}」を含む曲がない（表示されない）`);
  });
checkMatch('作品の蘊蓄', WORK_TRIVIA);
checkMatch('聴きどころ', GUIDES);
checkMatch('映画・CMで使われた曲', MEDIA);
checkMatch('作品の蘊蓄（追加）', EXTRA_TRIVIA);

if (warnings.length) {
  console.log(`⚠ 注意 ${warnings.length} 件:`);
  warnings.forEach(w => console.log(`  - ${w}`));
}
if (errors.length) {
  console.error(`✖ エラー ${errors.length} 件:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`✔ データ検査 OK（作曲家 ${COMPOSERS.length} 人、作品 ${workIds.size} 曲、聴ける録音 ${Object.keys(RECORDINGS).length} 曲）`);
