// app/teacher/upload-results.tsx
import React, { useCallback, useMemo, useRef, useState } from "react";
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
  KeyboardAvoidingView,
  Alert,
  Animated,
  ActivityIndicator,
  useColorScheme,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import TeacherLayout from "../../components/teacher/TeacherLayout";
import {
  buildTeacherTheme,
  getTeacherUi,
  spacing,
  type TeacherTheme,
  type Ui,
} from "../../components/teacher/teacher-ui";

/* ---------------------------------- Types --------------------------------- */

type ImportedRow = {
  id: string;
  name: string;
  form: string;
  stream: string;
  subject: string;
  score: string;
};

type RowIssue = {
  rowId: string;
  field: keyof Omit<ImportedRow, "id">;
  message: string;
};

type InteractState = {
  pressed: boolean;
  hovered: boolean;
  focused: boolean;
};

/* --------------------------------- Config --------------------------------- */

const SCHOOL_NAME = "Botswana Accountancy College";
const TEACHER_NAME = "Ms. D. Kgomotso";

const TEMPLATE_HEADER = "name,form,stream,subject,score";
const TEMPLATE_EXAMPLE_ROWS = [
  "Katlo Monang,Form 5,5A,Mathematics,82",
  "Katlo Monang,Form 5,5A,English,78",
  "Reabetswe Monang,Form 5,5A,Accounting,58",
];

const MAX_PREVIEW = 12;

/* -------------------------------- Utilities ------------------------------- */

