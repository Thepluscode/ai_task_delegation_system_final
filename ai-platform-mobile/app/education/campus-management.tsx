import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building, MapPin, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CampusManagementScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Building size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Campus Management</Text>
          <Text style={styles.headerSubtitle}>Resource and facility optimization system</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Building size={32} color="#10b981" />
            <Text style={styles.metricValue}>45</Text>
            <Text style={styles.metricLabel}>Buildings</Text>
          </View>
          <View style={styles.metricCard}>
            <MapPin size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>234</Text>
            <Text style={styles.metricLabel}>Rooms</Text>
          </View>
          <View style={styles.metricCard}>
            <Users size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>12,450</Text>
            <Text style={styles.metricLabel}>Students</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facility Utilization</Text>
          <View style={styles.facilitiesList}>
            {[
              { name: 'Main Library', utilization: '87%', capacity: '450/520', status: 'high' },
              { name: 'Science Labs', utilization: '65%', capacity: '156/240', status: 'medium' },
              { name: 'Lecture Halls', utilization: '92%', capacity: '1,840/2,000', status: 'high' },
              { name: 'Study Rooms', utilization: '34%', capacity: '68/200', status: 'low' }
            ].map((facility, index) => (
              <View key={index} style={styles.facilityItem}>
                <View style={[styles.utilizationBar, { 
                  backgroundColor: facility.status === 'high' ? '#ef4444' : 
                                 facility.status === 'medium' ? '#f59e0b' : '#10b981'
                }]} />
                <View style={styles.facilityContent}>
                  <Text style={styles.facilityName}>{facility.name}</Text>
                  <Text style={styles.facilityCapacity}>{facility.capacity} capacity</Text>
                </View>
                <Text style={[styles.utilizationText, {
                  color: facility.status === 'high' ? '#ef4444' : 
                        facility.status === 'medium' ? '#f59e0b' : '#10b981'
                }]}>{facility.utilization}</Text>
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
  facilitiesList: {
    gap: 12,
  },
  facilityItem: {
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
  utilizationBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  facilityContent: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  facilityCapacity: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  utilizationText: {
    fontSize: 16,
    fontWeight: '600',
  },
});