// app/teacher/dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
  useColorScheme,
  Animated,
  Easing,
  AccessibilityInfo,
  type ViewStyle,
  type StyleProp,
  type DimensionValue,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";

import {
  buildTeacherTheme,
  getTeacherUi,
  spacing,
  type TeacherTheme,
  type Ui,
} from "../../components/teacher/teacher-ui";
import { createTeacherSharedStyles } from "../../components/teacher/teacher-styles";

type StudentStatus = "Eligible" | "Not yet" | "At risk";

type TeacherStudentRow = {
  id: string;
  name: string;
  form: string;
  points: number;
  status: StudentStatus;
  updated: string;
};

const SCHOOL_NAME = "Botswana Accountancy College";
const TEACHER_NAME = "Ms. D. Kgomotso";

const STUDENTS: TeacherStudentRow[] = [
  { id: "s1", name: "Katlo Monang", form: "Form 5", points: 48, status: "Eligible", updated: "Today" },
  { id: "s2", name: "Reabetswe Monang", form: "Form 5", points: 36, status: "Not yet", updated: "Yesterday" },
  { id: "s3", name: "Onalenna Sebego", form: "Form 4", points: 28, status: "At risk", updated: "2 days ago" },
  { id: "s4", name: "Kagiso Molefe", form: "Form 5", points: 42, status: "Eligible", updated: "3 days ago" },
  { id: "s5", name: "Amogelang Tau", form: "Form 4", points: 31, status: "At risk", updated: "1 week ago" },
];

type SharedStyles = ReturnType<typeof createTeacherSharedStyles>;
type LocalStyles = ReturnType<typeof createDashboardStyles>;
type CombinedStyles = SharedStyles & LocalStyles;

function getStatusTone(status: StudentStatus, theme: TeacherTheme) {
  if (status === "Eligible") {
    return {
      bg: theme.colors.successBg,
      border: theme.colors.successBorder,
      text: theme.colors.text,
      icon: "checkmark-circle-outline" as const,
    };
  }

  if (status === "At risk") {
    return {
      bg: theme.colors.dangerBg,
      border: theme.colors.dangerBorder,
      text: theme.colors.text,
      icon: "alert-circle-outline" as const,
    };
  }

  return {
    bg: theme.colors.warningBg,
    border: theme.colors.warningBorder,
    text: theme.colors.text,
    icon: "time-outline" as const,
  };
}

function getGridItemStyle(columns: number): ViewStyle {
  if (columns <= 1) {
    return { width: "100%" as DimensionValue, maxWidth: "100%" as DimensionValue };
  }

  const percent = `${100 / columns}%` as DimensionValue;
  return { width: percent, maxWidth: percent };
}

type InteractivePressableProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityRole?: "button" | "menu" | "tab";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  hitSlop?: number;
  disabled?: boolean;
};

