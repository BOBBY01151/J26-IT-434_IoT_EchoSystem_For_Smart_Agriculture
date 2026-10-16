import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';
import StatusBadge from './StatusBadge';
import type { IrrigationSummary } from '../types/irrigation';

interface IrrigationSummaryCardProps {
  summary: IrrigationSummary;
}

export default function IrrigationSummaryCard({ summary }: IrrigationSummaryCardProps) {
  const router = useRouter();

  const pumpColor =
    summary.pumpStatus === 'running' ? Colors.success : Colors.secondaryText;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="water" size={20} color={Colors.info} />
        </View>
        <Text style={styles.heading}>Irrigation Overview</Text>
        <StatusBadge label="Demo data" variant="info" />
      </View>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{summary.predictedVolume.toFixed(1)} L</Text>
          <Text style={styles.metricLabel}>Predicted</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{summary.deliveredVolume.toFixed(2)} L</Text>
          <Text style={styles.metricLabel}>Delivered</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{summary.dailyTotal.toFixed(1)} L</Text>
          <Text style={styles.metricLabel}>Today total</Text>
        </View>
      </View>

      {/* Pump status */}
      <View style={styles.pumpRow}>
        <Ionicons name="ellipse" size={8} color={pumpColor} />
        <Text style={[styles.pumpLabel, { color: pumpColor }]}>
          Pump: Simulated {summary.pumpStatus}
        </Text>
      </View>

      {/* Link */}
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => router.push('/(tabs)/irrigation')}
        accessibilityRole="button"
        accessibilityLabel="View irrigation details"
      >
        <Text style={styles.linkText}>View irrigation details</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.primaryGreen} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    ...Shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    flex: 1,
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 2,
  },
  separator: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
  },
  pumpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  pumpLabel: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.medium,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  linkText: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
});
