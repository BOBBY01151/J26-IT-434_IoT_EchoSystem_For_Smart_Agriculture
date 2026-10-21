import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import AppHeader from '../../components/AppHeader';
import StatusBadge from '../../components/StatusBadge';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockDevice, mockGreenhouse, mockFarm } from '../../data/mockFarm';
import { mockSensorReadings } from '../../data/mockSensors';
import { mockIrrigationSummary } from '../../data/mockIrrigation';
import { mockFertilizerReminders } from '../../data/mockFertilizer';
import { mockNotifications } from '../../data/mockNotifications';

export default function HomeScreen() {
  const router = useRouter();

  // Mode state for farmer
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isPumpActive, setIsPumpActive] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const nextTask = mockFertilizerReminders[0];
  const recentAlert = mockNotifications.find((n) => !n.read) || mockNotifications[0];

  // Microclimate & Soil Sensor Telemetry
  const soilMoisture = mockSensorReadings.find((s) => s.id === 'soilMoisture')?.value ?? 31.4;
  const temperature = mockSensorReadings.find((s) => s.id === 'airTemperature')?.value ?? 29.2;
  const humidity = mockSensorReadings.find((s) => s.id === 'relativeHumidity')?.value ?? 68;
  const vpd = mockSensorReadings.find((s) => s.id === 'vpd')?.value ?? 1.25;
  const etO = mockSensorReadings.find((s) => s.id === 'evapotranspiration')?.value ?? 3.2;

  // Real Project Constants (SLIIT J26-IT-434)
  const cropStage = 'Flowering Stage';
  const cropKc = 1.15; // Crop coefficient for Tomato in Flowering stage
  const dailyWaterTarget = (etO * cropKc * 3.9).toFixed(1); // Target volume in Liters based on 200m² canopy
  const deliveredSoFar = mockIrrigationSummary.dailyTotal; // 12.6 L delivered
  const remainingWater = Math.max(0, Number(dailyWaterTarget) - deliveredSoFar).toFixed(1);

  // Dynamic Soil EC (Nutrient Concentration)
  const soilEC = 1.85; // mS/cm (Optimal range for Flowering Tomato: 1.5 - 2.2 mS/cm)

  // Growing Degree Days (GDD) Pest Forecast
  const cumulativeGDD = 412; // Base temp 10°C
  const pestThreshold = 540; // Whitefly emergence threshold
  const daysToThreshold = Math.round((pestThreshold - cumulativeGDD) / 21); // ~6 days

  const handleQuickWater = () => {
    if (isPumpActive) {
      setIsPumpActive(false);
      Alert.alert('Pump Stopped', 'Irrigation pump relay has been turned OFF.');
    } else {
      setIsPumpActive(true);
      Alert.alert(
        'Manual Irrigation Started',
        'Running 5-minute micro-irrigation cycle (approx 1.8 L). Will shut off automatically.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScreenContainer>
      {/* ── 1. HEADER ── */}
      <AppHeader
        greeting="Good morning, Farmer"
        subtitle="Real-time closed-loop farm telemetry & controls"
        greenhouseName={mockGreenhouse.name}
        unreadCount={unreadCount}
      />

      {/* ── 2. FARM PROFILE & GREENHOUSE STATUS ── */}
      <View style={styles.section}>
        <View style={styles.heroCard}>
          {/* Top row */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBox}>
              <Ionicons name="leaf" size={22} color={Colors.primaryGreen} />
            </View>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.heroTitle}>{mockGreenhouse.name}</Text>
              <Text style={styles.heroSubtitle}>
                {mockFarm.name} · {mockFarm.location}
              </Text>
            </View>
            {/* MQTT Live Connection Badge */}
            <View style={styles.mqttBadge}>
              <View style={styles.mqttDot} />
              <Text style={styles.mqttText}>MQTT: Online</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.heroDivider} />

          {/* Real Agronomic Details Strip */}
          <View style={styles.cropStripRow}>
            <View style={styles.cropChip}>
              <Ionicons name="nutrition" size={13} color={Colors.darkGreen} />
              <Text style={styles.cropChipText}>{mockGreenhouse.crop}</Text>
            </View>
            <View style={styles.cropChip}>
              <Ionicons name="flower-outline" size={13} color={Colors.darkGreen} />
              <Text style={styles.cropChipText}>{cropStage} (Kc: {cropKc})</Text>
            </View>
            <View style={styles.cropChip}>
              <Ionicons name="grid-outline" size={13} color={Colors.darkGreen} />
              <Text style={styles.cropChipText}>{mockGreenhouse.area}</Text>
            </View>
          </View>

          {/* Hardware & Node details */}
          <View style={styles.edgeNodeRow}>
            <Ionicons name="hardware-chip-outline" size={14} color={Colors.mutedText} />
            <Text style={styles.edgeNodeText}>
              Node: {mockDevice.name} · LoRaWAN / MQTT Telemetry
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/farm')}>
              <Text style={styles.edgeNodeLink}>Farm Hub →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── 3. CLOSED-LOOP SYSTEM INTERLOCKS (RESEARCH CORE) ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Closed-Loop Protection</Text>
            <Text style={styles.sectionSub}>Coordination Engine Fail-Safe Interlocks</Text>
          </View>
          <StatusBadge label="All Interlocks Active" variant="success" />
        </View>

        <View style={styles.interlockCard}>
          <View style={styles.interlockRow}>
            {/* Interlock 1: Spray-Irrigation Lock */}
            <View style={styles.interlockItem}>
              <View style={[styles.interlockIcon, { backgroundColor: '#EAF7EE' }]}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.primaryGreen} />
              </View>
              <View style={styles.interlockTextWrap}>
                <Text style={styles.interlockName}>Spray Lock</Text>
                <Text style={styles.interlockStatus}>Armed (Clear)</Text>
              </View>
            </View>

            {/* Interlock 2: Leaching Avoidance */}
            <View style={styles.interlockItem}>
              <View style={[styles.interlockIcon, { backgroundColor: '#EAF7EE' }]}>
                <Ionicons name="water-outline" size={16} color={Colors.primaryGreen} />
              </View>
              <View style={styles.interlockTextWrap}>
                <Text style={styles.interlockName}>Anti-Leaching</Text>
                <Text style={styles.interlockStatus}>Safe (31.4% {'<'} 85%)</Text>
              </View>
            </View>

            {/* Interlock 3: Weather Rain-Skip */}
            <View style={styles.interlockItem}>
              <View style={[styles.interlockIcon, { backgroundColor: '#EBF3FF' }]}>
                <Ionicons name="cloudy-night-outline" size={16} color={Colors.info} />
              </View>
              <View style={styles.interlockTextWrap}>
                <Text style={styles.interlockName}>Rain Skip</Text>
                <Text style={styles.interlockStatus}>Standby (0% Rain)</Text>
              </View>
            </View>
          </View>

          <View style={styles.interlockNoteBar}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.primaryGreen} />
            <Text style={styles.interlockNoteText}>
              Autonomous State Machine prevents chemical runoff & over-watering conflicts.
            </Text>
          </View>
        </View>
      </View>

      {/* ── 4. LIVE SOIL & MICROCLIMATE SENSORS ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Field Soil & Climate</Text>
            <Text style={styles.sectionSub}>Calibrated Sensor Readings (ESP32 Node)</Text>
          </View>
          <StatusBadge label="7 Sensors Online" variant="success" />
        </View>

        <View style={styles.metricGrid}>
          {/* Soil Moisture */}
          <View style={[styles.metricCard, { borderColor: '#C3E8CC' }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EAF7EE' }]}>
                <Ionicons name="water" size={18} color={Colors.primaryGreen} />
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#EAF7EE' }]}>
                <Text style={[styles.statusPillText, { color: Colors.primaryGreen }]}>Optimal</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {soilMoisture}<Text style={styles.metricUnit}> %</Text>
            </Text>
            <Text style={styles.metricLabel}>Soil Moisture (VWC)</Text>
            <Text style={styles.metricRange}>Target: 30% – 45%</Text>
          </View>

          {/* Soil EC (Nutrient Concentration) */}
          <View style={[styles.metricCard, { borderColor: '#FEE2C8' }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FFF4EC' }]}>
                <Ionicons name="flask" size={18} color={Colors.warning} />
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#FFF4EC' }]}>
                <Text style={[styles.statusPillText, { color: Colors.warning }]}>Good</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {soilEC}<Text style={styles.metricUnit}> mS/cm</Text>
            </Text>
            <Text style={styles.metricLabel}>Soil EC (Nutrients)</Text>
            <Text style={styles.metricRange}>Target: 1.5 – 2.2 mS/cm</Text>
          </View>

          {/* Air Temperature */}
          <View style={[styles.metricCard, { borderColor: '#FDE2E2' }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FFF5F5' }]}>
                <Ionicons name="thermometer" size={18} color={Colors.danger} />
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#EAF7EE' }]}>
                <Text style={[styles.statusPillText, { color: Colors.primaryGreen }]}>Normal</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {temperature}<Text style={styles.metricUnit}> °C</Text>
            </Text>
            <Text style={styles.metricLabel}>Air Temperature</Text>
            <Text style={styles.metricRange}>Target: 22°C – 30°C</Text>
          </View>

          {/* Air Humidity */}
          <View style={[styles.metricCard, { borderColor: '#C8DDF8' }]}>
            <View style={styles.metricTopRow}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EBF3FF' }]}>
                <Ionicons name="cloudy" size={18} color={Colors.info} />
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#EAF7EE' }]}>
                <Text style={[styles.statusPillText, { color: Colors.primaryGreen }]}>Ideal</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {humidity}<Text style={styles.metricUnit}> %</Text>
            </Text>
            <Text style={styles.metricLabel}>Relative Humidity</Text>
            <Text style={styles.metricRange}>Target: 60% – 75%</Text>
          </View>
        </View>

        {/* Agronomic sub-strip: VPD + FAO-56 ETo */}
        <View style={styles.agronomyStrip}>
          <View style={styles.agronomyItem}>
            <Ionicons name="leaf-outline" size={15} color={Colors.primaryGreen} />
            <Text style={styles.agronomyLabel}>FAO-56 ETo: </Text>
            <Text style={styles.agronomyVal}>{etO} mm/day</Text>
          </View>
          <View style={styles.agronomyDivider} />
          <View style={styles.agronomyItem}>
            <Ionicons name="speedometer-outline" size={15} color="#7C5CBF" />
            <Text style={styles.agronomyLabel}>VPD: </Text>
            <Text style={styles.agronomyVal}>{vpd} kPa (Transpiration Good)</Text>
          </View>
        </View>
      </View>

      {/* ── 5. CROP-STAGE IRRIGATION (FAO-56 MODEL) ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Crop-Stage Irrigation</Text>
            <Text style={styles.sectionSub}>FAO-56 Penman–Monteith Water Model</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/irrigation')}>
            <Text style={styles.seeAllText}>Pump Control →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.irrigationCard}>
          {/* Top info row */}
          <View style={styles.irrigationTopRow}>
            <View style={styles.irrigationIconBox}>
              <Ionicons name="water" size={20} color={Colors.primaryGreen} />
            </View>
            <View style={styles.irrigationTitleBlock}>
              <Text style={styles.irrigationTitle}>Daily Water Requirement</Text>
              <Text style={styles.irrigationSubtitle}>
                ETo ({etO} mm) × Kc ({cropKc}) → {dailyWaterTarget} L daily target
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.modeTogglePill,
                { backgroundColor: isAutoMode ? Colors.primaryGreen : Colors.secondaryText }
              ]}
              onPress={() => setIsAutoMode(!isAutoMode)}
              activeOpacity={0.8}
            >
              <Text style={styles.modeToggleText}>
                {isAutoMode ? 'AUTO MODE' : 'MANUAL'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress / Volume Breakdown */}
          <View style={styles.irrigationMetricsRow}>
            <View style={styles.irrigationMetric}>
              <Text style={styles.irrigationMetricValue}>{dailyWaterTarget} L</Text>
              <Text style={styles.irrigationMetricLabel}>Daily Target</Text>
            </View>
            <View style={styles.irrigationDivider} />
            <View style={styles.irrigationMetric}>
              <Text style={[styles.irrigationMetricValue, { color: Colors.primaryGreen }]}>
                {deliveredSoFar} L
              </Text>
              <Text style={styles.irrigationMetricLabel}>Delivered Today</Text>
            </View>
            <View style={styles.irrigationDivider} />
            <View style={styles.irrigationMetric}>
              <Text style={[styles.irrigationMetricValue, { color: Colors.info }]}>
                {remainingWater} L
              </Text>
              <Text style={styles.irrigationMetricLabel}>Remaining Need</Text>
            </View>
          </View>

          {/* Pump Hardware Status Bar */}
          <View style={styles.pumpStatusBar}>
            <View style={styles.pumpStatusLeft}>
              <View
                style={[
                  styles.pumpDot,
                  { backgroundColor: isPumpActive ? Colors.success : Colors.mutedText }
                ]}
              />
              <Text style={styles.pumpStatusText}>
                Solenoid Valve: {isPumpActive ? 'RUNNING (Flow: 2.4 L/min)' : 'IDLE (Closed)'} · 2.1 bar
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.quickWaterBtn,
                isPumpActive && { backgroundColor: Colors.danger }
              ]}
              onPress={handleQuickWater}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPumpActive ? 'stop' : 'play'}
                size={13}
                color={Colors.cardBackground}
              />
              <Text style={styles.quickWaterBtnText}>
                {isPumpActive ? 'Stop' : 'Water 5m'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── 6. PEST & DISEASE RISK FORECAST (GDD MODEL) ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Pest & Disease Forecast</Text>
            <Text style={styles.sectionSub}>Growing Degree Days (GDD) Life-Cycle Model</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/plant-health')}>
            <Text style={styles.seeAllText}>Pest Hub →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pestCard}>
          <View style={styles.pestTopRow}>
            <View style={[styles.pestIconBox, { backgroundColor: '#EAF7EE' }]}>
              <Ionicons name="bug" size={20} color={Colors.primaryGreen} />
            </View>
            <View style={styles.pestInfo}>
              <Text style={styles.pestTitle}>7-Day Proactive Emergence Risk</Text>
              <Text style={styles.pestSubtitle}>
                Accumulated Heat Units: {cumulativeGDD} GDD (Base 10°C)
              </Text>
            </View>
            <StatusBadge label="LOW RISK" variant="success" />
          </View>

          <View style={styles.pestProgressWrap}>
            <View style={styles.pestProgressLabels}>
              <Text style={styles.pestThresholdText}>
                Whitefly Emergence Threshold: {pestThreshold} GDD
              </Text>
              <Text style={styles.pestBufferText}>{daysToThreshold} days buffer</Text>
            </View>
            <View style={styles.pestProgressBarBg}>
              <View
                style={[
                  styles.pestProgressBarFill,
                  { width: `${Math.min(100, (cumulativeGDD / pestThreshold) * 100)}%` }
                ]}
              />
            </View>
          </View>

          <View style={styles.pestAdviceBar}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primaryGreen} />
            <Text style={styles.pestAdviceText}>
              No chemical pesticide spray needed this week. Saves costs and preserves beneficial insects.
            </Text>
          </View>
        </View>
      </View>

      {/* ── 7. FARMER MODULE QUICK-NAV ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Farm Modules</Text>
        <View style={styles.navGrid}>
          {/* Irrigation & Water Control */}
          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#C8DDF8' }]}
            onPress={() => router.push('/(tabs)/irrigation')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#EBF3FF' }]}>
              <Ionicons name="water" size={22} color={Colors.info} />
            </View>
            <Text style={styles.navCardTitle}>Irrigation & Pump</Text>
            <Text style={styles.navCardSub}>FAO-56 Water Budget · Flow Meter Control</Text>
            <View style={styles.navArrow}>
              <Ionicons name="arrow-forward" size={14} color={Colors.mutedText} />
            </View>
          </TouchableOpacity>

          {/* Fertilizer & NPK */}
          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#C3E8CC' }]}
            onPress={() => router.push('/(tabs)/fertilizer')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#EAF7EE' }]}>
              <Ionicons name="flask" size={22} color={Colors.primaryGreen} />
            </View>
            <Text style={styles.navCardTitle}>Fertilizer & EC</Text>
            <Text style={styles.navCardSub}>Dynamic EC Feedback · Leaching Prevention</Text>
            <View style={styles.navArrow}>
              <Ionicons name="arrow-forward" size={14} color={Colors.mutedText} />
            </View>
          </TouchableOpacity>

          {/* Pest & Disease Reports */}
          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#FED7D7' }]}
            onPress={() => router.push('/(tabs)/plant-health')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#FFF5F5' }]}>
              <Ionicons name="bug" size={22} color={Colors.danger} />
            </View>
            <Text style={styles.navCardTitle}>Pest & Plant Health</Text>
            <Text style={styles.navCardSub}>GDD Heat Forecast · Field Observations</Text>
            <View style={styles.navArrow}>
              <Ionicons name="arrow-forward" size={14} color={Colors.mutedText} />
            </View>
          </TouchableOpacity>

          {/* Farm Profile & Nodes */}
          <TouchableOpacity
            style={[styles.navCard, { borderColor: '#D4C8F8' }]}
            onPress={() => router.push('/(tabs)/farm')}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconBox, { backgroundColor: '#F0ECFF' }]}>
              <Ionicons name="business" size={22} color="#7C5CBF" />
            </View>
            <Text style={styles.navCardTitle}>Greenhouse Profile</Text>
            <Text style={styles.navCardSub}>ESP32 Field Hardware · Zone Parameters</Text>
            <View style={styles.navArrow}>
              <Ionicons name="arrow-forward" size={14} color={Colors.mutedText} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 8. UPCOMING TASKS & RECENT ALERTS ── */}
      <View style={[styles.section, styles.twoColRow]}>
        {/* Next Task */}
        {nextTask && (
          <TouchableOpacity
            style={styles.miniCard}
            onPress={() => router.push('/(tabs)/fertilizer')}
            activeOpacity={0.8}
          >
            <View style={styles.miniCardHeader}>
              <Ionicons name="calendar-outline" size={14} color={Colors.primaryGreen} />
              <Text style={styles.miniCardLabel}>Next Task</Text>
            </View>
            <Text style={styles.miniCardTitle} numberOfLines={2}>{nextTask.title}</Text>
            <Text style={styles.miniCardDate}>{nextTask.date}</Text>
          </TouchableOpacity>
        )}

        {/* Latest Alert */}
        {recentAlert && (
          <TouchableOpacity
            style={[styles.miniCard, { borderLeftColor: Colors.info }]}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <View style={styles.miniCardHeader}>
              <Ionicons name="notifications-outline" size={14} color={Colors.info} />
              <Text style={[styles.miniCardLabel, { color: Colors.info }]}>Latest Alert</Text>
            </View>
            <Text style={styles.miniCardTitle} numberOfLines={2}>{recentAlert.title}</Text>
            <Text style={styles.miniCardDate}>{recentAlert.timestamp}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── 9. SYSTEM ARCHITECTURE & HEALTH FOOTER ── */}
      <View style={styles.systemFooter}>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>ESP32 Node 01</Text>
        </View>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>MQTT / LoRaWAN</Text>
        </View>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>FAO-56 Water Model</Text>
        </View>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>GDD Pest Model</Text>
        </View>
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
  sectionSub: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  seeAllText: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },

  // ── Hero Card ──
  heroCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    ...Shadow.card,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleGroup: {
    flex: 1,
  },
  heroTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  heroSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  mqttBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: '#C3E8CC',
  },
  mqttDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  mqttText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
  heroDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  cropStripRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  cropChipText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.darkGreen,
  },
  edgeNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  edgeNodeText: {
    flex: 1,
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
  },
  edgeNodeLink: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },

  // ── Interlock Protection Card ──
  interlockCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#C3E8CC',
    ...Shadow.card,
  },
  interlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  interlockItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interlockIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interlockTextWrap: {
    flex: 1,
  },
  interlockName: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  interlockStatus: {
    fontSize: 10,
    color: Colors.primaryGreen,
    fontWeight: FontWeight.medium,
    marginTop: 1,
  },
  interlockNoteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: '#EAF7EE',
  },
  interlockNoteText: {
    fontSize: 11,
    color: Colors.secondaryText,
    flex: 1,
  },

  // ── Metric Grid ──
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadow.card,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  metricLabel: {
    fontSize: FontSize.secondary,
    color: Colors.mainText,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  metricRange: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 2,
  },
  agronomyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGreen,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
  },
  agronomyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agronomyLabel: {
    fontSize: 11,
    color: Colors.darkGreen,
    fontWeight: FontWeight.medium,
  },
  agronomyVal: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  agronomyDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#C3E8CC',
    marginHorizontal: Spacing.sm,
  },

  // ── Irrigation Card ──
  irrigationCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    ...Shadow.card,
  },
  irrigationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  irrigationIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  irrigationTitleBlock: {
    flex: 1,
  },
  irrigationTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  irrigationSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  modeTogglePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  modeToggleText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.cardBackground,
    letterSpacing: 0.5,
  },
  irrigationMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9F6',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2EFE5',
  },
  irrigationMetric: {
    flex: 1,
    alignItems: 'center',
  },
  irrigationMetricValue: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  irrigationMetricLabel: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 2,
  },
  irrigationDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#D4EEDC',
  },
  pumpStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF3EE',
  },
  pumpStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  pumpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pumpStatusText: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    flex: 1,
  },
  quickWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  quickWaterBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.cardBackground,
  },

  // ── Pest Card ──
  pestCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    ...Shadow.card,
  },
  pestTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  pestIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pestInfo: {
    flex: 1,
  },
  pestTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  pestSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  pestProgressWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.sm,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
  },
  pestProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  pestThresholdText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  pestBufferText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  pestProgressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pestProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryGreen,
    borderRadius: 3,
  },
  pestAdviceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF3EE',
  },
  pestAdviceText: {
    fontSize: 11,
    color: Colors.secondaryText,
    flex: 1,
    lineHeight: 16,
  },

  // ── Nav Grid ──
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  navCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadow.card,
    position: 'relative',
    minHeight: 110,
  },
  navIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  navCardTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginBottom: 3,
  },
  navCardSub: {
    fontSize: 11,
    color: Colors.mutedText,
    lineHeight: 15,
  },
  navArrow: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },

  // ── Two-Col Row ──
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  miniCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryGreen,
    ...Shadow.card,
  },
  miniCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  miniCardLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    lineHeight: 18,
    marginBottom: 4,
  },
  miniCardDate: {
    fontSize: 11,
    color: Colors.mutedText,
  },

  // ── System Health Footer ──
  systemFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: Spacing.base,
  },
  footerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  footerChipText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
});
