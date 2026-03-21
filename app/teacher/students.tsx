// app/teacher/students.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";

import TeacherLayout from "../../components/teacher/TeacherLayout";
import {
  buildTeacherTheme,
  getTeacherUi,
  spacing,
  type TeacherTheme,
  type Ui,
} from "../../components/teacher/teacher-ui";

type StudentStatus = "Eligible" | "Not yet calculated" | "At risk";

type TeacherStudent = {
  id: string;
  name: string;
  form: string;
  stream: string;
  points: number;
  status: StudentStatus;
  updated: string;
};

const SCHOOL_NAME = "Botswana Accountancy College";
const TEACHER_NAME = "Ms. D. Kgomotso";

const STUDENTS: TeacherStudent[] = [
  { id: "s1", name: "Katlo Monang", form: "Form 5", stream: "5A", points: 48, status: "Eligible", updated: "Today" },
  {
    id: "s2",
    name: "Reabetswe Monang",
    form: "Form 5",
    stream: "5A",
    points: 36,
    status: "Not yet calculated",
    updated: "Yesterday",
  },
  { id: "s3", name: "Onalenna Sebego", form: "Form 4", stream: "4B", points: 28, status: "At risk", updated: "2 days ago" },
  { id: "s4", name: "Kagiso Molefe", form: "Form 5", stream: "5C", points: 42, status: "Eligible", updated: "3 days ago" },
  { id: "s5", name: "Amogelang Tau", form: "Form 4", stream: "4B", points: 31, status: "At risk", updated: "1 week ago" },
  { id: "s6", name: "Thato Motsamai", form: "Form 3", stream: "3A", points: 0, status: "Not yet calculated", updated: "1 week ago" },
  { id: "s7", name: "Lorato Dube", form: "Form 3", stream: "3C", points: 39, status: "Eligible", updated: "2 weeks ago" },
];

const CLASSES = ["All", "5A", "5C", "4B", "3A", "3C"] as const;
const STATUSES = ["All", "Eligible", "Not yet calculated", "At risk"] as const;

type InteractState = { pressed: boolean; hovered: boolean; focused: boolean };

