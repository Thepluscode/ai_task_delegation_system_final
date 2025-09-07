import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function InventoryOptimizationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#fa709a', '#fee140']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Package size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Inventory Optimization</Text>
          <Text style={styles.headerSubtitle}>Demand forecasting and stock management</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Package size={32} color="#10b981" />
            <Text style={styles.metricValue}>98.5%</Text>
            <Text style={styles.metricLabel}>Stock Accuracy</Text>
          </View>
          <View style={styles.metricCard}>
            <TrendingDown size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>-23%</Text>
            <Text style={styles.metricLabel}>Waste Reduction</Text>
          </View>
          <View style={styles.metricCard}>
            <CheckCircle size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricLabel}>Fulfillment Rate</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inventory Alerts</Text>
          <View style={styles.alertsList}>
            {[
              { item: 'Winter Jackets', status: 'low-stock', quantity: 23 },
              { item: 'Running Shoes', status: 'reorder', quantity: 156 },
              { item: 'Smartphones', status: 'overstock', quantity: 847 },
              { item: 'Headphones', status: 'optimal', quantity: 234 }
            ].map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <AlertTriangle 
                  size={20} 
                  color={alert.status === 'low-stock' ? '#ef4444' : 
                        alert.status === 'reorder' ? '#f59e0b' : 
                        alert.status === 'overstock' ? '#8b5cf6' : '#10b981'} 
                />
                <View style={styles.alertContent}>
                  <Text style={styles.itemName}>{alert.item}</Text>
                  <Text style={styles.itemQuantity}>{alert.quantity} units</Text>
                </View>
                <Text style={[styles.statusText, {
                  color: alert.status === 'low-stock' ? '#ef4444' : 
                        alert.status === 'reorder' ? '#f59e0b' : 
                        alert.status === 'overstock' ? '#8b5cf6' : '#10b981'
                }]}>{alert.status.replace('-', ' ')}</Text>
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
  itemName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});