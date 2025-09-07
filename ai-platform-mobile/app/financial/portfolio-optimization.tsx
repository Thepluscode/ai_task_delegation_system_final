import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, TrendingUp, Target, DollarSign } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PortfolioOptimizationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <PieChart size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Portfolio Optimization</Text>
          <Text style={styles.headerSubtitle}>AI-powered asset allocation and risk management</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <TrendingUp size={32} color="#10b981" />
            <Text style={styles.metricValue}>+12.4%</Text>
            <Text style={styles.metricLabel}>Annual Return</Text>
          </View>
          <View style={styles.metricCard}>
            <Target size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>0.85</Text>
            <Text style={styles.metricLabel}>Sharpe Ratio</Text>
          </View>
          <View style={styles.metricCard}>
            <DollarSign size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>$2.4B</Text>
            <Text style={styles.metricLabel}>Assets Under Management</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asset Allocation</Text>
          <View style={styles.allocationList}>
            {[
              { asset: 'Equities', allocation: '45%', color: '#3b82f6' },
              { asset: 'Fixed Income', allocation: '30%', color: '#10b981' },
              { asset: 'Alternatives', allocation: '15%', color: '#f59e0b' },
              { asset: 'Cash', allocation: '10%', color: '#6b7280' }
            ].map((item, index) => (
              <View key={index} style={styles.allocationItem}>
                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                <Text style={styles.assetText}>{item.asset}</Text>
                <Text style={styles.allocationText}>{item.allocation}</Text>
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
  allocationList: {
    gap: 12,
  },
  allocationItem: {
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
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  assetText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  allocationText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
});