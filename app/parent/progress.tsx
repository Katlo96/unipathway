// app/parent/progress.tsx
import React, { memo, useCallback, useMemo, useState } from "react";
import {
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
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";

type SubjectStat = {
  name: string;
  score: number;
};

type Breakpoint = "mobile" | "tablet" | "desktop";
type ThemeMode = "light" | "dark";

const spacing = (n: number) => n * 4;

const radius = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
};

const font = {
  hero: 32,
  h1: 28,
  h2: 22,
  h3: 18,
  title: 16,
  body: 14,
  caption: 12,
  micro: 11,
};

function resolveMode(scheme: ColorSchemeName): ThemeMode {
  return scheme === "dark" ? "dark" : "light";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getBreakpoint(width: number): Breakpoint {
  if (width < 480) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function createPalette(mode: ThemeMode) {
  if (mode === "dark") {
    return {
      page: "#08111C",
      shell: "#0E1726",
      shellBorder: "rgba(255,255,255,0.08)",
      surface: "#101C2B",
      surfaceElevated: "#152438",
      surfaceMuted: "#0F1A2A",
      brand: "#69C3D5",
      brandSoft: "rgba(105,195,213,0.14)",
      brandStrong: "#86D9E8",
      text: "#F5F9FF",
      textMuted: "rgba(245,249,255,0.72)",
      textSoft: "rgba(245,249,255,0.52)",
      line: "rgba(255,255,255,0.08)",
      lineSoft: "rgba(255,255,255,0.05)",
      success: "#7ED4A5",
      successSoft: "rgba(126,212,165,0.14)",
      warning: "#F1B968",
      warningSoft: "rgba(241,185,104,0.14)",
      danger: "#F16F6F",
      dangerSoft: "rgba(241,111,111,0.14)",
      white: "#FFFFFF",
      chartGrid: "rgba(255,255,255,0.09)",
      chartFillStrong: "#86D9E8",
      chartFillWeak: "rgba(255,255,255,0.85)",
      shadow: "#000000",
      overlay: "rgba(0,0,0,0.58)",
    };
  }

  return {
    page: "#0B1220",
    shell: "#EEF4F7",
    shellBorder: "rgba(11,18,32,0.08)",
    surface: "#FFFFFF",
    surfaceElevated: "#F7FBFD",
    surfaceMuted: "#F0F6F9",
    brand: "#57AFC2",
    brandSoft: "rgba(87,175,194,0.14)",
    brandStrong: "#86D9E8",
    text: "#0C1520",
    textMuted: "rgba(12,21,32,0.72)",
    textSoft: "rgba(12,21,32,0.52)",
    line: "rgba(12,21,32,0.10)",
    lineSoft: "rgba(12,21,32,0.06)",
    success: "#188A5C",
    successSoft: "rgba(24,138,92,0.10)",
    warning: "#C97C1D",
    warningSoft: "rgba(201,124,29,0.10)",
    danger: "#B94141",
    dangerSoft: "rgba(185,65,65,0.10)",
    white: "#FFFFFF",
    chartGrid: "rgba(12,21,32,0.08)",
    chartFillStrong: "#57AFC2",
    chartFillWeak: "rgba(12,21,32,0.45)",
    shadow: "#000000",
    overlay: "rgba(0,0,0,0.52)",
  };
}

function createShadows(mode: ThemeMode) {
  const isDark = mode === "dark";

  return {
    shell: Platform.select<ViewStyle>({
      ios: {
        shadowColor: "#000",
        shadowOpacity: isDark ? 0.34 : 0.14,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 16 },
      },
      android: {
        elevation: isDark ? 8 : 5,
      },
      web: {
        shadowColor: "#000",
        shadowOpacity: 0,
      },
      default: {},
    }),
    card: Platform.select<ViewStyle>({
      ios: {
        shadowColor: "#000",
        shadowOpacity: isDark ? 0.18 : 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: isDark ? 3 : 2,
      },
      web: {
        shadowColor: "#000",
        shadowOpacity: 0,
      },
      default: {},
    }),
    floating: Platform.select<ViewStyle>({
      ios: {
        shadowColor: "#000",
        shadowOpacity: isDark ? 0.25 : 0.12,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 12 },
      },
      android: {
        elevation: isDark ? 6 : 4,
      },
      web: {
        shadowColor: "#000",
        shadowOpacity: 0,
      },
      default: {},
    }),
  };
}

