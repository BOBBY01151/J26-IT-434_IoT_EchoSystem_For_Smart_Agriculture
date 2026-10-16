import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../constants/theme';

interface StatusBadgeProps {
  label: string;
  variant?: 'demo' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  style?: ViewStyle;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  demo: { bg: '#EEF2FF', text: '#4F60AF' },
  success: { bg: '#E8F7ED', text: Colors.success },
  warning: { bg: '#FEF3E2', text: Colors.warning },
  danger: { bg: '#FCEAEA', text: Colors.danger },
  info: { bg: '#E8F0FC', text: Colors.info },
  muted: { bg: Colors.lightGreen, text: Colors.secondaryText },
};

export default function StatusBadge({ label, variant = 'muted', style }: StatusBadgeProps) {
  const { bg, text } = variantStyles[variant] ?? variantStyles.muted;
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
});
