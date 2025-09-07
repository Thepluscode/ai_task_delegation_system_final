import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, Users, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StudentAnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <BarChart3 size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Student Analytics</Text>
          <Text style={styles.headerSubtitle}>Learning style and performance analysis</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Users size={32} color="#10b981" />
            <Text style={styles.metricValue}>12,450</Text>
            <Text style={styles.metricLabel}>Students Tracked</Text>
          </View>
          <View style={styles.metricCard}>
            <TrendingUp size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>+15%</Text>
            <Text style={styles.metricLabel}>Performance Improvement</Text>
          </View>
          <View style={styles.metricCard}>
            <Target size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>87%</Text>
            <Text style={styles.metricLabel}>Goal Achievement</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Styles Distribution</Text>
          <View style={styles.stylesList}>
            {[
              { style: 'Visual Learners', percentage: '42%', count: 5229, color: '#3b82f6' },
              { style: 'Auditory Learners', percentage: '28%', count: 3486, color: '#10b981' },
              { style: 'Kinesthetic Learners', percentage: '20%', count: 2490, color: '#f59e0b' },
              { style: 'Reading/Writing', percentage: '10%', count: 1245, color: '#8b5cf6' }
            ].map((item, index) => (
              <View key={index} style={styles.styleItem}>
                <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                <View style={styles.styleContent}>
                  <Text style={styles.styleName}>{item.style}</Text>
                  <Text style={styles.styleCount}>{item.count} students</Text>
                </View>
                <Text style={styles.percentageText}>{item.percentage}</Text>
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
  stylesList: {
    gap: 12,
  },
  styleItem: {
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
  colorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  styleContent: {
    flex: 1,
  },
  styleName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  styleCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  percentageText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
});