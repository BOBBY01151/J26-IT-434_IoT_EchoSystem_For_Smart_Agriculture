import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';
import type { SensorReading } from '../types/sensor';

interface MetricCardProps {
  sensor: SensorReading;
  style?: ViewStyle;
}

export default function MetricCard({ sensor, style }: MetricCardProps) {
  const statusColor =
    sensor.status === 'danger'
      ? Colors.danger
      : sensor.status === 'warning'
      ? Colors.warning
      : Colors.primaryGreen;

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: Colors.lightGreen }]}>
        <Ionicons
          name={sensor.iconName as any}
          size={18}
          color={Colors.primaryGreen}
        />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {sensor.label}
      </Text>
      <Text style={[styles.value, { color: statusColor }]}>
        {sensor.value}
        <Text style={styles.unit}> {sensor.unit}</Text>
      </Text>
      <Text style={styles.desc} numberOfLines={2}>
        {sensor.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    flex: 1,
    ...Shadow.card,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginBottom: 2,
  },
  unit: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.regular,
    color: Colors.mutedText,
  },
  desc: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 2,
  },
});
