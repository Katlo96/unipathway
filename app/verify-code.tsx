import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radii = {
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
};

const elevations = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1240;
const DIGITS = 6; // modern standard is 6 digits

export default function VerifyCode() {
  const { width } = useWindowDimensions();
  const { email = '' } = useLocalSearchParams<{ email: string }>();
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
    error: '#D32F2F',
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
  const boxSize = isMobile ? 54 : 60;

  const [code, setCode] = useState<string[]>(Array(DIGITS).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(translateAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const codeValue = code.join('');

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    if (digit && index < DIGITS - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validate = () => {
    if (codeValue.length !== DIGITS) return `Please enter the ${DIGITS}-digit code.`;
    return null;
  };

  const handleVerify = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate verification delay
    await new Promise(r => setTimeout(r, 900));

    setIsSubmitting(false);

    // Navigate to reset-password with email
    router.push({ pathname: '/reset-password', params: { email } });
  };

  const handleResend = async () => {
    setError(null);
    await new Promise(r => setTimeout(r, 600));
    setCode(Array(DIGITS).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { padding: pagePadding }]}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.main,
                {
                  maxWidth: isDesktop ? maxContentWidth : '100%',
                  opacity: fadeAnim,
                  transform: [{ translateY: translateAnim }],
                },
              ]}
            >
              {isDesktop && (
                <View style={styles.sidebar}>
                  <Text style={[typography.title, { color: colors.textPrimary }]}>Verify Your Email</Text>
                  <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(3) }]}>
                    Enter the code sent to <Text style={{ fontWeight: '700' }}>{email || 'your email'}</Text>
                  </Text>
                </View>
              )}

              <View style={[styles.formCard, { ...elevations }]}>
                <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
                  Enter Verification Code
                </Text>
                <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(6) }]}>
                  We sent a {DIGITS}-digit code to <Text style={{ fontWeight: '700' }}>{email || 'your email'}</Text>
                </Text>

                <View style={styles.codeContainer}>
                  {code.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { inputRefs.current[index] = ref; }}
                      value={digit}
                      onChangeText={val => handleDigitChange(index, val)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                      keyboardType="number-pad"
                      maxLength={1}
                      style={[
                        styles.codeInput,
                        { width: boxSize, height: boxSize },
                        digit && styles.codeInputFilled,
                      ]}
                      placeholder="•"
                      placeholderTextColor={colors.textMuted}
                      selectionColor={colors.primary}
                      accessibilityLabel={`Digit ${index + 1}`}
                    />
                  ))}
                </View>

                {error && (
                  <View style={[styles.errorBox, { borderColor: `${colors.error}30` }]}>
                    <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                    <Text style={[typography.caption, { color: colors.error, marginLeft: spacing(2), flex: 1 }]}>
                      {error}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleVerify}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { transform: [{ scale: 0.96 }], opacity: 0.92 },
                    isSubmitting && { opacity: 0.6 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Verify code"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.primaryText} />
                  ) : (
                    <Text style={[typography.body, { color: colors.primaryText, fontWeight: '700' }]}>
                      Verify Code
                    </Text>
                  )}
                </Pressable>

                <View style={styles.resendRow}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    Didn't receive the code?
                  </Text>
                  <Pressable onPress={handleResend} accessibilityRole="button" accessibilityLabel="Resend code">
                    <Text style={[typography.caption, { color: colors.primary, fontWeight: '700', marginLeft: spacing(1) }]}>
                      Resend
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  main: { width: '100%', alignSelf: 'center' },
  sidebar: { padding: spacing(6), maxWidth: maxContentWidth / 2.5 },
  formCard: {
    padding: spacing(6),
    borderRadius: radii.xl,
    backgroundColor: 'transparent',
    ...elevations,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(3),
    marginVertical: spacing(6),
  },
  codeInput: {
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(74,159,198,0.08)',
    borderRadius: radii.md,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#4A9FC6',
  },
  codeInputFilled: {
    borderColor: '#4A9FC6',
    backgroundColor: 'rgba(74,159,198,0.12)',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing(2),
  },
  primaryButton: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing(6),
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing(5),
  },
});