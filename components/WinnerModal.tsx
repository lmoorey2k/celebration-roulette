/**
 * WinnerModal — slides up from the bottom over the slot machine.
 * The machine stays fully visible above it so players can see their result.
 */
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from 'react-native';
import type { Restaurant } from '@/hooks/useRestaurants';
import { openListing, openWebsite } from '@/utils/maps';
import { Colors, FontSizes, Radii, Spacing } from '@/constants/theme';

interface Props {
  winner: Restaurant;
  onSpinAgain: () => void;
}

export function WinnerModal({ winner, onSpinAgain }: Props) {
  const slideAnim = useRef(new Animated.Value(300)).current; // starts 300 px below
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide up + fade in together
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 11,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const handleLetsGo  = () => openListing(winner.name, winner.address);
  const handleWebsite = () => winner.website_url && openWebsite(winner.website_url);

  return (
    // Transparent full-screen anchor — sits on top of everything but only
    // the card at the bottom is visually opaque.
    <Animated.View
      style={[styles.anchor, { opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Winner eyebrow */}
        <Text style={styles.eyebrow}>Your Celebration pick</Text>

        {/* Restaurant logo + name row */}
        <View style={styles.topRow}>
          {winner.logo_url ? (
            <Image
              source={{ uri: winner.logo_url }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoEmoji}>🍽️</Text>
            </View>
          )}
          <View style={styles.nameBlock}>
            <Text style={styles.name} numberOfLines={2}>{winner.name}</Text>
            <Text style={styles.address} numberOfLines={2}>{winner.address}</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleLetsGo}
          >
            <Text style={styles.primaryBtnText}>Let's Go</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={onSpinAgain}
          >
            <Text style={styles.secondaryBtnText}>Spin Again</Text>
          </Pressable>
        </View>

        {winner.website_url ? (
          <Pressable onPress={handleWebsite} style={styles.websiteLink}>
            <Text style={styles.websiteLinkText}>Restaurant's website</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Full-screen transparent anchor so the card can be positioned at the bottom
  anchor: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 60,
    // No background — machine stays fully visible
  },

  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 32,
    gap: Spacing.md,
    // Heavy shadow so card feels lifted above the machine
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 24,
    borderTopWidth: 3,
    borderTopColor: Colors.primary,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 4,
  },

  eyebrow: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    letterSpacing: 0,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radii.sm,
    padding: Spacing.sm,
  },
  logo: {
    width: 72,
    height: 56,
  },
  logoPlaceholder: {
    width: 72,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 32 },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  address: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDark,
  },
  primaryBtnText: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: Colors.textInverse,
    letterSpacing: 0,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radii.sm,
    paddingVertical: 13,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.primary,
  },

  websiteLink: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  websiteLinkText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
