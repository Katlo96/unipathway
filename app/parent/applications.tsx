// app/parent/applications.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
  type ColorSchemeName,
  type GestureResponderEvent,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";

type AppStatus = "Submitted" | "Draft" | "Under review" | "Accepted" | "Rejected";

type ParentApplication = {
  id: string;
  course: string;
  university: string;
  deadline: string;
  status: AppStatus;
};

const DATA: ParentApplication[] = [
  {
    id: "1",
    course: "BSc Computer Science",
    university: "University of Botswana",
    deadline: "20 Jan 2026",
    status: "Submitted",
  },
  {
    id: "2",
    course: "BCom Finance",
    university: "Botswana Accountancy College",
    deadline: "02 Feb 2026",
    status: "Draft",
  },
  {
    id: "3",
    course: "BA Psychology",
    university: "University of Botswana",
    deadline: "30 Jan 2026",
    status: "Under review",
  },
];

type Breakpoint = "mobile" | "tablet" | "desktop";
type FilterValue = "All" | "Submitted" | "Draft";
type StatusTone = "good" | "bad" | "draft" | "neutral";

const spacing = (n: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16) => n * 4;

const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
};

const TYPOGRAPHY = {
  hero: { fontSize: 30, lineHeight: 36, fontWeight: "900" as const, letterSpacing: 0.2 },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: "900" as const, letterSpacing: 0.2 },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: "800" as const, letterSpacing: 0.15 },
  h3: { fontSize: 15, lineHeight: 20, fontWeight: "800" as const, letterSpacing: 0.1 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "600" as const },
  bodyStrong: { fontSize: 14, lineHeight: 20, fontWeight: "800" as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: "900" as const, letterSpacing: 0.7 },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: "800" as const, letterSpacing: 0.5 },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function resolveBreakpoint(width: number): Breakpoint {
  if (width < 480) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function getStatusTone(status: AppStatus): StatusTone {
  if (status === "Accepted") return "good";
  if (status === "Rejected") return "bad";
  if (status === "Draft") return "draft";
  return "neutral";
}

function getTheme(scheme: ColorSchemeName) {
  const isDark = scheme === "dark";

  return {
    colors: {
      appBg: isDark ? "#07111A" : "#0B1220",
      backdrop: isDark ? "rgba(2,8,13,0.78)" : "rgba(0,0,0,0.55)",
      shell: isDark ? "#0F1B26" : "#E9EEF1",
      shellBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)",
      header: isDark ? "#4CA7BB" : "#57AFC2",
      headerSurface: isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.68)",
      panel: isDark ? "rgba(18,31,42,0.96)" : "rgba(255,255,255,0.72)",
      panelStrong: isDark ? "#173041" : "#86D9E8",
      surface: isDark ? "#122332" : "#FFFFFF",
      surfaceMuted: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.78)",
      text: isDark ? "#F3FAFC" : "#0B0F12",
      textSoft: isDark ? "rgba(243,250,252,0.74)" : "rgba(11,15,18,0.72)",
      textMuted: isDark ? "rgba(243,250,252,0.55)" : "rgba(11,15,18,0.55)",
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
      borderSoft: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      white: "#FFFFFF",
      danger: isDark ? "#FFB4B4" : "#B22222",
      badgeNeutralBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.82)",
      badgeDraftBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.68)",
      badgeGoodBg: isDark ? "rgba(174,232,198,0.16)" : "rgba(255,255,255,0.92)",
      badgeBadBg: isDark ? "rgba(255,180,180,0.14)" : "rgba(255,255,255,0.76)",
      metricIconBg: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.62)",
      metricCardBg: isDark ? "#173041" : "#86D9E8",
      emptyIconBg: isDark ? "rgba(134,217,232,0.16)" : "rgba(134,217,232,0.35)",
    },
  };
}

function shadow(level: "sm" | "lg"): ViewStyle {
  if (Platform.OS === "web") {
    return {};
  }

  if (level === "sm") {
    return {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    };
  }

  return {
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  };
}

