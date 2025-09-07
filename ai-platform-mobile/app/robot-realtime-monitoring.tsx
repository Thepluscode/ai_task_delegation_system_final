/**
 * Real-Time Robot Monitoring Dashboard
 * 
 * A sophisticated real-time monitoring dashboard for enterprise robot fleets.
 * Features live telemetry streaming, anomaly detection, and interactive controls.
 * 
 * This premium feature is characteristic of billion-dollar enterprise applications,
 * providing critical operational visibility for large-scale deployments.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Animated,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import {
  Zap,
  AlertTriangle,
  ThermometerSnowflake,
  Battery,
  Cpu,
  Activity,
  RefreshCw,
  Wifi,
  BarChart2,
  Navigation,
  Settings,
  Power,
  PauseCircle,
  PlayCircle,
  Clipboard,
  Clock,
  Calendar,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '../services/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
// Import optional WebView and Haptics components
// If these modules are missing, the app will use fallbacks
let Haptics: any;
try {
  Haptics = require('expo-haptics');
} catch (error) {
  // Create mock Haptics API for when the dependency is not available
  Haptics = {
    notificationAsync: () => Promise.resolve(),
    impactAsync: () => Promise.resolve(),
    NotificationFeedbackType: {
      Error: 'error',
      Warning: 'warning'
    },
    ImpactFeedbackStyle: {
      Medium: 'medium'
    }
  };
  console.warn('expo-haptics is not installed. Haptic feedback will be disabled.');
}

// Import WebView dynamically to handle case when it's not installed
let WebView: any;
try {
  const WebViewModule = require('react-native-webview');
  WebView = WebViewModule.WebView;
} catch (error) {
  // Create a dummy WebView component when the dependency is not available
  WebView = () => null;
  console.warn('react-native-webview is not installed. WebView functionality will be disabled.');
}

// Import from design system
import colors from '../design-system/foundations/colors';
import motion from '../design-system/foundations/motion';
import Button from '../design-system/components/atoms/Button';

// Import services
import { robotService, RobotTelemetry, RobotCommand } from '../services/api/robotService';
import { NotificationService } from '../services/notification/NotificationService';
import { useWebSocket, SecurityClassification } from '../services/hooks/useWebSocket';

// Constants
const { width, height } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

// TelemetryDataPoint represents a single point of robot telemetry
interface TelemetryDataPoint {
  timestamp: number;
  temperature: number;
  cpu: number;
  memory: number;
  battery: number;
  network: number;
  latitude?: number;
  longitude?: number;
  status: 'normal' | 'warning' | 'critical';
  warnings: string[];
}

// RobotDetails represents a robot's core information
interface RobotDetails {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  firmware: string;
  status: 'Active' | 'Maintenance' | 'Offline' | 'Quarantined' | 'Compromised';
  lastConnected: string;
  domain: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  tasks: {
    current: number;
    pending: number;
    completed: number;
  };
  security: {
    encryptionEnabled: boolean;
    lastUpdated: string;
    securityPatches: number;
    vulnerabilities: number;
    securityClassification?: SecurityClassification;
    complianceStatus?: string[];
    securityScore?: number;
    lastSecurityScan?: string;
  };
}

// ControlCommand represents a command to send to a robot
interface ControlCommand {
  type: 'restart' | 'shutdown' | 'pause' | 'resume' | 'diagnostics' | 'quarantine' | 'security_scan';
  target: string; // robot ID
  parameters?: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'critical' | 'safety_critical';
  requester: string;
  timestamp: number;
  securityOverride?: boolean;
  requiredClearance?: SecurityClassification;
}

/**
 * RobotRealtimeMonitoring - Enterprise-grade real-time monitoring dashboard
 */