function getResponsiveUI(width: number, height: number) {
  const breakpoint = getBreakpoint(width);
  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";
  const isDesktop = breakpoint === "desktop";

  const shellWidth = isDesktop ? clamp(Math.round(width * 0.88), 1100, 1240) : width;
  const shellHeight = isDesktop ? clamp(Math.round(height * 0.9), 760, 940) : height;
  const shellRadius = isDesktop ? radius.xl : 0;
  const outerPadding = isDesktop ? spacing(8) : 0;
  const contentPaddingX = isDesktop ? spacing(8) : isTablet ? spacing(6) : spacing(4);
  const contentPaddingY = isDesktop ? spacing(7) : isTablet ? spacing(6) : spacing(5);
  const gap = isDesktop ? spacing(6) : spacing(5);
  const headerHeight = isDesktop ? 84 : isTablet ? 72 : 64;
  const titleSize = isDesktop ? font.h1 : isTablet ? 26 : 22;
  const heroSubtitleSize = isDesktop ? font.body : font.caption;
  const chartHeight = isDesktop ? 300 : isTablet ? 240 : 200;
  const desktopLeftWidth = isDesktop ? 460 : undefined;
  const menuWidth = isDesktop ? 360 : 320;

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    shellWidth,
    shellHeight,
    shellRadius,
    outerPadding,
    contentPaddingX,
    contentPaddingY,
    gap,
    headerHeight,
    titleSize,
    heroSubtitleSize,
    chartHeight,
    desktopLeftWidth,
    menuWidth,
  };
}