function usePressScale() {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (toValue: number) => {
      Animated.timing(scale, {
        toValue,
        duration: 130,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    },
    [scale]
  );

  const onPressIn = useCallback(() => animateTo(0.96), [animateTo]);
  const onPressOut = useCallback(() => animateTo(1), [animateTo]);

  return {
    animatedStyle: { transform: [{ scale }] },
    onPressIn,
    onPressOut,
  };
}

function InteractiveCard({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "button",
}: {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle | ViewStyle[];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: "button" | "none";
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        hitSlop={8}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function ParentApplicationsScreen() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);

  const [filter, setFilter] = useState<FilterValue>("All");
  const [menuOpen, setMenuOpen] = useState(false);

  const ui = useMemo(() => {
    const breakpoint = resolveBreakpoint(width);
    const isMobile = breakpoint === "mobile";
    const isTablet = breakpoint === "tablet";
    const isDesktop = breakpoint === "desktop";

    const shellWidth = isDesktop ? clamp(Math.round(width * 0.86), 1100, 1280) : width;
    const shellHeight = isDesktop ? clamp(Math.round(height * 0.9), 740, 940) : height;

    const outerPadding = isDesktop ? spacing(8) : 0;
    const contentX = isDesktop ? spacing(8) : isTablet ? spacing(6) : spacing(4);
    const headerHeight = isDesktop ? 84 : isTablet ? 72 : 64;
    const contentMaxWidth = isDesktop ? 1220 : undefined;
    const desktopSidebarWidth = 390;
    const panelGap = isDesktop ? spacing(6) : spacing(5);

    return {
      isMobile,
      isTablet,
      isDesktop,
      shellWidth,
      shellHeight,
      shellRadius: isDesktop ? RADIUS.xxl : 0,
      outerPadding,
      contentX,
      headerHeight,
      contentMaxWidth,
      desktopSidebarWidth,
      panelGap,
      heroTitleSize: isDesktop ? 30 : isTablet ? 27 : 23,
      heroSubtitleSize: isDesktop ? 14 : 13,
      panelTitleSize: isDesktop ? 18 : 16,
      metricMinWidth: isDesktop ? 150 : 140,
      menuWidth: isDesktop ? 380 : 320,
    };
  }, [width, height]);

  const items = useMemo(() => {
    if (filter === "All") return DATA;
    return DATA.filter((a) => a.status === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const submitted = DATA.filter((d) => d.status === "Submitted").length;
    const draft = DATA.filter((d) => d.status === "Draft").length;
    const review = DATA.filter((d) => d.status === "Under review").length;

    return {
      submitted,
      draft,
      review,
      total: DATA.length,
    };
  }, []);

  const notificationsHref: Href = { pathname: "/student/notifications" as any };
  const settingsHref: Href = { pathname: "/student/settings" as any };
  const addChildHref: Href = { pathname: "/parent/add-child" as any };
  const loginHref: Href = { pathname: "/login" };

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const goTo = useCallback((href: Href, method: "push" | "replace" = "push") => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      if (method === "replace") {
        router.replace(href);
      } else {
        router.push(href);
      }
    });
  }, []);

  const styles = useMemo(() => createStyles(theme.colors, ui), [theme.colors, ui]);

  return (
    <View style={styles.page}>
      <View style={[styles.pageCenter, { padding: ui.outerPadding }]}>
        <View
          style={[
            styles.shell,
            {
              width: ui.shellWidth,
              height: ui.shellHeight,
              borderRadius: ui.shellRadius,
            },
            ui.isDesktop ? styles.shellDesktop : null,
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <HeaderBar
              styles={styles}
              ui={ui}
              textColor={theme.colors.text}
              onBack={() => router.back()}
              onMenu={() => setMenuOpen(true)}
            />

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={ui.isDesktop}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={[
                  styles.contentWrap,
                  ui.contentMaxWidth ? { maxWidth: ui.contentMaxWidth } : null,
                ]}
              >
                {ui.isDesktop ? (
                  <View style={styles.desktopLayout}>
                    <View style={[styles.desktopSidebar, { width: ui.desktopSidebarWidth }]}>
                      <OverviewPanel
                        styles={styles}
                        ui={ui}
                        textColor={theme.colors.text}
                        textSoftColor={theme.colors.textSoft}
                        counts={counts}
                        filter={filter}
                        setFilter={setFilter}
                      />
                    </View>

                    <View style={styles.desktopMain}>
                      <ApplicationsPanel
                        styles={styles}
                        ui={ui}
                        textColor={theme.colors.text}
                        textSoftColor={theme.colors.textSoft}
                        items={items}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.mobileStack}>
                    <OverviewPanel
                      styles={styles}
                      ui={ui}
                      textColor={theme.colors.text}
                      textSoftColor={theme.colors.textSoft}
                      counts={counts}
                      filter={filter}
                      setFilter={setFilter}
                    />
                    <ApplicationsPanel
                      styles={styles}
                      ui={ui}
                      textColor={theme.colors.text}
                      textSoftColor={theme.colors.textSoft}
                      items={items}
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            <Modal
              visible={menuOpen}
              transparent
              animationType="fade"
              onRequestClose={closeMenu}
            >
              <Pressable style={styles.modalBackdrop} onPress={closeMenu}>
                <Pressable
                  style={[styles.menuCard, { width: ui.menuWidth }]}
                  onPress={() => {}}
                  accessibilityRole="none"
                >
                  <View style={styles.menuHeaderRow}>
                    <View style={styles.menuHeaderSpacer} />
                    <Text style={styles.menuTitle}>Menu</Text>

                    <InteractiveCard
                      onPress={closeMenu}
                      style={styles.menuCloseButton}
                      accessibilityLabel="Close menu"
                    >
                      <Ionicons name="close" size={18} color={theme.colors.text} />
                    </InteractiveCard>
                  </View>

                  <View style={styles.menuDivider} />

                  <MenuItem
                    styles={styles}
                    iconColor={theme.colors.text}
                    chevronColor={theme.colors.textMuted}
                    dangerColor={theme.colors.danger}
                    icon="person-add-outline"
                    label="Add child"
                    onPress={() => goTo(addChildHref, "push")}
                  />
                  <MenuItem
                    styles={styles}
                    iconColor={theme.colors.text}
                    chevronColor={theme.colors.textMuted}
                    dangerColor={theme.colors.danger}
                    icon="notifications-outline"
                    label="Notifications"
                    onPress={() => goTo(notificationsHref, "push")}
                  />
                  <MenuItem
                    styles={styles}
                    iconColor={theme.colors.text}
                    chevronColor={theme.colors.textMuted}
                    dangerColor={theme.colors.danger}
                    icon="settings-outline"
                    label="Settings"
                    onPress={() => goTo(settingsHref, "push")}
                  />

                  <View style={styles.menuDividerSoft} />

                  <MenuItem
                    styles={styles}
                    iconColor={theme.colors.text}
                    chevronColor={theme.colors.textMuted}
                    dangerColor={theme.colors.danger}
                    icon="log-out-outline"
                    label="Logout"
                    danger
                    onPress={() => goTo(loginHref, "replace")}
                  />
                </Pressable>
              </Pressable>
            </Modal>
          </SafeAreaView>
        </View>
      </View>
    </View>
  );
}

function HeaderBar({
  styles,
  ui,
  textColor,
  onBack,
  onMenu,
}: {
  styles: ReturnType<typeof createStyles>;
  ui: {
    headerHeight: number;
    contentX: number;
    heroTitleSize: number;
    heroSubtitleSize: number;
  };
  textColor: string;
  onBack: () => void;
  onMenu: () => void;
}) {
  return (
    <View style={[styles.header, { height: ui.headerHeight }]}>
      <View style={[styles.headerInner, { paddingHorizontal: ui.contentX }]}>
        <InteractiveCard
          onPress={onBack}
          style={styles.headerIconButton}
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={20} color={textColor} />
        </InteractiveCard>

        <View style={styles.headerTextWrap}>
          <Text style={[styles.headerTitle, { fontSize: ui.heroTitleSize }]}>Applications</Text>
          <Text style={[styles.headerSubtitle, { fontSize: ui.heroSubtitleSize }]}>
            Read-only view for parents
          </Text>
        </View>

        <InteractiveCard
          onPress={onMenu}
          style={styles.headerMenuButton}
          accessibilityLabel="Open menu"
          accessibilityHint="Opens the parent applications menu"
        >
          <Ionicons name="grid-outline" size={18} color={textColor} />
        </InteractiveCard>
      </View>
    </View>
  );
}

function OverviewPanel({
  styles,
  ui,
  textColor,
  textSoftColor,
  counts,
  filter,
  setFilter,
}: {
  styles: ReturnType<typeof createStyles>;
  ui: {
    panelTitleSize: number;
    metricMinWidth: number;
  };
  textColor: string;
  textSoftColor: string;
  counts: {
    submitted: number;
    draft: number;
    review: number;
    total: number;
  };
  filter: FilterValue;
  setFilter: React.Dispatch<React.SetStateAction<FilterValue>>;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={[styles.panelTitle, { fontSize: ui.panelTitleSize }]}>Overview</Text>

        <View style={styles.readOnlyBadge}>
          <Ionicons name="lock-closed-outline" size={14} color={textSoftColor} />
          <Text style={styles.readOnlyBadgeText}>read-only</Text>
        </View>
      </View>

      <Text style={styles.panelDescription}>
        Monitor your child’s application progress without editing submissions.
      </Text>

      <View style={styles.metricGrid}>
        <MetricCard
          styles={styles}
          iconColor={textColor}
          icon="layers-outline"
          label="Total"
          value={counts.total}
          minWidth={ui.metricMinWidth}
        />
        <MetricCard
          styles={styles}
          iconColor={textColor}
          icon="paper-plane-outline"
          label="Submitted"
          value={counts.submitted}
          minWidth={ui.metricMinWidth}
        />
        <MetricCard
          styles={styles}
          iconColor={textColor}
          icon="document-outline"
          label="Draft"
          value={counts.draft}
          minWidth={ui.metricMinWidth}
        />
        <MetricCard
          styles={styles}
          iconColor={textColor}
          icon="time-outline"
          label="Under review"
          value={counts.review}
          minWidth={ui.metricMinWidth}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter</Text>

        <View style={styles.filterRow}>
          <FilterChip
            styles={styles}
            label="All"
            active={filter === "All"}
            onPress={() => setFilter("All")}
          />
          <FilterChip
            styles={styles}
            label="Submitted"
            active={filter === "Submitted"}
            onPress={() => setFilter("Submitted")}
          />
          <FilterChip
            styles={styles}
            label="Draft"
            active={filter === "Draft"}
            onPress={() => setFilter("Draft")}
          />
        </View>
      </View>
    </View>
  );
}

function ApplicationsPanel({
  styles,
  ui,
  textColor,
  textSoftColor,
  items,
}: {
  styles: ReturnType<typeof createStyles>;
  ui: {
    panelTitleSize: number;
    isDesktop: boolean;
  };
  textColor: string;
  textSoftColor: string;
  items: ParentApplication[];
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={[styles.panelTitle, { fontSize: ui.panelTitleSize }]}>Applications</Text>
        <Text style={styles.panelMeta}>
          Showing <Text style={styles.panelMetaStrong}>{items.length}</Text>
        </Text>
      </View>

      <Text style={styles.panelDescription}>
        Review submitted and draft applications from a parent-only perspective.
      </Text>

      {items.length === 0 ? (
        <EmptyState styles={styles} textColor={textColor} />
      ) : (
        <View style={styles.applicationGrid}>
          {items.map((app) => (
            <ApplicationCard
              key={app.id}
              styles={styles}
              textColor={textColor}
              textSoftColor={textSoftColor}
              app={app}
              fullWidth={!ui.isDesktop}
              onPress={() => console.log("Parent view application (read-only):", app.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function MetricCard({
  styles,
  iconColor,
  icon,
  label,
  value,
  minWidth,
}: {
  styles: ReturnType<typeof createStyles>;
  iconColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  minWidth: number;
}) {
  return (
    <View style={[styles.metricCard, { minWidth }]}>
      <View style={styles.metricIconWrap}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.metricTextWrap}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function FilterChip({
  styles,
  label,
  active,
  onPress,
}: {
  styles: ReturnType<typeof createStyles>;
  label: FilterValue;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <InteractiveCard
      onPress={onPress}
      style={[styles.filterChip, active ? styles.filterChipActive : styles.filterChipInactive]}
      accessibilityLabel={`Filter ${label}`}
      accessibilityHint={`Shows ${label.toLowerCase()} applications`}
    >
      <Text
        style={[
          styles.filterChipText,
          active ? styles.filterChipTextActive : styles.filterChipTextInactive,
        ]}
      >
        {label}
      </Text>
    </InteractiveCard>
  );
}

function StatusBadge({
  styles,
  status,
}: {
  styles: ReturnType<typeof createStyles>;
  status: AppStatus;
}) {
  const tone = getStatusTone(status);

  return (
    <View
      style={[
        styles.statusBadge,
        tone === "good"
          ? styles.statusBadgeGood
          : tone === "bad"
          ? styles.statusBadgeBad
          : tone === "draft"
          ? styles.statusBadgeDraft
          : styles.statusBadgeNeutral,
      ]}
    >
      <Text style={styles.statusBadgeText} numberOfLines={1}>
        {status.toLowerCase()}
      </Text>
    </View>
  );
}

function ApplicationCard({
  styles,
  textColor,
  textSoftColor,
  app,
  fullWidth,
  onPress,
}: {
  styles: ReturnType<typeof createStyles>;
  textColor: string;
  textSoftColor: string;
  app: ParentApplication;
  fullWidth: boolean;
  onPress: () => void;
}) {
  return (
    <InteractiveCard
      onPress={onPress}
      style={[styles.applicationCard, fullWidth ? styles.applicationCardFull : styles.applicationCardHalf]}
      accessibilityLabel={`${app.course} application`}
      accessibilityHint="Opens a read-only application summary"
    >
      <View style={styles.applicationTopRow}>
        <View style={styles.applicationLeadingIcon}>
          <Ionicons name="document-text-outline" size={18} color={textColor} />
        </View>

        <View style={styles.applicationTextWrap}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {app.course}
          </Text>
          <Text style={styles.universityTitle} numberOfLines={1}>
            {app.university}
          </Text>
        </View>

        <StatusBadge styles={styles} status={app.status} />
      </View>

      <View style={styles.applicationBottomRow}>
        <View style={styles.deadlineRow}>
          <Ionicons name="time-outline" size={16} color={textColor} />
          <Text style={styles.deadlineText} numberOfLines={1}>
            Deadline {app.deadline}
          </Text>
        </View>

        <View style={styles.inlineReadOnlyPill}>
          <Ionicons name="lock-closed-outline" size={14} color={textSoftColor} />
          <Text style={styles.inlineReadOnlyText}>read-only</Text>
        </View>
      </View>
    </InteractiveCard>
  );
}

function EmptyState({
  styles,
  textColor,
}: {
  styles: ReturnType<typeof createStyles>;
  textColor: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="information-circle-outline" size={20} color={textColor} />
      </View>

      <View style={styles.emptyTextWrap}>
        <Text style={styles.emptyTitle}>No applications found</Text>
        <Text style={styles.emptyDescription}>
          Try changing the filter to see other applications.
        </Text>
      </View>
    </View>
  );
}

function MenuItem({
  styles,
  iconColor,
  chevronColor,
  dangerColor,
  icon,
  label,
  onPress,
  danger,
}: {
  styles: ReturnType<typeof createStyles>;
  iconColor: string;
  chevronColor: string;
  dangerColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <InteractiveCard
      onPress={onPress}
      style={styles.menuItem}
      accessibilityLabel={label}
      accessibilityHint={`Navigates to ${label}`}
    >
      <View style={[styles.menuItemIconWrap, danger ? styles.menuItemIconWrapDanger : null]}>
        <Ionicons name={icon} size={18} color={danger ? dangerColor : iconColor} />
      </View>

      <Text style={[styles.menuItemText, danger ? styles.menuItemTextDanger : null]} numberOfLines={1}>
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? dangerColor : chevronColor}
      />
    </InteractiveCard>
  );
}

function createStyles(
  colors: ReturnType<typeof getTheme>["colors"],
  ui: {
    contentX: number;
    panelGap: number;
  }
) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.appBg,
    },

    pageCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    shell: {
      overflow: "hidden",
      backgroundColor: colors.shell,
    },

    shellDesktop: {
      borderWidth: 1,
      borderColor: colors.shellBorder,
      ...shadow("lg"),
    },

    safe: {
      flex: 1,
    },

    header: {
      backgroundColor: colors.header,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      justifyContent: "center",
    },

    headerInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(4),
    },

    headerTextWrap: {
      flex: 1,
      minWidth: 0,
    },

    headerTitle: {
      ...TYPOGRAPHY.hero,
      color: colors.white,
    },

    headerSubtitle: {
      marginTop: 2,
      ...TYPOGRAPHY.bodyStrong,
      color: "rgba(255,255,255,0.92)",
    },

    headerIconButton: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.headerSurface,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    headerMenuButton: {
      width: 44,
      height: 44,
      borderRadius: RADIUS.md,
      backgroundColor: colors.panelStrong,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    scrollContent: {
      paddingHorizontal: ui.contentX,
      paddingTop: spacing(6),
      paddingBottom: spacing(6),
      alignItems: "center",
    },

    contentWrap: {
      width: "100%",
    },

    desktopLayout: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: ui.panelGap,
    },

    desktopSidebar: {
      flexShrink: 0,
    },

    desktopMain: {
      flex: 1,
      minWidth: 0,
    },

    mobileStack: {
      gap: ui.panelGap,
    },

    panel: {
      backgroundColor: colors.panel,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      padding: spacing(5),
      ...shadow("sm"),
    },

    panelHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },

    panelTitle: {
      ...TYPOGRAPHY.h2,
      color: colors.text,
    },

    panelMeta: {
      ...TYPOGRAPHY.bodyStrong,
      color: colors.textSoft,
    },

    panelMetaStrong: {
      color: colors.text,
      fontWeight: "900",
    },

    panelDescription: {
      marginTop: spacing(3),
      ...TYPOGRAPHY.body,
      color: colors.textSoft,
    },

    readOnlyBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surfaceMuted,
    },

    readOnlyBadgeText: {
      ...TYPOGRAPHY.micro,
      color: colors.textSoft,
      textTransform: "lowercase",
    },

    metricGrid: {
      marginTop: spacing(5),
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(3),
    },

    metricCard: {
      flexGrow: 1,
      flexBasis: "47%",
      backgroundColor: colors.metricCardBg,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      padding: spacing(4),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },

    metricIconWrap: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: colors.metricIconBg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    metricTextWrap: {
      flex: 1,
      minWidth: 0,
    },

    metricValue: {
      ...TYPOGRAPHY.h1,
      color: colors.text,
      fontSize: 20,
      lineHeight: 24,
    },

    metricLabel: {
      marginTop: 2,
      ...TYPOGRAPHY.label,
      color: colors.textSoft,
      letterSpacing: 0.4,
      textTransform: "none",
    },

    filterSection: {
      marginTop: spacing(5),
    },

    filterLabel: {
      ...TYPOGRAPHY.label,
      color: colors.text,
      textTransform: "uppercase",
      marginBottom: spacing(2),
    },

    filterRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(3),
    },

    filterChip: {
      minHeight: 40,
      minWidth: 72,
      paddingHorizontal: spacing(4),
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    filterChipActive: {
      backgroundColor: colors.panelStrong,
      borderColor: colors.border,
    },

    filterChipInactive: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
    },

    filterChipText: {
      ...TYPOGRAPHY.bodyStrong,
      fontSize: 13,
    },

    filterChipTextActive: {
      color: colors.text,
    },

    filterChipTextInactive: {
      color: colors.textSoft,
    },

    applicationGrid: {
      marginTop: spacing(5),
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(4),
      justifyContent: "space-between",
    },

    applicationCard: {
      backgroundColor: colors.panelStrong,
      borderRadius: RADIUS.xl,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      padding: spacing(4),
      ...shadow("sm"),
    },

    applicationCardFull: {
      width: "100%",
    },

    applicationCardHalf: {
      width: "48.8%",
      minWidth: 300,
    },

    applicationTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },

    applicationLeadingIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.metricIconBg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    applicationTextWrap: {
      flex: 1,
      minWidth: 0,
    },

    courseTitle: {
      ...TYPOGRAPHY.h3,
      color: colors.text,
      fontSize: 15,
    },

    universityTitle: {
      marginTop: 3,
      ...TYPOGRAPHY.bodyStrong,
      color: colors.textSoft,
      fontSize: 12.5,
    },

    statusBadge: {
      maxWidth: 150,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: RADIUS.pill,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    statusBadgeNeutral: {
      backgroundColor: colors.badgeNeutralBg,
      borderColor: colors.border,
    },

    statusBadgeDraft: {
      backgroundColor: colors.badgeDraftBg,
      borderColor: colors.border,
    },

    statusBadgeGood: {
      backgroundColor: colors.badgeGoodBg,
      borderColor: colors.border,
    },

    statusBadgeBad: {
      backgroundColor: colors.badgeBadBg,
      borderColor: colors.border,
    },

    statusBadgeText: {
      ...TYPOGRAPHY.micro,
      color: colors.text,
      textTransform: "lowercase",
    },

    applicationBottomRow: {
      marginTop: spacing(4),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },

    deadlineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      flex: 1,
      minWidth: 0,
    },

    deadlineText: {
      ...TYPOGRAPHY.bodyStrong,
      color: colors.text,
      fontSize: 12.5,
      textTransform: "none",
    },

    inlineReadOnlyPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: RADIUS.pill,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
    },

    inlineReadOnlyText: {
      ...TYPOGRAPHY.micro,
      color: colors.textSoft,
      textTransform: "lowercase",
    },

    emptyState: {
      marginTop: spacing(5),
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: RADIUS.xl,
      padding: spacing(5),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(3),
    },

    emptyIconWrap: {
      width: 40,
      height: 40,
      borderRadius: RADIUS.md,
      backgroundColor: colors.emptyIconBg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTextWrap: {
      flex: 1,
      minWidth: 0,
    },

    emptyTitle: {
      ...TYPOGRAPHY.h3,
      color: colors.text,
      fontSize: 15,
    },

    emptyDescription: {
      marginTop: spacing(1),
      ...TYPOGRAPHY.body,
      color: colors.textSoft,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing(5),
    },

    menuCard: {
      borderRadius: RADIUS.xl,
      backgroundColor: colors.shell,
      borderWidth: 1,
      borderColor: colors.shellBorder,
      padding: spacing(4),
      ...shadow("lg"),
    },

    menuHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: spacing(3),
    },

    menuHeaderSpacer: {
      width: 36,
    },

    menuTitle: {
      ...TYPOGRAPHY.h3,
      color: colors.text,
      fontSize: 15,
    },

    menuCloseButton: {
      width: 36,
      height: 36,
      borderRadius: RADIUS.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },

    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: spacing(3),
    },

    menuDividerSoft: {
      height: 1,
      backgroundColor: colors.borderSoft,
      marginTop: spacing(2),
      marginBottom: spacing(3),
    },

    menuItem: {
      minHeight: 52,
      borderRadius: RADIUS.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      paddingHorizontal: spacing(3),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      marginBottom: spacing(3),
    },

    menuItemIconWrap: {
      width: 36,
      height: 36,
      borderRadius: RADIUS.md,
      backgroundColor: colors.emptyIconBg,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    menuItemIconWrapDanger: {
      backgroundColor: "rgba(178,34,34,0.10)",
      borderColor: "rgba(178,34,34,0.18)",
    },

    menuItemText: {
      flex: 1,
      ...TYPOGRAPHY.bodyStrong,
      color: colors.text,
      fontSize: 13.5,
    },

    menuItemTextDanger: {
      color: colors.danger,
    },
  });
}