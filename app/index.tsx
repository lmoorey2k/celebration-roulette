import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Easing,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRestaurantContext } from '@/context/RestaurantContext';
import type { Restaurant } from '@/hooks/useRestaurants';
import { SlotMachine, type SlotMachineHandle } from '@/components/SlotMachine';
import { Confetti } from '@/components/Confetti';
import type { Category } from '@/components/CategoryFilter';
import { playCelebration, playSadTrombone, resumeAudio, isSunday } from '@/utils/audio';
import { openListing, openWebsite } from '@/utils/maps';
import { Colors, FontSizes, Radii, Shadow, Spacing } from '@/constants/theme';

type SpinState = 'idle' | 'spinning' | 'result';

// ID of Chick-fil-A in restaurants.json. Used for the Sunday Easter egg —
// the first spin on any Sunday is rigged to land on Chick-fil-A, then shows
// the "closed on Sundays" joke message.
const CHICK_FIL_A_ID = 9;

// Force the Sunday Easter egg on any day by appending ?testSunday=1 to the URL.
// Lets us preview / share the gag without waiting until Sunday or changing
// the system clock. Reads only on web; native always falls back to real date.
function isSundayOrForced(): boolean {
  if (typeof window !== 'undefined' && window.location?.search) {
    if (new URLSearchParams(window.location.search).has('testSunday')) return true;
  }
  return isSunday();
}

