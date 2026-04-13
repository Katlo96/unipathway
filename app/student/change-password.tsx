import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
  TextInput,
  Alert,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
} from '../../components/student/StudentMenu';

// ─────────────────────────────────────────────────────────────────────────────
// DashboardLayout & design tokens
// ─────────────────────────────────────────────────────────────────────────────
import DashboardLayout, {
  spacing,
  typography,
  radii,
  useTheme,
} from '../../components/student/DashboardLayout';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// ─────────────────────────────────────────────────────────────────────────────
// Elevation helper
// ─────────────────────────────────────────────────────────────────────────────
function useElevation(intensity: 'sm' | 'md' | 'lg' = 'md'): ViewStyle {
  return useMemo<ViewStyle>(() => {
    const opacity = 0.28;
    const radius = intensity === 'sm' ? 6 : intensity === 'md' ? 14 : 22;
    const offsetY = intensity === 'sm' ? 2 : intensity === 'md' ? 5 : 10;
    return (
      Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: offsetY },
          shadowOpacity: opacity,
          shadowRadius: radius,
        },
        android: {
          elevation: intensity === 'sm' ? 3 : intensity === 'md' ? 6 : 12,
        },
        web: {
          boxShadow: `0 ${offsetY}px ${radius * 1.5}px rgba(0,0,0,${opacity})`,
        },
        default: {},
      }) ?? {}
    );
  }, [intensity]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Password strength calculator
// ─────────────────────────────────────────────────────────────────────────────
type StrengthLevel = 'none' | 'weak' | 'fair' | 'strong' | 'excellent';

function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return 'none';
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'strong';
  return 'excellent';
}