function createStyles(theme: TeacherTheme, ui: Ui) {
  return StyleSheet.create({
    screen: {
      width: "100%",
      maxWidth: ui.isDesktop ? 1180 : "100%",
      alignSelf: "center",
      gap: spacing(4),
    },

    heroCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: ui.isMobile ? spacing(4) : spacing(5),
      ...theme.shadow,
    },
    heroTopRow: {
      flexDirection: ui.isMobile ? "column" : "row",
      alignItems: ui.isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    heroTitleWrap: {
      flex: 1,
      minWidth: 0,
    },
    heroBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(1.5),
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      marginBottom: spacing(3),
    },
    heroBadgeText: {
      ...theme.type.tinyCaps,
      color: theme.colors.primaryStrong,
    },
    heroTitle: {
      ...(ui.isDesktop ? theme.type.h1 : theme.type.h2),
      color: theme.colors.text,
    },
    heroSubtitle: {
      ...theme.type.body,
      color: theme.colors.textMuted,
      marginTop: spacing(2),
      maxWidth: 760,
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2),
      marginTop: spacing(3),
    },
    heroMetaPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(1.5),
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },
    heroMetaText: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },
    heroActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2),
      alignItems: "center",
    },

    actionPrimary: {
      minHeight: 46,
      paddingHorizontal: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
    },
    actionSecondary: {
      minHeight: 46,
      paddingHorizontal: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
    },
    actionTextPrimary: {
      ...theme.type.bodyStrong,
      color: theme.colors.accentCardText,
    },
    actionTextSecondary: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(3),
    },
    metricCard: {
      flexGrow: 1,
      flexBasis: ui.isDesktop ? 220 : ui.isTablet ? 240 : "100%",
      minWidth: ui.isDesktop ? 0 : 220,
      borderRadius: theme.radius.xl,
      padding: spacing(4),
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    metricCardWarning: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },
    metricIconWrap: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    metricLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    metricValue: {
      ...theme.type.h2,
      color: theme.colors.text,
      marginTop: 2,
    },

    contentGrid: {
      flexDirection: ui.isDesktop ? "row" : "column",
      gap: spacing(4),
      alignItems: "flex-start",
    },

    sidebarPanel: {
      width: ui.isDesktop ? 350 : "100%",
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
    },
    resultsPanel: {
      flex: 1,
      width: "100%",
      minWidth: 0,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
    },

    panelHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(2),
      marginBottom: spacing(3),
    },
    panelTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },
    panelSub: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },

    searchWrap: {
      minHeight: 52,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(3),
    },
    searchIcon: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    searchInput: {
      flex: 1,
      minHeight: 52,
      color: theme.colors.text,
      ...theme.type.bodyStrong,
      paddingVertical: 0,
    },
    clearBtn: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },

    filterBlock: {
      marginTop: spacing(4),
      padding: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },
    filterTitle: {
      ...theme.type.tinyCaps,
      color: theme.colors.textSoft,
      marginBottom: spacing(2.5),
    },
    chipRow: {
      gap: spacing(2),
      paddingRight: spacing(1),
    },
    chip: {
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      maxWidth: 240,
    },
    chipActive: {
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.primaryStrong,
    },
    chipText: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },
    chipTextActive: {
      color: theme.colors.text,
    },

    resetBtn: {
      marginTop: spacing(4),
      minHeight: 46,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(4),
    },
    resetText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    helperCard: {
      marginTop: spacing(4),
      padding: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.infoBg,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      gap: spacing(2),
    },
    helperTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    helperText: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    stateCard: {
      marginBottom: spacing(3),
      borderRadius: theme.radius.lg,
      padding: spacing(4),
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    stateLoading: {
      backgroundColor: theme.colors.infoBg,
      borderColor: theme.colors.infoBorder,
    },
    stateError: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },
    stateTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    stateSub: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },

    tableWrap: {
      borderRadius: theme.radius.xl,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      backgroundColor: theme.colors.surfaceStrong,
    },
    tableScrollContent: {
      minWidth: Math.max(ui.tableMinWidth, ui.isDesktop ? 860 : 720),
    },
    tableHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3),
      backgroundColor: theme.colors.tableHeaderBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
      gap: spacing(2),
    },
    th: {
      ...theme.type.tinyCaps,
      color: theme.colors.textSoft,
    },
    tbody: {
      backgroundColor: theme.colors.surface,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3),
      gap: spacing(2),
      backgroundColor: theme.colors.surface,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
    },
    rowHover: Platform.select({
      web: { backgroundColor: theme.colors.surfaceStrong } as ViewStyle,
      default: {},
    }),
    nameCell: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    textCell: {
      ...theme.type.body,
      color: theme.colors.text,
    },
    mutedCell: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    viewPill: {
      width: 38,
      height: 34,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    statusChip: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing(1.5),
      paddingHorizontal: spacing(2.5),
      paddingVertical: spacing(1.5),
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      maxWidth: "100%",
    },
    statusGood: {
      backgroundColor: theme.colors.successBg,
      borderColor: theme.colors.successBorder,
    },
    statusNeutral: {
      backgroundColor: theme.colors.infoBg,
      borderColor: theme.colors.infoBorder,
    },
    statusRisk: {
      backgroundColor: theme.colors.warningBg,
      borderColor: theme.colors.warningBorder,
    },
    statusText: {
      ...theme.type.caption,
      color: theme.colors.text,
      textTransform: "lowercase",
      flexShrink: 1,
    },

    cardList: {
      gap: spacing(3),
    },
    studentCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
      gap: spacing(3),
    },
    studentCardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(3),
    },
    studentCardInfo: {
      flex: 1,
      minWidth: 0,
    },
    studentName: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      fontSize: 16,
    },
    studentMeta: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },
    studentCardChevron: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    studentCardBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(2),
      flexWrap: "wrap",
    },
    pointsPill: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacing(1.5),
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    pointsLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    pointsValue: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    emptyState: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    emptyIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    emptySub: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
    },

    hoverable: Platform.select({ web: { opacity: 0.98 } as ViewStyle, default: {} }),
    focused: Platform.select({
      web: {
        borderColor: theme.colors.focusRing,
        shadowColor: theme.colors.primaryStrong,
        shadowOpacity: 0.12,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
      } as ViewStyle,
      default: {},
    }),
    pressed: {
      opacity: 0.96,
      transform: [{ scale: 0.995 }],
    },
    disabled: {
      opacity: 0.55,
    },
  });
}

function AppPressable({
  children,
  onPress,
  style,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  hitSlop,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style: StyleProp<ViewStyle> | ((s: InteractState) => StyleProp<ViewStyle>);
  disabled?: boolean;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  hitSlop?: any;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const webHandlers =
    Platform.OS === "web"
      ? {
          onHoverIn: () => setHovered(true),
          onHoverOut: () => setHovered(false),
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        }
      : {};

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...webHandlers}
      style={({ pressed }) => {
        const state: InteractState = { pressed, hovered, focused };
        return typeof style === "function" ? style(state) : style;
      }}
    >
      {children}
    </Pressable>
  );
}

