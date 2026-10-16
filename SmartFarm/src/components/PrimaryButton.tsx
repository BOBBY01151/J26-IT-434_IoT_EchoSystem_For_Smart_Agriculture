import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
}

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.label,
    variant === 'outline' && styles.outlineLabel,
    variant === 'ghost' && styles.ghostLabel,
    isDisabled && styles.disabledLabel,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.primaryGreen} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: '#fff',
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  outlineLabel: {
    color: Colors.primaryGreen,
  },
  ghostLabel: {
    color: Colors.primaryGreen,
  },
  disabledLabel: {
    color: Colors.mutedText,
  },
});