function notify(message: string, title = "UniPathway") {
  try {
    Alert.alert(title, message);
  } catch {
    // noop
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseCsvLike(text: string): { rows: ImportedRow[]; problems: RowIssue[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { rows: [], problems: [] };

  const header = lines[0].toLowerCase().replace(/\s/g, "");
  const expected = TEMPLATE_HEADER.replace(/\s/g, "");
  const problems: RowIssue[] = [];

  if (header !== expected) {
    problems.push({
      rowId: "0",
      field: "name",
      message: `Header must be exactly: ${TEMPLATE_HEADER}`,
    });
  }

  const rows: ImportedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",").map((p) => p.trim());
    const id = String(i);

    const row: ImportedRow = {
      id,
      name: parts[0] || "",
      form: parts[1] || "",
      stream: parts[2] || "",
      subject: parts[3] || "",
      score: parts[4] || "",
    };

    rows.push(row);

    if (!row.name) problems.push({ rowId: id, field: "name", message: "Name is required." });
    if (!row.form) problems.push({ rowId: id, field: "form", message: "Form/Grade is required." });
    if (!row.stream) problems.push({ rowId: id, field: "stream", message: "Class/Stream is required." });
    if (!row.subject) problems.push({ rowId: id, field: "subject", message: "Subject is required." });

    const scoreNum = Number(row.score);
    if (row.score === "" || Number.isNaN(scoreNum)) {
      problems.push({ rowId: id, field: "score", message: "Score must be a number." });
    } else if (scoreNum < 0 || scoreNum > 100) {
      problems.push({ rowId: id, field: "score", message: "Score must be between 0 and 100." });
    }

    if (parts.length < 5) {
      problems.push({
        rowId: id,
        field: "subject",
        message: "Row is missing one or more columns (expected 5).",
      });
    }
  }

  return { rows, problems };
}

/* --------------------------------- Styles --------------------------------- */

function createStyles(theme: TeacherTheme, ui: Ui) {
  return StyleSheet.create({
    screen: {
      width: "100%",
      maxWidth: ui.isDesktop ? 1220 : "100%",
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
    actionDanger: {
      minHeight: 46,
      paddingHorizontal: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.dangerBorder,
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
    actionTextDanger: {
      ...theme.type.bodyStrong,
      color: theme.colors.dangerText,
    },

    contentGrid: {
      flexDirection: ui.isDesktop || ui.isTablet ? "row" : "column",
      gap: spacing(4),
      alignItems: "flex-start",
    },
    col: {
      width: "100%",
      minWidth: 0,
    },
    colLeft: {
      flex: ui.isDesktop ? 1.08 : 1,
    },
    colRight: {
      flex: 1,
    },

    card: {
      width: "100%",
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
    },
    cardPrimary: {
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.infoBorder,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(2),
      flexWrap: "wrap",
    },
    cardTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },

    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(1.5),
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(1.5),
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      maxWidth: "100%",
    },
    badgeNeutral: {
      backgroundColor: theme.colors.surfaceStrong,
      borderColor: theme.colors.dividerSoft,
    },
    badgeGood: {
      backgroundColor: theme.colors.successBg,
      borderColor: theme.colors.successBorder,
    },
    badgeRisk: {
      backgroundColor: theme.colors.dangerBg,
      borderColor: theme.colors.dangerBorder,
    },
    badgeText: {
      ...theme.type.caption,
      color: theme.colors.text,
    },

    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(2.5),
    },
    bulletDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: theme.colors.textMuted,
      marginTop: 7,
    },
    bulletText: {
      flex: 1,
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    buttonRow: {
      marginTop: spacing(4),
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing(2),
    },

    dropZone: {
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.infoBorder,
      backgroundColor: theme.colors.surfaceRaised,
      padding: spacing(4),
      alignItems: "center",
    },
    dropIcon: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      alignItems: "center",
      justifyContent: "center",
    },
    dropTitle: {
      marginTop: spacing(2.5),
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      fontSize: 16,
    },
    dropSub: {
      marginTop: spacing(1.5),
      ...theme.type.meta,
      color: theme.colors.textMuted,
      textAlign: "center",
      maxWidth: 520,
    },
    filePill: {
      marginTop: spacing(3),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2),
      paddingHorizontal: spacing(3),
      paddingVertical: spacing(2),
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      maxWidth: "100%",
    },
    filePillText: {
      ...theme.type.meta,
      color: theme.colors.text,
      flexShrink: 1,
    },

    infoList: {
      marginTop: spacing(3),
      gap: spacing(2.5),
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(3),
    },
    infoLabel: {
      flex: 1,
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },
    infoValue: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      maxWidth: "50%",
    },
    valueRisk: {
      color: theme.colors.dangerText,
    },
    valueGood: {
      color: theme.colors.text,
    },

    confirmBtn: {
      minHeight: 46,
      paddingHorizontal: spacing(4),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.primary,
      borderWidth: 1,
      borderColor: theme.colors.primaryStrong,
      justifyContent: "center",
      minWidth: 190,
    },
    confirmInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing(2),
    },
    confirmText: {
      ...theme.type.bodyStrong,
      color: theme.colors.accentCardText,
    },
    disabled: {
      opacity: 0.5,
    },

    successRow: {
      marginTop: spacing(3),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(2.5),
      padding: spacing(3),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.successBg,
      borderWidth: 1,
      borderColor: theme.colors.successBorder,
    },
    successText: {
      flex: 1,
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    emptyRow: {
      paddingVertical: spacing(3),
      flexDirection: "row",
      alignItems: "center",
      gap: spacing(2.5),
    },
    emptyText: {
      flex: 1,
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    issueList: {
      gap: spacing(2.5),
    },
    issueRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(2.5),
      padding: spacing(3),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },
    issueIcon: {
      width: 30,
      height: 30,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dangerBg,
      borderWidth: 1,
      borderColor: theme.colors.dangerBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    issueTitle: {
      ...theme.type.bodyStrong,
      color: theme.colors.text,
      fontSize: 13,
    },
    issueSub: {
      marginTop: spacing(1),
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    mutedSmall: {
      ...theme.type.meta,
      color: theme.colors.textMuted,
      fontSize: 12,
    },

    tableCard: {
      backgroundColor: theme.colors.surfaceStrong,
      borderRadius: theme.radius.xl,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      overflow: "hidden",
    },
    tableHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing(3.5),
      paddingVertical: spacing(3),
      backgroundColor: theme.colors.tableHeaderBg,
    },
    th: {
      ...theme.type.tinyCaps,
      color: theme.colors.textSoft,
    },
    tableDivider: {
      height: 1,
      backgroundColor: theme.colors.dividerSoft,
    },
    tr: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing(3.5),
      paddingVertical: spacing(3),
      gap: spacing(2),
      backgroundColor: theme.colors.surface,
    },
    trBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.dividerSoft,
    },
    trRisk: {
      backgroundColor: theme.colors.dangerBg,
    },
    td: {
      ...theme.type.meta,
      color: theme.colors.text,
      fontSize: 13,
    },

    helperRow: {
      marginTop: spacing(3),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing(2.5),
      padding: spacing(3),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceStrong,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
    },
    helperText: {
      flex: 1,
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },

    modalBackdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing(4),
    },
    modalCard: {
      width: 460,
      maxWidth: "100%",
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.dividerSoft,
      padding: spacing(4),
      ...theme.shadow,
    },
    modalHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing(2),
    },
    modalTitle: {
      ...theme.type.h3,
      color: theme.colors.text,
    },
    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceRaised,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      alignItems: "center",
      justifyContent: "center",
    },
    modalSub: {
      marginTop: spacing(2),
      ...theme.type.meta,
      color: theme.colors.textMuted,
    },
    textAreaWrap: {
      marginTop: spacing(3),
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.inputBg,
      borderWidth: 1,
      borderColor: theme.colors.divider,
      padding: spacing(2.5),
    },
    textArea: {
      minHeight: 180,
      color: theme.colors.text,
      ...theme.type.meta,
      fontWeight: "900",
    },
    modalActionsRow: {
      marginTop: spacing(3),
      flexDirection: "row",
      gap: spacing(2),
      justifyContent: "flex-end",
      flexWrap: "wrap",
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
  });
}