export default function ParentProgressScreen() {
  const scheme = useColorScheme();
  const mode = resolveMode(scheme);
  const colors = useMemo(() => createPalette(mode), [mode]);
  const shadows = useMemo(() => createShadows(mode), [mode]);
  const { width, height } = useWindowDimensions();
  const ui = useMemo(() => getResponsiveUI(width, height), [width, height]);

  const [menuOpen, setMenuOpen] = useState(false);

  const timeline = useMemo(() => [22, 28, 30, 34, 31, 38, 42, 48], []);
  const strong = useMemo<SubjectStat[]>(
    () => [
      { name: "Mathematics", score: 86 },
      { name: "English", score: 82 },
      { name: "Biology", score: 78 },
      { name: "Accounting", score: 81 },
    ],
    []
  );

  const weak = useMemo<SubjectStat[]>(
    () => [
      { name: "Physics", score: 54 },
      { name: "Chemistry", score: 58 },
      { name: "Geography", score: 60 },
    ],
    []
  );

  const notificationsHref: Href = { pathname: "/student/notifications" as any };
  const settingsHref: Href = { pathname: "/student/settings" as any };
  const addChildHref: Href = { pathname: "/parent/add-child" as any };
  const loginHref: Href = { pathname: "/login" };

  const goTo = useCallback((href: Href, method: "push" | "replace" = "push") => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      if (method === "replace") router.replace(href);
      else router.push(href);
    });
  }, []);

  const maxVal = useMemo(() => Math.max(...timeline, 1), [timeline]);
  const minVal = useMemo(() => Math.min(...timeline, 0), [timeline]);
  const delta = useMemo(() => Math.max(1, maxVal - minVal), [maxVal, minVal]);

  const styles = useMemo(() => createStyles(colors, shadows, ui), [colors, shadows, ui]);

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
            ui.isDesktop && styles.shellDesktop,
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={[styles.topBar, { minHeight: ui.headerHeight, paddingHorizontal: ui.contentPaddingX }]}>
              <InteractiveIconButton
                icon="arrow-back"
                label="Go back"
                onPress={() => router.back()}
                colors={colors}
                style={styles.navButton}
              />

              <View style={styles.headerCenter}>
                <Text style={[styles.title, { fontSize: ui.titleSize }]} numberOfLines={1}>
                  Progress
                </Text>
                <Text style={[styles.subtitle, { fontSize: ui.heroSubtitleSize }]} numberOfLines={1}>
                  Read-only view for parents
                </Text>
              </View>

              <InteractiveIconButton
                icon="grid-outline"
                label="Open menu"
                onPress={() => setMenuOpen(true)}
                colors={colors}
                style={styles.menuButton}
                filled
              />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={ui.isDesktop}
              contentContainerStyle={{
                paddingHorizontal: ui.contentPaddingX,
                paddingTop: spacing(2),
                paddingBottom: ui.contentPaddingY,
              }}
            >
              {ui.isDesktop ? (
                <View style={[styles.desktopLayout, { gap: ui.gap }]}>
                  <View style={[styles.desktopLeftColumn, { width: ui.desktopLeftWidth }]}>
                    <TrendCard
                      timeline={timeline}
                      chartHeight={ui.chartHeight}
                      minVal={minVal}
                      maxVal={maxVal}
                      delta={delta}
                      colors={colors}
                      styles={styles}
                    />
                    <View style={{ height: spacing(5) }} />
                    <InfoCard colors={colors} styles={styles} />
                  </View>

                  <View style={styles.desktopRightColumn}>
                    <SubjectsPanel
                      title="Strong subjects"
                      icon="sparkles-outline"
                      items={strong}
                      accent="strong"
                      columns={2}
                      colors={colors}
                      styles={styles}
                    />
                    <View style={{ height: spacing(5) }} />
                    <SubjectsPanel
                      title="Needs attention"
                      icon="alert-circle-outline"
                      items={weak}
                      accent="weak"
                      columns={2}
                      colors={colors}
                      styles={styles}
                    />
                  </View>
                </View>
              ) : (
                <View style={{ gap: spacing(5) }}>
                  <TrendCard
                    timeline={timeline}
                    chartHeight={ui.chartHeight}
                    minVal={minVal}
                    maxVal={maxVal}
                    delta={delta}
                    colors={colors}
                    styles={styles}
                  />
                  <InfoCard colors={colors} styles={styles} />
                  <SubjectsPanel
                    title="Strong subjects"
                    icon="sparkles-outline"
                    items={strong}
                    accent="strong"
                    columns={1}
                    colors={colors}
                    styles={styles}
                  />
                  <SubjectsPanel
                    title="Needs attention"
                    icon="alert-circle-outline"
                    items={weak}
                    accent="weak"
                    columns={1}
                    colors={colors}
                    styles={styles}
                  />
                </View>
              )}
            </ScrollView>
          </SafeAreaView>

          <Modal
            visible={menuOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuOpen(false)}
          >
            <Pressable
              style={[styles.modalBackdrop, { padding: ui.contentPaddingX }]}
              onPress={() => setMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
            >
              <Pressable
                onPress={() => {}}
                style={[styles.menuCard, { width: ui.menuWidth }]}
                accessibilityRole="menu"
              >
                <View style={styles.menuHeader}>
                  <View style={styles.menuHeaderSpacer} />
                  <Text style={styles.menuTitle}>Menu</Text>
                  <InteractiveIconButton
                    icon="close"
                    label="Close menu"
                    onPress={() => setMenuOpen(false)}
                    colors={colors}
                    style={styles.menuCloseButton}
                  />
                </View>

                <View style={styles.divider} />

                <MenuItem
                  icon="person-add-outline"
                  label="Add child"
                  onPress={() => goTo(addChildHref)}
                  colors={colors}
                  styles={styles}
                />
                <MenuItem
                  icon="notifications-outline"
                  label="Notifications"
                  onPress={() => goTo(notificationsHref)}
                  colors={colors}
                  styles={styles}
                />
                <MenuItem
                  icon="settings-outline"
                  label="Settings"
                  onPress={() => goTo(settingsHref)}
                  colors={colors}
                  styles={styles}
                />

                <View style={styles.dividerSoft} />

                <MenuItem
                  icon="log-out-outline"
                  label="Logout"
                  onPress={() => goTo(loginHref, "replace")}
                  danger
                  colors={colors}
                  styles={styles}
                />
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </View>
    </View>
  );
}

