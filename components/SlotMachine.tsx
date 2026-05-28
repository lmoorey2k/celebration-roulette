/**
 * SlotMachine — Celebration Restaurant Roller
 *
 * Image-backed cabinet. The winner is displayed in a card below the machine
 * (see index.tsx / WinnerCard) so the settled reel state stays fully visible.
 * A forwardRef handle lets the parent trigger a new spin programmatically.
 */

import React, { useRef, useCallback, useState, useEffect, useImperativeHandle } from 'react';
import {
  View,
  Animated,
  Easing,
  Pressable,
  Text,
  StyleSheet,
  Image,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { getOddsMultiplier, type Restaurant } from '@/hooks/useRestaurants';
import { FontSizes, Radii } from '@/constants/theme';
import { resumeAudio, playLeverPull, playTick, playReelStop, playWinDing } from '@/utils/audio';
import { startSpinHaptics, type SpinHapticsController } from '@/utils/haptics';
import { CATEGORIES, type Category } from './CategoryFilter';

const CABINET_IMAGE = require('../assets/images/slot-machine-cabinet.png');
const CABINET_W = 1122;
const CABINET_H = 1402;
const CABINET_ASPECT = CABINET_W / CABINET_H;

const VISIBLE = 3;
const NUM_REELS = 3;
const DIV_W = 2;

const DURATIONS = [3200, 4600, 6000];
const ROTATIONS = [12, 15, 18];
const SPIN_PREROLL_MS = 600;
const SYNTH_STOP_LEAD_MS = 120;
const RAMPUP_PROGRESS = 0.12;
// Fire tick sounds slightly before the visual row boundary. Browser/iOS audio
// output has a little latency, so exact-boundary scheduling feels behind.
const TICK_LEAD_RATIO = 0.38;
const STOP_ORDERS: readonly (readonly number[])[] = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0],
];

const P = {
  green: '#0B5B45',
  greenDark: '#063E31',
  greenSoft: '#E6F0EC',
  ink: '#172F28',
  inkSoft: '#526C63',
  cream: '#FFF8EC',
  gold: '#CFA14B',
  reelFace: '#FFFFFF',
  reelLine: '#D8E1DE',
};

const FONT_SANS = Platform.OS === 'web'
  ? '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  : undefined;

const LOGO_SCALE_BY_ID: Record<number, number> = {
  2: 1.55, 3: 1.5, 5: 1.45,
  6: 1.18, 7: 1.18, 8: 1.22, 10: 1.2, 12: 1.2, 13: 1.22, 14: 1.18, 15: 1.2,
  17: 1.05, 19: 1.1, 21: 1.28, 22: 1.22, 24: 1.2, 27: 1.18, 29: 1.18,
  30: 1.22, 33: 1.55, 35: 1.2, 37: 1.18, 38: 1.18, 41: 1.18, 44: 1.26,
  46: 1.2, 47: 1.18, 48: 1.18, 49: 1.2, 50: 1.22, 51: 1.85, 54: 1.22,
};

const LOGO_OFFSET_Y_BY_ID: Record<number, number> = {
  3: -0.2, 19: 0.08, 20: -0.18, 28: 0.2, 33: 0.12,
};

function getLogoScale(r: Restaurant)  { return LOGO_SCALE_BY_ID[r.id]  ?? 1; }
function getLogoOffsetY(r: Restaurant){ return LOGO_OFFSET_Y_BY_ID[r.id] ?? 0; }

function pickRandomPoolItem(pool: Restaurant[], excludeIds: Set<number>) {
  const candidates = pool.filter((restaurant) => !excludeIds.has(restaurant.id));
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)];
}

