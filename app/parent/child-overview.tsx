// app/parent/child-overview.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';

// ────────────────────────────────────────────────
// Design System
// ────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (multiplier: number) => multiplier * BASE_SPACING;

const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  pill: 999,
};

const typography = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const },
  section: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.6 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  metric: { fontSize: 40, lineHeight: 44, fontWeight: '800' as const },
};

const lightTheme = {
  background: '#F8FAFC',
  shell: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  surfaceAlt2: '#EAF2FF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  accent: '#10B981',
  accentSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  overlay: 'rgba(15, 23, 42, 0.52)',
  shadow: 'rgba(15, 23, 42, 0.10)',
  heroStart: '#2563EB',
  heroEnd: '#3B82F6',
  shellBorder: '#E2E8F0',
  white: '#FFFFFF',
};

const darkTheme = {
  background: '#020817',
  shell: '#0B1220',
  surface: '#0F172A',
  surfaceElevated: '#111C31',
  surfaceAlt: '#1E293B',
  surfaceAlt2: '#172554',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#60A5FA',
  primarySoft: '#1E3A8A',
  accent: '#34D399',
  accentSoft: '#064E3B',
  warning: '#FBBF24',
  warningSoft: '#78350F',
  danger: '#F87171',
  dangerSoft: '#7F1D1D',
  border: '#1E293B',
  borderStrong: '#334155',
  overlay: 'rgba(2, 6, 23, 0.72)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  heroStart: '#1D4ED8',
  heroEnd: '#2563EB',
  shellBorder: '#1E293B',
  white: '#FFFFFF',
};

type Theme = typeof lightTheme;
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

type SnapshotItem = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sub: string;
  tone: 'primary' | 'accent' | 'warning';
};

type TimelineItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function getBreakpoint(width: number): Breakpoint {
  if (width < 480) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getShadow(theme: Theme, level: 'sm' | 'md' | 'lg'): ViewStyle {
  if (Platform.OS === 'web') {
    const shadowMap = {
      sm: `0px 8px 20px ${theme.shadow}`,
      md: `0px 16px 32px ${theme.shadow}`,
      lg: `0px 24px 56px ${theme.shadow}`,
    };

    return {
      boxShadow: shadowMap[level] as any,
    };
  }

  const elevationMap = { sm: 4, md: 8, lg: 14 };
  const opacityMap = { sm: 0.12, md: 0.16, lg: 0.22 };

  return {
    shadowColor: '#000000',
    shadowOpacity: opacityMap[level],
    shadowRadius: level === 'sm' ? 10 : level === 'md' ? 16 : 22,
    shadowOffset: { width: 0, height: level === 'sm' ? 4 : level === 'md' ? 8 : 12 },
    elevation: elevationMap[level],
  };
}

type ScalePressableProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'menuitem' | 'none';
  disabled?: boolean;
};

