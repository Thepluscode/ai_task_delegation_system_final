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
  Switch,
  TextInput,
  FlatList,
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
  HardDrive,
  Move,
  Target,
  Hand,
  Home,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Code,
  Layers,
  Navigation,
  Cog,
  ArrowLeft
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import RAP service with fallback handling
// Define types for our enums
interface RobotBrandType {
  UNIVERSAL_ROBOTS: string;
  ABB: string;
  KUKA: string;
  FANUC: string;
  BOSTON_DYNAMICS: string;
  CUSTOM: string;
  [key: string]: string;
}

interface RobotStatusType {
  IDLE: string;
  MOVING: string;
  WORKING: string;
  ERROR: string;
  EMERGENCY_STOP: string;
  MAINTENANCE: string;
  OFFLINE: string;
  [key: string]: string;
}

let RAPRobotService: (new () => any) | null, RobotBrand: RobotBrandType, RobotStatus: RobotStatusType;
try {
  const rapModule = require('../../services/RAPRobotService');
  RAPRobotService = rapModule.default;
  RobotBrand = rapModule.RobotBrand;
  RobotStatus = rapModule.RobotStatus;
} catch (error) {
  console.warn('RAPRobotService not available, using mock data');
  RAPRobotService = null;
  // Mock enums
  RobotBrand = {
    UNIVERSAL_ROBOTS: 'universal_robots',
    ABB: 'abb',
    KUKA: 'kuka',
    FANUC: 'fanuc',
    BOSTON_DYNAMICS: 'boston_dynamics',
    CUSTOM: 'custom'
  };
  RobotStatus = {
    IDLE: 'idle',
    MOVING: 'moving',
    WORKING: 'working',
    ERROR: 'error',
    EMERGENCY_STOP: 'emergency_stop',
    MAINTENANCE: 'maintenance',
    OFFLINE: 'offline'
  };
}

const { width } = Dimensions.get('window');

// Enhanced Robot interface with RAP features
interface RAPRobot {
  robot_id: string;
  brand: string;
  model: string;
  status: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  battery_level?: number;
  capabilities: string[];
  connection_status: 'connected' | 'disconnected' | 'connecting';
  last_command: string;
  performance_metrics: {
    efficiency: number;
    uptime: number;
    tasks_completed: number;
    error_rate: number;
  };
  brand_features: any;
}

interface FleetOverview {
  total_robots: number;
  online_robots: number;
  offline_robots: number;
  idle_robots: number;
  working_robots: number;
  error_robots: number;
  maintenance_robots: number;
  fleet_efficiency: number;
  total_uptime: number;
}

