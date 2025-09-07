import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Factory,
  Play,
  Pause,
  Square,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface ProductionLineData {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped' | 'maintenance';
  efficiency: number;
  throughput: number;
  quality: number;
  operators: number;
  alerts: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => (
  <View style={styles.metricCard}>
    <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
      {icon}
    </View>
    <View style={styles.metricContent}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={[styles.metricChange, { color: change.startsWith('+') ? '#10b981' : '#ef4444' }]}>
        {change}
      </Text>
    </View>
  </View>
);

interface ProductionLineCardProps {
  line: ProductionLineData;
  onPress: () => void;
}

const ProductionLineCard: React.FC<ProductionLineCardProps> = ({ line, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'stopped': return '#ef4444';
      case 'maintenance': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play size={16} color="#ffffff" />;
      case 'paused': return <Pause size={16} color="#ffffff" />;
      case 'stopped': return <Square size={16} color="#ffffff" />;
      case 'maintenance': return <Settings size={16} color="#ffffff" />;
      default: return <Clock size={16} color="#ffffff" />;
    }
  };

  return (
    <TouchableOpacity style={styles.lineCard} onPress={onPress}>
      <View style={styles.lineHeader}>
        <View style={styles.lineInfo}>
          <Text style={styles.lineName}>{line.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(line.status) }]}>
            {getStatusIcon(line.status)}
            <Text style={styles.statusText}>{line.status.toUpperCase()}</Text>
          </View>
        </View>
        {line.alerts > 0 && (
          <View style={styles.alertBadge}>
            <AlertTriangle size={16} color="#ef4444" />
            <Text style={styles.alertText}>{line.alerts}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.lineMetrics}>
        <View style={styles.lineMetric}>
          <Text style={styles.lineMetricValue}>{line.efficiency}%</Text>
          <Text style={styles.lineMetricLabel}>Efficiency</Text>
        </View>
        <View style={styles.lineMetric}>
          <Text style={styles.lineMetricValue}>{line.throughput}</Text>
          <Text style={styles.lineMetricLabel}>Units/Hr</Text>
        </View>
        <View style={styles.lineMetric}>
          <Text style={styles.lineMetricValue}>{line.quality}%</Text>
          <Text style={styles.lineMetricLabel}>Quality</Text>
        </View>
        <View style={styles.lineMetric}>
          <Text style={styles.lineMetricValue}>{line.operators}</Text>
          <Text style={styles.lineMetricLabel}>Operators</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ProductionLineScreen() {
  const [productionLines, setProductionLines] = useState<ProductionLineData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading production line data
    setTimeout(() => {
      setProductionLines([
        {
          id: '1',
          name: 'Assembly Line A',
          status: 'running',
          efficiency: 94,
          throughput: 245,
          quality: 98.5,
          operators: 12,
          alerts: 0
        },
        {
          id: '2',
          name: 'Assembly Line B',
          status: 'paused',
          efficiency: 87,
          throughput: 0,
          quality: 97.2,
          operators: 8,
          alerts: 2
        },
        {
          id: '3',
          name: 'Packaging Line 1',
          status: 'running',
          efficiency: 91,
          throughput: 180,
          quality: 99.1,
          operators: 6,
          alerts: 0
        },
        {
          id: '4',
          name: 'Quality Control',
          status: 'maintenance',
          efficiency: 0,
          throughput: 0,
          quality: 0,
          operators: 3,
          alerts: 1
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleLinePress = (line: ProductionLineData) => {
    Alert.alert(
      `${line.name} Details`,
      `Status: ${line.status}\nEfficiency: ${line.efficiency}%\nThroughput: ${line.throughput} units/hr\nQuality: ${line.quality}%\nOperators: ${line.operators}\nAlerts: ${line.alerts}`,
      [{ text: 'OK' }]
    );
  };

  const handleControlAction = (action: string) => {
    Alert.alert(
      'Production Control',
      `${action} action initiated for all production lines.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Factory size={32} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Production Line Control</Text>
          <Text style={styles.headerSubtitle}>Real-time manufacturing execution system</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              title="Overall Efficiency"
              value="92.3%"
              change="+2.1%"
              icon={<TrendingUp size={20} color="#10b981" />}
              color="#10b981"
            />
            <MetricCard
              title="Total Throughput"
              value="425"
              change="+15"
              icon={<Zap size={20} color="#3b82f6" />}
              color="#3b82f6"
            />
            <MetricCard
              title="Quality Score"
              value="98.2%"
              change="+0.3%"
              icon={<CheckCircle size={20} color="#8b5cf6" />}
              color="#8b5cf6"
            />
            <MetricCard
              title="Active Operators"
              value="29"
              change="-2"
              icon={<Users size={20} color="#f59e0b" />}
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Control Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#10b981' }]}
              onPress={() => handleControlAction('Start All')}
            >
              <Play size={24} color="#ffffff" />
              <Text style={styles.actionText}>Start All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
              onPress={() => handleControlAction('Pause All')}
            >
              <Pause size={24} color="#ffffff" />
              <Text style={styles.actionText}>Pause All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
              onPress={() => handleControlAction('Emergency Stop')}
            >
              <Square size={24} color="#ffffff" />
              <Text style={styles.actionText}>E-Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
              onPress={() => handleControlAction('Maintenance Mode')}
            >
              <Settings size={24} color="#ffffff" />
              <Text style={styles.actionText}>Maintenance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Production Lines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Lines</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading production lines...</Text>
            </View>
          ) : (
            <View style={styles.linesContainer}>
              {productionLines.map((line) => (
                <ProductionLineCard
                  key={line.id}
                  line={line}
                  onPress={() => handleLinePress(line)}
                />
              ))}
            </View>
          )}
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
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  metricChange: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  linesContainer: {
    gap: 12,
  },
  lineCard: {
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
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lineInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lineMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineMetric: {
    alignItems: 'center',
    flex: 1,
  },
  lineMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  lineMetricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});