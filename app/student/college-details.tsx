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
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '900' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
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
type CollegeCourse = { id: string; title: string; points: number };

type CollegeDetails = {
  id: string;
  name: string;
  location: string;
  website: string;
  badge: string;
  about: string;
  popularCourses: CollegeCourse[];
  scholarships: string[];
};

const COLLEGE_DB: Record<string, CollegeDetails> = {
  bac: {
    id: 'bac',
    name: 'Botswana Accountancy College',
    location: 'Gaborone, Botswana',
    website: 'www.bac.ac.bw',
    badge: 'BAC',
    about:
      'Botswana Accountancy College offers high-quality business, accounting, and management education with strong industry links and career-focused programs.',
    popularCourses: [
      { id: 'acct-bac', title: 'Bachelor of Accounting', points: 34 },
      { id: 'bcom-bac', title: 'BCom Business Management', points: 32 },
      { id: 'finance-bac', title: 'Diploma in Finance', points: 28 },
    ],
    scholarships: ['Government Sponsorship', 'BAC Merit Award'],
  },
  guc: {
    id: 'guc',
    name: 'Gaborone Universal College',
    location: 'Gaborone, Botswana',
    website: 'www.guc.ac.bw',
    badge: 'GUC',
    about:
      'Gaborone Universal College provides accessible, flexible, and practical tertiary education across multiple disciplines.',
    popularCourses: [
      { id: 'it-guc', title: 'Diploma in Information Technology', points: 30 },
      { id: 'badmin-guc', title: 'Bachelor of Business Administration', points: 33 },
    ],
    scholarships: ['GUC Access Scholarship', 'Government Bursary'],
  },
  abm: {
    id: 'abm',
    name: 'ABM University College',
    location: 'Gaborone, Botswana',
    website: 'www.abm.ac.bw',
    badge: 'ABM',
    about:
      'ABM University College specializes in professional, vocational, and continuing education programs tailored to the Botswana job market.',
    popularCourses: [
      { id: 'hrm-abm', title: 'Diploma in Human Resource Management', points: 29 },
      { id: 'marketing-abm', title: 'Certificate in Marketing', points: 26 },
    ],
    scholarships: ['Institutional Bursary', 'Government Sponsorship'],
  },
  // Add more colleges as needed
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

function CourseRow({
  course,
  onPress,
}: {
  course: { id: string; title: string; points: number };
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${course.title}`}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing(4),
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: spacing(2),
          opacity: pressed ? 0.85 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>{course.title}</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
          Required points: {course.points}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen ───────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
function CollegeDetailsContent() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const { openMenu } = useStudentMenu();

  // Dynamic id from route: /student/college-details?id=bac or /student/college-details/bac
  const collegeId = typeof params.id === 'string' ? params.id : 'bac';
  const college = COLLEGE_DB[collegeId] ?? COLLEGE_DB['bac'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < breakpoints.tablet) return 'mobile';
    if (width < breakpoints.desktop) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

  const contentWidth = isDesktop ? Math.min(MAX_CONTENT_WIDTH, width - spacing(16)) : width;

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleVisitWebsite = useCallback(() => {
    Alert.alert('Visit Website', `Would open: ${college.website}`);
  }, [college.website]);

  const handleViewAllCourses = useCallback(() => {
    router.push('/student/courses');
  }, []);

  const handleOpenCourse = useCallback((courseId: string) => {
    router.push({ pathname: '/student/course-details', params: { id: courseId } });
  }, []);

  const handleSaveNote = useCallback(() => {
    Alert.alert('Note Saved', 'Your note has been saved (placeholder)');
    setNoteModalVisible(false);
  }, []);

  const colors = useThemeColors();

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
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <IconButton
            icon="arrow-back"
            label="Go back"
            onPress={() => router.back()}
            color={colors.text}
          />
          <View style={{ flex: 1, marginHorizontal: spacing(5) }}>
            <Text
              style={[
                typography.title,
                { color: colors.text, textAlign: isDesktop ? 'center' : 'left' },
              ]}
            >
              College Details
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: spacing(1) },
              ]}
              numberOfLines={1}
            >
              {college.name}
            </Text>
          </View>
          <IconButton
            icon="grid-outline"
            label="Open menu"
            onPress={openMenu}
            color={colors.text}
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
            {/* Hero / College Overview Card */}
            <Card intensity="lg" style={{ marginBottom: spacing(8) }}>
              <View style={{ padding: spacing(8), gap: spacing(6) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(4) }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: radii.lg,
                      backgroundColor: colors.primarySoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={[
                        typography.hero,
                        { color: colors.primaryStrong, fontSize: 32 },
                      ]}
                    >
                      {college.badge}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.hero, { color: colors.text }]}>
                      {college.name}
                    </Text>
                    <Text
                      style={[
                        typography.subtitle,
                        { color: colors.textSecondary, marginTop: spacing(1) },
                      ]}
                    >
                      {college.location}
                    </Text>
                  </View>
                </View>

                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  {college.about}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(4) }}>
                  <MetaItem icon="location-outline" label="Location" value={college.location} />
                  <MetaItem icon="globe-outline" label="Website" value={college.website} />
                </View>
              </View>
            </Card>

            {/* Adaptive Layout: Desktop sidebar + main / Mobile stacked */}
            <View
              style={{
                flexDirection: isDesktop ? 'row' : 'column',
                gap: spacing(8),
              }}
            >
              {/* Sidebar (desktop only) */}
              {isDesktop && (
                <View style={{ width: 360, gap: spacing(6) }}>
                  <Card>
                    <View style={{ padding: spacing(6) }}>
                      <SectionHeader title="Quick Actions" />
                      <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                        <Pressable
                          onPress={handleVisitWebsite}
                          style={({ pressed }) => [
                            {
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing(3),
                              padding: spacing(4),
                              backgroundColor: colors.primary,
                              borderRadius: radii.lg,
                              opacity: pressed ? 0.9 : 1,
                              transform: pressed ? [{ scale: 0.98 }] : [],
                            },
                          ]}
                        >
                          <Ionicons name="open-outline" size={20} color="#fff" />
                          <Text style={[typography.label, { color: '#fff' }]}>Visit Website</Text>
                        </Pressable>

                        <Pressable
                          onPress={handleViewAllCourses}
                          style={({ pressed }) => [
                            {
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing(3),
                              padding: spacing(4),
                              backgroundColor: colors.surfaceAlt,
                              borderRadius: radii.lg,
                              borderWidth: 1,
                              borderColor: colors.border,
                              opacity: pressed ? 0.9 : 1,
                              transform: pressed ? [{ scale: 0.98 }] : [],
                            },
                          ]}
                        >
                          <Ionicons name="school-outline" size={20} color={colors.primary} />
                          <Text style={[typography.label, { color: colors.primary }]}>
                            View All Courses
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>

                  <Card>
                    <View style={{ padding: spacing(6) }}>
                      <SectionHeader title="Scholarships" icon="ribbon-outline" />
                      <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                        {college.scholarships.map((s, i) => (
                          <Text key={i} style={[typography.body, { color: colors.textSecondary }]}>
                            • {s}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </Card>
                </View>
              )}

              {/* Main Content */}
              <View style={{ flex: 1, gap: spacing(8) }}>
                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="Popular Courses" icon="flame-outline" />
                    <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                      {college.popularCourses.map((course) => (
                        <CourseRow
                          key={course.id}
                          course={course}
                          onPress={() => handleOpenCourse(course.id)}
                        />
                      ))}
                    </View>
                  </View>
                </Card>

                {!isMobile && (
                  <Card>
                    <View style={{ padding: spacing(8) }}>
                      <SectionHeader title="Quick Note" icon="create-outline" />
                      <Text
                        style={[
                          typography.body,
                          { color: colors.textSecondary, marginTop: spacing(3) },
                        ]}
                      >
                        Add a short note to remember important details about this college.
                      </Text>
                      <Pressable
                        onPress={() => setNoteModalVisible(true)}
                        style={({ pressed }) => [
                          {
                            marginTop: spacing(4),
                            padding: spacing(4),
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: radii.lg,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: 'center',
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <Text style={[typography.label, { color: colors.primary }]}>
                          Add Note
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Mobile Sticky Bar */}
        {isMobile && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: 'row',
              padding: spacing(5),
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              gap: spacing(4),
            }}
          >
            <Pressable
              onPress={handleVisitWebsite}
              style={({ pressed }) => [
                {
                  flex: 1,
                  height: 52,
                  borderRadius: radii.lg,
                  backgroundColor: colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[typography.label, { color: colors.text }]}>Website</Text>
            </Pressable>

            <Pressable
              onPress={handleViewAllCourses}
              style={({ pressed }) => [
                {
                  flex: 2,
                  height: 52,
                  borderRadius: radii.lg,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={[typography.label, { color: '#fff' }]}>View Courses</Text>
            </Pressable>
          </View>
        )}

        {/* Note Modal */}
        <Modal
          visible={noteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNoteModalVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: colors.overlay,
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing(6),
            }}
            onPress={() => setNoteModalVisible(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ width: '100%', maxWidth: 500 }}
            >
              <Pressable
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.xl,
                  padding: spacing(6),
                  gap: spacing(5),
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[typography.section, { color: colors.text }]}>
                    Add Quick Note
                  </Text>
                  <IconButton
                    icon="close"
                    label="Close note modal"
                    onPress={() => setNoteModalVisible(false)}
                    color={colors.textSecondary}
                  />
                </View>

                <TextInput
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="e.g. Check scholarship deadlines and compare with my points..."
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    minHeight: 120,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing(4),
                    backgroundColor: colors.surfaceAlt,
                    color: colors.text,
                    textAlignVertical: 'top',
                  }}
                  multiline
                />

                <View style={{ flexDirection: 'row', gap: spacing(4) }}>
                  <Pressable
                    onPress={() => setNoteModalVisible(false)}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 52,
                        borderRadius: radii.lg,
                        backgroundColor: colors.surfaceAlt,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Text style={[typography.label, { color: colors.text }]}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={handleSaveNote}
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        height: 52,
                        borderRadius: radii.lg,
                        backgroundColor: colors.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <Text style={[typography.label, { color: '#fff' }]}>Save Note</Text>
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

// ──────────────────────────────────────────────────────────────────────────────
// Exported Screen (with Provider wrapper) ──────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
export default function CollegeDetailsScreen() {
  return (
    <StudentMenuProvider>
      <CollegeDetailsContent />
    </StudentMenuProvider>
  );
}