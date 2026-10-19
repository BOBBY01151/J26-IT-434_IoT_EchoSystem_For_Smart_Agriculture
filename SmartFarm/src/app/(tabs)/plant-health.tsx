import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockPestDashboard, mockPestSpecies, mockSprayHistory } from '../../data/mockPest';
import { PestDashboardData, PestSpecies, SprayEvent } from '../../types/pest';

export default function PlantHealthScreen() {
  // Navigation segment: 'pest' (Edge AI Pest Prediction) | 'disease' (Foliar Scan)
  const [activeSegment, setActiveSegment] = useState<'pest' | 'disease'>('pest');

  // Pest & Interlock State
  const [pestData, setPestData] = useState<PestDashboardData>(mockPestDashboard);
  const [sprayHistory, setSprayHistory] = useState<SprayEvent[]>(mockSprayHistory);
  const [sprayModalVisible, setSprayModalVisible] = useState(false);
  const [sprayNotes, setSprayNotes] = useState('');
  const [selectedPest, setSelectedPest] = useState<PestSpecies | null>(null);

  // Foliar Disease Scan State
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diseaseDiagnosis, setDiseaseDiagnosis] = useState<{
    diseaseName: string;
    confidence: number;
    severity: 'mild' | 'moderate' | 'severe';
    diagnosis: string;
    recommendations: string[];
  } | null>(null);

  // Handler: Log Pesticide Spray & Engage 24h Lockout
  const handleLogSpray = () => {
    if (!sprayNotes.trim()) {
      Alert.alert('Notes Required', 'Please enter a brief note about the pesticide or bio-treatment applied.');
      return;
    }

    const newEvent: SprayEvent = {
      id: `SPRAY-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      notes: sprayNotes.trim(),
      lockout_active: true,
      lockout_hours_remaining: 24.0,
    };

    setSprayHistory([newEvent, ...sprayHistory]);
    setPestData({
      ...pestData,
      is_spray_lockout_active: true,
      lockout_remaining_hours: 24.0,
      last_spray_timestamp: 'Just now',
      system_state: 'INTERLOCK (24h Spray Lock Active)',
    });

    setSprayNotes('');
    setSprayModalVisible(false);

    Alert.alert(
      'Spray–Irrigation Lockout Engaged',
      'Pesticide application recorded. Irrigation is now blocked for the next 24 hours to prevent chemical wash-off and soil leaching.',
      [{ text: 'OK' }]
    );
  };

  // Image capture & pickers for leaf diagnostics
  const pickFromGallery = async () => {
    try {
      setIsLoading(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Access to gallery is required to select plant images.');
        setIsLoading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setDiseaseDiagnosis(null);
      }
    } catch {
      Alert.alert('Error', 'Unable to open photo library.');
    } finally {
      setIsLoading(false);
    }
  };

  const captureFromCamera = async () => {
    try {
      setIsLoading(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture leaf photos.');
        setIsLoading(false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setDiseaseDiagnosis(null);
      }
    } catch {
      Alert.alert('Error', 'Unable to launch camera.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeLeaf = () => {
    if (!imageUri) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setDiseaseDiagnosis({
        diseaseName: 'Early Blight (Alternaria solani)',
        confidence: 0.942,
        severity: 'moderate',
        diagnosis:
          'Concentric brown-black rings observed on lower foliar tissue. Microclimate humidity is supporting fungal spore germination.',
        recommendations: [
          'Prune and discard infected lower canopy leaves to reduce inoculum',
          'Apply protective copper fungicide or bio-extract at 7-day intervals',
          'Maintain drip irrigation; avoid overhead canopy wetting',
        ],
      });
    }, 900);
  };

  // Helper for Infestation status styling
  const getInfestationBadge = (pred: string) => {
    switch (pred) {
      case 'Severe_Infestation':
        return { label: 'Severe Infestation', variant: 'danger' as const, icon: 'warning' as const };
      case 'Moderate_Infestation':
        return { label: 'Moderate Infestation', variant: 'warning' as const, icon: 'alert-circle' as const };
      case 'Low_Infestation':
        return { label: 'Low Infestation', variant: 'info' as const, icon: 'shield-outline' as const };
      default:
        return { label: 'Healthy Crop', variant: 'success' as const, icon: 'checkmark-circle' as const };
    }
  };

  const badgeInfo = getInfestationBadge(pestData.latest_prediction);

  return (
    <ScreenContainer>
      {/* 1. Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Pest & Plant Health</Text>
          <Text style={styles.pageSubtitle}>Edge AI Prediction & Cyber-Physical Interlocks</Text>
        </View>
        <StatusBadge label="ESP32-S3 AI" variant="success" />
      </View>

      {/* 2. Top Segmented Navigation Switcher */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'pest' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('pest')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="bug"
            size={16}
            color={activeSegment === 'pest' ? Colors.primaryGreen : Colors.secondaryText}
          />
          <Text style={[styles.segmentText, activeSegment === 'pest' && styles.segmentTextActive]}>
            Edge AI Pest Control
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSegment === 'disease' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('disease')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="camera"
            size={16}
            color={activeSegment === 'disease' ? Colors.primaryGreen : Colors.secondaryText}
          />
          <Text style={[styles.segmentText, activeSegment === 'disease' && styles.segmentTextActive]}>
            Leaf Disease Diagnostic
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===================== TAB 1: EDGE AI PEST PREDICTION ===================== */}
      {activeSegment === 'pest' && (
        <View>
          {/* A. 24-Hour Spray-Irrigation Interlock Card */}
          <View
            style={[
              styles.interlockCard,
              pestData.is_spray_lockout_active
                ? styles.interlockCardLocked
                : styles.interlockCardUnlocked,
            ]}
          >
            <View style={styles.interlockHeader}>
              <View style={styles.interlockTitleRow}>
                <View
                  style={[
                    styles.interlockIconWrap,
                    pestData.is_spray_lockout_active
                      ? styles.interlockIconLocked
                      : styles.interlockIconUnlocked,
                  ]}
                >
                  <Ionicons
                    name={pestData.is_spray_lockout_active ? 'lock-closed' : 'water-outline'}
                    size={20}
                    color={pestData.is_spray_lockout_active ? '#C23D3D' : Colors.primaryGreen}
                  />
                </View>
                <View>
                  <Text style={styles.interlockTitle}>
                    {pestData.is_spray_lockout_active
                      ? 'Spray–Irrigation Lock Active'
                      : 'Irrigation Interlock Normal'}
                  </Text>
                  <Text style={styles.interlockSubtitle}>
                    {pestData.is_spray_lockout_active
                      ? `Pump blocked for ${pestData.lockout_remaining_hours}h`
                      : 'All irrigation valves accessible'}
                  </Text>
                </View>
              </View>

              <StatusBadge
                label={pestData.is_spray_lockout_active ? 'BLOCKED' : 'READY'}
                variant={pestData.is_spray_lockout_active ? 'danger' : 'success'}
              />
            </View>

            <Text style={styles.interlockExplanation}>
              {pestData.is_spray_lockout_active
                ? 'Pesticide application active. The Central Coordination Engine blocks pump startup to protect chemical active ingredients from dilution and root-zone leaching.'
                : 'Irrigation can be scheduled or triggered without chemical conflict. Log any new pesticide spray below.'}
            </Text>

            <TouchableOpacity
              style={styles.logSprayBtn}
              onPress={() => setSprayModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.logSprayBtnText}>Log Pesticide Spray</Text>
            </TouchableOpacity>
          </View>

          {/* B. Edge AI Model Inference Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>ESP32 Edge AI Prediction</Text>
              <StatusBadge label="FNN + K-Means" variant="demo" />
            </View>

            <View style={styles.predictionCard}>
              <View style={styles.predMainRow}>
                <View style={styles.predClassWrap}>
                  <Text style={styles.predMetaLabel}>INFESTATION RISK</Text>
                  <Text style={styles.predClassName}>{badgeInfo.label}</Text>
                </View>
                <StatusBadge label={badgeInfo.label} variant={badgeInfo.variant} />
              </View>

              {/* Metrics Grid from ESP32 */}
              <View style={styles.predMetricsGrid}>
                <View style={styles.predMetricBox}>
                  <Ionicons name="thermometer-outline" size={18} color={Colors.primaryGreen} />
                  <Text style={styles.predMetricValue}>{pestData.temperature}°C</Text>
                  <Text style={styles.predMetricLabel}>Air Temp</Text>
                </View>

                <View style={styles.predMetricBox}>
                  <Ionicons name="water-outline" size={18} color={Colors.info} />
                  <Text style={styles.predMetricValue}>{pestData.humidity}%</Text>
                  <Text style={styles.predMetricLabel}>Humidity</Text>
                </View>

                <View style={styles.predMetricBox}>
                  <Ionicons name="pulse-outline" size={18} color={Colors.warning} />
                  <Text style={styles.predMetricValue}>{pestData.anomaly_score.toFixed(2)}</Text>
                  <Text style={styles.predMetricLabel}>Anomaly Score</Text>
                </View>
              </View>

              {/* Anomaly Gatekeeper Indicator */}
              <View style={styles.anomalyGateRow}>
                <View style={styles.gatekeeperPill}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.gatekeeperText}>Gatekeeper Passed (&lt; 0.30 threshold)</Text>
                </View>
                <Text style={styles.lastUpdatedText}>Updated {pestData.last_telemetry_timestamp}</Text>
              </View>
            </View>
          </View>

          {/* C. Tracked Tomato Pest Species */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Tracked Tomato Pest Profiles</Text>
            <Text style={styles.sectionDesc}>
              Microclimate-driven infestation thresholds calibrated for Greenhouse Beta.
            </Text>

            {mockPestSpecies.map((pest) => (
              <TouchableOpacity
                key={pest.id}
                style={styles.speciesCard}
                onPress={() => setSelectedPest(selectedPest?.id === pest.id ? null : pest)}
                activeOpacity={0.7}
              >
                <View style={styles.speciesTopRow}>
                  <View style={styles.speciesTextWrap}>
                    <Text style={styles.speciesName}>{pest.name}</Text>
                    <Text style={styles.speciesScientific}>{pest.scientificName}</Text>
                  </View>
                  <StatusBadge
                    label={pest.riskLevel}
                    variant={pest.riskLevel === 'moderate' ? 'warning' : 'muted'}
                  />
                </View>

                <View style={styles.speciesConditionRow}>
                  <Text style={styles.speciesCondition}>
                    Opt: {pest.optimalTempRange} · {pest.optimalHumidityRange}
                  </Text>
                  <Ionicons
                    name={selectedPest?.id === pest.id ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.secondaryText}
                  />
                </View>

                {selectedPest?.id === pest.id && (
                  <View style={styles.speciesExpanded}>
                    <Text style={styles.speciesSubHeading}>Symptoms:</Text>
                    <Text style={styles.speciesDetailText}>{pest.symptoms}</Text>

                    <Text style={[styles.speciesSubHeading, { marginTop: 8 }]}>Bio-Remedy:</Text>
                    <Text style={styles.speciesRemedyText}>{pest.recommendedRemedy}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* D. Recent Spray History Log */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Spray Application Log</Text>
            {sprayHistory.map((event) => (
              <View key={event.id} style={styles.sprayHistoryItem}>
                <View style={styles.sprayHistoryTop}>
                  <View style={styles.sprayHistoryTag}>
                    <Ionicons name="shield-checkmark" size={14} color={Colors.primaryGreen} />
                    <Text style={styles.sprayEventId}>{event.id}</Text>
                  </View>
                  <Text style={styles.sprayEventTime}>{event.timestamp}</Text>
                </View>
                <Text style={styles.sprayEventNotes}>{event.notes}</Text>
                {event.lockout_active && (
                  <View style={styles.lockoutRemainingTag}>
                    <Ionicons name="time-outline" size={12} color="#B87516" />
                    <Text style={styles.lockoutRemainingText}>
                      Lockout Active ({event.lockout_hours_remaining}h remaining)
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ===================== TAB 2: FOLIAR DISEASE DIAGNOSTIC ===================== */}
      {activeSegment === 'disease' && (
        <View>
          <View style={styles.introCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primaryGreen} />
            <Text style={styles.introText}>
              Capture clear, well-lit photos of tomato foliage for deep learning disease classification.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Leaf Sample Photo</Text>

            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <View style={styles.previewOverlayActions}>
                  <TouchableOpacity
                    style={styles.actionBtnOverlay}
                    onPress={pickFromGallery}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Replace</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtnOverlay, styles.actionBtnRemove]}
                    onPress={() => {
                      setImageUri(null);
                      setDiseaseDiagnosis(null);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyPickerCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="camera-outline" size={36} color={Colors.secondaryText} />
                </View>
                <Text style={styles.emptyPickerTitle}>No Leaf Sample Selected</Text>
                <Text style={styles.emptyPickerDesc}>
                  Select a photo from your gallery or take a new one using your camera.
                </Text>
                <View style={styles.pickerButtonRow}>
                  <TouchableOpacity style={styles.sourceBtn} onPress={captureFromCamera}>
                    <Ionicons name="camera" size={18} color={Colors.primaryGreen} />
                    <Text style={styles.sourceBtnText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sourceBtn} onPress={pickFromGallery}>
                    <Ionicons name="images" size={18} color={Colors.primaryGreen} />
                    <Text style={styles.sourceBtnText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={Colors.primaryGreen} />
                <Text style={styles.loadingText}>Running MobileNetV2 Foliar Inference...</Text>
              </View>
            )}

            <PrimaryButton
              label="Analyze Foliar Image"
              onPress={handleAnalyzeLeaf}
              disabled={!imageUri || isLoading}
              loading={isLoading}
            />

            {diseaseDiagnosis && (
              <View style={styles.diagnosisResultCard}>
                <View style={styles.diagnosisHeader}>
                  <Ionicons name="alert-circle" size={20} color={Colors.warning} />
                  <Text style={styles.diagnosisTitle}>{diseaseDiagnosis.diseaseName}</Text>
                </View>
                <Text style={styles.confidenceText}>
                  Confidence: {(diseaseDiagnosis.confidence * 100).toFixed(1)}% · Severity:{' '}
                  {diseaseDiagnosis.severity.toUpperCase()}
                </Text>
                <Text style={styles.diagnosisBody}>{diseaseDiagnosis.diagnosis}</Text>

                <Text style={styles.recsHeading}>Recommended Interventions:</Text>
                {diseaseDiagnosis.recommendations.map((rec, idx) => (
                  <View key={idx} style={styles.recItem}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primaryGreen} />
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {/* ===================== LOG SPRAY APPLICATION MODAL ===================== */}
      <Modal visible={sprayModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="leaf" size={20} color={Colors.primaryGreen} />
                <Text style={styles.modalTitle}>Log Pesticide Spray</Text>
              </View>
              <TouchableOpacity onPress={() => setSprayModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Logging this treatment initiates the 24-Hour Spray–Irrigation Lockout in the Central
              Coordination Engine to prevent chemical wash-off.
            </Text>

            <Text style={styles.inputLabel}>Treatment Notes & Dosage:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Applied 25ml Neem Azal bio-pesticide to Zone-A1"
              placeholderTextColor={Colors.mutedText}
              value={sprayNotes}
              onChangeText={setSprayNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSprayModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleLogSpray}>
                <Text style={styles.modalConfirmText}>Confirm & Lock 24h</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEFEB',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.lg,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: Colors.cardBackground,
    ...Shadow.card,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  segmentTextActive: {
    color: Colors.primaryGreen,
    fontWeight: FontWeight.bold,
  },
  interlockCard: {
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    ...Shadow.card,
  },
  interlockCardLocked: {
    backgroundColor: '#FFF7F7',
    borderColor: '#F5C6C6',
  },
  interlockCardUnlocked: {
    backgroundColor: '#F5FAF6',
    borderColor: '#D7EBD9',
  },
  interlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  interlockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  interlockIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interlockIconLocked: {
    backgroundColor: '#FCEAEA',
  },
  interlockIconUnlocked: {
    backgroundColor: Colors.lightGreen,
  },
  interlockTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  interlockSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
  },
  interlockExplanation: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 17,
    marginBottom: Spacing.md,
  },
  logSprayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  logSprayBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: FontWeight.bold,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 2,
  },
  sectionHeading: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  sectionDesc: {
    fontSize: 12,
    color: Colors.mutedText,
    marginBottom: Spacing.md,
  },
  predictionCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    ...Shadow.card,
  },
  predMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  predMetaLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.mutedText,
    letterSpacing: 0.5,
  },
  predClassName: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginTop: 2,
  },
  predClassWrap: {
    flex: 1,
  },
  predMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  predMetricBox: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  predMetricValue: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginTop: 4,
  },
  predMetricLabel: {
    fontSize: 11,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  anomalyGateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
  },
  gatekeeperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  gatekeeperText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.darkGreen,
  },
  lastUpdatedText: {
    fontSize: 10,
    color: Colors.mutedText,
  },
  speciesCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  speciesTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  speciesTextWrap: {
    flex: 1,
  },
  speciesName: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  speciesScientific: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.secondaryText,
    marginTop: 1,
  },
  speciesConditionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  speciesCondition: {
    fontSize: 11,
    color: Colors.mutedText,
  },
  speciesExpanded: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  speciesSubHeading: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  speciesDetailText: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 16,
    marginTop: 2,
  },
  speciesRemedyText: {
    fontSize: 12,
    color: Colors.darkGreen,
    lineHeight: 16,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  sprayHistoryItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sprayHistoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sprayHistoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sprayEventId: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  sprayEventTime: {
    fontSize: 11,
    color: Colors.mutedText,
  },
  sprayEventNotes: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 16,
  },
  lockoutRemainingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  lockoutRemainingText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#B87516',
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    backgroundColor: Colors.lightGreen,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#D7EBD9',
  },
  introText: {
    flex: 1,
    fontSize: FontSize.secondary,
    color: Colors.darkGreen,
    lineHeight: 18,
  },
  emptyPickerCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.base,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F6F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyPickerTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  emptyPickerDesc: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 18,
  },
  pickerButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  sourceBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.darkGreen,
  },
  previewContainer: {
    borderRadius: Radius.hero,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: Spacing.base,
    ...Shadow.card,
  },
  previewImage: {
    width: '100%',
    height: 240,
  },
  previewOverlayActions: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtnOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(25, 37, 28, 0.8)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  actionBtnRemove: {
    backgroundColor: 'rgba(194, 61, 61, 0.85)',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: FontWeight.semibold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
  },
  diagnosisResultCard: {
    backgroundColor: '#FFFDF0',
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: '#FBE8A6',
    ...Shadow.card,
  },
  diagnosisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: '#9C6800',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
    marginBottom: 8,
  },
  diagnosisBody: {
    fontSize: 13,
    color: Colors.mainText,
    lineHeight: 18,
    marginBottom: 10,
  },
  recsHeading: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginBottom: 6,
  },
  recItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  recText: {
    flex: 1,
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalTitle: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 17,
    marginBottom: Spacing.base,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.mainText,
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: Spacing.lg,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  modalConfirmBtn: {
    flex: 2,
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
