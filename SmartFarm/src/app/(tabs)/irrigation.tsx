import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import SensorRow from '../../components/SensorRow';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import type { SensorReading } from '../../types/sensor';
import {
  initialSensorState,
  initialAgentState,
  tickSensors,
  evaluateAgentClosedLoop,
  LiveSensorState,
  AgentIrrigationState,
  AgentEventLog,
} from '../../services/mockAgentService';

export default function IrrigationScreen() {
  // System & Agent States
  const [sensors, setSensors] = useState<LiveSensorState>(initialSensorState);
  const [agent, setAgent] = useState<AgentIrrigationState>(initialAgentState);
  const [manualDose, setManualDose] = useState<number>(2.5);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [logs, setLogs] = useState<AgentEventLog[]>([
    {
      id: 'log-01',
      timestamp: 'Today · 08:30',
      volume: 2.1,
      duration: 4,
      trigger: 'agent',
      note: 'Closed-Loop Agent micro-dose (Soil: 38%)',
    },
    {
      id: 'log-02',
      timestamp: 'Today · 06:00',
      volume: 1.8,
      duration: 3,
      trigger: 'scheduled',
      note: 'Dawn baseline allocation',
    },
    {
      id: 'log-03',
      timestamp: 'Yesterday · 16:15',
      volume: 2.4,
      duration: 5,
      trigger: 'agent',
      note: 'High VPD compensation cycle',
    },
  ]);

  // Pulse animation for active pump/valve
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (agent.pumpStatus === 'running') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [agent.pumpStatus]);

  // Live Microclimate Ticking & Closed-Loop Agent Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prevSensors) => {
        const nextSensors = tickSensors(prevSensors);

        // If Auto Mode is ON, execute closed-loop agent decision
        setAgent((prevAgent) => {
          if (!prevAgent.isAutoMode || prevAgent.pumpStatus === 'running') {
            return prevAgent;
          }

          const decision = evaluateAgentClosedLoop(nextSensors, prevAgent);

          if (decision.shouldIrrigate && !prevAgent.hasAnomaly) {
            // Trigger automated agent closed loop irrigation
            triggerAutoIrrigation(decision.predictedDose, decision.reason);
            return {
              ...prevAgent,
              pumpStatus: 'running',
              predictedVolume: decision.predictedDose,
              lastDecisionReason: decision.reason,
            };
          }

          return {
            ...prevAgent,
            predictedVolume: decision.predictedDose,
            lastDecisionReason: decision.reason,
          };
        });

        return nextSensors;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Closed-loop auto watering execution
  const triggerAutoIrrigation = (dose: number, reason: string) => {
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
      setAgent((prev) => ({
        ...prev,
        pumpStatus: 'idle',
        deliveredToday: +(prev.deliveredToday + dose).toFixed(1),
        lastDecisionReason: 'Irrigation completed. Soil moisture stabilized.',
      }));
      setSensors((prev) => ({
        ...prev,
        soilMoisture: Math.min(65.0, +(prev.soilMoisture + 15.0).toFixed(1)),
      }));
      // Append to live logs
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          volume: dose,
          duration: 4,
          trigger: 'agent',
          note: `Agent: ${reason}`,
        },
        ...prev.slice(0, 5),
      ]);
    }, 4500);
  };

  // Manual Mode: "Water Now" handler
  const handleManualWaterNow = () => {
    if (agent.isAutoMode || isWatering) return;

    setIsWatering(true);
    setAgent((prev) => ({ ...prev, pumpStatus: 'running' }));

    setTimeout(() => {
      setIsWatering(false);
      setAgent((prev) => ({
        ...prev,
        pumpStatus: 'idle',
        deliveredToday: +(prev.deliveredToday + manualDose).toFixed(1),
      }));
      setSensors((prev) => ({
        ...prev,
        soilMoisture: Math.min(70.0, +(prev.soilMoisture + manualDose * 4.5).toFixed(1)),
      }));
      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          volume: manualDose,
          duration: Math.round(manualDose * 2),
          trigger: 'manual',
          note: `Manual Override by Farmer (+${manualDose}L)`,
        },
        ...prev.slice(0, 5),
      ]);
    }, 3500);
  };

  // Toggle Anomaly state for supervisor demonstration
  const toggleAnomalySimulation = () => {
    setAgent((prev) => {
      const nextAnomaly = !prev.hasAnomaly;
      return {
        ...prev,
        hasAnomaly: nextAnomaly,
        anomalyScore: nextAnomaly ? 0.89 : 0.08,
        pumpStatus: nextAnomaly ? 'disabled' : (prev.pumpStatus === 'disabled' ? 'idle' : prev.pumpStatus),
        lastDecisionReason: nextAnomaly
          ? 'Safety Lock: K-Means Anomaly model detected hardware glitch.'
          : 'Sensors recalibrated: Resuming normal operation.',
      };
    });
  };

  // Trigger dry soil stress demonstration
  const simulateDrySoil = () => {
    setSensors((prev) => ({ ...prev, soilMoisture: 32.0 }));
  };

  // Map 7 live sensors to SensorReading structure
  const activeSensorReadings: SensorReading[] = [
    {
      id: 'soilMoisture',
      label: 'Soil Moisture',
      value: sensors.soilMoisture,
      unit: '%',
      iconName: 'water',
      status: sensors.soilMoisture < 35 ? 'danger' : sensors.soilMoisture < 45 ? 'warning' : 'normal',
      description: sensors.soilMoisture < 40 ? 'Below optimal root zone target' : 'Optimal tomato moisture',
    },
    {
      id: 'airTemperature',
      label: 'Air Temperature',
      value: sensors.airTemperature,
      unit: '°C',
      iconName: 'thermometer',
      status: sensors.airTemperature > 32 || sensors.airTemperature < 18 ? 'warning' : 'normal',
      description: 'Greenhouse ambient climate',
    },
    {
      id: 'relativeHumidity',
      label: 'Relative Humidity',
      value: sensors.relativeHumidity,
      unit: '%',
      iconName: 'cloud',
      status: sensors.relativeHumidity > 80 ? 'warning' : 'normal',
      description: 'Canopy humidity level',
    },
    {
      id: 'vpd',
      label: 'VPD (Transpiration)',
      value: sensors.vpd,
      unit: 'kPa',
      iconName: 'pulse',
      status: sensors.vpd < 0.8 || sensors.vpd > 1.3 ? 'warning' : 'normal',
      description: 'Ideal range: 0.8 – 1.2 kPa',
    },
    {
      id: 'solarRadiation',
      label: 'Solar Radiation',
      value: sensors.solarRadiation,
      unit: 'W/m²',
      iconName: 'sunny',
      status: 'normal',
      description: 'Photosynthetic light intensity',
    },
    {
      id: 'evapotranspiration',
      label: 'Evapotranspiration (ET)',
      value: sensors.evapotranspiration,
      unit: 'mm',
      iconName: 'leaf',
      status: 'normal',
      description: 'FAO-56 daily water loss',
    },
    {
      id: 'atmosphericPressure',
      label: 'Atmospheric Pressure',
      value: sensors.atmosphericPressure,
      unit: 'hPa',
      iconName: 'speedometer',
      status: 'normal',
      description: 'Barometric pressure',
    },
  ];

  return (
    <ScreenContainer>
      {/* 1. HEADER & SYSTEM STATUS */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>AgriAgent IoT</Text>
          <Text style={styles.pageSubtitle}>Closed-Loop Edge Irrigation Ecosystem</Text>
        </View>

        {/* MQTT Connection Badge */}
        <View style={styles.mqttBadge}>
          <View style={styles.mqttDot} />
          <Text style={styles.mqttText}>MQTT: Online</Text>
        </View>
      </View>

      {/* System Mode Switcher Toggle */}
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[styles.modeButton, agent.isAutoMode && styles.modeButtonActive]}
          onPress={() => setAgent((prev) => ({ ...prev, isAutoMode: true }))}
          activeOpacity={0.8}
        >
          <Ionicons
            name="sparkles"
            size={14}
            color={agent.isAutoMode ? Colors.cardBackground : Colors.secondaryText}
          />
          <Text style={[styles.modeButtonText, agent.isAutoMode && styles.modeButtonTextActive]}>
            Auto Mode (AI Agent)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, !agent.isAutoMode && styles.modeButtonActiveManual]}
          onPress={() => setAgent((prev) => ({ ...prev, isAutoMode: false }))}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options"
            size={14}
            color={!agent.isAutoMode ? Colors.cardBackground : Colors.secondaryText}
          />
          <Text style={[styles.modeButtonText, !agent.isAutoMode && styles.modeButtonTextActive]}>
            Manual Mode
          </Text>
        </TouchableOpacity>
      </View>

      {/* 2. AI INTELLIGENCE HUB CARD */}
      <View style={styles.section}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconBox}>
              <Ionicons name="hardware-chip-outline" size={22} color={Colors.primaryGreen} />
            </View>
            <View style={styles.summaryTitleGroup}>
              <Text style={styles.summaryTitle}>AI Intelligence Hub</Text>
              <Text style={styles.summarySubtitle}>
                {agent.isAutoMode ? 'Closed-Loop Agent Running' : 'Manual Override Active'}
              </Text>
            </View>
            <StatusBadge
              label={agent.isAutoMode ? 'AI Control' : 'Manual'}
              variant={agent.isAutoMode ? 'success' : 'warning'}
            />
          </View>

          {/* Prominent Dose Metric Display */}
          <View style={styles.doseMetricContainer}>
            <Text style={styles.doseLabel}>AI PREDICTED WATER DEMAND (DNN)</Text>
            <View style={styles.doseValueRow}>
              <Text style={styles.doseNumber}>{agent.predictedVolume.toFixed(1)}</Text>
              <Text style={styles.doseUnit}>Liters</Text>
            </View>
            <Text style={styles.doseSubtext}>
              {agent.lastDecisionReason}
            </Text>
          </View>

          {/* Dual Status Cards: Anomaly Detection + Solenoid Valve */}
          <View style={styles.dualStatusRow}>
            {/* K-Means Anomaly Card */}
            <TouchableOpacity
              style={[
                styles.subCard,
                agent.hasAnomaly ? styles.subCardWarning : styles.subCardNormal,
              ]}
              onPress={toggleAnomalySimulation}
              activeOpacity={0.8}
            >
              <View style={styles.subCardTop}>
                <Text style={styles.subCardLabel}>K-MEANS ANOMALY</Text>
                <Ionicons
                  name={agent.hasAnomaly ? 'warning' : 'checkmark-circle'}
                  size={18}
                  color={agent.hasAnomaly ? Colors.danger : Colors.success}
                />
              </View>
              <Text style={[styles.subCardTitle, agent.hasAnomaly && styles.textDanger]}>
                {agent.hasAnomaly ? 'Anomaly Detected!' : 'Sensors Optimal'}
              </Text>
              <Text style={styles.subCardFootnote}>
                {agent.hasAnomaly ? 'Score: 0.89 (Tap to clear)' : 'Score: 0.08 (Tap to test)'}
              </Text>
            </TouchableOpacity>

            {/* Solenoid Valve Status Card */}
            <View style={styles.subCard}>
              <View style={styles.subCardTop}>
                <Text style={styles.subCardLabel}>SOLENOID VALVE</Text>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Ionicons
                    name="power"
                    size={16}
                    color={agent.pumpStatus === 'running' ? Colors.info : Colors.mutedText}
                  />
                </Animated.View>
              </View>
              <Text style={[styles.subCardTitle, agent.pumpStatus === 'running' && styles.textInfo]}>
                {agent.pumpStatus === 'running' ? 'Pump is RUNNING' : 'Pump is OFF'}
              </Text>
              <Text style={styles.subCardFootnote}>
                {agent.pumpStatus === 'running' ? 'Active Flow: 12 L/min' : 'Line Pressure: 2.1 bar'}
              </Text>
            </View>
          </View>

          {/* Today Accumulated Total Bar */}
          <View style={styles.todayTotalBar}>
            <View style={styles.todayTotalInfo}>
              <Ionicons name="water-outline" size={16} color={Colors.primaryGreen} />
              <Text style={styles.todayTotalLabel}>Total Delivered Today</Text>
            </View>
            <Text style={styles.todayTotalValue}>{agent.deliveredToday.toFixed(1)} L</Text>
          </View>
        </View>
      </View>

      {/* 3. QUICK OVERRIDE CONTROLS */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeading}>Actuator Quick Controls</Text>
          {agent.isAutoMode && (
            <StatusBadge label="AI Agent Locked" variant="muted" />
          )}
        </View>

        <View style={[styles.controlCard, agent.isAutoMode && styles.controlCardDisabled]}>
          {agent.isAutoMode ? (
            <View style={styles.lockedNotice}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.secondaryText} />
              <Text style={styles.lockedNoticeText}>
                Controls locked by AI Closed-Loop Agent. Switch to Manual Mode above to override pump.
              </Text>
            </View>
          ) : (
            <View>
              {/* Stepper / Amount selector */}
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Manual Dosage Volume</Text>
                <Text style={styles.sliderValueText}>{manualDose.toFixed(1)} Liters</Text>
              </View>

              <View style={styles.dosageStepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setManualDose((prev) => Math.max(0.5, +(prev - 0.5).toFixed(1)))}
                >
                  <Ionicons name="remove" size={18} color={Colors.mainText} />
                </TouchableOpacity>

                <View style={styles.doseDisplay}>
                  <Text style={styles.doseDisplayText}>{manualDose.toFixed(1)} L</Text>
                </View>

                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setManualDose((prev) => Math.min(10.0, +(prev + 0.5).toFixed(1)))}
                >
                  <Ionicons name="add" size={18} color={Colors.mainText} />
                </TouchableOpacity>
              </View>

              {/* WATER NOW Button */}
              <TouchableOpacity
                style={[styles.waterNowBtn, isWatering && styles.waterNowBtnActive]}
                onPress={handleManualWaterNow}
                disabled={isWatering}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isWatering ? 'hourglass-outline' : 'water'}
                  size={20}
                  color={Colors.cardBackground}
                />
                <Text style={styles.waterNowBtnText}>
                  {isWatering ? 'WATERING IN PROGRESS...' : `WATER NOW (${manualDose.toFixed(1)} L)`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Interactive Agent Demo Trigger */}
          <TouchableOpacity
            style={styles.demoStressBtn}
            onPress={simulateDrySoil}
            activeOpacity={0.7}
          >
            <Ionicons name="flash-outline" size={14} color={Colors.warning} />
            <Text style={styles.demoStressText}>Simulate Soil Drying (Test Agent Loop)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. REAL-TIME SENSOR TELEMETRY */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeading}>Edge Telemetry (ESP32 Nodes)</Text>
          <Text style={styles.featureCount}>7 of 7 active</Text>
        </View>

        <View style={styles.card}>
          {activeSensorReadings.map((sensor, index) => (
            <SensorRow
              key={sensor.id}
              sensor={sensor}
              showBorder={index < activeSensorReadings.length - 1}
            />
          ))}
        </View>
      </View>

      {/* 5. CLOSED-LOOP EVENT LOG */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeading}>Irrigation Event History</Text>
          <StatusBadge label="Closed-Loop" variant="demo" />
        </View>

        <View style={styles.card}>
          {logs.map((event, idx) => (
            <View
              key={event.id}
              style={[
                styles.historyRow,
                idx < logs.length - 1 && styles.historyBorder,
              ]}
            >
              <View
                style={[
                  styles.historyTimelineIcon,
                  event.trigger === 'agent' && styles.historyTimelineAgent,
                ]}
              >
                <Ionicons
                  name={event.trigger === 'agent' ? 'sparkles' : 'water-outline'}
                  size={16}
                  color={event.trigger === 'agent' ? Colors.primaryGreen : Colors.info}
                />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{event.note}</Text>
                <Text style={styles.historyTimestamp}>
                  {event.timestamp} • {event.duration} min cycle
                </Text>
              </View>
              <View style={styles.historyVolumeBadge}>
                <Text style={styles.historyVolumeText}>+{event.volume.toFixed(1)} L</Text>
              </View>
            </View>
          ))}
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
    marginBottom: Spacing.sm,
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
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEFEB',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.sm + 2,
  },
  modeButtonActive: {
    backgroundColor: Colors.primaryGreen,
    ...Shadow.card,
  },
  modeButtonActiveManual: {
    backgroundColor: Colors.info,
    ...Shadow.card,
  },
  modeButtonText: {
    fontSize: FontSize.secondary,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  modeButtonTextActive: {
    color: Colors.cardBackground,
    fontWeight: FontWeight.bold,
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
    marginBottom: Spacing.md,
  },
  summaryIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.lightGreen,
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
  doseMetricContainer: {
    backgroundColor: '#F5F9F6',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2EFE5',
    marginBottom: Spacing.md,
  },
  doseLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
    letterSpacing: 0.5,
  },
  doseValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 4,
  },
  doseNumber: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  doseUnit: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
  doseSubtext: {
    fontSize: 11,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  dualStatusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  subCard: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subCardNormal: {
    backgroundColor: '#F3FAF5',
    borderColor: '#D4EEDC',
  },
  subCardWarning: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subCardLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.mutedText,
  },
  subCardTitle: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  subCardFootnote: {
    fontSize: 10,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  textDanger: {
    color: Colors.danger,
  },
  textInfo: {
    color: Colors.info,
  },
  todayTotalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF3EE',
  },
  todayTotalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayTotalLabel: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
  },
  todayTotalValue: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  controlCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  controlCardDisabled: {
    backgroundColor: '#FAFAF8',
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: Spacing.sm,
  },
  lockedNoticeText: {
    flex: 1,
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.medium,
    color: Colors.mainText,
  },
  sliderValueText: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    color: Colors.info,
  },
  dosageStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  doseDisplayText: {
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  waterNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.info,
    height: 48,
    borderRadius: Radius.md,
  },
  waterNowBtnActive: {
    backgroundColor: Colors.success,
  },
  waterNowBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.cardBackground,
  },
  demoStressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  demoStressText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.warning,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    ...Shadow.card,
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
    backgroundColor: '#EBF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTimelineAgent: {
    backgroundColor: Colors.lightGreen,
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
});
