import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  type ViewStyle,
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

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
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
  fce: {
    id: 'fce',
    name: 'Francistown College of Education',
    location: 'Francistown, Botswana',
    website: 'www.fce.ac.bw',
    badge: 'FCE',
    about:
      'Francistown College of Education is dedicated to producing capable, compassionate, and innovative educators for primary and secondary schools across Botswana.',
    popularCourses: [
      { id: 'edu-fce', title: 'Diploma in Education (Primary)', points: 28 },
      { id: 'sec-fce', title: 'Diploma in Education (Secondary)', points: 30 },
    ],
    scholarships: ['Teaching Service Bursary', 'Government Sponsorship'],
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
// Reusable primitives — all consume useTheme() from DashboardLayout
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
        { color: colors.textMuted, letterSpacing: 0.5, marginBottom: spacing(3) },
      ]}
    >
      {title.toUpperCase()}
    </Text>
  );
}

function SectionTitle({
  title,
  icon,
}: {
  title: string;
  icon?: IconName;
}) {
  const colors = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(3),
        marginBottom: spacing(4),
      }}
    >
      {icon && <Ionicons name={icon} size={20} color={colors.primary} />}
      <Text style={[typography.h2, { color: colors.textPrimary }]}>{title}</Text>
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
  const colors = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(3),
        paddingVertical: spacing(2),
        flex: 1,
        minWidth: 200,
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

