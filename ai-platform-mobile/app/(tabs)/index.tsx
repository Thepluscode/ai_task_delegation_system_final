import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Bot, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Heart,
  Factory,
  Banknote,
  GraduationCap,
  ShoppingCart,
  Truck,
  Shield,
  Globe,
  Cpu,
  Database,
  Cloud,
  Target,
  Award,
  Briefcase
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  icon, 
  color 
}) => {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
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
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );
};

interface IndustryCardProps {
  name: string;
  revenue: string;
  growth: string;
  status: 'active' | 'warning' | 'error';
  robots: number;
}

const IndustryCard: React.FC<IndustryCardProps> = ({ 
  name, 
  revenue, 
  growth, 
  status, 
  robots 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'active': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'error': return <AlertTriangle size={16} color="#ef4444" />;
      default: return <Clock size={16} color="#6b7280" />;
    }
  };

  return (
    <TouchableOpacity style={styles.industryCard}>
      <View style={styles.industryHeader}>
        <Text style={styles.industryName}>{name}</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
        </View>
      </View>
      <View style={styles.industryMetrics}>
        <View style={styles.industryMetric}>
          <Text style={styles.industryMetricLabel}>Revenue</Text>
          <Text style={styles.industryMetricValue}>{revenue}</Text>
        </View>
        <View style={styles.industryMetric}>
          <Text style={styles.industryMetricLabel}>Growth</Text>
          <Text style={[styles.industryMetricValue, { color: '#10b981' }]}>{growth}</Text>
        </View>
        <View style={styles.industryMetric}>
          <Text style={styles.industryMetricLabel}>Robots</Text>
          <Text style={styles.industryMetricValue}>{robots}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [selectedView, setSelectedView] = useState<'overview' | 'industries' | 'performance'>('overview');
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$2.4B',
      change: '+12.5%',
      isPositive: true,
      icon: <DollarSign size={20} color="#10b981" />,
      color: '#10b981'
    },
    {
      title: 'Active Users',
      value: '847K',
      change: '+8.2%',
      isPositive: true,
      icon: <Users size={20} color="#3b82f6" />,
      color: '#3b82f6'
    },
    {
      title: 'Robots Online',
      value: '12,847',
      change: '+15.3%',
      isPositive: true,
      icon: <Bot size={20} color="#8b5cf6" />,
      color: '#8b5cf6'
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: '-0.1%',
      isPositive: false,
      icon: <Activity size={20} color="#f59e0b" />,
      color: '#f59e0b'
    }
  ];

  const industries = [
    {
      name: 'Healthcare',
      revenue: '$680M',
      growth: '+18.5%',
      status: 'active' as const,
      robots: 3247,
      icon: <Heart size={20} color="#667eea" />,
      description: 'Patient care automation',
      efficiency: 94.2,
      alerts: 2
    },
    {
      name: 'Manufacturing',
      revenue: '$920M',
      growth: '+22.1%',
      status: 'active' as const,
      robots: 4891,
      icon: <Factory size={20} color="#f093fb" />,
      description: 'Smart factory solutions',
      efficiency: 96.8,
      alerts: 0
    },
    {
      name: 'Financial Services',
      revenue: '$540M',
      growth: '+15.8%',
      status: 'warning' as const,
      robots: 2156,
      icon: <Banknote size={20} color="#4facfe" />,
      description: 'Algorithmic trading',
      efficiency: 91.5,
      alerts: 3
    },
    {
      name: 'Education',
      revenue: '$180M',
      growth: '+28.3%',
      status: 'active' as const,
      robots: 1342,
      icon: <GraduationCap size={20} color="#43e97b" />,
      description: 'Personalized learning',
      efficiency: 89.7,
      alerts: 1
    },
    {
      name: 'Retail',
      revenue: '$320M',
      growth: '+12.7%',
      status: 'active' as const,
      robots: 1211,
      icon: <ShoppingCart size={20} color="#fa709a" />,
      description: 'Customer automation',
      efficiency: 92.3,
      alerts: 0
    },
    {
      name: 'Logistics',
      revenue: '$240M',
      growth: '+19.4%',
      status: 'active' as const,
      robots: 987,
      icon: <Truck size={20} color="#a8edea" />,
      description: 'Supply chain optimization',
      efficiency: 88.9,
      alerts: 1
    }
  ];

  const globalMetrics = [
    {
      title: 'Global Market Cap',
      value: '$8.9T',
      subtitle: 'Total Addressable Market',
      icon: <Globe size={24} color="#667eea" />,
      color: '#667eea'
    },
    {
      title: 'AI Processing Power',
      value: '2.4 PetaFLOPS',
      subtitle: 'Distributed Computing',
      icon: <Cpu size={24} color="#8b5cf6" />,
      color: '#8b5cf6'
    },
    {
      title: 'Data Processed',
      value: '847 TB',
      subtitle: 'Daily Analytics',
      icon: <Database size={24} color="#10b981" />,
      color: '#10b981'
    },
    {
      title: 'Cloud Efficiency',
      value: '99.97%',
      subtitle: 'Edge-Cloud Hybrid',
      icon: <Cloud size={24} color="#3b82f6" />,
      color: '#3b82f6'
    }
  ];

  const performanceTargets = [
    {
      title: 'Revenue Target',
      current: 2.4,
      target: 5.0,
      unit: 'B',
      progress: 48,
      icon: <Target size={20} color="#10b981" />
    },
    {
      title: 'Market Share',
      current: 12.5,
      target: 25.0,
      unit: '%',
      progress: 50,
      icon: <Award size={20} color="#3b82f6" />
    },
    {
      title: 'Enterprise Clients',
      current: 847,
      target: 2000,
      unit: 'K',
      progress: 42,
      icon: <Briefcase size={20} color="#8b5cf6" />
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>AI Automation Platform</Text>
            <Text style={styles.headerSubtitle}>Enterprise Command Center</Text>
          </View>
          <View style={styles.timeContainer}>
            <Zap size={16} color="#ffffff" />
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
        </View>
      </LinearGradient>

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
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Industry Performance</Text>
          <View style={styles.industriesContainer}>
            {industries.map((industry, index) => (
              <IndustryCard key={index} {...industry} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Platform Metrics</Text>
          <View style={styles.globalMetricsGrid}>
            {globalMetrics.map((metric, index) => (
              <View key={index} style={[styles.globalMetricCard, { borderLeftColor: metric.color }]}>
                <View style={styles.globalMetricHeader}>
                  <View style={[styles.globalIconContainer, { backgroundColor: metric.color + '20' }]}>
                    {metric.icon}
                  </View>
                </View>
                <Text style={styles.globalMetricValue}>{metric.value}</Text>
                <Text style={styles.globalMetricTitle}>{metric.title}</Text>
                <Text style={styles.globalMetricSubtitle}>{metric.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Targets</Text>
          <View style={styles.targetsContainer}>
            {performanceTargets.map((target, index) => (
              <View key={index} style={styles.targetCard}>
                <View style={styles.targetHeader}>
                  <View style={styles.targetIconContainer}>
                    {target.icon}
                  </View>
                  <Text style={styles.targetTitle}>{target.title}</Text>
                </View>
                <View style={styles.targetProgress}>
                  <View style={styles.targetValues}>
                    <Text style={styles.targetCurrent}>
                      ${target.current}{target.unit}
                    </Text>
                    <Text style={styles.targetTarget}>
                      / ${target.target}{target.unit}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${target.progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{target.progress}% Complete</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enhanced Industry Overview</Text>
          <View style={styles.enhancedIndustriesContainer}>
            {industries.map((industry, index) => (
              <TouchableOpacity key={index} style={styles.enhancedIndustryCard}>
                <View style={styles.enhancedIndustryHeader}>
                  <View style={styles.enhancedIndustryLeft}>
                    <View style={styles.enhancedIndustryIcon}>
                      {industry.icon}
                    </View>
                    <View>
                      <Text style={styles.enhancedIndustryName}>{industry.name}</Text>
                      <Text style={styles.enhancedIndustryDescription}>{industry.description}</Text>
                    </View>
                  </View>
                  <View style={styles.enhancedIndustryRight}>
                    {industry.alerts > 0 && (
                      <View style={styles.alertBadge}>
                        <Text style={styles.alertBadgeText}>{industry.alerts}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.enhancedIndustryMetrics}>
                  <View style={styles.enhancedMetric}>
                    <Text style={styles.enhancedMetricLabel}>Revenue</Text>
                    <Text style={styles.enhancedMetricValue}>{industry.revenue}</Text>
                    <Text style={[styles.enhancedMetricChange, { color: '#10b981' }]}>{industry.growth}</Text>
                  </View>
                  <View style={styles.enhancedMetric}>
                    <Text style={styles.enhancedMetricLabel}>Efficiency</Text>
                    <Text style={styles.enhancedMetricValue}>{industry.efficiency}%</Text>
                    <View style={styles.efficiencyBar}>
                      <View 
                        style={[
                          styles.efficiencyFill, 
                          { width: `${industry.efficiency}%` }
                        ]} 
                      />
                    </View>
                  </View>
                  <View style={styles.enhancedMetric}>
                    <Text style={styles.enhancedMetricLabel}>Robots</Text>
                    <Text style={styles.enhancedMetricValue}>{industry.robots.toLocaleString()}</Text>
                    <Text style={styles.enhancedMetricSubtext}>Active Units</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusGrid}>
            <View style={[styles.statusCard, { backgroundColor: '#10b981', width: (width - 52) / 2 }]}>
              <CheckCircle size={24} color="#ffffff" />
              <Text style={styles.statusTitle}>All Systems</Text>
              <Text style={styles.statusSubtitle}>Operational</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: '#3b82f6', width: (width - 52) / 2 }]}>
              <Activity size={24} color="#ffffff" />
              <Text style={styles.statusTitle}>Performance</Text>
              <Text style={styles.statusSubtitle}>Optimal</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: '#8b5cf6', width: (width - 52) / 2 }]}>
              <Shield size={24} color="#ffffff" />
              <Text style={styles.statusTitle}>Security</Text>
              <Text style={styles.statusSubtitle}>Protected</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: '#f59e0b', width: (width - 52) / 2 }]}>
              <Zap size={24} color="#ffffff" />
              <Text style={styles.statusTitle}>Edge Nodes</Text>
              <Text style={styles.statusSubtitle}>12,847 Active</Text>
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  industriesContainer: {
    gap: 12,
  },
  industryCard: {
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
  industryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  industryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusContainer: {
    padding: 4,
  },
  industryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  industryMetric: {
    alignItems: 'center',
  },
  industryMetricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  industryMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  // Global Metrics Styles
  globalMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  globalMetricCard: {
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
  globalMetricHeader: {
    marginBottom: 12,
  },
  globalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  globalMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  globalMetricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  globalMetricSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Performance Targets Styles
  targetsContainer: {
    gap: 16,
  },
  targetCard: {
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
  targetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  targetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  targetProgress: {
    gap: 8,
  },
  targetValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  targetCurrent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  targetTarget: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  // Enhanced Industry Styles
  enhancedIndustriesContainer: {
    gap: 16,
  },
  enhancedIndustryCard: {
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
  enhancedIndustryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  enhancedIndustryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  enhancedIndustryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  enhancedIndustryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  enhancedIndustryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  enhancedIndustryRight: {
    alignItems: 'center',
  },
  alertBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  enhancedIndustryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enhancedMetric: {
    alignItems: 'center',
    flex: 1,
  },
  enhancedMetricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  enhancedMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  enhancedMetricChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  enhancedMetricSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  efficiencyBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  efficiencyFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
});