const InteractiveIconButton = memo(function InteractiveIconButton({
  icon,
  label,
  onPress,
  colors,
  style,
  filled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof createPalette>;
  style?: ViewStyle;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => [
        style,
        {
          opacity: pressed ? 0.96 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
        Platform.OS === "web" ? { cursor: "pointer" as any } : null,
      ]}
    >
      <Ionicons name={icon} size={20} color={filled ? colors.text : colors.text} />
    </Pressable>
  );
});

const TrendCard = memo(function TrendCard({
  timeline,
  chartHeight,
  minVal,
  maxVal,
  delta,
  colors,
  styles,
}: {
  timeline: number[];
  chartHeight: number;
  minVal: number;
  maxVal: number;
  delta: number;
  colors: ReturnType<typeof createPalette>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.trendCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.flexMin}>
          <Text style={styles.trendTitle} numberOfLines={1}>
            Points trend
          </Text>
          <Text style={styles.trendSubtitle} numberOfLines={1}>
            Last {timeline.length} updates · range {minVal}–{maxVal}
          </Text>
        </View>

        <View style={styles.metricBadge}>
          <Ionicons name="trending-up-outline" size={16} color={colors.text} />
          <Text style={styles.metricBadgeText}>last {timeline.length}</Text>
        </View>
      </View>

      <View style={[styles.chartCard, { height: chartHeight }]}>
        <View style={styles.chartYAxis}>
          <Text style={styles.axisLabel}>{maxVal}</Text>
          <Text style={styles.axisLabel}>{Math.round((maxVal + minVal) / 2)}</Text>
          <Text style={styles.axisLabel}>{minVal}</Text>
        </View>

        <View style={styles.chartArea}>
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: "50%" }]} />
          <View style={[styles.gridLine, { bottom: 0 }]} />

          <View style={styles.barsRow}>
            {timeline.map((value, index) => {
              const percentage = (value - minVal) / delta;
              const barHeight = Math.max(10, Math.round(percentage * (chartHeight - spacing(12))));
              const isLast = index === timeline.length - 1;

              return (
                <View key={`${value}-${index}`} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: isLast ? colors.white : colors.chartFillWeak,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel} numberOfLines={1}>
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.cardInfoRow}>
        <Ionicons name="information-circle-outline" size={16} color={colors.white} />
        <Text style={styles.cardInfoText}>
          This screen is read-only. Schools and teachers update results and points.
        </Text>
      </View>
    </View>
  );
});

const InfoCard = memo(function InfoCard({
  colors,
  styles,
}: {
  colors: ReturnType<typeof createPalette>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.text} />
      </View>

      <View style={styles.flexMin}>
        <Text style={styles.infoTitle} numberOfLines={1}>
          Parent access
        </Text>
        <Text style={styles.infoBody}>
          You can review progress and trends here. For corrections, contact the school or teacher.
        </Text>
      </View>
    </View>
  );
});

