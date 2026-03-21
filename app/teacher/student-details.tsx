// app/teacher/student-details.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import {
  buildTeacherTheme,
  getTeacherUi,
  spacing,
  type TeacherTheme,
  type Ui,
} from "../../components/teacher/teacher-ui";

type StudentStatus = "Eligible" | "Not yet calculated" | "At risk";

type StudentProfile = {
  id: string;
  name: string;
  form: string;
  stream: string;
  dob: string;
  gender: "Male" | "Female";
  guardian: string;
  phone: string;
  points: number;
  status: StudentStatus;
};

type ResultItem = {
  subject: string;
  score: number;
  grade: string;
};

type ProgressPoint = {
  label: string;
  points: number;
};

type CourseRec = {
  title: string;
  university: string;
  requiredPoints: string;
};

/* ============================================================================
   Mock data
============================================================================ */

const SAMPLE_STUDENTS: StudentProfile[] = [
  {
    id: "s1",
    name: "Katlo Monang",
    form: "Form 5",
    stream: "5A",
    dob: "12 Mar 2008",
    gender: "Male",
    guardian: "M. Monang",
    phone: "+267 7XX XXX XX",
    points: 48,
    status: "Eligible",
  },
  {
    id: "s2",
    name: "Reabetswe Monang",
    form: "Form 5",
    stream: "5A",
    dob: "03 May 2008",
    gender: "Female",
    guardian: "M. Monang",
    phone: "+267 7XX XXX XX",
    points: 36,
    status: "Not yet calculated",
  },
  {
    id: "s3",
    name: "Onalenna Sebego",
    form: "Form 4",
    stream: "4B",
    dob: "17 Nov 2009",
    gender: "Female",
    guardian: "T. Sebego",
    phone: "+267 7XX XXX XX",
    points: 28,
    status: "At risk",
  },
];

const RESULTS_BY_ID: Record<string, ResultItem[]> = {
  s1: [
    { subject: "English", score: 78, grade: "B" },
    { subject: "Mathematics", score: 82, grade: "A" },
    { subject: "Accounting", score: 74, grade: "B" },
    { subject: "Biology", score: 66, grade: "C" },
    { subject: "Computer Studies", score: 88, grade: "A" },
  ],
  s2: [
    { subject: "English", score: 62, grade: "C" },
    { subject: "Mathematics", score: 51, grade: "D" },
    { subject: "Accounting", score: 58, grade: "D" },
    { subject: "Business Studies", score: 65, grade: "C" },
    { subject: "Computer Studies", score: 71, grade: "B" },
  ],
  s3: [
    { subject: "English", score: 49, grade: "E" },
    { subject: "Mathematics", score: 43, grade: "E" },
    { subject: "Science", score: 52, grade: "D" },
    { subject: "Geography", score: 55, grade: "D" },
    { subject: "Setswana", score: 60, grade: "C" },
  ],
};

const PROGRESS_BY_ID: Record<string, ProgressPoint[]> = {
  s1: [
    { label: "T1", points: 39 },
    { label: "T2", points: 43 },
    { label: "T3", points: 46 },
    { label: "T4", points: 48 },
  ],
  s2: [
    { label: "T1", points: 28 },
    { label: "T2", points: 31 },
    { label: "T3", points: 34 },
    { label: "T4", points: 36 },
  ],
  s3: [
    { label: "T1", points: 32 },
    { label: "T2", points: 30 },
    { label: "T3", points: 29 },
    { label: "T4", points: 28 },
  ],
};

const RECOMMENDED_BY_ID: Record<string, CourseRec[]> = {
  s1: [
    { title: "BSc Computer Science", university: "University of Botswana", requiredPoints: "44–52" },
    { title: "BSc Information Systems", university: "BIUST", requiredPoints: "42–50" },
    { title: "BCom Accounting", university: "BAC", requiredPoints: "40–48" },
  ],
  s2: [
    { title: "Diploma in Business", university: "BAC", requiredPoints: "30–40" },
    { title: "BSc IT (Bridging)", university: "Open University", requiredPoints: "34–44" },
    { title: "BSc Public Admin", university: "UB", requiredPoints: "36–44" },
  ],
  s3: [
    { title: "Skills Pathway: Foundation", university: "TVET / Bridging", requiredPoints: "—" },
    { title: "Certificate: Office Admin", university: "Local College", requiredPoints: "—" },
  ],
};

