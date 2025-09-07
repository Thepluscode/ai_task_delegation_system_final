import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { useAuth } from '../services/context/AuthContext';
import { robotService, Robot } from '../services/api/robotService';

export default function RobotsScreen() {
  const { isAuthenticated } = useAuth();
  const [robots, setRobots] = React.useState<Robot[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Calculate system overview stats
  const activeRobots = robots.filter(r => r.status === 'Active').length;
  const totalTasks = robots.reduce((sum, robot) => sum + robot.tasks, 0);
  const avgEfficiency = activeRobots > 0 
    ? robots
        .filter(r => r.status === 'Active')
        .reduce((sum, robot) => sum + parseFloat(robot.efficiency), 0) / activeRobots
    : 0;

  // Load data from robotService
  const loadRobots = React.useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await robotService.getRobots();
      setRobots(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load robots:", err);
      setError('Failed to load robot data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

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
    // navigation.navigate('RobotDetail', { robotId: robot.id });
  };

  // Show loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'AI Robots',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c5ce7" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading robots data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'AI Robots',
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              // Retry loading data
              loadRobots();
            }}
          >
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
          title: 'AI Robots',
          headerShown: true,
        }}
      />
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>AI Robots & Automation</Text>
          <Text style={styles.subtitle}>Intelligent Process Automation</Text>
          {robots.length > 0 && (
            <Text style={styles.lastUpdate}>Last updated: {new Date().toLocaleTimeString()}</Text>
          )}
        </View>

        <View style={styles.overview}>
          <Text style={styles.overviewTitle}>System Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{activeRobots}/{robots.length}</Text>
              <Text style={styles.overviewLabel}>Active Bots</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{totalTasks.toLocaleString()}</Text>
              <Text style={styles.overviewLabel}>Tasks Today</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{avgEfficiency.toFixed(1)}%</Text>
              <Text style={styles.overviewLabel}>Avg Efficiency</Text>
            </View>
          </View>
        </View>

        {robots.map((robot) => (
          <TouchableOpacity
            key={robot.id}
            style={styles.robotCard}
            onPress={() => handleRobotPress(robot)}
          >
            <View style={styles.robotHeader}>
              <Text style={styles.robotName}>{robot.name}</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: robot.status === 'Active' ? '#28a745' : '#ffc107' 
              }]}>
                <Text style={styles.statusText}>{robot.status}</Text>
              </View>
            </View>
            <View style={styles.robotStats}>
              <View style={styles.robotStat}>
                <Text style={styles.robotStatValue}>
                  {robot.tasks > 0 ? robot.tasks.toLocaleString() : '0'}
                </Text>
                <Text style={styles.robotStatLabel}>Tasks</Text>
              </View>
              <View style={styles.robotStat}>
                <Text style={styles.robotStatValue}>{robot.efficiency}</Text>
                <Text style={styles.robotStatLabel}>Efficiency</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4
  },
  overview: {
    backgroundColor: '#6c5ce7',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#ddd6fe',
    marginTop: 4,
  },
  robotCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  robotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  robotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  robotStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  robotStat: {
    alignItems: 'center',
  },
  robotStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  robotStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
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