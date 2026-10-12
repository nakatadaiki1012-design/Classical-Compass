import { Composition } from '../types';

/** 試聴できる（楽譜データのある）曲かどうか。ないものは再生ボタンを出さない */
export const hasAudio = (work: Composition | undefined | null): boolean =>
  !!work && work.audioSnippet.notes.length > 0;
