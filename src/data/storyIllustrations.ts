/**
 * 物語の章の挿し絵（AI で生成したイメージ図）。
 * 画像は public/story-images/<名前>.webp に置く。
 * 名前は「物語の id（名曲は作品 id、人生は作曲家 id）-章の番号（1から）」。
 * 例：'bach-air-1' … 名曲の物語「G線上のアリア」の第1章
 * 画像を追加したら、ここに名前を1つ足す（npm run check が、ファイルや章があるかを確かめる）。
 */
export const STORY_ILLUSTRATIONS: string[] = [
  'bach-air-1',
  'beethoven-moonlight-3',
  'beethoven-ode-to-joy-4',
  'beethoven-sym5-2',
  'cage-433-2',
  'chopin-minute-1',
  'dvorak-largo-5',
  'grieg-mountainking-2',
  'handel-water-3',
  'holst-planets-1',
  'mozart-requiem-lacrimosa-1',
  'mussorgsky-pictures-2',
  'saint-saens-swan-2',
  'schubert-erlkonig-1',
  'smetana-moldau-2',
  'taki-koujou-1',
  'tchaikovsky-sugarplum-2',
  'yamada-akatonbo-1'
];

const SET = new Set(STORY_ILLUSTRATIONS);

/** その物語の章（0 から数えた番号）の挿し絵の名前（なければ undefined） */
export const illustrationFor = (storyId: string, index: number): string | undefined => {
  const name = `${storyId}-${index + 1}`;
  return SET.has(name) ? name : undefined;
};

/** 挿し絵の名前を「物語の id」と「章の番号（1から）」に分ける */
export const parseIllustration = (name: string): { storyId: string; chapter: number } => {
  const i = name.lastIndexOf('-');
  return { storyId: name.slice(0, i), chapter: Number(name.slice(i + 1)) };
};
