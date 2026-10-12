import { Composer } from '../types';

/** 名鑑の「五十音順」で使う読み（姓の読み。カタカナ） */
export const COMPOSER_YOMI: Record<string, string> = {
  vivaldi: 'ヴィヴァルディ', bach: 'バッハ', handel: 'ヘンデル', haydn: 'ハイドン', mozart: 'モーツァルト',
  beethoven: 'ベートーヴェン', schubert: 'シューベルト', chopin: 'ショパン', mendelssohn: 'メンデルスゾーン',
  schumann: 'シューマンロベルト', liszt: 'リスト', verdi: 'ヴェルディ', wagner: 'ワーグナー', brahms: 'ブラームス',
  tchaikovsky: 'チャイコフスキー', dvorak: 'ドヴォルザーク', grieg: 'グリーグ', mahler: 'マーラー',
  sibelius: 'シベリウス', rachmaninoff: 'ラフマニノフ', debussy: 'ドビュッシー', ravel: 'ラヴェル',
  stravinsky: 'ストラヴィンスキー', machaut: 'マショー', josquin: 'ジョスカン', monteverdi: 'モンテヴェルディ',
  takemitsu: 'タケミツ', telemann: 'テレマン', scarlatti: 'スカルラッティ', rossini: 'ロッシーニ',
  berlioz: 'ベルリオーズ', puccini: 'プッチーニ', palestrina: 'パレストリーナ', 'richard-strauss': 'シュトラウスリヒャルト',
  bartok: 'バルトーク', prokofiev: 'プロコフィエフ', hildegard: 'ヒルデガルト', dufay: 'デュファイ',
  tallis: 'タリス', lassus: 'ラッスス', byrd: 'バード', victoria: 'ビクトリア', gesualdo: 'ジェズアルド',
  schutz: 'シュッツ', lully: 'リュリ', corelli: 'コレッリ', purcell: 'パーセル', pachelbel: 'パッヘルベル',
  couperin: 'クープラン', rameau: 'ラモー', pergolesi: 'ペルゴレージ', 'cpe-bach': 'バッハエマヌエル',
  gluck: 'グルック', boccherini: 'ボッケリーニ', salieri: 'サリエリ', paganini: 'パガニーニ', weber: 'ウェーバー',
  bruckner: 'ブルックナー', smetana: 'スメタナ', bizet: 'ビゼー', mussorgsky: 'ムソルグスキー',
  'saint-saens': 'サンサーンス', faure: 'フォーレ', 'strauss-jr': 'シュトラウスヨハン', 'clara-schumann': 'シューマンクララ',
  donizetti: 'ドニゼッティ', 'rimsky-korsakov': 'リムスキーコルサコフ', elgar: 'エルガー', satie: 'サティ',
  holst: 'ホルスト', yatsuhashi: 'ヤツハシ', 'yamada-kengyo': 'ヤマダケンギョウ', 'taki-rentaro': 'タキレンタロウ', 'yamada-kosaku': 'ヤマダコウサク', 'miyagi-michio': 'ミヤギミチオ', 'ifukube-akira': 'イフクベアキラ', shostakovich: 'ショスタコーヴィチ', gershwin: 'ガーシュウィン', schoenberg: 'シェーンベルク'
};

export type RegionId =
  | 'italy' | 'germanic' | 'france' | 'lowlands' | 'britain' | 'eastern' | 'nordic' | 'iberia' | 'america' | 'japan' | 'other';

export const REGIONS: { id: RegionId; name: string; note: string }[] = [
  { id: 'italy', name: 'イタリア', note: 'オペラとバロック器楽の本場' },
  { id: 'germanic', name: 'ドイツ・オーストリア', note: 'バッハからウィーン古典派、ロマン派まで' },
  { id: 'france', name: 'フランス', note: '宮廷音楽から印象派まで' },
  { id: 'lowlands', name: 'フランドル（ベルギー周辺）', note: 'ルネサンスの対位法を築いたフランドル楽派' },
  { id: 'britain', name: 'イギリス', note: '' },
  { id: 'eastern', name: 'ロシア・東ヨーロッパ', note: 'ロシア、チェコ、ハンガリー、ポーランドなど' },
  { id: 'nordic', name: '北ヨーロッパ', note: 'ノルウェー、フィンランドなど' },
  { id: 'iberia', name: 'スペイン・ポルトガル', note: '' },
  { id: 'america', name: 'アメリカ', note: '' },
  { id: 'japan', name: '日本', note: '' },
  { id: 'other', name: 'その他', note: '' }
];

/** 生まれた土地（出身地）から、地域のグループを決める */
export function regionOf(c: Composer): RegionId {
  const p = c.birthPlace || c.country;
  const has = (...words: string[]) => words.some(w => p.includes(w));
  if (has('フランドル', 'ブラバント', 'ベルギー', 'オランダ')) return 'lowlands';
  if (has('日本')) return 'japan';
  if (has('アメリカ')) return 'america';
  if (has('ボヘミア', 'チェコ', 'ハンガリー', 'ポーランド', 'ロシア', 'ウクライナ', 'ルーマニア', 'スロヴァキア')) return 'eastern';
  if (has('ノルウェー', 'フィンランド', 'スウェーデン', 'デンマーク')) return 'nordic';
  if (has('スペイン', 'ポルトガル')) return 'iberia';
  if (has('イギリス', 'イングランド', 'スコットランド', 'アイルランド')) return 'britain';
  if (has('フランス')) return 'france';
  if (has('イタリア')) return 'italy';
  if (has('ドイツ', 'オーストリア')) return 'germanic';
  return 'other';
}

/** 五十音の行（見出し用）。濁音・拗音は清音の行にまとめる */
const GYO: [string, string][] = [
  ['ア', 'アイウエオヴ'], ['カ', 'カキクケコガギグゲゴ'], ['サ', 'サシスセソザジズゼゾ'], ['タ', 'タチツテトダヂヅデド'],
  ['ナ', 'ナニヌネノ'], ['ハ', 'ハヒフヘホバビブベボパピプペポ'], ['マ', 'マミムメモ'], ['ヤ', 'ヤユヨ'], ['ラ', 'ラリルレロ'], ['ワ', 'ワヲン']
];
export function gyoOf(yomi: string): string {
  const ch = yomi.charAt(0);
  const hit = GYO.find(([, chars]) => chars.includes(ch));
  return (hit ? hit[0] : '他') + '行';
}