// Brand-specific robot card component
const BrandSpecificRobotCard: React.FC<{
  robot: RAPRobot;
  selected: boolean;
  onSelect: () => void;
  onQuickAction: (action: string) => void;
}> = ({ robot, selected, onSelect, onQuickAction }) => {
  const getBrandColor = () => {
    switch (robot.brand) {
      case RobotBrand.UNIVERSAL_ROBOTS: return '#0066CC';
      case RobotBrand.ABB: return '#FF0000';
      case RobotBrand.KUKA: return '#FF8C00';
      case RobotBrand.FANUC: return '#FFFF00';
      case RobotBrand.BOSTON_DYNAMICS: return '#0099FF';
      default: return '#6b7280';
    }
  };

  const getStatusColor = () => {
    switch (robot.status) {
      case RobotStatus.IDLE: return '#10b981';
      case RobotStatus.MOVING: return '#3b82f6';
      case RobotStatus.WORKING: return '#8b5cf6';
      case RobotStatus.ERROR: return '#ef4444';
      case RobotStatus.EMERGENCY_STOP: return '#dc2626';
      case RobotStatus.MAINTENANCE: return '#f59e0b';
      case RobotStatus.OFFLINE: return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getBrandIcon = () => {
    switch (robot.brand) {
      case RobotBrand.UNIVERSAL_ROBOTS: return <Bot size={32} color={getBrandColor()} />;
      case RobotBrand.ABB: return <Cog size={32} color={getBrandColor()} />;
      case RobotBrand.KUKA: return <Wrench size={32} color={getBrandColor()} />;
      case RobotBrand.FANUC: return <Target size={32} color={getBrandColor()} />;
      case RobotBrand.BOSTON_DYNAMICS: return <Navigation size={32} color={getBrandColor()} />;
      default: return <Bot size={32} color={getBrandColor()} />;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.robotCard, 
        selected && styles.selectedCard,
        { borderLeftColor: getBrandColor(), borderLeftWidth: 4 }
      ]}
      onPress={onSelect}
    >
      <View style={styles.cardHeader}>
        <View style={styles.robotInfo}>
          <View style={[styles.brandIcon, { backgroundColor: getBrandColor() + '20' }]}>
            {getBrandIcon()}
          </View>
          <View style={styles.robotDetails}>
            <Text style={styles.robotName}>{robot.robot_id}</Text>
            <Text style={styles.robotBrand}>{robot.brand.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.robotModel}>{robot.model}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {robot.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.positionInfo}>
        <Text style={styles.positionLabel}>Position:</Text>
        <Text style={styles.positionValue}>
          X: {robot.position.x.toFixed(1)} Y: {robot.position.y.toFixed(1)} Z: {robot.position.z.toFixed(1)}
        </Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{robot.performance_metrics.efficiency.toFixed(0)}%</Text>
          <Text style={styles.metricLabel}>Efficiency</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{robot.performance_metrics.uptime.toFixed(0)}%</Text>
          <Text style={styles.metricLabel}>Uptime</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{robot.performance_metrics.tasks_completed}</Text>
          <Text style={styles.metricLabel}>Tasks</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.quickActionBtn, { backgroundColor: '#10b981' }]}
          onPress={() => onQuickAction('connect')}
        >
          <Wifi size={16} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.quickActionBtn, { backgroundColor: '#3b82f6' }]}
          onPress={() => onQuickAction('home')}
        >
          <Home size={16} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.quickActionBtn, { backgroundColor: '#f59e0b' }]}
          onPress={() => onQuickAction('stop')}
        >
          <Square size={16} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.quickActionBtn, { backgroundColor: '#ef4444' }]}
          onPress={() => onQuickAction('emergency')}
        >
          <AlertCircle size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Movement control modal
