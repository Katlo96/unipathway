import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ── Design System ──────────────────────────────────────────────────────────────
const BASE_SPACING = 4;
const spacing = (n: number) => n * BASE_SPACING;

const typography = {
  hero: { fontSize: 38, lineHeight: 44, fontWeight: '900' as const },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800' as const },
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
  pill: 9999,
};

const elevations = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  android: { elevation: 6 },
  web: { boxShadow: '0 6px 16px rgba(0,0,0,0.1)' },
  default: {},
});

const breakpoints = { mobileMax: 479, tabletMax: 1023 };
const maxContentWidth = 1240;
const formMaxWidth = 480;

// ── Types ──────────────────────────────────────────────────────────────────────
type Level = 'BGCSE' | 'IGCSE';
type Track = 'PURE' | 'DOUBLE' | 'SINGLE' | 'ADVANCED' | 'ORDINARY';

const GRADES_STANDARD = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'U'] as const;
type StandardGrade = typeof GRADES_STANDARD[number];

const GRADES_DOUBLE = ['A*A*', 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'UU'] as const;
type DoubleGrade = typeof GRADES_DOUBLE[number];

type Grade = StandardGrade | DoubleGrade | '';

const DOUBLE_AWARD_SUBJECT = 'Science Double Award';

const pointsStandard: Record<StandardGrade, number> = {
  'A*': 8, A: 7, B: 6, C: 5, D: 4, E: 3, F: 2, G: 1, U: 0,
};

const pointsDouble: Record<DoubleGrade, number> = {
  'A*A*': 16, AA: 14, BB: 12, CC: 10, DD: 8, EE: 6, FF: 4, GG: 2, UU: 0,
};

function isDoubleAward(subject: string): boolean {
  return subject.trim().toLowerCase() === DOUBLE_AWARD_SUBJECT.toLowerCase();
}

