import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ComplianceMonitoringScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Shield size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Compliance Monitoring</Text>
          <Text style={styles.headerSubtitle}>Real-time regulatory compliance tracking</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <CheckCircle size={32} color="#10b981" />
            <Text style={styles.metricValue}>99.8%</Text>
            <Text style={styles.metricLabel}>Compliance Score</Text>
          </View>
          <View style={styles.metricCard}>
            <AlertTriangle size={32} color="#f59e0b" />
            <Text style={styles.metricValue}>3</Text>
            <Text style={styles.metricLabel}>Active Alerts</Text>
          </View>
          <View style={styles.metricCard}>
            <TrendingUp size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>247</Text>
            <Text style={styles.metricLabel}>Reports Generated</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulatory Frameworks</Text>
          <View style={styles.frameworksList}>
            {['SOX', 'Basel III', 'MiFID II', 'Dodd-Frank', 'GDPR'].map((framework, index) => (
              <View key={index} style={styles.frameworkItem}>
                <CheckCircle size={20} color="#10b981" />
                <Text style={styles.frameworkText}>{framework}</Text>
                <Text style={styles.frameworkStatus}>Compliant</Text>
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
    fontSize: 24,
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
  frameworksList: {
    gap: 12,
  },
  frameworkItem: {
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
  frameworkText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
    flex: 1,
  },
  frameworkStatus: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
});