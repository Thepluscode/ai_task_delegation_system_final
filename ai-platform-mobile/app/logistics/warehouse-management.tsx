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
  Package,
  MapPin,
  Clock,
  TrendingUp,
  Truck,
  BarChart3,
  AlertTriangle,
  Users,
  Zap,
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface WarehouseZone {
  id: string;
  name: string;
  type: 'receiving' | 'storage' | 'picking' | 'shipping';
  capacity: number;
  currentLoad: number;
  efficiency: number;
  status: 'optimal' | 'busy' | 'critical';
  activeOrders: number;
  avgProcessingTime: number;
}

interface WarehouseMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

const ZoneCard: React.FC<{ zone: WarehouseZone; onPress: () => void }> = ({ zone, onPress }) => {
  const getStatusColor = () => {
    switch (zone.status) {
      case 'optimal': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = () => {
    switch (zone.type) {
      case 'receiving': return <Package size={20} color="#3b82f6" />;
      case 'storage': return <BarChart3 size={20} color="#8b5cf6" />;
      case 'picking': return <Users size={20} color="#f59e0b" />;
      case 'shipping': return <Truck size={20} color="#10b981" />;
      default: return <Package size={20} color="#6b7280" />;
    }
  };

  const utilizationPercentage = (zone.currentLoad / zone.capacity) * 100;

  return (
    <TouchableOpacity style={styles.zoneCard} onPress={onPress}>
      <View style={styles.zoneHeader}>
        <View style={styles.zoneInfo}>
          <View style={styles.zoneTypeContainer}>
            {getTypeIcon()}
            <Text style={styles.zoneName}>{zone.name}</Text>
          </View>
          <Text style={styles.zoneType}>{zone.type.toUpperCase()}</Text>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.zoneMetrics}>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.currentLoad}/{zone.capacity}</Text>
          <Text style={styles.metricLabel}>Capacity</Text>
        </View>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.efficiency}%</Text>
          <Text style={styles.metricLabel}>Efficiency</Text>
        </View>
        <View style={styles.zoneMetric}>
          <Text style={styles.zoneMetricValue}>{zone.activeOrders}</Text>
          <Text style={styles.metricLabel}>Orders</Text>
        </View>
      </View>
      
      <View style={styles.utilizationSection}>
        <View style={styles.utilizationBar}>
          <View style={styles.utilizationTrack}>
            <View 
              style={[
                styles.utilizationFill, 
                { 
                  width: `${Math.min(utilizationPercentage, 100)}%`,
                  backgroundColor: getStatusColor()
                }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.utilizationText}>{Math.round(utilizationPercentage)}% Utilized</Text>
      </View>
      
      <View style={styles.zoneFooter}>
        <View style={styles.processingTime}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.processingTimeText}>Avg: {zone.avgProcessingTime}min</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {zone.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function WarehouseManagementScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'overview' | 'zones' | 'analytics'>('overview');
  const [warehouseZones, setWarehouseZones] = useState<WarehouseZone[]>([]);
  const [warehouseMetrics, setWarehouseMetrics] = useState<WarehouseMetric[]>([]);

  useEffect(() => {
    loadWarehouseData();
    loadMetrics();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadWarehouseData = () => {
    const mockZones: WarehouseZone[] = [
      {
        id: '1',
        name: 'Receiving Dock A',
        type: 'receiving',
        capacity: 50,
        currentLoad: 42,
        efficiency: 87,
        status: 'busy',
        activeOrders: 15,
        avgProcessingTime: 12
      },
      {
        id: '2',
        name: 'Storage Zone B',
        type: 'storage',
        capacity: 1000,
        currentLoad: 750,
        efficiency: 92,
        status: 'optimal',
        activeOrders: 0,
        avgProcessingTime: 5
      },
      {
        id: '3',
        name: 'Picking Area C',
        type: 'picking',
        capacity: 25,
        currentLoad: 24,
        efficiency: 78,
        status: 'critical',
        activeOrders: 32,
        avgProcessingTime: 18
      },
      {
        id: '4',
        name: 'Shipping Dock D',
        type: 'shipping',
        capacity: 30,
        currentLoad: 18,
        efficiency: 95,
        status: 'optimal',
        activeOrders: 8,
        avgProcessingTime: 8
      },
      {
        id: '5',
        name: 'Storage Zone E',
        type: 'storage',
        capacity: 800,
        currentLoad: 620,
        efficiency: 89,
        status: 'optimal',
        activeOrders: 0,
        avgProcessingTime: 6
      }
    ];
    setWarehouseZones(mockZones);
  };

  const loadMetrics = () => {
    const mockMetrics: WarehouseMetric[] = [
      {
        title: 'Total Orders',
        value: '1,247',
        change: '+15.2%',
        isPositive: true,
        icon: <Package size={20} color="#3b82f6" />,
        color: '#3b82f6'
      },
      {
        title: 'Avg Processing',
        value: '11.2min',
        change: '-8.5%',
        isPositive: true,
        icon: <Clock size={20} color="#10b981" />,
        color: '#10b981'
      },
      {
        title: 'Efficiency',
        value: '88%',
        change: '+5.3%',
        isPositive: true,
        icon: <TrendingUp size={20} color="#8b5cf6" />,
        color: '#8b5cf6'
      },
      {
        title: 'Critical Zones',
        value: '1',
        change: '-2',
        isPositive: true,
        icon: <AlertTriangle size={20} color="#ef4444" />,
        color: '#ef4444'
      }
    ];
    setWarehouseMetrics(mockMetrics);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    setWarehouseZones(prev => prev.map(zone => ({
      ...zone,
      currentLoad: Math.max(0, zone.currentLoad + Math.floor(Math.random() * 3) - 1),
      activeOrders: Math.max(0, zone.activeOrders + Math.floor(Math.random() * 3) - 1)
    })));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadWarehouseData();
    loadMetrics();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleZonePress = (zone: WarehouseZone) => {
    Alert.alert(
      `${zone.name}`,
      `Type: ${zone.type}\nCapacity: ${zone.currentLoad}/${zone.capacity}\nEfficiency: ${zone.efficiency}%\nActive Orders: ${zone.activeOrders}\nAvg Processing: ${zone.avgProcessingTime} min\nStatus: ${zone.status}`,
      [
        { text: 'Optimize Zone', onPress: () => console.log('Optimize zone') },
        { text: 'View Details', onPress: () => console.log('View zone details') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeWarehouse = () => {
    Alert.alert(
      'AI Warehouse Optimization',
      'AI has analyzed warehouse operations and suggests:\n\n• Redistribute load from Picking Area C\n• Increase staffing in critical zones\n• Optimize picking routes for 25% faster processing\n• Implement dynamic zone allocation\n\nEstimated improvement: 20% faster throughput',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderOverview = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Warehouse Metrics</Text>
        <View style={styles.metricsGrid}>
          {warehouseMetrics.map((metric, index) => (
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
          <Text style={styles.sectionTitle}>Zone Status</Text>
          <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeWarehouse}>
            <Zap size={16} color="#ffffff" />
            <Text style={styles.optimizeButtonText}>AI Optimize</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.zonesContainer}>
          {warehouseZones.slice(0, 3).map((zone) => (
            <ZoneCard 
              key={zone.id} 
              zone={zone} 
              onPress={() => handleZonePress(zone)}
            />
          ))}
        </View>
      </View>
    </>
  );

  const renderZones = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Zones ({warehouseZones.length})</Text>
      <View style={styles.zonesContainer}>
        {warehouseZones.map((zone) => (
          <ZoneCard 
            key={zone.id} 
            zone={zone} 
            onPress={() => handleZonePress(zone)}
          />
        ))}
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Warehouse Analytics</Text>
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsCard}>
          <TrendingUp size={24} color="#10b981" />
          <Text style={styles.analyticsTitle}>Performance Trends</Text>
          <Text style={styles.analyticsText}>
            Overall warehouse efficiency improved by 15% with AI-powered zone optimization
          </Text>
        </View>
        <View style={styles.analyticsCard}>
          <BarChart3 size={24} color="#3b82f6" />
          <Text style={styles.analyticsTitle}>Capacity Utilization</Text>
          <Text style={styles.analyticsText}>
            Storage zones operating at 78% capacity with optimal distribution patterns
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Warehouse Management',
          headerShown: true,
          headerStyle: { backgroundColor: '#a8edea' },
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
        colors={['#a8edea', '#fed6e3']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Warehouse Control</Text>
            <Text style={styles.headerSubtitle}>AI-powered logistics management</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Package size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>1,247 Orders</Text>
            </View>
            <View style={styles.headerStat}>
              <Shield size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>ISO 28000</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'overview' && styles.activeTab]}
          onPress={() => setSelectedView('overview')}
        >
          <BarChart3 size={20} color={selectedView === 'overview' ? '#a8edea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'zones' && styles.activeTab]}
          onPress={() => setSelectedView('zones')}
        >
          <MapPin size={20} color={selectedView === 'zones' ? '#a8edea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'zones' && styles.activeTabText]}>Zones</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'analytics' && styles.activeTab]}
          onPress={() => setSelectedView('analytics')}
        >
          <TrendingUp size={20} color={selectedView === 'analytics' ? '#a8edea' : '#6b7280'} />
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
        {selectedView === 'zones' && renderZones()}
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
    backgroundColor: '#a8edea20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#a8edea',
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
    backgroundColor: '#a8edea',
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
  zonesContainer: {
    gap: 12,
  },
  zoneCard: {
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
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneInfo: {
    flex: 1,
  },
  zoneTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  zoneType: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  zoneMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  zoneMetric: {
    alignItems: 'center',
  },
  zoneMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  utilizationSection: {
    marginBottom: 12,
  },
  utilizationBar: {
    marginBottom: 8,
  },
  utilizationTrack: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 3,
  },
  utilizationText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  zoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  processingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  processingTimeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
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