export default function HomeScreen() {
  const router   = useRouter();
  const { spinPool, weightedPool } = useRestaurantContext();
  const [spinState, setSpinState] = useState<SpinState>('idle');
  const [winner,    setWinner]    = useState<Restaurant | null>(null);
  const [hasCompletedSpin, setHasCompletedSpin] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  // Tracks whether the rigged Sunday Chick-fil-A spin has already been used
  // this session. Resets when component mounts (new session) so each Sunday
  // each visitor gets one rigged win, then normal random behaviour resumes.
  const [sundayFirstSpinDone, setSundayFirstSpinDone] = useState(false);

  // Should the next spin be rigged to land on Chick-fil-A?
  // Only on Sunday, only if it hasn't already happened this session,
  // and only if Chick-fil-A is actually in the current filtered pool.
  const shouldWinChickFilA =
    isSundayOrForced() &&
    !sundayFirstSpinDone &&
    spinPool.some((r) => r.id === CHICK_FIL_A_ID);

  const scrollRef = useRef<ScrollView>(null);
  const slotRef   = useRef<SlotMachineHandle>(null);

  const filteredPool = useMemo(() => {
    if (activeCategory === 'all') return spinPool;
    // Strict tag match: only show restaurants explicitly tagged with this category.
    // A restaurant tagged breakfast+lunch should NOT appear in dinner.
    // Restaurants with no tags are excluded from all filtered categories
    // (they only appear in "All") to avoid polluting specific meal filters.
    return spinPool.filter((r) => r.categories?.includes(activeCategory));
  }, [spinPool, activeCategory]);

  // Weighted version of the filtered pool — used only for picking the winner.
  const filteredWeightedPool = useMemo(() => {
    if (activeCategory === 'all') return weightedPool;
    return weightedPool.filter((r) => r.categories?.includes(activeCategory));
  }, [weightedPool, activeCategory]);

  const activeLabel = activeCategory === 'all'
    ? 'All dining'
    : activeCategory[0].toUpperCase() + activeCategory.slice(1);

  const handleSpinStart = useCallback(() => {
    setSpinState('spinning');
    setShowConfetti(false);
    setWinner(null);
    resumeAudio();
    // If this spin is the rigged Sunday Chick-fil-A spin, mark it as used now
    // so subsequent spins return to normal random behaviour.
    if (isSundayOrForced() && !sundayFirstSpinDone) {
      setSundayFirstSpinDone(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [sundayFirstSpinDone]);

  const handleSpinComplete = useCallback((restaurant: Restaurant) => {
    setWinner(restaurant);
    setHasCompletedSpin(true);
    setSpinState('result');
    // Sunday Chick-fil-A Easter egg: play the sad trombone instead of the
    // celebration sound, and skip confetti so the "closed" message lands clearly.
    const isClosedSunday = restaurant.id === CHICK_FIL_A_ID && isSundayOrForced();
    if (isClosedSunday) {
      playSadTrombone();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    } else {
      setShowConfetti(true);
      playCelebration();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, []);

  // Auto-scroll to reveal the winner card when it appears
  useEffect(() => {
    if (winner) {
      const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
      return () => clearTimeout(t);
    }
  }, [winner]);

  const handleSpinAgain = useCallback(() => {
    slotRef.current?.triggerSpin();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.machineSection}>
          <View style={styles.machineIntro}>
            <Text style={styles.machineTitle}>Where should we dine?</Text>
            <Text style={styles.machineHint}>Pick a category and let the reels decide.</Text>
          </View>

          <SlotMachine
            ref={slotRef}
            pool={filteredPool}
            weightedPool={filteredWeightedPool}
            spinning={spinState === 'spinning'}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            shouldWinChickFilA={shouldWinChickFilA}
            spinLabel={hasCompletedSpin ? 'SPIN AGAIN' : 'SPIN'}
          />
        </View>

        {/* Winner card slides in below the machine — reels stay fully visible.
            Suppressed on the Sunday Chick-fil-A Easter egg; SundayClosedOverlay
            takes over the full screen with a dramatic reveal instead. */}
        {spinState === 'result' && winner && !(winner.id === CHICK_FIL_A_ID && isSundayOrForced()) && (
          <WinnerCard winner={winner} />
        )}

        <View style={styles.footer}>
          {filteredPool.length === 0 && (
            <Text style={styles.emptyNote}>
              No restaurants in this category right now. Switch back to All dining or edit the list.
            </Text>
          )}
          <Pressable onPress={() => router.push({ pathname: '/list', params: { category: activeCategory } })} style={styles.listLink} accessibilityRole="link">
            <Text style={styles.listLinkText}>
              {filteredPool.length} restaurant{filteredPool.length !== 1 ? 's' : ''} in play • {activeLabel} • Manage list
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Confetti active={showConfetti} />

      {/* Full-screen Chick-fil-A-on-Sunday Easter egg overlay */}
      {spinState === 'result' && winner && winner.id === CHICK_FIL_A_ID && isSundayOrForced() && (
        <SundayClosedOverlay winner={winner} onSpinAgain={handleSpinAgain} />
      )}
    </SafeAreaView>
  );
}

// ─── Winner card ──────────────────────────────────────────────────────────────

function WinnerCard({ winner }: { winner: Restaurant }) {
  const slideAnim = useRef(new Animated.Value(48)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(48);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 10, tension: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const handleMaps    = () => openListing(winner.name, winner.address);
  const handleWebsite = () => winner.website_url && openWebsite(winner.website_url);
  const handlePhone   = () => winner.phone && Linking.openURL('tel:' + winner.phone);

  return (
    <Animated.View style={[wStyles.wrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={wStyles.card}>
        {/* Logo + info row */}
        <View style={wStyles.header}>
          {winner.logo_url ? (
            <Image source={{ uri: winner.logo_url }} style={wStyles.logo} resizeMode="contain" accessibilityIgnoresInvertColors />
          ) : (
            <View style={wStyles.logoFallback}>
              <Text style={wStyles.logoFallbackText}>{winner.name.slice(0, 1)}</Text>
            </View>
          )}
          <View style={wStyles.info}>
            <Text style={wStyles.eyebrow}>Your Celebration pick</Text>
            <Text style={wStyles.name} numberOfLines={2}>{winner.name}</Text>
            <Text style={wStyles.address} numberOfLines={2}>{winner.address}</Text>
            {winner.phone ? (
              <Pressable onPress={handlePhone} accessibilityRole="link">
                <Text style={wStyles.phone}>{winner.phone}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Primary action row */}
        <View style={wStyles.actions}>
          <Pressable
            onPress={handleMaps}
            style={({ pressed }) => [wStyles.primary, pressed && wStyles.pressed]}
            accessibilityRole="button"
          >
            <Text style={wStyles.primaryText}>Open in Maps</Text>
          </Pressable>
          {winner.phone ? (
            <Pressable
              onPress={handlePhone}
              style={({ pressed }) => [wStyles.secondary, pressed && wStyles.pressed]}
              accessibilityRole="link"
            >
              <Text style={wStyles.secondaryText}>Call</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Website — tertiary button, not a tiny text link */}
        {winner.website_url ? (
          <Pressable
            onPress={handleWebsite}
            style={({ pressed }) => [wStyles.tertiary, pressed && wStyles.pressed]}
            accessibilityRole="link"
          >
            <Text style={wStyles.tertiaryText}>View website</Text>
          </Pressable>
        ) : null}
      </View>

    </Animated.View>
  );
}

// ─── Sunday Chick-fil-A closed overlay (Easter egg) ──────────────────────────
//
// Full-screen takeover that fires after the rigged Sunday spin. Designed to
// feel like a "GOTCHA!" reveal: dark backdrop, big bold headline calling out
// the Sunday craving, the Chick-fil-A logo with a giant red CLOSED stamp that
// slams in with a wobble — synced to the sad-trombone audio cue.
//
// Animation choreography:
//   t=0     — backdrop fades, card pops up with overshoot spring
//   t=380ms — stamp slams in from 3× scale, card shakes briefly for impact

function SundayClosedOverlay({ winner, onSpinAgain }: { winner: Restaurant; onSpinAgain: () => void }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;   // backdrop fade
  const scaleAnim = useRef(new Animated.Value(0.6)).current; // card pop-in
  const stampAnim = useRef(new Animated.Value(0)).current;   // 0 → 1 slam
  const shakeAnim = useRef(new Animated.Value(0)).current;   // card shake on slam

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.6);
    stampAnim.setValue(0);
    shakeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 110, useNativeDriver: true }),
    ]).start();

    // Stamp slams in shortly after the card has settled, syncing with the
    // sad-trombone sound for maximum comedic impact.
    const slamTimer = setTimeout(() => {
      Animated.spring(stampAnim, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }).start();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1,    duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1,   duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0.5,  duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -0.3, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,    duration: 60, useNativeDriver: true }),
      ]).start();
    }, 380);

    return () => clearTimeout(slamTimer);
  }, [fadeAnim, scaleAnim, stampAnim, shakeAnim]);

  const shakeX  = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  // Stamp comes in BIG (3× scale, slightly rotated) and lands at 1× — gives it
  // the rubber-stamp slam feel.
  const stampScale = stampAnim.interpolate({ inputRange: [0, 1], outputRange: [3, 1] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, sStyles.backdrop, { opacity: fadeAnim }]} pointerEvents="auto">
      <Animated.View
        style={[
          sStyles.card,
          { transform: [{ scale: scaleAnim }, { translateX: shakeX }] },
        ]}
      >
        <Text style={sStyles.eyebrow}>ADMIT IT...</Text>
        <Text style={sStyles.title}>You ALWAYS want{'\n'}Chick-fil-A{'\n'}on a Sunday.</Text>
        <Text style={sStyles.subtitle}>It never fails. 🐔</Text>

        <View style={sStyles.logoBox}>
          {winner.logo_url ? (
            <Image
              source={{ uri: winner.logo_url }}
              style={sStyles.logo}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={sStyles.logoFallback}>
              <Text style={sStyles.logoFallbackText}>{winner.name.slice(0, 1)}</Text>
            </View>
          )}
          {/* The CLOSED TODAY rubber stamp */}
          <Animated.View
            pointerEvents="none"
            style={[
              sStyles.stamp,
              { opacity: stampAnim, transform: [{ rotate: '-12deg' }, { scale: stampScale }] },
            ]}
          >
            <Text style={sStyles.stampText}>CLOSED{'\n'}TODAY</Text>
          </Animated.View>
        </View>

        <Text style={sStyles.bottomMessage}>Sorry — it's closed today 😅</Text>

        <Pressable
          onPress={onSpinAgain}
          style={({ pressed }) => [sStyles.spinAgainBtn, pressed && sStyles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Spin again for an open restaurant"
        >
          <Text style={sStyles.spinAgainBtnText}>🎰  Spin Again</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundWarm },
  content: {
    flexGrow: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl + Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.backgroundWarm,
    ...(Platform.OS === 'web'
      ? ({ backgroundImage: `linear-gradient(180deg, #EEF3F5 0%, ${Colors.backgroundWarm} 30%, ${Colors.backgroundAlt} 100%)` } as any)
      : {}),
  },
  machineSection: { width: '100%', maxWidth: 760, alignItems: 'center', gap: Spacing.sm },
  machineIntro: { width: '100%', paddingHorizontal: Spacing.lg, gap: 6, alignItems: 'center' },
  machineTitle: { color: Colors.primary, fontSize: FontSizes.xl, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  machineHint: { color: Colors.textMuted, fontSize: FontSizes.md, lineHeight: 22, textAlign: 'center', maxWidth: 460 },
  footer: { alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, maxWidth: 760 },
  emptyNote: { fontSize: FontSizes.sm, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, maxWidth: 420 },
  listLink: { paddingVertical: Spacing.sm },
  listLinkText: { fontSize: FontSizes.sm, color: Colors.primary, textDecorationLine: 'underline', fontWeight: '700', textAlign: 'center' },
});

