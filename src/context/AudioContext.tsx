import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Composition, Composer } from '../types';
import { classicalAudioEngine } from '../utils/audioEngine';

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

  const playTrack = useCallback((work: Composition, composer: Composer) => {
    setCurrentTrack({ work, composer });
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    classicalAudioEngine.playSnippet(work.audioSnippet);
  }, []);

  const pauseTrack = useCallback(() => {
    classicalAudioEngine.pause();
    setIsPlaying(false);
  }, []);

  const resumeTrack = useCallback(() => {
    if (currentTrack) {
      classicalAudioEngine.resume();
      setIsPlaying(true);
    }
  }, [currentTrack]);

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
      classicalAudioEngine.seek(targetSeconds);
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
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      const restoreVol = previousVolume.current || 0.8;
      setIsMuted(false);
      setVolumeState(restoreVol);
      classicalAudioEngine.setVolume(restoreVol);
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
      setVolumeState(0);
      classicalAudioEngine.setVolume(0);
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
        analyserNode: classicalAudioEngine.analyser,
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
