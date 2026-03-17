import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ────────────────────────────────────────────────
// Design System
// ────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (multiplier: number) => multiplier * BASE_SPACING;

const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  pill: 999,
};

const typography = {
  hero: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '800' as const },
  section: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.6 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  input: { fontSize: 16, lineHeight: 22, fontWeight: '800' as const, letterSpacing: 0.2 },
};

const lightTheme = {
  background: '#F8FAFC',
  backgroundAccent: '#EEF4FF',
  shell: '#FFFFFF',
  shellBorder: '#E2E8F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  surfaceAlt2: '#EAF2FF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  primarySoftText: '#1D4ED8',
  accent: '#10B981',
  accentSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  danger: '#EF4444',
  dangerSoft: '#FEE2E2',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  overlay: 'rgba(15, 23, 42, 0.52)',
  shadow: 'rgba(15, 23, 42, 0.10)',
  heroStart: '#2563EB',
  heroEnd: '#3B82F6',
  inputBg: '#FFFFFF',
};

const darkTheme = {
  background: '#020817',
  backgroundAccent: '#0B1223',
  shell: '#0B1220',
  shellBorder: '#1E293B',
  surface: '#0F172A',
  surfaceElevated: '#111C31',
  surfaceAlt: '#1E293B',
  surfaceAlt2: '#172554',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#60A5FA',
  primarySoft: '#1E3A8A',
  primarySoftText: '#BFDBFE',
  accent: '#34D399',
  accentSoft: '#064E3B',
  warning: '#FBBF24',
  warningSoft: '#78350F',
  danger: '#F87171',
  dangerSoft: '#7F1D1D',
  border: '#1E293B',
  borderStrong: '#334155',
  overlay: 'rgba(2, 6, 23, 0.72)',
  shadow: 'rgba(0, 0, 0, 0.35)',
  heroStart: '#1D4ED8',
  heroEnd: '#2563EB',
  inputBg: '#0F172A',
};

type Theme = typeof lightTheme;
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function getBreakpoint(width: number): Breakpoint {
  if (width < 480) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getShadow(theme: Theme, level: 'sm' | 'md' | 'lg'): ViewStyle {
  if (Platform.OS === 'web') {
    const shadowMap = {
      sm: `0px 8px 20px ${theme.shadow}`,
      md: `0px 16px 32px ${theme.shadow}`,
      lg: `0px 24px 56px ${theme.shadow}`,
    };

    return {
      boxShadow: shadowMap[level] as any,
    };
  }

  const elevationMap = { sm: 4, md: 8, lg: 14 };
  const opacityMap = { sm: 0.12, md: 0.16, lg: 0.22 };

  return {
    shadowColor: '#000000',
    shadowOpacity: opacityMap[level],
    shadowRadius: level === 'sm' ? 10 : level === 'md' ? 16 : 22,
    shadowOffset: { width: 0, height: level === 'sm' ? 4 : level === 'md' ? 8 : 12 },
    elevation: elevationMap[level],
  };
}

function normalize(input: string) {
  return input.replace(/\s/g, '').toUpperCase();
}

function formatCode(input: string) {
  const raw = normalize(input).replace(/[^A-Z0-9-]/g, '');
  const withoutDashes = raw.replace(/-/g, '');

  if (!withoutDashes) return '';

  const hasUP = withoutDashes.startsWith('UP');
  const head = hasUP ? 'UP' : withoutDashes.slice(0, 2);
  const tail = withoutDashes.slice(2).replace(/[^0-9]/g, '').slice(0, 6);

  if (!hasUP) return (head + tail).slice(0, 8);
  return tail.length > 0 ? `UP-${tail}` : 'UP';
}

function isValidCode(value: string) {
  const normalized = normalize(value);
  return /^UP-?\d{6}$/.test(normalized);
}

type ScalePressableProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'none';
  disabled?: boolean;
};

