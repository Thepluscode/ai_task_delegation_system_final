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
  Pill,
  Clock,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Zap,
  Shield,
  Activity
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface MedicationReminder {
  id: string;
  patientName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  status: 'pending' | 'taken' | 'missed' | 'overdue';
  adherenceRate: number;
  lastTaken?: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  medications: number;
  adherenceRate: number;
  nextReminder: string;
  status: 'compliant' | 'at-risk' | 'non-compliant';
}

const ReminderCard: React.FC<{ reminder: MedicationReminder; onPress: () => void }> = ({ reminder, onPress }) => {
  const getStatusColor = () => {
    switch (reminder.status) {
      case 'pending': return '#f59e0b';
      case 'taken': return '#10b981';
      case 'missed': return '#ef4444';
      case 'overdue': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (reminder.status) {
      case 'pending': return <Clock size={16} color={getStatusColor()} />;
      case 'taken': return <CheckCircle size={16} color={getStatusColor()} />;
      case 'missed': return <XCircle size={16} color={getStatusColor()} />;
      case 'overdue': return <AlertTriangle size={16} color={getStatusColor()} />;
      default: return <Clock size={16} color={getStatusColor()} />;
    }
  };

  const getAdherenceColor = () => {
    if (reminder.adherenceRate >= 90) return '#10b981';
    if (reminder.adherenceRate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <TouchableOpacity style={[styles.reminderCard, { borderLeftColor: getStatusColor() }]} onPress={onPress}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={styles.patientName}>{reminder.patientName}</Text>
          <Text style={styles.medicationName}>{reminder.medicationName}</Text>
        </View>
        <View style={styles.reminderStatus}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {reminder.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.reminderDetails}>
        <View style={styles.reminderDetail}>
          <Pill size={14} color="#6b7280" />
          <Text style={styles.detailText}>{reminder.dosage}</Text>
        </View>
        <View style={styles.reminderDetail}>
          <Bell size={14} color="#6b7280" />
          <Text style={styles.detailText}>{reminder.frequency}</Text>
        </View>
        <View style={styles.reminderDetail}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.detailText}>Next: {reminder.nextDose}</Text>
        </View>
      </View>
      
      <View style={styles.adherenceContainer}>
        <Text style={styles.adherenceLabel}>Adherence Rate:</Text>
        <Text style={[styles.adherenceValue, { color: getAdherenceColor() }]}>
          {reminder.adherenceRate}%
        </Text>
      </View>
      
      {reminder.lastTaken && (
        <Text style={styles.lastTaken}>Last taken: {reminder.lastTaken}</Text>
      )}
    </TouchableOpacity>
  );
};

const PatientCard: React.FC<{ patient: Patient; onPress: () => void }> = ({ patient, onPress }) => {
  const getStatusColor = () => {
    switch (patient.status) {
      case 'compliant': return '#10b981';
      case 'at-risk': return '#f59e0b';
      case 'non-compliant': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAdherenceColor = () => {
    if (patient.adherenceRate >= 90) return '#10b981';
    if (patient.adherenceRate >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientAge}>Age: {patient.age}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.patientMetrics}>
        <View style={styles.patientMetric}>
          <Text style={styles.metricValue}>{patient.medications}</Text>
          <Text style={styles.metricLabel}>Medications</Text>
        </View>
        <View style={styles.patientMetric}>
          <Text style={[styles.metricValue, { color: getAdherenceColor() }]}>
            {patient.adherenceRate}%
          </Text>
          <Text style={styles.metricLabel}>Adherence</Text>
        </View>
        <View style={styles.patientMetric}>
          <Text style={styles.metricValue}>{patient.nextReminder}</Text>
          <Text style={styles.metricLabel}>Next Dose</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function MedicationRemindersScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'reminders' | 'patients' | 'analytics'>('reminders');
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadReminderData();
    loadPatientData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadReminderData = () => {
    const mockReminders: MedicationReminder[] = [
      {
        id: '1',
        patientName: 'Mrs. Johnson',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        nextDose: '8:00 AM',
        status: 'pending',
        adherenceRate: 95,
        lastTaken: '8:00 AM yesterday'
      },
      {
        id: '2',
        patientName: 'Mr. Smith',
        medicationName: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        nextDose: '12:00 PM',
        status: 'overdue',
        adherenceRate: 78,
        lastTaken: '8:00 AM today'
      },
      {
        id: '3',
        patientName: 'Sarah Davis',
        medicationName: 'Atorvastatin',
        dosage: '20mg',
        frequency: 'Once daily',
        nextDose: '9:00 PM',
        status: 'taken',
        adherenceRate: 92,
        lastTaken: '9:00 PM yesterday'
      },
      {
        id: '4',
        patientName: 'Robert Wilson',
        medicationName: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        nextDose: '7:00 AM',
        status: 'missed',
        adherenceRate: 65,
        notes: 'Patient forgot morning dose'
      }
    ];
    setReminders(mockReminders);
  };

  const loadPatientData = () => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'Mrs. Johnson',
        age: 72,
        medications: 4,
        adherenceRate: 95,
        nextReminder: '8:00 AM',
        status: 'compliant'
      },
      {
        id: '2',
        name: 'Mr. Smith',
        age: 68,
        medications: 6,
        adherenceRate: 78,
        nextReminder: '12:00 PM',
        status: 'at-risk'
      },
      {
        id: '3',
        name: 'Sarah Davis',
        age: 45,
        medications: 2,
        adherenceRate: 92,
        nextReminder: '9:00 PM',
        status: 'compliant'
      },
      {
        id: '4',
        name: 'Robert Wilson',
        age: 59,
        medications: 5,
        adherenceRate: 65,
        nextReminder: '7:00 AM',
        status: 'non-compliant'
      }
    ];
    setPatients(mockPatients);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    console.log('Updating medication reminder data...');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadReminderData();
    loadPatientData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleReminderPress = (reminder: MedicationReminder) => {
    Alert.alert(
      `${reminder.medicationName} Reminder`,
      `Patient: ${reminder.patientName}\nDosage: ${reminder.dosage}\nFrequency: ${reminder.frequency}\nNext Dose: ${reminder.nextDose}\nStatus: ${reminder.status}\nAdherence: ${reminder.adherenceRate}%`,
      [
        { text: 'Mark Taken', onPress: () => console.log('Mark as taken') },
        { text: 'Snooze', onPress: () => console.log('Snooze reminder') },
        { text: 'Skip', onPress: () => console.log('Skip dose') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handlePatientPress = (patient: Patient) => {
    Alert.alert(
      `Patient: ${patient.name}`,
      `Age: ${patient.age}\nMedications: ${patient.medications}\nAdherence Rate: ${patient.adherenceRate}%\nNext Reminder: ${patient.nextReminder}\nStatus: ${patient.status}`,
      [
        { text: 'View Medications', onPress: () => console.log('View medications') },
        { text: 'Send Reminder', onPress: () => console.log('Send reminder') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeReminders = () => {
    Alert.alert(
      'AI Reminder Optimization',
      'AI suggests the following optimizations:\n\n• Adjust Mr. Smith\'s reminder time to improve adherence\n• Add meal-time reminders for Sarah Davis\n• Increase reminder frequency for Robert Wilson\n\nEstimated adherence improvement: 12%',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderReminders = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medication Reminders ({reminders.length})</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeReminders}>
          <Zap size={16} color="#ffffff" />
          <Text style={styles.optimizeButtonText}>AI Optimize</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.remindersContainer}>
        {reminders.map((reminder) => (
          <ReminderCard 
            key={reminder.id} 
            reminder={reminder} 
            onPress={() => handleReminderPress(reminder)}
          />
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

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Medication Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Users size={24} color="#3b82f6" />
          <Text style={styles.analyticsValue}>247</Text>
          <Text style={styles.analyticsLabel}>Active Patients</Text>
          <Text style={styles.analyticsChange}>+12 this week</Text>
        </View>
        <View style={styles.analyticsCard}>
          <CheckCircle size={24} color="#10b981" />
          <Text style={styles.analyticsValue}>87%</Text>
          <Text style={styles.analyticsLabel}>Avg Adherence</Text>
          <Text style={styles.analyticsChange}>+5% improvement</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Bell size={24} color="#f59e0b" />
          <Text style={styles.analyticsValue}>1,234</Text>
          <Text style={styles.analyticsLabel}>Reminders Sent</Text>
          <Text style={styles.analyticsChange}>+18% this month</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Activity size={24} color="#8b5cf6" />
          <Text style={styles.analyticsValue}>94%</Text>
          <Text style={styles.analyticsLabel}>On-time Rate</Text>
          <Text style={styles.analyticsChange}>+3% increase</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Medication Reminder System',
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
            <Text style={styles.headerTitle}>Medication Reminders</Text>
            <Text style={styles.headerSubtitle}>Automated adherence support system</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Pill size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>87% Adherence</Text>
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
          style={[styles.tab, selectedView === 'reminders' && styles.activeTab]}
          onPress={() => setSelectedView('reminders')}
        >
          <Bell size={20} color={selectedView === 'reminders' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'reminders' && styles.activeTabText]}>Reminders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'patients' && styles.activeTab]}
          onPress={() => setSelectedView('patients')}
        >
          <Users size={20} color={selectedView === 'patients' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'patients' && styles.activeTabText]}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'analytics' && styles.activeTab]}
          onPress={() => setSelectedView('analytics')}
        >
          <Activity size={20} color={selectedView === 'analytics' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedView === 'reminders' && renderReminders()}
        {selectedView === 'patients' && renderPatients()}
        {selectedView === 'analytics' && renderAnalytics()}
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
  remindersContainer: {
    gap: 12,
  },
  reminderCard: {
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
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  medicationName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  reminderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reminderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  adherenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adherenceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  adherenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  lastTaken: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
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
  patientAge: {
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
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  analyticsChange: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '600',
  },
});