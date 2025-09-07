import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Globe,
  MessageCircle,
  Users,
  Volume2,
  Mic,
  Languages,
  Zap,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  Heart
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  patients: number;
  accuracy: number;
  status: 'active' | 'training' | 'available';
}

interface Translation {
  id: string;
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  patientName: string;
  timestamp: string;
  accuracy: number;
  context: 'medical' | 'general' | 'emergency' | 'medication';
}

interface Patient {
  id: string;
  name: string;
  primaryLanguage: string;
  secondaryLanguages: string[];
  communicationPreference: 'text' | 'voice' | 'both';
  translationsUsed: number;
  satisfactionScore: number;
  lastInteraction: string;
}

const LanguageCard: React.FC<{ language: Language; onPress: () => void }> = ({ language, onPress }) => {
  const getStatusColor = () => {
    switch (language.status) {
      case 'active': return '#10b981';
      case 'training': return '#f59e0b';
      case 'available': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getAccuracyColor = () => {
    if (language.accuracy >= 95) return '#10b981';
    if (language.accuracy >= 85) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <TouchableOpacity style={styles.languageCard} onPress={onPress}>
      <View style={styles.languageHeader}>
        <View style={styles.languageInfo}>
          <View style={styles.languageNameContainer}>
            <Text style={styles.languageFlag}>{language.flag}</Text>
            <View>
              <Text style={styles.languageName}>{language.name}</Text>
              <Text style={styles.languageNative}>{language.nativeName}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>
      
      <View style={styles.languageMetrics}>
        <View style={styles.languageMetric}>
          <Text style={styles.metricValue}>{language.patients}</Text>
          <Text style={styles.metricLabel}>Patients</Text>
        </View>
        <View style={styles.languageMetric}>
          <Text style={[styles.metricValue, { color: getAccuracyColor() }]}>
            {language.accuracy}%
          </Text>
          <Text style={styles.metricLabel}>Accuracy</Text>
        </View>
        <View style={styles.languageMetric}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {language.status.toUpperCase()}
          </Text>
          <Text style={styles.metricLabel}>Status</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TranslationCard: React.FC<{ translation: Translation }> = ({ translation }) => {
  const getContextColor = () => {
    switch (translation.context) {
      case 'medical': return '#ef4444';
      case 'emergency': return '#dc2626';
      case 'medication': return '#f59e0b';
      case 'general': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getAccuracyColor = () => {
    if (translation.accuracy >= 95) return '#10b981';
    if (translation.accuracy >= 85) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={styles.translationCard}>
      <View style={styles.translationHeader}>
        <View style={styles.translationInfo}>
          <Text style={styles.patientName}>{translation.patientName}</Text>
          <Text style={styles.translationTime}>{translation.timestamp}</Text>
        </View>
        <View style={[styles.contextBadge, { backgroundColor: getContextColor() + '20' }]}>
          <Text style={[styles.contextText, { color: getContextColor() }]}>
            {translation.context.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.translationContent}>
        <View style={styles.translationBlock}>
          <Text style={styles.languageLabel}>
            {translation.fromLanguage} → {translation.toLanguage}
          </Text>
          <Text style={styles.originalText}>{translation.originalText}</Text>
          <Text style={styles.translatedText}>{translation.translatedText}</Text>
        </View>
      </View>
      
      <View style={styles.translationFooter}>
        <View style={styles.accuracyContainer}>
          <Text style={styles.accuracyLabel}>Accuracy:</Text>
          <Text style={[styles.accuracyValue, { color: getAccuracyColor() }]}>
            {translation.accuracy}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const PatientCard: React.FC<{ patient: Patient; onPress: () => void }> = ({ patient, onPress }) => {
  const getSatisfactionColor = () => {
    if (patient.satisfactionScore >= 4.5) return '#10b981';
    if (patient.satisfactionScore >= 3.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <TouchableOpacity style={styles.patientCard} onPress={onPress}>
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientLanguage}>Primary: {patient.primaryLanguage}</Text>
        </View>
        <View style={styles.satisfactionContainer}>
          <Heart size={16} color={getSatisfactionColor()} />
          <Text style={[styles.satisfactionScore, { color: getSatisfactionColor() }]}>
            {patient.satisfactionScore}
          </Text>
        </View>
      </View>
      
      <View style={styles.patientDetails}>
        <Text style={styles.secondaryLanguages}>
          Also speaks: {patient.secondaryLanguages.join(', ')}
        </Text>
        <Text style={styles.communicationPref}>
          Prefers: {patient.communicationPreference}
        </Text>
      </View>
      
      <View style={styles.patientMetrics}>
        <View style={styles.patientMetric}>
          <Text style={styles.metricValue}>{patient.translationsUsed}</Text>
          <Text style={styles.metricLabel}>Translations</Text>
        </View>
        <View style={styles.patientMetric}>
          <Text style={styles.metricValue}>{patient.lastInteraction}</Text>
          <Text style={styles.metricLabel}>Last Contact</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function MultiLanguageScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedView, setSelectedView] = useState<'languages' | 'translations' | 'patients'>('languages');
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadLanguageData();
    loadTranslationData();
    loadPatientData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadLanguageData = () => {
    const mockLanguages: Language[] = [
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
        patients: 45,
        accuracy: 96,
        status: 'active'
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        flag: '🇨🇳',
        patients: 32,
        accuracy: 94,
        status: 'active'
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        flag: '🇫🇷',
        patients: 28,
        accuracy: 97,
        status: 'active'
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        flag: '🇸🇦',
        patients: 23,
        accuracy: 92,
        status: 'active'
      },
      {
        code: 'ru',
        name: 'Russian',
        nativeName: 'Русский',
        flag: '🇷🇺',
        patients: 18,
        accuracy: 89,
        status: 'training'
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇵🇹',
        patients: 15,
        accuracy: 95,
        status: 'available'
      }
    ];
    setLanguages(mockLanguages);
  };

  const loadTranslationData = () => {
    const mockTranslations: Translation[] = [
      {
        id: '1',
        originalText: 'I have chest pain and difficulty breathing',
        translatedText: 'Tengo dolor en el pecho y dificultad para respirar',
        fromLanguage: 'English',
        toLanguage: 'Spanish',
        patientName: 'Maria Rodriguez',
        timestamp: '2:30 PM',
        accuracy: 98,
        context: 'emergency'
      },
      {
        id: '2',
        originalText: 'Take this medication twice daily with food',
        translatedText: '这种药物每天两次，与食物一起服用',
        fromLanguage: 'English',
        toLanguage: 'Chinese',
        patientName: 'Li Wei',
        timestamp: '1:45 PM',
        accuracy: 96,
        context: 'medication'
      },
      {
        id: '3',
        originalText: 'How are you feeling today?',
        translatedText: 'Comment vous sentez-vous aujourd\'hui?',
        fromLanguage: 'English',
        toLanguage: 'French',
        patientName: 'Jean Dubois',
        timestamp: '12:15 PM',
        accuracy: 99,
        context: 'general'
      },
      {
        id: '4',
        originalText: 'Your blood pressure is slightly elevated',
        translatedText: 'ضغط الدم لديك مرتفع قليلاً',
        fromLanguage: 'English',
        toLanguage: 'Arabic',
        patientName: 'Ahmed Hassan',
        timestamp: '11:30 AM',
        accuracy: 94,
        context: 'medical'
      }
    ];
    setTranslations(mockTranslations);
  };

  const loadPatientData = () => {
    const mockPatients: Patient[] = [
      {
        id: '1',
        name: 'Maria Rodriguez',
        primaryLanguage: 'Spanish',
        secondaryLanguages: ['English'],
        communicationPreference: 'both',
        translationsUsed: 24,
        satisfactionScore: 4.8,
        lastInteraction: '2 hours ago'
      },
      {
        id: '2',
        name: 'Li Wei',
        primaryLanguage: 'Chinese',
        secondaryLanguages: ['English'],
        communicationPreference: 'text',
        translationsUsed: 18,
        satisfactionScore: 4.6,
        lastInteraction: '1 day ago'
      },
      {
        id: '3',
        name: 'Jean Dubois',
        primaryLanguage: 'French',
        secondaryLanguages: ['English', 'Spanish'],
        communicationPreference: 'voice',
        translationsUsed: 12,
        satisfactionScore: 4.9,
        lastInteraction: '3 hours ago'
      },
      {
        id: '4',
        name: 'Ahmed Hassan',
        primaryLanguage: 'Arabic',
        secondaryLanguages: ['English'],
        communicationPreference: 'both',
        translationsUsed: 15,
        satisfactionScore: 4.4,
        lastInteraction: '5 hours ago'
      }
    ];
    setPatients(mockPatients);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    console.log('Updating multi-language communication data...');
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadLanguageData();
    loadTranslationData();
    loadPatientData();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleLanguagePress = (language: Language) => {
    Alert.alert(
      `${language.name} (${language.nativeName})`,
      `Patients: ${language.patients}\nAccuracy: ${language.accuracy}%\nStatus: ${language.status}\n\nThis language model is ${language.status === 'active' ? 'ready for use' : language.status === 'training' ? 'being improved' : 'available for activation'}.`,
      [
        { text: 'View Patients', onPress: () => console.log('View patients') },
        { text: 'Test Translation', onPress: () => console.log('Test translation') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handlePatientPress = (patient: Patient) => {
    Alert.alert(
      `Patient: ${patient.name}`,
      `Primary Language: ${patient.primaryLanguage}\nSecondary Languages: ${patient.secondaryLanguages.join(', ')}\nCommunication Preference: ${patient.communicationPreference}\nTranslations Used: ${patient.translationsUsed}\nSatisfaction Score: ${patient.satisfactionScore}/5`,
      [
        { text: 'Send Message', onPress: () => console.log('Send message') },
        { text: 'View History', onPress: () => console.log('View history') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleOptimizeTranslations = () => {
    Alert.alert(
      'AI Translation Optimization',
      'AI suggests the following optimizations:\n\n• Improve Russian language model accuracy\n• Add Vietnamese language support for new patient demographics\n• Implement context-aware medical terminology\n\nEstimated accuracy improvement: 8%',
      [
        { text: 'Apply Suggestions', onPress: () => console.log('Applying AI suggestions') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderLanguages = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Supported Languages ({languages.length})</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimizeTranslations}>
          <Zap size={16} color="#ffffff" />
          <Text style={styles.optimizeButtonText}>AI Optimize</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.languagesContainer}>
        {languages.map((language) => (
          <LanguageCard 
            key={language.code} 
            language={language} 
            onPress={() => handleLanguagePress(language)}
          />
        ))}
      </View>
    </View>
  );

  const renderTranslations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Translations ({translations.length})</Text>
      <View style={styles.translationsContainer}>
        {translations.map((translation) => (
          <TranslationCard key={translation.id} translation={translation} />
        ))}
      </View>
    </View>
  );

  const renderPatients = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Multilingual Patients ({patients.length})</Text>
      <View style={styles.patientsContainer}>
        {patients.map((patient) => (
          <PatientCard 
            key={patient.id} 
            patient={patient} 
            onPress={() => handlePatientPress(patient)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Multi-language Patient Communication',
          headerShown: true,
          headerStyle: { backgroundColor: '#667eea' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
          )
        }}
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Multi-language Communication</Text>
            <Text style={styles.headerSubtitle}>30+ language support with AI translation</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Globe size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>30+ Languages</Text>
            </View>
            <View style={styles.headerStat}>
              <Shield size={16} color="#ffffff" />
              <Text style={styles.headerStatText}>HIPAA Secure</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'languages' && styles.activeTab]}
          onPress={() => setSelectedView('languages')}
        >
          <Languages size={20} color={selectedView === 'languages' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'languages' && styles.activeTabText]}>Languages</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'translations' && styles.activeTab]}
          onPress={() => setSelectedView('translations')}
        >
          <MessageCircle size={20} color={selectedView === 'translations' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'translations' && styles.activeTabText]}>Translations</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedView === 'patients' && styles.activeTab]}
          onPress={() => setSelectedView('patients')}
        >
          <Users size={20} color={selectedView === 'patients' ? '#667eea' : '#6b7280'} />
          <Text style={[styles.tabText, selectedView === 'patients' && styles.activeTabText]}>Patients</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedView === 'languages' && renderLanguages()}
        {selectedView === 'translations' && renderTranslations()}
        {selectedView === 'patients' && renderPatients()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    padding: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 4,
  },
  headerStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  headerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  headerStatText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#667eea20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  optimizeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  languagesContainer: {
    gap: 12,
  },
  languageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  languageNative: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  languageMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  translationsContainer: {
    gap: 12,
  },
  translationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  translationInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  translationTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  contextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contextText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  translationContent: {
    marginBottom: 12,
  },
  translationBlock: {
    gap: 8,
  },
  languageLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  originalText: {
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  translatedText: {
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#e0f2fe',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  translationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accuracyLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  accuracyValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  patientsContainer: {
    gap: 12,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientLanguage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  satisfactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  satisfactionScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientDetails: {
    marginBottom: 12,
  },
  secondaryLanguages: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  communicationPref: {
    fontSize: 14,
    color: '#6b7280',
  },
  patientMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientMetric: {
    alignItems: 'center',
  },
});