// app/student/applications.tsx
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DashboardLayout, { spacing, typography, useTheme, radii } from '../../components/student/DashboardLayout';
import { StudentMenuProvider } from '../../components/student/StudentMenu';

// ──────────────────────────────────────────────────────────────────────────────
// Types & Data
// ──────────────────────────────────────────────────────────────────────────────
type AppStatus = 'Accepted' | 'Rejected' | 'Submitted' | 'Under review' | 'Draft';

interface ApplicationItem {
  id: string;
  university: string;
  program: string;
  date: string;
  status: AppStatus;
}

const DATA: ApplicationItem[] = [
  { id: '1', university: 'University of Botswana', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Accepted' },
  { id: '2', university: 'University of Botswana', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Rejected' },
  { id: '3', university: 'University of Botswana', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Submitted' },
  { id: '4', university: 'Botho University', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Under review' },
  { id: '5', university: 'BAC', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Draft' },
];

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────────────────────────
function ApplicationsContent() {
  const colors = useTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUniversity, setNewUniversity] = useState('');
  const [newProgram, setNewProgram] = useState('');
  const [newDate, setNewDate] = useState('');

  const selected = useMemo(() => 
    DATA.find((item) => item.id === selectedId) || null, 
    [selectedId]
  );

  const statusCounts = useMemo(() => {
    return DATA.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<AppStatus, number>);
  }, []);

  const statusConfig: Record<AppStatus, { bg: string; text: string }> = {
    Accepted: { bg: 'rgba(52,211,153,0.15)', text: '#34D399' },
    Rejected: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
    Submitted: { bg: 'rgba(59,130,246,0.15)', text: '#3B82F6' },
    'Under review': { bg: 'rgba(251,191,36,0.15)', text: '#FBBF24' },
    Draft: { bg: 'rgba(107,114,128,0.15)', text: '#6B7280' },
  };

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleViewDetails = (item: ApplicationItem) => {
    router.push({
      pathname: '/student/application-details',
      params: { 
        id: item.id,
        university: item.university,
        program: item.program,
        date: item.date,
        status: item.status,
      },
    });
  };

  const handleNewApplication = () => setModalVisible(true);

  const handleSaveApplication = () => {
    Alert.alert('Application Started', 'Your new application has been created (placeholder)');
    setModalVisible(false);
    setNewUniversity('');
    setNewProgram('');
    setNewDate('');
  };

  const closeModal = () => setModalVisible(false);

  return (
    <DashboardLayout
      title="Applications"
      subtitle="Track your progress and manage submissions"
      showPointsCard={false}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(12) }}>
        <View style={{ gap: spacing(8) }}>

          {/* Status Chips */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing(3), paddingVertical: spacing(2) }}
          >
            {Object.entries(statusCounts).map(([status, count]) => (
              <View 
                key={status} 
                style={[styles.chip, { backgroundColor: statusConfig[status as AppStatus].bg, borderColor: colors.border }]}
              >
                <Text style={[typography.label, { color: statusConfig[status as AppStatus].text, fontWeight: '600' }]}>
                  {status} ({count})
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Applications Grid */}
          <View style={styles.grid}>
            {DATA.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <Pressable
                  onPress={() => handleSelect(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[typography.bodyStrong, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
                      {item.university}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig[item.status].bg }]}>
                      <Text style={[typography.caption, { color: statusConfig[item.status].text }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing(1) }]} numberOfLines={2}>
                    {item.program}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                    <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing(2) }]}>
                      {item.date}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => handleViewDetails(item)}
                    style={({ pressed }) => [styles.detailsButton, pressed && styles.pressed]}
                  >
                    <Text style={[typography.label, { color: colors.primary }]}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </Pressable>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating New Button */}
      <Pressable onPress={handleNewApplication} style={styles.floatingButton}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </Pressable>

      {/* New Application Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <Pressable style={modalStyles.overlay} onPress={closeModal}>
            <Pressable style={[modalStyles.container, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.header}>
                <Text style={[typography.h2, { color: colors.textPrimary }]}>New Application</Text>
                <Pressable onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <View style={modalStyles.form}>
                <View style={modalStyles.inputGroup}>
                  <Text style={[typography.label, { color: colors.textSecondary }]}>University / Institution</Text>
                  <TextInput
                    style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt }]}
                    value={newUniversity}
                    onChangeText={setNewUniversity}
                    placeholder="e.g. University of Botswana"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={modalStyles.inputGroup}>
                  <Text style={[typography.label, { color: colors.textSecondary }]}>Program / Course</Text>
                  <TextInput
                    style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt }]}
                    value={newProgram}
                    onChangeText={setNewProgram}
                    placeholder="e.g. BSc Computer Science"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

                <View style={modalStyles.inputGroup}>
                  <Text style={[typography.label, { color: colors.textSecondary }]}>Application Date</Text>
                  <TextInput
                    style={[modalStyles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceAlt }]}
                    value={newDate}
                    onChangeText={setNewDate}
                    placeholder="e.g. 15/05/2026"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={modalStyles.footer}>
                <Pressable style={modalStyles.cancelButton} onPress={closeModal}>
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>Cancel</Text>
                </Pressable>
                <Pressable style={modalStyles.saveButton} onPress={handleSaveApplication}>
                  <Text style={[typography.bodyStrong, { color: '#FFFFFF' }]}>Start Application</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </DashboardLayout>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(4),
  },
  gridItem: {
    flexBasis: '100%',
    minWidth: 0,
  },
  chip: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  card: {
    padding: spacing(6),
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing(2),
  },
  statusBadge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(4),
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing(5),
    paddingVertical: spacing(3),
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing(8),
    right: spacing(8),
    width: 56,
    height: 56,
    borderRadius: 9999,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(6),
  },
  container: {
    width: '90%',
    maxWidth: 460,
    borderRadius: radii.xxl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(7),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  form: {
    padding: spacing(7),
    gap: spacing(6),
  },
  inputGroup: {
    gap: spacing(2),
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.lg,
    padding: spacing(5),
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing(7),
    gap: spacing(4),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function ApplicationsScreen() {
  return (
    <StudentMenuProvider>
      <ApplicationsContent />
    </StudentMenuProvider>
  );
}