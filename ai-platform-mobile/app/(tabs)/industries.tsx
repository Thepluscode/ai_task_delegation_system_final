import React, { useState, useEffect, useCallback } from 'react';
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
  StatusBar
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
  Shield,
  ArrowLeft,
  TrendingUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import services with fallback handling
let RobotService: (new () => any) | null;
try {
  RobotService = require('../../services/RobotService').default;
} catch (error) {
  console.warn('RobotService not available, using mock data');
  RobotService = null;
}

const { width } = Dimensions.get('window');

interface Robot {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'starting' | 'stopping';
  powerState: 'on' | 'off' | 'standby' | 'booting' | 'shutting_down';
  battery: number;
  location: string;
  currentTask: string;
  uptime: string;
  efficiency: number;
  lastUpdate: string;
  bootTime?: number;
  powerCycles?: number;
  emergencyStop?: boolean;
  connectivity: 'connected' | 'disconnected' | 'connecting';
  temperature?: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

interface FleetStats {
  online: number;
  maintenance: number;
  error: number;
  offline: number;
  avgEfficiency: number;
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

  const getPowerStateColor = () => {
    switch (robot.powerState) {
      case 'on': return '#10b981';
      case 'off': return '#ef4444';
      case 'standby': return '#f59e0b';
      case 'booting': return '#3b82f6';
      case 'shutting_down': return '#f97316';
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

  const getBatteryColor = () => {
    if (robot.battery > 60) return '#10b981';
    if (robot.battery > 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <TouchableOpacity style={styles.robotCard} onPress={onPress}>
      <View style={styles.robotHeader}>
        <View style={styles.robotInfo}>
          <View style={[styles.robotIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Bot size={24} color={getStatusColor()} />
          </View>
          <View style={styles.robotDetails}>
            <Text style={styles.robotName}>{robot.name}</Text>
            <Text style={styles.robotType}>{robot.type} • {robot.manufacturer}</Text>
            <Text style={styles.robotLocation}>{robot.location}</Text>
          </View>
        </View>
        <View style={styles.robotHeaderRight}>
          <TouchableOpacity 
            style={[styles.robotPowerButton, { backgroundColor: getPowerStateColor() + '20' }]}
            onPress={onPowerPress}
            disabled={isPowering}
          >
            {isPowering ? (
              <ActivityIndicator size="small" color={getPowerStateColor()} />
            ) : (
              <Power size={20} color={getPowerStateColor()} />
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

      <View style={styles.robotMetrics}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Battery</Text>
          <View style={styles.batteryContainer}>
            <View style={styles.batteryBar}>
              <View 
                style={[
                  styles.batteryFill, 
                  { 
                    width: `${robot.battery}%`, 
                    backgroundColor: getBatteryColor() 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.batteryText, { color: getBatteryColor() }]}>
              {robot.battery}%
            </Text>
          </View>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Efficiency</Text>
          <Text style={styles.metricValue}>{robot.efficiency}%</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Uptime</Text>
          <Text style={styles.metricValue}>{robot.uptime}</Text>
        </View>
      </View>

      <View style={styles.robotTask}>
        <Text style={styles.taskLabel}>Current Task:</Text>
        <Text style={styles.taskText}>{robot.currentTask}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RobotDetailView: React.FC<{ 
  robot: Robot; 
  onBack: () => void;
  onPowerAction: (action: 'start' | 'stop' | 'restart' | 'emergency') => void;
  isPowering: boolean;
}> = ({ robot, onBack, onPowerAction, isPowering }) => {
  const getStatusColor = () => {
    switch (robot.status) {
      case 'online': return '#10b981';
      case 'offline': return '#6b7280';
      case 'maintenance': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.detailContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.detailHeader}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <ArrowLeft size={24} color="#ffffff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.detailHeaderContent}>
          <View style={styles.detailIconContainer}>
            <Bot size={48} color="#ffffff" />
          </View>
          <Text style={styles.detailTitle}>{robot.name}</Text>
          <Text style={styles.detailSubtitle}>{robot.type} • {robot.manufacturer}</Text>
          <View 
            style={[
              styles.powerStateIndicator,
              { backgroundColor: robot.powerState === 'on' ? '#10b98140' : '#ef444440' }
            ]}
          >
            <Text style={styles.powerStateIndicatorText}>
              {robot.powerState === 'on' ? '● POWERED ON' : '○ POWERED OFF'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
        {/* Power Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Power Management</Text>
          <View style={styles.powerGrid}>
            {robot.powerState === 'off' ? (
              <TouchableOpacity
                style={[styles.detailPowerButton, { backgroundColor: '#10b981' }]}
                onPress={() => onPowerAction('start')}
                disabled={isPowering}
              >
                <Power size={32} color="#ffffff" />
                <Text style={styles.powerButtonText}>Power On</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.detailPowerButton, { backgroundColor: '#f59e0b' }]}
                  onPress={() => onPowerAction('stop')}
                  disabled={isPowering}
                >
                  <PowerOff size={32} color="#ffffff" />
                  <Text style={styles.powerButtonText}>Power Off</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailPowerButton, { backgroundColor: '#3b82f6' }]}
                  onPress={() => onPowerAction('restart')}
                  disabled={isPowering}
                >
                  <RefreshCw size={32} color="#ffffff" />
                  <Text style={styles.powerButtonText}>Restart</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Robot Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Robot Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <Activity size={24} color={getStatusColor()} />
              <Text style={styles.statusValue}>{robot.status.toUpperCase()}</Text>
              <Text style={styles.statusLabel}>Status</Text>
            </View>
            
            <View style={styles.statusCard}>
              <Zap size={24} color="#3b82f6" />
              <Text style={styles.statusValue}>{robot.battery}%</Text>
              <Text style={styles.statusLabel}>Battery</Text>
            </View>
            
            <View style={styles.statusCard}>
              <Clock size={24} color="#8b5cf6" />
              <Text style={styles.statusValue}>{robot.uptime}</Text>
              <Text style={styles.statusLabel}>Uptime</Text>
            </View>
            
            <View style={styles.statusCard}>
              <CheckCircle size={24} color="#f59e0b" />
              <Text style={styles.statusValue}>{robot.efficiency}%</Text>
              <Text style={styles.statusLabel}>Efficiency</Text>
            </View>
          </View>
        </View>

        {/* Robot Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Robot Controls</Text>
          <View style={styles.controlGrid}>
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#10b981' }]}
              disabled={robot.powerState === 'off'}
            >
              <Play size={24} color="#ffffff" />
              <Text style={styles.controlButtonText}>Start Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#f59e0b' }]}
              disabled={robot.powerState === 'off'}
            >
              <Pause size={24} color="#ffffff" />
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#ef4444' }]}
              disabled={robot.powerState === 'off'}
            >
              <Square size={24} color="#ffffff" />
              <Text style={styles.controlButtonText}>Stop Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { backgroundColor: '#6b7280' }]}
            >
              <Settings size={24} color="#ffffff" />
              <Text style={styles.controlButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Task */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Task</Text>
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{robot.currentTask}</Text>
            <Text style={styles.taskDetails}>Location: {robot.location}</Text>
            <Text style={styles.taskDetails}>Last Update: {robot.lastUpdate}</Text>
          </View>
        </View>

        {/* Emergency Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Controls</Text>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={() => onPowerAction('emergency')}
            disabled={robot.powerState === 'off' || isPowering}
          >
            <Shield size={24} color="#ffffff" />
            <Text style={styles.emergencyButtonText}>EMERGENCY STOP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default function UpdatedRobotsScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [poweringRobots, setPoweringRobots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [useRealData, setUseRealData] = useState<boolean>(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Mock data for fallback
  const mockRobots: Robot[] = [
    {
      id: '1',
      name: 'UR5e-001',
      type: 'Collaborative Robot',
      manufacturer: 'Universal Robots',
      status: 'online',
      powerState: 'on',
      battery: 85,
      location: 'Assembly Line A',
      currentTask: 'Pick and Place Operation',
      uptime: '23h 45m',
      efficiency: 94,
      lastUpdate: '2 minutes ago',
      bootTime: 45,
      powerCycles: 127,
      emergencyStop: false,
      connectivity: 'connected',
      temperature: 38,
      cpuUsage: 45,
      memoryUsage: 62
    },
    {
      id: '2',
      name: 'ABB-IRB-002',
      type: 'Industrial Robot',
      manufacturer: 'ABB',
      status: 'online',
      powerState: 'on',
      battery: 92,
      location: 'Welding Station 1',
      currentTask: 'Automated Welding',
      uptime: '18h 12m',
      efficiency: 98,
      lastUpdate: '1 minute ago',
      bootTime: 30,
      powerCycles: 89,
      emergencyStop: false,
      connectivity: 'connected',
      temperature: 42,
      cpuUsage: 68,
      memoryUsage: 71
    },
    {
      id: '3',
      name: 'KUKA-KR-003',
      type: 'Heavy Duty Robot',
      manufacturer: 'KUKA',
      status: 'maintenance',
      powerState: 'off',
      battery: 45,
      location: 'Maintenance Bay',
      currentTask: 'Scheduled Maintenance',
      uptime: '0h 0m',
      efficiency: 0,
      lastUpdate: '30 minutes ago',
      bootTime: 55,
      powerCycles: 456,
      emergencyStop: false,
      connectivity: 'disconnected',
      temperature: 34,
      cpuUsage: 0,
      memoryUsage: 0
    },
    {
      id: '4',
      name: 'Fanuc-M10-004',
      type: 'Precision Robot',
      manufacturer: 'Fanuc',
      status: 'online',
      powerState: 'on',
      battery: 78,
      location: 'Quality Control',
      currentTask: 'Inspection Process',
      uptime: '15h 33m',
      efficiency: 91,
      lastUpdate: '3 minutes ago',
      bootTime: 60,
      powerCycles: 234,
      emergencyStop: false,
      connectivity: 'connected',
      temperature: 36,
      cpuUsage: 38,
      memoryUsage: 52
    },
    {
      id: '5',
      name: 'Spot-BD-005',
      type: 'Mobile Robot',
      manufacturer: 'Boston Dynamics',
      status: 'error',
      powerState: 'off',
      battery: 23,
      location: 'Warehouse Floor',
      currentTask: 'Error: Navigation Failure',
      uptime: '0h 0m',
      efficiency: 0,
      lastUpdate: '15 minutes ago',
      bootTime: 90,
      powerCycles: 567,
      emergencyStop: true,
      connectivity: 'disconnected',
      temperature: 45,
      cpuUsage: 0,
      memoryUsage: 0
    }
  ];

  // Initialize data with backend fallback
  const initializeData = useCallback(async () => {
    setLoading(true);
    
    if (RobotService) {
      try {
        // Try to use real backend service
        const robotService = new RobotService();
        
        // Test connection with a simple call
        await robotService.getFleetSummary();
        
        // If successful, load real data
        setUseRealData(true);
        await loadRealData(robotService);
        
      } catch (error) {
        console.warn('Backend not available, using mock data:', error);
        setUseRealData(false);
        setRobots(mockRobots);
      }
    } else {
      console.log('RobotService not available, using mock data');
      setUseRealData(false);
      setRobots(mockRobots);
    }
    
    setLoading(false);
  }, []);

  // Load real data from backend
  const loadRealData = async (robotService: any) => {
    try {
      // Load enhanced robot data
      const robotPromises = ['ur5e_001', 'abb_irb120_001', 'kuka_kr6_001'].map(
        async (robotId) => {
          try {
            const status = await robotService.getEnhancedRobotStatus(robotId);
            return transformBackendRobot(status);
          } catch (error) {
            console.warn(`Failed to get status for ${robotId}:`, error);
            return null;
          }
        }
      );

      const robotStatuses = (await Promise.all(robotPromises)).filter(Boolean) as Robot[];
      setRobots(robotStatuses.length > 0 ? robotStatuses : mockRobots);
      
    } catch (error) {
      console.error('Failed to load real data:', error);
      setRobots(mockRobots);
    }
  };

  // Transform backend robot data to our interface
  const transformBackendRobot = (backendRobot: any): Robot => {
    return {
      id: backendRobot.robot_id,
      name: backendRobot.robot_id,
      type: backendRobot.robot_type || 'Robot',
      manufacturer: backendRobot.manufacturer || 'Unknown',
      status: mapBackendStatus(backendRobot.status),
      powerState: backendRobot.status === 'online' ? 'on' : 'off',
      battery: backendRobot.battery_level || Math.floor(Math.random() * 100),
      location: `${backendRobot.location?.x || 0}, ${backendRobot.location?.y || 0}, ${backendRobot.location?.z || 0}`,
      currentTask: backendRobot.current_task || 'Idle',
      uptime: `${backendRobot.performance_metrics?.uptime_percentage?.toFixed(0) || 0}%`,
      efficiency: backendRobot.performance_metrics?.efficiency || Math.floor(Math.random() * 100),
      lastUpdate: 'Just now',
      connectivity: backendRobot.status === 'online' ? 'connected' : 'disconnected',
      temperature: Math.floor(Math.random() * 20) + 30,
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100)
    };
  };

  const mapBackendStatus = (status: string): Robot['status'] => {
    switch (status) {
      case 'online': return 'online';
      case 'offline': return 'offline';
      case 'error': return 'error';
      case 'maintenance': return 'maintenance';
      default: return 'offline';
    }
  };

  // Handle power actions
  const handlePowerAction = useCallback(async (robot: Robot, action: 'start' | 'stop' | 'restart' | 'emergency') => {
    setPoweringRobots(prev => new Set(prev).add(robot.id));
    
    if (useRealData && RobotService) {
      try {
        const robotService = new RobotService();
        
        if (action === 'emergency') {
          await robotService.emergencyStopRobot(robot.id);
        } else {
          await robotService.automatePowerManagement(robot.id, action);
        }
        
        Alert.alert('Success', `${robot.name} ${action} completed successfully`);
        await loadRealData(robotService);
        
      } catch (error) {
        Alert.alert('Error', `Failed to ${action} robot: ${error}`);
      }
    } else {
      // Mock behavior
      setTimeout(() => {
        const finalPowerState = action === 'start' || action === 'restart' ? 'on' : 'off';
        const finalStatus = action === 'start' || action === 'restart' ? 'online' : 'offline';
        
        setRobots(prev => prev.map(r => 
          r.id === robot.id 
            ? { 
                ...r, 
                powerState: finalPowerState,
                status: finalStatus,
                uptime: finalPowerState === 'on' ? '0h 1m' : '0h 0m',
                connectivity: finalPowerState === 'on' ? 'connected' : 'disconnected',
                emergencyStop: action === 'emergency'
              } 
            : r
        ));
        
        Alert.alert('Success', `${robot.name} ${action} completed successfully`);
      }, 2000);
    }
    
    setTimeout(() => {
      setPoweringRobots(prev => {
        const newSet = new Set(prev);
        newSet.delete(robot.id);
        return newSet;
      });
    }, 2000);
  }, [useRealData]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    if (useRealData && RobotService) {
      try {
        const robotService = new RobotService();
        await loadRealData(robotService);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      }
    } else {
      // Mock refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setRefreshing(false);
  }, [useRealData]);

  const getFleetStats = (): FleetStats => {
    const online = robots.filter(r => r.status === 'online').length;
    const offline = robots.filter(r => r.status === 'offline').length;
    const maintenance = robots.filter(r => r.status === 'maintenance').length;
    const error = robots.filter(r => r.status === 'error').length;
    const avgEfficiency = Math.round(robots.reduce((sum, r) => sum + r.efficiency, 0) / robots.length);

    return { online, offline, maintenance, error, avgEfficiency };
  };

  useEffect(() => {
    initializeData();
    
    // Pulse animation
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
  }, [initializeData, pulseAnim]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Robot Fleet...</Text>
        <Text style={styles.loadingSubtext}>
          {RobotService ? 'Connecting to backend...' : 'Using offline mode'}
        </Text>
      </View>
    );
  }

  if (selectedRobot) {
    return (
      <RobotDetailView 
        robot={selectedRobot} 
        onBack={() => setSelectedRobot(null)}
        onPowerAction={(action) => handlePowerAction(selectedRobot, action)}
        isPowering={poweringRobots.has(selectedRobot.id)}
      />
    );
  }

  const stats = getFleetStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Robot Fleet Control</Text>
        <Text style={styles.headerSubtitle}>
          {robots.length} robots in fleet {!useRealData && '(Demo Mode)'}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
            <View style={styles.statIndicator} />
            <Text style={styles.statValue}>{stats.online}</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
            <View style={[styles.statIndicator, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.statValue}>{stats.maintenance}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
            <View style={[styles.statIndicator, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.statValue}>{stats.error}</Text>
            <Text style={styles.statLabel}>Error</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
            <View style={[styles.statIndicator, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.statValue}>{stats.avgEfficiency}%</Text>
            <Text style={styles.statLabel}>Avg Efficiency</Text>
          </View>
        </View>
      </View>

      {/* Robot List */}
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
              key={robot.id} 
              robot={robot} 
              onPress={() => setSelectedRobot(robot)}
              onPowerPress={() => handlePowerAction(robot, robot.powerState === 'on' ? 'stop' : 'start')}
              isPowering={poweringRobots.has(robot.id)}
              pulseAnim={pulseAnim}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <TrendingUp size={24} color="#9ca3af" />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Activity size={24} color="#9ca3af" />
          <Text style={styles.navLabel}>Industries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
          <Bot size={24} color="#3b82f6" />
          <Text style={styles.navLabelActive}>Robots</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Settings size={24} color="#9ca3af" />
          <Text style={styles.navLabel}>Workflows</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <TrendingUp size={24} color="#9ca3af" />
          <Text style={styles.navLabel}>Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Settings size={24} color="#9ca3af" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIndicator: {
    width: 4,
    height: 20,
    backgroundColor: '#10b981',
    borderRadius: 2,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  robotsList: {
    paddingVertical: 20,
  },
  robotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  robotHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  robotPowerButton: {
    padding: 8,
    borderRadius: 8,
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
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  robotMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  },
  robotTask: {
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  navLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 12,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '600',
  },
  
  // Detail View Styles
  detailContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  detailHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  detailHeaderContent: {
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  powerStateIndicator: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  powerStateIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  powerGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  detailPowerButton: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  controlButton: {
    width: (width - 52) / 2,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  taskCard: {
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
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  taskDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  emergencyButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});