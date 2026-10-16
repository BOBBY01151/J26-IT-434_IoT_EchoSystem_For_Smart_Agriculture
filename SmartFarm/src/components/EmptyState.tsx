import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

interface EmptyStateProps {
  iconName?: string;
  title: string;
  body?: string;
  style?: ViewStyle;
}

export default function EmptyState({
  iconName = 'leaf-outline',
  title,
  body,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={iconName as any} size={44} color={Colors.border} />
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  body: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});
