import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockPestDashboard, mockPestSpecies, mockSprayHistory } from '../../data/mockPest';
import { PestDashboardData, PestSpecies, SprayEvent } from '../../types/pest';

// Crop Stage Definition
export type CropStageKey =
  | 'seed'
  | 'small_plants'
  | 'big_plants'
  | 'flowering'
  | 'fruit_setting'
  | 'harvest';

interface CropStageOption {
  key: CropStageKey;
  label: string;
  desc: string;
}

const CROP_STAGES: CropStageOption[] = [
  {
    key: 'seed',
    label: 'Seed / Planting Stage',
    desc: 'Germination & seedling nursery phase',
  },
  {
    key: 'small_plants',
    label: 'Small Plants (1–3 weeks)',
    desc: 'Initial vegetative growth; tender foliar shoots',
  },
  {
    key: 'big_plants',
    label: 'Big Plants (~6 weeks / pre-flowering)',
    desc: 'Rapid canopy expansion before flower initiation',
  },
  {
    key: 'flowering',
    label: 'Flowering (>45 days)',
    desc: 'Bloom stage; delicate flowers susceptible to thrips/mites',
  },
  {
    key: 'fruit_setting',
    label: 'Fruit Setting (>2 months)',
    desc: 'Green cluster development; vulnerable to fungal anthracnose',
  },
  {
    key: 'harvest',
    label: 'Harvest (>2 months 3 weeks)',
    desc: 'Ripening & picking; strict pre-harvest interval required',
  },
];

// Observation Report History Model
export interface ObservationReport {
  id: string;
  reportDate: string;
  cropStage: string;
  symptom: string;
  selectedChemical: string;
  notes: string;
  plantsPlanted?: number;
  photoAttached?: boolean;
}

const INITIAL_OBSERVATION_HISTORY: ObservationReport[] = [
  {
    id: 'REPORT-01',
    reportDate: '2026-10-15 09:30',
    cropStage: 'Big Plants',
    symptom: 'Leaf Miner',
    selectedChemical: 'Mig Abamectin',
    notes: 'Minor tunneling noticed on lower leaves.',
    plantsPlanted: 100,
    photoAttached: false,
  },
];

