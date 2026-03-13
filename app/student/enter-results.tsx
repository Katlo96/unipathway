import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Alert,
  useColorScheme,
  type PressableStateCallbackType,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  StudentMenuProvider,
  useStudentMenu,
} from '../../components/student/StudentMenu';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 34, lineHeight: 40, fontWeight: '900' as const },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  subtitle: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
};

const radii = {
  sm: spacing(2),
  md: spacing(3),
  lg: spacing(4),
  xl: spacing(5),
  xxl: spacing(6),
  pill: 9999,
};

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1380;
const desktopShellMaxWidth = 1320;

// ── Types / Logic ──────────────────────────────────────────────────────────────
type Level = 'BGCSE' | 'IGCSE';
type Track = 'PURE' | 'DOUBLE' | 'SINGLE' | 'ADVANCED' | 'ORDINARY';

const GRADES_STANDARD = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'U'] as const;
type StandardGrade = typeof GRADES_STANDARD[number];

const GRADES_DOUBLE = ['A*A*', 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'UU'] as const;
type DoubleGrade = typeof GRADES_DOUBLE[number];

type Grade = StandardGrade | DoubleGrade | '';

type ResultRow = {
  id: string;
  subject: string;
  grade: Grade;
};

type BestUnit = {
  key: string;
  subject: string;
  points: number;
  rowId: string;
};

type BestRowSummary = {
  subject: string;
  grade: string;
  points: number;
  countsAs: 1 | 2;
};

const DOUBLE_AWARD_SUBJECT = 'SCIENCE DOUBLE AWARD';

function normalizeSubjectName(subject: string) {
  return subject.trim().replace(/\s+/g, ' ').toUpperCase();
}

function isDoubleAward(subject: string): boolean {
  return normalizeSubjectName(subject) === DOUBLE_AWARD_SUBJECT;
}

const STANDARD_POINTS: Record<StandardGrade, number> = {
  'A*': 8,
  A: 8,
  B: 7,
  C: 6,
  D: 5,
  E: 4,
  F: 3,
  G: 2,
  H: 1,
  U: 0,
};

const DOUBLE_AWARD_POINTS: Record<DoubleGrade, number> = {
  'A*A*': 16,
  AA: 16,
  BB: 14,
  CC: 12,
  DD: 10,
  EE: 8,
  FF: 6,
  GG: 4,
  HH: 2,
  UU: 0,
};

