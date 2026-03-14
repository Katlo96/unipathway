import React, { useMemo, useState, useCallback } from 'react';
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
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
  useStudentMenu,
} from '../../components/student/StudentMenu';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type ThemeColors = {
  appBg: string;
  surface: string;
  surfaceMuted: string;
  card: string;
  cardAlt: string;
  primary: string;
  primarySoft: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  borderStrong: string;
  white: string;
};

type Brigade = {
  id: string;
  name: string;
  location: string;
  tagline: string;
  badge: string;
};

const BRIGADES: Brigade[] = [
  { id: '1', name: 'Gaborone Brigade', location: 'Gaborone', tagline: 'Technical & Vocational Skills', badge: 'GB' },
  { id: '2', name: 'Francistown Brigade', location: 'Francistown', tagline: 'Hands-on Training Excellence', badge: 'FB' },
  { id: '3', name: 'Maun Brigade', location: 'Maun', tagline: 'Practical Education for the North', badge: 'MB' },
  // Add more as needed
];

const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  section: { fontSize: 16, lineHeight: 22, fontWeight: '800' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

const radii = {
  sm: spacing(3),
  md: spacing(4),
  lg: spacing(5),
  xl: spacing(6),
  pill: 999,
};

const MAX_DESKTOP_WIDTH = 1240;
const MIN_TAP = 44;

function getBreakpoint(width: number): Breakpoint {
  if (width < 480) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function getPressableState(state: PressableStateCallbackType) {
  const hovered = (state as any).hovered === true;
  return { pressed: state.pressed, hovered };
}

function getColors(scheme: 'light' | 'dark'): ThemeColors {
  const light = scheme === 'light';
  return {
    appBg: light ? '#F4F8FB' : '#081018',
    surface: light ? '#FFFFFF' : '#121C26',
    surfaceMuted: light ? '#EEF4F7' : '#182430',
    card: light ? '#FFFFFF' : '#16202B',
    cardAlt: light ? '#F7FBFD' : '#1A2632',
    primary: '#57AFC2',
    primarySoft: light ? 'rgba(87,175,194,0.14)' : 'rgba(87,175,194,0.22)',
    text: light ? '#0B0F12' : '#EAF2F8',
    textMuted: light ? 'rgba(11,15,18,0.72)' : 'rgba(234,242,248,0.78)',
    textSoft: light ? 'rgba(11,15,18,0.55)' : 'rgba(234,242,248,0.58)',
    border: light ? 'rgba(11,15,18,0.08)' : 'rgba(234,242,248,0.12)',
    borderStrong: light ? 'rgba(11,15,18,0.12)' : 'rgba(234,242,248,0.18)',
    white: '#FFFFFF',
  };
}

function getElevation(scheme: 'light' | 'dark'): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: scheme === 'light' ? 0.08 : 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: scheme === 'light' ? 3 : 2,
    },
    web: {
      boxShadow:
        scheme === 'light'
          ? '0 10px 28px rgba(0,0,0,0.08)'
          : '0 10px 28px rgba(0,0,0,0.28)',
    } as any,
    default: {},
  }) as ViewStyle;
}

export default function BrigadesScreen() {
  return (
    <StudentMenuProvider>
      <BrigadesContent />
    </StudentMenuProvider>
  );
}

