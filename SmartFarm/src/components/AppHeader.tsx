import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';
import FarmSelector from './FarmSelector';

interface AppHeaderProps {
  greeting?: string;
  subtitle?: string;
  greenhouseName?: string;
  unreadCount?: number;
  showFarmSelector?: boolean;
}

export default function AppHeader({
  greeting = 'Good morning',
  subtitle = "Here's your greenhouse overview.",
  greenhouseName = 'Tomato Greenhouse A',
  unreadCount = 3,
  showFarmSelector = true,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandGroup}>
          <View style={styles.brandBadge}>
            <Ionicons name="leaf" size={14} color={Colors.primaryGreen} />
            <Text style={styles.brandTitle}>SmartFarm</Text>
          </View>
          {showFarmSelector && (
            <FarmSelector selectedName={greenhouseName} />
          )}
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={Colors.mainText} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.greetingGroup}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.lightGreen,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
    letterSpacing: 0.3,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.cardBackground,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FontWeight.bold,
  },
  greetingGroup: {
    marginTop: Spacing.xs,
  },
  greetingText: {
    fontSize: FontSize.screenHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: FontSize.body,
    color: Colors.secondaryText,
    marginTop: 2,
  },
});
