// applications.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  LayoutAnimation,
  Animated,
  type PressableStateCallbackType,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '900' as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  subtitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radii = {
  sm: spacing(1),
  md: spacing(2),
  lg: spacing(3),
  xl: spacing(4),
  pill: 9999,
};

const elevations = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 3 },
  web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMin: 480, tabletMax: 1023, desktopMin: 1024 };
const maxContentWidth = 1100;

// ── Types ──────────────────────────────────────────────────────────────────────
type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type AppStatus = 'Accepted' | 'Rejected' | 'Submitted' | 'Under review' | 'Draft';

interface ApplicationItem {
  id: string;
  university: string;
  program: string;
  date: string;
  status: AppStatus;
}

const DATA: ApplicationItem[] = [
  { id: '1', university: 'University of Botswana', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Accepted' },
  { id: '2', university: 'University of Botswana', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Rejected' },
  { id: '3', university: 'University of Botswana', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Submitted' },
  { id: '4', university: 'Botho University', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Under review' },
  { id: '5', university: 'BAC', program: 'Computer Science Program', date: '24 Apr 2026', status: 'Draft' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function getPressableStyle({ pressed }: PressableStateCallbackType) {
  return [
    pressed && { opacity: 0.92, transform: [{ scale: 0.96 }] },
    // Note: hovered is web-only and not in official types — we skip TS check for it
    // If you need strong typing, consider a custom Pressable type or separate web component
  ] as const;
}

// Safe color scheme handling
const statusColors = (scheme: 'light' | 'dark') => ({
  Accepted: { bg: scheme === 'light' ? '#E8F5E9' : '#1B5E20', text: scheme === 'light' ? '#2E7D32' : '#E8F5E9', accent: '#4CAF50' },
  Rejected: { bg: scheme === 'light' ? '#FFEBEE' : '#B71C1C', text: scheme === 'light' ? '#C62828' : '#FFEBEE', accent: '#F44336' },
  Submitted: { bg: scheme === 'light' ? '#E3F2FD' : '#1565C0', text: scheme === 'light' ? '#1565C0' : '#E3F2FD', accent: '#2196F3' },
  'Under review': { bg: scheme === 'light' ? '#FFF3E0' : '#EF6C00', text: scheme === 'light' ? '#EF6C00' : '#FFF3E0', accent: '#FF9800' },
  Draft: { bg: scheme === 'light' ? '#FAFAFA' : '#424242', text: scheme === 'light' ? '#616161' : '#FAFAFA', accent: '#9E9E9E' },
});

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ApplicationsScreen() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  // Fix: safely convert 'unspecified' → 'light' (common fallback)
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const colors = useMemo(() => ({
    background: scheme === 'light' ? '#FAFCFE' : '#121212',
    surface: scheme === 'light' ? '#FFFFFF' : '#1E1E1E',
    textPrimary: scheme === 'light' ? '#212121' : '#E0E0E0',
    textSecondary: scheme === 'light' ? '#757575' : '#BDBDBD',
    textMuted: scheme === 'light' ? '#9E9E9E' : '#757575',
    border: scheme === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
    primary: '#2196F3',
    accent: scheme === 'light' ? '#E3F2FD' : '#263238',
    status: statusColors(scheme),
  }), [scheme]);

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  const contentPaddingHorizontal = isMobile ? spacing(4) : isTablet ? spacing(6) : spacing(8);
  const contentMaxWidth = isDesktop ? maxContentWidth : width;
  const gridColumns = isMobile ? 1 : isTablet ? 2 : 3;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => DATA.find(item => item.id === selectedId) || null, [selectedId]);

  const statusCounts = useMemo(() => {
    return DATA.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<AppStatus, number>);
  }, []);

  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  React.useEffect(() => {
    if (selected) {
      Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [selected, fadeAnim]);

  const handleSelect = (id: string) => {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleViewDetails = (item: ApplicationItem) => {
    router.push({
      pathname: '/student/application-details',
      params: { id: item.id, university: item.university, program: item.program, date: item.date, status: item.status },
    });
  };

  const handleNewApplication = () => {
    Alert.alert('New Application', 'Start a new application process.');
  };

  const EmptyState = () => (
    <View style={[styles.emptyContainer, { padding: spacing(8) }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.accent, borderColor: colors.border }]}>
        <Ionicons name="document-text-outline" size={spacing(8)} color={colors.textPrimary} />
      </View>
      <Text style={[typography.title, { color: colors.textPrimary, marginTop: spacing(4) }]}>No Applications Yet</Text>
      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing(2) }]}>
        Get started by submitting your first application.
      </Text>
      <Pressable
        onPress={handleNewApplication}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.primary },
          ...getPressableStyle({ pressed }),
        ]}
        accessibilityRole="button"
        accessibilityLabel="Start New Application"
      >
        <Text style={[typography.label, { color: '#FFFFFF' }]}>Start Application</Text>
      </Pressable>
    </View>
  );

  const StatusChip = ({ status, count }: { status: AppStatus; count: number }) => {
    const { bg, text } = colors.status[status];
    return (
      <View style={[styles.chip, { backgroundColor: bg, borderColor: colors.border }]}>
        <Text style={[typography.caption, { color: text, fontWeight: '700' }]}>{status} ({count})</Text>
      </View>
    );
  };

  const ApplicationCard = ({ item }: { item: ApplicationItem }) => {
    const isSelected = item.id === selectedId;
    const { bg, text, accent } = colors.status[item.status];

    return (
      <Pressable
        onPress={() => (isDesktop ? handleSelect(item.id) : handleViewDetails(item))}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
          isSelected && { borderColor: accent },
          ...getPressableStyle({ pressed }),
          elevations,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.program} at ${item.university}`}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.subtitle, { color: colors.textPrimary }]} numberOfLines={1}>{item.university}</Text>
          <View style={[styles.statusBadge, { backgroundColor: bg }]}>
            <Text style={[typography.caption, { color: text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing(1) }]} numberOfLines={2}>
          {item.program}
        </Text>
        <View style={[styles.cardFooter, { marginTop: spacing(2) }]}>
          <Ionicons name="calendar-outline" size={spacing(4)} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing(1) }]}>{item.date}</Text>
        </View>
        {!isDesktop && (
          <Pressable
            onPress={() => handleViewDetails(item)}
            style={({ pressed }) => [
              styles.detailsButton,
              { backgroundColor: colors.accent },
              ...getPressableStyle({ pressed }),
            ]}
          >
            <Text style={[typography.label, { color: colors.primary }]}>Details</Text>
            <Ionicons name="chevron-forward" size={spacing(4)} color={colors.primary} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  const DetailsSidebar = () => {
    if (!selected) return null;
    const { accent } = colors.status[selected.status];
    return (
      <Animated.View style={[styles.sidebar, { opacity: fadeAnim, backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Application Details</Text>
        <View style={{ marginTop: spacing(4) }}>
          <Text style={[typography.subtitle, { color: colors.textPrimary }]}>{selected.university}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing(1) }]}>{selected.program}</Text>
          <View style={[styles.cardFooter, { marginTop: spacing(2) }]}>
            <Ionicons name="calendar-outline" size={spacing(4)} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing(1) }]}>{selected.date}</Text>
          </View>
          <View style={[styles.statusBadgeLarge, { backgroundColor: colors.status[selected.status].bg, marginTop: spacing(3) }]}>
            <Text style={[typography.label, { color: colors.status[selected.status].text }]}>{selected.status}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => handleViewDetails(selected)}
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.primary, marginTop: spacing(4) },
            ...getPressableStyle({ pressed }),
          ]}
        >
          <Text style={[typography.label, { color: '#FFFFFF' }]}>View Full Details</Text>
        </Pressable>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(4) }]}>
          Keep your documents updated for better chances.
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: contentPaddingHorizontal, paddingBottom: spacing(10) }}
          showsVerticalScrollIndicator={isDesktop}
        >
          <View style={[styles.content, { maxWidth: contentMaxWidth, alignSelf: 'center' }]}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButton, ...getPressableStyle({ pressed })]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={spacing(6)} color={colors.textPrimary} />
              </Pressable>
              <View style={styles.headerText}>
                <Text style={[typography.hero, { color: colors.textPrimary }]}>Applications</Text>
                <Text style={[typography.subtitle, { color: colors.textSecondary }]}>Track your progress</Text>
              </View>
              <Pressable
                onPress={handleNewApplication}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                  ...getPressableStyle({ pressed }),
                ]}
                accessibilityRole="button"
                accessibilityLabel="New Application"
              >
                <Ionicons name="add" size={spacing(5)} color="#FFFFFF" />
                <Text style={[typography.label, { color: '#FFFFFF', marginLeft: spacing(1) }]}>New</Text>
              </Pressable>
            </View>

            {/* Status Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
              {Object.entries(statusCounts).map(([status, count]) => (
                <StatusChip key={status} status={status as AppStatus} count={count} />
              ))}
            </ScrollView>

            {/* Main Content */}
            <View style={[styles.mainLayout, isDesktop && { flexDirection: 'row', gap: spacing(6) }]}>
              <View style={{ flex: 1 }}>
                {DATA.length === 0 ? (
                  <EmptyState />
                ) : (
                  <View style={{ flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: spacing(4) }}>
                    {DATA.map(item => (
                      <View key={item.id} style={{ flexBasis: `${100 / gridColumns}%` }}>
                        <ApplicationCard item={item} />
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {isDesktop && <DetailsSidebar />}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Styles (unchanged from your last working version) ───────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(4),
  },
  headerText: { flex: 1, marginLeft: spacing(4) },
  backButton: {
    padding: spacing(2),
    borderRadius: radii.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radii.lg,
  },
  chipsContainer: {
    flexDirection: 'row',
    marginBottom: spacing(4),
  },
  chip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
    borderWidth: 1,
    marginRight: spacing(2),
  },
  mainLayout: {},
  card: {
    padding: spacing(4),
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
  },
  statusBadgeLarge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing(3),
    padding: spacing(2),
    borderRadius: radii.md,
  },
  sidebar: {
    width: '100%',
    padding: spacing(4),
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyIcon: {
    width: spacing(16),
    height: spacing(16),
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});