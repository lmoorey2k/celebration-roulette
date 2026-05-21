import { Platform } from 'react-native';

let _ctx: AudioContext | null = null;
let _resumePromise: Promise<void> | null = null;
let _unlocked = false;

// ─── MediaStream audio routing ──────────────────────────────────────────────
// iOS Safari can report AudioContext as 'running' while its hardware output
// (ctx.destination) is silently disconnected. This is a known WebKit quirk
// that occurs after repeated use, interruptions, or tab switches.
//
// Fix: route ALL oscillator output through a MediaStreamDestination node,
// pipe that stream into an <audio> element, and play through the HTML audio
// path — which we've confirmed works reliably on the affected device.
// Every connect() call in the sound functions targets audioOut() instead of
// c.destination.
let _streamDest: MediaStreamAudioDestinationNode | null = null;
let _streamEl: HTMLAudioElement | null = null;
let _streamStopTimer: ReturnType<typeof setTimeout> | null = null;

// How long after the last sound before we pause the stream element.
// Must be longer than the longest sound effect (~1s for celebration/sadTrombone).
const STREAM_IDLE_MS = 2000;

function ensureStream(c: AudioContext): MediaStreamAudioDestinationNode | null {
  if (!_streamDest) {
    try {
      _streamDest = c.createMediaStreamDestination();
      _streamEl = new Audio();
      _streamEl.srcObject = _streamDest.stream;
    } catch {
      return null;
    }
  }
  return _streamDest;
}

// Kick the stream element to play, and schedule an auto-pause so we don't
// leave an open stream humming through the speaker when nothing is playing.
function kickStream(): void {
  if (!_streamEl) return;
  if (_streamEl.paused) {
    _streamEl.play().catch(() => {});
  }
  // Reset the auto-pause timer every time a sound fires
  if (_streamStopTimer) clearTimeout(_streamStopTimer);
  _streamStopTimer = setTimeout(() => {
    if (_streamEl && !_streamEl.paused) {
      _streamEl.pause();
    }
    _streamStopTimer = null;
  }, STREAM_IDLE_MS);
}

function audioOut(c: AudioContext): AudioNode {
  if (Platform.OS !== 'web') return c.destination;
  const dest = ensureStream(c);
  if (!dest) return c.destination;
  kickStream();
  return dest;
}

// ─── Sunday detection ────────────────────────────────────────────────────────
export function isSunday(): boolean {
  return new Date().getDay() === 0;
}

// ─── AudioContext state helper ──────────────────────────────────────────────
function needsResume(c: AudioContext): boolean {
  return c.state !== 'running';
}

function ctx(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    try {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (Ctor) {
        _ctx = new Ctor();
        _ctx.addEventListener('statechange', () => {
          if (_ctx && _ctx.state !== 'running') {
            _unlocked = false;
            // Reset the stream output so it gets re-created fresh
            _streamDest = null;
            _streamEl = null;
          }
        });
      }
    } catch { return null; }
  }
  return _ctx;
}

export function resumeAudio(): Promise<void> {
  const c = ctx();
  if (!c) return Promise.resolve();
  if (!needsResume(c)) return Promise.resolve();

  if (!_resumePromise) {
    _resumePromise = c.resume()
      .catch(() => {})
      .finally(() => {
        _resumePromise = null;
      });
  }
  return _resumePromise;
}

function unlockAudio(c: AudioContext): void {
  if (_unlocked) return;
  try {
    const buf = c.createBuffer(1, 1, 22050);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
    _unlocked = true;
  } catch {
    // Swallow — we'll retry on the next gesture.
  }
}