function ScalePressable({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled,
}: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const animateScale = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(scale, {
        toValue,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [scale]
  );

  const animateLift = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(lift, {
        toValue,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [lift]
  );

  useEffect(() => {
    animateLift(hovered ? -2 : 0, hovered ? 120 : 150);
  }, [animateLift, hovered]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPressIn={() => animateScale(0.96, 90)}
      onPressOut={() => animateScale(1, 140)}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={(state) => {
        if (typeof style === 'function') return style(state);
        return style;
      }}
    >
      {(state) => (
        <Animated.View
          style={{
            transform: [{ scale }, { translateY: lift }],
          }}
        >
          {typeof children === 'function' ? (children as any)(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export default function ParentChildOverviewScreen() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const breakpoint = getBreakpoint(width);
  const isDesktop = breakpoint === 'desktop';
  const isTablet = breakpoint === 'tablet';
  const isMobile = breakpoint === 'mobile';

  const shellWidth = isDesktop ? clamp(Math.round(width * 0.88), 1120, 1260) : width;
  const shellHeight = isDesktop ? clamp(Math.round(height * 0.9), 720, 940) : height;
  const outerPadding = isDesktop ? spacing(7) : 0;
  const pageHorizontalPadding = isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4);
  const sectionGap = isDesktop ? spacing(7) : spacing(5);

  const [menuOpen, setMenuOpen] = useState(false);

  const childName = 'Katlo Monang';
  const school = 'Botswana Accountancy College';
  const points = 48;
  const updated = '13 Jan 2026';
  const eligible = true;
  const gradeBand = 'Excellent';
  const recommendationCount = 12;

  const snapshotItems = useMemo<SnapshotItem[]>(
    () => [
      {
        id: 'status',
        icon: 'pulse-outline',
        label: 'Status',
        value: eligible ? 'Eligible' : 'Pending',
        sub: 'Sponsorship',
        tone: eligible ? 'accent' : 'warning',
      },
      {
        id: 'updated',
        icon: 'time-outline',
        label: 'Updated',
        value: updated,
        sub: 'Last sync',
        tone: 'primary',
      },
      {
        id: 'institution',
        icon: 'school-outline',
        label: 'Institution',
        value: 'BAC',
        sub: 'School',
        tone: 'primary',
      },
      {
        id: 'points',
        icon: 'trophy-outline',
        label: 'Points',
        value: String(points),
        sub: 'Total',
        tone: 'accent',
      },
    ],
    [eligible, points, updated]
  );

  const timelineItems = useMemo<TimelineItem[]>(
    () => [
      {
        id: '1',
        title: 'Latest results synced',
        body: 'Your child’s latest academic data is now reflected in the overview.',
        time: 'Today',
        icon: 'sync-outline',
      },
      {
        id: '2',
        title: 'Recommendation profile refreshed',
        body: 'Course matching has been updated based on the latest score profile.',
        time: 'Yesterday',
        icon: 'sparkles-outline',
      },
      {
        id: '3',
        title: 'Eligibility reviewed',
        body: 'Current points indicate strong readiness for sponsorship review.',
        time: 'This week',
        icon: 'shield-checkmark-outline',
      },
    ],
    []
  );

  const progressHref: Href = { pathname: '/parent/progress' as any };
  const coursesHref: Href = { pathname: '/student/courses' as any };
  const notificationsHref: Href = { pathname: '/student/notifications' as any };
  const settingsHref: Href = { pathname: '/student/settings' as any };
  const addChildHref: Href = { pathname: '/parent/add-child' as any };
  const loginHref: Href = { pathname: '/login' };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const goTo = useCallback((href: Href, method: 'push' | 'replace' = 'push') => {
    setMenuOpen(false);
    setTimeout(() => {
      if (method === 'replace') {
        router.replace(href);
      } else {
        router.push(href);
      }
    }, 0);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.desktopCanvas, { padding: outerPadding }]}>
        <View
          style={[
            styles.shell,
            {
              width: shellWidth,
              height: shellHeight,
              backgroundColor: isDesktop ? theme.shell : theme.background,
              borderColor: isDesktop ? theme.shellBorder : 'transparent',
              borderRadius: isDesktop ? radius.xxl : 0,
            },
            isDesktop ? getShadow(theme, 'lg') : null,
          ]}
        >
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: pageHorizontalPadding,
                paddingTop: spacing(4),
                paddingBottom: spacing(8),
              }}
              showsVerticalScrollIndicator={isDesktop}
              keyboardShouldPersistTaps="handled"
            >
              <HeroSection
                theme={theme}
                breakpoint={breakpoint}
                childName={childName}
                school={school}
                points={points}
                updated={updated}
                eligible={eligible}
                onBack={() => router.back()}
                onOpenMenu={() => setMenuOpen(true)}
              />

              <View style={{ marginTop: sectionGap }}>
                {isDesktop ? (
                  <View style={styles.desktopGrid}>
                    <View style={[styles.desktopSidebar, { marginRight: spacing(7) }]}>
                      <ActionsPanel
                        theme={theme}
                        sectionTitleSize={isDesktop ? 20 : 18}
                        buttonHeight={isDesktop ? 54 : 50}
                        onViewResults={() => router.push(progressHref)}
                        onViewCourses={() => router.push(coursesHref)}
                      />
                      <View style={{ height: spacing(5) }} />
                      <AtAGlancePanel
                        theme={theme}
                        gradeBand={gradeBand}
                        recommendationCount={recommendationCount}
                        eligible={eligible}
                      />
                    </View>

                    <View style={styles.desktopMain}>
                      <SnapshotPanel
                        theme={theme}
                        sectionTitleSize={isDesktop ? 20 : 18}
                        items={snapshotItems}
                        breakpoint={breakpoint}
                      />
                      <View style={{ height: spacing(5) }} />
                      <TimelinePanel theme={theme} items={timelineItems} />
                    </View>
                  </View>
                ) : (
                  <View style={{ gap: sectionGap }}>
                    <ActionsPanel
                      theme={theme}
                      sectionTitleSize={isTablet ? 19 : 18}
                      buttonHeight={isTablet ? 52 : 48}
                      onViewResults={() => router.push(progressHref)}
                      onViewCourses={() => router.push(coursesHref)}
                    />
                    <SnapshotPanel
                      theme={theme}
                      sectionTitleSize={isTablet ? 19 : 18}
                      items={snapshotItems}
                      breakpoint={breakpoint}
                    />
                    <AtAGlancePanel
                      theme={theme}
                      gradeBand={gradeBand}
                      recommendationCount={recommendationCount}
                      eligible={eligible}
                    />
                    <TimelinePanel theme={theme} items={timelineItems} />
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>

          <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={closeMenu}>
            <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]} onPress={closeMenu}>
              <Pressable onPress={() => {}} style={{ width: '100%', alignItems: 'center' }}>
                <View
                  style={[
                    styles.menuCard,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.border,
                    },
                    getShadow(theme, 'lg'),
                  ]}
                >
                  <View style={styles.menuHeaderRow}>
                    <View style={{ width: 34 }} />
                    <Text style={[typography.cardTitle, { color: theme.textPrimary }]}>Menu</Text>
                    <ScalePressable
                      onPress={closeMenu}
                      accessibilityLabel="Close menu"
                      accessibilityRole="button"
                      style={({ pressed }) => [
                        styles.menuCloseButton,
                        {
                          backgroundColor: theme.surfaceAlt,
                          borderColor: theme.border,
                          opacity: pressed ? 0.95 : 1,
                        },
                      ]}
                    >
                      <Ionicons name="close" size={18} color={theme.textPrimary} />
                    </ScalePressable>
                  </View>

                  <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

                  <MenuItem
                    theme={theme}
                    icon="person-add-outline"
                    label="Add child"
                    onPress={() => goTo(addChildHref)}
                  />
                  <MenuItem
                    theme={theme}
                    icon="notifications-outline"
                    label="Notifications"
                    onPress={() => goTo(notificationsHref)}
                  />
                  <MenuItem
                    theme={theme}
                    icon="settings-outline"
                    label="Settings"
                    onPress={() => goTo(settingsHref)}
                  />

                  <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

                  <MenuItem
                    theme={theme}
                    icon="log-out-outline"
                    label="Logout"
                    danger
                    onPress={() => goTo(loginHref, 'replace')}
                  />
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </View>
    </View>
  );
}

function HeroSection({
  theme,
  breakpoint,
  childName,
  school,
  points,
  updated,
  eligible,
  onBack,
  onOpenMenu,
}: {
  theme: Theme;
  breakpoint: Breakpoint;
  childName: string;
  school: string;
  points: number;
  updated: string;
  eligible: boolean;
  onBack: () => void;
  onOpenMenu: () => void;
}) {
  const isDesktop = breakpoint === 'desktop';
  const isMobile = breakpoint === 'mobile';

  return (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: theme.heroStart,
          borderColor: theme.heroEnd,
        },
        getShadow(theme, 'lg'),
      ]}
    >
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />

      <View style={[styles.heroHeaderRow, !isDesktop && styles.heroHeaderRowStack]}>
        <View style={[styles.heroMainColumn, isDesktop ? { paddingRight: spacing(6) } : null]}>
          <View style={styles.heroTopBar}>
            <ScalePressable
              onPress={onBack}
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
              style={({ pressed }) => [
                styles.heroIconButton,
                {
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  borderColor: 'rgba(255,255,255,0.20)',
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            </ScalePressable>

            <View style={{ flex: 1, minWidth: 0, marginLeft: spacing(3) }}>
              <Text style={[typography.hero, { color: '#FFFFFF' }]}>Child overview</Text>
              <Text style={[typography.body, { color: 'rgba(255,255,255,0.86)', marginTop: spacing(1) }]}>
                Snapshot, actions, and recent academic context
              </Text>
            </View>

            <ScalePressable
              onPress={onOpenMenu}
              accessibilityLabel="Open menu"
              style={({ pressed }) => [
                styles.heroIconButton,
                {
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderColor: 'rgba(255,255,255,0.20)',
                  opacity: pressed ? 0.95 : 1,
                },
              ]}
            >
              <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
            </ScalePressable>
          </View>

          <View style={[styles.heroProfileRow, { marginTop: spacing(5) }]}>
            <View style={styles.heroAvatar}>
              <Ionicons name="person-outline" size={20} color="#FFFFFF" />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[typography.section, { color: '#FFFFFF' }]} numberOfLines={1}>
                {childName}
              </Text>
              <Text style={[typography.bodyStrong, { color: 'rgba(255,255,255,0.84)', marginTop: spacing(1) }]} numberOfLines={1}>
                {school}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: 'rgba(255,255,255,0.92)',
                },
              ]}
            >
              <Text
                style={[
                  typography.label,
                  {
                    color: eligible ? theme.accent : theme.warning,
                  },
                ]}
                numberOfLines={1}
              >
                {eligible ? 'Eligible' : 'Not Yet'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.heroMetricsRow,
              {
                marginTop: spacing(5),
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
              },
            ]}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.76)' }]}>Current points</Text>
              <Text style={[typography.metric, { color: '#FFFFFF', marginTop: spacing(1) }]}>{points}</Text>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.84)', marginTop: spacing(1) }]}>
                Last updated {updated}
              </Text>
            </View>

            <View
              style={[
                styles.heroSponsorPill,
                {
                  marginTop: isMobile ? spacing(4) : 0,
                },
              ]}
            >
              <Ionicons name="ribbon-outline" size={18} color="#0F172A" />
              <Text style={[typography.bodyStrong, { color: '#0F172A', marginLeft: spacing(2) }]}>
                Sponsorship {eligible ? 'likely' : 'pending'}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.heroRightColumn,
            {
              marginTop: isDesktop ? 0 : spacing(5),
              width: isDesktop ? 360 : '100%',
            },
          ]}
        >
          <View
            style={[
              styles.heroInfoCard,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.16)',
              },
            ]}
          >
            <View style={styles.heroInfoIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.72)' }]}>Parent access</Text>
              <Text style={[typography.bodyStrong, { color: '#FFFFFF', marginTop: spacing(1) }]}>
                Read-only summary view
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing(3), gap: spacing(3) }}>
            {[
              { icon: 'sparkles-outline' as const, label: 'Insights', value: 'Ready' },
              { icon: 'school-outline' as const, label: 'Courses', value: 'Matched' },
              { icon: 'time-outline' as const, label: 'Sync', value: updated },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.heroInfoCard,
                  {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.16)',
                  },
                ]}
              >
                <View style={styles.heroInfoIcon}>
                  <Ionicons name={item.icon} size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[typography.caption, { color: 'rgba(255,255,255,0.72)' }]}>{item.label}</Text>
                  <Text style={[typography.bodyStrong, { color: '#FFFFFF', marginTop: spacing(1) }]} numberOfLines={1}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function ActionsPanel({
  theme,
  sectionTitleSize,
  buttonHeight,
  onViewResults,
  onViewCourses,
}: {
  theme: Theme;
  sectionTitleSize: number;
  buttonHeight: number;
  onViewResults: () => void;
  onViewCourses: () => void;
}) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <Text style={[typography.section, { color: theme.textPrimary, fontSize: sectionTitleSize }]}>Quick actions</Text>

        <View
          style={[
            styles.readOnlyBadge,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="lock-closed-outline" size={14} color={theme.textMuted} />
          <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: spacing(2) }]}>Read-only</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing(4) }}>
        <ScalePressable
          onPress={onViewResults}
          accessibilityLabel="View detailed results"
          accessibilityHint="Opens detailed academic progress for this child"
          style={({ pressed }) => [
            styles.actionButtonPrimary,
            {
              minHeight: buttonHeight,
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
              opacity: pressed ? 0.97 : 1,
            },
          ]}
        >
          <Ionicons name="trending-up-outline" size={18} color={theme.primary} />
          <Text style={[typography.bodyStrong, { color: theme.textPrimary, flex: 1, marginLeft: spacing(3) }]} numberOfLines={1}>
            View detailed results
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </ScalePressable>

        <View style={{ height: spacing(3) }} />

        <ScalePressable
          onPress={onViewCourses}
          accessibilityLabel="View course options"
          accessibilityHint="Opens recommended course options"
          style={({ pressed }) => [
            styles.actionButtonSecondary,
            {
              minHeight: buttonHeight,
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
              opacity: pressed ? 0.97 : 1,
            },
          ]}
        >
          <Ionicons name="school-outline" size={18} color={theme.textPrimary} />
          <Text style={[typography.bodyStrong, { color: theme.textPrimary, flex: 1, marginLeft: spacing(3) }]} numberOfLines={1}>
            View course options
          </Text>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </ScalePressable>
      </View>

      <View style={{ marginTop: spacing(6) }}>
        <Text style={[typography.label, { color: theme.textPrimary, marginBottom: spacing(2) }]}>Tips</Text>

        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: theme.primarySoft,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={[styles.tipIconWrap, { backgroundColor: theme.white }]}>
            <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[typography.cardTitle, { color: theme.textPrimary }]}>What you can do here</Text>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing(1) }]}>
              This overview is read-only for parents. Use the actions above to review progress and explore course options.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function SnapshotPanel({
  theme,
  sectionTitleSize,
  items,
  breakpoint,
}: {
  theme: Theme;
  sectionTitleSize: number;
  items: SnapshotItem[];
  breakpoint: Breakpoint;
}) {
  const columns = breakpoint === 'desktop' ? 2 : breakpoint === 'tablet' ? 2 : 1;

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <Text style={[typography.section, { color: theme.textPrimary, fontSize: sectionTitleSize }]}>Snapshot</Text>
        <Text style={[typography.caption, { color: theme.textMuted }]}>Student summary</Text>
      </View>

      <View
        style={[
          styles.snapshotGrid,
          {
            marginTop: spacing(4),
            flexDirection: columns === 1 ? 'column' : 'row',
            flexWrap: columns === 1 ? 'nowrap' : 'wrap',
            gap: spacing(3),
          },
        ]}
      >
        {items.map((item) => (
          <SnapshotTile key={item.id} theme={theme} item={item} columns={columns} />
        ))}
      </View>

      <View
        style={[
          styles.noticeCard,
          {
            backgroundColor: theme.surfaceAlt2,
            borderColor: theme.border,
            marginTop: spacing(5),
          },
        ]}
      >
        <Ionicons name="shield-checkmark-outline" size={18} color={theme.primary} />
        <Text style={[typography.body, { color: theme.textSecondary, flex: 1, marginLeft: spacing(3) }]}>
          You are viewing a read-only summary. For more detail, open “View detailed results”.
        </Text>
      </View>
    </View>
  );
}

