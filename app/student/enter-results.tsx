import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Alert,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StudentMenuProvider } from '../../components/student/StudentMenu';

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
type Level = 'BGCSE' | 'IGCSE';
type Track = 'PURE' | 'DOUBLE' | 'SINGLE' | 'ADVANCED' | 'ORDINARY';

const GRADES_STANDARD = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'U'] as const;
type StandardGrade = (typeof GRADES_STANDARD)[number];

const GRADES_DOUBLE = ['A*A*', 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'UU'] as const;
type DoubleGrade = (typeof GRADES_DOUBLE)[number];

type Grade = StandardGrade | DoubleGrade | '';

type ResultRow = { id: string; subject: string; grade: Grade };
type BestUnit  = { key: string; subject: string; points: number; rowId: string };
type BestRowSummary = { subject: string; grade: string; points: number; countsAs: 1 | 2 };

// ─────────────────────────────────────────────────────────────────────────────
// Calculation logic (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
const DOUBLE_AWARD_SUBJECT = 'SCIENCE DOUBLE AWARD';

function normalizeSubjectName(s: string) {
  return s.trim().replace(/\s+/g, ' ').toUpperCase();
}
function isDoubleAward(subject: string): boolean {
  return normalizeSubjectName(subject) === DOUBLE_AWARD_SUBJECT;
}

const STANDARD_POINTS: Record<StandardGrade, number> = {
  'A*': 8, A: 8, B: 7, C: 6, D: 5, E: 4, F: 3, G: 2, H: 1, U: 0,
};
const DOUBLE_AWARD_POINTS: Record<DoubleGrade, number> = {
  'A*A*': 16, AA: 16, BB: 14, CC: 12, DD: 10, EE: 8, FF: 6, GG: 4, HH: 2, UU: 0,
};

