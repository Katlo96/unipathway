import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
  type PressableStateCallbackType,
  Alert,
  useColorScheme,
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
type NotifType = 'info' | 'warning' | 'success';
type NotifFilter = 'all' | 'important' | 'deadlines';

type Notif = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  tag?: NotifFilter;
};

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
  successSoft: string;
  warningSoft: string;
  dangerSoft: string;
};

const INITIAL_DATA: Notif[] = [
  {
    id: '1',
    type: 'success',
    title: 'New course matches your points',
    body: 'Biology at University of Botswana looks suitable.',
    time: '2h ago',
    read: false,
    tag: 'important',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Deadline coming soon',
    body: 'Application for B.A Psychology closes in 3 days.',
    time: 'Yesterday',
    read: false,
    tag: 'deadlines',
  },
  {
    id: '3',
    type: 'info',
    title: 'Scholarship update',
    body: 'New scholarship added under International category.',
    time: '2 days ago',
    read: true,
    tag: 'important',
  },
];

const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const radii = {
  sm: spacing(3),
  md: spacing(4),
  lg: spacing(5),
  xl: spacing(6),
  pill: 999,
};

const typography = {
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  section: { fontSize: 16, lineHeight: 22, fontWeight: '800' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
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
    successSoft: light ? 'rgba(46,204,113,0.12)' : 'rgba(46,204,113,0.22)',
    warningSoft: light ? 'rgba(241,196,15,0.16)' : 'rgba(241,196,15,0.24)',
    dangerSoft: light ? 'rgba(192,57,43,0.10)' : 'rgba(192,57,43,0.18)',
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

export default function StudentNotificationsScreen() {
  return (
    <StudentMenuProvider>
      <StudentNotificationsContent />
    </StudentMenuProvider>
  );
}

function StudentNotificationsContent() {
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
      railWidth: isDesktop ? 340 : 0,
      titleSize: isDesktop ? 24 : isTablet ? 22 : 20,
    };
  }, [bp, width, height]);

  const [filter, setFilter] = useState<NotifFilter>('all');
  const [items, setItems] = useState<Notif[]>(INITIAL_DATA);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'important') return items.filter((n) => n.tag === 'important');
    return items.filter((n) => n.tag === 'deadlines');
  }, [items, filter]);

  const counts = useMemo(() => {
    const total = items.length;
    const unread = items.filter((n) => !n.read).length;
    const deadlines = items.filter((n) => n.tag === 'deadlines').length;
    const important = items.filter((n) => n.tag === 'important').length;
    const shown = filtered.length;
    return { total, unread, deadlines, important, shown };
  }, [items, filtered.length]);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearRead = useCallback(() => {
    const hasRead = items.some((n) => n.read);

    if (!hasRead) {
      Alert.alert('Nothing to clear', 'You have no read notifications to remove.');
      return;
    }

    setItems((prev) => prev.filter((n) => !n.read));
  }, [items]);

  const toggleRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
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
                  Notifications
                </Text>
                <Text style={[styles.topSubtitle, typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
                  Stay updated on deadlines, courses, scholarships, and system events
                </Text>
              </View>

              <HeaderIconButton
                icon="checkmark-done-outline"
                label="Mark all as read"
                colors={colors}
                onPress={markAllRead}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={ui.isDesktop}
              contentContainerStyle={{ paddingBottom: ui.padY }}
            >
              <View style={{ paddingHorizontal: ui.padX, marginTop: ui.gap }}>
                {!ui.isDesktop ? (
                  <View style={{ gap: spacing(3) }}>
                    <FilterRow filter={filter} setFilter={setFilter} colors={colors} />
                    <View style={styles.metaRow}>
                      <MetaPill icon="mail-unread-outline" text={`${counts.unread} unread`} colors={colors} />
                      <MetaPill icon="layers-outline" text={`${counts.total} total`} colors={colors} />
                      <MetaPill icon="eye-outline" text={`${counts.shown} shown`} colors={colors} />
                    </View>

                    <View style={styles.quickActionsRow}>
                      <ActionButton
                        icon="menu-outline"
                        label="Open menu"
                        tone="neutral"
                        colors={colors}
                        onPress={openMenu}
                      />
                      <ActionButton
                        icon="trash-outline"
                        label="Clear read"
                        tone="neutral"
                        colors={colors}
                        onPress={clearRead}
                      />
                      <ActionButton
                        icon="checkmark-circle-outline"
                        label="Mark all read"
                        tone="primary"
                        colors={colors}
                        onPress={markAllRead}
                      />
                    </View>
                  </View>
                ) : null}

                <View
                  style={[
                    { marginTop: ui.isDesktop ? spacing(2) : 0 },
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
                        <Text style={[typography.section, { color: colors.text }]}>Filters</Text>
                        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                          Focus on the updates that matter most.
                        </Text>

                        <View style={{ marginTop: spacing(4) }}>
                          <FilterRow filter={filter} setFilter={setFilter} colors={colors} vertical />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing(4) }]} />

                        <Text style={[typography.section, { color: colors.text }]}>Overview</Text>
                        <View style={{ marginTop: spacing(3), gap: spacing(2) }}>
                          <InfoRow icon="mail-unread-outline" label="Unread" value={`${counts.unread}`} colors={colors} />
                          <InfoRow icon="alert-circle-outline" label="Deadlines" value={`${counts.deadlines}`} colors={colors} />
                          <InfoRow icon="star-outline" label="Important" value={`${counts.important}`} colors={colors} />
                          <InfoRow icon="layers-outline" label="Total" value={`${counts.total}`} colors={colors} />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing(4) }]} />

                        <Text style={[typography.section, { color: colors.text }]}>Actions</Text>
                        <View style={{ marginTop: spacing(3), gap: spacing(2) }}>
                          <ActionButton
                            icon="menu-outline"
                            label="Open menu"
                            tone="neutral"
                            colors={colors}
                            onPress={openMenu}
                          />
                          <ActionButton
                            icon="checkmark-done-outline"
                            label="Mark all as read"
                            tone="primary"
                            colors={colors}
                            onPress={markAllRead}
                          />
                          <ActionButton
                            icon="trash-outline"
                            label="Clear read notifications"
                            tone="neutral"
                            colors={colors}
                            onPress={clearRead}
                          />
                        </View>
                      </SurfaceCard>
                    </View>
                  ) : null}

                  <View style={{ flex: 1, minWidth: 0 }}>
                    {ui.isDesktop ? (
                      <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(4) }}>
                        <View style={styles.mainHeader}>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={[typography.section, { color: colors.text }]} numberOfLines={1}>
                              {filter === 'all'
                                ? 'All notifications'
                                : filter === 'important'
                                  ? 'Important'
                                  : 'Deadlines'}
                            </Text>
                            <Text
                              style={[
                                typography.caption,
                                {
                                  color: colors.textMuted,
                                  marginTop: spacing(1),
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {counts.shown} shown • {counts.unread} unread
                            </Text>
                          </View>

                          <View style={styles.mainHeaderPills}>
                            <MetaPill icon="eye-outline" text={`${counts.shown} shown`} colors={colors} />
                            <MetaPill icon="mail-unread-outline" text={`${counts.unread} unread`} colors={colors} />
                          </View>
                        </View>
                      </SurfaceCard>
                    ) : null}

                    {filtered.length === 0 ? (
                      <SurfaceCard
                        colors={colors}
                        elevation={elevation}
                        style={{
                          paddingVertical: spacing(8),
                          paddingHorizontal: spacing(6),
                          marginTop: ui.isDesktop ? spacing(4) : spacing(3),
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons name="notifications-off-outline" size={24} color={colors.textSoft} />
                        <Text
                          style={[
                            typography.section,
                            {
                              color: colors.text,
                              marginTop: spacing(3),
                            },
                          ]}
                        >
                          No notifications here
                        </Text>
                        <Text
                          style={[
                            typography.caption,
                            {
                              color: colors.textMuted,
                              marginTop: spacing(2),
                              textAlign: 'center',
                            },
                          ]}
                        >
                          You&apos;re fully caught up in this category.
                        </Text>
                      </SurfaceCard>
                    ) : (
                      <View
                        style={{
                          marginTop: ui.isDesktop ? spacing(4) : spacing(3),
                          gap: spacing(3),
                        }}
                      >
                        {filtered.map((item) => (
                          <NotificationCard
                            key={item.id}
                            item={item}
                            colors={colors}
                            elevation={elevation}
                            onPress={() => toggleRead(item.id)}
                          />
                        ))}
                      </View>
                    )}

                    <View style={{ height: ui.isDesktop ? spacing(4) : spacing(2) }} />
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

function MetaPill({
  icon,
  text,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.metaPill,
        {
          backgroundColor: colors.cardAlt,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={colors.text} />
      <Text style={[styles.metaPillText, { color: colors.text }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  tone,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: 'primary' | 'neutral';
  onPress: () => void;
  colors: ThemeColors;
}) {
  const isPrimary = tone === 'primary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: isPrimary ? colors.primary : colors.surface,
          borderColor: isPrimary ? colors.primary : colors.border,
        },
        pressed ? styles.pressDown : null,
      ]}
    >
      <Ionicons name={icon} size={18} color={isPrimary ? colors.white : colors.text} />
      <Text
        style={[
          styles.actionButtonText,
          {
            color: isPrimary ? colors.white : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FilterRow({
  filter,
  setFilter,
  vertical,
  colors,
}: {
  filter: NotifFilter;
  setFilter: (value: NotifFilter) => void;
  vertical?: boolean;
  colors: ThemeColors;
}) {
  return (
    <View
      style={
        vertical
          ? {
              flexDirection: 'column',
              gap: spacing(2),
            }
          : {
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: spacing(2),
            }
      }
    >
      <FilterChip label="All" active={filter === 'all'} colors={colors} onPress={() => setFilter('all')} />
      <FilterChip
        label="Important"
        active={filter === 'important'}
        colors={colors}
        onPress={() => setFilter('important')}
      />
      <FilterChip
        label="Deadlines"
        active={filter === 'deadlines'}
        colors={colors}
        onPress={() => setFilter('deadlines')}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter ${label}`}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: active ? colors.primarySoft : colors.surface,
          borderColor: active ? colors.borderStrong : colors.border,
        },
        pressed ? styles.pressDown : null,
      ]}
    >
      <Text
        style={[
          styles.filterChipText,
          {
            color: colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InfoRow({
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
    <View style={styles.infoRow}>
      <View
        style={[
          styles.infoIcon,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={colors.text} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.infoLabel, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <Text style={[styles.infoValue, { color: colors.textMuted }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function NotificationCard({
  item,
  onPress,
  colors,
  elevation,
}: {
  item: Notif;
  onPress: () => void;
  colors: ThemeColors;
  elevation: ViewStyle;
}) {
  const iconName: keyof typeof Ionicons.glyphMap =
    item.type === 'success'
      ? 'checkmark-circle-outline'
      : item.type === 'warning'
        ? 'warning-outline'
        : 'information-circle-outline';

  const iconBackground =
    item.type === 'success'
      ? colors.successSoft
      : item.type === 'warning'
        ? colors.warningSoft
        : colors.primarySoft;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.read ? 'Read' : 'Unread'} notification: ${item.title}`}
      style={({ pressed }) => [
        styles.notificationCard,
        {
          backgroundColor: item.read ? colors.card : colors.cardAlt,
          borderColor: item.read ? colors.border : colors.borderStrong,
        },
        elevation,
        pressed ? styles.pressDown : null,
      ]}
    >
      <View
        style={[
          styles.notificationIcon,
          {
            backgroundColor: iconBackground,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={iconName} size={18} color={colors.text} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.notificationTopRow}>
          <Text
            style={[
              styles.notificationTitle,
              {
                color: colors.text,
                fontWeight: item.read ? '800' : '900',
              },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View style={styles.timeWrap}>
            {!item.read ? <View style={[styles.unreadDot, { backgroundColor: colors.text }]} /> : null}
            <Text style={[styles.notificationTime, { color: colors.textSoft }]} numberOfLines={1}>
              {item.time}
            </Text>
          </View>
        </View>

        <Text
          style={[
            typography.caption,
            {
              color: colors.textMuted,
              marginTop: spacing(2),
            },
          ]}
          numberOfLines={2}
        >
          {item.body}
        </Text>

        <View style={styles.notificationFooter}>
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: item.tag === 'deadlines' ? colors.warningSoft : colors.cardAlt,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.tagText, { color: colors.text }]}>{(item.tag ?? 'all').toUpperCase()}</Text>
          </View>

          <Text style={[styles.tapHint, { color: colors.textSoft }]} numberOfLines={1}>
            Tap to mark as {item.read ? 'unread' : 'read'}
          </Text>
        </View>
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

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  metaPill: {
    minHeight: 36,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  metaPillText: {
    fontSize: 12,
    fontWeight: '900',
  },

  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
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
    flexGrow: 1,
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  filterChip: {
    minHeight: 40,
    paddingHorizontal: spacing(4),
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12.5,
    fontWeight: '900',
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: '900',
  },

  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(4),
  },
  mainHeaderPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },

  notificationCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  notificationTitle: {
    flex: 1,
    fontSize: 13.5,
    letterSpacing: 0.1,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
  notificationTime: {
    fontSize: 12,
    fontWeight: '900',
  },
  notificationFooter: {
    marginTop: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  tagPill: {
    minHeight: 30,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '800',
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressDown: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
});