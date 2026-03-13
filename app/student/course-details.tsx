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
  LayoutAnimation,
  Modal,
  useColorScheme,
  type PressableStateCallbackType,
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
const spacing = (multiplier: number) => multiplier * BASE_SPACING;

const typography = {
  hero: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900' as const,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800' as const,
  },
  section: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800' as const,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700' as const,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },
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
// Theme ─────────────────────────────────────────────────────────────────────────
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
  shadow: string;
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
      shadow: isDark ? '#000000' : '#000000',
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
// Types & Data ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

type CourseDetails = {
  id: string;
  title: string;
  universityName: string;
  requiredPoints: string;
  duration: string;
  mode: string;
  tuition: string;
  sponsorshipFriendly: string;
  about: string;
  entry: string[];
  careers: string[];
  uniBadge: string;
  location: string;
  faculty: string;
};

const COURSE_DB: Record<string, CourseDetails> = {
  'cs-ub': {
    id: 'cs-ub',
    title: 'Bachelor of Science in Computer Science',
    universityName: 'University of Botswana',
    requiredPoints: '36–40',
    duration: '4 years',
    mode: 'Full-time',
    tuition: 'BWP 30,000',
    sponsorshipFriendly: 'Yes',
    about:
      'This program builds a strong foundation in computer science through programming, algorithms, data structures, databases, software engineering, networking, and emerging digital technologies. Students benefit from practical coursework, problem-solving, collaborative projects, and a pathway into both industry and postgraduate study.',
    entry: [
      'Minimum overall points within the institution’s accepted range',
      'Strong performance in Mathematics is typically expected',
      'English language requirements must be satisfied',
      'Additional faculty-specific requirements may apply',
    ],
    careers: [
      'Software Developer',
      'Systems Analyst',
      'Data Analyst',
      'QA Engineer',
      'IT Support Specialist',
      'Technical Product Associate',
    ],
    uniBadge: 'UB',
    location: 'Gaborone',
    faculty: 'Faculty of Science',
  },
  'acct-botho': {
    id: 'acct-botho',
    title: 'Bachelor of Accounting',
    universityName: 'Botho University',
    requiredPoints: '34–38',
    duration: '4 years',
    mode: 'Full-time',
    tuition: 'BWP 28,000',
    sponsorshipFriendly: 'Yes',
    about:
      'A professionally aligned accounting degree focused on financial reporting, auditing foundations, taxation, management accounting, and business decision-making. The programme is designed to prepare students for structured finance careers and further professional development.',
    entry: [
      'Minimum institution-approved points range',
      'Basic Mathematics competence is recommended',
      'English language requirements must be met',
      'Applicants may need to satisfy programme-specific admission criteria',
    ],
    careers: [
      'Accountant',
      'Auditor',
      'Finance Officer',
      'Tax Associate',
      'Management Trainee',
      'Payroll and Reporting Officer',
    ],
    uniBadge: 'BU',
    location: 'Gaborone',
    faculty: 'Faculty of Business',
  },
  'eng-biust': {
    id: 'eng-biust',
    title: 'Bachelor of Engineering in Mechanical Engineering',
    universityName: 'BIUST',
    requiredPoints: '38–44',
    duration: '4 years',
    mode: 'Full-time',
    tuition: 'BWP 32,000',
    sponsorshipFriendly: 'No',
    about:
      'This engineering pathway develops analytical and technical capability across mechanics, thermodynamics, materials, design, manufacturing, and laboratory-based practice. It is ideal for learners who enjoy structured technical thinking and applied problem-solving.',
    entry: [
      'Competitive point range aligned to engineering admissions',
      'Strong Mathematics background is essential',
      'Physics proficiency is usually required',
      'Applicants must meet university and faculty requirements',
    ],
    careers: [
      'Mechanical Engineer',
      'Maintenance Engineer',
      'Production Engineer',
      'Design Engineer',
      'Project Engineer',
      'Technical Operations Specialist',
    ],
    uniBadge: 'BIUST',
    location: 'Palapye',
    faculty: 'Faculty of Engineering and Technology',
  },
  'design-luct': {
    id: 'design-luct',
    title: 'Bachelor in Digital Media & Design',
    universityName: 'Limkokwing University',
    requiredPoints: '30–36',
    duration: '3 years',
    mode: 'Full-time',
    tuition: 'BWP 26,000',
    sponsorshipFriendly: 'Yes',
    about:
      'A creative technology programme combining digital storytelling, visual communication, branding, interface thinking, content production, and design execution. Students build practical portfolios for modern creative and digital product environments.',
    entry: [
      'Minimum accepted admission points for the programme',
      'English language requirements must be satisfied',
      'Creative interest or portfolio readiness may be beneficial',
      'Institutional admission rules still apply',
    ],
    careers: [
      'UI/UX Designer',
      'Graphic Designer',
      'Digital Content Creator',
      'Brand Designer',
      'Creative Producer',
      'Multimedia Specialist',
    ],
    uniBadge: 'LUCT',
    location: 'Gaborone',
    faculty: 'Faculty of Creativity and Innovation',
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Reusable UI Pieces ────────────────────────────────────────────────────────────
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

function SectionHeader({ title }: { title: string }) {
  const colors = useThemeColors();
  return (
    <Text
      style={[
        typography.section,
        { color: colors.text, marginBottom: spacing(4) },
      ]}
    >
      {title}
    </Text>
  );
}

function FactItem({
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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(3),
        paddingVertical: spacing(2),
      }}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[typography.bodyStrong, { color: colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Screen ───────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────

export default function CourseDetailsScreen() {
  return (
    <StudentMenuProvider>
      <CourseDetailsContent />
    </StudentMenuProvider>
  );
}

function CourseDetailsContent() {
  const { width, height } = useWindowDimensions();
  const colors = useThemeColors();
  const { openMenu } = useStudentMenu();
  const params = useLocalSearchParams<{ id?: string }>();

  const courseId = typeof params.id === 'string' ? params.id : 'cs-ub';
  const course = COURSE_DB[courseId] ?? COURSE_DB['cs-ub'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < breakpoints.tablet) return 'mobile';
    if (width < breakpoints.desktop) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  const contentWidth = isDesktop
    ? Math.min(MAX_CONTENT_WIDTH, width - spacing(16))
    : width;

  const [saved, setSaved] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const handleSaveToggle = useCallback(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSaved((prev) => !prev);
  }, []);

  const handleApply = useCallback(() => {
    Alert.alert('Apply Now', `Starting application for ${course.title}`);
  }, [course.title]);

  const sponsorshipPositive = course.sponsorshipFriendly.toLowerCase().startsWith('y');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Top Bar / Header */}
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
            icon="menu-outline"
            label="Open menu"
            onPress={openMenu}
            color={colors.text}
          />

          <View style={{ flex: 1, marginHorizontal: spacing(4) }}>
            <Text
              style={[
                typography.title,
                { color: colors.text, textAlign: isDesktop ? 'center' : 'left' },
              ]}
            >
              Course Details
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: spacing(1) },
              ]}
              numberOfLines={1}
            >
              {course.title}
            </Text>
          </View>

          <IconButton
            icon="share-social-outline"
            label="Share this course"
            onPress={() => setShareVisible(true)}
            color={colors.text}
          />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: isDesktop ? spacing(8) : spacing(5),
            paddingBottom: isMobile ? spacing(20) : spacing(10),
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={isDesktop}
        >
          <View style={{ width: contentWidth, maxWidth: '100%' }}>
            {/* Hero Card */}
            <Card intensity="lg" style={{ marginBottom: spacing(8) }}>
              <View
                style={{
                  padding: isMobile ? spacing(6) : spacing(8),
                  gap: spacing(6),
                }}
              >
                <View
                  style={{
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    gap: spacing(4),
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing(3),
                        marginBottom: spacing(3),
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: colors.primarySoft,
                          paddingHorizontal: spacing(3),
                          paddingVertical: spacing(1.5),
                          borderRadius: radii.pill,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text
                          style={[
                            typography.label,
                            { color: colors.primaryStrong },
                          ]}
                        >
                          {course.uniBadge}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing(2),
                          backgroundColor: sponsorshipPositive
                            ? colors.successSoft
                            : colors.primarySoft,
                          paddingHorizontal: spacing(3),
                          paddingVertical: spacing(1.5),
                          borderRadius: radii.pill,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Ionicons
                          name="ribbon-outline"
                          size={16}
                          color={colors.text}
                        />
                        <Text style={[typography.caption, { color: colors.text }]}>
                          Sponsorship: {course.sponsorshipFriendly}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        typography.hero,
                        { color: colors.text, marginBottom: spacing(2) },
                      ]}
                    >
                      {course.title}
                    </Text>

                    <Text
                      style={[
                        typography.bodyStrong,
                        { color: colors.textSecondary, marginBottom: spacing(1) },
                      ]}
                    >
                      {course.universityName}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing(4),
                        flexWrap: 'wrap',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
                        <Ionicons name="location-outline" size={16} color={colors.textTertiary} />
                        <Text style={[typography.caption, { color: colors.textTertiary }]}>
                          {course.location}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
                        <Ionicons name="layers-outline" size={16} color={colors.textTertiary} />
                        <Text style={[typography.caption, { color: colors.textTertiary }]}>
                          {course.faculty}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!isMobile && (
                    <View style={{ flexDirection: 'row', gap: spacing(3) }}>
                      <Pressable
                        onPress={handleApply}
                        style={({ pressed }) => [
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing(2),
                            paddingHorizontal: spacing(6),
                            paddingVertical: spacing(4),
                            backgroundColor: colors.primary,
                            borderRadius: radii.lg,
                            minWidth: 160,
                            opacity: pressed ? 0.9 : 1,
                            transform: pressed ? [{ scale: 0.98 }] : [],
                          },
                        ]}
                      >
                        <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                        <Text
                          style={[
                            typography.label,
                            { color: '#fff', fontWeight: '700' },
                          ]}
                        >
                          Apply Now
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={handleSaveToggle}
                        style={({ pressed }) => [
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing(2),
                            paddingHorizontal: spacing(5),
                            paddingVertical: spacing(4),
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: radii.lg,
                            borderWidth: 1,
                            borderColor: colors.border,
                            opacity: pressed ? 0.9 : 1,
                            transform: pressed ? [{ scale: 0.98 }] : [],
                          },
                        ]}
                      >
                        <Ionicons
                          name={saved ? 'bookmark' : 'bookmark-outline'}
                          size={18}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            typography.label,
                            { color: colors.primary, fontWeight: '700' },
                          ]}
                        >
                          {saved ? 'Saved' : 'Save'}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                {/* Key Facts Grid */}
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: spacing(4),
                    marginTop: spacing(4),
                  }}
                >
                  <FactItem icon="analytics-outline" label="Points" value={course.requiredPoints} />
                  <FactItem icon="time-outline" label="Duration" value={course.duration} />
                  <FactItem icon="calendar-outline" label="Mode" value={course.mode} />
                  <FactItem icon="cash-outline" label="Tuition" value={course.tuition} />
                </View>
              </View>
            </Card>

            {/* Main Content - Adaptive Columns */}
            <View
              style={{
                flexDirection: isDesktop ? 'row' : 'column',
                gap: spacing(8),
              }}
            >
              {/* Left / Main Column */}
              <View style={{ flex: isDesktop ? 3 : 1, gap: spacing(8) }}>
                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="About this course" />
                    <Text style={[typography.body, { color: colors.textSecondary }]}>
                      {course.about}
                    </Text>
                  </View>
                </Card>

                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <SectionHeader title="Entry requirements" />
                    <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                      {course.entry.map((item, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', gap: spacing(3) }}>
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
                  </View>
                </Card>

                <Card>
                  <View style={{ padding: spacing(8) }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: spacing(4),
                      }}
                    >
                      <SectionHeader title="Career pathways" />
                      <View
                        style={{
                          backgroundColor: colors.primarySoft,
                          paddingHorizontal: spacing(3),
                          paddingVertical: spacing(1),
                          borderRadius: radii.pill,
                        }}
                      >
                        <Text style={[typography.caption, { color: colors.primaryStrong }]}>
                          {course.careers.length} careers
                        </Text>
                      </View>
                    </View>

                    <View style={{ gap: spacing(3) }}>
                      {course.careers.map((career, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', gap: spacing(3) }}>
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
                            {career}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </Card>
              </View>

              {/* Right Column - Desktop only */}
              {isDesktop && (
                <View style={{ width: 360, gap: spacing(8) }}>
                  <Card>
                    <View style={{ padding: spacing(6) }}>
                      <SectionHeader title="Quick Info" />
                      <View style={{ marginTop: spacing(4), gap: spacing(4) }}>
                        <FactItem icon="analytics-outline" label="Points" value={course.requiredPoints} />
                        <FactItem icon="time-outline" label="Duration" value={course.duration} />
                        <FactItem icon="cash-outline" label="Tuition" value={course.tuition} />
                        <FactItem icon="calendar-outline" label="Mode" value={course.mode} />
                      </View>
                    </View>
                  </Card>

                  <Card>
                    <View style={{ padding: spacing(6) }}>
                      <SectionHeader title="Next Steps" />
                      <Text
                        style={[
                          typography.body,
                          { color: colors.textSecondary, marginTop: spacing(3) },
                        ]}
                      >
                        Confirm your BGCSE points match the requirement, then proceed to apply when you're ready.
                      </Text>
                    </View>
                  </Card>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Mobile Sticky Actions */}
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
              onPress={handleSaveToggle}
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
                  flexDirection: 'row',
                  gap: spacing(2),
                  opacity: pressed ? 0.85 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [],
                },
              ]}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={colors.primary}
              />
              <Text style={[typography.label, { color: colors.primary }]}>
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
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: spacing(2),
                  opacity: pressed ? 0.9 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [],
                },
              ]}
            >
              <Ionicons name="paper-plane-outline" size={20} color="#fff" />
              <Text style={[typography.label, { color: '#fff', fontWeight: '700' }]}>
                Apply Now
              </Text>
            </Pressable>
          </View>
        )}

        {/* Share Modal */}
        <Modal
          visible={shareVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setShareVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: colors.overlay,
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing(6),
            }}
            onPress={() => setShareVisible(false)}
          >
            <Pressable
              style={({ pressed }) => [
                {
                  width: '100%',
                  maxWidth: 400,
                  backgroundColor: colors.surface,
                  borderRadius: radii.xl,
                  padding: spacing(6),
                  gap: spacing(4),
                  opacity: pressed ? 0.96 : 1,
                },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={[typography.section, { color: colors.text }]}>Share Course</Text>
                <IconButton
                  icon="close-outline"
                  label="Close share dialog"
                  onPress={() => setShareVisible(false)}
                  color={colors.textSecondary}
                />
              </View>

              <Pressable
                onPress={() => Alert.alert('Link copied')}
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
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons name="link-outline" size={20} color={colors.primary} />
                <Text style={[typography.body, { color: colors.text }]}>Copy link</Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert('Shared to WhatsApp')}
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
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={[typography.body, { color: colors.text }]}>Share via WhatsApp</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}