function ScalePressable({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  disabled,
}: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const [hovered, setHovered] = useState(false);

  const animateScale = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(scale, {
        toValue,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [scale]
  );

  const animateLift = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(lift, {
        toValue,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [lift]
  );

  useEffect(() => {
    animateLift(hovered ? -2 : 0, hovered ? 120 : 150);
  }, [animateLift, hovered]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPressIn={() => animateScale(0.96, 90)}
      onPressOut={() => animateScale(1, 140)}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={(state) => {
        if (typeof style === 'function') return style(state);
        return style;
      }}
    >
      {(state) => (
        <Animated.View style={{ transform: [{ scale }, { translateY: lift }] }}>
          {typeof children === 'function' ? (children as any)(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}

export default function ParentAddChildScreen() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const breakpoint = getBreakpoint(width);
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';

  const shellWidth = isDesktop ? clamp(Math.round(width * 0.88), 1120, 1260) : width;
  const shellHeight = isDesktop ? clamp(Math.round(height * 0.9), 720, 940) : height;
  const outerPadding = isDesktop ? spacing(7) : 0;
  const pageHorizontalPadding = isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(4);
  const sectionGap = isDesktop ? spacing(7) : spacing(5);
  const heroActionsStack = isMobile;

  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const canSubmit = useMemo(() => {
    if (busy) return false;
    return normalize(code).length > 0;
  }, [busy, code]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const onChangeCode = useCallback(
    (value: string) => {
      clearMessages();
      setCode(formatCode(value));
    },
    [clearMessages]
  );

  const linkChild = useCallback(async () => {
    setError(null);
    setSuccess(null);

    const normalizedCode = normalize(code);

    if (!normalizedCode) {
      setError('Please enter the link code.');
      inputRef.current?.focus();
      return;
    }

    if (!isValidCode(normalizedCode)) {
      setError('Invalid code format. Example: UP-483921');
      inputRef.current?.focus();
      return;
    }

    setBusy(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));

      if (normalizedCode.endsWith('000000')) {
        setError('This code has expired. Ask the student to generate a new one.');
        setBusy(false);
        return;
      }

      setSuccess('Child linked successfully. You can now view their dashboard.');
      setBusy(false);

      setTimeout(() => {
        router.back();
      }, 650);
    } catch {
      setBusy(false);
      setError('We could not link this child right now. Please try again.');
    }
  }, [code]);

  const pageIntro = (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: theme.heroStart,
          borderColor: theme.heroEnd,
        },
        getShadow(theme, 'lg'),
      ]}
    >
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />

      <View style={[styles.heroTopRow, !isDesktop && styles.heroTopRowStack]}>
        <View style={[styles.heroMainCopy, isDesktop ? { paddingRight: spacing(6) } : null]}>
          <View style={styles.headerRow}>
            <ScalePressable
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  borderColor: 'rgba(255,255,255,0.20)',
                  opacity: pressed ? 0.96 : 1,
                },
              ]}
            >
              <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            </ScalePressable>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[typography.hero, { color: '#FFFFFF' }]}>Add child</Text>
              <Text
                style={[
                  typography.body,
                  {
                    color: 'rgba(255,255,255,0.86)',
                    marginTop: spacing(1),
                  },
                ]}
              >
                Link your parent account using a student-generated UniPathway code.
              </Text>
            </View>
          </View>

          <Text
            style={[
              typography.bodyStrong,
              {
                color: 'rgba(255,255,255,0.84)',
                marginTop: spacing(5),
                maxWidth: isDesktop ? 560 : undefined,
              },
            ]}
          >
            Securely connect to your child’s academic workspace without sharing passwords or private account access.
          </Text>

          <View
            style={[
              styles.heroActionRow,
              {
                marginTop: spacing(5),
                flexDirection: heroActionsStack ? 'column' : 'row',
                alignItems: heroActionsStack ? 'stretch' : 'center',
              },
            ]}
          >
            <ScalePressable
              onPress={() => inputRef.current?.focus()}
              accessibilityLabel="Focus code field"
              style={({ pressed }) => [
                styles.primaryHeroButton,
                {
                  backgroundColor: '#FFFFFF',
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <Ionicons name="key-outline" size={18} color="#0F172A" />
              <Text style={[typography.label, { color: '#0F172A', marginLeft: spacing(2) }]}>Enter Code</Text>
            </ScalePressable>

            <ScalePressable
              onPress={() => router.back()}
              accessibilityLabel="Cancel linking child"
              style={({ pressed }) => [
                styles.secondaryHeroButton,
                {
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderColor: 'rgba(255,255,255,0.18)',
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <Ionicons name="close-outline" size={18} color="#FFFFFF" />
              <Text style={[typography.label, { color: '#FFFFFF', marginLeft: spacing(2) }]}>Cancel</Text>
            </ScalePressable>
          </View>
        </View>

        <View
          style={[
            styles.heroRightPane,
            {
              marginTop: isDesktop ? 0 : spacing(5),
              width: isDesktop ? 360 : '100%',
            },
          ]}
        >
          <View
            style={[
              styles.heroFeatureCard,
              {
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderColor: 'rgba(255,255,255,0.16)',
              },
            ]}
          >
            <View style={styles.heroFeatureIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.74)' }]}>Secure Linking</Text>
              <Text style={[typography.bodyStrong, { color: '#FFFFFF', marginTop: spacing(1) }]}>
                No password sharing required
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.heroFeatureGrid,
              {
                marginTop: spacing(4),
                gap: spacing(3),
              },
            ]}
          >
            {[
              { icon: 'time-outline' as const, label: 'Fast setup', value: 'Under 1 min' },
              { icon: 'people-outline' as const, label: 'Parent access', value: 'Instantly linked' },
              { icon: 'sparkles-outline' as const, label: 'Visibility', value: 'Progress & insights' },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  styles.heroStatCard,
                  {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.16)',
                  },
                ]}
              >
                <View style={styles.heroStatIcon}>
                  <Ionicons name={item.icon} size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[typography.caption, { color: 'rgba(255,255,255,0.72)' }]}>{item.label}</Text>
                  <Text style={[typography.cardTitle, { color: '#FFFFFF', marginTop: spacing(1) }]} numberOfLines={1}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  const howItWorksPanel = (
    <View
      style={[
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderBase}>
        <View
  style={[
    styles.panelHeaderIconWrap,
    {
      backgroundColor: theme.primarySoft,
    },
  ]}
>
          <Ionicons name="sparkles-outline" size={18} color={theme.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0, marginLeft: spacing(3) }}>
          <Text style={[typography.section, { color: theme.textPrimary }]}>How this works</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
            Clear, secure, and fast linking
          </Text>
        </View>
      </View>

      <Text style={[typography.body, { color: theme.textSecondary, marginTop: spacing(4) }]}>
        Ask the student to open <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Profile</Text> and tap{' '}
        <Text style={{ fontWeight: '700', color: theme.textPrimary }}>Generate Parent Link Code</Text>. Enter that code
        here to connect your account.
      </Text>

      <View style={{ marginTop: spacing(5), gap: spacing(3) }}>
        {[
          {
            icon: 'checkmark-circle-outline' as const,
            text: 'Fast, secure linking with no password sharing',
            toneBg: theme.accentSoft,
            toneColor: theme.accent,
          },
          {
            icon: 'time-outline' as const,
            text: 'Codes can expire automatically for added safety',
            toneBg: theme.warningSoft,
            toneColor: theme.warning,
          },
          {
            icon: 'shield-checkmark-outline' as const,
            text: 'You can unlink later from your account settings',
            toneBg: theme.primarySoft,
            toneColor: theme.primary,
          },
        ].map((item) => (
          <View
            key={item.text}
            style={[
              styles.tipRow,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.tipIconWrap, { backgroundColor: item.toneBg }]}>
              <Ionicons name={item.icon} size={17} color={item.toneColor} />
            </View>
            <Text style={[typography.bodyStrong, { color: theme.textPrimary, flex: 1 }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.noteBox,
          {
            backgroundColor: theme.surfaceAlt2,
            borderColor: theme.border,
            marginTop: spacing(5),
          },
        ]}
      >
        <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
        <Text style={[typography.body, { color: theme.textSecondary, flex: 1, marginLeft: spacing(3) }]}>
          If linking fails, ask the student to generate a fresh code and try again.
        </Text>
      </View>
    </View>
  );

  const codeFieldStatusTone = error
    ? { bg: theme.dangerSoft, border: theme.danger, text: theme.danger }
    : success
    ? { bg: theme.accentSoft, border: theme.accent, text: theme.accent }
    : focused
    ? { bg: theme.primarySoft, border: theme.primary, text: theme.primary }
    : { bg: theme.surfaceAlt, border: theme.borderStrong, text: theme.textMuted };

  const formPanel = (
    <View
      style={[
        styles.panelCard,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
        getShadow(theme, 'md'),
      ]}
    >
      <View style={styles.panelHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <View style={[styles.cardIconWrap, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="key-outline" size={18} color={theme.primary} />
          </View>

          <View style={{ flex: 1, minWidth: 0, marginLeft: spacing(3) }}>
            <Text style={[typography.section, { color: theme.textPrimary }]}>Link code</Text>
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing(1) }]}>
              Enter the code exactly as shown by the student
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: spacing(5) }}>
        <Text style={[typography.label, { color: theme.textPrimary, marginBottom: spacing(2) }]}>Code</Text>

        <View
          style={[
            styles.inputOuter,
            {
              backgroundColor: theme.inputBg,
              borderColor: codeFieldStatusTone.border,
            },
          ]}
        >
          <View style={[styles.inputLeadingIcon, { backgroundColor: codeFieldStatusTone.bg }]}>
            <Ionicons name="qr-code-outline" size={18} color={codeFieldStatusTone.text} />
          </View>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChangeCode}
            placeholder="UP-483921"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="done"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => {
              if (canSubmit) linkChild();
            }}
            editable={!busy}
            accessibilityLabel="Enter link code"
            style={[
              styles.input,
              {
                color: theme.textPrimary,
              },
              busy ? { opacity: 0.8 } : null,
            ]}
          />
        </View>

        <View style={[styles.helperRow, { marginTop: spacing(3) }]}>
          <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
          <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: spacing(2) }]}>
            Format: <Text style={{ fontWeight: '700', color: theme.textPrimary }}>UP-123456</Text>
          </Text>
        </View>

        {error ? (
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: theme.dangerSoft,
                borderColor: theme.danger,
                marginTop: spacing(4),
              },
            ]}
            accessibilityRole="alert"
          >
            <Ionicons name="alert-circle-outline" size={16} color={theme.danger} />
            <Text style={[typography.bodyStrong, { color: theme.danger, flex: 1, marginLeft: spacing(3) }]}>{error}</Text>
          </View>
        ) : null}

        {success ? (
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: theme.accentSoft,
                borderColor: theme.accent,
                marginTop: spacing(4),
              },
            ]}
            accessibilityRole="alert"
          >
            <Ionicons name="checkmark-circle-outline" size={16} color={theme.accent} />
            <Text style={[typography.bodyStrong, { color: theme.accent, flex: 1, marginLeft: spacing(3) }]}>
              {success}
            </Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.formSupportGrid,
          {
            marginTop: spacing(5),
            flexDirection: isMobile ? 'column' : 'row',
            gap: spacing(3),
          },
        ]}
      >
        <View
          style={[
            styles.supportTile,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[typography.caption, { color: theme.textMuted }]}>Expected prefix</Text>
          <Text style={[typography.cardTitle, { color: theme.textPrimary, marginTop: spacing(1) }]}>UP</Text>
        </View>

        <View
          style={[
            styles.supportTile,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[typography.caption, { color: theme.textMuted }]}>Digits required</Text>
          <Text style={[typography.cardTitle, { color: theme.textPrimary, marginTop: spacing(1) }]}>6 digits</Text>
        </View>
      </View>

      <View
        style={[
          styles.formActionRow,
          {
            marginTop: spacing(6),
            flexDirection: isMobile ? 'column' : 'row',
            gap: spacing(3),
          },
        ]}
      >
        <ScalePressable
          onPress={linkChild}
          disabled={!canSubmit}
          accessibilityLabel="Link child"
          accessibilityHint="Submits the entered parent link code"
          style={({ pressed }) => [
            styles.primaryActionButton,
            {
              backgroundColor: theme.primary,
              opacity: !canSubmit ? 0.55 : pressed ? 0.94 : 1,
            },
          ]}
        >
          {busy ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[typography.label, { color: '#FFFFFF', marginLeft: spacing(2) }]}>Linking…</Text>
            </>
          ) : (
            <>
              <Ionicons name="link-outline" size={18} color="#FFFFFF" />
              <Text style={[typography.label, { color: '#FFFFFF', marginLeft: spacing(2) }]}>Link child</Text>
            </>
          )}
        </ScalePressable>

        <ScalePressable
          onPress={() => router.back()}
          disabled={busy}
          accessibilityLabel="Cancel"
          style={({ pressed }) => [
            styles.secondaryActionButton,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.border,
              opacity: busy ? 0.6 : pressed ? 0.96 : 1,
            },
          ]}
        >
          <Text style={[typography.label, { color: theme.textPrimary }]}>Cancel</Text>
        </ScalePressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={[styles.desktopCanvas, { padding: outerPadding }]}>
        <View
          style={[
            styles.shell,
            {
              width: shellWidth,
              height: shellHeight,
              backgroundColor: isDesktop ? theme.shell : theme.background,
              borderColor: isDesktop ? theme.shellBorder : 'transparent',
              borderRadius: isDesktop ? radius.xxl : 0,
            },
            isDesktop ? getShadow(theme, 'lg') : null,
          ]}
        >
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={isDesktop}
                contentContainerStyle={{
                  paddingHorizontal: pageHorizontalPadding,
                  paddingTop: spacing(4),
                  paddingBottom: spacing(8),
                }}
              >
                {pageIntro}

                <View style={{ marginTop: sectionGap }}>
                  {isDesktop ? (
                    <View style={styles.desktopGrid}>
                      <View style={[styles.desktopSidebar, { marginRight: spacing(7) }]}>{howItWorksPanel}</View>
                      <View style={styles.desktopMain}>{formPanel}</View>
                    </View>
                  ) : (
                    <View style={{ gap: sectionGap }}>
                      {formPanel}
                      {howItWorksPanel}
                    </View>
                  )}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  desktopCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    overflow: 'hidden',
    width: '100%',
  },
  safe: {
    flex: 1,
  },

  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.xxl,
    borderWidth: 1,
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(6),
  },
  heroGlowOne: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowTwo: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  heroTopRowStack: {
    flexDirection: 'column',
  },
  heroMainCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroRightPane: {
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(4),
  },
  heroActionRow: {
    gap: spacing(3),
  },
  primaryHeroButton: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryHeroButton: {
    minHeight: 48,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFeatureCard: {
    minHeight: 80,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  heroFeatureGrid: {},
  heroStatCard: {
    minHeight: 78,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStatIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },

  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  desktopSidebar: {
    width: 390,
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },

  panelCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing(5),
  },
  panelHeaderBase: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelHeaderIconWrap: {
  width: 42,
  height: 42,
  borderRadius: radius.md,
  alignItems: 'center',
  justifyContent: 'center',
},
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipRow: {
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  noteBox: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  inputOuter: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLeadingIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing(3),
    ...typography.input,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageBox: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  formSupportGrid: {},
  supportTile: {
    flex: 1,
    minHeight: 82,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
    justifyContent: 'center',
  },
  formActionRow: {},
  primaryActionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButton: {
    minHeight: 52,
    minWidth: 130,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
});