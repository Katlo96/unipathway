import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  type PressableStateCallbackType,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
  shadow: string;
};

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
  hero: { fontSize: 28, lineHeight: 34, fontWeight: '900' as const },
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
    shadow: '#000000',
  };
}

function getElevation(scheme: 'light' | 'dark'): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: scheme === 'light' ? '#000' : '#000',
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

export default function StudentProfileScreen() {
  const { width, height } = useWindowDimensions();
  const rawScheme = useColorScheme();
const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const colors = useMemo(() => getColors(scheme), [scheme]);
  const elevation = useMemo(() => getElevation(scheme), [scheme]);
  const bp = useMemo(() => getBreakpoint(width), [width]);

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
      railWidth: isDesktop ? 360 : 0,
      titleSize: isDesktop ? 24 : isTablet ? 22 : 20,
    };
  }, [bp, width, height]);

  const [name, setName] = useState('Katlo Monang');
  const [email] = useState('katlo@example.com');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('Botswana Accountancy College');
  const [yearForm, setYearForm] = useState('Form 5');
  const [saving, setSaving] = useState(false);

  const onSave = useCallback(() => {
    if (saving) return;

    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your name to continue.');
      return;
    }

    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      Alert.alert('Saved', 'Your profile changes have been saved.');
    }, 650);
  }, [name, saving]);

  const onConnectParent = useCallback(() => {
    Alert.alert('Coming soon', 'Connect parent or guardian flow will be added in a later phase.');
  }, []);

  const onChangeAvatar = useCallback(() => {
    Alert.alert('Coming soon', 'Profile photo upload will be added next.');
  }, []);

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'S';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return `${first}${last}`.toUpperCase();
  }, [name]);

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
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}
            >
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
                <HeaderIconButton
                  icon="chevron-back"
                  label="Go back"
                  colors={colors}
                  onPress={() => router.back()}
                />

                <View style={styles.headerCenter}>
                  <Text style={[styles.topTitle, typography.title, { color: colors.text, fontSize: ui.titleSize }]}>
                    Profile
                  </Text>
                  <Text style={[styles.topSubtitle, typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
                    Manage your personal details and student identity
                  </Text>
                </View>

                <HeaderSaveButton colors={colors} saving={saving} onPress={onSave} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={ui.isDesktop}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: ui.padY }}
              >
                <View style={{ paddingHorizontal: ui.padX, marginTop: ui.gap }}>
                  <View
                    style={
                      ui.isDesktop
                        ? {
                            flexDirection: 'row',
                            gap: ui.gap,
                            alignItems: 'flex-start',
                          }
                        : undefined
                    }
                  >
                    {ui.isDesktop ? (
                      <View style={{ width: ui.railWidth }}>
                        <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(5) }}>
                          <Text style={[typography.section, { color: colors.text }]}>Student</Text>
                          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                            This is your account summary and quick actions rail.
                          </Text>

                          <View style={{ marginTop: spacing(5) }}>
                            <View
                              style={[
                                styles.avatarCard,
                                {
                                  backgroundColor: colors.cardAlt,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <Pressable
                                onPress={onChangeAvatar}
                                accessibilityRole="button"
                                accessibilityLabel="Change profile photo"
                                style={({ pressed }) => {
                                  const state = getPressableState({ pressed } as PressableStateCallbackType);
                                  return [
                                    styles.avatarButton,
                                    {
                                      backgroundColor: colors.primarySoft,
                                      borderColor: colors.border,
                                    },
                                    state.hovered && Platform.OS === 'web' ? styles.hoverLift : null,
                                    pressed ? styles.pressDown : null,
                                  ];
                                }}
                              >
                                <View
                                  style={[
                                    styles.avatarCircle,
                                    {
                                      backgroundColor: colors.surface,
                                      borderColor: colors.border,
                                    },
                                  ]}
                                >
                                  <Text style={[styles.avatarInitials, { color: colors.text }]}>{initials}</Text>
                                </View>

                                <View style={{ flex: 1, minWidth: 0 }}>
                                  <Text style={[styles.avatarName, { color: colors.text }]} numberOfLines={1}>
                                    {name}
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
                                    {email}
                                  </Text>
                                </View>

                                <Ionicons name="camera-outline" size={18} color={colors.text} />
                              </Pressable>

                              <View style={styles.roleRow}>
                                <RoleChip
                                  icon="school-outline"
                                  label="STUDENT"
                                  colors={colors}
                                  filled
                                />
                                <RoleChip
                                  icon="shield-checkmark-outline"
                                  label="BASIC"
                                  colors={colors}
                                />
                              </View>
                            </View>
                          </View>

                          <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing(4) }]} />

                          <Text style={[typography.section, { color: colors.text }]}>Quick actions</Text>

                          <View style={{ marginTop: spacing(3), gap: spacing(2) }}>
                            <ActionButton
                              icon="link-outline"
                              label="Connect parent/guardian"
                              tone="neutral"
                              colors={colors}
                              onPress={onConnectParent}
                            />
                            <ActionButton
                              icon={saving ? 'time-outline' : 'save-outline'}
                              label={saving ? 'Saving…' : 'Save changes'}
                              tone="primary"
                              colors={colors}
                              onPress={onSave}
                              disabled={saving}
                            />
                          </View>

                          <Text
                            style={[
                              typography.caption,
                              {
                                color: colors.textSoft,
                                marginTop: spacing(4),
                              },
                            ]}
                          >
                            Tip: Keep your phone number updated so schools and guardians can reach you quickly.
                          </Text>
                        </SurfaceCard>
                      </View>
                    ) : null}

                    <View style={{ flex: 1, minWidth: 0 }}>
                      {!ui.isDesktop ? (
                        <SurfaceCard colors={colors} elevation={elevation} style={{ padding: spacing(4) }}>
                          <View style={styles.mobileSummaryTop}>
                            <Pressable
                              onPress={onChangeAvatar}
                              accessibilityRole="button"
                              accessibilityLabel="Change profile photo"
                              style={({ pressed }) => {
                                const state = getPressableState({ pressed } as PressableStateCallbackType);
                                return [
                                  styles.mobileAvatarButton,
                                  state.hovered && Platform.OS === 'web' ? styles.hoverLift : null,
                                  pressed ? styles.pressDown : null,
                                ];
                              }}
                            >
                              <View
                                style={[
                                  styles.mobileAvatarCircle,
                                  {
                                    backgroundColor: colors.primarySoft,
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <Text style={[styles.avatarInitials, { color: colors.text }]}>{initials}</Text>
                              </View>
                            </Pressable>

                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text style={[styles.summaryName, { color: colors.text }]} numberOfLines={1}>
                                {name}
                              </Text>
                              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(1) }]} numberOfLines={1}>
                                {email}
                              </Text>

                              <View style={styles.roleRow}>
                                <RoleChip
                                  icon="school-outline"
                                  label="STUDENT"
                                  colors={colors}
                                  filled
                                />
                                <RoleChip
                                  icon="shield-checkmark-outline"
                                  label="BASIC"
                                  colors={colors}
                                />
                              </View>
                            </View>

                            <HeaderSaveButton colors={colors} saving={saving} onPress={onSave} compact />
                          </View>

                          <View style={{ marginTop: spacing(4), gap: spacing(2) }}>
                            <ActionButton
                              icon="link-outline"
                              label="Connect parent/guardian"
                              tone="neutral"
                              colors={colors}
                              onPress={onConnectParent}
                            />
                            <ActionButton
                              icon={saving ? 'time-outline' : 'save-outline'}
                              label={saving ? 'Saving…' : 'Save changes'}
                              tone="primary"
                              colors={colors}
                              onPress={onSave}
                              disabled={saving}
                            />
                          </View>
                        </SurfaceCard>
                      ) : null}

                      <View style={{ marginTop: ui.isDesktop ? 0 : spacing(5) }}>
                        <Text style={[typography.section, { color: colors.text }]}>Personal details</Text>
                        <Text
                          style={[
                            typography.caption,
                            {
                              color: colors.textMuted,
                              marginTop: spacing(1),
                            },
                          ]}
                        >
                          Keep your information accurate for better recommendations and smoother onboarding.
                        </Text>
                      </View>

                      <View
                        style={
                          ui.isDesktop || ui.isTablet
                            ? {
                                flexDirection: 'row',
                                gap: ui.gap,
                                alignItems: 'flex-start',
                              }
                            : undefined
                        }
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <FieldCard
                            label="Name"
                            hint="Use your official full name"
                            colors={colors}
                          >
                            <StyledInput
                              value={name}
                              onChangeText={setName}
                              placeholder="Your name"
                              colors={colors}
                              autoCapitalize="words"
                              autoCorrect={false}
                              returnKeyType="next"
                            />
                          </FieldCard>

                          <FieldCard
                            label="Phone number"
                            hint="Optional but recommended"
                            colors={colors}
                          >
                            <StyledInput
                              value={phone}
                              onChangeText={setPhone}
                              placeholder="e.g. +267 7X XXX XXX"
                              colors={colors}
                              keyboardType="phone-pad"
                              returnKeyType="next"
                            />
                          </FieldCard>
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <FieldCard
                            label="School"
                            hint="Your current institution"
                            colors={colors}
                          >
                            <StyledInput
                              value={school}
                              onChangeText={setSchool}
                              placeholder="Your school"
                              colors={colors}
                              returnKeyType="next"
                            />
                          </FieldCard>

                          <FieldCard
                            label="Year / Form"
                            hint="Example: Form 5"
                            colors={colors}
                          >
                            <StyledInput
                              value={yearForm}
                              onChangeText={setYearForm}
                              placeholder="e.g. Form 5"
                              colors={colors}
                              returnKeyType="done"
                            />
                          </FieldCard>
                        </View>
                      </View>

                      <Pressable
                        onPress={onConnectParent}
                        accessibilityRole="button"
                        accessibilityLabel="Connect parent or guardian"
                        style={({ pressed }) => [
                          styles.linkRow,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                          pressed ? styles.pressDown : null,
                        ]}
                      >
                        <View
                          style={[
                            styles.linkIcon,
                            {
                              backgroundColor: colors.primarySoft,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Ionicons name="link-outline" size={18} color={colors.text} />
                        </View>

                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>
                            Connect parent/guardian
                          </Text>
                          <Text
                            style={[
                              typography.caption,
                              {
                                color: colors.textMuted,
                                marginTop: spacing(1),
                              },
                            ]}
                            numberOfLines={2}
                          >
                            Optional — improves support, visibility, and collaboration.
                          </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
                      </Pressable>

                      <View style={{ marginTop: spacing(5) }}>
                        <Pressable
                          onPress={onSave}
                          disabled={saving}
                          accessibilityRole="button"
                          accessibilityLabel={saving ? 'Saving changes' : 'Save changes'}
                          style={({ pressed }) => [
                            styles.primarySaveButton,
                            {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                            saving ? styles.disabled : null,
                            pressed && !saving ? styles.pressDown : null,
                          ]}
                        >
                          <Ionicons
                            name={saving ? 'time-outline' : 'checkmark-circle-outline'}
                            size={18}
                            color={colors.white}
                          />
                          <Text style={[styles.primarySaveButtonText, { color: colors.white }]}>
                            {saving ? 'SAVING…' : 'SAVE CHANGES'}
                          </Text>
                        </Pressable>

                        <Text
                          style={[
                            typography.caption,
                            {
                              color: colors.textSoft,
                              marginTop: spacing(3),
                              textAlign: 'center',
                            },
                          ]}
                        >
                          Your details help personalize course, scholarship, and university recommendations.
                        </Text>
                      </View>

                      <View style={{ height: spacing(4) }} />
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
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

function HeaderSaveButton({
  colors,
  saving,
  onPress,
  compact,
}: {
  colors: ThemeColors;
  saving: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={saving}
      accessibilityRole="button"
      accessibilityLabel={saving ? 'Saving' : 'Save changes'}
      style={({ pressed }) => [
        compact ? styles.miniSaveButton : styles.headerSaveButton,
        {
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        },
        saving ? styles.disabled : null,
        pressed && !saving ? styles.pressDown : null,
      ]}
    >
      <Ionicons name={saving ? 'time-outline' : 'checkmark-outline'} size={18} color={colors.text} />
    </Pressable>
  );
}

function RoleChip({
  icon,
  label,
  colors,
  filled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ThemeColors;
  filled?: boolean;
}) {
  return (
    <View
      style={[
        styles.roleChip,
        {
          backgroundColor: filled ? colors.primarySoft : colors.cardAlt,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={colors.text} />
      <Text style={[styles.roleChipText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  tone,
  onPress,
  disabled,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: 'primary' | 'neutral';
  onPress: () => void;
  disabled?: boolean;
  colors: ThemeColors;
}) {
  const isPrimary = tone === 'primary';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: isPrimary ? colors.primary : colors.surface,
          borderColor: isPrimary ? colors.primary : colors.border,
        },
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressDown : null,
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

function FieldCard({
  label,
  hint,
  children,
  colors,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  return (
    <View style={{ marginTop: spacing(4) }}>
      <View style={styles.fieldHeader}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
        {hint ? (
          <Text style={[styles.fieldHint, { color: colors.textSoft }]} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>

      <View
        style={[
          styles.fieldCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function StyledInput({
  colors,
  ...props
}: React.ComponentProps<typeof TextInput> & { colors: ThemeColors }) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textSoft}
      style={[
        styles.input,
        {
          color: colors.text,
        },
      ]}
    />
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
  headerSaveButton: {
    width: 54,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniSaveButton: {
    width: 46,
    height: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  surfaceCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
  },

  avatarCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing(4),
  },
  avatarButton: {
    minHeight: 72,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileAvatarCircle: {
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  avatarName: {
    fontSize: 14,
    fontWeight: '900',
  },

  roleRow: {
    marginTop: spacing(3),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  roleChip: {
    minHeight: 34,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  roleChipText: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  mobileSummaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  mobileAvatarButton: {
    borderRadius: radii.lg,
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '900',
  },

  divider: {
    height: 1,
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

  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  fieldHint: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  fieldCard: {
    marginTop: spacing(2),
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
  },
  input: {
    fontSize: 13.5,
    fontWeight: '800',
    paddingVertical: 6,
  },

  linkRow: {
    marginTop: spacing(5),
    minHeight: 58,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primarySaveButton: {
    minHeight: 54,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing(5),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
  },
  primarySaveButtonText: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  hoverLift: {
    transform: [{ translateY: -1 }],
  },
  pressDown: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.65,
  },
});