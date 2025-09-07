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
  Brain,
  Users,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  Clock,
  BarChart3,
  Lightbulb,
  Zap,
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface LearningPath {
  id: string;
  studentName: string;
  subject: string;
  progress: number;
  currentLevel: string;
  nextMilestone: string;
  adaptations: string[];
  performance: 'excellent' | 'good' | 'needs-improvement';
  timeSpent: number;
  completedModules: number;
  totalModules: number;
}

interface LearningMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const LearningPathCard: React.FC<{ path: LearningPath; onPress: () => void }> = ({ path, onPress }) => {
  const getPerformanceColor = () => {
    switch (path.performance) {
      case 'excellent': return '#10b981';
      case 'good': return '#f59e0b';
      case 'needs-improvement': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.pathCard} onPress={onPress}>
      <View style={styles.pathHeader}>
        <View style={styles.pathInfo}>
          <Text style={styles.studentName}>{path.studentName}</Text>
          <Text style={styles.subject}>{path.subject}</Text>
        </View>
        <View style={[styles.performanceBadge, { backgroundColor: getPerformanceColor() + '20' }]}>
          <Text style={[styles.performanceText, { color: getPerformanceColor() }]}>
            {path.performance.replace('-', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress: {path.progress}%</Text>
          <Text style={styles.levelText}>Level: {path.currentLevel}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressTrack}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${path.progress}%`,
                  backgroundColor: getPerformanceColor()
                }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.pathStats}>
        <View style={styles.pathStat}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.statText}>{path.timeSpent}h</Text>
        </View>
        <View style={styles.pathStat}>
          <BookOpen size={14} color="#6b7280" />
          <Text style={styles.statText}>{path.completedModules}/{path.totalModules}</Text>
        </View>
        <View style={styles.pathStat}>
          <Target size={14} color="#6b7280" />
          <Text style={styles.statText}>{path.nextMilestone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function PersonalizedLearningScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'paths' | 'analytics'>('overview');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [learningMetrics, setLearningMetrics] = useState<LearningMetric[]>([]);

  useEffect(() => {
    loadLearningData();
    loadMetrics();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLearningData = () => {
    const mockPaths: LearningPath[] = [
      {
        id: '1',
        studentName: 'Emma Johnson',
        subject: 'Mathematics',
        progress: 78,
        currentLevel: 'Advanced Algebra',
        nextMilestone: 'Calculus Prep',
        adaptations: ['Visual Learning', 'Extra Practice'],
        performance: 'excellent',
        timeSpent: 24,
        completedModules: 12,
        totalModules: 16
      },
      {
        id: '2',
        studentName: 'Alex Chen',
        subject: 'Science',
        progress: 65,
        currentLevel: 'Chemistry Basics',
        nextMilestone: 'Organic Chemistry',
        adaptations: ['Hands-on Labs', 'Peer Collaboration'],
        performance: 'good',
        timeSpent: 18,
        completedModules: 8,
        totalModules: 12
      },
      {
        id: '3',
        studentName: 'Sarah Williams',
        subject: 'English Literature',
        progress: 45,
        currentLevel: 'Poetry Analysis',
        nextMilestone: 'Essay Writing',
        adaptations: ['Audio Support', 'Extended Time'],
        performance: 'needs-improvement',
        timeSpent: 15,
        completedModules: 5,
        totalModules: 14
      },
      {
        id: '4',
        studentName: 'Michael Brown',
        subject: 'History',
        progress: 82,
        currentLevel: 'World War II',
        nextMilestone: 'Cold War Era',
        adaptations: ['Interactive Timeline', 'Documentary Videos'],
        performance: 'excellent',
        timeSpent: 22,
        completedModules: 11,
        totalModules: 13
      }
    ];
    setLearningPaths(mockPaths);
  };

  const loadMetrics = () => {
    const mockMetrics: LearningMetric[] = [
      {
        title: 'Active Students',
        value: '1,247',
        change: '+8.2%',
        isPositive: true,
        icon: <Users size={20} color="#3b82f6" />,
        color: '#3b82f6'
      },
      {
        title: 'Avg Progress',
        value: '67%',
        change: '+12.5%',
        isPositive: true,
        icon: <TrendingUp size={20} color="#10b981" />,
        color: '#10b981'
      },
      {
        title: 'Engagement Rate',
        value: '89%',
        change: '+5.1%',
        isPositive: true,
        icon: <Brain size={20} color="#8b5cf6" />,
        color: '#8b5cf6'
      },
      {
        title: 'Completion Rate',
        value: '74%',
        change: '+3.8%',
        isPositive: true,
        icon: <Award size={20} color="#f59e0b" />,
        color: '#f59e0b'
      }
    ];
    setLearningMetrics(mockMetrics);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    setLearningPaths(prev => prev.map(path => ({
      ...path,
      timeSpent: path.timeSpent + Math.random() * 0.5
    })));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadLearningData();
    loadMetrics();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handlePathPress = (path: LearningPath) => {
    Alert.alert(
      `${path.studentName} - ${path.subject}`,
      `Progress: ${path.progress}%\nLevel: ${path.currentLevel}\nNext: ${path.nextMilestone}\nTime Spent: ${path.timeSpent} hours\nAdaptations: ${path.adaptations.join(', ')}`,
      [
        { text: 'Adjust Path', onPress: () => console.log('Adjust learning path') },
        { text: 'View Details', onPress: () => console.log('View detailed analytics') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeLearning = () => {
    Alert.alert(
      'AI Learning Optimization',
      'AI has analyzed student performance and suggests:\n\n• Increase visual content for Emma\n• Add more interactive labs for Alex\n• Provide additional reading support for Sarah\n• Accelerate Michael\'s progression\n\nEstimated improvement: 15% better outcomes',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderOverview = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Metrics</Text>
        <View style={styles.metricsGrid}>
          {learningMetrics.map((metric, index) => (
            <View key={index} style={[styles.metricCard, { borderLeftColor: metric.color }]}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIconContainer, { backgroundColor: metric.color + '20' }]}>
                  {metric.icon}
                </View>
                <View style={styles.metricChange}>
                  <TrendingUp size={16} color="#10b981" />
                  <Text style={[styles.changeText, { color: metric.isPositive ? '#10b981' : '#ef4444' }]}>
                    {metric.change}
                  </Text>
                </View>
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricTitle}>{metric.title}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Learning Paths</Text>
          <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeLearning}>
            <Zap size={16} color="#ffffff" />
            <Text style={styles.optimizeButtonText}>AI Optimize</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.pathsContainer}>
          {learningPaths.slice(0, 3).map((path) => (
            <LearningPathCard 
              key={path.id} 
              path={path} 
              onPress={() => handlePathPress(path)}
            />
          ))}
        </View>
      </View>
    </>
  );

  const renderPaths = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Learning Paths ({learningPaths.length})</Text>
      <View style={styles.pathsContainer}>
        {learningPaths.map((path) => (
          <LearningPathCard 
            key={path.id} 
            path={path} 
            onPress={() => handlePathPress(path)}
          />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Learning Analytics</Text>
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsCard}>
          <Lightbulb size={24} color="#f59e0b" />
          <Text style={styles.analyticsTitle}>AI Insights</Text>
          <Text style={styles.analyticsText}>
            Students show 23% better retention with personalized content adaptation
          </Text>
        </View>
        <View style={styles.analyticsCard}>
          <BarChart3 size={24} color="#3b82f6" />
          <Text style={styles.analyticsTitle}>Performance Trends</Text>
          <Text style={styles.analyticsText}>
            Mathematics and Science courses show highest engagement rates
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Personalized Learning Engine',
          headerShown: true,
          headerStyle: { backgroundColor: '#43e97b' },
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
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Personalized Learning</Text>
            <Text style={styles.headerSubtitle}>AI-powered adaptive education</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Brain size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>1,247 Students</Text>
            </View>
            <View style={styles.headerStat}>
              <Shield size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>FERPA Secure</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <BarChart3 size={20} color={selectedView === 'overview' ? '#43e97b' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'paths' && styles.activeTab]}
          onPress={() => setSelectedView('paths')}
        >
          <BookOpen size={20} color={selectedView === 'paths' ? '#43e97b' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'paths' && styles.activeTabText]}>Paths</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'analytics' && styles.activeTab]}
          onPress={() => setSelectedView('analytics')}
        >
          <Brain size={20} color={selectedView === 'analytics' ? '#43e97b' : '#6b7280'} />
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
        {selectedView === 'overview' && renderOverview()}
        {selectedView === 'paths' && renderPaths()}
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
    backgroundColor: '#43e97b20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#43e97b',
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
    backgroundColor: '#43e97b',
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
  pathsContainer: {
    gap: 12,
  },
  pathCard: {
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
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pathInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subject: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  performanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performanceText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  levelText: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pathStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  analyticsContainer: {
    gap: 12,
  },
  analyticsCard: {
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
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});