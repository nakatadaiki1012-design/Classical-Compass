import { Composition } from '../types';
import { getRecording } from './recordings';

/**
 * 試聴できる曲かどうか。ウィキメディア・コモンズの録音（data/recordings.ts）がある曲だけ。
 * （以前のコンピューターで鳴らす短いメロディは、本物の録音に置き換えたので使わない）
 */
export const hasAudio = (work: Composition | undefined | null): boolean => !!work && !!getRecording(work.id);
