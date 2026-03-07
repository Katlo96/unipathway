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
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
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
const formMaxWidth = 480;

export default function ResetPassword() {
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
    success: '#388E3C',
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

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!newPassword.trim()) return 'New password is required.';
    if (newPassword.length < 8) return 'Password must be at least 8 characters.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleReset = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));

    setIsSubmitting(false);

    // Success → back to login
    router.replace('/login');
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
                  <Text style={[typography.title, { color: colors.textPrimary }]}>Reset Password</Text>
                  <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: spacing(3) }]}>
                    Choose a strong new password for your account.
                  </Text>
                </View>
              )}

              <View style={[styles.formCard, { width: formWidth }]}>
                <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
                  Set New Password
                </Text>
                <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(6) }]}>
                  For <Text style={{ fontWeight: '700' }}>{email || 'your email'}</Text>
                </Text>

                <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
                  <TextInput
                    value={newPassword}
                    onChangeText={text => { setNewPassword(text); setError(null); }}
                    placeholder="New password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                    accessibilityLabel="New password"
                  />
                  <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                  </Pressable>
                </View>

                <View style={[styles.inputContainer, { borderColor: colors.border, marginTop: spacing(3) }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={text => { setConfirmPassword(text); setError(null); }}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                    accessibilityLabel="Confirm new password"
                  />
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                  </Pressable>
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
                  onPress={handleReset}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { transform: [{ scale: 0.96 }], opacity: 0.92 },
                    isSubmitting && { opacity: 0.6 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Reset password"
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.primaryText} />
                  ) : (
                    <Text style={[typography.body, { color: colors.primaryText, fontWeight: '700' }]}>
                      Reset Password
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => router.back()}
                  style={({ pressed }) => pressed && { opacity: 0.8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                >
                  <Text style={[typography.caption, { color: colors.primary, marginTop: spacing(5), textAlign: 'center' }]}>
                    Back
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
  sidebar: { padding: spacing(6), maxWidth: maxContentWidth / 2.5 },
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