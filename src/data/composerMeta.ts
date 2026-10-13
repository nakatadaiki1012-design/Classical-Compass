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
  holst: 'ホルスト', tansen: 'ターンセーン', tyagaraja: 'ティヤーガラージャ', liliuokalani: 'リリウオカラニ', 'scott-joplin': 'ジョプリン', 'villa-lobos': 'ヴィラロボス', 'louis-armstrong': 'アームストロング', abing: 'アビン', 'umm-kulthum': 'ウムクルスーム', 'ravi-shankar': 'シャンカール', 'bob-marley': 'マーリー', piazzolla: 'ピアソラ', 'fela-kuti': 'フェラクティ', kanami: 'カンアミ', zeami: 'ゼアミ', 'takemoto-gidayu': 'タケモトギダユウ', 'ikuta-kengyo': 'イクタケンギョウ', 'kurosawa-kinko': 'クロサワキンコ', pythagoras: 'ピタゴラス', gregory1: 'グレゴリウス', guido: 'グイド', leonin: 'レオナン', perotin: 'ペロタン', ockeghem: 'オケゲム', willaert: 'ウィラールト', gabrieli: 'ガブリエリ', yatsuhashi: 'ヤツハシ', 'yamada-kengyo': 'ヤマダケンギョウ', 'taki-rentaro': 'タキレンタロウ', 'yamada-kosaku': 'ヤマダコウサク', 'miyagi-michio': 'ミヤギミチオ', 'ifukube-akira': 'イフクベアキラ', shostakovich: 'ショスタコーヴィチ', gershwin: 'ガーシュウィン', schoenberg: 'シェーンベルク'
};

export type RegionId =
  | 'italy' | 'germanic' | 'france' | 'lowlands' | 'britain' | 'eastern' | 'nordic' | 'iberia' | 'america' | 'japan' | 'asia' | 'mideast' | 'africa' | 'latin' | 'pacific' | 'other';

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
  { id: 'asia', name: 'アジア（インド・中国など）', note: '' },
  { id: 'mideast', name: '中東', note: 'エジプトなど' },
  { id: 'africa', name: 'アフリカ', note: '' },
  { id: 'latin', name: '中南米・カリブ', note: 'ブラジル、アルゼンチン、ジャマイカなど' },
  { id: 'pacific', name: '太平洋（ハワイなど）', note: '' },
  { id: 'other', name: 'その他', note: '' }
];

/** 生まれた土地（出身地）から、地域のグループを決める */
export function regionOf(c: Composer): RegionId {
  const p = c.birthPlace || c.country;
  const has = (...words: string[]) => words.some(w => p.includes(w));
  if (has('フランドル', 'ブラバント', 'ベルギー', 'オランダ')) return 'lowlands';
  if (has('日本')) return 'japan';
  if (has('ハワイ')) return 'pacific';
  if (has('インド', '中国', '朝鮮', 'インドネシア')) return 'asia';
  if (has('エジプト', 'トルコ', 'イラン')) return 'mideast';
  if (has('ナイジェリア', 'ガーナ', 'マリ', '南アフリカ')) return 'africa';
  if (has('ブラジル', 'アルゼンチン', 'ジャマイカ', 'キューバ', 'メキシコ')) return 'latin';
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

/** 生まれた土地の「現在の国」。出身地の書き方から読み取り、例外だけ個別に指定する */
const COUNTRY_OVERRIDE: Record<string, string> = {
  vivaldi: 'イタリア',
  josquin: 'フランス',
  lassus: 'ベルギー',
  dufay: 'ベルギー',
  willaert: 'ベルギー',
  ockeghem: 'ベルギー',
  tallis: 'イギリス',
  byrd: 'イギリス',
  lully: 'イタリア',
  pythagoras: 'ギリシア',
  liliuokalani: 'ハワイ',
  gregory1: 'イタリア',
  guido: 'イタリア',
  yatsuhashi: '日本',
  mussorgsky: 'ロシア',
  mahler: 'チェコ',
  liszt: 'オーストリア',
  bartok: 'ルーマニア',
  prokofiev: 'ウクライナ',
  handel: 'ドイツ',
  chopin: 'ポーランド'
};

export function countryOf(c: Composer): string {
  if (COUNTRY_OVERRIDE[c.id]) return COUNTRY_OVERRIDE[c.id];
  const p = c.birthPlace || c.country;
  const now = p.match(/現([^・）／/]+)/);
  if (now) return now[1].replace(/領$/, '');
  const head = p.split(/[・（(]/)[0];
  if (head === 'ボヘミア') return 'チェコ';
  if (head === 'イングランド') return 'イギリス';
  if (head === 'ロシア帝国') return 'ロシア';
  return head || '不明';
}

/** 国ごとの色（年表の色分け用） */
export const COUNTRY_COLORS: Record<string, string> = {
  イタリア: '#16a34a',
  ドイツ: '#eab308',
  オーストリア: '#ef4444',
  フランス: '#3b82f6',
  イギリス: '#ec4899',
  ロシア: '#8b5cf6',
  ポーランド: '#f97316',
  ハンガリー: '#14b8a6',
  チェコ: '#06b6d4',
  ルーマニア: '#84cc16',
  ウクライナ: '#a3a3a3',
  ベルギー: '#d946ef',
  ノルウェー: '#0ea5e9',
  フィンランド: '#6366f1',
  スペイン: '#f43f5e',
  アメリカ: '#22c55e',
  日本: '#dc2626',
  ギリシア: '#38bdf8',
  ハワイ: '#fb923c',
  インド: '#facc15',
  中国: '#b91c1c',
  エジプト: '#a16207',
  ブラジル: '#16a34a',
  アルゼンチン: '#7dd3fc',
  ジャマイカ: '#65a30d',
  ナイジェリア: '#047857'
};

export const countryColor = (country: string): string => COUNTRY_COLORS[country] || '#9ca3af';
