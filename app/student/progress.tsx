import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  useWindowDimensions,
  Platform,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardLayout, {
  spacing,
  typography,
  radii,
  useTheme,
} from '../../components/student/DashboardLayout';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type System = 'BGCSE' | 'IGCSE';
type BGCSETrack = 'Pure' | 'Double' | 'Single';
type IGCSETrack = 'Advanced' | 'Ordinary';
type Track = BGCSETrack | IGCSETrack;
type BGCSEForm = 'Form 4' | 'Form 5';
type IGCSEForm = 'Form 4' | 'Form 5' | 'Form 6 (A-Level)';
type Form = BGCSEForm | IGCSEForm;
type ExamType = 'End of Month Test' | 'End of Term Exam' | 'End of Year Exam';

type MarkRecord = {
  id: string;
  subject: string;
  score: number; // 0–100
  examType: ExamType;
  date: string; // ISO string
};

type StudentProfile = {
  system: System;
  track: Track;
  form: Form;
  subjects: string[]; // exactly 9
};

type WizardStep = 'system' | 'track' | 'form' | 'subjects' | 'done';

type MaterialType = 'Notes' | 'Past Paper';

type RevisionMaterial = {
  id: string;
  subject: string;
  type: MaterialType;
  title: string;
  fileUrl: string;
  system: System;
  track?: Track; // optional: some materials are track-specific
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const BGCSE_DEFAULTS: Record<BGCSETrack, string[]> = {
  Pure: ['Mathematics Extended', 'English', 'Setswana', 'Chemistry', 'Physics', 'Biology'],
  Double: ['Chemistry', 'Biology', 'Physics', 'Mathematics Extended', 'English', 'Setswana'],
  Single: ['Chemistry', 'Biology', 'Physics', 'Mathematics', 'English', 'Setswana'],
};

const IGCSE_DEFAULTS: Record<IGCSETrack, string[]> = {
  Advanced: ['Chemistry', 'Physics', 'Biology', 'Mathematics Extended', 'English', 'Setswana'],
  Ordinary: ['Chemistry', 'Physics', 'Biology', 'Mathematics', 'English', 'Setswana'],
};

const TOTAL_SUBJECTS = 9;
const EXAM_TYPES: ExamType[] = ['End of Month Test', 'End of Term Exam', 'End of Year Exam'];

const EXAM_TYPE_ICONS: Record<ExamType, keyof typeof Ionicons.glyphMap> = {
  'End of Month Test': 'calendar-outline',
  'End of Term Exam': 'school-outline',
  'End of Year Exam': 'trophy-outline',
};

const BGCSE_FORMS: BGCSEForm[] = ['Form 4', 'Form 5'];
const IGCSE_FORMS: IGCSEForm[] = ['Form 4', 'Form 5', 'Form 6 (A-Level)'];

const REVISION_MATERIALS: RevisionMaterial[] = [
  {
    id: '1',
    subject: 'Mathematics Extended',
    type: 'Notes',
    title: 'Algebra & Functions Notes',
    fileUrl: '#',
    system: 'BGCSE',
    track: 'Pure',
  },
  {
    id: '2',
    subject: 'Mathematics Extended',
    type: 'Past Paper',
    title: '2022 BGCSE Paper 2',
    fileUrl: '#',
    system: 'BGCSE',
  },
  {
    id: '3',
    subject: 'Biology',
    type: 'Notes',
    title: 'Cell Biology Summary',
    fileUrl: '#',
    system: 'IGCSE',
    track: 'Advanced',
  },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Elevation helper
// ─────────────────────────────────────────────────────────────────────────────
function useElevation(intensity: 'sm' | 'md' | 'lg' = 'md'): ViewStyle {
  return useMemo<ViewStyle>(() => {
    const opacity = 0.28;
    const radius = intensity === 'sm' ? 6 : intensity === 'md' ? 14 : 22;
    const offsetY = intensity === 'sm' ? 2 : intensity === 'md' ? 5 : 10;

    return (
      (Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: offsetY },
          shadowOpacity: opacity,
          shadowRadius: radius,
        },
        android: { elevation: intensity === 'sm' ? 3 : intensity === 'md' ? 6 : 12 },
        web: { boxShadow: `0 ${offsetY}px ${radius * 1.5}px rgba(0,0,0,${opacity})` } as any,
        default: {},
      }) ?? {}) as ViewStyle
    );
  }, [intensity]);
}

