import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
  useStudentMenu,
} from '../../components/student/StudentMenu';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

type ThemeColors = {
  appBg: string;
  surface: string;
  surfaceMuted: string;
  card: string;
  cardAlt: string;
  primary: string;
  primarySoft: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  borderStrong: string;
  danger: string;
  dangerSoft: string;
  white: string;
};

const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  section: { fontSize: 16, lineHeight: 22, fontWeight: '800' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

const radii = {
  sm: spacing(3),
  md: spacing(4),
  lg: spacing(5),
  xl: spacing(6),
  pill: 999,
};

const MAX_DESKTOP_WIDTH = 1240;
const MIN_TAP = 44;

function getBreakpoint(width: number): Breakpoint {
  if (width < 480) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function getPressableState(state: PressableStateCallbackType) {
  const hovered = (state as any).hovered === true;
  return { pressed: state.pressed, hovered };
}

function getColors(scheme: 'light' | 'dark'): ThemeColors {
  const light = scheme === 'light';

  return {
    appBg: light ? '#F4F8FB' : '#081018',
    surface: light ? '#FFFFFF' : '#121C26',
    surfaceMuted: light ? '#EEF4F7' : '#182430',
    card: light ? '#FFFFFF' : '#16202B',
    cardAlt: light ? '#F7FBFD' : '#1A2632',
    primary: '#57AFC2',
    primarySoft: light ? 'rgba(87,175,194,0.14)' : 'rgba(87,175,194,0.22)',
    text: light ? '#0B0F12' : '#EAF2F8',
    textMuted: light ? 'rgba(11,15,18,0.72)' : 'rgba(234,242,248,0.78)',
    textSoft: light ? 'rgba(11,15,18,0.55)' : 'rgba(234,242,248,0.58)',
    border: light ? 'rgba(11,15,18,0.08)' : 'rgba(234,242,248,0.12)',
    borderStrong: light ? 'rgba(11,15,18,0.12)' : 'rgba(234,242,248,0.18)',
    danger: '#C0392B',
    dangerSoft: light ? 'rgba(192,57,43,0.10)' : 'rgba(192,57,43,0.18)',
    white: '#FFFFFF',
  };
}

function getElevation(scheme: 'light' | 'dark'): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: scheme === 'light' ? 0.08 : 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: scheme === 'light' ? 3 : 2,
    },
    web: {
      boxShadow:
        scheme === 'light'
          ? '0 10px 28px rgba(0,0,0,0.08)'
          : '0 10px 28px rgba(0,0,0,0.28)',
    } as any,
    default: {},
  }) as ViewStyle;
}

export default function UploadResultsScreen() {
  return (
    <StudentMenuProvider>
      <UploadResultsContent />
    </StudentMenuProvider>
  );
}

