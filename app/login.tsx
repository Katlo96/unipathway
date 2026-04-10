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
  Modal,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LOGO = require('../assets/images/splash-illustration.png');

export default function Login() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const colors = useMemo(
    () => ({
      background: scheme === 'light' ? '#F8FCFD' : '#0A111A',
      surface: scheme === 'light' ? '#FFFFFF' : '#1A232E',
      surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#222B36',
      textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
      textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
      textMuted: scheme === 'light' ? '#7A919E' : '#7A919E',
      primary: '#4A9FC6',
      primaryText: '#FFFFFF',
      error: '#D32F2F',
      success: '#388E3C',
      border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
      shadow: '#000000',
      accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
    }),
    [scheme]
  );

  // Design System
  const BASE_UNIT = 4;
  const spacing = (n: number) => n * BASE_UNIT;

  const typography = {
    title: { fontSize: 32, lineHeight: 38, fontWeight: '900' as const },
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
  };

  const breakpoints = { mobileMax: 479, tabletMax: 1023 };
  const maxContentWidth = 1240;
  const formMaxWidth = 480;

  

  const uiMode = useMemo<'mobile' | 'tablet' | 'desktop'>(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isDesktop = uiMode === 'desktop';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fadeAnim, { toValue: 1, friction: 9, tension: 50, useNativeDriver: true }),
      Animated.spring(translateAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateForm = () => {
  
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Valid email is required.';
    if (!password.trim() || password.length < 8) return 'Password must be at least 8 characters.';
    return null;
  };

  const handleLogin = async () => {
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);

    // ────────────────────────────────────────────────
    // Changed: Parent now goes to dedicated parent dashboard
    // ────────────────────────────────────────────────
   router.push('/student/dashboard');
  };



  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { padding: spacing(isDesktop ? 10 : 5) }]}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.mainWrap,
                {
                  maxWidth: isDesktop ? maxContentWidth : '100%',
                  opacity: fadeAnim,
                  transform: [{ translateY: translateAnim }],
                  flexDirection: isDesktop ? 'row' : 'column',
                  gap: spacing(6),
                },
              ]}
            >
              {isDesktop && (
                <View style={[styles.sidePanel, { flex: 1, maxWidth: maxContentWidth / 2.2 }]}>
                  <View style={styles.logoWrap}>
                    <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                    <Text style={[typography.title, { color: colors.textPrimary }]}>UniPathway</Text>
                  </View>
                  <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
                    Empowering education journeys with tailored guidance and insights.
                  </Text>
                  <View style={styles.featureList}>
                    {[
                      { icon: 'sparkles', text: 'Intelligent course matching' },
                      { icon: 'shield-checkmark', text: 'Secure role-based access' },
                      { icon: 'trending-up', text: 'Real-time progress analytics' },
                    ].map((feat, idx) => (
                      <View key={idx} style={styles.feature}>
                        <Ionicons name={`${feat.icon}-outline` as any} size={20} color={colors.primary} />
                        <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing(3) }]}>
                          {feat.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={[styles.formPanel, { flex: 1, maxWidth: isDesktop ? formMaxWidth : '100%' }]}>
                <Text
                  style={[
                    typography.title,
                    { color: colors.textPrimary, marginBottom: spacing(2), textAlign: isMobile ? 'center' : 'left' },
                  ]}
                  accessible
                  accessibilityRole="header"
                >
                  Sign In
                </Text>
                <Text
                  style={[
                    typography.subtitle,
                    { color: colors.textSecondary, marginBottom: spacing(6), textAlign: isMobile ? 'center' : 'left' },
                  ]}
                >
                  Access your personalized dashboard.
                </Text>

              

                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginTop: spacing(3) },
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                    accessibilityLabel="Email input"
                  />
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    { borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginTop: spacing(3) },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.textMuted}
                    style={{ marginRight: spacing(2) }}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                    accessibilityLabel="Password input"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    style={({ pressed }) => pressed && { opacity: 0.8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </Pressable>
                </View>

                {/* Forgot Password link */}
                <View style={styles.forgotPasswordRow}>
                  <Pressable
                    onPress={() => router.push('/forgot-password')}
                    accessibilityRole="button"
                    accessibilityLabel="Forgot password"
                    hitSlop={12}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </Pressable>
                </View>

                {errorMessage && (
                  <View
                    style={[
                      styles.errorWrap,
                      { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}20`, marginTop: spacing(2) },
                    ]}
                  >
                    <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                    <Text style={[typography.caption, { color: colors.error, marginLeft: spacing(2) }]}>
                      {errorMessage}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.button,
                    { backgroundColor: colors.primary, marginTop: spacing(5) },
                    pressed && { transform: [{ scale: 0.96 }], opacity: 0.95 },
                    isSubmitting && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Login"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.primaryText} />
                  ) : (
                    <Text style={[typography.body, { color: colors.primaryText, fontWeight: '700' }]}>
                      Login
                    </Text>
                  )}
                </Pressable>

                <View style={[styles.footer, { marginTop: spacing(4) }]}>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>No account?</Text>
                  <Pressable onPress={() => router.push('/signup')} accessibilityLabel="Sign up">
                    <Text
                      style={[typography.caption, { color: colors.primary, fontWeight: '700', marginLeft: spacing(1) }]}
                    >
                      Sign Up
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
  flex: { flex: 1 },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  mainWrap: { width: '100%', alignSelf: 'center' },
  sidePanel: { padding: 24, borderRadius: 20, backgroundColor: 'transparent' },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  logo: { width: 48, height: 48 },
  featureList: { gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center' },
  formPanel: { padding: 24, borderRadius: 20, backgroundColor: 'transparent' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  button: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: { width: '90%', maxWidth: 400, padding: 20, borderRadius: 20, borderWidth: 1, gap: 8 },
  roleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
  },
  forgotPasswordText: {
    color: '#4A9FC6',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});