import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Shield, Eye, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function FraudDetectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Shield size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Fraud Detection</Text>
          <Text style={styles.headerSubtitle}>Real-time transaction monitoring and threat detection</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Eye size={32} color="#10b981" />
            <Text style={styles.metricValue}>99.7%</Text>
            <Text style={styles.metricLabel}>Detection Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <AlertTriangle size={32} color="#ef4444" />
            <Text style={styles.metricValue}>12</Text>
            <Text style={styles.metricLabel}>Active Threats</Text>
          </View>
          <View style={styles.metricCard}>
            <Activity size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>2.4M</Text>
            <Text style={styles.metricLabel}>Transactions Monitored</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <View style={styles.alertsList}>
            {[
              { type: 'High Risk', description: 'Unusual transaction pattern detected', severity: 'high' },
              { type: 'Medium Risk', description: 'Multiple failed login attempts', severity: 'medium' },
              { type: 'Low Risk', description: 'New device access', severity: 'low' }
            ].map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <AlertTriangle 
                  size={20} 
                  color={alert.severity === 'high' ? '#ef4444' : alert.severity === 'medium' ? '#f59e0b' : '#10b981'} 
                />
                <View style={styles.alertContent}>
                  <Text style={styles.alertType}>{alert.type}</Text>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
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
  alertsList: {
    gap: 12,
  },
  alertItem: {
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
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});