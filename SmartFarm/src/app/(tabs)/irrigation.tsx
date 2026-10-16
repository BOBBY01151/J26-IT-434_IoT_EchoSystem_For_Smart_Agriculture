import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import SensorRow from '../../components/SensorRow';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockIrrigationSummary, mockModelInfo, mockIrrigationHistory } from '../../data/mockIrrigation';
import { mockSensorReadings } from '../../data/mockSensors';

export default function IrrigationScreen() {
  return (
    <ScreenContainer>
      {/* Page Title & Context */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Irrigation</Text>
          <Text style={styles.pageSubtitle}>Micro-dosing & FAO-56 ETo tracking</Text>
        </View>
        <StatusBadge label="Simulated" variant="info" />
      </View>

      {/* 1. Current Water Allocation Summary Card */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="water" size={22} color={Colors.info} />
            </View>
            <View style={styles.summaryTitleGroup}>
              <Text style={styles.summaryTitle}>Today's Water Balance</Text>
              <Text style={styles.summarySubtitle}>Zone A • Automated micro-dosing</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>
                {mockIrrigationSummary.predictedVolume.toFixed(1)} <Text style={styles.metricUnit}>L</Text>
              </Text>
              <Text style={styles.metricName}>Predicted dose</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>
                {mockIrrigationSummary.deliveredVolume.toFixed(2)} <Text style={styles.metricUnit}>L</Text>
              </Text>
              <Text style={styles.metricName}>Simulated delivered</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricCol}>
              <Text style={styles.metricVal}>
                {mockIrrigationSummary.dailyTotal.toFixed(1)} <Text style={styles.metricUnit}>L</Text>
              </Text>
              <Text style={styles.metricName}>Today total</Text>
            </View>
          </View>

          <View style={styles.pumpStatusBar}>
            <View style={styles.pumpDot} />
            <Text style={styles.pumpStatusText}>
              Pump state: <Text style={styles.pumpStateBold}>Simulated idle</Text> (Zero active flow)
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Model Information Card */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeading}>Model Architecture</Text>
          <StatusBadge label="Edge AI Concept" variant="demo" />
        </View>

        <View style={styles.card}>
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Model Type</Text>
            <Text style={styles.modelValue}>{mockModelInfo.modelType}</Text>
          </View>
          <View style={styles.innerDivider} />
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Execution Concept</Text>
            <Text style={styles.modelValue}>{mockModelInfo.executionConcept}</Text>
          </View>
          <View style={styles.innerDivider} />
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Input Features</Text>
            <Text style={styles.modelValue}>{mockModelInfo.inputCount} environmental parameters</Text>
          </View>
          <View style={styles.innerDivider} />
          <View style={styles.modelRow}>
            <Text style={styles.modelLabel}>Runtime Status</Text>
            <Text style={styles.modelValue}>{mockModelInfo.currentStatus}</Text>
          </View>
        </View>
        <Text style={styles.disclaimerText}>
          * Note: Offline TinyML inference will be compiled for the ESP32 in a future hardware phase.
        </Text>
      </View>

      {/* 3. Seven Environmental Inputs */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeading}>Active Feature Readings</Text>
          <Text style={styles.featureCount}>7 of 7 active</Text>
        </View>

        <View style={styles.card}>
          {mockSensorReadings.map((sensor, index) => (
            <SensorRow
              key={sensor.id}
              sensor={sensor}
              showBorder={index < mockSensorReadings.length - 1}
            />
          ))}
        </View>
      </View>

      {/* 4. Irrigation History */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeading}>Simulated Event Log</Text>
          <StatusBadge label="Demo log" variant="muted" />
        </View>

        <View style={styles.card}>
          {mockIrrigationHistory.map((event, idx) => (
            <View
              key={event.id}
              style={[
                styles.historyRow,
                idx < mockIrrigationHistory.length - 1 && styles.historyBorder,
              ]}
            >
              <View style={styles.historyTimelineIcon}>
                <Ionicons name="water-outline" size={16} color={Colors.primaryGreen} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{event.note}</Text>
                <Text style={styles.historyTimestamp}>
                  {event.timestamp} • {event.duration} min cycle
                </Text>
              </View>
              <View style={styles.historyVolumeBadge}>
                <Text style={styles.historyVolumeText}>+{event.volume.toFixed(2)} L</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Disabled Hardware Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Actuator Controls</Text>
        <View style={styles.disabledControlCard}>
          <View style={styles.disabledHeader}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.mutedText} />
            <Text style={styles.disabledTitle}>Hardware Integration Required</Text>
          </View>
          <Text style={styles.disabledDesc}>
            Direct solenoid valve and water pump relays are managed directly by the ESP32 fail-safe closed loop. Manual overrides are disabled during prototype demo mode to protect greenhouse crops.
          </Text>
          <TouchableOpacity
            style={styles.disabledBtn}
            disabled={true}
            accessibilityRole="button"
            accessibilityLabel="Pump control disabled"
          >
            <Ionicons name="power-outline" size={16} color={Colors.mutedText} />
            <Text style={styles.disabledBtnText}>Manual Override (Disabled)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  pageTitle: {
    fontSize: FontSize.screenHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: FontSize.body,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
  },
  sectionHeading: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  featureCount: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    ...Shadow.card,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  summaryIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitleGroup: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  summarySubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
    marginBottom: Spacing.md,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: FontWeight.regular,
    color: Colors.mutedText,
  },
  metricName: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 3,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  pumpStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.xs,
  },
  pumpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondaryText,
  },
  pumpStatusText: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
  },
  pumpStateBold: {
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    ...Shadow.card,
  },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
  },
  modelLabel: {
    fontSize: FontSize.body,
    color: Colors.secondaryText,
  },
  modelValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.mainText,
    maxWidth: '55%',
    textAlign: 'right',
  },
  innerDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: Spacing.xs + 2,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  historyBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyTimelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  historyTimestamp: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    marginTop: 2,
  },
  historyVolumeBadge: {
    backgroundColor: '#E8F4EA',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  historyVolumeText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  disabledControlCard: {
    backgroundColor: '#FAFAF8',
    borderRadius: Radius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  disabledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  disabledTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  disabledDesc: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    lineHeight: 18,
    marginBottom: Spacing.base,
  },
  disabledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EAEAEA',
    height: 48,
    borderRadius: Radius.md,
  },
  disabledBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedText,
  },
});
