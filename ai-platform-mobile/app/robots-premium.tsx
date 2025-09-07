import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, 
  RefreshControl, Dimensions, Animated, Easing, Platform } from 'react-native';
import { Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { AlertTriangle, Settings, Search, Filter, BarChart, 
  Zap, Cpu, ChevronRight, Calendar, Clock } from 'lucide-react-native';
import { useAuth } from '../services/context/AuthContext';
import { robotService, Robot, RobotMetrics } from '../services/api/robotService';
import { LinearGradient } from 'expo-linear-gradient';
// Removed BlurView import since package is not available

// Get screen dimensions
const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

export default function RobotsPremiumScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [robots, setRobots] = React.useState<Robot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState('All');
  const [metrics, setMetrics] = React.useState<RobotMetrics | null>(null);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;
  const cardScale = React.useRef(new Animated.Value(0.95)).current;
  
  // Calculate system overview stats
  const activeRobots = robots.filter(r => r.status === 'Active').length;
  const totalTasks = robots.reduce((sum, robot) => sum + robot.tasks, 0);
  const avgEfficiency = activeRobots > 0 
    ? robots
        .filter(r => r.status === 'Active')
        .reduce((sum, robot) => sum + parseFloat(robot.efficiency), 0) / activeRobots
    : 0;

  // Filter options
  const filterOptions = ['All', 'Active', 'Maintenance', 'Offline'];

  // Load data from robotService
  const loadRobots = React.useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await robotService.getRobots();
      setRobots(data);
      setError(null);
      
      // Fake metrics data for demo with all required properties
      const mockMetrics: RobotMetrics = {
        taskCompletion: 98.5,
        errorRate: 1.5,
        responseTime: 120,
        uptime: 99.9,
        efficiencyScore: 96.7,
        // Add the missing security metrics
        securityScore: 92.0,
        vulnerabilityCount: 1,
        encryptionStrength: 256,
        lastSecurityScan: new Date().toISOString(),
        complianceScore: 96.0,
        threatDetections: 2
      };
      setMetrics(mockMetrics);
      
      // Start animations
      animateContent();
    } catch (err) {
      console.error("Failed to load robots:", err);
      setError('Failed to load robot data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  // Animation function
  const animateContent = () => {
    // Reset animations
    fadeAnim.setValue(0);
    translateY.setValue(50);
    cardScale.setValue(0.95);
    
    // Run animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      })
    ]).start();
  };

  // Initial load
  React.useEffect(() => {
    loadRobots();
  }, [isAuthenticated, loadRobots]);

  // Pull to refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadRobots();
  }, [loadRobots]);

  const handleRobotPress = (robot: Robot) => {
    // In a real implementation, we would navigate to a robot detail screen
    console.log('Robot pressed:', robot.name);
    // router.push(`/robot-details/${robot.id}`);
  };

  const filteredRobots = React.useMemo(() => {
    if (selectedFilter === 'All') return robots;
    return robots.filter(robot => robot.status === selectedFilter);
  }, [robots, selectedFilter]);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return ['#28a745', '#20c997'];
      case 'Maintenance': return ['#ffc107', '#fd7e14'];
      case 'Offline': return ['#6c757d', '#495057'];
      default: return ['#6c757d', '#495057'];
    }
  };

  // Show loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: '',
            headerShown: true,
            headerTransparent: true,
          }}
        />
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingLogo}>
              <Cpu size={48} color="#fff" />
            </View>
            <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>Loading intelligent automation data...</Text>
            <Text style={styles.loadingSubtext}>Connecting to secure network</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: '',
            headerShown: true,
            headerTransparent: true,
          }}
        />
        <LinearGradient
          colors={['#cb2d3e', '#ef473a']}
          style={styles.errorGradient}
        >
          <View style={styles.errorContainer}>
            <AlertTriangle size={64} color="#fff" />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                loadRobots();
              }}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: '',
          headerShown: true,
          headerTransparent: true,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity style={styles.headerButton}>
                <Search size={22} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Settings size={22} color="#333" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#6c5ce7"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.headerSection, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: translateY }] 
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeText}>
                  Welcome back, {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </Text>
                <Text style={styles.welcomeSubtext}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: user?.profileImage || 'https://i.pravatar.cc/100' }}
                  style={styles.avatar}
                />
                <View style={styles.avatarBadge} />
              </View>
            </View>
            
            <Text style={styles.title}>AI Robotics Platform</Text>
            <Text style={styles.subtitle}>Enterprise Automation Suite</Text>
          </View>

          <View style={styles.statsOverviewContainer}>
            <LinearGradient
              colors={['#6c5ce7', '#a55eea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsCard}
            >
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeRobots}/{robots.length}</Text>
                  <Text style={styles.statLabel}>Online Bots</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalTasks.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Active Tasks</Text>
                </View>
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{avgEfficiency.toFixed(1)}%</Text>
                  <Text style={styles.statLabel}>Efficiency</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {metrics ? `${metrics.uptime}%` : '0%'}
                  </Text>
                  <Text style={styles.statLabel}>Uptime</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Analytics</Text>
                <BarChart size={16} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Animated.View>
        
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Your Robots</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text 
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.robotsListContainer}>
          {filteredRobots.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Cpu size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No Robots Found</Text>
              <Text style={styles.emptySubtitle}>
                No robots matching your filter criteria
              </Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => setSelectedFilter('All')}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animated.FlatList
              data={filteredRobots}
              keyExtractor={(item: Robot) => item.id}
              contentContainerStyle={styles.robotsList}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              renderItem={({ item, index }: { item: Robot, index: number }) => {
                const robotAnimDelay = 150 * index;
                
                return (
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        { translateY: translateY.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 50 + (25 * index)]
                        })},
                        { scale: cardScale }
                      ]
                    }}
                  >
                    <TouchableOpacity
                      style={styles.robotCardPremium}
                      onPress={() => handleRobotPress(item)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={getStatusColor(item.status)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.robotStatusBadge}
                      >
                        <Text style={styles.robotStatusText}>{item.status}</Text>
                      </LinearGradient>
                      
                      <View style={styles.robotCardContent}>
                        <View style={styles.robotCardHeader}>
                          <View style={styles.robotCardHeaderLeft}>
                            <View style={styles.robotIconContainer}>
                              <Cpu size={24} color="#6c5ce7" />
                            </View>
                            <View>
                              <Text style={styles.robotCardTitle}>
                                {item.name}
                              </Text>
                              <Text style={styles.robotCardSubtitle}>
                                {item.domain}
                              </Text>
                            </View>
                          </View>
                          
                          <ChevronRight size={20} color="#6b7280" />
                        </View>
                        
                        <View style={styles.robotCardDivider} />
                        
                        <View style={styles.robotCardStats}>
                          <View style={styles.robotCardStat}>
                            <Zap size={16} color="#6c5ce7" />
                            <Text style={styles.robotCardStatValue}>
                              {item.tasks.toLocaleString()} Tasks
                            </Text>
                          </View>
                          
                          <View style={styles.robotCardStat}>
                            <Clock size={16} color="#6c5ce7" />
                            <Text style={styles.robotCardStatValue}>
                              {item.efficiency} Efficiency
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.robotCardFooter}>
                          <Text style={styles.robotCardFooterText}>
                            Last Active: {new Date(item.lastActivated).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
          )}
        </View>
        
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Quick Action Fab */}
      <View style={styles.fabContainer}>
        {Platform.OS === 'ios' ? (
            <View style={styles.fabButtonIOS}>
              <Zap size={24} color="#6c5ce7" />
              <Text style={styles.fabText}>Quick Actions</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.fabButtonAndroid}>
              <Zap size={24} color="#fff" />
              <Text style={styles.fabTextAndroid}>Quick Actions</Text>
            </TouchableOpacity>
          )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 20,
    marginBottom: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  welcomeSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarBadge: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
    bottom: 0,
    right: 0,
  },
  headerRightContainer: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 2,
  },
  statsOverviewContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statsCard: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#6c5ce7',
  },
  filterText: {
    fontSize: 14,
    color: '#4b5563',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  robotsListContainer: {
    marginTop: 20,
  },
  robotsList: {
    paddingHorizontal: 20,
  },
  robotCardPremium: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  robotStatusBadge: {
    position: 'absolute',
    top: 16,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    zIndex: 1,
  },
  robotStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  robotCardContent: {
    padding: 16,
  },
  robotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  robotCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  robotCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  robotCardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  robotCardDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  robotCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  robotCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotCardStatValue: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4b5563',
  },
  robotCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  robotCardFooterText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  fabButtonIOS: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  fabText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  fabButtonAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#6c5ce7',
    ...Platform.select({
      android: {
        elevation: 4,
      },
    }),
  },
  fabTextAndroid: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 100,
  }
});
