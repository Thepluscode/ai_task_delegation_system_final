import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  Modal,
  Animated,
  ActivityIndicator,
  Switch
} from 'react-native';

import { 
  Bot, 
  Power, 
  PowerOff, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Settings,
  Play,
  Pause,
  Square,
  Wrench,
  RefreshCw,
  Loader,
  AlertCircle,
  XCircle,
  Wifi,
  WifiOff,
  Cpu,
  Terminal,
  Shield,
  TrendingUp,
  Users,
  Eye,
  Brain,
  Cloud,
  HardDrive
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RobotService from '../../services/RobotService';

const { width } = Dimensions.get('window');
const robotService = new RobotService();

interface Robot {
  robot_id: string;
  robot_type: string;
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'starting' | 'stopping';
  location: {
    x: number;
    y: number;
    z: number;
  };
  battery_level: number;
  current_task: string;
  edge_node_id: string;
  last_edge_sync: string;
  performance_metrics: {
    efficiency: number;
    uptime_percentage: number;
    tasks_completed: number;
    average_execution_time: number;
  };
  safety_status: {
    safety_score: number;
    risk_level: string;
    active_safety_events: number;
  };
  agent_coordination: {
    coordination_group: string;
    current_tasks: string[];
    coordination_efficiency: number;
  };
  manufacturer?: string;
  model?: string;
}

interface FleetStats {
  total_robots: number;
  active_robots: number;
  idle_robots: number;
  error_robots: number;
  maintenance_robots: number;
  average_efficiency: number;
  total_uptime: number;
}

interface EdgeStatus {
  edge_nodes_active: number;
  total_edge_capacity: number;
  current_edge_load: number;
  edge_ai_models_loaded: number;
  performance_metrics: {
    avg_decision_time_ms: number;
    sub_10ms_decisions_percent: number;
    edge_uptime_percent: number;
  };
}

interface SafetyEvent {
  event_id: string;
  hazard_type: string;
  safety_level: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

interface AgentCoordinationStatus {
  total_agents: number;
  active_agents: number;
  coordination_groups: number;
  active_tasks: number;
  pending_tasks: number;
  performance_summary: {
    avg_task_completion_time: number;
    agent_utilization: number;
    coordination_efficiency: number;
  };
}

const RobotCard: React.FC<{
  robot: Robot;
  onPress: () => void;
  onPowerPress: () => void;
  isPowering: boolean;
  pulseAnim: Animated.Value;
}> = ({ robot, onPress, onPowerPress, isPowering, pulseAnim }) => {
  const getStatusColor = () => {
    switch (robot.status) {
      case 'online': return '#10b981';
      case 'offline': return '#6b7280';
      case 'maintenance': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'starting': return '#3b82f6';
      case 'stopping': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (robot.status) {
      case 'online': return <CheckCircle size={16} color="#10b981" />;
      case 'offline': return <PowerOff size={16} color="#6b7280" />;
      case 'maintenance': return <Wrench size={16} color="#f59e0b" />;
      case 'error': return <AlertTriangle size={16} color="#ef4444" />;
      case 'starting': return <Loader size={16} color="#3b82f6" />;
      case 'stopping': return <Loader size={16} color="#f97316" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  const getRiskColor = () => {
    switch (robot.safety_status.risk_level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'critical': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.robotCard} onPress={onPress}>
      <View style={styles.robotHeader}>
        <View style={styles.robotInfo}>
          <View style={[styles.robotIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Bot size={24} color={getStatusColor()} />
          </View>
          <View style={styles.robotDetails}>
            <Text style={styles.robotName}>{robot.robot_id}</Text>
            <Text style={styles.robotType}>{robot.robot_type}</Text>
            <Text style={styles.robotLocation}>
              Position: ({robot.location.x.toFixed(1)}, {robot.location.y.toFixed(1)}, {robot.location.z.toFixed(1)})
            </Text>
          </View>
        </View>
        <View style={styles.robotHeaderRight}>
          <TouchableOpacity 
            style={[styles.powerButton, { backgroundColor: getStatusColor() + '20' }]}
            onPress={onPowerPress}
            disabled={isPowering}
          >
            {isPowering ? (
              <ActivityIndicator size="small" color={getStatusColor()} />
            ) : (
              <Power size={20} color={getStatusColor()} />
            )}
          </TouchableOpacity>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {robot.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.realTimeMetrics}>
        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Battery</Text>
            <View style={styles.batteryContainer}>
              <View style={styles.batteryBar}>
                <View 
                  style={[
                    styles.batteryFill, 
                    { 
                      width: `${robot.battery_level}%`, 
                      backgroundColor: robot.battery_level > 60 ? '#10b981' : 
                                     robot.battery_level > 30 ? '#f59e0b' : '#ef4444'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.batteryText}>{robot.battery_level}%</Text>
            </View>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Efficiency</Text>
            <Text style={styles.metricValue}>{robot.performance_metrics.efficiency.toFixed(1)}%</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Uptime</Text>
            <Text style={styles.metricValue}>{robot.performance_metrics.uptime_percentage.toFixed(1)}%</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Safety Score</Text>
            <Text style={[styles.metricValue, { color: getRiskColor() }]}>
              {(robot.safety_status.safety_score * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Tasks Completed</Text>
            <Text style={styles.metricValue}>{robot.performance_metrics.tasks_completed}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Coordination</Text>
            <Text style={styles.metricValue}>
              {(robot.agent_coordination.coordination_efficiency * 100).toFixed(0)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.edgeIntegration}>
        <View style={styles.edgeInfo}>
          <HardDrive size={14} color="#3b82f6" />
          <Text style={styles.edgeText}>Edge Node: {robot.edge_node_id}</Text>
        </View>
        <View style={styles.edgeInfo}>
          <Brain size={14} color="#8b5cf6" />
          <Text style={styles.edgeText}>
            Avg Exec: {robot.performance_metrics.average_execution_time.toFixed(1)}ms
          </Text>
        </View>
      </View>

      <View style={styles.currentTask}>
        <Text style={styles.taskLabel}>Current Task:</Text>
        <Text style={styles.taskText}>{robot.current_task}</Text>
        <Text style={styles.taskDetails}>
          Group: {robot.agent_coordination.coordination_group} • 
          Safety Events: {robot.safety_status.active_safety_events}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const SystemStatusCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  data: any;
  color: string;
}> = ({ title, icon, data, color }) => (
  <View style={[styles.systemCard, { borderLeftColor: color }]}>
    <View style={styles.systemCardHeader}>
      {icon}
      <Text style={styles.systemCardTitle}>{title}</Text>
    </View>
    <View style={styles.systemCardContent}>
      {Object.entries(data).map(([key, value]) => (
        <View key={key} style={styles.systemMetric}>
          <Text style={styles.systemMetricLabel}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
          <Text style={styles.systemMetricValue}>
            {typeof value === 'number' ? value.toFixed(1) : String(value)}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  automationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  automationLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
  },
  systemStatus: {
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  systemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 160,
  },
  systemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  systemCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  systemCardContent: {
    gap: 8,
  },
  systemMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemMetricLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  systemMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  robotsList: {
    paddingVertical: 20,
    gap: 16,
  },
  robotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  robotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  robotInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  robotIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  robotDetails: {
    flex: 1,
  },
  robotName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  robotType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  robotLocation: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  robotHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  powerButton: {
    padding: 8,
    borderRadius: 8,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  realTimeMetrics: {
    gap: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  batteryContainer: {
    alignItems: 'center',
  },
  batteryBar: {
    width: 60,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    color: '#1f2937',
  },
  edgeIntegration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 12,
  },
  edgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  edgeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  currentTask: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  taskLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  taskDetails: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  safetyEventsSection: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  safetyEventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  safetyEventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  safetyEventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  safetyEventLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  safetyEventDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  safetyEventTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotDetailModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    width: (width - 80) / 2 - 6,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
    textAlign: 'center',
  },
  robotActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function EnhancedRobotsScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [edgeStatus, setEdgeStatus] = useState<EdgeStatus | null>(null);
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentCoordinationStatus | null>(null);
  const [automationEnabled, setAutomationEnabled] = useState<boolean>(true);
  const [poweringRobots, setPoweringRobots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const updateIntervalRef = useRef<number | null>(null);

  // Initialize demo robots and connect to backend
  const initializeRobots = useCallback(async () => {
    try {
      setLoading(true);
      
      // Register demo robots with backend
      const demoRobots = [
        {
          robot_id: 'ur5e_001',
          manufacturer: 'universal_robots',
          model: 'UR5e',
          capabilities: ['navigation', 'manipulation', 'vision'],
          connection_params: { ip_address: '192.168.1.100', port: 30001 }
        },
        {
          robot_id: 'abb_irb120_001', 
          manufacturer: 'abb',
          model: 'IRB120',
          capabilities: ['precision_movement', 'pick_and_place'],
          connection_params: { ip_address: '192.168.1.101', port: 80 }
        },
        {
          robot_id: 'kuka_kr6_001',
          manufacturer: 'kuka', 
          model: 'KR6',
          capabilities: ['heavy_lifting', 'welding'],
          connection_params: { ip_address: '192.168.1.102', port: 7000 }
        }
      ];

      // Register robots with backend
      for (const robot of demoRobots) {
        try {
          await robotService.registerRobot(robot);
        } catch (error) {
          console.warn(`Failed to register robot ${robot.robot_id}:`, error);
        }
      }

      // Load real robot data
      await loadRealTimeData();
      
    } catch (error) {
      console.error('Failed to initialize robots:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load real-time data from backend services
  const loadRealTimeData = useCallback(async () => {
    try {
      // Load robot statuses
      const robotPromises = ['ur5e_001', 'abb_irb120_001', 'kuka_kr6_001'].map(
        async (robotId) => {
          try {
            return await robotService.getEnhancedRobotStatus(robotId);
          } catch (error) {
            console.warn(`Failed to get status for ${robotId}:`, error);
            return null;
          }
        }
      );

      const robotStatuses = (await Promise.all(robotPromises)).filter(Boolean) as Robot[];
      setRobots(robotStatuses);

      // Load fleet summary
      try {
        const fleetSummary = await robotService.getFleetSummary();
        setFleetStats(fleetSummary);
      } catch (error) {
        console.warn('Failed to get fleet summary:', error);
      }

      // Load edge computing status
      try {
        const edgeStat = await robotService.getEdgeStatus();
        setEdgeStatus(edgeStat);
      } catch (error) {
        console.warn('Failed to get edge status:', error);
      }

      // Load safety events
      try {
        const events = await robotService.getSafetyStatus();
        setSafetyEvents(events);
      } catch (error) {
        console.warn('Failed to get safety events:', error);
      }

      // Load agent coordination status
      try {
        const agentStat = await robotService.getAgentCoordinationStatus();
        setAgentStatus(agentStat);
      } catch (error) {
        console.warn('Failed to get agent status:', error);
      }

    } catch (error) {
      console.error('Failed to load real-time data:', error);
    }
  }, []);

  // Start real-time updates
  const startRealTimeUpdates = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      if (automationEnabled) {
        loadRealTimeData();
      }
    }, 5000); // Update every 5 seconds
  }, [loadRealTimeData, automationEnabled]);

  // Handle automated robot operations
  const handleAutomatedOperation = useCallback(async (robotId: string, operation: string) => {
    if (!automationEnabled) return;

    try {
      const command = {
        command: operation,
        parameters: {},
        priority: 'normal',
        max_latency: 1000,
        safety_level: 'medium'
      };

      const result = await robotService.executeEnhancedCommand(robotId, command);
      
      if (result.success) {
        console.log(`Automated ${operation} completed for ${robotId}`);
        await loadRealTimeData(); // Refresh data
      }
    } catch (error) {
      console.error(`Automated operation failed for ${robotId}:`, error);
    }
  }, [automationEnabled, loadRealTimeData]);

  // Handle power actions with real backend integration
  const handlePowerAction = useCallback(async (robot: Robot, action: 'start' | 'stop' | 'restart' | 'emergency') => {
    try {
      setPoweringRobots(prev => new Set(prev).add(robot.robot_id));
      
      let result;
      if (action === 'emergency') {
        result = await robotService.emergencyStopRobot(robot.robot_id);
      } else {
        result = await robotService.automatePowerManagement(robot.robot_id, action);
      }

      if (result.success) {
        Alert.alert(
          'Power Action Complete',
          `${robot.robot_id} has been ${action}ed successfully.`,
          [{ text: 'OK' }]
        );
        await loadRealTimeData(); // Refresh data after action
      } else {
        throw new Error(result.message || 'Power action failed');
      }
    } catch (error) {
      console.error(`Power action failed for ${robot.robot_id}:`, error);
      Alert.alert('Error', `Failed to ${action} robot: ${error}`);
    } finally {
      setPoweringRobots(prev => {
        const newSet = new Set(prev);
        newSet.delete(robot.robot_id);
        return newSet;
      });
    }
  }, [loadRealTimeData]);

  // Handle refresh with real data reload
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRealTimeData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadRealTimeData]);

  // Emergency stop all robots
  const handleEmergencyStopAll = useCallback(async () => {
    Alert.alert(
      'Emergency Stop All Robots',
      'This will immediately stop all robots in the fleet. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'EMERGENCY STOP ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await robotService.emergencyStopAll();
              Alert.alert('Success', `Emergency stop executed on ${Object.keys(result.results).length} robots`);
              await loadRealTimeData();
            } catch (error) {
              Alert.alert('Error', 'Failed to execute emergency stop on all robots');
            }
          }
        }
      ]
    );
  }, [loadRealTimeData]);

  useEffect(() => {
    // Initialize robots and start real-time updates
    initializeRobots();
    
    // Connect to WebSocket for real-time updates
    robotService.connectWebSocket();
    robotService.addEventListener('robot_update', (data: any) => {
      console.log('Real-time robot update:', data);
      loadRealTimeData(); // Refresh data on WebSocket updates
    });

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      robotService.disconnect();
    };
  }, [initializeRobots]);

  useEffect(() => {
    startRealTimeUpdates();
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [startRealTimeUpdates]);

  useEffect(() => {
    // Pulse animation for loading states
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Connecting to Robot Fleet...</Text>
        <Text style={styles.loadingSubtext}>Initializing backend services</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AutomatedAI Platform</Text>
          <Text style={styles.headerSubtitle}>Real-time Robot Fleet Management</Text>
          
          <View style={styles.automationToggle}>
            <Text style={styles.automationLabel}>Automation</Text>
            <Switch
              value={automationEnabled}
              onValueChange={setAutomationEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={automationEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.systemStatus}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {fleetStats && (
            <SystemStatusCard
              title="Fleet Status"
              icon={<Users size={20} color="#10b981" />}
              data={{
                'Active': fleetStats.active_robots,
                'Total': fleetStats.total_robots,
                'Efficiency': `${fleetStats.average_efficiency.toFixed(1)}%`,
                'Uptime': `${fleetStats.total_uptime.toFixed(1)}%`
              }}
              color="#10b981"
            />
          )}
          
          {edgeStatus && (
            <SystemStatusCard
              title="Edge Computing"
              icon={<Brain size={20} color="#3b82f6" />}
              data={{
                'Nodes': edgeStatus.edge_nodes_active,
                'Load': `${(edgeStatus.current_edge_load * 100).toFixed(1)}%`,
                'Avg Decision': `${edgeStatus.performance_metrics.avg_decision_time_ms.toFixed(1)}ms`,
                'Sub-10ms': `${edgeStatus.performance_metrics.sub_10ms_decisions_percent.toFixed(1)}%`
              }}
              color="#3b82f6"
            />
          )}
          
          {agentStatus && (
            <SystemStatusCard
              title="Agent Coordination"
              icon={<Activity size={20} color="#8b5cf6" />}
              data={{
                'Active': agentStatus.active_agents,
                'Tasks': agentStatus.active_tasks,
                'Efficiency': `${(agentStatus.performance_summary.coordination_efficiency * 100).toFixed(1)}%`,
                'Utilization': `${(agentStatus.performance_summary.agent_utilization * 100).toFixed(1)}%`
              }}
              color="#8b5cf6"
            />
          )}
          
          <SystemStatusCard
            title="Safety Monitor"
            icon={<Shield size={20} color="#f59e0b" />}
            data={{
              'Events': safetyEvents.length,
              'Active': safetyEvents.filter(e => !e.resolved).length,
              'Critical': safetyEvents.filter(e => e.safety_level === 'critical').length,
              'Status': 'Monitoring'
            }}
            color="#f59e0b"
          />
        </ScrollView>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#ef4444' }]}
          onPress={handleEmergencyStopAll}
        >
          <AlertCircle size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>Emergency Stop All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#10b981' }]}
          onPress={() => loadRealTimeData()}
        >
          <RefreshCw size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>Refresh Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: '#3b82f6' }]}
          onPress={() => Alert.alert('Fleet Analytics', 'Advanced analytics dashboard coming soon!')}
        >
          <TrendingUp size={20} color="#ffffff" />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.robotsList}>
          {robots.map((robot) => (
            <RobotCard 
              key={robot.robot_id} 
              robot={robot} 
              onPress={() => setSelectedRobot(robot)}
              onPowerPress={() => handlePowerAction(robot, robot.status === 'online' ? 'stop' : 'start')}
              isPowering={poweringRobots.has(robot.robot_id)}
              pulseAnim={pulseAnim}
            />
          ))}
        </View>

        {safetyEvents.length > 0 && (
          <View style={styles.safetyEventsSection}>
            <Text style={styles.sectionTitle}>Recent Safety Events</Text>
            {safetyEvents.slice(0, 3).map((event) => (
              <View key={event.event_id} style={styles.safetyEventCard}>
                <View style={styles.safetyEventHeader}>
                  <AlertTriangle size={16} color={event.safety_level === 'critical' ? '#ef4444' : '#f59e0b'} />
                  <Text style={styles.safetyEventType}>{event.hazard_type.replace('_', ' ').toUpperCase()}</Text>
                  <Text style={[
                    styles.safetyEventLevel,
                    { color: event.safety_level === 'critical' ? '#ef4444' : '#f59e0b' }
                  ]}>
                    {event.safety_level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.safetyEventDescription}>{event.description}</Text>
                <Text style={styles.safetyEventTime}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {selectedRobot && (
        <Modal
          visible={!!selectedRobot}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedRobot(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.robotDetailModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedRobot.robot_id} Details</Text>
                <TouchableOpacity onPress={() => setSelectedRobot(null)}>
                  <XCircle size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Performance Metrics</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Efficiency</Text>
                      <Text style={styles.detailValue}>{selectedRobot.performance_metrics.efficiency.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Uptime</Text>
                      <Text style={styles.detailValue}>{selectedRobot.performance_metrics.uptime_percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Tasks Completed</Text>
                      <Text style={styles.detailValue}>{selectedRobot.performance_metrics.tasks_completed}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Avg Execution Time</Text>
                      <Text style={styles.detailValue}>{selectedRobot.performance_metrics.average_execution_time.toFixed(1)}ms</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Safety Status</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Safety Score</Text>
                      <Text style={styles.detailValue}>{(selectedRobot.safety_status.safety_score * 100).toFixed(0)}%</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Risk Level</Text>
                      <Text style={[styles.detailValue, { 
                        color: selectedRobot.safety_status.risk_level === 'low' ? '#10b981' : '#f59e0b' 
                      }]}>
                        {selectedRobot.safety_status.risk_level.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Active Events</Text>
                      <Text style={styles.detailValue}>{selectedRobot.safety_status.active_safety_events}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Agent Coordination</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Group</Text>
                      <Text style={styles.detailValue}>{selectedRobot.agent_coordination.coordination_group}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Coordination Efficiency</Text>
                      <Text style={styles.detailValue}>
                        {(selectedRobot.agent_coordination.coordination_efficiency * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Current Tasks</Text>
                      <Text style={styles.detailValue}>{selectedRobot.agent_coordination.current_tasks.length}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.robotActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                    onPress={() => {
                      handleAutomatedOperation(selectedRobot.robot_id, 'start_task');
                      setSelectedRobot(null);
                    }}
                  >
                    <Play size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Start Task</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                    onPress={() => {
                      handleAutomatedOperation(selectedRobot.robot_id, 'pause_task');
                      setSelectedRobot(null);
                    }}
                  >
                    <Pause size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Pause</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                    onPress={() => {
                      handlePowerAction(selectedRobot, 'emergency');
                      setSelectedRobot(null);
                    }}
                  >
                    <AlertCircle size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Emergency Stop</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}