function UploadResultsContent() {
  const { width, height } = useWindowDimensions();
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => getColors(scheme), [scheme]);
  const elevation = useMemo(() => getElevation(scheme), [scheme]);
  const bp = useMemo(() => getBreakpoint(width), [width]);
  const { openMenu } = useStudentMenu();

  const ui = useMemo(() => {
    const isMobile = bp === 'mobile';
    const isTablet = bp === 'tablet';
    const isDesktop = bp === 'desktop';

    return {
      isMobile,
      isTablet,
      isDesktop,
      shellWidth: isDesktop ? Math.min(MAX_DESKTOP_WIDTH, width - spacing(8) * 2) : width,
      shellHeight: isDesktop ? Math.min(980, Math.round(height * 0.92)) : height,
      shellRadius: isDesktop ? radii.xl : 0,
      shellPadding: isDesktop ? spacing(7) : 0,
      padX: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4),
      padY: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(5),
      gap: isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
      railWidth: isDesktop ? 330 : 0,
      titleSize: isDesktop ? 24 : isTablet ? 22 : 20,
      subtitleSize: isDesktop ? 14 : 13,
    };
  }, [bp, width, height]);

  const [fileName, setFileName] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const handlePickFile = useCallback(() => {
    setIsPicking(true);

    setTimeout(() => {
      setFileName('results_certificate.pdf');
      setIsPicking(false);
      Alert.alert(
        'File selected (simulation)',
        'results_certificate.pdf selected.\nBackend upload coming later.'
      );
    }, 800);
  }, []);

  const handleClear = useCallback(() => {
    setFileName(null);
  }, []);

  const handleProcess = useCallback(() => {
    if (!fileName) return;
    Alert.alert('Processing (simulation)', `Would process: ${fileName}\n(Backend integration placeholder)`);
  }, [fileName]);

  return (
    <View style={[styles.page, { backgroundColor: colors.appBg }]}>
      <View style={[styles.center, { padding: ui.shellPadding }]}>
        <View
          style={[
            styles.shell,
            {
              width: ui.shellWidth,
              height: ui.shellHeight,
              borderRadius: ui.shellRadius,
              backgroundColor: colors.surfaceMuted,
            },
            ui.isDesktop
              ? [
                  styles.shellDesktop,
                  {
                    borderColor: colors.border,
                  },
                  elevation,
                ]
              : null,
          ]}
        >
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View
              style={[
                styles.topBar,
                {
                  paddingHorizontal: ui.padX,
                  borderBottomColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.topBarLeft}>
                <HeaderIconButton
                  icon="menu-outline"
                  label="Open menu"
                  colors={colors}
                  onPress={openMenu}
                />
                <HeaderIconButton
                  icon="chevron-back"
                  label="Go back"
                  colors={colors}
                  onPress={() => router.back()}
                />
              </View>

              <View style={styles.headerCenter}>
                <Text style={[styles.topTitle, typography.title, { color: colors.text, fontSize: ui.titleSize }]}>
                  Upload Results
                </Text>
                <Text
                  style={[
                    styles.topSubtitle,
                    typography.caption,
                    { color: colors.textMuted, fontSize: ui.subtitleSize },
                  ]}
                  numberOfLines={1}
                >
                  Upload your certificate or statement to extract subjects and grades
                </Text>
              </View>

              <HeaderIconButton
                icon="cloud-upload-outline"
                label="Select file"
                colors={colors}
                onPress={handlePickFile}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={ui.isDesktop}
              contentContainerStyle={{ paddingBottom: ui.padY }}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  {
                    paddingHorizontal: ui.padX,
                    marginTop: ui.gap,
                  },
                  ui.isDesktop
                    ? {
                        flexDirection: 'row',
                        gap: ui.gap,
                        alignItems: 'flex-start',
                      }
                    : null,
                ]}
              >
                {ui.isDesktop ? (
                  <View style={{ width: ui.railWidth }}>
                    <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(5) }}>
                      <Text style={[typography.section, { color: colors.text }]}>Upload overview</Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                        Upload a results document so the platform can later extract subjects, grades, and recommendations.
                      </Text>

                      <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                        <MiniStatCard
                          icon="document-text-outline"
                          label="Selected file"
                          value={fileName ? '1 ready' : 'None'}
                          colors={colors}
                        />
                        <MiniStatCard
                          icon="scan-outline"
                          label="Mode"
                          value="Simulation"
                          colors={colors}
                        />
                        <MiniStatCard
                          icon="layers-outline"
                          label="Formats"
                          value="PDF / JPG / PNG"
                          colors={colors}
                        />
                      </View>

                      <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing(4) }]} />

                      <Text style={[typography.section, { color: colors.text }]}>Quick actions</Text>

                      <View style={{ marginTop: spacing(3), gap: spacing(2) }}>
                        <ActionButton
                          icon="menu-outline"
                          label="Open menu"
                          colors={colors}
                          onPress={openMenu}
                        />
                        <ActionButton
                          icon="cloud-upload-outline"
                          label={isPicking ? 'Selecting…' : 'Select file'}
                          colors={colors}
                          onPress={handlePickFile}
                          disabled={isPicking}
                        />
                        <ActionButton
                          icon="trash-outline"
                          label="Clear selection"
                          colors={colors}
                          onPress={handleClear}
                          disabled={!fileName}
                          danger
                        />
                      </View>

                      <Text style={[typography.caption, { color: colors.textSoft, marginTop: spacing(4) }]}>
                        Tip: Upload a clean and readable certificate for the best extraction accuracy once backend processing is connected.
                      </Text>
                    </SurfaceCard>
                  </View>
                ) : null}

                <View style={{ flex: 1, minWidth: 0 }}>
                  <SurfaceCard
                    colors={colors}
                    elevation={elevation}
                    style={{
                      padding: ui.isMobile ? spacing(4) : spacing(5),
                      backgroundColor: colors.cardAlt,
                    }}
                  >
                    <View style={[styles.heroRow, ui.isMobile ? styles.heroRowMobile : null]}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[typography.hero, { color: colors.text }]}>Upload your results</Text>
                        <Text
                          style={[
                            typography.body,
                            {
                              color: colors.textMuted,
                              marginTop: spacing(2),
                            },
                          ]}
                        >
                          Add your certificate or statement so the app can later read your academic results and guide your next step.
                        </Text>
                      </View>

                      <View style={styles.heroBadgeWrap}>
                        <View
                          style={[
                            styles.heroBadge,
                            {
                              backgroundColor: colors.primarySoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={fileName ? 'checkmark-circle-outline' : 'document-outline'}
                            size={16}
                            color={colors.text}
                          />
                          <Text style={[typography.caption, { color: colors.text }]}>
                            {fileName ? 'File ready' : 'Awaiting file'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </SurfaceCard>

                  <View style={{ marginTop: spacing(5) }}>
                    <Text style={[styles.sectionTitle, typography.caption, { color: colors.textSoft }]}>
                      FILE UPLOAD
                    </Text>

                    <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(5) }}>
                      <View
                        style={[
                          styles.uploadArea,
                          {
                            borderColor: colors.borderStrong,
                            backgroundColor: colors.cardAlt,
                          },
                        ]}
                      >
                        {fileName ? (
                          <>
                            <View style={styles.fileInfo}>
                              <View
                                style={[
                                  styles.fileIconWrap,
                                  {
                                    backgroundColor: colors.primarySoft,
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <Ionicons name="document-text-outline" size={28} color={colors.primary} />
                              </View>

                              <View style={{ marginLeft: spacing(4), flex: 1, minWidth: 0 }}>
                                <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
                                  {fileName}
                                </Text>
                                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(1) }]}>
                                  Ready to process (simulation)
                                </Text>
                              </View>
                            </View>

                            <View style={styles.buttonRow}>
                              <Pressable
                                onPress={handleClear}
                                accessibilityRole="button"
                                accessibilityLabel="Remove selected file"
                                style={({ pressed }) => [
                                  styles.secondaryButton,
                                  {
                                    borderColor: colors.danger,
                                    backgroundColor: colors.dangerSoft,
                                  },
                                  pressed ? styles.pressDown : null,
                                ]}
                              >
                                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                <Text style={[styles.secondaryButtonText, { color: colors.danger }]}>REMOVE</Text>
                              </Pressable>

                              <Pressable
                                onPress={handleProcess}
                                accessibilityRole="button"
                                accessibilityLabel="Process file"
                                style={({ pressed }) => [
                                  styles.primaryButton,
                                  {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                  },
                                  pressed ? styles.pressDown : null,
                                ]}
                              >
                                <Ionicons name="cloud-upload-outline" size={18} color={colors.white} />
                                <Text style={[styles.primaryButtonText, { color: colors.white }]}>PROCESS FILE</Text>
                              </Pressable>
                            </View>
                          </>
                        ) : (
                          <>
                            <View
                              style={[
                                styles.emptyUploadIconWrap,
                                {
                                  backgroundColor: colors.primarySoft,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <Ionicons name="cloud-upload-outline" size={34} color={colors.text} />
                            </View>

                            <Text style={[typography.section, { color: colors.text, marginTop: spacing(4) }]}>
                              Drop your file here
                            </Text>
                            <Text
                              style={[
                                typography.body,
                                {
                                  color: colors.textMuted,
                                  marginTop: spacing(2),
                                  textAlign: 'center',
                                },
                              ]}
                            >
                              PDF or image of your results certificate
                            </Text>

                            <Pressable
                              onPress={handlePickFile}
                              disabled={isPicking}
                              accessibilityRole="button"
                              accessibilityLabel="Select file"
                              style={({ pressed }) => [
                                styles.primaryButton,
                                {
                                  backgroundColor: colors.primary,
                                  borderColor: colors.primary,
                                  marginTop: spacing(6),
                                },
                                isPicking ? styles.disabled : null,
                                pressed && !isPicking ? styles.pressDown : null,
                              ]}
                            >
                              {isPicking ? (
                                <>
                                  <ActivityIndicator color={colors.white} />
                                  <Text style={[styles.primaryButtonText, { color: colors.white }]}>SELECTING…</Text>
                                </>
                              ) : (
                                <>
                                  <Ionicons name="add-circle-outline" size={20} color={colors.white} />
                                  <Text style={[styles.primaryButtonText, { color: colors.white }]}>SELECT FILE</Text>
                                </>
                              )}
                            </Pressable>
                          </>
                        )}
                      </View>
                    </SurfaceCard>
                  </View>

                  <View style={{ marginTop: spacing(5) }}>
                    <Text style={[styles.sectionTitle, typography.caption, { color: colors.textSoft }]}>
                      SUPPORTED FORMATS
                    </Text>

                    <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(4) }}>
                      <View style={styles.chipRow}>
                        <FormatChip icon="document-text-outline" label="PDF" colors={colors} />
                        <FormatChip icon="image-outline" label="JPG / PNG" colors={colors} />
                      </View>
                    </SurfaceCard>
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

function SurfaceCard({
  children,
  colors,
  elevation,
  style,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  elevation: ViewStyle;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.surfaceCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => {
        const state = getPressableState({ pressed } as PressableStateCallbackType);
        return [
          styles.headerIconButton,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
          state.hovered && Platform.OS === 'web' ? styles.hoverLift : null,
          pressed ? styles.pressDown : null,
        ];
      }}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.miniStatCard,
        {
          backgroundColor: colors.cardAlt,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.miniStatIcon,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={colors.text} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.caption, { color: colors.textSoft }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[typography.label, { color: colors.text, marginTop: spacing(1) }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  danger,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: danger ? colors.dangerSoft : colors.surface,
          borderColor: danger ? colors.danger : colors.border,
        },
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressDown : null,
      ]}
    >
      <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.text} />
      <Text
        style={[
          styles.actionButtonText,
          {
            color: danger ? colors.danger : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FormatChip({
  icon,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.primarySoft,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing(2) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    overflow: 'hidden',
  },
  shellDesktop: {
    borderWidth: 1,
  },
  safe: {
    flex: 1,
  },

  topBar: {
    minHeight: 72,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  topTitle: {
    textAlign: 'center',
  },
  topSubtitle: {
    marginTop: spacing(1),
    textAlign: 'center',
  },

  headerIconButton: {
    width: MIN_TAP,
    height: MIN_TAP,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  surfaceCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
  },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing(4),
  },
  heroRowMobile: {
    flexDirection: 'column',
  },
  heroBadgeWrap: {
    alignItems: 'flex-end',
  },
  heroBadge: {
    minHeight: 40,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },

  sectionTitle: {
    marginBottom: spacing(2),
    letterSpacing: 0.4,
  },

  miniStatCard: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  miniStatIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
  },

  actionButton: {
    minHeight: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  uploadArea: {
    minHeight: 280,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(5),
  },
  emptyUploadIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(5),
  },
  fileIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(2),
  },

  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
    borderRadius: radii.pill,
    borderWidth: 1,
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressDown: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});