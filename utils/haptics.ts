import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface SpinHapticsController {
  pulseStop: (isFinal: boolean) => void;
  stop: () => void;
}

type WebVibrationPattern = number | number[];

const NOOP_CONTROLLER: SpinHapticsController = {
  pulseStop: () => {},
  stop: () => {},
};

function isTouchWebDevice(): boolean {
  if (Platform.OS !== 'web') return false;
  if (typeof navigator === 'undefined') return false;

  const touchPoints = navigator.maxTouchPoints ?? 0;
  const coarsePointer = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches;

  return touchPoints > 0 || coarsePointer;
}

function supportsWebVibration(): boolean {
  return isTouchWebDevice() && typeof navigator.vibrate === 'function';
}

function fireWebVibration(pattern: WebVibrationPattern): void {
  if (!supportsWebVibration()) return;

  navigator.vibrate(pattern);
}

function fireSelectionPulse(durationMs = 10): void {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.selectionAsync().catch(() => {});
    return;
  }

  fireWebVibration(durationMs);
}

function fireImpactPulse(style: Haptics.ImpactFeedbackStyle, pattern: WebVibrationPattern): void {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(style).catch(() => {});
    return;
  }

  fireWebVibration(pattern);
}

export function startSpinHaptics(totalDurationMs: number): SpinHapticsController {
  if (!(Platform.OS === 'ios' || Platform.OS === 'android' || supportsWebVibration())) {
    return NOOP_CONTROLLER;
  }

  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;
  const startedAt = Date.now();

  const schedule = (delayMs: number, fn: () => void) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      fn();
    }, delayMs);
    timers.add(timer);
  };

  const tick = () => {
    if (stopped) return;

    const elapsed = Date.now() - startedAt;
    const progress = Math.min(1, elapsed / Math.max(1, totalDurationMs));
    const pulseMs = progress < 0.18
      ? 8
      : progress < 0.72
        ? 11
        : 15;
    fireSelectionPulse(pulseMs);

    const nextDelay = progress < 0.18
      ? 230
      : progress < 0.72
        ? 135
        : 210;

    schedule(nextDelay, tick);
  };

  fireSelectionPulse(12);
  schedule(150, tick);

  return {
    pulseStop: (isFinal) => {
      if (stopped) return;
      fireImpactPulse(
        isFinal ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
        isFinal ? [18, 36, 24] : [12, 28, 10],
      );
    },
    stop: () => {
      stopped = true;
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    },
  };
}
