import React from 'react';
import { View, StyleSheet } from 'react-native';
import MetricCard from './MetricCard';
import type { SensorReading } from '../types/sensor';
import { Spacing } from '../constants/theme';

interface SensorGridProps {
  sensors: SensorReading[];
}

export default function SensorGrid({ sensors }: SensorGridProps) {
  // Render in rows of 2 for clean balanced grid
  const rows: SensorReading[][] = [];
  for (let i = 0; i < sensors.length; i += 2) {
    rows.push(sensors.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((sensor) => (
            <MetricCard key={sensor.id} sensor={sensor} style={styles.card} />
          ))}
          {row.length === 1 && <View style={styles.cardPlaceholder} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  card: {
    flex: 1,
  },
  cardPlaceholder: {
    flex: 1,
  },
});
