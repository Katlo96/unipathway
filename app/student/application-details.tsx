import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StudentMenuProvider, useStudentMenu } from '../../components/student/StudentMenu';

// ──────────────────────────────────────────────────────────────────────────────
// Design System ────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 34, lineHeight: 40, fontWeight: '900' as const },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
} satisfies Record<string, TextStyle>;

const radii = {
  xs: spacing(1),
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(6),
  xxl: spacing(8),
  pill: 9999,
};

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const breakpoints = {
  mobile: 0,
  tablet: 480,
  desktop: 1024,
} as const;

const MAX_CONTENT_WIDTH = 1240;

// ──────────────────────────────────────────────────────────────────────────────
// Theme & Elevation ─────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  cardHover: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  successSoft: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderStrong: string;
  overlay: string;
};

function useThemeColors() {
  const scheme = useColorScheme() ?? 'light';
  return useMemo<ThemeColors>(() => {
    const isDark = scheme === 'dark';
    return {
      background: isDark ? '#0A0F14' : '#F8FAFC',
      surface: isDark ? '#11181F' : '#FFFFFF',
      surfaceAlt: isDark ? '#17232F' : '#F1F5F9',
      card: isDark ? '#15212C' : '#FFFFFF',
      cardHover: isDark ? '#1E2A38' : '#F8FAFC',
      primary: '#4FA8C8',
      primaryStrong: isDark ? '#6BC8E8' : '#2A8BB2',
      primarySoft: isDark ? 'rgba(79,168,200,0.18)' : 'rgba(79,168,200,0.12)',
      successSoft: isDark ? 'rgba(52,211,153,0.18)' : 'rgba(52,211,153,0.10)',
      text: isDark ? '#E2E8F0' : '#0F172A',
      textSecondary: isDark ? '#94A3B8' : '#475569',
      textTertiary: isDark ? '#64748B' : '#64748B',
      border: isDark ? 'rgba(226,232,240,0.08)' : 'rgba(15,23,42,0.08)',
      borderStrong: isDark ? 'rgba(226,232,240,0.14)' : 'rgba(15,23,42,0.12)',
      overlay: 'rgba(0,0,0,0.40)',
    };
  }, [scheme]);
}

function useElevation(intensity: 'sm' | 'md' | 'lg' = 'md') {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return useMemo<ViewStyle>(() => {
    const opacity = isDark ? 0.35 : 0.12;
    const radius = intensity === 'sm' ? 6 : intensity === 'md' ? 12 : 20;
    const offsetY = intensity === 'sm' ? 2 : intensity === 'md' ? 4 : 8;

    return Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
      android: {
        elevation: intensity === 'sm' ? 3 : intensity === 'md' ? 6 : 12,
      },
      web: {
        boxShadow: `0 ${offsetY}px ${radius * 1.5}px rgba(0,0,0,${opacity})`,
      },
      default: {},
    });
  }, [intensity, isDark]);
}

// ──────────────────────────────────────────────────────────────────────────────
// Data ──────────────────────────────────────────────────────────────────────────
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
// Reusable Components ───────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

type IconName = keyof typeof Ionicons.glyphMap;

