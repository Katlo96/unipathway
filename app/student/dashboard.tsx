// dashboard.tsx
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
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
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});
const breakpoints = { mobileMax: 479, tabletMax: 1023, desktopMin: 1024 };
const maxContentWidth = 1280;
// ── Icon Type ──────────────────────────────────────────────────────────────────
type IconName = keyof typeof Ionicons.glyphMap;
// ── Types ──────────────────────────────────────────────────────────────────────
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
// ── Helper: Focus Ring ─────────────────────────────────────────────────────────
function useFocusRing() {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    props: {
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
  };
}
function getPressableState(s: PressableStateCallbackType) {
  const hovered = (s as any).hovered === true; // web only
  return { pressed: s.pressed, hovered };
}
// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { width, height } = useWindowDimensions();
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
    accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
    border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
  }), [scheme]);
  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < breakpoints.mobileMax) return 'mobile';
    if (width < breakpoints.desktopMin) return 'tablet';
    return 'desktop';
  }, [width]);
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  // Responsive layout values
  const contentPadding = isMobile ? spacing(5) : isTablet ? spacing(6) : spacing(8);
  const cardRadius = isMobile ? radii.md : radii.xl;
  const maxWidth = isDesktop ? Math.min(maxContentWidth, width - spacing(8) * 2) : width;
  const sidebarWidth = isDesktop ? 280 : 0;
  // Placeholder data
  const points = 48;
  const lastUpdated = '28 March 2026';
  const isEligible = true;
  const [navExpanded, setNavExpanded] = useState(true);
  const toggleNav = () => {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setNavExpanded(prev => !prev);
  };
  // Navigation items
  const navItems = [
    { key: 'courses', label: 'Courses', icon: 'book-outline' as const, href: '/student/courses' },
    { key: 'universities', label: 'Universities', icon: 'school-outline' as const, href: '/student/universities' },
    { key: 'scholarships', label: 'Scholarships', icon: 'ribbon-outline' as const, href: '/student/scholarships' },
    { key: 'progress', label: 'Progress', icon: 'trending-up-outline' as const, href: '/student/progress' },
    { key: 'applications', label: 'Applications', icon: 'document-text-outline' as const, href: '/student/applications' },
  ] satisfies NavItem[];
  // Quick actions
  const quickActions = [
    { label: 'Enter Results', icon: 'create-outline' as const, href: '/student/enter-results' },
    { label: 'Upload Results', icon: 'cloud-upload-outline' as const, href: '/student/upload-results' },
    { label: 'View Courses', icon: 'eye-outline' as const, href: '/student/courses' },
    { label: 'Universities', icon: 'school-outline' as const, href: '/student/universities' },
    { label: 'Scholarships', icon: 'ribbon-outline' as const, href: '/student/scholarships' },
    { label: 'Progress', icon: 'trending-up-outline' as const, href: '/student/progress' },
  ] satisfies ActionItem[];
  // Recommended
  const recommended = [
    { title: 'Biology', subtitle: 'University of Botswana', badge: 'Highly suitable' },
    { title: 'Economics', subtitle: 'Botswana Accountancy College', badge: 'Highly suitable' },
    { title: 'Computer Science', subtitle: 'University of Botswana', badge: 'Good match' },
  ];
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ padding: contentPadding, paddingBottom: spacing(10) }}
          showsVerticalScrollIndicator={isDesktop}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[typography.hero, { color: colors.textPrimary }]}>Welcome back, Katlo</Text>
            <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(1) }]}>
              Here's your latest overview
            </Text>
          </View>
          {/* Main Layout */}
          <View style={[styles.mainLayout, isDesktop && { flexDirection: 'row', gap: spacing(8) }]}>
            {/* Sidebar (desktop) */}
            {isDesktop && (
              <View style={{ width: sidebarWidth }}>
                <View style={[styles.card, { padding: spacing(5) }]}>
                  <View style={styles.sidebarHeader}>
                    <Text style={[typography.title, { color: colors.textPrimary }]}>Student</Text>
                    <Pressable
                      onPress={toggleNav}
                      style={({ pressed }) => [styles.toggleBtn, pressed && styles.pressed]}
                    >
                      <Ionicons name={navExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textPrimary} />
                    </Pressable>
                  </View>
                  {navExpanded && (
                    <View style={{ marginTop: spacing(4), gap: spacing(2) }}>
                      {navItems.map(item => (
                        <Pressable
                          key={item.key}
                          onPress={() => router.push(item.href)}
                          style={({ pressed }) => [
                            styles.navItem,
                            pressed && styles.navItemPressed,
                          ]}
                        >
                          <Ionicons name={item.icon} size={20} color={colors.textPrimary} />
                          <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing(3) }]}>
                            {item.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
            {/* Main Content */}
            <View style={{ flex: 1 }}>
              {/* Points Hero */}
              <View style={[styles.card, styles.heroCard]}>
                <View style={styles.pointsRow}>
                  <View>
                    <Text style={[typography.label, { color: colors.textSecondary }]}>Your Points</Text>
                    <Text style={[typography.hero, { color: colors.primary, marginTop: spacing(1) }]}>{points}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(1) }]}>
                      Last updated {lastUpdated}
                    </Text>
                  </View>
                  <View style={styles.pointsRight}>
                    <View style={[styles.badge, isEligible ? styles.badgeSuccess : styles.badgeNeutral]}>
                      <Text style={styles.badgeText}>{isEligible ? 'Eligible' : 'Not yet'}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push('/student/enter-results')}
                      style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
                    >
                      <Text style={[typography.body, { color: colors.primaryText }]}>Enter Results</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              {/* Quick Actions */}
              <View style={{ marginTop: spacing(6) }}>
                <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(3) }]}>
                  Quick Actions
                </Text>
                <View style={[styles.grid, { gap: spacing(4) }]}>
                  {quickActions.map((action, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => router.push(action.href)}
                      style={({ pressed }) => [
                        styles.actionCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons name={action.icon} size={28} color={colors.primary} />
                      <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing(3) }]}>
                        {action.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              {/* Recommended */}
              <View style={{ marginTop: spacing(6) }}>
                <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(3) }]}>
                  Recommended for You
                </Text>
                <View style={[styles.grid, { gap: spacing(4) }]}>
                  {recommended.map((item, idx) => (
                    <View key={idx} style={styles.recommendationCard}>
                      <Text style={[typography.body, { fontWeight: '700', color: colors.textPrimary }]}>
                        {item.title}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                        {item.subtitle}
                      </Text>
                      <View style={[styles.badge, styles.badgeSuccess, { marginTop: spacing(2) }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    </View>
                  ))}
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
  header: { marginBottom: spacing(6) },
  mainLayout: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  card: {
    backgroundColor: 'transparent',
    borderRadius: radii.xl,
    padding: spacing(5),
    ...elevations,
  },
  heroCard: { backgroundColor: '#4A9FC620' },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointsRight: { alignItems: 'flex-end' },
  badge: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeSuccess: { backgroundColor: '#388E3C20', borderColor: '#388E3C40' },
  badgeNeutral: { backgroundColor: '#7A919E20', borderColor: '#7A919E40' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  actionBtn: {
    marginTop: spacing(3),
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    borderRadius: radii.md,
    backgroundColor: '#4A9FC6',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    flex: 1,
    minWidth: 140,
    padding: spacing(4),
    borderRadius: radii.lg,
    backgroundColor: 'rgba(74,159,198,0.08)',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  recommendationCard: {
    flex: 1,
    minWidth: 220,
    padding: spacing(5),
    borderRadius: radii.lg,
    backgroundColor: 'rgba(74,159,198,0.06)',
    marginBottom: spacing(4),
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  toggleBtn: {
    padding: spacing(2),
    borderRadius: radii.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: radii.md,
    marginBottom: spacing(2),
  },
  navItemPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});