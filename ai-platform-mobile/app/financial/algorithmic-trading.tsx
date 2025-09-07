import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function AlgorithmicTradingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <TrendingUp size={32} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Algorithmic Trading Engine</Text>
          <Text style={styles.headerSubtitle}>Sub-millisecond execution</Text>
        </View>
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Performance</Text>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Daily P&L</Text>
            <Text style={styles.metricValue}>+$2.4M</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Execution Speed</Text>
            <Text style={styles.metricValue}>0.3ms</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Algorithmic Trading', 'Trading algorithm activated.', [{ text: 'OK' }])}>
            <Text style={styles.actionText}>Start Trading Algorithm</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 20, paddingBottom: 40, paddingHorizontal: 20 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  headerContent: { alignItems: 'center' },
  headerIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#ffffff', opacity: 0.9, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20 },
  section: { marginTop: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  metricCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  metricTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 8 },
  metricValue: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
  actionButton: { backgroundColor: '#3b82f6', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center' },
  actionText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
});