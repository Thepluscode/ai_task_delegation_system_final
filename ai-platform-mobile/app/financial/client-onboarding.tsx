import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, CheckCircle, Clock, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ClientOnboardingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <UserPlus size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Client Onboarding</Text>
          <Text style={styles.headerSubtitle}>Automated KYC/AML processes and client verification</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <CheckCircle size={32} color="#10b981" />
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricLabel}>Completion Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Clock size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>2.3h</Text>
            <Text style={styles.metricLabel}>Avg Processing Time</Text>
          </View>
          <View style={styles.metricCard}>
            <FileText size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>1,247</Text>
            <Text style={styles.metricLabel}>Applications This Month</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Onboarding Pipeline</Text>
          <View style={styles.pipelineList}>
            {[
              { stage: 'Document Collection', count: 45, status: 'active' },
              { stage: 'Identity Verification', count: 32, status: 'active' },
              { stage: 'Risk Assessment', count: 28, status: 'active' },
              { stage: 'Compliance Review', count: 15, status: 'pending' },
              { stage: 'Account Activation', count: 8, status: 'completed' }
            ].map((item, index) => (
              <View key={index} style={styles.pipelineItem}>
                <View style={[styles.statusIndicator, { 
                  backgroundColor: item.status === 'completed' ? '#10b981' : 
                                 item.status === 'active' ? '#3b82f6' : '#f59e0b' 
                }]} />
                <View style={styles.pipelineContent}>
                  <Text style={styles.stageText}>{item.stage}</Text>
                  <Text style={styles.countText}>{item.count} clients</Text>
                </View>
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
  pipelineList: {
    gap: 12,
  },
  pipelineItem: {
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
  pipelineContent: {
    flex: 1,
  },
  stageText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  countText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});