import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRestaurantContext } from '@/context/RestaurantContext';
import { RestaurantCard } from '@/components/RestaurantCard';
import { CATEGORIES, type Category } from '@/components/CategoryFilter';
import { Colors, FontSizes, Radii, Spacing } from '@/constants/theme';

export default function ListScreen() {
  const router = useRouter();
  const { restaurants, spinPool, favoriteIds, isFavorite, toggleFavorite, toggleSessionExclusion, resetSession } =
    useRestaurantContext();
  const [query, setQuery] = useState('');

  // Receive the active category from the home screen so the list stays in sync.
  const { category } = useLocalSearchParams<{ category?: string }>();
  const activeCategory: Category = CATEGORIES.some((c) => c.key === category)
    ? (category as Category)
    : 'all';
  const activeLabel = CATEGORIES.find((c) => c.key === activeCategory)?.label ?? 'All';

  const visible = useMemo(() => {
    // Start with all active restaurants sorted alphabetically.
    let base = restaurants
      .filter((r) => r.active)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Apply the same strict category filter as the machine:
    // only show restaurants explicitly tagged with this meal period.
    if (activeCategory === 'favorites') {
      base = base.filter((r) => favoriteIds.includes(r.id));
    } else if (activeCategory !== 'all') {
      base = base.filter((r) => r.categories?.includes(activeCategory));
    }

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((r) => r.name.toLowerCase().includes(q));
  }, [restaurants, query, activeCategory, favoriteIds]);

  // Count of spin-eligible restaurants for this category (matches the machine).
  const categorySpinCount = useMemo(() => {
    if (activeCategory === 'all') return spinPool.length;
    if (activeCategory === 'favorites') {
      return spinPool.filter((r) => favoriteIds.includes(r.id)).length;
    }
    return spinPool.filter((r) => r.categories?.includes(activeCategory)).length;
  }, [spinPool, activeCategory, favoriteIds]);

  const excludedCount = visible.filter((r) => r.session_excluded).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <Text style={styles.kicker}>Visit Celebration Food & Drink</Text>
          <Text style={styles.title}>
            {activeCategory === 'all' ? 'All restaurants' : `${activeLabel} restaurants`}
          </Text>
          <TextInput
            style={styles.search}
            placeholder="Search restaurants…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {categorySpinCount} in play · {excludedCount} excluded this session
          </Text>
          {excludedCount > 0 && (
            <Pressable onPress={resetSession} hitSlop={8}>
              <Text style={styles.resetText}>Reset all</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={visible}
          keyExtractor={(r) => String(r.id)}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onToggle={toggleSessionExclusion}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={toggleFavorite}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeCategory === 'favorites'
                ? 'Heart a few restaurants to build your Favorites list.'
                : 'No restaurants match your search.'}
            </Text>
          }
        />

        <Pressable
          style={styles.doneButton}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Text style={styles.doneText}>Done — spin with {categorySpinCount}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  searchRow: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  kicker: {
    color: Colors.primary,
    fontSize: FontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSizes.xl,
    fontWeight: '800',
  },
  search: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  statusText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  resetText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  list: {
    paddingBottom: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: FontSizes.md,
    marginTop: Spacing.xl,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
});
