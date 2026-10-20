import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';
import PrimaryButton from './PrimaryButton';
import type { CropGrowthStageKey, CropDetailsRecord } from '../types/farm';

export interface StageOption {
  key: CropGrowthStageKey;
  label: string;
  badgeLabel: string;
  daysRange: string;
  minDays: number;
  maxDays: number;
  desc: string;
  color: string;
  bgColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const CROP_STAGES_CONFIG: StageOption[] = [
  {
    key: 'seed',
    label: 'Seed / Planting',
    badgeLabel: 'Seed / Planting',
    daysRange: '0 days',
    minDays: 0,
    maxDays: 0,
    desc: 'Germination, seeding nursery phase & initial root radicle emergence.',
    color: '#795548',
    bgColor: '#EFEBE9',
    icon: 'leaf-outline',
  },
  {
    key: 'small_plants',
    label: 'Small Plants',
    badgeLabel: 'Small Plants (1–3 wks)',
    daysRange: '1 – 21 days',
    minDays: 1,
    maxDays: 21,
    desc: 'Initial vegetative development; tender foliar shoots and early leaf nodes.',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    icon: 'sparkles-outline',
  },
  {
    key: 'big_plants',
    label: 'Big Plants (pre-flowering)',
    badgeLabel: 'Big Plants (~6 wks)',
    daysRange: '22 – 44 days',
    minDays: 22,
    maxDays: 44,
    desc: 'Rapid canopy expansion, thick stem development, and branch proliferation.',
    color: '#00796B',
    bgColor: '#E0F2F1',
    icon: 'flower-outline',
  },
  {
    key: 'flowering',
    label: 'Flowering',
    badgeLabel: 'Flowering (>45 d)',
    daysRange: '45 – 60 days',
    minDays: 45,
    maxDays: 60,
    desc: 'Bloom initiation & active pollination; high nutrient and moisture demand.',
    color: '#E65100',
    bgColor: '#FFF3E0',
    icon: 'rose-outline',
  },
  {
    key: 'fruit_setting',
    label: 'Fruit Setting',
    badgeLabel: 'Fruit Setting (2+ mo)',
    daysRange: '61 – 75 days',
    minDays: 61,
    maxDays: 75,
    desc: 'Green cluster enlargement & fruit maturation; protect against anthracnose.',
    color: '#D84315',
    bgColor: '#FBE9E7',
    icon: 'nutrition-outline',
  },
  {
    key: 'harvest',
    label: 'Harvest',
    badgeLabel: 'Harvest (>75 d)',
    daysRange: '> 75 days',
    minDays: 76,
    maxDays: 9999,
    desc: 'Fruit ripening, color change & harvest picking; observe spray pre-harvest intervals.',
    color: '#880E4F',
    bgColor: '#FCE4EC',
    icon: 'basket-outline',
  },
];

/**
 * Calculates calendar day difference between planting date and current date
 */
export function calculateCropAge(plantingDateStr: string): number {
  if (!plantingDateStr) return 0;
  const parts = plantingDateStr.split('-');
  if (parts.length !== 3) return 0;

  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return 0;

  const planting = new Date(y, m, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = today.getTime() - planting.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Formats days into user-friendly age string (e.g. "42 Days / 6 Weeks")
 */
export function formatCropAgeText(days: number): string {
  if (days <= 0) return '0 Days (Planting Day)';
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;

  if (weeks === 0) {
    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
  }
  if (remainingDays === 0) {
    return `${days} Days / ${weeks} ${weeks === 1 ? 'Week' : 'Weeks'}`;
  }
  return `${days} Days / ${weeks}w ${remainingDays}d`;
}

/**
 * Evaluates estimated crop stage based on crop age in days
 */
export function getEstimatedCropStage(days: number): CropGrowthStageKey {
  if (days <= 0) return 'seed';
  if (days <= 21) return 'small_plants';
  if (days <= 44) return 'big_plants';
  if (days <= 60) return 'flowering';
  if (days <= 75) return 'fruit_setting';
  return 'harvest';
}

/**
 * Helper to format a Date object into YYYY-MM-DD
 */
function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Helper to compute date N days ago
 */
function getDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toISODateString(d);
}

interface CropGrowthTrackerProps {
  greenhouseName?: string;
  cropName?: string;
  initialPlantingDate?: string;
  initialSeedsPlanted?: number;
  initialFungicideApplied?: boolean;
  onSave?: (details: CropDetailsRecord) => void;
  onStageChange?: (stage: CropGrowthStageKey, stageLabel: string) => void;
  embedded?: boolean;
}

export default function CropGrowthTracker({
  greenhouseName = 'Tomato Greenhouse A',
  cropName = 'Tomato',
  initialPlantingDate = getDateDaysAgo(42), // Default ~6 weeks (Big Plants) for rich demo experience
  initialSeedsPlanted = 100,
  initialFungicideApplied = true,
  onSave,
  onStageChange,
  embedded = false,
}: CropGrowthTrackerProps) {
  // State 1: Planting Date
  const [plantingDate, setPlantingDate] = useState<string>(initialPlantingDate);
  const [tempPickerDate, setTempPickerDate] = useState<string>(initialPlantingDate);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  // Calendar navigator state for modal picker
  const [pickerNavMonth, setPickerNavMonth] = useState(() => {
    const parts = initialPlantingDate.split('-').map(Number);
    return new Date(parts[0] || new Date().getFullYear(), (parts[1] || 1) - 1, 1);
  });

  // State 2: Seeds Planted
  const [seedsPlantedText, setSeedsPlantedText] = useState<string>(String(initialSeedsPlanted));

  // State 3: Soil Fungicide Applied
  const [soilFungicideApplied, setSoilFungicideApplied] = useState<boolean>(initialFungicideApplied);

  // State 4 & 5: Dynamic Crop Age & Estimated Stage
  const cropAgeDays = useMemo(() => calculateCropAge(plantingDate), [plantingDate]);
  const cropAgeFormatted = useMemo(() => formatCropAgeText(cropAgeDays), [cropAgeDays]);
  const estimatedStageKey = useMemo(() => getEstimatedCropStage(cropAgeDays), [cropAgeDays]);

  const estimatedStageConfig = useMemo(
    () => CROP_STAGES_CONFIG.find((s) => s.key === estimatedStageKey) || CROP_STAGES_CONFIG[0],
    [estimatedStageKey]
  );

  // State 6: Actual Stage (Defaults to estimated stage when planting date changes)
  const [actualStageKey, setActualStageKey] = useState<CropGrowthStageKey>(estimatedStageKey);
  const [isActualStageDropdownVisible, setIsActualStageDropdownVisible] = useState(false);

  // Auto-sync actual stage when estimated stage changes upon planting date update
  useEffect(() => {
    setActualStageKey(estimatedStageKey);
    const cfg = CROP_STAGES_CONFIG.find((s) => s.key === estimatedStageKey);
    if (onStageChange && cfg) {
      onStageChange(estimatedStageKey, cfg.label);
    }
  }, [estimatedStageKey]);

  const actualStageConfig = useMemo(
    () => CROP_STAGES_CONFIG.find((s) => s.key === actualStageKey) || estimatedStageConfig,
    [actualStageKey, estimatedStageConfig]
  );

  // State 7: Last Updated timestamp
  const [lastUpdated, setLastUpdated] = useState<string>('Not yet saved');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Helpers for calendar modal
  const openDatePicker = () => {
    setTempPickerDate(plantingDate);
    const parts = plantingDate.split('-').map(Number);
    if (parts[0] && parts[1]) {
      setPickerNavMonth(new Date(parts[0], parts[1] - 1, 1));
    }
    setIsDatePickerVisible(true);
  };

  const confirmDatePicker = () => {
    if (!tempPickerDate) {
      Alert.alert('Invalid Date', 'Please select or enter a valid planting date.');
      return;
    }
    const todayStr = toISODateString(new Date());
    if (tempPickerDate > todayStr) {
      Alert.alert('Invalid Date', 'Planting date cannot be in the future.');
      return;
    }
    setPlantingDate(tempPickerDate);
    setIsDatePickerVisible(false);
  };

  const changeSeedsCount = (delta: number) => {
    const current = parseInt(seedsPlantedText, 10) || 0;
    const next = Math.max(1, current + delta);
    setSeedsPlantedText(String(next));
  };

  // Validation & Save Handler
  const handleSaveDetails = () => {
    // 1. Validate Planting Date
    if (!plantingDate || !/^\d{4}-\d{2}-\d{2}$/.test(plantingDate)) {
      Alert.alert('Required Field Missing', 'Please enter a valid planting date in YYYY-MM-DD format.');
      return;
    }

    const todayStr = toISODateString(new Date());
    if (plantingDate > todayStr) {
      Alert.alert('Invalid Planting Date', 'Planting date cannot be in the future.');
      return;
    }

    // 2. Validate Seeds Planted
    const seedsNum = parseInt(seedsPlantedText, 10);
    if (isNaN(seedsNum) || seedsNum <= 0) {
      Alert.alert('Invalid Seed Count', 'Please enter a valid positive number for seeds planted (minimum 1).');
      return;
    }

    // 3. Validate Actual Crop Stage
    if (!actualStageKey) {
      Alert.alert('Required Field Missing', 'Please select the actual crop stage.');
      return;
    }

    // Build saved timestamp
    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setLastUpdated(formattedTimestamp);

    const record: CropDetailsRecord = {
      greenhouseName,
      cropName,
      plantingDate,
      seedsPlanted: seedsNum,
      soilFungicideApplied,
      cropAgeDays,
      cropAgeFormatted,
      estimatedStage: estimatedStageKey,
      actualStage: actualStageKey,
      lastUpdated: formattedTimestamp,
    };

    if (onSave) {
      onSave(record);
    }

    if (onStageChange) {
      onStageChange(actualStageKey, actualStageConfig.label);
    }

    // Success feedback
    setSaveSuccessMsg(`Saved on ${formattedTimestamp}`);
    setTimeout(() => setSaveSuccessMsg(null), 4500);

    const overrideNotice =
      actualStageKey !== estimatedStageKey
        ? `\n• Stage Override: Confirmed as "${actualStageConfig.label}" (Timeline estimated "${estimatedStageConfig.label}")`
        : `\n• Stage: Matches estimated "${actualStageConfig.label}"`;

    Alert.alert(
      'Growth Profile Updated',
      `Agronomic parameters successfully logged for ${greenhouseName}:\n\n` +
        `• Crop: ${cropName}\n` +
        `• Planting Date: ${plantingDate} (${cropAgeFormatted})\n` +
        `• Population: ${seedsNum} seeds planted\n` +
        `• Fungicide Treated: ${soilFungicideApplied ? 'Yes (Protected)' : 'No (Untreated)'}` +
        `${overrideNotice}\n\n` +
        `Timestamp: ${formattedTimestamp}`,
      [{ text: 'OK' }]
    );
  };

  // Calendar Month Data Generator
  const calendarDays = useMemo(() => {
    const year = pickerNavMonth.getFullYear();
    const month = pickerNavMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const todayStr = toISODateString(new Date());

    const days: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isFuture: boolean;
      isToday: boolean;
    }> = [];

    // Preceding blanks
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dayNum: 0,
        dateStr: '',
        isCurrentMonth: false,
        isSelected: false,
        isFuture: false,
        isToday: false,
      });
    }

    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNum: d,
        dateStr,
        isCurrentMonth: true,
        isSelected: dateStr === tempPickerDate,
        isFuture: dateStr > todayStr,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [pickerNavMonth, tempPickerDate]);

  const navMonthName = pickerNavMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={embedded ? styles.embeddedContainer : styles.container}>
      {/* Section Header (Only shown when not embedded as an accordion child) */}
      {!embedded && (
        <View style={styles.sectionHeaderRow}>
          <View style={styles.titleWithIcon}>
            <View style={styles.headerIconBadge}>
              <Ionicons name="leaf" size={18} color={Colors.primaryGreen} />
            </View>
            <View>
              <Text style={styles.sectionHeading}>Crop Details & Growth Tracking</Text>
              <Text style={styles.sectionSubheading}>Dynamic growth lifecycle & baseline input tracking</Text>
            </View>
          </View>
        </View>
      )}

      {/* Main Interactive Card */}
      <View style={embedded ? styles.embeddedCard : styles.card}>
        {/* 1. READ-ONLY AUTO-FILLED FIELDS */}
        <View style={styles.groupHeader}>
          <Ionicons name="lock-closed-outline" size={13} color={Colors.mutedText} />
          <Text style={styles.groupHeaderText}>FACILITY IDENTIFIERS (READ-ONLY)</Text>
        </View>

        <View style={styles.readOnlyGrid}>
          <View style={styles.readOnlyBox}>
            <Text style={styles.fieldLabel}>Greenhouse Name</Text>
            <View style={styles.readOnlyValueRow}>
              <Ionicons name="business-outline" size={15} color={Colors.secondaryText} />
              <Text style={styles.readOnlyText} numberOfLines={1}>
                {greenhouseName}
              </Text>
            </View>
          </View>

          <View style={styles.readOnlyBox}>
            <Text style={styles.fieldLabel}>Crop Monitored</Text>
            <View style={styles.readOnlyValueRow}>
              <Text style={styles.readOnlyText} numberOfLines={1}>
                {cropName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* 2. USER INPUT FIELDS */}
        <View style={styles.groupHeader}>
          <Ionicons name="create-outline" size={13} color={Colors.primaryGreen} />
          <Text style={[styles.groupHeaderText, { color: Colors.primaryGreen }]}>
            BASELINE PLANTING PARAMETERS (REQUIRED)
          </Text>
        </View>

        {/* Field: Planting Date */}
        <View style={styles.inputBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>
              Planting Date <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.labelNote}>Used to derive age & stage</Text>
          </View>

          <TouchableOpacity
            style={styles.datePickerTrigger}
            onPress={openDatePicker}
            activeOpacity={0.7}
          >
            <View style={styles.dateValueWrapper}>
              <View style={styles.calendarIconBubble}>
                <Ionicons name="calendar" size={16} color={Colors.primaryGreen} />
              </View>
              <View>
                <Text style={styles.dateValueText}>{plantingDate}</Text>
                <Text style={styles.dateSubtext}>
                  {cropAgeDays === 0 ? 'Planted today' : `Planted ${cropAgeDays} days ago`}
                </Text>
              </View>
            </View>
            <View style={styles.changeDateBtn}>
              <Text style={styles.changeDateText}>Change</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primaryGreen} />
            </View>
          </TouchableOpacity>

          {/* Quick Date Presets */}
          <View style={styles.presetChipsRow}>
            <Text style={styles.presetLabel}>Quick Presets:</Text>
            <TouchableOpacity
              style={[styles.presetChip, plantingDate === getDateDaysAgo(0) && styles.presetChipActive]}
              onPress={() => setPlantingDate(getDateDaysAgo(0))}
            >
              <Text style={[styles.presetChipText, plantingDate === getDateDaysAgo(0) && styles.presetChipTextActive]}>
                Today (0d)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetChip, plantingDate === getDateDaysAgo(14) && styles.presetChipActive]}
              onPress={() => setPlantingDate(getDateDaysAgo(14))}
            >
              <Text style={[styles.presetChipText, plantingDate === getDateDaysAgo(14) && styles.presetChipTextActive]}>
                2 Wks (14d)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetChip, plantingDate === getDateDaysAgo(42) && styles.presetChipActive]}
              onPress={() => setPlantingDate(getDateDaysAgo(42))}
            >
              <Text style={[styles.presetChipText, plantingDate === getDateDaysAgo(42) && styles.presetChipTextActive]}>
                6 Wks (42d)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.presetChip, plantingDate === getDateDaysAgo(65) && styles.presetChipActive]}
              onPress={() => setPlantingDate(getDateDaysAgo(65))}
            >
              <Text style={[styles.presetChipText, plantingDate === getDateDaysAgo(65) && styles.presetChipTextActive]}>
                Fruit (~65d)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Field: Number of Seeds Planted */}
        <View style={styles.inputBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>
              Number of Seeds Planted <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.labelNote}>Baseline population</Text>
          </View>

          <View style={styles.numericInputRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => changeSeedsCount(-10)}
              activeOpacity={0.7}
            >
              <Ionicons name="remove" size={18} color={Colors.mainText} />
            </TouchableOpacity>

            <View style={styles.textInputWrap}>
              <TextInput
                style={styles.numericTextInput}
                value={seedsPlantedText}
                onChangeText={(val) => setSeedsPlantedText(val.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="100"
              />
              <Text style={styles.numericUnit}>seeds</Text>
            </View>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => changeSeedsCount(10)}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={18} color={Colors.mainText} />
            </TouchableOpacity>

            {/* Quick Seeds presets */}
            <View style={styles.seedPresetRow}>
              {[50, 100, 200, 500].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.seedPresetChip,
                    seedsPlantedText === String(preset) && styles.seedPresetChipActive,
                  ]}
                  onPress={() => setSeedsPlantedText(String(preset))}
                >
                  <Text
                    style={[
                      styles.seedPresetText,
                      seedsPlantedText === String(preset) && styles.seedPresetTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Field: Soil Fungicide Applied? (Yes/No) */}
        <View style={styles.inputBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>
              Soil Fungicide Applied? <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            <Text style={styles.labelNote}>Pre-planting seed/soil defense</Text>
          </View>

          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                soilFungicideApplied && styles.toggleOptionActiveYes,
              ]}
              onPress={() => setSoilFungicideApplied(true)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={soilFungicideApplied ? 'shield-checkmark' : 'shield-checkmark-outline'}
                size={18}
                color={soilFungicideApplied ? '#FFFFFF' : Colors.secondaryText}
              />
              <View style={styles.toggleTextGroup}>
                <Text
                  style={[
                    styles.toggleTitle,
                    soilFungicideApplied && styles.toggleTitleActiveYes,
                  ]}
                >
                  Yes, Applied
                </Text>
                <Text
                  style={[
                    styles.toggleSubtitle,
                    soilFungicideApplied && styles.toggleSubtitleActiveYes,
                  ]}
                >
                  Captan / Thiram pre-treated
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                !soilFungicideApplied && styles.toggleOptionActiveNo,
              ]}
              onPress={() => setSoilFungicideApplied(false)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={!soilFungicideApplied ? 'alert-circle' : 'alert-circle-outline'}
                size={18}
                color={!soilFungicideApplied ? '#FFFFFF' : Colors.secondaryText}
              />
              <View style={styles.toggleTextGroup}>
                <Text
                  style={[
                    styles.toggleTitle,
                    !soilFungicideApplied && styles.toggleTitleActiveNo,
                  ]}
                >
                  No, Untreated
                </Text>
                <Text
                  style={[
                    styles.toggleSubtitle,
                    !soilFungicideApplied && styles.toggleSubtitleActiveNo,
                  ]}
                >
                  Standard seedling bed
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* 3. AUTO-CALCULATED FIELDS */}
        <View style={styles.groupHeader}>
          <Ionicons name="calculator-outline" size={13} color={Colors.info} />
          <Text style={[styles.groupHeaderText, { color: Colors.info }]}>
            DYNAMIC AUTO-CALCULATED METRICS
          </Text>
        </View>

        <View style={styles.calcMetricsRow}>
          {/* Crop Age */}
          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>Calculated Crop Age</Text>
            <View style={styles.metricValueWrap}>
              <Text style={styles.metricMainValue}>{cropAgeDays}</Text>
              <Text style={styles.metricUnitText}>Days</Text>
            </View>
            <View style={styles.metricSubBadge}>
              <Ionicons name="time-outline" size={12} color={Colors.secondaryText} />
              <Text style={styles.metricSubBadgeText}>{cropAgeFormatted}</Text>
            </View>
          </View>

          {/* Estimated Stage */}
          <View style={styles.metricCard}>
            <Text style={styles.metricCardLabel}>Estimated Crop Stage</Text>
            <View
              style={[
                styles.stageBadgeDynamic,
                { backgroundColor: estimatedStageConfig.bgColor, borderColor: estimatedStageConfig.color },
              ]}
            >
              <Ionicons
                name={estimatedStageConfig.icon}
                size={16}
                color={estimatedStageConfig.color}
              />
              <Text style={[styles.stageBadgeDynamicText, { color: estimatedStageConfig.color }]}>
                {estimatedStageConfig.label}
              </Text>
            </View>
            <Text style={styles.stageRangeCaption}>Timeline: {estimatedStageConfig.daysRange}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* 4. VERIFICATION & SUBMISSION */}
        <View style={styles.groupHeader}>
          <Ionicons name="shield-checkmark-outline" size={13} color={Colors.mainText} />
          <Text style={styles.groupHeaderText}>FARMER VERIFICATION & OVERRIDE</Text>
        </View>

        {/* Actual Crop Stage Dropdown */}
        <View style={styles.inputBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>
              Actual Crop Stage <Text style={styles.requiredAsterisk}>*</Text>
            </Text>
            {actualStageKey !== estimatedStageKey ? (
              <View style={styles.overrideTag}>
                <Ionicons name="swap-horizontal" size={11} color="#C2410C" />
                <Text style={styles.overrideTagText}>Manual Override</Text>
              </View>
            ) : (
              <View style={styles.matchedTag}>
                <Ionicons name="checkmark-done" size={11} color={Colors.primaryGreen} />
                <Text style={styles.matchedTagText}>Matches Timeline</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.dropdownSelector}
            onPress={() => setIsActualStageDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownLeft}>
              <View
                style={[
                  styles.stageDot,
                  { backgroundColor: actualStageConfig.color },
                ]}
              />
              <View>
                <Text style={styles.dropdownSelectedLabel}>{actualStageConfig.label}</Text>
                <Text style={styles.dropdownSelectedDesc}>{actualStageConfig.daysRange}</Text>
              </View>
            </View>
            <View style={styles.dropdownRight}>
              <Text style={styles.changeDropdownText}>Select</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.secondaryText} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Last Updated Timestamp & Status */}
        <View style={styles.timestampContainer}>
          <View style={styles.timestampLeft}>
            <Ionicons name="sync-outline" size={14} color={Colors.mutedText} />
            <Text style={styles.timestampText}>Last Updated: {lastUpdated}</Text>
          </View>
          {saveSuccessMsg && (
            <View style={styles.inlineSuccessBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
              <Text style={styles.inlineSuccessText}>Saved</Text>
            </View>
          )}
        </View>

        {/* 5. PRIMARY SAVE ACTION BUTTON */}
        <View style={styles.actionBtnWrap}>
          <PrimaryButton
            label="Save / Update Crop Details"
            onPress={handleSaveDetails}
            style={styles.saveBtn}
          />
        </View>
      </View>

      {/* MODAL 1: INTERACTIVE CALENDAR DATE PICKER */}
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Planting Date</Text>
                <Text style={styles.modalSubtitle}>Pick when seeds were sown</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsDatePickerVisible(false)}
              >
                <Ionicons name="close" size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            {/* Quick Presets within Modal */}
            <View style={styles.modalPresetsRow}>
              {[
                { label: 'Today (0d)', days: 0 },
                { label: '3 Wks (21d)', days: 21 },
                { label: '6 Wks (42d)', days: 42 },
                { label: '8 Wks (56d)', days: 56 },
              ].map((p) => {
                const pDate = getDateDaysAgo(p.days);
                const isSelected = tempPickerDate === pDate;
                return (
                  <TouchableOpacity
                    key={p.days}
                    style={[styles.modalPresetChip, isSelected && styles.modalPresetChipActive]}
                    onPress={() => setTempPickerDate(pDate)}
                  >
                    <Text
                      style={[
                        styles.modalPresetChipText,
                        isSelected && styles.modalPresetChipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Month Navigation */}
            <View style={styles.calendarNavRow}>
              <TouchableOpacity
                style={styles.calendarNavArrow}
                onPress={() => {
                  setPickerNavMonth(
                    new Date(pickerNavMonth.getFullYear(), pickerNavMonth.getMonth() - 1, 1)
                  );
                }}
              >
                <Ionicons name="chevron-back" size={18} color={Colors.mainText} />
              </TouchableOpacity>
              <Text style={styles.calendarNavTitle}>{navMonthName}</Text>
              <TouchableOpacity
                style={styles.calendarNavArrow}
                onPress={() => {
                  setPickerNavMonth(
                    new Date(pickerNavMonth.getFullYear(), pickerNavMonth.getMonth() + 1, 1)
                  );
                }}
              >
                <Ionicons name="chevron-forward" size={18} color={Colors.mainText} />
              </TouchableOpacity>
            </View>

            {/* Days of Week Header */}
            <View style={styles.weekDaysRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd, i) => (
                <Text key={i} style={styles.weekDayHeader}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Calendar Day Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return <View key={idx} style={styles.emptyDayCell} />;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={cell.isFuture}
                    style={[
                      styles.dayCell,
                      cell.isSelected && styles.dayCellSelected,
                      cell.isToday && !cell.isSelected && styles.dayCellToday,
                      cell.isFuture && styles.dayCellDisabled,
                    ]}
                    onPress={() => setTempPickerDate(cell.dateStr)}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        cell.isSelected && styles.dayCellTextSelected,
                        cell.isToday && !cell.isSelected && styles.dayCellTextToday,
                        cell.isFuture && styles.dayCellTextDisabled,
                      ]}
                    >
                      {cell.dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Direct Input Row */}
            <View style={styles.manualInputRow}>
              <Text style={styles.manualInputLabel}>Manual Date:</Text>
              <TextInput
                style={styles.manualTextInput}
                value={tempPickerDate}
                onChangeText={setTempPickerDate}
                placeholder="YYYY-MM-DD"
                maxLength={10}
              />
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsDatePickerVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmDatePicker}>
                <Text style={styles.modalConfirmBtnText}>Apply Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ACTUAL CROP STAGE SELECTION DROPDOWN */}
      <Modal
        visible={isActualStageDropdownVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsActualStageDropdownVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Confirm Actual Crop Stage</Text>
                <Text style={styles.modalSubtitle}>Verify or override the auto-estimated stage</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsActualStageDropdownVisible(false)}
              >
                <Ionicons name="close" size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.stageListScroll}>
              {CROP_STAGES_CONFIG.map((stage) => {
                const isSelected = actualStageKey === stage.key;
                const isEstimated = estimatedStageKey === stage.key;

                return (
                  <TouchableOpacity
                    key={stage.key}
                    style={[
                      styles.stageOptionCard,
                      isSelected && styles.stageOptionCardSelected,
                    ]}
                    onPress={() => {
                      setActualStageKey(stage.key);
                      setIsActualStageDropdownVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.stageOptionTop}>
                      <View style={styles.stageOptionTitleGroup}>
                        <View style={[styles.stageOptionIconWrap, { backgroundColor: stage.bgColor }]}>
                          <Ionicons name={stage.icon} size={18} color={stage.color} />
                        </View>
                        <View>
                          <Text style={styles.stageOptionTitle}>{stage.label}</Text>
                          <Text style={styles.stageOptionRange}>Timeline: {stage.daysRange}</Text>
                        </View>
                      </View>

                      <View style={styles.stageBadgesGroup}>
                        {isEstimated && (
                          <View style={styles.estimatedPill}>
                            <Text style={styles.estimatedPillText}>Auto-Estimated</Text>
                          </View>
                        )}
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={isSelected ? Colors.primaryGreen : Colors.border}
                        />
                      </View>
                    </View>

                    <Text style={styles.stageOptionDesc}>{stage.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, { flex: 1 }]}
                onPress={() => setIsActualStageDropdownVisible(false)}
              >
                <Text style={styles.modalConfirmBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  embeddedContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionHeaderRow: {
    marginBottom: Spacing.sm + 2,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  headerIconBadge: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  sectionSubheading: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    ...Shadow.card,
  },
  embeddedCard: {
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm + 2,
  },
  groupHeaderText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.mutedText,
    letterSpacing: 0.6,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.base,
  },
  readOnlyGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  readOnlyBox: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: '#E9EFEA',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  requiredAsterisk: {
    color: Colors.danger,
    fontWeight: FontWeight.bold,
  },
  readOnlyValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  inputBlock: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelNote: {
    fontSize: 11,
    color: Colors.mutedText,
  },
  datePickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAF7',
    borderWidth: 1.5,
    borderColor: '#DCE8DE',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  dateValueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  calendarIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateValueText: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    letterSpacing: 0.3,
  },
  dateSubtext: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  changeDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeDateText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
  presetChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetLabel: {
    fontSize: 11,
    color: Colors.mutedText,
    fontWeight: FontWeight.medium,
  },
  presetChip: {
    backgroundColor: '#EFF3F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  presetChipActive: {
    backgroundColor: Colors.primaryGreen,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  numericInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#EFF3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#DCE8DE',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  numericTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    padding: 0,
  },
  numericUnit: {
    fontSize: 13,
    color: Colors.mutedText,
    marginLeft: 4,
  },
  seedPresetRow: {
    flexDirection: 'row',
    gap: 4,
  },
  seedPresetChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F0F4F1',
    borderRadius: 6,
  },
  seedPresetChipActive: {
    backgroundColor: Colors.primaryGreen,
  },
  seedPresetText: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  seedPresetTextActive: {
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  toggleOptionActiveYes: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  toggleOptionActiveNo: {
    backgroundColor: '#C23D3D',
    borderColor: '#C23D3D',
  },
  toggleTextGroup: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  toggleTitleActiveYes: {
    color: '#FFFFFF',
  },
  toggleTitleActiveNo: {
    color: '#FFFFFF',
  },
  toggleSubtitle: {
    fontSize: 10,
    color: Colors.mutedText,
    marginTop: 1,
  },
  toggleSubtitleActiveYes: {
    color: '#E8F5E9',
  },
  toggleSubtitleActiveNo: {
    color: '#FFEBEE',
  },
  calcMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F9FBF9',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E6EFE7',
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
    marginBottom: 6,
  },
  metricValueWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricMainValue: {
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  metricUnitText: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  metricSubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metricSubBadgeText: {
    fontSize: 11,
    color: Colors.secondaryText,
    fontWeight: FontWeight.medium,
  },
  stageBadgeDynamic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  stageBadgeDynamicText: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
  },
  stageRangeCaption: {
    fontSize: 10,
    color: Colors.mutedText,
    marginTop: 6,
  },
  overrideTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  overrideTagText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#C2410C',
  },
  matchedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchedTagText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#DCE8DE',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dropdownSelectedLabel: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  dropdownSelectedDesc: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 1,
  },
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeDropdownText: {
    fontSize: 12,
    color: Colors.secondaryText,
    fontWeight: FontWeight.medium,
  },
  timestampContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  timestampLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timestampText: {
    fontSize: 11,
    color: Colors.mutedText,
  },
  inlineSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inlineSuccessText: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  actionBtnWrap: {
    marginTop: Spacing.xs,
  },
  saveBtn: {
    borderRadius: Radius.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.base,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F5F3',
  },
  modalPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  modalPresetChip: {
    backgroundColor: '#EFF3F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  modalPresetChipActive: {
    backgroundColor: Colors.primaryGreen,
  },
  modalPresetChipText: {
    fontSize: 12,
    color: Colors.secondaryText,
    fontWeight: FontWeight.medium,
  },
  modalPresetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  calendarNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  calendarNavTitle: {
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  calendarNavArrow: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F4F7F4',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.mutedText,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  emptyDayCell: {
    width: `${100 / 7}%`,
    height: 38,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: Colors.primaryGreen,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primaryGreen,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    color: Colors.mainText,
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  dayCellTextToday: {
    color: Colors.primaryGreen,
    fontWeight: FontWeight.bold,
  },
  dayCellTextDisabled: {
    color: Colors.mutedText,
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  manualInputLabel: {
    fontSize: 12,
    color: Colors.secondaryText,
    fontWeight: FontWeight.medium,
  },
  manualTextInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#F8FAF8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    fontSize: 13,
    color: Colors.mainText,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  stageListScroll: {
    marginVertical: Spacing.sm,
  },
  stageOptionCard: {
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E5EBE5',
  },
  stageOptionCardSelected: {
    borderColor: Colors.primaryGreen,
    backgroundColor: '#F4FAF5',
  },
  stageOptionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stageOptionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    flex: 1,
  },
  stageOptionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageOptionTitle: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  stageOptionRange: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 1,
  },
  stageBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  estimatedPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  estimatedPillText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#4F60AF',
  },
  stageOptionDesc: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 16,
    paddingLeft: 42,
  },
});
