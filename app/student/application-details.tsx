// app/student/applications/[id].tsx
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
import { router, useLocalSearchParams } from 'expo-router';
import DashboardLayout, { spacing, typography, useTheme, radii } from '../../components/student/DashboardLayout';
import { StudentMenuProvider } from '../../components/student/StudentMenu';

// ──────────────────────────────────────────────────────────────────────────────
// Data (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
type AppStatus = "Accepted" | "Rejected" | "Submitted" | "Under review" | "Draft";
type ChecklistKey = "submitted_form" | "uploaded_certificate" | "sent_reference_letters";

type ApplicationDetails = {
  id: string;
  university: string;
  program: string;
  date: string;
  status: AppStatus;
  deadline: string;
  checklist: Record<ChecklistKey, boolean>;
  notes: string;
};

const APPLICATION_DB: Record<string, ApplicationDetails> = {
  '1': {
    id: '1',
    university: 'University of Botswana',
    program: 'BSc Computer Science',
    date: 'Submitted March 15, 2026',
    status: 'Under review',
    deadline: '30 May 2026',
    checklist: {
      submitted_form: true,
      uploaded_certificate: false,
      sent_reference_letters: false,
    },
    notes: 'Remember to upload certificate by April 10. Follow up on reference letters.',
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Reusable Components (unchanged)
// ──────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AppStatus }) {
  const colors = useTheme();
  let bg = 'rgba(79,168,200,0.18)';
  let textColor = colors.primary;
  let dotColor = colors.primary;

  if (status === 'Accepted') {
    bg = 'rgba(52,211,153,0.18)';
    textColor = '#34D399';
    dotColor = '#34D399';
  } else if (status === 'Rejected') {
    bg = 'rgba(239,68,68,0.18)';
    textColor = '#EF4444';
    dotColor = '#EF4444';
  } else if (status === 'Under review') {
    bg = 'rgba(249,115,22,0.18)';
    textColor = '#F97316';
    dotColor = '#F97316';
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing(2),
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2),
      backgroundColor: bg,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: 'flex-start',
    }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor }} />
      <Text style={[typography.label, { color: textColor, fontWeight: '600' }]}>{status}</Text>
    </View>
  );
}

function MetaItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const colors = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function ChecklistRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(3),
        paddingVertical: spacing(3),
        paddingHorizontal: spacing(4),
        borderRadius: radii.md,
        backgroundColor: colors.surfaceAlt,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{
        width: 24,
        height: 24,
        borderRadius: radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: checked ? colors.primary : colors.border,
        backgroundColor: checked ? colors.primary : 'transparent',
      }}>
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────────────────────────────────────
function ApplicationDetailsContent() {
  const colors = useTheme();
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : '1';
  const app = APPLICATION_DB[id] ?? APPLICATION_DB['1'];

  const [notes, setNotes] = useState(app.notes);
  const [checklist, setChecklist] = useState(app.checklist);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyNote, setApplyNote] = useState('');

  const completed = Object.values(checklist).filter(Boolean).length;
  const total = Object.keys(checklist).length;

  const handleToggle = useCallback((key: ChecklistKey) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(() => {
    Alert.alert('Saved', 'Changes have been saved successfully.');
  }, []);

  const handleApply = useCallback(() => {
    setApplyModalVisible(true);
  }, []);

  const handleConfirmApply = useCallback(() => {
    setApplyModalVisible(false);
    Alert.alert('Opening Portal', 'Redirecting to application portal...');
  }, []);

  // Dynamic styles that depend on theme
  const dynamicStyles = useMemo(() => ({
    notesInput: {
      minHeight: 110,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.12)',
      padding: spacing(5),
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: colors.textPrimary,
      textAlignVertical: 'top' as const,
      fontSize: 15,
      lineHeight: 24,
    },
  }), [colors.textPrimary]);

  return (
    <DashboardLayout
      title="Application Details"
      subtitle={`${app.program} • ${app.university}`}
      showPointsCard={false}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(20) }}>
        <View style={{ gap: spacing(8) }}>

          {/* Hero Card */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={{ padding: spacing(8), gap: spacing(6) }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h1, { color: colors.textPrimary }]}>{app.program}</Text>
                  <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                    {app.university}
                  </Text>
                </View>
                <StatusBadge status={app.status} />
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(6) }}>
                <MetaItem icon="calendar-outline" label="Submitted" value={app.date} />
                <MetaItem icon="time-outline" label="Deadline" value={app.deadline} />
                <MetaItem icon="checkbox-outline" label="Progress" value={`${completed}/${total} complete`} />
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing(8), flexWrap: 'wrap' }}>
            {/* Left Column */}
            <View style={{ flex: 1, minWidth: 300, gap: spacing(8) }}>
              {/* Checklist */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={{ padding: spacing(8) }}>
                  <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(5) }]}>Checklist</Text>
                  <View style={{ gap: spacing(3) }}>
                    {Object.entries(checklist).map(([key, checked]) => (
                      <ChecklistRow
                        key={key}
                        label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        checked={checked}
                        onToggle={() => handleToggle(key as ChecklistKey)}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Notes Card */}
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={{ padding: spacing(8) }}>
                  <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>Notes</Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    style={dynamicStyles.notesInput}
                  />
                </View>
              </View>
            </View>

            {/* Next Steps */}
            <View style={{ flex: 1, minWidth: 300 }}>
              <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={{ padding: spacing(8) }}>
                  <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>Next Steps</Text>
                  <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 26 }]}>
                    • Ensure all checklist items are complete before the deadline{'\n'}
                    • Review notes and prepare any missing documents{'\n'}
                    • Open the portal to submit or check status
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>Save</Text>
        </Pressable>

        <Pressable onPress={handleApply} style={styles.openPortalButton}>
          <Text style={[typography.bodyStrong, { color: '#FFFFFF' }]}>Open Portal</Text>
        </Pressable>
      </View>

      {/* Apply Modal */}
      <Modal visible={applyModalVisible} transparent animationType="fade" onRequestClose={() => setApplyModalVisible(false)}>
        <Pressable style={modalStyles.overlay} onPress={() => setApplyModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '90%', maxWidth: 480 }}>
            <Pressable style={[modalStyles.container, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.header}>
                <Text style={[typography.h2, { color: colors.textPrimary }]}>Open Application Portal</Text>
                <Pressable onPress={() => setApplyModalVisible(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              </View>

              <Text style={[typography.body, { color: colors.textSecondary }]}>
                You are about to continue to the official application portal.
              </Text>

              <TextInput
                value={applyNote}
                onChangeText={setApplyNote}
                placeholder="Optional note..."
                placeholderTextColor={colors.textSecondary}
                style={dynamicStyles.notesInput}
                multiline
              />

              <View style={{ flexDirection: 'row', gap: spacing(4) }}>
                <Pressable onPress={() => setApplyModalVisible(false)} style={modalStyles.cancelButton}>
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleConfirmApply} style={modalStyles.continueButton}>
                  <Text style={[typography.bodyStrong, { color: '#fff' }]}>Continue</Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </DashboardLayout>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Static Styles
// ──────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing(5),
    backgroundColor: '#1A2339',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    gap: spacing(4),
    alignItems: 'center',
  },
  saveButton: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 80,
    alignItems: 'center',
  },
  openPortalButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: spacing(4),
    borderRadius: radii.pill,
    alignItems: 'center',
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
    width: '100%',
    borderRadius: radii.xxl,
    padding: spacing(7),
    gap: spacing(5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    flex: 1,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function ApplicationDetailsScreen() {
  return (
    <StudentMenuProvider>
      <ApplicationDetailsContent />
    </StudentMenuProvider>
  );
}