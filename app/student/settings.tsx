import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  useWindowDimensions,
  Switch,
  Alert,
  type PressableStateCallbackType,
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
type SettingRoute =
  | 'profile'
  | 'notifications'
  | 'password'
  | 'terms'
  | 'privacy'
  | 'support'
  | 'faq'
  | 'logout'
  | 'delete';

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
  warningSoft: string;
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
    success: '#2F9E44',
    danger: '#C0392B',
    dangerSoft: light ? 'rgba(192,57,43,0.10)' : 'rgba(192,57,43,0.18)',
    warningSoft: light ? 'rgba(241,196,15,0.14)' : 'rgba(241,196,15,0.20)',
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

export default function StudentSettingsScreen() {
  return (
    <StudentMenuProvider>
      <StudentSettingsContent />
    </StudentMenuProvider>
  );
}

function StudentSettingsContent() {
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
      railWidth: isDesktop ? 320 : 0,
      titleSize: isDesktop ? 24 : isTablet ? 22 : 20,
      subtitleSize: isDesktop ? 14 : 13,
    };
  }, [bp, width, height]);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [activeRoute, setActiveRoute] = useState<SettingRoute>('profile');

  const onChangePassword = useCallback(() => {
    Alert.alert('Coming soon', 'Change password flow will be added next.');
  }, []);

  const openLegal = useCallback((type: 'terms' | 'privacy') => {
    Alert.alert(
      'Coming soon',
      type === 'terms'
        ? 'Terms & Conditions screen will be added next.'
        : 'Privacy Policy screen will be added next.'
    );
  }, []);

  const contactSupport = useCallback(() => {
    Alert.alert('Support', 'Support contact screen will be added next.');
  }, []);

  const openFaq = useCallback(() => {
    Alert.alert('FAQ', 'FAQ screen will be added next.');
  }, []);

  const logout = useCallback(() => {
    router.replace('/login');
  }, []);

  const deleteAccount = useCallback(() => {
    Alert.alert('Coming soon', 'Delete account flow will be added in a later phase.');
  }, []);

  const navigate = useCallback(
    (route: SettingRoute) => {
      setActiveRoute(route);

      if (route === 'profile') {
        router.push('/student/profile');
        return;
      }

      if (route === 'notifications') {
        router.push('/student/notifications');
        return;
      }

      if (route === 'password') {
        onChangePassword();
        return;
      }

      if (route === 'terms') {
        openLegal('terms');
        return;
      }

      if (route === 'privacy') {
        openLegal('privacy');
        return;
      }

      if (route === 'support') {
        contactSupport();
        return;
      }

      if (route === 'faq') {
        openFaq();
        return;
      }

      if (route === 'logout') {
        logout();
        return;
      }

      if (route === 'delete') {
        deleteAccount();
      }
    },
    [contactSupport, deleteAccount, logout, onChangePassword, openFaq, openLegal]
  );

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
                  Settings
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
                  Account, notifications, preferences, privacy, and support
                </Text>
              </View>

              <HeaderIconButton
                icon="person-outline"
                label="Open profile"
                colors={colors}
                onPress={() => router.push('/student/profile')}
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={ui.isDesktop}
              contentContainerStyle={{
                paddingBottom: ui.padY,
              }}
            >
              <View
                style={[
                  {
                    paddingHorizontal: ui.padX,
                    marginTop: ui.gap,
                  },
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
                      <Text style={[typography.section, { color: colors.text }]}>Navigation</Text>
                      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(2) }]}>
                        Manage your student account and quick access tools.
                      </Text>

                      <View style={{ marginTop: spacing(4), gap: spacing(2) }}>
                        <NavItem
                          icon="person-outline"
                          label="Profile"
                          active={activeRoute === 'profile'}
                          colors={colors}
                          onPress={() => navigate('profile')}
                        />
                        <NavItem
                          icon="notifications-outline"
                          label="Notifications"
                          active={activeRoute === 'notifications'}
                          colors={colors}
                          onPress={() => navigate('notifications')}
                        />
                        <NavItem
                          icon="key-outline"
                          label="Change password"
                          active={activeRoute === 'password'}
                          colors={colors}
                          onPress={() => navigate('password')}
                        />

                        <SectionDivider colors={colors} />

                        <NavItem
                          icon="document-text-outline"
                          label="Terms & Conditions"
                          active={activeRoute === 'terms'}
                          colors={colors}
                          onPress={() => navigate('terms')}
                        />
                        <NavItem
                          icon="shield-checkmark-outline"
                          label="Privacy Policy"
                          active={activeRoute === 'privacy'}
                          colors={colors}
                          onPress={() => navigate('privacy')}
                        />

                        <SectionDivider colors={colors} />

                        <NavItem
                          icon="help-circle-outline"
                          label="Contact support"
                          active={activeRoute === 'support'}
                          colors={colors}
                          onPress={() => navigate('support')}
                        />
                        <NavItem
                          icon="chatbubble-ellipses-outline"
                          label="FAQ"
                          active={activeRoute === 'faq'}
                          colors={colors}
                          onPress={() => navigate('faq')}
                        />

                        <SectionDivider colors={colors} />

                        <NavItem
                          icon="log-out-outline"
                          label="Log out"
                          colors={colors}
                          danger
                          onPress={() => navigate('logout')}
                        />
                        <NavItem
                          icon="trash-outline"
                          label="Delete account"
                          colors={colors}
                          dangerOutline
                          onPress={() => navigate('delete')}
                        />
                      </View>
                    </SurfaceCard>
                  </View>
                ) : null}

                <View style={{ flex: 1, minWidth: 0 }}>
                  <HeroPanel colors={colors} elevation={elevation} isMobile={ui.isMobile} />

                  <SectionBlock title="Account" colors={colors}>
                    <RowItem
                      icon="person-outline"
                      label="Profile"
                      value="Edit your personal information"
                      colors={colors}
                      onPress={() => router.push('/student/profile')}
                    />
                    <RowItem
                      icon="notifications-outline"
                      label="Notifications"
                      value="Manage alerts and reminders"
                      colors={colors}
                      onPress={() => router.push('/student/notifications')}
                    />
                    <RowItem
                      icon="key-outline"
                      label="Change password"
                      colors={colors}
                      onPress={onChangePassword}
                    />
                  </SectionBlock>

                  <SectionBlock title="Notifications" colors={colors}>
                    <ToggleItem
                      icon="mail-outline"
                      label="Email notifications"
                      description="Receive updates about applications, deadlines, and recommendations."
                      value={emailNotifs}
                      onValueChange={setEmailNotifs}
                      colors={colors}
                    />
                    <ToggleItem
                      icon="notifications-outline"
                      label="Push notifications"
                      description="Get important updates on your device in real time."
                      value={pushNotifs}
                      onValueChange={setPushNotifs}
                      colors={colors}
                    />
                    <ToggleItem
                      icon="alarm-outline"
                      label="Deadline reminders"
                      description="Stay ahead of closing application and scholarship windows."
                      value={deadlineReminders}
                      onValueChange={setDeadlineReminders}
                      colors={colors}
                    />
                    <ToggleItem
                      icon="megaphone-outline"
                      label="Marketing updates"
                      description="Optional feature announcements and platform news."
                      value={marketingNotifs}
                      onValueChange={setMarketingNotifs}
                      colors={colors}
                    />
                  </SectionBlock>

                  <SectionBlock title="Preferences" colors={colors}>
                    <ToggleItem
                      icon="grid-outline"
                      label="Compact layout"
                      description="Reduce spacing for a denser information view."
                      value={compactMode}
                      onValueChange={setCompactMode}
                      colors={colors}
                    />
                  </SectionBlock>

                  <SectionBlock title="Privacy & Legal" colors={colors}>
                    <RowItem
                      icon="document-text-outline"
                      label="Terms & Conditions"
                      colors={colors}
                      onPress={() => openLegal('terms')}
                    />
                    <RowItem
                      icon="shield-checkmark-outline"
                      label="Privacy Policy"
                      colors={colors}
                      onPress={() => openLegal('privacy')}
                    />
                  </SectionBlock>

                  <SectionBlock title="Support" colors={colors}>
                    <RowItem
                      icon="help-circle-outline"
                      label="Contact support"
                      colors={colors}
                      onPress={contactSupport}
                    />
                    <RowItem
                      icon="chatbubble-ellipses-outline"
                      label="FAQ"
                      colors={colors}
                      onPress={openFaq}
                    />
                  </SectionBlock>

                  <SectionBlock title="Danger zone" colors={colors}>
                    <Pressable
                      onPress={logout}
                      accessibilityRole="button"
                      accessibilityLabel="Log out"
                      style={({ pressed }) => [
                        styles.primaryDangerButton,
                        {
                          backgroundColor: colors.danger,
                          borderColor: colors.danger,
                        },
                        pressed ? styles.pressDown : null,
                      ]}
                    >
                      <Ionicons name="log-out-outline" size={18} color={colors.white} />
                      <Text style={[styles.primaryDangerButtonText, { color: colors.white }]}>LOG OUT</Text>
                    </Pressable>

                    <Pressable
                      onPress={deleteAccount}
                      accessibilityRole="button"
                      accessibilityLabel="Delete account"
                      style={({ pressed }) => [
                        styles.secondaryDangerButton,
                        {
                          borderColor: colors.danger,
                          backgroundColor: colors.dangerSoft,
                        },
                        pressed ? styles.pressDown : null,
                      ]}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      <Text style={[styles.secondaryDangerButtonText, { color: colors.danger }]}>
                        DELETE ACCOUNT
                      </Text>
                    </Pressable>
                  </SectionBlock>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

