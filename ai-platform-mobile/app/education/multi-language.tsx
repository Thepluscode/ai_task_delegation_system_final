import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Globe, MessageCircle, Users, Headphones } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MultiLanguageScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#43e97b', '#38f9d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Globe size={48} color="#ffffff" />
          <Text style={styles.headerTitle}>Multi-language Support</Text>
          <Text style={styles.headerSubtitle}>Global education accessibility and communication</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Globe size={32} color="#10b981" />
            <Text style={styles.metricValue}>47</Text>
            <Text style={styles.metricLabel}>Languages Supported</Text>
          </View>
          <View style={styles.metricCard}>
            <Users size={32} color="#3b82f6" />
            <Text style={styles.metricValue}>8,234</Text>
            <Text style={styles.metricLabel}>International Students</Text>
          </View>
          <View style={styles.metricCard}>
            <MessageCircle size={32} color="#8b5cf6" />
            <Text style={styles.metricValue}>98%</Text>
            <Text style={styles.metricLabel}>Translation Accuracy</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Languages</Text>
          <View style={styles.languagesList}>
            {[
              { language: 'English', students: 4521, percentage: '55%' },
              { language: 'Spanish', students: 1247, percentage: '15%' },
              { language: 'Mandarin', students: 987, percentage: '12%' },
              { language: 'French', students: 654, percentage: '8%' },
              { language: 'Arabic', students: 432, percentage: '5%' },
              { language: 'Others', students: 393, percentage: '5%' }
            ].map((item, index) => (
              <View key={index} style={styles.languageItem}>
                <Headphones size={20} color="#3b82f6" />
                <View style={styles.languageContent}>
                  <Text style={styles.languageName}>{item.language}</Text>
                  <Text style={styles.studentCount}>{item.students} students</Text>
                </View>
                <Text style={styles.percentageText}>{item.percentage}</Text>
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
  languagesList: {
    gap: 12,
  },
  languageItem: {
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
  languageContent: {
    marginLeft: 12,
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  studentCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  percentageText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
});