const RobotRealtimeMonitoring: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const notificationService = new NotificationService();
  
  // State management
  const [selectedRobot, setSelectedRobot] = useState<string | null>(null);
  const [robotDetails, setRobotDetails] = useState<RobotDetails | null>(null);
  const [telemetryData, setTelemetryData] = useState<TelemetryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showingControls, setShowingControls] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commandInProgress, setCommandInProgress] = useState(false);
  const [securityOverride, setSecurityOverride] = useState(false);
  const [alarmSilenced, setAlarmSilenced] = useState(false);
  const [commandConfirmation, setCommandConfirmation] = useState<ControlCommand | null>(null);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [refreshRate, setRefreshRate] = useState(1000); // ms
  const [robotList, setRobotList] = useState<{id: string, name: string, status: string}[]>([]);
  const [isTelemetryLive, setIsTelemetryLive] = useState(true);
  const [securityClassification, setSecurityClassification] = useState<SecurityClassification>(
    SecurityClassification.INTERNAL
  );
  const [complianceInfo, setComplianceInfo] = useState<Array<{
    standard: string;
    status: string;
    score: number;
  }>>([]);
  
  // Animation values
  const fadeAnim = motion.useFadeIn(500);
  const controlsAnimation = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  
  // WebSocket connection with security
  const {
    connect,
    disconnect,
    sendMessage,
    lastMessage,
    readyState,
    connectionStatus,
    securityClassification: wsSecurityLevel,
    setSecurityLevel
  } = useWebSocket('wss://api.automatedaiplatform.com/robots/telemetry', {
    reconnect: true,
    includeAuth: true,
    securityLevel: SecurityClassification.INTERNAL
  });
  
  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (isAuthenticated && selectedRobot) {
      connect();
      
      // Subscribe to specific robot telemetry
      sendMessage(JSON.stringify({
        type: 'subscribe',
        robotId: selectedRobot,
        refreshRate,
        authToken: user?.id, // Use user ID as token for now
        securityClassification: securityClassification // Add security classification
      }));
    }
    
    return () => {
      // Unsubscribe and disconnect when component unmounts
      if (selectedRobot) {
        sendMessage(JSON.stringify({
          type: 'unsubscribe',
          robotId: selectedRobot,
        }));
      }
      disconnect();
    };
  }, [isAuthenticated, selectedRobot, refreshRate]);
  
  // Process incoming WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        
        if (data.type === 'telemetry') {
          // Process telemetry data
          const newDataPoint: TelemetryDataPoint = data.payload;
          
          // Add to telemetry data (keeping last 100 points)
          setTelemetryData(prev => {
            const newData = [...prev, newDataPoint];
            // Keep only the last 100 data points
            return newData.slice(-100);
          });
          
          // Check for critical warnings
          if (newDataPoint.status === 'critical' && !alarmSilenced) {
            // Trigger haptic feedback for critical alerts
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            
            // Show alert for critical issues
            notificationService.showAlert({
              title: 'Critical Alert',
              message: `Robot ${robotDetails?.name}: ${newDataPoint.warnings.join(', ')}`,
              type: 'danger',
            });
          } else if (newDataPoint.status === 'warning' && !alarmSilenced) {
            // Trigger haptic feedback for warnings
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } else if (data.type === 'commandResponse') {
          // Process command response
          setCommandInProgress(false);
          
          if (data.success) {
            notificationService.showAlert({
              title: 'Command Successful',
              message: data.message,
              type: 'success',
            });
          } else {
            notificationService.showAlert({
              title: 'Command Failed',
              message: data.error,
              type: 'danger',
            });
          }
        } else if (data.type === 'robotStatus') {
          // Update robot details
          setRobotDetails(prevDetails => ({
            ...prevDetails!,
            status: data.payload.status,
            lastConnected: data.payload.lastConnected,
          }));
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    }
  }, [lastMessage, alarmSilenced]);
  
  // Load compliance reports
  useEffect(() => {
    const loadComplianceData = async () => {
      try {
        const reports = await robotService.getComplianceReports();
        setComplianceInfo(reports.map(r => ({
          standard: r.standard,
          status: r.status,
          score: r.score
        })));
      } catch (err) {
        console.error('Failed to load compliance reports:', err);
      }
    };
    
    if (isAuthenticated) {
      loadComplianceData();
    }
  }, [isAuthenticated]);

  // Load robot list with security information
  useEffect(() => {
    const loadRobots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For demo, use mock data
        // const robots = await robotService.getRobots();
        const robots = [
          { id: '1', name: 'Manufacturing Bot 1', status: 'Active' },
          { id: '2', name: 'Healthcare Assistant', status: 'Active' },
          { id: '3', name: 'Logistics Manager', status: 'Active' },
          { id: '4', name: 'Retail Bot', status: 'Maintenance' },
          { id: '5', name: 'Education Tutor', status: 'Active' },
        ];
        
        setRobotList(robots);
        
        // Select the first robot by default
        if (robots.length > 0 && !selectedRobot) {
          setSelectedRobot(robots[0].id);
          loadRobotDetails(robots[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load robot list');
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadRobots();
    }
  }, [isAuthenticated]);
  
  // Load robot details
  const loadRobotDetails = async (robotId: string) => {
    try {
      setLoading(true);
      
      // For demo, use mock data
      // const details = await robotService.getRobotById(robotId);
      const details: RobotDetails = {
        id: robotId,
        name: robotList.find(r => r.id === robotId)?.name || 'Unknown Robot',
        model: 'AutomatedAI-R2000',
        serialNumber: `SN-${Math.floor(10000 + Math.random() * 90000)}`,
        firmware: 'v4.2.5',
        status: 'Active',
        lastConnected: new Date().toISOString(),
        domain: 'Manufacturing',
        location: 'Factory Floor, Zone B',
        ipAddress: '192.168.1.123',
        macAddress: '00:1B:44:11:3A:B7',
        tasks: {
          current: 2,
          pending: 5,
          completed: 1247
        },
        security: {
          encryptionEnabled: true,
          lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          securityPatches: 3,
          vulnerabilities: 0,
          securityClassification: SecurityClassification.CONFIDENTIAL,
          complianceStatus: ['ISO27001', 'IEC62443'],
          securityScore: 0.94,
          lastSecurityScan: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      };
      
      setRobotDetails(details);
      
      // Generate some initial telemetry data for visualization
      const initialData: TelemetryDataPoint[] = Array.from({ length: 20 }).map((_, i) => ({
        timestamp: Date.now() - (19 - i) * 5000,
        temperature: 45 + Math.random() * 10,
        cpu: 30 + Math.random() * 40,
        memory: 40 + Math.random() * 30,
        battery: 75 - Math.random() * 15,
        network: 90 - Math.random() * 20,
        status: Math.random() > 0.9 ? 'warning' : 'normal',
        warnings: Math.random() > 0.9 ? ['High CPU usage detected'] : [],
      }));
      
      setTelemetryData(initialData);
      
      setLoading(false);
    } catch (err) {
      setError(`Failed to load details for robot ${robotId}`);
      setLoading(false);
    }
  };
  
  // Toggle controls panel
  const toggleControls = () => {
    if (showingControls) {
      // Hide controls
      Animated.timing(controlsAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      setShowingControls(false);
    } else {
      // Show controls
      Animated.timing(controlsAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      setShowingControls(true);
    }
  };
  
  // Set security classification level
  const changeSecurityLevel = (level: SecurityClassification) => {
    setSecurityClassification(level);
    setSecurityLevel(level);
    
    // Also update WebSocket subscription
    sendMessage(JSON.stringify({
      type: 'updateSubscription',
      robotId: selectedRobot,
      refreshRate,
      securityClassification: level
    }));
  };

  // Handle control commands with security
  const sendCommand = async (type: ControlCommand['type']) => {
    // If critical commands require confirmation or security clearance
    if (['restart', 'shutdown', 'quarantine', 'security_scan'].includes(type) && !securityOverride) {
      const command: ControlCommand = {
        type,
        target: selectedRobot!,
        priority: 'high',
        requester: user?.id || 'unknown',
        timestamp: Date.now(),
        requiredClearance: type === 'quarantine' || type === 'security_scan'
          ? SecurityClassification.CONFIDENTIAL
          : SecurityClassification.INTERNAL,
      };
      
      setCommandConfirmation(command);
      return;
    }
    
    setCommandInProgress(true);
    
    const command: ControlCommand = {
      type,
      target: selectedRobot!,
      priority: 'normal',
      requester: user?.id || 'unknown',
      timestamp: Date.now(),
      securityOverride: securityOverride,
    };
    
    try {
      // Send command over WebSocket
      sendMessage(JSON.stringify({
        type: 'command',
        payload: command
      }));
      
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // In a real implementation, we would wait for the response
      // For demo, simulate success after a delay
      setTimeout(() => {
        setCommandInProgress(false);
        
        // Update robot status based on command
        if (type === 'shutdown') {
          setRobotDetails(prev => prev ? { ...prev, status: 'Offline' } : null);
        } else if (type === 'restart') {
          setRobotDetails(prev => prev ? { ...prev, status: 'Maintenance' } : null);
          
          // After restart, set to active
          setTimeout(() => {
            setRobotDetails(prev => prev ? { ...prev, status: 'Active' } : null);
          }, 5000);
        }
      }, 2000);
    } catch (err) {
      console.error('Error sending command:', err);
      setCommandInProgress(false);
    }
  };
  
  // Confirm command execution with security check
  const confirmCommand = () => {
    if (!commandConfirmation) return;
    
    setCommandInProgress(true);
    setCommandConfirmation(null);
    
    // Send the command
    sendMessage(JSON.stringify({
      type: 'command',
      payload: commandConfirmation
    }));
    
    // Simulate response for demo
    setTimeout(() => {
      setCommandInProgress(false);
      
      // Update robot status based on command
      if (commandConfirmation.type === 'shutdown') {
        setRobotDetails(prev => prev ? { ...prev, status: 'Offline' } : null);
      } else if (commandConfirmation.type === 'restart') {
        setRobotDetails(prev => prev ? { ...prev, status: 'Maintenance' } : null);
        
        // After restart, set to active
        setTimeout(() => {
          setRobotDetails(prev => prev ? { ...prev, status: 'Active' } : null);
        }, 5000);
      }
    }, 2000);
  };
  
  // Cancel command execution
  const cancelCommand = () => {
    setCommandConfirmation(null);
  };
  
  // Calculate security classification color
  const getSecurityClassColor = (classification: SecurityClassification, opacity: number = 1) => {
    switch (classification) {
      case SecurityClassification.PUBLIC:
        return colors.colorUtils.withOpacity(colors.palette.success[500], opacity);
      case SecurityClassification.INTERNAL:
        return colors.colorUtils.withOpacity(colors.palette.primary[500], opacity);
      case SecurityClassification.CONFIDENTIAL:
        return colors.colorUtils.withOpacity(colors.palette.warning[500], opacity);
      case SecurityClassification.RESTRICTED:
        return colors.colorUtils.withOpacity(colors.palette.error[600], opacity);
      case SecurityClassification.TOP_SECRET:
        return colors.colorUtils.withOpacity(colors.palette.error[800], opacity);
      default:
        return colors.colorUtils.withOpacity(colors.palette.neutral[500], opacity);
    }
  };

  // Calculate security score color
  const getSecurityScoreColor = (score: number) => {
    if (score >= 0.9) {
      return colors.palette.success[500];
    } else if (score >= 0.7) {
      return colors.palette.success[600];
    } else if (score >= 0.5) {
      return colors.palette.warning[500];
    } else if (score >= 0.3) {
      return colors.palette.warning[600];
    } else {
      return colors.palette.error[500];
    }
  };

  // Toggle diagnostic mode
  const toggleDiagnosticMode = () => {
    setDiagnosticMode(!diagnosticMode);
    
    // If entering diagnostic mode, send diagnostic command
    if (!diagnosticMode) {
      sendCommand('diagnostics');
    }
  };
  
  // Change telemetry refresh rate
  const changeRefreshRate = (rate: number) => {
    setRefreshRate(rate);
    
    // Update subscription
    sendMessage(JSON.stringify({
      type: 'updateSubscription',
      robotId: selectedRobot,
      refreshRate: rate,
    }));
  };
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Reload robot details
    if (selectedRobot) {
      loadRobotDetails(selectedRobot);
    }
    
    setRefreshing(false);
  }, [selectedRobot]);
  
  // Calculate status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return colors.palette.success[500];
      case 'Maintenance':
        return colors.palette.warning[500];
      case 'Offline':
        return colors.palette.error[500];
      default:
        return colors.palette.neutral[500];
    }
  };
  
  // Calculate telemetry status color
  const getTelemetryStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return colors.palette.success[500];
      case 'warning':
        return colors.palette.warning[500];
      case 'critical':
        return colors.palette.error[500];
    }
  };
  
  // Get the latest telemetry data point
  const getLatestTelemetry = () => {
    if (telemetryData.length === 0) {
      return null;
    }
    
    return telemetryData[telemetryData.length - 1];
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Real-time Monitoring',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.palette.primary[500]} />
          <Text style={styles.loadingText}>Connecting to robot telemetry...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Real-time Monitoring',
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={colors.palette.error[500]} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            variant="primary"
            onPress={() => selectedRobot ? loadRobotDetails(selectedRobot) : null}
            style={{ marginTop: 20 }}
          >
            Retry Connection
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render confirmation dialog
  if (commandConfirmation) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Confirm Command',
            headerShown: true,
          }}
        />
        <View style={styles.confirmationContainer}>
          <AlertTriangle size={48} color={colors.palette.warning[500]} />
          <Text style={styles.confirmationTitle}>Confirm {commandConfirmation.type.toUpperCase()}</Text>
          <Text style={styles.confirmationMessage}>
            Are you sure you want to {commandConfirmation.type} robot {robotDetails?.name}?
            This action may interrupt current operations.
          </Text>
          
          <View style={styles.confirmationActions}>
            <Button
              variant="ghost"
              onPress={cancelCommand}
              style={{ marginRight: 10 }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onPress={confirmCommand}
            >
              Confirm {commandConfirmation.type}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get latest telemetry
  const latestTelemetry = getLatestTelemetry();
  
  // Render the monitoring dashboard
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Real-time Monitoring',
          headerShown: true,
        }}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.palette.primary[500]]}
            tintColor={colors.palette.primary[500]}
          />
        }
      >
        {/* Robot Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Robot</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.robotSelector}
          >
            {robotList.map((robot) => (
              <TouchableOpacity
                key={robot.id}
                style={[
                  styles.robotSelectorItem,
                  selectedRobot === robot.id && styles.robotSelectorItemSelected
                ]}
                onPress={() => {
                  setSelectedRobot(robot.id);
                  loadRobotDetails(robot.id);
                }}
              >
                <View style={[
                  styles.statusIndicator, 
                  { backgroundColor: getStatusColor(robot.status) }
                ]} />
                <Text style={[
                  styles.robotSelectorName,
                  selectedRobot === robot.id && styles.robotSelectorNameSelected
                ]}>
                  {robot.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Robot Info Card */}
        {robotDetails && (
          <Animated.View style={[
            styles.robotCard, 
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }, { scale: cardScale }] }
          ]}>
            <LinearGradient
              colors={[colors.palette.primary[500], colors.palette.primary[700]]}
              style={styles.robotCardHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.robotCardHeaderContent}>
                <View>
                  <Text style={styles.robotCardTitle}>{robotDetails.name}</Text>
                  <Text style={styles.robotCardSubtitle}>
                    {robotDetails.model} • SN: {robotDetails.serialNumber}
                  </Text>
                </View>
                
                <View style={styles.badgeContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(robotDetails.status) }
                  ]}>
                    <Text style={styles.statusText}>{robotDetails.status}</Text>
                  </View>
                  
                  {robotDetails.security.securityClassification && (
                    <View style={[
                      styles.securityBadge,
                      { backgroundColor: getSecurityClassColor(robotDetails.security.securityClassification) }
                    ]}>
                      <Shield size={12} color="#fff" />
                      <Text style={styles.securityBadgeText}>
                        {robotDetails.security.securityClassification}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
            
            <View style={styles.robotCardBody}>
              <View style={styles.robotInfoRow}>
                <View style={styles.robotInfoItem}>
                  <Text style={styles.robotInfoLabel}>Location</Text>
                  <Text style={styles.robotInfoValue}>{robotDetails.location}</Text>
                </View>
                
                <View style={styles.robotInfoItem}>
                  <Text style={styles.robotInfoLabel}>Firmware</Text>
                  <Text style={styles.robotInfoValue}>{robotDetails.firmware}</Text>
                </View>
              </View>
              
              <View style={styles.robotInfoRow}>
                <View style={styles.robotInfoItem}>
                  <Text style={styles.robotInfoLabel}>IP Address</Text>
                  <Text style={styles.robotInfoValue}>{robotDetails.ipAddress}</Text>
                </View>
                
                <View style={styles.robotInfoItem}>
                  <Text style={styles.robotInfoLabel}>Last Connected</Text>
                  <Text style={styles.robotInfoValue}>
                    {new Date(robotDetails.lastConnected).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.robotTasks}>
                <Text style={styles.robotTasksTitle}>Tasks</Text>
                <View style={styles.robotTasksContainer}>
                  <View style={styles.robotTaskItem}>
                    <Text style={styles.robotTaskNumber}>{robotDetails.tasks.current}</Text>
                    <Text style={styles.robotTaskLabel}>Current</Text>
                  </View>
                  
                  <View style={styles.robotTaskItem}>
                    <Text style={styles.robotTaskNumber}>{robotDetails.tasks.pending}</Text>
                    <Text style={styles.robotTaskLabel}>Pending</Text>
                  </View>
                  
                  <View style={styles.robotTaskItem}>
                    <Text style={styles.robotTaskNumber}>{robotDetails.tasks.completed.toLocaleString()}</Text>
                    <Text style={styles.robotTaskLabel}>Completed</Text>
                  </View>
                </View>
                
                <View style={styles.securitySection}>
                  <Text style={styles.securityTitle}>Security & Compliance</Text>
                  <View style={styles.securityInfo}>
                    {robotDetails.security.securityScore !== undefined && (
                      <View style={styles.securityItem}>
                        <Text style={styles.securityLabel}>Security Score</Text>
                        <View style={[
                          styles.securityScore,
                          { backgroundColor: getSecurityScoreColor(robotDetails.security.securityScore) }
                        ]}>
                          <Text style={styles.securityScoreText}>
                            {(robotDetails.security.securityScore * 100).toFixed(0)}%
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {robotDetails.security.lastSecurityScan && (
                      <View style={styles.securityItem}>
                        <Text style={styles.securityLabel}>Last Scan</Text>
                        <Text style={styles.securityValue}>
                          {new Date(robotDetails.security.lastSecurityScan).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.securityItem}>
                      <Text style={styles.securityLabel}>Vulnerabilities</Text>
                      <Text style={[
                        styles.securityValue,
                        { color: robotDetails.security.vulnerabilities > 0
                          ? colors.palette.error[500]
                          : colors.palette.success[500]
                        }
                      ]}>
                        {robotDetails.security.vulnerabilities}
                      </Text>
                    </View>
                  </View>
                  
                  {robotDetails.security.complianceStatus && robotDetails.security.complianceStatus.length > 0 && (
                    <View style={styles.complianceContainer}>
                      <Text style={styles.complianceTitle}>Compliance</Text>
                      <View style={styles.complianceBadges}>
                        {robotDetails.security.complianceStatus.map((standard: string) => (
                          <View key={standard} style={styles.complianceBadge}>
                            <Text style={styles.complianceBadgeText}>{standard}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        )}
        
        {/* Live Telemetry Stats */}
        {latestTelemetry && (
          <View style={styles.telemetryContainer}>
            <View style={styles.telemetryHeader}>
              <Text style={styles.telemetryTitle}>Live Telemetry</Text>
              <View style={styles.telemetryStatus}>
                <View style={[
                  styles.connectionIndicator,
                  { backgroundColor: connectionStatus === 'Connected' 
                    ? colors.palette.success[500] 
                    : colors.palette.error[500] 
                  }
                ]} />
                <Text style={styles.connectionStatus}>{connectionStatus}</Text>
              </View>
            </View>
            
            <View style={styles.telemetryTimestamp}>
              <Clock size={14} color={colors.palette.neutral[500]} />
              <Text style={styles.telemetryTimestampText}>
                {formatTimestamp(latestTelemetry.timestamp)}
              </Text>
              
              <View style={styles.refreshRateContainer}>
                <Text style={styles.refreshRateLabel}>Refresh:</Text>
                <TouchableOpacity 
                  style={[
                    styles.refreshRateButton,
                    refreshRate === 1000 && styles.refreshRateButtonSelected
                  ]}
                  onPress={() => changeRefreshRate(1000)}
                >
                  <Text style={styles.refreshRateText}>1s</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.refreshRateButton,
                    refreshRate === 5000 && styles.refreshRateButtonSelected
                  ]}
                  onPress={() => changeRefreshRate(5000)}
                >
                  <Text style={styles.refreshRateText}>5s</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {latestTelemetry.status !== 'normal' && !alarmSilenced && (
              <View style={[
                styles.alertBanner,
                { backgroundColor: getTelemetryStatusColor(latestTelemetry.status) }
              ]}>
                <AlertTriangle size={16} color="#fff" />
                <Text style={styles.alertText}>
                  {latestTelemetry.warnings.length > 0 
                    ? latestTelemetry.warnings.join(', ') 
                    : `${latestTelemetry.status.toUpperCase()} status detected`}
                </Text>
                <TouchableOpacity 
                  style={styles.alertAction}
                  onPress={() => setAlarmSilenced(true)}
                >
                  <Text style={styles.alertActionText}>Silence</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.telemetryGrid}>
              {/* Temperature */}
              <View style={styles.telemetryItem}>
                <View style={styles.telemetryIconContainer}>
                  <ThermometerSnowflake size={20} color={colors.palette.primary[500]} />
                </View>
                <Text style={styles.telemetryLabel}>Temperature</Text>
                <Text style={styles.telemetryValue}>
                  {latestTelemetry.temperature.toFixed(1)}°C
                </Text>
                {diagnosticMode && (
                  <Text style={styles.telemetryHistory}>
                    Avg: {(telemetryData.reduce((sum, point) => sum + point.temperature, 0) / telemetryData.length).toFixed(1)}°C
                  </Text>
                )}
              </View>
              
              {/* CPU */}
              <View style={styles.telemetryItem}>
                <View style={styles.telemetryIconContainer}>
                  <Cpu size={20} color={colors.palette.primary[500]} />
                </View>
                <Text style={styles.telemetryLabel}>CPU Usage</Text>
                <Text style={styles.telemetryValue}>
                  {latestTelemetry.cpu.toFixed(1)}%
                </Text>
                {diagnosticMode && (
                  <Text style={styles.telemetryHistory}>
                    Max: {Math.max(...telemetryData.map(point => point.cpu)).toFixed(1)}%
                  </Text>
                )}
              </View>
              
              {/* Memory */}
              <View style={styles.telemetryItem}>
                <View style={styles.telemetryIconContainer}>
                  <Activity size={20} color={colors.palette.primary[500]} />
                </View>
                <Text style={styles.telemetryLabel}>Memory</Text>
                <Text style={styles.telemetryValue}>
                  {latestTelemetry.memory.toFixed(1)}%
                </Text>
                {diagnosticMode && (
                  <Text style={styles.telemetryHistory}>
                    Avg: {(telemetryData.reduce((sum, point) => sum + point.memory, 0) / telemetryData.length).toFixed(1)}%
                  </Text>
                )}
              </View>
              
              {/* Battery */}
              <View style={styles.telemetryItem}>
                <View style={styles.telemetryIconContainer}>
                  <Battery size={20} color={colors.palette.primary[500]} />
                </View>
                <Text style={styles.telemetryLabel}>Battery</Text>
                <Text style={styles.telemetryValue}>
                  {latestTelemetry.battery.toFixed(1)}%
                </Text>
                {diagnosticMode && (
                  <Text style={styles.telemetryHistory}>
                    Min: {Math.min(...telemetryData.map(point => point.battery)).toFixed(1)}%
                  </Text>
                )}
              </View>
              
              {/* Network */}
              <View style={styles.telemetryItem}>
                <View style={styles.telemetryIconContainer}>
                  <Wifi size={20} color={colors.palette.primary[500]} />
                </View>
                <Text style={styles.telemetryLabel}>Network</Text>
                <Text style={styles.telemetryValue}>
                  {latestTelemetry.network.toFixed(0)}%
                </Text>
                {diagnosticMode && (
                  <Text style={styles.telemetryHistory}>
                    Avg: {(telemetryData.reduce((sum, point) => sum + point.network, 0) / telemetryData.length).toFixed(0)}%
                  </Text>
                )}
              </View>
              
              {/* Status */}
              <View style={styles.telemetryItem}>
                <View style={[
                  styles.telemetryIconContainer,
                  { backgroundColor: colors.colorUtils.withOpacity(getTelemetryStatusColor(latestTelemetry.status), 0.1) }
                ]}>
                  <Shield size={20} color={getTelemetryStatusColor(latestTelemetry.status)} />
                </View>
                <Text style={styles.telemetryLabel}>Status</Text>
                <Text style={[
                  styles.telemetryValue,
                  { color: getTelemetryStatusColor(latestTelemetry.status) }
                ]}>
                  {latestTelemetry.status.charAt(0).toUpperCase() + latestTelemetry.status.slice(1)}
                </Text>
                {diagnosticMode && (
                  <Text style={styles.telemetryHistory}>
                    Warnings: {telemetryData.filter(point => point.status !== 'normal').length}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        
        {/* Visualization Section */}
        <View style={styles.visualizationContainer}>
          <View style={styles.visualizationHeader}>
            <Text style={styles.visualizationTitle}>Performance Visualization</Text>
            <BarChart2 size={20} color={colors.palette.primary[500]} />
          </View>
          
          {/* This would be a real chart in a production app */}
          {/* Here we're using a placeholder */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Interactive Performance Chart</Text>
            <Text style={styles.chartPlaceholderDescription}>
              In the production app, this would be an interactive chart showing telemetry data
              trends over time with zooming, filtering, and anomaly highlighting capabilities.
            </Text>
          </View>
        </View>
        
        {/* Additional Controls */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Advanced Options</Text>
          
          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>Diagnostic Mode</Text>
            <Switch
              value={diagnosticMode}
              onValueChange={toggleDiagnosticMode}
              trackColor={{ false: '#d1d5db', true: colors.palette.primary[300] }}
              thumbColor={diagnosticMode ? colors.palette.primary[500] : '#f4f3f4'}
              ios_backgroundColor="#d1d5db"
            />
          </View>
          
          <View>
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Security Override</Text>
              <Switch
                value={securityOverride}
                onValueChange={(value: boolean) => {
                  // Require confirmation for enabling security override
                  if (value) {
                    Alert.alert(
                      'Security Override',
                      'Enabling security override bypasses security checks. Continue?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Enable', style: 'destructive', onPress: () => setSecurityOverride(true) }
                      ]
                    );
                  } else {
                    setSecurityOverride(false);
                  }
                }}
                trackColor={{ false: '#d1d5db', true: colors.palette.warning[300] }}
                thumbColor={securityOverride ? colors.palette.warning[500] : '#f4f3f4'}
                ios_backgroundColor="#d1d5db"
              />
            </View>
            
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Security Classification</Text>
              <View style={styles.securityLevelSelector}>
                {Object.values(SecurityClassification).map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.securityLevelButton,
                      securityClassification === level && styles.securityLevelButtonSelected,
                      { backgroundColor: getSecurityClassColor(level, 0.2) }
                    ]}
                    onPress={() => changeSecurityLevel(level)}
                  >
                    <Text style={[
                      styles.securityLevelText,
                      securityClassification === level && styles.securityLevelTextSelected
                    ]}>
                      {level.charAt(0).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {alarmSilenced && (
            <View style={styles.actionRow}>
              <Text style={styles.actionLabel}>Alarms Silenced</Text>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setAlarmSilenced(false)}
              >
                Unmute
              </Button>
            </View>
          )}
          
          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>Telemetry Feed</Text>
            <Button
              variant={isTelemetryLive ? 'primary' : 'ghost'}
              size="sm"
              onPress={() => setIsTelemetryLive(!isTelemetryLive)}
            >
              {isTelemetryLive ? 'Live' : 'Paused'}
            </Button>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Controls Button */}
      <TouchableOpacity 
        style={styles.controlsButton}
        onPress={toggleControls}
      >
        <Settings size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Controls Panel */}
      <Animated.View 
        style={[
          styles.controlsPanel,
          {
            height: controlsAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 200]
            })
          }
        ]}
      >
        <View style={styles.controlsPanelContent}>
          <Text style={styles.controlsTitle}>Robot Controls</Text>
          
          <View style={styles.controlsGrid}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                robotDetails?.status !== 'Active' && styles.controlButtonDisabled
              ]}
              onPress={() => robotDetails?.status === 'Active' ? sendCommand('pause') : null}
              disabled={robotDetails?.status !== 'Active' || commandInProgress}
            >
              <PauseCircle size={24} color={robotDetails?.status === 'Active' ? colors.palette.primary[500] : colors.palette.neutral[400]} />
              <Text style={[
                styles.controlButtonText,
                robotDetails?.status !== 'Active' && styles.controlButtonTextDisabled
              ]}>
                Pause
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton,
                robotDetails?.status !== 'Maintenance' && styles.controlButtonDisabled
              ]}
              onPress={() => robotDetails?.status === 'Maintenance' ? sendCommand('resume') : null}
              disabled={robotDetails?.status !== 'Maintenance' || commandInProgress}
            >
              <PlayCircle size={24} color={robotDetails?.status === 'Maintenance' ? colors.palette.success[500] : colors.palette.neutral[400]} />
              <Text style={[
                styles.controlButtonText,
                robotDetails?.status !== 'Maintenance' && styles.controlButtonTextDisabled
              ]}>
                Resume
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton,
                commandInProgress && styles.controlButtonDisabled
              ]}
              onPress={() => sendCommand('restart')}
              disabled={commandInProgress}
            >
              <RefreshCw size={24} color={commandInProgress ? colors.palette.neutral[400] : colors.palette.warning[500]} />
              <Text style={[
                styles.controlButtonText,
                { color: colors.palette.warning[700] },
                commandInProgress && styles.controlButtonTextDisabled
              ]}>
                Restart
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton,
                commandInProgress && styles.controlButtonDisabled
              ]}
              onPress={() => sendCommand('shutdown')}
              disabled={commandInProgress || robotDetails?.status === 'Offline'}
            >
              <Power size={24} color={commandInProgress ? colors.palette.neutral[400] : colors.palette.error[500]} />
              <Text style={[
                styles.controlButtonText,
                { color: colors.palette.error[700] },
                commandInProgress && styles.controlButtonTextDisabled
              ]}>
                Shutdown
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.extraControlsContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.securityControlButton,
                commandInProgress && styles.controlButtonDisabled
              ]}
              onPress={() => sendCommand('security_scan')}
              disabled={commandInProgress}
            >
              <Shield size={24} color={commandInProgress ? colors.palette.neutral[400] : colors.palette.primary[500]} />
              <Text style={[
                styles.controlButtonText,
                commandInProgress && styles.controlButtonTextDisabled
              ]}>
                Security Scan
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.securityControlButton,
                commandInProgress && styles.controlButtonDisabled
              ]}
              onPress={() => sendCommand('quarantine')}
              disabled={commandInProgress}
            >
              <AlertTriangle size={24} color={commandInProgress ? colors.palette.neutral[400] : colors.palette.warning[500]} />
              <Text style={[
                styles.controlButtonText,
                { color: colors.palette.warning[700] },
                commandInProgress && styles.controlButtonTextDisabled
              ]}>
                Quarantine
              </Text>
            </TouchableOpacity>
          </View>
          
          {commandInProgress && (
            <View style={styles.loadingCommandContainer}>
              <ActivityIndicator size="small" color={colors.palette.primary[500]} />
              <Text style={styles.loadingCommandText}>Sending command...</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginBottom: 12,
  },
  robotSelector: {
    flexDirection: 'row',
  },
  robotSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.palette.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  robotSelectorItemSelected: {
    backgroundColor: colors.palette.primary[100],
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  robotSelectorName: {
    fontSize: 14,
    color: colors.palette.neutral[700],
  },
  robotSelectorNameSelected: {
    color: colors.palette.primary[700],
    fontWeight: '500',
  },
  robotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  robotCardHeader: {
    padding: 16,
  },
  robotCardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  robotCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  robotCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  badgeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.palette.primary[700],
    gap: 4,
  },
  securityBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  robotCardBody: {
    padding: 16,
  },
  robotInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  robotInfoItem: {
    flex: 1,
  },
  robotInfoLabel: {
    fontSize: 12,
    color: colors.palette.neutral[500],
    marginBottom: 4,
  },
  robotInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.palette.neutral[800],
  },
  robotTasks: {
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral[200],
    paddingTop: 16,
    marginBottom: 16,
  },
  securitySection: {
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral[200],
    paddingTop: 16,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginBottom: 12,
  },
  securityInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  securityItem: {
    width: '31%',
    marginBottom: 8,
  },
  securityLabel: {
    fontSize: 12,
    color: colors.palette.neutral[500],
    marginBottom: 4,
  },
  securityValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.palette.neutral[800],
  },
  securityScore: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  securityScoreText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  complianceContainer: {
    marginTop: 8,
  },
  complianceTitle: {
    fontSize: 12,
    color: colors.palette.neutral[500],
    marginBottom: 8,
  },
  complianceBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  complianceBadge: {
    backgroundColor: colors.palette.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  complianceBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.palette.primary[700],
  },
  robotTasksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginBottom: 12,
  },
  robotTasksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  robotTaskItem: {
    alignItems: 'center',
  },
  robotTaskNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.palette.primary[600],
  },
  robotTaskLabel: {
    fontSize: 12,
    color: colors.palette.neutral[500],
    marginTop: 4,
  },
  telemetryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  telemetryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[800],
  },
  telemetryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionStatus: {
    fontSize: 12,
    color: colors.palette.neutral[600],
  },
  telemetryTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  telemetryTimestampText: {
    fontSize: 12,
    color: colors.palette.neutral[500],
    marginLeft: 4,
  },
  refreshRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  refreshRateLabel: {
    fontSize: 12,
    color: colors.palette.neutral[600],
    marginRight: 8,
  },
  refreshRateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.palette.neutral[100],
    marginLeft: 4,
  },
  refreshRateButtonSelected: {
    backgroundColor: colors.palette.primary[100],
  },
  refreshRateText: {
    fontSize: 10,
    color: colors.palette.neutral[700],
    fontWeight: '500',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.palette.warning[500],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  alertAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  alertActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  telemetryItem: {
    width: '48%',
    backgroundColor: colors.palette.neutral[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  telemetryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.palette.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  telemetryLabel: {
    fontSize: 12,
    color: colors.palette.neutral[600],
    marginBottom: 4,
  },
  telemetryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[800],
  },
  telemetryHistory: {
    fontSize: 10,
    color: colors.palette.neutral[500],
    marginTop: 4,
  },
  visualizationContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  visualizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  visualizationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[800],
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: colors.palette.neutral[100],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[600],
    marginBottom: 12,
  },
  chartPlaceholderDescription: {
    fontSize: 12,
    color: colors.palette.neutral[500],
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 80, // Extra space for controls panel
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.palette.neutral[100],
  },
  actionLabel: {
    fontSize: 14,
    color: colors.palette.neutral[700],
  },
  securityLevelSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  securityLevelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityLevelButtonSelected: {
    borderWidth: 2,
    borderColor: colors.palette.primary[500],
  },
  securityLevelText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.palette.neutral[700],
  },
  securityLevelTextSelected: {
    color: colors.palette.primary[700],
  },
  controlsButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.palette.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  controlsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
    overflow: 'hidden',
  },
  controlsPanelContent: {
    padding: 16,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginBottom: 16,
    textAlign: 'center',
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  extraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  securityControlButton: {
    width: '48%',
  },
  controlButton: {
    width: '48%',
    padding: 12,
    backgroundColor: colors.palette.neutral[50],
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButtonDisabled: {
    backgroundColor: colors.palette.neutral[100],
    opacity: 0.7,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.palette.neutral[800],
    marginTop: 8,
  },
  controlButtonTextDisabled: {
    color: colors.palette.neutral[500],
  },
  loadingCommandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadingCommandText: {
    fontSize: 14,
    color: colors.palette.neutral[600],
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.palette.neutral[600],
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.palette.neutral[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.palette.neutral[800],
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 16,
    color: colors.palette.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default RobotRealtimeMonitoring;