function buildReelData(pool: Restaurant[], winner: Restaurant, rotations: number, offset: number, itemH: number) {
  const items: Restaurant[] = [];
  const preCount = rotations * pool.length;
  for (let i = 0; i < preCount; i++) items.push(pool[(i + offset) % pool.length]);

  const finalTop = pickRandomPoolItem(pool, new Set([winner.id]));
  const finalBottom = pickRandomPoolItem(pool, new Set([winner.id, finalTop.id]));

  items[items.length - 1] = finalTop;
  const winnerIdx = items.length;
  items.push(winner);
  items.push(finalBottom);
  for (let i = 1; i < VISIBLE; i++) items.push(pool[(winnerIdx + 1 + i + offset) % pool.length]);
  const targetY = -(winnerIdx - 1) * itemH;
  return { items, targetY, overshootY: targetY - itemH * 0.2 };
}

function buildReelMotionProfile(targetY: number, itemH: number, baseDuration: number, stopRank: number) {
  const hasRebound = Math.random() < 0.5;
  const rampMs = Math.round(baseDuration * 0.16);
  const brakeMs = Math.round(baseDuration * 0.3);
  const reboundMs = hasRebound ? 92 + stopRank * 14 : 0;
  const settleMs = 132 + stopRank * 18;
  const cruiseMs = Math.max(420, baseDuration - rampMs - brakeMs);
  const overshootPx = Math.max(3, itemH * (0.045 + Math.random() * 0.035));
  const reboundPx = hasRebound ? Math.max(2, overshootPx * (0.18 + Math.random() * 0.16)) : 0;

  return {
    rampTargetY: targetY * (0.055 + Math.random() * 0.025),
    cruiseTargetY: targetY * (0.8 + Math.random() * 0.04),
    brakeTargetY: targetY - overshootPx,
    reboundTargetY: targetY + reboundPx,
    rampMs,
    cruiseMs,
    brakeMs,
    reboundMs,
    settleMs,
    hasRebound,
    totalDuration: rampMs + cruiseMs + brakeMs + reboundMs + settleMs,
  };
}

function buildVisibleReelItems(pool: Restaurant[], centerRestaurant?: Restaurant | null): Restaurant[][] {
  if (pool.length === 0) return [[], [], []];

  return Array.from({ length: NUM_REELS }, () => {
    const center = centerRestaurant ?? pickRandomPoolItem(pool, new Set());
    const top = pickRandomPoolItem(pool, new Set([center.id]));
    const bottom = pickRandomPoolItem(pool, new Set([center.id, top.id]));
    return [top, center, bottom];
  });
}

function sameOrder(a: readonly number[] | null, b: readonly number[]) {
  return !!a && a.every((v, i) => v === b[i]);
}

function pickWeightedRestaurant(pool: Restaurant[]): Restaurant | null {
  if (pool.length === 0) return null;

  const total = pool.reduce((sum, restaurant) => sum + Math.max(0, getOddsMultiplier(restaurant.weight)), 0);
  if (total <= 0) return pool[Math.floor(Math.random() * pool.length)];

  let roll = Math.random() * total;
  for (const restaurant of pool) {
    roll -= Math.max(0, getOddsMultiplier(restaurant.weight));
    if (roll <= 0) return restaurant;
  }

  return pool[pool.length - 1];
}

// ─── Reel item ────────────────────────────────────────────────────────────────

function ReelItem({ restaurant, itemW, itemH }: { restaurant: Restaurant; itemW: number; itemH: number }) {
  const [failed, setFailed] = useState(!restaurant.logo_url);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!restaurant.logo_url) { setFailed(true); return; }
    setFailed(false);
    loadedRef.current = false;
    const t = setTimeout(() => { if (!loadedRef.current) setFailed(true); }, 3000);
    return () => clearTimeout(t);
  }, [restaurant.logo_url]);

  return (
    <View style={[rstyles.cell, { width: itemW, height: itemH }]}>
      {!failed ? (
        <View style={[rstyles.logoFrame, {
          width: Math.round(itemW * 0.78),
          height: Math.round(itemH * 0.62),
          transform: [{ translateY: Math.round(itemH * getLogoOffsetY(restaurant)) }],
        }]}>
          <Image
            source={{ uri: restaurant.logo_url }}
            style={[rstyles.logo, { transform: [{ scale: getLogoScale(restaurant) }] }]}
            resizeMode="contain"
            onLoad={() => { loadedRef.current = true; }}
            onError={() => setFailed(true)}
          />
        </View>
      ) : (
        <Text style={rstyles.nameText} numberOfLines={3} adjustsFontSizeToFit>{restaurant.name}</Text>
      )}
    </View>
  );
}

