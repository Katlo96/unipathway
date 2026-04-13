import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
  TextInput,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
  useStudentMenu,
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

type Course = {
  id: string;
  name: string;
  university: string;
  location: string;
  tagline: string;
  badge: string;
  field: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const COURSES: Course[] = [
  {
    id: 'cs-ub',
    name: 'Computer Science',
    university: 'University of Botswana',
    location: 'Gaborone',
    tagline: 'Strong foundation in computing',
    badge: 'CS',
    field: 'Technology',
  },
  {
    id: 'acct-botho',
    name: 'Accounting',
    university: 'Botho University',
    location: 'Gaborone',
    tagline: 'Career-focused professional pathway',
    badge: 'AC',
    field: 'Business',
  },
  {
    id: 'eng-biust',
    name: 'Mechanical Engineering',
    university: 'BIUST',
    location: 'Palapye',
    tagline: 'Hands-on engineering excellence',
    badge: 'ME',
    field: 'Engineering',
  },
  {
    id: 'design-luct',
    name: 'Digital Media & Design',
    university: 'Limkokwing University',
    location: 'Gaborone',
    tagline: 'Creativity meets technology',
    badge: 'DM',
    field: 'Creative',
  },
  {
    id: 'law-ub',
    name: 'Bachelor of Laws (LLB)',
    university: 'University of Botswana',
    location: 'Gaborone',
    tagline: 'Legal excellence and justice',
    badge: 'LW',
    field: 'Law',
  },
  {
    id: 'nursing-ub',
    name: 'Bachelor of Nursing Science',
    university: 'University of Botswana',
    location: 'Gaborone',
    tagline: 'Compassionate healthcare training',
    badge: 'NS',
    field: 'Health',
  },
];

// Field accent colours — consistent tints for the card icon bubbles
const FIELD_COLORS: Record<string, string> = {
  Technology:  '#60A5FA',
  Business:    '#34D399',
  Engineering: '#FBBF24',
  Creative:    '#F472B6',
  Law:         '#A78BFA',
  Health:      '#F87171',
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
// StatPill
// ─────────────────────────────────────────────────────────────────────────────
function StatPill({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useTheme();
  const elevation = useElevation('sm');
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing(3),
          paddingHorizontal: spacing(4),
          paddingVertical: spacing(3),
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevation,
      ]}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.md,
          backgroundColor: `${colors.primary}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={16} color={colors.primary} />
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

// ─────────────────────────────────────────────────────────────────────────────
// SidebarAction
// ─────────────────────────────────────────────────────────────────────────────
function SidebarAction({
  icon,
  label,
  onPress,
  variant = 'ghost',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'ghost' | 'primary';
}) {
  const colors = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: spacing(3),
        paddingHorizontal: spacing(4),
        paddingVertical: spacing(3),
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: isPrimary ? colors.primary : colors.border,
        backgroundColor: isPrimary ? colors.primary : colors.surfaceAlt,
        opacity: pressed ? 0.85 : 1,
        transform: pressed ? [{ scale: 0.98 }] : [],
      })}
    >
      <Ionicons name={icon} size={17} color={isPrimary ? '#fff' : colors.textPrimary} />
      <Text style={[typography.label, { color: isPrimary ? '#fff' : colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CourseCard
// ─────────────────────────────────────────────────────────────────────────────
function CourseCard({
  course,
  onPress,
}: {
  course: Course;
  onPress: () => void;
}) {
  const colors = useTheme();
  const elevation = useElevation('md');
  const fieldColor = FIELD_COLORS[course.field] ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${course.name}`}
      style={({ pressed }) => ([
        {
          flex: 1,
          minWidth: 260,
          backgroundColor: colors.card,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(5),
          overflow: 'hidden' as const,
          opacity: pressed ? 0.9 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
        },
        elevation,
      ])}
    >
      {/* Top row: badge + chevron */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Field-coloured badge bubble */}
        <View
          style={{
            paddingHorizontal: spacing(3),
            paddingVertical: spacing(2),
            borderRadius: radii.pill,
            backgroundColor: `${fieldColor}1A`,
            borderWidth: 1,
            borderColor: `${fieldColor}33`,
          }}
        >
          <Text style={[typography.label, { color: fieldColor, letterSpacing: 0.4 }]}>
            {course.badge}
          </Text>
        </View>

        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radii.md,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </View>

      {/* Course name */}
      <Text
        style={[typography.h2, { color: colors.textPrimary, marginTop: spacing(4) }]}
        numberOfLines={2}
      >
        {course.name}
      </Text>

      {/* University */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(2) }}>
        <Ionicons name="school-outline" size={13} color={fieldColor} />
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {course.university}
        </Text>
      </View>

      {/* Location */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(1) }}>
        <Ionicons name="location-outline" size={13} color={colors.primary} />
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {course.location}
        </Text>
      </View>

      {/* Tagline */}
      <Text
        style={[typography.body, { color: colors.textSecondary, marginTop: spacing(3), lineHeight: 20 }]}
        numberOfLines={2}
      >
        {course.tagline}
      </Text>

      {/* Field pill */}
      <View style={{ marginTop: spacing(3) }}>
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: spacing(3),
            paddingVertical: spacing(1),
            borderRadius: radii.pill,
            backgroundColor: `${fieldColor}1A`,
            borderWidth: 1,
            borderColor: `${fieldColor}33`,
          }}
        >
          <Text style={[typography.caption, { color: fieldColor, fontWeight: '700' }]}>
            {course.field}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          marginTop: spacing(4),
          paddingTop: spacing(3),
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={[typography.label, { color: colors.primary }]}>View details</Text>
        <Ionicons name="arrow-forward" size={15} color={colors.primary} />
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState({ onReset }: { onReset: () => void }) {
  const colors = useTheme();
  const elevation = useElevation('sm');
  return (
    <View
      style={[
        {
          alignItems: 'center',
          padding: spacing(10),
          backgroundColor: colors.card,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
        },
        elevation,
      ]}
    >
      <View
        style={{
          width: 68,
          height: 68,
          borderRadius: radii.xl,
          backgroundColor: `${colors.primary}22`,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing(5),
        }}
      >
        <Ionicons name="search-outline" size={28} color={colors.primary} />
      </View>
      <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>
        No courses found
      </Text>
      <Text
        style={[
          typography.body,
          { color: colors.textSecondary, marginTop: spacing(2), textAlign: 'center', maxWidth: 300 },
        ]}
      >
        Try a different course title, university, location, or keyword.
      </Text>
      <Pressable
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Reset search"
        style={({ pressed }) => ({
          marginTop: spacing(6),
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: spacing(2),
          paddingHorizontal: spacing(6),
          paddingVertical: spacing(4),
          borderRadius: radii.lg,
          backgroundColor: colors.primary,
          opacity: pressed ? 0.88 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
        })}
      >
        <Ionicons name="refresh-outline" size={17} color="#fff" />
        <Text style={[typography.label, { color: '#fff', letterSpacing: 0.4 }]}>
          RESET SEARCH
        </Text>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────
function CoursesContent() {
  const { width } = useWindowDimensions();
  const colors = useTheme();
  const { openMenu } = useStudentMenu();
  const elevation = useElevation('md');

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);

  const isDesktop = breakpoint === 'desktop';
  const isMobile = breakpoint === 'mobile';

  const [search, setSearch] = useState('');

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return COURSES;
    const q = search.toLowerCase();
    return COURSES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.university.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.field.toLowerCase().includes(q),
    );
  }, [search]);

  const handleViewCourse = useCallback((id: string) => {
    router.push({ pathname: '/student/course-details', params: { id } });
  }, []);

  // Unique fields for the filter strip
  const allFields = useMemo(
    () => Array.from(new Set(COURSES.map((c) => c.field))),
    [],
  );

  // ── Desktop sidebar ──────────────────────────────────────────────────────
  const Sidebar = isDesktop && (
    <View style={{ width: 300, flexShrink: 0, gap: spacing(5) }}>
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(6),
            gap: spacing(4),
          },
          elevation,
        ]}
      >
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Overview</Text>

        <View style={{ gap: spacing(3) }}>
          <StatPill icon="book-outline"   label="Total Programs"    value={`${COURSES.length}`} />
          <StatPill icon="search-outline" label="Search Results"    value={`${filteredCourses.length}`} />
          <StatPill icon="school-outline" label="Institutions"      value="Multiple" />
        </View>

        <View style={{ height: 1, backgroundColor: colors.divider }} />

        <Text style={[typography.h2, { color: colors.textPrimary }]}>Quick Actions</Text>
        <View style={{ gap: spacing(3) }}>
          <SidebarAction icon="menu-outline"    label="Open Menu"         onPress={openMenu}            variant="primary" />
          <SidebarAction icon="refresh-outline" label="Clear Search"      onPress={() => setSearch('')} />
          <SidebarAction icon="school-outline"  label="All Institutions"  onPress={() => router.push('/student/institutions')} />
        </View>

        {/* Fields legend */}
        <View style={{ height: 1, backgroundColor: colors.divider }} />
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Fields</Text>
        <View style={{ gap: spacing(2) }}>
          {allFields.map((field) => {
            const color = FIELD_COLORS[field] ?? colors.primary;
            return (
              <Pressable
                key={field}
                onPress={() => setSearch(field)}
                style={({ pressed }) => ({
                  flexDirection: 'row' as const,
                  alignItems: 'center' as const,
                  gap: spacing(3),
                  paddingHorizontal: spacing(3),
                  paddingVertical: spacing(2),
                  borderRadius: radii.lg,
                  backgroundColor: `${color}14`,
                  borderWidth: 1,
                  borderColor: `${color}33`,
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: color,
                  }}
                />
                <Text style={[typography.label, { color, flex: 1 }]}>{field}</Text>
                <Ionicons name="chevron-forward" size={13} color={color} />
              </Pressable>
            );
          })}
        </View>

        {/* Tip */}
        <View
          style={{
            padding: spacing(4),
            backgroundColor: `${colors.primary}14`,
            borderRadius: radii.lg,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
          }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
            💡 Tap a field above or search broad terms like "engineering" or "media" to quickly filter programs.
          </Text>
        </View>
      </View>
    </View>
  );

  // ── Hero banner ────────────────────────────────────────────────────────────
  const HeroBanner = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: isMobile ? spacing(5) : spacing(7),
          marginBottom: spacing(6),
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: spacing(4),
        },
        elevation,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.hero, { color: colors.textPrimary }]}>
          Find your next course
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, marginTop: spacing(2), maxWidth: 480 },
          ]}
        >
          Explore programs across Botswana, compare institutions, and open details
          to see which pathway fits your academic goals.
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing(2),
          paddingHorizontal: spacing(4),
          paddingVertical: spacing(2),
          borderRadius: radii.pill,
          backgroundColor: `${colors.primary}22`,
          borderWidth: 1,
          borderColor: `${colors.primary}44`,
          alignSelf: isMobile ? 'flex-start' : 'center',
        }}
      >
        <Ionicons name="book-outline" size={15} color={colors.primary} />
        <Text style={[typography.label, { color: colors.primary }]}>
          {filteredCourses.length} result{filteredCourses.length === 1 ? '' : 's'}
        </Text>
      </View>
    </View>
  );

  // ── Mobile stats strip ─────────────────────────────────────────────────────
  const MobileStatsStrip = isMobile && (
    <View style={{ flexDirection: 'row', gap: spacing(3), marginBottom: spacing(6), flexWrap: 'wrap' }}>
      {[
        { icon: 'book-outline' as const,   label: 'Programs', value: `${COURSES.length}` },
        { icon: 'search-outline' as const, label: 'Results',  value: `${filteredCourses.length}` },
        { icon: 'school-outline' as const, label: 'Institutions', value: 'Multiple' },
      ].map((s) => (
        <View
          key={s.label}
          style={{
            flex: 1,
            minWidth: 90,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing(2),
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(3),
          }}
        >
          <Ionicons name={s.icon} size={14} color={colors.primary} />
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{s.label}</Text>
            <Text style={[typography.label, { color: colors.textPrimary }]}>{s.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  // ── Field filter strip (mobile + tablet) ──────────────────────────────────
  const FieldFilterStrip = !isDesktop && (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing(2),
        marginBottom: spacing(5),
      }}
    >
      {allFields.map((field) => {
        const color = FIELD_COLORS[field] ?? colors.primary;
        const active = search.toLowerCase() === field.toLowerCase();
        return (
          <Pressable
            key={field}
            onPress={() => setSearch(active ? '' : field)}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(2),
              paddingHorizontal: spacing(3),
              paddingVertical: spacing(2),
              borderRadius: radii.pill,
              backgroundColor: active ? color : `${color}1A`,
              borderWidth: 1,
              borderColor: `${color}44`,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: active ? '#fff' : color,
              }}
            />
            <Text
              style={[
                typography.caption,
                { color: active ? '#fff' : color, fontWeight: '700' },
              ]}
            >
              {field}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  // ── Search bar ─────────────────────────────────────────────────────────────
  const SearchBar = (
    <View style={{ marginBottom: spacing(6) }}>
      <Text
        style={[
          typography.caption,
          { color: colors.textMuted, letterSpacing: 0.5, marginBottom: spacing(2) },
        ]}
      >
        SEARCH
      </Text>
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: spacing(4),
            minHeight: 52,
          },
          elevation,
        ]}
      >
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search courses, universities, fields..."
          placeholderTextColor={colors.textMuted}
          style={[
            typography.body,
            {
              flex: 1,
              marginLeft: spacing(3),
              paddingVertical: spacing(3),
              color: colors.textPrimary,
            },
          ]}
          accessibilityLabel="Search courses"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable
            onPress={() => setSearch('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => ({ padding: spacing(2), opacity: pressed ? 0.7 : 1 })}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  // ── Card grid ──────────────────────────────────────────────────────────────
  const Grid =
    filteredCourses.length === 0 ? (
      <EmptyState onReset={() => setSearch('')} />
    ) : (
      <View>
        <Text
          style={[
            typography.caption,
            { color: colors.textMuted, letterSpacing: 0.5, marginBottom: spacing(3) },
          ]}
        >
          COURSES
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(4) }}>
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => handleViewCourse(course.id)}
            />
          ))}
        </View>
      </View>
    );

  // ─────────────────────────────────────────────────────────────────────────
  // Render — DashboardLayout owns: SafeAreaView, scroll, header, sidebar nav,
  // dark blue theme, and menu button.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Courses"
      subtitle="Explore programs across Botswana and beyond"
      showPointsCard={false}
    >
      {/* Back + breadcrumb */}
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

        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Dashboard › Courses
        </Text>
      </View>

      {/* Desktop: two-column; mobile/tablet: stacked */}
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          gap: spacing(8),
          alignItems: 'flex-start',
        }}
      >
        {/* Main column */}
        <View style={{ flex: 1 }}>
          {HeroBanner}
          {MobileStatsStrip}
          {FieldFilterStrip}
          {SearchBar}
          {Grid}
        </View>

        {/* Sidebar — desktop only */}
        {Sidebar}
      </View>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function CoursesScreen() {
  return (
    <StudentMenuProvider>
      <CoursesContent />
    </StudentMenuProvider>
  );
}