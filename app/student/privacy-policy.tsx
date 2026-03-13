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
  xl: spacing(6),
  pill: 999,
};

const typography = {
  hero: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const },
  section: { fontSize: 16, lineHeight: 22, fontWeight: '800' as const },
  body: { fontSize: 14, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

const sections = [
  {
    title: 'Information We Collect',
    body:
      'UniPathway may collect information such as your name, contact details, school results, application preferences, uploaded files, and activity within the platform.',
  },
  {
    title: 'How Information Is Used',
    body:
      'Your information is used to provide platform functionality such as recommendations, application support, notifications, profile management, and overall service improvement.',
  },
  {
    title: 'Data Protection',
    body:
      'We aim to protect your information through secure access controls, responsible system design, and restricted use of your data for platform-related purposes only.',
  },
  {
    title: 'Sharing of Information',
    body:
      'Your information should only be shared when necessary for platform operations, institutional workflows, support services, or where required by applicable rules and policies.',
  },
  {
    title: 'Your Choices',
    body:
      'You may review and update some of your profile details and preferences through the platform settings. Additional data control features may be expanded over time.',
  },
  {
    title: 'Policy Updates',
    body:
      'This privacy policy may be updated as the system grows. Continued use of the platform indicates acceptance of any future revisions.',
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

export default function PrivacyPolicyScreen() {
  return (
    <StudentMenuProvider>
      <PrivacyPolicyContent />
    </StudentMenuProvider>
  );
}

function PrivacyPolicyContent() {
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
      shellWidth: isDesktop ? Math.min(MAX_DESKTOP_WIDTH, width - spacing(8) * 2) : width,
      shellHeight: isDesktop ? Math.min(920, Math.round(height * 0.9)) : height,
      shellRadius: isDesktop ? radii.xl : 0,
      shellPadding: isDesktop ? spacing(7) : 0,
      padX: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4),
      padY: isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
      gap: isDesktop ? spacing(5) : spacing(4),
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
                <Text style={[styles.topTitle, typography.title, { color: colors.text }]}>Privacy Policy</Text>
                <Text style={[styles.topSubtitle, typography.caption, { color: colors.textMuted }]}>
                  How your information is handled on the platform
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
                  <Ionicons name="shield-checkmark-outline" size={16} color={colors.text} />
                  <Text style={[typography.caption, { color: colors.text }]}>Privacy</Text>
                </View>
                <Text style={[typography.hero, { color: colors.text, marginTop: spacing(4) }]}>Your Data Matters</Text>
                <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(2) }]}>
                  This page outlines how UniPathway may collect, use, protect, and manage user information.
                </Text>
              </View>

              <View style={{ marginTop: ui.gap, gap: spacing(3) }}>
                {sections.map((section) => (
                  <View
                    key={section.title}
                    style={[
                      styles.sectionCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      elevation,
                    ]}
                  >
                    <Text style={[typography.section, { color: colors.text }]}>{section.title}</Text>
                    <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(2) }]}>
                      {section.body}
                    </Text>
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
  sectionCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(5),
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressDown: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
});