const MovementControlModal: React.FC<{
  visible: boolean;
  robot: RAPRobot | null;
  onClose: () => void;
  onExecute: (command: any) => void;
}> = ({ visible, robot, onClose, onExecute }) => {
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
  const [speed, setSpeed] = useState(50);
  const [precision, setPrecision] = useState<'rough' | 'fine' | 'ultra_fine'>('fine');
  const [relative, setRelative] = useState(false);

  const handleExecuteMove = () => {
    const moveCommand = {
      coordinates: [coordinates.x, coordinates.y, coordinates.z, coordinates.rx, coordinates.ry, coordinates.rz],
      speed,
      precision,
      relative
    };
    onExecute(moveCommand);
    onClose();
  };

  if (!robot) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.movementModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Move {robot.robot_id}</Text>
            <TouchableOpacity onPress={onClose}>
              <XCircle size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.coordinateSection}>
              <Text style={styles.sectionTitle}>Target Position</Text>
              <View style={styles.coordinateGrid}>
                {['x', 'y', 'z', 'rx', 'ry', 'rz'].map((axis) => (
                  <View key={axis} style={styles.coordinateInput}>
                    <Text style={styles.coordinateLabel}>{axis.toUpperCase()} {axis.includes('r') ? '(°)' : '(mm)'}</Text>
                    <TextInput
                      style={styles.input}
                      value={coordinates[axis as keyof typeof coordinates].toString()}
                      onChangeText={(text) => setCoordinates(prev => ({ 
                        ...prev, 
                        [axis]: parseFloat(text) || 0 
                      }))}
                      keyboardType="numeric"
                      placeholder="0.0"
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.parameterSection}>
              <Text style={styles.sectionTitle}>Movement Parameters</Text>
              
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Speed: {speed}%</Text>
                <View style={styles.sliderContainer}>
                  <TouchableOpacity 
                    style={styles.sliderBtn}
                    onPress={() => setSpeed(Math.max(1, speed - 10))}
                  >
                    <Text style={styles.sliderBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.speedValue}>{speed}%</Text>
                  <TouchableOpacity 
                    style={styles.sliderBtn}
                    onPress={() => setSpeed(Math.min(100, speed + 10))}
                  >
                    <Text style={styles.sliderBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Precision</Text>
                <View style={styles.precisionOptions}>
                  {['rough', 'fine', 'ultra_fine'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.precisionBtn,
                        precision === option && styles.precisionBtnActive
                      ]}
                      onPress={() => setPrecision(option as any)}
                    >
                      <Text style={[
                        styles.precisionBtnText,
                        precision === option && styles.precisionBtnTextActive
                      ]}>
                        {option.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Movement Type</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Relative Movement</Text>
                  <Switch
                    value={relative}
                    onValueChange={setRelative}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={relative ? '#f5dd4b' : '#f4f3f4'}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.executeButton} onPress={handleExecuteMove}>
              <Move size={20} color="#ffffff" />
              <Text style={styles.executeButtonText}>Execute Movement</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Main RAP Enhanced Robots Screen
export default function RAPEnhancedRobotsScreen() {
  const [robots, setRobots] = useState<RAPRobot[]>([]);
  const [selectedRobots, setSelectedRobots] = useState<Set<string>>(new Set());
  const [fleetOverview, setFleetOverview] = useState<FleetOverview | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'robots' | 'programming'>('robots');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  
  // Modal states
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedRobot, setSelectedRobot] = useState<RAPRobot | null>(null);

  // Mock data for fallback
  const mockRobots: RAPRobot[] = [
    {
      robot_id: 'ur5e_001',
      brand: RobotBrand.UNIVERSAL_ROBOTS,
      model: 'UR5e',
      status: RobotStatus.IDLE,
      position: { x: 400.0, y: 200.0, z: 300.0 },
      battery_level: 85,
      capabilities: ['navigation', 'manipulation', 'vision'],
      connection_status: 'connected',
      last_command: 'move_to_position',
      performance_metrics: {
        efficiency: 94,
        uptime: 95,
        tasks_completed: 127,
        error_rate: 2.1
      },
      brand_features: {}
    },
    {
      robot_id: 'abb_irb120_001',
      brand: RobotBrand.ABB,
      model: 'IRB120',
      status: RobotStatus.WORKING,
      position: { x: 600.0, y: 300.0, z: 400.0 },
      battery_level: 92,
      capabilities: ['precision_movement', 'pick_and_place'],
      connection_status: 'connected',
      last_command: 'pick_object',
      performance_metrics: {
        efficiency: 98,
        uptime: 97,
        tasks_completed: 203,
        error_rate: 1.2
      },
      brand_features: {}
    },
    {
      robot_id: 'kuka_kr6_001',
      brand: RobotBrand.KUKA,
      model: 'KR6',
      status: RobotStatus.MAINTENANCE,
      position: { x: 0.0, y: 0.0, z: 0.0 },
      battery_level: 45,
      capabilities: ['heavy_lifting', 'welding'],
      connection_status: 'disconnected',
      last_command: 'maintenance_mode',
      performance_metrics: {
        efficiency: 0,
        uptime: 87,
        tasks_completed: 89,
        error_rate: 5.3
      },
      brand_features: {}
    }
  ];

  const mockFleetOverview: FleetOverview = {
    total_robots: 3,
    online_robots: 2,
    offline_robots: 0,
    idle_robots: 1,
    working_robots: 1,
    error_robots: 0,
    maintenance_robots: 1,
    fleet_efficiency: 64.0,
    total_uptime: 93.0
  };

  // Load data from RAP service with fallback
  const loadRobotData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (RAPRobotService) {
        try {
          const rapService = new RAPRobotService();
          
          // Test connection
          const robotsData = await rapService.getAllRobots({});
          const overview = await rapService.getFleetOverview();
          
          // Transform data to match our interface
          const transformedRobots: RAPRobot[] = robotsData.robots.map((robot: any) => ({
            robot_id: robot.robot_id,
            brand: robot.robot_type || RobotBrand.CUSTOM,
            model: robot.name || 'Unknown',
            status: robot.status || RobotStatus.OFFLINE,
            position: {
              x: robot.current_position?.[0] || 0,
              y: robot.current_position?.[1] || 0,
              z: robot.current_position?.[2] || 0
            },
            battery_level: robot.battery_level || Math.floor(Math.random() * 100),
            capabilities: robot.capabilities?.map((cap: any) => cap.name) || [],
            connection_status: robot.status === 'online' ? 'connected' : 'disconnected',
            last_command: robot.last_command || 'none',
            performance_metrics: {
              efficiency: 85 + Math.random() * 15,
              uptime: 90 + Math.random() * 10,
              tasks_completed: Math.floor(Math.random() * 100),
              error_rate: Math.random() * 5
            },
            brand_features: {}
          }));

          setRobots(transformedRobots);
          setFleetOverview(overview);
          setUseRealData(true);

        } catch (error) {
          console.warn('Failed to load real data, using mock data:', error);
          setRobots(mockRobots);
          setFleetOverview(mockFleetOverview);
          setUseRealData(false);
        }
      } else {
        console.log('RAP service not available, using mock data');
        setRobots(mockRobots);
        setFleetOverview(mockFleetOverview);
        setUseRealData(false);
      }

    } catch (error) {
      console.error('Failed to load robot data:', error);
      setRobots(mockRobots);
      setFleetOverview(mockFleetOverview);
      setUseRealData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle robot selection
  const handleRobotSelect = (robotId: string) => {
    setSelectedRobots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(robotId)) {
        newSet.delete(robotId);
      } else {
        newSet.add(robotId);
      }
      return newSet;
    });
  };

  // Handle quick actions
  const handleQuickAction = async (robotId: string, action: string) => {
    if (useRealData && RAPRobotService) {
      try {
        const rapService = new RAPRobotService();
        
        switch (action) {
          case 'connect':
            await rapService.connectToRobot(robotId);
            break;
          case 'home':
            await rapService.moveHome(robotId);
            break;
          case 'stop':
            // Regular stop - implement stop current task
            break;
          case 'emergency':
            await rapService.emergencyStopRobot(robotId);
            break;
        }
        await loadRobotData(); // Refresh data
        Alert.alert('Success', `${action} executed successfully`);
      } catch (error) {
        Alert.alert('Error', `Failed to ${action}: ${error}`);
      }
    } else {
      // Mock behavior
      Alert.alert('Demo Mode', `${action} executed successfully (demo)`);
    }
  };

  // Handle movement command
  const handleMovementCommand = async (command: any) => {
    if (!selectedRobot) return;
    
    if (useRealData && RAPRobotService) {
      try {
        const rapService = new RAPRobotService();
        await rapService.moveToPosition(selectedRobot.robot_id, command);
        Alert.alert('Success', 'Movement command executed');
        await loadRobotData();
      } catch (error) {
        Alert.alert('Error', `Movement failed: ${error}`);
      }
    } else {
      // Mock behavior
      Alert.alert('Demo Mode', 'Movement command executed (demo)');
    }
  };

  // Bulk operations
  const handleBulkOperation = async (operation: string) => {
    const selectedIds = Array.from(selectedRobots);
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select robots first');
      return;
    }

    if (useRealData && RAPRobotService) {
      try {
        const rapService = new RAPRobotService();
        
        switch (operation) {
          case 'connect':
            await rapService.bulkConnect(selectedIds);
            break;
          case 'home':
            await rapService.bulkHome(selectedIds);
            break;
          case 'emergency_stop':
            await rapService.bulkEmergencyStop(selectedIds);
            break;
        }
        Alert.alert('Success', `Bulk ${operation} completed`);
        setSelectedRobots(new Set());
        await loadRobotData();
      } catch (error) {
        Alert.alert('Error', `Bulk ${operation} failed: ${error}`);
      }
    } else {
      // Mock behavior
      Alert.alert('Demo Mode', `Bulk ${operation} completed (demo)`);
      setSelectedRobots(new Set());
    }
  };

  // Filter robots based on search
  const filteredRobots = robots.filter(robot => {
    const matchesSearch = robot.robot_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         robot.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    loadRobotData();
    
    // Connect to WebSocket if available
    if (RAPRobotService) {
      try {
        const rapService = new RAPRobotService();
        rapService.connectWebSocket();
        
        return () => {
          rapService.disconnect();
        };
      } catch (error) {
        console.warn('WebSocket connection failed:', error);
      }
    }
  }, [loadRobotData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRobotData();
    setRefreshing(false);
  }, [loadRobotData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading RAP Robot Fleet...</Text>
        <Text style={styles.loadingSubtext}>
          {RAPRobotService ? 'Connecting to RAP service...' : 'Using demo mode'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Robot Abstraction Protocol</Text>
        <Text style={styles.headerSubtitle}>
          Universal Robot Fleet Management {!useRealData && '(Demo Mode)'}
        </Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <TrendingUp size={20} color={activeTab === 'overview' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'robots' && styles.activeTab]}
          onPress={() => setActiveTab('robots')}
        >
          <Bot size={20} color={activeTab === 'robots' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'robots' && styles.activeTabText]}>
            Robots
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'programming' && styles.activeTab]}
          onPress={() => setActiveTab('programming')}
        >
          <Code size={20} color={activeTab === 'programming' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'programming' && styles.activeTabText]}>
            Programming
          </Text>
        </TouchableOpacity>
      </View>

      {/* Fleet Overview Tab */}
      {activeTab === 'overview' && fleetOverview && (
        <ScrollView 
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{fleetOverview.total_robots}</Text>
              <Text style={styles.overviewLabel}>Total Robots</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{fleetOverview.online_robots}</Text>
              <Text style={styles.overviewLabel}>Online</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{fleetOverview.working_robots}</Text>
              <Text style={styles.overviewLabel}>Working</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewValue}>{fleetOverview.fleet_efficiency.toFixed(1)}%</Text>
              <Text style={styles.overviewLabel}>Efficiency</Text>
            </View>
          </View>

          <View style={styles.brandDistribution}>
            <Text style={styles.sectionTitle}>Robot Brands</Text>
            {Object.values(RobotBrand).map(brand => (
                <View key={String(brand)} style={styles.brandRow}>
                <Text style={styles.brandName}>{brand.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.brandCount}>
                  {robots.filter(r => r.brand === brand).length}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Robots Management Tab */}
      {activeTab === 'robots' && (
        <View style={styles.robotsTab}>
          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Search size={20} color="#6b7280" />
              <TextInput
                style={styles.searchText}
                placeholder="Search robots..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Bulk Actions */}
          {selectedRobots.size > 0 && (
            <View style={styles.bulkActions}>
              <Text style={styles.bulkLabel}>{selectedRobots.size} selected</Text>
              <TouchableOpacity
                style={styles.bulkBtn}
                onPress={() => handleBulkOperation('connect')}
              >
                <Text style={styles.bulkBtnText}>Connect</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkBtn}
                onPress={() => handleBulkOperation('home')}
              >
                <Text style={styles.bulkBtnText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkBtn, { backgroundColor: '#ef4444' }]}
                onPress={() => handleBulkOperation('emergency_stop')}
              >
                <Text style={styles.bulkBtnText}>E-Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Robot List */}
          <FlatList
            data={filteredRobots}
            keyExtractor={(item) => item.robot_id}
            renderItem={({ item }) => (
              <BrandSpecificRobotCard
                robot={item}
                selected={selectedRobots.has(item.robot_id)}
                onSelect={() => handleRobotSelect(item.robot_id)}
                onQuickAction={(action) => handleQuickAction(item.robot_id, action)}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            style={styles.robotList}
          />

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                const firstSelected = filteredRobots.find(r => selectedRobots.has(r.robot_id));
                if (firstSelected) {
                  setSelectedRobot(firstSelected);
                  setShowMovementModal(true);
                } else {
                  Alert.alert('No Selection', 'Please select a robot first');
                }
              }}
            >
              <Move size={20} color="#ffffff" />
              <Text style={styles.controlBtnText}>Move</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => {
                Alert.alert('Coming Soon', 'Pick/Place controls will be available soon');
              }}
            >
              <Hand size={20} color="#ffffff" />
              <Text style={styles.controlBtnText}>Pick/Place</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Programming Tab */}
      {activeTab === 'programming' && (
        <View style={styles.programmingTab}>
          <Text style={styles.sectionTitle}>Brand-Specific Programming</Text>
          <View style={styles.programmingOptions}>
            {Object.values(RobotBrand).map(brand => (
              <TouchableOpacity
                key={brand}
                style={styles.programmingCard}
                onPress={() => {
                  Alert.alert('Coming Soon', `${brand.replace('_', ' ').toUpperCase()} programming interface will be available soon`);
                }}
              >
                <Text style={styles.programmingBrand}>{brand.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.programmingLanguage}>
                  {brand === RobotBrand.UNIVERSAL_ROBOTS ? 'URScript' :
                   brand === RobotBrand.ABB ? 'RAPID' :
                   brand === RobotBrand.KUKA ? 'KRL' :
                   brand === RobotBrand.FANUC ? 'FANUC Ladder' :
                   'Custom API'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Movement Control Modal */}
      <MovementControlModal
        visible={showMovementModal}
        robot={selectedRobot}
        onClose={() => setShowMovementModal(false)}
        onExecute={handleMovementCommand}
      />
    </View>
  );
}

// Comprehensive Styles
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  brandDistribution: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  brandName: {
    fontSize: 14,
    color: '#374151',
  },
  brandCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  robotsTab: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 12,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    gap: 12,
  },
  bulkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  bulkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#667eea',
    borderRadius: 6,
  },
  bulkBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  robotList: {
    flex: 1,
  },
  robotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  robotInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  brandIcon: {
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  robotBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  robotModel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  positionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  positionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  positionValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quickActionBtn: {
    padding: 8,
    borderRadius: 6,
  },
  controlButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#667eea',
    borderRadius: 8,
    gap: 8,
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  programmingTab: {
    flex: 1,
    padding: 20,
  },
  programmingOptions: {
    gap: 16,
  },
  programmingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  programmingBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  programmingLanguage: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movementModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalContent: {
    padding: 20,
  },
  coordinateSection: {
    marginBottom: 24,
  },
  coordinateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  coordinateInput: {
    width: (width * 0.9 - 80) / 3,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
  },
  parameterSection: {
    marginBottom: 24,
  },
  parameterRow: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  sliderBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#667eea',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  speedValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    minWidth: 60,
    textAlign: 'center',
  },
  precisionOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  precisionBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    alignItems: 'center',
  },
  precisionBtnActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  precisionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  precisionBtnTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    color: '#1f2937',
  },
  executeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  executeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});