export default function TeacherStudentsListScreen() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);
  const styles = useMemo(() => createStyles(theme, ui), [theme, ui]);

  const navReportsHref: Href = "/teacher/reports";
  const navUploadHref: Href = "/teacher/upload-results";

  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState<(typeof CLASSES)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("All");

  const [isLoading] = useState(false);
  const [hasError] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return STUDENTS.filter((s) => {
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.form.toLowerCase().includes(query) ||
        s.stream.toLowerCase().includes(query);

      const matchClass = classFilter === "All" ? true : s.stream === classFilter;
      const matchStatus = statusFilter === "All" ? true : s.status === statusFilter;

      return matchQuery && matchClass && matchStatus;
    });
  }, [q, classFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const eligible = filtered.filter((s) => s.status === "Eligible").length;
    const risk = filtered.filter((s) => s.status === "At risk").length;
    const pending = filtered.filter((s) => s.status === "Not yet calculated").length;
    return { total, eligible, risk, pending };
  }, [filtered]);

  const openStudent = useCallback((id: string) => {
    router.push({ pathname: "/teacher/student-details" as any, params: { id } } as any);
  }, []);

  const resetFilters = useCallback(() => {
    setQ("");
    setClassFilter("All");
    setStatusFilter("All");
  }, []);

  return (
    <TeacherLayout activeKey="students">
      <View style={styles.screen}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleWrap}>
              <View style={styles.heroBadge}>
                <Ionicons name="people-outline" size={14} color={theme.colors.primaryStrong} />
                <Text style={styles.heroBadgeText}>Student overview</Text>
              </View>

              <Text style={styles.heroTitle}>Students</Text>

              <Text style={styles.heroSubtitle}>
                Search, filter and review student sponsorship status across classes with a cleaner shared teacher layout.
              </Text>

              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaPill}>
                  <Ionicons name="school-outline" size={15} color={theme.colors.textMuted} />
                  <Text style={styles.heroMetaText}>{SCHOOL_NAME}</Text>
                </View>
                <View style={styles.heroMetaPill}>
                  <Ionicons name="person-outline" size={15} color={theme.colors.textMuted} />
                  <Text style={styles.heroMetaText}>{TEACHER_NAME}</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroActions}>
              <AppPressable
                onPress={() => router.push(navUploadHref)}
                style={({ pressed, hovered, focused }) => [
                  styles.actionPrimary,
                  hovered && styles.hoverable,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Upload results"
              >
                <Ionicons name="cloud-upload-outline" size={18} color={theme.colors.accentCardText} />
                <Text style={styles.actionTextPrimary}>Upload</Text>
              </AppPressable>

              <AppPressable
                onPress={() => router.push(navReportsHref)}
                style={({ pressed, hovered, focused }) => [
                  styles.actionSecondary,
                  hovered && styles.hoverable,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open reports"
              >
                <Ionicons name="bar-chart-outline" size={18} color={theme.colors.text} />
                <Text style={styles.actionTextSecondary}>Reports</Text>
              </AppPressable>
            </View>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            theme={theme}
            styles={styles}
            label="Total"
            value={`${stats.total}`}
            icon="people-outline"
          />
          <MetricCard
            theme={theme}
            styles={styles}
            label="Eligible"
            value={`${stats.eligible}`}
            icon="checkmark-circle-outline"
          />
          <MetricCard
            theme={theme}
            styles={styles}
            label="At risk"
            value={`${stats.risk}`}
            icon="warning-outline"
            warning
          />
          <MetricCard
            theme={theme}
            styles={styles}
            label="Pending"
            value={`${stats.pending}`}
            icon="time-outline"
          />
        </View>

        <View style={styles.contentGrid}>
          <View style={styles.sidebarPanel}>
            <View style={styles.panelHeaderRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.panelTitle}>Find student</Text>
                <Text style={styles.panelSub}>Refine the class list by query, stream and status.</Text>
              </View>
            </View>

            <SearchBox
              theme={theme}
              styles={styles}
              value={q}
              onChange={setQ}
              onClear={() => setQ("")}
            />

            <FilterGroup
              theme={theme}
              styles={styles}
              title="Class / Stream"
              options={CLASSES}
              value={classFilter}
              onChange={setClassFilter}
            />

            <FilterGroup
              theme={theme}
              styles={styles}
              title="Sponsorship status"
              options={STATUSES}
              value={statusFilter}
              onChange={setStatusFilter}
            />

            <AppPressable
              onPress={resetFilters}
              style={({ pressed, hovered, focused }) => [
                styles.resetBtn,
                hovered && styles.hoverable,
                focused && styles.focused,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Reset filters"
            >
              <Ionicons name="refresh-outline" size={18} color={theme.colors.text} />
              <Text style={styles.resetText}>Reset filters</Text>
            </AppPressable>

            <View style={styles.helperCard}>
              <Text style={styles.helperTitle}>Tip</Text>
              <Text style={styles.helperText}>
                Combine class and status filters to quickly isolate at-risk learners and open their detail pages for follow-up.
              </Text>
            </View>
          </View>

          <View style={styles.resultsPanel}>
            {hasError ? (
              <InlineState
                theme={theme}
                styles={styles}
                tone="error"
                title="Could not load students"
                subtitle="Check your connection and try again."
              />
            ) : isLoading ? (
              <InlineState
                theme={theme}
                styles={styles}
                tone="loading"
                title="Loading students…"
                subtitle="Fetching the latest class list."
              />
            ) : null}

            <View style={styles.panelHeaderRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.panelTitle}>Results</Text>
                <Text style={styles.panelSub}>{stats.total} student(s) shown</Text>
              </View>
              {isLoading ? <ActivityIndicator color={theme.colors.primaryStrong} /> : null}
            </View>

            {filtered.length === 0 ? (
              <EmptyState
                theme={theme}
                styles={styles}
                title="No students match your filters"
                subtitle="Try clearing filters or searching by name, class or form."
              />
            ) : ui.isMobile ? (
              <StudentsCardList
                theme={theme}
                styles={styles}
                students={filtered}
                onOpen={openStudent}
              />
            ) : (
              <StudentsTable
                theme={theme}
                styles={styles}
                students={filtered}
                showForm={ui.isDesktop || ui.width >= 640}
                showStream={ui.isDesktop || ui.width >= 760}
                showUpdated={ui.isDesktop || ui.width >= 900}
                onOpen={openStudent}
              />
            )}
          </View>
        </View>
      </View>
    </TeacherLayout>
  );
}

function MetricCard({
  theme,
  styles,
  label,
  value,
  icon,
  warning,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  warning?: boolean;
}) {
  return (
    <View
      style={[styles.metricCard, warning && styles.metricCardWarning]}
      accessible
      accessibilityLabel={`${label} ${value}`}
    >
      <View style={styles.metricIconWrap} accessibilityElementsHidden>
        <Ionicons name={icon} size={20} color={theme.colors.text} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.metricValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function SearchBox({
  theme,
  styles,
  value,
  onChange,
  onClear,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  value: string;
  onChange: (t: string) => void;
  onClear: () => void;
}) {
  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchIcon} accessibilityElementsHidden>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
      </View>

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search name, form, class..."
        placeholderTextColor={theme.colors.textSoft}
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Search students"
      />

      {value.length > 0 ? (
        <AppPressable
          onPress={onClear}
          style={({ pressed, hovered, focused }) => [
            styles.clearBtn,
            hovered && styles.hoverable,
            focused && styles.focused,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
        >
          <Ionicons name="close" size={16} color={theme.colors.text} />
        </AppPressable>
      ) : null}
    </View>
  );
}

function FilterGroup<T extends string>({
  theme,
  styles,
  title,
  options,
  value,
  onChange,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  title: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <AppPressable
              key={opt}
              onPress={() => onChange(opt)}
              style={({ pressed, hovered, focused }) => [
                styles.chip,
                active && styles.chipActive,
                hovered && styles.hoverable,
                focused && styles.focused,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${opt}`}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
                {opt}
              </Text>
            </AppPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function StatusChip({
  theme,
  styles,
  status,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  status: StudentStatus;
}) {
  const isGood = status === "Eligible";
  const isRisk = status === "At risk";
  const icon = isGood ? "checkmark-circle-outline" : isRisk ? "warning-outline" : "time-outline";

  return (
    <View
      style={[
        styles.statusChip,
        isGood ? styles.statusGood : isRisk ? styles.statusRisk : styles.statusNeutral,
      ]}
      accessible
      accessibilityLabel={`Status ${status}`}
    >
      <Ionicons name={icon} size={14} color={theme.colors.text} />
      <Text style={styles.statusText} numberOfLines={1}>
        {status.toLowerCase()}
      </Text>
    </View>
  );
}

function StudentsCardList({
  theme,
  styles,
  students,
  onOpen,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  students: TeacherStudent[];
  onOpen: (id: string) => void;
}) {
  return (
    <View style={styles.cardList}>
      {students.map((s) => (
        <AppPressable
          key={s.id}
          onPress={() => onOpen(s.id)}
          style={({ pressed, hovered, focused }) => [
            styles.studentCard,
            hovered && styles.hoverable,
            focused && styles.focused,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Open ${s.name}`}
        >
          <View style={styles.studentCardTop}>
            <View style={styles.studentCardInfo}>
              <Text style={styles.studentName} numberOfLines={1}>
                {s.name}
              </Text>
              <Text style={styles.studentMeta} numberOfLines={2}>
                {s.form} · {s.stream} · Updated {s.updated}
              </Text>
            </View>

            <View style={styles.studentCardChevron} accessibilityElementsHidden>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </View>
          </View>

          <View style={styles.studentCardBottom}>
            <View style={styles.pointsPill} accessible accessibilityLabel={`Points ${s.points}`}>
              <Text style={styles.pointsLabel}>Points</Text>
              <Text style={styles.pointsValue}>{s.points}</Text>
            </View>

            <StatusChip theme={theme} styles={styles} status={s.status} />
          </View>
        </AppPressable>
      ))}
    </View>
  );
}

function StudentsTable({
  theme,
  styles,
  students,
  showForm,
  showStream,
  showUpdated,
  onOpen,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  students: TeacherStudent[];
  showForm: boolean;
  showStream: boolean;
  showUpdated: boolean;
  onOpen: (id: string) => void;
}) {
  if (students.length === 0) {
    return (
      <EmptyState
        theme={theme}
        styles={styles}
        title="No students found"
        subtitle="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <View style={styles.tableWrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.tableScrollContent}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { flex: 2.2 }]}>Name</Text>
            {showForm ? <Text style={[styles.th, { flex: 1.0 }]}>Form</Text> : null}
            {showStream ? <Text style={[styles.th, { flex: 0.9 }]}>Class</Text> : null}
            <Text style={[styles.th, { flex: 0.8, textAlign: "right" }]}>Points</Text>
            <Text style={[styles.th, { flex: 1.3 }]}>Status</Text>
            {showUpdated ? <Text style={[styles.th, { flex: 1.1 }]}>Updated</Text> : null}
            <Text style={[styles.th, { width: 64, textAlign: "right" }]}>View</Text>
          </View>

          <View style={styles.tbody}>
            {students.map((s, idx) => (
              <AppPressable
                key={s.id}
                onPress={() => onOpen(s.id)}
                style={({ pressed, hovered, focused }) => [
                  styles.row,
                  idx !== students.length - 1 && styles.rowBorder,
                  hovered && styles.rowHover,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`View ${s.name}`}
              >
                <Text style={[styles.nameCell, { flex: 2.2 }]} numberOfLines={1}>
                  {s.name}
                </Text>

                {showForm ? (
                  <Text style={[styles.textCell, { flex: 1.0 }]} numberOfLines={1}>
                    {s.form}
                  </Text>
                ) : null}

                {showStream ? (
                  <Text style={[styles.mutedCell, { flex: 0.9 }]} numberOfLines={1}>
                    {s.stream}
                  </Text>
                ) : null}

                <Text style={[styles.textCell, { flex: 0.8, textAlign: "right" }]}>{s.points}</Text>

                <View style={{ flex: 1.3 }}>
                  <StatusChip theme={theme} styles={styles} status={s.status} />
                </View>

                {showUpdated ? (
                  <Text style={[styles.mutedCell, { flex: 1.1 }]} numberOfLines={1}>
                    {s.updated}
                  </Text>
                ) : null}

                <View style={{ width: 64, alignItems: "flex-end" }} accessibilityElementsHidden>
                  <View style={styles.viewPill}>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.text} />
                  </View>
                </View>
              </AppPressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function EmptyState({
  theme,
  styles,
  title,
  subtitle,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.emptyState} accessible accessibilityLabel={title}>
      <View style={styles.emptyIcon} accessibilityElementsHidden>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.emptyTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.emptySub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function InlineState({
  theme,
  styles,
  tone,
  title,
  subtitle,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  tone: "loading" | "error";
  title: string;
  subtitle: string;
}) {
  const icon = tone === "error" ? "alert-circle-outline" : "time-outline";

  return (
    <View style={[styles.stateCard, tone === "error" ? styles.stateError : styles.stateLoading]}>
      <Ionicons name={icon} size={20} color={theme.colors.text} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.stateTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.stateSub} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}