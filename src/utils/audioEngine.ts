import { AudioSnippet, InstrumentType, NoteEvent } from '../types';

// Map note name to frequency in Hz
const NOTE_SEMITONES: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11
};

export function noteToFreq(noteStr: string): number {
  if (!noteStr || noteStr === 'R' || noteStr === 'rest') return 0;
  const match = noteStr.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!match) return 440;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const semitone = NOTE_SEMITONES[name] ?? 0;
  // A4 = 440Hz, octave 4, semitone 9 (C4 is 0)
  // Distance from A4:
  const semitonesFromC4 = (octave - 4) * 12 + semitone;
  const semitonesFromA4 = semitonesFromC4 - 9;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

class ClassicalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;
  private currentSnippet: AudioSnippet | null = null;
  private isPlaying = false;
  private playbackStartTime = 0;
  private currentPauseOffset = 0;
  private scheduledTimeouts: number[] = [];
  private activeVoices: { stop: () => void }[] = [];
  private totalDuration = 0;
  private volume = 0.75;
  private onProgressCallback?: (progress: number, currentTime: number, duration: number) => void;
  private onEndCallback?: () => void;
  private animFrameId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setCallbacks(
    onProgress: (progress: number, currentTime: number, duration: number) => void,
    onEnd: () => void
  ) {
    this.onProgressCallback = onProgress;
    this.onEndCallback = onEnd;
  }

  private calculateTotalDuration(notes: NoteEvent[], tempo: number): number {
    const beatSeconds = 60 / tempo;
    return notes.reduce((acc, curr) => acc + curr.duration * beatSeconds, 0);
  }

  public playSnippet(snippet: AudioSnippet, startOffsetSeconds = 0) {
    this.initContext();
    this.stop();

    if (!this.ctx || !this.masterGain) return;

    this.currentSnippet = snippet;
    this.isPlaying = true;
    this.currentPauseOffset = startOffsetSeconds;
    this.totalDuration = this.calculateTotalDuration(snippet.notes, snippet.tempo);
    this.playbackStartTime = this.ctx.currentTime - startOffsetSeconds;

    const beatDuration = 60 / snippet.tempo;
    let accumulatedTime = 0;

    for (let i = 0; i < snippet.notes.length; i++) {
      const event = snippet.notes[i];
      const noteDuration = event.duration * beatDuration;
      const noteStartTime = accumulatedTime;
      accumulatedTime += noteDuration;

      // Skip notes already passed if starting from an offset
      if (noteStartTime + noteDuration <= startOffsetSeconds) {
        continue;
      }

      const delayToStart = Math.max(0, noteStartTime - startOffsetSeconds);
      const remainingDuration = noteStartTime < startOffsetSeconds
        ? (noteStartTime + noteDuration - startOffsetSeconds)
        : noteDuration;

      const timeoutId = window.setTimeout(() => {
        if (!this.isPlaying || !this.ctx || !this.masterGain) return;
        const voice = this.playSynthesizedNote(
          event.note,
          remainingDuration,
          snippet.instrument,
          this.ctx.currentTime
        );
        if (voice) {
          this.activeVoices.push(voice);
        }
      }, delayToStart * 1000);

      this.scheduledTimeouts.push(timeoutId);
    }

    // Schedule playback completion
    const remainingTotalTime = Math.max(0.1, this.totalDuration - startOffsetSeconds);
    const endTimeout = window.setTimeout(() => {
      this.handleSnippetComplete();
    }, remainingTotalTime * 1000);
    this.scheduledTimeouts.push(endTimeout);

    this.startProgressLoop();
  }

  private handleSnippetComplete() {
    this.stopVoices();
    this.isPlaying = false;
    this.currentPauseOffset = 0;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.onProgressCallback) {
      this.onProgressCallback(1, this.totalDuration, this.totalDuration);
    }
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  private startProgressLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const update = () => {
      if (!this.isPlaying || !this.ctx) return;
      const elapsed = this.ctx.currentTime - this.playbackStartTime;
      const progress = Math.min(1, this.totalDuration > 0 ? elapsed / this.totalDuration : 0);

      if (this.onProgressCallback) {
        this.onProgressCallback(progress, Math.min(elapsed, this.totalDuration), this.totalDuration);
      }

      if (elapsed < this.totalDuration && this.isPlaying) {
        this.animFrameId = requestAnimationFrame(update);
      }
    };
    this.animFrameId = requestAnimationFrame(update);
  }

  public pause() {
    if (!this.isPlaying || !this.ctx) return;
    this.currentPauseOffset = this.ctx.currentTime - this.playbackStartTime;
    this.isPlaying = false;
    this.clearScheduledEvents();
    this.stopVoices();
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }

  public resume() {
    if (this.isPlaying || !this.currentSnippet) return;
    this.playSnippet(this.currentSnippet, this.currentPauseOffset);
  }

  public seek(targetSeconds: number) {
    if (!this.currentSnippet) return;
    const clamped = Math.max(0, Math.min(targetSeconds, this.totalDuration));
    if (this.isPlaying) {
      this.playSnippet(this.currentSnippet, clamped);
    } else {
      this.currentPauseOffset = clamped;
      if (this.onProgressCallback) {
        const progress = this.totalDuration > 0 ? clamped / this.totalDuration : 0;
        this.onProgressCallback(progress, clamped, this.totalDuration);
      }
    }
  }

  public stop() {
    this.isPlaying = false;
    this.clearScheduledEvents();
    this.stopVoices();
    this.currentPauseOffset = 0;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
  }

  private clearScheduledEvents() {
    this.scheduledTimeouts.forEach(id => clearTimeout(id));
    this.scheduledTimeouts = [];
  }

  private stopVoices() {
    this.activeVoices.forEach(v => v.stop());
    this.activeVoices = [];
  }

  // Synthesize rich classical instrument voices using Web Audio API
  private playSynthesizedNote(
    note: string,
    duration: number,
    instrument: InstrumentType,
    startTime: number
  ): { stop: () => void } | null {
    if (!this.ctx || !this.masterGain) return null;
    const freq = noteToFreq(note);
    if (freq <= 0) return null; // Rest

    const voiceGain = this.ctx.createGain();
    voiceGain.connect(this.masterGain);

    const oscillators: OscillatorNode[] = [];

    if (instrument === 'piano') {
      // Warm acoustic piano model: fundamental + gentle overtone partials + resonance decay
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, startTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, startTime);

      // Lowpass filter for warm hammer attack
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min( freq * 5, 4500), startTime);
      filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 1.5, 1200), startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(voiceGain);

      // Attack & Exponential piano decay
      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.42, startTime + 0.012);
      voiceGain.gain.exponentialRampToValueAtTime(0.24, startTime + 0.08);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.25);

      osc1.start(startTime);
      osc2.start(startTime);
      osc3.start(startTime);

      const stopTime = startTime + duration * 1.25;
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      osc3.stop(stopTime);

      oscillators.push(osc1, osc2, osc3);
    } else if (instrument === 'strings') {
      // Rich bowed strings ensemble with dual detuned sawtooth + triangle and gentle vibrato
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, startTime);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.002, startTime); // detune

      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(freq * 0.998, startTime);

      // Vibrato LFO
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.4, startTime);
      lfoGain.gain.setValueAtTime(freq * 0.012, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + duration + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(freq * 4, 3200), startTime);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(voiceGain);

      // Bowed string attack & release
      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.08);
      voiceGain.gain.setValueAtTime(0.26, startTime + duration - 0.05);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.35);

      osc1.start(startTime);
      osc2.start(startTime);
      osc3.start(startTime);

      const stopTime = startTime + duration + 0.35;
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      osc3.stop(stopTime);
      oscillators.push(osc1, osc2, osc3, lfo);
    } else if (instrument === 'organ') {
      // Cathedral pipe organ additive synthesis
      const osc1 = this.ctx.createOscillator(); // 8'
      const osc2 = this.ctx.createOscillator(); // 4'
      const osc3 = this.ctx.createOscillator(); // 2'

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(freq * 3, startTime);

      const mix1 = this.ctx.createGain();
      mix1.gain.value = 0.3;
      const mix2 = this.ctx.createGain();
      mix2.gain.value = 0.18;
      const mix3 = this.ctx.createGain();
      mix3.gain.value = 0.09;

      osc1.connect(mix1);
      osc2.connect(mix2);
      osc3.connect(mix3);
      mix1.connect(voiceGain);
      mix2.connect(voiceGain);
      mix3.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.04);
      voiceGain.gain.setValueAtTime(0.32, startTime + duration - 0.04);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.25);

      const stopTime = startTime + duration + 0.25;
      osc1.start(startTime);
      osc2.start(startTime);
      osc3.start(startTime);
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      osc3.stop(stopTime);
      oscillators.push(osc1, osc2, osc3);
    } else if (instrument === 'harpsichord') {
      // Plucked harpsichord with crisp odd harmonics
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(Math.min(freq * 3, 5000), startTime);
      filter.Q.value = 1.2;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.006);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.95);

      const stopTime = startTime + duration * 0.95;
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      oscillators.push(osc1, osc2);
    } else {
      // Default / Flute
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.connect(voiceGain);

      voiceGain.gain.setValueAtTime(0.0001, startTime);
      voiceGain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.04);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + 0.1);

      const stopTime = startTime + duration + 0.1;
      osc.start(startTime);
      osc.stop(stopTime);
      oscillators.push(osc);
    }

    return {
      stop: () => {
        try {
          voiceGain.gain.setValueAtTime(voiceGain.gain.value, this.ctx!.currentTime);
          voiceGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 0.03);
          setTimeout(() => {
            oscillators.forEach(o => {
              try {
                o.stop();
                o.disconnect();
              } catch {
                // ignore already stopped
              }
            });
            voiceGain.disconnect();
          }, 40);
        } catch {
          // ignore
        }
      }
    };
  }
}

export const classicalAudioEngine = new ClassicalAudioEngine();
