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
  MessageCircle,
  Users,
  Clock,
  TrendingUp,
  Star,
  Bot,
  Headphones,
  Zap,
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface CustomerInteraction {
  id: string;
  customerName: string;
  issue: string;
  status: 'active' | 'resolved' | 'escalated' | 'waiting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'chat' | 'email' | 'phone' | 'social';
  aiHandled: boolean;
  responseTime: number;
  satisfaction: number;
  agent?: string;
}

interface ServiceMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const InteractionCard: React.FC<{ interaction: CustomerInteraction; onPress: () => void }> = ({ interaction, onPress }) => {
  const getStatusColor = () => {
    switch (interaction.status) {
      case 'active': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'escalated': return '#ef4444';
      case 'waiting': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = () => {
    switch (interaction.priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#f97316';
      case 'urgent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getChannelIcon = () => {
    switch (interaction.channel) {
      case 'chat': return <MessageCircle size={14} color="#6b7280" />;
      case 'email': return <MessageCircle size={14} color="#6b7280" />;
      case 'phone': return <Headphones size={14} color="#6b7280" />;
      case 'social': return <Users size={14} color="#6b7280" />;
      default: return <MessageCircle size={14} color="#6b7280" />;
    }
  };

  return (
    <TouchableOpacity style={styles.interactionCard} onPress={onPress}>
      <View style={styles.interactionHeader}>
        <View style={styles.interactionInfo}>
          <Text style={styles.customerName}>{interaction.customerName}</Text>
          <Text style={styles.issue} numberOfLines={1}>{interaction.issue}</Text>
        </View>
        <View style={styles.interactionStatus}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {interaction.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.interactionDetails}>
        <View style={styles.interactionDetail}>
          {getChannelIcon()}
          <Text style={styles.detailText}>{interaction.channel}</Text>
        </View>
        <View style={styles.interactionDetail}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.detailText}>{interaction.responseTime}min</Text>
        </View>
        <View style={styles.interactionDetail}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {interaction.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.interactionFooter}>
        {interaction.aiHandled && (
          <View style={styles.aiTag}>
            <Bot size={12} color="#8b5cf6" />
            <Text style={styles.aiText}>AI Handled</Text>
          </View>
        )}
        {interaction.agent && (
          <Text style={styles.agentText}>Agent: {interaction.agent}</Text>
        )}
        <View style={styles.satisfactionContainer}>
          <Star size={12} color="#f59e0b" />
          <Text style={styles.satisfactionText}>{interaction.satisfaction}/5</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function CustomerServiceScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'active' | 'analytics'>('overview');
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetric[]>([]);

  useEffect(() => {
    loadInteractionData();
    loadMetrics();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadInteractionData = () => {
    const mockInteractions: CustomerInteraction[] = [
      {
        id: '1',
        customerName: 'John Smith',
        issue: 'Product return request',
        status: 'active',
        priority: 'medium',
        channel: 'chat',
        aiHandled: true,
        responseTime: 2,
        satisfaction: 4,
        agent: 'AI Assistant'
      },
      {
        id: '2',
        customerName: 'Sarah Johnson',
        issue: 'Payment processing error',
        status: 'escalated',
        priority: 'high',
        channel: 'phone',
        aiHandled: false,
        responseTime: 15,
        satisfaction: 3,
        agent: 'Mike Wilson'
      },
      {
        id: '3',
        customerName: 'David Chen',
        issue: 'Product recommendation',
        status: 'resolved',
        priority: 'low',
        channel: 'email',
        aiHandled: true,
        responseTime: 5,
        satisfaction: 5
      },
      {
        id: '4',
        customerName: 'Emily Davis',
        issue: 'Shipping delay inquiry',
        status: 'waiting',
        priority: 'medium',
        channel: 'social',
        aiHandled: false,
        responseTime: 8,
        satisfaction: 4,
        agent: 'Lisa Brown'
      }
    ];
    setInteractions(mockInteractions);
  };

  const loadMetrics = () => {
    const mockMetrics: ServiceMetric[] = [
      {
        title: 'Active Chats',
        value: '47',
        change: '+12%',
        isPositive: true,
        icon: <MessageCircle size={20} color="#3b82f6" />,
        color: '#3b82f6'
      },
      {
        title: 'Avg Response',
        value: '3.2min',
        change: '-18%',
        isPositive: true,
        icon: <Clock size={20} color="#10b981" />,
        color: '#10b981'
      },
      {
        title: 'AI Resolution',
        value: '78%',
        change: '+25%',
        isPositive: true,
        icon: <Bot size={20} color="#8b5cf6" />,
        color: '#8b5cf6'
      },
      {
        title: 'Satisfaction',
        value: '4.6/5',
        change: '+8%',
        isPositive: true,
        icon: <Star size={20} color="#f59e0b" />,
        color: '#f59e0b'
      }
    ];
    setServiceMetrics(mockMetrics);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    setInteractions(prev => prev.map(interaction => ({
      ...interaction,
      responseTime: interaction.status === 'active' ? interaction.responseTime + 1 : interaction.responseTime
    })));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadInteractionData();
    loadMetrics();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleInteractionPress = (interaction: CustomerInteraction) => {
    Alert.alert(
      `${interaction.customerName}`,
      `Issue: ${interaction.issue}\nStatus: ${interaction.status}\nChannel: ${interaction.channel}\nPriority: ${interaction.priority}\nResponse Time: ${interaction.responseTime} min\nSatisfaction: ${interaction.satisfaction}/5`,
      [
        { text: 'Escalate', onPress: () => console.log('Escalate to human agent') },
        { text: 'AI Assist', onPress: () => console.log('Get AI suggestions') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeService = () => {
    Alert.alert(
      'AI Service Optimization',
      'AI has analyzed customer interactions and suggests:\n\n• Deploy chatbot for common return questions\n• Prioritize payment issues for faster resolution\n• Add proactive shipping notifications\n• Implement sentiment-based routing\n\nEstimated improvement: 35% faster resolution',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderOverview = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Metrics</Text>
        <View style={styles.metricsGrid}>
          {serviceMetrics.map((metric, index) => (
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
          <Text style={styles.sectionTitle}>Recent Interactions</Text>
          <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeService}>
            <Zap size={16} color="#ffffff" />
            <Text style={styles.optimizeButtonText}>AI Optimize</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.interactionsContainer}>
          {interactions.slice(0, 3).map((interaction) => (
            <InteractionCard 
              key={interaction.id} 
              interaction={interaction} 
              onPress={() => handleInteractionPress(interaction)}
            />
          ))}
        </View>
      </View>
    </>
  );

  const renderActive = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Active Interactions ({interactions.filter(i => i.status === 'active').length})</Text>
      <View style={styles.interactionsContainer}>
        {interactions.filter(i => i.status === 'active').map((interaction) => (
          <InteractionCard 
            key={interaction.id} 
            interaction={interaction} 
            onPress={() => handleInteractionPress(interaction)}
          />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Service Analytics</Text>
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsCard}>
          <Bot size={24} color="#8b5cf6" />
          <Text style={styles.analyticsTitle}>AI Performance</Text>
          <Text style={styles.analyticsText}>
            AI handles 78% of customer inquiries with 4.6/5 satisfaction rating
          </Text>
        </View>
        <View style={styles.analyticsCard}>
          <TrendingUp size={24} color="#10b981" />
          <Text style={styles.analyticsTitle}>Response Trends</Text>
          <Text style={styles.analyticsText}>
            Average response time improved by 35% with AI-powered routing
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Intelligent Customer Service',
          headerShown: true,
          headerStyle: { backgroundColor: '#fa709a' },
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
        colors={['#fa709a', '#fee140']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Customer Service AI</Text>
            <Text style={styles.headerSubtitle}>Intelligent support automation</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <MessageCircle size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>47 Active</Text>
            </View>
            <View style={styles.headerStat}>
              <Shield size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>PCI Secure</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <TrendingUp size={20} color={selectedView === 'overview' ? '#fa709a' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'active' && styles.activeTab]}
          onPress={() => setSelectedView('active')}
        >
          <MessageCircle size={20} color={selectedView === 'active' ? '#fa709a' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'analytics' && styles.activeTab]}
          onPress={() => setSelectedView('analytics')}
        >
          <Bot size={20} color={selectedView === 'analytics' ? '#fa709a' : '#6b7280'} />
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
        {selectedView === 'active' && renderActive()}
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
    backgroundColor: '#fa709a20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fa709a',
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
    backgroundColor: '#fa709a',
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
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  issue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  interactionStatus: {
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
  interactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  interactionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  interactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf620',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  aiText: {
    fontSize: 10,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  agentText: {
    fontSize: 12,
    color: '#6b7280',
  },
  satisfactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  satisfactionText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
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