/** 作曲家の滞在地・旅行先として使う場所（経度, 緯度） */
export interface Place {
  ja: string;
  lon: number;
  lat: number;
  country: string;
}

import { PLACES_MORE } from './placesMore';

const BASE_PLACES: Record<string, Place> = {
  // イタリア
  rome: { ja: 'ローマ', lon: 12.5, lat: 41.9, country: 'イタリア' },
  naples: { ja: 'ナポリ', lon: 14.27, lat: 40.85, country: 'イタリア' },
  venice: { ja: 'ヴェネツィア', lon: 12.32, lat: 45.44, country: 'イタリア' },
  milan: { ja: 'ミラノ', lon: 9.19, lat: 45.46, country: 'イタリア' },
  bologna: { ja: 'ボローニャ', lon: 11.34, lat: 44.49, country: 'イタリア' },
  florence: { ja: 'フィレンツェ', lon: 11.26, lat: 43.77, country: 'イタリア' },
  mantua: { ja: 'マントヴァ', lon: 10.79, lat: 45.16, country: 'イタリア' },
  ferrara: { ja: 'フェラーラ', lon: 11.62, lat: 44.84, country: 'イタリア' },
  cremona: { ja: 'クレモナ', lon: 10.02, lat: 45.13, country: 'イタリア' },
  palestrina: { ja: 'パレストリーナ', lon: 12.9, lat: 41.84, country: 'イタリア' },
  pesaro: { ja: 'ペーザロ', lon: 12.91, lat: 43.91, country: 'イタリア' },
  busseto: { ja: 'ブッセート', lon: 10.04, lat: 44.98, country: 'イタリア' },
  lucca: { ja: 'ルッカ', lon: 10.5, lat: 43.84, country: 'イタリア' },
  'torre-del-lago': { ja: 'トッレ・デル・ラーゴ', lon: 10.28, lat: 43.83, country: 'イタリア' },
  viareggio: { ja: 'ヴィアレッジョ', lon: 10.25, lat: 43.87, country: 'イタリア' },
  // オーストリア
  vienna: { ja: 'ウィーン', lon: 16.37, lat: 48.21, country: 'オーストリア' },
  salzburg: { ja: 'ザルツブルク', lon: 13.04, lat: 47.8, country: 'オーストリア' },
  rohrau: { ja: 'ローラウ', lon: 16.88, lat: 48.11, country: 'オーストリア' },
  steyr: { ja: 'シュタイアー', lon: 14.42, lat: 48.04, country: 'オーストリア' },
  gmunden: { ja: 'グムンデン', lon: 13.8, lat: 47.92, country: 'オーストリア' },
  // ドイツ
  leipzig: { ja: 'ライプツィヒ', lon: 12.37, lat: 51.34, country: 'ドイツ' },
  dresden: { ja: 'ドレスデン', lon: 13.74, lat: 51.05, country: 'ドイツ' },
  berlin: { ja: 'ベルリン', lon: 13.4, lat: 52.52, country: 'ドイツ' },
  hamburg: { ja: 'ハンブルク', lon: 9.99, lat: 53.55, country: 'ドイツ' },
  lubeck: { ja: 'リューベック', lon: 10.69, lat: 53.87, country: 'ドイツ' },
  luneburg: { ja: 'リューネブルク', lon: 10.41, lat: 53.25, country: 'ドイツ' },
  kothen: { ja: 'ケーテン', lon: 11.97, lat: 51.75, country: 'ドイツ' },
  weimar: { ja: 'ヴァイマール', lon: 11.33, lat: 50.98, country: 'ドイツ' },
  arnstadt: { ja: 'アルンシュタット', lon: 10.95, lat: 50.84, country: 'ドイツ' },
  muhlhausen: { ja: 'ミュールハウゼン', lon: 10.46, lat: 51.21, country: 'ドイツ' },
  eisenach: { ja: 'アイゼナハ', lon: 10.32, lat: 50.98, country: 'ドイツ' },
  ohrdruf: { ja: 'オールドルフ', lon: 10.74, lat: 50.83, country: 'ドイツ' },
  halle: { ja: 'ハレ', lon: 11.97, lat: 51.48, country: 'ドイツ' },
  hannover: { ja: 'ハノーファー', lon: 9.73, lat: 52.37, country: 'ドイツ' },
  dusseldorf: { ja: 'デュッセルドルフ', lon: 6.77, lat: 51.23, country: 'ドイツ' },
  bonn: { ja: 'ボン', lon: 7.1, lat: 50.73, country: 'ドイツ' },
  frankfurt: { ja: 'フランクフルト', lon: 8.68, lat: 50.11, country: 'ドイツ' },
  munich: { ja: 'ミュンヘン', lon: 11.58, lat: 48.14, country: 'ドイツ' },
  mannheim: { ja: 'マンハイム', lon: 8.47, lat: 49.49, country: 'ドイツ' },
  bayreuth: { ja: 'バイロイト', lon: 11.58, lat: 49.94, country: 'ドイツ' },
  magdeburg: { ja: 'マクデブルク', lon: 11.63, lat: 52.12, country: 'ドイツ' },
  sorau: { ja: 'ゾーラウ（ジャリ）', lon: 15.14, lat: 51.64, country: 'ポーランド' },
  zwickau: { ja: 'ツヴィカウ', lon: 12.49, lat: 50.72, country: 'ドイツ' },
  heidelberg: { ja: 'ハイデルベルク', lon: 8.69, lat: 49.4, country: 'ドイツ' },
  kassel: { ja: 'カッセル', lon: 9.49, lat: 51.31, country: 'ドイツ' },
  meiningen: { ja: 'マイニンゲン', lon: 10.42, lat: 50.59, country: 'ドイツ' },
  garmisch: { ja: 'ガルミッシュ', lon: 11.1, lat: 47.49, country: 'ドイツ' },
  // フランス
  paris: { ja: 'パリ', lon: 2.35, lat: 48.86, country: 'フランス' },
  reims: { ja: 'ランス', lon: 4.03, lat: 49.26, country: 'フランス' },
  conde: { ja: 'コンデ＝シュル＝レスコー', lon: 3.59, lat: 50.45, country: 'フランス' },
  'la-cote': { ja: 'ラ・コート＝サン＝タンドレ', lon: 5.26, lat: 45.39, country: 'フランス' },
  nice: { ja: 'ニース', lon: 7.26, lat: 43.7, country: 'フランス' },
  grenoble: { ja: 'グルノーブル', lon: 5.72, lat: 45.19, country: 'フランス' },
  montfort: { ja: 'モンフォール＝ラモーリ', lon: 1.82, lat: 48.78, country: 'フランス' },
  // スイス・ベネルクス・イギリス・アイルランド
  zurich: { ja: 'チューリヒ', lon: 8.54, lat: 47.38, country: 'スイス' },
  lucerne: { ja: 'ルツェルン', lon: 8.31, lat: 47.05, country: 'スイス' },
  geneva: { ja: 'ジュネーヴ', lon: 6.14, lat: 46.2, country: 'スイス' },
  lausanne: { ja: 'ローザンヌ', lon: 6.63, lat: 46.52, country: 'スイス' },
  london: { ja: 'ロンドン', lon: -0.13, lat: 51.51, country: 'イギリス' },
  dublin: { ja: 'ダブリン', lon: -6.26, lat: 53.35, country: 'アイルランド' },
  brussels: { ja: 'ブリュッセル', lon: 4.35, lat: 50.85, country: 'ベルギー' },
  // 中欧・東欧
  prague: { ja: 'プラハ', lon: 14.42, lat: 50.09, country: 'チェコ' },
  budapest: { ja: 'ブダペスト', lon: 19.04, lat: 47.5, country: 'ハンガリー' },
  eszterhaza: { ja: 'エステルハーザ', lon: 16.87, lat: 47.62, country: 'ハンガリー' },
  eisenstadt: { ja: 'アイゼンシュタット', lon: 16.52, lat: 47.85, country: 'オーストリア' },
  zseliz: { ja: 'ジェリズ', lon: 18.67, lat: 48.05, country: 'スロバキア' },
  raiding: { ja: 'ライディング（ドボルヤーン）', lon: 16.53, lat: 47.57, country: 'オーストリア' },
  bratislava: { ja: 'ブラチスラヴァ（ポジョニ）', lon: 17.11, lat: 48.15, country: 'スロバキア' },
  nagyszentmiklos: { ja: 'ナジセントミクローシュ', lon: 20.63, lat: 46.08, country: 'ルーマニア' },
  warsaw: { ja: 'ワルシャワ', lon: 21.01, lat: 52.23, country: 'ポーランド' },
  nelahozeves: { ja: 'ネラホゼヴェス', lon: 14.28, lat: 50.26, country: 'チェコ' },
  iglau: { ja: 'イフラヴァ', lon: 15.58, lat: 49.4, country: 'チェコ' },
  ljubljana: { ja: 'リュブリャナ', lon: 14.51, lat: 46.05, country: 'スロベニア' },
  olomouc: { ja: 'オロモウツ', lon: 17.25, lat: 49.59, country: 'チェコ' },
  // 北欧・バルト
  bergen: { ja: 'ベルゲン', lon: 5.32, lat: 60.39, country: 'ノルウェー' },
  oslo: { ja: 'クリスチャニア（オスロ）', lon: 10.75, lat: 59.91, country: 'ノルウェー' },
  copenhagen: { ja: 'コペンハーゲン', lon: 12.57, lat: 55.68, country: 'デンマーク' },
  helsinki: { ja: 'ヘルシンキ', lon: 24.94, lat: 60.17, country: 'フィンランド' },
  jarvenpaa: { ja: 'ヤルヴェンパー（アイノラ荘）', lon: 25.1, lat: 60.47, country: 'フィンランド' },
  hameenlinna: { ja: 'ハメーンリンナ', lon: 24.46, lat: 60.99, country: 'フィンランド' },
  riga: { ja: 'リガ', lon: 24.11, lat: 56.95, country: 'ラトビア' },
  // ロシア・ウクライナ
  'st-petersburg': { ja: 'サンクトペテルブルク', lon: 30.34, lat: 59.93, country: 'ロシア' },
  moscow: { ja: 'モスクワ', lon: 37.62, lat: 55.76, country: 'ロシア' },
  klin: { ja: 'クリン', lon: 36.73, lat: 56.33, country: 'ロシア' },
  novgorod: { ja: 'ノヴゴロド', lon: 31.27, lat: 58.52, country: 'ロシア' },
  kyiv: { ja: 'キエフ', lon: 30.52, lat: 50.45, country: 'ウクライナ' },
  sontsovka: { ja: 'ソンツォフカ（現ウクライナ東部）', lon: 37.5, lat: 48.4, country: 'ウクライナ' },
  clarens: { ja: 'クラレン（モントルー）', lon: 6.91, lat: 46.43, country: 'スイス' },
  votkinsk: { ja: 'ヴォトキンスク', lon: 54.0, lat: 57.0, country: 'ロシア' },
  // スペイン・ポルトガル
  madrid: { ja: 'マドリード', lon: -3.7, lat: 40.42, country: 'スペイン' },
  seville: { ja: 'セビリア', lon: -5.99, lat: 37.39, country: 'スペイン' },
  lisbon: { ja: 'リスボン', lon: -9.14, lat: 38.72, country: 'ポルトガル' },
  // 地図の外
  'new-york': { ja: 'ニューヨーク', lon: -74.0, lat: 40.71, country: 'アメリカ' },
  'los-angeles': { ja: 'ロサンゼルス', lon: -118.24, lat: 34.05, country: 'アメリカ' },
  'beverly-hills': { ja: 'ビバリーヒルズ', lon: -118.4, lat: 34.07, country: 'アメリカ' },
  tokyo: { ja: '東京', lon: 139.69, lat: 35.68, country: '日本' }
};

/** 作曲家の滞在地・旅行先（追加分も含む全体） */
export const PLACES: Record<string, Place> = { ...BASE_PLACES, ...PLACES_MORE };