const wStyles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 760,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: { width: 88, height: 68, flexShrink: 0 },
  logoFallback: {
    width: 88, height: 68, flexShrink: 0,
    borderRadius: Radii.md,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  logoFallbackText: { color: Colors.primary, fontSize: FontSizes.xl, fontWeight: '900' },
  info: { flex: 1, gap: 4 },
  eyebrow: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
  },
  address: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  phone: {
    color: Colors.primary,
    fontSize: FontSizes.sm,
    fontWeight: '800',
    paddingTop: 2,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  primary: {
    flex: 1.6,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md - 1,
  },
  primaryText: { color: Colors.textInverse, fontSize: FontSizes.lg, fontWeight: '900' },
  secondary: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md - 1,
  },
  secondaryText: { color: Colors.primary, fontSize: FontSizes.lg, fontWeight: '900' },
  // Tertiary: same button shape as secondary, distinguishable but clearly an action
  tertiary: {
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md - 1,
    backgroundColor: Colors.backgroundAlt,
  },
  tertiaryText: { color: Colors.textPrimary, fontSize: FontSizes.lg, fontWeight: '700' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});

// ─── Sunday Closed overlay styles ────────────────────────────────────────────
// Full-screen takeover styling for the Chick-fil-A Easter egg. Designed to
// feel bold and a little "Vegas billboard" — high-contrast, oversized type,
// rubber-stamp drama.

