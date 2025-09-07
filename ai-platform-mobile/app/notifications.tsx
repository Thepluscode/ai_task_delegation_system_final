import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Settings,
  Trash2
} from 'lucide-react-native';

import {
  notificationService,
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationSubscription
} from '../services/api/notificationService';
import { WorkflowDomain } from '../services/api/workflowService';
import { useAuth } from '../services/context/AuthContext';

export default function NotificationsScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [subscriptions, setSubscriptions] = useState<NotificationSubscription[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      
      // Initialize WebSocket connection for real-time notifications
      notificationService.initializeWebSocket();
      
      // Add message listener
      const removeListener = notificationService.addMessageListener(handleNewNotification);
      
      return () => {
        removeListener();
      };
    }
    
    // Return a no-op cleanup function when not authenticated
    return () => {};
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch notifications and subscription preferences
      const [notificationsData, subscriptionsData] = await Promise.all([
        notificationService.getNotifications(50, 0), // Get up to 50 notifications
        notificationService.getNotificationPreferences()
      ]);
      
      setNotifications(notificationsData);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error loading notification data:', error);
      Alert.alert('Error', 'Failed to load notification data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewNotification = (notification: Notification) => {
    // Add new notification to the list
    setNotifications(prev => [notification, ...prev]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await notificationService.markAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleUpdateSubscription = async (subscription: NotificationSubscription, value: boolean) => {
    try {
      const updatedSubscription = {
        ...subscription,
        active: value
      };
      
      await notificationService.updateNotificationPreferences(updatedSubscription);
      
      // Update local state
      setSubscriptions(prev => 
        prev.map(s => s.id === subscription.id ? updatedSubscription : s)
      );
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert('Error', 'Failed to update notification subscription');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.INFO:
        return <Info size={20} color="#3b82f6" />;
      case NotificationType.SUCCESS:
        return <CheckCircle size={20} color="#10b981" />;
      case NotificationType.WARNING:
        return <AlertTriangle size={20} color="#f59e0b" />;
      case NotificationType.ERROR:
        return <AlertCircle size={20} color="#ef4444" />;
      case NotificationType.SYSTEM:
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };
  
  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case NotificationCategory.SECURITY:
        return '#ef4444'; // red
      case NotificationCategory.SYSTEM:
        return '#6b7280'; // gray
      case NotificationCategory.WORKFLOW:
        return '#3b82f6'; // blue
      case NotificationCategory.AGENT:
        return '#8b5cf6'; // purple
      case NotificationCategory.IOT:
        return '#f59e0b'; // orange
      case NotificationCategory.HEALTHCARE:
        return '#10b981'; // green
      case NotificationCategory.MANUFACTURING:
        return '#ec4899'; // pink
      case NotificationCategory.USER:
      default:
        return '#6b7280'; // gray
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleMarkAsRead(item)}
    >
      <View style={[styles.notificationIcon, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
        {getNotificationIcon(item.type)}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        <View style={styles.notificationMeta}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: `${getCategoryColor(item.category)}20` }
          ]}>
            <Text style={[
              styles.categoryText,
              { color: getCategoryColor(item.category) }
            ]}>
              {item.category}
            </Text>
          </View>
          
          <View style={[
            styles.priorityBadge,
            { 
              backgroundColor: 
                item.priority === 'critical' ? '#ef444420' :
                item.priority === 'high' ? '#f59e0b20' :
                item.priority === 'medium' ? '#3b82f620' :
                '#10b98120'
            }
          ]}>
            <Text style={[
              styles.priorityText,
              { 
                color: 
                  item.priority === 'critical' ? '#ef4444' :
                  item.priority === 'high' ? '#f59e0b' :
                  item.priority === 'medium' ? '#3b82f6' :
                  '#10b981'
              }
            ]}>
              {item.priority}
            </Text>
          </View>
        </View>
      </View>
      
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const renderSettingsItem = ({ item }: { item: NotificationSubscription }) => (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemContent}>
        <View style={styles.settingsItemHeader}>
          <Text style={styles.settingsItemTitle}>
            {item.categories.join(', ')} Notifications
          </Text>
          <Switch
            value={item.active}
            onValueChange={(value: boolean) => handleUpdateSubscription(item, value)}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor="#ffffff"
          />
        </View>
        
        <View style={styles.settingsMeta}>
          <Text style={styles.settingsMetaText}>
            Domains: {item.domains.join(', ')}
          </Text>
          <Text style={styles.settingsMetaText}>
            Priority: {item.priority_threshold} and above
          </Text>
          <Text style={styles.settingsMetaText}>
            Channels: {item.channels.join(', ')}
          </Text>
        </View>
      </View>
    </View>
  );

  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return notifications;
    } else if (activeTab === 'unread') {
      return notifications.filter(n => !n.read);
    } else {
      // Filter by category
      return notifications.filter(n => n.category === activeTab);
    }
  };
  
  const filteredNotifications = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerShown: true,
        }}
      />
      
      {/* Tabs for filtering notifications */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
            onPress={() => setActiveTab('unread')}
          >
            <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
              Unread
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === NotificationCategory.SYSTEM && styles.activeTab
            ]}
            onPress={() => setActiveTab(NotificationCategory.SYSTEM)}
          >
            <Text style={[
              styles.tabText, 
              activeTab === NotificationCategory.SYSTEM && styles.activeTabText
            ]}>
              System
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === NotificationCategory.SECURITY && styles.activeTab
            ]}
            onPress={() => setActiveTab(NotificationCategory.SECURITY)}
          >
            <Text style={[
              styles.tabText, 
              activeTab === NotificationCategory.SECURITY && styles.activeTabText
            ]}>
              Security
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === NotificationCategory.WORKFLOW && styles.activeTab
            ]}
            onPress={() => setActiveTab(NotificationCategory.WORKFLOW)}
          >
            <Text style={[
              styles.tabText, 
              activeTab === NotificationCategory.WORKFLOW && styles.activeTabText
            ]}>
              Workflow
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Header actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsLeft}>
          <Text style={styles.notificationCount}>
            {filteredNotifications.length} notifications
          </Text>
        </View>
        
        <View style={styles.actionsRight}>
          {notifications.some(n => !n.read) && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.actionButtonText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.actionIconButton,
              showSettings && styles.activeActionButton
            ]}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Settings size={20} color={showSettings ? '#3b82f6' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Notification Preferences</Text>
          
          <FlatList
            data={subscriptions}
            renderItem={renderSettingsItem}
            keyExtractor={(item: NotificationSubscription) => item.id}
            contentContainerStyle={styles.settingsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {/* Notifications List */}
      {!showSettings && (
        <>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bell size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'all' 
                  ? "You don't have any notifications yet"
                  : activeTab === 'unread'
                    ? "You don't have any unread notifications"
                    : `You don't have any ${activeTab} notifications`
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item: Notification) => item.id}
              contentContainerStyle={styles.notificationsList}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabScrollContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionsLeft: {},
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  actionButton: {
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  activeActionButton: {
    backgroundColor: '#eff6ff',
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f3f4f6',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  settingsContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingsList: {
    paddingBottom: 16,
  },
  settingsItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  settingsItemContent: {
    padding: 16,
  },
  settingsItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 16,
  },
  settingsMeta: {
    gap: 4,
  },
  settingsMetaText: {
    fontSize: 14,
    color: '#6b7280',
  },
});