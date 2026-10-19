import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import AppHeader from '../../components/AppHeader';
import DeviceStatusCard from '../../components/DeviceStatusCard';
import SensorGrid from '../../components/SensorGrid';
import IrrigationSummaryCard from '../../components/IrrigationSummaryCard';
import SensorRow from '../../components/SensorRow';
import StatusBadge from '../../components/StatusBadge';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockDevice, mockGreenhouse } from '../../data/mockFarm';
import { mockKeyMetrics, mockSensorReadings } from '../../data/mockSensors';
import { mockIrrigationSummary } from '../../data/mockIrrigation';
import { mockFertilizerReminders } from '../../data/mockFertilizer';
import { mockNotifications } from '../../data/mockNotifications';

export default function HomeScreen() {
  const router = useRouter();

  const nextTask = mockFertilizerReminders[0];
  const recentAlert = mockNotifications.find((n) => !n.read) || mockNotifications[0];

  return (
    <ScreenContainer>
      {/* 1. Header */}
      <AppHeader
        greeting="Good morning"
        subtitle="Here's your greenhouse overview."
        greenhouseName={mockGreenhouse.name}
        unreadCount={mockNotifications.filter((n) => !n.read).length}
      />

      {/* 2. Device Connection Panel */}
      <View style={styles.section}>
        <DeviceStatusCard device={mockDevice} />
      </View>

      {/* 3. Key Metrics (4 core parameters) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Key Microclimate Metrics</Text>
          <StatusBadge label="Simulated" variant="demo" />
        </View>
        <SensorGrid sensors={mockKeyMetrics} />
      </View>

      {/* 4. Irrigation Overview Card */}
      <View style={styles.section}>
        <IrrigationSummaryCard summary={mockIrrigationSummary} />
      </View>

      {/* 5. Complete 7-Sensor Input Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Environmental Inputs</Text>
            <Text style={styles.sectionSubtitle}>7 features used for TinyML edge model</Text>
          </View>
          <StatusBadge label="Demo" variant="muted" />
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

      {/* 6. Pest & Plant Health Quick Action Banner */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.bannerCard}
          onPress={() => router.push('/(tabs)/plant-health')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Inspect pest and plant health"
        >
          <View style={styles.bannerIconWrap}>
            <Ionicons name="bug" size={24} color={Colors.primaryGreen} />
          </View>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Edge AI Pest Prediction & Health</Text>
            <Text style={styles.bannerSubtitle}>
              Live ESP32 FNN risk inference, Anomaly Gatekeeper & 24h spray lock
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={Colors.primaryGreen} />
        </TouchableOpacity>
      </View>

      {/* 7. Upcoming Fertilizer Task & Recent Notice */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/fertilizer')}>
            <Text style={styles.seeAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {nextTask && (
          <TouchableOpacity
            style={styles.scheduleCard}
            onPress={() => router.push('/(tabs)/fertilizer')}
            activeOpacity={0.7}
          >
            <View style={styles.scheduleDateBadge}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primaryGreen} />
              <Text style={styles.scheduleDateText}>{nextTask.date}</Text>
            </View>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleTitle}>{nextTask.title}</Text>
              <Text style={styles.scheduleMeta}>Flowering stage inspection</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.mutedText} />
          </TouchableOpacity>
        )}
      </View>

      {/* 8. Recent Notification Preview */}
      {recentAlert && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Latest Notice</Text>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Text style={styles.seeAllText}>All notices</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <View style={styles.alertIconWrap}>
              <Ionicons name="notifications-outline" size={18} color={Colors.info} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle} numberOfLines={1}>
                {recentAlert.title}
              </Text>
              <Text style={styles.alertBody} numberOfLines={2}>
                {recentAlert.body}
              </Text>
              <Text style={styles.alertTime}>{recentAlert.timestamp}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Demonstration footer notice */}
      <View style={styles.demoFooter}>
        <Ionicons name="information-circle-outline" size={14} color={Colors.mutedText} />
        <Text style={styles.demoFooterText}>
          SmartFarm Prototype v1.0 • Connected in Demonstration Mode
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
  },
  sectionTitle: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  sectionSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    ...Shadow.card,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#D4E8D7',
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.darkGreen,
  },
  bannerSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 16,
  },
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadow.card,
  },
  scheduleDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  scheduleDateText: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  scheduleMeta: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    marginTop: 2,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadow.card,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  alertBody: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
    lineHeight: 18,
  },
  alertTime: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 4,
  },
  demoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.base,
  },
  demoFooterText: {
    fontSize: 11,
    color: Colors.mutedText,
  },
});
