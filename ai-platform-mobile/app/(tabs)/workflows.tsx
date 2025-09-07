import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Workflow, 
  Play, 
  Pause, 
  Square, 
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Copy,
  Share,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  Users,
  Bot,
  Zap,
  Settings,
  Eye,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  TrendingUp,
  Activity,
  Target,
  Layers
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'error';
  progress: number;
  industry: string;
  robots: number;
  tasks: number;
  completedTasks: number;
  estimatedTime: string;
  actualTime: string;
  efficiency: number;
  lastRun: string;
  nextRun: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  createdBy: string;
  createdAt: string;
  version: string;
}

interface WorkflowCardProps {
  workflow: WorkflowData;
  onPress: () => void;
  onAction: (action: string, workflow: WorkflowData) => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onPress, onAction }) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  const getStatusColor = () => {
    switch (workflow.status) {
      case 'running': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'stopped': return '#6b7280';
      case 'completed': return '#3b82f6';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'running': return <PlayCircle size={16} color={getStatusColor()} />;
      case 'paused': return <PauseCircle size={16} color={getStatusColor()} />;
      case 'stopped': return <StopCircle size={16} color={getStatusColor()} />;
      case 'completed': return <CheckCircle size={16} color={getStatusColor()} />;
      case 'error': return <AlertTriangle size={16} color={getStatusColor()} />;
      default: return <Clock size={16} color={getStatusColor()} />;
    }
  };

  const getPriorityColor = () => {
    switch (workflow.priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.workflowCard} onPress={onPress}>
      <View style={styles.workflowHeader}>
        <View style={styles.workflowLeft}>
          <View style={[styles.workflowIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Workflow size={24} color={getStatusColor()} />
          </View>
          <View style={styles.workflowInfo}>
            <Text style={styles.workflowName}>{workflow.name}</Text>
            <Text style={styles.workflowDescription}>{workflow.description}</Text>
            <View style={styles.workflowMeta}>
              <Text style={styles.workflowIndustry}>{workflow.industry}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
                <Text style={styles.priorityText}>{workflow.priority.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.workflowRight}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {workflow.status.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setShowActions(!showActions)}
          >
            <MoreVertical size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{workflow.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${workflow.progress}%`,
                backgroundColor: getStatusColor()
              }
            ]} 
          />
        </View>
        <Text style={styles.progressDetails}>
          {workflow.completedTasks}/{workflow.tasks} tasks completed
        </Text>
      </View>

      <View style={styles.workflowMetrics}>
        <View style={styles.metric}>
          <Bot size={16} color="#6b7280" />
          <Text style={styles.metricValue}>{workflow.robots}</Text>
          <Text style={styles.metricLabel}>Robots</Text>
        </View>
        <View style={styles.metric}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.metricValue}>{workflow.estimatedTime}</Text>
          <Text style={styles.metricLabel}>Est. Time</Text>
        </View>
        <View style={styles.metric}>
          <TrendingUp size={16} color="#6b7280" />
          <Text style={styles.metricValue}>{workflow.efficiency}%</Text>
          <Text style={styles.metricLabel}>Efficiency</Text>
        </View>
        <View style={styles.metric}>
          <Calendar size={16} color="#6b7280" />
          <Text style={styles.metricValue}>{workflow.lastRun}</Text>
          <Text style={styles.metricLabel}>Last Run</Text>
        </View>
      </View>

      <View style={styles.workflowTags}>
        {workflow.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {showActions && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => onAction('start', workflow)}
          >
            <Play size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
            onPress={() => onAction('pause', workflow)}
          >
            <Pause size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
            onPress={() => onAction('stop', workflow)}
          >
            <Square size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
            onPress={() => onAction('edit', workflow)}
          >
            <Edit3 size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface WorkflowStatsProps {
  workflows: WorkflowData[];
}

const WorkflowStats: React.FC<WorkflowStatsProps> = ({ workflows }) => {
  const stats = {
    total: workflows.length,
    running: workflows.filter(w => w.status === 'running').length,
    paused: workflows.filter(w => w.status === 'paused').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    error: workflows.filter(w => w.status === 'error').length,
    avgEfficiency: Math.round(workflows.reduce((sum, w) => sum + w.efficiency, 0) / workflows.length)
  };

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.statValue}>{stats.running}</Text>
          <Text style={styles.statLabel}>Running</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <Text style={styles.statValue}>{stats.paused}</Text>
          <Text style={styles.statLabel}>Paused</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
          <Text style={styles.statValue}>{stats.error}</Text>
          <Text style={styles.statLabel}>Errors</Text>
        </View>
      </View>
      <View style={styles.efficiencyCard}>
        <View style={styles.efficiencyHeader}>
          <Activity size={20} color="#3b82f6" />
          <Text style={styles.efficiencyTitle}>Average Efficiency</Text>
        </View>
        <Text style={styles.efficiencyValue}>{stats.avgEfficiency}%</Text>
        <Text style={styles.efficiencySubtitle}>Across all workflows</Text>
      </View>
    </View>
  );
};

export default function WorkflowsScreen() {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);

  useEffect(() => {
    // Mock workflow data
    const mockWorkflows: WorkflowData[] = [
      {
        id: '1',
        name: 'Healthcare Patient Flow',
        description: 'Automated patient admission and room assignment workflow',
        status: 'running',
        progress: 75,
        industry: 'Healthcare',
        robots: 8,
        tasks: 24,
        completedTasks: 18,
        estimatedTime: '2h 30m',
        actualTime: '1h 45m',
        efficiency: 94,
        lastRun: '2h ago',
        nextRun: '6h',
        priority: 'high',
        tags: ['patient-care', 'automation', 'real-time'],
        createdBy: 'Dr. Sarah Johnson',
        createdAt: '2024-01-15',
        version: '2.1.0'
      },
      {
        id: '2',
        name: 'Manufacturing Quality Control',
        description: 'Automated quality inspection and defect detection',
        status: 'completed',
        progress: 100,
        industry: 'Manufacturing',
        robots: 12,
        tasks: 36,
        completedTasks: 36,
        estimatedTime: '4h 15m',
        actualTime: '3h 52m',
        efficiency: 98,
        lastRun: '30m ago',
        nextRun: '2h',
        priority: 'critical',
        tags: ['quality', 'inspection', 'defect-detection'],
        createdBy: 'Mike Chen',
        createdAt: '2024-01-10',
        version: '1.8.2'
      },
      {
        id: '3',
        name: 'Financial Risk Assessment',
        description: 'Automated portfolio risk analysis and reporting',
        status: 'paused',
        progress: 45,
        industry: 'Financial',
        robots: 6,
        tasks: 18,
        completedTasks: 8,
        estimatedTime: '1h 20m',
        actualTime: '45m',
        efficiency: 87,
        lastRun: '4h ago',
        nextRun: 'Manual',
        priority: 'medium',
        tags: ['risk', 'portfolio', 'analysis'],
        createdBy: 'Emma Davis',
        createdAt: '2024-01-12',
        version: '3.0.1'
      },
      {
        id: '4',
        name: 'Educational Content Delivery',
        description: 'Personalized learning content distribution system',
        status: 'running',
        progress: 60,
        industry: 'Education',
        robots: 4,
        tasks: 15,
        completedTasks: 9,
        estimatedTime: '3h 10m',
        actualTime: '2h 15m',
        efficiency: 91,
        lastRun: '1h ago',
        nextRun: '4h',
        priority: 'medium',
        tags: ['education', 'personalization', 'content'],
        createdBy: 'Prof. James Wilson',
        createdAt: '2024-01-08',
        version: '1.5.0'
      },
      {
        id: '5',
        name: 'Retail Inventory Management',
        description: 'Automated stock monitoring and reorder system',
        status: 'error',
        progress: 25,
        industry: 'Retail',
        robots: 10,
        tasks: 28,
        completedTasks: 7,
        estimatedTime: '5h 30m',
        actualTime: '1h 20m',
        efficiency: 65,
        lastRun: '6h ago',
        nextRun: 'Error',
        priority: 'high',
        tags: ['inventory', 'stock', 'reorder'],
        createdBy: 'Lisa Anderson',
        createdAt: '2024-01-14',
        version: '2.3.1'
      },
      {
        id: '6',
        name: 'Logistics Route Optimization',
        description: 'Dynamic delivery route planning and optimization',
        status: 'running',
        progress: 85,
        industry: 'Logistics',
        robots: 15,
        tasks: 42,
        completedTasks: 36,
        estimatedTime: '6h 45m',
        actualTime: '5h 30m',
        efficiency: 96,
        lastRun: '15m ago',
        nextRun: '1h',
        priority: 'high',
        tags: ['logistics', 'routing', 'optimization'],
        createdBy: 'David Rodriguez',
        createdAt: '2024-01-11',
        version: '1.9.0'
      }
    ];
    setWorkflows(mockWorkflows);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleWorkflowAction = (action: string, workflow: WorkflowData) => {
    console.log(`${action} workflow:`, workflow.name);
    Alert.alert(
      'Workflow Action',
      `${action.charAt(0).toUpperCase() + action.slice(1)} workflow "${workflow.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => console.log(`${action} confirmed`) }
      ]
    );
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.industry.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || workflow.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filters = [
    { key: 'all', label: 'All', count: workflows.length },
    { key: 'running', label: 'Running', count: workflows.filter(w => w.status === 'running').length },
    { key: 'paused', label: 'Paused', count: workflows.filter(w => w.status === 'paused').length },
    { key: 'completed', label: 'Completed', count: workflows.filter(w => w.status === 'completed').length },
    { key: 'error', label: 'Error', count: workflows.filter(w => w.status === 'error').length }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Workflow Management</Text>
            <Text style={styles.headerSubtitle}>Intelligent Process Automation</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workflows..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filters}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.filterChipActive
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextActive
                ]}>
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <WorkflowStats workflows={workflows} />

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.workflowsList}>
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard 
              key={workflow.id} 
              workflow={workflow} 
              onPress={() => console.log('View workflow:', workflow.name)}
              onAction={handleWorkflowAction}
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Workflow</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Workflow creation interface would go here...</Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowCreateModal(false);
                Alert.alert('Success', 'Workflow created successfully!');
              }}
            >
              <Text style={styles.modalButtonText}>Create Workflow</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  efficiencyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  efficiencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  efficiencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  efficiencyValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  efficiencySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workflowsList: {
    paddingVertical: 20,
    gap: 16,
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
    elevation: 5,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  workflowLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  workflowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workflowInfo: {
    flex: 1,
  },
  workflowName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  workflowDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  workflowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  workflowIndustry: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  workflowRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  workflowMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  workflowTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  modalClose: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});