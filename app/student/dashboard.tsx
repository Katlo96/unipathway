// app/student/dashboard.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DashboardLayout, { spacing, typography, useTheme, radii } from '../../components/student/DashboardLayout';
import { StudentMenuProvider } from '../../components/student/StudentMenu';

export default function StudentDashboardScreen() {
  return (
    <StudentMenuProvider>
      <DashboardContent />
    </StudentMenuProvider>
  );
}

function DashboardContent() {
  const colors = useTheme();

  const [showInstitutionModal, setShowInstitutionModal] = useState(false);

  const openInstitutionModal = useCallback(() => setShowInstitutionModal(true), []);
  const closeInstitutionModal = useCallback(() => setShowInstitutionModal(false), []);

  const quickActions = useMemo(() => [
    { label: 'Enter Results', icon: 'create-outline' as const, href: '/student/enter-results' },
    { label: 'Upload Results', icon: 'cloud-upload-outline' as const, href: '/student/upload-results' },
    { label: 'View Courses', icon: 'eye-outline' as const, href: '/student/courses' },
    { label: 'Institutions', icon: 'school-outline' as const, onPress: openInstitutionModal },   // ← Changed here
    { label: 'Scholarships', icon: 'ribbon-outline' as const, href: '/student/scholarships' },
    { label: 'Progress', icon: 'trending-up-outline' as const, href: '/student/progress' },
  ], [openInstitutionModal]);

  const recommended = useMemo(() => [
    { title: 'Biology', subtitle: 'University of Botswana', badge: 'Highly suitable', badgeColor: colors.success },
    { title: 'Economics', subtitle: 'Botswana Accountancy College', badge: 'Highly suitable', badgeColor: colors.success },
    { title: 'Computer Science', subtitle: 'University of Botswana', badge: 'Good match', badgeColor: colors.warning },
  ], [colors]);

  const columns = 3;

  return (
    <DashboardLayout
      showPointsCard={true}
      points={48}
      lastUpdated="28 March 2026"
      isEligible={true}
    >
      {/* Quick Actions */}
      <View style={{ marginTop: spacing(8) }}>
        <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
          Quick Actions
        </Text>
        <View style={[localStyles.grid]}>
          {quickActions.map((action, index) => (
            <View key={index} style={{ flex: 1, minWidth: 0, maxWidth: `${100 / columns}%` }}>
              <Pressable
                onPress={action.onPress ? action.onPress : () => router.push(action.href!)}
                style={({ pressed }) => [
                  localStyles.actionCard,
                  { backgroundColor: colors.surfaceAlt },
                  pressed && localStyles.buttonPressed,
                ]}
              >
                <View style={[localStyles.actionIcon, { backgroundColor: colors.surface }]}>
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

      {/* Recommended for You */}
      <View style={{ marginTop: spacing(8) }}>
        <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
          Recommended for You
        </Text>
        <View style={[localStyles.grid]}>
          {recommended.map((rec, idx) => (
            <View key={idx} style={{ flex: 1, minWidth: 0, maxWidth: `${100 / columns}%` }}>
              <View style={[localStyles.recommendationCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{rec.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                  {rec.subtitle}
                </Text>
                <View style={[localStyles.badge, { 
                  backgroundColor: `${rec.badgeColor}22`, 
                  borderColor: rec.badgeColor, 
                  marginTop: spacing(2) 
                }]}>
                  <Text style={{ color: rec.badgeColor, fontWeight: '700' }}>{rec.badge}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Institutions Modal - Same look & behavior as in DashboardLayout */}
      <Modal 
        visible={showInstitutionModal} 
        transparent 
        animationType="fade" 
        onRequestClose={closeInstitutionModal}
      >
        <Pressable style={modalStyles.overlay} onPress={closeInstitutionModal}>
          <Pressable 
            style={[modalStyles.container, { backgroundColor: colors.surface }]} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={modalStyles.header}>
              <Text style={[modalStyles.title, { color: colors.textPrimary }]}>Choose Institution Type</Text>
              <Pressable onPress={closeInstitutionModal} hitSlop={16}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={modalStyles.options}>
              <Pressable
                style={[modalStyles.option, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => {
                  closeInstitutionModal();
                  router.push('/student/universities');
                }}
              >
                <View style={[modalStyles.iconWrap, { backgroundColor: '#172554' }]}>
                  <Ionicons name="school-outline" size={32} color={colors.primary} />
                </View>
                <Text style={[modalStyles.optionText, { color: colors.textPrimary }]}>Universities</Text>
              </Pressable>

              <Pressable
                style={[modalStyles.option, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => {
                  closeInstitutionModal();
                  router.push('/student/colleges');
                }}
              >
                <View style={[modalStyles.iconWrap, { backgroundColor: '#14532D' }]}>
                  <Ionicons name="business-outline" size={32} color="#34D399" />
                </View>
                <Text style={[modalStyles.optionText, { color: colors.textPrimary }]}>Colleges</Text>
              </Pressable>

              <Pressable
                style={[modalStyles.option, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => {
                  closeInstitutionModal();
                  router.push('/student/brigades');
                }}
              >
                <View style={[modalStyles.iconWrap, { backgroundColor: '#78350F' }]}>
                  <Ionicons name="construct-outline" size={32} color="#FBBF24" />
                </View>
                <Text style={[modalStyles.optionText, { color: colors.textPrimary }]}>Brigades</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </DashboardLayout>
  );
}

// Local card styles
const localStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(4),
  },
  actionCard: {
    padding: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
  badge: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  buttonPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
});

// Modal styles (identical to DashboardLayout)
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(6),
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(6),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { fontSize: 20, fontWeight: '700' },
  options: { padding: spacing(5), gap: spacing(4) },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(5),
  },
  optionText: { fontSize: 18, fontWeight: '600' },
});