const DEFAULTS = {
  BGCSE: {
    PURE:   ['CHEMISTRY', 'PHYSICS', 'BIOLOGY', 'EXTENDED MATH', 'ENGLISH', 'SETSWANA'],
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
function requiredSubjectSlots(level: Level, track: Track): number {
  if (level === 'BGCSE') return track === 'PURE' ? 9 : 7;
  return track === 'ADVANCED' ? 9 : 7;
}
function defaultsForSelection(level: Level, track: Track): readonly string[] {
  if (level === 'BGCSE') {
    if (track === 'PURE')   return DEFAULTS.BGCSE.PURE;
    if (track === 'DOUBLE') return DEFAULTS.BGCSE.DOUBLE;
    return DEFAULTS.BGCSE.SINGLE;
  }
  return track === 'ADVANCED' ? DEFAULTS.IGCSE.ADVANCED : DEFAULTS.IGCSE.ORDINARY;
}
function uid(prefix = 'row') {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}
function toTitle(value: string) {
  return value.toLowerCase().split(' ').filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function buildRows(level: Level, track: Track): ResultRow[] {
  const required  = requiredSubjectSlots(level, track);
  const defaults  = [...defaultsForSelection(level, track)];
  const prefilled = defaults.map((s) => ({ id: uid('subject'), subject: toTitle(s), grade: '' as Grade }));
  const empties   = Array.from({ length: Math.max(0, required - prefilled.length) })
    .map(() => ({ id: uid('empty'), subject: '', grade: '' as Grade }));
  return [...prefilled, ...empties];
}
function computePointsForRow(row: ResultRow): { points: number; countsAs: 1 | 2 } | null {
  const subject = row.subject.trim();
  const grade   = row.grade;
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
      units.push({ key: `${row.id}-1`, subject: normalizeSubjectName(row.subject), points: perUnit, rowId: row.id });
      units.push({ key: `${row.id}-2`, subject: normalizeSubjectName(row.subject), points: perUnit, rowId: row.id });
    } else {
      units.push({ key: `${row.id}-single`, subject: normalizeSubjectName(row.subject), points: calc.points, rowId: row.id });
    }
  }
  units.sort((a, b) => b.points - a.points);
  const bestSixUnits = units.slice(0, 6);
  const totalPoints  = Math.round(bestSixUnits.reduce((sum, u) => sum + u.points, 0));
  const rowMap = new Map<string, { row: ResultRow; totalPoints: number }>();
  for (const unit of bestSixUnits) {
    const row = rows.find((r) => r.id === unit.rowId);
    if (!row) continue;
    const existing = rowMap.get(unit.rowId);
    rowMap.set(unit.rowId, existing
      ? { row, totalPoints: existing.totalPoints + unit.points }
      : { row, totalPoints: unit.points });
  }
  const bestRows: BestRowSummary[] = Array.from(rowMap.values()).map((e) => ({
    subject:   normalizeSubjectName(e.row.subject),
    grade:     String(e.row.grade || ''),
    points:    Math.round(e.totalPoints),
    countsAs:  isDoubleAward(e.row.subject) ? 2 : 1,
  }));
  return { totalPoints, bestRows, eligible: totalPoints >= 36, threshold: 36 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Elevation helper
// ─────────────────────────────────────────────────────────────────────────────
function useElevation(intensity: 'sm' | 'md' | 'lg' = 'md'): ViewStyle {
  return useMemo<ViewStyle>(() => {
    const opacity  = 0.28;
    const radius   = intensity === 'sm' ? 6 : intensity === 'md' ? 14 : 22;
    const offsetY  = intensity === 'sm' ? 2 : intensity === 'md' ? 5 : 10;
    return Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: offsetY }, shadowOpacity: opacity, shadowRadius: radius },
      android: { elevation: intensity === 'sm' ? 3 : intensity === 'md' ? 6 : 12 },
      web:     { boxShadow: `0 ${offsetY}px ${radius * 1.5}px rgba(0,0,0,${opacity})` } as any,
      default: {},
    }) ?? {};
  }, [intensity]);
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — mini stat pill used inside hero + sidebar
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone?: 'neutral' | 'primary' | 'success';
}) {
  const colors = useTheme();
  const bg =
    tone === 'primary' ? `${colors.primary}22`
    : tone === 'success' ? `${colors.success}22`
    : colors.surfaceAlt;

  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 160,
        backgroundColor: bg,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing(3),
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing(3),
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radii.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={16} color={colors.textPrimary} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[typography.caption, { color: colors.textMuted }]} numberOfLines={1}>{label}</Text>
        <Text style={[typography.label,   { color: colors.textPrimary, marginTop: 2 }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Grade Picker Modal
// ─────────────────────────────────────────────────────────────────────────────
function GradePickerModal({
  visible,
  activeRow,
  onSelect,
  onClose,
}: {
  visible: boolean;
  activeRow: ResultRow | null;
  onSelect: (g: Grade) => void;
  onClose: () => void;
}) {
  const colors    = useTheme();
  const elevation = useElevation('lg');
  const grades    = activeRow && isDoubleAward(activeRow.subject) ? GRADES_DOUBLE : GRADES_STANDARD;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: spacing(5) }}
        onPress={onClose}
      >
        <Pressable
          style={[{ width: '90%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, elevation]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ height: 3, backgroundColor: colors.primary }} />
          <View style={{ padding: spacing(5) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing(4) }}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>Select Grade</Text>
              <Pressable onPress={onClose} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: radii.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.7 : 1 })}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing(4) }]}>
              {activeRow && isDoubleAward(activeRow.subject)
                ? 'Science Double Award — double-grade scale.'
                : 'Standard subject grade scale.'}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) }}>
              {grades.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => onSelect(g as Grade)}
                  style={({ pressed }) => ({
                    paddingHorizontal: spacing(4),
                    paddingVertical: spacing(3),
                    borderRadius: radii.lg,
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                    transform: pressed ? [{ scale: 0.97 }] : [],
                  })}
                >
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>{g}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => onSelect('')}
              style={({ pressed }) => ({
                marginTop: spacing(4),
                padding: spacing(3),
                borderRadius: radii.lg,
                backgroundColor: colors.surfaceAlt,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center' as const,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={[typography.label, { color: colors.textMuted }]}>Clear Grade</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────
function ConfirmModal({
  visible,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const colors    = useTheme();
  const elevation = useElevation('lg');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: spacing(5) }} onPress={onClose}>
        <Pressable
          style={[{ width: '90%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, elevation]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ height: 3, backgroundColor: colors.primary }} />
          <View style={{ padding: spacing(6), gap: spacing(4) }}>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>Confirm Calculation</Text>
            <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>
              We will automatically select your best 6 subjects. Science Double Award counts as 2 subjects when included.
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing(3), marginTop: spacing(2) }}>
              <Pressable onPress={onClose} style={({ pressed }) => ({ flex: 1, height: 52, borderRadius: radii.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.85 : 1 })}>
                <Text style={[typography.label, { color: colors.textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onConfirm} style={({ pressed }) => ({ flex: 1, height: 52, borderRadius: radii.lg, backgroundColor: colors.primary, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.9 : 1 })}>
                <Text style={[typography.label, { color: '#fff' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Results Modal
// ─────────────────────────────────────────────────────────────────────────────
function ResultsModal({
  visible,
  calculation,
  onClose,
}: {
  visible: boolean;
  calculation: ReturnType<typeof pickBestSix> | null;
  onClose: () => void;
}) {
  const colors    = useTheme();
  const elevation = useElevation('lg');
  const eligible  = calculation?.eligible ?? false;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: spacing(5) }} onPress={onClose}>
        <Pressable
          style={[{ width: '92%', maxWidth: 480, backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, elevation]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ height: 3, backgroundColor: eligible ? colors.success : colors.danger }} />
          <View style={{ padding: spacing(6) }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing(5) }}>
              <Text style={[typography.h2, { color: colors.textPrimary }]}>Your Results</Text>
              <Pressable onPress={onClose} style={({ pressed }) => ({ width: 40, height: 40, borderRadius: radii.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.7 : 1 })}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Summary card */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: eligible ? `${colors.success}14` : `${colors.danger}14`, borderRadius: radii.xl, borderWidth: 1, borderColor: eligible ? `${colors.success}33` : `${colors.danger}33`, padding: spacing(4), marginBottom: spacing(5) }}>
              <View>
                <Text style={{ fontSize: 28, lineHeight: 34, fontWeight: '900', color: colors.textPrimary }}>
                  {calculation?.totalPoints ?? 0} pts
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>Best 6 subjects</Text>
              </View>
              <View style={{ paddingHorizontal: spacing(4), paddingVertical: spacing(2), borderRadius: radii.pill, backgroundColor: eligible ? `${colors.success}22` : `${colors.danger}22`, borderWidth: 1, borderColor: eligible ? colors.success : colors.danger }}>
                <Text style={[typography.label, { color: eligible ? colors.success : colors.danger }]}>
                  {eligible ? 'Eligible ✓' : 'Not Eligible'}
                </Text>
              </View>
            </View>

            {/* Table header */}
            <View style={{ flexDirection: 'row', paddingBottom: spacing(2), borderBottomWidth: 1, borderBottomColor: colors.divider, marginBottom: spacing(2) }}>
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, fontWeight: '700', letterSpacing: 0.4 }]}>SUBJECT</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, width: 60, textAlign: 'center', fontWeight: '700', letterSpacing: 0.4 }]}>GRADE</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, width: 48, textAlign: 'right', fontWeight: '700', letterSpacing: 0.4 }]}>PTS</Text>
            </View>

            <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
              {(calculation?.bestRows ?? []).map((row) => (
                <View key={`${row.subject}-${row.grade}`} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(3), borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                  <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]} numberOfLines={2}>
                    {toTitle(row.subject)}{row.countsAs === 2 ? ' (×2)' : ''}
                  </Text>
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary, width: 60, textAlign: 'center' }]}>{row.grade}</Text>
                  <Text style={[typography.bodyStrong, { color: colors.primary, width: 48, textAlign: 'right' }]}>{row.points}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing(4) }]}>
              Eligibility threshold: {calculation?.threshold ?? 36} points
            </Text>

            <View style={{ gap: spacing(3), marginTop: spacing(5) }}>
              <Pressable onPress={() => { onClose(); router.push('/student/courses'); }} style={({ pressed }) => ({ height: 52, borderRadius: radii.lg, backgroundColor: colors.primary, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: spacing(2), opacity: pressed ? 0.9 : 1 })}>
                <Ionicons name="school-outline" size={18} color="#fff" />
                <Text style={[typography.label, { color: '#fff' }]}>View Recommended Courses</Text>
              </Pressable>
              <Pressable onPress={onClose} style={({ pressed }) => ({ height: 52, borderRadius: radii.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.85 : 1 })}>
                <Text style={[typography.label, { color: colors.textPrimary }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar panel (desktop)
// ─────────────────────────────────────────────────────────────────────────────
function SidebarPanel({
  rows,
  missingSubjects,
  missingGrades,
  doubleAwardRowsCount,
  onAddRow,
  onReset,
}: {
  rows: ResultRow[];
  missingSubjects: number;
  missingGrades: number;
  doubleAwardRowsCount: number;
  onAddRow: () => void;
  onReset: () => void;
}) {
  const colors    = useTheme();
  const elevation = useElevation('md');

  return (
    <View style={{ width: 300, flexShrink: 0, gap: spacing(5) }}>
      <View style={[{ backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, elevation]}>
        <View style={{ height: 3, backgroundColor: colors.primary }} />
        <View style={{ padding: spacing(6), gap: spacing(4) }}>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Calculation Summary</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, lineHeight: 18 }]}>
            Best 6 subjects chosen automatically. Double Award counts as 2 slots.
          </Text>

          <View style={{ gap: spacing(3) }}>
            <StatCard icon="albums-outline"         label="Rows on screen"    value={`${rows.length}`} />
            <StatCard icon="close-circle-outline"   label="Missing subjects"  value={`${missingSubjects}`} />
            <StatCard icon="warning-outline"        label="Missing grades"    value={`${missingGrades}`} />
            <StatCard icon="flask-outline"          label="Double Award rows" value={`${doubleAwardRowsCount}`} />
          </View>

          {/* Tip */}
          <View style={{ padding: spacing(4), backgroundColor: `${colors.primary}14`, borderRadius: radii.lg, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing(2) }}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
                Changing a subject to Science Double Award resets its grade and uses the double-grade scale.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={{ gap: spacing(3) }}>
            <Pressable onPress={onAddRow} style={({ pressed }) => ({ flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing(3), padding: spacing(4), borderRadius: radii.lg, borderWidth: 1, borderColor: colors.primary, backgroundColor: `${colors.primary}1A`, opacity: pressed ? 0.85 : 1, transform: pressed ? [{ scale: 0.98 }] : [] })}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[typography.label, { color: colors.primary }]}>Add Subject</Text>
            </Pressable>
            <Pressable onPress={onReset} style={({ pressed }) => ({ flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing(3), padding: spacing(4), borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.85 : 1, transform: pressed ? [{ scale: 0.98 }] : [] })}>
              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
              <Text style={[typography.label, { color: colors.textPrimary }]}>Reset to Defaults</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main content
// ─────────────────────────────────────────────────────────────────────────────
function EnterResultsContent() {
  const { width } = useWindowDimensions();
  const colors    = useTheme();
  const elevation = useElevation('lg');

  const breakpoint = useMemo<Breakpoint>(() => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile  = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

  // ── Form state ─────────────────────────────────────────────────────────────
  const [level, setLevel] = useState<Level>('BGCSE');
  const [track, setTrack] = useState<Track>('PURE');
  const [rows,  setRows]  = useState<ResultRow[]>(() => buildRows('BGCSE', 'PURE'));

  const [activeRowId,   setActiveRowId]   = useState<string | null>(null);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [showResults,   setShowResults]   = useState(false);
  const [calculation,   setCalculation]   = useState<ReturnType<typeof pickBestSix> | null>(null);

  const activeRow        = useMemo(() => rows.find((r) => r.id === activeRowId) || null, [rows, activeRowId]);
  const availableTracks  = useMemo(() => allowedTracksForLevel(level), [level]);
  const requiredSlots    = useMemo(() => requiredSubjectSlots(level, track), [level, track]);
  const completedRows    = useMemo(() => rows.filter((r) => r.subject.trim() && r.grade !== '').length, [rows]);
  const missingSubjects  = useMemo(() => rows.filter((r) => !r.subject.trim()).length, [rows]);
  const missingGrades    = useMemo(() => rows.filter((r) => r.grade === '').length, [rows]);
  const allFilled        = useMemo(() => rows.length >= requiredSlots && rows.every((r) => r.subject.trim() && r.grade !== ''), [rows, requiredSlots]);
  const doubleAwardRowsCount = useMemo(() => rows.filter((r) => isDoubleAward(r.subject)).length, [rows]);

  const resetRowsFor = useCallback((l: Level, t: Track) => setRows(buildRows(l, t)), []);

  const handleLevelChange = useCallback((l: Level) => {
    const t = l === 'BGCSE' ? 'PURE' : 'ADVANCED';
    setLevel(l); setTrack(t); resetRowsFor(l, t);
  }, [resetRowsFor]);

  const handleTrackChange = useCallback((t: Track) => {
    setTrack(t); resetRowsFor(level, t);
  }, [level, resetRowsFor]);

  const handleAddRow = useCallback(() => {
    setRows((prev) => [...prev, { id: uid('extra'), subject: '', grade: '' }]);
  }, []);

  const handleRemoveRow = useCallback((id: string) => {
    setRows((prev) => prev.length > requiredSlots ? prev.filter((r) => r.id !== id) : prev);
  }, [requiredSlots]);

  const handleSubjectChange = useCallback((rowId: string, text: string) => {
    setRows((prev) => prev.map((row) => {
      if (row.id !== rowId) return row;
      const nextIsDouble = isDoubleAward(text);
      const prevIsDouble = isDoubleAward(row.subject);
      return nextIsDouble !== prevIsDouble ? { ...row, subject: text, grade: '' } : { ...row, subject: text };
    }));
  }, []);

  const handleGradeSelect = useCallback((grade: Grade) => {
    if (!activeRowId) return;
    setRows((prev) => prev.map((r) => r.id === activeRowId ? { ...r, grade } : r));
    setShowGradePicker(false);
    setActiveRowId(null);
  }, [activeRowId]);

  const handleClearAll = useCallback(() => resetRowsFor(level, track), [level, track, resetRowsFor]);

  const handleCalculate = useCallback(() => {
    if (!allFilled) {
      Alert.alert('Incomplete results', `Please complete all rows.\n\nMissing subjects: ${missingSubjects}\nMissing grades: ${missingGrades}`);
      return;
    }
    setCalculation(pickBestSix(rows));
    setShowConfirm(true);
  }, [allFilled, missingSubjects, missingGrades, rows]);

  const confirmCalculation = useCallback(() => {
    setShowConfirm(false);
    setShowResults(true);
  }, []);

  // ── Hero card ──────────────────────────────────────────────────────────────
  const HeroCard = (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing(7) }, elevation]}>
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      <View style={{ padding: isMobile ? spacing(5) : spacing(7) }}>
        <View style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: spacing(4) }}>
          <View style={{ flex: 1 }}>
            {/* Badge */}
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: spacing(2), paddingHorizontal: spacing(3), paddingVertical: spacing(2), borderRadius: radii.pill, backgroundColor: `${colors.primary}22`, borderWidth: 1, borderColor: `${colors.primary}44`, marginBottom: spacing(4) }}>
              <Ionicons name="calculator-outline" size={13} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>RESULTS CALCULATOR</Text>
            </View>
            <Text style={{ fontSize: isMobile ? 26 : 34, lineHeight: isMobile ? 32 : 40, fontWeight: '900', color: colors.textPrimary }}>
              Enter Your Results
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing(3), maxWidth: 560, lineHeight: 24 }]}>
              Choose your qualification, complete every subject row, and calculate your best 6 points. Science Double Award is handled automatically.
            </Text>
          </View>
          {/* Status badge */}
          <View style={{ alignSelf: isMobile ? 'flex-start' : 'center', flexDirection: 'row', alignItems: 'center', gap: spacing(2), paddingHorizontal: spacing(4), paddingVertical: spacing(2), borderRadius: radii.pill, backgroundColor: allFilled ? `${colors.success}22` : `${colors.primary}22`, borderWidth: 1, borderColor: allFilled ? `${colors.success}44` : `${colors.primary}44` }}>
            <Ionicons name={allFilled ? 'checkmark-circle-outline' : 'list-outline'} size={15} color={allFilled ? colors.success : colors.primary} />
            <Text style={[typography.label, { color: allFilled ? colors.success : colors.primary }]}>
              {allFilled ? 'Ready to calculate' : `${completedRows}/${rows.length} complete`}
            </Text>
          </View>
        </View>

        {/* Mini stats strip */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginTop: spacing(5) }}>
          <StatCard icon="school-outline"           label="Level"           value={level}               tone="primary"  />
          <StatCard icon="git-branch-outline"       label="Track"           value={track}                               />
          <StatCard icon="list-outline"             label="Required slots"  value={`${requiredSlots}`}                  />
          <StatCard icon="checkmark-done-outline"   label="Completed"       value={`${completedRows}/${rows.length}`}   tone={allFilled ? 'success' : 'neutral'} />
        </View>
      </View>
    </View>
  );

  // ── Selector pills (Level + Track) ─────────────────────────────────────────
  const SelectorSection = (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing(6) }, elevation]}>
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      <View style={{ padding: isMobile ? spacing(5) : spacing(6) }}>
        {/* Section header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing(3), marginBottom: spacing(5) }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.5, marginBottom: spacing(2) }]}>EXAM SETUP</Text>
            <Text style={[typography.h2, { color: colors.textPrimary }]}>Qualification & Track</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing(2), lineHeight: 18 }]}>
              Select a qualification type and track. Default subjects and slot count apply automatically.
            </Text>
          </View>
          {!isDesktop && (
            <Pressable onPress={handleClearAll} style={({ pressed }) => ({ flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing(2), paddingHorizontal: spacing(4), paddingVertical: spacing(2), borderRadius: radii.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}>
              <Ionicons name="refresh-outline" size={16} color={colors.textSecondary} />
              <Text style={[typography.label, { color: colors.textSecondary }]}>Reset</Text>
            </Pressable>
          )}
        </View>

        {/* Level pills */}
        <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.4, marginBottom: spacing(2) }]}>LEVEL</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginBottom: spacing(5) }}>
          {(['BGCSE', 'IGCSE'] as const).map((l) => (
            <Pressable key={l} onPress={() => handleLevelChange(l)} style={({ pressed }) => ({ paddingVertical: spacing(3), paddingHorizontal: spacing(5), borderRadius: radii.pill, borderWidth: 1, borderColor: level === l ? colors.primary : colors.border, backgroundColor: level === l ? colors.primary : colors.surfaceAlt, opacity: pressed ? 0.85 : 1 })}>
              <Text style={[typography.label, { color: level === l ? '#fff' : colors.textPrimary }]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        {/* Track pills */}
        <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.4, marginBottom: spacing(2) }]}>TRACK</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginBottom: spacing(5) }}>
          {availableTracks.map((t) => (
            <Pressable key={t} onPress={() => handleTrackChange(t)} style={({ pressed }) => ({ paddingVertical: spacing(3), paddingHorizontal: spacing(5), borderRadius: radii.pill, borderWidth: 1, borderColor: track === t ? colors.primary : colors.border, backgroundColor: track === t ? colors.primary : colors.surfaceAlt, opacity: pressed ? 0.85 : 1 })}>
              <Text style={[typography.label, { color: track === t ? '#fff' : colors.textPrimary }]}>{t}</Text>
            </Pressable>
          ))}
        </View>

        {/* Info banners */}
        <View style={{ gap: spacing(3) }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing(3), padding: spacing(3), backgroundColor: `${colors.primary}14`, borderRadius: radii.lg, borderLeftWidth: 3, borderLeftColor: colors.primary }}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
              Required slots: {requiredSlots}. Best 6 subjects used. Science Double Award counts as 2.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing(3), padding: spacing(3), backgroundColor: allFilled ? `${colors.success}14` : colors.surfaceAlt, borderRadius: radii.lg, borderLeftWidth: 3, borderLeftColor: allFilled ? colors.success : colors.border }}>
            <Ionicons name={allFilled ? 'checkmark-circle-outline' : 'list-outline'} size={16} color={allFilled ? colors.success : colors.textSecondary} style={{ marginTop: 1 }} />
            <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, lineHeight: 18 }]}>
              Completed: {completedRows}/{rows.length}. {allFilled ? 'All rows complete — ready to calculate.' : 'Every row needs a subject and grade.'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ── Subject rows table ─────────────────────────────────────────────────────
  const SubjectTable = (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing(6) }, elevation]}>
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      <View style={{ padding: isMobile ? spacing(5) : spacing(6) }}>
        <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.5, marginBottom: spacing(3) }]}>SUBJECTS & GRADES</Text>
        <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing(5) }]}>Enter Your Subjects</Text>

        {/* Column headers */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingHorizontal: spacing(1), marginBottom: spacing(3) }}>
          <View style={{ width: 34 }} />
          <Text style={[typography.caption, { color: colors.textMuted, flex: 1, letterSpacing: 0.5 }]}>SUBJECT</Text>
          <Text style={[typography.caption, { color: colors.textMuted, width: isMobile ? 108 : 132, textAlign: 'center', letterSpacing: 0.5 }]}>GRADE</Text>
          {rows.length > requiredSlots && <View style={{ width: 42 }} />}
        </View>

        {/* Rows */}
        <View style={{ gap: spacing(3) }}>
          {rows.map((row, index) => (
            <View key={row.id} style={{ backgroundColor: colors.surfaceAlt, borderRadius: radii.xl, borderWidth: 1, borderColor: isDoubleAward(row.subject) ? `${colors.primary}44` : colors.border, padding: spacing(3), flexDirection: 'row', alignItems: 'flex-start', gap: spacing(3) }}>
              {/* Index */}
              <View style={{ width: 34, height: 34, borderRadius: radii.pill, backgroundColor: `${colors.primary}22`, borderWidth: 1, borderColor: `${colors.primary}44`, alignItems: 'center', justifyContent: 'center', marginTop: spacing(2) }}>
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>{index + 1}</Text>
              </View>

              {/* Subject input */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ minHeight: 52, paddingHorizontal: spacing(3), paddingVertical: spacing(3), borderWidth: 1, borderRadius: radii.lg, borderColor: isDoubleAward(row.subject) ? colors.primary : colors.border, backgroundColor: colors.surface, justifyContent: 'center' }}>
                  <TextInput
                    value={row.subject}
                    onChangeText={(text) => handleSubjectChange(row.id, text)}
                    placeholder={`Subject ${index + 1}`}
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    style={[typography.bodyStrong, { color: colors.textPrimary }]}
                  />
                </View>
                {isDoubleAward(row.subject) && (
                  <Text style={[typography.caption, { color: colors.primary, marginTop: spacing(2), fontWeight: '700' }]}>
                    Double Award detected — double-grade scale enabled.
                  </Text>
                )}
              </View>

              {/* Grade button */}
              <Pressable
                onPress={() => { setActiveRowId(row.id); setShowGradePicker(true); }}
                style={({ pressed }) => ({ width: isMobile ? 108 : 132, minHeight: 52, paddingHorizontal: spacing(3), borderWidth: 1, borderRadius: radii.lg, borderColor: isDoubleAward(row.subject) ? colors.primary : colors.border, backgroundColor: colors.surface, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, opacity: pressed ? 0.85 : 1 })}
              >
                <Text style={[typography.bodyStrong, { color: row.grade ? colors.textPrimary : colors.textMuted }]}>
                  {row.grade || 'Grade'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
              </Pressable>

              {/* Remove */}
              {rows.length > requiredSlots && (
                <Pressable onPress={() => handleRemoveRow(row.id)} style={({ pressed }) => ({ width: 42, height: 42, borderRadius: radii.lg, backgroundColor: `${colors.danger}1A`, alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: spacing(1), opacity: pressed ? 0.8 : 1 })} accessibilityRole="button" accessibilityLabel="Remove row">
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* Mobile/tablet actions */}
        {!isDesktop && (
          <View style={{ flexDirection: 'row', gap: spacing(3), marginTop: spacing(5) }}>
            <Pressable onPress={handleAddRow} style={({ pressed }) => ({ flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: spacing(2), padding: spacing(4), borderRadius: radii.lg, borderWidth: 1, borderColor: colors.primary, backgroundColor: `${colors.primary}1A`, opacity: pressed ? 0.85 : 1 })}>
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[typography.label, { color: colors.primary }]}>Add Subject</Text>
            </Pressable>
            <Pressable onPress={handleClearAll} style={({ pressed }) => ({ flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: spacing(2), padding: spacing(4), borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, opacity: pressed ? 0.85 : 1 })}>
              <Ionicons name="refresh-outline" size={18} color={colors.textPrimary} />
              <Text style={[typography.label, { color: colors.textPrimary }]}>Reset</Text>
            </Pressable>
          </View>
        )}

        {/* Calculate button */}
        <Pressable
          onPress={handleCalculate}
          disabled={!allFilled}
          style={({ pressed }) => ({ marginTop: spacing(6), height: 56, borderRadius: radii.xl, backgroundColor: allFilled ? colors.primary : colors.surfaceAlt, borderWidth: 1, borderColor: allFilled ? colors.primary : colors.border, flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: spacing(2), opacity: allFilled ? (pressed ? 0.88 : 1) : 0.5 })}
        >
          <Ionicons name="calculator-outline" size={20} color={allFilled ? '#fff' : colors.textMuted} />
          <Text style={[typography.label, { color: allFilled ? '#fff' : colors.textMuted, letterSpacing: 0.4 }]}>
            CALCULATE POINTS
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <DashboardLayout
        title="Enter Results"
        subtitle="Calculate your best 6 subject points"
        showPointsCard={false}
      >
        {/* Back + breadcrumb */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginBottom: spacing(6) }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back" style={({ pressed }) => ({ flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing(2), paddingHorizontal: spacing(4), paddingVertical: spacing(2), borderRadius: radii.lg, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.8 : 1 })}>
            <Ionicons name="arrow-back" size={17} color={colors.primary} />
            <Text style={[typography.label, { color: colors.primary }]}>Back</Text>
          </Pressable>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Dashboard › Enter Results</Text>
        </View>

        {/* Desktop: two-column; mobile/tablet: stacked */}
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: spacing(8), alignItems: 'flex-start' }}>
          {/* Main column */}
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {HeroCard}
            {SelectorSection}
            {SubjectTable}
          </KeyboardAvoidingView>

          {/* Sidebar — desktop only */}
          {isDesktop && (
            <SidebarPanel
              rows={rows}
              missingSubjects={missingSubjects}
              missingGrades={missingGrades}
              doubleAwardRowsCount={doubleAwardRowsCount}
              onAddRow={handleAddRow}
              onReset={handleClearAll}
            />
          )}
        </View>
      </DashboardLayout>

      {/* Modals — outside layout scroll */}
      <GradePickerModal
        visible={showGradePicker}
        activeRow={activeRow}
        onSelect={handleGradeSelect}
        onClose={() => { setShowGradePicker(false); setActiveRowId(null); }}
      />
      <ConfirmModal
        visible={showConfirm}
        onConfirm={confirmCalculation}
        onClose={() => setShowConfirm(false)}
      />
      <ResultsModal
        visible={showResults}
        calculation={calculation}
        onClose={() => setShowResults(false)}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function EnterResults() {
  return (
    <StudentMenuProvider>
      <EnterResultsContent />
    </StudentMenuProvider>
  );
}