import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../components/StatusBadge';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../constants/theme';

export default function DiseaseResultScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="shield-checkmark" size={36} color={Colors.primaryGreen} />
          </View>

          <Text style={styles.title}>Model Integration Pending</Text>
          <StatusBadge label="Prototype Demo" variant="demo" style={styles.badge} />

          <Text style={styles.description}>
            Automated deep learning inference for tomato foliar diseases (such as Early Blight, Late Blight, or Leaf Mold) will run on the connected intelligence layer in subsequent development phases.
          </Text>

          <View style={styles.specsBox}>
            <Text style={styles.specsTitle}>Planned Specifications:</Text>
            <Text style={styles.specItem}>• Input format: 224x224 RGB image</Text>
            <Text style={styles.specItem}>• Architecture: MobileNetV2 / YOLOv8-Nano</Text>
            <Text style={styles.specItem}>• Edge runtime: TensorFlow Lite / Micro</Text>
            <Text style={styles.specItem}>• Latency target: &lt; 350 ms</Text>
          </View>

          <PrimaryButton
            label="Return to Plant Health"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.hero,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.card,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.bold,
    color: Colors.mainText,
    textAlign: 'center',
  },
  badge: {
    marginVertical: Spacing.sm,
  },
  description: {
    fontSize: FontSize.body,
    color: Colors.secondaryText,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  specsBox: {
    width: '100%',
    backgroundColor: '#F8FAF8',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specsTitle: {
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: Colors.darkGreen,
    marginBottom: 6,
  },
  specItem: {
    fontSize: 12,
    color: Colors.secondaryText,
    lineHeight: 18,
  },
  backBtn: {
    width: '100%',
  },
});
