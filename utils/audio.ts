import { Platform } from 'react-native';

let _ctx: AudioContext | null = null;
let _resumePromise: Promise<void> | null = null;
let _unlocked = false;

function ctx(): AudioContext | null {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    try {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (Ctor) _ctx = new Ctor();
    } catch { return null; }
  }
  return _ctx;
}

export function resumeAudio(): Promise<void> {
  const c = ctx();
  if (!c) return Promise.resolve();
  if (c.state !== 'suspended') return Promise.resolve();

  if (!_resumePromise) {
    _resumePromise = c.resume()
      .catch(() => {})
      .finally(() => {
        _resumePromise = null;
      });
  }
  return _resumePromise;
}

// iOS / mobile Safari + mobile Chrome require the AudioContext to be unlocked
// by starting a real (even silent) audio source from within a user-gesture
// stack frame. Calling c.resume() alone is not enough on iOS — and on mobile
// Chrome the autoplay policy similarly demands an explicit source.start() in
// the gesture. We do both: resume() AND a 1-sample silent buffer the first
// time we're invoked.
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

function playWhenReady(play: (c: AudioContext) => void): void {
  const c = ctx();
  if (!c) return;

  // Resume synchronously (fire-and-forget) — must stay inside the user-gesture
  // call stack on iOS Safari.
  if (c.state === 'suspended') {
    c.resume().catch(() => {});
  }
  // Silent-buffer unlock — required by iOS Safari and mobile Chrome autoplay
  // policy. After this fires once, future audio plays freely.
  unlockAudio(c);
  play(c);
}

function masterGain(c: AudioContext, volume: number): GainNode {
  const g = c.createGain();
  g.gain.value = volume;
  g.connect(c.destination);
  return g;
}

// Immediate gesture sound used to unlock browser audio on lever/button press.
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

// ─── Mechanical ratchet tick ─────────────────────────────────────────────────
// Crisp, short click — frequency of calls is controlled by the reel listener.
export function playTick(): void {
  playWhenReady((c) => {
    const now = c.currentTime;

    // Short square-wave burst at ~1kHz — sounds like a mechanical detent click
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = 1050;
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.015);
  });
}

// ─── Reel lock — mechanical thud when a drum stops ──────────────────────────
// Heavy low-frequency "clunk" + a brief metallic transient on top.
export function playReelStop(): void {
  playWhenReady((c) => {
    const now = c.currentTime;

    // Low thud: pitch-dropping oscillator
    const thud = c.createOscillator();
    const thudGain = c.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(220, now);
    thud.frequency.exponentialRampToValueAtTime(55, now + 0.12);
    thudGain.gain.setValueAtTime(1.0, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    thud.connect(thudGain);
    thudGain.connect(c.destination);
    thud.start(now);
    thud.stop(now + 0.15);

    // Metallic click on top
    const click = c.createOscillator();
    const clickGain = c.createGain();
    click.type = 'square';
    click.frequency.value = 3200;
    clickGain.gain.setValueAtTime(0.42, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
    click.connect(clickGain);
    clickGain.connect(c.destination);
    click.start(now);
    click.stop(now + 0.02);
  });
}

// ─── Win ding — single bright bell, fires the instant the last reel locks ──
// Distinct from playReelStop (mechanical clunk) and playCelebration (full chord).
export function playWinDing(): void {
  playWhenReady((c) => {
    const now = c.currentTime;

    // Two-note "ding-ding" — perfect fifth, sine, quick decay
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
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  });
}

// ─── Winner celebration ──────────────────────────────────────────────────────
// Rapid ascending coin-jingle feel, then a final triumphant chord.
export function playCelebration(): void {
  playWhenReady((c) => {

    // Rapid coin pings (short, bright)
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
      g.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });

    // Final chord: C5, E5, G5, C6 together
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
      g.connect(c.destination);
      osc.start(chordStart);
      osc.stop(chordStart + 0.6);
    });
  });
}
