import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';
import { mockNotifications } from '../data/mockNotifications';
import type { AppNotification } from '../types/notification';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
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
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notificationCard,
                    !item.read && styles.unreadCard,
                  ]}
                  onPress={() => markAsRead(item.id)}
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
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
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
});