function BrigadesContent() {
  const { width, height } = useWindowDimensions();
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => getColors(scheme), [scheme]);
  const elevation = useMemo(() => getElevation(scheme), [scheme]);
  const bp = useMemo(() => getBreakpoint(width), [width]);
  const { openMenu } = useStudentMenu();

  const ui = useMemo(() => {
    const isMobile = bp === 'mobile';
    const isTablet = bp === 'tablet';
    const isDesktop = bp === 'desktop';
    return {
      isMobile,
      isTablet,
      isDesktop,
      shellWidth: isDesktop ? Math.min(MAX_DESKTOP_WIDTH, width - spacing(8) * 2) : width,
      shellHeight: isDesktop ? Math.min(980, Math.round(height * 0.92)) : height,
      shellRadius: isDesktop ? radii.xl : 0,
      shellPadding: isDesktop ? spacing(7) : 0,
      padX: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4),
      padY: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(5),
      gap: isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
      railWidth: isDesktop ? 330 : 0,
      titleSize: isDesktop ? 24 : isTablet ? 22 : 20,
      subtitleSize: isDesktop ? 14 : 13,
      gridMin: isDesktop ? 280 : isTablet ? 260 : 100,
      searchHeight: 52,
    };
  }, [bp, width, height]);

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return BRIGADES;
    const q = search.toLowerCase();
    return BRIGADES.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.tagline.toLowerCase().includes(q)
    );
  }, [search]);

  const handleViewBrigade = useCallback((id: string) => {
    router.push(`/student/brigade-details`);
  }, []);

  return (
    <View style={[styles.page, { backgroundColor: colors.appBg }]}>
      <View style={[styles.center, { padding: ui.shellPadding }]}>
        <View
          style={[
            styles.shell,
            {
              width: ui.shellWidth,
              height: ui.shellHeight,
              borderRadius: ui.shellRadius,
              backgroundColor: colors.surfaceMuted,
            },
            ui.isDesktop
              ? [
                  styles.shellDesktop,
                  {
                    borderColor: colors.border,
                  },
                  elevation,
                ]
              : null,
          ]}
        >
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View
              style={[
                styles.topBar,
                {
                  paddingHorizontal: ui.padX,
                  borderBottomColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <View style={styles.topBarLeft}>
                <HeaderIconButton
                  icon="menu-outline"
                  label="Open menu"
                  colors={colors}
                  onPress={openMenu}
                />
                <HeaderIconButton
                  icon="chevron-back"
                  label="Go back"
                  colors={colors}
                  onPress={() => router.back()}
                />
              </View>
              <View style={styles.headerCenter}>
                <Text style={[styles.topTitle, typography.title, { color: colors.text, fontSize: ui.titleSize }]}>
                  Brigades
                </Text>
                <Text
                  style={[
                    styles.topSubtitle,
                    typography.caption,
                    {
                      color: colors.textMuted,
                      fontSize: ui.subtitleSize,
                    },
                  ]}
                  numberOfLines={1}
                >
                  Explore brigades across Botswana
                </Text>
              </View>
              <HeaderIconButton
                icon="search-outline"
                label="Search brigades"
                colors={colors}
                onPress={() => {}}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={ui.isDesktop}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: ui.padY }}
            >
              <View
                style={[
                  { paddingHorizontal: ui.padX, marginTop: ui.gap },
                  ui.isDesktop
                    ? {
                        flexDirection: 'row',
                        gap: ui.gap,
                        alignItems: 'flex-start',
                      }
                    : null,
                ]}
              >
                {ui.isDesktop ? (
                  <View style={{ width: ui.railWidth }}>
                    <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(5) }}>
                      <Text style={[typography.section, { color: colors.text }]}>Browse</Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                        Search brigades, open details, and move through the student portal from the menu.
                      </Text>
                      <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                        <MiniStatCard
                          icon="business-outline"
                          label="Institutions"
                          value={`${BRIGADES.length}`}
                          colors={colors}
                        />
                        <MiniStatCard
                          icon="search-outline"
                          label="Results"
                          value={`${filtered.length}`}
                          colors={colors}
                        />
                        <MiniStatCard
                          icon="location-outline"
                          label="Coverage"
                          value="Botswana"
                          colors={colors}
                        />
                      </View>
                      <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing(4) }]} />
                      <Text style={[typography.section, { color: colors.text }]}>Quick actions</Text>
                      <View style={{ marginTop: spacing(3), gap: spacing(2) }}>
                        <ActionButton
                          icon="menu-outline"
                          label="Open menu"
                          colors={colors}
                          onPress={openMenu}
                        />
                        <ActionButton
                          icon="refresh-outline"
                          label="Clear search"
                          colors={colors}
                          onPress={() => setSearch('')}
                        />
                      </View>
                      <Text style={[typography.caption, { color: colors.textSoft, marginTop: spacing(4) }]}>
                        Tip: Search by brigade name, city, or specialty to narrow results faster.
                      </Text>
                    </SurfaceCard>
                  </View>
                ) : null}

                <View style={{ flex: 1, minWidth: 0 }}>
                  <SurfaceCard
                    colors={colors}
                    elevation={elevation}
                    style={{
                      padding: ui.isMobile ? spacing(4) : spacing(5),
                      backgroundColor: colors.cardAlt,
                    }}
                  >
                    <View style={[styles.heroRow, ui.isMobile ? styles.heroRowMobile : null]}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[typography.hero, { color: colors.text }]}>Find the right brigade</Text>
                        <Text
                          style={[
                            typography.body,
                            {
                              color: colors.textMuted,
                              marginTop: spacing(2),
                            },
                          ]}
                        >
                          Explore brigades, compare options, and open detailed pages for a deeper look.
                        </Text>
                      </View>
                      <View style={styles.heroBadgeWrap}>
                        <View
                          style={[
                            styles.heroBadge,
                            {
                              backgroundColor: colors.primarySoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="construct-outline" size={16} color={colors.text} />
                          <Text style={[typography.caption, { color: colors.text }]}>
                            {filtered.length} result{filtered.length === 1 ? '' : 's'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </SurfaceCard>

                  <View style={{ marginTop: spacing(5) }}>
                    <Text style={[styles.sectionTitle, typography.caption, { color: colors.textSoft }]}>
                      SEARCH
                    </Text>
                    <View
                      style={[
                        styles.searchContainer,
                        {
                          minHeight: ui.searchHeight,
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        elevation,
                      ]}
                    >
                      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
                      <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search brigades..."
                        placeholderTextColor={colors.textSoft}
                        style={[styles.searchInput, typography.body, { color: colors.text }]}
                        accessibilityLabel="Search brigades"
                      />
                      {search.length > 0 ? (
                        <Pressable
                          onPress={() => setSearch('')}
                          accessibilityRole="button"
                          accessibilityLabel="Clear search"
                          style={({ pressed }) => [styles.clearButton, pressed ? styles.pressDown : null]}
                        >
                          <Ionicons name="close-circle-outline" size={20} color={colors.textMuted} />
                        </Pressable>
                      ) : null}
                    </View>
                  </View>

                  <View style={{ marginTop: spacing(5) }}>
                    <Text style={[styles.sectionTitle, typography.caption, { color: colors.textSoft }]}>
                      BRIGADES
                    </Text>
                    {filtered.length === 0 ? (
                      <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(8) }}>
                        <View style={styles.emptyState}>
                          <View
                            style={[
                              styles.emptyIconWrap,
                              {
                                backgroundColor: colors.primarySoft,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons name="search-outline" size={28} color={colors.text} />
                          </View>
                          <Text style={[typography.section, { color: colors.text, marginTop: spacing(4) }]}>
                            No brigades found
                          </Text>
                          <Text
                            style={[
                              typography.body,
                              {
                                color: colors.textMuted,
                                marginTop: spacing(2),
                                textAlign: 'center',
                              },
                            ]}
                          >
                            Try a different brigade name, location, or keyword.
                          </Text>
                          <Pressable
                            onPress={() => setSearch('')}
                            accessibilityRole="button"
                            accessibilityLabel="Reset search"
                            style={({ pressed }) => [
                              styles.resetButton,
                              {
                                backgroundColor: colors.primary,
                                borderColor: colors.primary,
                              },
                              pressed ? styles.pressDown : null,
                            ]}
                          >
                            <Ionicons name="refresh-outline" size={18} color={colors.white} />
                            <Text style={[styles.resetButtonText, { color: colors.white }]}>RESET SEARCH</Text>
                          </Pressable>
                        </View>
                      </SurfaceCard>
                    ) : (
                      <View
                        style={[
                          styles.grid,
                          {
                            gap: spacing(4),
                          },
                        ]}
                      >
                        {filtered.map((brigade) => (
                          <BrigadeCard
                            key={brigade.id}
                            brigade={brigade}
                            colors={colors}
                            elevation={elevation}
                            minWidth={ui.gridMin}
                            onPress={() => handleViewBrigade(brigade.id)}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Reused components (identical pattern)
// ────────────────────────────────────────────────────────────────────────────────

function SurfaceCard({
  children,
  colors,
  elevation,
  style,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  elevation: ViewStyle;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.surfaceCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevation,
        style,
      ]}
    >
      {children}
    </View>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => {
        const state = getPressableState({ pressed } as PressableStateCallbackType);
        return [
          styles.headerIconButton,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
          state.hovered && Platform.OS === 'web' ? styles.hoverLift : null,
          pressed ? styles.pressDown : null,
        ];
      }}
    >
      <Ionicons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function MiniStatCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.miniStatCard,
        {
          backgroundColor: colors.cardAlt,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.miniStatIcon,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={colors.text} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.caption, { color: colors.textSoft }]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[typography.label, { color: colors.text, marginTop: spacing(1) }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        pressed ? styles.pressDown : null,
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={[styles.actionButtonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function BrigadeCard({
  brigade,
  colors,
  elevation,
  minWidth,
  onPress,
}: {
  brigade: Brigade;
  colors: ThemeColors;
  elevation: ViewStyle;
  minWidth: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${brigade.name}`}
      style={({ pressed }) => [
        styles.uniCard,
        {
          minWidth,
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        elevation,
        pressed ? styles.pressDown : null,
      ]}
    >
      <View style={styles.uniCardTop}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.primary }]}>{brigade.badge}</Text>
        </View>
        <View
          style={[
            styles.chevronWrap,
            {
              backgroundColor: colors.cardAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textSoft} />
        </View>
      </View>
      <Text style={[styles.uniName, { color: colors.text, marginTop: spacing(4) }]} numberOfLines={2}>
        {brigade.name}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
          {brigade.location}
        </Text>
      </View>
      <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(3) }]} numberOfLines={2}>
        {brigade.tagline}
      </Text>
      <View
        style={[
          styles.cardFooter,
          {
            borderTopColor: colors.border,
          },
        ]}
      >
        <Text style={[typography.label, { color: colors.primary }]}>View details</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    overflow: 'hidden',
  },
  shellDesktop: {
    borderWidth: 1,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    minHeight: 72,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  topTitle: {
    textAlign: 'center',
  },
  topSubtitle: {
    marginTop: spacing(1),
    textAlign: 'center',
  },
  headerIconButton: {
    width: MIN_TAP,
    height: MIN_TAP,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surfaceCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing(4),
  },
  heroRowMobile: {
    flexDirection: 'column',
  },
  heroBadgeWrap: {
    alignItems: 'flex-end',
  },
  heroBadge: {
    minHeight: 40,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  sectionTitle: {
    marginBottom: spacing(2),
    letterSpacing: 0.4,
  },
  searchContainer: {
    borderWidth: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing(2),
    paddingVertical: spacing(3),
  },
  clearButton: {
    marginLeft: spacing(2),
  },
  divider: {
    height: 1,
  },
  miniStatCard: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  miniStatIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    minHeight: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing(2),
  },
  uniCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(5),
  },
  uniCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  badge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uniName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
  },
  metaRow: {
    marginTop: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
  },
  cardFooter: {
    marginTop: spacing(4),
    paddingTop: spacing(3),
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconWrap: {
    width: 68,
    height: 68,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    marginTop: spacing(5),
    minHeight: 50,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressDown: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
});