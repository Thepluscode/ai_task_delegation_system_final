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
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Users,
  Activity,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  Heart,
  Truck
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface EmergencyAlert {
  id: string;
  type: 'medical' | 'fire' | 'security' | 'fall' | 'cardiac';
  patientName: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'responding' | 'resolved' | 'false-alarm';
  responseTime?: number;
  assignedTeam?: string;
  description: string;
}

interface ResponseTeam {
  id: string;
  name: string;
  type: 'medical' | 'security' | 'maintenance';
  members: number;
  status: 'available' | 'responding' | 'busy';
  location: string;
  averageResponseTime: number;
  activeAlerts: number;
}

const AlertCard: React.FC<{ alert: EmergencyAlert; onPress: () => void }> = ({ alert, onPress }) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusColor = () => {
    switch (alert.status) {
      case 'active': return '#ef4444';
      case 'responding': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'false-alarm': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = () => {
    switch (alert.type) {
      case 'medical': return <Heart size={20} color="#ef4444" />;
      case 'fire': return <AlertTriangle size={20} color="#f97316" />;
      case 'security': return <Shield size={20} color="#3b82f6" />;
      case 'fall': return <Users size={20} color="#8b5cf6" />;
      case 'cardiac': return <Activity size={20} color="#ef4444" />;
      default: return <AlertTriangle size={20} color="#6b7280" />;
    }
  };

  const getStatusIcon = () => {
    switch (alert.status) {
      case 'active': return <AlertTriangle size={16} color={getStatusColor()} />;
      case 'responding': return <Truck size={16} color={getStatusColor()} />;
      case 'resolved': return <CheckCircle size={16} color={getStatusColor()} />;
      case 'false-alarm': return <XCircle size={16} color={getStatusColor()} />;
      default: return <AlertTriangle size={16} color={getStatusColor()} />;
    }
  };

  return (
    <TouchableOpacity style={[styles.alertCard, { borderLeftColor: getSeverityColor() }]} onPress={onPress}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTypeContainer}>
          {getTypeIcon()}
          <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
        </View>
        <View style={styles.alertStatus}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {alert.status.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.alertInfo}>
        <Text style={styles.patientName}>{alert.patientName}</Text>
        <Text style={styles.alertDescription}>{alert.description}</Text>
      </View>
      
      <View style={styles.alertDetails}>
        <View style={styles.alertDetail}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.detailText}>{alert.location}</Text>
        </View>
        <View style={styles.alertDetail}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.detailText}>{alert.timestamp}</Text>
        </View>
        <View style={styles.alertDetail}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor() + '20' }]}>
            <Text style={[styles.severityText, { color: getSeverityColor() }]}>
              {alert.severity.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      {alert.responseTime && (
        <View style={styles.responseTime}>
          <Text style={styles.responseText}>Response time: {alert.responseTime}s</Text>
        </View>
      )}
      
      {alert.assignedTeam && (
        <View style={styles.assignedTeam}>
          <Users size={14} color="#10b981" />
          <Text style={styles.teamText}>Assigned to {alert.assignedTeam}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const TeamCard: React.FC<{ team: ResponseTeam }> = ({ team }) => {
  const getStatusColor = () => {
    switch (team.status) {
      case 'available': return '#10b981';
      case 'responding': return '#f59e0b';
      case 'busy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = () => {
    switch (team.type) {
      case 'medical': return <Heart size={20} color="#ef4444" />;
      case 'security': return <Shield size={20} color="#3b82f6" />;
      case 'maintenance': return <Activity size={20} color="#8b5cf6" />;
      default: return <Users size={20} color="#6b7280" />;
    }
  };

  return (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <View style={styles.teamTypeContainer}>
            {getTypeIcon()}
            <Text style={styles.teamName}>{team.name}</Text>
          </View>
          <Text style={styles.teamLocation}>{team.location}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.teamMetrics}>
        <View style={styles.teamMetric}>
          <Text style={styles.metricValue}>{team.members}</Text>
          <Text style={styles.metricLabel}>Members</Text>
        </View>
        <View style={styles.teamMetric}>
          <Text style={styles.metricValue}>{team.averageResponseTime}s</Text>
          <Text style={styles.metricLabel}>Avg Response</Text>
        </View>
        <View style={styles.teamMetric}>
          <Text style={styles.metricValue}>{team.activeAlerts}</Text>
          <Text style={styles.metricLabel}>Active Alerts</Text>
        </View>
      </View>
    </View>
  );
};

export default function EmergencyResponseScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'alerts' | 'teams' | 'analytics'>('alerts');
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [teams, setTeams] = useState<ResponseTeam[]>([]);

  useEffect(() => {
    loadAlertData();
    loadTeamData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAlertData = () => {
    const mockAlerts: EmergencyAlert[] = [
      {
        id: '1',
        type: 'cardiac',
        patientName: 'Mrs. Johnson',
        location: 'Room 101A',
        timestamp: '2:45 PM',
        severity: 'critical',
        status: 'active',
        description: 'Patient experiencing chest pain and shortness of breath',
        assignedTeam: 'Medical Team Alpha'
      },
      {
        id: '2',
        type: 'fall',
        patientName: 'Mr. Smith',
        location: 'Bathroom 2B',
        timestamp: '2:30 PM',
        severity: 'high',
        status: 'responding',
        responseTime: 45,
        description: 'Fall detected by sensors, patient conscious',
        assignedTeam: 'Medical Team Beta'
      },
      {
        id: '3',
        type: 'fire',
        patientName: 'N/A',
        location: 'Kitchen Area',
        timestamp: '1:15 PM',
        severity: 'medium',
        status: 'resolved',
        responseTime: 120,
        description: 'Smoke alarm triggered, minor kitchen incident',
        assignedTeam: 'Security Team'
      },
      {
        id: '4',
        type: 'medical',
        patientName: 'Sarah Davis',
        location: 'Room 205',
        timestamp: '12:30 PM',
        severity: 'low',
        status: 'false-alarm',
        responseTime: 180,
        description: 'Medical alert button pressed accidentally'
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadTeamData = () => {
    const mockTeams: ResponseTeam[] = [
      {
        id: '1',
        name: 'Medical Team Alpha',
        type: 'medical',
        members: 4,
        status: 'responding',
        location: 'Floor 1, Central',
        averageResponseTime: 45,
        activeAlerts: 1
      },
      {
        id: '2',
        name: 'Medical Team Beta',
        type: 'medical',
        members: 3,
        status: 'responding',
        location: 'Floor 2, East Wing',
        averageResponseTime: 52,
        activeAlerts: 1
      },
      {
        id: '3',
        name: 'Security Team',
        type: 'security',
        members: 2,
        status: 'available',
        location: 'Main Entrance',
        averageResponseTime: 38,
        activeAlerts: 0
      },
      {
        id: '4',
        name: 'Maintenance Team',
        type: 'maintenance',
        members: 3,
        status: 'available',
        location: 'Basement',
        averageResponseTime: 65,
        activeAlerts: 0
      }
    ];
    setTeams(mockTeams);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    console.log('Updating emergency response data...');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAlertData();
    loadTeamData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleAlertPress = (alert: EmergencyAlert) => {
    Alert.alert(
      `${alert.type.toUpperCase()} Emergency`,
      `Patient: ${alert.patientName}\nLocation: ${alert.location}\nTime: ${alert.timestamp}\nSeverity: ${alert.severity}\nStatus: ${alert.status}\n\nDescription: ${alert.description}`,
      [
        { text: 'Dispatch Team', onPress: () => console.log('Dispatch team') },
        { text: 'Call 911', onPress: () => console.log('Call 911') },
        { text: 'Update Status', onPress: () => console.log('Update status') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeResponse = () => {
    Alert.alert(
      'AI Response Optimization',
      'AI suggests the following optimizations:\n\n• Relocate Medical Team Beta to Floor 1 for better coverage\n• Add additional security patrol during evening hours\n• Implement predictive alerts for high-risk patients\n\nEstimated response time improvement: 18%',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderAlerts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency Alerts ({alerts.length})</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeResponse}>
          <Zap size={16} color="#ffffff" />
          <Text style={styles.optimizeButtonText}>AI Optimize</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.alertsContainer}>
        {alerts.map((alert) => (
          <AlertCard 
            key={alert.id} 
            alert={alert} 
            onPress={() => handleAlertPress(alert)}
          />
        ))}
      </View>
    </View>
  );

  const renderTeams = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Response Teams ({teams.length})</Text>
      <View style={styles.teamsContainer}>
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Emergency Response Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <AlertTriangle size={24} color="#ef4444" />
          <Text style={styles.analyticsValue}>2</Text>
          <Text style={styles.analyticsLabel}>Active Alerts</Text>
          <Text style={styles.analyticsChange}>-1 from yesterday</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Clock size={24} color="#10b981" />
          <Text style={styles.analyticsValue}>48s</Text>
          <Text style={styles.analyticsLabel}>Avg Response</Text>
          <Text style={styles.analyticsChange}>-12s improvement</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Users size={24} color="#3b82f6" />
          <Text style={styles.analyticsValue}>4</Text>
          <Text style={styles.analyticsLabel}>Teams Available</Text>
          <Text style={styles.analyticsChange}>100% coverage</Text>
        </View>
        <View style={styles.analyticsCard}>
          <CheckCircle size={24} color="#8b5cf6" />
          <Text style={styles.analyticsValue}>98%</Text>
          <Text style={styles.analyticsLabel}>Success Rate</Text>
          <Text style={styles.analyticsChange}>+2% this month</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Emergency Response Automation',
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
            <Text style={styles.headerTitle}>Emergency Response</Text>
            <Text style={styles.headerSubtitle}>Rapid incident detection and response</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Phone size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>48s Response</Text>
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
          style={[styles.tab, selectedView === 'alerts' && styles.activeTab]}
          onPress={() => setSelectedView('alerts')}
        >
          <AlertTriangle size={20} color={selectedView === 'alerts' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'alerts' && styles.activeTabText]}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'teams' && styles.activeTab]}
          onPress={() => setSelectedView('teams')}
        >
          <Users size={20} color={selectedView === 'teams' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'teams' && styles.activeTabText]}>Teams</Text>
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
        {selectedView === 'alerts' && renderAlerts()}
        {selectedView === 'teams' && renderTeams()}
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
  alertsContainer: {
    gap: 12,
  },
  alertCard: {
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
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alertStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertInfo: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  responseTime: {
    marginBottom: 8,
  },
  responseText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  assignedTeam: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  teamText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  teamsContainer: {
    gap: 12,
  },
  teamCard: {
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
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  teamLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  teamMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamMetric: {
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