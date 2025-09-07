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
  Shield,
  Users,
  Clock,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface FallAlert {
  id: string;
  patientName: string;
  location: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'false-positive';
  responseTime?: number;
  assignedStaff?: string;
  notes?: string;
}

interface MonitoringZone {
  id: string;
  name: string;
  location: string;
  patientsMonitored: number;
  camerasActive: number;
  totalCameras: number;
  alertsToday: number;
  status: 'active' | 'maintenance' | 'offline';
  accuracy: number;
}

interface FallMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const AlertCard: React.FC<{ alert: FallAlert; onPress: () => void }> = ({ alert, onPress }) => {
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
      case 'acknowledged': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'false-positive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (alert.status) {
      case 'active': return <AlertTriangle size={16} color={getStatusColor()} />;
      case 'acknowledged': return <Eye size={16} color={getStatusColor()} />;
      case 'resolved': return <CheckCircle size={16} color={getStatusColor()} />;
      case 'false-positive': return <XCircle size={16} color={getStatusColor()} />;
      default: return <AlertTriangle size={16} color={getStatusColor()} />;
    }
  };

  return (
    <TouchableOpacity style={[styles.alertCard, { borderLeftColor: getSeverityColor() }]} onPress={onPress}>
      <View style={styles.alertHeader}>
        <View style={styles.alertInfo}>
          <Text style={styles.patientName}>{alert.patientName}</Text>
          <Text style={styles.alertLocation}>{alert.location}</Text>
        </View>
        <View style={styles.alertStatus}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {alert.status.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.alertDetails}>
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
          <Text style={styles.responseText}>Response: {alert.responseTime}s</Text>
        </View>
      )}
      
      {alert.assignedStaff && (
        <View style={styles.assignedStaff}>
          <Users size={14} color="#10b981" />
          <Text style={styles.staffText}>Assigned to {alert.assignedStaff}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ZoneCard: React.FC<{ zone: MonitoringZone }> = ({ zone }) => {
  const getStatusColor = () => {
    switch (zone.status) {
      case 'active': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const cameraPercentage = (zone.camerasActive / zone.totalCameras) * 100;

  return (
    <View style={styles.zoneCard}>
      <View style={styles.zoneHeader}>
        <View style={styles.zoneInfo}>
          <Text style={styles.zoneName}>{zone.name}</Text>
          <Text style={styles.zoneLocation}>{zone.location}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.zoneMetrics}>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.patientsMonitored}</Text>
          <Text style={styles.metricLabel}>Patients</Text>
        </View>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.camerasActive}/{zone.totalCameras}</Text>
          <Text style={styles.metricLabel}>Cameras</Text>
        </View>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.alertsToday}</Text>
          <Text style={styles.metricLabel}>Alerts Today</Text>
        </View>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.accuracy}%</Text>
          <Text style={styles.metricLabel}>Accuracy</Text>
        </View>
      </View>
      
      <View style={styles.cameraStatus}>
        <View style={styles.cameraBar}>
          <View style={styles.cameraTrack}>
            <View 
              style={[
                styles.cameraFill, 
                { 
                  width: `${Math.min(cameraPercentage, 100)}%`,
                  backgroundColor: getStatusColor()
                }
              ]} 
            />
          </View>
          <Text style={styles.cameraText}>{Math.round(cameraPercentage)}% Cameras Active</Text>
        </View>
      </View>
    </View>
  );
};

