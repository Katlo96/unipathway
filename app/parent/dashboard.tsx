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
  useColorScheme,
  useWindowDimensions,
  View,
  ViewStyle,
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
  hero: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  section: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  metric: { fontSize: 36, lineHeight: 40, fontWeight: '800' as const },
};

const lightTheme = {
  background: '#F8FAFC',
  backgroundAccent: '#EEF4FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  surfaceAlt2: '#EAF2FF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  primarySoftText: '#1D4ED8',
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
};

const darkTheme = {
  background: '#020817',
  backgroundAccent: '#0B1223',
  surface: '#0F172A',
  surfaceElevated: '#111C31',
  surfaceAlt: '#1E293B',
  surfaceAlt2: '#172554',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#60A5FA',
  primarySoft: '#1E3A8A',
  primarySoftText: '#BFDBFE',
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
};

type Theme = typeof lightTheme;
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

type Child = {
  id: string;
  name: string;
  points: number;
  eligible: boolean;
};

type Notice = {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  body: string;
  time: string;
  unread?: boolean;
};

const CHILDREN: Child[] = [
  { id: '1', name: 'Katlo Monang', points: 48, eligible: true },
  { id: '2', name: 'Reabetswe Monang', points: 36, eligible: false },
];

const NOTICES: Notice[] = [
  {
    id: 'n1',
    type: 'success',
    title: 'New course matches points',
    body: '2 new options were added under Recommended.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 'n2',
    type: 'info',
    title: 'Application saved',
    body: 'Draft was saved successfully.',
    time: 'Yesterday',
  },
  {
    id: 'n3',
    type: 'warning',
    title: 'Deadline approaching',
    body: 'Scholarship closes in 3 days.',
    time: 'Yesterday',
    unread: true,
  },
];

