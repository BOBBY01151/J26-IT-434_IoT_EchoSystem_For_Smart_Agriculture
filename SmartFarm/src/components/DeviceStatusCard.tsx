import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';
import StatusBadge from './StatusBadge';
import type { DeviceInfo } from '../types/farm';

interface DeviceStatusCardProps {
  device: DeviceInfo;
}

export default function DeviceStatusCard({ device }: DeviceStatusCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="hardware-chip-outline" size={20} color={Colors.primaryGreen} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.zone}>{device.zone}</Text>
        </View>
        <StatusBadge label="Demo" variant="demo" />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Inference mode</Text>
          <Text style={styles.infoValue}>{device.inferenceMode}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last update</Text>
          <Text style={styles.infoValue}>{device.lastUpdate}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => router.push('/(tabs)/farm')}
        accessibilityRole="button"
        accessibilityLabel="View device details"
      >
        <Text style={styles.linkText}>View device details</Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  deviceName: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  zone: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.mutedText,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  linkText: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
});
