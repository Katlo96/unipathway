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

type ScholarshipDetails = {
  id: string;
  title: string;
  providerName: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  howToApply: string[];
};

const DETAILS_DB: Record<string, ScholarshipDetails> = {
  "abc-excellence": {
    id: "abc-excellence",
    title: "ABC Academic Excellence Scholarship",
    providerName: "ABC Foundation",
    amount: "P5,000 (Tuition Support)",
    deadline: "May 10, 2026",
    eligibility: [
      "Currently enrolled in an undergraduate program",
      "Academic standing: Minimum 3.0 GPA",
      "Demonstrated financial need",
      "Strong leadership and extracurricular involvement",
    ],
    howToApply: [
      "Complete the online application form",
      "Submit a copy of your academic transcript",
      "Provide a personal statement outlining your study plans and goals",
      "Submit a letter of recommendation from a professor or advisor",
    ],
  },
  "community-service": {
    id: "community-service",
    title: "Community Service Award",
    providerName: "City Education Trust",
    amount: "P5,000 (Tuition Support)",
    deadline: "April 28, 2026",
    eligibility: [
      "Currently enrolled in an undergraduate program",
      "Academic standing: Minimum 3.0 GPA",
      "Plan to study abroad for at least one semester",
      "Demonstrated financial need",
      "Strong leadership and extracurricular involvement",
    ],
    howToApply: [
      "Complete the online application form",
      "Submit a copy of your academic transcript",
      "Provide a personal statement outlining your study plans and goals",
      "Submit a letter of recommendation from a professor or advisor",
    ],
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

function BulletList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <View style={{ gap: spacing(3), marginTop: spacing(3) }}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: spacing(3) }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.primary,
              marginTop: 9,
            }}
          />
          <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function NumberedList({ items }: { items: string[] }) {
  const colors = useThemeColors();
  return (
    <View style={{ gap: spacing(4), marginTop: spacing(3) }}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: spacing(3) }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: radii.pill,
              backgroundColor: colors.primarySoft,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[typography.label, { color: colors.primaryStrong }]}>
              {index + 1}
            </Text>
          </View>
          <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen ───────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

function ScholarshipDetailsContent() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const { openMenu } = useStudentMenu();

  const scholarshipId = typeof params.id === 'string' ? params.id : 'abc-excellence';
  const data = DETAILS_DB[scholarshipId] ?? DETAILS_DB['abc-excellence'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < breakpoints.tablet) return 'mobile';
    if (width < breakpoints.desktop) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

  const contentWidth = isDesktop ? Math.min(MAX_CONTENT_WIDTH, width - spacing(16)) : width;

  const [saved, setSaved] = useState(false);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [applyNote, setApplyNote] = useState('');

  const handleApply = useCallback(() => {
    setApplyModalVisible(true);
  }, []);

  const handleConfirmApply = useCallback(() => {
    setApplyModalVisible(false);
    Alert.alert('Application Started', 'Redirecting to application portal (placeholder)');
    setApplyNote('');
  }, []);

  const handleToggleSave = useCallback(() => {
    setSaved((prev) => !prev);
    Alert.alert(saved ? 'Removed' : 'Saved', 'Scholarship updated (placeholder)');
  }, [saved]);

  const deadlineUrgent = useMemo(() => {
    return /April|May/i.test(data.deadline);
  }, [data.deadline]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header Bar */}
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
              Scholarship Details
            </Text>
            <Text
              style={[
                typography.caption,
                { color: useThemeColors().textSecondary, marginTop: spacing(1) },
              ]}
              numberOfLines={1}
            >
              {data.title}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(4) }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: radii.lg,
                      backgroundColor: useThemeColors().primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: useThemeColors().border,
                    }}
                  >
                    <Ionicons name="ribbon-outline" size={36} color={useThemeColors().primaryStrong} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[typography.hero, { color: useThemeColors().text }]}>
                      {data.title}
                    </Text>
                    <Text
                      style={[
                        typography.subtitle,
                        { color: useThemeColors().textSecondary, marginTop: spacing(1) },
                      ]}
                    >
                      {data.providerName}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(4) }}>
                  <MetaItem icon="cash-outline" label="Amount" value={data.amount} />
                  <MetaItem icon="calendar-outline" label="Deadline" value={data.deadline} />
                </View>

                {deadlineUrgent && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing(2),
                      padding: spacing(3),
                      backgroundColor: useThemeColors().primarySoft,
                      borderRadius: radii.lg,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Ionicons name="alert-circle-outline" size={18} color={useThemeColors().primaryStrong} />
                    <Text style={[typography.label, { color: useThemeColors().primaryStrong }]}>
                      Upcoming Deadline
                    </Text>
                  </View>
                )}
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
                          onPress={handleApply}
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
                          <Ionicons name="rocket-outline" size={20} color="#fff" />
                          <Text style={[typography.label, { color: '#fff' }]}>Apply Now</Text>
                        </Pressable>

                        <Pressable
                          onPress={handleToggleSave}
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
                          <Ionicons
                            name={saved ? 'bookmark' : 'bookmark-outline'}
                            size={20}
                            color={useThemeColors().primary}
                          />
                          <Text style={[typography.label, { color: useThemeColors().primary }]}>
                            {saved ? 'Saved' : 'Save'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                </View>
              )}

              <View style={{ flex: 1, gap: spacing(8) }}>
                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="Eligibility Requirements" icon="checkmark-circle-outline" />
                    <BulletList items={data.eligibility} />
                  </View>
                </Card>

                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="How to Apply" icon="list-outline" />
                    <NumberedList items={data.howToApply} />
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
                      Prepare your documents early, verify all eligibility criteria, and submit before the deadline.
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
              onPress={handleToggleSave}
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
              <Text style={[typography.label, { color: useThemeColors().text }]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
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
              <Text style={[typography.label, { color: '#fff' }]}>Apply Now</Text>
            </Pressable>
          </View>
        )}

        {/* Apply Confirmation Modal */}
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
                    Apply to Scholarship
                  </Text>
                  <IconButton
                    icon="close"
                    label="Close apply modal"
                    onPress={() => setApplyModalVisible(false)}
                    color={useThemeColors().textSecondary}
                  />
                </View>

                <Text
                  style={[
                    typography.body,
                    { color: useThemeColors().textSecondary, marginBottom: spacing(3) },
                  ]}
                >
                  You are about to proceed to the application portal.
                </Text>

                <TextInput
                  value={applyNote}
                  onChangeText={setApplyNote}
                  placeholder="Optional note (e.g., documents needed)"
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

export default function ScholarshipDetailsScreen() {
  return (
    <StudentMenuProvider>
      <ScholarshipDetailsContent />
    </StudentMenuProvider>
  );
}