function HeroPanel({
  colors,
  elevation,
  isMobile,
}: {
  colors: ThemeColors;
  elevation: ViewStyle;
  isMobile: boolean;
}) {
  return (
    <SurfaceCard
      colors={colors}
      elevation={elevation}
      style={{
        padding: isMobile ? spacing(4) : spacing(5),
        backgroundColor: colors.cardAlt,
      }}
    >
      <View style={[styles.heroRow, isMobile ? styles.heroRowMobile : null]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.hero, { color: colors.text }]}>Student Settings</Text>
          <Text
            style={[
              typography.body,
              {
                color: colors.textMuted,
                marginTop: spacing(2),
              },
            ]}
          >
            Control your account experience, alerts, preferences, privacy, and support access from one place.
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
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.text} />
            <Text style={[typography.caption, { color: colors.text }]}>Secure</Text>
          </View>
        </View>
      </View>
    </SurfaceCard>
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

function SectionBlock({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  return (
    <View style={{ marginTop: spacing(5) }}>
      <Text style={[styles.sectionTitle, typography.caption, { color: colors.textSoft }]}>{title.toUpperCase()}</Text>
      <View
        style={[
          styles.sectionCard,
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

function NavItem({
  icon,
  label,
  onPress,
  active,
  colors,
  danger,
  dangerOutline,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  colors: ThemeColors;
  danger?: boolean;
  dangerOutline?: boolean;
}) {
  const iconBg = danger
    ? colors.dangerSoft
    : dangerOutline
    ? colors.cardAlt
    : active
    ? colors.primarySoft
    : colors.surfaceMuted;

  const textColor = danger || dangerOutline ? colors.danger : colors.text;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => {
        const state = getPressableState({ pressed } as PressableStateCallbackType);
        return [
          styles.navItem,
          {
            backgroundColor: active ? colors.cardAlt : colors.surface,
            borderColor: danger || dangerOutline ? colors.danger : active ? colors.borderStrong : colors.border,
          },
          state.hovered && Platform.OS === 'web' ? styles.hoverLift : null,
          pressed ? styles.pressDown : null,
        ];
      }}
    >
      <View
        style={[
          styles.navIconWrap,
          {
            backgroundColor: iconBg,
            borderColor: danger || dangerOutline ? colors.danger : colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={16} color={textColor} />
      </View>

      <Text style={[styles.navText, typography.label, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>

      <Ionicons name="chevron-forward" size={16} color={textColor} />
    </Pressable>
  );
}

function SectionDivider({ colors }: { colors: ThemeColors }) {
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

function RowItem({
  icon,
  label,
  value,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.rowItem,
        {
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        },
        pressed ? styles.pressFade : null,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        {value ? (
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
            {value}
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSoft} />
    </Pressable>
  );
}

function ToggleItem({
  icon,
  label,
  description,
  value,
  onValueChange,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: ThemeColors;
}) {
  return (
    <View
      style={[
        styles.rowItem,
        {
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          {
            backgroundColor: colors.primarySoft,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name={icon} size={18} color={colors.text} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.label, { color: colors.text }]} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[
            typography.caption,
            {
              color: colors.textMuted,
              marginTop: spacing(1),
            },
          ]}
          numberOfLines={3}
        >
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.borderStrong,
          true: 'rgba(87,175,194,0.50)',
        }}
        thumbColor={colors.white}
      />
    </View>
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
  sectionCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },

  navItem: {
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  navIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    flex: 1,
  },

  divider: {
    height: 1,
    marginVertical: spacing(1),
  },

  rowItem: {
    minHeight: 68,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryDangerButton: {
    marginTop: spacing(2),
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
  },
  primaryDangerButtonText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  secondaryDangerButton: {
    marginTop: spacing(3),
    minHeight: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing(2),
  },
  secondaryDangerButtonText: {
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
  pressFade: {
    opacity: 0.96,
  },
});