export default function FallDetectionScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'alerts' | 'zones' | 'analytics'>('alerts');
  const [alerts, setAlerts] = useState<FallAlert[]>([]);
  const [zones, setZones] = useState<MonitoringZone[]>([]);
  const [metrics, setMetrics] = useState<FallMetric[]>([]);

  useEffect(() => {
    loadAlertData();
    loadZoneData();
    loadMetrics();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAlertData = () => {
    const mockAlerts: FallAlert[] = [
      {
        id: '1',
        patientName: 'Mrs. Johnson',
        location: 'Room 101A',
        timestamp: '2:45 PM',
        severity: 'high',
        status: 'active',
        assignedStaff: 'Nurse Williams'
      },
      {
        id: '2',
        patientName: 'Mr. Smith',
        location: 'Bathroom 2B',
        timestamp: '1:30 PM',
        severity: 'critical',
        status: 'acknowledged',
        responseTime: 45,
        assignedStaff: 'Dr. Brown'
      },
      {
        id: '3',
        patientName: 'Sarah Davis',
        location: 'Hallway C',
        timestamp: '12:15 PM',
        severity: 'medium',
        status: 'resolved',
        responseTime: 120,
        assignedStaff: 'Nurse Garcia'
      },
      {
        id: '4',
        patientName: 'Robert Wilson',
        location: 'Room 205',
        timestamp: '11:20 AM',
        severity: 'low',
        status: 'false-positive',
        responseTime: 180,
        notes: 'Patient was getting up from bed normally'
      }
    ];
    setAlerts(mockAlerts);
  };

  const loadZoneData = () => {
    const mockZones: MonitoringZone[] = [
      {
        id: '1',
        name: 'Ward A',
        location: 'Floor 1, East Wing',
        patientsMonitored: 24,
        camerasActive: 8,
        totalCameras: 10,
        alertsToday: 3,
        status: 'active',
        accuracy: 94
      },
      {
        id: '2',
        name: 'Ward B',
        location: 'Floor 2, West Wing',
        patientsMonitored: 18,
        camerasActive: 6,
        totalCameras: 8,
        alertsToday: 1,
        status: 'active',
        accuracy: 96
      },
      {
        id: '3',
        name: 'ICU',
        location: 'Floor 3, Central',
        patientsMonitored: 12,
        camerasActive: 11,
        totalCameras: 12,
        alertsToday: 0,
        status: 'active',
        accuracy: 98
      },
      {
        id: '4',
        name: 'Rehabilitation',
        location: 'Floor 1, West Wing',
        patientsMonitored: 15,
        camerasActive: 4,
        totalCameras: 6,
        alertsToday: 2,
        status: 'maintenance',
        accuracy: 91
      }
    ];
    setZones(mockZones);
  };

  const loadMetrics = () => {
    const mockMetrics: FallMetric[] = [
      {
        title: 'Active Alerts',
        value: '2',
        change: '-3 from yesterday',
        isPositive: true,
        icon: <AlertTriangle size={20} color="#ef4444" />,
        color: '#ef4444'
      },
      {
        title: 'Response Time',
        value: '1.2min',
        change: '-15s improvement',
        isPositive: true,
        icon: <Clock size={20} color="#10b981" />,
        color: '#10b981'
      },
      {
        title: 'Detection Accuracy',
        value: '95.2%',
        change: '+2.1% this week',
        isPositive: true,
        icon: <Eye size={20} color="#3b82f6" />,
        color: '#3b82f6'
      },
      {
        title: 'False Positives',
        value: '4.8%',
        change: '-1.2% reduction',
        isPositive: true,
        icon: <XCircle size={20} color="#f59e0b" />,
        color: '#f59e0b'
      }
    ];
    setMetrics(mockMetrics);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    console.log('Updating fall detection data...');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAlertData();
    loadZoneData();
    loadMetrics();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleAlertPress = (alert: FallAlert) => {
    Alert.alert(
      `Fall Alert: ${alert.patientName}`,
      `Location: ${alert.location}\nTime: ${alert.timestamp}\nSeverity: ${alert.severity}\nStatus: ${alert.status}${alert.responseTime ? `\nResponse Time: ${alert.responseTime}s` : ''}`,
      [
        { text: 'Acknowledge', onPress: () => console.log('Acknowledge alert') },
        { text: 'Resolve', onPress: () => console.log('Resolve alert') },
        { text: 'False Positive', onPress: () => console.log('Mark false positive') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeSystem = () => {
    Alert.alert(
      'AI System Optimization',
      'AI suggests the following optimizations:\n\n• Adjust camera angles in Ward A for better coverage\n• Increase sensitivity in ICU monitoring\n• Schedule maintenance for Rehabilitation cameras\n\nEstimated accuracy improvement: 3.2%',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderAlerts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fall Alerts ({alerts.length})</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeSystem}>
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

  const renderZones = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Monitoring Zones ({zones.length})</Text>
      <View style={styles.zonesContainer}>
        {zones.map((zone) => (
          <ZoneCard key={zone.id} zone={zone} />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fall Detection Analytics</Text>
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View key={index} style={[styles.metricCard, { borderLeftColor: metric.color }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, { backgroundColor: metric.color + '20' }]}>
                {metric.icon}
              </View>
              <View style={styles.metricChange}>
                {metric.isPositive ? (
                  <TrendingUp size={16} color="#10b981" />
                ) : (
                  <TrendingDown size={16} color="#ef4444" />
                )}
              </View>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricTitle}>{metric.title}</Text>
            <Text style={[styles.changeText, { color: metric.isPositive ? '#10b981' : '#ef4444' }]}>
              {metric.change}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Fall Detection System',
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
            <Text style={styles.headerTitle}>Fall Detection System</Text>
            <Text style={styles.headerSubtitle}>AI-powered real-time safety monitoring</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Eye size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>95.2% Accuracy</Text>
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
          <Bell size={20} color={selectedView === 'alerts' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'alerts' && styles.activeTabText]}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'zones' && styles.activeTab]}
          onPress={() => setSelectedView('zones')}
        >
          <MapPin size={20} color={selectedView === 'zones' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'zones' && styles.activeTabText]}>Zones</Text>
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
        {selectedView === 'zones' && renderZones()}
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
  alertInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  alertLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
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
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 12,
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
  assignedStaff: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  staffText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  zonesContainer: {
    gap: 12,
  },
  zoneCard: {
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
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  zoneLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  zoneMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  zoneMetric: {
    alignItems: 'center',
  },
  zoneMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  cameraStatus: {
    gap: 8,
  },
  cameraBar: {
    gap: 8,
  },
  cameraTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cameraFill: {
    height: '100%',
    borderRadius: 3,
  },
  cameraText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});