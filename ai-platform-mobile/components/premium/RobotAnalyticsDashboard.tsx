/**
 * Premium Robot Analytics Dashboard
 * 
 * A sophisticated, real-time analytics dashboard for robot performance monitoring.
 * Features interactive charts, real-time updates, and AI-powered insights.
 * 
 * Part of the Billion-Dollar App Implementation
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator,
  Platform,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  Filter, 
  Calendar, 
  BarChart2, 
  PieChart as PieChartIcon,
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Zap,
  ChevronRight,
  Download,
  Share2,
} from 'lucide-react-native';

// Import services and utilities
import { robotService } from '../../services/api/robotService';
import { useAuth } from '../../services/context/AuthContext';
import colors from '../../design-system/foundations/colors';
import motion from '../../design-system/foundations/motion';

// Import premium components
import Button from '../../design-system/components/atoms/Button';
import { useNotifications } from '../../services/context';

// Constants
const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

// Dashboard filter types
type DateFilter = 'today' | 'week' | 'month' | 'quarter' | 'custom';
type MetricFilter = 'efficiency' | 'tasks' | 'uptime' | 'failures';
type DomainFilter = 'all' | 'healthcare' | 'manufacturing' | 'logistics' | 'retail' | 'education';

// Analytics data interface
interface AnalyticsData {
  efficiencyByDomain: {
    domains: string[];
    values: number[];
    colors: string[];
  };
  taskCompletionTrend: {
    labels: string[];
    values: number[];
  };
  uptimePercentage: number;
  activeRobots: number;
  totalRobots: number;
  maintenanceRobots: number;
  tasksCompleted: number;
  alertsGenerated: number;
  failurePredictions: {
    high: number;
    medium: number;
    low: number;
  };
  domainDistribution: {
    name: string;
    percentage: number;
    color: string;
  }[];
  realtimeMetrics: {
    timestamp: string;
    activeConnections: number;
    dataPoints: number;
    latency: number;
  }[];
  insights: {
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    actionable: boolean;
  }[];
  lastUpdated: string;
}

/**
 * RobotAnalyticsDashboard Component
 */
