import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';
import { mockNotifications } from '../data/mockNotifications';
import type { AppNotification } from '../types/notification';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const handleNotificationPress = (item: AppNotification) => {
    markAsRead(item.id);
    if (item.type === 'critical_alert' || item.type === 'pest_alert') {
      setAlertModalVisible(true);
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIconForType = (type: AppNotification['type']) => {
    switch (type) {
      case 'critical_alert':
      case 'pest_alert':
        return { name: 'notifications', color: '#DC2626', bg: '#FEE2E2' };
      case 'warning':
        return { name: 'warning-outline', color: Colors.warning, bg: '#FEF3E2' };
      case 'success':
        return { name: 'checkmark-circle-outline', color: Colors.success, bg: '#E8F7ED' };
      case 'device':
        return { name: 'hardware-chip-outline', color: '#4F60AF', bg: '#EEF2FF' };
      default:
        return { name: 'information-circle-outline', color: Colors.info, bg: '#EBF3FF' };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.headline}>Activity & Notices</Text>
            <Text style={styles.subheadline}>
              {unreadCount > 0
                ? `${unreadCount} unread demonstration notice${unreadCount === 1 ? '' : 's'}`
                : 'All caught up'}
            </Text>
          </View>

          {notifications.length > 0 && (
            <View style={styles.topActions}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={markAllAsRead}
                  accessibilityRole="button"
                  accessibilityLabel="Mark all as read"
                >
                  <Text style={styles.actionBtnText}>Read all</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, styles.clearBtn]}
                onPress={clearAll}
                accessibilityRole="button"
                accessibilityLabel="Clear all notifications"
              >
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {notifications.length === 0 ? (
          <EmptyState
            iconName="notifications-off-outline"
            title="No Notifications"
            body="You have no notifications or automated alerts at this time."
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {notifications.map((item) => {
              const iconMeta = getIconForType(item.type);
              const isCritical = item.type === 'critical_alert' || item.type === 'pest_alert';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notificationCard,
                    !item.read && styles.unreadCard,
                    isCritical && !item.read && styles.criticalUnreadCard,
                  ]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${item.body}`}
                >
                  <View style={[styles.iconWrap, { backgroundColor: iconMeta.bg }]}>
                    <Ionicons name={iconMeta.name as any} size={20} color={iconMeta.color} />
                  </View>

                  <View style={styles.contentWrap}>
                    <View style={styles.cardHeaderRow}>
                      <Text
                        style={[
                          styles.itemTitle,
                          !item.read && styles.unreadTitle,
                          isCritical && !item.read && styles.criticalTitle,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {!item.read && (
                        <View
                          style={[
                            styles.unreadDot,
                            isCritical && styles.criticalDot,
                          ]}
                        />
                      )}
                    </View>

                    <Text style={styles.itemBody}>{item.body}</Text>
                    <Text style={styles.itemTime}>{item.timestamp}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.demoNotice}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.mutedText} />
              <Text style={styles.demoNoticeText}>
                These alerts are mock entries for evaluation and demo purposes.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* Severe Pest Risk Alert Popup Modal */}
        <Modal
          visible={alertModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAlertModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdropTouch}
              activeOpacity={1}
              onPress={() => setAlertModalVisible(false)}
            />
            <View style={styles.alertCard}>
              {/* Header */}
              <View style={styles.alertHeaderRow}>
                <View style={styles.alertTitleGroup}>
                  <View style={styles.alertBellWrap}>
                    <Ionicons name="notifications" size={18} color={Colors.danger} />
                  </View>
                  <Text style={styles.alertTitleText}>Severe Pest Risk Alert</Text>
                </View>
                <View style={styles.alertHeaderRight}>
                  <View style={styles.highPriorityBadge}>
                    <Text style={styles.highPriorityText}>HIGH PRIORITY</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setAlertModalVisible(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Close alert"
                  >
                    <Ionicons name="close" size={18} color={Colors.secondaryText} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Subtitle */}
              <Text style={styles.alertSubtitle}>Tomato Greenhouse A - Just now</Text>

              {/* Data Rows */}
              <View style={styles.alertDataBox}>
                <View style={styles.alertDataRow}>
                  <Text style={styles.alertDataLabel}>Predicted Risk</Text>
                  <Text style={styles.alertDataValueSevere}>Severe</Text>
                </View>

                <View style={styles.alertDataDivider} />

                <View style={styles.alertDataRow}>
                  <Text style={styles.alertDataLabel}>Spraying System</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>Awaiting Approval</Text>
                  </View>
                </View>
              </View>

              {/* Body */}
              <Text style={styles.alertBodyText}>
                Severe environmental pest risk detected. Inspect plants and verify the pest control chemical before treatment.
              </Text>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => {
                  setAlertModalVisible(false);
                  router.push('/(tabs)/plant-health');
                }}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Review Alert & Treatment"
              >
                <Text style={styles.reviewBtnText}>Review Alert & Treatment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headline: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  subheadline: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryGreen,
  },
  clearBtn: {
    backgroundColor: '#F3F6F3',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: FontWeight.medium,
    color: Colors.secondaryText,
  },
  scrollContent: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  unreadCard: {
    borderColor: '#CBE5D2',
    backgroundColor: '#FAFDFB',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryGreen,
    marginLeft: 6,
  },
  itemBody: {
    fontSize: FontSize.secondary,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
  itemTime: {
    fontSize: 11,
    color: Colors.mutedText,
    marginTop: 6,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.lg,
  },
  demoNoticeText: {
    fontSize: 11,
    color: Colors.mutedText,
  },
  criticalUnreadCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF8F8',
  },
  criticalTitle: {
    color: '#B91C1C',
  },
  criticalDot: {
    backgroundColor: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBackdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  alertCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  alertBellWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitleText: {
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
  },
  alertHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  highPriorityBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  highPriorityText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    backgroundColor: '#F3F6F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertSubtitle: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 2,
    marginBottom: 16,
  },
  alertDataBox: {
    backgroundColor: Colors.appBackground,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  alertDataDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  alertDataLabel: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: FontWeight.medium,
  },
  alertDataValueSevere: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: Colors.danger,
  },
  statusPill: {
    backgroundColor: '#EAEFEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  alertBodyText: {
    fontSize: 13,
    color: Colors.mainText,
    lineHeight: 20,
    marginBottom: 20,
  },
  reviewBtn: {
    backgroundColor: Colors.primaryGreen,
    paddingVertical: 14,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.card,
  },
  reviewBtnText: {
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});
