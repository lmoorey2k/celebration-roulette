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

export default function HomeScreen() {
  const router   = useRouter();
  const { spinPool } = useRestaurantContext();
  const [spinState, setSpinState] = useState<SpinState>('idle');
  const [winner,    setWinner]    = useState<Restaurant | null>(null);
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
    isSunday() &&
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
    if (isSunday() && !sundayFirstSpinDone) {
      setSundayFirstSpinDone(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [sundayFirstSpinDone]);

  const handleSpinComplete = useCallback((restaurant: Restaurant) => {
    setWinner(restaurant);
    setSpinState('result');
    // Sunday Chick-fil-A Easter egg: play the sad trombone instead of the
    // celebration sound, and skip confetti so the "closed" message lands clearly.
    const isClosedSunday = restaurant.id === CHICK_FIL_A_ID && isSunday();
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
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://visitcelebration.org/wp-content/uploads/2025/09/VISIT-CELEBRATION-LOGO-green.png' }}
            style={styles.headerLogo}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.machineSection}>
          <View style={styles.machineIntro}>
            <Text style={styles.machineTitle}>Where should we dine?</Text>
            <Text style={styles.machineHint}>Choose a category and let the machine make the pick.</Text>
          </View>

          <SlotMachine
            ref={slotRef}
            pool={filteredPool}
            spinning={spinState === 'spinning'}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            shouldWinChickFilA={shouldWinChickFilA}
          />
        </View>

        {/* Winner card slides in below the machine — reels stay fully visible */}
        {spinState === 'result' && winner && (
          <WinnerCard
            winner={winner}
            onSpinAgain={handleSpinAgain}
            isClosedSunday={winner.id === CHICK_FIL_A_ID && isSunday()}
          />
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
    </SafeAreaView>
  );
}

// ─── Winner card ──────────────────────────────────────────────────────────────

function WinnerCard({ winner, onSpinAgain, isClosedSunday = false }: { winner: Restaurant; onSpinAgain: () => void; isClosedSunday?: boolean }) {
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
      <View style={[wStyles.card, isClosedSunday && wStyles.cardClosed]}>
        {/* Logo + info row */}
        <View style={wStyles.header}>
          <View style={wStyles.logoWrap}>
            {winner.logo_url ? (
              <Image source={{ uri: winner.logo_url }} style={[wStyles.logo, isClosedSunday && wStyles.logoDim]} resizeMode="contain" accessibilityIgnoresInvertColors />
            ) : (
              <View style={wStyles.logoFallback}>
                <Text style={wStyles.logoFallbackText}>{winner.name.slice(0, 1)}</Text>
              </View>
            )}
            {/* CLOSED stamp overlay — only renders on Sunday Chick-fil-A win */}
            {isClosedSunday && (
              <View style={wStyles.closedStamp} pointerEvents="none">
                <Text style={wStyles.closedStampText}>CLOSED{'\n'}SUNDAY</Text>
              </View>
            )}
          </View>
          <View style={wStyles.info}>
            <Text style={wStyles.eyebrow}>
              {isClosedSunday ? '🐔 You won...!' : 'Your Celebration pick'}
            </Text>
            <Text style={wStyles.name} numberOfLines={2}>{winner.name}</Text>
            {isClosedSunday ? (
              <Text style={wStyles.sundayMessage}>
                ...but it's closed on Sundays 😅{'\n'}Give it another spin!
              </Text>
            ) : (
              <>
                <Text style={wStyles.address} numberOfLines={2}>{winner.address}</Text>
                {winner.phone ? (
                  <Pressable onPress={handlePhone} accessibilityRole="link">
                    <Text style={wStyles.phone}>{winner.phone}</Text>
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        </View>

        {/* Action rows — hidden when Chick-fil-A is closed (Sunday). */}
        {!isClosedSunday && (
          <>
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
          </>
        )}
      </View>

      {/* Spin again — beneath the card, understated */}
      <Pressable
        onPress={onSpinAgain}
        style={({ pressed }) => [wStyles.spinAgain, pressed && wStyles.spinAgainPressed]}
        accessibilityRole="button"
      >
        <Text style={wStyles.spinAgainText}>↺  Spin again</Text>
      </Pressable>
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
  hero: { width: '100%', maxWidth: 760, paddingHorizontal: Spacing.lg, paddingTop: 2, alignItems: 'center' },
  headerLogo: { width: 168, height: 66 },
  machineSection: { width: '100%', maxWidth: 760, alignItems: 'center', gap: Spacing.sm },
  machineIntro: { width: '100%', paddingHorizontal: Spacing.lg, gap: 6, alignItems: 'center' },
  machineTitle: { color: Colors.textPrimary, fontSize: FontSizes.xl, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  machineHint: { color: Colors.textSecondary, fontSize: FontSizes.md, lineHeight: 22, textAlign: 'center', maxWidth: 460 },
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
  // Closed-on-Sunday variant — softer card with a red accent border.
  cardClosed: {
    borderColor: '#D85C5C',
    borderWidth: 2,
    backgroundColor: '#FFF7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  // Wraps the logo so the CLOSED stamp can absolutely overlay it.
  logoWrap: {
    width: 88, height: 68, flexShrink: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 88, height: 68, flexShrink: 0 },
  // Dimmed logo behind the CLOSED stamp.
  logoDim: { opacity: 0.45 },
  // Diagonal red "CLOSED SUNDAY" rubber stamp over the Chick-fil-A logo.
  closedStamp: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 2.5,
    borderColor: '#C0392B',
    borderRadius: 4,
    backgroundColor: 'rgba(192, 57, 43, 0.08)',
    transform: [{ rotate: '-14deg' }],
  },
  closedStampText: {
    color: '#C0392B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 12,
  },
  // The playful "but it's closed on Sundays" message line.
  sundayMessage: {
    color: '#7A3B30',
    fontSize: FontSizes.sm,
    lineHeight: 20,
    fontWeight: '600',
    marginTop: 4,
  },
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
  spinAgain: {
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  spinAgainPressed: { opacity: 0.6 },
  spinAgainText: {
    color: Colors.textSecondary,
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
});
