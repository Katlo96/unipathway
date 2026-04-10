// app/signup.tsx
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

// Design System Constants (internal, consistent across app)
const BASE_SPACING = 4;
const spacing = (multiple: number) => multiple * BASE_SPACING; // 4,8,12,16,20,24,32,40,48,64

const typographyScale = {
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '900' as const }, // Desktop hero
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const }, // Mobile title
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radiusScale = {
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
  full: 9999, // For badges/pills
};

const elevationSystem = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});

// Breakpoints for responsive logic
const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxAppWidth = 1240;
const formMaxWidth = 480;



export default function Signup() {
  const { width, height } = useWindowDimensions(); // Include height for adaptive sizing
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
    success: '#388E3C',
    border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
    shadow: '#000000',
    accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
  }), [scheme]);

  const uiMode = useMemo(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isTablet = uiMode === 'tablet';
  const isDesktop = uiMode === 'desktop';

  // Responsive calculations
  const pagePadding = isMobile ? spacing(4) : spacing(6);
  const contentMaxWidth = isDesktop ? maxAppWidth : width;
  const formWidth = isDesktop ? formMaxWidth : isTablet ? Math.min(width * 0.8, 560) : '100%';
  const titleFont = isMobile ? { ...typographyScale.title } : typographyScale.hero;
  const heroSize = Math.min(width, height) * (isMobile ? 0.48 : isTablet ? 0.42 : 0.35); // Adaptive illustration size

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) return 'Valid email is required.';
    if (!password.trim() || password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSignup = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setIsSubmitting(false);
    router.replace('/login');
  };

  

  // Responsive Layout Branching
  const renderDesktopSidebar = () => (
    <View style={[styles.sidebar, { maxWidth: contentMaxWidth / 2.5, padding: spacing(6) }]}>
      <View style={styles.logoWrap}>
        <Image source={LOGO} style={{ width: spacing(12), height: spacing(12) }} resizeMode="contain" />
        <Text style={[typographyScale.hero, { color: colors.textPrimary, marginLeft: spacing(3) }]}>UniPathway</Text>
      </View>
      <Text style={[typographyScale.subtitle, { color: colors.textSecondary, marginVertical: spacing(4) }]}>
        Join a platform built for your educational journey.
      </Text>
      <View style={styles.benefitsList}>
        {[
          { icon: 'sparkles-outline', title: 'Personalized Access', desc: 'Role-based dashboards tailored to you.' },
          { icon: 'lock-closed-outline', title: 'Secure Signup', desc: 'Quick and safe account creation.' },
          { icon: 'people-outline', title: 'Community Ready', desc: 'Connect with students, parents, and educators.' },
        ].map((benefit, idx) => (
          <View key={idx} style={styles.benefitItem}>
            <Ionicons name={benefit.icon as any} size={24} color={colors.primary} />
            <View style={{ marginLeft: spacing(4), flex: 1 }}>
              <Text style={[typographyScale.body, { fontWeight: '700', color: colors.textPrimary }]}>{benefit.title}</Text>
              <Text style={[typographyScale.caption, { color: colors.textMuted }]}>{benefit.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderForm = () => (
    <View style={[styles.formContainer, { width: formWidth, ...elevationSystem }]}>
      <Text style={[titleFont, { color: colors.textPrimary, marginBottom: spacing(2) }]}>Sign Up</Text>
      <Text style={[typographyScale.subtitle, { color: colors.textSecondary, marginBottom: spacing(6) }]}>
        Create your account in minutes.
      </Text>
    
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginTop: spacing(3) }]}>
        <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
        <TextInput
          value={email}
          onChangeText={(text) => { setEmail(text); setError(null); }}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[typographyScale.body, { flex: 1, color: colors.textPrimary }]}
          accessibilityLabel="Email"
        />
      </View>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginTop: spacing(3) }]}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
        <TextInput
          value={password}
          onChangeText={(text) => { setPassword(text); setError(null); }}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          style={[typographyScale.body, { flex: 1, color: colors.textPrimary }]}
          accessibilityLabel="Password"
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={({ pressed }) => pressed && { opacity: 0.8 }}>
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginTop: spacing(3) }]}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={{ marginRight: spacing(2) }} />
        <TextInput
          value={confirmPassword}
          onChangeText={(text) => { setConfirmPassword(text); setError(null); }}
          placeholder="Confirm Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          style={[typographyScale.body, { flex: 1, color: colors.textPrimary }]}
          accessibilityLabel="Confirm Password"
        />
        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={({ pressed }) => pressed && { opacity: 0.8 }}>
          <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      </View>
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}20`, marginTop: spacing(3) }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={[typographyScale.caption, { color: colors.error, marginLeft: spacing(2), flex: 1 }]}>{error}</Text>
        </View>
      )}
      <Pressable
        onPress={handleSignup}
        disabled={isSubmitting}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.primary, marginTop: spacing(5) },
          pressed && { transform: [{ scale: 0.96 }], opacity: 0.95 },
          isSubmitting && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sign Up"
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={[typographyScale.body, { color: colors.primaryText, fontWeight: '700' }]}>Sign Up</Text>
        )}
      </Pressable>
      <View style={styles.backLink}>
        <Text style={[typographyScale.caption, { color: colors.textMuted }]}>Already have an account?</Text>
        <Pressable onPress={() => router.replace('/login')} style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <Text style={[typographyScale.caption, { color: colors.primary, fontWeight: '700', marginLeft: spacing(1) }]}>Login</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { padding: pagePadding }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.mainWrap,
                {
                  maxWidth: contentMaxWidth,
                  alignSelf: 'center',
                  flexDirection: isDesktop ? 'row' : 'column',
                  gap: spacing(6),
                  opacity: fadeAnim,
                  transform: [{ translateY: translateAnim }],
                },
              ]}
            >
              {isDesktop && renderDesktopSidebar()}
              {renderForm()}
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
  mainWrap: { width: '100%' },
  sidebar: { padding: spacing(6), borderRadius: radiusScale.xl, backgroundColor: 'transparent' },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  benefitsList: { gap: spacing(4) },
  benefitItem: { flexDirection: 'row', alignItems: 'center', padding: spacing(3), borderRadius: radiusScale.md, backgroundColor: 'rgba(255,255,255,0.05)' },
  formContainer: { padding: spacing(6), borderRadius: radiusScale.xl, backgroundColor: 'transparent' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderWidth: 1,
    borderRadius: radiusScale.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(3),
    borderRadius: radiusScale.md,
    borderWidth: 1,
    marginTop: spacing(3),
  },
  button: {
    padding: spacing(4),
    alignItems: 'center',
    borderRadius: radiusScale.md,
  },
  backLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing(4) },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(5),
  },
  modalContent: { width: '90%', maxWidth: 400, padding: spacing(5), borderRadius: radiusScale.xl, borderWidth: 1, gap: spacing(2) },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing(4),
    borderWidth: 1,
    borderRadius: radiusScale.md,
  },
});