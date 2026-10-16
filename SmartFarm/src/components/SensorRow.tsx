import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../constants/theme';
import type { SensorReading } from '../types/sensor';

interface SensorRowProps {
  sensor: SensorReading;
  showBorder?: boolean;
}

export default function SensorRow({ sensor, showBorder = true }: SensorRowProps) {
  const statusColor =
    sensor.status === 'danger'
      ? Colors.danger
      : sensor.status === 'warning'
      ? Colors.warning
      : Colors.primaryGreen;

  return (
    <View style={[styles.row, showBorder && styles.border]}>
      <View style={styles.iconWrap}>
        <Ionicons name={sensor.iconName as any} size={16} color={Colors.primaryGreen} />
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{sensor.label}</Text>
        <Text style={styles.desc}>{sensor.description}</Text>
      </View>
      <Text style={[styles.value, { color: statusColor }]}>
        {sensor.value} <Text style={styles.unit}>{sensor.unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  desc: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 1,
  },
  value: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  unit: {
    fontSize: 11,
    fontWeight: FontWeight.regular,
    color: Colors.mutedText,
  },
});
