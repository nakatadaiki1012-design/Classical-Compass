import { RECORDINGS, Recording } from '../data/recordings';

/**
 * ウィキメディア・コモンズにある、著作権の切れた・自由に使える録音を、アプリの中で再生するための道具。
 * どの曲にどの録音を使うかは data/recordings.ts（人の目で確かめて選んだもの）に書いてある。
 */
export type { Recording };

const UPLOAD = 'https://upload.wikimedia.org/wikipedia/commons';

export const getRecording = (workId: string | undefined | null): Recording | undefined =>
  workId ? RECORDINGS[workId] : undefined;

/** コモンズでのファイル名（空白は _ に） */
const fileKey = (r: Recording) => r.path.split('/').pop()!;

/** 説明ページ（演奏者・ライセンスが書いてある） */
export const recordingPageUrl = (r: Recording) => `https://commons.wikimedia.org/wiki/File:${fileKey(r)}`;

/**
 * 再生に使うアドレスの候補（よい順）。
 * Ogg や WAV を再生できないブラウザ（iPhone の Safari など）のために、コモンズが自動で作っている MP3 版も用意する。
 */
export function recordingSources(r: Recording): string[] {
  const original = `${UPLOAD}/${r.path}`;
  const name = fileKey(r);
  const mp3 = /\.mp3$/i.test(name) ? original : `${UPLOAD}/transcoded/${r.path}/${name}.mp3`;
  let canOriginal = true;
  if (typeof document !== 'undefined') {
    const a = document.createElement('audio');
    const ext = name.split('.').pop()!.toLowerCase();
    const type =
      ext === 'ogg' || ext === 'oga' ? 'audio/ogg; codecs="vorbis"'
      : ext === 'opus' ? 'audio/ogg; codecs="opus"'
      : ext === 'flac' ? 'audio/flac'
      : ext === 'wav' ? 'audio/wav'
      : ext === 'webm' ? 'audio/webm'
      : 'audio/mpeg';
    canOriginal = a.canPlayType(type) !== '';
  }
  // WAV・FLAC は大きいので、軽い MP3 版を先に試す
  const preferMp3 = !canOriginal || /\.(wav|flac)$/i.test(name);
  const list = preferMp3 ? [mp3, original] : [original, mp3];
  return list.filter((u, i) => list.indexOf(u) === i); // 元から MP3 のときは1つだけ
}

/** 何分何秒 */
export const formatDuration = (sec: number) => {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};
