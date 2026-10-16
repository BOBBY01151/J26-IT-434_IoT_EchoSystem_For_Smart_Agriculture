import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../../components/ScreenContainer';
import StatusBadge from '../../components/StatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { Colors, FontSize, FontWeight, Spacing, Radius, Shadow } from '../../constants/theme';

export default function PlantHealthScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  // Pick image from phone gallery
  const pickFromGallery = async () => {
    try {
      setIsLoading(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'SmartFarm needs permission to access your photo library to select plant leaves for inspection.'
        );
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
        setAnalysisStatus(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to access photo library at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  // Capture image using phone camera
  const captureFromCamera = async () => {
    try {
      setIsLoading(true);
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'SmartFarm needs camera permission to capture plant leaf photos.'
        );
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
        setAnalysisStatus(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to launch camera on this device.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setAnalysisStatus(null);
  };

  const handleAnalyzeImage = () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select or capture a plant image first.');
      return;
    }

    setIsLoading(true);
    // Simulate brief processing delay for realistic UX feedback
    setTimeout(() => {
      setIsLoading(false);
      setAnalysisStatus(
        'Image ready for analysis. Disease detection will be available after the model integration is connected.'
      );
    }, 800);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Plant Health</Text>
          <Text style={styles.pageSubtitle}>Visual crop inspection & diagnostic prep</Text>
        </View>
        <StatusBadge label="Prototype" variant="demo" />
      </View>

      {/* Intro Guidance */}
      <View style={styles.introCard}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.primaryGreen} />
        <Text style={styles.introText}>
          Capture clear, well-lit photos of affected tomato leaves or stems for early symptom monitoring.
        </Text>
      </View>

      {/* Image Capture & Preview Area */}
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
                accessibilityRole="button"
                accessibilityLabel="Replace photo"
              >
                <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtnOverlay, styles.actionBtnRemove]}
                onPress={removeImage}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Remove photo"
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
            <Text style={styles.emptyPickerTitle}>No Image Selected</Text>
            <Text style={styles.emptyPickerDesc}>
              Select a photo from your gallery or take a new one using your camera.
            </Text>

            <View style={styles.pickerButtonRow}>
              <TouchableOpacity
                style={styles.sourceBtn}
                onPress={captureFromCamera}
                disabled={isLoading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Take photo with camera"
              >
                <Ionicons name="camera" size={18} color={Colors.primaryGreen} />
                <Text style={styles.sourceBtnText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sourceBtn}
                onPress={pickFromGallery}
                disabled={isLoading}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Choose from gallery"
              >
                <Ionicons name="images" size={18} color={Colors.primaryGreen} />
                <Text style={styles.sourceBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.primaryGreen} />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        )}

        {/* Primary Analyze Action */}
        <PrimaryButton
          label="Analyze Image"
          onPress={handleAnalyzeImage}
          disabled={!imageUri || isLoading}
          loading={isLoading}
          style={styles.analyzeBtn}
        />

        {/* Honest Analysis Demo Result Notice */}
        {analysisStatus && (
          <View style={styles.demoResultBox}>
            <View style={styles.demoResultHeader}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.info} />
              <Text style={styles.demoResultTitle}>Diagnostic Pipeline Status</Text>
            </View>
            <Text style={styles.demoResultBody}>{analysisStatus}</Text>
          </View>
        )}
      </View>

      {/* 3. Future Integration Specifications (Clearly Marked) */}
      <View style={styles.section}>
        <View style={styles.futureHeaderRow}>
          <Text style={styles.sectionHeading}>Upcoming Diagnostic Model</Text>
          <StatusBadge label="Future Phase" variant="muted" />
        </View>

        <View style={styles.futureCard}>
          <Text style={styles.futureIntro}>
            Once the edge or cloud classification model is integrated, automated inference will output:
          </Text>

          <View style={styles.futureItem}>
            <View style={styles.futureBullet}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primaryGreen} />
            </View>
            <View style={styles.futureTextWrap}>
              <Text style={styles.futureItemTitle}>Predicted Disease Class</Text>
              <Text style={styles.futureItemDesc}>
                e.g. Early Blight, Late Blight, Tomato Yellow Leaf Curl, or Healthy
              </Text>
            </View>
          </View>

          <View style={styles.futureItem}>
            <View style={styles.futureBullet}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primaryGreen} />
            </View>
            <View style={styles.futureTextWrap}>
              <Text style={styles.futureItemTitle}>Confidence Score</Text>
              <Text style={styles.futureItemDesc}>
                Model probability score (e.g., 94.6% model confidence)
              </Text>
            </View>
          </View>

          <View style={styles.futureItem}>
            <View style={styles.futureBullet}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primaryGreen} />
            </View>
            <View style={styles.futureTextWrap}>
              <Text style={styles.futureItemTitle}>Severity Assessment</Text>
              <Text style={styles.futureItemDesc}>
                Mild, moderate, or severe foliar damage categorization
              </Text>
            </View>
          </View>

          <View style={styles.futureItem}>
            <View style={styles.futureBullet}>
              <Ionicons name="checkmark-circle-outline" size={16} color={Colors.primaryGreen} />
            </View>
            <View style={styles.futureTextWrap}>
              <Text style={styles.futureItemTitle}>Agronomic Action Steps</Text>
              <Text style={styles.futureItemDesc}>
                Prescriptive next steps subject to university evaluator & specialist validation
              </Text>
            </View>
          </View>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeading: {
    fontSize: FontSize.sectionHeading,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
    marginBottom: Spacing.sm + 2,
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
    height: 260,
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
  analyzeBtn: {
    marginTop: Spacing.xs,
  },
  demoResultBox: {
    backgroundColor: '#EBF3FF',
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: '#D0E1FD',
  },
  demoResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoResultTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.info,
  },
  demoResultBody: {
    fontSize: FontSize.secondary,
    color: '#204770',
    lineHeight: 18,
  },
  futureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
  },
  futureCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.card,
    padding: Spacing.base,
    ...Shadow.card,
  },
  futureIntro: {
    fontSize: FontSize.secondary,
    color: Colors.mutedText,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  futureItem: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
  },
  futureBullet: {
    marginTop: 2,
  },
  futureTextWrap: {
    flex: 1,
  },
  futureItemTitle: {
    fontSize: 13,
    fontWeight: FontWeight.semibold,
    color: Colors.mainText,
  },
  futureItemDesc: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginTop: 1,
    lineHeight: 16,
  },
});
