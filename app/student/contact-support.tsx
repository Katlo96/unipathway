import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  Platform,
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

type SupportItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  subtitle: string;
  color: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const SUPPORT_ITEMS: SupportItem[] = [
  {
    icon: 'call-outline',
    title: 'Support Phone',
    value: '+267 71 234 567',
    subtitle: 'Available Monday – Friday, 8 AM – 5 PM',
    color: '#60A5FA',
  },
  {
    icon: 'mail-outline',
    title: 'Support Email',
    value: 'support@unipathway.com',
    subtitle: 'Best for detailed issues and document help',
    color: '#34D399',
  },
  {
    icon: 'logo-whatsapp',
    title: 'WhatsApp Support',
    value: '+267 75 000 111',
    subtitle: 'Quick help for simple student questions',
    color: '#4ADE80',
  },
  {
    icon: 'logo-instagram',
    title: 'Instagram',
    value: '@unipathway',
    subtitle: 'Announcements, updates, and community posts',
    color: '#F472B6',
  },
  {
    icon: 'logo-facebook',
    title: 'Facebook',
    value: 'UniPathway',
    subtitle: 'Community engagement and public updates',
    color: '#818CF8',
  },
  {
    icon: 'globe-outline',
    title: 'Website',
    value: 'www.unipathway.com',
    subtitle: 'Official platform information and updates',
    color: '#FBBF24',
  },
];

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
// Support card component
// ─────────────────────────────────────────────────────────────────────────────
function SupportCard({ item }: { item: SupportItem }) {
  const colors = useTheme();
  const elevation = useElevation('md');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}: ${item.value}`}
      style={({ pressed }) => ([
        {
          flex: 1,
          minWidth: 280,
          backgroundColor: colors.card,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(5),
          flexDirection: 'row' as const,
          alignItems: 'flex-start' as const,
          gap: spacing(4),
          opacity: pressed ? 0.88 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
        },
        elevation,
      ])}
    >
      {/* Icon */}
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radii.xl,
          backgroundColor: `${item.color}1A`,
          borderWidth: 1,
          borderColor: `${item.color}33`,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>

      {/* Text */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={[typography.caption, { color: colors.textSecondary, letterSpacing: 0.4 }]}
        >
          {item.title.toUpperCase()}
        </Text>
        <Text
          style={[
            typography.bodyStrong,
            { color: item.color, marginTop: spacing(1), flexShrink: 1 },
          ]}
          numberOfLines={1}
        >
          {item.value}
        </Text>
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginTop: spacing(2), lineHeight: 17 },
          ]}
        >
          {item.subtitle}
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons
        name="arrow-forward"
        size={16}
        color={item.color}
        style={{ marginTop: spacing(1), flexShrink: 0 }}
      />
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar info panel (desktop)
// ─────────────────────────────────────────────────────────────────────────────
function SidebarPanel() {
  const colors = useTheme();
  const elevation = useElevation('md');

  return (
    <View style={{ width: 300, flexShrink: 0, gap: spacing(5) }}>
      {/* Hours card */}
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
            <Ionicons name="time-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>
            Support Hours
          </Text>
        </View>

        {[
          { day: 'Monday – Friday', hours: '8:00 AM – 5:00 PM' },
          { day: 'Saturday', hours: '9:00 AM – 1:00 PM' },
          { day: 'Sunday & Holidays', hours: 'Closed' },
        ].map(({ day, hours }) => (
          <View
            key={day}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: spacing(2),
              borderBottomWidth: 1,
              borderBottomColor: colors.divider,
            }}
          >
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {day}
            </Text>
            <Text style={[typography.label, { color: colors.textPrimary }]}>
              {hours}
            </Text>
          </View>
        ))}
      </View>

      {/* Response times card */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radii.lg,
              backgroundColor: `${colors.success}22`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="flash-outline" size={20} color={colors.success} />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>
            Response Times
          </Text>
        </View>

        {[
          { channel: 'Phone', time: 'Immediate', color: '#60A5FA' },
          { channel: 'WhatsApp', time: '< 1 hour', color: '#4ADE80' },
          { channel: 'Email', time: '< 24 hours', color: '#34D399' },
          { channel: 'Social', time: '1–2 days', color: '#F472B6' },
        ].map(({ channel, time, color }) => (
          <View
            key={channel}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {channel}
            </Text>
            <View
              style={{
                paddingHorizontal: spacing(3),
                paddingVertical: spacing(1),
                borderRadius: radii.pill,
                backgroundColor: `${color}1A`,
                borderWidth: 1,
                borderColor: `${color}33`,
              }}
            >
              <Text style={[typography.caption, { color, fontWeight: '700' }]}>
                {time}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Tip */}
      <View
        style={{
          padding: spacing(4),
          backgroundColor: `${colors.primary}14`,
          borderRadius: radii.xl,
          borderLeftWidth: 3,
          borderLeftColor: colors.primary,
        }}
      >
        <Text style={[typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
          💡 For urgent matters, WhatsApp or phone is fastest. For document
          reviews and application queries, email is recommended.
        </Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────
function ContactSupportContent() {
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

  // ── Hero banner ────────────────────────────────────────────────────────
  const HeroBanner = (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: isMobile ? spacing(5) : spacing(7),
          marginBottom: spacing(7),
          overflow: 'hidden',
        },
        elevation,
      ]}
    >
      {/* Decorative accent bar */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: colors.primary,
          borderTopLeftRadius: radii.xxl,
          borderTopRightRadius: radii.xxl,
        }}
      />

      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: spacing(5),
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
            <Ionicons name="help-buoy-outline" size={14} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              SUPPORT
            </Text>
          </View>

          <Text style={[typography.hero, { color: colors.textPrimary }]}>
            We're Here to Help
          </Text>
          <Text
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                marginTop: spacing(3),
                maxWidth: 480,
                lineHeight: 24,
              },
            ]}
          >
            Choose the support channel that works best for you. Our team is ready
            to assist with applications, results, and any questions about
            UniPathway.
          </Text>
        </View>

        {/* Right icon cluster — hidden on mobile */}
        {!isMobile && (
          <View style={{ gap: spacing(3) }}>
            {[
              { icon: 'call-outline' as const, color: '#60A5FA' },
              { icon: 'mail-outline' as const, color: '#34D399' },
              { icon: 'logo-whatsapp' as const, color: '#4ADE80' },
            ].map(({ icon, color }) => (
              <View
                key={icon}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radii.xl,
                  backgroundColor: `${color}1A`,
                  borderWidth: 1,
                  borderColor: `${color}33`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={icon} size={22} color={color} />
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // ── Response strip (mobile/tablet only) ──────────────────────────────────
  const ResponseStrip = !isDesktop && (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing(3),
        marginBottom: spacing(7),
      }}
    >
      {[
        { label: 'Phone', time: 'Immediate', color: '#60A5FA' },
        { label: 'WhatsApp', time: '< 1 hr', color: '#4ADE80' },
        { label: 'Email', time: '< 24 hrs', color: '#34D399' },
      ].map(({ label, time, color }) => (
        <View
          key={label}
          style={{
            flex: 1,
            minWidth: 90,
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(3),
            alignItems: 'center',
            gap: spacing(1),
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
              marginBottom: spacing(1),
            }}
          />
          <Text style={[typography.label, { color: colors.textPrimary }]}>
            {label}
          </Text>
          <Text style={[typography.caption, { color, fontWeight: '700' }]}>
            {time}
          </Text>
        </View>
      ))}
    </View>
  );

  // ── Cards grid ─────────────────────────────────────────────────────────
  const CardsGrid = (
    <View>
      <Text
        style={[
          typography.caption,
          {
            color: colors.textMuted,
            letterSpacing: 0.5,
            marginBottom: spacing(3),
          },
        ]}
      >
        SUPPORT CHANNELS
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing(4),
        }}
      >
        {SUPPORT_ITEMS.map((item) => (
          <SupportCard key={item.title} item={item} />
        ))}
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render — DashboardLayout owns: SafeAreaView, scroll, header, sidebar nav,
  // dark blue theme, and menu button.
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      title="Contact Support"
      subtitle="Reach UniPathway through official channels"
      showPointsCard={false}
    >
      {/* Back navigation + breadcrumb */}
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

        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Settings › Contact Support
        </Text>

        {/* Settings shortcut */}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
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
            <Text style={[typography.label, { color: colors.textSecondary }]}>
              Settings
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Desktop: two-column; mobile/tablet: stacked */}
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          gap: spacing(8),
          alignItems: 'flex-start',
        }}
      >
        {/* Main column */}
        <View style={{ flex: 1 }}>
          {HeroBanner}
          {ResponseStrip}
          {CardsGrid}
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
export default function ContactSupportScreen() {
  return (
    <StudentMenuProvider>
      <ContactSupportContent />
    </StudentMenuProvider>
  );
}