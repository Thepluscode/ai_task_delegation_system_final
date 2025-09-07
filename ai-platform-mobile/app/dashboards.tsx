import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Bell,
  ChevronRight,
  Filter,
  RefreshCcw,
  Users,
  Layers,
  FileText,
  Workflow
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

import {
  dashboardService,
  KPI,
  ChartData,
  AlertData
} from '../services/api/dashboardService';
import { WorkflowDomain } from '../services/api/workflowService';
import { useAuth } from '../services/context/AuthContext';

const { width } = Dimensions.get('window');

export default function DashboardsScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<WorkflowDomain>(WorkflowDomain.HEALTHCARE);
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  // Load data based on selected domain
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from the dashboard service
      const [kpisData, chartsData, alertsData] = await Promise.all([
        dashboardService.getKPIs(selectedDomain),
        dashboardService.getCharts(selectedDomain),
        dashboardService.getAlerts(selectedDomain)
      ]);

      // Update state with the data
      setKPIs(kpisData);
      setCharts(chartsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedDomain]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  }, [selectedDomain]);

  const handleDomainChange = (domain: WorkflowDomain) => {
    setSelectedDomain(domain);
  };

  const handleAlertPress = (alert: AlertData) => {
    Alert.alert(
      `${alert.title}`,
      `${alert.description}\n\nSeverity: ${alert.severity}\nStatus: ${alert.status}\nTime: ${new Date(alert.timestamp).toLocaleString()}`,
      [{ text: "Close" }]
    );
  };

  const getDomainColor = (domain: WorkflowDomain) => {
    switch (domain) {
      case WorkflowDomain.HEALTHCARE:
        return '#3b82f6'; // blue
      case WorkflowDomain.MANUFACTURING:
        return '#f59e0b'; // orange
      case WorkflowDomain.IOT:
        return '#8b5cf6'; // purple
      case WorkflowDomain.GENERAL:
      default:
        return '#6b7280'; // gray
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (trend === 'up') {
      return <ArrowUp size={16} color="#10b981" />;
    } else if (trend === 'down') {
      return <ArrowDown size={16} color="#ef4444" />;
    } else {
      return <Minus size={16} color="#6b7280" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      case 'info':
      default: return '#6b7280';
    }
  };

  const renderChartPlaceholder = (chart: ChartData) => {
    // In a real implementation, we would use a chart library like react-native-chart-kit
    // or react-native-svg-charts to render actual charts based on the chart data
    return (
      <View key={chart.id} style={styles.chartCard}>
        <Text style={styles.chartTitle}>{chart.title}</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
          </Text>
          <Text style={styles.chartDataText}>
            {chart.datasets.map(dataset => dataset.label).join(', ')}
          </Text>
        </View>
      </View>
    );
  };

  // Render domain selection tabs
  const renderDomainTabs = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.domainTabsContainer}
      >
        <TouchableOpacity
          style={[
            styles.domainTab,
            selectedDomain === WorkflowDomain.HEALTHCARE && styles.activeDomainTab,
            selectedDomain === WorkflowDomain.HEALTHCARE && { borderColor: getDomainColor(WorkflowDomain.HEALTHCARE) }
          ]}
          onPress={() => handleDomainChange(WorkflowDomain.HEALTHCARE)}
        >
          <Users size={20} color={selectedDomain === WorkflowDomain.HEALTHCARE ? getDomainColor(WorkflowDomain.HEALTHCARE) : '#6b7280'} />
          <Text style={[
            styles.domainTabText,
            selectedDomain === WorkflowDomain.HEALTHCARE && styles.activeDomainTabText,
            selectedDomain === WorkflowDomain.HEALTHCARE && { color: getDomainColor(WorkflowDomain.HEALTHCARE) }
          ]}>
            Healthcare
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.domainTab,
            selectedDomain === WorkflowDomain.MANUFACTURING && styles.activeDomainTab,
            selectedDomain === WorkflowDomain.MANUFACTURING && { borderColor: getDomainColor(WorkflowDomain.MANUFACTURING) }
          ]}
          onPress={() => handleDomainChange(WorkflowDomain.MANUFACTURING)}
        >
          <Layers size={20} color={selectedDomain === WorkflowDomain.MANUFACTURING ? getDomainColor(WorkflowDomain.MANUFACTURING) : '#6b7280'} />
          <Text style={[
            styles.domainTabText,
            selectedDomain === WorkflowDomain.MANUFACTURING && styles.activeDomainTabText,
            selectedDomain === WorkflowDomain.MANUFACTURING && { color: getDomainColor(WorkflowDomain.MANUFACTURING) }
          ]}>
            Manufacturing
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.domainTab,
            selectedDomain === WorkflowDomain.IOT && styles.activeDomainTab,
            selectedDomain === WorkflowDomain.IOT && { borderColor: getDomainColor(WorkflowDomain.IOT) }
          ]}
          onPress={() => handleDomainChange(WorkflowDomain.IOT)}
        >
          <Workflow size={20} color={selectedDomain === WorkflowDomain.IOT ? getDomainColor(WorkflowDomain.IOT) : '#6b7280'} />
          <Text style={[
            styles.domainTabText,
            selectedDomain === WorkflowDomain.IOT && styles.activeDomainTabText,
            selectedDomain === WorkflowDomain.IOT && { color: getDomainColor(WorkflowDomain.IOT) }
          ]}>
            IoT
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.domainTab,
            selectedDomain === WorkflowDomain.GENERAL && styles.activeDomainTab,
            selectedDomain === WorkflowDomain.GENERAL && { borderColor: getDomainColor(WorkflowDomain.GENERAL) }
          ]}
          onPress={() => handleDomainChange(WorkflowDomain.GENERAL)}
        >
          <FileText size={20} color={selectedDomain === WorkflowDomain.GENERAL ? getDomainColor(WorkflowDomain.GENERAL) : '#6b7280'} />
          <Text style={[
            styles.domainTabText,
            selectedDomain === WorkflowDomain.GENERAL && styles.activeDomainTabText,
            selectedDomain === WorkflowDomain.GENERAL && { color: getDomainColor(WorkflowDomain.GENERAL) }
          ]}>
            General
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  // Render KPIs grid
  const renderKPIs = () => {
    return (
      <View style={styles.kpiContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCcw size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <View key={kpi.id} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiName}>{kpi.name}</Text>
                <View style={styles.kpiTrend}>
                  {getTrendIcon(kpi.trend)}
                  {kpi.trend_value && (
                    <Text style={[
                      styles.kpiTrendValue,
                      kpi.trend === 'up' && styles.trendUp,
                      kpi.trend === 'down' && styles.trendDown
                    ]}>
                      {kpi.trend_value}%
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.kpiValueContainer}>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                {kpi.unit && <Text style={styles.kpiUnit}>{kpi.unit}</Text>}
              </View>
              
              {kpi.target && (
                <View style={styles.kpiTargetContainer}>
                  <View style={styles.kpiProgressBar}>
                    <View 
                      style={[
                        styles.kpiProgressFill, 
                        { 
                          width: `${typeof kpi.value === 'number' ? Math.min(100, (kpi.value / kpi.target) * 100) : 0}%`,
                          backgroundColor: getDomainColor(kpi.domain)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.kpiTarget}>Target: {kpi.target}{kpi.unit}</Text>
                </View>
              )}
              
              <Text style={styles.kpiCategory}>{kpi.category}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Render Charts
  const renderCharts = () => {
    return (
      <View style={styles.chartsContainer}>
        <Text style={styles.sectionTitle}>Domain Visualizations</Text>
        {charts.map(chart => renderChartPlaceholder(chart))}
      </View>
    );
  };

  // Render Alerts
  const renderAlerts = () => {
    const activeAlerts = alerts.filter(alert => alert.status === 'active');
    
    if (activeAlerts.length === 0) {
      return (
        <View style={styles.alertsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            <Text style={styles.alertsCount}>0</Text>
          </View>
          <View style={styles.emptyAlertsContainer}>
            <Bell size={24} color="#d1d5db" />
            <Text style={styles.emptyAlertsText}>No active alerts</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.alertsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Alerts</Text>
          <Text style={styles.alertsCount}>{activeAlerts.length}</Text>
        </View>
        
        {activeAlerts.map(alert => (
          <TouchableOpacity 
            key={alert.id} 
            style={styles.alertCard}
            onPress={() => handleAlertPress(alert)}
          >
            <View style={styles.alertHeader}>
              <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
              <Text style={styles.alertTitle}>{alert.title}</Text>
            </View>
            <Text style={styles.alertDescription} numberOfLines={2}>{alert.description}</Text>
            <View style={styles.alertFooter}>
              <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleTimeString()}</Text>
              <View style={styles.alertSeverityBadge}>
                <Text style={[styles.alertSeverity, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Show loading state
  if (loading && !refreshing && kpis.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Dashboards',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading Dashboard data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing && kpis.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Dashboards',
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Dashboards',
          headerShown: true,
        }}
      />
      
      <LinearGradient
        colors={[getDomainColor(selectedDomain), '#ffffff']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Dashboard
          </Text>
          <Text style={styles.headerSubtitle}>
            Real-time domain metrics and insights
          </Text>
        </View>
      </LinearGradient>
      
      {renderDomainTabs()}
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderKPIs()}
        {renderCharts()}
        {renderAlerts()}
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
    height: 100,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  domainTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  domainTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  activeDomainTab: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
  },
  domainTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginLeft: 8,
  },
  activeDomainTabText: {
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  kpiContainer: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  kpiName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  kpiTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiTrendValue: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  trendUp: {
    color: '#10b981',
  },
  trendDown: {
    color: '#ef4444',
  },
  kpiValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  kpiUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 2,
    marginBottom: 2,
  },
  kpiTargetContainer: {
    marginBottom: 8,
  },
  kpiProgressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 4,
  },
  kpiProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  kpiTarget: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  kpiCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  chartsContainer: {
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  chartDataText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alertsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  emptyAlertsContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emptyAlertsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});