function InteractivePressable({
  children,
  onPress,
  style,
  contentStyle,
  accessibilityRole = "button",
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  hitSlop,
  disabled,
}: InteractivePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const lift = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  const animateTo = (nextScale: number, nextLift: number) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: nextScale,
        useNativeDriver: true,
        damping: 18,
        stiffness: 230,
      }),
      Animated.timing(lift, {
        toValue: nextLift,
        duration: 130,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressIn = () => animateTo(0.985, Platform.OS === "web" ? -2 : 0);
  const handlePressOut = () => animateTo(1, 0);
  const handleHoverIn = () => {
    if (Platform.OS === "web") animateTo(1, -4);
  };
  const handleHoverOut = () => {
    if (Platform.OS === "web") animateTo(1, 0);
  };

  return (
    <Animated.View
      style={[
        style,
        { transform: [{ translateY: lift }, { scale }] },
        focused ? { borderColor: "#93E1EB" } : null,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={disabled ? undefined : handlePressIn}
        onPressOut={disabled ? undefined : handlePressOut}
        onHoverIn={disabled ? undefined : handleHoverIn}
        onHoverOut={disabled ? undefined : handleHoverOut}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={contentStyle}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        disabled={disabled}
        hitSlop={hitSlop ?? 12}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function TeacherDashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const { width, height } = useWindowDimensions();
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "All">("All");
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("screenReaderChanged", setScreenReaderEnabled);
    return () => sub?.remove?.();
  }, []);

  const navDashboardHref: Href = "/teacher/dashboard";
  const navStudentsHref: Href = "/teacher/students";
  const navReportsHref: Href = "/teacher/reports";
  const navSettingsHref: Href = "/teacher/settings";
  const navUploadHref: Href = "/teacher/upload-results";
  const navNotificationsHref: Href = "/student/notifications";
  const loginHref: Href = "/login";

  const metrics = useMemo(() => {
    const avg = Math.round(STUDENTS.reduce((sum, item) => sum + item.points, 0) / Math.max(1, STUDENTS.length));
    const eligiblePct = Math.round(
      (STUDENTS.filter((item) => item.status === "Eligible").length / Math.max(1, STUDENTS.length)) * 100
    );
    const atRisk = STUDENTS.filter((item) => item.status === "At risk").length;
    return { avg, eligiblePct, atRisk };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDENTS.filter((student) => {
      const matchQuery =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.form.toLowerCase().includes(q) ||
        student.status.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || student.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [query, statusFilter]);

  const sharedStyles = useMemo(() => createTeacherSharedStyles(theme, ui), [theme, ui]);
  const localStyles = useMemo(() => createDashboardStyles(theme, ui), [theme, ui]);
  const styles = useMemo(() => ({ ...sharedStyles, ...localStyles }) as CombinedStyles, [sharedStyles, localStyles]);

  function toggleMenu(open: boolean) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMenuOpen(open);
  }

  function go(path: Href) {
    if (!ui.isDesktop) setMenuOpen(false);
    requestAnimationFrame(() => router.push(path));
  }

  function logout() {
    if (!ui.isDesktop) setMenuOpen(false);
    requestAnimationFrame(() => router.replace(loginHref));
  }

  function openStudent(id: string) {
    router.push({ pathname: "/teacher/student-details", params: { id } });
  }

  function simulateLoading() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), screenReaderEnabled ? 0 : 650);
  }

  return (
    <View style={styles.page}>
      <View style={styles.pageGlowTop} />
      <View style={styles.pageGlowRight} />
      <View style={styles.pageCenter}>
        <View
          style={[
            styles.shell,
            ui.isDesktop || ui.isTablet
              ? {
                  width: "100%",
                  maxWidth: ui.contentMaxWidth,
                  borderRadius: ui.shellRadius,
                  flex: 1,
                  alignSelf: "center",
                }
              : { flex: 1, width: "100%" },
          ]}
        >
          <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
            <View style={styles.appRow}>
              {ui.showDesktopSidebar ? (
                <Sidebar
                  theme={theme}
                  styles={styles}
                  width={ui.sidebarWidth}
                  activeKey="dashboard"
                  schoolName={SCHOOL_NAME}
                  teacherName={TEACHER_NAME}
                  onGo={go}
                  onLogout={logout}
                  hrefs={{
                    dashboard: navDashboardHref,
                    students: navStudentsHref,
                    reports: navReportsHref,
                    settings: navSettingsHref,
                    notifications: navNotificationsHref,
                  }}
                />
              ) : null}

              {ui.isTablet ? (
                <NavRail
                  theme={theme}
                  styles={styles}
                  width={ui.railWidth}
                  activeKey="dashboard"
                  onGo={go}
                  onLogout={logout}
                  hrefs={{
                    dashboard: navDashboardHref,
                    students: navStudentsHref,
                    reports: navReportsHref,
                    settings: navSettingsHref,
                    notifications: navNotificationsHref,
                  }}
                />
              ) : null}

              <View style={styles.main}>
                <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                  <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={ui.isDesktop}
                    keyboardShouldPersistTaps="handled"
                  >
                    <View style={styles.topBar}>
                      <View style={styles.topBarLeft}>
                        <View style={styles.heroBadge}>
                          <Ionicons name="school-outline" size={18} color={theme.colors.text} />
                          <Text style={styles.heroBadgeText}>Teacher portal</Text>
                        </View>

                        <Text style={[styles.h1, ui.isMobile ? styles.h1Mobile : null]}>Dashboard</Text>

                        <Text style={styles.meta} numberOfLines={2}>
                          {SCHOOL_NAME} · {TEACHER_NAME}
                        </Text>
                      </View>

                      <View style={styles.topBarRight}>
                        {!ui.isMobile ? (
                          <PrimaryButton
                            theme={theme}
                            styles={styles}
                            label="Upload results"
                            icon="cloud-upload-outline"
                            onPress={() => go(navUploadHref)}
                            accessibilityLabel="Upload results"
                          />
                        ) : (
                          <IconButton
                            theme={theme}
                            styles={styles}
                            icon="grid-outline"
                            label="Open menu"
                            onPress={() => toggleMenu(true)}
                          />
                        )}
                      </View>
                    </View>

                    <View style={styles.contentStack}>
                      <HeroSummary
                        theme={theme}
                        styles={styles}
                        totalStudents={STUDENTS.length}
                        eligible={STUDENTS.filter((s) => s.status === "Eligible").length}
                        atRisk={STUDENTS.filter((s) => s.status === "At risk").length}
                      />

                      <OverviewSection ui={ui} theme={theme} styles={styles} metrics={metrics} />

                      {ui.showRightPanelBesideContent ? (
                        <View style={styles.desktopGrid}>
                          <View style={styles.leftColumn}>
                            <QuickActionsSection
                              ui={ui}
                              theme={theme}
                              styles={styles}
                              onGo={go}
                              hrefs={{ upload: navUploadHref, reports: navReportsHref, students: navStudentsHref }}
                            />

                            <StudentsSection
                              ui={ui}
                              theme={theme}
                              styles={styles}
                              isLoading={isLoading}
                              query={query}
                              onQuery={setQuery}
                              statusFilter={statusFilter}
                              onStatusFilter={setStatusFilter}
                              rows={filtered}
                              onOpenStudent={openStudent}
                              onGoAll={() => go(navStudentsHref)}
                              onSimulateLoading={simulateLoading}
                            />
                          </View>

                          <View style={styles.rightColumn}>
                            <NoticesPanel
                              theme={theme}
                              styles={styles}
                              onGoReports={() => go(navReportsHref)}
                              onGoNotifications={() => go(navNotificationsHref)}
                            />
                            <View style={styles.rightColumnSpacer} />
                            <AtAGlancePanel theme={theme} styles={styles} rows={STUDENTS} />
                          </View>
                        </View>
                      ) : (
                        <View style={styles.compactDesktopStack}>
                          <QuickActionsSection
                            ui={ui}
                            theme={theme}
                            styles={styles}
                            onGo={go}
                            hrefs={{ upload: navUploadHref, reports: navReportsHref, students: navStudentsHref }}
                          />

                          <PanelGridCompact styles={styles}>
                            <NoticesPanel
                              theme={theme}
                              styles={styles}
                              onGoReports={() => go(navReportsHref)}
                              onGoNotifications={() => go(navNotificationsHref)}
                            />
                            <AtAGlancePanel theme={theme} styles={styles} rows={STUDENTS} />
                          </PanelGridCompact>

                          <StudentsSection
                            ui={ui}
                            theme={theme}
                            styles={styles}
                            isLoading={isLoading}
                            query={query}
                            onQuery={setQuery}
                            statusFilter={statusFilter}
                            onStatusFilter={setStatusFilter}
                            rows={filtered}
                            onOpenStudent={openStudent}
                            onGoAll={() => go(navStudentsHref)}
                            onSimulateLoading={simulateLoading}
                          />
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              </View>
            </View>
          </SafeAreaView>

          {ui.isMobile ? (
            <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => toggleMenu(false)}>
              <Pressable style={styles.modalBackdrop} onPress={() => toggleMenu(false)}>
                <Pressable style={styles.menuCard} onPress={() => {}}>
                  <View style={styles.menuHeaderRow}>
                    <View style={styles.menuHeaderSpacer} />
                    <Text style={styles.menuTitle}>Menu</Text>
                    <InteractivePressable
                      onPress={() => toggleMenu(false)}
                      style={styles.menuCloseOuter}
                      contentStyle={styles.menuCloseBtn}
                    >
                      <Ionicons name="close" size={20} color={theme.colors.text} />
                    </InteractivePressable>
                  </View>

                  <View style={styles.menuDivider} />
                  <MenuItem theme={theme} styles={styles} icon="grid-outline" label="Dashboard" onPress={() => go(navDashboardHref)} />
                  <MenuItem theme={theme} styles={styles} icon="people-outline" label="Students" onPress={() => go(navStudentsHref)} />
                  <MenuItem theme={theme} styles={styles} icon="bar-chart-outline" label="Reports" onPress={() => go(navReportsHref)} />
                  <MenuItem theme={theme} styles={styles} icon="settings-outline" label="Settings" onPress={() => go(navSettingsHref)} />
                  <View style={styles.menuDividerSoft} />
                  <MenuItem
                    theme={theme}
                    styles={styles}
                    icon="notifications-outline"
                    label="Notifications"
                    onPress={() => go(navNotificationsHref)}
                  />
                  <View style={styles.menuDividerSoft} />
                  <MenuItem theme={theme} styles={styles} icon="log-out-outline" label="Logout" danger onPress={logout} />
                </Pressable>
              </Pressable>
            </Modal>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function HeroSummary({
  theme,
  styles,
  totalStudents,
  eligible,
  atRisk,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  totalStudents: number;
  eligible: number;
  atRisk: number;
}) {
  return (
    <Card styles={styles} style={styles.heroSummaryCard}>
      <View style={styles.heroSummaryRow}>
        <View style={styles.heroSummaryLeft}>
          <View style={styles.heroSummaryKicker}>
            <Ionicons name="sparkles-outline" size={16} color={theme.colors.accentCardText} />
            <Text style={styles.heroSummaryKickerText}>Daily class snapshot</Text>
          </View>
          <Text style={styles.heroSummaryTitle}>Everything you need to manage your learners efficiently.</Text>
          <Text style={styles.heroSummaryText}>
            Review performance trends, take action quickly, and keep student progress clearly visible across desktop,
            tablet, and mobile.
          </Text>
        </View>

        <View style={styles.heroSummaryStats}>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniLabel}>Students</Text>
            <Text style={styles.heroMiniValue}>{totalStudents}</Text>
          </View>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniLabel}>Eligible</Text>
            <Text style={styles.heroMiniValue}>{eligible}</Text>
          </View>
          <View style={styles.heroMiniStat}>
            <Text style={styles.heroMiniLabel}>At risk</Text>
            <Text style={styles.heroMiniValue}>{atRisk}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

function OverviewSection({
  ui,
  theme,
  styles,
  metrics,
}: {
  ui: Ui;
  theme: TeacherTheme;
  styles: CombinedStyles;
  metrics: { avg: number; eligiblePct: number; atRisk: number };
}) {
  return (
    <View>
      <SectionHeader
        styles={styles}
        title="Overview"
        subtitle="A clean snapshot of class progress, readiness, and intervention needs."
      />
      <View style={styles.sectionSpacerSm} />
      <View style={styles.metricGrid}>
        <View style={[styles.metricGridItem, getGridItemStyle(ui.metricColumns)]}>
          <MetricCard
            theme={theme}
            styles={styles}
            title="Average points"
            value={`${metrics.avg}`}
            icon="stats-chart-outline"
            hint="Across your students"
            tone="primary"
          />
        </View>

        <View style={[styles.metricGridItem, getGridItemStyle(ui.metricColumns)]}>
          <MetricCard
            theme={theme}
            styles={styles}
            title="% eligible"
            value={`${metrics.eligiblePct}%`}
            icon="checkmark-circle-outline"
            hint="Sponsorship readiness"
            tone="soft"
          />
        </View>

        <View style={[styles.metricGridItem, getGridItemStyle(ui.metricColumns)]}>
          <MetricCard
            theme={theme}
            styles={styles}
            title="At-risk students"
            value={`${metrics.atRisk}`}
            icon="alert-circle-outline"
            hint="Needs intervention"
            tone="soft"
          />
        </View>
      </View>
    </View>
  );
}

function QuickActionsSection({
  ui,
  theme,
  styles,
  onGo,
  hrefs,
}: {
  ui: Ui;
  theme: TeacherTheme;
  styles: CombinedStyles;
  onGo: (href: Href) => void;
  hrefs: { upload: Href; reports: Href; students: Href };
}) {
  return (
    <View>
      <SectionHeader
        styles={styles}
        title="Quick actions"
        subtitle="High-value actions designed for fast daily teacher workflows."
      />
      <View style={styles.sectionSpacerSm} />

      <View style={styles.quickGrid}>
        <View style={[styles.quickGridItem, getGridItemStyle(ui.quickActionColumns)]}>
          <QuickCard
            theme={theme}
            styles={styles}
            title="Upload results"
            subtitle="CSV/Excel import"
            icon="cloud-upload-outline"
            tone="primary"
            onPress={() => onGo(hrefs.upload)}
          />
        </View>

        <View style={[styles.quickGridItem, getGridItemStyle(ui.quickActionColumns)]}>
          <QuickCard
            theme={theme}
            styles={styles}
            title="Generate report"
            subtitle="Class analytics & exports"
            icon="document-text-outline"
            tone="soft"
            onPress={() => onGo(hrefs.reports)}
          />
        </View>
      </View>
    </View>
  );
}

function StudentsSection({
  ui,
  theme,
  styles,
  isLoading,
  query,
  onQuery,
  statusFilter,
  onStatusFilter,
  rows,
  onOpenStudent,
  onGoAll,
  onSimulateLoading,
}: {
  ui: Ui;
  theme: TeacherTheme;
  styles: CombinedStyles;
  isLoading: boolean;
  query: string;
  onQuery: (v: string) => void;
  statusFilter: StudentStatus | "All";
  onStatusFilter: (v: StudentStatus | "All") => void;
  rows: TeacherStudentRow[];
  onOpenStudent: (id: string) => void;
  onGoAll: () => void;
  onSimulateLoading: () => void;
}) {
  const showTable = ui.isDesktop || ui.isTablet;

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderCopy}>
          <Text style={styles.h2}>Your students</Text>
          <Text style={styles.meta}>Search, filter, and review every learner without losing context.</Text>
        </View>

        <View style={styles.sectionHeaderActions}>
          <TextAction
            theme={theme}
            styles={styles}
            label="refresh"
            icon="refresh"
            onPress={onSimulateLoading}
            accessibilityLabel="Refresh students"
          />
          <TextAction
            theme={theme}
            styles={styles}
            label="view all"
            icon="chevron-forward"
            onPress={onGoAll}
            accessibilityLabel="View all students"
          />
        </View>
      </View>

      <View style={styles.sectionSpacerSm} />

      <Card styles={styles} style={styles.filterCard}>
        <View style={styles.filtersRow}>
          <View style={styles.searchColumn}>
            <Text style={styles.filterLabel}>Search</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={theme.colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={onQuery}
                placeholder="Search by name, form, or status…"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.searchInput}
                accessibilityLabel="Search students"
                returnKeyType="search"
                autoCorrect={false}
              />
              {query.trim() ? (
                <InteractivePressable
                  onPress={() => onQuery("")}
                  style={styles.clearBtnOuter}
                  contentStyle={styles.clearBtn}
                  accessibilityLabel="Clear search"
                  hitSlop={10}
                >
                  <Ionicons name="close" size={16} color={theme.colors.accentCardText} />
                </InteractivePressable>
              ) : null}
            </View>
          </View>

          <View style={styles.filterSpacer} />

          <View style={styles.statusColumn}>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.chipsRow}>
              <Chip theme={theme} styles={styles} label="All" active={statusFilter === "All"} onPress={() => onStatusFilter("All")} />
              <Chip
                theme={theme}
                styles={styles}
                label="Eligible"
                active={statusFilter === "Eligible"}
                onPress={() => onStatusFilter("Eligible")}
              />
              <Chip
                theme={theme}
                styles={styles}
                label="Not yet"
                active={statusFilter === "Not yet"}
                onPress={() => onStatusFilter("Not yet")}
              />
              <Chip
                theme={theme}
                styles={styles}
                label="At risk"
                active={statusFilter === "At risk"}
                onPress={() => onStatusFilter("At risk")}
              />
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.sectionSpacerSm} />

      {isLoading ? (
        <Card styles={styles} style={styles.loadingCard}>
          <ActivityIndicator color={theme.colors.primaryStrong} />
          <Text style={styles.metaStrong}>Loading students…</Text>
          <SkeletonRows styles={styles} />
        </Card>
      ) : rows.length === 0 ? (
        <Card styles={styles} style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={22} color={theme.colors.text} />
          </View>
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptyText}>Try a different search term or adjust the status filter.</Text>
          <View style={styles.emptyActions}>
            <SecondaryButton
              theme={theme}
              styles={styles}
              label="View all students"
              icon="people-outline"
              onPress={onGoAll}
              accessibilityLabel="View all students"
            />
          </View>
        </Card>
      ) : showTable ? (
        <StudentsTable theme={theme} styles={styles} rows={rows} onOpenStudent={onOpenStudent} />
      ) : (
        <StudentsCardList theme={theme} styles={styles} rows={rows} onOpenStudent={onOpenStudent} />
      )}
    </View>
  );
}

function NoticesPanel({
  theme,
  styles,
  onGoReports,
  onGoNotifications,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  onGoReports: () => void;
  onGoNotifications: () => void;
}) {
  return (
    <Card styles={styles} style={styles.noticeCard}>
      <View style={styles.panelHeaderRow}>
        <Text style={styles.h2}>Notices</Text>
        <View style={styles.noticeBadge}>
          <Text style={styles.noticeBadgeText}>Updated</Text>
        </View>
      </View>

      <NoticeItem
        theme={theme}
        styles={styles}
        icon="information-circle-outline"
        text="Complete your class profile to improve reporting quality."
      />
      <NoticeItem
        theme={theme}
        styles={styles}
        icon="alert-circle-outline"
        text='Review "At risk" students weekly and add intervention notes.'
      />

      <View style={styles.panelActions}>
        <SecondaryButton
          theme={theme}
          styles={styles}
          label="Generate report"
          icon="document-text-outline"
          onPress={onGoReports}
          accessibilityLabel="Generate report"
        />
        <View style={styles.panelActionSpacer} />
        <SecondaryButton
          theme={theme}
          styles={styles}
          label="Notifications"
          icon="notifications-outline"
          onPress={onGoNotifications}
          accessibilityLabel="Notifications"
        />
      </View>
    </Card>
  );
}

function AtAGlancePanel({
  theme,
  styles,
  rows,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  rows: TeacherStudentRow[];
}) {
  return (
    <Card styles={styles} style={styles.glanceCard}>
      <Text style={styles.h2}>At-a-glance</Text>
      <View style={styles.miniStatSpacer} />
      <MiniStat
        theme={theme}
        styles={styles}
        label="Eligible"
        value={`${rows.filter((s) => s.status === "Eligible").length}`}
        icon="checkmark-circle-outline"
      />
      <MiniStat
        theme={theme}
        styles={styles}
        label="Not yet"
        value={`${rows.filter((s) => s.status === "Not yet").length}`}
        icon="time-outline"
      />
      <MiniStat
        theme={theme}
        styles={styles}
        label="At risk"
        value={`${rows.filter((s) => s.status === "At risk").length}`}
        icon="alert-circle-outline"
      />
    </Card>
  );
}

function PanelGridCompact({
  children,
  styles,
}: {
  children: React.ReactNode;
  styles: CombinedStyles;
}) {
  return (
    <View style={styles.panelGridCompact}>
      {React.Children.map(children, (child, index) => (
        <View key={index} style={styles.panelGridCompactItem}>
          {child}
        </View>
      ))}
    </View>
  );
}

function Sidebar({
  theme,
  styles,
  width,
  activeKey,
  schoolName,
  teacherName,
  onGo,
  onLogout,
  hrefs,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  width: number;
  activeKey: "dashboard" | "students" | "reports" | "settings";
  schoolName: string;
  teacherName: string;
  onGo: (href: Href) => void;
  onLogout: () => void;
  hrefs: { dashboard: Href; students: Href; reports: Href; settings: Href; notifications: Href };
}) {
  return (
    <View style={[styles.sidebar, { width }]}>
      <View style={styles.sidebarBrand}>
        <View style={styles.brandLogo}>
          <Ionicons name="school-outline" size={18} color={theme.colors.text} />
        </View>
        <View style={styles.flexFill}>
          <Text style={styles.brandName}>UniPathway</Text>
          <Text style={styles.brandSub} numberOfLines={1}>
            Teacher portal
          </Text>
        </View>
      </View>

      <View style={styles.sidebarDivider} />

      <SidebarItem
        theme={theme}
        styles={styles}
        active={activeKey === "dashboard"}
        icon="grid-outline"
        label="Dashboard"
        onPress={() => onGo(hrefs.dashboard)}
      />
      <SidebarItem
        theme={theme}
        styles={styles}
        active={activeKey === "students"}
        icon="people-outline"
        label="Students"
        onPress={() => onGo(hrefs.students)}
      />
      <SidebarItem
        theme={theme}
        styles={styles}
        active={activeKey === "reports"}
        icon="bar-chart-outline"
        label="Reports"
        onPress={() => onGo(hrefs.reports)}
      />
      <SidebarItem
        theme={theme}
        styles={styles}
        active={activeKey === "settings"}
        icon="settings-outline"
        label="Settings"
        onPress={() => onGo(hrefs.settings)}
      />

      <View style={styles.sidebarDividerSoft} />

      <SidebarItem
        theme={theme}
        styles={styles}
        icon="notifications-outline"
        label="Notifications"
        onPress={() => onGo(hrefs.notifications)}
      />
      <SidebarItem theme={theme} styles={styles} icon="log-out-outline" label="Logout" danger onPress={onLogout} />

      <View style={styles.flexSpacer} />

      <View style={styles.sidebarFoot}>
        <Text style={styles.sidebarFootText} numberOfLines={2}>
          {schoolName}
        </Text>
        <Text style={styles.sidebarFootSub} numberOfLines={1}>
          {teacherName}
        </Text>
      </View>
    </View>
  );
}

function NavRail({
  theme,
  styles,
  width,
  activeKey,
  onGo,
  onLogout,
  hrefs,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  width: number;
  activeKey: "dashboard" | "students" | "reports" | "settings";
  onGo: (href: Href) => void;
  onLogout: () => void;
  hrefs: { dashboard: Href; students: Href; reports: Href; settings: Href; notifications: Href };
}) {
  return (
    <View style={[styles.rail, { width }]}>
      <View style={styles.railTop}>
        <View style={styles.railLogo}>
          <Ionicons name="school-outline" size={18} color={theme.colors.text} />
        </View>
      </View>

      <View style={styles.railSpacer} />

      <RailItem
        theme={theme}
        styles={styles}
        icon="grid-outline"
        label="Dashboard"
        active={activeKey === "dashboard"}
        onPress={() => onGo(hrefs.dashboard)}
      />
      <RailItem
        theme={theme}
        styles={styles}
        icon="people-outline"
        label="Students"
        active={activeKey === "students"}
        onPress={() => onGo(hrefs.students)}
      />
      <RailItem
        theme={theme}
        styles={styles}
        icon="bar-chart-outline"
        label="Reports"
        active={activeKey === "reports"}
        onPress={() => onGo(hrefs.reports)}
      />
      <RailItem
        theme={theme}
        styles={styles}
        icon="settings-outline"
        label="Settings"
        active={activeKey === "settings"}
        onPress={() => onGo(hrefs.settings)}
      />

      <View style={styles.railDivider} />

      <RailItem
        theme={theme}
        styles={styles}
        icon="notifications-outline"
        label="Notifications"
        onPress={() => onGo(hrefs.notifications)}
      />
      <RailItem theme={theme} styles={styles} icon="log-out-outline" label="Logout" danger onPress={onLogout} />
    </View>
  );
}

function SectionHeader({
  styles,
  title,
  subtitle,
}: {
  styles: CombinedStyles;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeaderBlock}>
      <Text style={styles.h2}>{title}</Text>
      {subtitle ? <Text style={styles.meta}>{subtitle}</Text> : null}
    </View>
  );
}