function IconButton({
  icon,
  label,
  onPress,
  size = 20,
  color,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  size?: number;
  color: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Activates ${label.toLowerCase()}`}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
          transform: pressed ? [{ scale: 0.96 }] : [],
        },
      ]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

function Card({
  children,
  style,
  intensity = 'md',
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'sm' | 'md' | 'lg';
}) {
  const elevation = useElevation(intensity);
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: IconName }) {
  const colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginBottom: spacing(4) }}>
      {icon && <Ionicons name={icon} size={20} color={colors.primary} />}
      <Text style={[typography.section, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  const colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(2) }}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>{value}</Text>
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
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing(3),
          paddingVertical: spacing(3),
          borderRadius: radii.md,
          backgroundColor: colors.surfaceAlt,
          opacity: pressed ? 0.85 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
        },
      ]}
    >
      <View
        style={[
          {
            width: 24,
            height: 24,
            borderRadius: radii.sm,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
          },
          checked
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { borderColor: colors.borderStrong },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{label}</Text>
    </Pressable>
  );
}

function StatusBadge({ status }: { status: AppStatus }) {
  const colors = useThemeColors();
  let bg = colors.primarySoft;
  let textColor = colors.primaryStrong;
  let dotColor = colors.primary;

  if (status === 'Accepted') {
    bg = colors.successSoft;
    textColor = colors.successSoft.replace('0.18', '1');
    dotColor = '#34D399';
  } else if (status === 'Rejected') {
    bg = 'rgba(239,68,68,0.18)';
    textColor = '#EF4444';
    dotColor = '#EF4444';
  } else if (status === 'Under review') {
    bg = 'rgba(249,115,22,0.18)';
    textColor = '#F97316';
    dotColor = '#F97316';
  } else if (status === 'Draft') {
    bg = 'rgba(107,114,128,0.18)';
    textColor = '#6B7280';
    dotColor = '#6B7280';
  }

  return (
    <View
      style={{
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
      }}
    >
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor }} />
      <Text style={[typography.label, { color: textColor }]}>{status}</Text>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen ───────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

function ApplicationDetailsContent() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { openMenu } = useStudentMenu();

  const id = typeof params.id === 'string' ? params.id : '1';
  const app = APPLICATION_DB[id] ?? APPLICATION_DB['1'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < breakpoints.tablet) return 'mobile';
    if (width < breakpoints.desktop) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

  const contentWidth = isDesktop ? Math.min(MAX_CONTENT_WIDTH, width - spacing(16)) : width;

  const [notes, setNotes] = useState(app.notes);
  const [checklist, setChecklist] = useState(app.checklist);
  const [applyNote, setApplyNote] = useState('');
  const [applyModalVisible, setApplyModalVisible] = useState(false);

  const completed = Object.values(checklist).filter(Boolean).length;
  const total = Object.keys(checklist).length;

  const handleToggle = useCallback((key: ChecklistKey) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSave = useCallback(() => {
    Alert.alert('Saved', 'Changes saved (placeholder)');
  }, []);

  const handleApply = useCallback(() => {
    setApplyModalVisible(true);
  }, []);

  const handleConfirmApply = useCallback(() => {
    setApplyModalVisible(false);
    Alert.alert('Application Continued', 'Opening portal (placeholder)');
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: isDesktop ? spacing(8) : spacing(5),
            paddingVertical: spacing(4),
            backgroundColor: useThemeColors().surface,
            borderBottomWidth: 1,
            borderBottomColor: useThemeColors().border,
          }}
        >
          <IconButton
            icon="arrow-back"
            label="Go back"
            onPress={() => router.back()}
            color={useThemeColors().text}
          />

          <View style={{ flex: 1, marginHorizontal: spacing(5) }}>
            <Text
              style={[
                typography.title,
                { color: useThemeColors().text, textAlign: isDesktop ? 'center' : 'left' },
              ]}
            >
              Application Details
            </Text>
            <Text
              style={[
                typography.caption,
                { color: useThemeColors().textSecondary, marginTop: spacing(1) },
              ]}
              numberOfLines={1}
            >
              {app.program} @ {app.university}
            </Text>
          </View>

          <IconButton
            icon="grid-outline"
            label="Open menu"
            onPress={openMenu}
            color={useThemeColors().text}
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: isDesktop ? spacing(8) : spacing(5),
            paddingBottom: isMobile ? spacing(20) : spacing(10),
            alignItems: 'center',
          }}
        >
          <View style={{ width: contentWidth, maxWidth: '100%' }}>
            {/* Hero Card */}
            <Card intensity="lg" style={{ marginBottom: spacing(8) }}>
              <View style={{ padding: spacing(8), gap: spacing(6) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.hero, { color: useThemeColors().text }]}>
                      {app.program}
                    </Text>
                    <Text
                      style={[
                        typography.subtitle,
                        { color: useThemeColors().textSecondary, marginTop: spacing(1) },
                      ]}
                    >
                      {app.university}
                    </Text>
                  </View>
                  <StatusBadge status={app.status} />
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(4) }}>
                  <MetaItem icon="calendar-outline" label="Submitted" value={app.date} />
                  <MetaItem icon="time-outline" label="Deadline" value={app.deadline} />
                  <MetaItem icon="checkbox-outline" label="Progress" value={`${completed}/${total} complete`} />
                </View>
              </View>
            </Card>

            {/* Adaptive Layout */}
            <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: spacing(8) }}>
              {isDesktop && (
                <View style={{ width: 360, gap: spacing(6) }}>
                  <Card>
                    <View style={{ padding: spacing(6) }}>
                      <SectionHeader title="Quick Actions" />
                      <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                        <Pressable
                          onPress={handleSave}
                          style={({ pressed }) => [
                            {
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing(3),
                              padding: spacing(4),
                              backgroundColor: useThemeColors().primary,
                              borderRadius: radii.lg,
                              opacity: pressed ? 0.9 : 1,
                              transform: pressed ? [{ scale: 0.98 }] : [],
                            },
                          ]}
                        >
                          <Ionicons name="save-outline" size={20} color="#fff" />
                          <Text style={[typography.label, { color: '#fff' }]}>Save Changes</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => Alert.alert('Shared', 'Share action (placeholder)')}
                          style={({ pressed }) => [
                            {
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing(3),
                              padding: spacing(4),
                              backgroundColor: useThemeColors().surfaceAlt,
                              borderRadius: radii.lg,
                              borderWidth: 1,
                              borderColor: useThemeColors().border,
                              opacity: pressed ? 0.9 : 1,
                              transform: pressed ? [{ scale: 0.98 }] : [],
                            },
                          ]}
                        >
                          <Ionicons name="share-outline" size={20} color={useThemeColors().primary} />
                          <Text style={[typography.label, { color: useThemeColors().primary }]}>Share</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                </View>
              )}

              <View style={{ flex: 1, gap: spacing(8) }}>
                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="Checklist" icon="checkbox-outline" />
                    <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
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
                </Card>

                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="My Notes" icon="create-outline" />
                    <TextInput
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Add notes, reminders, or documents needed..."
                      placeholderTextColor={useThemeColors().textSecondary}
                      style={{
                        minHeight: 120,
                        borderRadius: radii.lg,
                        borderWidth: 1,
                        borderColor: useThemeColors().border,
                        padding: spacing(4),
                        backgroundColor: useThemeColors().surfaceAlt,
                        color: useThemeColors().text,
                        textAlignVertical: 'top',
                        marginTop: spacing(3),
                      }}
                      multiline
                    />
                  </View>
                </Card>

                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="Next Steps" icon="information-circle-outline" />
                    <Text
                      style={[
                        typography.body,
                        { color: useThemeColors().textSecondary, marginTop: spacing(3) },
                      ]}
                    >
                      • Ensure all checklist items are complete before deadline  
                      • Review notes and prepare any missing documents  
                      • Open portal to submit or check status
                    </Text>
                  </View>
                </Card>
              </View>
            </View>
          </View>
        </ScrollView>

        {isMobile && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              padding: spacing(5),
              backgroundColor: useThemeColors().surface,
              borderTopWidth: 1,
              borderTopColor: useThemeColors().border,
              gap: spacing(4),
            }}
          >
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                {
                  flex: 1,
                  height: 52,
                  borderRadius: radii.lg,
                  backgroundColor: useThemeColors().surfaceAlt,
                  borderWidth: 1,
                  borderColor: useThemeColors().border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[typography.label, { color: useThemeColors().text }]}>Save</Text>
            </Pressable>

            <Pressable
              onPress={handleApply}
              style={({ pressed }) => [
                {
                  flex: 2,
                  height: 52,
                  borderRadius: radii.lg,
                  backgroundColor: useThemeColors().primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[typography.label, { color: '#fff' }]}>Open Portal</Text>
            </Pressable>
          </View>
        )}

        {/* Apply Modal */}
        <Modal
          visible={applyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setApplyModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: useThemeColors().overlay,
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing(6),
            }}
            onPress={() => setApplyModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ width: '100%', maxWidth: 500 }}
            >
              <Pressable
                style={{
                  backgroundColor: useThemeColors().surface,
                  borderRadius: radii.xl,
                  padding: spacing(6),
                  gap: spacing(5),
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[typography.section, { color: useThemeColors().text }]}>
                    Open Application Portal
                  </Text>
                  <IconButton
                    icon="close"
                    label="Close modal"
                    onPress={() => setApplyModalVisible(false)}
                    color={useThemeColors().textSecondary}
                  />
                </View>

                <Text style={[typography.body, { color: useThemeColors().textSecondary }]}>
                  You are about to continue to the application portal.
                </Text>

                <TextInput
                  value={applyNote}
                  onChangeText={setApplyNote}
                  placeholder="Optional note (e.g., documents to prepare)"
                  placeholderTextColor={useThemeColors().textSecondary}
                  style={{
                    minHeight: 100,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: useThemeColors().border,
                    padding: spacing(4),
                    backgroundColor: useThemeColors().surfaceAlt,
                    color: useThemeColors().text,
                    textAlignVertical: 'top',
                  }}
                  multiline
                />

                <View style={{ flexDirection: 'row', gap: spacing(4) }}>
                  <Pressable
                    onPress={() => setApplyModalVisible(false)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 52,
                        borderRadius: radii.lg,
                        backgroundColor: useThemeColors().surfaceAlt,
                        borderWidth: 1,
                        borderColor: useThemeColors().border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[typography.label, { color: useThemeColors().text }]}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleConfirmApply}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 52,
                        borderRadius: radii.lg,
                        backgroundColor: useThemeColors().primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <Text style={[typography.label, { color: '#fff' }]}>Continue</Text>
                  </Pressable>
                </View>
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

export default function ApplicationDetailsScreen() {
  return (
    <StudentMenuProvider>
      <ApplicationDetailsContent />
    </StudentMenuProvider>
  );
}