import React, { useEffect, useRef, useState } from 'react';
import { hasAudio } from '../utils/hasAudio';
import { useAudio } from '../context/AudioContext';
import { ComposerPortrait } from './ComposerPortrait';
import { COMPOSERS } from '../data/composers';
import { Play, Pause, Volume2, VolumeX, ListMusic, ChevronDown, X, Loader2 } from 'lucide-react';
import { formatDuration, getRecording, recordingPageUrl } from '../utils/recordings';

/** プレーヤーの高さ（px）。画面の下にこの分の余白を空ける（CSS 変数 --player-h） */
const PLAYER_H = 64;

/**
 * 画面の下に出る再生プレーヤー。曲を再生したときだけ表示する。
 * 録音はウィキメディア・コモンズのもの。演奏者とライセンスを必ず表示する。
 */
export const AudioPlayerBar: React.FC<{ onOpenComposer: (composerId: string) => void }> = ({ onOpenComposer }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    error,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seekTrack,
    setTrackVolume,
    toggleMute,
    playTrack,
    closePlayer
  } = useAudio();

  const [showPlaylist, setShowPlaylist] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // プレーヤーが出ている間は、画面の下にその分の余白を空ける（年表などが隠れないように）
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--player-h', currentTrack ? `${PLAYER_H}px` : '0px');
    return () => {
      root.style.setProperty('--player-h', '0px');
    };
  }, [currentTrack]);

  if (!currentTrack) return null;

  const { work, composer } = currentTrack;
  const rec = getRecording(work.id);
  const playable = COMPOSERS.flatMap(c => c.works.filter(hasAudio).map(w => ({ c, w })));

  const seekAt = (clientX: number) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    seekTrack(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  };

  return (
    <>
      {/* 聴ける曲の一覧 */}
      {showPlaylist && (
        <div
          className="fixed right-2 sm:right-4 z-[80] w-[min(22rem,calc(100vw-1rem))] max-h-[min(26rem,60vh)] bg-[#1a1714] border border-[#3d362e] rounded-lg shadow-2xl overflow-hidden flex flex-col"
          style={{ bottom: PLAYER_H + 8 }}
        >
          <div className="px-4 py-2.5 bg-[#241f19] border-b border-[#3d362e] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#f5ebd9] flex items-center gap-2">
              <ListMusic className="w-3.5 h-3.5 text-[#c99738]" />
              聴ける名曲（{playable.length}曲）
            </span>
            <button onClick={() => setShowPlaylist(false)} className="text-[#b5aa9b] hover:text-[#f5ebd9] p-1" aria-label="一覧を閉じる">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#2a241c]">
            {playable.map(({ c, w }) => {
              const isCurrent = work.id === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => {
                    playTrack(w, c);
                    setShowPlaylist(false);
                  }}
                  className={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors ${
                    isCurrent ? 'bg-[#2b241c] text-[#f5ebd9]' : 'hover:bg-[#221d18] text-[#b5aa9b] hover:text-[#e8dec8]'
                  }`}
                >
                  <ComposerPortrait composer={c} size="sm" showOrnateBorder={false} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate text-[#f5ebd9]">{w.title}</p>
                    <p className="text-[11px] text-[#b5aa9b] truncate">
                      {c.shortName} · {formatDuration(getRecording(w.id)!.dur)}
                    </p>
                  </div>
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-[#c99738] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <aside
        aria-label="再生プレーヤー"
        className="fixed bottom-0 left-0 right-0 z-[80] bg-[#161412]/97 backdrop-blur-md border-t border-[#2e2924] px-2 sm:px-4 md:px-8 shadow-2xl"
        style={{ height: PLAYER_H }}
      >
        {/* 再生位置（タップ・クリックで移動） */}
        <div
          ref={progressBarRef}
          onClick={e => seekAt(e.clientX)}
          className="absolute -top-1.5 left-0 right-0 h-3 cursor-pointer group"
          role="slider"
          aria-label="再生位置"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
        >
          <div className="mt-1 w-full h-1 bg-[#2e2924] group-hover:h-1.5 transition-all">
            <div className="h-full bg-gradient-to-r from-[#c99738] to-[#e6b95c]" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        <div className="h-full max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          {/* 再生・一時停止 */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 shrink-0 rounded-full bg-[#c99738] hover:bg-[#dba844] text-[#161412] flex items-center justify-center shadow-md active:scale-95"
            aria-label={isPlaying ? '一時停止' : '再生'}
            title={isPlaying ? '一時停止' : '再生'}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          {/* 曲名・作曲者・演奏者とライセンス */}
          <button onClick={() => onOpenComposer(composer.id)} className="hidden sm:block shrink-0" title="作曲家の紹介を見る">
            <ComposerPortrait composer={composer} size="sm" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[#f5ebd9] truncate leading-tight">
              {work.title}
              {rec?.note && !work.title.includes(rec.note) && <span className="ml-1.5 text-[11px] font-normal text-[#b5aa9b]">（{rec.note}）</span>}
            </p>
            {error ? (
              <p className="text-[11px] text-[#f0a0a0] truncate">{error}</p>
            ) : (
              <p className="text-[11px] text-[#b5aa9b] truncate leading-tight mt-0.5">
                <button onClick={() => onOpenComposer(composer.id)} className="hover:text-[#c99738] hover:underline">
                  {composer.shortName}
                </button>
                <span className="mx-1">·</span>
                <span className="font-mono tabular-nums">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
                {rec && (
                  <>
                    <span className="mx-1">·</span>
                    <a
                      href={recordingPageUrl(rec)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#c99738] hover:underline"
                      title="ウィキメディア・コモンズの録音のページ（演奏者・ライセンス）"
                    >
                      {rec.performer ? `演奏: ${rec.performer} · ` : ''}
                      Wikimedia Commons（{rec.license}）
                    </a>
                  </>
                )}
              </p>
            )}
          </div>

          {/* 音量（広い画面だけ） */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={toggleMute}
              className="text-[#b5aa9b] hover:text-[#f5ebd9]"
              aria-label={isMuted ? 'ミュート解除' : 'ミュート'}
              title={isMuted ? 'ミュート解除' : 'ミュート'}
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={e => setTrackVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#2e2924] accent-[#c99738] rounded-lg cursor-pointer"
              aria-label="音量"
            />
          </div>

          {/* 聴ける曲の一覧 */}
          <button
            onClick={() => setShowPlaylist(v => !v)}
            className={`shrink-0 h-9 px-2 rounded border flex items-center gap-1.5 text-xs ${
              showPlaylist
                ? 'bg-[#2b241c] border-[#c99738] text-[#c99738]'
                : 'bg-[#1e1b18] border-[#383129] text-[#b5aa9b] hover:text-[#f5ebd9]'
            }`}
            aria-label="聴ける名曲の一覧"
            title="聴ける名曲の一覧"
          >
            <ListMusic className="w-4 h-4" />
            <span className="hidden md:inline">名曲リスト</span>
          </button>

          {/* 閉じる */}
          <button
            onClick={() => {
              setShowPlaylist(false);
              closePlayer();
            }}
            className="shrink-0 w-9 h-9 rounded flex items-center justify-center text-[#b5aa9b] hover:text-[#f5ebd9] hover:bg-[#2b241c]"
            aria-label="プレーヤーを閉じる"
            title="プレーヤーを閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
