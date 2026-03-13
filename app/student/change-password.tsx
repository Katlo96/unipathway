import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  TextInput,
  useWindowDimensions,
  useColorScheme,
  Alert,
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
  primary: string;
  primarySoft: string;
  text: string;
  textMuted: string;
  textSoft: string;
  border: string;
  borderStrong: string;
  success: string;
  danger: string;
  dangerSoft: string;
  white: string;
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
    success: '#2F9E44',
    danger: '#C0392B',
    dangerSoft: light ? 'rgba(192,57,43,0.10)' : 'rgba(192,57,43,0.18)',
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

export default function ChangePasswordScreen() {
  return (
    <StudentMenuProvider>
      <ChangePasswordContent />
    </StudentMenuProvider>
  );
}

function ChangePasswordContent() {
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
      shellHeight: isDesktop ? Math.min(920, Math.round(height * 0.9)) : height,
      shellRadius: isDesktop ? radii.xl : 0,
      shellPadding: isDesktop ? spacing(7) : 0,
      padX: isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4),
      padY: isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
      gap: isDesktop ? spacing(6) : isTablet ? spacing(5) : spacing(4),
      cardWidth: isDesktop ? 720 : '100%',
    };
  }, [bp, width, height]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSave = () => {
    if (!currentPassword.trim() || !nextPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Incomplete form', 'Please fill in all password fields.');
      return;
    }

    if (nextPassword.length < 8) {
      Alert.alert('Weak password', 'Your new password must be at least 8 characters long.');
      return;
    }

    if (nextPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure the new password fields match.');
      return;
    }

    Alert.alert('Success', 'Password change UI completed. Backend connection will be added later.');
  };

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
                <Text style={[styles.topTitle, typography.title, { color: colors.text }]}>Change Password</Text>
                <Text style={[styles.topSubtitle, typography.caption, { color: colors.textMuted }]}>
                  Update your account password securely
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
                <View style={styles.heroBadge}>
                  <Ionicons name="lock-closed-outline" size={16} color={colors.text} />
                  <Text style={[typography.caption, { color: colors.text }]}>Security</Text>
                </View>

                <Text style={[typography.hero, { color: colors.text, marginTop: spacing(4) }]}>Password Settings</Text>
                <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing(2) }]}>
                  Enter your current password and choose a strong new password. This screen is fully ready for backend
                  integration later.
                </Text>
              </View>

              <View
                style={[
                  styles.formCard,
                  {
                    width: ui.cardWidth as any,
                    alignSelf: 'center',
                    marginTop: ui.gap,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  elevation,
                ]}
              >
                <InputBlock
                  label="Current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrent}
                  icon={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                  onIconPress={() => setShowCurrent((prev) => !prev)}
                  colors={colors}
                />

                <InputBlock
                  label="New password"
                  value={nextPassword}
                  onChangeText={setNextPassword}
                  secureTextEntry={!showNext}
                  icon={showNext ? 'eye-off-outline' : 'eye-outline'}
                  onIconPress={() => setShowNext((prev) => !prev)}
                  colors={colors}
                />

                <InputBlock
                  label="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  icon={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  onIconPress={() => setShowConfirm((prev) => !prev)}
                  colors={colors}
                />

                <View
                  style={[
                    styles.tipCard,
                    {
                      backgroundColor: colors.primarySoft,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.text} />
                  <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>
                    Use at least 8 characters with a mix of letters, numbers, and symbols for a stronger password.
                  </Text>
                </View>

                <Pressable
                  onPress={onSave}
                  accessibilityRole="button"
                  accessibilityLabel="Save password"
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                    pressed ? styles.pressDown : null,
                  ]}
                >
                  <Ionicons name="save-outline" size={18} color={colors.white} />
                  <Text style={[styles.primaryButtonText, { color: colors.white }]}>SAVE PASSWORD</Text>
                </Pressable>
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

function InputBlock({
  label,
  value,
  onChangeText,
  secureTextEntry,
  icon,
  onIconPress,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onIconPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <View style={{ marginBottom: spacing(4) }}>
      <Text style={[typography.label, { color: colors.text, marginBottom: spacing(2) }]}>{label}</Text>

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderStrong,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={label}
          placeholderTextColor={colors.textSoft}
          style={[styles.input, { color: colors.text }]}
        />

        <Pressable onPress={onIconPress} style={styles.eyeButton} accessibilityRole="button">
          <Ionicons name={icon} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
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
  heroBadge: {
    alignSelf: 'flex-start',
    minHeight: 38,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    backgroundColor: 'rgba(87,175,194,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },

  formCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(5),
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing(4),
    paddingRight: spacing(2),
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipCard: {
    marginTop: spacing(2),
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing(3),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(2),
  },

  primaryButton: {
    marginTop: spacing(5),
    minHeight: 54,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
  },
  primaryButtonText: {
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