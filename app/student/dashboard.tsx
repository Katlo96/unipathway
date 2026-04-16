// app/student/dashboard.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DashboardLayout, {
  spacing,
  typography,
  useTheme,
  radii,
} from '../../components/student/DashboardLayout';
import { StudentMenuProvider } from '../../components/student/StudentMenu';

export default function StudentDashboardScreen() {
  return (
    <StudentMenuProvider>
      <DashboardContent />
    </StudentMenuProvider>
  );
}

// ─── Responsive breakpoints ──────────────────────────────────────────────────
function useLayout() {
  const { width } = useWindowDimensions();

  // Mobile: < 480  |  Tablet: 480–1023  |  Desktop: ≥ 1024
  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 1024;
  const isDesktop = width >= 1024;

  // Quick-action columns
  const actionCols = isMobile ? 2 : isTablet ? 3 : 3;

  // Recommended columns
  const recCols = isMobile ? 1 : isTablet ? 2 : 3;

  return { width, isMobile, isTablet, isDesktop, actionCols, recCols };
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent() {
  const colors = useTheme();
  const layout = useLayout();

  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const openInstitutionModal = useCallback(() => setShowInstitutionModal(true), []);
  const closeInstitutionModal = useCallback(() => setShowInstitutionModal(false), []);

  const quickActions = useMemo(
    () => [
      { label: 'Enter Results',   icon: 'create-outline' as const,       href: '/student/enter-results'  },
      { label: 'Upload Results',  icon: 'cloud-upload-outline' as const,  href: '/student/upload-results' },
      { label: 'View Courses',    icon: 'eye-outline' as const,           href: '/student/courses'        },
      { label: 'Institutions',    icon: 'school-outline' as const,        onPress: openInstitutionModal   },
      { label: 'Scholarships',    icon: 'ribbon-outline' as const,        href: '/student/scholarships'   },
      { label: 'Progress',        icon: 'trending-up-outline' as const,   href: '/student/progress'       },
    ],
    [openInstitutionModal],
  );

  const recommended = useMemo(
    () => [
      {
        title: 'Biology',
        subtitle: 'University of Botswana',
        badge: 'Highly Suitable',
        badgeColor: colors.success,
        icon: 'leaf-outline' as const,
      },
      {
        title: 'Economics',
        subtitle: 'Botswana Accountancy College',
        badge: 'Highly Suitable',
        badgeColor: colors.success,
        icon: 'bar-chart-outline' as const,
      },
      {
        title: 'Computer Science',
        subtitle: 'University of Botswana',
        badge: 'Good Match',
        badgeColor: colors.warning,
        icon: 'code-slash-outline' as const,
      },
    ],
    [colors],
  );

  const { actionCols, recCols, isMobile } = layout;

  return (
    <DashboardLayout
      showPointsCard={true}
      points={48}
      lastUpdated="28 March 2026"
      isEligible={true}
    >
      {/* ── Quick Actions ── */}
      <View style={{ marginTop: spacing(8) }}>
        <SectionHeader title="Quick Actions" colors={colors} />

        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <View
              key={index}
              style={[
                styles.gridItem,
                { width: `${100 / actionCols}%` },
              ]}
            >
              <ActionCard
                action={action}
                colors={colors}
                isMobile={isMobile}
              />
            </View>
          ))}
        </View>
      </View>

      {/* ── Recommended for You ── */}
      <View style={{ marginTop: spacing(10), marginBottom: spacing(4) }}>
        <SectionHeader title="Recommended for You" colors={colors} />

        <View style={styles.grid}>
          {recommended.map((rec, idx) => (
            <View
              key={idx}
              style={[
                styles.gridItem,
                { width: `${100 / recCols}%` },
              ]}
            >
              <RecommendationCard rec={rec} colors={colors} isMobile={isMobile} />
            </View>
          ))}
        </View>
      </View>

      {/* ── Institution Modal ── */}
      <InstitutionModal
        visible={showInstitutionModal}
        onClose={closeInstitutionModal}
        colors={colors}
        isMobile={isMobile}
      />
    </DashboardLayout>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
      <Text style={[typography.h2, styles.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
    </View>
  );
}

