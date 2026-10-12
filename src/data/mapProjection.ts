/** 地図の投影（メルカトル図法）。europePaths.ts の国境と必ず同じ式を使うこと。 */
export const MAP_BOUNDS = { minLon: -12, maxLon: 43, minLat: 36, maxLat: 61.5 };
export const SVG_W = 960;
export const SVG_H = 696;

const SCALE = 1000.0717878647097;
const TX = 209.45454545454544;
const TY = 1370.6467849023627;
const rad = (deg: number) => (deg * Math.PI) / 180;
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/** 経度・緯度 → 地図(SVG)の座標。範囲の外の点も、そのまま計算して返す */
export const projectGeoToSvg = (lon: number, lat: number): [number, number] => [
  SCALE * rad(lon) + TX,
  TY - SCALE * mercY(lat)
];

/** 地図の範囲の外（アメリカ・日本など）かどうか */
export const isOffMapLonLat = (lon: number, lat: number): boolean =>
  lon < MAP_BOUNDS.minLon || lon > MAP_BOUNDS.maxLon || lat < MAP_BOUNDS.minLat || lat > MAP_BOUNDS.maxLat;
