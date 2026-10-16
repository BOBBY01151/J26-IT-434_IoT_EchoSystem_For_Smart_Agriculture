import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockFarm, mockGreenhouse, mockDevice } from '../../data/mockFarm';
import { mockSensorReadings } from '../../data/mockSensors';

export default function FarmScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Farm & Greenhouse</Text>
          <Text style={styles.pageSubtitle}>Facility profile & edge hardware nodes</Text>
        </View>
        <StatusBadge label="Demo" variant="demo" />
      </View>

      {/* 1. Farm Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Farm Profile</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Farm Name</Text>
            <Text style={styles.itemValue}>{mockFarm.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Location</Text>
            <Text style={styles.itemValue}>{mockFarm.location}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Total Facility Area</Text>
            <Text style={styles.itemValue}>{mockFarm.totalArea}</Text>
          </View>
        </View>
      </View>

      {/* 2. Greenhouse Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Greenhouse Unit</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Structure</Text>
            <Text style={styles.itemValue}>{mockGreenhouse.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Crop Monitored</Text>
            <Text style={styles.itemValue}>{mockGreenhouse.crop}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Active Growth Stage</Text>
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>{mockGreenhouse.growthStage}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Zone Identifier</Text>
            <Text style={styles.codeText}>{mockGreenhouse.zoneId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Floor Footprint</Text>
            <Text style={styles.itemValue}>{mockGreenhouse.area}</Text>
          </View>
        </View>
      </View>

      {/* 3. Edge Node Hardware Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Edge Hardware Node</Text>
          <StatusBadge label="Simulated" variant="info" />
        </View>

        <View style={styles.card}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Microcontroller</Text>
            <Text style={styles.itemValue}>{mockDevice.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Coverage Zone</Text>
            <Text style={styles.itemValue}>{mockDevice.zone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Hardware Link</Text>
            <View style={styles.hardwareBadge}>
              <View style={styles.hardwareDot} />
              <Text style={styles.hardwareBadgeText}>Demo Mode</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Inference Architecture</Text>
            <Text style={styles.itemValue}>{mockDevice.inferenceMode}</Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={styles.warningCardText}>
            Physical ESP32 edge telemetry is simulated in this evaluation build. No live wireless radio or sensor bus is active.
          </Text>
        </View>
      </View>

      {/* 4. Sensor Configuration Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Configured Sensor Channels</Text>
        <View style={styles.card}>
          {mockSensorReadings.map((sensor, idx) => (
            <View
              key={sensor.id}
              style={[
                styles.sensorConfigRow,
                idx < mockSensorReadings.length - 1 && styles.divider,
              ]}
            >
              <View style={styles.sensorIconWrap}>
                <Ionicons name={sensor.iconName as any} size={16} color={Colors.primaryGreen} />
              </View>
              <View style={styles.sensorInfo}>
                <Text style={styles.sensorLabel}>{sensor.label}</Text>
                <Text style={styles.sensorChannel}>Channel {idx + 1} • Standard telemetry</Text>
              </View>
              <Text style={styles.sensorUnitBadge}>{sensor.unit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Frontend Prototype Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <View>
              <Text style={styles.itemLabel}>In-App Notifications</Text>
              <Text style={styles.itemSublabel}>Show badge count and simulated alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryGreen }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <View>
              <Text style={styles.itemLabel}>Temperature Display Unit</Text>
              <Text style={styles.itemSublabel}>Preferred measurement format</Text>
            </View>
            <View style={styles.unitToggleGroup}>
              <TouchableOpacity
                style={[styles.unitBtn, tempUnit === 'C' && styles.unitBtnActive]}
                onPress={() => setTempUnit('C')}
              >
                <Text style={[styles.unitBtnText, tempUnit === 'C' && styles.unitBtnTextActive]}>
                  °C
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, tempUnit === 'F' && styles.unitBtnActive]}
                onPress={() => setTempUnit('F')}
              >
                <Text style={[styles.unitBtnText, tempUnit === 'F' && styles.unitBtnTextActive]}>
                  °F
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 6. System & University Project Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>System Information</Text>
        <View style={styles.card}>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>App Version</Text>
            <Text style={styles.itemValue}>1.0.0 (Expo Router)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Research Project</Text>
            <Text style={styles.itemValue}>SLIIT Final Year Project</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Architecture</Text>
            <Text style={styles.itemValue}>Edge-Native Closed-Loop IoT</Text>
          </View>
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
  },
  sectionHeading: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    marginBottom: Spacing.sm + 2,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.base,
    ...Shadow.card,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  itemLabel: {
    fontSize: FontSize.body,
    color: Colors.secondaryText,
  },
  itemSublabel: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    marginTop: 2,
  },
  itemValue: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: Colors.mainText,
    maxWidth: '55%',
    textAlign: 'right',
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.darkGreen,
    backgroundColor: '#EDF5EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stageBadge: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  hardwareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  hardwareDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F60AF',
  },
  hardwareBadgeText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#4F60AF',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  warningCard: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    backgroundColor: '#EBF3FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#D4E3FA',
  },
  warningCardText: {
    flex: 1,
    fontSize: FontSize.secondary,
    color: '#264B7A',
    lineHeight: 18,
  },
  sensorConfigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.md,
  },
  sensorIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorInfo: {
    flex: 1,
  },
  sensorLabel: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  sensorChannel: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 1,
  },
  sensorUnitBadge: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
    backgroundColor: '#F3F6F3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F0F3F0',
    borderRadius: Radius.sm,
    padding: 3,
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: Colors.cardBackground,
    ...Shadow.card,
  },
  unitBtnText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  unitBtnTextActive: {
    color: Colors.primaryGreen,
  },
});
