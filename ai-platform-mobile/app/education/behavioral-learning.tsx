import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brain, Users, Activity, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BehavioralLearningScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Brain size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Behavioral Learning</Text>
          <Text style={styles.headerSubtitle}>Social interaction optimization and behavior analysis</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Brain size={32} color="#10b981" />
            <Text style={styles.metricValue}>89%</Text>
            <Text style={styles.metricLabel}>Engagement Score</Text>
          </View>
          <View style={styles.metricCard}>
            <Users size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>76%</Text>
            <Text style={styles.metricLabel}>Social Interaction</Text>
          </View>
          <View style={styles.metricCard}>
            <Heart size={32} color="#ef4444" />
            <Text style={styles.metricValue}>92%</Text>
            <Text style={styles.metricLabel}>Emotional Wellbeing</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Behavioral Patterns</Text>
          <View style={styles.patternsList}>
            {[
              { pattern: 'Collaborative Learning', score: '85%', trend: 'up' },
              { pattern: 'Independent Study', score: '78%', trend: 'stable' },
              { pattern: 'Peer Interaction', score: '92%', trend: 'up' },
              { pattern: 'Problem Solving', score: '81%', trend: 'down' }
            ].map((item, index) => (
              <View key={index} style={styles.patternItem}>
                <Activity 
                  size={20} 
                  color={item.trend === 'up' ? '#10b981' : item.trend === 'down' ? '#ef4444' : '#6b7280'} 
                />
                <View style={styles.patternContent}>
                  <Text style={styles.patternName}>{item.pattern}</Text>
                  <Text style={styles.patternTrend}>
                    {item.trend === 'up' ? '↗ Improving' : item.trend === 'down' ? '↘ Declining' : '→ Stable'}
                  </Text>
                </View>
                <Text style={[styles.scoreText, {
                  color: item.trend === 'up' ? '#10b981' : item.trend === 'down' ? '#ef4444' : '#6b7280'
                }]}>{item.score}</Text>
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
  patternsList: {
    gap: 12,
  },
  patternItem: {
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
  patternContent: {
    marginLeft: 12,
    flex: 1,
  },
  patternName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  patternTrend: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
});