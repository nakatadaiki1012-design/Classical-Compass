import { PLACES, Place } from './places';
import { ITINERARY_RAW } from './itineraryData';
import { Composer } from '../types';

/** 地図に出す範囲（これを外れる場所は「地図の外」の枠に出す） */
export const MAP_BOUNDS = { minLon: -11, maxLon: 42, minLat: 35, maxLat: 65 };

export const isOffMap = (place: { lon: number; lat: number }): boolean =>
  place.lon < MAP_BOUNDS.minLon ||
  place.lon > MAP_BOUNDS.maxLon ||
  place.lat < MAP_BOUNDS.minLat ||
  place.lat > MAP_BOUNDS.maxLat;

/** ある年の居場所 */
export interface Whereabouts {
  placeId: string;
  place: Place;
  note: string;
  startYear: number;
  endYear: number;
  /** 長期の旅行・遠征・留学など */
  isTrip: boolean;
  /** その年の記録がなく、近い年の滞在先を表示している */
  isEstimated: boolean;
  /** 推定のとき、元にした年 */
  basedOnYear?: number;
  /** その年に新しく移動してきた（前の滞在先から） */
  movedFrom?: Place;
}

interface Stay {
  start: number;
  end: number;
  placeId: string;
  note: string;
  isTrip: boolean;
}

const STAYS: Record<string, Stay[]> = {};
Object.entries(ITINERARY_RAW).forEach(([id, list]) => {
  STAYS[id] = list
    .map(([start, end, placeId, note, trip]) => ({ start, end, placeId, note, isTrip: trip === 'trip' }))
    .filter(s => PLACES[s.placeId])
    .sort((a, b) => a.start - b.start);
});

/** 既存の都市データ（cities）から作った予備の滞在記録 */
const fallbackStays = (composer: Composer): Stay[] =>
  composer.cities.map(c => ({
    start: c.startYear,
    end: c.endYear,
    placeId: `__${composer.id}_${c.cityName}`,
    note: c.notableEvent || c.role,
    isTrip: false
  }));

const fallbackPlace = (composer: Composer, placeId: string): Place | undefined => {
  const c = composer.cities.find(x => `__${composer.id}_${x.cityName}` === placeId);
  return c ? { ja: c.cityNameJa, lon: c.coordinates[0], lat: c.coordinates[1], country: c.country } : undefined;
};

/** その年に作曲家がどこにいたか。記録がない年は、近い年の滞在先を推定として返す */
export function getWhereabouts(composer: Composer, year: number): Whereabouts | null {
  const hasData = !!STAYS[composer.id]?.length;
  const stays = hasData ? STAYS[composer.id] : fallbackStays(composer);
  if (stays.length === 0) return null;

  const resolve = (stay: Stay): Place | undefined =>
    hasData ? PLACES[stay.placeId] : fallbackPlace(composer, stay.placeId);

  // その年を含む滞在（あとから始まったものを優先）
  const covering = stays.filter(s => s.start <= year && year <= s.end).sort((a, b) => b.start - a.start)[0];
  let chosen = covering;
  let isEstimated = false;
  let basedOnYear: number | undefined;

  if (!chosen) {
    // いちばん近い年の滞在先
    let best = stays[0];
    let bestDist = Infinity;
    stays.forEach(s => {
      const dist = year < s.start ? s.start - year : year - s.end;
      if (dist < bestDist) {
        bestDist = dist;
        best = s;
      }
    });
    chosen = best;
    isEstimated = true;
    basedOnYear = year < chosen.start ? chosen.start : chosen.end;
  }

  const place = resolve(chosen);
  if (!place) return null;

  // 直前の滞在先（この年に移動してきたかどうか）
  let movedFrom: Place | undefined;
  if (!isEstimated && chosen.start === year) {
    const prev = stays
      .filter(s => s.end < year || (s.start < chosen.start && s !== chosen))
      .sort((a, b) => b.end - a.end)[0];
    const prevPlace = prev ? resolve(prev) : undefined;
    if (prevPlace && prevPlace.ja !== place.ja) movedFrom = prevPlace;
  }

  return {
    placeId: chosen.placeId,
    place,
    note: chosen.note,
    startYear: chosen.start,
    endYear: chosen.end,
    isTrip: chosen.isTrip,
    isEstimated,
    basedOnYear,
    movedFrom
  };
}
