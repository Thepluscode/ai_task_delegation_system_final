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
  Workflow as WorkflowIcon,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart2,
  FileText,
  Play,
  Pause,
  Tag,
  Layers,
  Users,
  Plus,
  ChevronRight,
  ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';

import { 
  workflowService, 
  Workflow, 
  WorkflowStep,
  WorkflowStatus,
  WorkflowDomain,
  WorkflowTriggerType,
  WorkflowStats
} from '../services/api/workflowService';
import { useAuth } from '../services/context/AuthContext';

export default function WorkflowOrchestrationScreen() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<WorkflowDomain | null>(null);

  // Load data from the workflow service
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data from the workflow service
      const [workflowsData, statsData] = await Promise.all([
        workflowService.getWorkflows(selectedDomain || undefined),
        workflowService.getWorkflowStatistics(selectedDomain || undefined)
      ]);

      // Update state with the data
      setWorkflows(workflowsData);
      setWorkflowStats(statsData);
    } catch (err) {
      console.error("Error loading workflow data:", err);
      setError("Failed to load workflow orchestration data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, selectedDomain]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData()
      .then(() => {
        setRefreshing(false);
      })
      .catch(() => {
        setRefreshing(false);
      });
  }, [selectedDomain]);

  const handleWorkflowPress = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setActiveTab('workflow-details');
  };

  const handleCreateWorkflow = () => {
    // In a real app, you would navigate to a workflow creation form
    Alert.alert(
      "Create New Workflow",
      "This would open a form to create a new workflow with steps, agents, etc.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK" }
      ]
    );
  };

  const handleUpdateWorkflowStatus = (workflow: Workflow, newStatus: WorkflowStatus) => {
    Alert.alert(
      "Update Workflow Status",
      `Change ${workflow.name} status to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async () => {
            try {
              await workflowService.updateWorkflowStatus(workflow.workflow_id, newStatus);
              Alert.alert("Success", "Workflow status updated successfully");
              loadData(); // Refresh data
              if (selectedWorkflow && selectedWorkflow.workflow_id === workflow.workflow_id) {
                setSelectedWorkflow(prev => prev ? { ...prev, status: newStatus } : null);
              }
            } catch (error) {
              console.error("Error updating workflow status:", error);
              Alert.alert("Error", "Failed to update workflow status. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleUpdateStepStatus = (
    workflow: Workflow, 
    step: WorkflowStep, 
    newStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  ) => {
    Alert.alert(
      "Update Step Status",
      `Change status of "${step.name}" to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: async () => {
            try {
              await workflowService.updateStepStatus(workflow.workflow_id, step.step_id, newStatus);
              Alert.alert("Success", "Step status updated successfully");
              
              // If this is the selected workflow, update it in state
              if (selectedWorkflow && selectedWorkflow.workflow_id === workflow.workflow_id) {
                const updatedSteps = selectedWorkflow.steps.map(s => 
                  s.step_id === step.step_id ? { ...s, status: newStatus } : s
                );
                setSelectedWorkflow({ ...selectedWorkflow, steps: updatedSteps });
              }
              
              // Refresh all data
              loadData();
            } catch (error) {
              console.error("Error updating step status:", error);
              Alert.alert("Error", "Failed to update step status. Please try again.");
            }
          }
        }
      ]
    );
  };

  const filterWorkflowsByDomain = (domain: WorkflowDomain | null) => {
    setSelectedDomain(domain);
  };

  // Render the workflows list
  const renderWorkflowsList = () => {
    const getStatusColor = (status: WorkflowStatus) => {
      switch (status) {
        case WorkflowStatus.ACTIVE: return '#10b981';
        case WorkflowStatus.PAUSED: return '#f59e0b';
        case WorkflowStatus.COMPLETED: return '#3b82f6';
        case WorkflowStatus.FAILED: return '#ef4444';
        case WorkflowStatus.INACTIVE: 
        default: return '#6b7280';
      }
    };
    
    const getDomainIcon = (domain: WorkflowDomain) => {
      switch (domain) {
        case WorkflowDomain.HEALTHCARE:
          return <Users size={16} color="#3b82f6" />;
        case WorkflowDomain.MANUFACTURING:
          return <Layers size={16} color="#f59e0b" />;
        case WorkflowDomain.IOT:
          return <WorkflowIcon size={16} color="#8b5cf6" />;
        case WorkflowDomain.GENERAL:
        default:
          return <FileText size={16} color="#6b7280" />;
      }
    };
    
    const getDomainColor = (domain: WorkflowDomain) => {
      switch (domain) {
        case WorkflowDomain.HEALTHCARE: return '#3b82f6';
        case WorkflowDomain.MANUFACTURING: return '#f59e0b';
        case WorkflowDomain.IOT: return '#8b5cf6';
        case WorkflowDomain.GENERAL:
        default: return '#6b7280';
      }
    };

    return (
      <>
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterButtons}
          >
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedDomain === null && styles.filterButtonActive
              ]}
              onPress={() => filterWorkflowsByDomain(null)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedDomain === null && styles.filterButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedDomain === WorkflowDomain.HEALTHCARE && styles.filterButtonActive
              ]}
              onPress={() => filterWorkflowsByDomain(WorkflowDomain.HEALTHCARE)}
            >
              <Users size={14} color={selectedDomain === WorkflowDomain.HEALTHCARE ? '#ffffff' : '#3b82f6'} />
              <Text style={[
                styles.filterButtonText,
                selectedDomain === WorkflowDomain.HEALTHCARE && styles.filterButtonTextActive
              ]}>
                Healthcare
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedDomain === WorkflowDomain.MANUFACTURING && styles.filterButtonActive
              ]}
              onPress={() => filterWorkflowsByDomain(WorkflowDomain.MANUFACTURING)}
            >
              <Layers size={14} color={selectedDomain === WorkflowDomain.MANUFACTURING ? '#ffffff' : '#f59e0b'} />
              <Text style={[
                styles.filterButtonText,
                selectedDomain === WorkflowDomain.MANUFACTURING && styles.filterButtonTextActive
              ]}>
                Manufacturing
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedDomain === WorkflowDomain.IOT && styles.filterButtonActive
              ]}
              onPress={() => filterWorkflowsByDomain(WorkflowDomain.IOT)}
            >
              <WorkflowIcon size={14} color={selectedDomain === WorkflowDomain.IOT ? '#ffffff' : '#8b5cf6'} />
              <Text style={[
                styles.filterButtonText,
                selectedDomain === WorkflowDomain.IOT && styles.filterButtonTextActive
              ]}>
                IoT
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                selectedDomain === WorkflowDomain.GENERAL && styles.filterButtonActive
              ]}
              onPress={() => filterWorkflowsByDomain(WorkflowDomain.GENERAL)}
            >
              <FileText size={14} color={selectedDomain === WorkflowDomain.GENERAL ? '#ffffff' : '#6b7280'} />
              <Text style={[
                styles.filterButtonText,
                selectedDomain === WorkflowDomain.GENERAL && styles.filterButtonTextActive
              ]}>
                General
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {workflowStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Workflow Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <WorkflowIcon size={20} color="#6b7280" />
                </View>
                <Text style={styles.statValue}>{workflowStats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#10b98120' }]}>
                  <Play size={20} color="#10b981" />
                </View>
                <Text style={[styles.statValue, { color: '#10b981' }]}>{workflowStats.active}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#3b82f620' }]}>
                  <CheckCircle size={20} color="#3b82f6" />
                </View>
                <Text style={[styles.statValue, { color: '#3b82f6' }]}>{workflowStats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: '#ef444420' }]}>
                  <XCircle size={20} color="#ef4444" />
                </View>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>{workflowStats.failed}</Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Success Rate</Text>
                <Text style={styles.statItemValue}>{(workflowStats.successRate * 100).toFixed(1)}%</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statItemLabel}>Avg. Completion</Text>
                <Text style={styles.statItemValue}>
                  {Math.floor(workflowStats.avgCompletionTime / 3600)}h {Math.floor((workflowStats.avgCompletionTime % 3600) / 60)}m
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workflows ({workflows.length})</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleCreateWorkflow}>
              <Plus size={16} color="#ffffff" />
              <Text style={styles.addButtonText}>New Workflow</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={workflows}
            keyExtractor={(item: Workflow) => item.workflow_id}
            renderItem={({ item }: { item: Workflow }) => (
              <TouchableOpacity 
                style={styles.workflowCard}
                onPress={() => handleWorkflowPress(item)}
              >
                <View style={styles.workflowHeader}>
                  <View style={styles.workflowInfo}>
                    <View style={[
                      styles.domainBadge, 
                      { backgroundColor: getDomainColor(item.domain) + '20' }
                    ]}>
                      {getDomainIcon(item.domain)}
                      <Text style={[styles.domainText, { color: getDomainColor(item.domain) }]}>
                        {item.domain}
                      </Text>
                    </View>
                    <Text style={styles.workflowName}>{item.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.workflowDescription} numberOfLines={2}>
                  {item.description}
                </Text>
                
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Progress</Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(item.steps.filter(s => s.status === 'completed').length / item.steps.length) * 100}%`,
                          backgroundColor: getStatusColor(item.status)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round((item.steps.filter(s => s.status === 'completed').length / item.steps.length) * 100)}%
                  </Text>
                </View>
                
                <View style={styles.workflowFooter}>
                  <View style={styles.workflowMetadata}>
                    <View style={styles.metadataItem}>
                      <Calendar size={12} color="#6b7280" />
                      <Text style={styles.metadataText}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.metadataItem}>
                      <Clock size={12} color="#6b7280" />
                      <Text style={styles.metadataText}>
                        {item.estimated_duration ? 
                          `${Math.floor(item.estimated_duration / 3600)}h ${Math.floor((item.estimated_duration % 3600) / 60)}m` : 
                          'N/A'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.workflowAction}>
                    <ChevronRight size={16} color="#6b7280" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <WorkflowIcon size={48} color="#d1d5db" />
                <Text style={styles.emptyStateText}>No workflows available</Text>
                {selectedDomain && (
                  <TouchableOpacity onPress={() => setSelectedDomain(null)}>
                    <Text style={styles.clearFilterText}>Clear filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </>
    );
  };

  // Render workflow details
  const renderWorkflowDetails = () => {
    if (!selectedWorkflow) return null;
    
    const completedSteps = selectedWorkflow.steps.filter(s => s.status === 'completed').length;
    const totalSteps = selectedWorkflow.steps.length;
    const progress = (completedSteps / totalSteps) * 100;
    
    const getStepStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return '#10b981';
        case 'in_progress': return '#3b82f6';
        case 'failed': return '#ef4444';
        case 'skipped': return '#f59e0b';
        case 'pending':
        default: return '#6b7280';
      }
    };
    
    const getStepStatusIcon = (status: string) => {
      switch (status) {
        case 'completed':
          return <CheckCircle size={16} color="#10b981" />;
        case 'in_progress':
          return <Clock size={16} color="#3b82f6" />;
        case 'failed':
          return <XCircle size={16} color="#ef4444" />;
        case 'skipped':
          return <ArrowRight size={16} color="#f59e0b" />;
        case 'pending':
        default:
          return <AlertTriangle size={16} color="#6b7280" />;
      }
    };
    
    return (
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsHeader}>
          <View style={styles.detailsHeaderContent}>
            <View style={[
              styles.workflowAvatarContainer,
              { 
                backgroundColor: selectedWorkflow.domain === WorkflowDomain.HEALTHCARE ? '#3b82f6' :
                                selectedWorkflow.domain === WorkflowDomain.MANUFACTURING ? '#f59e0b' :
                                selectedWorkflow.domain === WorkflowDomain.IOT ? '#8b5cf6' : '#6b7280'
              }
            ]}>
              <WorkflowIcon size={32} color="#ffffff" />
            </View>
            <View style={styles.workflowHeaderInfo}>
              <Text style={styles.detailsName}>{selectedWorkflow.name}</Text>
              <Text style={styles.detailsDomain}>{selectedWorkflow.domain}</Text>
            </View>
          </View>
          <View style={styles.detailsActions}>
            {selectedWorkflow.status === WorkflowStatus.ACTIVE ? (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => handleUpdateWorkflowStatus(selectedWorkflow, WorkflowStatus.PAUSED)}
              >
                <Pause size={16} color="#ffffff" />
              </TouchableOpacity>
            ) : selectedWorkflow.status === WorkflowStatus.PAUSED ? (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => handleUpdateWorkflowStatus(selectedWorkflow, WorkflowStatus.ACTIVE)}
              >
                <Play size={16} color="#ffffff" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Text style={styles.workflowDetailDescription}>
          {selectedWorkflow.description}
        </Text>
        
        <View style={styles.workflowDetailStatus}>
          <View style={styles.statusDetailRow}>
            <View style={styles.statusDetailItem}>
              <Text style={styles.statusDetailLabel}>Status</Text>
              <View style={styles.statusDetailValue}>
                <View style={[
                  styles.statusDetailIndicator, 
                  { 
                    backgroundColor: 
                      selectedWorkflow.status === WorkflowStatus.ACTIVE ? '#10b981' :
                      selectedWorkflow.status === WorkflowStatus.PAUSED ? '#f59e0b' :
                      selectedWorkflow.status === WorkflowStatus.COMPLETED ? '#3b82f6' :
                      selectedWorkflow.status === WorkflowStatus.FAILED ? '#ef4444' :
                      '#6b7280'
                  }
                ]} />
                <Text style={styles.statusDetailText}>{selectedWorkflow.status}</Text>
              </View>
            </View>
            
            <View style={styles.statusDetailItem}>
              <Text style={styles.statusDetailLabel}>Priority</Text>
              <Text style={[
                styles.statusDetailText,
                { 
                  color: 
                    selectedWorkflow.priority === 'critical' ? '#ef4444' :
                    selectedWorkflow.priority === 'high' ? '#f59e0b' :
                    selectedWorkflow.priority === 'medium' ? '#3b82f6' :
                    '#10b981'
                }
              ]}>
                {selectedWorkflow.priority.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.statusDetailItem}>
              <Text style={styles.statusDetailLabel}>Trigger</Text>
              <Text style={styles.statusDetailText}>
                {selectedWorkflow.trigger_type.replace('_', ' ')}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressDetailContainer}>
            <View style={styles.progressDetailHeader}>
              <Text style={styles.progressDetailLabel}>Overall Progress</Text>
              <Text style={styles.progressDetailPercentage}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressDetailBar}>
              <View 
                style={[
                  styles.progressDetailFill,
                  { 
                    width: `${progress}%`,
                    backgroundColor: 
                      selectedWorkflow.status === WorkflowStatus.ACTIVE ? '#10b981' :
                      selectedWorkflow.status === WorkflowStatus.PAUSED ? '#f59e0b' :
                      selectedWorkflow.status === WorkflowStatus.COMPLETED ? '#3b82f6' :
                      selectedWorkflow.status === WorkflowStatus.FAILED ? '#ef4444' :
                      '#6b7280'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressDetailText}>
              {completedSteps} of {totalSteps} steps completed
            </Text>
          </View>
          
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Calendar size={16} color="#6b7280" />
              <View>
                <Text style={styles.dateLabel}>Created</Text>
                <Text style={styles.dateValue}>{new Date(selectedWorkflow.created_at).toLocaleDateString()}</Text>
              </View>
            </View>
            
            {selectedWorkflow.started_at && (
              <View style={styles.dateItem}>
                <Play size={16} color="#10b981" />
                <View>
                  <Text style={styles.dateLabel}>Started</Text>
                  <Text style={styles.dateValue}>{new Date(selectedWorkflow.started_at).toLocaleDateString()}</Text>
                </View>
              </View>
            )}
            
            {selectedWorkflow.completed_at && (
              <View style={styles.dateItem}>
                <CheckCircle size={16} color="#3b82f6" />
                <View>
                  <Text style={styles.dateLabel}>Completed</Text>
                  <Text style={styles.dateValue}>{new Date(selectedWorkflow.completed_at).toLocaleDateString()}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>Tags</Text>
          <View style={styles.tagsList}>
            {selectedWorkflow.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Tag size={12} color="#6b7280" />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Workflow Steps</Text>
          
          {selectedWorkflow.steps.map((step, index) => (
            <View key={step.step_id} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepOrder}>
                  <Text style={styles.stepOrderText}>{step.order}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepName}>{step.name}</Text>
                  <Text style={styles.stepDescription} numberOfLines={2}>{step.description}</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.stepStatusBadge,
                    { backgroundColor: getStepStatusColor(step.status) + '20' }
                  ]}
                  onPress={() => {
                    // Only allow changing status for certain conditions
                    if (selectedWorkflow.status === WorkflowStatus.ACTIVE) {
                      // Show status change options
                      Alert.alert(
                        "Update Step Status",
                        "Select new status:",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Pending", onPress: () => handleUpdateStepStatus(selectedWorkflow, step, 'pending') },
                          { text: "In Progress", onPress: () => handleUpdateStepStatus(selectedWorkflow, step, 'in_progress') },
                          { text: "Completed", onPress: () => handleUpdateStepStatus(selectedWorkflow, step, 'completed') },
                          { text: "Failed", onPress: () => handleUpdateStepStatus(selectedWorkflow, step, 'failed') },
                          { text: "Skipped", onPress: () => handleUpdateStepStatus(selectedWorkflow, step, 'skipped') }
                        ]
                      );
                    }
                  }}
                >
                  {getStepStatusIcon(step.status)}
                  <Text style={[styles.stepStatusText, { color: getStepStatusColor(step.status) }]}>
                    {step.status}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.stepDetails}>
                {step.agent_id && (
                  <View style={styles.stepDetail}>
                    <Users size={14} color="#6b7280" />
                    <Text style={styles.stepDetailText}>Agent: {step.agent_id}</Text>
                  </View>
                )}
                
                {step.estimated_duration && (
                  <View style={styles.stepDetail}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.stepDetailText}>
                      Est. Duration: {Math.floor(step.estimated_duration / 60)} min
                    </Text>
                  </View>
                )}
                
                {step.is_critical && (
                  <View style={styles.stepDetail}>
                    <AlertTriangle size={14} color="#ef4444" />
                    <Text style={[styles.stepDetailText, { color: '#ef4444' }]}>Critical Step</Text>
                  </View>
                )}
              </View>
              
              {step.actual_duration && (
                <View style={styles.stepTiming}>
                  <Text style={styles.stepTimingLabel}>Actual Time:</Text>
                  <Text style={styles.stepTimingValue}>
                    {Math.floor(step.actual_duration / 60)} min
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Show loading state
  if (loading && !refreshing && workflows.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Workflow Orchestration',
            headerShown: true,
          }}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading Workflow Orchestration data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && !refreshing && workflows.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Workflow Orchestration',
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
          title: 'Workflow Orchestration',
          headerShown: true,
        }}
      />
      
      <LinearGradient
        colors={['#8b5cf6', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Workflow Orchestration</Text>
            <Text style={styles.headerSubtitle}>Manage and monitor your automated workflows</Text>
          </View>
        </View>
      </LinearGradient>

      {activeTab === 'workflow-details' ? (
        <View style={styles.detailsContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setSelectedWorkflow(null);
              setActiveTab('workflows');
            }}
          >
            <Text style={styles.backButtonText}>Back to Workflows</Text>
          </TouchableOpacity>
          
          {renderWorkflowDetails()}
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderWorkflowsList()}
        </ScrollView>
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
  filterContainer: {
    marginBottom: 16,
  },
  filterButtons: {
    paddingVertical: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  workflowCard: {
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
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workflowInfo: {
    gap: 4,
  },
  domainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  domainText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workflowName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
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
    textTransform: 'capitalize',
  },
  workflowDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'right',
  },
  workflowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  workflowMetadata: {
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
  workflowAction: {},
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  clearFilterText: {
    fontSize: 14,
    color: '#8b5cf6',
    marginTop: 8,
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
  workflowAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workflowHeaderInfo: {
    gap: 4,
  },
  detailsName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  detailsDomain: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'capitalize',
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
  workflowDetailDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  workflowDetailStatus: {
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
  statusDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusDetailItem: {
    alignItems: 'center',
  },
  statusDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusDetailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDetailIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  progressDetailContainer: {
    marginBottom: 16,
  },
  progressDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressDetailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressDetailPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressDetailBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressDetailFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetailText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  datesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    gap: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  tagsContainer: {
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
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  stepsContainer: {
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
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  stepOrder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepOrderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepInfo: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  stepStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  stepStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  stepDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  stepDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDetailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  stepTiming: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  stepTimingLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  stepTimingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
});