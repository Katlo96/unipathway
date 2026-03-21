// app/teacher/reports.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Modal,
  Alert,
  useColorScheme,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import {
  buildTeacherTheme,
  getTeacherUi,
  spacing,
  type TeacherTheme,
  type Ui,
} from "../../components/teacher/teacher-ui";

/* ============================================================================
   Types & Data
============================================================================ */

type StudentStatus = "Eligible" | "Not yet calculated" | "At risk";
type TermKey = "Term 1" | "Term 2" | "Term 3" | "Term 4";

type Student = {
  id: string;
  name: string;
  form: string;
  stream: string;
  points: number;
  status: StudentStatus;
};

const CLASSES = ["All classes", "4A", "4B", "5A", "5B"] as const;
const TERMS: TermKey[] = ["Term 1", "Term 2", "Term 3", "Term 4"];

const STUDENTS: Student[] = [
  { id: "s1", name: "Katlo Monang", form: "Form 5", stream: "5A", points: 48, status: "Eligible" },
  { id: "s2", name: "Reabetswe Monang", form: "Form 5", stream: "5A", points: 36, status: "Not yet calculated" },
  { id: "s3", name: "Onalenna Sebego", form: "Form 4", stream: "4B", points: 28, status: "At risk" },
  { id: "s4", name: "Kagiso Molefe", form: "Form 5", stream: "5B", points: 42, status: "Eligible" },
  { id: "s5", name: "Amogelang Tau", form: "Form 4", stream: "4A", points: 31, status: "At risk" },
  { id: "s6", name: "Tshepo Kelepile", form: "Form 5", stream: "5B", points: 40, status: "Eligible" },
  { id: "s7", name: "Dineo Nthole", form: "Form 4", stream: "4A", points: 35, status: "Not yet calculated" },
  { id: "s8", name: "Boitumelo Moyo", form: "Form 4", stream: "4B", points: 26, status: "At risk" },
];

/* ============================================================================
   Screen
============================================================================ */