function Card({
  styles,
  children,
  style,
}: {
  styles: CombinedStyles;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function IconButton({
  theme,
  styles,
  icon,
  label,
  onPress,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.iconButtonOuter}
      contentStyle={styles.iconBtn}
      accessibilityLabel={label}
      hitSlop={8}
    >
      <Ionicons name={icon} size={18} color={theme.colors.accentCardText} />
    </InteractivePressable>
  );
}

function PrimaryButton({
  theme,
  styles,
  label,
  icon,
  onPress,
  accessibilityLabel,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.primaryBtnOuter}
      contentStyle={styles.primaryBtn}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.btnIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.accentCardText} />
      </View>
      <Text style={styles.btnTextPrimary}>{label}</Text>
    </InteractivePressable>
  );
}

function SecondaryButton({
  theme,
  styles,
  label,
  icon,
  onPress,
  accessibilityLabel,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.secondaryBtnOuter}
      contentStyle={styles.secondaryBtn}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.btnIconSoft}>
        <Ionicons name={icon} size={18} color={theme.colors.text} />
      </View>
      <Text style={styles.btnText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textSoft} />
    </InteractivePressable>
  );
}

function TextAction({
  theme,
  styles,
  label,
  icon,
  onPress,
  accessibilityLabel,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.linkButtonOuter}
      contentStyle={styles.linkBtn}
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.linkText}>{label}</Text>
      <Ionicons name={icon} size={16} color={theme.colors.text} />
    </InteractivePressable>
  );
}