const sStyles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(8, 32, 26, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 100,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(6px)' } as any) : {}),
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFF8EC', // cream — matches the cabinet panel
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#0B5B45',     // Visit Celebration green
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 25px 60px rgba(0,0,0,0.45), 0 0 0 6px rgba(207,161,75,0.45)' } as any)
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.42,
          shadowRadius: 26,
          elevation: 24,
        }),
  },
  eyebrow: {
    color: '#C0392B',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
    color: '#0B5B45',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#526C63',
    textAlign: 'center',
    marginTop: 2,
  },
  logoBox: {
    width: 220,
    height: 160,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  logo: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  logoFallback: {
    width: 220,
    height: 160,
    borderRadius: 14,
    backgroundColor: '#E6F0EC',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  logoFallbackText: {
    color: '#0B5B45',
    fontSize: 64,
    fontWeight: '900',
  },
  // Big red rubber "CLOSED TODAY" stamp.
  stamp: {
    position: 'absolute',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 5,
    borderColor: '#C0392B',
    borderRadius: 8,
    backgroundColor: 'rgba(192, 57, 43, 0.08)',
  },
  stampText: {
    color: '#C0392B',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 32,
  },
  bottomMessage: {
    fontSize: 15,
    color: '#172F28',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 8,
    lineHeight: 20,
    marginTop: 4,
  },
  spinAgainBtn: {
    marginTop: 14,
    alignSelf: 'stretch',
    backgroundColor: '#0B5B45',
    borderWidth: 2,
    borderColor: '#063E31',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 6px 14px rgba(11,91,69,0.4), inset 0 1px 0 rgba(255,255,255,0.18)' } as any)
      : {}),
  },
  spinAgainBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
});