// ─────────────────────────────────────────────────────────────────────────────
// PerformanceBar
// ─────────────────────────────────────────────────────────────────────────────
function PerformanceBar({ score }: { score: number }) {
  const colors = useTheme();
  const color = score >= 70 ? colors.success : score >= 50 ? colors.warning : colors.danger;

  return (
    <View
      style={{
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.border,
        overflow: 'hidden',
        marginTop: spacing(1),
      }}
    >
      <View
        style={{
          height: 6,
          width: `${score}%` as any,
          backgroundColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WizardCard
// ─────────────────────────────────────────────────────────────────────────────
function WizardCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useTheme();
  const elevation = useElevation('lg');

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.xxl,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        elevation,
        style,
      ]}
    >
      <View style={{ height: 3, backgroundColor: colors.primary }} />
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SelectionPill
// ─────────────────────────────────────────────────────────────────────────────
function SelectionPill({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: spacing(2),
        paddingHorizontal: spacing(4),
        paddingVertical: spacing(3),
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : colors.surfaceAlt,
        opacity: pressed ? 0.85 : 1,
        transform: pressed ? [{ scale: 0.97 }] : [],
      })}
    >
      {icon && <Ionicons name={icon} size={16} color={selected ? '#fff' : colors.textSecondary} />}
      <Text style={[typography.label, { color: selected ? '#fff' : colors.textPrimary }]}>
        {label}
      </Text>
      {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SetupWizard
// ─────────────────────────────────────────────────────────────────────────────
function SetupWizard({ onComplete }: { onComplete: (profile: StudentProfile) => void }) {
  const colors = useTheme();
  const elevation = useElevation('md');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [step, setStep] = useState<WizardStep>('system');
  const [system, setSystem] = useState<System | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [extraInputs, setExtraInputs] = useState<string[]>(['', '', '']);

  const defaults = useMemo<string[]>(() => {
    if (!system || !track) return [];
    if (system === 'BGCSE') return BGCSE_DEFAULTS[track as BGCSETrack] ?? [];
    return IGCSE_DEFAULTS[track as IGCSETrack] ?? [];
  }, [system, track]);

  const extraCount = TOTAL_SUBJECTS - defaults.length;

  const stepIndex: Record<WizardStep, number> = { system: 0, track: 1, form: 2, subjects: 3, done: 4 };
  const totalSteps = 4;

  const goNext = useCallback(() => {
    if (step === 'system' && system) setStep('track');
    else if (step === 'track' && track) setStep('form');
    else if (step === 'form' && form) setStep('subjects');
    else if (step === 'subjects') {
      const filled = extraInputs.filter((s) => s.trim()).map((s) => s.trim());
      if (filled.length < extraCount) return;

      const all = [...defaults, ...filled];
      setSubjects(all);
      onComplete({ system: system!, track: track!, form: form!, subjects: all });
    }
  }, [step, system, track, form, defaults, extraInputs, extraCount, onComplete]);

  const goBack = useCallback(() => {
    if (step === 'track') setStep('system');
    if (step === 'form') setStep('track');
    if (step === 'subjects') setStep('form');
  }, [step]);

  const canNext =
    (step === 'system' && !!system) ||
    (step === 'track' && !!track) ||
    (step === 'form' && !!form) ||
    (step === 'subjects' && extraInputs.filter((s) => s.trim()).length >= extraCount);

  const progressPct = ((stepIndex[step] as number) / totalSteps) * 100;

  return (
    <WizardCard>
      <View style={{ padding: isMobile ? spacing(5) : spacing(7) }}>
        {/* Progress bar */}
        <View style={{ marginBottom: spacing(6) }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing(2),
            }}
          >
            <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.5 }]}>
              STEP {stepIndex[step] + 1} OF {totalSteps}
            </Text>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              {Math.round(progressPct)}%
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: colors.border,
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 6,
                width: `${progressPct}%` as any,
                backgroundColor: colors.primary,
                borderRadius: 3,
              }}
            />
          </View>
        </View>

        {/* Step: System */}
        {step === 'system' && (
          <View style={{ gap: spacing(5) }}>
            <View>
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Welcome 👋</Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing(2), lineHeight: 24 },
                ]}
              >
                Let's set up your academic profile. First, which examination system are you enrolled in?
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) }}>
              <SelectionPill
                label="BGCSE"
                selected={system === 'BGCSE'}
                onPress={() => setSystem('BGCSE')}
                icon="school-outline"
              />
              <SelectionPill
                label="IGCSE"
                selected={system === 'IGCSE'}
                onPress={() => setSystem('IGCSE')}
                icon="globe-outline"
              />
            </View>
            {system && (
              <View
                style={{
                  padding: spacing(4),
                  backgroundColor: `${colors.primary}14`,
                  borderRadius: radii.lg,
                  borderLeftWidth: 3,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: colors.textSecondary, lineHeight: 18 },
                  ]}
                >
                  {system === 'BGCSE'
                    ? '🇧🇼 Botswana General Certificate of Secondary Education — national qualification.'
                    : '🌍 International General Certificate of Secondary Education — internationally recognised.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step: Track */}
        {step === 'track' && system && (
          <View style={{ gap: spacing(5) }}>
            <View>
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Your Track</Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing(2), lineHeight: 24 },
                ]}
              >
                Select your {system} science track. This determines your default subjects.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) }}>
              {(system === 'BGCSE'
                ? (['Pure', 'Double', 'Single'] as BGCSETrack[])
                : (['Advanced', 'Ordinary'] as IGCSETrack[])
              ).map((t) => (
                <SelectionPill
                  key={t}
                  label={t}
                  selected={track === t}
                  onPress={() => setTrack(t)}
                  icon={
                    t === 'Pure' || t === 'Advanced'
                      ? 'flask-outline'
                      : t === 'Double'
                      ? 'layers-outline'
                      : 'leaf-outline'
                  }
                />
              ))}
            </View>
            {track && (
              <View style={{ gap: spacing(2) }}>
                <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.5 }]}>
                  DEFAULT SUBJECTS ({defaults.length})
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) }}>
                  {defaults.map((s) => (
                    <View
                      key={s}
                      style={{
                        paddingHorizontal: spacing(3),
                        paddingVertical: spacing(2),
                        borderRadius: radii.pill,
                        backgroundColor: `${colors.primary}1A`,
                        borderWidth: 1,
                        borderColor: `${colors.primary}33`,
                      }}
                    >
                      <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  You'll add {extraCount} more subject{extraCount !== 1 ? 's' : ''} to complete your 9.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Step: Form */}
        {step === 'form' && system && (
          <View style={{ gap: spacing(5) }}>
            <View>
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Your Year Group</Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing(2), lineHeight: 24 },
                ]}
              >
                Which form are you currently in? This helps contextualise your results.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) }}>
              {(system === 'BGCSE' ? BGCSE_FORMS : IGCSE_FORMS).map((f) => (
                <SelectionPill
                  key={f}
                  label={f}
                  selected={form === f}
                  onPress={() => setForm(f)}
                  icon="person-outline"
                />
              ))}
            </View>
          </View>
        )}

        {/* Step: Subjects */}
        {step === 'subjects' && track && (
          <View style={{ gap: spacing(5) }}>
            <View>
              <Text style={[typography.h1, { color: colors.textPrimary }]}>Your Subjects</Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing(2), lineHeight: 24 },
                ]}
              >
                Your default subjects are pre-filled. Add {extraCount} more to complete your 9 subjects.
              </Text>
            </View>

            {/* Pre-filled subjects */}
            <View style={{ gap: spacing(2) }}>
              <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.5 }]}>
                DEFAULT SUBJECTS
              </Text>
              {defaults.map((s, i) => (
                <View
                  key={s}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing(3),
                    padding: spacing(3),
                    backgroundColor: `${colors.primary}0F`,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: `${colors.primary}22`,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: `${colors.primary}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                      {i + 1}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                  <Text style={[typography.bodyStrong, { color: colors.textPrimary, flex: 1 }]}>
                    {s}
                  </Text>
                </View>
              ))}
            </View>

            {/* Extra subject inputs */}
            <View style={{ gap: spacing(2) }}>
              <Text style={[typography.caption, { color: colors.textMuted, letterSpacing: 0.5 }]}>
                ADD {extraCount} MORE SUBJECT{extraCount !== 1 ? 'S' : ''}
              </Text>
              {extraInputs.slice(0, extraCount).map((val, i) => {
                const isFilled = val.trim().length > 0;
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
                    {/* Number bubble */}
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: isFilled ? `${colors.success}22` : colors.surfaceAlt,
                        borderWidth: 1,
                        borderColor: isFilled ? `${colors.success}44` : colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={[
                          typography.caption,
                          {
                            color: isFilled ? colors.success : colors.textMuted,
                            fontWeight: '700',
                          },
                        ]}
                      >
                        {defaults.length + i + 1}
                      </Text>
                    </View>

                    {/* Input field */}
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surfaceAlt,
                        borderRadius: radii.lg,
                        borderWidth: 1,
                        borderColor: isFilled ? `${colors.success}44` : colors.border,
                        paddingHorizontal: spacing(3),
                        minHeight: 48,
                      }}
                    >
                      <TextInput
                        value={val}
                        onChangeText={(text) => {
                          const copy = [...extraInputs];
                          copy[i] = text;
                          setExtraInputs(copy);
                        }}
                        placeholder={`Subject ${defaults.length + i + 1}`}
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="words"
                        autoCorrect={false}
                        style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                      />
                      {isFilled && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Progress indicator */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing(2),
                padding: spacing(3),
                backgroundColor: colors.surfaceAlt,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name={canNext ? 'checkmark-circle' : 'alert-circle-outline'}
                size={18}
                color={canNext ? colors.success : colors.warning}
              />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {extraInputs.filter((s) => s.trim()).length}/{extraCount} additional subjects entered
                {canNext ? ' — ready to save!' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing(3), marginTop: spacing(7) }}>
          {step !== 'system' && (
            <Pressable
              onPress={goBack}
              style={({ pressed }) => ({
                flex: 1,
                height: 52,
                borderRadius: radii.lg,
                backgroundColor: colors.surfaceAlt,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center' as const,
                justifyContent: 'center' as const,
                flexDirection: 'row' as const,
                gap: spacing(2),
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Ionicons name="arrow-back" size={17} color={colors.textPrimary} />
              <Text style={[typography.label, { color: colors.textPrimary }]}>Back</Text>
            </Pressable>
          )}

          <Pressable
            onPress={canNext ? goNext : undefined}
            style={({ pressed }) => ({
              flex: step === 'system' ? 1 : 2,
              height: 52,
              borderRadius: radii.lg,
              backgroundColor: canNext ? colors.primary : colors.surfaceAlt,
              borderWidth: 1,
              borderColor: canNext ? colors.primary : colors.border,
              alignItems: 'center' as const,
              justifyContent: 'center' as const,
              flexDirection: 'row' as const,
              gap: spacing(2),
              opacity: canNext ? (pressed ? 0.88 : 1) : 0.45,
            })}
          >
            <Text style={[typography.label, { color: canNext ? '#fff' : colors.textMuted }]}>
              {step === 'subjects' ? 'Save Profile & Continue' : 'Continue'}
            </Text>
            <Ionicons
              name={step === 'subjects' ? 'checkmark-circle' : 'arrow-forward'}
              size={17}
              color={canNext ? '#fff' : colors.textMuted}
            />
          </Pressable>
        </View>
      </View>
    </WizardCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AddRecordModal
// ─────────────────────────────────────────────────────────────────────────────
function AddRecordModal({
  visible,
  subjects,
  onSave,
  onClose,
}: {
  visible: boolean;
  subjects: string[];
  onSave: (record: MarkRecord) => void;
  onClose: () => void;
}) {
  const colors = useTheme();
  const elevation = useElevation('lg');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [subject, setSubject] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const scores = Array.from({ length: 101 }, (_, i) => i);

  const canSave = subject && score !== null && examType && date;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ id: uid(), subject, score: score!, examType: examType!, date });
    setSubject('');
    setScore(null);
    setExamType(null);
    setDate(new Date().toISOString().slice(0, 10));
    onClose();
  };

  const scoreColor = (s: number) =>
    s >= 70 ? colors.success : s >= 50 ? colors.warning : colors.danger;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing(5),
        }}
        onPress={onClose}
      >
        <Pressable
          style={[
            {
              width: '100%',
              maxWidth: 520,
              backgroundColor: colors.surface,
              borderRadius: radii.xxl,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
              maxHeight: '92%',
            },
            elevation,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ height: 3, backgroundColor: colors.primary }} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ padding: isMobile ? spacing(5) : spacing(6), gap: spacing(5) }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={[typography.h2, { color: colors.textPrimary }]}>Add Record</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    Log a test or exam result
                  </Text>
                </View>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => ({
                    width: 40,
                    height: 40,
                    borderRadius: radii.lg,
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center' as const,
                    justifyContent: 'center' as const,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Subject Picker */}
              <View style={{ gap: spacing(2) }}>
                <Text style={[typography.label, { color: colors.textPrimary }]}>Subject</Text>
                <Pressable
                  onPress={() => setShowSubjectPicker(!showSubjectPicker)}
                  style={({ pressed }) => ({
                    flexDirection: 'row' as const,
                    alignItems: 'center' as const,
                    justifyContent: 'space-between' as const,
                    minHeight: 52,
                    paddingHorizontal: spacing(4),
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: subject ? `${colors.primary}44` : colors.border,
                    backgroundColor: colors.surfaceAlt,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={[typography.body, { color: subject ? colors.textPrimary : colors.textMuted }]}>
                    {subject || 'Select a subject...'}
                  </Text>
                  <Ionicons
                    name={showSubjectPicker ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>

                {showSubjectPicker && (
                  <View
                    style={{
                      borderRadius: radii.lg,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceAlt,
                      overflow: 'hidden',
                    }}
                  >
                    {subjects.map((s, i) => (
                      <Pressable
                        key={s}
                        onPress={() => {
                          setSubject(s);
                          setShowSubjectPicker(false);
                        }}
                        style={({ pressed }) => ({
                          flexDirection: 'row' as const,
                          alignItems: 'center' as const,
                          gap: spacing(3),
                          padding: spacing(3),
                          backgroundColor:
                            subject === s ? `${colors.primary}14` : pressed ? `${colors.primary}08` : 'transparent',
                          borderTopWidth: i > 0 ? 1 : 0,
                          borderTopColor: colors.divider,
                        })}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: subject === s ? colors.primary : colors.border,
                          }}
                        />
                        <Text
                          style={[
                            typography.body,
                            { color: subject === s ? colors.primary : colors.textPrimary, flex: 1 },
                          ]}
                        >
                          {s}
                        </Text>
                        {subject === s && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* Score Picker */}
              <View style={{ gap: spacing(2) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[typography.label, { color: colors.textPrimary }]}>Score (%)</Text>
                  {score !== null && (
                    <View
                      style={{
                        paddingHorizontal: spacing(3),
                        paddingVertical: spacing(1),
                        borderRadius: radii.pill,
                        backgroundColor: `${scoreColor(score)}1A`,
                        borderWidth: 1,
                        borderColor: `${scoreColor(score)}44`,
                      }}
                    >
                      <Text style={[typography.label, { color: scoreColor(score) }]}>{score}%</Text>
                    </View>
                  )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing(1) }}>
                  <View style={{ flexDirection: 'row', gap: spacing(2), paddingHorizontal: spacing(1), paddingBottom: spacing(2) }}>
                    {scores.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setScore(s)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: radii.md,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: score === s ? scoreColor(s) : colors.border,
                          backgroundColor: score === s ? `${scoreColor(s)}22` : colors.surfaceAlt,
                        }}
                      >
                        <Text
                          style={[
                            typography.caption,
                            {
                              color: score === s ? scoreColor(s) : colors.textSecondary,
                              fontWeight: score === s ? '700' : '500',
                            },
                          ]}
                        >
                          {s}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Exam Type */}
              <View style={{ gap: spacing(2) }}>
                <Text style={[typography.label, { color: colors.textPrimary }]}>Exam Type</Text>
                <View style={{ gap: spacing(2) }}>
                  {EXAM_TYPES.map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setExamType(t)}
                      style={({ pressed }) => ({
                        flexDirection: 'row' as const,
                        alignItems: 'center' as const,
                        gap: spacing(3),
                        padding: spacing(4),
                        borderRadius: radii.lg,
                        borderWidth: 1,
                        borderColor: examType === t ? colors.primary : colors.border,
                        backgroundColor: examType === t ? `${colors.primary}14` : colors.surfaceAlt,
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: radii.md,
                          backgroundColor: examType === t ? `${colors.primary}22` : colors.surface,
                          borderWidth: 1,
                          borderColor: examType === t ? `${colors.primary}33` : colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={EXAM_TYPE_ICONS[t]}
                          size={18}
                          color={examType === t ? colors.primary : colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          typography.bodyStrong,
                          { color: examType === t ? colors.primary : colors.textPrimary, flex: 1 },
                        ]}
                      >
                        {t}
                      </Text>
                      {examType === t && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View style={{ gap: spacing(2) }}>
                <Text style={[typography.label, { color: colors.textPrimary }]}>Date</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing(3),
                    minHeight: 52,
                    paddingHorizontal: spacing(4),
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceAlt,
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                  />
                </View>
              </View>

              {/* Save Button */}
              <Pressable
                onPress={canSave ? handleSave : undefined}
                style={({ pressed }) => ({
                  height: 56,
                  borderRadius: radii.xl,
                  backgroundColor: canSave ? colors.primary : colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: canSave ? colors.primary : colors.border,
                  flexDirection: 'row' as const,
                  alignItems: 'center' as const,
                  justifyContent: 'center' as const,
                  gap: spacing(2),
                  opacity: canSave ? (pressed ? 0.88 : 1) : 0.5,
                })}
              >
                <Ionicons name="save-outline" size={19} color={canSave ? '#fff' : colors.textMuted} />
                <Text
                  style={[typography.label, { color: canSave ? '#fff' : colors.textMuted, letterSpacing: 0.4 }]}
                >
                  SAVE RECORD
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PerformanceTable + RevisionMaterials (nested)
// ─────────────────────────────────────────────────────────────────────────────
function PerformanceTable({
  profile,
  marks,
  onAddRecord,
  onReset,
}: {
  profile: StudentProfile;
  marks: MarkRecord[];
  onAddRecord: () => void;
  onReset: () => void;
}) {
  const colors = useTheme();
  const elevation = useElevation('md');
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 1024;

  type Filter = 'all' | 'well' | 'poor';

  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<'subject' | 'avg' | 'latest'>('subject');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Nested RevisionMaterials Component
  function RevisionMaterials({ profile }: { profile: StudentProfile }) {
    const colors = useTheme();
    const elevation = useElevation('md');
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

    const filteredMaterials = useMemo(() => {
      if (!selectedSubject) return [];
      return REVISION_MATERIALS.filter((m) => {
        const systemMatch = m.system === profile.system;
        const subjectMatch = m.subject === selectedSubject;
        const trackMatch = !m.track || m.track === profile.track;
        return systemMatch && subjectMatch && trackMatch;
      });
    }, [selectedSubject, profile]);

    return (
      <View style={{ marginTop: spacing(8), gap: spacing(5) }}>
        <View>
          <Text style={[typography.h2, { color: colors.textPrimary }]}>Revision & Support</Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, marginTop: spacing(1) },
            ]}
          >
            Access curated notes and past exam papers tailored to your subjects and curriculum.
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: spacing(2) }}>
            {profile.subjects.map((subject) => {
              const isActive = selectedSubject === subject;
              return (
                <Pressable
                  key={subject}
                  onPress={() => setSelectedSubject(subject)}
                  style={{
                    paddingHorizontal: spacing(4),
                    paddingVertical: spacing(2),
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary : colors.surfaceAlt,
                  }}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isActive ? '#fff' : colors.textSecondary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {subject}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: radii.xxl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing(5),
            },
            elevation,
          ]}
        >
          {!selectedSubject ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              Select a subject to view available materials.
            </Text>
          ) : filteredMaterials.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>
              No materials available yet for this subject.
            </Text>
          ) : (
            <View style={{ gap: spacing(3) }}>
              {filteredMaterials.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    // TODO: handle download / open
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing(3),
                    padding: spacing(4),
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceAlt,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radii.md,
                      backgroundColor:
                        item.type === 'Notes' ? `${colors.primary}22` : `${colors.success}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={item.type === 'Notes' ? 'document-text-outline' : 'download-outline'}
                      size={18}
                      color={item.type === 'Notes' ? colors.primary : colors.success}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyStrong, { color: colors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>{item.type}</Text>
                  </View>
                  <Ionicons name="arrow-down-circle-outline" size={20} color={colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Subject Statistics
  const subjectStats = useMemo(() => {
    const map = new Map<string, { scores: number[]; latest: number | null; latestDate: string | null; examType: string | null }>();
    profile.subjects.forEach((s) =>
      map.set(s, { scores: [], latest: null, latestDate: null, examType: null })
    );

    const sorted = [...marks].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((m) => {
      const entry = map.get(m.subject);
      if (!entry) return;
      entry.scores.push(m.score);
      entry.latest = m.score;
      entry.latestDate = m.date;
      entry.examType = m.examType;
    });

    return Array.from(map.entries()).map(([subject, data]) => {
      const avg = data.scores.length
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : null;

      const prev = data.scores.length >= 2 ? data.scores[data.scores.length - 2] : null;

      const trend: 'up' | 'down' | 'flat' | 'none' =
        data.latest === null
          ? 'none'
          : prev === null
          ? 'flat'
          : data.latest > prev
          ? 'up'
          : data.latest < prev
          ? 'down'
          : 'flat';

      return {
        subject,
        avg,
        latest: data.latest,
        latestDate: data.latestDate,
        examType: data.examType,
        scores: data.scores,
        trend,
        count: data.scores.length,
      };
    });
  }, [profile.subjects, marks]);

  const filtered = useMemo(() => {
    let rows = [...subjectStats];

    if (filter === 'well') rows = rows.filter((r) => r.avg !== null && r.avg >= 60);
    if (filter === 'poor') rows = rows.filter((r) => r.avg !== null && r.avg < 60);

    if (sortBy === 'avg') rows.sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
    if (sortBy === 'latest') rows.sort((a, b) => (b.latest ?? -1) - (a.latest ?? -1));
    if (sortBy === 'subject') rows.sort((a, b) => a.subject.localeCompare(b.subject));

    return rows;
  }, [subjectStats, filter, sortBy]);

  const overallAvg = useMemo(() => {
    const avgs = subjectStats.filter((s) => s.avg !== null).map((s) => s.avg!);
    return avgs.length ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) : null;
  }, [subjectStats]);

  const wellCount = subjectStats.filter((s) => s.avg !== null && s.avg >= 60).length;
  const poorCount = subjectStats.filter((s) => s.avg !== null && s.avg < 60).length;

  const scoreColor = (s: number | null) =>
    s === null ? colors.textMuted : s >= 70 ? colors.success : s >= 50 ? colors.warning : colors.danger;

  const trendIcon = (trend: string): keyof typeof Ionicons.glyphMap =>
    trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : trend === 'flat' ? 'remove' : 'remove';

  const trendColor = (trend: string) =>
    trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.textMuted;

  return (
    <View style={{ gap: spacing(6) }}>
      {/* Profile Banner */}
      <View style={[{ backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, elevation]}>
        <View style={{ height: 3, backgroundColor: colors.primary }} />
        <View style={{ padding: isMobile ? spacing(5) : spacing(6) }}>
          <View
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: spacing(4),
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginBottom: spacing(3) }}>
                <View
                  style={{
                    paddingHorizontal: spacing(3),
                    paddingVertical: spacing(1),
                    borderRadius: radii.pill,
                    backgroundColor: `${colors.primary}22`,
                    borderWidth: 1,
                    borderColor: `${colors.primary}44`,
                  }}
                >
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                    {profile.system}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: spacing(3),
                    paddingVertical: spacing(1),
                    borderRadius: radii.pill,
                    backgroundColor: `${colors.success}1A`,
                    borderWidth: 1,
                    borderColor: `${colors.success}33`,
                  }}
                >
                  <Text style={[typography.caption, { color: colors.success, fontWeight: '700' }]}>
                    {profile.track}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: spacing(3),
                    paddingVertical: spacing(1),
                    borderRadius: radii.pill,
                    backgroundColor: colors.surfaceAlt,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700' }]}>
                    {profile.form}
                  </Text>
                </View>
              </View>

              <Text style={[typography.h1, { color: colors.textPrimary }]}>Progress Dashboard</Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.textSecondary, marginTop: spacing(1) },
                ]}
              >
                Tracking {profile.subjects.length} subjects · {marks.length} record
                {marks.length !== 1 ? 's' : ''} logged
              </Text>
            </View>

            {overallAvg !== null && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: `${scoreColor(overallAvg)}14`,
                  borderWidth: 2,
                  borderColor: `${scoreColor(overallAvg)}44`,
                }}
              >
                <Text style={{ fontSize: 28, fontWeight: '900', color: scoreColor(overallAvg), lineHeight: 32 }}>
                  {overallAvg}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>avg %</Text>
              </View>
            )}
          </View>

          {/* Mini Stats */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginTop: spacing(5) }}>
            {[
              { icon: 'bar-chart-outline' as const, label: 'Records', value: `${marks.length}`, color: colors.primary },
              { icon: 'trending-up' as const, label: 'Performing Well', value: `${wellCount}`, color: colors.success },
              { icon: 'trending-down' as const, label: 'Need Attention', value: `${poorCount}`, color: colors.danger },
              { icon: 'book-outline' as const, label: 'Subjects', value: `${profile.subjects.length}`, color: colors.warning },
            ].map(({ icon, label, value, color }) => (
              <View
                key={label}
                style={{
                  flex: 1,
                  minWidth: 110,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing(2),
                  padding: spacing(3),
                  backgroundColor: `${color}0F`,
                  borderRadius: radii.lg,
                  borderWidth: 1,
                  borderColor: `${color}22`,
                }}
              >
                <Ionicons name={icon} size={18} color={color} />
                <View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{label}</Text>
                  <Text style={[typography.bodyStrong, { color }]}>{value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: spacing(4),
        }}
      >
        {/* Filters */}
        <View style={{ flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap' }}>
          {(['all', 'well', 'poor'] as Filter[]).map((f) => {
            const labels = { all: 'All Subjects', well: '✅ Performing Well', poor: '⚠️ Need Attention' };
            const isActive = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => ({
                  paddingHorizontal: spacing(4),
                  paddingVertical: spacing(2),
                  borderRadius: radii.pill,
                  borderWidth: 1,
                  borderColor: isActive ? colors.primary : colors.border,
                  backgroundColor: isActive ? colors.primary : colors.surfaceAlt,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: isActive ? '#fff' : colors.textSecondary, fontWeight: '700' },
                  ]}
                >
                  {labels[f]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: spacing(3) }}>
          <Pressable
            onPress={onAddRecord}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(2),
              paddingHorizontal: spacing(5),
              paddingVertical: spacing(3),
              borderRadius: radii.lg,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={[typography.label, { color: '#fff' }]}>Add Record</Text>
          </Pressable>

          <Pressable
            onPress={onReset}
            style={({ pressed }) => ({
              paddingHorizontal: spacing(4),
              paddingVertical: spacing(3),
              borderRadius: radii.lg,
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="refresh-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Sort Options */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>Sort by:</Text>
        {(['subject', 'avg', 'latest'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSortBy(s)}
            style={{
              paddingHorizontal: spacing(3),
              paddingVertical: spacing(1),
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: sortBy === s ? colors.primary : colors.border,
              backgroundColor: sortBy === s ? `${colors.primary}14` : 'transparent',
            }}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: sortBy === s ? colors.primary : colors.textSecondary,
                  fontWeight: '700',
                },
              ]}
            >
              {s === 'subject' ? 'Name' : s === 'avg' ? 'Average' : 'Latest'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Performance Table */}
      <View style={[{ backgroundColor: colors.surface, borderRadius: radii.xxl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, elevation]}>
        <View style={{ height: 3, backgroundColor: colors.primary }} />

        {/* Table Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing(5),
            paddingVertical: spacing(3),
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <Text style={[typography.caption, { color: colors.textMuted, flex: 1, letterSpacing: 0.5 }]}>SUBJECT</Text>
          {!isMobile && (
            <Text
              style={[
                typography.caption,
                { color: colors.textMuted, width: 80, textAlign: 'center', letterSpacing: 0.5 },
              ]}
            >
              RECORDS
            </Text>
          )}
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, width: 80, textAlign: 'center', letterSpacing: 0.5 },
            ]}
          >
            AVG %
          </Text>
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, width: 80, textAlign: 'center', letterSpacing: 0.5 },
            ]}
          >
            LATEST
          </Text>
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, width: 60, textAlign: 'center', letterSpacing: 0.5 },
            ]}
          >
            TREND
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={{ padding: spacing(10), alignItems: 'center', gap: spacing(3) }}>
            <Ionicons name="bar-chart-outline" size={40} color={colors.border} />
            <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
              No subjects match this filter.
            </Text>
          </View>
        ) : (
          filtered.map((row, i) => (
            <Pressable
              key={row.subject}
              onPress={() => setExpandedSubject(expandedSubject === row.subject ? null : row.subject)}
              style={({ pressed }) => ({ backgroundColor: pressed ? `${colors.primary}08` : 'transparent' })}
            >
              {/* Main Row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing(5),
                  paddingVertical: spacing(4),
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: colors.divider,
                }}
              >
                <View style={{ flex: 1, gap: spacing(1) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(2) }}>
                    <Text style={[typography.bodyStrong, { color: colors.textPrimary }]} numberOfLines={1}>
                      {row.subject}
                    </Text>
                    {row.count === 0 && (
                      <View
                        style={{
                          paddingHorizontal: spacing(2),
                          paddingVertical: 2,
                          borderRadius: radii.pill,
                          backgroundColor: colors.surfaceAlt,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
                          No records
                        </Text>
                      </View>
                    )}
                  </View>
                  {row.avg !== null && <PerformanceBar score={row.avg} />}
                  {row.latestDate && (
                    <Text style={[typography.caption, { color: colors.textMuted, fontSize: 11 }]}>
                      Last: {row.latestDate} · {row.examType}
                    </Text>
                  )}
                </View>

                {!isMobile && (
                  <View style={{ width: 80, alignItems: 'center' }}>
                    <Text style={[typography.bodyStrong, { color: colors.textSecondary }]}>{row.count}</Text>
                  </View>
                )}

                <View style={{ width: 80, alignItems: 'center' }}>
                  {row.avg !== null ? (
                    <View
                      style={{
                        paddingHorizontal: spacing(2),
                        paddingVertical: spacing(1),
                        borderRadius: radii.pill,
                        backgroundColor: `${scoreColor(row.avg)}14`,
                        borderWidth: 1,
                        borderColor: `${scoreColor(row.avg)}33`,
                      }}
                    >
                      <Text style={[typography.label, { color: scoreColor(row.avg) }]}>{row.avg}%</Text>
                    </View>
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted }]}>—</Text>
                  )}
                </View>

                <View style={{ width: 80, alignItems: 'center' }}>
                  {row.latest !== null ? (
                    <Text style={[typography.bodyStrong, { color: scoreColor(row.latest) }]}>
                      {row.latest}%
                    </Text>
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted }]}>—</Text>
                  )}
                </View>

                <View style={{ width: 60, alignItems: 'center' }}>
                  {row.trend !== 'none' ? (
                    <Ionicons name={trendIcon(row.trend)} size={22} color={trendColor(row.trend)} />
                  ) : (
                    <Text style={[typography.caption, { color: colors.textMuted }]}>—</Text>
                  )}
                </View>
              </View>

              {/* Expanded Score History */}
              {expandedSubject === row.subject && row.scores.length > 0 && (
                <View
                  style={{
                    paddingHorizontal: spacing(5),
                    paddingBottom: spacing(4),
                    borderTopWidth: 1,
                    borderTopColor: colors.divider,
                    backgroundColor: `${colors.primary}05`,
                  }}
                >
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textMuted, letterSpacing: 0.4, marginTop: spacing(3), marginBottom: spacing(2) },
                    ]}
                  >
                    ALL RECORDS FOR {row.subject.toUpperCase()}
                  </Text>
                  <View style={{ gap: spacing(2) }}>
                    {marks
                      .filter((m) => m.subject === row.subject)
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((m) => (
                        <View
                          key={m.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: spacing(3),
                            padding: spacing(3),
                            backgroundColor: colors.surfaceAlt,
                            borderRadius: radii.lg,
                            borderWidth: 1,
                            borderColor: colors.border,
                          }}
                        >
                          <Ionicons name={EXAM_TYPE_ICONS[m.examType]} size={16} color={colors.primary} />
                          <View style={{ flex: 1 }}>
                            <Text style={[typography.label, { color: colors.textPrimary }]}>{m.examType}</Text>
                            <Text style={[typography.caption, { color: colors.textMuted }]}>{m.date}</Text>
                          </View>
                          <View
                            style={{
                              paddingHorizontal: spacing(3),
                              paddingVertical: spacing(1),
                              borderRadius: radii.pill,
                              backgroundColor: `${scoreColor(m.score)}14`,
                              borderWidth: 1,
                              borderColor: `${scoreColor(m.score)}33`,
                            }}
                          >
                            <Text style={[typography.label, { color: scoreColor(m.score) }]}>{m.score}%</Text>
                          </View>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </Pressable>
          ))
        )}
      </View>

      {/* Empty State */}
      {marks.length === 0 && (
        <View
          style={[
            {
              backgroundColor: colors.surface,
              borderRadius: radii.xxl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing(10),
              alignItems: 'center',
              gap: spacing(4),
            },
            elevation,
          ]}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: `${colors.primary}14`,
              borderWidth: 2,
              borderColor: `${colors.primary}33`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="analytics-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center' }]}>No Records Yet</Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, textAlign: 'center', maxWidth: 320 },
            ]}
          >
            Tap "Add Record" above to log your first test or exam result. Your progress will appear here.
          </Text>
          <Pressable
            onPress={onAddRecord}
            style={({ pressed }) => ({
              flexDirection: 'row' as const,
              alignItems: 'center' as const,
              gap: spacing(2),
              paddingHorizontal: spacing(6),
              paddingVertical: spacing(4),
              borderRadius: radii.lg,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={[typography.label, { color: '#fff' }]}>Add First Record</Text>
          </Pressable>
        </View>
      )}

      {/* Revision Materials Section */}
      <RevisionMaterials profile={profile} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Export
// ─────────────────────────────────────────────────────────────────────────────
export default function Progress() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleProfileComplete = useCallback((p: StudentProfile) => {
    setProfile(p);
    setMarks([]);
  }, []);

  const handleAddRecord = useCallback((record: MarkRecord) => {
    setMarks((prev) => [...prev, record]);
  }, []);

  const handleReset = useCallback(() => {
    setProfile(null);
    setMarks([]);
  }, []);

  return (
    <DashboardLayout
      title={profile ? 'Progress Analytics' : 'Setup Profile'}
      subtitle={
        profile
          ? `${profile.system} · ${profile.track} · ${profile.form}`
          : 'Configure your academic profile'
      }
      showPointsCard={false}
    >
      {/* Breadcrumb */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginBottom: spacing(6) }}>
        <Text style={[typography.caption, { color: useTheme().textMuted }]}>
          Dashboard › {profile ? 'Progress Analytics' : 'Setup Profile'}
        </Text>
      </View>

      {!profile ? (
        <SetupWizard onComplete={handleProfileComplete} />
      ) : (
        <>
          <PerformanceTable
            profile={profile}
            marks={marks}
            onAddRecord={() => setAddModalOpen(true)}
            onReset={handleReset}
          />
          <AddRecordModal
            visible={addModalOpen}
            subjects={profile.subjects}
            onSave={handleAddRecord}
            onClose={() => setAddModalOpen(false)}
          />
        </>
      )}
    </DashboardLayout>
  );
}