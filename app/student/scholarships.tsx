import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '900' as const },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radii = {
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
  pill: 9999,
};

const elevations = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1240;

// ── Mock Data ──────────────────────────────────────────────────────────────────
type Scholarship = {
  id: string;
  title: string;
  provider: string;
  category: 'Local' | 'International';
  deadline: string;
  status: 'You May Qualify' | 'Deadline soon';
  variant: 'good' | 'warning';
};

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: '1',
    title: 'ABC Academic Excellence Scholarship',
    provider: 'ABC Foundation',
    category: 'Local',
    deadline: 'May 10, 3 days left',
    status: 'You May Qualify',
    variant: 'good',
  },
  {
    id: '2',
    title: 'Community Service Award',
    provider: 'City Education Trust',
    category: 'International',
    deadline: 'April 28, 2 days left',
    status: 'Deadline soon',
    variant: 'warning',
  },
];

export default function Scholarships() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() || 'light';

  const colors = useMemo(() => ({
    background: scheme === 'light' ? '#F8FCFD' : '#0A111A',
    surface: scheme === 'light' ? '#FFFFFF' : '#1A232E',
    surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#222B36',
    textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
    textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
    textMuted: scheme === 'light' ? '#7A919E' : '#7A919E',
    primary: '#4A9FC6',
    primaryText: '#FFFFFF',
    error: '#D32F2F',
    border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
    accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
  }), [scheme]);

  const uiMode = useMemo(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isDesktop = uiMode === 'desktop';

  const pagePadding = isMobile ? spacing(5) : spacing(8);
  const maxWidth = isDesktop ? maxContentWidth : width;

  const [category, setCategory] = useState<'ALL' | 'Local' | 'International'>('ALL');

  const filtered = useMemo(() => {
    if (category === 'ALL') return SCHOLARSHIPS;
    return SCHOLARSHIPS.filter(s => s.category === category);
  }, [category]);

  const handleViewScholarship = (id: string) => {
    router.push(`/student/scholarship-details/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: pagePadding, paddingBottom: spacing(10) }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ maxWidth, alignSelf: 'center', width: '100%' }}>
            <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
              Scholarships
            </Text>

            <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
              Discover opportunities and stay on top of deadlines
            </Text>

            {/* Category Tabs */}
            <View style={[styles.tabRow, { gap: spacing(3), marginBottom: spacing(6) }]}>
              {(['ALL', 'Local', 'International'] as const).map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={({ pressed }) => [
                    styles.tabPill,
                    category === cat && styles.tabPillActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[typography.body, { color: category === cat ? colors.primaryText : colors.textPrimary }]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Results */}
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="ribbon-outline" size={48} color={colors.textMuted} />
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing(4) }]}>
                  No scholarships found
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(2) }]}>
                  Try another category
                </Text>
              </View>
            ) : (
              <View style={[styles.grid, { gap: spacing(4) }]}>
                {filtered.map(sch => (
                  <Pressable
                    key={sch.id}
                    onPress={() => handleViewScholarship(sch.id)}
                    style={({ pressed }) => [
                      styles.schCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={[typography.body, { fontWeight: '700', color: colors.textPrimary }]}>
                        {sch.title}
                      </Text>
                      <View style={[styles.badge, sch.variant === 'good' ? styles.badgeGood : styles.badgeWarning]}>
                        <Text style={styles.badgeText}>{sch.status}</Text>
                      </View>
                    </View>

                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                      {sch.provider}
                    </Text>

                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                      {sch.deadline}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tabPill: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(5),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(74,159,198,0.08)',
  },
  tabPillActive: { backgroundColor: '#4A9FC6' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  schCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing(5),
    borderRadius: radii.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(10,17,26,0.12)',
    ...elevations,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
  },
  badgeGood: { backgroundColor: '#388E3C20' },
  badgeWarning: { backgroundColor: '#FF980020' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    padding: spacing(8),
    marginTop: spacing(8),
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});