function getBreakpoint(width: number): Breakpoint {
  if (width < 480) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
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

function getContentMaxWidth(breakpoint: Breakpoint) {
  if (breakpoint === 'desktop') return 1240;
  if (breakpoint === 'tablet') return 1100;
  return undefined;
}

function getResponsiveColumns(breakpoint: Breakpoint, desktop: number, tablet: number, mobile: number) {
  if (breakpoint === 'desktop') return desktop;
  if (breakpoint === 'tablet') return tablet;
  return mobile;
}

function getGridItemWidth(columns: number, gap: number) {
  if (columns <= 1) return '100%';
  return `calc(${100 / columns}% - ${(gap * (columns - 1)) / columns}px)` as any;
}

function isMobileRowBreakpoint(breakpoint: Breakpoint) {
  return breakpoint === 'mobile';
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
        if (typeof style === 'function') {
          return style(state);
        }
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

// ────────────────────────────────────────────────
// Main Screen
// ────────────────────────────────────────────────
export default function ParentDashboardScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const breakpoint = getBreakpoint(width);
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  const contentMaxWidth = getContentMaxWidth(breakpoint);
  const pageHorizontalPadding = isDesktop ? spacing(8) : isTablet ? spacing(6) : spacing(4);
  const sectionGap = isDesktop ? spacing(8) : spacing(6);

  const [selectedChildId, setSelectedChildId] = useState(CHILDREN[0]?.id ?? '1');
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const selectedChild = useMemo(
    () => CHILDREN.find((child) => child.id === selectedChildId) ?? CHILDREN[0],
    [selectedChildId]
  );

  const navigate = useCallback((href: Href) => {
    setShowMenu(false);
    router.push(href);
  }, []);

  const topStats = useMemo<
    Array<{
      label: string;
      value: string;
      icon: keyof typeof Ionicons.glyphMap;
      tone: 'success' | 'warning' | 'info';
    }>
  >(
    () => [
      {
        label: 'Current Points',
        value: String(selectedChild.points),
        icon: 'ribbon-outline',
        tone: selectedChild.eligible ? 'success' : 'warning',
      },
      {
        label: 'Eligibility',
        value: selectedChild.eligible ? 'Qualified' : 'Review Needed',
        icon: selectedChild.eligible ? 'checkmark-circle-outline' : 'alert-circle-outline',
        tone: selectedChild.eligible ? 'success' : 'warning',
      },
      {
        label: 'Children Linked',
        value: String(CHILDREN.length),
        icon: 'people-outline',
        tone: 'info',
      },
    ],
    [selectedChild]
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View
          style={[
            styles.pageShell,
            {
              paddingHorizontal: pageHorizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.pageInner,
              contentMaxWidth
                ? {
                    maxWidth: contentMaxWidth,
                  }
                : null,
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={isDesktop}
              contentContainerStyle={{
                paddingTop: spacing(4),
                paddingBottom: spacing(8),
              }}
              keyboardShouldPersistTaps="handled"
            >
              <HeroSection
                theme={theme}
                breakpoint={breakpoint}
                selectedChild={selectedChild}
                onOpenChildren={() => setShowChildSelector(true)}
                onOpenMenu={() => setShowMenu(true)}
                onAddChild={() => navigate('/parent/add-child' as any)}
                stats={topStats}
              />

              {isDesktop ? (
                <View style={[styles.desktopBoard, { marginTop: sectionGap }]}>
                  <View style={styles.desktopSidebar}>
                    <ChildSummaryCard
                      child={selectedChild}
                      theme={theme}
                      breakpoint={breakpoint}
                      onPress={() => navigate('/parent/child-overview' as any)}
                    />
                    <View style={{ height: sectionGap }} />
                    <QuickActions theme={theme} breakpoint={breakpoint} navigate={navigate} />
                  </View>

                  <View style={styles.desktopMain}>
                    <View style={styles.desktopTopGrid}>
                      <View style={styles.desktopTopGridLeft}>
                        <ProgressPanel theme={theme} breakpoint={breakpoint} navigate={navigate} />
                      </View>

                      <View style={styles.desktopTopGridRight}>
                        <ApplicationsPanel theme={theme} breakpoint={breakpoint} navigate={navigate} />
                      </View>
                    </View>

                    <View style={{ height: sectionGap }} />

                    <NotificationsPanel
                      notices={NOTICES}
                      theme={theme}
                      breakpoint={breakpoint}
                      navigate={navigate}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: sectionGap }}>
                  <ChildSummaryCard
                    child={selectedChild}
                    theme={theme}
                    breakpoint={breakpoint}
                    onPress={() => navigate('/parent/child-overview' as any)}
                  />
                  <View style={{ height: sectionGap }} />
                  <QuickActions theme={theme} breakpoint={breakpoint} navigate={navigate} />
                  <View style={{ height: sectionGap }} />
                  <ProgressPanel theme={theme} breakpoint={breakpoint} navigate={navigate} />
                  <View style={{ height: sectionGap }} />
                  <ApplicationsPanel theme={theme} breakpoint={breakpoint} navigate={navigate} />
                  <View style={{ height: sectionGap }} />
                  <NotificationsPanel
                    notices={NOTICES}
                    theme={theme}
                    breakpoint={breakpoint}
                    navigate={navigate}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
            <Modal
        visible={showChildSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowChildSelector(false)}
      >
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}
          onPress={() => setShowChildSelector(false)}
        >
          <Pressable onPress={() => {}} style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  maxWidth: isMobile ? 360 : 440,
                },
                getShadow(theme, 'lg'),
              ]}
            >
              <View style={styles.modalTitleRow}>
                <Text style={[typography.section, { color: theme.textPrimary }]}>Select Child</Text>
                <ScalePressable
                  onPress={() => setShowChildSelector(false)}
                  accessibilityLabel="Close child selector"
                  style={({ pressed }) => [
                    styles.iconOnlyButton,
                    { backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Ionicons name="close" size={20} color={theme.textMuted} />
                </ScalePressable>
              </View>

              <Text
                style={[
                  typography.caption,
                  {
                    color: theme.textMuted,
                    marginTop: spacing(1),
                    marginBottom: spacing(4),
                  },
                ]}
              >
                Choose the child whose academic information you want to review.
              </Text>

              {CHILDREN.map((child) => {
                const isActive = child.id === selectedChildId;

                return (
                  <ScalePressable
                    key={child.id}
                    onPress={() => {
                      setSelectedChildId(child.id);
                      setShowChildSelector(false);
                    }}
                    accessibilityLabel={`Select ${child.name}`}
                    style={({ pressed }) => [
                      styles.selectorRow,
                      {
                        backgroundColor: isActive ? theme.primarySoft : theme.surfaceAlt,
                        borderColor: isActive ? theme.primary : theme.border,
                        opacity: pressed ? 0.98 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.selectorAvatar,
                        {
                          backgroundColor: isActive ? theme.surface : theme.primarySoft,
                        },
                      ]}
                    >
                      <Ionicons name="person-outline" size={20} color={theme.primary} />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[typography.bodyStrong, { color: theme.textPrimary }]} numberOfLines={1}>
                        {child.name}
                      </Text>
                      <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(0.5) }]}>
                        Points: {child.points} • {child.eligible ? 'Eligible' : 'Not yet eligible'}
                      </Text>
                    </View>

                    {isActive ? (
                      <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                    )}
                  </ScalePressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]} onPress={() => setShowMenu(false)}>
          <Pressable
            onPress={() => {}}
            style={{
              width: '100%',
              alignItems: isDesktop ? 'flex-end' : 'center',
            }}
          >
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.border,
                  width: isMobile ? '100%' : 360,
                },
                getShadow(theme, 'lg'),
              ]}
            >
              <View style={styles.menuHeader}>
                <View>
                  <Text style={[typography.section, { color: theme.textPrimary }]}>Menu</Text>
                  <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
                    Quick access to key actions
                  </Text>
                </View>

                <ScalePressable
                  onPress={() => setShowMenu(false)}
                  accessibilityLabel="Close menu"
                  style={({ pressed }) => [
                    styles.iconOnlyButton,
                    { backgroundColor: theme.surfaceAlt, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Ionicons name="close" size={20} color={theme.textMuted} />
                </ScalePressable>
              </View>

              <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

              <MenuItem
                icon="person-add-outline"
                label="Add Child"
                onPress={() => navigate('/parent/add-child' as any)}
                theme={theme}
              />
              <MenuItem
                icon="notifications-outline"
                label="Notifications"
                onPress={() => navigate('/student/notifications' as any)}
                theme={theme}
              />
              <MenuItem
                icon="settings-outline"
                label="Settings"
                onPress={() => navigate('/student/settings' as any)}
                theme={theme}
              />

              <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

              <MenuItem
                icon="log-out-outline"
                label="Logout"
                danger
                onPress={() => router.replace('/login')}
                theme={theme}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ────────────────────────────────────────────────
// Sections
// ────────────────────────────────────────────────
function HeroSection({
  theme,
  breakpoint,
  selectedChild,
  onOpenChildren,
  onOpenMenu,
  onAddChild,
  stats,
}: {
  theme: Theme;
  breakpoint: Breakpoint;
  selectedChild: Child;
  onOpenChildren: () => void;
  onOpenMenu: () => void;
  onAddChild: () => void;
  stats: Array<{
    label: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    tone: 'success' | 'warning' | 'info';
  }>;
}) {
  const isDesktop = breakpoint === 'desktop';
  const heroStatsColumns = getResponsiveColumns(breakpoint, 1, 2, 1);
  const heroGap = spacing(3);
  const heroStatWidth = getGridItemWidth(heroStatsColumns, heroGap);

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

      <View style={[styles.heroTopRow, !isDesktop && styles.heroTopRowStack]}>
        <View style={[styles.heroMainCopy, isDesktop ? { paddingRight: spacing(6) } : null]}>
          <Text style={[typography.hero, { color: '#FFFFFF' }]}>Parent Dashboard</Text>
          <Text
            style={[
              typography.subtitle,
              {
                color: 'rgba(255,255,255,0.86)',
                marginTop: spacing(2),
                maxWidth: isDesktop ? 560 : undefined,
              },
            ]}
          >
            Track your children&apos;s academic journey with a polished, responsive workspace built for mobile, tablet,
            and desktop.
          </Text>

          <View
            style={[
              styles.heroActionRow,
              {
                marginTop: spacing(5),
                flexDirection: isMobileRowBreakpoint(breakpoint) ? 'column' : 'row',
                alignItems: isMobileRowBreakpoint(breakpoint) ? 'stretch' : 'center',
              },
            ]}
          >
            <ScalePressable
              onPress={onAddChild}
              accessibilityLabel="Add child"
              style={({ pressed }) => [
                styles.primaryHeroButton,
                {
                  backgroundColor: '#FFFFFF',
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <Ionicons name="person-add-outline" size={18} color="#0F172A" />
              <Text style={[typography.label, { color: '#0F172A', marginLeft: spacing(2) }]}>Add Child</Text>
            </ScalePressable>

            <ScalePressable
              onPress={onOpenMenu}
              accessibilityLabel="Open dashboard menu"
              style={({ pressed }) => [
                styles.secondaryHeroButton,
                {
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderColor: 'rgba(255,255,255,0.18)',
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <Ionicons name="menu-outline" size={18} color="#FFFFFF" />
              <Text style={[typography.label, { color: '#FFFFFF', marginLeft: spacing(2) }]}>Menu</Text>
            </ScalePressable>
          </View>
        </View>

        <View
          style={[
            styles.heroRightPane,
            {
              marginTop: isDesktop ? 0 : spacing(5),
              width: isDesktop ? 360 : '100%',
            },
          ]}
        >
          <ScalePressable
            onPress={onOpenChildren}
            accessibilityLabel="Open child selector"
            style={({ pressed }) => [
              styles.heroChildSelector,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.16)',
                opacity: pressed ? 0.96 : 1,
              },
            ]}
          >
            <View style={styles.heroChildSelectorLeft}>
              <View style={styles.heroAvatar}>
                <Ionicons name="person-outline" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[typography.caption, { color: 'rgba(255,255,255,0.72)' }]}>Active child</Text>
                <Text style={[typography.bodyStrong, { color: '#FFFFFF', marginTop: spacing(0.5) }]} numberOfLines={1}>
                  {selectedChild.name}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
          </ScalePressable>

          <View
            style={[
              styles.heroStatsGrid,
              {
                marginTop: spacing(4),
                flexDirection: heroStatsColumns === 1 ? 'column' : 'row',
                flexWrap: heroStatsColumns === 1 ? 'nowrap' : 'wrap',
                gap: heroGap,
              },
            ]}
          >
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.heroStatCard,
                  {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.16)',
                    width: heroStatWidth,
                  },
                ]}
              >
                <View style={styles.heroStatIcon}>
                  <Ionicons name={stat.icon} size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[typography.caption, { color: 'rgba(255,255,255,0.72)' }]}>{stat.label}</Text>
                  <Text style={[typography.cardTitle, { color: '#FFFFFF', marginTop: spacing(1) }]} numberOfLines={1}>
                    {stat.value}
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

function ChildSummaryCard({
  child,
  theme,
  breakpoint,
  onPress,
}: {
  child: Child;
  theme: Theme;
  breakpoint: Breakpoint;
  onPress: () => void;
}) {
  const isDesktop = breakpoint === 'desktop';
  const statusBg = child.eligible ? theme.accentSoft : theme.warningSoft;
  const statusText = child.eligible ? theme.accent : theme.warning;

  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel="View child overview"
      accessibilityHint="Opens detailed overview for the selected child"
      style={({ pressed }) => [
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
          opacity: pressed ? 0.98 : 1,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderBase}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.caption, { color: theme.textMuted }]}>Selected Child</Text>
          <Text
            style={[
              typography.section,
              {
                color: theme.textPrimary,
                marginTop: spacing(1),
              },
            ]}
            numberOfLines={1}
          >
            {child.name}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: statusBg,
            },
          ]}
        >
          <Text style={[typography.label, { color: statusText }]}>{child.eligible ? 'Eligible' : 'Not Eligible'}</Text>
        </View>
      </View>

      <View
        style={[
          styles.childMetricRow,
          {
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'flex-start',
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: theme.textMuted }]}>Current Points</Text>
          <Text style={[typography.metric, { color: theme.textPrimary, marginTop: spacing(2) }]}>{child.points}</Text>
        </View>

        <View
          style={[
            styles.childMetricBadge,
            {
              backgroundColor: theme.primarySoft,
              marginTop: isDesktop ? 0 : spacing(4),
            },
          ]}
        >
          <Ionicons name="sparkles-outline" size={18} color={theme.primary} />
          <Text style={[typography.label, { color: theme.primary, marginLeft: spacing(2) }]}>Overview Ready</Text>
        </View>
      </View>

      <View
        style={[
          styles.metricDivider,
          {
            backgroundColor: theme.border,
          },
        ]}
      />

      <View style={styles.inlineInfoRow}>
        <View style={styles.inlineInfoItem}>
          <View style={[styles.inlineInfoIconWrap, { backgroundColor: theme.surfaceAlt }]}>
            <Ionicons name="school-outline" size={16} color={theme.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: theme.textMuted }]}>Academic Status</Text>
            <Text style={[typography.bodyStrong, { color: theme.textPrimary, marginTop: spacing(0.5) }]}>
              {child.eligible ? 'Ready for matching' : 'Needs more review'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: spacing(5), flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[typography.label, { color: theme.primary }]}>View detailed overview</Text>
        <Ionicons name="chevron-forward" size={16} color={theme.primary} style={{ marginLeft: spacing(1) }} />
      </View>
    </ScalePressable>
  );
}
function QuickActions({
  theme,
  breakpoint,
  navigate,
}: {
  theme: Theme;
  breakpoint: Breakpoint;
  navigate: (href: Href) => void;
}) {
  const actions = useMemo(
    () => [
      {
        label: 'Child Overview',
        sub: 'Profile & Results',
        icon: 'person-outline' as const,
        href: '/parent/child-overview' as any,
      },
      {
        label: 'Progress',
        sub: 'Trends & Insights',
        icon: 'trending-up-outline' as const,
        href: '/parent/progress' as any,
      },
      {
        label: 'Applications',
        sub: 'Status & Deadlines',
        icon: 'document-text-outline' as const,
        href: '/parent/applications' as any,
      },
    ],
    []
  );

  const columns = getResponsiveColumns(breakpoint, 1, 2, 1);
  const gap = spacing(3);
  const itemWidth = getGridItemWidth(columns, gap);

  return (
    <View
      style={[
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderBase}>
        <View>
          <Text style={[typography.section, { color: theme.textPrimary }]}>Quick Actions</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
            Jump directly to parent tools
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.actionGrid,
          {
            marginTop: spacing(4),
            flexDirection: columns === 1 ? 'column' : 'row',
            flexWrap: columns === 1 ? 'nowrap' : 'wrap',
            gap,
          },
        ]}
      >
        {actions.map((action) => (
          <ScalePressable
            key={action.label}
            onPress={() => navigate(action.href)}
            accessibilityLabel={action.label}
            style={({ pressed }) => [
              styles.actionItem,
              {
                width: itemWidth,
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.border,
                opacity: pressed ? 0.98 : 1,
              },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name={action.icon} size={20} color={theme.primary} />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[typography.bodyStrong, { color: theme.textPrimary }]} numberOfLines={1}>
                {action.label}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(0.5) }]} numberOfLines={1}>
                {action.sub}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
          </ScalePressable>
        ))}
      </View>
    </View>
  );
}

