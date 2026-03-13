import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
  useColorScheme,
  type ViewStyle,
  type PressableStateCallbackType,
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
  primarySoft: string;
  text: string;
  textMuted: string;
  border: string;
};

const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;
const MIN_TAP = 44;
const MAX_DESKTOP_WIDTH = 1180;

const radii = {
  md: spacing(4),
  lg: spacing(5),
  xl: spacing(6),
  pill: 999,
};

const typography = {
  hero: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  section: { fontSize: 16, lineHeight: 22, fontWeight: '800' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

const supportItems = [
  {
    icon: 'call-outline' as const,
    title: 'Support phone',
    value: '+267 71 234 567',
    subtitle: 'Available during business hours',
  },
  {
    icon: 'mail-outline' as const,
    title: 'Support email',
    value: 'support@unipathway.com',
    subtitle: 'Best for detailed issues and document help',
  },
  {
    icon: 'logo-whatsapp' as const,
    title: 'WhatsApp support',
    value: '+267 75 000 111',
    subtitle: 'Quick help for simple student questions',
  },
  {
    icon: 'logo-instagram' as const,
    title: 'Instagram',
    value: '@unipathway',
    subtitle: 'Announcements, updates, and community posts',
  },
  {
    icon: 'logo-facebook' as const,
    title: 'Facebook',
    value: 'UniPathway',
    subtitle: 'Community engagement and public updates',
  },
  {
    icon: 'globe-outline' as const,
    title: 'Website',
    value: 'www.unipathway.com',
    subtitle: 'Official platform information and updates',
  },
];

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
    primarySoft: light ? 'rgba(87,175,194,0.14)' : 'rgba(87,175,194,0.22)',
    text: light ? '#0B0F12' : '#EAF2F8',
    textMuted: light ? 'rgba(11,15,18,0.72)' : 'rgba(234,242,248,0.78)',
    border: light ? 'rgba(11,15,18,0.08)' : 'rgba(234,242,248,0.12)',
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
    android: { elevation: scheme === 'light' ? 3 : 2 },
    web: {
      boxShadow:
        scheme === 'light'
          ? '0 10px 28px rgba(0,0,0,0.08)'
          : '0 10px 28px rgba(0,0,0,0.28)',
    } as any,
    default: {},
  }) as ViewStyle;
}

export default function ContactSupportScreen() {
  return (
    <StudentMenuProvider>
      <ContactSupportContent />
    </StudentMenuProvider>
  );
}

function ContactSupportContent() {
  const { width, height } = useWindowDimensions();
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => getColors(scheme), [scheme]);
  const elevation = useMemo(() => getElevation(scheme), [scheme]);
  const bp = useMemo(() => getBreakpoint(width), [width]);
  const { openMenu } = useStudentMenu();

  const ui = useMemo(() => {
    const isDesktop = bp === 'desktop';
    const isTablet = bp === 'tablet';

    return {
      isDesktop,
      isTablet,
      shellWidth: isDesktop ? Math.min(MAX_DESKTOP_WIDTH, width - spacing(8) * 2) : width,
      shellHeight: isDesktop ? Math.min(920, Math.round(height * 0.9)) : height,
      shellRadius: isDesktop ? radii.xl : 0,
      shellPadding: isDesktop ? spacing(7) : 0,
      padX: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4),
      padY: isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
      gap: isDesktop ? spacing(5) : spacing(4),
      gridColumns: isDesktop ? 2 : 1,
    };
  }, [bp, width, height]);

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
                <HeaderIconButton icon="menu-outline" label="Open menu" colors={colors} onPress={openMenu} />
                <HeaderIconButton
                  icon="chevron-back"
                  label="Go back"
                  colors={colors}
                  onPress={() => router.back()}
                />
              </View>

              <View style={styles.headerCenter}>
                <Text style={[styles.topTitle, typography.title, { color: colors.text }]}>Contact Support</Text>
                <Text style={[styles.topSubtitle, typography.caption, { color: colors.textMuted }]}>
                  Reach UniPathway through official support channels
                </Text>
              </View>

              <HeaderIconButton
                icon="settings-outline"
                label="Open settings"
                colors={colors}
                onPress={() => router.push('/student/settings')}
              />
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: ui.padX, paddingVertical: ui.padY }}>
              <View style={[styles.heroCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }, elevation]}>
                <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="help-buoy-outline" size={16} color={colors.text} />
                  <Text style={[typography.caption, { color: colors.text }]}>Support</Text>
                </View>
                <Text style={[typography.hero, { color: colors.text, marginTop: spacing(4) }]}>We’re Here to Help</Text>
                <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(2) }]}>
                  Choose the support channel that works best for you. Contact information below can later be connected
                  to live actions if needed.
                </Text>
              </View>

              <View
                style={[
                  {
                    marginTop: ui.gap,
                    gap: spacing(3),
                  },
                  ui.gridColumns === 2 ? styles.gridTwo : null,
                ]}
              >
                {supportItems.map((item) => (
                  <View
                    key={item.title}
                    style={[
                      styles.supportCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      elevation,
                    ]}
                  >
                    <View
                      style={[
                        styles.supportIcon,
                        {
                          backgroundColor: colors.primarySoft,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons name={item.icon} size={22} color={colors.text} />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[typography.section, { color: colors.text }]}>{item.title}</Text>
                      <Text style={[typography.label, { color: colors.text, marginTop: spacing(2) }]}>{item.value}</Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
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

const styles = StyleSheet.create({
  page: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  shell: { overflow: 'hidden' },
  shellDesktop: { borderWidth: 1 },
  safe: { flex: 1 },

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
  topTitle: { textAlign: 'center' },
  topSubtitle: { marginTop: spacing(1), textAlign: 'center' },

  headerIconButton: {
    width: MIN_TAP,
    height: MIN_TAP,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(5),
  },
  badge: {
    alignSelf: 'flex-start',
    minHeight: 38,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },

  gridTwo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  supportCard: {
    flex: 1,
    minWidth: 280,
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(4),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  supportIcon: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressDown: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
});