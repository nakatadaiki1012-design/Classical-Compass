/** 年の表記（紀元前は「紀元前570年」のように書く） */
export const yearText = (y: number): string => (y < 0 ? `紀元前${-y}年` : `${y}年`);

/** 目盛り用の短い表記（紀元前は「前570」） */
export const yearTick = (y: number): string => (y < 0 ? `前${-y}` : `${y}`);
