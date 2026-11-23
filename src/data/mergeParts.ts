/**
 * いくつかのファイルに分けて書いたデータ（id → 中身）を、1つにまとめる。
 * 同じ id が2つのファイルにあると、後のものが前のものを黙って上書きしてしまうので、
 * その「重なり」を findDuplicateKeys で見つけて、データ検査（npm run check）で止める。
 */
export type Parts<T> = Record<string, Record<string, T>>;

/** ファイルごとのデータを1つにまとめる（同じ id があれば後のもの） */
export function mergeParts<T>(parts: Parts<T>): Record<string, T> {
  return Object.assign({}, ...Object.values(parts));
}

/** 2つ以上のファイルに出てくる id と、そのファイル名 */
export function findDuplicateKeys<T>(parts: Parts<T>): { key: string; files: string[] }[] {
  const seen = new Map<string, string[]>();
  for (const [file, rec] of Object.entries(parts)) {
    for (const key of Object.keys(rec)) seen.set(key, [...(seen.get(key) ?? []), file]);
  }
  return [...seen.entries()].filter(([, files]) => files.length > 1).map(([key, files]) => ({ key, files }));
}
