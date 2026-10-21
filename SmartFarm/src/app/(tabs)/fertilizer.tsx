import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import EmptyState from '../../components/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockFertilizerReminders } from '../../data/mockFertilizer';
import type { FertilizerReminder } from '../../types/fertilizer';
import { generateId } from '../../utils/formatters';

// Tomato Phenological Stages & Optimal NPK targets (mg/kg)
const CROP_STAGES = [
  { key: 'Seedling', label: 'Seedling', n: '100–140', p: '50–80', k: '120–160' },
  { key: 'Vegetative', label: 'Vegetative', n: '160–220', p: '60–100', k: '180–240' },
  { key: 'Flowering', label: 'Flowering (Active)', n: '140–180', p: '90–140', k: '240–320' },
  { key: 'Ripening', label: 'Ripening', n: '120–160', p: '80–120', k: '280–360' },
  { key: 'Harvest', label: 'Harvest', n: '100–140', p: '60–90', k: '200–260' },
];

export default function FertilizerScreen() {
  // Live NPK Telemetry from Arduino NPK Sensor via ESP-01
  const [nitrogen] = useState<number>(148); // mg/kg (Target: 140–180)
  const [phosphorus] = useState<number>(112); // mg/kg (Target: 90–140)
  const [potassium] = useState<number>(285); // mg/kg (Target: 240–320)
  const [soilMoisture] = useState<number>(31.4); // % VWC

  // Task reminders list
  const [reminders, setReminders] = useState<FertilizerReminder[]>([
    {
      id: 'rem-001',
      title: 'Apply Calcium Nitrate solution (Flowering boost)',
      date: '24 Oct',
      dateISO: '2026-10-24T09:00:00Z',
      status: 'pending',
      isDemo: true,
    },
    {
      id: 'rem-002',
      title: 'Potassium Sulfate foliar spray for fruit sizing',
      date: '28 Oct',
      dateISO: '2026-10-28T09:00:00Z',
      status: 'pending',
      isDemo: true,
    },
    {
      id: 'rem-003',
      title: 'Magnesium Sulfate root drench (Soil check)',
      date: '15 Oct',
      dateISO: '2026-10-15T09:00:00Z',
      status: 'completed',
      isDemo: true,
    },
  ]);

  // Modal form states
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Toggle task complete / pending
  const handleToggleTask = (id: string) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
          : item
      )
    );
  };

  // Add new task
  const handleAddReminder = () => {
    if (!newTitle.trim()) {
      setFormError('Please enter a task description.');
      return;
    }
    if (!newDate.trim()) {
      setFormError('Please enter a target date (e.g. "29 Oct").');
      return;
    }

    const newReminder: FertilizerReminder = {
      id: generateId('rem'),
      title: newTitle.trim(),
      date: newDate.trim(),
      dateISO: new Date().toISOString(),
      status: 'pending',
      isDemo: false,
    };

    setReminders([newReminder, ...reminders]);
    setNewTitle('');
    setNewDate('');
    setFormError('');
    setIsModalVisible(false);
  };

  const pendingCount = reminders.filter((r) => r.status === 'pending').length;

  return (
    <ScreenContainer>
      {/* ── 1. HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Fertilizer & Soil Nutrients</Text>
          <Text style={styles.pageSubtitle}>NPK sensor telemetry & crop stage schedule</Text>
        </View>

        {/* MQTT Connection Badge */}
        <View style={styles.mqttBadge}>
          <View style={styles.mqttDot} />
          <Text style={styles.mqttText}>MQTT: Online</Text>
        </View>
      </View>

      {/* ── 2. CROP & PHENOLOGICAL STAGE HERO CARD ── */}
      <View style={styles.section}>
        <View style={styles.cropCard}>
          <View style={styles.cropTopRow}>
            <View style={styles.cropIconBox}>
              <Ionicons name="leaf" size={22} color={Colors.primaryGreen} />
            </View>
            <View style={styles.cropTitleBlock}>
              <Text style={styles.cropTitle}>Tomato (Solanum lycopersicum)</Text>
              <Text style={styles.cropSubtitle}>
                Current Phase: <Text style={styles.stageHighlight}>Flowering Stage</Text>
              </Text>
            </View>
            <StatusBadge label="Flowering" variant="success" />
          </View>

          <View style={styles.cropDivider} />

          {/* Agronomic insight */}
          <View style={styles.agronomyNoteRow}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primaryGreen} />
            <Text style={styles.agronomyNoteText}>
              In flowering, potassium (K) and phosphorus (P) uptake surges to support blossom set and early fruit expansion.
            </Text>
          </View>

          {/* Anti-Leaching Safety Status Strip */}
          <View style={styles.interlockStrip}>
            <View style={styles.interlockLeft}>
              <View style={styles.interlockDot} />
              <Text style={styles.interlockTitle}>Anti-Leaching Guard: Armed & Safe</Text>
            </View>
            <Text style={styles.interlockDetail}>Soil moisture {soilMoisture}% {'<'} 85% limit</Text>
          </View>
        </View>
      </View>

      {/* ── 3. LIVE NPK SENSOR READINGS ── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={styles.sectionHeading}>Live NPK Telemetry</Text>
            <Text style={styles.sectionSubheading}>Arduino NPK Sensor via ESP-01 Bridge</Text>
          </View>
          <StatusBadge label="Sensors Active" variant="success" />
        </View>

        {/* 3 Nutrient Metric Cards */}
        <View style={styles.npkGrid}>
          {/* Nitrogen */}
          <View style={[styles.npkCard, { borderColor: '#C3E8CC' }]}>
            <View style={styles.npkCardTop}>
              <View style={[styles.elementSymbolBox, { backgroundColor: '#EAF7EE' }]}>
                <Text style={[styles.elementSymbol, { color: Colors.primaryGreen }]}>N</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#EAF7EE' }]}>
                <Text style={[styles.statusPillText, { color: Colors.primaryGreen }]}>Optimal</Text>
              </View>
            </View>
            <Text style={styles.npkValue}>
              {nitrogen} <Text style={styles.npkUnit}>mg/kg</Text>
            </Text>
            <Text style={styles.npkName}>Nitrogen</Text>
            <Text style={styles.npkTarget}>Flowering Target: 140–180</Text>
          </View>

          {/* Phosphorus */}
          <View style={[styles.npkCard, { borderColor: '#FEE2C8' }]}>
            <View style={styles.npkCardTop}>
              <View style={[styles.elementSymbolBox, { backgroundColor: '#FFF4EC' }]}>
                <Text style={[styles.elementSymbol, { color: Colors.warning }]}>P</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#FFF4EC' }]}>
                <Text style={[styles.statusPillText, { color: Colors.warning }]}>Optimal</Text>
              </View>
            </View>
            <Text style={styles.npkValue}>
              {phosphorus} <Text style={styles.npkUnit}>mg/kg</Text>
            </Text>
            <Text style={styles.npkName}>Phosphorus</Text>
            <Text style={styles.npkTarget}>Flowering Target: 90–140</Text>
          </View>

          {/* Potassium */}
          <View style={[styles.npkCard, { borderColor: '#C8DDF8' }]}>
            <View style={styles.npkCardTop}>
              <View style={[styles.elementSymbolBox, { backgroundColor: '#EBF3FF' }]}>
                <Text style={[styles.elementSymbol, { color: Colors.info }]}>K</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: '#EBF3FF' }]}>
                <Text style={[styles.statusPillText, { color: Colors.info }]}>Optimal</Text>
              </View>
            </View>
            <Text style={styles.npkValue}>
              {potassium} <Text style={styles.npkUnit}>mg/kg</Text>
            </Text>
            <Text style={styles.npkName}>Potassium</Text>
            <Text style={styles.npkTarget}>Flowering Target: 240–320</Text>
          </View>
        </View>

        {/* Sensor metadata note */}
        <View style={styles.telemetryMetaRow}>
          <Ionicons name="hardware-chip-outline" size={13} color={Colors.mutedText} />
          <Text style={styles.telemetryMetaText}>
            Telemetry received via MQTT topic: agro/out/mac/n, agro/out/mac/p, agro/out/mac/k
          </Text>
        </View>
      </View>

      {/* ── 4. STAGE NPK TARGET GUIDELINES ── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={styles.sectionHeading}>Tomato Growth Stage Targets</Text>
            <Text style={styles.sectionSubheading}>Recommended N-P-K concentration ranges</Text>
          </View>
        </View>

        <View style={styles.stageCard}>
          {CROP_STAGES.map((stg, idx) => {
            const isActive = stg.key === 'Flowering';
            return (
              <View
                key={stg.key}
                style={[
                  styles.stageRow,
                  isActive && styles.stageRowActive,
                  idx === CROP_STAGES.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.stageLabelWrap}>
                  <View style={[styles.stageIndicatorDot, isActive && styles.stageIndicatorDotActive]} />
                  <Text style={[styles.stageLabelText, isActive && styles.stageLabelTextActive]}>
                    {stg.label}
                  </Text>
                </View>
                <View style={styles.stageTargetWrap}>
                  <Text style={[styles.stageTargetNumbers, isActive && styles.stageTargetNumbersActive]}>
                    N: {stg.n} · P: {stg.p} · K: {stg.k} mg/kg
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 5. FARMER MANAGEMENT TASKS & REMINDERS ── */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={styles.sectionHeading}>Fertilizer Schedule & Tasks</Text>
            <Text style={styles.sectionSubheading}>
              {pendingCount} pending task{pendingCount === 1 ? '' : 's'} scheduled
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setFormError('');
              setIsModalVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Add reminder"
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {reminders.length === 0 ? (
          <EmptyState
            iconName="calendar-outline"
            title="No Tasks Scheduled"
            body="Tap 'Add Task' to schedule fertilizer or foliar spray application."
          />
        ) : (
          <View style={styles.card}>
            {reminders.map((task, index) => {
              const isCompleted = task.status === 'completed';
              return (
                <View
                  key={task.id}
                  style={[
                    styles.reminderItem,
                    index < reminders.length - 1 && styles.itemBorder,
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.checkbox, isCompleted && styles.checkboxActive]}
                    onPress={() => handleToggleTask(task.id)}
                    activeOpacity={0.7}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isCompleted }}
                    accessibilityLabel={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
                  >
                    {isCompleted && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      <Ionicons name="calendar-outline" size={12} color={Colors.mutedText} />
                      <Text style={styles.taskDate}>{task.date}</Text>
                      {task.isDemo && (
                        <View style={styles.demoTag}>
                          <Text style={styles.demoTagText}>Demo</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.statusPill,
                      isCompleted ? styles.statusPillDone : styles.statusPillPending,
                    ]}
                  >
                    {isCompleted ? 'Done' : 'Pending'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.disclaimerText}>
          * Tasks help maintain optimal crop nutrition and synchronize with field NPK sensor levels.
        </Text>
      </View>

      {/* ── 6. ADD TASK MODAL ── */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Fertilizer Task</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Ionicons name="close" size={22} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Create a custom reminder for soil feeding or foliar application.
            </Text>

            {formError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color={Colors.danger} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Task Description</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Apply Potassium Sulfate foliar spray"
                placeholderTextColor={Colors.mutedText}
                value={newTitle}
                onChangeText={(text) => {
                  setNewTitle(text);
                  if (formError) setFormError('');
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Target Date</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 28 October"
                placeholderTextColor={Colors.mutedText}
                value={newDate}
                onChangeText={(text) => {
                  setNewDate(text);
                  if (formError) setFormError('');
                }}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton
                label="Save Task"
                onPress={handleAddReminder}
                style={styles.saveBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ── 7. SYSTEM HARDWARE & ARCHITECTURE FOOTER ── */}
      <View style={styles.systemFooter}>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>Arduino NPK Sensor</Text>
        </View>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>ESP-01 Bridge</Text>
        </View>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>Anti-Leaching Guard</Text>
        </View>
        <View style={styles.footerChip}>
          <View style={[styles.footerDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.footerChipText}>Tomato Flowering Targets</Text>
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
  sectionSubheading: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },

  // ── Crop Hero Card ──
  cropCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    ...Shadow.card,
  },
  cropTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cropIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropTitleBlock: {
    flex: 1,
  },
  cropTitle: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  cropSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  stageHighlight: {
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  cropDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  agronomyNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: Colors.lightGreen,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  agronomyNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.darkGreen,
    lineHeight: 17,
  },
  interlockStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEF3EE',
  },
  interlockLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interlockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  interlockTitle: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  interlockDetail: {
    fontSize: 11,
    color: Colors.mutedText,
  },

  // ── NPK Grid ──
  npkGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  npkCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.md,
    borderWidth: 1,
    ...Shadow.card,
  },
  npkCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  elementSymbolBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementSymbol: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  npkValue: {
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  npkUnit: {
    fontSize: 11,
    fontWeight: FontWeight.regular,
    color: Colors.mutedText,
  },
  npkName: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    marginTop: 2,
  },
  npkTarget: {
    fontSize: 10,
    color: Colors.mutedText,
    marginTop: 2,
  },
  telemetryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    paddingHorizontal: 2,
  },
  telemetryMetaText: {
    fontSize: 11,
    color: Colors.mutedText,
  },

  // ── Stage Targets Card ──
  stageCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3EE',
  },
  stageRowActive: {
    backgroundColor: '#F5FBF6',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderBottomWidth: 0,
  },
  stageLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  stageIndicatorDotActive: {
    backgroundColor: Colors.primaryGreen,
  },
  stageLabelText: {
    fontSize: 13,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  stageLabelTextActive: {
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  stageTargetWrap: {
    alignItems: 'flex-end',
  },
  stageTargetNumbers: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  stageTargetNumbersActive: {
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },

  // ── Tasks / Reminders ──
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: FontWeight.semibold,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.base,
    ...Shadow.card,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.md,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primaryGreen,
    borderColor: Colors.primaryGreen,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.mutedText,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  taskDate: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  demoTag: {
    backgroundColor: '#F0F3F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  demoTagText: {
    fontSize: 10,
    color: Colors.secondaryText,
    fontWeight: FontWeight.medium,
  },
  statusPillDone: {
    backgroundColor: '#E8F7ED',
    color: Colors.success,
  },
  statusPillPending: {
    backgroundColor: '#FEF3E2',
    color: Colors.warning,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 380,
    ...Shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  modalSubtitle: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 4,
    marginBottom: Spacing.base,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FCEAEA',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: FontWeight.medium,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    fontSize: FontSize.body,
    color: Colors.mainText,
    backgroundColor: '#FAFAF8',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.secondaryText,
  },
  saveBtn: {
    flex: 1,
  },

  // ── Footer ──
  systemFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
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
