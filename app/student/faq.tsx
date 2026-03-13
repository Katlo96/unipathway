import React, { useMemo, useState } from 'react';
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
  textSoft: string;
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
  body: { fontSize: 14, lineHeight: 22, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
};

const faqItems = [
  {
    question: 'How does UniPathway help students?',
    answer:
      'UniPathway helps students explore courses, universities, scholarships, application pathways, and academic guidance in one platform.',
  },
  {
    question: 'Can I change my profile information later?',
    answer:
      'Yes. Your profile screen is designed to allow future updates to personal information and academic-related details.',
  },
  {
    question: 'Do I need to upload results to use recommendations?',
    answer:
      'Some advanced recommendation features may work best when academic results are entered or uploaded correctly.',
  },
  {
    question: 'Will my data stay private?',
    answer:
      'The platform is designed with privacy and secure handling of student information in mind, with more backend protections added as development continues.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Use the Contact Support section inside Settings to view phone numbers, email addresses, and social support channels.',
  },
  {
    question: 'Can I apply to multiple opportunities?',
    answer:
      'Yes. The system is structured to support multiple applications depending on the workflow and future backend rules.',
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
    textSoft: light ? 'rgba(11,15,18,0.55)' : 'rgba(234,242,248,0.58)',
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

export default function FaqScreen() {
  return (
    <StudentMenuProvider>
      <FaqContent />
    </StudentMenuProvider>
  );
}

function FaqContent() {
  const { width, height } = useWindowDimensions();
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => getColors(scheme), [scheme]);
  const elevation = useMemo(() => getElevation(scheme), [scheme]);
  const bp = useMemo(() => getBreakpoint(width), [width]);
  const { openMenu } = useStudentMenu();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
                <Text style={[styles.topTitle, typography.title, { color: colors.text }]}>FAQ</Text>
                <Text style={[styles.topSubtitle, typography.caption, { color: colors.textMuted }]}>
                  Frequently asked student questions
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
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.text} />
                  <Text style={[typography.caption, { color: colors.text }]}>Help Center</Text>
                </View>
                <Text style={[typography.hero, { color: colors.text, marginTop: spacing(4) }]}>
                  Frequently Asked Questions
                </Text>
                <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(2) }]}>
                  Browse the most common student questions about the UniPathway platform.
                </Text>
              </View>

              <View style={{ marginTop: ui.gap, gap: spacing(3) }}>
                {faqItems.map((item, index) => {
                  const expanded = openIndex === index;

                  return (
                    <Pressable
                      key={item.question}
                      onPress={() => setOpenIndex(expanded ? null : index)}
                      style={[
                        styles.faqCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        elevation,
                      ]}
                    >
                      <View style={styles.faqHeader}>
                        <View
                          style={[
                            styles.faqIcon,
                            {
                              backgroundColor: colors.primarySoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="help-circle-outline" size={18} color={colors.text} />
                        </View>

                        <Text style={[typography.section, { color: colors.text, flex: 1 }]}>{item.question}</Text>

                        <Ionicons
                          name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                          size={20}
                          color={colors.textSoft}
                        />
                      </View>

                      {expanded ? (
                        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(3) }]}>
                          {item.answer}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
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

  faqCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(4),
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  faqIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
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