export default function EnterResults() {
  const { width } = useWindowDimensions();
  const scheme = useColorScheme() || 'light';

  const colors = useMemo(() => ({
    background: scheme === 'light' ? '#F8FCFD' : '#0A111A',
    surface: scheme === 'light' ? '#FFFFFF' : '#1A232E',
    surfaceAlt: scheme === 'light' ? '#F4F8FA' : '#222B36',
    textPrimary: scheme === 'light' ? '#0A111A' : '#EAF2F8',
    textSecondary: scheme === 'light' ? '#4A6572' : '#A0B4C0',
    textMuted: scheme === 'light' ? '#7A919E' : '#7A919E',
    primary: '#4A9FC6',
    primaryText: '#FFFFFF',
    error: '#D32F2F',
    border: scheme === 'light' ? 'rgba(10,17,26,0.08)' : 'rgba(234,242,248,0.12)',
    accent: scheme === 'light' ? '#EAF6F8' : '#2A3A48',
  }), [scheme]);

  const uiMode = useMemo(() => {
    if (width <= breakpoints.mobileMax) return 'mobile';
    if (width <= breakpoints.tabletMax) return 'tablet';
    return 'desktop';
  }, [width]);

  const isMobile = uiMode === 'mobile';
  const isDesktop = uiMode === 'desktop';

  const pagePadding = isMobile ? spacing(5) : spacing(8);
  const formWidth = isDesktop ? formMaxWidth : '100%';

  const [level, setLevel] = useState<Level>('BGCSE');

  // Use as const + explicit type assertion for literal safety
  const bgcseTracks = ['PURE', 'DOUBLE', 'SINGLE'] as const;
  const igcseTracks = ['ADVANCED', 'ORDINARY'] as const;

  const [track, setTrack] = useState<Track>('PURE');

  const availableTracks = level === 'BGCSE' ? bgcseTracks : igcseTracks;

  const [rows, setRows] = useState<{ id: string; subject: string; grade: Grade }[]>(() => {
    const defaults = level === 'BGCSE'
      ? track === 'PURE' ? ['Chemistry', 'Physics', 'Biology', 'Mathematics', 'English'] : ['Integrated Science', 'Mathematics', 'English']
      : ['Chemistry', 'Physics', 'Biology', 'Mathematics', 'English'];
    return defaults.map(s => ({ id: Math.random().toString(36).slice(2), subject: s, grade: '' as Grade }));
  });

  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showGradePicker, setShowGradePicker] = useState(false);

  const activeRow = rows.find(r => r.id === activeRowId);

  const requiredSlots = level === 'BGCSE' && track === 'PURE' ? 6 : 5;

  const allFilled = rows.length >= requiredSlots && rows.every(r => r.subject.trim() && r.grade);

  const handleAddRow = () => {
    setRows(prev => [...prev, { id: Math.random().toString(36).slice(2), subject: '', grade: '' as Grade }]);
  };

  const handleRemoveRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleGradeSelect = (grade: Grade) => {
    if (!activeRowId) return;
    setRows(prev => prev.map(r => r.id === activeRowId ? { ...r, grade } : r));
    setShowGradePicker(false);
    setActiveRowId(null);
  };

  const handleCalculate = () => {
    if (!allFilled) {
      alert('Please fill all required fields.');
      return;
    }
    // Placeholder for real calculation logic
    alert('Points calculated! (placeholder)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={{ padding: pagePadding, paddingBottom: spacing(10) }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ maxWidth: isDesktop ? maxContentWidth : '100%', alignSelf: 'center', width: '100%' }}>
              <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(2) }]}>
                Enter Your Results
              </Text>

              <Text style={[typography.subtitle, { color: colors.textSecondary, marginBottom: spacing(6) }]}>
                Select your qualification and enter subjects & grades.
              </Text>

              {/* Level Selector */}
              <View style={[styles.selectorRow, { gap: spacing(3), marginBottom: spacing(6) }]}>
                {(['BGCSE', 'IGCSE'] as const).map(l => (
                  <Pressable
                    key={l}
                    onPress={() => setLevel(l)}
                    style={({ pressed }) => [
                      styles.selectorPill,
                      level === l && styles.selectorPillActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[typography.body, { color: level === l ? colors.primaryText : colors.textPrimary }]}>
                      {l}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Track Selector */}
              <View style={[styles.selectorRow, { gap: spacing(3), marginBottom: spacing(6) }]}>
                {availableTracks.map(t => (
                  <Pressable
                    key={t}
                    onPress={() => setTrack(t as Track)} // Type assertion here ensures safety
                    style={({ pressed }) => [
                      styles.selectorPill,
                      track === t && styles.selectorPillActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[typography.body, { color: track === t ? colors.primaryText : colors.textPrimary }]}>
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Subject Rows */}
              {rows.map((row, index) => (
                <View key={row.id} style={[styles.row, { marginBottom: spacing(3) }]}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: spacing(2) }]}>
                    <TextInput
                      value={row.subject}
                      onChangeText={text => setRows(prev => prev.map(r => r.id === row.id ? { ...r, subject: text } : r))}
                      placeholder={`Subject ${index + 1}`}
                      placeholderTextColor={colors.textMuted}
                      style={[typography.body, { flex: 1, color: colors.textPrimary }]}
                    />
                  </View>

                  <Pressable
                    onPress={() => { setActiveRowId(row.id); setShowGradePicker(true); }}
                    style={({ pressed }) => [
                      styles.gradeButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[typography.body, { color: row.grade ? colors.textPrimary : colors.textMuted }]}>
                      {row.grade || 'Grade'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
                  </Pressable>

                  {rows.length > requiredSlots && (
                    <Pressable
                      onPress={() => handleRemoveRow(row.id)}
                      style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </Pressable>
                  )}
                </View>
              ))}

              <Pressable
                onPress={handleAddRow}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                  { marginTop: spacing(3) },
                ]}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={[typography.body, { color: colors.primary, marginLeft: spacing(2) }]}>
                  Add Subject
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCalculate}
                disabled={!allFilled}
                style={({ pressed }) => [
                  styles.calculateButton,
                  !allFilled && styles.disabled,
                  pressed && styles.pressed,
                  { marginTop: spacing(6) },
                ]}
              >
                <Text style={[typography.body, { color: allFilled ? colors.primaryText : colors.textMuted, fontWeight: '700' }]}>
                  Calculate Points
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Grade Picker Modal */}
      <Modal visible={showGradePicker} transparent animationType="fade" onRequestClose={() => setShowGradePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowGradePicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing(4) }]}>
              Select Grade
            </Text>

            {(activeRow && isDoubleAward(activeRow.subject) ? GRADES_DOUBLE : GRADES_STANDARD).map(g => (
              <Pressable
                key={g}
                onPress={() => handleGradeSelect(g as Grade)}
                style={({ pressed }) => [
                  styles.gradeOption,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[typography.body, { color: colors.textPrimary }]}>{g}</Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => handleGradeSelect('')}
              style={({ pressed }) => [
                styles.gradeOption,
                pressed && styles.pressed,
                { marginTop: spacing(3), backgroundColor: colors.surfaceAlt },
              ]}
            >
              <Text style={[typography.body, { color: colors.textMuted }]}>Clear</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap' },
  selectorPill: {
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(5),
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(74,159,198,0.08)',
  },
  selectorPillActive: { backgroundColor: '#4A9FC6' },
  row: { flexDirection: 'row', alignItems: 'center' },
  inputContainer: {
    padding: spacing(3.5),
    borderWidth: 1,
    borderRadius: radii.md,
    borderColor: 'rgba(10,17,26,0.12)',
  },
  gradeButton: {
    padding: spacing(3.5),
    borderWidth: 1,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 120,
  },
  removeButton: {
    padding: spacing(3),
    borderRadius: radii.md,
    marginLeft: spacing(2),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4),
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#4A9FC6',
  },
  calculateButton: {
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    borderRadius: radii.md,
    backgroundColor: '#4A9FC6',
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(5),
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: spacing(5),
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  gradeOption: {
    padding: spacing(4),
    borderRadius: radii.md,
    marginBottom: spacing(2),
  },
});