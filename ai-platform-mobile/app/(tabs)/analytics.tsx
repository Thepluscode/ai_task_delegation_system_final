import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  DollarSign,
  Users,
  Bot,
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface MetricTrend {
  period: string;
  value: number;
  change: number;
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
  trend: MetricTrend[];
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon, 
  color,
  trend 
}) => {
  return (
    <View style={[styles.analyticsCard, { borderLeftColor: color }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.changeContainer}>
          {isPositive ? (
            <TrendingUp size={16} color="#10b981" />
          ) : (
            <TrendingDown size={16} color="#ef4444" />
          )}
          <Text style={[styles.changeText, { color: isPositive ? '#10b981' : '#ef4444' }]}>
            {change}
          </Text>
        </View>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      
      {/* Mini trend chart */}
      <View style={styles.miniChart}>
        {trend.map((point, index) => (
          <View 
            key={index} 
            style={[
              styles.chartBar, 
              { 
                height: (point.value / Math.max(...trend.map(t => t.value))) * 30,
                backgroundColor: color + '60'
              }
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

interface PieChartProps {
  data: ChartData[];
  size: number;
}

const SimplePieChart: React.FC<PieChartProps> = ({ data, size }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <View style={styles.pieChartContainer}>
      <View style={[styles.pieChart, { width: size, height: size }]}>
        {/* Simplified pie chart representation */}
        <View style={styles.pieCenter}>
          <Text style={styles.pieCenterText}>{total}</Text>
          <Text style={styles.pieCenterLabel}>Total</Text>
        </View>
      </View>
      <View style={styles.pieChartLegend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.label}</Text>
            <Text style={styles.legendValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

interface BarChartProps {
  data: ChartData[];
  height: number;
}

const SimpleBarChart: React.FC<BarChartProps> = ({ data, height }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.barChartContainer}>
      <View style={[styles.barChart, { height }]}>
        {data.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View 
              style={[
                styles.bar, 
                { 
                  height: (item.value / maxValue) * (height - 40),
                  backgroundColor: item.color 
                }
              ]} 
            />
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function AnalyticsScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const periods = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
    { key: '90d', label: '90D' }
  ];

  const analyticsData = [
    {
      title: 'Total Revenue',
      value: '$2.4B',
      change: '+12.5%',
      isPositive: true,
      icon: <DollarSign size={20} color="#10b981" />,
      color: '#10b981',
      trend: [
        { period: 'Mon', value: 85, change: 5 },
        { period: 'Tue', value: 92, change: 7 },
        { period: 'Wed', value: 78, change: -14 },
        { period: 'Thu', value: 95, change: 17 },
        { period: 'Fri', value: 88, change: -7 },
        { period: 'Sat', value: 96, change: 8 },
        { period: 'Sun', value: 100, change: 4 }
      ]
    },
    {
      title: 'Active Users',
      value: '847K',
      change: '+8.2%',
      isPositive: true,
      icon: <Users size={20} color="#3b82f6" />,
      color: '#3b82f6',
      trend: [
        { period: 'Mon', value: 75, change: 2 },
        { period: 'Tue', value: 82, change: 7 },
        { period: 'Wed', value: 88, change: 6 },
        { period: 'Thu', value: 85, change: -3 },
        { period: 'Fri', value: 92, change: 7 },
        { period: 'Sat', value: 89, change: -3 },
        { period: 'Sun', value: 95, change: 6 }
      ]
    },
    {
      title: 'Robot Efficiency',
      value: '94.2%',
      change: '+2.1%',
      isPositive: true,
      icon: <Bot size={20} color="#8b5cf6" />,
      color: '#8b5cf6',
      trend: [
        { period: 'Mon', value: 90, change: 1 },
        { period: 'Tue', value: 92, change: 2 },
        { period: 'Wed', value: 89, change: -3 },
        { period: 'Thu', value: 94, change: 5 },
        { period: 'Fri', value: 96, change: 2 },
        { period: 'Sat', value: 93, change: -3 },
        { period: 'Sun', value: 97, change: 4 }
      ]
    },
    {
      title: 'System Uptime',
      value: '99.8%',
      change: '-0.1%',
      isPositive: false,
      icon: <Activity size={20} color="#f59e0b" />,
      color: '#f59e0b',
      trend: [
        { period: 'Mon', value: 100, change: 0 },
        { period: 'Tue', value: 99, change: -1 },
        { period: 'Wed', value: 100, change: 1 },
        { period: 'Thu', value: 98, change: -2 },
        { period: 'Fri', value: 100, change: 2 },
        { period: 'Sat', value: 99, change: -1 },
        { period: 'Sun', value: 100, change: 1 }
      ]
    }
  ];

  const industryData: ChartData[] = [
    { label: 'Healthcare', value: 680, color: '#667eea' },
    { label: 'Manufacturing', value: 920, color: '#f093fb' },
    { label: 'Financial', value: 540, color: '#4facfe' },
    { label: 'Education', value: 180, color: '#43e97b' },
    { label: 'Retail', value: 320, color: '#fa709a' },
    { label: 'Logistics', value: 240, color: '#a8edea' }
  ];

  const performanceData: ChartData[] = [
    { label: 'Jan', value: 85, color: '#10b981' },
    { label: 'Feb', value: 92, color: '#10b981' },
    { label: 'Mar', value: 78, color: '#10b981' },
    { label: 'Apr', value: 95, color: '#10b981' },
    { label: 'May', value: 88, color: '#10b981' },
    { label: 'Jun', value: 96, color: '#10b981' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Last updated: {currentTime}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Filter size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.periodButtons}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.periodButtonActive
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period.key && styles.periodButtonTextActive
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {analyticsData.map((metric, index) => (
              <AnalyticsCard key={index} {...metric} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Industry Revenue Distribution</Text>
          <View style={styles.chartCard}>
            <SimplePieChart data={industryData} size={200} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Performance</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={performanceData} height={200} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-time Insights</Text>
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Eye size={20} color="#10b981" />
                <Text style={styles.insightTitle}>Performance Alert</Text>
              </View>
              <Text style={styles.insightText}>
                Manufacturing efficiency increased by 15% this week due to optimized robot scheduling.
              </Text>
              <Text style={styles.insightTime}>2 hours ago</Text>
            </View>
            
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <TrendingUp size={20} color="#3b82f6" />
                <Text style={styles.insightTitle}>Growth Opportunity</Text>
              </View>
              <Text style={styles.insightText}>
                Healthcare sector showing 28% growth potential based on current automation trends.
              </Text>
              <Text style={styles.insightTime}>4 hours ago</Text>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Activity size={20} color="#f59e0b" />
                <Text style={styles.insightTitle}>System Optimization</Text>
              </View>
              <Text style={styles.insightText}>
                Predictive maintenance reduced downtime by 40% across all robot fleets.
              </Text>
              <Text style={styles.insightTime}>6 hours ago</Text>
            </View>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  periodButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  metricsGrid: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    gap: 2,
  },
  chartBar: {
    flex: 1,
    borderRadius: 1,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pieCenterLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  pieChartLegend: {
    width: '100%',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  barChartContainer: {
    alignItems: 'center',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});