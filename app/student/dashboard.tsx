import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  LayoutAnimation,
  Animated,
  type PressableStateCallbackType,
  useColorScheme,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
  useStudentMenu,
} from '../../components/student/StudentMenu';
// ──────────────────────────────────────────────────────────────────────────────
// Design System ────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;
const typography = {
  hero: { fontSize: 38, lineHeight: 46, fontWeight: '900' as const },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '800' as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  subtitle: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;
const radii = {
  xs: spacing(1),
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(6),
  xxl: spacing(8),
  pill: 9999,
} as const;
// Cross-platform elevation helper
const getShadow = (level: 1 | 2 | 3 = 2) => {
  const opacity = 0.08 + level * 0.04;
  const radius = level * 6;
  const offsetY = level * 3;
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: level * 4,
    },
    web: {
      boxShadow: `0 ${offsetY}px ${radius}px rgba(0,0,0,${opacity})`,
    },
    default: {},
  });
};
// ──────────────────────────────────────────────────────────────────────────────
// Theme ─────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
};
function useTheme(): ThemeColors {
  const scheme = useColorScheme() ?? 'light';
  return useMemo<ThemeColors>(() => {
    const isDark = scheme === 'dark';
    return {
      background: isDark ? '#0F1217' : '#F9FAFB',
      surface: isDark ? '#1A1F2B' : '#FFFFFF',
      surfaceAlt: isDark ? '#242A38' : '#F1F5F9',
      card: isDark ? '#1F2532' : '#FFFFFF',
      divider: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      textPrimary: isDark ? '#F1F5F9' : '#111827',
      textSecondary: isDark ? '#9CA3AF' : '#4B5563',
      textMuted: isDark ? '#6B7280' : '#6B7280',
      primary: '#3B82F6',
      primaryText: '#FFFFFF',
      accent: isDark ? '#60A5FA' : '#2563EB',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      border: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
    };
  }, [scheme]);
}
// ──────────────────────────────────────────────────────────────────────────────
// Types & Data ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
type IconName = keyof typeof Ionicons.glyphMap;
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
  badgeColor?: string;
};
// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Screen ──────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
export default function StudentDashboardScreen() {
  return (
    <StudentMenuProvider>
      <DashboardContent />
    </StudentMenuProvider>
  );
}
function DashboardContent() {
  const { width } = useWindowDimensions();
  const colors = useTheme();
  const { openMenu } = useStudentMenu();
  const breakpoint = useMemo<'mobile' | 'tablet' | 'desktop'>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  const contentMaxWidth = isDesktop ? 1280 : width;
  const sidebarWidth = isDesktop ? 280 : 0;
  const pagePadding = isMobile ? spacing(5) : isTablet ? spacing(6) : spacing(8);
  const [navExpanded, setNavExpanded] = useState(true);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const toggleNav = useCallback(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setNavExpanded((prev) => !prev);
  }, []);
  const navItems: NavItem[] = useMemo(
    () => [
      { key: 'dashboard', label: 'Home', icon: 'home-outline', href: '/student/dashboard' },
      { key: 'courses', label: 'Courses', icon: 'book-outline', href: '/student/courses' },
      { key: 'institutions', label: 'Institutions', icon: 'school-outline', href: '' },
      { key: 'scholarships', label: 'Scholarships', icon: 'ribbon-outline', href: '/student/scholarships' },
      { key: 'progress', label: 'Progress', icon: 'trending-up-outline', href: '/student/progress' },
      { key: 'applications', label: 'Applications', icon: 'document-text-outline', href: '/student/applications' },
    ],
    []
  );
  const quickActions: ActionItem[] = useMemo(
    () => [
      { label: 'Enter Results', icon: 'create-outline', href: '/student/enter-results' },
      { label: 'Upload Results', icon: 'cloud-upload-outline', href: '/student/upload-results' },
      { label: 'View Courses', icon: 'eye-outline', href: '/student/courses' },
      { label: 'Institutions', icon: 'school-outline', href: '' },
      { label: 'Scholarships', icon: 'ribbon-outline', href: '/student/scholarships' },
      { label: 'Progress', icon: 'trending-up-outline', href: '/student/progress' },
    ],
    []
  );
  const recommended: Recommendation[] = useMemo(
    () => [
      { title: 'Biology', subtitle: 'University of Botswana', badge: 'Highly suitable', badgeColor: colors.success },
      { title: 'Economics', subtitle: 'Botswana Accountancy College', badge: 'Highly suitable', badgeColor: colors.success },
      { title: 'Computer Science', subtitle: 'University of Botswana', badge: 'Good match', badgeColor: colors.warning },
    ],
    [colors]
  );
  const columns = isMobile ? 1 : isTablet ? 2 : 3;
  const handleInstitutionPress = useCallback(() => {
    setShowInstitutionModal(true);
  }, []);
  const closeInstitutionModal = useCallback(() => {
    setShowInstitutionModal(false);
  }, []);
  const points = 48;
  const lastUpdated = '28 March 2026';
  const isEligible = true;
  return (
    <View style={[s.page, { backgroundColor: colors.background }]}>
      {/* @ts-ignore – edges prop is valid at runtime (types ship with package) */}
      <SafeAreaView style={s.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{
            padding: pagePadding,
            paddingBottom: spacing(12),
            maxWidth: contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          }}
          showsVerticalScrollIndicator={isDesktop}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Welcome back, Katlo</Text>
              <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                Here's your latest overview
              </Text>
            </View>
            <Pressable
              onPress={openMenu}
              style={({ pressed }) => [
                s.menuButton,
                { backgroundColor: colors.surfaceAlt },
                pressed && s.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open menu"
            >
              <Ionicons name="menu" size={24} color={colors.textPrimary} />
              {isDesktop && <Text style={[typography.label, { marginLeft: spacing(2), color: colors.textPrimary }]}>Menu</Text>}
            </Pressable>
          </View>
          {/* Main Layout */}
          <View style={[s.main, isDesktop && { flexDirection: 'row', gap: spacing(8) }]}>
            {/* Sidebar – Desktop only */}
            {isDesktop && (
              <View style={{ width: sidebarWidth, flexShrink: 0 }}>
                <View style={[s.card, { backgroundColor: colors.surface }]}>
                  <View style={[s.sidebarHeader, { backgroundColor: colors.surface }]}>
                    <Text style={[typography.h2, { color: colors.textPrimary }]}>Student</Text>
                    <Pressable onPress={toggleNav} style={s.toggleButton}>
                      <Ionicons name={navExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                  {navExpanded && (
                    <View style={{
                      backgroundColor: colors.surface,
                      padding: spacing(4),
                      paddingTop: spacing(2),
                      borderTopWidth: 1,
                      borderTopColor: colors.divider,
                    }}>
                      {navItems.map((item) => {
                        const isActive = item.key === 'dashboard';
                        return (
                          <Pressable
                            key={item.key}
                            onPress={item.href ? () => router.push(item.href) : handleInstitutionPress}
                            style={({ pressed }) => [
                              s.navItem,
                              isActive && s.navItemActive,
                              pressed && s.navItemPressed,
                            ]}
                          >
                            <Ionicons
                              name={item.icon}
                              size={20}
                              color={isActive ? colors.primary : colors.textPrimary}
                            />
                            <Text
                              style={[
                                typography.body,
                                {
                                  marginLeft: spacing(3),
                                  color: isActive ? colors.primary : colors.textPrimary,
                                  flex: 1,
                                },
                              ]}
                            >
                              {item.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            )}
            {/* Main Content */}
            <View style={{ flex: 1 }}>
              {/* Points Hero Card */}
              <View style={[s.card, s.heroCard, { backgroundColor: colors.surface }]}>
                <View style={[s.pointsRow, isMobile && s.pointsRowMobile]}>
                  <View>
                    <Text style={[typography.label, { color: colors.textSecondary }]}>Your Points</Text>
                    <Text style={[typography.h1, { color: colors.primary, marginTop: spacing(1) }]}>{points}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(1) }]}>
                      Last updated {lastUpdated}
                    </Text>
                  </View>
                  <View style={[s.pointsRight, isMobile && s.pointsRightMobile]}>
                    <View
                      style={[
                        s.badge,
                        {
                          backgroundColor: isEligible ? `${colors.success}22` : `${colors.danger}22`,
                          borderColor: isEligible ? colors.success : colors.danger,
                        },
                      ]}
                    >
                      <Text style={{ color: isEligible ? colors.success : colors.danger, fontWeight: '700' }}>
                        {isEligible ? 'Eligible' : 'Not eligible'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => router.push('/student/enter-results')}
                      style={({ pressed }) => [s.primaryButton, pressed && s.buttonPressed]}
                    >
                      <Text style={[typography.bodyStrong, { color: colors.primaryText }]}>Enter Results</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              {/* Quick Actions */}
              <View style={{ marginTop: spacing(8) }}>
                <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
                  Quick Actions
                </Text>
                <View style={[s.grid, { gap: spacing(4) }]}>
                  {quickActions.map((action) => (
                    <View key={action.label} style={{ flex: 1, minWidth: 0, maxWidth: `${100 / columns}%` }}>
                      <Pressable
                        onPress={action.href ? () => router.push(action.href) : handleInstitutionPress}
                        style={({ pressed }) => [
                          s.actionCard,
                          { backgroundColor: colors.surfaceAlt },
                          pressed && s.buttonPressed,
                        ]}
                      >
                        <View style={[s.actionIcon, { backgroundColor: colors.surface }]}>
                          <Ionicons name={action.icon} size={28} color={colors.primary} />
                        </View>
                        <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing(3), textAlign: 'center' }]}>
                          {action.label}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
              {/* Recommended */}
              <View style={{ marginTop: spacing(8) }}>
                <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
                  Recommended for You
                </Text>
                <View style={[s.grid, { gap: spacing(4) }]}>
                  {recommended.map((rec, idx) => (
                    <View key={idx} style={{ flex: 1, minWidth: 0, maxWidth: `${100 / columns}%` }}>
                      <View style={[s.recommendationCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{rec.title}</Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                          {rec.subtitle}
                        </Text>
                        <View
                          style={[
                            s.badge,
                            {
                              backgroundColor: `${rec.badgeColor}22`,
                              borderColor: rec.badgeColor,
                              marginTop: spacing(2),
                              alignSelf: 'flex-start',
                            },
                          ]}
                        >
                          <Text style={{ color: rec.badgeColor, fontWeight: '700' }}>{rec.badge}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Institutions Modal */}
      <Modal visible={showInstitutionModal} transparent animationType="fade" onRequestClose={closeInstitutionModal}>
        <Pressable style={modal.overlay} onPress={closeInstitutionModal}>
          <Pressable style={[modal.container, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={modal.header}>
              <Text style={[modal.title, { color: colors.textPrimary }]}>Choose Institution Type</Text>
              <Pressable onPress={closeInstitutionModal} hitSlop={16}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>
            <View style={modal.options}>
              <Pressable
                style={[modal.option, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => {
                  closeInstitutionModal();
                  router.push('/student/universities');
                }}
              >
                <View style={[modal.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="school-outline" size={32} color={colors.primary} />
                </View>
                <Text style={[modal.optionText, { color: colors.textPrimary }]}>Universities</Text>
              </Pressable>
              <Pressable
                style={[modal.option, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => {
                  closeInstitutionModal();
                  router.push('/student/colleges');
                }}
              >
                <View style={[modal.iconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="business-outline" size={32} color="#10B981" />
                </View>
                <Text style={[modal.optionText, { color: colors.textPrimary }]}>Colleges</Text>
              </Pressable>
              <Pressable
                style={[modal.option, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => {
                  closeInstitutionModal();
                  router.push('/student/brigades');
                }}
              >
                <View style={[modal.iconWrap, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="construct-outline" size={32} color="#F59E0B" />
                </View>
                <Text style={[modal.optionText, { color: colors.textPrimary }]}>Brigades</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
// ──────────────────────────────────────────────────────────────────────────────
// Styles ────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(8),
  },
  headerLeft: { flex: 1 },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 48,
  },
  main: { flex: 1 },
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroCard: { padding: spacing(6) },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing(6),
  },
  pointsRowMobile: { flexDirection: 'column', gap: spacing(4) },
  pointsRight: { alignItems: 'flex-end' },
  pointsRightMobile: { alignItems: 'flex-start' },
  badge: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(4),
    borderRadius: radii.lg,
    marginTop: spacing(3),
  },
  buttonPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing(2),
  },
  actionCard: {
    padding: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: 140,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationCard: {
    padding: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
    minHeight: 160,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  toggleButton: {
    padding: spacing(2),
    borderRadius: radii.md,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4),
    borderRadius: radii.lg,
    marginBottom: spacing(2),
  },
  navItemActive: { backgroundColor: '#EFF6FF' },
  navItemPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
// Modal styles
const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(6),
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    ...getShadow(3),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(6),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  options: {
    padding: spacing(5),
    gap: spacing(4),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(5),
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
});