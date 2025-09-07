import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Brain,
  Activity,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart2,
  Calendar,
  BrainCircuit,
  Cpu,
  HardDrive,
  Workflow,
  Settings,
  ListTodo,
  Plus,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

import { agentService, Agent, Task, AgentStatus, AgentType } from '../services/api/agentService';
import { useAuth } from '../services/context/AuthContext';

export default function AgentManagementScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Load data from the agent service
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from the agent service
      const [agentsData, tasksData] = await Promise.all([
        agentService.getAgents(),
        agentService.getTasks()
      ]);

      // Update state with the data
      setAgents(agentsData);
      setTasks(tasksData);
    } catch (err) {
      console.error("Error loading agent management data:", err);
      setError("Failed to load agent management data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  }, []);

  const handleAgentPress = async (agent: Agent) => {
    try {
      setSelectedAgent(agent);
      setActiveTab('agent-details');
      
      // In a production app, we would fetch additional agent details here
      // const agentDetails = await agentService.getAgentById(agent.agent_id);
      // const agentTasks = await agentService.getAgentTasks(agent.agent_id);
    } catch (error) {
      console.error("Error fetching agent details:", error);
      Alert.alert(
        "Error",
        "Failed to load agent details. Please try again."
      );
    }
  };

  const handleTaskPress = (task: Task) => {
    Alert.alert(
      `Task: ${task.title}`,
      `ID: ${task.task_id}\nStatus: ${task.status}\nPriority: ${task.priority}\nDomain: ${task.domain}\n\n${task.description}`,
      [
        { text: "Close", style: "cancel" },
        { 
          text: "Assign to Agent", 
          onPress: () => handleAssignTask(task)
        }
      ]
    );
  };

  const handleAssignTask = (task: Task) => {
    // Only show assignment options for tasks that aren't assigned or completed
    if (task.status === 'completed' || task.status === 'failed') {
      Alert.alert("Cannot Reassign", "This task has already been completed or failed.");
      return;
    }

    // Get available agents
    const availableAgents = agents.filter(agent => 
      agent.status === AgentStatus.ACTIVE && 
      agent.current_workload < agent.max_workload
    );

    if (availableAgents.length === 0) {
      Alert.alert("No Agents Available", "There are no active agents available to take on new tasks.");
      return;
    }

    // Show agent options
    const options = availableAgents.map(agent => ({
      text: `${agent.name} (${agent.type})`,
      onPress: () => confirmAssignment(task, agent)
    }));

    Alert.alert(
      "Select Agent",
      "Choose an agent to assign this task:",
      [
        ...options.map(option => ({
          text: option.text,
          onPress: option.onPress
        })),
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const confirmAssignment = (task: Task, agent: Agent) => {
    Alert.alert(
      "Confirm Assignment",
      `Assign task "${task.title}" to ${agent.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Assign", 
          onPress: async () => {
            try {
              await agentService.assignTask(task.task_id, agent.agent_id);
              Alert.alert("Success", "Task assigned successfully");
              loadData(); // Refresh data
            } catch (error) {
              console.error("Error assigning task:", error);
              Alert.alert("Error", "Failed to assign task. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleCreateTask = () => {
    // In a real app, you would navigate to a task creation form
    Alert.alert(
      "Create New Task",
      "This would open a form to create a new task with fields for title, description, priority, etc.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK" }
      ]
    );
  };

  const handleUpdateAgentStatus = (agent: Agent, newStatus: AgentStatus) => {
    Alert.alert(
      "Update Agent Status",
      `Change ${agent.name} status to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async () => {
            try {
              await agentService.updateAgentStatus(agent.agent_id, newStatus);
              Alert.alert("Success", "Agent status updated successfully");
              loadData(); // Refresh data
              if (selectedAgent && selectedAgent.agent_id === agent.agent_id) {
                setSelectedAgent(prev => prev ? { ...prev, status: newStatus } : null);
              }
            } catch (error) {
              console.error("Error updating agent status:", error);
              Alert.alert("Error", "Failed to update agent status. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Render the agents list
  const renderAgentsList = () => {
    const getAgentStatusColor = (status: AgentStatus) => {
      switch (status) {
        case AgentStatus.ACTIVE: return '#10b981';
        case AgentStatus.BUSY: return '#f59e0b';
        case AgentStatus.MAINTENANCE: return '#6b7280';
        case AgentStatus.ERROR: return '#ef4444';
        default: return '#6b7280';
      }
    };

    const getAgentTypeIcon = (type: AgentType) => {
      switch (type) {
        case AgentType.AI_TRIAGE:
        case AgentType.NURSE_PRACTITIONER:
        case AgentType.GENERAL_PHYSICIAN:
        case AgentType.SPECIALIST:
        case AgentType.RADIOLOGIST:
        case AgentType.LAB_TECHNICIAN:
        case AgentType.EMERGENCY_PHYSICIAN:
          return <User size={16} color="#3b82f6" />;
        case AgentType.ROBOT_ASSISTANT:
          return <Brain size={16} color="#8b5cf6" />;
        case AgentType.IOT_MANAGER:
          return <Cpu size={16} color="#f59e0b" />;
        case AgentType.WORKFLOW_ORCHESTRATOR:
          return <Workflow size={16} color="#10b981" />;
        case AgentType.MANUFACTURING_SUPERVISOR:
          return <HardDrive size={16} color="#ef4444" />;
        default:
          return <BrainCircuit size={16} color="#6b7280" />;
      }
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Agents ({agents.length})</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>New Task</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={agents}
          keyExtractor={(item: Agent) => item.agent_id}
          renderItem={({ item }: { item: Agent }) => (
            <TouchableOpacity 
              style={styles.agentCard}
              onPress={() => handleAgentPress(item)}
            >
              <View style={styles.agentHeader}>
                <View style={styles.agentInfo}>
                  <View style={styles.agentTypeIconContainer}>
                    {getAgentTypeIcon(item.type)}
                  </View>
                  <View>
                    <Text style={styles.agentName}>{item.name}</Text>
                    <Text style={styles.agentType}>{item.type}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getAgentStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.agentDetails}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Workload</Text>
                  <View style={styles.workloadBar}>
                    <View 
                      style={[
                        styles.workloadFill, 
                        { 
                          width: `${(item.current_workload / item.max_workload) * 100}%`,
                          backgroundColor: item.current_workload > (item.max_workload * 0.8) ? '#ef4444' : '#3b82f6'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.metricValue}>{item.current_workload}/{item.max_workload}</Text>
                </View>
                
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Accuracy</Text>
                    <Text style={styles.metricValue}>{(item.performance_metrics.accuracy_rate * 100).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Efficiency</Text>
                    <Text style={styles.metricValue}>{(item.performance_metrics.efficiency_score * 100).toFixed(1)}%</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.agentFooter}>
                <Text style={styles.lastActiveText}>
                  Last active: {new Date(item.last_active).toLocaleTimeString()}
                </Text>
                <ArrowRight size={16} color="#6b7280" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BrainCircuit size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No agents available</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  // Render the tasks list
  const renderTasksList = () => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'critical': return '#ef4444';
        case 'high': return '#f59e0b';
        case 'medium': return '#3b82f6';
        case 'low': return '#10b981';
        default: return '#6b7280';
      }
    };
    
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'completed':
          return <CheckCircle size={16} color="#10b981" />;
        case 'failed':
          return <XCircle size={16} color="#ef4444" />;
        case 'in_progress':
          return <Clock size={16} color="#3b82f6" />;
        case 'assigned':
          return <User size={16} color="#8b5cf6" />;
        case 'pending':
        default:
          return <AlertTriangle size={16} color="#f59e0b" />;
      }
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tasks ({tasks.length})</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
            <Plus size={16} color="#ffffff" />
            <Text style={styles.addButtonText}>New Task</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={tasks}
          keyExtractor={(item: Task) => item.task_id}
          renderItem={({ item }: { item: Task }) => (
            <TouchableOpacity 
              style={styles.taskCard}
              onPress={() => handleTaskPress(item)}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDomain}>{item.domain}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
              </View>
              
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
              
              <View style={styles.taskFooter}>
                <View style={styles.taskStatusContainer}>
                  {getStatusIcon(item.status)}
                  <Text style={styles.taskStatus}>{item.status}</Text>
                </View>
                
                <View style={styles.taskMetadata}>
                  <View style={styles.metadataItem}>
                    <Calendar size={12} color="#6b7280" />
                    <Text style={styles.metadataText}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  {item.assigned_agent_id && (
                    <View style={styles.metadataItem}>
                      <User size={12} color="#6b7280" />
                      <Text style={styles.metadataText}>
                        {agents.find(a => a.agent_id === item.assigned_agent_id)?.name || 'Unknown Agent'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ListTodo size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No tasks available</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  // Render agent details
  const renderAgentDetails = () => {
    if (!selectedAgent) return null;

    const agentTasks = tasks.filter(task => task.assigned_agent_id === selectedAgent.agent_id);
    
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsHeader}>
          <View style={styles.detailsHeaderContent}>
            <View style={styles.agentAvatarContainer}>
              <BrainCircuit size={32} color="#ffffff" />
            </View>
            <View style={styles.agentHeaderInfo}>
              <Text style={styles.detailsName}>{selectedAgent.name}</Text>
              <Text style={styles.detailsType}>{selectedAgent.type}</Text>
            </View>
          </View>
          <View style={styles.detailsActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
              onPress={() => handleUpdateAgentStatus(selectedAgent, 
                selectedAgent.status === AgentStatus.ACTIVE ? AgentStatus.MAINTENANCE : AgentStatus.ACTIVE
              )}
            >
              <Settings size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={[
                styles.statusIndicator, 
                { 
                  backgroundColor: 
                    selectedAgent.status === AgentStatus.ACTIVE ? '#10b981' :
                    selectedAgent.status === AgentStatus.BUSY ? '#f59e0b' :
                    selectedAgent.status === AgentStatus.ERROR ? '#ef4444' :
                    '#6b7280'
                }
              ]} />
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusValue}>{selectedAgent.status}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Activity size={20} color="#3b82f6" />
              <Text style={styles.statusLabel}>Version</Text>
              <Text style={styles.statusValue}>{selectedAgent.version}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Clock size={20} color="#8b5cf6" />
              <Text style={styles.statusLabel}>Created</Text>
              <Text style={styles.statusValue}>
                {new Date(selectedAgent.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.performanceCard}>
          <Text style={styles.cardTitle}>Performance Metrics</Text>
          
          <View style={styles.metricGrid}>
            <View style={styles.metricGridItem}>
              <Text style={styles.metricGridLabel}>Accuracy</Text>
              <Text style={styles.metricGridValue}>
                {(selectedAgent.performance_metrics.accuracy_rate * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.metricGridItem}>
              <Text style={styles.metricGridLabel}>Efficiency</Text>
              <Text style={styles.metricGridValue}>
                {(selectedAgent.performance_metrics.efficiency_score * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.metricGridItem}>
              <Text style={styles.metricGridLabel}>Avg Time</Text>
              <Text style={styles.metricGridValue}>
                {selectedAgent.performance_metrics.avg_completion_time.toFixed(1)}s
              </Text>
            </View>
            
            {Object.entries(selectedAgent.performance_metrics)
              .filter(([key]) => !['accuracy_rate', 'efficiency_score', 'avg_completion_time'].includes(key))
              .map(([key, value]) => (
                <View key={key} style={styles.metricGridItem}>
                  <Text style={styles.metricGridLabel}>
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                  <Text style={styles.metricGridValue}>
                    {typeof value === 'number' && value <= 1 ? (value * 100).toFixed(1) + '%' : value}
                  </Text>
                </View>
              ))
            }
          </View>
        </View>

        <View style={styles.capabilitiesCard}>
          <Text style={styles.cardTitle}>Capabilities</Text>
          
          <View style={styles.capabilitiesList}>
            {selectedAgent.capabilities.map((capability, index) => (
              <View key={index} style={styles.capabilityItem}>
                <CheckCircle size={16} color="#10b981" />
                <Text style={styles.capabilityText}>
                  {capability.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
              </View>
            ))}
          </View>
          
          {selectedAgent.specialties && selectedAgent.specialties.length > 0 && (
            <>
              <Text style={[styles.cardTitle, { marginTop: 16 }]}>Specialties</Text>
              <View style={styles.capabilitiesList}>
                {selectedAgent.specialties.map((specialty, index) => (
                  <View key={index} style={styles.capabilityItem}>
                    <CheckCircle size={16} color="#8b5cf6" />
                    <Text style={styles.capabilityText}>
                      {specialty.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
        
        <View style={styles.tasksCard}>
          <Text style={styles.cardTitle}>Assigned Tasks ({agentTasks.length})</Text>
          
          {agentTasks.length > 0 ? (
            <View style={styles.agentTasksList}>
              {agentTasks.map((task) => (
                <TouchableOpacity 
                  key={task.task_id} 
                  style={styles.agentTaskItem}
                  onPress={() => handleTaskPress(task)}
                >
                  <View style={styles.agentTaskHeader}>
                    <Text style={styles.agentTaskTitle}>{task.title}</Text>
                    <View style={[
                      styles.agentTaskPriorityBadge,
                      { 
                        backgroundColor: 
                          task.priority === 'critical' ? '#ef4444' :
                          task.priority === 'high' ? '#f59e0b' :
                          task.priority === 'medium' ? '#3b82f6' :
                          '#10b981'
                      }
                    ]}>
                      <Text style={styles.agentTaskPriorityText}>{task.priority}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.agentTaskStatus}>
                    <View style={[
                      styles.agentTaskStatusIndicator,
                      {
                        backgroundColor:
                          task.status === 'completed' ? '#10b981' :
                          task.status === 'in_progress' ? '#3b82f6' :
                          task.status === 'failed' ? '#ef4444' :
                          '#f59e0b'
                      }
                    ]} />
                    <Text style={styles.agentTaskStatusText}>{task.status}</Text>
                    
                    {task.deadline && (
                      <View style={styles.agentTaskDeadline}>
                        <Clock size={12} color="#6b7280" />
                        <Text style={styles.agentTaskDeadlineText}>
                          {new Date(task.deadline).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <ListTodo size={32} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No tasks assigned to this agent</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  // Show loading state
  if (loading && !refreshing && agents.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Agent Management',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading Agent Management data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing && agents.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Agent Management',
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Agent Management',
          headerShown: true,
        }}
      />
      
      <LinearGradient
        colors={['#8b5cf6', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>AI Agent Management</Text>
            <Text style={styles.headerSubtitle}>Orchestrate intelligent agents and workflows</Text>
          </View>
        </View>
      </LinearGradient>

      {activeTab === 'agent-details' ? (
        <View style={styles.detailsContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setSelectedAgent(null);
              setActiveTab('agents');
            }}
          >
            <Text style={styles.backButtonText}>Back to List</Text>
          </TouchableOpacity>
          
          {renderAgentDetails()}
        </View>
      ) : (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'agents' && styles.activeTab]}
              onPress={() => setActiveTab('agents')}
            >
              <BrainCircuit size={18} color={activeTab === 'agents' ? '#8b5cf6' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'agents' && styles.activeTabText]}>
                Agents
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
              onPress={() => setActiveTab('tasks')}
            >
              <ListTodo size={18} color={activeTab === 'tasks' ? '#8b5cf6' : '#6b7280'} />
              <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
                Tasks
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'agents' && renderAgentsList()}
            {activeTab === 'tasks' && renderTasksList()}
          </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8b5cf6',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  agentCard: {
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
    elevation: 3,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  agentType: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  agentDetails: {
    gap: 12,
  },
  metricItem: {
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  workloadBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  workloadFill: {
    height: '100%',
    borderRadius: 3,
  },
  metricValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  agentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  lastActiveText: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskCard: {
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
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  taskDomain: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskStatus: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  taskMetadata: {
    flexDirection: 'row',
    gap: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#8b5cf6',
    borderTopColor: 'transparent',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agentHeaderInfo: {
    gap: 4,
  },
  detailsName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailsType: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
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
    elevation: 3,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  performanceCard: {
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
    elevation: 3,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  metricGridItem: {
    width: '45%',
  },
  metricGridLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricGridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  capabilitiesCard: {
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
    elevation: 3,
    marginBottom: 16,
  },
  capabilitiesList: {
    gap: 8,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capabilityText: {
    fontSize: 14,
    color: '#4b5563',
  },
  tasksCard: {
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
    elevation: 3,
    marginBottom: 16,
  },
  agentTasksList: {
    gap: 12,
  },
  agentTaskItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
  },
  agentTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  agentTaskPriorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  agentTaskPriorityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  agentTaskStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentTaskStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  agentTaskStatusText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  agentTaskDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  agentTaskDeadlineText: {
    fontSize: 10,
    color: '#6b7280',
  },
});