/**
 * データの「うっかりミス」を自動で見つける検査。`npm run check` で実行（ビルドの前にも動く）。
 *
 * 見つけるもの（エラー：ビルドを止める）
 *   - 作曲家 ID の重複
 *   - 生年が没年より後
 *   - 時代（era）が存在しない
 *   - 作品 ID の重複
 * 見つけるもの（注意：表示するだけ）
 *   - 作品の作曲年が生涯の外
 *   - 滞在した都市の期間が生涯の外、または始まりと終わりが逆
 */
import { COMPOSERS } from '../src/data/composers';
import { ERAS } from '../src/data/eras';

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

if (warnings.length) {
  console.log(`⚠ 注意 ${warnings.length} 件:`);
  warnings.forEach(w => console.log(`  - ${w}`));
}
if (errors.length) {
  console.error(`✖ エラー ${errors.length} 件:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`✔ データ検査 OK（作曲家 ${COMPOSERS.length} 人、作品 ${workIds.size} 曲）`);
