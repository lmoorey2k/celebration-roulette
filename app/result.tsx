import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRestaurantContext } from '@/context/RestaurantContext';
import { pickWinner } from '@/utils/spin';
import { openListing, openWebsite } from '@/utils/maps';
import { Colors, FontSizes, Radii, Shadow, Spacing } from '@/constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurants, spinPool, isFavorite, toggleFavorite } = useRestaurantContext();

  const restaurant = restaurants.find((r) => r.id === Number(id));

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleLetsGo = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openListing(restaurant.name, restaurant.address);
  };

  const handleSpinAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = pickWinner(spinPool);
    if (next) {
      router.replace({ pathname: '/result', params: { id: String(next.id) } });
    } else {
      router.back();
    }
  };

  const handleMoreInfo = () => {
    if (restaurant.website_url) {
      openWebsite(restaurant.website_url);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        <View style={styles.eyebrow}>
          <Text style={styles.eyebrowText}>Your Celebration pick is…</Text>
        </View>

        <View style={styles.card}>
          <Pressable
            onPress={() => toggleFavorite(restaurant.id)}
            style={[styles.favoriteButton, isFavorite(restaurant.id) && styles.favoriteButtonActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: isFavorite(restaurant.id) }}
            accessibilityLabel={`${isFavorite(restaurant.id) ? 'Remove' : 'Add'} ${restaurant.name} ${isFavorite(restaurant.id) ? 'from' : 'to'} favorites`}
            hitSlop={8}
          >
            <Text style={[styles.favoriteIcon, isFavorite(restaurant.id) && styles.favoriteIconActive]}>
              {isFavorite(restaurant.id) ? '♥' : '♡'}
            </Text>
          </Pressable>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.address}>{restaurant.address}</Text>
        </View>

        <View style={styles.primaryAction}>
          <Pressable
            style={({ pressed }) => [styles.letsGoButton, pressed && styles.pressed]}
            onPress={handleLetsGo}
            accessibilityRole="button"
            accessibilityLabel={`Get directions to ${restaurant.name}`}
          >
            <Text style={styles.letsGoText}>Let's go</Text>
          </Pressable>
        </View>

        <View style={styles.secondaryActions}>
          <Pressable
            style={({ pressed }) => [styles.spinAgainButton, pressed && styles.pressed]}
            onPress={handleSpinAgain}
            accessibilityRole="button"
          >
            <Text style={styles.spinAgainText}>Spin again</Text>
          </Pressable>

          {restaurant.website_url ? (
            <Pressable
              style={styles.moreInfoLink}
              onPress={handleMoreInfo}
              accessibilityRole="link"
            >
              <Text style={styles.moreInfoText}>More info</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.primaryDark,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  errorText: {
    color: Colors.textInverse,
    fontSize: FontSizes.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    color: Colors.gold,
    fontSize: FontSizes.md,
  },
  eyebrow: {
    alignItems: 'center',
  },
  eyebrowText: {
    fontSize: FontSizes.md,
    color: Colors.goldLight,
    fontWeight: '500',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  favoriteButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF3F5',
    borderColor: '#D84A5F',
  },
  favoriteIcon: {
    color: Colors.textMuted,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 28,
  },
  favoriteIconActive: {
    color: '#D84A5F',
  },
  restaurantName: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 34,
  },
  address: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryAction: {
    width: '100%',
    alignItems: 'center',
  },
  letsGoButton: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.full,
    width: '100%',
    alignItems: 'center',
    ...Shadow.button,
  },
  letsGoText: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: Colors.primaryDark,
    letterSpacing: 0,
  },
  secondaryActions: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  spinAgainButton: {
    borderWidth: 2,
    borderColor: Colors.goldLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.full,
    width: '100%',
    alignItems: 'center',
  },
  spinAgainText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.goldLight,
  },
  moreInfoLink: {
    paddingVertical: Spacing.sm,
  },
  moreInfoText: {
    fontSize: FontSizes.sm,
    color: Colors.goldLight,
    textDecorationLine: 'underline',
    opacity: 0.75,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
});
