import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import EmptyState from '../../components/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';
import { mockFertilizerStatus, mockFertilizerReminders } from '../../data/mockFertilizer';
import type { FertilizerReminder } from '../../types/fertilizer';
import { generateId } from '../../utils/formatters';

export default function FertilizerScreen() {
  const [reminders, setReminders] = useState<FertilizerReminder[]>(mockFertilizerReminders);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [formError, setFormError] = useState('');

  // Toggle completion in local React state
  const handleToggleTask = (id: string) => {
    setReminders((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' }
          : item
      )
    );
  };

  // Add reminder locally
  const handleAddReminder = () => {
    if (!newTitle.trim()) {
      setFormError('Please enter a reminder title.');
      return;
    }
    if (!newDate.trim()) {
      setFormError('Please enter a target date (e.g. "25 Oct").');
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Fertilizer & Nutrients</Text>
          <Text style={styles.pageSubtitle}>Schedule reminders & crop stage tracking</Text>
        </View>
        <View style={styles.mqttBadge}>
          <View style={styles.mqttDot} />
          <Text style={styles.mqttText}>MQTT: Online</Text>
        </View>
      </View>

      {/* 1. Crop Stage & Sensor Status Panel */}
      <View style={styles.section}>
        <View style={styles.cropCard}>
          <View style={styles.cropHeader}>
            <View style={styles.cropIconBox}>
              <Ionicons name="leaf" size={22} color={Colors.primaryGreen} />
            </View>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>Crop: {mockFertilizerStatus.crop}</Text>
              <Text style={styles.cropStage}>
                Current Growth Stage: <Text style={styles.stageHighlight}>{mockFertilizerStatus.growthStage}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.npkNoticeBox}>
            <View style={styles.npkNoticeHeader}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
              <Text style={styles.npkNoticeTitle}>NPK Nutrient Sensor</Text>
            </View>
            <Text style={styles.npkNoticeText}>
              Physical soil NPK probes are not installed on Edge Node 01. Nutrients are reported as unavailable.
            </Text>
          </View>

          {/* 3 Nutrient Readings Grid */}
          <View style={styles.nutrientGrid}>
            <View style={styles.nutrientBox}>
              <Text style={styles.nutrientSymbol}>N</Text>
              <Text style={styles.nutrientName}>Nitrogen</Text>
              <Text style={styles.nutrientStatus}>{mockFertilizerStatus.nitrogen.value}</Text>
            </View>
            <View style={styles.nutrientBox}>
              <Text style={styles.nutrientSymbol}>P</Text>
              <Text style={styles.nutrientName}>Phosphorus</Text>
              <Text style={styles.nutrientStatus}>{mockFertilizerStatus.phosphorus.value}</Text>
            </View>
            <View style={styles.nutrientBox}>
              <Text style={styles.nutrientSymbol}>K</Text>
              <Text style={styles.nutrientName}>Potassium</Text>
              <Text style={styles.nutrientStatus}>{mockFertilizerStatus.potassium.value}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Demonstration Reminders & Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View>
            <Text style={styles.sectionHeading}>Management Reminders</Text>
            <Text style={styles.sectionSubheading}>
              {pendingCount} pending demonstration reminder{pendingCount === 1 ? '' : 's'}
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
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Reminder</Text>
          </TouchableOpacity>
        </View>

        {reminders.length === 0 ? (
          <EmptyState
            iconName="calendar-outline"
            title="No Reminders Scheduled"
            body="Tap 'Add Reminder' above to create a task reminder for your greenhouse."
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
          * Note: Schedule tasks represent operational reminders for farm management, not agronomic dosage recipes.
        </Text>
      </View>

      {/* Add Reminder Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Farm Reminder</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Ionicons name="close" size={22} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Create a local reminder for inspection or crop management.
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
                placeholder="e.g. Inspect tomato foliage"
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
                placeholder="e.g. 26 October"
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
                label="Save Reminder"
                onPress={handleAddReminder}
                style={styles.saveBtn}
              />
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
    color: Colors.mutedText,
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: FontWeight.semibold,
  },
  cropCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  cropIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: FontSize.cardTitle,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  cropStage: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  stageHighlight: {
    fontWeight: FontWeight.bold,
    color: Colors.primaryGreen,
  },
  npkNoticeBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: '#FEEFC3',
  },
  npkNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  npkNoticeTitle: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.warning,
  },
  npkNoticeText: {
    fontSize: 12,
    color: '#7A4D05',
    lineHeight: 16,
  },
  nutrientGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  nutrientBox: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutrientSymbol: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: Colors.secondaryText,
  },
  nutrientName: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 2,
  },
  nutrientStatus: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedText,
    marginTop: 6,
    textAlign: 'center',
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
  statusPill: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
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
});
