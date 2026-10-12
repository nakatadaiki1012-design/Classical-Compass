import React, { useRef, useEffect, useState } from 'react';
import { hasAudio } from '../utils/hasAudio';
import { useAudio } from '../context/AudioContext';
import { ComposerPortrait } from './ComposerPortrait';
import { COMPOSERS } from '../data/composers';
import { Play, Pause, Volume2, VolumeX, ListMusic, ChevronDown, Sparkles } from 'lucide-react';
import { getEraById } from '../data/eras';

export const AudioPlayerBar: React.FC<{ onOpenComposer: (composerId: string) => void }> = ({
  onOpenComposer
}) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    analyserNode,
    togglePlay,
    seekTrack,
    setTrackVolume,
    toggleMute,
    playTrack
  } = useAudio();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Format seconds to mm:ss
  const formatTime = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render real-time visualizer waveform using AnalyserNode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animId = requestAnimationFrame(render);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 20;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = 3;
      const gap = 2;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        const normalized = val / 255;
        const barHeight = Math.max(3, normalized * (canvas.height - 4));
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        ctx.fillStyle = isPlaying ? '#c99738' : '#574e44';
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [analyserNode, isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    seekTrack(pct);
  };

  if (!currentTrack) {
    // Docked resting bar prompting to pick a masterpiece
    return (
      <aside aria-label="再生プレーヤー" className="fixed bottom-0 left-0 right-0 z-30 bg-[#161412]/95 backdrop-blur-md border-t border-[#2e2924] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#b5aa9b]">
            <Sparkles className="w-4 h-4 text-[#c99738]" />
            <span>年表や地図上の作曲家・作品をクリックすると、代表曲の試聴が始まります</span>
          </div>
          <button
            onClick={() => {
              const firstComp = COMPOSERS.find(c => c.works.some(hasAudio));
              const firstWork = firstComp?.works.find(hasAudio);
              if (firstComp && firstWork) {
                playTrack(firstWork, firstComp);
              }
            }}
            className="flex items-center gap-2 px-3 py-1 rounded bg-[#2b241c] hover:bg-[#382f23] border border-[#c99738]/40 text-[#f5ebd9] text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current text-[#c99738]" />
            <span>ヴィヴァルディ『四季：春』を再生</span>
          </button>
        </div>
      </aside>
    );
  }

  const { work, composer } = currentTrack;
  const era = getEraById(composer.era);

  return (
    <>
      {/* Playlist Drawer */}
      {showPlaylist && (
        <div className="fixed bottom-16 right-4 md:right-8 z-30 w-80 max-h-96 bg-[#1a1714] border border-[#3d362e] rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-4 py-2.5 bg-[#241f19] border-b border-[#3d362e] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#f5ebd9] flex items-center gap-2">
              <ListMusic className="w-3.5 h-3.5 text-[#c99738]" />
              収録名曲リスト（全{COMPOSERS.flatMap(c => c.works).length}曲）
            </span>
            <button
              onClick={() => setShowPlaylist(false)}
              className="text-[#b5aa9b] hover:text-[#f5ebd9] p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#2a241c]">
            {COMPOSERS.map(c =>
              c.works.filter(hasAudio).map(w => {
                const isCurrent = currentTrack.work.id === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      playTrack(w, c);
                      setShowPlaylist(false);
                    }}
                    className={`w-full text-left p-2 rounded flex items-center gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-[#2b241c] text-[#f5ebd9]'
                        : 'hover:bg-[#221d18] text-[#b5aa9b] hover:text-[#e8dec8]'
                    }`}
                  >
                    <ComposerPortrait composer={c} size="sm" showOrnateBorder={false} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate text-[#f5ebd9]">{w.title}</p>
                      <p className="text-[11px] text-[#b5aa9b] truncate">
                        {c.shortName} · {w.year}年
                      </p>
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-[#c99738] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Persistent Bottom Audio Player Bar */}
      <aside aria-label="再生プレーヤー" className="fixed bottom-0 left-0 right-0 z-30 bg-[#161412]/95 backdrop-blur-md border-t border-[#2e2924] px-4 md:px-8 py-2.5 shadow-2xl">
        {/* Scrubbable progress bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="absolute -top-1 left-0 right-0 h-2 cursor-pointer group"
        >
          <div className="w-full h-1 bg-[#2e2924] group-hover:h-2 transition-all">
            <div
              className="h-full bg-gradient-to-r from-[#c99738] to-[#e6b95c] relative"
              style={{ width: `${progress * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#fff] opacity-0 group-hover:opacity-100 transition-opacity shadow" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Composer & Track info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial md:w-80">
            <button
              onClick={() => onOpenComposer(composer.id)}
              className="group shrink-0"
              title="作曲家の詳細を見る"
            >
              <ComposerPortrait composer={composer} size="sm" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs md:text-sm font-semibold text-[#f5ebd9] truncate">
                  {work.title}
                </p>
              </div>
              <p className="text-[11px] text-[#b5aa9b] truncate flex items-center gap-1.5">
                <button
                  onClick={() => onOpenComposer(composer.id)}
                  className="hover:text-[#c99738] underline-offset-2 hover:underline transition-colors"
                >
                  {composer.name}
                </button>
                <span>·</span>
                <span style={{ color: era.accentColor }}>{era.name}</span>
                <span>·</span>
                <span>{work.year}年 ({work.city})</span>
              </p>
            </div>
          </div>

          {/* Center: Play Controls & Visualizer */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-mono tabular-nums text-[#b5aa9b] hidden md:inline">
                {formatTime(currentTime)}
              </span>

              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#c99738] hover:bg-[#dba844] text-[#161412] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-md"
                title={isPlaying ? '一時停止' : '再生'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}
              </button>

              <span className="text-[11px] font-mono tabular-nums text-[#b5aa9b] hidden md:inline">
                {formatTime(duration)}
              </span>
            </div>

            {/* Micro Audio Spectrum Visualizer */}
            <canvas
              ref={canvasRef}
              width={100}
              height={14}
              className="hidden sm:block opacity-80"
            />
          </div>

          {/* Right: Volume & Playlist button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Volume control */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-[#b5aa9b] hover:text-[#f5ebd9] transition-colors"
                title={isMuted ? 'ミュート解除' : 'ミュート'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={isMuted ? 0 : volume}
                onChange={e => setTrackVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#2e2924] accent-[#c99738] rounded-lg cursor-pointer"
              />
            </div>

            {/* Playlist drawer toggle */}
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-2 rounded border transition-colors flex items-center gap-1.5 text-xs ${
                showPlaylist
                  ? 'bg-[#2b241c] border-[#c99738] text-[#c99738]'
                  : 'bg-[#1e1b18] border-[#383129] text-[#b5aa9b] hover:text-[#f5ebd9]'
              }`}
              title="楽曲一覧"
            >
              <ListMusic className="w-4 h-4" />
              <span className="hidden md:inline">名曲リスト</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
