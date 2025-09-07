import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function QualityControlScreen() {
  const [metrics] = useState({
    overallQuality: 98.2,
    defectRate: 1.8,
    inspectionRate: 245,
    passRate: 96.4
  });

  const handleAction = (action: string) => {
    Alert.alert('Quality Control', `${action} action initiated.`, [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Shield size={32} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Quality Control System</Text>
          <Text style={styles.headerSubtitle}>Automated inspection and testing</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Metrics</Text>
          
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <TrendingUp size={24} color="#10b981" />
              <Text style={styles.metricTitle}>Overall Quality Score</Text>
            </View>
            <Text style={styles.metricValue}>{metrics.overallQuality}%</Text>
            <Text style={styles.metricChange}>+0.3% from yesterday</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <AlertTriangle size={24} color="#ef4444" />
              <Text style={styles.metricTitle}>Defect Rate</Text>
            </View>
            <Text style={styles.metricValue}>{metrics.defectRate}%</Text>
            <Text style={styles.metricChange}>-0.2% from yesterday</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <CheckCircle size={24} color="#3b82f6" />
              <Text style={styles.metricTitle}>Inspection Rate</Text>
            </View>
            <Text style={styles.metricValue}>{metrics.inspectionRate} units/hr</Text>
            <Text style={styles.metricChange}>+12 from yesterday</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('Start Inspection')}>
            <Text style={styles.actionText}>Start Quality Inspection</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('Generate Report')}>
            <Text style={styles.actionText}>Generate Quality Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleAction('Calibrate Equipment')}>
            <Text style={styles.actionText}>Calibrate Equipment</Text>
          </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 14,
    color: '#10b981',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});