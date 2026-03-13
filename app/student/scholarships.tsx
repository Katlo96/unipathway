import React, { useMemo, useState } from 'react';
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
type Scholarship = {
  id: string;
  title: string;
  provider: string;
  category: 'Local' | 'International';
  deadline: string;
  status: 'You May Qualify' | 'Deadline soon';
  variant: 'good' | 'warning';
};
const SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'ABC Academic Excellence Scholarship',
    provider: 'ABC Foundation',
    category: 'Local',
    deadline: 'May 10, 3 days left',
    status: 'You May Qualify',
    variant: 'good',
  },
  {
    id: '2',
    title: 'Community Service Award',
    provider: 'City Education Trust',
    category: 'International',
    deadline: 'April 28, 2 days left',
    status: 'Deadline soon',
    variant: 'warning',
  },
];
function getPressableState(state: PressableStateCallbackType) {
  const hovered = (state as any).hovered === true;
  return { pressed: state.pressed, hovered };
}
export default function Scholarships() {
  return (
    <StudentMenuProvider>
      <ScholarshipsContent />
    </StudentMenuProvider>
  );
}
function ScholarshipsContent() {
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
      error: '#D32F2F',
      border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
      accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
      cardTint: scheme === 'light' ? 'rgba(74,159,198,0.08)' : 'rgba(74,159,198,0.14)',
      successSoft: scheme === 'light' ? 'rgba(56,142,60,0.12)' : 'rgba(56,142,60,0.22)',
      warningSoft: scheme === 'light' ? 'rgba(255,152,0,0.14)' : 'rgba(255,152,0,0.24)',
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
  const cardColumns = isDesktop ? 2 : 1;
  const cardWidth = `${100 / cardColumns}%` as `${number}%`;
  const [category, setCategory] = useState<'ALL' | 'Local' | 'International'>('ALL');
  const filtered = useMemo(() => {
    if (category === 'ALL') return SCHOLARSHIPS;
    return SCHOLARSHIPS.filter((s) => s.category === category);
  }, [category]);
  const handleViewScholarship = (id: string) => {
    router.push(`/student/scholarship-details`);
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
                <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
                  Scholarships
                </Text>
                <Text style={[typography.subtitle, { color: colors.textSecondary }]}>
                  Discover opportunities and stay on top of deadlines
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
                      styles.headerButton,
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
                      styles.headerButton,
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
            <View style={[styles.tabRow, { gap: spacing(3), marginBottom: spacing(6) }]}>
              {(['ALL', 'Local', 'International'] as const).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={({ pressed }) => [
                    styles.tabPill,
                    {
                      backgroundColor: category === cat ? colors.primary : colors.cardTint,
                      borderColor: category === cat ? colors.primary : colors.border,
                    },
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      {
                        color: category === cat ? colors.primaryText : colors.textPrimary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
            {filtered.length === 0 ? (
              <View
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="ribbon-outline" size={48} color={colors.textMuted} />
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing(4) }]}>
                  No scholarships found
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(2) }]}>
                  Try another category
                </Text>
              </View>
            ) : (
              <View style={[styles.grid, { gap: spacing(4) }]}>
                {filtered.map((sch) => (
                  <View
                    key={sch.id}
                    style={[
                      styles.gridItem,
                      {
                        width: cardWidth,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => handleViewScholarship(sch.id)}
                      style={({ pressed }) => [
                        styles.schCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <View style={styles.cardHeader}>
                        <Text
                          style={[
                            typography.body,
                            {
                              fontWeight: '700',
                              color: colors.textPrimary,
                              flex: 1,
                              marginRight: spacing(3),
                            },
                          ]}
                        >
                          {sch.title}
                        </Text>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                sch.variant === 'good' ? colors.successSoft : colors.warningSoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: sch.variant === 'good' ? colors.textPrimary : colors.textPrimary,
                              },
                            ]}
                          >
                            {sch.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                        {sch.provider}
                      </Text>
                      <View style={styles.metaRow}>
                        <View
                          style={[
                            styles.metaPill,
                            {
                              backgroundColor: colors.cardTint,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="globe-outline" size={14} color={colors.textPrimary} />
                          <Text style={[styles.metaPillText, { color: colors.textPrimary }]}>{sch.category}</Text>
                        </View>
                        <View
                          style={[
                            styles.metaPill,
                            {
                              backgroundColor: colors.cardTint,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="time-outline" size={14} color={colors.textPrimary} />
                          <Text style={[styles.metaPillText, { color: colors.textPrimary }]}>{sch.deadline}</Text>
                        </View>
                      </View>
                      <View style={styles.cardFooter}>
                        <Text style={[typography.caption, { color: colors.textMuted }]}>
                          Tap to view details
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                      </View>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
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
  headerButton: {
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
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tabPill: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(5),
    borderRadius: radii.pill,
    borderWidth: 1,
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
  schCard: {
    minHeight: 196,
    padding: spacing(5),
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing(4),
    ...elevations,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaRow: {
    marginTop: spacing(4),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  metaPill: {
    minHeight: 32,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  metaPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing(8),
    marginTop: spacing(8),
    borderRadius: radii.xl,
    borderWidth: 1,
    ...elevations,
  },
  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});