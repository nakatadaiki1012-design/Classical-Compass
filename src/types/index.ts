export type EraId =
  | 'ancient'
  | 'medieval'
  | 'renaissance'
  | 'baroque'
  | 'classical'
  | 'romantic'
  | 'late-romantic'
  | 'impressionism'
  | 'modern';

export interface Era {
  id: EraId;
  name: string;
  nameEn: string;
  startYear: number;
  endYear: number;
  color: string;
  accentColor: string;
  bgLight: string;
  description: string;
  musicalFeatures: string[];
}

export type InstrumentType = 'piano' | 'strings' | 'organ' | 'harpsichord' | 'flute' | 'orchestra' | 'vocal' | 'choral';

export interface NoteEvent {
  note: string; // e.g., 'C4', 'D#4', 'Eb4', 'R' (rest)
  duration: number; // in beats or seconds
}

export interface AudioSnippet {
  type: 'synth' | 'audio';
  src?: string;
  notes: NoteEvent[];
  tempo: number;
  instrument: InstrumentType;
}

export interface Composition {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  genre: 'Symphony' | 'Concerto' | 'Piano' | 'Chamber' | 'Opera' | 'Choral' | 'Solo' | 'Orchestral' | 'Keyboard' | 'Symphonic Poem' | 'Ballet';
  genreJa: string;
  city: string;
  cityCoordinates: [number, number]; // [longitude, latitude]
  description: string;
  audioSnippet: AudioSnippet;
}

export interface CityStay {
  cityName: string;
  cityNameJa: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  startYear: number;
  endYear: number;
  role: string;
  notableEvent: string;
}

export interface Composer {
  id: string;
  name: string; // Japanese name
  originalName: string; // Latin name
  shortName: string; // Short Japanese
  birthYear: number;
  deathYear: number;
  era: EraId;
  country: string;
  nationalityJa: string;
  flag: string;
  portraitUrl: string;
  /** 'japan-trad'= 日本の伝統音楽の人物（「日本音楽史」オプションをオンにしたときだけ表示） */
  category?: 'japan-trad';
  portraitPainter?: string;
  portraitYear?: string;
  portraitAttribution?: string;
  biography: string;
  musicalStyle: string;
  keyFeatures: string[];
  historicalQuote?: string;
  contemporaries: string[];
  cities: CityStay[];
  works: Composition[];
  milestones?: { year: number; event: string; isMajor?: boolean }[];
  birthPlace?: string;
  deathPlace?: string;
  birthEpisode?: string; // どのように生まれたか・生い立ちのエピソード
  deathEpisode?: string; // どのように亡くなったか・最期のエピソード
}

export interface EuropeanCity {
  id: string;
  name: string;
  nameJa: string;
  countryJa: string;
  coordinates: [number, number]; // [longitude, latitude]
  description: string;
}

export type ViewMode = 'timeline' | 'map' | 'catalog' | 'history';
