import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import {
  notificationService,
  Notification,
  NotificationType
} from '../services/api/notificationService';
import { useAuth } from '../services/context/AuthContext';

const { width, height } = Dimensions.get('window');

interface NotificationCenterProps {
  onSettingsPress?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  onSettingsPress 
}) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [connected, setConnected] = useState(false);
  const [newNotification, setNewNotification] = useState<Notification | null>(null);
  
  const toastAnim = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Initialize the WebSocket connection
    notificationService.initializeWebSocket();
    
    // Fetch initial notifications
    loadNotifications();
    
    // Add message listener for new notifications
    const removeMessageListener = notificationService.addMessageListener(
      (notification) => {
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        // Increment unread count
        setUnreadCount(prev => prev + 1);
        // Show toast notification
        showToastNotification(notification);
      }
    );
    
    // Add connection state listener
    const removeConnectionListener = notificationService.addConnectionStateListener(
      (isConnected) => {
        setConnected(isConnected);
      }
    );
    
    // Cleanup on unmount
    return () => {
      notificationService.closeConnection();
      removeMessageListener();
      removeConnectionListener();
    };
  }, [isAuthenticated]);
  
  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(20, 0);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  const showToastNotification = (notification: Notification) => {
    setNewNotification(notification);
    
    // Animate toast in
    Animated.timing(toastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setNewNotification(null);
      });
    }, 5000);
  };
  
  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        
        // Update the local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Handle any action associated with the notification
    if (notification.action_url) {
      // In a real app, you would navigate to the action URL
      console.log(`Navigate to: ${notification.action_url}`);
    }
    
    // Close the modal
    setIsModalVisible(false);
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 18 };
    switch (type) {
      case NotificationType.INFO:
        return <MaterialIcons name="info" {...iconProps} color="#3b82f6" />;
      case NotificationType.SUCCESS:
        return <MaterialIcons name="check-circle" {...iconProps} color="#10b981" />;
      case NotificationType.WARNING:
        return <MaterialIcons name="warning" {...iconProps} color="#f59e0b" />;
      case NotificationType.ERROR:
        return <MaterialIcons name="error" {...iconProps} color="#ef4444" />;
      default:
        return <MaterialIcons name="info" {...iconProps} color="#6b7280" />;
    }
  };
  
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );
  
  return (
    <>
      {/* Bell icon with badge */}
      <TouchableOpacity 
        style={styles.bellContainer} 
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialIcons 
          name="notifications" 
          size={24} 
          color={connected ? '#1f2937' : '#9ca3af'} 
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Toast notification for new notifications */}
      {newNotification && (
        <Animated.View 
          style={[
            styles.toastContainer,
            { transform: [{ translateY: toastAnim }] }
          ]}
        >
          <View style={styles.toastIconContainer}>
            {getNotificationIcon(newNotification.type)}
          </View>
          <View style={styles.toastContent}>
            <Text style={styles.toastTitle}>{newNotification.title}</Text>
            <Text style={styles.toastMessage} numberOfLines={2}>
              {newNotification.message}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.toastCloseButton}
            onPress={() => {
              Animated.timing(toastAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true
              }).start(() => {
                setNewNotification(null);
              });
            }}
          >
            <MaterialIcons name="close" size={16} color="#6b7280" />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Notifications modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.modalActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity 
                    style={styles.markAllReadButton}
                    onPress={handleMarkAllAsRead}
                  >
                    <Text style={styles.markAllReadText}>Mark all as read</Text>
                  </TouchableOpacity>
                )}
                
                {onSettingsPress && (
                  <TouchableOpacity 
                    style={styles.settingsButton}
                    onPress={() => {
                      setIsModalVisible(false);
                      onSettingsPress();
                    }}
                  >
                    <MaterialIcons name="settings" size={20} color="#6b7280" />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <MaterialIcons name="close" size={20} color="#1f2937" />
                </TouchableOpacity>
              </View>
            </View>
            
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="notifications-none" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No notifications yet</Text>
                <Text style={styles.emptySubtext}>
                  When you receive notifications, they'll appear here
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item: Notification) => item.id}
                contentContainerStyle={styles.notificationsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastIconContainer: {
    marginRight: 12,
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 12,
    color: '#6b7280',
  },
  toastCloseButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.8,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadButton: {
    marginRight: 16,
  },
  markAllReadText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  settingsButton: {
    padding: 4,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '80%',
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
    marginRight: 12,
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

export default NotificationCenter;