import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Lock,
  Database,
  Wifi,
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  showChevron = true,
  rightComponent 
}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showChevron && !rightComponent && (
          <ChevronRight size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, children }) => {
  return (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [biometrics, setBiometrics] = useState<boolean>(true);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') }
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Data',
      'This will permanently delete all local data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete data') }
      ]
    );
  };

  const handleExportData = () => {
    console.log('Exporting data...');
    Alert.alert('Export', 'Data export started. You will be notified when complete.');
  };

  const handleImportData = () => {
    console.log('Importing data...');
    Alert.alert('Import', 'Please select a file to import.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <User size={32} color="#ffffff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@company.com</Text>
              <Text style={styles.profileRole}>System Administrator</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SettingSection title="Appearance">
          <SettingItem
            icon={darkMode ? <Moon size={20} color="#6b7280" /> : <Sun size={20} color="#6b7280" />}
            title="Dark Mode"
            subtitle={darkMode ? "Dark theme enabled" : "Light theme enabled"}
            showChevron={false}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<Palette size={20} color="#6b7280" />}
            title="Theme Customization"
            subtitle="Customize colors and layout"
            onPress={() => console.log('Theme customization')}
          />
          <SettingItem
            icon={<Smartphone size={20} color="#6b7280" />}
            title="Display Settings"
            subtitle="Screen brightness, text size"
            onPress={() => console.log('Display settings')}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingItem
            icon={<Bell size={20} color="#6b7280" />}
            title="Push Notifications"
            subtitle={notifications ? "Enabled" : "Disabled"}
            showChevron={false}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={notifications ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<SettingsIcon size={20} color="#6b7280" />}
            title="Notification Settings"
            subtitle="Customize alert types and timing"
            onPress={() => console.log('Notification settings')}
          />
        </SettingSection>

        <SettingSection title="Security & Privacy">
          <SettingItem
            icon={<Lock size={20} color="#6b7280" />}
            title="Biometric Authentication"
            subtitle={biometrics ? "Face ID / Fingerprint enabled" : "Disabled"}
            showChevron={false}
            rightComponent={
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={biometrics ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<Shield size={20} color="#6b7280" />}
            title="Privacy Settings"
            subtitle="Data collection and usage"
            onPress={() => console.log('Privacy settings')}
          />
          <SettingItem
            icon={<User size={20} color="#6b7280" />}
            title="Account Security"
            subtitle="Password, 2FA, security keys"
            onPress={() => console.log('Account security')}
          />
        </SettingSection>

        <SettingSection title="Data & Sync">
          <SettingItem
            icon={<Wifi size={20} color="#6b7280" />}
            title="Auto Sync"
            subtitle={autoSync ? "Automatic synchronization enabled" : "Manual sync only"}
            showChevron={false}
            rightComponent={
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={autoSync ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<Database size={20} color="#6b7280" />}
            title="Offline Mode"
            subtitle={offlineMode ? "Work without internet connection" : "Online mode"}
            showChevron={false}
            rightComponent={
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                thumbColor={offlineMode ? '#ffffff' : '#f3f4f6'}
              />
            }
          />
          <SettingItem
            icon={<Download size={20} color="#6b7280" />}
            title="Export Data"
            subtitle="Download your data"
            onPress={handleExportData}
          />
          <SettingItem
            icon={<Upload size={20} color="#6b7280" />}
            title="Import Data"
            subtitle="Upload data from file"
            onPress={handleImportData}
          />
        </SettingSection>

        <SettingSection title="System">
          <SettingItem
            icon={<Globe size={20} color="#6b7280" />}
            title="Language & Region"
            subtitle="English (US)"
            onPress={() => console.log('Language settings')}
          />
          <SettingItem
            icon={<HelpCircle size={20} color="#6b7280" />}
            title="Help & Support"
            subtitle="Documentation, contact support"
            onPress={() => console.log('Help & support')}
          />
          <SettingItem
            icon={<SettingsIcon size={20} color="#6b7280" />}
            title="Advanced Settings"
            subtitle="Developer options, diagnostics"
            onPress={() => console.log('Advanced settings')}
          />
        </SettingSection>

        <SettingSection title="Danger Zone">
          <SettingItem
            icon={<Trash2 size={20} color="#ef4444" />}
            title="Delete All Data"
            subtitle="Permanently remove all local data"
            onPress={handleDeleteData}
            showChevron={false}
          />
          <SettingItem
            icon={<LogOut size={20} color="#ef4444" />}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            showChevron={false}
          />
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI Automation Platform</Text>
          <Text style={styles.footerVersion}>Version 1.0.0 (Build 2024.1)</Text>
          <Text style={styles.footerCopyright}>© 2024 Enterprise Solutions Inc.</Text>
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
    paddingVertical: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: 14,
    color: '#e2e8f0',
    marginTop: 2,
  },
  profileRole: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  footerVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
});