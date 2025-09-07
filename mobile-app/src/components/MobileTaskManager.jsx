/**
 * Mobile Task Manager Component
 * Cross-platform mobile interface for task management and robot control
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { Camera } from 'expo-camera'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PushNotification from 'react-native-push-notification'

const { width, height } = Dimensions.get('window')

// Task Status Colors
const statusColors = {
  pending: '#FFA500',
  in_progress: '#2196F3',
  completed: '#4CAF50',
  failed: '#F44336',
  cancelled: '#9E9E9E'
}

// Task Priority Colors
const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0'
}

const MobileTaskCard = ({ task, onTaskPress, onStatusUpdate }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'schedule'
      case 'in_progress': return 'play-circle-filled'
      case 'completed': return 'check-circle'
      case 'failed': return 'error'
      case 'cancelled': return 'cancel'
      default: return 'help'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'low': return 'keyboard-arrow-down'
      case 'medium': return 'remove'
      case 'high': return 'keyboard-arrow-up'
      case 'critical': return 'priority-high'
      default: return 'remove'
    }
  }

  return (
    <TouchableOpacity 
      style={styles.taskCard} 
      onPress={() => onTaskPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleRow}>
          <Text style={styles.taskTitle} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] }]}>
            <Icon name={getPriorityIcon(task.priority)} size={16} color="white" />
          </View>
        </View>
        <Text style={styles.taskDescription} numberOfLines={3}>
          {task.description}
        </Text>
      </View>

      <View style={styles.taskDetails}>
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.metaText}>
              {new Date(task.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.metaText}>{task.location || 'No location'}</Text>
          </View>
        </View>

        <View style={styles.taskActions}>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[task.status] }]}>
            <Icon name={getStatusIcon(task.status)} size={16} color="white" />
            <Text style={styles.statusText}>{task.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {task.assigned_robot && (
        <View style={styles.robotInfo}>
          <Icon name="smart-toy" size={16} color="#2196F3" />
          <Text style={styles.robotText}>Assigned to: {task.assigned_robot}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const QuickActionButton = ({ icon, label, onPress, color = '#2196F3' }) => (
  <TouchableOpacity 
    style={[styles.quickActionButton, { backgroundColor: color }]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Icon name={icon} size={24} color="white" />
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
)

const MobileTaskManager = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [location, setLocation] = useState(null)
  const [cameraPermission, setCameraPermission] = useState(null)

  // Initialize component
  useEffect(() => {
    initializeApp()
    setupPushNotifications()
    requestPermissions()
  }, [])

  const initializeApp = async () => {
    try {
      await loadTasks()
      await getCurrentLocation()
    } catch (error) {
      console.error('Error initializing app:', error)
      Alert.alert('Error', 'Failed to initialize the app')
    } finally {
      setLoading(false)
    }
  }

  const setupPushNotifications = () => {
    PushNotification.configure({
      onNotification: function(notification) {
        console.log('Notification received:', notification)
        if (notification.userInteraction) {
          // User tapped on notification
          handleNotificationTap(notification)
        }
      },
      requestPermissions: Platform.OS === 'ios',
    })
  }

  const requestPermissions = async () => {
    // Camera permission
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync()
    setCameraPermission(cameraStatus === 'granted')

    // Location permission
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync()
    if (locationStatus === 'granted') {
      getCurrentLocation()
    }
  }

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({})
      setLocation(location.coords)
    } catch (error) {
      console.error('Error getting location:', error)
    }
  }

  const loadTasks = async () => {
    try {
      // Load from local storage first for offline capability
      const cachedTasks = await AsyncStorage.getItem('cached_tasks')
      if (cachedTasks) {
        setTasks(JSON.parse(cachedTasks))
      }

      // Fetch latest from server
      const response = await fetch('/api/mobile/tasks', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
        
        // Cache for offline use
        await AsyncStorage.setItem('cached_tasks', JSON.stringify(data.tasks))
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      // Use cached data if available
    }
  }

  const getAuthToken = async () => {
    return await AsyncStorage.getItem('auth_token')
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadTasks()
    setRefreshing(false)
  }, [])

  const handleTaskPress = (task) => {
    // Navigate to task details screen
    Alert.alert(
      task.title,
      task.description,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Task', onPress: () => startTask(task) },
        { text: 'View Details', onPress: () => viewTaskDetails(task) }
      ]
    )
  }

  const startTask = async (task) => {
    try {
      const response = await fetch(`/api/mobile/tasks/${task.id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: location,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        await loadTasks()
        Alert.alert('Success', 'Task started successfully')
      } else {
        Alert.alert('Error', 'Failed to start task')
      }
    } catch (error) {
      console.error('Error starting task:', error)
      Alert.alert('Error', 'Failed to start task')
    }
  }

  const viewTaskDetails = (task) => {
    // Navigate to detailed task view
    console.log('Viewing task details:', task)
  }

  const handleEmergencyStop = async () => {
    Alert.alert(
      'Emergency Stop',
      'This will stop all active robots immediately. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'EMERGENCY STOP', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch('/api/mobile/emergency-stop', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${await getAuthToken()}`,
                  'Content-Type': 'application/json'
                }
              })

              if (response.ok) {
                Alert.alert('Emergency Stop Activated', 'All robots have been stopped')
              }
            } catch (error) {
              console.error('Error activating emergency stop:', error)
            }
          }
        }
      ]
    )
  }

  const handleScanQR = async () => {
    if (!cameraPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to scan QR codes')
      return
    }
    
    // Navigate to QR scanner screen
    console.log('Opening QR scanner')
  }

  const handleVoiceCommand = () => {
    // Implement voice command functionality
    Alert.alert('Voice Commands', 'Voice command feature coming soon!')
  }

  const handleNotificationTap = (notification) => {
    // Handle notification tap
    if (notification.data && notification.data.taskId) {
      const task = tasks.find(t => t.id === notification.data.taskId)
      if (task) {
        handleTaskPress(task)
      }
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const getFilterCount = (status) => {
    return tasks.filter(task => status === 'all' ? true : task.status === status).length
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Manager</Text>
        <TouchableOpacity onPress={handleEmergencyStop} style={styles.emergencyButton}>
          <Icon name="warning" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickActionButton
          icon="qr-code-scanner"
          label="Scan QR"
          onPress={handleScanQR}
          color="#4CAF50"
        />
        <QuickActionButton
          icon="mic"
          label="Voice"
          onPress={handleVoiceCommand}
          color="#FF9800"
        />
        <QuickActionButton
          icon="refresh"
          label="Refresh"
          onPress={onRefresh}
          color="#2196F3"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'in_progress', 'completed'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filter === status && styles.activeFilterTab
            ]}
            onPress={() => setFilter(status)}
          >
            <Text style={[
              styles.filterText,
              filter === status && styles.activeFilterText
            ]}>
              {status.replace('_', ' ').toUpperCase()} ({getFilterCount(status)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Task List */}
      <ScrollView
        style={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <MobileTaskCard
              key={task.id}
              task={task}
              onTaskPress={handleTaskPress}
              onStatusUpdate={loadTasks}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="assignment" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No tasks found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' ? 'No tasks available' : `No ${filter.replace('_', ' ')} tasks`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Location Status */}
      {location && (
        <View style={styles.locationStatus}>
          <Icon name="location-on" size={16} color="#4CAF50" />
          <Text style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 18,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white'
  },
  emergencyButton: {
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 20,
    elevation: 2
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: 'white',
    marginBottom: 8
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80
  },
  quickActionLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
    marginBottom: 8
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  activeFilterTab: {
    backgroundColor: '#2196F3'
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666'
  },
  activeFilterText: {
    color: 'white'
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 16
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  taskHeader: {
    marginBottom: 12
  },
  taskTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  taskMeta: {
    flex: 1
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  taskActions: {
    alignItems: 'flex-end'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4
  },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  robotText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  locationText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4
  }
})

export default MobileTaskManager
