import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Brain,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  RotateCcw,
  Award,
  Target,
  Zap,
  Shield,
  Activity,
  Eye,
  Gamepad2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface CognitiveTest {
  id: string;
  name: string;
  type: 'memory' | 'attention' | 'processing' | 'executive' | 'language';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface TestResult {
  id: string;
  patientName: string;
  testName: string;
  score: number;
  maxScore: number;
  duration: number;
  timestamp: string;
  improvement: number;
  category: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  testsCompleted: number;
  averageScore: number;
  lastTest: string;
  improvement: number;
  status: 'active' | 'completed' | 'scheduled';
}

const TestCard: React.FC<{ test: CognitiveTest; onPress: () => void }> = ({ test, onPress }) => {
  const getDifficultyColor = () => {
    switch (test.difficulty) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={[styles.testCard, { borderLeftColor: test.color }]} onPress={onPress}>
      <View style={styles.testHeader}>
        <View style={[styles.testIconContainer, { backgroundColor: test.color + '20' }]}>
          {test.icon}
        </View>
        <View style={styles.testInfo}>
          <Text style={styles.testName}>{test.name}</Text>
          <Text style={styles.testType}>{test.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
            {test.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.testDescription}>{test.description}</Text>
      
      <View style={styles.testFooter}>
        <View style={styles.testDetail}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.detailText}>{test.duration} min</Text>
        </View>
        <TouchableOpacity style={styles.playButton}>
          <Play size={16} color="#667eea" />
          <Text style={styles.playText}>Start Test</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ResultCard: React.FC<{ result: TestResult }> = ({ result }) => {
  const getScoreColor = () => {
    const percentage = (result.score / result.maxScore) * 100;
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getImprovementColor = () => {
    return result.improvement >= 0 ? '#10b981' : '#ef4444';
  };

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.resultInfo}>
          <Text style={styles.patientName}>{result.patientName}</Text>
          <Text style={styles.resultTestName}>{result.testName}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: getScoreColor() }]}>
            {result.score}/{result.maxScore}
          </Text>
          <Text style={styles.percentage}>
            {Math.round((result.score / result.maxScore) * 100)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.resultDetails}>
        <View style={styles.resultDetail}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.detailText}>{result.duration}min</Text>
        </View>
        <View style={styles.resultDetail}>
          <Text style={styles.detailText}>{result.timestamp}</Text>
        </View>
        <View style={styles.resultDetail}>
          {result.improvement >= 0 ? (
            <TrendingUp size={14} color="#10b981" />
          ) : (
            <TrendingDown size={14} color="#ef4444" />
          )}
          <Text style={[styles.improvementText, { color: getImprovementColor() }]}>
            {result.improvement > 0 ? '+' : ''}{result.improvement}%
          </Text>
        </View>
      </View>
      
      {result.notes && (
        <Text style={styles.resultNotes}>{result.notes}</Text>
      )}
    </View>
  );
};

const PatientCard: React.FC<{ patient: Patient; onPress: () => void }> = ({ patient, onPress }) => {
  const getStatusColor = () => {
    switch (patient.status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'scheduled': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getImprovementColor = () => {
    return patient.improvement >= 0 ? '#10b981' : '#ef4444';
  };

  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientCondition}>{patient.condition}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.patientMetrics}>
        <View style={styles.patientMetric}>
          <Text style={styles.metricValue}>{patient.testsCompleted}</Text>
          <Text style={styles.metricLabel}>Tests</Text>
        </View>
        <View style={styles.patientMetric}>
          <Text style={styles.metricValue}>{patient.averageScore}%</Text>
          <Text style={styles.metricLabel}>Avg Score</Text>
        </View>
        <View style={styles.patientMetric}>
          <Text style={[styles.improvementValue, { color: getImprovementColor() }]}>
            {patient.improvement > 0 ? '+' : ''}{patient.improvement}%
          </Text>
          <Text style={styles.metricLabel}>Change</Text>
        </View>
      </View>
      
      <Text style={styles.lastTest}>Last test: {patient.lastTest}</Text>
    </TouchableOpacity>
  );
};

