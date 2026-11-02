import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Composition, Composer } from '../types';
import { classicalAudioEngine } from '../utils/audioEngine';
import { getRecording, recordingSources } from '../utils/recordings';

export interface ActiveTrack {
  work: Composition;
  composer: Composer;
}

interface AudioContextValue {
  currentTrack: ActiveTrack | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  analyserNode: AnalyserNode | null;
  playTrack: (work: Composition, composer: Composer) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  seekTrack: (progressPct: number) => void;
  setTrackVolume: (val: number) => void;
  toggleMute: () => void;
  playNextTrack?: () => void;
  playPrevTrack?: () => void;
  /** 録音を読み込み中 */
  isLoading: boolean;
  /** 再生できなかったときの説明 */
  error: string | null;
  /** プレーヤーを閉じる（再生も止める） */
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<ActiveTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolume = useRef(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 本物の録音を流す <audio>（ウィキメディア・コモンズの録音）
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // いま <audio> で流しているか（false ならコンピューターのメロディ）
  const usingRecording = useRef(false);
  const sourcesRef = useRef<string[]>([]);

  const getAudio = () => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio();
    a.preload = 'none';
    a.addEventListener('timeupdate', () => {
      const d = a.duration;
      setCurrentTime(a.currentTime);
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
        setProgress(a.currentTime / d);
      }
    });
    a.addEventListener('loadedmetadata', () => Number.isFinite(a.duration) && setDuration(a.duration));
    a.addEventListener('waiting', () => setIsLoading(true));
    a.addEventListener('playing', () => {
      setIsLoading(false);
      setIsPlaying(true);
    });
    a.addEventListener('pause', () => setIsPlaying(false));
    a.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(1);
    });
    a.addEventListener('error', () => {
      // 次の候補（MP3 版など）があれば試す
      const next = sourcesRef.current.shift();
      if (next) {
        a.src = next;
        a.play().catch(() => {});
        return;
      }
      setIsLoading(false);
      setIsPlaying(false);
      setError('録音を読み込めませんでした。通信の状態を確かめて、もう一度お試しください。');
    });
    audioRef.current = a;
    return a;
  };

  useEffect(() => {
    classicalAudioEngine.setCallbacks(
      (prog, curr, dur) => {
        setProgress(prog);
        setCurrentTime(curr);
        setDuration(dur);
      },
      () => {
        setIsPlaying(false);
      }
    );
  }, []);

  const pauseTrack = useCallback(() => {
    if (usingRecording.current) audioRef.current?.pause();
    else classicalAudioEngine.pause();
    setIsPlaying(false);
  }, []);

  const resumeTrack = useCallback(() => {
    if (!currentTrack) return;
    if (usingRecording.current) {
      const a = getAudio();
      if (a.ended) a.currentTime = 0;
      setError(null);
      a.play().catch(() => setIsLoading(false));
    } else {
      classicalAudioEngine.resume();
    }
    setIsPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  const playTrack = useCallback(
    (work: Composition, composer: Composer) => {
      // 同じ曲のボタンをもう一度押したら、一時停止・再開
      if (currentTrack?.work.id === work.id) {
        if (isPlaying) pauseTrack();
        else resumeTrack();
        return;
      }
      setCurrentTrack({ work, composer });
      setProgress(0);
      setCurrentTime(0);
      setError(null);
      const rec = getRecording(work.id);
      if (rec) {
        classicalAudioEngine.stop();
        usingRecording.current = true;
        const a = getAudio();
        const [first, ...rest] = recordingSources(rec);
        sourcesRef.current = rest;
        setDuration(rec.dur);
        setIsLoading(true);
        setIsPlaying(true);
        a.src = first;
        a.volume = isMuted ? 0 : volume;
        // ボタンを押した流れの中で再生を始める（スマホでは、そうしないと音が出ない）
        a.play().catch(() => {
          /* 読み込みの失敗は error イベントで扱う */
        });
      } else {
        audioRef.current?.pause();
        usingRecording.current = false;
        setIsPlaying(true);
        classicalAudioEngine.playSnippet(work.audioSnippet);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrack, isPlaying, pauseTrack, resumeTrack, volume, isMuted]
  );

  const closePlayer = useCallback(() => {
    audioRef.current?.pause();
    classicalAudioEngine.stop();
    setIsPlaying(false);
    setIsLoading(false);
    setError(null);
    setCurrentTrack(null);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const seekTrack = useCallback((progressPct: number) => {
    if (duration > 0) {
      const targetSeconds = progressPct * duration;
      if (usingRecording.current) {
        if (audioRef.current) audioRef.current.currentTime = targetSeconds;
      } else {
        classicalAudioEngine.seek(targetSeconds);
      }
      setProgress(progressPct);
      setCurrentTime(targetSeconds);
    }
  }, [duration]);

  const setTrackVolume = useCallback((val: number) => {
    setVolumeState(val);
    if (val > 0) {
      setIsMuted(false);
      previousVolume.current = val;
    }
    classicalAudioEngine.setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      const restoreVol = previousVolume.current || 0.8;
      setIsMuted(false);
      setVolumeState(restoreVol);
      classicalAudioEngine.setVolume(restoreVol);
      if (audioRef.current) audioRef.current.volume = restoreVol;
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
      setVolumeState(0);
      classicalAudioEngine.setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  }, [isMuted, volume]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        isMuted,
        analyserNode: usingRecording.current ? null : classicalAudioEngine.analyser,
        isLoading,
        error,
        closePlayer,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        seekTrack,
        setTrackVolume,
        toggleMute
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
};
