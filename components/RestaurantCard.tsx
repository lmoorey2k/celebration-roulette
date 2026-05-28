import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { Restaurant } from '@/hooks/useRestaurants';
import { Colors, FontSizes, Radii, Shadow, Spacing } from '@/constants/theme';

interface Props {
  restaurant: Restaurant;
  onToggle: (id: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export function RestaurantCard({ restaurant, onToggle, isFavorite, onToggleFavorite }: Props) {
  const excluded = restaurant.session_excluded;

  return (
    <View style={[styles.card, excluded && styles.cardExcluded]}>
      <View style={styles.info}>
        <Text
          style={[styles.name, excluded && styles.nameExcluded]}
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>
        <Text
          style={[styles.address, excluded && styles.addressExcluded]}
          numberOfLines={2}
        >
          {restaurant.address}
        </Text>
      </View>
      <Pressable
        style={[styles.favorite, isFavorite && styles.favoriteActive]}
        onPress={() => onToggleFavorite(restaurant.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: isFavorite }}
        accessibilityLabel={`${isFavorite ? 'Remove' : 'Add'} ${restaurant.name} ${isFavorite ? 'from' : 'to'} favorites`}
        hitSlop={8}
      >
        <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>
          {isFavorite ? '♥' : '♡'}
        </Text>
      </Pressable>
      <Pressable
        style={[styles.toggle, excluded && styles.toggleExcluded]}
        onPress={() => onToggle(restaurant.id)}
        accessibilityRole="switch"
        accessibilityState={{ checked: !excluded }}
        accessibilityLabel={`${excluded ? 'Include' : 'Exclude'} ${restaurant.name}`}
        hitSlop={8}
      >
        <Text style={[styles.toggleLabel, excluded && styles.toggleLabelExcluded]}>
          {excluded ? 'Excluded' : 'In'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.card,
  },
  cardExcluded: {
    backgroundColor: Colors.backgroundAlt,
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  nameExcluded: {
    color: Colors.textMuted,
  },
  address: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  addressExcluded: {
    color: Colors.excluded,
  },
  favorite: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  favoriteActive: {
    backgroundColor: '#FFF3F5',
    borderColor: '#D84A5F',
  },
  favoriteText: {
    color: Colors.textMuted,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  favoriteTextActive: {
    color: '#D84A5F',
  },
  toggle: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
    paddingVertical: 5,
    paddingHorizontal: Spacing.md,
  },
  toggleExcluded: {
    backgroundColor: Colors.excluded,
  },
  toggleLabel: {
    color: Colors.textInverse,
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0,
  },
  toggleLabelExcluded: {
    color: Colors.textMuted,
  },
});
