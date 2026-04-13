import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
  Alert,
  LayoutAnimation,
  Modal,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  StudentMenuProvider,
} from '../../components/student/StudentMenu';

// ─────────────────────────────────────────────────────────────────────────────
// DashboardLayout & design tokens
// ─────────────────────────────────────────────────────────────────────────────
import DashboardLayout, {
  spacing,
  typography,
  radii,
  useTheme,
} from '../../components/student/DashboardLayout';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type IconName = keyof typeof Ionicons.glyphMap;

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

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
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
      'Minimum overall points within the institution accepted range',
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

// ─────────────────────────────────────────────────────────────────────────────
// Elevation helper
// ─────────────────────────────────────────────────────────────────────────────
function useElevation(intensity: 'sm' | 'md' | 'lg' = 'md'): ViewStyle {
  return useMemo<ViewStyle>(() => {
    const opacity = 0.28;
    const radius = intensity === 'sm' ? 6 : intensity === 'md' ? 14 : 22;
    const offsetY = intensity === 'sm' ? 2 : intensity === 'md' ? 5 : 10;
    return (
      Platform.select({
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
      }) ?? {}
    );
  }, [intensity]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable primitives — all use useTheme() from DashboardLayout
// ─────────────────────────────────────────────────────────────────────────────

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
  const colors = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.xxl,
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

function SectionLabel({ title }: { title: string }) {
  const colors = useTheme();
  return (
    <Text
      style={[
        typography.caption,
        {
          color: colors.textMuted,
          letterSpacing: 0.5,
          marginBottom: spacing(3),
        },
      ]}
    >
      {title.toUpperCase()}
    </Text>
  );
}

function SectionTitle({ title }: { title: string }) {
  const colors = useTheme();
  return (
    <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
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
  const colors = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(3),
        paddingVertical: spacing(2),
        flex: 1,
        minWidth: 160,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: radii.lg,
          backgroundColor: `${colors.primary}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary, marginTop: 2 }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  const colors = useTheme();
  return (
    <View style={{ gap: spacing(3) }}>
      {items.map((item, idx) => (
        <View key={idx} style={{ flexDirection: 'row', gap: spacing(3), alignItems: 'flex-start' }}>
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              backgroundColor: color,
              marginTop: 8,
              flexShrink: 0,
            }}
          />
          <Text style={[typography.body, { color: colors.textSecondary, flex: 1, lineHeight: 22 }]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar panel (desktop)
// ─────────────────────────────────────────────────────────────────────────────
function SidebarPanel({
  course,
  saved,
  onSaveToggle,
  onApply,
  onShare,
}: {
  course: CourseDetails;
  saved: boolean;
  onSaveToggle: () => void;
  onApply: () => void;
  onShare: () => void;
}) {
  const colors = useTheme();
  const elevation = useElevation('md');
  const sponsorshipPositive = course.sponsorshipFriendly.toLowerCase().startsWith('y');

  return (
    <View style={{ width: 300, flexShrink: 0, gap: spacing(5) }}>
      {/* CTA card */}
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
          elevation,
        ]}
      >
        {/* Top accent bar */}
        <View style={{ height: 3, backgroundColor: colors.primary }} />

        <View style={{ padding: spacing(6), gap: spacing(3) }}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>
            Ready to apply?
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Confirm your BGCSE points match the requirement, then proceed when you're ready.
          </Text>

          <Pressable
            onPress={onApply}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              gap: spacing(2),
              paddingVertical: spacing(4),
              backgroundColor: colors.primary,
              borderRadius: radii.lg,
              opacity: pressed ? 0.88 : 1,
              transform: pressed ? [{ scale: 0.98 }] : [],
              marginTop: spacing(2),
            })}
          >
            <Ionicons name="paper-plane-outline" size={18} color="#fff" />
            <Text style={[typography.label, { color: '#fff' }]}>Apply Now</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: spacing(3) }}>
            <Pressable
              onPress={onSaveToggle}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row' as const,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                gap: spacing(2),
                paddingVertical: spacing(3),
                backgroundColor: colors.surfaceAlt,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={17}
                color={colors.primary}
              />
              <Text style={[typography.label, { color: colors.primary }]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>

            <Pressable
              onPress={onShare}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row' as const,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                gap: spacing(2),
                paddingVertical: spacing(3),
                backgroundColor: colors.surfaceAlt,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Ionicons name="share-social-outline" size={17} color={colors.textSecondary} />
              <Text style={[typography.label, { color: colors.textSecondary }]}>Share</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Quick facts card */}
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(6),
            gap: spacing(1),
          },
          elevation,
        ]}
      >
        <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
          Quick Info
        </Text>
        <FactItem icon="analytics-outline" label="Required Points" value={course.requiredPoints} />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <FactItem icon="time-outline" label="Duration" value={course.duration} />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <FactItem icon="cash-outline" label="Tuition / Year" value={course.tuition} />
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <FactItem icon="calendar-outline" label="Study Mode" value={course.mode} />
        <View style={{ height: 1, backgroundColor: colors.divider }} />

        {/* Sponsorship row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(2) }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.lg,
              backgroundColor: sponsorshipPositive ? `${colors.success}22` : `${colors.danger}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="ribbon-outline"
              size={18}
              color={sponsorshipPositive ? colors.success : colors.danger}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Sponsorship Friendly
            </Text>
            <Text
              style={[
                typography.bodyStrong,
                {
                  color: sponsorshipPositive ? colors.success : colors.danger,
                  marginTop: 2,
                },
              ]}
            >
              {course.sponsorshipFriendly}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Share Modal
// ─────────────────────────────────────────────────────────────────────────────
function ShareModal({
  visible,
  onClose,
  courseTitle,
}: {
  visible: boolean;
  onClose: () => void;
  courseTitle: string;
}) {
  const colors = useTheme();

  const options: { icon: IconName; label: string; color: string; onPress: () => void }[] = [
    {
      icon: 'link-outline',
      label: 'Copy link',
      color: colors.primary,
      onPress: () => Alert.alert('Link copied', 'Course link copied to clipboard.'),
    },
    {
      icon: 'logo-whatsapp',
      label: 'Share via WhatsApp',
      color: '#25D366',
      onPress: () => Alert.alert('WhatsApp', `Sharing "${courseTitle}" via WhatsApp.`),
    },
    {
      icon: 'mail-outline',
      label: 'Share via Email',
      color: '#60A5FA',
      onPress: () => Alert.alert('Email', `Sharing "${courseTitle}" via Email.`),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing(6),
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            width: '100%',
            maxWidth: 420,
            backgroundColor: colors.surface,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Top accent */}
          <View style={{ height: 3, backgroundColor: colors.primary }} />

          <View style={{ padding: spacing(6), gap: spacing(4) }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>Share Course</Text>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 40,
                  height: 40,
                  borderRadius: radii.lg,
                  backgroundColor: colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Options */}
            {options.map(({ icon, label, color, onPress }) => (
              <Pressable
                key={label}
                onPress={onPress}
                style={({ pressed }) => ({
                  flexDirection: 'row' as const,
                  alignItems: 'center' as const,
                  gap: spacing(4),
                  padding: spacing(4),
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radii.xl,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.85 : 1,
                  transform: pressed ? [{ scale: 0.98 }] : [],
                })}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: radii.lg,
                    backgroundColor: `${color}1A`,
                    borderWidth: 1,
                    borderColor: `${color}33`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{label}</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen content
// ─────────────────────────────────────────────────────────────────────────────
function CourseDetailsContent() {
  const { width } = useWindowDimensions();
  const colors = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();

  const courseId = typeof params.id === 'string' ? params.id : 'cs-ub';
  const course = COURSE_DB[courseId] ?? COURSE_DB['cs-ub'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

  const [saved, setSaved] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const handleSaveToggle = useCallback(() => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSaved((prev) => !prev);
  }, []);

  const handleApply = useCallback(() => {
    Alert.alert('Apply Now', `Starting application for:\n${course.title}`);
  }, [course.title]);

  const sponsorshipPositive = course.sponsorshipFriendly.toLowerCase().startsWith('y');

  // ── Hero card ─────────────────────────────────────────────────────────────
  const HeroCard = (
    <Card intensity="lg" style={{ marginBottom: spacing(7) }}>
      {/* Top accent bar */}
      <View style={{ height: 3, backgroundColor: colors.primary }} />

      <View style={{ padding: isMobile ? spacing(5) : spacing(7), gap: spacing(5) }}>
        {/* Badges row */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing(2),
              paddingHorizontal: spacing(3),
              paddingVertical: spacing(2),
              borderRadius: radii.pill,
              backgroundColor: `${colors.primary}22`,
              borderWidth: 1,
              borderColor: `${colors.primary}44`,
            }}
          >
            <Text style={[typography.label, { color: colors.primary, letterSpacing: 0.4 }]}>
              {course.uniBadge}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing(2),
              paddingHorizontal: spacing(3),
              paddingVertical: spacing(2),
              borderRadius: radii.pill,
              backgroundColor: sponsorshipPositive
                ? `${colors.success}1A`
                : `${colors.danger}1A`,
              borderWidth: 1,
              borderColor: sponsorshipPositive
                ? `${colors.success}33`
                : `${colors.danger}33`,
            }}
          >
            <Ionicons
              name="ribbon-outline"
              size={13}
              color={sponsorshipPositive ? colors.success : colors.danger}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: sponsorshipPositive ? colors.success : colors.danger,
                  fontWeight: '700',
                },
              ]}
            >
              Sponsorship: {course.sponsorshipFriendly}
            </Text>
          </View>
        </View>

        {/* Title + meta */}
        <View>
          <Text style={[typography.hero, { color: colors.textPrimary }]}>
            {course.title}
          </Text>
          <Text
            style={[
              typography.subtitle,
              { color: colors.textSecondary, marginTop: spacing(2) },
            ]}
          >
            {course.universityName}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing(4),
              marginTop: spacing(3),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {course.location}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
              <Ionicons name="layers-outline" size={14} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {course.faculty}
              </Text>
            </View>
          </View>
        </View>

        {/* Facts grid */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing(3),
            paddingTop: spacing(4),
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          <FactItem icon="analytics-outline" label="Required Points" value={course.requiredPoints} />
          <FactItem icon="time-outline" label="Duration" value={course.duration} />
          <FactItem icon="calendar-outline" label="Study Mode" value={course.mode} />
          <FactItem icon="cash-outline" label="Tuition / Year" value={course.tuition} />
        </View>

        {/* Tablet/desktop inline CTAs (not mobile — mobile gets sticky bar) */}
        {!isMobile && !isDesktop && (
          <View
            style={{
              flexDirection: 'row',
              gap: spacing(3),
              paddingTop: spacing(4),
              borderTopWidth: 1,
              borderTopColor: colors.divider,
            }}
          >
            <Pressable
              onPress={handleApply}
              style={({ pressed }) => ({
                flex: 2,
                flexDirection: 'row' as const,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                gap: spacing(2),
                paddingVertical: spacing(4),
                backgroundColor: colors.primary,
                borderRadius: radii.lg,
                opacity: pressed ? 0.88 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [],
              })}
            >
              <Ionicons name="paper-plane-outline" size={18} color="#fff" />
              <Text style={[typography.label, { color: '#fff' }]}>Apply Now</Text>
            </Pressable>

            <Pressable
              onPress={handleSaveToggle}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row' as const,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                gap: spacing(2),
                paddingVertical: spacing(4),
                backgroundColor: colors.surfaceAlt,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={colors.primary}
              />
              <Text style={[typography.label, { color: colors.primary }]}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShareVisible(true)}
              style={({ pressed }) => ({
                width: 52,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                backgroundColor: colors.surfaceAlt,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </View>
    </Card>
  );

  // ── About card ─────────────────────────────────────────────────────────────
  const AboutCard = (
    <Card style={{ marginBottom: spacing(6) }}>
      <View style={{ padding: spacing(6) }}>
        <SectionLabel title="Overview" />
        <SectionTitle title="About this course" />
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
          {course.about}
        </Text>
      </View>
    </Card>
  );

  // ── Entry requirements ─────────────────────────────────────────────────────
  const EntryCard = (
    <Card style={{ marginBottom: spacing(6) }}>
      <View style={{ padding: spacing(6) }}>
        <SectionLabel title="Admission" />
        <SectionTitle title="Entry requirements" />
        <BulletList items={course.entry} color={colors.warning} />
      </View>
    </Card>
  );

  // ── Career pathways ────────────────────────────────────────────────────────
  const CareersCard = (
    <Card style={{ marginBottom: spacing(6) }}>
      <View style={{ padding: spacing(6) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: spacing(1),
          }}
        >
          <View style={{ flex: 1 }}>
            <SectionLabel title="After graduation" />
            <SectionTitle title="Career pathways" />
          </View>
          <View
            style={{
              paddingHorizontal: spacing(3),
              paddingVertical: spacing(2),
              borderRadius: radii.pill,
              backgroundColor: `${colors.primary}22`,
              borderWidth: 1,
              borderColor: `${colors.primary}44`,
              alignSelf: 'flex-start',
              marginTop: spacing(4),
            }}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              {course.careers.length} roles
            </Text>
          </View>
        </View>

        {/* Career tags grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) }}>
          {course.careers.map((career, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing(2),
                paddingHorizontal: spacing(3),
                paddingVertical: spacing(2),
                backgroundColor: colors.surfaceAlt,
                borderRadius: radii.pill,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.primary,
                }}
              />
              <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
                {career}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  // ── Mobile sticky bottom bar ───────────────────────────────────────────────
  const MobileStickyBar = isMobile && (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: spacing(5),
        paddingBottom: spacing(8),
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing(3),
      }}
    >
      <Pressable
        onPress={handleSaveToggle}
        style={({ pressed }) => ({
          flex: 1,
          height: 52,
          borderRadius: radii.lg,
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
          gap: spacing(2),
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={colors.primary}
        />
        <Text style={[typography.label, { color: colors.primary }]}>
          {saved ? 'Saved' : 'Save'}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleApply}
        style={({ pressed }) => ({
          flex: 2,
          height: 52,
          borderRadius: radii.lg,
          backgroundColor: colors.primary,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          flexDirection: 'row' as const,
          gap: spacing(2),
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Ionicons name="paper-plane-outline" size={18} color="#fff" />
        <Text style={[typography.label, { color: '#fff' }]}>Apply Now</Text>
      </Pressable>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render — DashboardLayout owns: SafeAreaView, scroll, header, sidebar nav,
  // dark blue theme, and menu button.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardLayout
        title="Course Details"
        subtitle={course.title}
        showPointsCard={false}
      >
        {/* Back + breadcrumb + share (mobile share button) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing(3),
            marginBottom: spacing(6),
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(2),
              paddingHorizontal: spacing(4),
              paddingVertical: spacing(2),
              borderRadius: radii.lg,
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="arrow-back" size={17} color={colors.primary} />
            <Text style={[typography.label, { color: colors.primary }]}>Back</Text>
          </Pressable>

          <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
            Courses › {course.uniBadge}
          </Text>

          {/* Share shortcut (visible on all breakpoints) */}
          <Pressable
            onPress={() => setShareVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Share this course"
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(2),
              paddingHorizontal: spacing(4),
              paddingVertical: spacing(2),
              borderRadius: radii.lg,
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="share-social-outline" size={16} color={colors.textSecondary} />
            <Text style={[typography.label, { color: colors.textSecondary }]}>Share</Text>
          </Pressable>
        </View>

        {/* Hero */}
        {HeroCard}

        {/* Two-column on desktop, stacked otherwise */}
        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: spacing(8),
            alignItems: 'flex-start',
          }}
        >
          {/* Main column */}
          <View style={{ flex: 1 }}>
            {AboutCard}
            {EntryCard}
            {CareersCard}
            {/* Bottom spacer for mobile sticky bar */}
            {isMobile && <View style={{ height: spacing(24) }} />}
          </View>

          {/* Sidebar — desktop only */}
          {isDesktop && (
            <SidebarPanel
              course={course}
              saved={saved}
              onSaveToggle={handleSaveToggle}
              onApply={handleApply}
              onShare={() => setShareVisible(true)}
            />
          )}
        </View>
      </DashboardLayout>

      {/* Overlays — outside DashboardLayout's scroll */}
      {MobileStickyBar}

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        courseTitle={course.title}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function CourseDetailsScreen() {
  return (
    <StudentMenuProvider>
      <CourseDetailsContent />
    </StudentMenuProvider>
  );
}