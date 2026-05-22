import { Platform } from 'react-native';

let _ctx: AudioContext | null = null;
let _resumePromise: Promise<void> | null = null;
let _unlocked = false;

export const SLOT_AUDIO_VERSION = 'audio-v1.6-mechanical-tick-600ms';

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

    // Prime the stream on touchstart so the real button sound can fire with
    // less iOS Safari latency when React's press handler runs.
    ensureStream(c);
    kickStream();

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

// Pre-generated white-noise buffer reused for every mechanical tick.
// Real slot-machine clicks are mostly broadband noise (wood pawl on metal cog);
// pure oscillators sound buzzy and electronic.
let _noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!_noiseBuffer || _noiseBuffer.sampleRate !== c.sampleRate) {
    const len = Math.max(1, Math.floor(c.sampleRate * 0.08));
    _noiseBuffer = c.createBuffer(1, len, c.sampleRate);
    const data = _noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return _noiseBuffer;
}

// ─── Sound effects ──────────────────────────────────────────────────────────
// All sounds connect to audioOut(c) instead of c.destination. On web, this
// routes through a MediaStreamDestination → <audio> element pipeline, which
// bypasses the iOS Safari bug where ctx.destination silently disconnects.

export function playLeverPull(): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const out = masterGain(c, 1.05);

    // Sub thud — adds the low-end body the original click was missing.
    const sub = c.createOscillator();
    const subGain = c.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(150, now);
    sub.frequency.exponentialRampToValueAtTime(58, now + 0.09);
    subGain.gain.setValueAtTime(0.58, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    sub.connect(subGain);
    subGain.connect(out);
    sub.start(now);
    sub.stop(now + 0.12);

    const down = c.createOscillator();
    const downGain = c.createGain();
    down.type = 'square';
    down.frequency.setValueAtTime(420, now);
    down.frequency.exponentialRampToValueAtTime(120, now + 0.055);
    downGain.gain.setValueAtTime(0.74, now);
    downGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    down.connect(downGain);
    downGain.connect(out);
    down.start(now);
    down.stop(now + 0.09);

    const contact = c.createOscillator();
    const contactGain = c.createGain();
    contact.type = 'triangle';
    contact.frequency.value = 1380;
    contactGain.gain.setValueAtTime(0.42, now + 0.004);
    contactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.034);
    contact.connect(contactGain);
    contactGain.connect(out);
    contact.start(now + 0.004);
    contact.stop(now + 0.04);

    const spring = c.createOscillator();
    const springGain = c.createGain();
    spring.type = 'square';
    spring.frequency.setValueAtTime(760, now + 0.07);
    spring.frequency.exponentialRampToValueAtTime(360, now + 0.15);
    springGain.gain.setValueAtTime(0, now + 0.06);
    springGain.gain.linearRampToValueAtTime(0.24, now + 0.075);
    springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.155);
    spring.connect(springGain);
    springGain.connect(out);
    spring.start(now + 0.065);
    spring.stop(now + 0.16);

    setTimeout(() => out.disconnect(), 190);
  });
}

