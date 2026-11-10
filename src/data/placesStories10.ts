import type { Place } from './places';

/** 人生の物語 第10弾で使う追加の場所 */
export const PLACES_STORIES_10: Record<string, Place> = {
  owari: { ja: '尾張（愛知県）', lon: 136.91, lat: 35.18, country: '日本' },
  tosa: { ja: '土佐（高知県）', lon: 133.53, lat: 33.56, country: '日本' },
  echizen: { ja: '越前（福井県）', lon: 136.22, lat: 36.06, country: '日本' },
  narita: { ja: '成田（成田山新勝寺）', lon: 140.32, lat: 35.79, country: '日本' },
  hachinohe: { ja: '八戸（青森県）', lon: 141.49, lat: 40.51, country: '日本' },
  kawasaki: { ja: '川崎', lon: 139.7, lat: 35.53, country: '日本' },
  beijing: { ja: '北京', lon: 116.4, lat: 39.91, country: '中国' }
};
