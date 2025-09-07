import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Target, TrendingUp, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PersonalizationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fa709a', '#fee140']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <User size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Personalization Engine</Text>
          <Text style={styles.headerSubtitle}>Real-time product recommendations and customer insights</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Target size={32} color="#10b981" />
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricLabel}>Recommendation Accuracy</Text>
          </View>
          <View style={styles.metricCard}>
            <TrendingUp size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>+32%</Text>
            <Text style={styles.metricLabel}>Conversion Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Star size={32} color="#f59e0b" />
            <Text style={styles.metricValue}>4.8</Text>
            <Text style={styles.metricLabel}>Customer Satisfaction</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalization Segments</Text>
          <View style={styles.segmentsList}>
            {[
              { segment: 'Frequent Buyers', customers: 12450, engagement: '89%' },
              { segment: 'Price Sensitive', customers: 8234, engagement: '76%' },
              { segment: 'Brand Loyalists', customers: 5678, engagement: '92%' },
              { segment: 'New Customers', customers: 3421, engagement: '67%' }
            ].map((item, index) => (
              <View key={index} style={styles.segmentItem}>
                <User size={20} color="#3b82f6" />
                <View style={styles.segmentContent}>
                  <Text style={styles.segmentName}>{item.segment}</Text>
                  <Text style={styles.customerCount}>{item.customers.toLocaleString()} customers</Text>
                </View>
                <Text style={styles.engagementText}>{item.engagement}</Text>
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
  segmentsList: {
    gap: 12,
  },
  segmentItem: {
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
  segmentContent: {
    marginLeft: 12,
    flex: 1,
  },
  segmentName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  customerCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  engagementText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
});