function Chip({
  theme,
  styles,
  label,
  active,
  onPress,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.chipOuter}
      contentStyle={[styles.chip, active ? styles.chipActive : null]}
      accessibilityLabel={`Filter ${label}`}
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]} numberOfLines={1}>
        {label}
      </Text>
    </InteractivePressable>
  );
}

function MetricCard({
  theme,
  styles,
  title,
  value,
  icon,
  hint,
  tone,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint: string;
  tone: "primary" | "soft";
}) {
  return (
    <View style={[styles.metricCard, tone === "primary" ? styles.metricCardPrimary : styles.metricCardSoft]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, tone === "primary" ? styles.metricIconPrimary : null]}>
          <Ionicons name={icon} size={18} color={tone === "primary" ? theme.colors.accentCardText : theme.colors.text} />
        </View>
        <Text style={[styles.metricTitle, tone === "primary" ? styles.metricTitlePrimary : null]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Text
        style={[styles.metricValue, tone === "primary" ? styles.metricValuePrimary : null]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
      >
        {value}
      </Text>

      <Text style={[styles.metricHint, tone === "primary" ? styles.metricHintPrimary : null]} numberOfLines={2}>
        {hint}
      </Text>
    </View>
  );
}

function QuickCard({
  theme,
  styles,
  title,
  subtitle,
  icon,
  tone,
  onPress,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "primary" | "soft";
  onPress: () => void;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.quickCardOuter}
      contentStyle={[styles.quickCard, tone === "primary" ? styles.quickCardPrimary : styles.quickCardSoft]}
      accessibilityLabel={title}
      accessibilityHint={subtitle}
    >
      <View style={[styles.quickIcon, tone === "primary" ? styles.quickIconPrimary : null]}>
        <Ionicons name={icon} size={18} color={tone === "primary" ? theme.colors.accentCardText : theme.colors.text} />
      </View>

      <View style={styles.flexFill}>
        <Text style={[styles.quickTitle, tone === "primary" ? styles.quickTitlePrimary : null]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.quickSub, tone === "primary" ? styles.quickSubPrimary : null]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={tone === "primary" ? theme.colors.accentCardText : theme.colors.textSoft}
      />
    </InteractivePressable>
  );
}