const rstyles = StyleSheet.create({
  cell: { alignItems: 'center', justifyContent: 'center', backgroundColor: P.reelFace, padding: 4, overflow: 'hidden' },
  logoFrame: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  logo: { width: '100%', height: '100%', alignSelf: 'center' },
  nameText: { color: P.ink, fontSize: 11, fontWeight: '800', lineHeight: 14, textAlign: 'center', ...(FONT_SANS ? ({ fontFamily: FONT_SANS } as any) : {}) },
});

// ─── Public handle (forwardRef) ───────────────────────────────────────────────

export interface SlotMachineHandle {
  triggerSpin: () => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  pool: Restaurant[];
  /** Odds pick pool. Kept separate from `pool` so winner selection can use
   *  admin odds while reel visuals stay unique and uncluttered. */
  weightedPool?: Restaurant[];
  spinning: boolean;
  spinLabel?: string;
  onSpinStart: () => void;
  onSpinComplete: (winner: Restaurant) => void;
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  displayedPick?: Restaurant | null;
  emptyState?: {
    title: string;
    body: string;
  } | null;
  /**
   * When true, the next spin is rigged to land on Chick-fil-A (restaurant id 9)
   * if it exists in the current pool. Used for the Sunday Easter egg — looks
   * random to the user, but the outcome is predetermined.
   */
  shouldWinChickFilA?: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────

export const SlotMachine = React.forwardRef<SlotMachineHandle, Props>(function SlotMachine(
  { pool, weightedPool, spinning, onSpinStart, onSpinComplete, spinLabel = 'SPIN', activeCategory, onCategoryChange, displayedPick = null, emptyState = null, shouldWinChickFilA = false },
  ref,
) {
  // useWindowDimensions returns 0 during Expo static-export SSR hydration and
  // never properly updates on web, leaving the machine stuck at a small fallback
  // size. onLayout measures the actual rendered container width instead — it fires
  // immediately after mount and correctly tracks resize.
  const [containerW, setContainerW] = useState(0);
  const onWrapLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerW(e.nativeEvent.layout.width);
  }, []);
  const effectiveW = containerW > 0 ? containerW : 390;
  const cabinetW   = Math.min(Math.round(effectiveW * 0.96), 680);
  const cabinetH   = Math.round(cabinetW / CABINET_ASPECT);

  const reelLeft   = Math.round(cabinetW * 0.184);
  const reelTop    = Math.round(cabinetH * 0.39);
  const reelOuterW = Math.round(cabinetW * 0.635);
  const itemH      = Math.floor((cabinetH * 0.305) / VISIBLE);
  const reelH      = itemH * VISIBLE;
  const reelW      = Math.floor((reelOuterW - DIV_W * (NUM_REELS - 1)) / NUM_REELS);
  const reelTotalW = reelW * NUM_REELS + DIV_W * (NUM_REELS - 1);
  const reelBR     = Math.max(14, Math.round(cabinetW * 0.025));

  const spinButtonW   = Math.max(146, Math.round(cabinetW * 0.34));
  const spinButtonH   = Math.max(42,  Math.round(cabinetH * 0.048));
  // On desktop web (cabinetW hits the 680px cap) the button sits too high
  // in the green panel due to how the browser lays out the cabinet image.
  // Mobile never reaches 680px so this nudge is desktop-only.
  const spinButtonTopRatio = Platform.OS === 'web' && cabinetW >= 680 ? 0.827 : 0.812;
  const spinButtonTop = Math.round(cabinetH * spinButtonTopRatio);

  const anims    = useRef(Array.from({ length: NUM_REELS }, () => new Animated.Value(0))).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const glowLoop = useRef<Animated.CompositeAnimation | null>(null);