/* ---------------------------- Shared Pressable ---------------------------- */

function AppPressable({
  children,
  onPress,
  style,
  disabled,
  accessibilityRole,
  accessibilityLabel,
  hitSlop,
  onPressIn,
  onPressOut,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style: StyleProp<ViewStyle> | ((s: InteractState) => StyleProp<ViewStyle>);
  disabled?: boolean;
  accessibilityRole?: any;
  accessibilityLabel?: string;
  hitSlop?: any;
  onPressIn?: () => void;
  onPressOut?: () => void;
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
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
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

/* --------------------------------- Screen --------------------------------- */

export default function TeacherUploadResultsScreen() {
  const colorScheme = useColorScheme();
  const { width, height } = useWindowDimensions();

  const theme = useMemo(
    () => buildTeacherTheme(colorScheme === "dark" ? "dark" : "light"),
    [colorScheme]
  );
  const ui = useMemo(() => getTeacherUi(width, height), [width, height]);
  const styles = useMemo(() => createStyles(theme, ui), [theme, ui]);

  const [pasteOpen, setPasteOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [imported, setImported] = useState<ImportedRow[]>([]);
  const [issues, setIssues] = useState<RowIssue[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const hasData = imported.length > 0;
  const hasErrors = issues.length > 0;
  const previewRows = imported.slice(0, MAX_PREVIEW);
  const tableNeedsHorizontalScroll = ui.isMobile;

  const summary = useMemo(() => {
    const students = new Set(imported.map((r) => r.name.trim()).filter(Boolean));
    const subjects = new Set(imported.map((r) => r.subject.trim()).filter(Boolean));
    return {
      total: imported.length,
      errorCount: issues.length,
      studentCount: students.size,
      subjectCount: subjects.size,
    };
  }, [imported, issues]);

  const pressAnim = useRef(new Animated.Value(1)).current;

  const bump = useCallback(
    (down: boolean) => {
      Animated.spring(pressAnim, {
        toValue: down ? 0.995 : 1,
        useNativeDriver: true,
        speed: 24,
        bounciness: 0,
      }).start();
    },
    [pressAnim]
  );

  const resetImport = useCallback(() => {
    setFileName(null);
    setRawText("");
    setImported([]);
    setIssues([]);
    setConfirmed(false);
    setIsImporting(false);
  }, []);

  const downloadTemplate = useCallback(() => {
    const csv = [TEMPLATE_HEADER, ...TEMPLATE_EXAMPLE_ROWS].join("\n");

    if (Platform.OS === "web") {
      try {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const d = (globalThis as any).document;
        if (d?.createElement) {
          const a = d.createElement("a");
          a.href = url;
          a.download = "unipathway-results-template.csv";
          d.body?.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          return;
        }

        const w = (globalThis as any).window?.open?.("", "_blank");
        if (w?.document?.write) {
          w.document.write(`<pre>${escapeHtml(csv)}</pre>`);
          w.document.close();
        }
        return;
      } catch {
        notify("Could not download template in this browser. Try another browser.");
        return;
      }
    }

    notify(
      "Template download is available on web. On mobile, copy the header and paste CSV here. For real mobile file import, add expo-document-picker."
    );
  }, []);

  const openPaste = useCallback(() => {
    setPasteOpen(true);
    setConfirmed(false);
  }, []);

  const importFromText = useCallback(async (text: string) => {
    setIsImporting(true);
    setConfirmed(false);

    await new Promise((r) => setTimeout(r, 180));

    const { rows, problems } = parseCsvLike(text);
    setImported(rows);
    setIssues(problems);
    setIsImporting(false);
  }, []);

  const selectFileMock = useCallback(() => {
    setFileName("sample-results.csv");
    const sample = [TEMPLATE_HEADER, ...TEMPLATE_EXAMPLE_ROWS].join("\n");
    setRawText(sample);
    importFromText(sample);
  }, [importFromText]);

  const confirmUpload = useCallback(() => {
    if (!hasData) return;
    if (hasErrors) {
      notify("Fix validation errors before confirming upload.");
      return;
    }
    setConfirmed(true);
    notify("Upload confirmed. Review results in Students.");
  }, [hasData, hasErrors]);

  return (
    <TeacherLayout activeKey="reports">
      <View style={styles.screen}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleWrap}>
              <View style={styles.heroBadge}>
                <Ionicons name="cloud-upload-outline" size={14} color={theme.colors.primaryStrong} />
                <Text style={styles.heroBadgeText}>Bulk results import</Text>
              </View>

              <Text style={styles.heroTitle}>Upload results</Text>

              <Text style={styles.heroSubtitle}>
                Import a CSV export using the UniPathway template, review validation feedback, then confirm the batch.
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
              <ActionButton
                theme={theme}
                styles={styles}
                variant="primary"
                icon="download-outline"
                label="Download template"
                onPress={downloadTemplate}
              />
              <ActionButton
                theme={theme}
                styles={styles}
                variant="secondary"
                icon="clipboard-outline"
                label="Paste CSV"
                onPress={openPaste}
              />
              <ActionButton
                theme={theme}
                styles={styles}
                variant="secondary"
                icon="folder-open-outline"
                label="Select file"
                onPress={selectFileMock}
              />
              {hasData ? (
                <ActionButton
                  theme={theme}
                  styles={styles}
                  variant="danger"
                  icon="trash-outline"
                  label="Clear"
                  onPress={resetImport}
                />
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.contentGrid}>
          <View style={[styles.col, styles.colLeft]}>
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Instructions</Text>
                <Badge
                  theme={theme}
                  styles={styles}
                  tone="neutral"
                  icon="information-circle-outline"
                  label="CSV format"
                />
              </View>

              <View style={{ marginTop: spacing(3), gap: spacing(2.5) }}>
                <Bullet styles={styles} text="Use the template columns exactly: name, form, stream, subject, score." />
                <Bullet styles={styles} text="Score must be a number from 0 to 100." />
                <Bullet styles={styles} text="One row per subject per student." />
                <Bullet styles={styles} text="After import, review the preview and fix validation errors." />
              </View>

              {!ui.isDesktop ? (
                <View style={styles.buttonRow}>
                  <ActionButton
                    theme={theme}
                    styles={styles}
                    variant="primary"
                    icon="download-outline"
                    label="Download template"
                    onPress={downloadTemplate}
                  />
                  <ActionButton
                    theme={theme}
                    styles={styles}
                    variant="secondary"
                    icon="clipboard-outline"
                    label="Paste CSV"
                    onPress={openPaste}
                  />
                  <ActionButton
                    theme={theme}
                    styles={styles}
                    variant="secondary"
                    icon="folder-open-outline"
                    label="Select file"
                    onPress={selectFileMock}
                  />
                  {hasData ? (
                    <ActionButton
                      theme={theme}
                      styles={styles}
                      variant="danger"
                      icon="trash-outline"
                      label="Clear"
                      onPress={resetImport}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>

            <View style={styles.cardPrimary ? { height: spacing(4) } : undefined} />
            <View style={styles.cardPrimary}>
              <View style={styles.dropZone}>
                <View style={styles.dropIcon}>
                  <Ionicons name="cloud-upload-outline" size={22} color={theme.colors.text} />
                </View>

                <Text style={styles.dropTitle}>Upload area</Text>
                <Text style={styles.dropSub}>
                  Drag and drop can be added later on web with a file input handler. For now, use Select file or Paste CSV.
                </Text>

                <View style={styles.buttonRow}>
                  <ActionButton
                    theme={theme}
                    styles={styles}
                    variant="primary"
                    icon="folder-open-outline"
                    label="Select file"
                    onPress={selectFileMock}
                  />
                  <ActionButton
                    theme={theme}
                    styles={styles}
                    variant="secondary"
                    icon="clipboard-outline"
                    label="Paste CSV"
                    onPress={openPaste}
                  />
                </View>

                {fileName ? (
                  <View style={styles.filePill} accessibilityLabel={`Selected file: ${fileName}`}>
                    <Ionicons name="document-outline" size={16} color={theme.colors.text} />
                    <Text style={styles.filePillText} numberOfLines={1}>
                      {fileName}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={[styles.col, styles.colRight]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Import summary</Text>

              <View style={styles.infoList}>
                <InfoRow styles={styles} label="Rows imported" value={`${summary.total}`} />
                <InfoRow styles={styles} label="Students detected" value={`${summary.studentCount}`} />
                <InfoRow styles={styles} label="Subjects detected" value={`${summary.subjectCount}`} />
                <InfoRow
                  styles={styles}
                  label="Validation issues"
                  value={`${summary.errorCount}`}
                  valueTone={summary.errorCount > 0 ? "risk" : "good"}
                />
              </View>

              <View style={styles.buttonRow}>
                <AppPressable
                  onPressIn={() => bump(true)}
                  onPressOut={() => bump(false)}
                  onPress={confirmUpload}
                  disabled={!hasData || hasErrors || confirmed || isImporting}
                  style={({ pressed, hovered, focused }) => [
                    styles.confirmBtn,
                    (!hasData || hasErrors || confirmed || isImporting) && styles.disabled,
                    hovered && styles.hoverable,
                    focused && styles.focused,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm upload"
                >
                  <Animated.View style={{ transform: [{ scale: pressAnim }] }}>
                    <View style={styles.confirmInner}>
                      {isImporting ? (
                        <ActivityIndicator size="small" color={theme.colors.accentCardText} />
                      ) : (
                        <Ionicons
                          name={confirmed ? "checkmark-circle-outline" : "checkmark-done-outline"}
                          size={18}
                          color={theme.colors.accentCardText}
                        />
                      )}
                      <Text style={styles.confirmText}>
                        {isImporting ? "Importing…" : confirmed ? "Uploaded" : "Confirm upload"}
                      </Text>
                    </View>
                  </Animated.View>
                </AppPressable>

                <ActionButton
                  theme={theme}
                  styles={styles}
                  variant="secondary"
                  icon="people-outline"
                  label="Go to students"
                  onPress={() => router.push("/teacher/students" as any)}
                />
              </View>

              {confirmed ? (
                <View style={styles.successRow}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.text} />
                  <Text style={styles.successText}>
                    Upload confirmed. Next: review impacted students and ensure results are correct.
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ height: spacing(4) }} />

            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Validation messages</Text>
                <Badge
                  theme={theme}
                  styles={styles}
                  tone={!hasData ? "neutral" : hasErrors ? "risk" : "good"}
                  icon={
                    !hasData
                      ? "information-circle-outline"
                      : hasErrors
                        ? "alert-circle-outline"
                        : "checkmark-circle-outline"
                  }
                  label={!hasData ? "Waiting for import" : hasErrors ? "Action needed" : "All good"}
                />
              </View>

              <View style={{ marginTop: spacing(3) }}>
                {!hasData ? (
                  <EmptyRow
                    theme={theme}
                    styles={styles}
                    icon="cloud-upload-outline"
                    text="No data imported yet. Use Select file or Paste CSV."
                  />
                ) : isImporting ? (
                  <EmptyRow
                    theme={theme}
                    styles={styles}
                    icon="time-outline"
                    text="Importing and validating… please wait."
                  />
                ) : !hasErrors ? (
                  <EmptyRow
                    theme={theme}
                    styles={styles}
                    icon="checkmark-circle-outline"
                    text="No validation errors found. You can confirm upload."
                  />
                ) : (
                  <View style={styles.issueList}>
                    {issues.slice(0, 7).map((i, idx) => (
                      <View key={`${i.rowId}-${i.field}-${idx}`} style={styles.issueRow}>
                        <View style={styles.issueIcon}>
                          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.text} />
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.issueTitle} numberOfLines={1}>
                            Row {i.rowId}: {String(i.field)}
                          </Text>
                          <Text style={styles.issueSub} numberOfLines={3}>
                            {i.message}
                          </Text>
                        </View>
                      </View>
                    ))}
                    {issues.length > 7 ? (
                      <Text style={styles.mutedSmall}>
                        Showing 7 of {issues.length}. Fix the source CSV and re-import.
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Preview</Text>
            <Text style={styles.mutedSmall}>
              {hasData ? `Showing ${Math.min(MAX_PREVIEW, imported.length)} of ${imported.length}` : "—"}
            </Text>
          </View>

          <View style={{ marginTop: spacing(3) }}>
            <View style={styles.tableCard}>
              {tableNeedsHorizontalScroll ? (
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View style={{ minWidth: 760 }}>
                    <TableHeader styles={styles} />
                    <View style={styles.tableDivider} />
                    <TableBody styles={styles} rows={previewRows} issues={issues} hasData={hasData} />
                  </View>
                </ScrollView>
              ) : (
                <View>
                  <TableHeader styles={styles} />
                  <View style={styles.tableDivider} />
                  <TableBody styles={styles} rows={previewRows} issues={issues} hasData={hasData} />
                </View>
              )}
            </View>

            {hasData && hasErrors ? (
              <View style={styles.helperRow}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.textMuted} />
                <Text style={styles.helperText}>
                  Rows highlighted are invalid. Fix your file and re-import to confirm upload.
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <Modal visible={pasteOpen} transparent animationType="fade" onRequestClose={() => setPasteOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPasteOpen(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%", alignItems: "center" }}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Paste CSV</Text>
                <AppPressable
                  onPress={() => setPasteOpen(false)}
                  hitSlop={10}
                  style={({ pressed, hovered, focused }) => [
                    styles.modalCloseBtn,
                    hovered && styles.hoverable,
                    focused && styles.focused,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={18} color={theme.colors.text} />
                </AppPressable>
              </View>

              <Text style={styles.modalSub}>
                Paste CSV text using the template header:
                {"\n"}
                <Text style={{ fontWeight: "900" }}>{TEMPLATE_HEADER}</Text>
              </Text>

              <View style={styles.textAreaWrap}>
                <TextInput
                  value={rawText}
                  onChangeText={setRawText}
                  placeholder={`Paste CSV here...\n${TEMPLATE_HEADER}\n${TEMPLATE_EXAMPLE_ROWS[0]}`}
                  placeholderTextColor={theme.colors.textSoft}
                  style={styles.textArea}
                  multiline
                  textAlignVertical="top"
                  autoCorrect={false}
                  autoCapitalize="none"
                  accessibilityLabel="CSV text input"
                />
              </View>

              <View style={styles.modalActionsRow}>
                <ActionButton
                  theme={theme}
                  styles={styles}
                  variant="primary"
                  icon="checkmark-circle-outline"
                  label="Import"
                  onPress={async () => {
                    setPasteOpen(false);
                    setFileName("pasted-results.csv");
                    await importFromText(rawText);
                  }}
                />

                <ActionButton
                  theme={theme}
                  styles={styles}
                  variant="secondary"
                  label="Cancel"
                  onPress={() => setPasteOpen(false)}
                />
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </TeacherLayout>
  );
}

/* ------------------------------ Table Pieces ------------------------------ */

function TableHeader({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.tableHeaderRow} accessibilityRole="header">
      <Text style={[styles.th, { flex: 2.2 }]} numberOfLines={1}>
        Name
      </Text>
      <Text style={[styles.th, { flex: 1.1 }]} numberOfLines={1}>
        Form
      </Text>
      <Text style={[styles.th, { flex: 1.0 }]} numberOfLines={1}>
        Class
      </Text>
      <Text style={[styles.th, { flex: 1.4 }]} numberOfLines={1}>
        Subject
      </Text>
      <Text style={[styles.th, { flex: 0.8, textAlign: "right" }]} numberOfLines={1}>
        Score
      </Text>
    </View>
  );
}

function TableBody({
  styles,
  rows,
  issues,
  hasData,
}: {
  styles: ReturnType<typeof createStyles>;
  rows: ImportedRow[];
  issues: RowIssue[];
  hasData: boolean;
}) {
  if (!hasData) {
    return (
      <View style={{ padding: spacing(3.5) }}>
        <Text style={styles.mutedSmall}>No rows to preview.</Text>
      </View>
    );
  }

  return (
    <>
      {rows.map((r, idx) => {
        const rowHasIssue = issues.some((i) => i.rowId === r.id);
        return (
          <View
            key={r.id}
            style={[
              styles.tr,
              idx !== rows.length - 1 ? styles.trBorder : null,
              rowHasIssue ? styles.trRisk : null,
            ]}
            accessibilityLabel={`Row ${r.id}${rowHasIssue ? " has issues" : ""}`}
          >
            <Text style={[styles.td, { flex: 2.2 }]} numberOfLines={1}>
              {r.name || "—"}
            </Text>
            <Text style={[styles.td, { flex: 1.1 }]} numberOfLines={1}>
              {r.form || "—"}
            </Text>
            <Text style={[styles.td, { flex: 1.0 }]} numberOfLines={1}>
              {r.stream || "—"}
            </Text>
            <Text style={[styles.td, { flex: 1.4 }]} numberOfLines={1}>
              {r.subject || "—"}
            </Text>
            <Text style={[styles.td, { flex: 0.8, textAlign: "right" }]} numberOfLines={1}>
              {r.score || "—"}
            </Text>
          </View>
        );
      })}
    </>
  );
}

/* ------------------------------- Components ------------------------------- */

function ActionButton({
  theme,
  styles,
  variant,
  icon,
  label,
  onPress,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  variant: "primary" | "secondary" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const containerStyle =
    variant === "primary"
      ? styles.actionPrimary
      : variant === "danger"
        ? styles.actionDanger
        : styles.actionSecondary;

  const textStyle =
    variant === "primary"
      ? styles.actionTextPrimary
      : variant === "danger"
        ? styles.actionTextDanger
        : styles.actionTextSecondary;

  const iconColor =
    variant === "primary"
      ? theme.colors.accentCardText
      : variant === "danger"
        ? theme.colors.dangerText
        : theme.colors.text;

  return (
    <AppPressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed, hovered, focused }) => [
        containerStyle,
        hovered && styles.hoverable,
        focused && styles.focused,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>
    </AppPressable>
  );
}

function Badge({
  theme,
  styles,
  icon,
  label,
  tone,
}: {
  theme: TeacherTheme;
  styles: ReturnType<typeof createStyles>;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: "neutral" | "good" | "risk";
}) {
  const toneStyle = tone === "risk" ? styles.badgeRisk : tone === "good" ? styles.badgeGood : styles.badgeNeutral;

  return (
    <View style={[styles.badge, toneStyle]} accessibilityLabel={label}>
      <Ionicons name={icon} size={16} color={theme.colors.text} />
      <Text style={styles.badgeText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function Bullet({
  styles,
  text,
}: {
  styles: ReturnType<typeof createStyles>;
  text: string;
}) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function InfoRow({
  styles,
  label,
  value,
  valueTone,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  value: string;
  valueTone?: "good" | "risk" | "neutral";
}) {
  const toneStyle = valueTone === "good" ? styles.valueGood : valueTone === "risk" ? styles.valueRisk : null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.infoValue, toneStyle]} numberOfLines={1}>
        {value}
      </Text>
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