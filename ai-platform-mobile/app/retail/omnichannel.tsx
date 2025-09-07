import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Layers, Smartphone, Monitor, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function OmnichannelScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#fa709a', '#fee140']} style={styles.header}>
        <View style={styles.headerContent}>
          <Layers size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Omnichannel Integration</Text>
          <Text style={styles.headerSubtitle}>Unified customer experience across all touchpoints</Text>
        </View>
      </LinearGradient>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Monitor size={32} color="#10b981" />
            <Text style={styles.metricValue}>8</Text>
            <Text style={styles.metricLabel}>Channels</Text>
          </View>
          <View style={styles.metricCard}>
            <Smartphone size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>94%</Text>
            <Text style={styles.metricLabel}>Sync Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <ShoppingBag size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>67%</Text>
            <Text style={styles.metricLabel}>Cross-Channel Sales</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 40 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginTop: 16 },
  headerSubtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9, marginTop: 8, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 12 },
  metricCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  metricValue: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginTop: 8 },
  metricLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, textAlign: 'center' },
});