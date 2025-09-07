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
  Bot,
  Users,
  Heart,
  MessageCircle,
  Activity,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Shield,
  Smile,
  Volume2
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface SocialRobot {
  id: string;
  name: string;
  type: 'companion' | 'therapy' | 'assistant' | 'entertainment';
  status: 'active' | 'idle' | 'charging' | 'maintenance';
  location: string;
  batteryLevel: number;
  currentTask: string;
  patientsInteracted: number;
  emotionalState: 'happy' | 'neutral' | 'concerned' | 'excited';
  lastInteraction: string;
}

interface Interaction {
  id: string;
  robotId: string;
  patientName: string;
  type: 'conversation' | 'therapy' | 'entertainment' | 'assistance';
  duration: number;
  satisfaction: number;
  timestamp: string;
  notes: string;
}

const RobotCard: React.FC<{ robot: SocialRobot; onPress: () => void }> = ({ robot, onPress }) => {
  const getStatusColor = () => {
    switch (robot.status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'charging': return '#3b82f6';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = () => {
    switch (robot.type) {
      case 'companion': return <Heart size={20} color="#667eea" />;
      case 'therapy': return <Activity size={20} color="#667eea" />;
      case 'assistant': return <Bot size={20} color="#667eea" />;
      case 'entertainment': return <Smile size={20} color="#667eea" />;
      default: return <Bot size={20} color="#667eea" />;
    }
  };

  const getEmotionColor = () => {
    switch (robot.emotionalState) {
      case 'happy': return '#10b981';
      case 'excited': return '#f59e0b';
      case 'concerned': return '#ef4444';
      case 'neutral': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.robotCard} onPress={onPress}>
      <View style={styles.robotHeader}>
        <View style={styles.robotInfo}>
          <View style={styles.robotTypeContainer}>
            {getTypeIcon()}
            <Text style={styles.robotName}>{robot.name}</Text>
          </View>
          <Text style={styles.robotLocation}>{robot.location}</Text>
        </View>
        <View style={styles.robotStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {robot.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.robotMetrics}>
        <View style={styles.robotMetric}>
          <Text style={styles.metricValue}>{robot.batteryLevel}%</Text>
          <Text style={styles.metricLabel}>Battery</Text>
        </View>
        <View style={styles.robotMetric}>
          <Text style={styles.metricValue}>{robot.patientsInteracted}</Text>
          <Text style={styles.metricLabel}>Patients</Text>
        </View>
        <View style={styles.robotMetric}>
          <View style={[styles.emotionIndicator, { backgroundColor: getEmotionColor() }]} />
          <Text style={styles.metricLabel}>{robot.emotionalState}</Text>
        </View>
      </View>
      
      <View style={styles.currentTask}>
        <MessageCircle size={14} color="#6b7280" />
        <Text style={styles.taskText}>{robot.currentTask}</Text>
      </View>
    </TouchableOpacity>
  );
};

const InteractionCard: React.FC<{ interaction: Interaction }> = ({ interaction }) => {
  const getTypeColor = () => {
    switch (interaction.type) {
      case 'conversation': return '#3b82f6';
      case 'therapy': return '#10b981';
      case 'entertainment': return '#f59e0b';
      case 'assistance': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getSatisfactionColor = () => {
    if (interaction.satisfaction >= 4) return '#10b981';
    if (interaction.satisfaction >= 3) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.interactionCard}>
      <View style={styles.interactionHeader}>
        <View style={styles.interactionInfo}>
          <Text style={styles.patientName}>{interaction.patientName}</Text>
          <Text style={styles.interactionTime}>{interaction.timestamp}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor() + '20' }]}>
          <Text style={[styles.typeText, { color: getTypeColor() }]}>
            {interaction.type.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.interactionDetails}>
        <View style={styles.interactionDetail}>
          <Text style={styles.detailLabel}>Duration:</Text>
          <Text style={styles.detailValue}>{interaction.duration} min</Text>
        </View>
        <View style={styles.interactionDetail}>
          <Text style={styles.detailLabel}>Satisfaction:</Text>
          <View style={styles.satisfactionContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text 
                key={star} 
                style={[
                  styles.star, 
                  { color: star <= interaction.satisfaction ? getSatisfactionColor() : '#e5e7eb' }
                ]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>
      </View>
      
      {interaction.notes && (
        <Text style={styles.interactionNotes}>{interaction.notes}</Text>
      )}
    </View>
  );
};

export default function SocialRobotsScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'robots' | 'interactions' | 'analytics'>('robots');
  const [robots, setRobots] = useState<SocialRobot[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    loadRobotData();
    loadInteractionData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRobotData = () => {
    const mockRobots: SocialRobot[] = [
      {
        id: '1',
        name: 'Pepper',
        type: 'companion',
        status: 'active',
        location: 'Ward A - Room 101',
        batteryLevel: 85,
        currentTask: 'Chatting with Mrs. Johnson about her grandchildren',
        patientsInteracted: 12,
        emotionalState: 'happy',
        lastInteraction: '2 minutes ago'
      },
      {
        id: '2',
        name: 'NAO',
        type: 'therapy',
        status: 'active',
        location: 'Rehabilitation Center',
        batteryLevel: 92,
        currentTask: 'Leading group therapy session',
        patientsInteracted: 8,
        emotionalState: 'excited',
        lastInteraction: '5 minutes ago'
      },
      {
        id: '3',
        name: 'Buddy',
        type: 'assistant',
        status: 'idle',
        location: 'Nurses Station',
        batteryLevel: 67,
        currentTask: 'Waiting for next assignment',
        patientsInteracted: 15,
        emotionalState: 'neutral',
        lastInteraction: '15 minutes ago'
      },
      {
        id: '4',
        name: 'Joy',
        type: 'entertainment',
        status: 'charging',
        location: 'Charging Station B',
        batteryLevel: 45,
        currentTask: 'Charging - will resume entertainment activities',
        patientsInteracted: 20,
        emotionalState: 'neutral',
        lastInteraction: '1 hour ago'
      }
    ];
    setRobots(mockRobots);
  };

  const loadInteractionData = () => {
    const mockInteractions: Interaction[] = [
      {
        id: '1',
        robotId: '1',
        patientName: 'Mrs. Johnson',
        type: 'conversation',
        duration: 25,
        satisfaction: 5,
        timestamp: '10:30 AM',
        notes: 'Patient enjoyed sharing stories about her family. Robot provided emotional support.'
      },
      {
        id: '2',
        robotId: '2',
        patientName: 'Mr. Smith',
        type: 'therapy',
        duration: 45,
        satisfaction: 4,
        timestamp: '9:15 AM',
        notes: 'Successful physical therapy session. Patient showed improvement in mobility.'
      },
      {
        id: '3',
        robotId: '3',
        patientName: 'Sarah Wilson',
        type: 'assistance',
        duration: 15,
        satisfaction: 5,
        timestamp: '8:45 AM',
        notes: 'Robot helped patient with medication reminders and scheduling.'
      },
      {
        id: '4',
        robotId: '4',
        patientName: 'Tommy Brown',
        type: 'entertainment',
        duration: 30,
        satisfaction: 5,
        timestamp: '2:20 PM',
        notes: 'Interactive games and storytelling. Child was very engaged and happy.'
      }
    ];
    setInteractions(mockInteractions);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    setRobots(prev => prev.map(robot => ({
      ...robot,
      batteryLevel: robot.status === 'charging' 
        ? Math.min(robot.batteryLevel + 2, 100)
        : Math.max(robot.batteryLevel - 1, 0)
    })));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRobotData();
    loadInteractionData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleRobotPress = (robot: SocialRobot) => {
    Alert.alert(
      `Robot: ${robot.name}`,
      `Type: ${robot.type}\nLocation: ${robot.location}\nStatus: ${robot.status}\nBattery: ${robot.batteryLevel}%\nCurrent Task: ${robot.currentTask}`,
      [
        { text: 'Send Command', onPress: () => console.log('Send command') },
        { text: 'View Details', onPress: () => console.log('View details') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeRobots = () => {
    Alert.alert(
      'AI Robot Optimization',
      'AI suggests the following optimizations:\n\n• Move Pepper to Ward B for better patient coverage\n• Schedule Joy for pediatric ward entertainment\n• Assign Buddy to assist with medication rounds\n\nEstimated efficiency improvement: 23%',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderRobots = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Robots ({robots.length})</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeRobots}>
          <Zap size={16} color="#ffffff" />
          <Text style={styles.optimizeButtonText}>AI Optimize</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.robotsContainer}>
        {robots.map((robot) => (
          <RobotCard 
            key={robot.id} 
            robot={robot} 
            onPress={() => handleRobotPress(robot)}
          />
        ))}
      </View>
    </View>
  );

  const renderInteractions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Interactions ({interactions.length})</Text>
      <View style={styles.interactionsContainer}>
        {interactions.map((interaction) => (
          <InteractionCard key={interaction.id} interaction={interaction} />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Social Robot Analytics</Text>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Users size={24} color="#3b82f6" />
          <Text style={styles.analyticsValue}>247</Text>
          <Text style={styles.analyticsLabel}>Total Interactions</Text>
          <Text style={styles.analyticsChange}>+18% this week</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Heart size={24} color="#10b981" />
          <Text style={styles.analyticsValue}>4.8</Text>
          <Text style={styles.analyticsLabel}>Avg Satisfaction</Text>
          <Text style={styles.analyticsChange}>+0.3 improvement</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Activity size={24} color="#f59e0b" />
          <Text style={styles.analyticsValue}>89%</Text>
          <Text style={styles.analyticsLabel}>Robot Uptime</Text>
          <Text style={styles.analyticsChange}>+2% this month</Text>
        </View>
        <View style={styles.analyticsCard}>
          <MessageCircle size={24} color="#8b5cf6" />
          <Text style={styles.analyticsValue}>32min</Text>
          <Text style={styles.analyticsLabel}>Avg Session</Text>
          <Text style={styles.analyticsChange}>+5min increase</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Social Robot Integration',
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
            <Text style={styles.headerTitle}>Social Robot Management</Text>
            <Text style={styles.headerSubtitle}>ROS4HRI compatible human-robot interaction</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Bot size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>4 Active</Text>
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
          style={[styles.tab, selectedView === 'robots' && styles.activeTab]}
          onPress={() => setSelectedView('robots')}
        >
          <Bot size={20} color={selectedView === 'robots' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'robots' && styles.activeTabText]}>Robots</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'interactions' && styles.activeTab]}
          onPress={() => setSelectedView('interactions')}
        >
          <MessageCircle size={20} color={selectedView === 'interactions' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'interactions' && styles.activeTabText]}>Interactions</Text>
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
        {selectedView === 'robots' && renderRobots()}
        {selectedView === 'interactions' && renderInteractions()}
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
  robotsContainer: {
    gap: 12,
  },
  robotCard: {
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
  robotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  robotInfo: {
    flex: 1,
  },
  robotTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  robotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  robotLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  robotStatus: {
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
  robotMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  robotMetric: {
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
  emotionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  currentTask: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  taskText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
    lineHeight: 20,
  },
  interactionsContainer: {
    gap: 12,
  },
  interactionCard: {
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
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  interactionInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  interactionTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  interactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  interactionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  satisfactionContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
  },
  interactionNotes: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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