export default function CognitiveAssessmentScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'tests' | 'results' | 'patients'>('tests');
  const [tests, setTests] = useState<CognitiveTest[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadTestData();
    loadResultData();
    loadPatientData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTestData = () => {
    const mockTests: CognitiveTest[] = [
      {
        id: '1',
        name: 'Memory Sequence',
        type: 'memory',
        duration: 10,
        difficulty: 'medium',
        description: 'Remember and repeat sequences of colors, numbers, or shapes',
        icon: <Brain size={20} color="#3b82f6" />,
        color: '#3b82f6'
      },
      {
        id: '2',
        name: 'Attention Focus',
        type: 'attention',
        duration: 15,
        difficulty: 'easy',
        description: 'Maintain focus on specific targets while ignoring distractions',
        icon: <Eye size={20} color="#10b981" />,
        color: '#10b981'
      },
      {
        id: '3',
        name: 'Processing Speed',
        type: 'processing',
        duration: 8,
        difficulty: 'hard',
        description: 'Quick decision making and pattern recognition tasks',
        icon: <Zap size={20} color="#f59e0b" />,
        color: '#f59e0b'
      },
      {
        id: '4',
        name: 'Executive Function',
        type: 'executive',
        duration: 20,
        difficulty: 'hard',
        description: 'Problem solving, planning, and cognitive flexibility exercises',
        icon: <Target size={20} color="#8b5cf6" />,
        color: '#8b5cf6'
      },
      {
        id: '5',
        name: 'Language Skills',
        type: 'language',
        duration: 12,
        difficulty: 'medium',
        description: 'Word recall, comprehension, and verbal fluency assessments',
        icon: <Activity size={20} color="#ef4444" />,
        color: '#ef4444'
      }
    ];
    setTests(mockTests);
  };

  const loadResultData = () => {
    const mockResults: TestResult[] = [
      {
        id: '1',
        patientName: 'Mrs. Johnson',
        testName: 'Memory Sequence',
        score: 85,
        maxScore: 100,
        duration: 9,
        timestamp: '2:30 PM',
        improvement: 12,
        category: 'memory',
        notes: 'Significant improvement in short-term memory recall'
      },
      {
        id: '2',
        patientName: 'Mr. Smith',
        testName: 'Attention Focus',
        score: 72,
        maxScore: 100,
        duration: 14,
        timestamp: '1:15 PM',
        improvement: -5,
        category: 'attention',
        notes: 'Slight decline, may need adjusted medication'
      },
      {
        id: '3',
        patientName: 'Sarah Davis',
        testName: 'Processing Speed',
        score: 91,
        maxScore: 100,
        duration: 7,
        timestamp: '11:45 AM',
        improvement: 8,
        category: 'processing'
      },
      {
        id: '4',
        patientName: 'Robert Wilson',
        testName: 'Executive Function',
        score: 68,
        maxScore: 100,
        duration: 18,
        timestamp: '10:20 AM',
        improvement: 15,
        category: 'executive',
        notes: 'Excellent progress in problem-solving abilities'
      }
    ];
    setResults(mockResults);
  };

  const loadPatientData = () => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'Mrs. Johnson',
        age: 72,
        condition: 'Mild Cognitive Impairment',
        testsCompleted: 24,
        averageScore: 78,
        lastTest: '2 hours ago',
        improvement: 12,
        status: 'active'
      },
      {
        id: '2',
        name: 'Mr. Smith',
        age: 68,
        condition: 'Early Alzheimers',
        testsCompleted: 18,
        averageScore: 65,
        lastTest: '1 day ago',
        improvement: -3,
        status: 'scheduled'
      },
      {
        id: '3',
        name: 'Sarah Davis',
        age: 45,
        condition: 'Post-Stroke Recovery',
        testsCompleted: 32,
        averageScore: 84,
        lastTest: '3 hours ago',
        improvement: 18,
        status: 'active'
      },
      {
        id: '4',
        name: 'Robert Wilson',
        age: 59,
        condition: 'Traumatic Brain Injury',
        testsCompleted: 28,
        averageScore: 71,
        lastTest: '5 hours ago',
        improvement: 22,
        status: 'completed'
      }
    ];
    setPatients(mockPatients);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    console.log('Updating cognitive assessment data...');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadTestData();
    loadResultData();
    loadPatientData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleTestPress = (test: CognitiveTest) => {
    Alert.alert(
      `Start ${test.name}?`,
      `Type: ${test.type}\nDuration: ${test.duration} minutes\nDifficulty: ${test.difficulty}\n\n${test.description}`,
      [
        { text: 'Start Test', onPress: () => console.log(`Starting ${test.name}`) },
        { text: 'Preview', onPress: () => console.log(`Previewing ${test.name}`) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handlePatientPress = (patient: Patient) => {
    Alert.alert(
      `Patient: ${patient.name}`,
      `Age: ${patient.age}\nCondition: ${patient.condition}\nTests Completed: ${patient.testsCompleted}\nAverage Score: ${patient.averageScore}%\nImprovement: ${patient.improvement}%`,
      [
        { text: 'View History', onPress: () => console.log('View patient history') },
        { text: 'Schedule Test', onPress: () => console.log('Schedule new test') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeTests = () => {
    Alert.alert(
      'AI Test Optimization',
      'AI suggests the following optimizations:\n\n• Increase memory test difficulty for Mrs. Johnson\n• Focus on attention exercises for Mr. Smith\n• Add language assessments for Sarah Davis\n\nEstimated improvement: 15% better outcomes',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderTests = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cognitive Tests ({tests.length})</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeTests}>
          <Zap size={16} color="#ffffff" />
          <Text style={styles.optimizeButtonText}>AI Optimize</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.testsContainer}>
        {tests.map((test) => (
          <TestCard 
            key={test.id} 
            test={test} 
            onPress={() => handleTestPress(test)}
          />
        ))}
      </View>
    </View>
  );

  const renderResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Results ({results.length})</Text>
      <View style={styles.resultsContainer}>
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </View>
    </View>
  );

  const renderPatients = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Patients ({patients.length})</Text>
      <View style={styles.patientsContainer}>
        {patients.map((patient) => (
          <PatientCard 
            key={patient.id} 
            patient={patient} 
            onPress={() => handlePatientPress(patient)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Cognitive Assessment Games',
          headerShown: true,
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
          )
        }}
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Cognitive Assessment</Text>
            <Text style={styles.headerSubtitle}>Interactive games for cognitive evaluation</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Gamepad2 size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>5 Games</Text>
            </View>
            <View style={styles.headerStat}>
              <Shield size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>HIPAA Secure</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'tests' && styles.activeTab]}
          onPress={() => setSelectedView('tests')}
        >
          <Brain size={20} color={selectedView === 'tests' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'tests' && styles.activeTabText]}>Tests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'results' && styles.activeTab]}
          onPress={() => setSelectedView('results')}
        >
          <Award size={20} color={selectedView === 'results' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'results' && styles.activeTabText]}>Results</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'patients' && styles.activeTab]}
          onPress={() => setSelectedView('patients')}
        >
          <Users size={20} color={selectedView === 'patients' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'patients' && styles.activeTabText]}>Patients</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedView === 'tests' && renderTests()}
        {selectedView === 'results' && renderResults()}
        {selectedView === 'patients' && renderPatients()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  headerStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  headerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  headerStatText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#667eea20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  optimizeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  testsContainer: {
    gap: 12,
  },
  testCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  testIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  testType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  playText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  resultsContainer: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resultTestName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultNotes: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  patientsContainer: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientCondition: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  patientMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patientMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  improvementValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastTest: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});