  const tickIds       = useRef<string[]>(['', '', '']);
  const prevB         = useRef([0, 0, 0]);
  const stoppedReels  = useRef(0);
  const lastPressSoundAt = useRef(0);
  const stopSoundTimers = useRef<Array<ReturnType<typeof setTimeout> | null>>([null, null, null]);
  const stopSoundPlayed = useRef([false, false, false]);
  const lastStopOrder = useRef<readonly number[] | null>(null);
  const spinHaptics = useRef<SpinHapticsController | null>(null);
  // Tracks whether a spin animation is currently in flight. Used to prevent
  // the pool-change reset effect from resetting the reels mid-spin (which
  // happens when the live API response arrives while the reels are spinning).
  const isSpinActiveRef = useRef(false);

  const defaultItems = useCallback((centerRestaurant?: Restaurant | null): Restaurant[][] => {
    if (pool.length === 0) return [[], [], []];
    return buildVisibleReelItems(pool, centerRestaurant);
  }, [pool]);

  const [reelItems, setReelItems] = useState<Restaurant[][]>(() => defaultItems());
  const [showGlow, setShowGlow]   = useState(false);
  const poolKey = pool.map((r) => r.id).join(',');

  const stopGlow = useCallback(() => {
    glowLoop.current?.stop(); glowLoop.current = null; glowAnim.setValue(0);
  }, [glowAnim]);

