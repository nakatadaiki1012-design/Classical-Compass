import { Composition } from '../types';

/**
 * 試聴できる曲かどうか。いまは試聴機能を一時的に止めているので、常に false。
 * 再開するときは下の ENABLED を true にする（楽譜データのない曲は引き続き除外）。
 */
const ENABLED = false;

export const hasAudio = (work: Composition | undefined | null): boolean =>
  ENABLED && !!work && work.audioSnippet.notes.length > 0;