const SubjectsPanel = memo(function SubjectsPanel({
  title,
  icon,
  items,
  accent,
  columns,
  colors,
  styles,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: SubjectStat[];
  accent: "strong" | "weak";
  columns: number;
  colors: ReturnType<typeof createPalette>;
  styles: ReturnType<typeof createStyles>;
}) {
  const distributed = useMemo(() => {
    if (columns <= 1) return [items];
    const bucketA: SubjectStat[] = [];
    const bucketB: SubjectStat[] = [];
    items.forEach((item, index) => {
      if (index % 2 === 0) bucketA.push(item);
      else bucketB.push(item);
    });
    return [bucketA, bucketB];
  }, [columns, items]);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <View style={styles.panelTitleRow}>
          <View style={styles.panelIcon}>
            <Ionicons name={icon} size={18} color={colors.text} />
          </View>
          <Text style={styles.panelTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.readOnlyBadge}>
          <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
          <Text style={styles.readOnlyText}>read-only</Text>
        </View>
      </View>

      <View style={{ height: spacing(4) }} />

      {columns <= 1 ? (
        <View style={styles.subjectList}>
          {items.map((item, index) => (
            <SubjectRow
              key={`${item.name}-${index}`}
              name={item.name}
              score={item.score}
              accent={accent}
              isLast={index === items.length - 1}
              colors={colors}
              styles={styles}
            />
          ))}
        </View>
      ) : (
        <View style={styles.subjectGrid}>
          {distributed.map((columnItems, columnIndex) => (
            <View key={`col-${columnIndex}`} style={[styles.subjectList, { flex: 1 }]}>
              {columnItems.map((item, index) => (
                <SubjectRow
                  key={`${item.name}-${index}`}
                  name={item.name}
                  score={item.score}
                  accent={accent}
                  isLast={index === columnItems.length - 1}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const SubjectRow = memo(function SubjectRow({
  name,
  score,
  accent,
  isLast,
  colors,
  styles,
}: {
  name: string;
  score: number;
  accent: "strong" | "weak";
  isLast: boolean;
  colors: ReturnType<typeof createPalette>;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeScore = clamp(score, 0, 100);
  const progressColor = accent === "strong" ? colors.chartFillStrong : colors.chartFillWeak;
  const pillStyle = accent === "strong" ? styles.scorePillStrong : styles.scorePillWeak;

  return (
    <View style={[styles.subjectRow, !isLast && styles.subjectRowBorder]}>
      <View style={styles.flexMin}>
        <Text style={styles.subjectName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subjectMeta} numberOfLines={1}>
          {safeScore}% performance (approx)
        </Text>

        <View style={styles.track}>
          <View
            style={[
              styles.trackFill,
              {
                width: `${safeScore}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.scorePill, pillStyle]} accessibilityLabel={`${name} score ${safeScore}`}>
        <Text style={styles.scorePillText}>{safeScore}</Text>
      </View>
    </View>
  );
});

const MenuItem = memo(function MenuItem({
  icon,
  label,
  onPress,
  danger,
  colors,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  colors: ReturnType<typeof createPalette>;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.menuItem,
        {
          opacity: pressed ? 0.96 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        Platform.OS === "web" ? { cursor: "pointer" as any } : null,
      ]}
    >
      <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.text} />
      </View>

      <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]} numberOfLines={1}>
        {label}
      </Text>

      <Ionicons name="chevron-forward" size={18} color={danger ? colors.danger : colors.textSoft} />
    </Pressable>
  );
});

function createStyles(
  colors: ReturnType<typeof createPalette>,
  shadows: ReturnType<typeof createShadows>,
  ui: ReturnType<typeof getResponsiveUI>
) {
  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.page,
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
      ...shadows.shell,
    },
    safe: {
      flex: 1,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
      marginTop: spacing(2),
    },
    navButton: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      ...shadows.card,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandStrong,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      ...shadows.card,
    },
    headerCenter: {
      flex: 1,
      minWidth: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing(2),
    },
    title: {
      color: colors.text,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: 0.2,
    },
    subtitle: {
      marginTop: spacing(0.5),
      color: colors.textMuted,
      fontWeight: "800",
      textAlign: "center",
    },
    desktopLayout: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    desktopLeftColumn: {
      flexGrow: 0,
      flexShrink: 0,
    },
    desktopRightColumn: {
      flex: 1,
      minWidth: 0,
    },
    trendCard: {
      backgroundColor: colors.brand,
      borderRadius: radius.xl,
      padding: spacing(5),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      ...shadows.floating,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    flexMin: {
      flex: 1,
      minWidth: 0,
    },
    trendTitle: {
      color: colors.white,
      fontSize: ui.isDesktop ? font.h3 : font.title,
      fontWeight: "900",
    },
    trendSubtitle: {
      marginTop: spacing(1),
      color: "rgba(255,255,255,0.92)",
      fontSize: font.caption,
      fontWeight: "800",
    },
    metricBadge: {
      minHeight: 36,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(1.5),
      borderRadius: radius.pill,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      backgroundColor: "rgba(255,255,255,0.88)",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.06)",
    },
    metricBadgeText: {
      color: colors.text,
      fontSize: font.caption,
      fontWeight: "900",
      textTransform: "lowercase",
    },
    chartCard: {
      marginTop: spacing(5),
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.20)",
      backgroundColor: "rgba(255,255,255,0.12)",
      overflow: "hidden",
      flexDirection: "row",
    },
    chartYAxis: {
      width: 44,
      justifyContent: "space-between",
      paddingVertical: spacing(3),
      paddingLeft: spacing(3),
    },
    axisLabel: {
      color: "rgba(255,255,255,0.92)",
      fontSize: font.micro,
      fontWeight: "900",
    },
    chartArea: {
      flex: 1,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(3),
    },
    gridLine: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.chartGrid,
    },
    barsRow: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing(2),
      paddingBottom: spacing(1),
    },
    barColumn: {
      minWidth: 24,
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    bar: {
      width: 10,
      borderRadius: radius.pill,
    },
    barLabel: {
      marginTop: spacing(1.5),
      color: "rgba(255,255,255,0.95)",
      fontSize: font.micro,
      fontWeight: "900",
    },
    cardInfoRow: {
      marginTop: spacing(5),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(3),
    },
    cardInfoText: {
      flex: 1,
      color: "rgba(255,255,255,0.92)",
      fontSize: font.caption,
      lineHeight: 18,
      fontWeight: "800",
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      paddingHorizontal: spacing(5),
      paddingVertical: spacing(4),
      borderWidth: 1,
      borderColor: colors.lineSoft,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(3),
      ...shadows.card,
    },
    infoIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandSoft,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    infoTitle: {
      color: colors.text,
      fontSize: font.title,
      fontWeight: "900",
    },
    infoBody: {
      marginTop: spacing(1),
      color: colors.textMuted,
      fontSize: font.body,
      lineHeight: 20,
      fontWeight: "700",
    },
    panel: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing(5),
      borderWidth: 1,
      borderColor: colors.lineSoft,
      ...shadows.card,
    },
    panelHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    panelTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      flex: 1,
      minWidth: 0,
    },
    panelIcon: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandSoft,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    panelTitle: {
      color: colors.text,
      fontSize: font.title,
      fontWeight: "900",
      flexShrink: 1,
    },
    readOnlyBadge: {
      minHeight: 34,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      backgroundColor: colors.surfaceElevated,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
    },
    readOnlyText: {
      color: colors.textMuted,
      fontSize: font.caption,
      fontWeight: "900",
      textTransform: "lowercase",
    },
    subjectGrid: {
      flexDirection: "row",
      gap: spacing(4),
    },
    subjectList: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2),
    },
    subjectRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      paddingVertical: spacing(4),
    },
    subjectRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.lineSoft,
    },
    subjectName: {
      color: colors.text,
      fontSize: font.body,
      fontWeight: "900",
    },
    subjectMeta: {
      marginTop: spacing(0.5),
      color: colors.textMuted,
      fontSize: font.caption,
      fontWeight: "700",
    },
    track: {
      marginTop: spacing(2.5),
      height: 10,
      borderRadius: radius.pill,
      overflow: "hidden",
      backgroundColor: colors.surfaceMuted,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    trackFill: {
      height: "100%",
      borderRadius: radius.pill,
    },
    scorePill: {
      width: 56,
      height: 44,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    scorePillStrong: {
      backgroundColor: colors.successSoft,
    },
    scorePillWeak: {
      backgroundColor: colors.warningSoft,
    },
    scorePillText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "900",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      alignItems: "center",
      justifyContent: "center",
    },
    menuCard: {
      borderRadius: radius.xl,
      backgroundColor: colors.shell,
      borderWidth: 1,
      borderColor: colors.shellBorder,
      padding: spacing(4),
      ...shadows.floating,
    },
    menuHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: spacing(3),
    },
    menuHeaderSpacer: {
      width: 36,
      height: 36,
    },
    menuTitle: {
      color: colors.text,
      fontSize: font.title,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    menuCloseButton: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    divider: {
      height: 1,
      backgroundColor: colors.line,
      marginBottom: spacing(3),
    },
    dividerSoft: {
      height: 1,
      backgroundColor: colors.lineSoft,
      marginTop: spacing(2),
      marginBottom: spacing(3),
    },
    menuItem: {
      minHeight: 52,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      paddingHorizontal: spacing(3),
      marginBottom: spacing(3),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    menuIconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandSoft,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    menuIconDanger: {
      backgroundColor: colors.dangerSoft,
    },
    menuItemText: {
      flex: 1,
      color: colors.text,
      fontSize: font.body,
      fontWeight: "900",
    },
    menuItemTextDanger: {
      color: colors.danger,
    },
  });
}