// ─── iOS touch unlock ─────────────────────────────────────────────────────────
function buildSilentWavUrl(): string {
  const numSamples = 1;
  const sampleRate = 8000;
  const dataSize = numSamples * 2;
  const buf = new ArrayBuffer(44 + dataSize);
  const v = new DataView(buf);
  const s = (o: number, str: string) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  s(0, 'RIFF'); v.setUint32(4, 36 + dataSize, true);
  s(8, 'WAVE'); s(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  s(36, 'data'); v.setUint32(40, dataSize, true);
  v.setInt16(44, 0, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

let _silentWavUrl: string | null = null;

function setupIOSTouchUnlock(): void {
  if (typeof document === 'undefined') return;

  const unlock = () => {
    const c = ctx();
    if (!c) return;

    if (c.state === 'running' && _unlocked) return;

    c.resume().catch(() => {});
    unlockAudio(c);

    // Ensure the stream destination exists (but don't kick playback —
    // kickStream() will be called by audioOut() when an actual sound plays)
    ensureStream(c);

    try {
      if (!_silentWavUrl) _silentWavUrl = buildSilentWavUrl();
      const el = new Audio(_silentWavUrl);
      el.volume = 0.001;
      el.play().catch(() => {});
    } catch { /* non-fatal */ }
  };

  document.addEventListener('touchstart', unlock, true);
  document.addEventListener('touchend', unlock, true);
  // Also handle mouse clicks for desktop
  document.addEventListener('mousedown', unlock, true);
}

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  setupIOSTouchUnlock();
}

function playWhenReady(play: (c: AudioContext) => void): void {
  const c = ctx();
  if (!c) return;

  if (needsResume(c)) {
    c.resume().catch(() => {});
  }
  unlockAudio(c);
  play(c);
}

function masterGain(c: AudioContext, volume: number): GainNode {
  const g = c.createGain();
  g.gain.value = volume;
  g.connect(audioOut(c));
  return g;
}

// ─── Sound effects ──────────────────────────────────────────────────────────
// All sounds connect to audioOut(c) instead of c.destination. On web, this
// routes through a MediaStreamDestination → <audio> element pipeline, which
// bypasses the iOS Safari bug where ctx.destination silently disconnects.

export function playLeverPull(): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const out = masterGain(c, 0.75);

    const scrape = c.createOscillator();
    const scrapeGain = c.createGain();
    scrape.type = 'sawtooth';
    scrape.frequency.setValueAtTime(180, now);
    scrape.frequency.exponentialRampToValueAtTime(70, now + 0.18);
    scrapeGain.gain.setValueAtTime(0.2, now);
    scrapeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    scrape.connect(scrapeGain);
    scrapeGain.connect(out);
    scrape.start(now);
    scrape.stop(now + 0.22);

    const click = c.createOscillator();
    const clickGain = c.createGain();
    click.type = 'square';
    click.frequency.value = 900;
    clickGain.gain.setValueAtTime(0.22, now + 0.02);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    click.connect(clickGain);
    clickGain.connect(out);
    click.start(now + 0.02);
    click.stop(now + 0.06);

    setTimeout(() => out.disconnect(), 260);
  });
}

export function playTick(): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = 1050;
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);
    osc.connect(gain);
    gain.connect(audioOut(c));
    osc.start(now);
    osc.stop(now + 0.015);
  });
}

export function playReelStop(): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const dest = audioOut(c);

    const thud = c.createOscillator();
    const thudGain = c.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(220, now);
    thud.frequency.exponentialRampToValueAtTime(55, now + 0.12);
    thudGain.gain.setValueAtTime(1.0, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    thud.connect(thudGain);
    thudGain.connect(dest);
    thud.start(now);
    thud.stop(now + 0.15);

    const click = c.createOscillator();
    const clickGain = c.createGain();
    click.type = 'square';
    click.frequency.value = 3200;
    clickGain.gain.setValueAtTime(0.42, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    click.connect(clickGain);
    clickGain.connect(dest);
    click.start(now);
    click.stop(now + 0.02);
  });
}

export function playWinDing(): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const dest = audioOut(c);

    [880, 1318.5].forEach((freq, i) => {
      const t   = now + i * 0.08;
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type  = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.46, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  });
}

export function playCelebration(): void {
  playWhenReady((c) => {
    const dest = audioOut(c);

    const pingFreqs = [880, 1100, 1320, 1100, 1760];
    pingFreqs.forEach((freq, i) => {
      const t = c.currentTime + i * 0.07;
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g);
      g.connect(dest);
      osc.start(t);
      osc.stop(t + 0.2);
    });

    const chordFreqs = [523.25, 659.25, 783.99, 1046.5];
    const chordStart = c.currentTime + pingFreqs.length * 0.07 + 0.04;
    chordFreqs.forEach((freq) => {
      const osc = c.createOscillator();
      const g   = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, chordStart);
      g.gain.linearRampToValueAtTime(0.34, chordStart + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.55);
      osc.connect(g);
      g.connect(dest);
      osc.start(chordStart);
      osc.stop(chordStart + 0.6);
    });
  });
}

export function playSadTrombone(): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const dest = audioOut(c);
    const notes = [
      { freq: 220.0, t: 0.00,  dur: 0.22 },
      { freq: 174.6, t: 0.22,  dur: 0.22 },
      { freq: 146.8, t: 0.46,  dur: 0.55 },
    ];

    notes.forEach((n, i) => {
      const start = now + n.t;
      const osc   = c.createOscillator();
      const gain  = c.createGain();
      osc.type    = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, start);

      if (i === notes.length - 1) {
        osc.frequency.exponentialRampToValueAtTime(n.freq * 0.85, start + n.dur);
      }

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.32, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.dur);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(start);
      osc.stop(start + n.dur + 0.05);
    });
  });
}
