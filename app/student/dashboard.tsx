import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  LayoutAnimation,
  type PressableStateCallbackType,
  useColorScheme,
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
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
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
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
  web: {
    boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
  } as any,
  default: {},
});

const breakpoints = {
  mobileMax: 480,
  tabletMax: 1024,
};

const maxContentWidth = 1280;

// ── Types ──────────────────────────────────────────────────────────────────────
type IconName = keyof typeof Ionicons.glyphMap;
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

type NavItem = {
  key: string;
  label: string;
  icon: IconName;
  href: string;
};

type ActionItem = {
  label: string;
  icon: IconName;
  href: string;
};

type Recommendation = {
  title: string;
  subtitle: string;
  badge: string;
};

// ── Helper ─────────────────────────────────────────────────────────────────────
function getPressableState(s: PressableStateCallbackType) {
  const hovered = (s as any).hovered === true;
  return { pressed: s.pressed, hovered };
}

// ── Public Export ──────────────────────────────────────────────────────────────
export default function StudentDashboardScreen() {
  return (
    <StudentMenuProvider>
      <StudentDashboardContent />
    </StudentMenuProvider>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
function StudentDashboardContent() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() || 'light';
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
      accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
      border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
      successBg: scheme === 'light' ? 'rgba(56,142,60,0.10)' : 'rgba(76,175,80,0.18)',
      successBorder: scheme === 'light' ? 'rgba(56,142,60,0.22)' : 'rgba(76,175,80,0.30)',
      neutralBg: scheme === 'light' ? 'rgba(122,145,158,0.12)' : 'rgba(122,145,158,0.20)',
      neutralBorder: scheme === 'light' ? 'rgba(122,145,158,0.22)' : 'rgba(122,145,158,0.30)',
      cardTint: scheme === 'light' ? 'rgba(74,159,198,0.08)' : 'rgba(74,159,198,0.14)',
      cardTintStrong: scheme === 'light' ? 'rgba(74,159,198,0.14)' : 'rgba(74,159,198,0.20)',
      headerButtonBg: scheme === 'light' ? '#FFFFFF' : '#1A232E',
    }),
    [scheme]
  );

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < breakpoints.mobileMax) return 'mobile';
    if (width < breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  const contentPadding = isMobile ? spacing(5) : isTablet ? spacing(6) : spacing(8);
  const cardRadius = isMobile ? radii.lg : radii.xl;
  const contentMaxWidth = isDesktop ? Math.min(maxContentWidth, width - spacing(8) * 2) : width;
  const sidebarWidth = isDesktop ? 280 : 0;

  const points = 48;
  const lastUpdated = '28 March 2026';
  const isEligible = true;

  const [navExpanded, setNavExpanded] = useState(true);

  const toggleNav = () => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setNavExpanded((prev) => !prev);
  };

  const navItems = [
    { key: 'dashboard', label: 'Home', icon: 'home-outline' as const, href: '/student/dashboard' },
    { key: 'courses', label: 'Courses', icon: 'book-outline' as const, href: '/student/courses' },
    { key: 'universities', label: 'Universities', icon: 'school-outline' as const, href: '/student/universities' },
    { key: 'scholarships', label: 'Scholarships', icon: 'ribbon-outline' as const, href: '/student/scholarships' },
    { key: 'progress', label: 'Progress', icon: 'trending-up-outline' as const, href: '/student/progress' },
    { key: 'applications', label: 'Applications', icon: 'document-text-outline' as const, href: '/student/applications' },
  ] satisfies NavItem[];

  const quickActions = [
    { label: 'Enter Results', icon: 'create-outline' as const, href: '/student/enter-results' },
    { label: 'Upload Results', icon: 'cloud-upload-outline' as const, href: '/student/upload-results' },
    { label: 'View Courses', icon: 'eye-outline' as const, href: '/student/courses' },
    { label: 'Universities', icon: 'school-outline' as const, href: '/student/universities' },
    { label: 'Scholarships', icon: 'ribbon-outline' as const, href: '/student/scholarships' },
    { label: 'Progress', icon: 'trending-up-outline' as const, href: '/student/progress' },
  ] satisfies ActionItem[];

  const recommended = [
    { title: 'Biology', subtitle: 'University of Botswana', badge: 'Highly suitable' },
    { title: 'Economics', subtitle: 'Botswana Accountancy College', badge: 'Highly suitable' },
    { title: 'Computer Science', subtitle: 'University of Botswana', badge: 'Good match' },
  ] satisfies Recommendation[];

  const quickActionColumns = isDesktop ? 3 : isTablet ? 3 : 2;
  const recommendationColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  const quickActionCardWidth = `${100 / quickActionColumns}%` as `${number}%`;
  const recommendationCardWidth = `${100 / recommendationColumns}%` as `${number}%`;

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingHorizontal: contentPadding,
            paddingTop: contentPadding,
            paddingBottom: spacing(10),
          }}
          showsVerticalScrollIndicator={isDesktop}
        >
          <View style={[styles.contentFrame, { maxWidth: contentMaxWidth }]}>
            <View style={[styles.header, isMobile ? styles.headerMobile : styles.headerDesktop]}>
              <View style={styles.headerCopy}>
                <Text style={[typography.hero, styles.heroTight, { color: colors.textPrimary }]}>
                  Welcome back, Katlo
                </Text>

                <Text
                  style={[
                    typography.subtitle,
                    {
                      color: colors.textSecondary,
                      marginTop: spacing(1),
                    },
                  ]}
                >
                  Here&apos;s your latest overview
                </Text>
              </View>

              <Pressable
                onPress={openMenu}
                accessibilityRole="button"
                accessibilityLabel="Open student menu"
                accessibilityHint="Opens the student navigation menu"
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
            </View>

            <View style={[styles.mainLayout, isDesktop && { flexDirection: 'row', gap: spacing(8) }]}>
              {isDesktop && (
                <View style={{ width: sidebarWidth }}>
                  <View
                    style={[
                      styles.card,
                      {
                        padding: spacing(5),
                        borderRadius: cardRadius,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.sidebarHeader}>
                      <Text style={[typography.title, { color: colors.textPrimary }]}>Student</Text>

                      <Pressable
                        onPress={toggleNav}
                        accessibilityRole="button"
                        accessibilityLabel={navExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                        style={({ pressed }) => [
                          styles.toggleBtn,
                          {
                            backgroundColor: colors.surfaceAlt,
                            borderColor: colors.border,
                          },
                          pressed ? styles.pressed : null,
                        ]}
                      >
                        <Ionicons
                          name={navExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={colors.textPrimary}
                        />
                      </Pressable>
                    </View>

                    {navExpanded && (
                      <View style={{ marginTop: spacing(4), gap: spacing(2) }}>
                        {navItems.map((item) => (
                          <Pressable
                            key={item.key}
                            onPress={() => router.push(item.href)}
                            accessibilityRole="button"
                            accessibilityLabel={item.label}
                            style={({ pressed }) => {
                              const { hovered } = getPressableState({ pressed } as PressableStateCallbackType);
                              return [
                                styles.navItem,
                                {
                                  backgroundColor:
                                    item.key === 'dashboard' ? colors.cardTintStrong : 'transparent',
                                  borderColor: item.key === 'dashboard' ? colors.border : 'transparent',
                                },
                                hovered && Platform.OS === 'web' ? { backgroundColor: colors.surfaceAlt } : null,
                                pressed ? styles.navItemPressed : null,
                              ];
                            }}
                          >
                            <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
                            <Text
                              style={[
                                typography.body,
                                {
                                  color: colors.textPrimary,
                                  marginLeft: spacing(3),
                                  flexShrink: 1,
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {item.label}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.card,
                    styles.heroCard,
                    {
                      borderRadius: cardRadius,
                      backgroundColor: colors.cardTintStrong,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.pointsRow, isMobile && styles.pointsRowMobile]}>
                    <View style={styles.pointsLeft}>
                      <Text style={[typography.label, { color: colors.textSecondary }]}>Your Points</Text>

                      <Text
                        style={[
                          typography.hero,
                          {
                            color: colors.primary,
                            marginTop: spacing(1),
                          },
                        ]}
                      >
                        {points}
                      </Text>

                      <Text
                        style={[
                          typography.caption,
                          {
                            color: colors.textMuted,
                            marginTop: spacing(1),
                          },
                        ]}
                      >
                        Last updated {lastUpdated}
                      </Text>
                    </View>

                    <View style={[styles.pointsRight, isMobile && styles.pointsRightMobile]}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: isEligible ? colors.successBg : colors.neutralBg,
                            borderColor: isEligible ? colors.successBorder : colors.neutralBorder,
                          },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: colors.textPrimary }]}>
                          {isEligible ? 'Eligible' : 'Not yet'}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => router.push('/student/enter-results')}
                        accessibilityRole="button"
                        accessibilityLabel="Enter results"
                        style={({ pressed }) => [
                          styles.actionBtn,
                          {
                            backgroundColor: colors.primary,
                          },
                          pressed ? styles.pressed : null,
                        ]}
                      >
                        <Text style={[typography.body, { color: colors.primaryText }]}>Enter Results</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={{ marginTop: spacing(6) }}>
                  <Text
                    style={[
                      typography.title,
                      {
                        color: colors.textPrimary,
                        marginBottom: spacing(3),
                      },
                    ]}
                  >
                    Quick Actions
                  </Text>

                  <View style={[styles.grid, { gap: spacing(4) }]}>
                    {quickActions.map((action) => (
                      <View
                        key={action.label}
                        style={[
                          styles.gridItem,
                          {
                            width: quickActionCardWidth,
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => router.push(action.href)}
                          accessibilityRole="button"
                          accessibilityLabel={action.label}
                          style={({ pressed }) => {
                            const { hovered } = getPressableState({ pressed } as PressableStateCallbackType);
                            return [
                              styles.actionCard,
                              {
                                backgroundColor: colors.cardTint,
                                borderColor: colors.border,
                                borderRadius: radii.lg,
                              },
                              hovered && Platform.OS === 'web' ? styles.hoverLift : null,
                              pressed ? styles.pressed : null,
                            ];
                          }}
                        >
                          <View
                            style={[
                              styles.actionIconWrap,
                              {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons name={action.icon} size={24} color={colors.primary} />
                          </View>

                          <Text
                            style={[
                              typography.body,
                              {
                                color: colors.textPrimary,
                                marginTop: spacing(3),
                                textAlign: 'center',
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {action.label}
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={{ marginTop: spacing(6) }}>
                  <Text
                    style={[
                      typography.title,
                      {
                        color: colors.textPrimary,
                        marginBottom: spacing(3),
                      },
                    ]}
                  >
                    Recommended for You
                  </Text>

                  <View style={[styles.grid, { gap: spacing(4) }]}>
                    {recommended.map((item) => (
                      <View
                        key={`${item.title}-${item.subtitle}`}
                        style={[
                          styles.gridItem,
                          {
                            width: recommendationCardWidth,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.recommendationCard,
                            {
                              backgroundColor: colors.cardTint,
                              borderColor: colors.border,
                              borderRadius: radii.lg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              typography.body,
                              {
                                fontWeight: '700',
                                color: colors.textPrimary,
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>

                          <Text
                            style={[
                              typography.caption,
                              {
                                color: colors.textSecondary,
                                marginTop: spacing(1),
                              },
                            ]}
                            numberOfLines={2}
                          >
                            {item.subtitle}
                          </Text>

                          <View
                            style={[
                              styles.badge,
                              {
                                marginTop: spacing(2),
                                alignSelf: 'flex-start',
                                backgroundColor: colors.successBg,
                                borderColor: colors.successBorder,
                              },
                            ]}
                          >
                            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{item.badge}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
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
  page: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },

  contentFrame: {
    width: '100%',
    alignSelf: 'center',
  },

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

  heroTight: {
    flexShrink: 1,
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

  mainLayout: {
    width: '100%',
    alignSelf: 'center',
  },

  card: {
    borderWidth: 1,
    padding: spacing(5),
    ...elevations,
  },

  heroCard: {
    overflow: 'hidden',
  },

  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing(4),
  },

  pointsRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  pointsLeft: {
    flex: 1,
    minWidth: 0,
  },

  pointsRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 140,
  },

  pointsRightMobile: {
    alignItems: 'flex-start',
    minWidth: 0,
  },

  badge: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  actionBtn: {
    marginTop: spacing(3),
    minHeight: 48,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
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

  actionCard: {
    minHeight: 144,
    padding: spacing(4),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(4),
  },

  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recommendationCard: {
    minHeight: 148,
    padding: spacing(5),
    borderWidth: 1,
    marginBottom: spacing(4),
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
    gap: spacing(3),
  },

  toggleBtn: {
    padding: spacing(2),
    borderRadius: radii.md,
    borderWidth: 1,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: radii.md,
    marginBottom: spacing(2),
    borderWidth: 1,
    minHeight: 48,
  },

  navItemPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },

  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});