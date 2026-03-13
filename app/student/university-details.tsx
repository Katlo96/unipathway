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

type UniCourse = { id: string; title: string; points: number };

type UniversityDetails = {
  id: string;
  name: string;
  location: string;
  website: string;
  badge: string;
  about: string;
  popularCourses: UniCourse[];
  scholarships: string[];
};

const UNIVERSITY_DB: Record<string, UniversityDetails> = {
  ub: {
    id: 'ub',
    name: 'University of Botswana',
    location: 'Gaborone, Botswana',
    website: 'www.ub.bw',
    badge: 'UB',
    about:
      'The University of Botswana is the premier institution of higher education in Botswana, known for leading in engineering, business, and social sciences.',
    popularCourses: [
      { id: 'cs-ub', title: 'BSc Computer Science', points: 36 },
      { id: 'acct-botho', title: 'Bachelor of Accounting', points: 34 },
      { id: 'design-luct', title: 'BA Journalism', points: 31 },
    ],
    scholarships: ['Government Sponsorship', 'UB Academic Merit Scholarship'],
  },
  botho: {
    id: 'botho',
    name: 'Botho University',
    location: 'Gaborone, Botswana',
    website: 'www.bothouniversity.com',
    badge: 'BU',
    about:
      'Botho University delivers industry-relevant programs with a strong focus on innovation and employability.',
    popularCourses: [
      { id: 'acct-botho', title: 'Bachelor of Accounting', points: 34 },
      { id: 'cs-ub', title: 'BSc Computer Science', points: 36 },
    ],
    scholarships: ['Institutional Bursary (varies)', 'Merit-based scholarships'],
  },
  biust: {
    id: 'biust',
    name: 'BIUST',
    location: 'Palapye, Botswana',
    website: 'www.biust.ac.bw',
    badge: 'BIUST',
    about:
      'BIUST focuses on science and technology, with advanced programs in engineering and research-driven innovation.',
    popularCourses: [{ id: 'eng-biust', title: 'Mechanical Engineering', points: 38 }],
    scholarships: ['Government Sponsorship'],
  },
  limkokwing: {
    id: 'limkokwing',
    name: 'Limkokwing University',
    location: 'Gaborone, Botswana',
    website: 'www.limkokwing.net',
    badge: 'LUCT',
    about:
      'Limkokwing is known for creative and media programs, combining innovation and practical skills development.',
    popularCourses: [{ id: 'design-luct', title: 'Digital Media & Design', points: 30 }],
    scholarships: ['Institutional scholarships (limited)'],
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

function UniversityDetailsContent() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const { openMenu } = useStudentMenu();

  // Dynamic id from route: /student/university-details? id=ub or /student/university-details/ub
  const uniId = typeof params.id === 'string' ? params.id : 'ub';
  const uni = UNIVERSITY_DB[uniId] ?? UNIVERSITY_DB['ub'];

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
    Alert.alert('Visit Website', `Would open: ${uni.website}`);
  }, [uni.website]);

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
              University Details
            </Text>
            <Text
              style={[
                typography.caption,
                { color: useThemeColors().textSecondary, marginTop: spacing(1) },
              ]}
              numberOfLines={1}
            >
              {uni.name}
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
            {/* Hero / University Overview Card */}
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
                    <Text
                      style={[
                        typography.hero,
                        { color: useThemeColors().primaryStrong, fontSize: 32 },
                      ]}
                    >
                      {uni.badge}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[typography.hero, { color: useThemeColors().text }]}>
                      {uni.name}
                    </Text>
                    <Text
                      style={[
                        typography.subtitle,
                        { color: useThemeColors().textSecondary, marginTop: spacing(1) },
                      ]}
                    >
                      {uni.location}
                    </Text>
                  </View>
                </View>

                <Text style={[typography.body, { color: useThemeColors().textSecondary }]}>
                  {uni.about}
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(4) }}>
                  <MetaItem icon="location-outline" label="Location" value={uni.location} />
                  <MetaItem icon="globe-outline" label="Website" value={uni.website} />
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
                              backgroundColor: useThemeColors().primary,
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
                              backgroundColor: useThemeColors().surfaceAlt,
                              borderRadius: radii.lg,
                              borderWidth: 1,
                              borderColor: useThemeColors().border,
                              opacity: pressed ? 0.9 : 1,
                              transform: pressed ? [{ scale: 0.98 }] : [],
                            },
                          ]}
                        >
                          <Ionicons name="school-outline" size={20} color={useThemeColors().primary} />
                          <Text style={[typography.label, { color: useThemeColors().primary }]}>
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
                        {uni.scholarships.map((s, i) => (
                          <Text key={i} style={[typography.body, { color: useThemeColors().textSecondary }]}>
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
                      {uni.popularCourses.map((course) => (
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
                          { color: useThemeColors().textSecondary, marginTop: spacing(3) },
                        ]}
                      >
                        Add a short note to remember important details about this university.
                      </Text>
                      <Pressable
                        onPress={() => setNoteModalVisible(true)}
                        style={({ pressed }) => [
                          {
                            marginTop: spacing(4),
                            padding: spacing(4),
                            backgroundColor: useThemeColors().surfaceAlt,
                            borderRadius: radii.lg,
                            borderWidth: 1,
                            borderColor: useThemeColors().border,
                            alignItems: 'center',
                            opacity: pressed ? 0.9 : 1,
                          },
                        ]}
                      >
                        <Text style={[typography.label, { color: useThemeColors().primary }]}>
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
              backgroundColor: useThemeColors().surface,
              borderTopWidth: 1,
              borderTopColor: useThemeColors().border,
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
                  backgroundColor: useThemeColors().surfaceAlt,
                  borderWidth: 1,
                  borderColor: useThemeColors().border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={[typography.label, { color: useThemeColors().text }]}>Website</Text>
            </Pressable>

            <Pressable
              onPress={handleViewAllCourses}
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
              backgroundColor: useThemeColors().overlay,
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
                  backgroundColor: useThemeColors().surface,
                  borderRadius: radii.xl,
                  padding: spacing(6),
                  gap: spacing(5),
                }}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[typography.section, { color: useThemeColors().text }]}>
                    Add Quick Note
                  </Text>
                  <IconButton
                    icon="close"
                    label="Close note modal"
                    onPress={() => setNoteModalVisible(false)}
                    color={useThemeColors().textSecondary}
                  />
                </View>

                <TextInput
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="e.g. Check scholarship deadlines and compare with my points..."
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
                    onPress={handleSaveNote}
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

export default function UniversityDetailsScreen() {
  return (
    <StudentMenuProvider>
      <UniversityDetailsContent />
    </StudentMenuProvider>
  );
}