  const startGlow = useCallback(() => {
    glowLoop.current = Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,    duration: 520, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.28, duration: 520, useNativeDriver: true }),
    ]));
    glowLoop.current.start();
  }, [glowAnim]);

  const clearReelTick = useCallback((i: number) => {
    if (tickIds.current[i]) { anims[i].removeListener(tickIds.current[i]); tickIds.current[i] = ''; }
  }, [anims]);

  const clearAllTicks = useCallback(() => { tickIds.current.forEach((_, i) => clearReelTick(i)); }, [clearReelTick]);
  const clearStopSoundTimers = useCallback(() => {
    stopSoundTimers.current.forEach((timer, i) => {
      if (timer) clearTimeout(timer);
      stopSoundTimers.current[i] = null;
    });
  }, []);
  const stopSpinHaptics = useCallback(() => {
    spinHaptics.current?.stop();
    spinHaptics.current = null;
  }, []);

  // Reset reels when pool / category changes — but NEVER during an active spin.
  // The live API fetch can arrive mid-spin and change poolKey, which would
  // otherwise call setValue(0) and snap all reels back to the start position.
  useEffect(() => {
    if (isSpinActiveRef.current) return;
    anims.forEach((a) => a.setValue(0));
    const centeredPick = displayedPick && pool.some((restaurant) => restaurant.id === displayedPick.id)
      ? displayedPick
      : null;
    setShowGlow(false); stopGlow(); setReelItems(defaultItems(centeredPick));
  }, [poolKey, activeCategory, displayedPick, anims, defaultItems, stopGlow]);

  useEffect(() => () => { clearAllTicks(); clearStopSoundTimers(); stopSpinHaptics(); stopGlow(); }, [clearAllTicks, clearStopSoundTimers, stopSpinHaptics, stopGlow]);

  const playSpinPressSound = useCallback(() => {
    if (spinning || pool.length < 2) return;
    lastPressSoundAt.current = Date.now();
    resumeAudio();
    playLeverPull();
  }, [spinning, pool.length]);

  const handleSpin = useCallback((playSound = true) => {
    if (spinning || pool.length < 2) return;
    resumeAudio();
    if (playSound && Date.now() - lastPressSoundAt.current > 350) playLeverPull();

    // Sunday Easter egg: if shouldWinChickFilA is set AND Chick-fil-A is in
    // the current pool, force it to win. The animation still looks completely
    // random — only the final landing position is rigged.
    const CHICK_FIL_A_ID = 9;
    const chickFilA = shouldWinChickFilA ? pool.find((r) => r.id === CHICK_FIL_A_ID) : undefined;
    // Pick winner from the admin odds pool. Lower and higher odds are handled by
    // a true weighted random roll, so fractional tiers like 0.25x work cleanly.
    const pickPool = weightedPool?.length ? weightedPool : pool;
    const picked = chickFilA ?? pickWeightedRestaurant(pickPool) ?? pool[Math.floor(Math.random() * pool.length)];
    const stride = Math.max(1, Math.floor(pool.length / NUM_REELS));
    let stopOrder = STOP_ORDERS[Math.floor(Math.random() * STOP_ORDERS.length)];
    if (sameOrder(lastStopOrder.current, stopOrder)) {
      const idx = STOP_ORDERS.findIndex((o) => sameOrder(o, stopOrder));
      stopOrder = STOP_ORDERS[(idx + 1 + Math.floor(Math.random() * (STOP_ORDERS.length - 1))) % STOP_ORDERS.length];
    }
    lastStopOrder.current = stopOrder;

    const profile = (reel: number) => stopOrder.indexOf(reel);
    const data = Array.from({ length: NUM_REELS }, (_, i) =>
      buildReelData(pool, picked, ROTATIONS[profile(i)], i * stride, itemH)
    );
    const motionProfiles = data.map((reelData, i) =>
      buildReelMotionProfile(reelData.targetY, itemH, DURATIONS[profile(i)], profile(i))
    );

    anims.forEach((a) => a.setValue(0));
    stopGlow(); setShowGlow(false); setReelItems(data.map((d) => d.items));
    clearAllTicks();
    clearStopSoundTimers();
    stopSpinHaptics();
    prevB.current = [0, 0, 0];
    stoppedReels.current = 0;
    stopSoundPlayed.current = [false, false, false];
    const tickLeadPx = itemH * TICK_LEAD_RATIO;
    anims.forEach((anim, reel) => {
      tickIds.current[reel] = anim.addListener(({ value }) => {
        const boundary = Math.floor((Math.abs(value) + tickLeadPx) / itemH);
        if (boundary > prevB.current[reel]) {
          prevB.current[reel] = boundary;
          const target = Math.max(itemH, Math.abs(motionProfiles[reel]?.brakeTargetY ?? data[reel]?.targetY ?? itemH));
          const progress = Math.min(1, Math.abs(value) / target);
          const slowdown = Math.max(0, Math.min(1, (progress - 0.66) / 0.34));
          const rampup = Math.max(0, Math.min(1, 1 - progress / RAMPUP_PROGRESS));
          playTick(reel, NUM_REELS - stoppedReels.current, slowdown, rampup);
        }
      });
    });

    isSpinActiveRef.current = true;
    spinHaptics.current = startSpinHaptics(SPIN_PREROLL_MS + Math.max(...motionProfiles.map((profile) => profile.totalDuration)));
    onSpinStart();

    let finished = 0;
    data.forEach((reelData, i) => {
      const stopRank = profile(i);
      const motion = motionProfiles[i];
      const stopAt = Math.max(0, SPIN_PREROLL_MS + motion.totalDuration - SYNTH_STOP_LEAD_MS);
      stopSoundTimers.current[i] = setTimeout(() => {
        stopSoundTimers.current[i] = null;
        stopSoundPlayed.current[i] = true;
        playReelStop(i, stopRank, stopRank === NUM_REELS - 1);
        spinHaptics.current?.pulseStop(stopRank === NUM_REELS - 1);
      }, stopAt);

      // Exact-timed phases keep the physical feel without using springs, so the
      // final row still lands on the correct pixel every time.
      const steps = [
        Animated.timing(anims[i], {
          toValue: motion.rampTargetY,
          duration: motion.rampMs,
          delay: SPIN_PREROLL_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(anims[i], {
          toValue: motion.cruiseTargetY,
          duration: motion.cruiseMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(anims[i], {
          toValue: motion.brakeTargetY,
          duration: motion.brakeMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ];

      if (motion.hasRebound) {
        steps.push(
          Animated.timing(anims[i], {
            toValue: motion.reboundTargetY,
            duration: motion.reboundMs,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        );
      }

      steps.push(
        Animated.timing(anims[i], {
          toValue: reelData.targetY,
          duration: motion.settleMs,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );

      Animated.sequence(steps).start(({ finished: ok }) => {
        if (!ok) return;
        anims[i].setValue(reelData.targetY); // snap to exact pixel
        clearReelTick(i);
        if (stopSoundTimers.current[i]) {
          clearTimeout(stopSoundTimers.current[i]);
          stopSoundTimers.current[i] = null;
        }
        stoppedReels.current += 1;
        if (!stopSoundPlayed.current[i]) {
          const isFinal = stoppedReels.current === NUM_REELS;
          playReelStop(i, stopRank, isFinal);
          spinHaptics.current?.pulseStop(isFinal);
        }
        finished += 1;
        if (finished === NUM_REELS) {
          isSpinActiveRef.current = false;
          stopSpinHaptics();
          setShowGlow(true); startGlow(); playWinDing();
          setTimeout(() => onSpinComplete(picked), 1400);
        }
      });
    });
  }, [spinning, pool, weightedPool, itemH, anims, clearAllTicks, clearReelTick, onSpinStart, onSpinComplete, startGlow, stopGlow, stopSpinHaptics, shouldWinChickFilA]);

  // Expose triggerSpin so the WinnerCard "Spin Again" button can fire a real spin
  useImperativeHandle(ref, () => ({ triggerSpin: () => handleSpin(true) }), [handleSpin]);

  const canSpin = !spinning && pool.length >= 2;
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.72] });

  return (
    <View style={styles.wrap} onLayout={onWrapLayout}>
      {/* Category pills — wrapping flex row so all are visible at once */}
      <View style={[styles.categoryShell, { maxWidth: cabinetW }]}>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const active = cat.key === activeCategory;
            return (
              <Pressable
                key={cat.key}
                onPress={() => onCategoryChange(cat.key)}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Cabinet */}
      <View style={[styles.cabinetStage, { width: cabinetW, height: cabinetH }]}>
        <Image source={CABINET_IMAGE} style={styles.cabinetImage} resizeMode="contain" accessibilityIgnoresInvertColors />

        {/* Live reel window */}
        <View style={[styles.reelWindow, { left: reelLeft, top: reelTop, width: reelTotalW, height: reelH, borderRadius: reelBR }]}>
          <Animated.View pointerEvents="none" style={[styles.winGlow, { opacity: showGlow ? glowOpacity : 0 }]} />

          {Array.from({ length: NUM_REELS }, (_, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[styles.reelDivider, { width: DIV_W }]} />}
              <View style={[styles.reelColumn, { width: reelW, height: reelH }]}>
                <Animated.View style={{ transform: [{ translateY: anims[i] }] }}>
                  {(reelItems[i] ?? []).map((restaurant, idx) => (
                    <ReelItem key={`${restaurant.id}-${idx}`} restaurant={restaurant} itemW={reelW} itemH={itemH} />
                  ))}
                </Animated.View>
              </View>
            </React.Fragment>
          ))}

          <View pointerEvents="none" style={[styles.payline, { top: itemH, height: itemH }]} />
          <View pointerEvents="none" style={styles.topShade} />
          <View pointerEvents="none" style={styles.bottomShade} />

          {emptyState ? (
            <View pointerEvents="none" style={styles.emptyState}>
              <Text style={styles.emptyTitle} numberOfLines={2} adjustsFontSizeToFit>
                {emptyState.title}
              </Text>
              <Text style={styles.emptyBody} numberOfLines={3} adjustsFontSizeToFit>
                {emptyState.body}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Invisible lever hit target */}
        <Pressable
          onPress={() => handleSpin(false)} disabled={!canSpin}
          style={[styles.leverHitArea, { left: Math.round(cabinetW * 0.84), top: Math.round(cabinetH * 0.33), width: Math.round(cabinetW * 0.14), height: Math.round(cabinetH * 0.31) }]}
          accessibilityRole="button" accessibilityLabel="Pull lever to spin"
        />

        {/* Spin button */}
        <Pressable
          onPressIn={playSpinPressSound}
          onPress={() => handleSpin(true)} disabled={!canSpin}
          style={[styles.spinButton, !canSpin && styles.spinButtonDisabled, { top: spinButtonTop, left: Math.round((cabinetW - spinButtonW) / 2), width: spinButtonW, minHeight: spinButtonH, borderRadius: Math.round(spinButtonH / 2) }]}
          accessibilityRole="button" accessibilityLabel="Spin for a dining pick"
        >
          <Text style={styles.spinButtonText}>{pool.length < 2 ? 'NO PICKS' : spinLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', gap: 12 },
  categoryShell: { width: '100%', paddingHorizontal: 16 },
  // Wrapping flex row — all pills stay visible, no horizontal scroll
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.full, backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: '#D6E1DD', justifyContent: 'center' },
  categoryPillActive: { backgroundColor: P.green, borderColor: P.greenDark },
  categoryText: { color: P.inkSoft, fontSize: FontSizes.sm, fontWeight: '800', ...(FONT_SANS ? ({ fontFamily: FONT_SANS } as any) : {}) },
  categoryTextActive: { color: '#FFFFFF' },
  cabinetStage: {
    position: 'relative', alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({ filter: 'drop-shadow(0 22px 30px rgba(12, 49, 39, 0.18))' } as any)
      : { shadowColor: '#0A3328', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.16, shadowRadius: 22, elevation: 10 }),
  },
  cabinetImage: { width: '100%', height: '100%' },
  reelWindow: { position: 'absolute', overflow: 'hidden', flexDirection: 'row', backgroundColor: P.reelFace },
  reelColumn: { overflow: 'hidden', backgroundColor: P.reelFace },
  reelDivider: { height: '100%', backgroundColor: P.reelLine },
  payline: { position: 'absolute', left: 0, right: 0, borderTopWidth: 2, borderBottomWidth: 2, borderColor: 'rgba(11,91,69,0.12)', backgroundColor: 'rgba(255,255,255,0.16)', zIndex: 4 },
  topShade: {
    position: 'absolute', left: 0, right: 0, top: 0, height: '32%', zIndex: 5,
    ...(Platform.OS === 'web' ? ({ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.58), rgba(0,0,0,0.18), rgba(0,0,0,0))' } as any) : { backgroundColor: 'rgba(0,0,0,0.13)' }),
  },
  bottomShade: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '32%', zIndex: 5,
    ...(Platform.OS === 'web' ? ({ backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.58), rgba(0,0,0,0.18), rgba(0,0,0,0))' } as any) : { backgroundColor: 'rgba(0,0,0,0.13)' }),
  },
  winGlow: { position: 'absolute', left: 0, right: 0, top: '33.333%', height: '33.333%', backgroundColor: 'rgba(214,239,230,0.65)', zIndex: 3 },
  emptyState: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 248, 236, 0.96)',
  },
  emptyTitle: {
    color: P.greenDark,
    fontSize: FontSizes.sm,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 17,
    ...(FONT_SANS ? ({ fontFamily: FONT_SANS } as any) : {}),
  },
  emptyBody: {
    color: P.inkSoft,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 3,
    ...(FONT_SANS ? ({ fontFamily: FONT_SANS } as any) : {}),
  },
  leverHitArea: { position: 'absolute', backgroundColor: 'transparent' },
  spinButton: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18,
    backgroundColor: P.cream, borderWidth: 1.5, borderColor: P.gold,
    ...(Platform.OS === 'web' ? ({ boxShadow: '0 9px 18px rgba(24, 50, 42, 0.2), inset 0 1px 1px rgba(255,255,255,0.85)' } as any) : {}),
  },
  spinButtonDisabled: { opacity: 1 },
  spinButtonText: { color: P.greenDark, fontSize: FontSizes.sm, fontWeight: '900', letterSpacing: 0, textAlign: 'center', ...(FONT_SANS ? ({ fontFamily: FONT_SANS } as any) : {}) },
  audioVersionBadge: {
    position: 'absolute',
    zIndex: 8,
    color: '#F7E8BD',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    opacity: 0.92,
    textAlign: 'center',
    ...(FONT_SANS ? ({ fontFamily: FONT_SANS } as any) : {}),
  },
});