const RobotAnalyticsDashboard: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const { notifications } = useNotifications();
  
  // State management
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('efficiency');
  const [domainFilter, setDomainFilter] = useState<DomainFilter>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf');
  const [showInsights, setShowInsights] = useState<boolean>(true);
  
  // Animation values
  const fadeAnim = motion.useFadeIn(600);
  const chartAnimation = motion.useEntranceAnimation(800, 200);
  const insightAnimation = useMemo(() => {
    return [...Array(3)].map((_, index) => motion.useEntranceAnimation(500, 300 + index * 100));
  }, []);
  
  // Load analytics data
  const loadAnalyticsData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, we would call the service with filters
      // const data = await robotService.getRobotAnalytics({
      //   dateFilter,
      //   metricFilter,
      //   domainFilter,
      // });
      
      // For demo purposes, we'll use mock data
      // Normally this would come from the backend
      const mockData: AnalyticsData = {
        efficiencyByDomain: {
          domains: ['Healthcare', 'Manufacturing', 'Logistics', 'Retail', 'Education'],
          values: [96.2, 99.1, 97.8, 93.5, 94.7],
          colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
        taskCompletionTrend: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          values: [1200, 1350, 1250, 1400, 1600, 1100, 900],
        },
        uptimePercentage: 99.8,
        activeRobots: 5,
        totalRobots: 6,
        maintenanceRobots: 1,
        tasksCompleted: 6718,
        alertsGenerated: 3,
        failurePredictions: {
          high: 1,
          medium: 2,
          low: 4,
        },
        domainDistribution: [
          { name: 'Healthcare', percentage: 20, color: '#FF6384' },
          { name: 'Manufacturing', percentage: 35, color: '#36A2EB' },
          { name: 'Logistics', percentage: 25, color: '#FFCE56' },
          { name: 'Retail', percentage: 10, color: '#4BC0C0' },
          { name: 'Education', percentage: 10, color: '#9966FF' },
        ],
        realtimeMetrics: [
          { timestamp: '09:00', activeConnections: 5, dataPoints: 1200, latency: 48 },
          { timestamp: '09:15', activeConnections: 5, dataPoints: 1250, latency: 52 },
          { timestamp: '09:30', activeConnections: 6, dataPoints: 1300, latency: 55 },
          { timestamp: '09:45', activeConnections: 6, dataPoints: 1350, latency: 49 },
          { timestamp: '10:00', activeConnections: 6, dataPoints: 1400, latency: 47 },
          { timestamp: '10:15', activeConnections: 6, dataPoints: 1450, latency: 45 },
        ],
        insights: [
          {
            title: 'Manufacturing efficiency increased by 2.3%',
            description: "The manufacturing robot's efficiency has improved over the past week, likely due to the recent calibration.",
            impact: 'positive',
            actionable: false,
          },
          {
            title: 'Retail robot requires maintenance',
            description: 'Predictive analytics indicate the retail robot will need maintenance within the next 48 hours.',
            impact: 'negative',
            actionable: true,
          },
          {
            title: 'Healthcare robot workload optimization',
            description: 'Task distribution could be optimized for the healthcare robot to improve efficiency by an estimated 3.5%.',
            impact: 'neutral',
            actionable: true,
          },
        ],
        lastUpdated: new Date().toISOString(),
      };
      
      // Simulate API call delay
      setTimeout(() => {
        setAnalyticsData(mockData);
        setLoading(false);
        setRefreshing(false);
      }, 1500);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, dateFilter, metricFilter, domainFilter]);
  
  // Initial load
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);
  
  // Set up periodic refresh for real-time data
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Only update if not already refreshing or loading
      if (!refreshing && !loading && isAuthenticated) {
        loadAnalyticsData();
      }
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [refreshing, loading, isAuthenticated, loadAnalyticsData]);
  
  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalyticsData();
  }, [loadAnalyticsData]);
  
  // Handle filter changes
  const handleDateFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    setLoading(true);
    // In a real implementation, this would trigger a reload with the new filter
  };
  
  const handleMetricFilterChange = (filter: MetricFilter) => {
    setMetricFilter(filter);
    setLoading(true);
    // In a real implementation, this would trigger a reload with the new filter
  };
  
  const handleDomainFilterChange = (filter: DomainFilter) => {
    setDomainFilter(filter);
    setLoading(true);
    // In a real implementation, this would trigger a reload with the new filter
  };
  
  // Handle data export
  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    setExportFormat(format);
    // In a real implementation, this would trigger the export process
    // For now, we'll just show a log message
    console.log(`Exporting analytics data in ${format} format...`);
  };
  
  // Handle insight action
  const handleInsightAction = (index: number) => {
    const insight = analyticsData?.insights[index];
    if (!insight || !insight.actionable) return;
    
    if (insight.impact === 'negative') {
      // Navigate to maintenance screen
      // navigation.navigate('RobotMaintenance');
      console.log('Navigating to maintenance screen');
    } else {
      // Navigate to optimization screen
      // navigation.navigate('RobotOptimization');
      console.log('Navigating to optimization screen');
    }
  };
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.palette.primary[500]} />
          <Text style={styles.loadingText}>Loading analytics data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color={colors.palette.error[500]} />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            variant="primary"
            onPress={() => loadAnalyticsData()}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render the dashboard
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.palette.primary[500]]}
            tintColor={colors.palette.primary[500]}
          />
        }
      >
        {/* Dashboard Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Robot Analytics</Text>
              <Text style={styles.headerSubtitle}>
                Last updated: {analyticsData?.lastUpdated ? new Date(analyticsData.lastUpdated).toLocaleTimeString() : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleExport('pdf')}>
                <Download size={20} color={colors.palette.primary[500]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => console.log('Share dashboard')}>
                <Share2 size={20} color={colors.palette.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Filter Controls */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
              {/* Date Filters */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Time Period:</Text>
                <View style={styles.filterOptions}>
                  {(['today', 'week', 'month'] as DateFilter[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOption,
                        dateFilter === filter && styles.filterOptionSelected,
                      ]}
                      onPress={() => handleDateFilterChange(filter)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          dateFilter === filter && styles.filterOptionTextSelected,
                        ]}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {/* Domain Filters */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Domain:</Text>
                <View style={styles.filterOptions}>
                  {(['all', 'healthcare', 'manufacturing', 'logistics'] as DomainFilter[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOption,
                        domainFilter === filter && styles.filterOptionSelected,
                      ]}
                      onPress={() => handleDomainFilterChange(filter)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          domainFilter === filter && styles.filterOptionTextSelected,
                        ]}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
        
        {/* Key Metrics */}
        <Animated.View style={[styles.metricsGrid, { opacity: fadeAnim, transform: [{ translateY: chartAnimation.translateY }] }]}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active Robots</Text>
            <Text style={styles.metricValue}>{analyticsData?.activeRobots}/{analyticsData?.totalRobots}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Tasks Today</Text>
            <Text style={styles.metricValue}>{analyticsData?.tasksCompleted.toLocaleString()}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Uptime</Text>
            <Text style={styles.metricValue}>{analyticsData?.uptimePercentage}%</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Alerts</Text>
            <Text style={styles.metricValue}>{analyticsData?.alertsGenerated}</Text>
          </View>
        </Animated.View>
        
        {/* Efficiency by Domain Chart */}
        <Animated.View style={[styles.chartContainer, { opacity: chartAnimation.opacity, transform: [{ translateY: chartAnimation.translateY }] }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Efficiency by Domain</Text>
            <BarChart2 size={20} color={colors.palette.primary[500]} />
          </View>
          
          {analyticsData?.efficiencyByDomain && (
            <BarChart
              data={{
                labels: analyticsData.efficiencyByDomain.domains,
                datasets: [
                  {
                    data: analyticsData.efficiencyByDomain.values,
                    colors: analyticsData.efficiencyByDomain.colors.map(color => () => color),
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.7,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withHorizontalLabels
            />
          )}
        </Animated.View>
        
        {/* Task Completion Trend Chart */}
        <Animated.View style={[styles.chartContainer, { opacity: chartAnimation.opacity, transform: [{ translateY: chartAnimation.translateY }] }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Task Completion Trend</Text>
            <TrendingUp size={20} color={colors.palette.primary[500]} />
          </View>
          
          {analyticsData?.taskCompletionTrend && (
            <LineChart
              data={{
                labels: analyticsData.taskCompletionTrend.labels,
                datasets: [
                  {
                    data: analyticsData.taskCompletionTrend.values,
                    color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.palette.primary[500],
                },
              }}
              bezier
              style={styles.chart}
            />
          )}
        </Animated.View>
        
        {/* Domain Distribution Pie Chart */}
        <Animated.View style={[styles.chartContainer, { opacity: chartAnimation.opacity, transform: [{ translateY: chartAnimation.translateY }] }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Robot Distribution by Domain</Text>
            <PieChartIcon size={20} color={colors.palette.primary[500]} />
          </View>
          
          {analyticsData?.domainDistribution && (
            <PieChart
              data={analyticsData.domainDistribution.map(item => ({
                name: item.name,
                population: item.percentage,
                color: item.color,
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
              }))}
              width={CHART_WIDTH}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              style={styles.chart}
            />
          )}
        </Animated.View>
        
        {/* AI Insights Section */}
        {showInsights && analyticsData?.insights && (
          <Animated.View style={[styles.insightsContainer, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>AI-Powered Insights</Text>
              <Zap size={20} color={colors.palette.primary[500]} />
            </View>
            
            {analyticsData.insights.map((insight, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.insightCard,
                  { opacity: insightAnimation[index]?.opacity || 1, transform: [{ translateY: insightAnimation[index]?.translateY || 0 }] },
                  insight.impact === 'positive' && styles.insightCardPositive,
                  insight.impact === 'negative' && styles.insightCardNegative,
                  insight.impact === 'neutral' && styles.insightCardNeutral,
                ]}
              >
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
                
                {insight.actionable && (
                  <TouchableOpacity 
                    style={styles.insightAction}
                    onPress={() => handleInsightAction(index)}
                  >
                    <Text style={styles.insightActionText}>
                      Take Action
                    </Text>
                    <ChevronRight size={16} color={colors.palette.primary[500]} />
                  </TouchableOpacity>
                )}
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.palette.neutral[900],
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.palette.neutral[500],
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.palette.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterContainer: {
    marginTop: 8,
  },
  filterScrollView: {
    flexDirection: 'row',
  },
  filterGroup: {
    marginRight: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.palette.neutral[700],
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.palette.neutral[100],
    marginRight: 8,
  },
  filterOptionSelected: {
    backgroundColor: colors.palette.primary[500],
  },
  filterOptionText: {
    fontSize: 13,
    color: colors.palette.neutral[700],
  },
  filterOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  metricLabel: {
    fontSize: 14,
    color: colors.palette.neutral[600],
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.palette.primary[500],
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[800],
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
    alignSelf: 'center',
  },
  insightsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.palette.neutral[800],
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.palette.primary[500],
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
  insightCardPositive: {
    borderLeftColor: colors.palette.success[500],
  },
  insightCardNegative: {
    borderLeftColor: colors.palette.error[500],
  },
  insightCardNeutral: {
    borderLeftColor: colors.palette.primary[500],
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.palette.neutral[900],
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.palette.neutral[700],
    lineHeight: 20,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  insightActionText: {
    fontSize: 14,
    color: colors.palette.primary[500],
    fontWeight: '600',
    marginRight: 4,
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
    padding: 20,
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
    marginBottom: 20,
  },
});

export default RobotAnalyticsDashboard;