const DEFAULTS = {
  BGCSE: {
    PURE: ['CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'EXTENDED MATH', 'ENGLISH', 'SETSWANA'],
    DOUBLE: [DOUBLE_AWARD_SUBJECT, 'ENGLISH', 'SETSWANA', 'MATH'],
    SINGLE: ['INTEGRATED SCIENCE', 'MATH', 'ENGLISH', 'SETSWANA'],
  },
  IGCSE: {
    ADVANCED: ['CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'EXTENDED MATH', 'ENGLISH', 'SETSWANA'],
    ORDINARY: ['INTEGRATED SCIENCE', 'MATH', 'ENGLISH', 'SETSWANA'],
  },
} as const;

function allowedTracksForLevel(level: Level): Track[] {
  return level === 'BGCSE' ? ['PURE', 'DOUBLE', 'SINGLE'] : ['ADVANCED', 'ORDINARY'];
}

function requiredSubjectSlots(level: Level, track: Track) {
  if (level === 'BGCSE') {
    if (track === 'PURE') return 9;
    if (track === 'DOUBLE') return 7;
    return 7;
  }
  if (track === 'ADVANCED') return 9;
  return 7;
}

function defaultsForSelection(level: Level, track: Track): readonly string[] {
  if (level === 'BGCSE') {
    if (track === 'PURE') return DEFAULTS.BGCSE.PURE;
    if (track === 'DOUBLE') return DEFAULTS.BGCSE.DOUBLE;
    return DEFAULTS.BGCSE.SINGLE;
  }
  if (track === 'ADVANCED') return DEFAULTS.IGCSE.ADVANCED;
  return DEFAULTS.IGCSE.ORDINARY;
}

function uid(prefix = 'row') {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

function buildRows(level: Level, track: Track): ResultRow[] {
  const required = requiredSubjectSlots(level, track);
  const defaults = [...defaultsForSelection(level, track)];

  const prefilled = defaults.map((subject) => ({
    id: uid('subject'),
    subject: toTitle(subject),
    grade: '' as Grade,
  }));

  const emptiesNeeded = Math.max(0, required - prefilled.length);
  const empties = Array.from({ length: emptiesNeeded }).map(() => ({
    id: uid('empty'),
    subject: '',
    grade: '' as Grade,
  }));

  return [...prefilled, ...empties];
}

function computePointsForRow(row: ResultRow): { points: number; countsAs: 1 | 2 } | null {
  const subject = row.subject.trim();
  const grade = row.grade;
  if (!subject || !grade) return null;

  if (isDoubleAward(subject)) {
    if (!GRADES_DOUBLE.includes(grade as DoubleGrade)) return null;
    return { points: DOUBLE_AWARD_POINTS[grade as DoubleGrade], countsAs: 2 };
  }

  if (!GRADES_STANDARD.includes(grade as StandardGrade)) return null;
  return { points: STANDARD_POINTS[grade as StandardGrade], countsAs: 1 };
}

function pickBestSix(rows: ResultRow[]) {
  const units: BestUnit[] = [];

  for (const row of rows) {
    const calc = computePointsForRow(row);
    if (!calc) continue;

    if (calc.countsAs === 2) {
      const perUnit = calc.points / 2;
      units.push({
        key: `${row.id}-1`,
        subject: normalizeSubjectName(row.subject),
        points: perUnit,
        rowId: row.id,
      });
      units.push({
        key: `${row.id}-2`,
        subject: normalizeSubjectName(row.subject),
        points: perUnit,
        rowId: row.id,
      });
    } else {
      units.push({
        key: `${row.id}-single`,
        subject: normalizeSubjectName(row.subject),
        points: calc.points,
        rowId: row.id,
      });
    }
  }

  units.sort((a, b) => b.points - a.points);

  const bestSixUnits = units.slice(0, 6);
  const totalPoints = Math.round(bestSixUnits.reduce((sum, unit) => sum + unit.points, 0));

  const rowMap = new Map<string, { row: ResultRow; totalPoints: number }>();

  for (const unit of bestSixUnits) {
    const row = rows.find((r) => r.id === unit.rowId);
    if (!row) continue;

    const existing = rowMap.get(unit.rowId);
    if (!existing) {
      rowMap.set(unit.rowId, { row, totalPoints: unit.points });
    } else {
      rowMap.set(unit.rowId, {
        row,
        totalPoints: existing.totalPoints + unit.points,
      });
    }
  }

  const bestRows: BestRowSummary[] = Array.from(rowMap.values()).map((entry) => ({
    subject: normalizeSubjectName(entry.row.subject),
    grade: String(entry.row.grade || ''),
    points: Math.round(entry.totalPoints),
    countsAs: isDoubleAward(entry.row.subject) ? 2 : 1,
  }));

  const ELIGIBILITY_THRESHOLD = 36;
  const eligible = totalPoints >= ELIGIBILITY_THRESHOLD;

  return {
    totalPoints,
    bestRows,
    eligible,
    threshold: ELIGIBILITY_THRESHOLD,
  };
}

function toTitle(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPressableState(state: PressableStateCallbackType) {
  const hovered = (state as any).hovered === true;
  return { pressed: state.pressed, hovered };
}

function getElevation(scheme: 'light' | 'dark'): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: scheme === 'light' ? 0.08 : 0.18,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: scheme === 'light' ? 4 : 2,
    },
    web: {
      boxShadow:
        scheme === 'light'
          ? '0 14px 40px rgba(10,17,26,0.08)'
          : '0 14px 40px rgba(0,0,0,0.30)',
    } as any,
    default: {},
  }) as ViewStyle;
}

export default function EnterResults() {
  return (
    <StudentMenuProvider>
      <EnterResultsContent />
    </StudentMenuProvider>
  );
}

