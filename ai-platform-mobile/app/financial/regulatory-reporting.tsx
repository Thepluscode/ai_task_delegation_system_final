import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Send, CheckCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegulatoryReportingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <FileText size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Regulatory Reporting</Text>
          <Text style={styles.headerSubtitle}>Automated compliance submissions and reporting</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Send size={32} color="#10b981" />
            <Text style={styles.metricValue}>247</Text>
            <Text style={styles.metricLabel}>Reports Submitted</Text>
          </View>
          <View style={styles.metricCard}>
            <CheckCircle size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>100%</Text>
            <Text style={styles.metricLabel}>On-Time Delivery</Text>
          </View>
          <View style={styles.metricCard}>
            <Clock size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>15</Text>
            <Text style={styles.metricLabel}>Pending Reports</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Reports</Text>
          <View style={styles.reportsList}>
            {[
              { name: 'Basel III Capital Adequacy', due: '2024-01-15', status: 'in-progress' },
              { name: 'MiFID II Transaction Reporting', due: '2024-01-20', status: 'pending' },
              { name: 'Dodd-Frank Stress Test', due: '2024-01-25', status: 'draft' },
              { name: 'GDPR Data Protection Report', due: '2024-01-30', status: 'completed' }
            ].map((report, index) => (
              <View key={index} style={styles.reportItem}>
                <View style={[styles.statusDot, { 
                  backgroundColor: report.status === 'completed' ? '#10b981' : 
                                 report.status === 'in-progress' ? '#3b82f6' : 
                                 report.status === 'draft' ? '#f59e0b' : '#6b7280'
                }]} />
                <View style={styles.reportContent}>
                  <Text style={styles.reportName}>{report.name}</Text>
                  <Text style={styles.reportDue}>Due: {report.due}</Text>
                </View>
                <Text style={[styles.reportStatus, {
                  color: report.status === 'completed' ? '#10b981' : 
                        report.status === 'in-progress' ? '#3b82f6' : 
                        report.status === 'draft' ? '#f59e0b' : '#6b7280'
                }]}>{report.status.replace('-', ' ')}</Text>
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
  reportsList: {
    gap: 12,
  },
  reportItem: {
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
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  reportDue: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  reportStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});