function SnapshotTile({
  theme,
  item,
  columns,
}: {
  theme: Theme;
  item: SnapshotItem;
  columns: number;
}) {
  const toneMap =
    item.tone === 'accent'
      ? { bg: theme.accentSoft, color: theme.accent }
      : item.tone === 'warning'
      ? { bg: theme.warningSoft, color: theme.warning }
      : { bg: theme.primarySoft, color: theme.primary };

  return (
    <View
      style={[
        styles.snapshotTile,
        {
          width: columns === 1 ? '100%' : '48.8%',
          backgroundColor: theme.surfaceAlt,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.snapshotIconWrap, { backgroundColor: toneMap.bg }]}>
        <Ionicons name={item.icon} size={18} color={toneMap.color} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.caption, { color: theme.textMuted }]} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={[typography.cardTitle, { color: theme.textPrimary, marginTop: spacing(1) }]} numberOfLines={1}>
          {item.value}
        </Text>
        <Text style={[typography.caption, { color: theme.textSecondary, marginTop: spacing(1) }]} numberOfLines={1}>
          {item.sub}
        </Text>
      </View>
    </View>
  );
}

function AtAGlancePanel({
  theme,
  gradeBand,
  recommendationCount,
  eligible,
}: {
  theme: Theme;
  gradeBand: string;
  recommendationCount: number;
  eligible: boolean;
}) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <Text style={[typography.section, { color: theme.textPrimary }]}>At a glance</Text>
        <Ionicons name="eye-outline" size={18} color={theme.textMuted} />
      </View>

      <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
        <View
          style={[
            styles.glanceRow,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[typography.caption, { color: theme.textMuted }]}>Performance band</Text>
          <Text style={[typography.bodyStrong, { color: theme.textPrimary }]}>{gradeBand}</Text>
        </View>

        <View
          style={[
            styles.glanceRow,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[typography.caption, { color: theme.textMuted }]}>Course recommendations</Text>
          <Text style={[typography.bodyStrong, { color: theme.textPrimary }]}>{recommendationCount}</Text>
        </View>

        <View
          style={[
            styles.glanceRow,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[typography.caption, { color: theme.textMuted }]}>Sponsorship readiness</Text>
          <Text
            style={[
              typography.bodyStrong,
              {
                color: eligible ? theme.accent : theme.warning,
              },
            ]}
          >
            {eligible ? 'Strong' : 'Review'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function TimelinePanel({
  theme,
  items,
}: {
  theme: Theme;
  items: TimelineItem[];
}) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <Text style={[typography.section, { color: theme.textPrimary }]}>Recent activity</Text>
        <Text style={[typography.caption, { color: theme.textMuted }]}>Latest updates</Text>
      </View>

      <View style={{ marginTop: spacing(4) }}>
        {items.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.timelineRow,
              index < items.length - 1
                ? {
                    marginBottom: spacing(4),
                  }
                : null,
            ]}
          >
            <View style={styles.timelineRail}>
              <View style={[styles.timelineIconWrap, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name={item.icon} size={16} color={theme.primary} />
              </View>
              {index < items.length - 1 ? <View style={[styles.timelineLine, { backgroundColor: theme.border }]} /> : null}
            </View>

            <View
              style={[
                styles.timelineCard,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.timelineHeaderRow}>
                <Text style={[typography.bodyStrong, { color: theme.textPrimary, flex: 1 }]}>{item.title}</Text>
                <Text style={[typography.caption, { color: theme.textMuted, marginLeft: spacing(3) }]}>{item.time}</Text>
              </View>
              <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing(1) }]}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function MenuItem({
  theme,
  icon,
  label,
  onPress,
  danger = false,
}: {
  theme: Theme;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? theme.surfaceAlt : theme.white,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.menuIconWrap,
          {
            backgroundColor: danger ? theme.dangerSoft : theme.primarySoft,
            borderColor: danger ? theme.danger : theme.primary,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={danger ? theme.danger : theme.primary} />
      </View>

      <Text
        style={[
          typography.bodyStrong,
          {
            color: danger ? theme.danger : theme.textPrimary,
            flex: 1,
            marginLeft: spacing(3),
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      <Ionicons name="chevron-forward" size={18} color={danger ? theme.danger : theme.textMuted} />
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  desktopCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    overflow: 'hidden',
    width: '100%',
    borderWidth: 1,
  },
  safe: {
    flex: 1,
  },

  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  desktopSidebar: {
    width: 390,
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },

  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.xxl,
    borderWidth: 1,
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(6),
  },
  heroGlowOne: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  heroHeaderRowStack: {
    flexDirection: 'column',
  },
  heroMainColumn: {
    flex: 1,
    minWidth: 0,
  },
  heroRightColumn: {
    minWidth: 0,
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroIconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  statusBadge: {
    minHeight: 32,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing(3),
  },
  heroMetricsRow: {},
  heroSponsorPill: {
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfoCard: {
    minHeight: 74,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  panel: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing(5),
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readOnlyBadge: {
    minHeight: 28,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonSecondary: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing(4),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  snapshotGrid: {},
  snapshotTile: {
    minHeight: 92,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  snapshotIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  noticeCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  glanceRow: {
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineRail: {
    width: 36,
    alignItems: 'center',
  },
  timelineIconWrap: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: spacing(1),
    minHeight: 42,
  },
  timelineCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing(4),
    marginLeft: spacing(3),
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(5),
  },
  menuCard: {
    width: 320,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing(4),
  },
  menuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing(3),
  },
  menuCloseButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDivider: {
    height: 1,
    marginBottom: spacing(3),
  },
  menuItem: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});