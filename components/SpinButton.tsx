import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, FontSizes, Radii, Shadow, Spacing } from '@/constants/theme';

interface Props {
  onPress: () => void;
  spinning: boolean;
  disabled?: boolean;
}

export function SpinButton({ onPress, spinning, disabled }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        (pressed || disabled) && styles.pressed,
      ]}
      onPress={onPress}
      disabled={spinning || disabled}
      accessibilityRole="button"
      accessibilityLabel="Spin the wheel"
    >
      {spinning ? (
        <ActivityIndicator color={Colors.textInverse} size="small" />
      ) : (
        <Text style={styles.label}>Spin</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.gold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    ...Shadow.button,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  label: {
    color: Colors.primaryDark,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