function StatusChip({
  theme,
  styles,
  status,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  status: StudentStatus;
}) {
  const tone = getStatusTone(status, theme);

  return (
    <View style={[styles.statusChip, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Ionicons name={tone.icon} size={14} color={tone.text} />
      <Text style={styles.statusText} numberOfLines={1}>
        {status}
      </Text>
    </View>
  );
}

function StudentsTable({
  theme,
  styles,
  rows,
  onOpenStudent,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  rows: TeacherStudentRow[];
  onOpenStudent: (id: string) => void;
}) {
  return (
    <Card styles={styles} style={styles.tableCard}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === "web"}
        contentContainerStyle={styles.tableScrollContent}
      >
        <View style={styles.tableContainer}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, styles.thName]}>Name</Text>
            <Text style={[styles.th, styles.thForm]}>Form</Text>
            <Text style={[styles.th, styles.thPoints]}>Points</Text>
            <Text style={[styles.th, styles.thStatus]}>Status</Text>
            <Text style={[styles.th, styles.thUpdated]}>Updated</Text>
            <Text style={[styles.th, styles.thView]}>View</Text>
          </View>

          <View style={styles.tableDivider} />

          {rows.slice(0, 50).map((student, index) => (
            <InteractivePressable
              key={student.id}
              onPress={() => onOpenStudent(student.id)}
              style={[styles.tableRowOuter, index !== Math.min(rows.length, 50) - 1 ? styles.trBorder : null]}
              contentStyle={styles.tr}
              accessibilityLabel={`View ${student.name}`}
            >
              <View style={[styles.tdNameWrap, styles.tdName]}>
                <View style={styles.rowAvatar}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.text} />
                </View>
                <Text style={styles.tdNameText} numberOfLines={1}>
                  {student.name}
                </Text>
              </View>

              <Text style={[styles.td, styles.tdForm]} numberOfLines={1}>
                {student.form}
              </Text>

              <Text style={[styles.td, styles.tdPoints]} numberOfLines={1}>
                {student.points}
              </Text>

              <View style={styles.tdStatus}>
                <StatusChip theme={theme} styles={styles} status={student.status} />
              </View>

              <Text style={[styles.tdMuted, styles.tdUpdated]} numberOfLines={1}>
                {student.updated}
              </Text>

              <View style={styles.tdView}>
                <View style={styles.viewPill}>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.accentCardText} />
                </View>
              </View>
            </InteractivePressable>
          ))}
        </View>
      </ScrollView>
    </Card>
  );
}

function StudentsCardList({
  theme,
  styles,
  rows,
  onOpenStudent,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  rows: TeacherStudentRow[];
  onOpenStudent: (id: string) => void;
}) {
  return (
    <View>
      {rows.slice(0, 30).map((student) => (
        <InteractivePressable
          key={student.id}
          onPress={() => onOpenStudent(student.id)}
          style={styles.studentCardOuter}
          contentStyle={styles.studentCard}
          accessibilityLabel={`Open ${student.name}`}
        >
          <View style={styles.studentCardTop}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={18} color={theme.colors.text} />
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.bodyStrong} numberOfLines={1}>
                {student.name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {student.form} · {student.updated}
              </Text>
            </View>

            <View style={styles.studentMetaRight}>
              <Text style={styles.points}>{student.points}</Text>
              <StatusChip theme={theme} styles={styles} status={student.status} />
            </View>
          </View>

          <View style={styles.cardFooterSpacer} />

          <View style={styles.cardFooterRow}>
            <Text style={styles.meta}>Tap to view details</Text>
            <View style={styles.viewPill}>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.accentCardText} />
            </View>
          </View>
        </InteractivePressable>
      ))}
    </View>
  );
}

