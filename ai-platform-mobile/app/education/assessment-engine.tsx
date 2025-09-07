import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileCheck, BarChart, Clock, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AssessmentEngineScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FileCheck size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Assessment Engine</Text>
          <Text style={styles.headerSubtitle}>Automated grading and diagnostic assessment</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <FileCheck size={32} color="#10b981" />
            <Text style={styles.metricValue}>2,847</Text>
            <Text style={styles.metricLabel}>Assessments Graded</Text>
          </View>
          <View style={styles.metricCard}>
            <Clock size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>1.2s</Text>
            <Text style={styles.metricLabel}>Avg Grading Time</Text>
          </View>
          <View style={styles.metricCard}>
            <Award size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricLabel}>Accuracy Rate</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Types</Text>
          <View style={styles.assessmentsList}>
            {[
              { type: 'Multiple Choice', count: 1247, accuracy: '98%' },
              { type: 'Essay Questions', count: 856, accuracy: '92%' },
              { type: 'Math Problems', count: 634, accuracy: '96%' },
              { type: 'Code Review', count: 110, accuracy: '89%' }
            ].map((assessment, index) => (
              <View key={index} style={styles.assessmentItem}>
                <BarChart size={20} color="#3b82f6" />
                <View style={styles.assessmentContent}>
                  <Text style={styles.assessmentType}>{assessment.type}</Text>
                  <Text style={styles.assessmentCount}>{assessment.count} assessments</Text>
                </View>
                <Text style={styles.accuracyText}>{assessment.accuracy}</Text>
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
  assessmentsList: {
    gap: 12,
  },
  assessmentItem: {
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
  assessmentContent: {
    marginLeft: 12,
    flex: 1,
  },
  assessmentType: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  assessmentCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  accuracyText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
});