function CourseRow({
  course,
  onPress,
}: {
  course: CollegeCourse;
  onPress: () => void;
}) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${course.title}`}
      style={({ pressed }) => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: spacing(4),
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing(2),
        opacity: pressed ? 0.85 : 1,
        transform: pressed ? [{ scale: 0.98 }] : [],
      })}
    >
      {/* Icon bubble */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: radii.md,
          backgroundColor: `${colors.primary}22`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing(4),
        }}
      >
        <Ionicons name="book-outline" size={18} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
          {course.title}
        </Text>
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginTop: spacing(1) },
          ]}
        >
          Required points: {course.points}
        </Text>
      </View>

      {/* Points pill */}
      <View
        style={{
          paddingHorizontal: spacing(3),
          paddingVertical: spacing(1),
          borderRadius: radii.pill,
          backgroundColor: `${colors.primary}22`,
          marginRight: spacing(2),
        }}
      >
        <Text
          style={[
            typography.caption,
            { color: colors.primary, fontWeight: '700' },
          ]}
        >
          {course.points} pts
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Note Modal
// ─────────────────────────────────────────────────────────────────────────────
function NoteModal({
  visible,
  noteText,
  onChangeText,
  onClose,
  onSave,
}: {
  visible: boolean;
  noteText: string;
  onChangeText: (t: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const colors = useTheme();

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', maxWidth: 500 }}
        >
          <Pressable
            style={{
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

            <View style={{ padding: spacing(6), gap: spacing(5) }}>
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={[typography.h2, { color: colors.textPrimary }]}>
                  Add Quick Note
                </Text>
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

              {/* Input */}
              <TextInput
                value={noteText}
                onChangeText={onChangeText}
                placeholder="e.g. Check scholarship deadlines and compare with my points..."
                placeholderTextColor={colors.textMuted}
                style={{
                  minHeight: 120,
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(4),
                  backgroundColor: colors.surfaceAlt,
                  color: colors.textPrimary,
                  textAlignVertical: 'top',
                  fontSize: 15,
                }}
                multiline
              />

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: spacing(4) }}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 52,
                    borderRadius: radii.lg,
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center' as const,
                    justifyContent: 'center' as const,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={[typography.label, { color: colors.textPrimary }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onSave}
                  style={({ pressed }) => ({
                    flex: 1,
                    height: 52,
                    borderRadius: radii.lg,
                    backgroundColor: colors.primary,
                    alignItems: 'center' as const,
                    justifyContent: 'center' as const,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <Text style={[typography.label, { color: '#fff' }]}>Save Note</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Content
// ─────────────────────────────────────────────────────────────────────────────
function CollegeDetailsContent() {
  const { width } = useWindowDimensions();
  const colors = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();

  const collegeId = typeof params.id === 'string' ? params.id : 'bac';
  const college = COLLEGE_DB[collegeId] ?? COLLEGE_DB['bac'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

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
    Alert.alert('Note Saved', 'Your note has been saved.');
    setNoteModalVisible(false);
  }, []);

  // ── Hero card ──────────────────────────────────────────────────────────────
  const HeroCard = (
    <Card intensity="lg" style={{ marginBottom: spacing(7) }}>
      {/* Top accent bar */}
      <View style={{ height: 3, backgroundColor: colors.primary }} />

      <View style={{ padding: isMobile ? spacing(5) : spacing(7), gap: spacing(6) }}>
        {/* Badge + Name row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(5) }}>
          <View
            style={{
              width: 76,
              height: 76,
              borderRadius: radii.xl,
              backgroundColor: `${colors.primary}22`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: `${colors.primary}44`,
            }}
          >
            <Text
              style={[
                typography.hero,
                { color: colors.primary, fontSize: 22, lineHeight: 28 },
              ]}
            >
              {college.badge}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>
              {college.name}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing(2),
                marginTop: spacing(1),
              }}
            >
              <Ionicons name="location-outline" size={14} color={colors.primary} />
              <Text style={[typography.subtitle, { color: colors.textSecondary }]}>
                {college.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: colors.divider }} />

        {/* About */}
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, lineHeight: 24 },
          ]}
        >
          {college.about}
        </Text>

        {/* Meta items */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing(4),
            paddingTop: spacing(4),
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          <MetaItem icon="location-outline" label="Location" value={college.location} />
          <MetaItem icon="globe-outline" label="Website" value={college.website} />
        </View>
      </View>
    </Card>
  );

  // ── Courses card ───────────────────────────────────────────────────────────
  const CoursesCard = (
    <Card style={{ marginBottom: spacing(6) }}>
      <View style={{ padding: spacing(6) }}>
        <SectionLabel title="Offerings" />
        <SectionTitle title="Popular Courses" icon="flame-outline" />
        <View style={{ gap: spacing(2) }}>
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
  );

  // ── Quick Note card (tablet + desktop) ────────────────────────────────────
  const QuickNoteCard = !isMobile && (
    <Card>
      <View style={{ padding: spacing(6) }}>
        <SectionLabel title="Personal" />
        <SectionTitle title="Quick Note" icon="create-outline" />
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing(4) },
          ]}
        >
          Add a short note to remember important details about this college.
        </Text>
        <Pressable
          onPress={() => setNoteModalVisible(true)}
          style={({ pressed }) => ({
            padding: spacing(4),
            backgroundColor: colors.surfaceAlt,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center' as const,
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Text style={[typography.label, { color: colors.primary }]}>Add Note</Text>
        </Pressable>
      </View>
    </Card>
  );

  // ── Scholarships section (inline for mobile/tablet) ────────────────────────
  const ScholarshipsSection = !isDesktop && (
    <Card style={{ marginTop: spacing(6) }}>
      <View style={{ padding: spacing(6) }}>
        <SectionLabel title="Funding" />
        <SectionTitle title="Scholarships" icon="ribbon-outline" />
        <View style={{ gap: spacing(3) }}>
          {college.scholarships.map((s, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: spacing(3),
                padding: spacing(3),
                backgroundColor: `${colors.success}14`,
                borderRadius: radii.lg,
                borderLeftWidth: 3,
                borderLeftColor: colors.success,
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={colors.success}
                style={{ marginTop: 2 }}
              />
              <Text
                style={[typography.body, { color: colors.textSecondary, flex: 1 }]}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );

  // ── Desktop sidebar ────────────────────────────────────────────────────────
  const DesktopSidebar = isDesktop && (
    <View style={{ width: 300, flexShrink: 0, gap: spacing(5) }}>
      {/* Quick Actions */}
      <Card>
        <View style={{ padding: spacing(6), gap: spacing(3) }}>
          <SectionLabel title="Actions" />
          <SectionTitle title="Quick Actions" />

          <Pressable
            onPress={handleVisitWebsite}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(3),
              padding: spacing(4),
              backgroundColor: colors.primary,
              borderRadius: radii.lg,
              opacity: pressed ? 0.9 : 1,
              transform: pressed ? [{ scale: 0.98 }] : [],
            })}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={[typography.label, { color: '#fff' }]}>Visit Website</Text>
          </Pressable>

          <Pressable
            onPress={handleViewAllCourses}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(3),
              padding: spacing(4),
              backgroundColor: colors.surfaceAlt,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
              transform: pressed ? [{ scale: 0.98 }] : [],
            })}
          >
            <Ionicons name="school-outline" size={18} color={colors.primary} />
            <Text style={[typography.label, { color: colors.primary }]}>
              View All Courses
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setNoteModalVisible(true)}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(3),
              padding: spacing(4),
              backgroundColor: colors.surfaceAlt,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1,
              transform: pressed ? [{ scale: 0.98 }] : [],
            })}
          >
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
            <Text style={[typography.label, { color: colors.textSecondary }]}>
              Add Note
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Scholarships */}
      <Card>
        <View style={{ padding: spacing(6) }}>
          <SectionLabel title="Funding" />
          <SectionTitle title="Scholarships" icon="ribbon-outline" />
          <View style={{ gap: spacing(3) }}>
            {college.scholarships.map((s, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: spacing(3),
                  padding: spacing(3),
                  backgroundColor: `${colors.success}14`,
                  borderRadius: radii.lg,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.success,
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={colors.success}
                  style={{ marginTop: 2 }}
                />
                <Text
                  style={[typography.body, { color: colors.textSecondary, flex: 1 }]}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* Tip */}
      <View
        style={{
          padding: spacing(4),
          backgroundColor: `${colors.primary}14`,
          borderRadius: radii.xl,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
        }}
      >
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, lineHeight: 18 },
          ]}
        >
          💡 Tip: Compare your BGCSE points against each course's requirement before applying.
        </Text>
      </View>
    </View>
  );

  // ── Mobile sticky bar ──────────────────────────────────────────────────────
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
        onPress={handleVisitWebsite}
        style={({ pressed }) => ({
          flex: 1,
          height: 52,
          borderRadius: radii.lg,
          backgroundColor: colors.surfaceAlt,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={[typography.label, { color: colors.textPrimary }]}>Website</Text>
      </Pressable>

      <Pressable
        onPress={handleViewAllCourses}
        style={({ pressed }) => ({
          flex: 2,
          height: 52,
          borderRadius: radii.lg,
          backgroundColor: colors.primary,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <Text style={[typography.label, { color: '#fff' }]}>View Courses</Text>
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
        title="College Details"
        subtitle={college.name}
        showPointsCard={false}
      >
        {/* Back navigation + breadcrumb */}
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

          <Text
            style={[typography.caption, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            Institutions › Colleges › {college.badge}
          </Text>
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
            {CoursesCard}
            {QuickNoteCard}
            {ScholarshipsSection}
            {isMobile && <View style={{ height: spacing(24) }} />}
          </View>

          {/* Sidebar — desktop only */}
          {DesktopSidebar}
        </View>
      </DashboardLayout>

      {/* Overlays — outside DashboardLayout scroll */}
      {MobileStickyBar}

      <NoteModal
        visible={noteModalVisible}
        noteText={noteText}
        onChangeText={setNoteText}
        onClose={() => setNoteModalVisible(false)}
        onSave={handleSaveNote}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function CollegeDetailsScreen() {
  return (
    <StudentMenuProvider>
      <CollegeDetailsContent />
    </StudentMenuProvider>
  );
}