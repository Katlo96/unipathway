import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DashboardLayout, {
  spacing,
  typography,
  radii,
  useTheme,
} from '../../components/student/DashboardLayout';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Mark = {
  id: string;
  subject: string;
  score: number;
  type: string;
  date: string;
};

// Subject difficulty weights
const SUBJECT_WEIGHTS: Record<string, number> = {
  Mathematics: 1.3,
  Physics: 1.4,
  Chemistry: 1.4,
  Biology: 1.2,
  English: 1.0,
  History: 1.0,
};

// Mock revision content
const REVISION_CONTENT = {
  BGCSE: {
    Pure: {
      Chemistry: [
        {
          title: 'Chemical Bonding Notes',
          url: 'https://example.com/chem-bonding.pdf',
        },
      ],
    },
  },
};

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function Progress() {
  const colors = useTheme();

  const [system, setSystem] = useState<'BGCSE' | 'IGCSE' | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [subjectFocus, setSubjectFocus] = useState<string | null>(null);

  const [marks, setMarks] = useState<Mark[]>([]);

  const [modalVisible, setModalVisible] = useState(false);

  const [newSubject, setNewSubject] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newType, setNewType] = useState('');
  const [newDate, setNewDate] = useState('');

  // ─────────────────────────────────────────────
  // WEIGHTED AVERAGE
  // ─────────────────────────────────────────────
  const weightedAverage = useMemo(() => {
    if (!marks.length) return 0;

    let total = 0;
    let weightSum = 0;

    marks.forEach((m) => {
      const weight = SUBJECT_WEIGHTS[m.subject] || 1;
      total += m.score * weight;
      weightSum += weight;
    });

    return Math.round(total / weightSum);
  }, [marks]);

  // ─────────────────────────────────────────────
  // GROUP FOR GRAPH
  // ─────────────────────────────────────────────
 const subjectGraphs = useMemo(() => {
  const grouped: Record<string, number[]> = {};

  marks.forEach((m) => {
    if (!grouped[m.subject]) grouped[m.subject] = [];

    if (!isNaN(m.score)) {
      grouped[m.subject].push(m.score);
    }
  });

  return grouped;
}, [marks]);



  // ─────────────────────────────────────────────
  // ADD MARK
  // ─────────────────────────────────────────────
  const addMark = () => {
  const parsedScore = Number(newScore);

  if (!newSubject || isNaN(parsedScore)) {
    alert('Please enter a valid subject and numeric score');
    return;
  }

  const mark: Mark = {
    id: Date.now().toString(),
    subject: newSubject,
    score: parsedScore,
    type: newType || 'Unknown',
    date: newDate || new Date().toISOString(),
  };

  setMarks((prev) => [...prev, mark]);

  setModalVisible(false);
  setNewSubject('');
  setNewScore('');
  setNewType('');
  setNewDate('');
};

  // ─────────────────────────────────────────────
  // SELECTOR UI
  // ─────────────────────────────────────────────
  const Selector = ({ label, options, value, onSelect }: any) => (
    <View style={{ marginBottom: spacing(4) }}>
      <Text style={typography.label}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt: string) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  value === opt ? colors.primary : colors.surfaceAlt,
              },
            ]}
          >
            <Text style={{ color: 'white' }}>{opt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <DashboardLayout title="Advanced Progress Analytics">
      <ScrollView>

        {/* SYSTEM FLOW */}
        <Selector
          label="System"
          options={['BGCSE', 'IGCSE']}
          value={system}
          onSelect={setSystem}
        />

        {system === 'BGCSE' && (
          <Selector
            label="Level"
            options={['Pure', 'Double', 'Single']}
            value={level}
            onSelect={setLevel}
          />
        )}

        {system === 'IGCSE' && (
          <Selector
            label="Level"
            options={['Ordinary', 'Advanced']}
            value={level}
            onSelect={setLevel}
          />
        )}

        {/* WEIGHTED SCORE */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={typography.label}>Weighted Performance</Text>
          <Text style={[typography.hero, { color: colors.primary }]}>
            {weightedAverage}%
          </Text>
        </View>

        {/* GRAPHS */}
        <Text style={[typography.h2, { marginTop: spacing(6) }]}>
          Performance Trends
        </Text>

       {Object.keys(subjectGraphs).map((subject) => (
  <View key={subject}>
    <Text style={{ color: colors.textPrimary }}>{subject}</Text>

    {subjectGraphs[subject]?.length > 0 && (
      <LineChart
        data={{
          labels: subjectGraphs[subject].map((_, i) => `${i + 1}`),
          datasets: [{ data: subjectGraphs[subject] }],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundGradientFrom: '#0A1428',
          backgroundGradientTo: '#0A1428',
          color: () => '#60A5FA',
        }}
        style={{ marginVertical: 10, borderRadius: 12 }}
      />
    )}
  </View>
))}

        {/* REVISION HUB */}
        <Text style={[typography.h2, { marginTop: spacing(6) }]}>
          Smart Revision Hub
        </Text>

        <Selector
          label="Select Subject"
          options={['Chemistry', 'Mathematics', 'Physics']}
          value={subjectFocus}
          onSelect={setSubjectFocus}
        />

        {system && level && subjectFocus && (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={typography.bodyStrong}>
              Available Resources
            </Text>

            {(REVISION_CONTENT as any)?.[system]?.[level]?.[subjectFocus]?.map(
              (item: any, index: number) => (
                <Pressable
                  key={index}
                  onPress={() => Linking.openURL(item.url)}
                  style={styles.resource}
                >
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  <Text style={{ marginLeft: 10, color: colors.textPrimary }}>
                    {item.title}
                  </Text>
                </Pressable>
              )
            ) || (
              <Text style={{ color: colors.textMuted }}>
                No resources yet (connect backend)
              </Text>
            )}
          </View>
        )}

        {/* ADD MARK BUTTON */}
        <Pressable
          onPress={() => setModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: 'white' }}>Add Record</Text>
        </Pressable>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent>
          <View style={styles.modal}>
            <View style={styles.modalCard}>
              <TextInput placeholder="Subject" value={newSubject} onChangeText={setNewSubject} style={styles.input}/>
              <TextInput placeholder="Score" value={newScore} onChangeText={setNewScore} style={styles.input}/>
              <TextInput placeholder="Type" value={newType} onChangeText={setNewType} style={styles.input}/>
              <TextInput placeholder="Date" value={newDate} onChangeText={setNewDate} style={styles.input}/>

              <Pressable onPress={addMark} style={styles.saveBtn}>
                <Text style={{ color: 'white' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </DashboardLayout>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    padding: spacing(5),
    borderRadius: radii.lg,
    marginTop: spacing(3),
  },
  chip: {
    padding: 10,
    borderRadius: 20,
  },
  addBtn: {
    padding: 14,
    marginTop: spacing(6),
    borderRadius: 12,
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resource: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});