function MiniStat({
  theme,
  styles,
  label,
  value,
  icon,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.miniStatRow}>
      <View style={styles.miniStatIcon}>
        <Ionicons name={icon} size={18} color={theme.colors.text} />
      </View>
      <Text style={styles.bodyStrongFlex} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.miniStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function NoticeItem({
  theme,
  styles,
  icon,
  text,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.noticeRow}>
      <View style={styles.noticeIcon}>
        <Ionicons name={icon} size={16} color={theme.colors.text} />
      </View>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

function SkeletonRows({
  styles,
}: {
  styles: CombinedStyles;
}) {
  return (
    <View style={styles.skeletonWrap}>
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.skeletonRow}>
          <View style={[styles.skeletonBlock, styles.skeletonAvatar]} />
          <View style={styles.skeletonTextWrap}>
            <View style={[styles.skeletonBlock, styles.skeletonLineLg]} />
            <View style={[styles.skeletonBlock, styles.skeletonLineSm]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function SidebarItem({
  theme,
  styles,
  icon,
  label,
  onPress,
  active,
  danger,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.sidebarItemOuter}
      contentStyle={[styles.sidebarItem, active ? styles.sidebarItemActive : null]}
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
    >
      <View style={[styles.sidebarIconWrap, danger ? styles.sidebarIconWrapDanger : null]}>
        <Ionicons name={icon} size={18} color={danger ? theme.colors.dangerText : theme.colors.text} />
      </View>

      <Text style={[styles.sidebarItemText, danger ? styles.sidebarItemTextDanger : null]} numberOfLines={1}>
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={danger ? theme.colors.dangerText : theme.colors.textSoft}
      />
    </InteractivePressable>
  );
}

function RailItem({
  theme,
  styles,
  icon,
  label,
  onPress,
  active,
  danger,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.railItemOuter}
      contentStyle={[styles.railItem, active ? styles.railItemActive : null]}
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      hitSlop={8}
    >
      <Ionicons name={icon} size={20} color={danger ? theme.colors.dangerText : theme.colors.text} />
    </InteractivePressable>
  );
}

function MenuItem({
  theme,
  styles,
  icon,
  label,
  onPress,
  danger,
}: {
  theme: TeacherTheme;
  styles: CombinedStyles;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <InteractivePressable
      onPress={onPress}
      style={styles.menuItemOuter}
      contentStyle={styles.menuItem}
      accessibilityLabel={label}
    >
      <View style={[styles.menuIconWrap, danger ? styles.menuIconWrapDanger : null]}>
        <Ionicons name={icon} size={18} color={danger ? theme.colors.dangerText : theme.colors.text} />
      </View>

      <Text style={[styles.menuItemText, danger ? styles.menuItemTextDanger : null]} numberOfLines={1}>
        {label}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={danger ? theme.colors.dangerText : theme.colors.textSoft}
      />
    </InteractivePressable>
  );
}

function createDashboardStyles(theme: TeacherTheme, ui: Ui) {
  return StyleSheet.create({
    contentStack: {
      marginTop: spacing(5),
      gap: spacing(5),
    },

    topBar: {
      flexDirection: "row",
      alignItems: ui.isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },

    topBarLeft: {
      flex: 1,
      minWidth: 0,
    },

    topBarRight: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      flexShrink: 0,
      marginLeft: spacing(3),
    },

    heroBadge: {
      alignSelf: "flex-start",
      minHeight: 34,
      paddingHorizontal: spacing(3),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      marginBottom: spacing(3),
    },

    heroBadgeText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    h1: {
      ...theme.type.hero,
      color: theme.colors.text,
    },

    h1Mobile: {
      fontSize: 26,
      lineHeight: 32,
    },

    h2: {
      ...theme.type.h2,
      color: theme.colors.text,
    },

    meta: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },

    metaStrong: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      marginTop: spacing(3),
    },

    bodyStrong: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    bodyStrongFlex: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      flex: 1,
    },

    sectionHeaderBlock: {
      gap: spacing(1),
    },

    sectionHeaderRow: {
      flexDirection: ui.isMobile ? "column" : "row",
      alignItems: ui.isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },

    sectionHeaderCopy: {
      flex: 1,
      minWidth: 0,
    },

    sectionHeaderActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      marginLeft: ui.isMobile ? 0 : spacing(3),
      marginRight: -spacing(1),
    },

    sectionSpacerSm: {
      height: spacing(3),
    },

    desktopGrid: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(4),
    },

    leftColumn: {
      flex: 1,
      minWidth: 0,
      gap: spacing(4),
    },

    rightColumn: {
      width: ui.rightPanelWidth,
      minWidth: ui.rightPanelWidth,
      flexShrink: 0,
    },

    rightColumnSpacer: {
      height: spacing(3),
    },

    compactDesktopStack: {
      gap: spacing(5),
    },

    panelGridCompact: {
      flexDirection: ui.isDesktop ? "row" : "column",
      alignItems: "stretch",
      gap: spacing(4),
    },

    panelGridCompactItem: {
      flex: ui.isDesktop ? 1 : 0,
      minWidth: 0,
    },

    sidebar: {
      backgroundColor: theme.colors.sidebarBg,
      borderRightWidth: 1,
      borderRightColor: theme.colors.divider,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(4),
    },

    sidebarBrand: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.sidebarItem,
      borderRadius: theme.radius.xl,
      padding: spacing(3),
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },

    brandLogo: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing(3),
    },

    brandName: {
      ...theme.type.h3,
      color: theme.colors.text,
    },

    brandSub: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: 2,
    },

    sidebarDivider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: spacing(4),
    },

    sidebarDividerSoft: {
      height: 1,
      backgroundColor: theme.colors.dividerSoft,
      marginTop: spacing(2),
      marginBottom: spacing(4),
    },

    sidebarItemOuter: {
      marginBottom: spacing(2),
      borderRadius: theme.radius.lg,
    },

    sidebarItem: {
      minHeight: 54,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.sidebarItem,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      flexDirection: "row",
      alignItems: "center",
    },

    sidebarItemActive: {
      backgroundColor: theme.colors.surfaceStrong,
      borderColor: theme.colors.focusRing,
    },

    sidebarIconWrap: {
      width: 38,
      height: 38,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing(3),
    },

    sidebarIconWrapDanger: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },

    sidebarItemText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      flex: 1,
    },

    sidebarItemTextDanger: {
      color: theme.colors.dangerText,
    },

    sidebarFoot: {
      backgroundColor: theme.colors.sidebarItem,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      borderRadius: theme.radius.xl,
      padding: spacing(3),
    },

    sidebarFootText: {
      ...theme.type.meta,
      color: theme.colors.text,
      lineHeight: 18,
    },

    sidebarFootSub: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },

    rail: {
      backgroundColor: theme.colors.sidebarBg,
      borderRightWidth: 1,
      borderRightColor: theme.colors.divider,
      paddingVertical: spacing(4),
      alignItems: "center",
    },

    railTop: {
      paddingHorizontal: spacing(2),
    },

    railLogo: {
      width: 50,
      height: 50,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.sidebarItem,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    railSpacer: {
      height: spacing(3),
    },

    railItemOuter: {
      borderRadius: theme.radius.lg,
      marginBottom: spacing(2),
    },

    railItem: {
      width: 58,
      height: 58,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.sidebarItem,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    railItemActive: {
      backgroundColor: theme.colors.surfaceStrong,
      borderColor: theme.colors.focusRing,
    },

    railDivider: {
      height: 1,
      width: 58,
      backgroundColor: theme.colors.divider,
      marginVertical: spacing(3),
    },

    iconButtonOuter: {
      borderRadius: theme.radius.md,
    },

    iconBtn: {
      width: 46,
      height: 46,
      minWidth: 46,
      minHeight: 46,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      marginLeft: spacing(2),
    },

    primaryBtnOuter: {
      borderRadius: theme.radius.md,
    },

    primaryBtn: {
      minHeight: 48,
      paddingHorizontal: spacing(4),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing(2),
    },

    secondaryBtnOuter: {
      borderRadius: theme.radius.lg,
    },

    secondaryBtn: {
      minHeight: 50,
      width: "100%",
      borderRadius: theme.radius.lg,
      paddingHorizontal: spacing(3),
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
    },

    btnIcon: {
      width: 30,
      height: 30,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.52)",
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      marginRight: spacing(2),
    },

    btnIconSoft: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
    },

    btnText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      flex: 1,
      flexShrink: 1,
    },

    btnTextPrimary: {
      ...theme.type.bodyStrong,
      color: theme.colors.accentCardText,
      flexShrink: 1,
    },

    heroSummaryCard: {
      padding: spacing(5),
      backgroundColor: theme.colors.accent,
      borderColor: "rgba(7,50,58,0.10)",
    },

    heroSummaryRow: {
      flexDirection: ui.isMobile ? "column" : "row",
      alignItems: ui.isMobile ? "stretch" : "center",
      justifyContent: "space-between",
      gap: spacing(4),
    },

    heroSummaryLeft: {
      flex: 1,
      minWidth: 0,
    },

    heroSummaryKicker: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      minHeight: 32,
      paddingHorizontal: spacing(3),
      borderRadius: theme.radius.pill,
      backgroundColor: "rgba(255,255,255,0.50)",
      borderWidth: 1,
      borderColor: "rgba(7,50,58,0.10)",
      marginBottom: spacing(3),
    },

    heroSummaryKickerText: {
      ...theme.type.caption,
      color: theme.colors.accentCardText,
    },

    heroSummaryTitle: {
      fontSize: ui.isMobile ? 24 : 30,
      lineHeight: ui.isMobile ? 30 : 36,
      fontWeight: "900",
      color: theme.colors.accentCardText,
      letterSpacing: -0.4,
    } as TextStyle,

    heroSummaryText: {
      ...theme.type.body,
      color: "rgba(7,50,58,0.78)",
      marginTop: spacing(2),
      maxWidth: 700,
    },

    heroSummaryStats: {
      flexDirection: ui.isMobile ? "row" : "column",
      flexWrap: ui.isMobile ? "wrap" : "nowrap",
      gap: spacing(2),
      minWidth: ui.isMobile ? 0 : 180,
    },

    heroMiniStat: {
      backgroundColor: "rgba(255,255,255,0.52)",
      borderWidth: 1,
      borderColor: "rgba(7,50,58,0.10)",
      borderRadius: theme.radius.lg,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(3),
      minWidth: 110,
      flexGrow: ui.isMobile ? 1 : 0,
    },

    heroMiniLabel: {
      ...theme.type.caption,
      color: "rgba(7,50,58,0.70)",
    },

    heroMiniValue: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "900",
      color: theme.colors.accentCardText,
      marginTop: 2,
    } as TextStyle,

    card: {
      width: "100%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      overflow: "hidden",
      ...theme.shadow,
    },

    noticeCard: {
      padding: spacing(4),
    },

    glanceCard: {
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3),
    },

    panelHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(2),
      marginBottom: spacing(3),
    },

    noticeBadge: {
      minHeight: 30,
      paddingHorizontal: spacing(2.5),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    noticeBadgeText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    noticeRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(2),
      marginBottom: spacing(3),
    },

    noticeIcon: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },

    noticeText: {
      ...theme.type.body,
      color: theme.colors.textMuted,
      flex: 1,
    },

    panelActions: {
      marginTop: spacing(2),
    },

    panelActionSpacer: {
      height: spacing(2),
    },

    metricGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -spacing(1.5),
      alignItems: "stretch",
    },

    metricGridItem: {
      paddingHorizontal: spacing(1.5),
      marginBottom: spacing(3),
    },

    metricCard: {
      minHeight: ui.isMobile ? 154 : 170,
      borderRadius: theme.radius.xl,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(4),
      borderWidth: 1,
      justifyContent: "space-between",
      width: "100%",
    },

    metricCardPrimary: {
      backgroundColor: theme.colors.accent,
      borderColor: "rgba(7,50,58,0.10)",
    },

    metricCardSoft: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.dividerSoft,
    },

    metricTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing(3),
    },

    metricIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing(3),
    },

    metricIconPrimary: {
      backgroundColor: "rgba(255,255,255,0.52)",
      borderColor: "rgba(7,50,58,0.10)",
    },

    metricTitle: {
      ...theme.type.caption,
      color: theme.colors.text,
      flex: 1,
    },

    metricTitlePrimary: {
      color: theme.colors.accentCardText,
    },

    metricValue: {
      fontSize: ui.isMobile ? 32 : 38,
      lineHeight: ui.isMobile ? 38 : 44,
      fontWeight: "900",
      color: theme.colors.text,
    } as TextStyle,

    metricValuePrimary: {
      color: theme.colors.accentCardText,
    },

    metricHint: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },

    metricHintPrimary: {
      color: "rgba(7,50,58,0.74)",
    },

    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -spacing(1.5),
      alignItems: "stretch",
    },

    quickGridItem: {
      paddingHorizontal: spacing(1.5),
      marginBottom: spacing(3),
    },

    quickCardOuter: {
      borderRadius: theme.radius.xl,
    },

    quickCard: {
      minHeight: 88,
      borderRadius: theme.radius.xl,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3.5),
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      width: "100%",
    },

    quickCardPrimary: {
      backgroundColor: theme.colors.accent,
      borderColor: "rgba(7,50,58,0.10)",
    },

    quickCardSoft: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.dividerSoft,
    },

    quickIcon: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    quickIconPrimary: {
      backgroundColor: "rgba(255,255,255,0.52)",
      borderColor: "rgba(7,50,58,0.10)",
    },

    quickTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    quickTitlePrimary: {
      color: theme.colors.accentCardText,
    },

    quickSub: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: 2,
    },

    quickSubPrimary: {
      color: "rgba(7,50,58,0.74)",
    },

    linkButtonOuter: {
      borderRadius: theme.radius.md,
      marginLeft: spacing(1),
    },

    linkBtn: {
      minHeight: 42,
      paddingHorizontal: spacing(3),
      borderRadius: theme.radius.md,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(1),
      justifyContent: "center",
      backgroundColor: "transparent",
    },

    linkText: {
      ...theme.type.caption,
      color: theme.colors.text,
      textTransform: "lowercase",
    },

    filterCard: {
      padding: spacing(4),
      backgroundColor: theme.colors.surfaceRaised,
    },

    filtersRow: {
      flexDirection: ui.isMobile ? "column" : "row",
      alignItems: ui.isMobile ? "stretch" : "flex-start",
      justifyContent: "space-between",
    },

    searchColumn: {
      flex: 1.15,
      minWidth: ui.isMobile ? 0 : 320,
    },

    statusColumn: {
      flexShrink: 0,
      minWidth: ui.isWideDesktop ? 340 : ui.isDesktop ? 280 : undefined,
      width: ui.isMobile ? "100%" : undefined,
    },

    filterSpacer: {
      width: ui.isMobile ? 0 : spacing(4),
      height: ui.isMobile ? spacing(3) : 0,
    },

    filterLabel: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    },

    searchBox: {
      marginTop: spacing(2),
      minHeight: 50,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      flexDirection: "row",
      alignItems: "center",
    },

    searchInput: {
      flex: 1,
      marginLeft: spacing(2),
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "800",
      paddingVertical: 0,
      minHeight: 44,
      ...Platform.select({
        web: {
          outlineStyle: "none" as never,
        },
      }),
    },

    clearBtnOuter: {
      borderRadius: theme.radius.pill,
      marginLeft: spacing(1),
    },

    clearBtn: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      alignItems: "center",
      justifyContent: "center",
    },

    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: spacing(2),
    },

    chipOuter: {
      borderRadius: theme.radius.pill,
      marginRight: spacing(2),
      marginBottom: spacing(2),
    },

    chip: {
      minHeight: 40,
      paddingHorizontal: spacing(3),
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      backgroundColor: theme.colors.surfaceStrong,
      alignItems: "center",
      justifyContent: "center",
    },

    chipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: "rgba(7,50,58,0.10)",
    },

    chipText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    chipTextActive: {
      color: theme.colors.accentCardText,
    },

    loadingCard: {
      padding: spacing(5),
      alignItems: "center",
      justifyContent: "center",
    },

    skeletonWrap: {
      width: "100%",
      marginTop: spacing(4),
    },

    skeletonRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing(3),
    },

    skeletonAvatar: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      marginRight: spacing(3),
    },

    skeletonTextWrap: {
      flex: 1,
      gap: spacing(2),
    },

    skeletonLineLg: {
      height: 14,
      width: "70%",
      borderRadius: theme.radius.pill,
    },

    skeletonLineSm: {
      height: 12,
      width: "42%",
      borderRadius: theme.radius.pill,
    },

    skeletonBlock: {
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
    },

    emptyCard: {
      padding: spacing(6),
      alignItems: "center",
      justifyContent: "center",
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing(3),
    },

    emptyTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
      textAlign: "center",
    },

    emptyText: {
      ...theme.type.body,
      color: theme.colors.textMuted,
      textAlign: "center",
      marginTop: spacing(2),
      maxWidth: 400,
    },

    emptyActions: {
      marginTop: spacing(4),
      width: ui.isMobile ? "100%" : undefined,
      minWidth: ui.isMobile ? undefined : 240,
    },

    tableCard: {
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceRaised,
    },

    tableScrollContent: {
      minWidth: ui.tableMinWidth,
      flexGrow: 1,
    },

    tableContainer: {
      flex: 1,
      minWidth: ui.tableMinWidth,
    },

    tableHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3),
      backgroundColor: theme.colors.tableHeaderBg,
    },

    th: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    },

    thName: { flex: 2.9 },
    thForm: { flex: 1.05 },
    thPoints: { flex: 0.85, textAlign: "right" },
    thStatus: { flex: 1.2 },
    thUpdated: { flex: 1.05 },
    thView: { width: 74, textAlign: "right" },

    tableDivider: {
      height: 1,
      backgroundColor: theme.colors.dividerSoft,
    },

    tableRowOuter: {
      borderRadius: 0,
    },

    tr: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(4),
      backgroundColor: theme.colors.surfaceRaised,
      minHeight: 76,
    },

    trBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
    },

    td: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    tdMuted: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    tdNameWrap: {
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },

    rowAvatar: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing(3),
      flexShrink: 0,
    },

    tdNameText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      flex: 1,
    },

    tdName: { flex: 2.9 },
    tdForm: { flex: 1.05 },
    tdPoints: { flex: 0.85, textAlign: "right" },
    tdStatus: { flex: 1.2, paddingLeft: spacing(1) },
    tdUpdated: { flex: 1.05 },
    tdView: { width: 74, alignItems: "flex-end" },

    statusChip: {
      minHeight: 32,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
    },

    statusText: {
      ...theme.type.caption,
      color: theme.colors.text,
      marginLeft: spacing(1),
    },

    viewPill: {
      width: 42,
      height: 38,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.accent,
      borderWidth: 1,
      borderColor: "rgba(7,50,58,0.10)",
      alignItems: "center",
      justifyContent: "center",
    },

    studentCardOuter: {
      borderRadius: theme.radius.xl,
      marginBottom: spacing(3),
    },

    studentCard: {
      backgroundColor: theme.colors.surfaceRaised,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
    },

    studentCardTop: {
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    studentInfo: {
      flex: 1,
      marginLeft: spacing(3),
      minWidth: 0,
    },

    studentMetaRight: {
      alignItems: "flex-end",
      marginLeft: spacing(2),
      flexShrink: 0,
    },

    points: {
      fontSize: 22,
      lineHeight: 26,
      fontWeight: "900",
      color: theme.colors.text,
      textAlign: "right",
      marginBottom: spacing(1),
    } as TextStyle,

    cardFooterSpacer: {
      height: spacing(3),
    },

    cardFooterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(2),
    },

    miniStatSpacer: {
      height: spacing(2),
    },

    miniStatRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },

    miniStatIcon: {
      width: 38,
      height: 38,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing(3),
    },

    miniStatValue: {
      ...theme.type.h3,
      color: theme.colors.text,
      marginLeft: spacing(3),
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing(4),
    },

    menuCard: {
      width: "100%",
      maxWidth: 380,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.shellBg,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(4),
      ...theme.shadow,
    },

    menuHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: spacing(2),
    },

    menuHeaderSpacer: {
      width: 34,
    },

    menuTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
      letterSpacing: 0.2,
    },

    menuCloseOuter: {
      borderRadius: theme.radius.pill,
    },

    menuCloseBtn: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },

    menuDivider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginBottom: spacing(3),
    },

    menuDividerSoft: {
      height: 1,
      backgroundColor: theme.colors.dividerSoft,
      marginTop: spacing(1),
      marginBottom: spacing(3),
    },

    menuItemOuter: {
      borderRadius: theme.radius.md,
      marginBottom: spacing(2),
    },

    menuItem: {
      minHeight: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      flexDirection: "row",
      alignItems: "center",
    },

    menuIconWrap: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing(3),
    },

    menuIconWrapDanger: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },

    menuItemText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      flex: 1,
    },

    menuItemTextDanger: {
      color: theme.colors.dangerText,
    },

    flexFill: {
      flex: 1,
      minWidth: 0,
    },

    flexSpacer: {
      flex: 1,
    },
  });
}