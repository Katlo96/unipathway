import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radii = {
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
  pill: 9999,
};

const elevations = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1240;

export default function UploadResults() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() || 'light';

  const colors = useMemo(() => ({
    background: scheme === 'light' ? '#F8FCFD' : '#0A111A',
    surface: scheme === 'light' ? '#FFFFFF' : '#1A232E',
    surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#222B36',
    textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
    textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
    textMuted: scheme === 'light' ? '#7A919E' : '#7A919E',
    primary: '#4A9FC6',
    primaryText: '#FFFFFF',
    error: '#D32F2F',
    border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
    accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
  }), [scheme]);

  const uiMode = useMemo(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isDesktop = uiMode === 'desktop';

  const pagePadding = isMobile ? spacing(5) : spacing(8);
  const formWidth = isDesktop ? 480 : '100%';

  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const handlePickFile = async () => {
    setIsPicking(true);
    // Placeholder simulation (real picker removed as requested)
    setTimeout(() => {
      setFileName('results_certificate.pdf');
      setPreviewUri(null);
      setIsPicking(false);
      Alert.alert('File selected (simulation)', 'results_certificate.pdf selected.\nBackend upload coming later.');
    }, 800);
  };

  const handleClear = () => {
    setFileName(null);
    setPreviewUri(null);
  };

  const handleProcess = () => {
    if (!fileName) return;
    Alert.alert('Processing (simulation)', `Would process: ${fileName}\n(Backend integration placeholder)`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: pagePadding, paddingBottom: spacing(10) }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ maxWidth: isDesktop ? maxContentWidth : '100%', alignSelf: 'center', width: '100%' }}>
            <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
              Upload Results
            </Text>

            <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(6) }]}>
              Upload your certificate or statement to extract subjects and grades.
            </Text>

            <View style={[styles.uploadArea, { borderColor: colors.border }]}>
              {fileName ? (
                <>
                  <View style={styles.fileInfo}>
                    <Ionicons name="document-text-outline" size={40} color={colors.primary} />
                    <View style={{ marginLeft: spacing(4), flex: 1 }}>
                      <Text style={[typography.body, { color: colors.textPrimary }]} numberOfLines={1}>
                        {fileName}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textMuted }]}>
                        Ready to process (simulation)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <Pressable
                      onPress={handleClear}
                      style={({ pressed }) => [
                        styles.secondaryButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                      <Text style={[typography.body, { color: colors.error, marginLeft: spacing(2) }]}>
                        Remove
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleProcess}
                      style={({ pressed }) => [
                        styles.uploadButton,  // ← fixed: using existing style
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name="cloud-upload-outline" size={20} color={colors.primaryText} />
                      <Text style={[typography.body, { color: colors.primaryText, marginLeft: spacing(2) }]}>
                        Process File
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={60} color={colors.textMuted} />
                  <Text style={[typography.title, { color: colors.textPrimary, marginTop: spacing(4) }]}>
                    Drop your file here
                  </Text>
                  <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(2) }]}>
                    PDF or image of your results certificate
                  </Text>

                  <Pressable
                    onPress={handlePickFile}
                    disabled={isPicking}
                    style={({ pressed }) => [
                      styles.uploadButton,
                      pressed && styles.pressed,
                      isPicking && styles.disabled,
                      { marginTop: spacing(6) },
                    ]}
                  >
                    {isPicking ? (
                      <ActivityIndicator color={colors.primary} />
                    ) : (
                      <>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primaryText} />
                        <Text style={[typography.body, { color: colors.primaryText, marginLeft: spacing(2) }]}>
                          Select File
                        </Text>
                      </>
                    )}
                  </Pressable>
                </>
              )}
            </View>

            <View style={{ marginTop: spacing(6) }}>
              <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing(3) }]}>
                Supported Formats
              </Text>
              <View style={styles.formatChips}>
                <View style={styles.chip}>
                  <Ionicons name="document-text-outline" size={16} color={colors.textMuted} />
                  <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing(2) }]}>PDF</Text>
                </View>
                <View style={styles.chip}>
                  <Ionicons name="image-outline" size={16} color={colors.textMuted} />
                  <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing(2) }]}>JPG / PNG</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  uploadArea: {
    padding: spacing(6),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing(4),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing(3),
    width: '100%',
    marginTop: spacing(4),
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.md,
    backgroundColor: '#4A9FC6',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  formatChips: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(74,159,198,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74,159,198,0.3)',
  },
});