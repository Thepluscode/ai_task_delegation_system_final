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
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  File,
  Clock,
  Cpu,
  Zap,
  AlertCircle,
  BarChart,
  Settings,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Database,
  List,
  Key,
  ShieldAlert
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

import {
  iotService,
  DeviceStatus,
  SecurityThreatLevel,
  IoTDevice,
  EdgeNode,
  SecurityMetrics
} from '../services/api/iotService';
import { useAuth } from '../services/context/AuthContext';

const { width } = Dimensions.get('window');

export default function IoTPlatformScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('security-overview');
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [edgeNodes, setEdgeNodes] = useState<EdgeNode[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    threatLevel: SecurityThreatLevel.LOW,
    blockedAttacks24h: 0,
    complianceScore: 0,
    vulnerabilityScore: 0,
    devicesQuarantined: 0,
    securityEvents: 0,
    encryptedConnections: 0,
    failedLogins: 0
  });

  // Load data from the IoT service
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from the IoT service
      const [metricsData, devicesData, edgeNodesData] = await Promise.all([
        iotService.getSecurityMetrics(),
        iotService.getDevices(),
        iotService.getEdgeNodes()
      ]);

      // Update state with the data
      setSecurityMetrics(metricsData);
      setDevices(devicesData);
      setEdgeNodes(edgeNodesData);
    } catch (err) {
      console.error("Error loading IoT data:", err);
      setError("Failed to load IoT platform data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Update the data in real-time
  const updateRealTimeData = () => {
    // Update security metrics with small changes to simulate real-time data
    setSecurityMetrics((prev: SecurityMetrics) => ({
      ...prev,
      blockedAttacks24h: prev.blockedAttacks24h + Math.floor(Math.random() * 3),
      securityEvents: prev.securityEvents + Math.floor(Math.random() * 5),
      encryptedConnections: prev.encryptedConnections + Math.floor(Math.random() * 10),
      failedLogins: prev.failedLogins + Math.floor(Math.random() * 2),
      complianceScore: Math.max(95, Math.min(100, prev.complianceScore + (Math.random() - 0.5) * 0.5)),
      vulnerabilityScore: Math.max(90, Math.min(100, prev.vulnerabilityScore + (Math.random() - 0.5) * 0.3))
    }));
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

  const handleQuarantineDevice = async (deviceId: string) => {
    try {
      await iotService.quarantineDevice(deviceId);
      Alert.alert(
        "Device Quarantined",
        "Device has been successfully isolated and quarantined.",
        [{ text: "OK", onPress: loadData }]
      );
    } catch (error) {
      console.error("Error quarantining device:", error);
      Alert.alert(
        "Quarantine Failed",
        "Failed to quarantine device. Please try again."
      );
    }
  };

  const handleUpdateFirmware = async (deviceId: string) => {
    try {
      // In a real implementation, we would prompt for the version
      await iotService.updateDeviceFirmware(deviceId, "latest");
      Alert.alert(
        "Firmware Update",
        "Firmware update has been scheduled for the device.",
        [{ text: "OK", onPress: loadData }]
      );
    } catch (error) {
      console.error("Error updating firmware:", error);
      Alert.alert(
        "Update Failed",
        "Failed to schedule firmware update. Please try again."
      );
    }
  };

  const handleRunSecurityScan = async (deviceId: string) => {
    try {
      await iotService.runVulnerabilityScan(deviceId);
      Alert.alert(
        "Security Scan",
        "Vulnerability scan has been initiated.",
        [{ text: "OK", onPress: loadData }]
      );
    } catch (error) {
      console.error("Error running security scan:", error);
      Alert.alert(
        "Scan Failed",
        "Failed to initiate vulnerability scan. Please try again."
      );
    }
  };

  const handleDevicePress = (device: IoTDevice) => {
    Alert.alert(
      `Device: ${device.name}`,
      `ID: ${device.device_id}\nType: ${device.type}\nStatus: ${device.status}\nLocation: ${device.location}\nFirmware: ${device.firmware_version}\nSecurity Score: ${device.security_score}`,
      [
        { text: "Quarantine", onPress: () => handleQuarantineDevice(device.device_id) },
        { text: "Update Firmware", onPress: () => handleUpdateFirmware(device.device_id) },
        { text: "Security Scan", onPress: () => handleRunSecurityScan(device.device_id) },
        { text: "Close", style: "cancel" }
      ]
    );
  };

  const renderSecurityOverview = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderLeftColor: '#10b981' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#10b98120' }]}>
                <Shield size={20} color="#10b981" />
              </View>
              <Text style={styles.metricValue}>{securityMetrics.threatLevel}</Text>
            </View>
            <Text style={styles.metricTitle}>Threat Level</Text>
            <Text style={styles.metricSubtitle}>All systems secure</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#f59e0b' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#f59e0b20' }]}>
                <Shield size={20} color="#f59e0b" />
              </View>
              <Text style={styles.metricValue}>{securityMetrics.blockedAttacks24h}</Text>
            </View>
            <Text style={styles.metricTitle}>Blocked Attacks</Text>
            <Text style={styles.metricSubtitle}>Last 24 hours</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#3b82f6' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#3b82f620' }]}>
                <File size={20} color="#3b82f6" />
              </View>
              <Text style={styles.metricValue}>{securityMetrics.complianceScore.toFixed(1)}%</Text>
            </View>
            <Text style={styles.metricTitle}>Compliance Score</Text>
            <Text style={styles.metricSubtitle}>Multi-framework certified</Text>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#8b5cf6' }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#8b5cf620' }]}>
                <AlertCircle size={20} color="#8b5cf6" />
              </View>
              <Text style={styles.metricValue}>{securityMetrics.securityEvents}</Text>
            </View>
            <Text style={styles.metricTitle}>Security Events</Text>
            <Text style={styles.metricSubtitle}>Real-time monitoring</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Architecture</Text>
        <View style={styles.architectureContainer}>
          <View style={styles.architectureCard}>
            <Text style={styles.architectureTitle}>Authentication & Authorization</Text>
            <View style={styles.architectureList}>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>JWT-based authentication</Text>
              </View>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Role-based access control</Text>
              </View>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Security clearance levels</Text>
              </View>
            </View>
          </View>

          <View style={styles.architectureCard}>
            <Text style={styles.architectureTitle}>Data Protection</Text>
            <View style={styles.architectureList}>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>End-to-end encryption</Text>
              </View>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Device ID hashing</Text>
              </View>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Secure transmission</Text>
              </View>
            </View>
          </View>

          <View style={styles.architectureCard}>
            <Text style={styles.architectureTitle}>Compliance & Audit</Text>
            <View style={styles.architectureList}>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Audit logging</Text>
              </View>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Compliance tracking</Text>
              </View>
              <View style={styles.architectureItem}>
                <View style={styles.bulletPoint}></View>
                <Text style={styles.architectureText}>Regulatory reporting</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );

  const renderDeviceManagement = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>IoT Devices ({devices.length})</Text>
      <View style={styles.devicesContainer}>
        {devices.map((device, index) => (
          <TouchableOpacity 
            key={device.device_id || index}
            style={styles.deviceCard}
            onPress={() => handleDevicePress(device)}
          >
            <View style={styles.deviceHeader}>
              <View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceType}>{device.type}</Text>
              </View>
              {device.status === DeviceStatus.QUARANTINED ? (
                <View style={styles.quarantineBadge}>
                  <ShieldAlert size={16} color="#ffffff" />
                </View>
              ) : device.status === DeviceStatus.MAINTENANCE ? (
                <View style={[styles.statusBadge, { backgroundColor: '#f59e0b' }]}>
                  <Settings size={16} color="#ffffff" />
                </View>
              ) : device.status === DeviceStatus.ONLINE ? (
                <View style={[styles.statusBadge, { backgroundColor: '#10b981' }]}>
                  <CheckCircle size={16} color="#ffffff" />
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: '#6b7280' }]}>
                  <XCircle size={16} color="#ffffff" />
                </View>
              )}
            </View>
            
            <View style={styles.deviceDetails}>
              <View style={styles.deviceDetail}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{device.location}</Text>
              </View>
              <View style={styles.deviceDetail}>
                <Text style={styles.detailLabel}>Firmware</Text>
                <Text style={styles.detailValue}>{device.firmware_version}</Text>
              </View>
              <View style={styles.deviceDetail}>
                <Text style={styles.detailLabel}>Security</Text>
                <View style={styles.securityScoreContainer}>
                  <View 
                    style={[
                      styles.securityScoreBar,
                      { width: `${device.security_score}%` }
                    ]}
                  ></View>
                </View>
                <Text style={styles.securityScore}>{device.security_score}%</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEdgeComputing = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Edge Computing Nodes ({edgeNodes.length})</Text>
      <View style={styles.edgeNodesContainer}>
        {edgeNodes.map((node, index) => (
          <View key={node.node_id || index} style={styles.edgeNodeCard}>
            <View style={styles.edgeNodeHeader}>
              <Text style={styles.edgeNodeName}>{node.name}</Text>
              {node.status === 'active' ? (
                <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              ) : (
                <View style={[styles.statusIndicator, { backgroundColor: '#6b7280' }]}>
                  <Text style={styles.statusText}>Inactive</Text>
                </View>
              )}
            </View>
            
            <View style={styles.edgeNodeDetails}>
              <View style={styles.edgeNodeDetail}>
                <View style={styles.detailWithIcon}>
                  <Cpu size={16} color="#6b7280" />
                  <Text style={styles.edgeNodeDetailValue}>{node.processing_capacity}%</Text>
                </View>
                <Text style={styles.edgeNodeDetailLabel}>Processing</Text>
              </View>
              <View style={styles.edgeNodeDetail}>
                <View style={styles.detailWithIcon}>
                  <Zap size={16} color="#6b7280" />
                  <Text style={styles.edgeNodeDetailValue}>{node.latency}ms</Text>
                </View>
                <Text style={styles.edgeNodeDetailLabel}>Latency</Text>
              </View>
              <View style={styles.edgeNodeDetail}>
                <View style={styles.detailWithIcon}>
                  <Users size={16} color="#6b7280" />
                  <Text style={styles.edgeNodeDetailValue}>{node.connected_devices}</Text>
                </View>
                <Text style={styles.edgeNodeDetailLabel}>Devices</Text>
              </View>
            </View>

            <View style={styles.edgeNodeStorage}>
              <Text style={styles.storageLabel}>Storage Usage</Text>
              <View style={styles.storageBar}>
                <View 
                  style={[
                    styles.storageFill,
                    { width: `${(node.storage_used / node.storage_total) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.storageText}>
                {node.storage_used}MB / {node.storage_total}MB
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Show loading state
  if (loading && !refreshing && devices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'IoT Platform',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading IoT Platform data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing && devices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'IoT Platform',
            headerShown: true,
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
          title: 'IoT Platform',
          headerShown: true,
        }}
      />
      
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Secure IoT Platform</Text>
            <Text style={styles.headerSubtitle}>Enterprise-grade security & management</Text>
          </View>
          <View style={styles.threatContainer}>
            <Shield size={16} color="#ffffff" />
            <Text style={styles.threatText}>
              {securityMetrics.threatLevel} THREAT
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'security-overview' && styles.activeTab]}
          onPress={() => setActiveTab('security-overview')}
        >
          <Shield size={18} color={activeTab === 'security-overview' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'security-overview' && styles.activeTabText]}>
            Security
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'devices' && styles.activeTab]}
          onPress={() => setActiveTab('devices')}
        >
          <Cpu size={18} color={activeTab === 'devices' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'devices' && styles.activeTabText]}>
            Devices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'edge-computing' && styles.activeTab]}
          onPress={() => setActiveTab('edge-computing')}
        >
          <Database size={18} color={activeTab === 'edge-computing' ? '#3b82f6' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'edge-computing' && styles.activeTabText]}>
            Edge
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'security-overview' && renderSecurityOverview()}
        {activeTab === 'devices' && renderDeviceManagement()}
        {activeTab === 'edge-computing' && renderEdgeComputing()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  threatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  threatText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
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
    elevation: 3,
    marginBottom: 4,
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
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  architectureContainer: {
    gap: 12,
  },
  architectureCard: {
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
    elevation: 3,
  },
  architectureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  architectureList: {
    gap: 8,
  },
  architectureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
  },
  architectureText: {
    fontSize: 14,
    color: '#4b5563',
  },
  devicesContainer: {
    gap: 12,
  },
  deviceCard: {
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
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  deviceType: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quarantineBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceDetails: {
    gap: 12,
  },
  deviceDetail: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  securityScoreContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  securityScoreBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  securityScore: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  edgeNodesContainer: {
    gap: 12,
  },
  edgeNodeCard: {
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
    elevation: 3,
  },
  edgeNodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  edgeNodeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  edgeNodeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  edgeNodeDetail: {
    alignItems: 'center',
    flex: 1,
  },
  detailWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  edgeNodeDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  edgeNodeDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  edgeNodeStorage: {
    gap: 4,
  },
  storageLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  storageBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  storageText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#3b82f6',
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
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});