export default function TeacherReportsScreen() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);
  const styles = useMemo(() => createStyles(theme, ui), [theme, ui]);

  const [classFilter, setClassFilter] = useState<(typeof CLASSES)[number]>("All classes");
  const [term, setTerm] = useState<TermKey>("Term 4");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    if (classFilter === "All classes") return STUDENTS;
    return STUDENTS.filter((s) => s.stream === classFilter);
  }, [classFilter]);

  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const avg = Math.round(
      filteredStudents.reduce((a, s) => a + s.points, 0) / Math.max(1, total)
    );
    const eligible = filteredStudents.filter((s) => s.status === "Eligible").length;
    const atRisk = filteredStudents.filter((s) => s.status === "At risk").length;
    const eligiblePct = Math.round((eligible / Math.max(1, total)) * 100);
    const pending = filteredStudents.filter((s) => s.status === "Not yet calculated").length;
    return { total, avg, eligible, atRisk, eligiblePct, pending };
  }, [filteredStudents]);

  const pointsDistribution = useMemo(() => {
    const bins = [
      { label: "0–19", count: 0 },
      { label: "20–29", count: 0 },
      { label: "30–39", count: 0 },
      { label: "40–49", count: 0 },
      { label: "50+", count: 0 },
    ];

    filteredStudents.forEach((s) => {
      if (s.points < 20) bins[0].count++;
      else if (s.points < 30) bins[1].count++;
      else if (s.points < 40) bins[2].count++;
      else if (s.points < 50) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [filteredStudents]);

  const statusBreakdown = useMemo(() => {
    const total = Math.max(1, filteredStudents.length);
    const items = [
      {
        key: "Eligible",
        label: "Eligible",
        count: filteredStudents.filter((s) => s.status === "Eligible").length,
        tone: "success" as const,
        icon: "checkmark-circle-outline" as const,
      },
      {
        key: "Not yet calculated",
        label: "Pending",
        count: filteredStudents.filter((s) => s.status === "Not yet calculated").length,
        tone: "info" as const,
        icon: "time-outline" as const,
      },
      {
        key: "At risk",
        label: "At risk",
        count: filteredStudents.filter((s) => s.status === "At risk").length,
        tone: "danger" as const,
        icon: "alert-circle-outline" as const,
      },
    ];

    return items.map((item) => ({
      ...item,
      pct: Math.round((item.count / total) * 100),
    }));
  }, [filteredStudents]);

  function exportPdf() {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Teacher Report</title>
<style>
  body{font-family: Arial, sans-serif; margin:24px; color:#0b0f12; background:#f7fbff;}
  .h1{font-size:20px; font-weight:800; margin:0;}
  .sub{color:#4b5563; margin-top:6px; font-size:12px;}
  .card{border:1px solid #dbe3ea; background:#fff; border-radius:14px; padding:16px; margin-top:14px;}
  .row{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-top:12px;}
  .metric{border:1px solid #e8edf2; border-radius:12px; padding:12px;}
  table{width:100%; border-collapse:collapse; margin-top:10px;}
  th,td{border-bottom:1px solid #eef2f6; padding:8px; font-size:12px;}
  th{text-align:left; color:#475569;}
</style>
</head>
<body>
  <p class="h1">Teacher Report</p>
  <p class="sub">${escapeHtml(classFilter)} · ${escapeHtml(term)} · Generated by UniPathway</p>

  <div class="row">
    <div class="metric"><b>Students</b><div>${metrics.total}</div></div>
    <div class="metric"><b>Average points</b><div>${metrics.avg}</div></div>
    <div class="metric"><b>Eligible %</b><div>${metrics.eligiblePct}%</div></div>
    <div class="metric"><b>At risk</b><div>${metrics.atRisk}</div></div>
  </div>

  <div class="card">
    <b>Points distribution</b>
    <table>
      <tr><th>Band</th><th style="text-align:right">Count</th></tr>
      ${pointsDistribution
        .map((d) => `<tr><td>${escapeHtml(d.label)}</td><td style="text-align:right">${d.count}</td></tr>`)
        .join("")}
    </table>
  </div>

  <div class="card">
    <b>Students</b>
    <table>
      <tr>
        <th>Name</th>
        <th>Form</th>
        <th>Stream</th>
        <th>Points</th>
        <th>Status</th>
      </tr>
      ${filteredStudents
        .map(
          (s) => `<tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.form)}</td>
            <td>${escapeHtml(s.stream)}</td>
            <td>${s.points}</td>
            <td>${escapeHtml(s.status)}</td>
          </tr>`
        )
        .join("")}
    </table>
  </div>
</body>
</html>`;

      const w = window.open("", "_blank");
      if (!w) return;

      w.document.open();
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 200);
      return;
    }

    Alert.alert(
      "PDF export",
      "PDF export is available on web via print preview. For native PDF generation, add expo-print and expo-sharing."
    );
  }

  function exportExcel() {
    Alert.alert(
      "Excel export",
      "Next step: wire this to SheetJS or your backend export endpoint."
    );
  }

  return (
    <TeacherLayout activeKey="reports">
      <View style={styles.screen}>
        <View style={[styles.heroCard, ui.isMobile && styles.heroCardMobile]}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroTextBlock}>
              <View style={styles.eyebrowBadge}>
                <Ionicons name="bar-chart-outline" size={14} color={theme.colors.accentCardText} />
                <Text style={styles.eyebrowBadgeText}>Performance reporting</Text>
              </View>

              <Text style={styles.pageTitle}>Reports</Text>
              <Text style={styles.pageSubtitle}>
                Review performance insights, class-level distribution, and export teacher-ready summaries for{" "}
                {classFilter} in {term}.
              </Text>
            </View>

            <View style={[styles.heroActions, !ui.isDesktop && styles.heroActionsWrap]}>
              {!ui.isDesktop && (
                <IconButton
                  theme={theme}
                  icon="options-outline"
                  onPress={() => setFiltersOpen(true)}
                  accessibilityLabel="Open filters"
                />
              )}

              <PrimaryButton
                theme={theme}
                icon="document-text-outline"
                label="Export PDF"
                onPress={exportPdf}
                accessibilityLabel="Export PDF"
              />

              <SecondaryButton
                theme={theme}
                icon="grid-outline"
                label="Export Excel"
                onPress={exportExcel}
                accessibilityLabel="Export Excel"
              />
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <InfoPill theme={theme} icon="school-outline" text={classFilter} />
            <InfoPill theme={theme} icon="calendar-outline" text={term} />
            <InfoPill theme={theme} icon="people-outline" text={`${metrics.total} students`} />
          </View>
        </View>

        {ui.isDesktop && (
          <View style={styles.filterPanel}>
            <View style={styles.filterPanelHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>Filters</Text>
                <Text style={styles.sectionTitle}>Refine report context</Text>
              </View>
            </View>

            <View style={styles.filterGrid}>
              <FilterCard
                theme={theme}
                label="Class"
                value={classFilter}
                onPrev={() =>
                  setClassFilter(
                    CLASSES[(CLASSES.indexOf(classFilter) - 1 + CLASSES.length) % CLASSES.length]
                  )
                }
                onNext={() =>
                  setClassFilter(CLASSES[(CLASSES.indexOf(classFilter) + 1) % CLASSES.length])
                }
              />

              <FilterCard
                theme={theme}
                label="Term"
                value={term}
                onPrev={() =>
                  setTerm(TERMS[(TERMS.indexOf(term) - 1 + TERMS.length) % TERMS.length])
                }
                onNext={() => setTerm(TERMS[(TERMS.indexOf(term) + 1) % TERMS.length])}
              />
            </View>
          </View>
        )}

        <SectionHeader
          title="Summary"
          subtitle="Key performance indicators for the selected class and term."
          theme={theme}
          styles={styles}
        />

        <View style={styles.metricsGrid}>
          <KpiCard
            theme={theme}
            styles={styles}
            icon="people-outline"
            label="Students"
            value={String(metrics.total)}
            helper="Included in current filter"
          />
          <KpiCard
            theme={theme}
            styles={styles}
            icon="stats-chart-outline"
            label="Average points"
            value={String(metrics.avg)}
            helper="Rounded class average"
          />
          <KpiCard
            theme={theme}
            styles={styles}
            icon="checkmark-circle-outline"
            label="Eligible"
            value={`${metrics.eligiblePct}%`}
            helper={`${metrics.eligible} students`}
          />
          <KpiCard
            theme={theme}
            styles={styles}
            icon="alert-circle-outline"
            label="At risk"
            value={String(metrics.atRisk)}
            helper={`${metrics.pending} pending calculation`}
          />
        </View>

        <SectionHeader
          title="Analytics"
          subtitle="Performance spread and status composition across the filtered learners."
          theme={theme}
          styles={styles}
        />

        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsPrimaryCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardEyebrow}>Distribution</Text>
                <Text style={styles.cardTitle}>Points distribution</Text>
              </View>
              <View style={styles.cardIconBadge}>
                <Ionicons name="analytics-outline" size={18} color={theme.colors.primaryStrong} />
              </View>
            </View>

            <Histogram data={pointsDistribution} theme={theme} styles={styles} />
          </View>

          <View style={styles.analyticsSoftCard}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardEyebrow}>Interpretation</Text>
                <Text style={styles.cardTitle}>Report notes</Text>
              </View>
              <View style={styles.cardIconBadge}>
                <Ionicons name="bulb-outline" size={18} color={theme.colors.primaryStrong} />
              </View>
            </View>

            <Text style={styles.bodyText}>
              The current view shows how learners are distributed across points bands for the selected
              class and term. Use this snapshot to identify strong-performing groups, learners awaiting
              full computation, and students needing early intervention.
            </Text>

            <View style={styles.statusList}>
              {statusBreakdown.map((item) => (
                <StatusRow
                  key={item.key}
                  theme={theme}
                  styles={styles}
                  label={item.label}
                  count={item.count}
                  pct={item.pct}
                  tone={item.tone}
                  icon={item.icon}
                />
              ))}
            </View>
          </View>
        </View>

        <SectionHeader
          title="Student breakdown"
          subtitle="Current learners included in the selected reporting view."
          theme={theme}
          styles={styles}
        />

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <View style={[styles.tableColName, styles.tableHeadCell]}>
              <Text style={styles.tableHeadText}>Student</Text>
            </View>
            <View style={[styles.tableColForm, styles.tableHeadCell]}>
              <Text style={styles.tableHeadText}>Form</Text>
            </View>
            <View style={[styles.tableColStream, styles.tableHeadCell]}>
              <Text style={styles.tableHeadText}>Class</Text>
            </View>
            <View style={[styles.tableColPoints, styles.tableHeadCell]}>
              <Text style={[styles.tableHeadText, styles.alignRight]}>Points</Text>
            </View>
            <View style={[styles.tableColStatus, styles.tableHeadCell]}>
              <Text style={styles.tableHeadText}>Status</Text>
            </View>
          </View>

          {filteredStudents.map((student, index) => (
            <View
              key={student.id}
              style={[
                styles.tableRow,
                index === filteredStudents.length - 1 && styles.tableRowLast,
              ]}
            >
              <View style={styles.tableColName}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentMeta}>{student.form} learner</Text>
              </View>

              <View style={styles.tableColForm}>
                <Text style={styles.tableValue}>{student.form}</Text>
              </View>

              <View style={styles.tableColStream}>
                <Text style={styles.tableValue}>{student.stream}</Text>
              </View>

              <View style={styles.tableColPoints}>
                <Text style={[styles.tableValueStrong, styles.alignRight]}>{student.points}</Text>
              </View>

              <View style={styles.tableColStatus}>
                <StatusBadge theme={theme} status={student.status} />
              </View>
            </View>
          ))}
        </View>

        <Modal
          visible={filtersOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setFiltersOpen(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setFiltersOpen(false)}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Filters</Text>
              <Text style={styles.modalSubtitle}>
                Narrow the report to a specific class and term.
              </Text>

              <Text style={styles.modalLabel}>Class</Text>
              <ChipRow
                items={CLASSES as readonly string[]}
                value={classFilter}
                onChange={(v) => setClassFilter(v as (typeof CLASSES)[number])}
                theme={theme}
                styles={styles}
              />

              <Text style={[styles.modalLabel, styles.modalLabelSpacing]}>Term</Text>
              <ChipRow
                items={TERMS}
                value={term}
                onChange={(v) => setTerm(v as TermKey)}
                theme={theme}
                styles={styles}
              />

              <PrimaryButton
                theme={theme}
                icon="checkmark-circle-outline"
                label="Apply filters"
                onPress={() => setFiltersOpen(false)}
                style={styles.modalAction}
                accessibilityLabel="Apply filters"
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </TeacherLayout>
  );
}

/* ============================================================================
   Reusable Components
============================================================================ */

function SectionHeader({
  title,
  subtitle,
  theme,
  styles,
}: {
  title: string;
  subtitle: string;
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>Overview</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function KpiCard({
  theme,
  styles,
  icon,
  label,
  value,
  helper,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiCardInner}>
        <View style={styles.kpiIconWrap}>
          <Ionicons name={icon} size={18} color={theme.colors.primaryStrong} />
        </View>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Text style={styles.kpiValue}>{value}</Text>
        <Text style={styles.kpiHelper}>{helper}</Text>
      </View>
    </View>
  );
}

function Histogram({
  data,
  theme,
  styles,
}: {
  data: { label: string; count: number }[];
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <View style={styles.histogramWrap}>
      {data.map((d) => {
        const height = Math.max(16, (d.count / max) * 180);

        return (
          <View key={d.label} style={styles.histItem}>
            <Text style={styles.histValue}>{d.count}</Text>
            <View style={styles.histTrack}>
              <View
                style={[
                  styles.histBar,
                  {
                    height,
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.infoBorder,
                  },
                ]}
              />
            </View>
            <Text style={styles.histLabel}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function FilterCard({
  theme,
  label,
  value,
  onPrev,
  onNext,
}: {
  theme: TeacherTheme;
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const local = createInlineFilterStyles(theme);

  return (
    <View style={local.card}>
      <Text style={local.label}>{label}</Text>
      <View style={local.controls}>
        <IconButton theme={theme} icon="chevron-back" onPress={onPrev} accessibilityLabel={`Previous ${label}`} />
        <View style={local.valuePill}>
          <Text style={local.valueText} numberOfLines={1}>
            {value}
          </Text>
        </View>
        <IconButton theme={theme} icon="chevron-forward" onPress={onNext} accessibilityLabel={`Next ${label}`} />
      </View>
    </View>
  );
}

function ChipRow({
  items,
  value,
  onChange,
  theme,
  styles,
}: {
  items: readonly string[];
  value: string;
  onChange: (v: string) => void;
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.chipRow}>
      {items.map((item) => {
        const active = item === value;

        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={item}
          >
            <Text
              style={[
                styles.chipText,
                active && { color: theme.colors.accentCardText },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PrimaryButton({
  theme,
  icon,
  label,
  onPress,
  style,
  accessibilityLabel,
}: {
  theme: TeacherTheme;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  const local = createInlineButtonStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [local.primaryBtn, style, pressed && local.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      <Ionicons name={icon} size={18} color={theme.colors.accentCardText} />
      <Text style={local.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  theme,
  icon,
  label,
  onPress,
  accessibilityLabel,
}: {
  theme: TeacherTheme;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const local = createInlineButtonStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [local.secondaryBtn, pressed && local.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
      <Text style={local.secondaryText}>{label}</Text>
    </Pressable>
  );
}

function IconButton({
  theme,
  icon,
  onPress,
  accessibilityLabel,
}: {
  theme: TeacherTheme;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const local = createInlineButtonStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [local.iconBtn, pressed && local.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
    </Pressable>
  );
}

function InfoPill({
  theme,
  icon,
  text,
}: {
  theme: TeacherTheme;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  const local = createInlinePillStyles(theme);

  return (
    <View style={local.pill}>
      <Ionicons name={icon} size={14} color={theme.colors.text} />
      <Text style={local.pillText}>{text}</Text>
    </View>
  );
}

function StatusBadge({
  theme,
  status,
}: {
  theme: TeacherTheme;
  status: StudentStatus;
}) {
  const tone =
    status === "Eligible"
      ? {
          bg: theme.colors.successBg,
          border: theme.colors.successBorder,
          text: theme.colors.text,
          icon: "checkmark-circle-outline" as const,
        }
      : status === "At risk"
      ? {
          bg: theme.colors.dangerBg,
          border: theme.colors.dangerBorder,
          text: theme.colors.dangerText,
          icon: "alert-circle-outline" as const,
        }
      : {
          bg: theme.colors.infoBg,
          border: theme.colors.infoBorder,
          text: theme.colors.text,
          icon: "time-outline" as const,
        };

  return (
    <View
      style={{
        minHeight: 34,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: spacing(2),
        borderRadius: 999,
        paddingHorizontal: spacing(3),
        paddingVertical: spacing(1.5),
        backgroundColor: tone.bg,
        borderWidth: 1,
        borderColor: tone.border,
      }}
    >
      <Ionicons name={tone.icon} size={14} color={tone.text} />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "900",
          color: tone.text,
        }}
      >
        {status}
      </Text>
    </View>
  );
}

function StatusRow({
  theme,
  styles,
  label,
  count,
  pct,
  tone,
  icon,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  label: string;
  count: number;
  pct: number;
  tone: "success" | "info" | "danger";
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const toneColors =
    tone === "success"
      ? { bg: theme.colors.successBg, border: theme.colors.successBorder }
      : tone === "danger"
      ? { bg: theme.colors.dangerBg, border: theme.colors.dangerBorder }
      : { bg: theme.colors.infoBg, border: theme.colors.infoBorder };

  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusIconWrap, { backgroundColor: toneColors.bg, borderColor: toneColors.border }]}>
        <Ionicons name={icon} size={16} color={theme.colors.text} />
      </View>

      <View style={styles.statusTextBlock}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusMeta}>
          {count} student{count === 1 ? "" : "s"} · {pct}%
        </Text>
      </View>

      <View style={styles.statusPctPill}>
        <Text style={styles.statusPctText}>{pct}%</Text>
      </View>
    </View>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ============================================================================
   Styles
============================================================================ */

function createStyles(theme: TeacherTheme, ui: Ui) {
  const tableStack = ui.isMobile;

  return StyleSheet.create({
    screen: {
      gap: spacing(6),
    },

    heroCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: ui.isDesktop ? spacing(6) : spacing(5),
      ...theme.shadow,
      gap: spacing(4),
    },
    heroCardMobile: {
      padding: spacing(4),
      borderRadius: theme.radius.lg,
    },
    heroHeaderRow: {
      flexDirection: ui.isDesktop ? "row" : "column",
      alignItems: ui.isDesktop ? "center" : "flex-start",
      justifyContent: "space-between",
      gap: spacing(4),
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: spacing(2.5),
    },
    eyebrowBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
    },
    eyebrowBadgeText: {
      ...theme.type.caption,
      color: theme.colors.accentCardText,
    },
    pageTitle: {
      ...(ui.isDesktop ? theme.type.h1 : theme.type.h2),
      color: theme.colors.text,
    },
    pageSubtitle: {
      ...theme.type.body,
      color: theme.colors.textMuted,
      maxWidth: 760,
    },
    heroActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2.5),
    },
    heroActionsWrap: {
      flexWrap: "wrap",
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2.5),
    },

    sectionHeader: {
      gap: spacing(1),
      marginTop: spacing(1),
    },
    sectionEyebrow: {
      ...theme.type.tinyCaps,
      color: theme.colors.primaryStrong,
    },
    sectionTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },
    sectionSubtitle: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    filterPanel: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(5),
      gap: spacing(4),
    },
    filterPanelHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    filterGrid: {
      flexDirection: "row",
      gap: spacing(4),
    },

        metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -spacing(1.5),
      rowGap: spacing(3),
    },
    kpiCard: {
      width: ui.isDesktop ? "25%" : ui.isTablet ? "50%" : "100%",
      minWidth: 0,
      paddingHorizontal: spacing(1.5),
    } as ViewStyle,
    kpiCardInner: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(4),
      gap: spacing(2),
      minHeight: 148,
      justifyContent: "center",
    },
    kpiIconWrap: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing(1),
    },
    kpiLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    kpiValue: {
      ...(ui.isDesktop ? theme.type.h2 : theme.type.h3),
      color: theme.colors.text,
    },
    kpiHelper: {
      ...theme.type.caption,
      color: theme.colors.textSoft,
    },

    analyticsGrid: {
      flexDirection: ui.isDesktop ? "row" : "column",
      gap: spacing(4),
      alignItems: "stretch",
    },
    analyticsPrimaryCard: {
      flex: ui.isDesktop ? 1.15 : undefined,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(5),
      gap: spacing(4),
    },
    analyticsSoftCard: {
      flex: 0.85,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(5),
      gap: spacing(4),
    },

    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    cardEyebrow: {
      ...theme.type.tinyCaps,
      color: theme.colors.primaryStrong,
      marginBottom: spacing(1),
    },
    cardTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },
    cardIconBadge: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    bodyText: {
      ...theme.type.body,
      color: theme.colors.textMuted,
    },

    histogramWrap: {
      minHeight: 250,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing(3),
      paddingTop: spacing(3),
    },
    histItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing(2),
    },
    histValue: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    histTrack: {
      width: "100%",
      height: 190,
      justifyContent: "flex-end",
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(2),
    },
    histBar: {
      width: "100%",
      borderRadius: theme.radius.md,
      borderWidth: 1,
      minHeight: 16,
    },
    histLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      textAlign: "center",
    },

    statusList: {
      gap: spacing(3),
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    statusIconWrap: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    statusTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    statusLabel: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    statusMeta: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      marginTop: spacing(0.5),
    },
    statusPctPill: {
      minWidth: 54,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
      alignItems: "center",
      justifyContent: "center",
    },
    statusPctText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    tableCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: tableStack ? "column" : "row",
      backgroundColor: theme.colors.tableHeaderBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3),
      gap: tableStack ? spacing(1) : 0,
    },
    tableHeadCell: {
      paddingRight: spacing(2),
    },
    tableHeadText: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    },
    tableRow: {
      flexDirection: tableStack ? "column" : "row",
      alignItems: tableStack ? "flex-start" : "center",
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(3.5),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
      gap: tableStack ? spacing(2.5) : 0,
    },
    tableRowLast: {
      borderBottomWidth: 0,
    },
    tableColName: {
      flex: tableStack ? 0 : 2.2,
      width: tableStack ? "100%" : undefined,
      paddingRight: spacing(2),
    },
    tableColForm: {
      flex: tableStack ? 0 : 1.1,
      width: tableStack ? "100%" : undefined,
      paddingRight: spacing(2),
    },
    tableColStream: {
      flex: tableStack ? 0 : 0.9,
      width: tableStack ? "100%" : undefined,
      paddingRight: spacing(2),
    },
    tableColPoints: {
      flex: tableStack ? 0 : 0.85,
      width: tableStack ? "100%" : undefined,
      paddingRight: spacing(2),
    },
    tableColStatus: {
      flex: tableStack ? 0 : 1.4,
      width: tableStack ? "100%" : undefined,
    },
    studentName: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    studentMeta: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      marginTop: spacing(0.75),
    },
    tableValue: {
      ...theme.type.meta,
      color: theme.colors.text,
    },
    tableValueStrong: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    alignRight: {
      textAlign: "right",
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing(4),
    },
    modalCard: {
      width: "100%",
      maxWidth: 460,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(5),
      ...theme.shadow,
    },
    modalHandle: {
      alignSelf: "center",
      width: 56,
      height: 5,
      borderRadius: 999,
      backgroundColor: theme.colors.divider,
      marginBottom: spacing(4),
    },
    modalTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },
    modalSubtitle: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(1),
      marginBottom: spacing(4),
    },
    modalLabel: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    },
    modalLabelSpacing: {
      marginTop: spacing(4),
    },
    modalAction: {
      marginTop: spacing(5),
    },

    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2.5),
      marginTop: spacing(2.5),
    },
    chip: {
      minHeight: 40,
      borderRadius: theme.radius.pill,
      paddingHorizontal: spacing(3.5),
      paddingVertical: spacing(2),
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primaryStrong,
    },
    chipText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.985 }],
    },
  });
}

function createInlineButtonStyles(theme: TeacherTheme) {
  return StyleSheet.create({
    primaryBtn: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
    },
    secondaryBtn: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    primaryText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.accentCardText,
    },
    secondaryText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.text,
    },
    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.985 }],
    },
  });
}

function createInlinePillStyles(theme: TeacherTheme) {
  return StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: theme.radius.pill,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.75),
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },
    pillText: {
      ...theme.type.caption,
      color: theme.colors.text,
    } as TextStyle,
  });
}

function createInlineFilterStyles(theme: TeacherTheme) {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
      gap: spacing(3),
    },
    label: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    } as TextStyle,
    controls: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
    },
    valuePill: {
      flex: 1,
      minHeight: 44,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing(3),
    },
    valueText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    } as TextStyle,
  });
}