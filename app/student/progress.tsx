import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  useColorScheme,
  type PressableStateCallbackType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
  useStudentMenu,
} from '../../components/student/StudentMenu';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '900' as const },
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
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' } as any,
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1240;

// ── Mock Data ──────────────────────────────────────────────────────────────────
type Mark = {
  id: string;
  subject: string;
  assessment: string;
  score: number;
  date: string;
};

const MARKS: Mark[] = [
  { id: '1', subject: 'History', assessment: 'Project', score: 88, date: '12/01/2026' },
  { id: '2', subject: 'Mathematics', assessment: 'Class Test', score: 43, date: '09/01/2026' },
  { id: '3', subject: 'Science', assessment: 'Mid Term', score: 71, date: '05/01/2026' },
  { id: '4', subject: 'English', assessment: 'Final Exam', score: 82, date: '20/12/2025' },
];

function getPressableState(state: PressableStateCallbackType) {
  const hovered = (state as any).hovered === true;
  return { pressed: state.pressed, hovered };
}

export default function Progress() {
  return (
    <StudentMenuProvider>
      <ProgressContent />
    </StudentMenuProvider>
  );
}

function ProgressContent() {
  const { width } = useWindowDimensions();
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const { openMenu } = useStudentMenu();

  const colors = useMemo(
    () => ({
      background: scheme === 'light' ? '#F8FCFD' : '#0A111A',
      surface: scheme === 'light' ? '#FFFFFF' : '#1A232E',
      surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#222B36',
      textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
      textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
      textMuted: scheme === 'light' ? '#7A919E' : '#7A919E',
      primary: '#4A9FC6',
      primaryText: '#FFFFFF',
      border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
      accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
      cardTint: scheme === 'light' ? 'rgba(74,159,198,0.08)' : 'rgba(74,159,198,0.14)',
      headerButtonBg: scheme === 'light' ? '#FFFFFF' : '#1A232E',
    }),
    [scheme]
  );

  const uiMode = useMemo(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isTablet = uiMode === 'tablet';
  const isDesktop = uiMode === 'desktop';

  const pagePadding = isMobile ? spacing(5) : isTablet ? spacing(6) : spacing(8);
  const maxWidth = isDesktop ? maxContentWidth : width;
  const gridColumns = isDesktop ? 2 : 1;
  const markCardWidth = `${100 / gridColumns}%` as `${number}%`;

  const averageScore = useMemo(() => {
    if (!MARKS.length) return 0;
    return Math.round(MARKS.reduce((sum, m) => sum + m.score, 0) / MARKS.length);
  }, []);

  const handleAddMark = () => {
    router.push('/student/add-mark');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: pagePadding, paddingBottom: spacing(10) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={isDesktop}
        >
          <View style={{ maxWidth, alignSelf: 'center', width: '100%' }}>
            <View style={[styles.header, isMobile ? styles.headerMobile : styles.headerDesktop]}>
              <View style={styles.headerCopy}>
                <Text style={[typography.title, { color: colors.textPrimary }]}>Progress</Text>
                <Text
                  style={[
                    typography.subtitle,
                    {
                      color: colors.textSecondary,
                      marginTop: spacing(1),
                    },
                  ]}
                >
                  Track your academic performance over time
                </Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  onPress={openMenu}
                  accessibilityRole="button"
                  accessibilityLabel="Open student menu"
                  style={({ pressed }) => {
                    const { hovered } = getPressableState({ pressed } as PressableStateCallbackType);
                    return [
                      styles.headerMenuButton,
                      {
                        backgroundColor: colors.headerButtonBg,
                        borderColor: colors.border,
                      },
                      hovered && Platform.OS === 'web' ? styles.hoverLift : null,
                      pressed ? styles.pressed : null,
                    ];
                  }}
                >
                  <Ionicons name="menu-outline" size={22} color={colors.textPrimary} />
                  {!isMobile ? (
                    <Text
                      style={[
                        typography.label,
                        {
                          color: colors.textPrimary,
                          marginLeft: spacing(2),
                        },
                      ]}
                    >
                      Menu
                    </Text>
                  ) : null}
                </Pressable>

                <Pressable
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  style={({ pressed }) => {
                    const { hovered } = getPressableState({ pressed } as PressableStateCallbackType);
                    return [
                      styles.headerMenuButton,
                      {
                        backgroundColor: colors.headerButtonBg,
                        borderColor: colors.border,
                      },
                      hovered && Platform.OS === 'web' ? styles.hoverLift : null,
                      pressed ? styles.pressed : null,
                    ];
                  }}
                >
                  <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
                  {!isMobile ? (
                    <Text
                      style={[
                        typography.label,
                        {
                          color: colors.textPrimary,
                          marginLeft: spacing(2),
                        },
                      ]}
                    >
                      Back
                    </Text>
                  ) : null}
                </Pressable>
              </View>
            </View>

            <View
              style={[
                styles.card,
                {
                  marginBottom: spacing(6),
                  backgroundColor: colors.cardTint,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[typography.label, { color: colors.textSecondary }]}>Current Average</Text>
              <Text style={[typography.hero, { color: colors.primary, marginTop: spacing(1) }]}>
                {averageScore}%
              </Text>
            </View>

            <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(3) }]}>
              Recent Marks
            </Text>

            {MARKS.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="trending-up-outline" size={48} color={colors.textMuted} />
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing(4) }]}>
                  No marks yet
                </Text>
                <Pressable
                  onPress={handleAddMark}
                  style={({ pressed }) => [
                    styles.addButton,
                    {
                      marginTop: spacing(4),
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primaryText} />
                  <Text style={[typography.body, { color: colors.primaryText, marginLeft: spacing(2) }]}>
                    Add First Mark
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={[styles.grid, { gap: spacing(4) }]}>
                {MARKS.map((mark) => (
                  <View
                    key={mark.id}
                    style={[
                      styles.gridItem,
                      {
                        width: markCardWidth,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.markCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[typography.body, { fontWeight: '700', color: colors.textPrimary }]}>
                        {mark.subject}
                      </Text>

                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                        {mark.assessment}
                      </Text>

                      <Text
                        style={[
                          typography.body,
                          {
                            color: colors.primary,
                            marginTop: spacing(2),
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {mark.score}%
                      </Text>

                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(1) }]}>
                        {mark.date}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Pressable
              onPress={handleAddMark}
              style={({ pressed }) => [
                styles.addButton,
                {
                  marginTop: spacing(6),
                  alignSelf: 'center',
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primaryText} />
              <Text style={[typography.body, { color: colors.primaryText, marginLeft: spacing(2) }]}>
                Add New Mark
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  header: {
    marginBottom: spacing(6),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(4),
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  headerMenuButton: {
    minHeight: 48,
    minWidth: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...elevations,
  },

  card: {
    padding: spacing(5),
    borderRadius: radii.lg,
    borderWidth: 1,
    ...elevations,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing(2),
  },
  gridItem: {
    paddingHorizontal: spacing(2),
    minWidth: 0,
  },
  markCard: {
    minHeight: 148,
    padding: spacing(5),
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing(4),
    ...elevations,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.md,
    borderWidth: 1,
  },

  emptyState: {
    alignItems: 'center',
    padding: spacing(8),
    marginTop: spacing(2),
    borderRadius: radii.xl,
    borderWidth: 1,
    ...elevations,
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});