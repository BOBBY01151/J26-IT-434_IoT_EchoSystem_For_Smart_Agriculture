import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../constants/theme';

interface FarmSelectorProps {
  selectedName: string;
  onPress?: () => void;
}

export default function FarmSelector({
  selectedName,
  onPress,
}: FarmSelectorProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Selected greenhouse: ${selectedName}`}
    >
      <Ionicons name="business-outline" size={13} color={Colors.secondaryText} />
      <Text style={styles.text} numberOfLines={1}>
        {selectedName}
      </Text>
      <Ionicons name="chevron-down" size={12} color={Colors.mutedText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    maxWidth: 180,
  },
  text: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.medium,
    color: Colors.mainText,
    flexShrink: 1,
  },
});