export function playTick(reel = 0, activeReels = 3, slowdown = 0, rampup = 0): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const dest = audioOut(c);
    const activeCount = Math.max(1, Math.min(3, Math.round(activeReels)));
    const slow = Math.max(0, Math.min(1, slowdown));
    const ramp = Math.max(0, Math.min(1, rampup));
    // Wider dynamic range so 1 reel feels noticeably softer than 3.
    const levelByActiveReels: Record<number, number> = { 1: 0.020, 2: 0.052, 3: 0.105 };
    const baseLevel = levelByActiveReels[activeCount] ?? 0.105;
    // Quieter during the startup ramp.
    const level = baseLevel * (1 - ramp * 0.55);

    // 1) Wood/metal CONTACT — a tightly band-passed noise burst.
    // The Q-narrowed noise gives the pawl-hitting-cog character; pure oscillators
    // come out buzzy. Per-reel filter centers + a small random jitter break the
    // robotic repetition that bothered the user.
    const filterBase = [2400, 2700, 3050][reel % 3] ?? 2700;
    const filterFreq = filterBase * (1 - slow * 0.22) * (1 - ramp * 0.30) * (0.92 + Math.random() * 0.16);

    const noise = c.createBufferSource();
    noise.buffer = getNoiseBuffer(c);
    noise.playbackRate.value = 0.92 + Math.random() * 0.18;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = filterFreq;
    bp.Q.value = 3.6 + Math.random() * 1.4;
    const noiseGain = c.createGain();
    // Bandpassed noise reads much quieter per-sample than an oscillator at the
    // same gain; boost so the perceived level lines up with the volume map.
    noiseGain.gain.setValueAtTime(level * 4.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028 + slow * 0.012);
    noise.connect(bp);
    bp.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + 0.06);

    // 2) BODY THUMP — the weight of the spinning reel. Low triangle with a fast
    // downward pitch envelope so it lands as a "thunk" rather than a tone.
    const bodyFreqBase = ([92, 100, 108][reel % 3] ?? 100) * (1 - slow * 0.16);
    const body = c.createOscillator();
    const bodyGain = c.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(bodyFreqBase * 1.55, now);
    body.frequency.exponentialRampToValueAtTime(bodyFreqBase, now + 0.022);
    bodyGain.gain.setValueAtTime(level * 1.45, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + slow * 0.02);
    body.connect(bodyGain);
    bodyGain.connect(dest);
    body.start(now);
    body.stop(now + 0.05);

    // 3) HIGH "TINK" — a single very brief triangle adds a tiny metallic
    // resonance without the square-wave buzz. Volume kept low; this is seasoning.
    const tink = c.createOscillator();
    const tinkGain = c.createGain();
    tink.type = 'triangle';
    tink.frequency.value = ([1950, 2200, 2450][reel % 3] ?? 2200) * (1 - ramp * 0.18);
    tinkGain.gain.setValueAtTime(level * 0.16, now);
    tinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.007);
    tink.connect(tinkGain);
    tinkGain.connect(dest);
    tink.start(now);
    tink.stop(now + 0.009);
  });
}

export function playReelStop(reel = 0, stopRank = 0, isFinal = false): void {
  playWhenReady((c) => {
    const now = c.currentTime;
    const dest = audioOut(c);
    const lowFreqs = [210, 175, 145];
    const highFreqs = [1800, 2200, 2600];
    const weight = isFinal ? 1.12 : 0.78 + stopRank * 0.14;

    const thud = c.createOscillator();
    const thudGain = c.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(lowFreqs[stopRank] ?? 160, now);
    thud.frequency.exponentialRampToValueAtTime(isFinal ? 42 : 55, now + 0.14);
    thudGain.gain.setValueAtTime(0.62 * weight, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.2 : 0.15));
    thud.connect(thudGain);
    thudGain.connect(dest);
    thud.start(now);
    thud.stop(now + (isFinal ? 0.22 : 0.16));

    const click = c.createOscillator();
    const clickGain = c.createGain();
    click.type = 'square';
    click.frequency.value = highFreqs[reel % highFreqs.length] ?? 3200;
    clickGain.gain.setValueAtTime(0.18 * weight, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    click.connect(clickGain);
    clickGain.connect(dest);
    click.start(now);
    click.stop(now + 0.02);

    if (isFinal) {
      const latch = c.createOscillator();
      const latchGain = c.createGain();
      latch.type = 'square';
      latch.frequency.value = 1800;
      latchGain.gain.setValueAtTime(0, now + 0.045);
      latchGain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
      latch.connect(latchGain);
      latchGain.connect(dest);
      latch.start(now + 0.045);
      latch.stop(now + 0.1);
    }
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