// ─── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({
  action,
  colors,
  isMobile,
}: {
  action: any;
  colors: any;
  isMobile: boolean;
}) {
  const handlePress = action.onPress
    ? action.onPress
    : () => router.push(action.href!);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: 'rgba(255,255,255,0.08)',
          // On mobile make the card a bit more compact vertically
          minHeight: isMobile ? 110 : 140,
          paddingVertical: isMobile ? spacing(4) : spacing(5),
          paddingHorizontal: isMobile ? spacing(3) : spacing(5),
          transform: pressed ? [{ scale: 0.97 }] : [{ scale: 1 }],
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {/* Icon bubble */}
      <View
        style={[
          styles.actionIconWrap,
          {
            backgroundColor: colors.surface,
            width: isMobile ? 52 : 64,
            height: isMobile ? 52 : 64,
            borderRadius: isMobile ? radii.md : radii.lg,
          },
        ]}
      >
        <Ionicons
          name={action.icon}
          size={isMobile ? 22 : 28}
          color={colors.primary}
        />
      </View>

      {/* Label */}
      <Text
        style={[
          styles.actionLabel,
          {
            color: colors.textPrimary,
            marginTop: spacing(isMobile ? 2 : 3),
            fontSize: isMobile ? 11 : 13,
          },
        ]}
        numberOfLines={2}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

// ─── Recommendation Card ──────────────────────────────────────────────────────
function RecommendationCard({
  rec,
  colors,
  isMobile,
}: {
  rec: any;
  colors: any;
  isMobile: boolean;
}) {
  return (
    <View
      style={[
        styles.recCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.divider,
          flexDirection: isMobile ? 'row' : 'column',
          alignItems: isMobile ? 'center' : 'flex-start',
          minHeight: isMobile ? 0 : 160,
          paddingVertical: isMobile ? spacing(4) : spacing(5),
          paddingHorizontal: spacing(5),
          gap: isMobile ? spacing(4) : 0,
        },
      ]}
    >
      {/* Icon avatar */}
      <View
        style={[
          styles.recIconWrap,
          {
            backgroundColor: `${rec.badgeColor}18`,
            borderColor: `${rec.badgeColor}44`,
            width: isMobile ? 44 : 52,
            height: isMobile ? 44 : 52,
            borderRadius: isMobile ? radii.md : radii.lg,
          },
        ]}
      >
        <Ionicons
          name={rec.icon}
          size={isMobile ? 20 : 24}
          color={rec.badgeColor}
        />
      </View>

      {/* Text block */}
      <View style={{ flex: 1, marginTop: isMobile ? 0 : spacing(3) }}>
        <Text
          style={[
            typography.bodyStrong,
            { color: colors.textPrimary, fontSize: isMobile ? 14 : 15 },
          ]}
          numberOfLines={1}
        >
          {rec.title}
        </Text>

        <Text
          style={[
            typography.caption,
            {
              color: colors.textSecondary,
              marginTop: spacing(1),
              fontSize: isMobile ? 11 : 12,
            },
          ]}
          numberOfLines={2}
        >
          {rec.subtitle}
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${rec.badgeColor}1A`,
              borderColor: rec.badgeColor,
              marginTop: spacing(isMobile ? 2 : 3),
            },
          ]}
        >
          <View
            style={[styles.badgeDot, { backgroundColor: rec.badgeColor }]}
          />
          <Text
            style={{
              color: rec.badgeColor,
              fontWeight: '700',
              fontSize: isMobile ? 10 : 11,
              letterSpacing: 0.3,
            }}
          >
            {rec.badge}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Institution Modal ────────────────────────────────────────────────────────
const INSTITUTION_OPTIONS = [
  {
    label: 'Universities',
    icon: 'school-outline' as const,
    iconColor: '#60A5FA',
    iconBg: '#172554',
    href: '/student/universities',
    desc: 'Degree & postgraduate programmes',
  },
  {
    label: 'Colleges',
    icon: 'business-outline' as const,
    iconColor: '#34D399',
    iconBg: '#14532D',
    href: '/student/colleges',
    desc: 'Diploma & certificate courses',
  },
  {
    label: 'Brigades',
    icon: 'construct-outline' as const,
    iconColor: '#FBBF24',
    iconBg: '#78350F',
    href: '/student/brigades',
    desc: 'Technical & vocational training',
  },
];

function InstitutionModal({
  visible,
  onClose,
  colors,
  isMobile,
}: {
  visible: boolean;
  onClose: () => void;
  colors: any;
  isMobile: boolean;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        {/* Stop propagation so tapping inside doesn't close */}
        <Pressable
          style={[
            modalStyles.container,
            {
              backgroundColor: colors.surface,
              // Slightly wider on mobile to use screen estate
              width: isMobile ? '94%' : '88%',
            },
          ]}
          onPress={() => {}}
        >
          {/* Header */}
          <View
            style={[
              modalStyles.header,
              { borderBottomColor: 'rgba(255,255,255,0.08)' },
            ]}
          >
            <View style={modalStyles.headerLeft}>
              <View
                style={[
                  modalStyles.headerIconWrap,
                  { backgroundColor: `${colors.primary}22` },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <Text style={[modalStyles.title, { color: colors.textPrimary }]}>
                Choose Institution
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={16}
              style={[
                modalStyles.closeBtn,
                { backgroundColor: colors.surfaceAlt },
              ]}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Subtitle */}
          <Text
            style={[modalStyles.subtitle, { color: colors.textSecondary }]}
          >
            Select the type of institution you'd like to explore
          </Text>

          {/* Options */}
          <View style={modalStyles.options}>
            {INSTITUTION_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                style={({ pressed }) => [
                  modalStyles.option,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: 'rgba(255,255,255,0.07)',
                    transform: pressed ? [{ scale: 0.98 }] : [{ scale: 1 }],
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
                onPress={() => {
                  onClose();
                  router.push(opt.href);
                }}
              >
                <View
                  style={[
                    modalStyles.optIconWrap,
                    { backgroundColor: opt.iconBg },
                  ]}
                >
                  <Ionicons name={opt.icon} size={26} color={opt.iconColor} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      modalStyles.optLabel,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    style={[
                      modalStyles.optDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {opt.desc}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing(2),
  },
  gridItem: {
    paddingHorizontal: spacing(2),
    paddingBottom: spacing(4),
  },

  // Section header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(4),
    gap: spacing(3),
  },
  sectionAccent: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    // typography.h2 already applied inline
  },

  // Action card
  actionCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Transition handled via pressed state inline
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'transform 0.15s ease, opacity 0.15s ease' },
    }),
  },
  actionIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Recommendation card
  recCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    ...Platform.select({
      web: { cursor: 'pointer' },
    }),
  },
  recIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: spacing(1),
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
  },
  container: {
    maxWidth: 420,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    // Subtle elevation
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
      },
      android: { elevation: 24 },
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(6),
    paddingTop: spacing(6),
    paddingBottom: spacing(4),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    paddingHorizontal: spacing(6),
    paddingTop: spacing(3),
    paddingBottom: spacing(1),
    lineHeight: 18,
  },
  options: {
    padding: spacing(5),
    gap: spacing(3),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(4),
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing(4),
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'transform 0.15s ease, opacity 0.15s ease' },
    }),
  },
  optIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  optDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});