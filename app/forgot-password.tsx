import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LOGO = require('../assets/images/splash-illustration.png');

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '900' as const },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radii = {
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
  full: 9999,               // or spacing(999) if you prefer scale-based
};

const elevations = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1240;
const formMaxWidth = 480;

export default function ForgotPassword() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() || 'light';

  const colors = useMemo(() => ({
    background: scheme === 'light' ? '#F8FCFD' : '#0A111A',
    surface: scheme === 'light' ? '#FFFFFF' : '#1A232E',
    surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#222B36',
    textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
    textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
    textMuted: scheme === 'light' ? '#7A919E' : '#7A919E',
    primary: '#4A9FC6',
    primaryDark: '#2E89B0',
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
  const formWidth = isDesktop ? formMaxWidth : '100%';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(translateAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const trimmed = email.trim();
    if (!trimmed) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(trimmed)) return 'Please enter a valid email.';
    return null;
  };

  const handleSendCode = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 900));

    setIsSubmitting(false);

    // Navigate to verify-code with email param
    router.push({ pathname: '/verify-code', params: { email: email.trim() } });
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
                  flexDirection: isDesktop ? 'row' : 'column',
                  gap: spacing(8),
                  opacity: fadeAnim,
                  transform: [{ translateY: translateAnim }],
                },
              ]}
            >
              {isDesktop && (
                <View style={styles.sidebar}>
                  <View style={styles.logoRow}>
                    <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                    <Text style={[typography.hero, { color: colors.textPrimary }]}>UniPathway</Text>
                  </View>
                  <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(4) }]}>
                    Reset your password securely in minutes.
                  </Text>
                  <View style={styles.steps}>
                    {[
                      { num: '1', title: 'Enter email', desc: 'We’ll send a verification code' },
                      { num: '2', title: 'Verify code', desc: 'Confirm ownership of your email' },
                      { num: '3', title: 'New password', desc: 'Choose a strong new password' },
                    ].map((step, i) => (
                      <View key={i} style={styles.step}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{step.num}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[typography.body, { fontWeight: '700', color: colors.textPrimary }]}>{step.title}</Text>
                          <Text style={[typography.caption, { color: colors.textMuted }]}>{step.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={[styles.formCard, { width: formWidth }]}>
                <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
                  Forgot Password
                </Text>
                <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(6) }]}>
                  Enter your email and we’ll send you a reset code.
                </Text>

                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
                  <TextInput
                    value={email}
                    onChangeText={text => { setEmail(text); setError(null); }}
                    placeholder="Your email address"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                    accessibilityLabel="Email address"
                    returnKeyType="done"
                    onSubmitEditing={handleSendCode}
                  />
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
                  onPress={handleSendCode}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { transform: [{ scale: 0.96 }], opacity: 0.92 },
                    isSubmitting && { opacity: 0.6 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Send reset code"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.primaryText} />
                  ) : (
                    <Text style={[typography.body, { color: colors.primaryText, fontWeight: '700' }]}>
                      Send Reset Code
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => pressed && { opacity: 0.8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Back to login"
                >
                  <Text style={[typography.caption, { color: colors.primary, marginTop: spacing(5), textAlign: 'center' }]}>
                    Back to Login
                  </Text>
                </Pressable>
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
  sidebar: { padding: spacing(6), borderRadius: radii.xl },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  logo: { width: 48, height: 48 },
  steps: { marginTop: spacing(6), gap: spacing(4) },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing(4) },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(74,159,198,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#4A9FC6', fontWeight: '700', fontSize: 14 },
  formCard: {
    padding: spacing(6),
    borderRadius: radii.xl,
    backgroundColor: 'transparent',
    ...elevations,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3.5),
    borderWidth: 1,
    borderRadius: radii.md,
    marginTop: spacing(2),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing(3),
  },
  primaryButton: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: spacing(6),
  },
});