/* ============================================================================
   Interaction helper
============================================================================ */

type InteractState = { pressed: boolean; hovered: boolean; focused: boolean };

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
  accessibilityRole?: "button";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  hitSlop?: number;
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
        const state = { pressed, hovered, focused };
        return typeof style === "function" ? style(state) : style;
      }}
    >
      {children}
    </Pressable>
  );
}

/* ============================================================================
   Screen
============================================================================ */

export default function TeacherStudentDetailScreen() {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const studentId = (params?.id || "s1").toString();

  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);
  const styles = useMemo(() => createStyles(theme, ui), [theme, ui]);

  const student = useMemo(
    () => SAMPLE_STUDENTS.find((s) => s.id === studentId) || SAMPLE_STUDENTS[0],
    [studentId]
  );
  const results = useMemo(() => RESULTS_BY_ID[student.id] || [], [student.id]);
  const progress = useMemo(() => PROGRESS_BY_ID[student.id] || [], [student.id]);
  const recs = useMemo(() => RECOMMENDED_BY_ID[student.id] || [], [student.id]);

  const [isLoading] = useState(false);
  const [hasError] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const statusTone = useCallback((status: StudentStatus) => {
    if (status === "Eligible") return "good" as const;
    if (status === "At risk") return "risk" as const;
    return "neutral" as const;
  }, []);

  const averageScore = useMemo(() => {
    if (!results.length) return 0;
    return Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length);
  }, [results]);

  const trendDirection = useMemo(() => {
    if (progress.length < 2) return "Stable";
    const first = progress[0].points;
    const last = progress[progress.length - 1].points;
    if (last > first) return "Improving";
    if (last < first) return "Declining";
    return "Stable";
  }, [progress]);

  const downloadSummary = useCallback(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const html = buildPrintableHtml(student, results, progress, recs);
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
      "PDF export is ready on web via print. For mobile PDF files, add expo-print and expo-sharing."
    );
  }, [student, results, progress, recs]);

  function saveNote() {
    setNoteOpen(false);
    Alert.alert("Note saved", "This is currently a UI placeholder. Connect it to your backend later.");
  }

  return (
    <TeacherLayout activeKey="students">
      <View style={styles.screen}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroLeft}>
              <AppPressable
                onPress={() => router.back()}
                style={({ pressed, hovered, focused }) => [
                  styles.iconButton,
                  hovered && styles.hovered,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Back"
                hitSlop={10}
              >
                <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
              </AppPressable>

              <View style={styles.avatarWrap}>
                <Ionicons name="person-outline" size={26} color={theme.colors.primaryStrong} />
              </View>

              <View style={styles.heroTextBlock}>
                <View style={styles.eyebrowBadge}>
                  <Ionicons name="people-outline" size={14} color={theme.colors.accentCardText} />
                  <Text style={styles.eyebrowBadgeText}>Student profile</Text>
                </View>

                <Text style={styles.pageTitle}>{student.name}</Text>
                <Text style={styles.pageSubtitle}>
                  {student.form} · {student.stream} · Detailed academic performance and guidance overview.
                </Text>
              </View>
            </View>

            <View style={styles.heroActions}>
              <AppPressable
                onPress={() => setNoteOpen(true)}
                style={({ pressed, hovered, focused }) => [
                  styles.secondaryButton,
                  hovered && styles.hovered,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Add note"
              >
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.text} />
                <Text style={styles.secondaryButtonText}>Add note</Text>
              </AppPressable>

              <AppPressable
                onPress={downloadSummary}
                style={({ pressed, hovered, focused }) => [
                  styles.primaryButton,
                  hovered && styles.hovered,
                  focused && styles.focused,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Download summary"
              >
                <Ionicons name="download-outline" size={18} color={theme.colors.accentCardText} />
                <Text style={styles.primaryButtonText}>
                  {ui.isMobile ? "Summary" : "Download summary"}
                </Text>
              </AppPressable>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <InfoPill theme={theme} icon="school-outline" text={`${student.form} · ${student.stream}`} />
            <InfoPill theme={theme} icon="ribbon-outline" text={`${student.points} points`} />
            <StatusPill theme={theme} status={student.status} />
            <InfoPill theme={theme} icon="call-outline" text={student.phone} />
          </View>
        </View>

        {hasError ? (
          <InlineState
            theme={theme}
            styles={styles}
            tone="error"
            title="Could not load student details"
            subtitle="Check your connection and try again."
          />
        ) : isLoading ? (
          <InlineState
            theme={theme}
            styles={styles}
            tone="loading"
            title="Loading student details…"
            subtitle="Fetching latest results."
          />
        ) : null}

        <SectionHeader
          styles={styles}
          title="Overview"
          subtitle="Identity, sponsorship standing, and summary performance indicators."
        />

        <View style={styles.overviewGrid}>
          <Card styles={styles}>
            <CardHeader styles={styles} title="Student profile" right={<IconBadge theme={theme} styles={styles} icon="person-outline" />} />
            <View style={styles.infoList}>
              <InfoRow styles={styles} label="Full name" value={student.name} />
              <InfoRow styles={styles} label="Form / Grade" value={student.form} />
              <InfoRow styles={styles} label="Class / Stream" value={student.stream} />
              <InfoRow styles={styles} label="Date of birth" value={student.dob} />
              <InfoRow styles={styles} label="Gender" value={student.gender} />
              <InfoRow styles={styles} label="Guardian" value={student.guardian} wrapValue />
              <InfoRow styles={styles} label="Contact" value={student.phone} />
            </View>
          </Card>

          <Card styles={styles} soft>
            <CardHeader
              styles={styles}
              title="Summary"
              right={
                <View style={styles.smallTag}>
                  <Text style={styles.smallTagText}>Current</Text>
                </View>
              }
            />

            <View style={styles.summaryStats}>
              <MetricTile theme={theme} styles={styles} label="Points" value={String(student.points)} />
              <MetricTile theme={theme} styles={styles} label="Average score" value={`${averageScore}%`} />
              <MetricTile theme={theme} styles={styles} label="Trend" value={trendDirection} />
            </View>

            <View style={styles.summaryStatusBlock}>
              <Text style={styles.metricLabel}>Sponsorship status</Text>
              <View style={styles.statusSpacing}>
                <StatusChip theme={theme} styles={styles} status={student.status} tone={statusTone(student.status)} />
              </View>
            </View>
          </Card>
        </View>

        <SectionHeader
          styles={styles}
          title="Performance"
          subtitle="Subject results and trend progression across recent terms."
        />

        <View style={styles.performanceGrid}>
          <Card styles={styles} soft>
            <CardHeader
              styles={styles}
              title="Subjects"
              right={<Text style={styles.cardMetaText}>{results.length} items</Text>}
            />

            <View style={styles.contentSpacingMd}>
              {results.length === 0 ? (
                <EmptyRow theme={theme} styles={styles} icon="information-circle-outline" text="No results yet." />
              ) : (
                <ResultsTable results={results} compact={ui.isMobile} styles={styles} />
              )}
            </View>
          </Card>

          <Card styles={styles}>
            <CardHeader
              styles={styles}
              title="Academic progress"
              right={<Text style={styles.cardMetaText}>Trend</Text>}
            />

            <View style={styles.contentSpacingLg}>
              {progress.length === 0 ? (
                <EmptyRow theme={theme} styles={styles} icon="analytics-outline" text="No progress data yet." />
              ) : (
                <>
                  <MiniBarChart data={progress} max={60} styles={styles} />
                  <View style={styles.chartMetaRow}>
                    <Text style={styles.chartHint}>Lower risk when trend increases.</Text>
                    <Text style={styles.chartHintStrong}>Target: 40+</Text>
                  </View>
                </>
              )}
            </View>
          </Card>
        </View>

        <SectionHeader
          styles={styles}
          title="Recommended courses"
          subtitle="Read-only guidance suggestions based on current performance."
        />

        <Card styles={styles} soft>
          {recs.length === 0 ? (
            <EmptyRow theme={theme} styles={styles} icon="information-circle-outline" text="No recommendations yet." />
          ) : (
            <View>
              {recs.map((course, idx) => (
                <View
                  key={`${course.title}-${idx}`}
                  style={[
                    styles.courseRow,
                    idx !== recs.length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={styles.courseIcon}>
                    <Ionicons name="school-outline" size={18} color={theme.colors.primaryStrong} />
                  </View>

                  <View style={styles.courseTextWrap}>
                    <Text style={styles.courseTitle} numberOfLines={1}>
                      {course.title}
                    </Text>
                    <Text style={styles.courseSubtitle} numberOfLines={1}>
                      {course.university}
                    </Text>
                  </View>

                  <View style={styles.reqPill}>
                    <Text style={styles.reqPillText} numberOfLines={1}>
                      {course.requiredPoints}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Modal visible={noteOpen} transparent animationType="fade" onRequestClose={() => setNoteOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setNoteOpen(false)}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalKeyboardWrap}
            >
              <Pressable style={styles.modalCard} onPress={() => {}}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add counselling note</Text>

                  <AppPressable
                    onPress={() => setNoteOpen(false)}
                    style={({ pressed, hovered, focused }) => [
                      styles.modalCloseButton,
                      hovered && styles.hovered,
                      focused && styles.focused,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={10}
                  >
                    <Ionicons name="close" size={18} color={theme.colors.text} />
                  </AppPressable>
                </View>

                <Text style={styles.modalSubtitle}>
                  Keep notes factual and private. This can later sync to the counselling log.
                </Text>

                <View style={styles.textAreaWrap}>
                  <TextInput
                    value={noteText}
                    onChangeText={setNoteText}
                    placeholder="Write a note… (e.g., support plan, follow-up date)"
                    placeholderTextColor={theme.colors.textSoft}
                    style={styles.textArea}
                    multiline
                    textAlignVertical="top"
                    accessibilityLabel="Counselling note"
                  />
                </View>

                <View style={styles.modalActions}>
                  <AppPressable
                    onPress={() => setNoteOpen(false)}
                    style={({ pressed, hovered, focused }) => [
                      styles.modalSecondaryButton,
                      hovered && styles.hovered,
                      focused && styles.focused,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
                  </AppPressable>

                  <AppPressable
                    onPress={saveNote}
                    style={({ pressed, hovered, focused }) => [
                      styles.modalPrimaryButton,
                      hovered && styles.hovered,
                      focused && styles.focused,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Save note"
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.accentCardText} />
                    <Text style={styles.modalPrimaryButtonText}>Save</Text>
                  </AppPressable>
                </View>
              </Pressable>
            </KeyboardAvoidingView>
          </Pressable>
        </Modal>
      </View>
    </TeacherLayout>
  );
}

/* ============================================================================
   Components
============================================================================ */

function SectionHeader({
  styles,
  title,
  subtitle,
}: {
  styles: ReturnType<typeof createStyles>;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEyebrow}>Student details</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function Card({
  children,
  styles,
  soft,
}: {
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  soft?: boolean;
}) {
  return <View style={[styles.cardBase, soft ? styles.cardSoft : styles.cardPrimary]}>{children}</View>;
}

function CardHeader({
  styles,
  title,
  right,
}: {
  styles: ReturnType<typeof createStyles>;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.cardHeaderRow}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {title}
      </Text>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

function IconBadge({
  theme,
  styles,
  icon,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.iconBadge}>
      <Ionicons name={icon} size={18} color={theme.colors.primaryStrong} />
    </View>
  );
}

function MetricTile({
  theme,
  styles,
  label,
  value,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function InfoRow({
  styles,
  label,
  value,
  wrapValue,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  wrapValue?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, wrapValue && styles.infoValueWrap]}
        numberOfLines={wrapValue ? 2 : 1}
      >
        {value}
      </Text>
    </View>
  );
}

function StatusPill({
  theme,
  status,
}: {
  theme: TeacherTheme;
  status: StudentStatus;
}) {
  const local = createStatusPillStyles(theme, status);
  return (
    <View style={local.pill}>
      <Ionicons name={local.icon} size={14} color={local.textColor} />
      <Text style={local.text}>{status}</Text>
    </View>
  );
}

function StatusChip({
  theme,
  styles,
  status,
  tone,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  status: StudentStatus;
  tone: "good" | "neutral" | "risk";
}) {
  const icon =
    tone === "good"
      ? "checkmark-circle-outline"
      : tone === "risk"
      ? "alert-circle-outline"
      : "information-circle-outline";

  return (
    <View
      style={[
        styles.statusChip,
        tone === "good"
          ? styles.statusChipGood
          : tone === "risk"
          ? styles.statusChipRisk
          : styles.statusChipNeutral,
      ]}
    >
      <Ionicons name={icon} size={16} color={theme.colors.text} />
      <Text style={styles.statusChipText}>{status}</Text>
    </View>
  );
}

function MiniBarChart({
  data,
  max,
  styles,
}: {
  data: { label: string; points: number }[];
  max: number;
  styles: ReturnType<typeof createStyles>;
}) {
  const safeMax = Math.max(1, max);

  return (
    <View style={styles.chartWrap}>
      <View style={styles.chartBarsRow}>
        {data.map((item, idx) => {
          const h = Math.max(10, Math.round((item.points / safeMax) * 112));
          return (
            <View key={`${item.label}-${idx}`} style={styles.chartBarColumn}>
              <Text style={styles.chartValueLabel}>{item.points}</Text>
              <View style={[styles.chartBar, { height: h }]} />
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.chartAxisRow}>
        <Text style={styles.chartAxisText}>0</Text>
        <Text style={styles.chartAxisText}>{max}</Text>
      </View>
    </View>
  );
}

function ResultsTable({
  results,
  compact,
  styles,
}: {
  results: ResultItem[];
  compact?: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View>
      {!compact ? (
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
          <Text style={[styles.tableHeaderCell, styles.subjectColumn]}>Subject</Text>
          <Text style={[styles.tableHeaderCell, styles.scoreColumn]}>Score</Text>
          <Text style={[styles.tableHeaderCell, styles.gradeColumn]}>Grade</Text>
        </View>
      ) : null}

      {results.map((r, idx) => {
        const isLast = idx === results.length - 1;
        return (
          <View
            key={`${r.subject}-${idx}`}
            style={[styles.tableRow, !isLast && styles.rowDivider]}
          >
            <View style={styles.subjectColumn}>
              <Text style={styles.rowItemTitle} numberOfLines={1}>
                {r.subject}
              </Text>
              {compact ? (
                <Text style={styles.rowItemSub} numberOfLines={1}>
                  Grade: {r.grade}
                </Text>
              ) : null}
            </View>

            <View style={styles.scorePill}>
              <Text style={styles.scorePillText}>{r.score}%</Text>
            </View>

            {!compact ? <Text style={styles.gradeCell}>{r.grade}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function EmptyRow({
  theme,
  styles,
  icon,
  text,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.emptyRow}>
      <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
      <Text style={styles.emptyText}>{text}</Text>
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
    <View
      style={[
        styles.inlineState,
        tone === "error" ? styles.inlineStateError : styles.inlineStateLoading,
      ]}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
      <View style={styles.inlineStateTextWrap}>
        <Text style={styles.inlineStateTitle}>{title}</Text>
        <Text style={styles.inlineStateSubtitle}>{subtitle}</Text>
      </View>
    </View>
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
      <Text style={local.text} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/* ============================================================================
   Print helper
============================================================================ */

function buildPrintableHtml(
  student: StudentProfile,
  results: ResultItem[],
  progress: ProgressPoint[],
  recs: CourseRec[]
) {
  const resultsRows = results
    .map(
      (r) =>
        `<tr><td>${escapeHtml(r.subject)}</td><td style="text-align:right">${r.score}%</td><td style="text-align:right">${escapeHtml(
          r.grade
        )}</td></tr>`
    )
    .join("");

  const progressRows = progress
    .map((p) => `<tr><td>${escapeHtml(p.label)}</td><td style="text-align:right">${p.points}</td></tr>`)
    .join("");

  const recRows = recs
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.title)}</td><td>${escapeHtml(c.university)}</td><td>${escapeHtml(
          c.requiredPoints
        )}</td></tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Student Summary</title>
  <style>
    body{font-family:Arial,sans-serif;margin:24px;color:#0b0f12;background:#f7fbff}
    .card{border:1px solid #dde6ee;border-radius:14px;padding:16px;margin-bottom:14px;background:#fff}
    .h1{font-size:18px;font-weight:800;margin:0}
    .sub{color:#555;margin-top:6px;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:10px}
    th,td{border-bottom:1px solid #eee;padding:8px;font-size:12px}
    th{text-align:left;color:#444}
    .pill{display:inline-block;padding:4px 10px;border:1px solid #ddd;border-radius:999px;font-weight:700;font-size:12px}
    .muted{color:#666}
  </style>
</head>
<body>
  <div class="card">
    <p class="h1">${escapeHtml(student.name)} — Student Summary</p>
    <p class="sub">${escapeHtml(student.form)} · ${escapeHtml(student.stream)} · Points: <b>${student.points}</b> · Status: <span class="pill">${escapeHtml(
    student.status
  )}</span></p>
    <p class="sub muted">Generated by UniPathway Teacher Portal</p>
  </div>

  <div class="card">
    <p class="h1">Profile</p>
    <table>
      <tr><th>Field</th><th>Value</th></tr>
      <tr><td>Full name</td><td>${escapeHtml(student.name)}</td></tr>
      <tr><td>Form</td><td>${escapeHtml(student.form)}</td></tr>
      <tr><td>Class</td><td>${escapeHtml(student.stream)}</td></tr>
      <tr><td>Date of birth</td><td>${escapeHtml(student.dob)}</td></tr>
      <tr><td>Guardian</td><td>${escapeHtml(student.guardian)}</td></tr>
      <tr><td>Contact</td><td>${escapeHtml(student.phone)}</td></tr>
    </table>
  </div>

  <div class="card">
    <p class="h1">Results</p>
    <table>
      <tr><th>Subject</th><th style="text-align:right">Score</th><th style="text-align:right">Grade</th></tr>
      ${resultsRows || "<tr><td colspan='3' class='muted'>No results</td></tr>"}
    </table>
  </div>

  <div class="card">
    <p class="h1">Progress</p>
    <table>
      <tr><th>Term</th><th style="text-align:right">Points</th></tr>
      ${progressRows || "<tr><td colspan='2' class='muted'>No data</td></tr>"}
    </table>
  </div>

  <div class="card">
    <p class="h1">Recommended courses</p>
    <table>
      <tr><th>Course</th><th>Institution</th><th>Required points</th></tr>
      ${recRows || "<tr><td colspan='3' class='muted'>No recommendations</td></tr>"}
    </table>
  </div>
</body>
</html>`;
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
  return StyleSheet.create({
    screen: {
      gap: spacing(6),
    },

    heroCard: {
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: ui.isDesktop ? spacing(6) : spacing(4),
      gap: spacing(4),
      ...theme.shadow,
    },
    heroHeader: {
      flexDirection: ui.isDesktop ? "row" : "column",
      alignItems: ui.isDesktop ? "center" : "flex-start",
      justifyContent: "space-between",
      gap: spacing(4),
    },
    heroLeft: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: ui.isMobile ? "flex-start" : "center",
      gap: spacing(3),
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
      gap: spacing(1.5),
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
    avatarWrap: {
      width: 56,
      height: 56,
      borderRadius: 999,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
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
      flexWrap: "wrap",
    },
    heroMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2.5),
    },

    sectionHeader: {
      gap: spacing(1),
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

    overviewGrid: {
      flexDirection: ui.isDesktop ? "row" : "column",
      gap: spacing(4),
    },
    performanceGrid: {
      flexDirection: ui.isDesktop ? "row" : "column",
      gap: spacing(4),
    },

    cardBase: {
      flex: 1,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      padding: spacing(4),
      minWidth: 0,
    },
    cardPrimary: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.shellBorder,
    },
    cardSoft: {
      backgroundColor: theme.colors.surfaceStrong,
      borderColor: theme.colors.shellBorder,
    },

    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    cardTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
      flex: 1,
    },
    cardMetaText: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    iconBadge: {
      width: 38,
      height: 38,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    infoList: {
      marginTop: spacing(3),
      gap: spacing(2.5),
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    infoLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      flex: 1,
    },
    infoValue: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      maxWidth: ui.isMobile ? "52%" : "60%",
      textAlign: "right",
      flexShrink: 1,
    },
    infoValueWrap: {
      textAlign: "right",
    },

    smallTag: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
    },
    smallTagText: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },

    summaryStats: {
      marginTop: spacing(3),
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(3),
    },
    metricTile: {
      flexGrow: 1,
      minWidth: ui.isMobile ? "100%" : 110,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(3),
    },
    metricLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    metricValue: {
      ...(ui.isDesktop ? theme.type.h2 : theme.type.h3),
      color: theme.colors.text,
      marginTop: spacing(1),
    },
    summaryStatusBlock: {
      marginTop: spacing(4),
    },
    statusSpacing: {
      marginTop: spacing(2),
    },

    statusChip: {
      alignSelf: "flex-start",
      minHeight: 34,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: 999,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
      borderWidth: 1,
    },
    statusChipGood: {
      backgroundColor: theme.colors.successBg,
      borderColor: theme.colors.successBorder,
    },
    statusChipNeutral: {
      backgroundColor: theme.colors.infoBg,
      borderColor: theme.colors.infoBorder,
    },
    statusChipRisk: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },
    statusChipText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    contentSpacingMd: {
      marginTop: spacing(3),
    },
    contentSpacingLg: {
      marginTop: spacing(4),
    },

    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      paddingVertical: spacing(2.5),
    },
    tableHeaderRow: {
      paddingTop: 0,
      paddingBottom: spacing(2),
    },
    tableHeaderCell: {
      ...theme.type.tinyCaps,
      color: theme.colors.textMuted,
    },
    subjectColumn: {
      flex: 1,
      minWidth: 0,
    } as ViewStyle,
    scoreColumn: {
      width: 84,
      textAlign: "right",
    } as TextStyle,
    gradeColumn: {
      width: 68,
      textAlign: "right",
    } as TextStyle,
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
    },
    rowItemTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    rowItemSub: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      marginTop: spacing(0.5),
    },
    scorePill: {
      minWidth: 76,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
      alignItems: "center",
      justifyContent: "center",
    },
    scorePillText: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    gradeCell: {
      width: 68,
      textAlign: "right",
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },

    chartWrap: {
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
    },
    chartBarsRow: {
      height: 148,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    chartBarColumn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: spacing(1.5),
    },
    chartValueLabel: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    chartBar: {
      width: "100%",
      minHeight: 10,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
    },
    chartLabel: {
      ...theme.type.caption,
      color: theme.colors.text,
      textAlign: "center",
    },
    chartAxisRow: {
      marginTop: spacing(3),
      flexDirection: "row",
      justifyContent: "space-between",
    },
    chartAxisText: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
    },
    chartMetaRow: {
      marginTop: spacing(3),
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    chartHint: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      flexShrink: 1,
    },
    chartHintStrong: {
      ...theme.type.caption,
      color: theme.colors.text,
      flexShrink: 0,
    },

    courseRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
      paddingVertical: spacing(3),
    },
    courseIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    courseTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    courseTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    courseSubtitle: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      marginTop: spacing(0.5),
    },
    reqPill: {
      maxWidth: 128,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
    },
    reqPillText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    emptyRow: {
      paddingVertical: spacing(4),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2.5),
    },
    emptyText: {
      ...theme.type.bodyStrong,
      color: theme.colors.textMuted,
    },

    inlineState: {
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      padding: spacing(4),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(3),
    },
    inlineStateError: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },
    inlineStateLoading: {
      backgroundColor: theme.colors.infoBg,
      borderColor: theme.colors.infoBorder,
    },
    inlineStateTextWrap: {
      flex: 1,
      minWidth: 0,
    },
    inlineStateTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
    },
    inlineStateSubtitle: {
      ...theme.type.caption,
      color: theme.colors.textMuted,
      marginTop: spacing(0.5),
    },

    iconButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    primaryButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
    },
    primaryButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.accentCardText,
    },
    secondaryButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
    },
    secondaryButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.text,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing(4),
    },
    modalKeyboardWrap: {
      width: "100%",
    },
    modalCard: {
      width: "100%",
      maxWidth: 460,
      alignSelf: "center",
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.shellBorder,
      padding: spacing(5),
      ...theme.shadow,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    modalTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
      flex: 1,
    },
    modalCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 999,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    modalSubtitle: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      marginTop: spacing(2),
    },
    textAreaWrap: {
      marginTop: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(3),
    },
    textArea: {
      minHeight: 132,
      ...theme.type.body,
      color: theme.colors.text,
    },
    modalActions: {
      marginTop: spacing(4),
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing(3),
      flexWrap: "wrap",
    },
    modalSecondaryButton: {
      minHeight: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
      alignItems: "center",
      justifyContent: "center",
    },
    modalSecondaryButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.text,
    },
    modalPrimaryButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
      paddingHorizontal: spacing(4),
      paddingVertical: spacing(2.5),
    },
    modalPrimaryButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      color: theme.colors.accentCardText,
    },

    hovered: Platform.OS === "web" ? ({ opacity: 0.985 } as ViewStyle) : ({} as ViewStyle),
    focused:
      Platform.OS === "web"
        ? ({
            borderColor: theme.colors.focusRing,
            borderWidth: 2,
          } as ViewStyle)
        : ({} as ViewStyle),
    pressed: {
      opacity: 0.95,
      transform: [{ scale: 0.985 }],
    },
  });
}

function createInlinePillStyles(theme: TeacherTheme) {
  return StyleSheet.create({
    pill: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: theme.radius.pill,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.75),
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    } as ViewStyle,
    text: {
      ...theme.type.caption,
      color: theme.colors.text,
      flexShrink: 1,
    } as TextStyle,
  });
}

function createStatusPillStyles(theme: TeacherTheme, status: StudentStatus) {
  const config =
    status === "Eligible"
      ? {
          bg: theme.colors.successBg,
          border: theme.colors.successBorder,
          text: theme.colors.text,
          icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
        }
      : status === "At risk"
      ? {
          bg: theme.colors.dangerBg,
          border: theme.colors.dangerBorder,
          text: theme.colors.dangerText,
          icon: "alert-circle-outline" as keyof typeof Ionicons.glyphMap,
        }
      : {
          bg: theme.colors.infoBg,
          border: theme.colors.infoBorder,
          text: theme.colors.text,
          icon: "time-outline" as keyof typeof Ionicons.glyphMap,
        };

  return {
    icon: config.icon,
    textColor: config.text,
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      borderRadius: theme.radius.pill,
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.75),
      backgroundColor: config.bg,
      borderWidth: 1,
      borderColor: config.border,
    } as ViewStyle,
    text: {
      ...theme.type.caption,
      color: config.text,
    } as TextStyle,
  };
}