function EnterResultsContent() {
  const { width, height } = useWindowDimensions();
  const { openMenu } = useStudentMenu();
  const rawScheme = useColorScheme();
  const scheme: 'light' | 'dark' = rawScheme === 'dark' ? 'dark' : 'light';
  const elevation = useMemo(() => getElevation(scheme), [scheme]);

  const colors = useMemo(
    () => ({
      background: scheme === 'light' ? '#F4FAFC' : '#081019',
      shell: scheme === 'light' ? 'rgba(255,255,255,0.82)' : 'rgba(15,23,33,0.92)',
      surface: scheme === 'light' ? '#FFFFFF' : '#121C26',
      surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#1B2732',
      surfaceSoft: scheme === 'light' ? '#F8FBFC' : '#16222D',
      textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
      textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
      textMuted: scheme === 'light' ? '#7A919E' : '#7890A0',
      primary: '#4A9FC6',
      primaryStrong: '#2C89B5',
      primaryText: '#FFFFFF',
      error: '#D32F2F',
      success: '#2F9E44',
      border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
      borderStrong: scheme === 'light' ? 'rgba(10,17,26,0.12)' : 'rgba(234,242,248,0.18)',
      headerButtonBg: scheme === 'light' ? '#FFFFFF' : '#182430',
      cardTint: scheme === 'light' ? 'rgba(74,159,198,0.08)' : 'rgba(74,159,198,0.14)',
      primaryTint: scheme === 'light' ? 'rgba(74,159,198,0.10)' : 'rgba(74,159,198,0.18)',
      successTint: scheme === 'light' ? 'rgba(47,158,68,0.10)' : 'rgba(47,158,68,0.18)',
      dangerTint: scheme === 'light' ? 'rgba(211,47,47,0.10)' : 'rgba(211,47,47,0.16)',
      modalOverlay: 'rgba(0,0,0,0.5)',
      white: '#FFFFFF',
    }),
    [scheme]
  );

  const uiMode = useMemo(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isTablet = uiMode === 'tablet';
  const isDesktop = uiMode === 'desktop';

  const pagePadding = isDesktop ? spacing(8) : isTablet ? spacing(6) : spacing(4);
  const contentGap = isDesktop ? spacing(6) : spacing(5);
  const shellRadius = isDesktop ? radii.xxl : 0;
  const shellHeight = isDesktop ? Math.min(980, Math.round(height * 0.92)) : undefined;
  const desktopAsideWidth = 350;
  const desktopMainMinWidth = 620;

  const [level, setLevel] = useState<Level>('BGCSE');
  const [track, setTrack] = useState<Track>('PURE');
  const [rows, setRows] = useState<ResultRow[]>(() => buildRows('BGCSE', 'PURE'));

  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [calculation, setCalculation] = useState<ReturnType<typeof pickBestSix> | null>(null);

  const activeRow = useMemo(() => rows.find((r) => r.id === activeRowId) || null, [rows, activeRowId]);
  const availableTracks = useMemo(() => allowedTracksForLevel(level), [level]);
  const requiredSlots = useMemo(() => requiredSubjectSlots(level, track), [level, track]);

  const completedRows = useMemo(
    () => rows.filter((row) => row.subject.trim().length > 0 && row.grade !== '').length,
    [rows]
  );

  const missingSubjects = useMemo(() => rows.filter((row) => row.subject.trim().length === 0).length, [rows]);
  const missingGrades = useMemo(() => rows.filter((row) => row.grade === '').length, [rows]);

  const allFilled = useMemo(() => {
    if (rows.length < requiredSlots) return false;
    return rows.every((row) => row.subject.trim().length > 0 && row.grade !== '');
  }, [rows, requiredSlots]);

  const doubleAwardRowsCount = useMemo(
    () => rows.filter((row) => isDoubleAward(row.subject)).length,
    [rows]
  );

  const resetRowsFor = useCallback((nextLevel: Level, nextTrack: Track) => {
    setRows(buildRows(nextLevel, nextTrack));
  }, []);

  const handleLevelChange = useCallback(
    (nextLevel: Level) => {
      const nextTrack = nextLevel === 'BGCSE' ? 'PURE' : 'ADVANCED';
      setLevel(nextLevel);
      setTrack(nextTrack);
      resetRowsFor(nextLevel, nextTrack);
    },
    [resetRowsFor]
  );

  const handleTrackChange = useCallback(
    (nextTrack: Track) => {
      setTrack(nextTrack);
      resetRowsFor(level, nextTrack);
    },
    [level, resetRowsFor]
  );

  const handleAddRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: uid('extra'),
        subject: '',
        grade: '',
      },
    ]);
  }, []);

  const handleRemoveRow = useCallback(
    (id: string) => {
      if (rows.length <= requiredSlots) return;
      setRows((prev) => prev.filter((r) => r.id !== id));
    },
    [rows.length, requiredSlots]
  );

  const handleSubjectChange = useCallback((rowId: string, text: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const nextIsDoubleAward = isDoubleAward(text);
        const prevIsDoubleAward = isDoubleAward(row.subject);

        if (nextIsDoubleAward !== prevIsDoubleAward) {
          return { ...row, subject: text, grade: '' };
        }

        return { ...row, subject: text };
      })
    );
  }, []);

  const handleGradeSelect = useCallback(
    (grade: Grade) => {
      if (!activeRowId) return;

      setRows((prev) => prev.map((r) => (r.id === activeRowId ? { ...r, grade } : r)));
      setShowGradePicker(false);
      setActiveRowId(null);
    },
    [activeRowId]
  );

  const handleClearAll = useCallback(() => {
    resetRowsFor(level, track);
  }, [level, track, resetRowsFor]);

  const handleCalculate = useCallback(() => {
    if (!allFilled) {
      Alert.alert(
        'Incomplete results',
        `Please complete all subject rows before calculating.\n\nMissing subjects: ${missingSubjects}\nMissing grades: ${missingGrades}`
      );
      return;
    }

    const result = pickBestSix(rows);
    setCalculation(result);
    setShowConfirm(true);
  }, [allFilled, missingSubjects, missingGrades, rows]);

  const confirmCalculation = useCallback(() => {
    setShowConfirm(false);
    setShowResults(true);
  }, []);

  const headerButtonBase = (pressed: boolean, hovered?: boolean) => [
    styles.headerButton,
    {
      backgroundColor: colors.headerButtonBg,
      borderColor: colors.border,
    },
    hovered && Platform.OS === 'web' ? styles.hoverLift : null,
    pressed ? styles.pressed : null,
  ];

  const StatCard = ({
    icon,
    label,
    value,
    tone = 'neutral',
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    tone?: 'neutral' | 'primary' | 'success';
  }) => {
    const bg =
      tone === 'primary' ? colors.primaryTint : tone === 'success' ? colors.successTint : colors.surfaceSoft;

    return (
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: bg,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.statIconWrap,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name={icon} size={16} color={colors.textPrimary} />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={[typography.label, { color: colors.textPrimary, marginTop: spacing(1) }]} numberOfLines={1}>
            {value}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.desktopCenter}>
        <View
          style={[
            styles.desktopShell,
            {
              width: isDesktop ? Math.min(desktopShellMaxWidth, width - spacing(8) * 2) : '100%',
              height: shellHeight,
              borderRadius: shellRadius,
              backgroundColor: isDesktop ? colors.shell : 'transparent',
              borderColor: isDesktop ? colors.border : 'transparent',
            },
            isDesktop ? [styles.desktopShellBorder, elevation] : null,
          ]}
        >
          <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView
                contentContainerStyle={{ padding: pagePadding, paddingBottom: spacing(10) }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={isDesktop}
              >
                <View
                  style={{
                    maxWidth: isDesktop ? maxContentWidth : '100%',
                    alignSelf: 'center',
                    width: '100%',
                  }}
                >
                  <View style={[styles.pageHeader, isMobile && styles.pageHeaderMobile]}>
                    <View style={styles.pageHeaderLeft}>
                      <Pressable
                        onPress={openMenu}
                        style={({ pressed }) => {
                          const { hovered } = getPressableState({ pressed } as PressableStateCallbackType);
                          return headerButtonBase(pressed, hovered);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Open menu"
                      >
                        <Ionicons name="menu-outline" size={22} color={colors.textPrimary} />
                        {!isMobile ? (
                          <Text style={[typography.label, { color: colors.textPrimary, marginLeft: spacing(2) }]}>
                            Menu
                          </Text>
                        ) : null}
                      </Pressable>

                      <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => {
                          const { hovered } = getPressableState({ pressed } as PressableStateCallbackType);
                          return headerButtonBase(pressed, hovered);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                      >
                        <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
                        {!isMobile ? (
                          <Text style={[typography.label, { color: colors.textPrimary, marginLeft: spacing(2) }]}>
                            Back
                          </Text>
                        ) : null}
                      </Pressable>
                    </View>
                  </View>

                  <View style={isDesktop ? styles.desktopHeroLayout : null}>
                    <View
                      style={[
                        styles.heroCard,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                        elevation,
                      ]}
                    >
                      <View style={[styles.heroContentRow, isMobile ? styles.heroContentRowMobile : null]}>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            style={[
                              typography.hero,
                              {
                                color: colors.textPrimary,
                                fontSize: isDesktop ? 34 : isTablet ? 30 : 26,
                                lineHeight: isDesktop ? 40 : isTablet ? 36 : 32,
                              },
                            ]}
                          >
                            Enter Your Results
                          </Text>

                          <Text
                            style={[
                              typography.subtitle,
                              {
                                color: colors.textSecondary,
                                marginTop: spacing(3),
                                maxWidth: isDesktop ? 640 : undefined,
                              },
                            ]}
                          >
                            Choose your qualification, complete every subject row, and calculate your best 6 points with
                            Science Double Award handled correctly.
                          </Text>
                        </View>

                        <View style={styles.heroBadgeWrap}>
                          <View
                            style={[
                              styles.heroBadge,
                              {
                                backgroundColor: allFilled ? colors.successTint : colors.primaryTint,
                                borderColor: allFilled ? colors.success : colors.borderStrong,
                              },
                            ]}
                          >
                            <Ionicons
                              name={allFilled ? 'checkmark-circle-outline' : 'calculator-outline'}
                              size={18}
                              color={allFilled ? colors.success : colors.textPrimary}
                            />
                            <Text
                              style={[
                                typography.caption,
                                {
                                  color: allFilled ? colors.success : colors.textPrimary,
                                  fontWeight: '700',
                                },
                              ]}
                            >
                              {allFilled ? 'Ready to calculate' : 'Complete all rows'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={[styles.heroStatsGrid, { marginTop: spacing(5) }]}>
                        <StatCard icon="school-outline" label="Level" value={level} tone="primary" />
                        <StatCard icon="git-branch-outline" label="Track" value={track} />
                        <StatCard icon="list-outline" label="Required slots" value={`${requiredSlots}`} />
                        <StatCard
                          icon="checkmark-done-outline"
                          label="Completed"
                          value={`${completedRows}/${rows.length}`}
                          tone={allFilled ? 'success' : 'neutral'}
                        />
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      isDesktop
                        ? {
                            flexDirection: 'row',
                            gap: contentGap,
                            alignItems: 'flex-start',
                            marginTop: contentGap,
                          }
                        : { marginTop: spacing(5) },
                    ]}
                  >
                    {isDesktop ? (
                      <View style={{ width: desktopAsideWidth }}>
                        <View
                          style={[
                            styles.sidePanel,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                            elevation,
                          ]}
                        >
                          <Text style={[styles.sidePanelTitle, { color: colors.textPrimary }]}>Calculation Summary</Text>
                          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(2) }]}>
                            Default rows are injected based on the selected level and track. Best 6 subjects are then
                            chosen automatically.
                          </Text>

                          <View style={{ marginTop: spacing(5), gap: spacing(3) }}>
                            <StatCard icon="albums-outline" label="Rows on screen" value={`${rows.length}`} />
                            <StatCard icon="close-circle-outline" label="Missing subjects" value={`${missingSubjects}`} />
                            <StatCard icon="warning-outline" label="Missing grades" value={`${missingGrades}`} />
                            <StatCard
                              icon="flask-outline"
                              label="Double award rows"
                              value={`${doubleAwardRowsCount}`}
                            />
                          </View>

                          <View
                            style={[
                              styles.sideTipCard,
                              {
                                backgroundColor: colors.surfaceSoft,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons name="information-circle-outline" size={18} color={colors.textPrimary} />
                            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                              If a subject is changed to Science Double Award, its grade resets and the double-award
                              grade scale is used.
                            </Text>
                          </View>

                          <View style={{ marginTop: spacing(4), gap: spacing(3) }}>
                            <Pressable
                              onPress={handleAddRow}
                              style={({ pressed }) => [
                                styles.sideActionButton,
                                {
                                  backgroundColor: colors.primaryTint,
                                  borderColor: colors.primary,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                              <Text style={[typography.body, { color: colors.primary, fontWeight: '700' }]}>
                                Add Subject
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={handleClearAll}
                              style={({ pressed }) => [
                                styles.sideActionButton,
                                {
                                  backgroundColor: colors.surfaceAlt,
                                  borderColor: colors.border,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
                              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '700' }]}>
                                Reset to Defaults
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    ) : null}

                    <View style={{ flex: 1, minWidth: desktopMainMinWidth }}>
                      <View
                        style={[
                          styles.formCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            width: isDesktop ? '100%' : '100%',
                            alignSelf: 'center',
                          },
                          elevation,
                        ]}
                      >
                        <View style={[styles.sectionTop, isMobile ? styles.sectionTopMobile : null]}>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Exam Setup</Text>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                              Select a qualification type and track. The correct default subjects and slot count will be
                              applied automatically.
                            </Text>
                          </View>

                          {!isDesktop ? (
                            <Pressable
                              onPress={handleClearAll}
                              style={({ pressed }) => [
                                styles.inlineResetButton,
                                {
                                  backgroundColor: colors.surfaceAlt,
                                  borderColor: colors.border,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
                              <Text
                                style={[
                                  typography.body,
                                  { color: colors.textPrimary, marginLeft: spacing(2), fontWeight: '700' },
                                ]}
                              >
                                Reset
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>

                        <View style={[styles.selectorRow, { gap: spacing(3), marginTop: spacing(5) }]}>
                          {(['BGCSE', 'IGCSE'] as const).map((l) => (
                            <Pressable
                              key={l}
                              onPress={() => handleLevelChange(l)}
                              style={({ pressed }) => [
                                styles.selectorPill,
                                {
                                  backgroundColor: level === l ? colors.primary : colors.cardTint,
                                  borderColor: level === l ? colors.primary : colors.border,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Text
                                style={[
                                  typography.body,
                                  { color: level === l ? colors.primaryText : colors.textPrimary, fontWeight: '700' },
                                ]}
                              >
                                {l}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        <View style={[styles.selectorRow, { gap: spacing(3), marginTop: spacing(4) }]}>
                          {availableTracks.map((t) => (
                            <Pressable
                              key={t}
                              onPress={() => handleTrackChange(t)}
                              style={({ pressed }) => [
                                styles.selectorPill,
                                {
                                  backgroundColor: track === t ? colors.primary : colors.cardTint,
                                  borderColor: track === t ? colors.primary : colors.border,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Text
                                style={[
                                  typography.body,
                                  { color: track === t ? colors.primaryText : colors.textPrimary, fontWeight: '700' },
                                ]}
                              >
                                {t}
                              </Text>
                            </Pressable>
                          ))}
                        </View>

                        <View
                          style={[
                            styles.infoBanner,
                            {
                              backgroundColor: colors.cardTint,
                              borderColor: colors.border,
                              marginTop: spacing(5),
                            },
                          ]}
                        >
                          <Ionicons name="information-circle-outline" size={18} color={colors.textPrimary} />
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.textSecondary, marginLeft: spacing(2), flex: 1 },
                            ]}
                          >
                            Required subject slots: {requiredSlots}. Best 6 subjects are used for points. Science
                            Double Award counts as 2 subjects.
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.infoBanner,
                            {
                              backgroundColor: allFilled ? colors.successTint : colors.surfaceSoft,
                              borderColor: colors.border,
                              marginTop: spacing(3),
                            },
                          ]}
                        >
                          <Ionicons
                            name={allFilled ? 'checkmark-circle-outline' : 'list-outline'}
                            size={18}
                            color={allFilled ? colors.success : colors.textPrimary}
                          />
                          <Text
                            style={[
                              typography.caption,
                              { color: colors.textSecondary, marginLeft: spacing(2), flex: 1 },
                            ]}
                          >
                            Completed rows: {completedRows}/{rows.length}. {allFilled ? 'Ready to calculate.' : 'Every visible row must have both subject and grade.'}
                          </Text>
                        </View>

                        <View style={{ marginTop: spacing(6) }}>
                          <View style={styles.tableHeaderRow}>
                            <Text style={[typography.caption, styles.headerLabel, { color: colors.textMuted, flex: 1 }]}>
                              Subject
                            </Text>
                            <Text
                              style={[
                                typography.caption,
                                styles.headerLabel,
                                { color: colors.textMuted, width: isMobile ? 108 : 132, textAlign: 'center' },
                              ]}
                            >
                              Grade
                            </Text>
                            {rows.length > requiredSlots ? <View style={{ width: 48 }} /> : null}
                          </View>

                          <View style={{ marginTop: spacing(3), gap: spacing(3) }}>
                            {rows.map((row, index) => (
                              <View
                                key={row.id}
                                style={[
                                  styles.resultRow,
                                  {
                                    backgroundColor: colors.surfaceSoft,
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <View
                                  style={[
                                    styles.rowIndexBadge,
                                    {
                                      backgroundColor: colors.cardTint,
                                      borderColor: colors.border,
                                    },
                                  ]}
                                >
                                  <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
                                    {index + 1}
                                  </Text>
                                </View>

                                <View style={{ flex: 1, minWidth: 0 }}>
                                  <View
                                    style={[
                                      styles.inputContainer,
                                      {
                                        borderColor: isDoubleAward(row.subject) ? colors.primary : colors.border,
                                        backgroundColor: colors.surfaceAlt,
                                      },
                                    ]}
                                  >
                                    <TextInput
                                      value={row.subject}
                                      onChangeText={(text) => handleSubjectChange(row.id, text)}
                                      placeholder={`Subject ${index + 1}`}
                                      placeholderTextColor={colors.textMuted}
                                      autoCapitalize="words"
                                      autoCorrect={false}
                                      style={[
                                        typography.body,
                                        {
                                          flex: 1,
                                          color: colors.textPrimary,
                                          fontWeight: '700',
                                        },
                                      ]}
                                    />
                                  </View>

                                  {isDoubleAward(row.subject) ? (
                                    <Text
                                      style={[
                                        typography.caption,
                                        {
                                          color: colors.primaryStrong,
                                          marginTop: spacing(2),
                                          fontWeight: '700',
                                        },
                                      ]}
                                    >
                                      Science Double Award detected — double-grade scale enabled.
                                    </Text>
                                  ) : null}
                                </View>

                                <Pressable
                                  onPress={() => {
                                    setActiveRowId(row.id);
                                    setShowGradePicker(true);
                                  }}
                                  style={({ pressed }) => [
                                    styles.gradeButton,
                                    {
                                      borderColor: isDoubleAward(row.subject) ? colors.primary : colors.border,
                                      backgroundColor: colors.surfaceAlt,
                                      width: isMobile ? 108 : 132,
                                    },
                                    pressed && styles.pressed,
                                  ]}
                                >
                                  <Text
                                    style={[
                                      typography.body,
                                      {
                                        color: row.grade ? colors.textPrimary : colors.textMuted,
                                        fontWeight: '700',
                                      },
                                    ]}
                                  >
                                    {row.grade || 'Grade'}
                                  </Text>
                                  <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                                </Pressable>

                                {rows.length > requiredSlots ? (
                                  <Pressable
                                    onPress={() => handleRemoveRow(row.id)}
                                    style={({ pressed }) => [
                                      styles.removeButton,
                                      {
                                        backgroundColor: colors.dangerTint,
                                      },
                                      pressed && styles.pressed,
                                    ]}
                                    accessibilityRole="button"
                                    accessibilityLabel="Remove subject row"
                                  >
                                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                                  </Pressable>
                                ) : null}
                              </View>
                            ))}
                          </View>
                        </View>

                        {!isDesktop ? (
                          <View style={styles.actionRow}>
                            <Pressable
                              onPress={handleAddRow}
                              style={({ pressed }) => [
                                styles.addButton,
                                {
                                  borderColor: colors.primary,
                                  backgroundColor: colors.cardTint,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                              <Text
                                style={[
                                  typography.body,
                                  { color: colors.primary, marginLeft: spacing(2), fontWeight: '700' },
                                ]}
                              >
                                Add Subject
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={handleClearAll}
                              style={({ pressed }) => [
                                styles.resetButton,
                                {
                                  borderColor: colors.border,
                                  backgroundColor: colors.surfaceAlt,
                                },
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons name="refresh-outline" size={20} color={colors.textPrimary} />
                              <Text
                                style={[
                                  typography.body,
                                  { color: colors.textPrimary, marginLeft: spacing(2), fontWeight: '700' },
                                ]}
                              >
                                Reset
                              </Text>
                            </Pressable>
                          </View>
                        ) : null}

                        <Pressable
                          onPress={handleCalculate}
                          disabled={!allFilled}
                          style={({ pressed }) => [
                            styles.calculateButton,
                            {
                              marginTop: spacing(6),
                              backgroundColor: colors.primary,
                            },
                            !allFilled && styles.disabled,
                            pressed && allFilled ? styles.pressed : null,
                          ]}
                        >
                          <Ionicons name="calculator-outline" size={18} color={colors.primaryText} />
                          <Text
                            style={[
                              typography.body,
                              {
                                color: allFilled ? colors.primaryText : colors.textMuted,
                                fontWeight: '700',
                                marginLeft: spacing(2),
                              },
                            ]}
                          >
                            Calculate Points
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>

      <Modal
        visible={showGradePicker}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowGradePicker(false);
          setActiveRowId(null);
        }}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          onPress={() => {
            setShowGradePicker(false);
            setActiveRowId(null);
          }}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              elevation,
            ]}
          >
            <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
              Select Grade
            </Text>

            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
              {activeRow && isDoubleAward(activeRow.subject)
                ? 'Science Double Award uses the double-award scale.'
                : 'Select the standard subject grade.'}
            </Text>

            {(activeRow && isDoubleAward(activeRow.subject) ? GRADES_DOUBLE : GRADES_STANDARD).map((g) => (
              <Pressable
                key={g}
                onPress={() => handleGradeSelect(g as Grade)}
                style={({ pressed }) => [
                  styles.gradeOption,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '700' }]}>{g}</Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => handleGradeSelect('')}
              style={({ pressed }) => [
                styles.gradeOption,
                styles.clearOption,
                {
                  backgroundColor: colors.surfaceSoft,
                  borderColor: colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[typography.body, { color: colors.textMuted, fontWeight: '700' }]}>Clear</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          onPress={() => setShowConfirm(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              elevation,
            ]}
          >
            <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(3) }]}>
              Confirm Calculation
            </Text>

            <Text style={[typography.body, { color: colors.textSecondary }]}>
              We will select your best 6 subjects automatically. Science Double Award counts as 2 subjects when
              included.
            </Text>

            <View style={styles.modalActionRow}>
              <Pressable
                onPress={() => setShowConfirm(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '700' }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={confirmCalculation}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[typography.body, { color: colors.primaryText, fontWeight: '700' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showResults} transparent animationType="fade" onRequestClose={() => setShowResults(false)}>
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}
          onPress={() => setShowResults(false)}
        >
          <View
            style={[
              styles.resultContent,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              elevation,
            ]}
          >
            <View style={styles.resultTopRow}>
              <Text style={[typography.title, { color: colors.textPrimary }]}>Your Results</Text>
              <Pressable
                onPress={() => setShowResults(false)}
                style={({ pressed }) => [
                  styles.closeButton,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close results"
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.pointsText, { color: colors.textPrimary }]}>
                  {calculation?.totalPoints ?? 0} points
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(1) }]}>
                  Based on your best 6 subjects
                </Text>
              </View>

              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: calculation?.eligible ? colors.successTint : colors.dangerTint,
                    borderColor: calculation?.eligible ? colors.success : colors.error,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: calculation?.eligible ? colors.success : colors.error,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {calculation?.eligible ? 'Eligible' : 'Not eligible'}
                </Text>
              </View>
            </View>

            <Text style={[typography.label, { color: colors.textPrimary, marginTop: spacing(5), marginBottom: spacing(3) }]}>
              Best 6 subjects used
            </Text>

            <View style={[styles.bestHeaderRow, { borderBottomColor: colors.border }]}>
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, fontWeight: '700' }]}>
                Subject
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, width: 70, textAlign: 'center', fontWeight: '700' },
                ]}
              >
                Grade
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, width: 60, textAlign: 'right', fontWeight: '700' },
                ]}
              >
                Pts
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {(calculation?.bestRows ?? []).map((row) => (
                <View key={`${row.subject}-${row.grade}`} style={[styles.bestRow, { borderBottomColor: colors.border }]}>
                  <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={2}>
                    {toTitle(row.subject)}
                    {row.countsAs === 2 ? ' (x2)' : ''}
                  </Text>
                  <Text
                    style={[
                      typography.body,
                      { color: colors.textPrimary, width: 70, textAlign: 'center', fontWeight: '700' },
                    ]}
                  >
                    {row.grade}
                  </Text>
                  <Text
                    style={[
                      typography.body,
                      { color: colors.textPrimary, width: 60, textAlign: 'right', fontWeight: '700' },
                    ]}
                  >
                    {row.points}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(4) }]}>
              Eligibility threshold used: {calculation?.threshold ?? 36} points.
            </Text>

            <View style={styles.modalActionColumn}>
              <Pressable
                onPress={() => {
                  setShowResults(false);
                  router.push('/student/courses');
                }}
                style={({ pressed }) => [
                  styles.fullWidthButton,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="school-outline" size={18} color={colors.primaryText} />
                <Text
                  style={[
                    typography.body,
                    { color: colors.primaryText, marginLeft: spacing(2), fontWeight: '700' },
                  ]}
                >
                  View Recommended Courses
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowResults(false)}
                style={({ pressed }) => [
                  styles.fullWidthButton,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '700' }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  desktopCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopShell: {
    overflow: 'hidden',
  },
  desktopShellBorder: {
    borderWidth: 1,
  },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  pageHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  pageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    flexWrap: 'wrap',
  },
  headerButton: {
    minHeight: 48,
    minWidth: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  desktopHeroLayout: {
    marginTop: spacing(2),
  },
  heroCard: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: spacing(6),
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing(4),
  },
  heroContentRowMobile: {
    flexDirection: 'column',
  },
  heroBadgeWrap: {
    alignItems: 'flex-end',
  },
  heroBadge: {
    minHeight: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  heroStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },

  statCard: {
    flexGrow: 1,
    minWidth: 180,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sidePanel: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: spacing(5),
  },
  sidePanelTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  sideTipCard: {
    marginTop: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing(4),
    flexDirection: 'row',
    gap: spacing(2),
    alignItems: 'flex-start',
  },
  sideActionButton: {
    minHeight: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
  },

  formCard: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    padding: spacing(5),
  },
  sectionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  sectionTopMobile: {
    flexDirection: 'column',
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  inlineResetButton: {
    minHeight: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectorRow: { flexDirection: 'row', flexWrap: 'wrap' },
  selectorPill: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(5),
    borderRadius: radii.pill,
    borderWidth: 1,
  },

  infoBanner: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    flexDirection: 'row',
    alignItems: 'center',
  },

  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingHorizontal: spacing(1),
  },
  headerLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  resultRow: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing(3),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(3),
  },
  rowIndexBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(1),
  },

  inputContainer: {
    minHeight: 52,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
    borderWidth: 1,
    borderRadius: radii.lg,
    justifyContent: 'center',
  },
  gradeButton: {
    minHeight: 52,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
    borderWidth: 1,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(1),
  },

  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
    marginTop: spacing(4),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4),
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4),
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  calculateButton: {
    minHeight: 52,
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  hoverLift: { transform: [{ translateY: -1 }] },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(5),
  },
  modalContent: {
    width: '90%',
    maxWidth: 420,
    padding: spacing(5),
    borderRadius: radii.xxl,
    borderWidth: 1,
  },
  resultContent: {
    width: '92%',
    maxWidth: 480,
    padding: spacing(5),
    borderRadius: radii.xxl,
    borderWidth: 1,
  },

  gradeOption: {
    padding: spacing(4),
    borderRadius: radii.lg,
    marginBottom: spacing(2),
    borderWidth: 1,
  },
  clearOption: {
    marginTop: spacing(3),
  },

  modalActionRow: {
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(5),
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(4),
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: radii.xxl,
    padding: spacing(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  pointsText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },

  bestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: spacing(2),
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(3),
    borderBottomWidth: 1,
  },

  modalActionColumn: {
    gap: spacing(3),
    marginTop: spacing(5),
  },
  fullWidthButton: {
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4),
  },
});