function strengthMeta(level: StrengthLevel): { label: string; color: string; segments: number } {
  switch (level) {
    case 'weak':      return { label: 'Weak',      color: '#F87171', segments: 1 };
    case 'fair':      return { label: 'Fair',       color: '#FBBF24', segments: 2 };
    case 'strong':    return { label: 'Strong',     color: '#34D399', segments: 3 };
    case 'excellent': return { label: 'Excellent',  color: '#60A5FA', segments: 4 };
    default:          return { label: '',           color: 'transparent', segments: 0 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PasswordStrengthBar
// ─────────────────────────────────────────────────────────────────────────────
function PasswordStrengthBar({ password }: { password: string }) {
  const colors = useTheme();
  const level = getPasswordStrength(password);
  const meta = strengthMeta(level);

  if (level === 'none') return null;

  return (
    <View style={{ marginTop: spacing(2), gap: spacing(2) }}>
      <View style={{ flexDirection: 'row', gap: spacing(1) }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= meta.segments ? meta.color : colors.border,
            }}
          />
        ))}
      </View>
      <Text style={[typography.caption, { color: meta.color, fontWeight: '700' }]}>
        {meta.label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InputBlock — self-contained, uses useTheme()
// ─────────────────────────────────────────────────────────────────────────────
function InputBlock({
  label,
  value,
  onChangeText,
  secureTextEntry,
  showToggle,
  onToggle,
  placeholder,
  showStrength = false,
  matchValue,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry: boolean;
  showToggle: boolean;
  onToggle: () => void;
  placeholder?: string;
  showStrength?: boolean;
  matchValue?: string;
}) {
  const colors = useTheme();
  const elevation = useElevation('sm');

  const matchState: 'idle' | 'match' | 'mismatch' =
    matchValue === undefined
      ? 'idle'
      : !value
      ? 'idle'
      : value === matchValue
      ? 'match'
      : 'mismatch';

  const borderColor =
    matchState === 'match'
      ? colors.success
      : matchState === 'mismatch'
      ? colors.danger
      : colors.border;

  return (
    <View style={{ marginBottom: spacing(5) }}>
      <Text
        style={[
          typography.label,
          { color: colors.textPrimary, marginBottom: spacing(2) },
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 54,
            borderWidth: 1,
            borderRadius: radii.lg,
            borderColor,
            backgroundColor: colors.surfaceAlt,
            paddingLeft: spacing(4),
            paddingRight: spacing(2),
          },
          elevation,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder ?? label}
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            minHeight: 52,
            fontSize: 15,
            fontWeight: '500',
            color: colors.textPrimary,
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Match indicator */}
        {matchState !== 'idle' && (
          <Ionicons
            name={matchState === 'match' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={matchState === 'match' ? colors.success : colors.danger}
            style={{ marginRight: spacing(1) }}
          />
        )}

        {/* Eye toggle */}
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: radii.md,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons
            name={showToggle ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {/* Strength bar (new password field only) */}
      {showStrength && <PasswordStrengthBar password={value} />}

      {/* Match feedback text */}
      {matchState === 'mismatch' && (
        <Text
          style={[
            typography.caption,
            { color: colors.danger, marginTop: spacing(2) },
          ]}
        >
          Passwords do not match
        </Text>
      )}
      {matchState === 'match' && (
        <Text
          style={[
            typography.caption,
            { color: colors.success, marginTop: spacing(2) },
          ]}
        >
          Passwords match
        </Text>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Security tip row
// ─────────────────────────────────────────────────────────────────────────────
function SecurityTip({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const colors = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing(3),
      }}
    >
      <Ionicons name={icon} size={16} color={colors.primary} style={{ marginTop: 2 }} />
      <Text
        style={[
          typography.caption,
          { color: colors.textSecondary, flex: 1, lineHeight: 18 },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar panel (desktop)
// ─────────────────────────────────────────────────────────────────────────────
function SidebarPanel() {
  const colors = useTheme();
  const elevation = useElevation('md');

  return (
    <View style={{ width: 300, flexShrink: 0, gap: spacing(5) }}>
      {/* Security tips card */}
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
          elevation,
        ]}
      >
        <View style={{ height: 3, backgroundColor: colors.primary }} />
        <View style={{ padding: spacing(6), gap: spacing(4) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: radii.lg,
                backgroundColor: `${colors.primary}22`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
            </View>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>
              Security Tips
            </Text>
          </View>

          <View style={{ gap: spacing(4) }}>
            <SecurityTip
              icon="checkmark-circle-outline"
              text="Use at least 8 characters for a stronger password."
            />
            <SecurityTip
              icon="checkmark-circle-outline"
              text="Mix uppercase letters, numbers, and special symbols."
            />
            <SecurityTip
              icon="checkmark-circle-outline"
              text="Avoid using personal information like your name or birthday."
            />
            <SecurityTip
              icon="checkmark-circle-outline"
              text="Never reuse passwords across different accounts."
            />
          </View>
        </View>
      </View>

      {/* Password strength legend */}
      <View
        style={[
          {
            backgroundColor: colors.surface,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(6),
            gap: spacing(4),
          },
          elevation,
        ]}
      >
        <Text style={[typography.h2, { color: colors.textPrimary }]}>
          Strength Guide
        </Text>
        {(
          [
            { level: 'Weak',      color: '#F87171', desc: '< 8 chars, no variety' },
            { level: 'Fair',      color: '#FBBF24', desc: '8+ chars, some variety' },
            { level: 'Strong',    color: '#34D399', desc: '8+ chars, letters + numbers' },
            { level: 'Excellent', color: '#60A5FA', desc: '12+ chars, symbols included' },
          ] as const
        ).map(({ level, color, desc }) => (
          <View
            key={level}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: color,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[typography.label, { color: colors.textPrimary }]}>
                {level}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Settings shortcut */}
      <Pressable
        onPress={() => router.push('/student/settings')}
        style={({ pressed }) => ({
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: spacing(3),
          padding: spacing(4),
          backgroundColor: colors.surfaceAlt,
          borderRadius: radii.xl,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
        <Text style={[typography.label, { color: colors.textSecondary }]}>
          Back to Settings
        </Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main screen content
// ─────────────────────────────────────────────────────────────────────────────
function ChangePasswordContent() {
  const { width } = useWindowDimensions();
  const colors = useTheme();
  const elevation = useElevation('lg');

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);

  const isDesktop = breakpoint === 'desktop';
  const isMobile = breakpoint === 'mobile';

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = useCallback(() => {
    if (!currentPassword.trim() || !nextPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Incomplete form', 'Please fill in all password fields.');
      return;
    }
    if (nextPassword.length < 8) {
      Alert.alert('Weak password', 'Your new password must be at least 8 characters.');
      return;
    }
    if (nextPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'New password fields must match.');
      return;
    }
    Alert.alert(
      'Password Updated',
      'Your password has been changed successfully. Backend integration pending.',
    );
  }, [currentPassword, nextPassword, confirmPassword]);

  // ── Hero banner ────────────────────────────────────────────────────────────
  const HeroBanner = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          marginBottom: spacing(7),
        },
        elevation,
      ]}
    >
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      <View style={{ padding: isMobile ? spacing(5) : spacing(7) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: spacing(5),
            flexWrap: 'wrap',
          }}
        >
          <View style={{ flex: 1 }}>
            {/* Badge */}
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing(2),
                paddingHorizontal: spacing(3),
                paddingVertical: spacing(2),
                borderRadius: radii.pill,
                backgroundColor: `${colors.primary}22`,
                borderWidth: 1,
                borderColor: `${colors.primary}44`,
                marginBottom: spacing(4),
              }}
            >
              <Ionicons name="lock-closed-outline" size={13} color={colors.primary} />
              <Text
                style={[
                  typography.caption,
                  { color: colors.primary, fontWeight: '700' },
                ]}
              >
                SECURITY
              </Text>
            </View>

            <Text style={[typography.hero, { color: colors.textPrimary }]}>
              Password Settings
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: colors.textSecondary,
                  marginTop: spacing(2),
                  maxWidth: 480,
                  lineHeight: 24,
                },
              ]}
            >
              Enter your current password and choose a strong new one. The
              strength indicator will help guide your choice.
            </Text>
          </View>

          {/* Icon cluster — tablet/desktop */}
          {!isMobile && (
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: radii.xxl,
                backgroundColor: `${colors.primary}22`,
                borderWidth: 1,
                borderColor: `${colors.primary}44`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="lock-closed" size={32} color={colors.primary} />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  // ── Form card ──────────────────────────────────────────────────────────────
  const FormCard = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        elevation,
      ]}
    >
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      <View style={{ padding: isMobile ? spacing(5) : spacing(7) }}>
        {/* Current password */}
        <InputBlock
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrent}
          showToggle={showCurrent}
          onToggle={() => setShowCurrent((p) => !p)}
          placeholder="Enter your current password"
        />

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginBottom: spacing(5),
          }}
        />

        {/* New password */}
        <InputBlock
          label="New Password"
          value={nextPassword}
          onChangeText={setNextPassword}
          secureTextEntry={!showNext}
          showToggle={showNext}
          onToggle={() => setShowNext((p) => !p)}
          placeholder="Choose a strong new password"
          showStrength
        />

        {/* Confirm new password */}
        <InputBlock
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
          showToggle={showConfirm}
          onToggle={() => setShowConfirm((p) => !p)}
          placeholder="Re-enter your new password"
          matchValue={nextPassword}
        />

        {/* Security tip — inline (visible on all sizes, sidebar echoes it on desktop) */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: spacing(3),
            padding: spacing(4),
            backgroundColor: `${colors.primary}14`,
            borderRadius: radii.lg,
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            marginBottom: spacing(6),
          }}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={colors.primary}
            style={{ marginTop: 1 }}
          />
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, flex: 1, lineHeight: 18 },
            ]}
          >
            Use at least 8 characters with a mix of letters, numbers, and
            symbols for a stronger password.
          </Text>
        </View>

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save new password"
          style={({ pressed }) => ({
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            gap: spacing(2),
            minHeight: 54,
            borderRadius: radii.lg,
            backgroundColor: colors.primary,
            opacity: pressed ? 0.88 : 1,
            transform: pressed ? [{ scale: 0.98 }] : [],
          })}
        >
          <Ionicons name="save-outline" size={19} color="#fff" />
          <Text
            style={[
              typography.label,
              { color: '#fff', letterSpacing: 0.5, fontWeight: '900' },
            ]}
          >
            SAVE PASSWORD
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render — DashboardLayout owns: SafeAreaView, scroll, header, sidebar nav,
  // dark blue theme, and menu button.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Change Password"
      subtitle="Update your account password securely"
      showPointsCard={false}
    >
      {/* Back navigation + breadcrumb + settings shortcut */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing(3),
          marginBottom: spacing(6),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => ({
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: spacing(2),
            paddingHorizontal: spacing(4),
            paddingVertical: spacing(2),
            borderRadius: radii.lg,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="arrow-back" size={17} color={colors.primary} />
          <Text style={[typography.label, { color: colors.primary }]}>Back</Text>
        </Pressable>

        <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>
          Settings › Change Password
        </Text>

        <Pressable
          onPress={() => router.push('/student/settings')}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          style={({ pressed }) => ({
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            gap: spacing(2),
            paddingHorizontal: spacing(4),
            paddingVertical: spacing(2),
            borderRadius: radii.lg,
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
          <Text style={[typography.label, { color: colors.textSecondary }]}>Settings</Text>
        </Pressable>
      </View>

      {/* Desktop two-column; mobile/tablet stacked */}
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          gap: spacing(8),
          alignItems: 'flex-start',
        }}
      >
        {/* Main column — max-width centred on tablet */}
        <View
          style={{
            flex: 1,
            maxWidth: isDesktop ? undefined : 640,
            alignSelf: isDesktop ? undefined : 'center',
            width: isDesktop ? undefined : '100%',
          }}
        >
          {HeroBanner}
          {FormCard}
        </View>

        {/* Sidebar — desktop only */}
        {isDesktop && <SidebarPanel />}
      </View>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ChangePasswordScreen() {
  return (
    <StudentMenuProvider>
      <ChangePasswordContent />
    </StudentMenuProvider>
  );
}