// Helper to get formatted current datetime (YYYY-MM-DD HH:mm)
const getCurrentFormattedDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export default function PlantHealthScreen() {
  // Navigation segment: 'pest' (Edge AI Pest Prediction) | 'report' (Pest / Disease Report)
  const [activeSegment, setActiveSegment] = useState<'pest' | 'report'>('pest');

  // ==================== TAB 1: Pest & Interlock State ====================
  const [pestData, setPestData] = useState<PestDashboardData>(mockPestDashboard);
  const [sprayHistory, setSprayHistory] = useState<SprayEvent[]>(mockSprayHistory);
  const [sprayModalVisible, setSprayModalVisible] = useState(false);
  const [sprayNotes, setSprayNotes] = useState('');
  const [selectedPest, setSelectedPest] = useState<PestSpecies | null>(null);

  // ==================== TAB 2: Pest / Disease Report State ====================
  const [reportDateTime, setReportDateTime] = useState<string>(getCurrentFormattedDateTime());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [tempDateInput, setTempDateInput] = useState('');

  // Observation Report History & Modals
  const [reportHistory, setReportHistory] = useState<ObservationReport[]>(INITIAL_OBSERVATION_HISTORY);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [safetyModalVisible, setSafetyModalVisible] = useState(false);
  const [pendingSprayReport, setPendingSprayReport] = useState<ObservationReport | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sorted in descending chronological order (Newest report at the top, Oldest at the bottom)
  const sortedReportHistory = useMemo(() => {
    return [...reportHistory].sort((a, b) => {
      const cmp = b.reportDate.localeCompare(a.reportDate);
      if (cmp !== 0) return cmp;
      return b.id.localeCompare(a.id);
    });
  }, [reportHistory]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Turn on spray handler - opens Safety Verification modal
  const handleTurnOnSpray = (report: ObservationReport) => {
    setPendingSprayReport(report);
    setSafetyModalVisible(true);
  };

  // Confirmed spray action
  const handleConfirmSpray = () => {
    if (!pendingSprayReport) return;
    const report = pendingSprayReport;
    setSafetyModalVisible(false);

    console.log(
      `[Pest Spray Engine] Activating spray for ${report.id} (${report.selectedChemical})`
    );
    showToast(`Sprayer command sent for ${report.selectedChemical}!`);

    // Engage 24h spray lockout in Tab 1 for interlock coordination
    const newSprayId = `SPRAY-${Date.now().toString().slice(-4)}`;
    const newSprayEvent: SprayEvent = {
      id: newSprayId,
      timestamp: 'Just now',
      notes: `Report ${report.id} application: ${report.selectedChemical}`,
      lockout_active: true,
      lockout_hours_remaining: 24.0,
    };
    setSprayHistory((prev) => [newSprayEvent, ...prev]);
    setPestData((prev) => ({
      ...prev,
      is_spray_lockout_active: true,
      lockout_remaining_hours: 24.0,
      last_spray_timestamp: 'Just now',
      system_state: 'INTERLOCK (24h Spray Lock Active)',
    }));
    setPendingSprayReport(null);
  };

  const handleCancelSpray = () => {
    setSafetyModalVisible(false);
    setPendingSprayReport(null);
  };

  // Form Fields
  const [plantCountInput, setPlantCountInput] = useState<string>('100');
  const [selectedCropStage, setSelectedCropStage] = useState<CropStageKey>('flowering');
  const [stageModalVisible, setStageModalVisible] = useState(false);

  const [selectedSymptom, setSelectedSymptom] = useState<string>('Leaf Miner');
  const [symptomModalVisible, setSymptomModalVisible] = useState(false);

  // Exclusive / Single chemical option selection (Radio behavior)
  const [selectedChemicalId, setSelectedChemicalId] = useState<string | null>('mig_abamectin');

  // Photo & Notes
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState<string>('');

  // Parse numeric plant count (default to 100 if invalid)
  const plantCount = useMemo(() => {
    const parsed = parseInt(plantCountInput.trim(), 10);
    return isNaN(parsed) || parsed <= 0 ? 100 : parsed;
  }, [plantCountInput]);

  // Dynamic Symptoms list strictly filtered by selected Crop Stage
  const availableSymptoms = useMemo((): string[] => {
    switch (selectedCropStage) {
      case 'seed':
      case 'small_plants':
        return [];
      case 'big_plants':
        return ['Leaf Miner', 'Unknown / Not Sure'];
      case 'flowering':
        return [
          'Leaf Curl',
          'Leaf Miner',
          'Unknown / Not Sure',
        ];
      case 'fruit_setting':
        return ['Anthracnose / Early Blight', 'Unknown / Not Sure'];
      case 'harvest':
        return ['Shoot & Fruit Borer', 'Unknown / Not Sure'];
      default:
        return [];
    }
  }, [selectedCropStage]);

  // When Crop Stage changes, reset selected symptom if not compatible
  const handleSelectCropStage = (stage: CropStageKey) => {
    setSelectedCropStage(stage);
    setStageModalVisible(false);

    // Compute new default symptom & chemical
    switch (stage) {
      case 'seed':
      case 'small_plants':
        setSelectedSymptom('');
        setSelectedChemicalId(null);
        break;
      case 'big_plants':
        setSelectedSymptom('Leaf Miner');
        setSelectedChemicalId('mig_abamectin');
        break;
      case 'flowering':
        setSelectedSymptom('Leaf Curl');
        setSelectedChemicalId('mig_abamectin');
        break;
      case 'fruit_setting':
        setSelectedSymptom('Anthracnose / Early Blight');
        setSelectedChemicalId('mancozeb_antracol');
        break;
      case 'harvest':
        setSelectedSymptom('Shoot & Fruit Borer');
        setSelectedChemicalId('coragen');
        break;
    }
  };

  // Dynamic Chemical Dosage Calculations based on plant count N
  interface ChemicalOption {
    id: string;
    name: string;
    activeIngredient: string;
    chemicalAmount: string;
    waterVolume: string;
    notes: string;
    caution?: string;
  }

  const recommendedChemicals = useMemo((): ChemicalOption[] => {
    const N = plantCount;
    const isHarvest = selectedCropStage === 'harvest';
    const isFlowering = selectedCropStage === 'flowering';

    // 1. If small plants or seed: no chemical spraying
    if (selectedCropStage === 'seed' || selectedCropStage === 'small_plants') {
      return [];
    }

    // 2. Leaf Miner or Leaf Curl
    if (
      selectedSymptom === 'Leaf Miner' ||
      selectedSymptom === 'Leaf Curl'
    ) {
      const chemA = Number(((7 / 100) * N).toFixed(1));
      const waterA = Number(((10 / 100) * N).toFixed(1));

      const chemB = Number(((30 / 100) * N).toFixed(1));
      const waterB = Number(((10 / 100) * N).toFixed(1));

      return [
        {
          id: 'mig_abamectin',
          name: 'Mig Abamectin',
          activeIngredient: 'Abamectin 1.8% EC',
          chemicalAmount: `${chemA} ml`,
          waterVolume: `${waterA} L`,
          notes: 'Rotate with Marshal 20 every 2 weeks to prevent chemical resistance.',
          caution: isFlowering
            ? '⚠️ Spray before full bloom; do not spray while flowers are open.'
            : undefined,
        },
        {
          id: 'marshal_20',
          name: 'Marshal 20',
          activeIngredient: 'Carbosulfan 20% SC',
          chemicalAmount: `${chemB} ml`,
          waterVolume: `${waterB} L`,
          notes: 'Broad-spectrum carbamate for stubborn sap-suckers and leafminers.',
          caution: isFlowering
            ? '⚠️ Spray before full bloom; do not spray while flowers are open.'
            : undefined,
        },
      ];
    }

    // 3. Anthracnose / Early Blight
    if (selectedSymptom === 'Anthracnose / Early Blight') {
      const chemGrams = Number(((20 / 100) * N).toFixed(1));
      const chemTsp = Number(((4 / 100) * N).toFixed(1));
      const waterL = Number(((10 / 100) * N).toFixed(1));

      return [
        {
          id: 'mancozeb_antracol',
          name: 'Jambo Mancozeb / Antracol Propineb',
          activeIngredient: 'Mancozeb 75% WP / Propineb 70% WP',
          chemicalAmount: `${chemGrams} g (approx ${chemTsp} tsp)`,
          waterVolume: `${waterL} L`,
          notes:
            'Protective contact fungicide. Thoroughly coat upper and lower foliage to halt lesion spread.',
        },
      ];
    }

    // 4. Shoot & Fruit Borer
    if (selectedSymptom === 'Shoot & Fruit Borer') {
      const chemMl = Number(((4 / 100) * N).toFixed(1));
      const waterL = Number(((16 / 100) * N).toFixed(1));

      return [
        {
          id: 'coragen',
          name: 'Coragen',
          activeIngredient: 'Chlorantraniliprole 18.5% SC',
          chemicalAmount: `${chemMl} ml`,
          waterVolume: `${waterL} L`,
          notes:
            'Highly potent ryanodine receptor activator for caterpillars and fruit borers.',
          caution: 'Pre-harvest interval (PHI): 3 days. Do not pick fruit within 72 hours.',
        },
      ];
    }

    // 5. Unknown / Not Sure
    if (selectedSymptom === 'Unknown / Not Sure') {
      if (!isHarvest) {
        // Broad spectrum Abamectin & Marshal
        const chemA = Number(((7 / 100) * N).toFixed(1));
        const waterA = Number(((10 / 100) * N).toFixed(1));
        const chemB = Number(((30 / 100) * N).toFixed(1));
        const waterB = Number(((10 / 100) * N).toFixed(1));

        return [
          {
            id: 'mig_abamectin',
            name: 'Mig Abamectin (Broad Spectrum)',
            activeIngredient: 'Abamectin 1.8% EC',
            chemicalAmount: `${chemA} ml`,
            waterVolume: `${waterA} L`,
            notes: 'General miticide & leafminer treatment. Alternate with Marshal 20 every 2 weeks.',
            caution: isFlowering
              ? '⚠️ Spray before full bloom; do not spray while flowers are open.'
              : undefined,
          },
          {
            id: 'marshal_20',
            name: 'Marshal 20 (Broad Spectrum)',
            activeIngredient: 'Carbosulfan 20% SC',
            chemicalAmount: `${chemB} ml`,
            waterVolume: `${waterB} L`,
            notes: 'Secondary option for general systemic insect protection.',
            caution: isFlowering
              ? '⚠️ Spray before full bloom; do not spray while flowers are open.'
              : undefined,
          },
        ];
      } else {
        // At harvest stage: only Coragen is permitted
        const chemMl = Number(((4 / 100) * N).toFixed(1));
        const waterL = Number(((16 / 100) * N).toFixed(1));

        return [
          {
            id: 'coragen',
            name: 'Coragen (Mandatory Harvest Treatment)',
            activeIngredient: 'Chlorantraniliprole 18.5% SC',
            chemicalAmount: `${chemMl} ml`,
            waterVolume: `${waterL} L`,
            notes:
              'Mandatory safe protocol during harvest stage. Minimizes residue risk while stopping fruit damage.',
            caution: 'Strict Pre-harvest interval (PHI): 3 days.',
          },
        ];
      }
    }

    return [];
  }, [plantCount, selectedCropStage, selectedSymptom]);

  // Radio button single-chemical selection (tapping a different chemical unchecks previous)
  const selectChemical = (id: string) => {
    setSelectedChemicalId((prev) => (prev === id ? null : id));
  };

  // Image capture & pickers
  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Access to gallery is required to select photos.');
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
      }
    } catch {
      Alert.alert('Error', 'Unable to open photo library.');
    }
  };

  const captureFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Unable to launch camera.');
    }
  };

  // Save Observation Report Handler
  const handleSaveObservationReport = () => {
    // Validation: Plant count
    if (plantCount <= 0) {
      Alert.alert('Invalid Plant Count', 'Please enter a valid positive number of plants.');
      return;
    }

    // Validation: Symptom selection when required
    if (
      selectedCropStage !== 'seed' &&
      selectedCropStage !== 'small_plants' &&
      !selectedSymptom
    ) {
      Alert.alert('Symptom Required', 'Please select the observed symptom or damage.');
      return;
    }

    // Determine chosen treatment (Single / Radio selection)
    const chosenChemical = recommendedChemicals.find((c) => c.id === selectedChemicalId);
    const newReportId = `REPORT-0${reportHistory.length + 1}`;

    const newReport: ObservationReport = {
      id: newReportId,
      reportDate: reportDateTime,
      cropStage: CROP_STAGES.find((s) => s.key === selectedCropStage)?.label || 'General',
      symptom: selectedSymptom || 'None (Preventative)',
      selectedChemical: chosenChemical ? chosenChemical.name : 'No spray required',
      notes: inspectionNotes.trim() || 'No additional notes',
      plantsPlanted: plantCount,
      photoAttached: !!imageUri,
    };

    // Live Local Append to History
    setReportHistory((prev) => [newReport, ...prev]);
    showToast(`Observation ${newReportId} added to History!`);

    const reportSummary = {
      reportDate: reportDateTime,
      plantsPlanted: plantCount,
      cropStage: CROP_STAGES.find((s) => s.key === selectedCropStage)?.label,
      symptomObserved: selectedSymptom || 'None (Preventative Stage)',
      recommendedTreatments: chosenChemical
        ? [
            {
              chemical: chosenChemical.name,
              dosage: `${chosenChemical.chemicalAmount} in ${chosenChemical.waterVolume} water`,
              notes: chosenChemical.notes,
            },
          ]
        : [],
      photoAttached: !!imageUri,
      notes: inspectionNotes.trim() || 'No additional notes',
    };

    // Console output for verification
    console.log('=== OBSERVATION REPORT SAVED ===', JSON.stringify(reportSummary, null, 2));

    const chemicalSummaryText = chosenChemical
      ? `• ${chosenChemical.name}: ${chosenChemical.chemicalAmount} in ${chosenChemical.waterVolume} water`
      : 'No chemical treatment selected.';

    Alert.alert(
      'Observation Report Saved',
      `Date: ${reportDateTime}\nPlants: ${plantCount}\nStage: ${
        CROP_STAGES.find((s) => s.key === selectedCropStage)?.label
      }\nSymptom: ${selectedSymptom || 'Normal'}\n\nPrescribed Treatment:\n${chemicalSummaryText}\n\nObservation appended to history successfully!`,
      [
        { text: 'View History', onPress: () => setHistoryModalVisible(true) },
        { text: 'OK' },
      ]
    );
  };

  // Helper for Tab 1 Infestation status styling
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
  const currentStageObj = CROP_STAGES.find((s) => s.key === selectedCropStage);

  return (
    <ScreenContainer>
      {/* 1. Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Pest & Plant Health</Text>
          <Text style={styles.pageSubtitle}>Edge AI Prediction & Field Observation Reports</Text>
        </View>
        <StatusBadge label="SIMULATED" variant="success" />
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
          style={[styles.segmentBtn, activeSegment === 'report' && styles.segmentBtnActive]}
          onPress={() => setActiveSegment('report')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="document-text"
            size={16}
            color={activeSegment === 'report' ? Colors.primaryGreen : Colors.secondaryText}
          />
          <Text
            style={[styles.segmentText, activeSegment === 'report' && styles.segmentTextActive]}
          >
            Pest / Disease Report
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
                : 'Irrigation can be scheduled or triggered without chemical conflict.'}
            </Text>
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

              <View style={styles.anomalyGateRow}>
                <View style={styles.gatekeeperPill}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                  <Text style={styles.gatekeeperText}>Gatekeeper Passed (&lt; 0.30 threshold)</Text>
                </View>
                <Text style={styles.lastUpdatedText}>
                  Updated {pestData.last_telemetry_timestamp}
                </Text>
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

      {/* ===================== TAB 2: PEST / DISEASE REPORT ===================== */}
      {activeSegment === 'report' && (
        <View style={styles.tabContent}>
          {/* Floating Toast Notification */}
          {toastMessage && (
            <View style={styles.floatingToast}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.floatingToastText}>{toastMessage}</Text>
              <TouchableOpacity
                style={styles.toastViewBtn}
                onPress={() => {
                  setToastMessage(null);
                  setHistoryModalVisible(true);
                }}
              >
                <Text style={styles.toastViewBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Top Utility: Highly Visible View History Button */}
          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => setHistoryModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.viewHistoryIconCircle}>
              <Ionicons name="time" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.viewHistoryTextGroup}>
              <Text style={styles.viewHistoryTitle}>Observation Report History</Text>
              <Text style={styles.viewHistorySubtitle}>
                View {sortedReportHistory.length} previous field scout logs
              </Text>
            </View>
            <View style={styles.viewHistoryBadge}>
              <Text style={styles.viewHistoryBadgeText}>{sortedReportHistory.length}</Text>
              <Ionicons name="chevron-forward" size={15} color={Colors.primaryGreen} />
            </View>
          </TouchableOpacity>

          {/* 1. Header & Recorded Date/Time Card */}
          <View style={styles.reportDateCard}>
            <View style={styles.dateIconWrap}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primaryGreen} />
            </View>
            <View style={styles.dateInfoWrap}>
              <Text style={styles.dateLabel}>RECORDED INSPECTION DATE & TIME</Text>
              <Text style={styles.dateValue}>{reportDateTime}</Text>
            </View>
            <TouchableOpacity
              style={styles.dateEditBtn}
              onPress={() => {
                setTempDateInput(reportDateTime);
                setDateModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={Colors.primaryGreen} />
              <Text style={styles.dateEditText}>Adjust</Text>
            </TouchableOpacity>
          </View>

          {/* 2. Number of Plants & Crop Stage Section */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionHeaderTitle}>Crop & Field Information</Text>

            {/* A. Number of Seeds/Plants Planted */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="leaf-outline" size={16} color={Colors.primaryGreen} />
                <Text style={styles.fieldLabel}>Number of Seeds / Plants Planted</Text>
              </View>
              <Text style={styles.fieldHelper}>
                Baseline plant count (default: 100). Chemical dosage calculates dynamically based on
                this value.
              </Text>

              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => {
                    const current = parseInt(plantCountInput, 10) || 100;
                    if (current > 10) setPlantCountInput(String(current - 10));
                  }}
                >
                  <Ionicons name="remove" size={18} color={Colors.darkGreen} />
                </TouchableOpacity>

                <TextInput
                  style={styles.plantNumberInput}
                  value={plantCountInput}
                  onChangeText={(val) => setPlantCountInput(val.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  placeholder="100"
                  placeholderTextColor={Colors.mutedText}
                />

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => {
                    const current = parseInt(plantCountInput, 10) || 100;
                    setPlantCountInput(String(current + 10));
                  }}
                >
                  <Ionicons name="add" size={18} color={Colors.darkGreen} />
                </TouchableOpacity>

                <View style={styles.plantCountBadge}>
                  <Text style={styles.plantCountBadgeText}>{plantCount} Plants</Text>
                </View>
              </View>
            </View>

            {/* B. Crop Stage Selector */}
            <View style={[styles.inputGroup, { marginTop: Spacing.md }]}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="git-branch-outline" size={16} color={Colors.primaryGreen} />
                <Text style={styles.fieldLabel}>Crop Growth Stage</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>

              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setStageModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeft}>
                  <Text style={styles.dropdownMainText}>{currentStageObj?.label}</Text>
                  <Text style={styles.dropdownHelperText}>{currentStageObj?.desc}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            {/* C. Visible Symptom / Damage Selector */}
            <View style={[styles.inputGroup, { marginTop: Spacing.md }]}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
                <Text style={styles.fieldLabel}>Visible Symptom / Pest Damage</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>

              {/* Notice for Small plants or Seed */}
              {selectedCropStage === 'seed' && (
                <View style={styles.infoNoticeBox}>
                  <Ionicons name="information-circle" size={18} color={Colors.info} />
                  <Text style={styles.infoNoticeText}>
                    Seed & germination stage. No active foliar pest symptoms applicable. Monitor
                    nursery dampness.
                  </Text>
                </View>
              )}

              {selectedCropStage === 'small_plants' && (
                <View style={[styles.infoNoticeBox, styles.infoNoticeWarning]}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.warning} />
                  <Text style={[styles.infoNoticeText, styles.infoNoticeWarningText]}>
                    Small Plants (1–3 weeks): Chemical spraying is NOT recommended at this stage
                    due to low risk. Focus on physical hygiene.
                  </Text>
                </View>
              )}

              {/* Dropdown for other stages */}
              {availableSymptoms.length > 0 && (
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  onPress={() => setSymptomModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dropdownLeft}>
                    <Text style={styles.dropdownMainText}>
                      {selectedSymptom || 'Select observed symptom...'}
                    </Text>
                    <Text style={styles.dropdownHelperText}>
                      Filtered for {currentStageObj?.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={20} color={Colors.secondaryText} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* 3. Dynamic Chemical Dosage & Recommendation Card */}
          {recommendedChemicals.length > 0 && (
            <View style={styles.cardSection}>
              <View style={styles.recCardHeader}>
                <View style={styles.recHeaderTitleWrap}>
                  <Ionicons name="flask" size={18} color={Colors.primaryGreen} />
                  <Text style={styles.sectionHeaderTitle}>
                    Dynamic Chemical Dosage Recommendation
                  </Text>
                </View>
                <StatusBadge label={`N = ${plantCount}`} variant="demo" />
              </View>

              <Text style={styles.recCardSubtitle}>
                Select recommended chemical treatment (single selection). Dilution quantities are dynamically calculated for exactly{' '}
                <Text style={{ fontWeight: FontWeight.bold, color: Colors.primaryGreen }}>
                  {plantCount} plants
                </Text>
                :
              </Text>

              {recommendedChemicals.map((chem) => {
                const isSelected = selectedChemicalId === chem.id;
                return (
                  <TouchableOpacity
                    key={chem.id}
                    style={[styles.chemicalItemCard, isSelected && styles.chemicalItemCardActive]}
                    onPress={() => selectChemical(chem.id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.chemTopRow}>
                      <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => selectChemical(chem.id)}
                      >
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={22}
                          color={isSelected ? Colors.primaryGreen : Colors.mutedText}
                        />
                      </TouchableOpacity>

                      <View style={styles.chemTitleWrap}>
                        <Text style={styles.chemName}>{chem.name}</Text>
                        <Text style={styles.chemActive}>{chem.activeIngredient}</Text>
                      </View>
                    </View>

                    {/* Calculated Dosage Box */}
                    <View style={styles.dosageCalculationBox}>
                      <View style={styles.dosageCol}>
                        <Text style={styles.dosageLabel}>CHEMICAL QUANTITY</Text>
                        <Text style={styles.dosageValue}>{chem.chemicalAmount}</Text>
                      </View>

                      <View style={styles.dosageDivider} />

                      <View style={styles.dosageCol}>
                        <Text style={styles.dosageLabel}>REQUIRED WATER VOLUME</Text>
                        <Text style={styles.dosageValue}>{chem.waterVolume}</Text>
                      </View>
                    </View>

                    {/* Notes & Precaution */}
                    <Text style={styles.chemNotes}>{chem.notes}</Text>
                    {chem.caution && (
                      <View style={styles.cautionBox}>
                        <Ionicons name="warning-outline" size={14} color="#C23D3D" />
                        <Text style={styles.cautionText}>{chem.caution}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* 4. Photo & Notes Section */}
          <View style={styles.cardSection}>
            <Text style={styles.sectionHeaderTitle}>Photo & Field Notes</Text>
            <Text style={styles.fieldHelper}>
              Attach a field observation photo and record inspection notes.
            </Text>

            {/* Image Preview / Picker */}
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
                    onPress={() => setImageUri(null)}
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
                  <Ionicons name="camera-outline" size={32} color={Colors.secondaryText} />
                </View>
                <Text style={styles.emptyPickerTitle}>No Observation Photo Attached</Text>
                <Text style={styles.emptyPickerDesc}>
                  Optional: Capture or upload a photo showing the pest damage or symptoms.
                </Text>
                <View style={styles.pickerButtonRow}>
                  <TouchableOpacity
                    style={styles.sourceBtn}
                    onPress={captureFromCamera}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera" size={18} color={Colors.primaryGreen} />
                    <Text style={styles.sourceBtnText}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sourceBtn}
                    onPress={pickFromGallery}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="images" size={18} color={Colors.primaryGreen} />
                    <Text style={styles.sourceBtnText}>Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Inspection Notes */}
            <View style={{ marginTop: Spacing.md }}>
              <View style={styles.inputLabelRow}>
                <Ionicons name="pencil-outline" size={16} color={Colors.secondaryText} />
                <Text style={styles.fieldLabel}>Inspection Notes (Optional)</Text>
              </View>
              <TextInput
                style={styles.multilineInput}
                placeholder="e.g. Observed on lower canopy near greenhouse entrance. Weather cloudy."
                placeholderTextColor={Colors.mutedText}
                value={inspectionNotes}
                onChangeText={setInspectionNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* 5. Primary Action Button */}
          <View style={{ marginTop: Spacing.sm, marginBottom: Spacing.xxl }}>
            <PrimaryButton
              label="Save Observation Report"
              onPress={handleSaveObservationReport}
              style={styles.submitReportBtn}
            />
          </View>
        </View>
      )}

      {/* ===================== CROP STAGE PICKER MODAL ===================== */}
      <Modal visible={stageModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Select Crop Growth Stage</Text>
              <TouchableOpacity onPress={() => setStageModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.mainText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {CROP_STAGES.map((stage) => {
                const isSelected = stage.key === selectedCropStage;
                return (
                  <TouchableOpacity
                    key={stage.key}
                    style={[styles.modalOptionItem, isSelected && styles.modalOptionSelected]}
                    onPress={() => handleSelectCropStage(stage.key)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.modalOptionTitle,
                          isSelected && { color: Colors.primaryGreen, fontWeight: FontWeight.bold },
                        ]}
                      >
                        {stage.label}
                      </Text>
                      <Text style={styles.modalOptionDesc}>{stage.desc}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primaryGreen} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===================== SYMPTOM PICKER MODAL ===================== */}
      <Modal visible={symptomModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Select Observed Symptom</Text>
              <TouchableOpacity onPress={() => setSymptomModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.mainText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubheading}>
              Filtered for {currentStageObj?.label}
            </Text>

            <ScrollView style={{ maxHeight: 320 }}>
              {availableSymptoms.map((sym) => {
                const isSelected = sym === selectedSymptom;
                return (
                  <TouchableOpacity
                    key={sym}
                    style={[styles.modalOptionItem, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setSelectedSymptom(sym);
                      setSymptomModalVisible(false);
                      if (sym === 'Anthracnose / Early Blight') {
                        setSelectedChemicalId('mancozeb_antracol');
                      } else if (sym === 'Shoot & Fruit Borer') {
                        setSelectedChemicalId('coragen');
                      } else if (sym === 'Leaf Miner' || sym === 'Leaf Curl') {
                        setSelectedChemicalId('mig_abamectin');
                      } else if (sym === 'Unknown / Not Sure') {
                        setSelectedChemicalId(selectedCropStage === 'harvest' ? 'coragen' : 'mig_abamectin');
                      } else {
                        setSelectedChemicalId(null);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalOptionTitle,
                        isSelected && { color: Colors.primaryGreen, fontWeight: FontWeight.bold },
                      ]}
                    >
                      {sym}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primaryGreen} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===================== ADJUST DATE/TIME MODAL ===================== */}
      <Modal visible={dateModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pickerModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeading}>Adjust Report Date & Time</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.mainText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldHelper}>
              Enter or update the inspection timestamp in `YYYY-MM-DD HH:mm` format:
            </Text>

            <TextInput
              style={styles.dateTextInput}
              value={tempDateInput}
              onChangeText={setTempDateInput}
              placeholder="YYYY-MM-DD HH:mm"
              placeholderTextColor={Colors.mutedText}
            />

            <View style={styles.dateQuickRow}>
              <TouchableOpacity
                style={styles.quickDateBtn}
                onPress={() => setTempDateInput(getCurrentFormattedDateTime())}
              >
                <Text style={styles.quickDateBtnText}>Set Current Time</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  if (tempDateInput.trim()) {
                    setReportDateTime(tempDateInput.trim());
                  }
                  setDateModalVisible(false);
                }}
              >
                <Text style={styles.modalConfirmText}>Save Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== OBSERVATION REPORT HISTORY MODAL ===================== */}
      <Modal visible={historyModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.historyModalCard}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.historyHeaderTitleWrap}>
                <View style={styles.historyModalIconWrap}>
                  <Ionicons name="time" size={20} color={Colors.primaryGreen} />
                </View>
                <View>
                  <Text style={styles.modalHeading}>Observation Report History</Text>
                  <Text style={styles.modalSubheadingNoMargin}>
                    {sortedReportHistory.length} scout observation records (Newest first)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                style={styles.modalCloseCircle}
              >
                <Ionicons name="close" size={20} color={Colors.mainText} />
              </TouchableOpacity>
            </View>

            {/* List of Report Cards */}
            <ScrollView
              style={styles.historyScrollView}
              contentContainerStyle={{ paddingBottom: Spacing.md }}
              showsVerticalScrollIndicator={false}
            >
              {sortedReportHistory.length === 0 ? (
                <View style={styles.emptyHistoryWrap}>
                  <Ionicons name="document-text-outline" size={40} color={Colors.mutedText} />
                  <Text style={styles.emptyHistoryText}>No observation records found.</Text>
                </View>
              ) : (
                sortedReportHistory.map((item) => {
                  const hasChemicalTreatment = Boolean(
                    item.selectedChemical &&
                      !item.selectedChemical.toLowerCase().includes('no spray') &&
                      item.selectedChemical !== 'None'
                  );

                  return (
                    <View key={item.id} style={styles.historyCardItem}>
                      {/* Top Row: ID & Date */}
                      <View style={styles.historyCardTopRow}>
                        <View style={styles.historyIdBadge}>
                          <Ionicons name="shield-checkmark" size={13} color={Colors.primaryGreen} />
                          <Text style={styles.historyIdText}>{item.id}</Text>
                        </View>
                        <Text style={styles.historyDateText}>{item.reportDate}</Text>
                      </View>

                      {/* Stage & Symptom Tags */}
                      <View style={styles.historyTagsRow}>
                        <View style={styles.historyStageTag}>
                          <Ionicons name="git-branch-outline" size={12} color={Colors.darkGreen} />
                          <Text style={styles.historyStageText}>{item.cropStage}</Text>
                        </View>
                        <View style={styles.historySymptomTag}>
                          <Ionicons name="alert-circle-outline" size={12} color="#A45B0A" />
                          <Text style={styles.historySymptomText}>{item.symptom}</Text>
                        </View>
                      </View>

                      {/* Chemical Treatment */}
                      <View style={styles.historyDetailRow}>
                        <Ionicons name="flask-outline" size={14} color={Colors.secondaryText} />
                        <Text style={styles.historyDetailLabel}>Treatment:</Text>
                        <Text style={styles.historyDetailValue}>{item.selectedChemical}</Text>
                      </View>

                      {/* Notes */}
                      {item.notes ? (
                        <View style={styles.historyNotesBox}>
                          <Text style={styles.historyNotesText}>"{item.notes}"</Text>
                        </View>
                      ) : null}

                      {/* Photo attached indicator */}
                      {item.photoAttached && (
                        <View style={styles.historyPhotoIndicator}>
                          <Ionicons name="image-outline" size={13} color={Colors.primaryGreen} />
                          <Text style={styles.historyPhotoText}>Photo attached</Text>
                        </View>
                      )}

                      {/* Turn on spray Button (Conditional) */}
                      {hasChemicalTreatment && (
                        <TouchableOpacity
                          style={styles.turnOnSprayBtn}
                          onPress={() => handleTurnOnSpray(item)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="water" size={16} color="#FFFFFF" />
                          <Text style={styles.turnOnSprayBtnText}>Turn on spray</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* Bottom Close Button */}
            <TouchableOpacity
              style={styles.historyCloseButton}
              onPress={() => setHistoryModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.historyCloseButtonText}>Close History</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===================== SAFETY VERIFICATION MODAL ===================== */}
      <Modal visible={safetyModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.safetyModalCard}>
            <View style={styles.safetyHeaderRow}>
              <View style={styles.safetyIconCircle}>
                <Ionicons name="warning" size={24} color="#C23D3D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.safetyTitle}>Safety Verification</Text>
                <Text style={styles.safetySubtitle}>Automated Chemical Sprayer</Text>
              </View>
              <TouchableOpacity onPress={handleCancelSpray} style={styles.modalCloseCircle}>
                <Ionicons name="close" size={18} color={Colors.mainText} />
              </TouchableOpacity>
            </View>

            <View style={styles.safetyNoticeBox}>
              <Text style={styles.safetyNoticeHeading}>Before activating the sprayer, please confirm:</Text>

              <View style={styles.safetyConditionRow}>
                <View style={styles.safetyStepNumber}>
                  <Text style={styles.safetyStepNumberText}>1</Text>
                </View>
                <Text style={styles.safetyConditionText}>
                  The chemical is mixed in the correct ratio and filled in the respective tank.
                </Text>
              </View>

              <View style={styles.safetyConditionRow}>
                <View style={styles.safetyStepNumber}>
                  <Text style={styles.safetyStepNumberText}>2</Text>
                </View>
                <Text style={styles.safetyConditionText}>
                  The greenhouse is completely empty (no personnel inside).
                </Text>
              </View>
            </View>

            {pendingSprayReport && (
              <View style={styles.safetyTreatmentPill}>
                <Ionicons name="flask" size={14} color={Colors.primaryGreen} />
                <Text style={styles.safetyTreatmentText}>
                  Target: {pendingSprayReport.selectedChemical} ({pendingSprayReport.id})
                </Text>
              </View>
            )}

            <View style={styles.safetyBtnRow}>
              <TouchableOpacity
                style={styles.safetyCancelBtn}
                onPress={handleCancelSpray}
                activeOpacity={0.7}
              >
                <Text style={styles.safetyCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.safetyConfirmBtn}
                onPress={handleConfirmSpray}
                activeOpacity={0.8}
              >
                <Ionicons name="water" size={16} color="#FFFFFF" />
                <Text style={styles.safetyConfirmText}>Confirm & Spray</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== LOG SPRAY APPLICATION MODAL (TAB 1) ===================== */}
      <Modal visible={sprayModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
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
              style={styles.multilineInput}
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

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => {
                  if (!sprayNotes.trim()) {
                    Alert.alert('Notes Required', 'Please enter a brief note.');
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
                    'Spray Lockout Engaged',
                    'Irrigation is blocked for 24 hours to prevent chemical runoff.'
                  );
                }}
              >
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
  tabContent: {
    marginBottom: Spacing.xl,
  },
  // Tab 2 Date Header Card
  reportDateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  dateIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dateInfoWrap: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.mutedText,
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginTop: 2,
  },
  dateEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  dateEditText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.darkGreen,
  },
  // Section container
  cardSection: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  sectionHeaderTitle: {
    fontSize: FontSize.sectionHeading - 2,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  inputGroup: {
    marginTop: Spacing.sm,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  requiredStar: {
    color: '#C23D3D',
    fontWeight: FontWeight.bold,
  },
  fieldHelper: {
    fontSize: 11,
    color: Colors.secondaryText,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7EBD9',
  },
  plantNumberInput: {
    width: 90,
    height: 40,
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  plantCountBadge: {
    marginLeft: 'auto',
    backgroundColor: '#EEF6F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  plantCountBadgeText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  dropdownLeft: {
    flex: 1,
  },
  dropdownMainText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  dropdownHelperText: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 2,
  },
  infoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoNoticeWarning: {
    backgroundColor: '#FEF3E2',
    borderColor: '#FBD38D',
  },
  infoNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  infoNoticeWarningText: {
    color: '#975A16',
    fontWeight: FontWeight.medium,
  },
  // Chemical Recommendations Card
  recCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  recCardSubtitle: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: Spacing.md,
    lineHeight: 17,
  },
  chemicalItemCard: {
    backgroundColor: '#FAFCFA',
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chemicalItemCardActive: {
    borderColor: Colors.primaryGreen,
    backgroundColor: '#FFFFFF',
    ...Shadow.card,
  },
  chemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkboxContainer: {
    padding: 2,
  },
  chemTitleWrap: {
    flex: 1,
  },
  chemName: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  chemActive: {
    fontSize: 11,
    color: Colors.secondaryText,
    fontStyle: 'italic',
  },
  dosageCalculationBox: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGreen,
    borderRadius: Radius.sm,
    padding: Spacing.sm + 2,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#D7EBD9',
  },
  dosageCol: {
    flex: 1,
    alignItems: 'center',
  },
  dosageDivider: {
    width: 1,
    backgroundColor: '#C5DEC7',
    marginHorizontal: 8,
  },
  dosageLabel: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
    letterSpacing: 0.5,
  },
  dosageValue: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
    marginTop: 3,
  },
  chemNotes: {
    fontSize: 11,
    color: Colors.secondaryText,
    lineHeight: 16,
    marginTop: Spacing.sm,
  },
  cautionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF2F2',
    padding: 8,
    borderRadius: Radius.sm,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FACBCB',
  },
  cautionText: {
    flex: 1,
    fontSize: 11,
    color: '#9B1C1C',
    lineHeight: 15,
    fontWeight: FontWeight.medium,
  },
  // Multiline & Notes
  multilineInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.mainText,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  submitReportBtn: {
    marginTop: Spacing.xs,
  },
  // Modal Pickers
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  pickerModalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    ...Shadow.card,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalHeading: {
    fontSize: FontSize.cardTitle + 2,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  modalSubheading: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: Spacing.md,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFCFA',
  },
  modalOptionSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: Colors.lightGreen,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  modalOptionDesc: {
    fontSize: 11,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  dateTextInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    marginTop: Spacing.sm,
  },
  dateQuickRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  quickDateBtn: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  quickDateBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
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
  // Tab 1 Styles
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F6F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyPickerTitle: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  emptyPickerDesc: {
    fontSize: 11,
    color: Colors.mutedText,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 240,
    lineHeight: 16,
  },
  pickerButtonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  sourceBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.darkGreen,
  },
  previewContainer: {
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: Spacing.base,
    ...Shadow.card,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewOverlayActions: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtnOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(25, 37, 28, 0.8)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  actionBtnRemove: {
    backgroundColor: 'rgba(194, 61, 61, 0.85)',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: FontWeight.semibold,
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
  // Floating Toast
  floatingToast: {
    backgroundColor: '#1E4D2B',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    marginBottom: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...Shadow.card,
  },
  floatingToastText: {
    flex: 1,
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  toastViewBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  toastViewBtnText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  // View History Button
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F8F4',
    borderRadius: Radius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1.5,
    borderColor: '#CDE5D2',
    ...Shadow.card,
  },
  viewHistoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  viewHistoryTextGroup: {
    flex: 1,
  },
  viewHistoryTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  viewHistorySubtitle: {
    fontSize: 11,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  viewHistoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  viewHistoryBadgeText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  // History Modal
  historyModalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    maxHeight: '85%',
    ...Shadow.card,
  },
  historyHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyModalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubheadingNoMargin: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  modalCloseCircle: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  historyScrollView: {
    marginTop: Spacing.md,
    maxHeight: 380,
  },
  emptyHistoryWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: 8,
  },
  emptyHistoryText: {
    fontSize: 13,
    color: Colors.mutedText,
  },
  historyCardItem: {
    backgroundColor: '#FAFCFA',
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  historyIdText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  historyDateText: {
    fontSize: 11,
    color: Colors.mutedText,
    fontWeight: FontWeight.medium,
  },
  historyTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  historyStageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  historyStageText: {
    fontSize: 11,
    color: Colors.darkGreen,
    fontWeight: FontWeight.semibold,
  },
  historySymptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  historySymptomText: {
    fontSize: 11,
    color: '#975A16',
    fontWeight: FontWeight.semibold,
  },
  historyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  historyDetailLabel: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  historyDetailValue: {
    fontSize: 12,
    color: Colors.primaryGreen,
    fontWeight: FontWeight.semibold,
    flex: 1,
  },
  historyNotesBox: {
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.sm,
    padding: 8,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryGreen,
  },
  historyNotesText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.secondaryText,
    lineHeight: 16,
  },
  historyPhotoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  historyPhotoText: {
    fontSize: 11,
    color: Colors.primaryGreen,
    fontWeight: FontWeight.medium,
  },
  turnOnSprayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryGreen,
    borderRadius: Radius.sm,
    paddingVertical: 9,
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.sm + 2,
    ...Shadow.card,
  },
  turnOnSprayBtnText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  historyCloseButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  historyCloseButtonText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  // Safety Verification Modal Styles
  safetyModalCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    ...Shadow.card,
  },
  safetyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  safetyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyTitle: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: '#9B1C1C',
  },
  safetySubtitle: {
    fontSize: 11,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  safetyNoticeBox: {
    backgroundColor: '#FFF8F8',
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#F8D7DA',
    marginBottom: Spacing.md,
  },
  safetyNoticeHeading: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#721C24',
    marginBottom: Spacing.sm,
  },
  safetyConditionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  safetyStepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C23D3D',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  safetyStepNumberText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  safetyConditionText: {
    flex: 1,
    fontSize: 12,
    color: Colors.mainText,
    lineHeight: 18,
    fontWeight: FontWeight.medium,
  },
  safetyTreatmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    marginBottom: Spacing.base,
    alignSelf: 'flex-start',
  },
  safetyTreatmentText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  safetyBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  safetyCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  safetyCancelText: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  safetyConfirmBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C23D3D',
    paddingVertical: 12,
    borderRadius: Radius.md,
    ...Shadow.card,
  },
  safetyConfirmText: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
