import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export default function SectionHeader({ title, subtitle, style, titleStyle }: SectionHeaderProps) {
  return (
    <>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    marginBottom: Spacing.sm,
  },
});
