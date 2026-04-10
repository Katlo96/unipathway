import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
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

// ─────────────────────────────────────────────────────────────────────────────
// Import DashboardLayout & its exported design tokens
// ─────────────────────────────────────────────────────────────────────────────
import DashboardLayout, {
  BASE_SPACING,
  spacing,
  typography as dashTypography,
  radii,
  useTheme,
} from '../../components/student/DashboardLayout';

// ─────────────────────────────────────────────────────────────────────────────
// Re-export / alias — keeps internal code concise
// ─────────────────────────────────────────────────────────────────────────────
const typography = dashTypography;

// ─────────────────────────────────────────────────────────────────────────────
// Breakpoint helpers
// ─────────────────────────────────────────────────────────────────────────────
type Breakpoint = 'mobile' | 'tablet' | 'desktop';
const MAX_CONTENT_WIDTH = 1240;

// ─────────────────────────────────────────────────────────────────────────────
// Elevation
// ─────────────────────────────────────────────────────────────────────────────
function useElevation(intensity: 'sm' | 'md' | 'lg' = 'md'): ViewStyle {
  return useMemo<ViewStyle>(() => {
    const opacity = 0.35;
    const radius = intensity === 'sm' ? 6 : intensity === 'md' ? 12 : 20;
    const offsetY = intensity === 'sm' ? 2 : intensity === 'md' ? 4 : 8;
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
// Data
// ─────────────────────────────────────────────────────────────────────────────
type BrigadeCourse = { id: string; title: string; points: number };
type BrigadeDetails = {
  id: string;
  name: string;
  location: string;
  website: string;
  badge: string;
  about: string;
  popularCourses: BrigadeCourse[];
  scholarships: string[];
};

const BRIGADE_DB: Record<string, BrigadeDetails> = {
  gb: {
    id: 'gb',
    name: 'Gaborone Brigade',
    location: 'Gaborone, Botswana',
    website: 'www.gaboronebrigade.ac.bw',
    badge: 'GB',
    about:
      'Gaborone Brigade provides hands-on technical and vocational training focused on employable skills in construction, mechanics, and electrical work.',
    popularCourses: [
      { id: 'auto-gb', title: 'Automotive Mechanics', points: 28 },
      { id: 'build-gb', title: 'Building & Construction', points: 30 },
      { id: 'elec-gb', title: 'Electrical Installation', points: 27 },
    ],
    scholarships: ['Government Technical Sponsorship', 'Brigade Merit Award'],
  },
  fb: {
    id: 'fb',
    name: 'Francistown Brigade',
    location: 'Francistown, Botswana',
    website: 'www.francistownbrigade.ac.bw',
    badge: 'FB',
    about:
      'Francistown Brigade offers practical, industry-aligned vocational programs with strong emphasis on northern Botswana workforce needs.',
    popularCourses: [
      { id: 'weld-fb', title: 'Welding & Fabrication', points: 29 },
      { id: 'plumb-fb', title: 'Plumbing & Pipe Fitting', points: 28 },
    ],
    scholarships: ['Government Sponsorship', 'Regional Bursary'],
  },
  mb: {
    id: 'mb',
    name: 'Maun Brigade',
    location: 'Maun, Botswana',
    website: 'www.maunbrigade.ac.bw',
    badge: 'MB',
    about:
      'Maun Brigade delivers vocational training tailored to the tourism, hospitality, and rural development sectors in northern Botswana.',
    popularCourses: [
      { id: 'tour-mb', title: 'Tourism & Hospitality', points: 26 },
      { id: 'carp-mb', title: 'Carpentry & Joinery', points: 27 },
    ],
    scholarships: ['Government Vocational Sponsorship'],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable UI primitives (use DashboardLayout's theme)
// ─────────────────────────────────────────────────────────────────────────────
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
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radii.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        opacity: pressed ? 0.7 : 1,
        transform: pressed ? [{ scale: 0.96 }] : [],
      })}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

/** Card using DashboardLayout surface + border tokens */
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
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
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
  course: BrigadeCourse;
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
          style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}
        >
          {course.points} pts
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Content
// ─────────────────────────────────────────────────────────────────────────────
function BrigadeDetailsContent() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ id?: string }>();
  const colors = useTheme();

  const brigadeId = typeof params.id === 'string' ? params.id : 'gb';
  const brigade = BRIGADE_DB[brigadeId] ?? BRIGADE_DB['gb'];

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';
  const contentWidth = isDesktop
    ? Math.min(MAX_CONTENT_WIDTH, width - spacing(16))
    : width;

  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleVisitWebsite = useCallback(() => {
    Alert.alert('Visit Website', `Would open: ${brigade.website}`);
  }, [brigade.website]);

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

  // ── Hero section ──────────────────────────────────────────────────────────
  const HeroCard = (
    <Card intensity="lg" style={{ marginBottom: spacing(8) }}>
      <View style={{ padding: spacing(7), gap: spacing(6) }}>
        {/* Badge + Name */}
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
              borderColor: colors.border,
            }}
          >
            <Text
              style={[
                typography.hero,
                { color: colors.primary, fontSize: 28, lineHeight: 34 },
              ]}
            >
              {brigade.badge}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, { color: colors.textPrimary }]}>
              {brigade.name}
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
                {brigade.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{ height: 1, backgroundColor: colors.divider }}
        />

        {/* About */}
        <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 24 }]}>
          {brigade.about}
        </Text>

        {/* Meta */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing(4),
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            paddingTop: spacing(5),
          }}
        >
          <MetaItem
            icon="location-outline"
            label="Location"
            value={brigade.location}
          />
          <MetaItem
            icon="globe-outline"
            label="Website"
            value={brigade.website}
          />
        </View>
      </View>
    </Card>
  );

  // ── Sidebar Quick Actions + Scholarships ──────────────────────────────────
  const Sidebar = (
    <View style={{ width: 300, gap: spacing(6) }}>
      {/* Quick Actions */}
      <Card>
        <View style={{ padding: spacing(6) }}>
          <SectionHeader title="Quick Actions" icon="flash-outline" />
          <View style={{ gap: spacing(3) }}>
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
              <Text style={[typography.label, { color: '#fff' }]}>
                Visit Website
              </Text>
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
        </View>
      </Card>

      {/* Scholarships */}
      <Card>
        <View style={{ padding: spacing(6) }}>
          <SectionHeader title="Scholarships" icon="ribbon-outline" />
          <View style={{ gap: spacing(3) }}>
            {brigade.scholarships.map((s, i) => (
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
                  style={[
                    typography.body,
                    { color: colors.textSecondary, flex: 1 },
                  ]}
                >
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </View>
  );

  // ── Popular Courses ───────────────────────────────────────────────────────
  const CoursesCard = (
    <Card style={{ marginBottom: spacing(6) }}>
      <View style={{ padding: spacing(7) }}>
        <SectionHeader title="Popular Courses" icon="flame-outline" />
        <View style={{ gap: spacing(2) }}>
          {brigade.popularCourses.map((course) => (
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

  // ── Quick Note card (tablet/desktop) ─────────────────────────────────────
  const QuickNoteCard = !isMobile && (
    <Card>
      <View style={{ padding: spacing(7) }}>
        <SectionHeader title="Quick Note" icon="create-outline" />
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginBottom: spacing(4) },
          ]}
        >
          Add a short note to remember important details about this brigade.
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
          <Text style={[typography.label, { color: colors.primary }]}>
            Add Note
          </Text>
        </Pressable>
      </View>
    </Card>
  );

  // ── Note Modal ────────────────────────────────────────────────────────────
  const NoteModal = (
    <Modal
      visible={noteModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setNoteModalVisible(false)}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
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
              borderRadius: radii.xxl,
              padding: spacing(6),
              gap: spacing(5),
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={(e) => e.stopPropagation()}
          >
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

            <View style={{ flexDirection: 'row', gap: spacing(4) }}>
              <Pressable
                onPress={() => setNoteModalVisible(false)}
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
                onPress={handleSaveNote}
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
                <Text style={[typography.label, { color: '#fff' }]}>
                  Save Note
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );

  // ── Mobile Sticky Bottom Bar ──────────────────────────────────────────────
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
        <Text style={[typography.label, { color: colors.textPrimary }]}>
          Website
        </Text>
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
        <Text style={[typography.label, { color: '#fff' }]}>
          View Courses
        </Text>
      </Pressable>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render — wrapped in DashboardLayout
  // DashboardLayout renders: SafeAreaView → ScrollView → header → sidebar → {children}
  // We pass showPointsCard=false so the hero points card is suppressed here.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardLayout
        title="Brigade Details"
        subtitle={brigade.name}
        showPointsCard={false}
      >
        {/* Back navigation row */}
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
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={[typography.label, { color: colors.primary }]}>Back</Text>
          </Pressable>

          {/* Breadcrumb */}
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Institutions › Brigades › {brigade.badge}
          </Text>
        </View>

        {/* Hero Card */}
        {HeroCard}

        {/* Adaptive two-column on desktop, stacked on mobile/tablet */}
        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: spacing(8),
            alignItems: 'flex-start',
          }}
        >
          {/* Main column */}
          <View style={{ flex: 1, gap: spacing(6) }}>
            {CoursesCard}
            {QuickNoteCard}
          </View>

          {/* Sidebar (desktop only) */}
          {isDesktop && Sidebar}
        </View>

        {/* On mobile/tablet: scholarship section inline */}
        {!isDesktop && (
          <View style={{ marginTop: spacing(6), gap: spacing(6) }}>
            {/* Scholarships */}
            <Card>
              <View style={{ padding: spacing(6) }}>
                <SectionHeader title="Scholarships" icon="ribbon-outline" />
                <View style={{ gap: spacing(3) }}>
                  {brigade.scholarships.map((s, i) => (
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
                        style={[
                          typography.body,
                          { color: colors.textSecondary, flex: 1 },
                        ]}
                      >
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Bottom spacer for mobile sticky bar */}
        {isMobile && <View style={{ height: spacing(24) }} />}
      </DashboardLayout>

      {/* Overlays — rendered outside DashboardLayout's scroll */}
      {MobileStickyBar}
      {NoteModal}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Screen (with Provider wrapper)
// ─────────────────────────────────────────────────────────────────────────────
export default function BrigadeDetailsScreen() {
  return (
    <StudentMenuProvider>
      <BrigadeDetailsContent />
    </StudentMenuProvider>
  );
}