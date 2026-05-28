import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSizes, Radii, Spacing } from '@/constants/theme';

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'treats', label: 'Treats' },
  { key: 'sip', label: 'Sip' },
  { key: 'favorites', label: 'Favorites' },
] as const;

export type Category = typeof CATEGORIES[number]['key'];

interface Props {
  active: Category;
  onChange: (cat: Category) => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat.key === active;
        return (
          <Pressable
            key={cat.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(cat.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
