import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Settings, Activity, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RobotManagerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Bot size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Educational Robot Manager</Text>
          <Text style={styles.headerSubtitle}>Interactive teaching robots and classroom automation</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Bot size={32} color="#10b981" />
            <Text style={styles.metricValue}>24</Text>
            <Text style={styles.metricLabel}>Active Robots</Text>
          </View>
          <View style={styles.metricCard}>
            <Users size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>1,247</Text>
            <Text style={styles.metricLabel}>Students Engaged</Text>
          </View>
          <View style={styles.metricCard}>
            <Activity size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>89%</Text>
            <Text style={styles.metricLabel}>Engagement Rate</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Robot Fleet Status</Text>
          <View style={styles.robotsList}>
            {[
              { name: 'NAO-Classroom-01', type: 'NAO Robot', status: 'active', location: 'Room 101' },
              { name: 'Pepper-Library-01', type: 'Pepper Robot', status: 'active', location: 'Library' },
              { name: 'TurtleBot-Lab-01', type: 'TurtleBot', status: 'maintenance', location: 'STEM Lab' },
              { name: 'Cozmo-Kindergarten-01', type: 'Cozmo', status: 'active', location: 'Kindergarten' }
            ].map((robot, index) => (
              <View key={index} style={styles.robotItem}>
                <View style={[styles.statusIndicator, { 
                  backgroundColor: robot.status === 'active' ? '#10b981' : 
                                 robot.status === 'maintenance' ? '#f59e0b' : '#ef4444'
                }]} />
                <View style={styles.robotContent}>
                  <Text style={styles.robotName}>{robot.name}</Text>
                  <Text style={styles.robotType}>{robot.type} • {robot.location}</Text>
                </View>
                <Settings size={20} color="#6b7280" />
              </View>
            ))}
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
    paddingVertical: 40,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  robotsList: {
    gap: 12,
  },
  robotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  robotContent: {
    flex: 1,
  },
  robotName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  robotType: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});