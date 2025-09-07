import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function LeanManufacturingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Target size={32} color="#ffffff" />
          </View>
          <Text style={styles.headerTitle}>Lean Manufacturing</Text>
          <Text style={styles.headerSubtitle}>Waste identification and optimization</Text>
        </View>
      </LinearGradient>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lean Metrics</Text>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Waste Reduction</Text>
            <Text style={styles.metricValue}>23.4%</Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={() => Alert.alert('Lean Manufacturing', 'Waste analysis completed.', [{ text: 'OK' }])}>
            <Text style={styles.actionText}>Analyze Waste</Text>
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