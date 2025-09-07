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
  Users,
  Clock,
  MapPin,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Heart,
  UserCheck,
  Zap,
  Shield,
  BarChart3
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { 
  healthcareService, 
  Patient, 
  Department, 
  FlowMetric, 
  HealthcareResponse 
} from '../../services/api/healthcareService';

const { width } = Dimensions.get('window');

const PatientCard: React.FC<{ patient: Patient; onPress: () => void }> = ({ patient, onPress }) => {
  const getStatusColor = () => {
    switch (patient.status) {
      case 'waiting': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'urgent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = () => {
    switch (patient.priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientRoom}>Room {patient.room}</Text>
        </View>
        <View style={styles.patientStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {patient.status.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.patientDetails}>
        <View style={styles.patientDetail}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.detailText}>{patient.waitTime}min wait</Text>
        </View>
        <View style={styles.patientDetail}>
          <MapPin size={16} color="#6b7280" />
          <Text style={styles.detailText}>{patient.department}</Text>
        </View>
        <View style={styles.patientDetail}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {patient.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      {patient.assignedStaff && (
        <View style={styles.assignedStaff}>
          <UserCheck size={14} color="#10b981" />
          <Text style={styles.staffText}>Assigned to {patient.assignedStaff}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const DepartmentCard: React.FC<{ department: Department }> = ({ department }) => {
  const getStatusColor = () => {
    switch (department.status) {
      case 'optimal': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const utilizationPercentage = (department.currentPatients / department.capacity) * 100;

  return (
    <View style={styles.departmentCard}>
      <View style={styles.departmentHeader}>
        <Text style={styles.departmentName}>{department.name}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.departmentMetrics}>
        <View style={styles.departmentMetric}>
          <Text style={styles.departmentMetricValue}>{department.currentPatients}/{department.capacity}</Text>
          <Text style={styles.metricLabel}>Patients</Text>
        </View>
        <View style={styles.departmentMetric}>
          <Text style={styles.departmentMetricValue}>{department.averageWaitTime}min</Text>
          <Text style={styles.metricLabel}>Avg Wait</Text>
        </View>
        <View style={styles.departmentMetric}>
          <Text style={styles.departmentMetricValue}>{department.efficiency}%</Text>
          <Text style={styles.metricLabel}>Efficiency</Text>
        </View>
      </View>
      
      <View style={styles.utilizationBar}>
        <View style={styles.utilizationTrack}>
          <View 
            style={[
              styles.utilizationFill, 
              { 
                width: `${Math.min(utilizationPercentage, 100)}%`,
                backgroundColor: getStatusColor()
              }
            ]} 
          />
        </View>
        <Text style={styles.utilizationText}>{Math.round(utilizationPercentage)}% Capacity</Text>
      </View>
    </View>
  );
};

export default function PatientFlowScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'patients' | 'departments'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [flowMetrics, setFlowMetrics] = useState<FlowMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from our API service instead of hardcoded mocks
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [patientsData, departmentsData, metricsData] = await Promise.all([
        healthcareService.getPatients(),
        healthcareService.getDepartments(),
        healthcareService.getFlowMetrics()
      ]);
      
      setPatients(patientsData);
      setDepartments(departmentsData);
      setFlowMetrics(metricsData);
    } catch (err) {
      console.error("Error loading healthcare data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const updateRealTimeData = () => {
    // Update wait times for waiting patients
    setPatients(prev => prev.map(patient => ({
      ...patient,
      waitTime: patient.status === 'waiting' ? patient.waitTime + 1 : patient.waitTime
    })));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  }, []);

  const handlePatientPress = (patient: Patient) => {
    Alert.alert(
      `Patient: ${patient.name}`,
      `Room: ${patient.room}\nDepartment: ${patient.department}\nStatus: ${patient.status}\nWait Time: ${patient.waitTime} minutes\nPriority: ${patient.priority}`,
      [
        { 
          text: 'Assign Staff', 
          onPress: () => {
            // In a real implementation, we would call the API
            Alert.alert('Success', 'Staff assignment would be processed through the API');
          } 
        },
        { 
          text: 'Update Status', 
          onPress: () => {
            // In a real implementation, we would call the API
            Alert.alert('Success', 'Status update would be processed through the API');
          } 
        },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeFlow = async () => {
    try {
      // In a real implementation, we would call:
      // const suggestions = await healthcareService.getOptimizationSuggestions();
      
      // Simulate API response
      Alert.alert(
        'AI Flow Optimization',
        'AI has analyzed current patient flow and suggests:\n\n• Move 2 patients from Emergency to Fast Track\n• Reassign Dr. Smith to Cardiology\n• Open additional bed in ICU\n\nEstimated wait time reduction: 15 minutes',
        [
          { 
            text: 'Apply Suggestions', 
            onPress: () => {
              // In a real implementation, we would call the API to apply changes
              Alert.alert('Success', 'AI optimization applied successfully');
            } 
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (err) {
      console.error('Error getting optimization suggestions:', err);
      Alert.alert('Error', 'Failed to get optimization suggestions');
    }
  };

  const renderOverview = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flow Metrics</Text>
        <View style={styles.metricsGrid}>
          {flowMetrics.map((metric, index) => {
            // Generate icon based on the metric title
            let icon;
            let color;
            
            switch (metric.title) {
              case 'Total Patients':
                icon = <Users size={20} color="#3b82f6" />;
                color = '#3b82f6';
                break;
              case 'Avg Wait Time':
                icon = <Clock size={20} color="#10b981" />;
                color = '#10b981';
                break;
              case 'Bed Utilization':
                icon = <Activity size={20} color="#8b5cf6" />;
                color = '#8b5cf6';
                break;
              case 'Critical Cases':
                icon = <AlertTriangle size={20} color="#ef4444" />;
                color = '#ef4444';
                break;
              default:
                icon = <Activity size={20} color="#6b7280" />;
                color = '#6b7280';
            }
            
            return (
              <View key={index} style={[styles.metricCard, { borderLeftColor: color }]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.metricIconContainer, { backgroundColor: color + '20' }]}>
                    {icon}
                  </View>
                  <View style={styles.metricChange}>
                    {metric.isPositive ? (
                      <TrendingUp size={16} color="#10b981" />
                    ) : (
                      <TrendingDown size={16} color="#ef4444" />
                    )}
                    <Text style={[styles.changeText, { color: metric.isPositive ? '#10b981' : '#ef4444' }]}>
                      {metric.change}
                    </Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricTitle}>{metric.title}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Department Status</Text>
          <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeFlow}>
            <Zap size={16} color="#ffffff" />
            <Text style={styles.optimizeButtonText}>AI Optimize</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.departmentsGrid}>
          {departments.slice(0, 4).map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Patients</Text>
        <View style={styles.patientsContainer}>
          {patients.slice(0, 3).map((patient) => (
            <PatientCard 
              key={patient.id} 
              patient={patient} 
              onPress={() => handlePatientPress(patient)}
            />
          ))}
        </View>
      </View>
    </>
  );

  const renderPatients = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Patients ({patients.length})</Text>
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

  const renderDepartments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Departments ({departments.length})</Text>
      <View style={styles.departmentsGrid}>
        {departments.map((department) => (
          <DepartmentCard key={department.id} department={department} />
        ))}
      </View>
    </View>
  );
  
  // Show loading state
  if (loading && !refreshing && patients.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Patient Flow Optimization',
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
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading patient data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing && patients.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Patient Flow Optimization',
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
        
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Patient Flow Optimization',
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
            <Text style={styles.headerTitle}>Patient Flow Control</Text>
            <Text style={styles.headerSubtitle}>Real-time optimization & monitoring</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Heart size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>{patients.length} Active</Text>
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
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <BarChart3 size={20} color={selectedView === 'overview' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'patients' && styles.activeTab]}
          onPress={() => setSelectedView('patients')}
        >
          <Users size={20} color={selectedView === 'patients' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'patients' && styles.activeTabText]}>Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'departments' && styles.activeTab]}
          onPress={() => setSelectedView('departments')}
        >
          <MapPin size={20} color={selectedView === 'departments' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'departments' && styles.activeTabText]}>Departments</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'patients' && renderPatients()}
        {selectedView === 'departments' && renderDepartments()}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
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
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  departmentsGrid: {
    gap: 12,
  },
  departmentCard: {
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
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  departmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  departmentMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  departmentMetric: {
    alignItems: 'center',
  },
  departmentMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  utilizationBar: {
    gap: 8,
  },
  utilizationTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 3,
  },
  utilizationText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  patientRoom: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  patientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  assignedStaff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  staffText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#667eea',
    borderTopColor: 'transparent',
    marginBottom: 16,
    // Animation would be implemented with Animated API
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});