function ProgressPanel({
  theme,
  breakpoint,
  navigate,
}: {
  theme: Theme;
  breakpoint: Breakpoint;
  navigate: (href: Href) => void;
}) {
  const bars = useMemo(() => [18, 24, 20, 32, 28, 40, 36], []);
  const isDesktop = breakpoint === 'desktop';

  return (
    <View
      style={[
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.section, { color: theme.textPrimary }]}>Academic Progress</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
            Snapshot of recent performance movement
          </Text>
        </View>

        <ScalePressable
          onPress={() => navigate('/parent/progress' as any)}
          accessibilityLabel="View full academic progress"
          style={({ pressed }) => [
            styles.inlineLinkButton,
            { backgroundColor: theme.primarySoft, opacity: pressed ? 0.96 : 1 },
          ]}
        >
          <Text style={[typography.label, { color: theme.primary }]}>View Full</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.primary} style={{ marginLeft: spacing(1) }} />
        </ScalePressable>
      </View>

      <View style={[styles.progressShell, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        <View style={styles.progressGraphHeader}>
          <Text style={[typography.caption, { color: theme.textMuted }]}>Weekly trend</Text>
          <Text style={[typography.caption, { color: theme.primary }]}>+12%</Text>
        </View>

        <View style={[styles.progressGraph, { height: isDesktop ? 180 : 148 }]}>
          {bars.map((height, index) => (
            <View key={index} style={styles.barColumn}>
              <View
                style={[
                  styles.barTrack,
                  {
                    backgroundColor: theme.backgroundAccent,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: height * 2.8,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(2) }]}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ApplicationsPanel({
  theme,
  breakpoint,
  navigate,
}: {
  theme: Theme;
  breakpoint: Breakpoint;
  navigate: (href: Href) => void;
}) {
  const stats = useMemo(() => ({ submitted: 2, drafts: 1 }), []);
  const deadlines = useMemo(
    () => ['Scholarship — 3 days left', 'University Application — 10 days left'],
    []
  );
  const isMobile = breakpoint === 'mobile';

  return (
    <View
      style={[
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.section, { color: theme.textPrimary }]}>Applications</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
            Submission status and upcoming deadlines
          </Text>
        </View>

        <ScalePressable
          onPress={() => navigate('/parent/applications' as any)}
          accessibilityLabel="View all applications"
          style={({ pressed }) => [
            styles.inlineLinkButton,
            { backgroundColor: theme.primarySoft, opacity: pressed ? 0.96 : 1 },
          ]}
        >
          <Text style={[typography.label, { color: theme.primary }]}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.primary} style={{ marginLeft: spacing(1) }} />
        </ScalePressable>
      </View>

      <View
        style={[
          styles.statsRow,
          {
            flexDirection: isMobile ? 'column' : 'row',
          },
        ]}
      >
        <View style={[styles.statCard, { backgroundColor: theme.primarySoft, borderColor: theme.primarySoft }]}>
          <Text style={[typography.title, { color: theme.primary }]}>{stats.submitted}</Text>
          <Text style={[typography.caption, { color: theme.primary, marginTop: spacing(1) }]}>Submitted</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Text style={[typography.title, { color: theme.textPrimary }]}>{stats.drafts}</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>Drafts</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing(5) }}>
        <Text style={[typography.label, { color: theme.textSecondary, marginBottom: spacing(3) }]}>Upcoming Deadlines</Text>

        <View style={[styles.deadlinesWrap, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
          {deadlines.map((deadline, index) => (
            <View
              key={deadline}
              style={[
                styles.deadlineItem,
                index < deadlines.length - 1
                  ? {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    }
                  : null,
              ]}
            >
              <View style={[styles.deadlineIconWrap, { backgroundColor: theme.warningSoft }]}>
                <Ionicons name="time-outline" size={16} color={theme.warning} />
              </View>
              <Text style={[typography.body, { color: theme.textPrimary, flex: 1, marginLeft: spacing(3) }]}>
                {deadline}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function NotificationsPanel({
  notices,
  theme,
  breakpoint,
  navigate,
}: {
  notices: Notice[];
  theme: Theme;
  breakpoint: Breakpoint;
  navigate: (href: Href) => void;
}) {
  const isDesktop = breakpoint === 'desktop';

  const getNoticeConfig = (type: Notice['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle-outline' as const,
          color: theme.accent,
          bg: theme.accentSoft,
        };
      case 'warning':
        return {
          icon: 'alert-circle-outline' as const,
          color: theme.warning,
          bg: theme.warningSoft,
        };
      default:
        return {
          icon: 'information-circle-outline' as const,
          color: theme.primary,
          bg: theme.primarySoft,
        };
    }
  };

  return (
    <View
      style={[
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.section, { color: theme.textPrimary }]}>Notifications</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
            Recent updates and important alerts
          </Text>
        </View>

        <ScalePressable
          onPress={() => navigate('/student/notifications' as any)}
          accessibilityLabel="View all notifications"
          style={({ pressed }) => [
            styles.inlineLinkButton,
            { backgroundColor: theme.primarySoft, opacity: pressed ? 0.96 : 1 },
          ]}
        >
          <Text style={[typography.label, { color: theme.primary }]}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.primary} style={{ marginLeft: spacing(1) }} />
        </ScalePressable>
      </View>

      {notices.slice(0, 3).map((notice, index) => {
        const config = getNoticeConfig(notice.type);

        return (
          <ScalePressable
            key={notice.id}
            onPress={() => navigate('/student/notifications' as any)}
            accessibilityLabel={notice.title}
            style={({ pressed }) => [
              styles.noticeRow,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: notice.unread ? theme.primary : theme.border,
                marginTop: index === 0 ? spacing(4) : spacing(3),
                opacity: pressed ? 0.98 : 1,
              },
            ]}
          >
            <View style={[styles.noticeIconWrap, { backgroundColor: config.bg }]}>
              <Ionicons name={config.icon} size={18} color={config.color} />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.noticeTitleRow}>
                <Text
                  style={[
                    typography.body,
                    {
                      color: theme.textPrimary,
                      fontWeight: notice.unread ? '700' : '600',
                      flexShrink: 1,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {notice.title}
                </Text>

                {!isDesktop && notice.unread ? (
                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                ) : null}
              </View>

              <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]} numberOfLines={2}>
                {notice.body}
              </Text>
            </View>

            <View style={styles.noticeMeta}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>{notice.time}</Text>
              {isDesktop && notice.unread ? (
                <View style={[styles.noticeUnreadPill, { backgroundColor: theme.primarySoft }]}>
                  <Text style={[typography.caption, { color: theme.primary }]}>New</Text>
                </View>
              ) : null}
            </View>
          </ScalePressable>
        );
      })}
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger = false,
  theme,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  theme: Theme;
}) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="menuitem"
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: pressed ? theme.surfaceAlt : 'transparent',
        },
      ]}
    >
      <View style={[styles.menuItemIconWrap, { backgroundColor: danger ? theme.dangerSoft : theme.surfaceAlt }]}>
        <Ionicons name={icon} size={18} color={danger ? theme.danger : theme.textPrimary} />
      </View>

      <Text
        style={[
          typography.bodyStrong,
          {
            color: danger ? theme.danger : theme.textPrimary,
            marginLeft: spacing(3),
            flex: 1,
          },
        ]}
      >
        {label}
      </Text>

      <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
    </ScalePressable>
  );
}

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  pageShell: {
    flex: 1,
  },
  pageInner: {
    width: '100%',
    alignSelf: 'center',
    flex: 1,
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
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  heroTopRowStack: {
    flexDirection: 'column',
  },
  heroMainCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroRightPane: {
    minWidth: 0,
  },
  heroActionRow: {
    gap: spacing(3),
  },
  primaryHeroButton: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryHeroButton: {
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChildSelector: {
    minHeight: 68,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroChildSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  heroAvatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginRight: spacing(3),
  },
  heroStatsGrid: {
    justifyContent: 'space-between',
  },
  heroStatCard: {
    minHeight: 80,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
  },
  heroStatIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  desktopBoard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  desktopSidebar: {
    width: 380,
    marginRight: spacing(8),
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },
  desktopTopGrid: {
    flexDirection: 'row',
  },
  desktopTopGridLeft: {
    flex: 1.12,
    marginRight: spacing(6),
  },
  desktopTopGridRight: {
    flex: 0.88,
    minWidth: 0,
  },

  panelCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing(5),
  },
  panelHeaderBase: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  childMetricRow: {
    marginTop: spacing(5),
    justifyContent: 'space-between',
  },
  childMetricBadge: {
    minHeight: 42,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDivider: {
    height: 1,
    marginTop: spacing(5),
  },
  inlineInfoRow: {
    marginTop: spacing(5),
  },
  inlineInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineInfoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  actionGrid: {
    justifyContent: 'space-between',
  },
  actionItem: {
    minHeight: 84,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  inlineLinkButton: {
    minHeight: 38,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressShell: {
    marginTop: spacing(4),
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing(4),
  },
  progressGraphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing(4),
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 20,
    height: '100%',
    borderRadius: radius.pill,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: radius.pill,
  },

  statsRow: {
    marginTop: spacing(4),
    gap: spacing(3),
  },
  statCard: {
    flex: 1,
    minHeight: 96,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
  },
  deadlinesWrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  deadlineItem: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
  },
  deadlineIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noticeRow: {
    minHeight: 82,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    marginLeft: spacing(2),
  },
  noticeMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing(3),
  },
  noticeUnreadPill: {
    minHeight: 24,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(2),
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing(6),
  },
  modalCard: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing(5),
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconOnlyButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorRow: {
    minHeight: 72,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(3),
  },
  selectorAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  menuCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing(5),
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  menuDivider: {
    height: 1,
    marginVertical: spacing(4),
  },
  menuItem: {
    minHeight: 56,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});