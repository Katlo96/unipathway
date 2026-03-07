import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  TextInput,
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
type University = {
  id: string;
  name: string;
  location: string;
  tagline: string;
  badge: string;
};

const UNIVERSITIES: University[] = [
  { id: '1', name: 'University of Botswana', location: 'Gaborone', tagline: 'Leading in Engineering', badge: 'UB' },
  { id: '2', name: 'Botho University', location: 'Gaborone', tagline: 'Pioneering Excellence', badge: 'BU' },
  { id: '3', name: 'BIUST', location: 'Palapye', tagline: 'Advancing Science & Technology', badge: 'BIUST' },
  { id: '4', name: 'Limkokwing University', location: 'Gaborone', tagline: 'Innovation & Creativity', badge: 'LUCT' },
];

export default function Universities() {
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

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return UNIVERSITIES;
    const q = search.toLowerCase();
    return UNIVERSITIES.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      u.tagline.toLowerCase().includes(q)
    );
  }, [search]);

  const handleViewUniversity = (id: string) => {
    router.push(`/student/university-details/${id}`);
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
              Universities
            </Text>

            <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
              Explore institutions across Botswana
            </Text>

            {/* Search */}
            <View style={[styles.searchContainer, { borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={20} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search universities..."
                placeholderTextColor={colors.textMuted}
                style={[typography.body, { flex: 1, color: colors.textPrimary, marginLeft: spacing(2) }]}
                accessibilityLabel="Search universities"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                </Pressable>
              )}
            </View>

            {/* Results */}
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={[typography.body, { color: colors.textPrimary, marginTop: spacing(4) }]}>
                  No universities found
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(2) }]}>
                  Try adjusting your search
                </Text>
              </View>
            ) : (
              <View style={[styles.grid, { gap: spacing(4), marginTop: spacing(6) }]}>
                {filtered.map(uni => (
                  <Pressable
                    key={uni.id}
                    onPress={() => handleViewUniversity(uni.id)}
                    style={({ pressed }) => [
                      styles.uniCard,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{uni.badge}</Text>
                    </View>

                    <Text style={[typography.body, { fontWeight: '700', color: colors.textPrimary, marginTop: spacing(3) }]}>
                      {uni.name}
                    </Text>

                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                      {uni.location}
                    </Text>

                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(1) }]}>
                      {uni.tagline}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3.5),
    borderWidth: 1,
    borderRadius: radii.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  uniCard: {
    flex: 1,
    minWidth: 280,
    padding: spacing(5),
    borderRadius: radii.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(10,17,26,0.12)',
    ...elevations,
  },
  badge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    backgroundColor: '#4A9FC620',
    alignSelf: 'flex-start',
  },
  badgeText: { color: '#4A9FC6', fontWeight: '700', fontSize: 12 },
  emptyState: {
    alignItems: 'center',
    padding: spacing(8),
    marginTop: spacing(8),
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});