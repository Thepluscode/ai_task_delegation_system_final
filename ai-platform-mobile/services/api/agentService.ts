import apiClient from './apiClient';

// Types for Agent service
export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BUSY = 'busy',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

export enum AgentType {
  AI_TRIAGE = 'ai_triage_system',
  NURSE_PRACTITIONER = 'nurse_practitioner',
  GENERAL_PHYSICIAN = 'general_physician',
  SPECIALIST = 'specialist',
  RADIOLOGIST = 'radiologist',
  LAB_TECHNICIAN = 'lab_technician',
  EMERGENCY_PHYSICIAN = 'emergency_physician',
  ROBOT_ASSISTANT = 'robot_assistant',
  IOT_MANAGER = 'iot_manager',
  WORKFLOW_ORCHESTRATOR = 'workflow_orchestrator',
  MANUFACTURING_SUPERVISOR = 'manufacturing_supervisor',
}

export interface Agent {
  agent_id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  specialties?: string[];
  version: string;
  current_workload: number;
  max_workload: number;
  performance_metrics: {
    accuracy_rate: number;
    avg_completion_time: number;
    efficiency_score: number;
    [key: string]: number;
  };
  last_active: string;
  created_at: string;
}

export interface Task {
  task_id: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
  deadline?: string;
  domain: string;
  workflow_id?: string;
  metadata: Record<string, any>;
}

export interface AgentCreationRequest {
  name: string;
  type: AgentType;
  capabilities: string[];
  specialties?: string[];
  max_workload: number;
}

// Agent Management Service
class AgentService {
  private BASE_PATH = '/agent/management';

  /**
   * Get list of all agents
   */
  async getAgents(type?: AgentType, status?: AgentStatus): Promise<Agent[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/agents`;
      // if (type || status) {
      //   url += '?';
      //   if (type) url += `type=${type}`;
      //   if (type && status) url += '&';
      //   if (status) url += `status=${status}`;
      // }
      // return apiClient.get(url);
      
      // Simulated data
      return [
        {
          agent_id: 'agent-001',
          name: 'Healthcare Triage AI',
          type: AgentType.AI_TRIAGE,
          status: AgentStatus.ACTIVE,
          capabilities: ['patient_assessment', 'symptom_analysis', 'priority_assignment'],
          specialties: ['emergency_medicine', 'general_practice'],
          version: '2.3.1',
          current_workload: 12,
          max_workload: 50,
          performance_metrics: {
            accuracy_rate: 0.92,
            avg_completion_time: 45.3,
            efficiency_score: 0.88,
            patient_satisfaction: 4.7
          },
          last_active: new Date().toISOString(),
          created_at: '2024-01-15T08:30:00.000Z'
        },
        {
          agent_id: 'agent-002',
          name: 'Manufacturing QC Agent',
          type: AgentType.MANUFACTURING_SUPERVISOR,
          status: AgentStatus.ACTIVE,
          capabilities: ['defect_detection', 'process_optimization', 'quality_control'],
          version: '1.5.7',
          current_workload: 8,
          max_workload: 25,
          performance_metrics: {
            accuracy_rate: 0.95,
            avg_completion_time: 12.7,
            efficiency_score: 0.91,
            defect_detection_rate: 0.978
          },
          last_active: new Date().toISOString(),
          created_at: '2024-02-22T14:15:00.000Z'
        },
        {
          agent_id: 'agent-003',
          name: 'Workflow Orchestrator',
          type: AgentType.WORKFLOW_ORCHESTRATOR,
          status: AgentStatus.ACTIVE,
          capabilities: ['task_assignment', 'resource_optimization', 'deadline_management'],
          version: '3.0.2',
          current_workload: 32,
          max_workload: 100,
          performance_metrics: {
            accuracy_rate: 0.97,
            avg_completion_time: 85.2,
            efficiency_score: 0.94,
            resource_utilization: 0.87
          },
          last_active: new Date().toISOString(),
          created_at: '2023-11-05T10:45:00.000Z'
        },
        {
          agent_id: 'agent-004',
          name: 'IoT Device Manager',
          type: AgentType.IOT_MANAGER,
          status: AgentStatus.BUSY,
          capabilities: ['device_monitoring', 'anomaly_detection', 'predictive_maintenance'],
          version: '2.1.4',
          current_workload: 75,
          max_workload: 80,
          performance_metrics: {
            accuracy_rate: 0.91,
            avg_completion_time: 3.5,
            efficiency_score: 0.85,
            anomaly_detection_rate: 0.92
          },
          last_active: new Date().toISOString(),
          created_at: '2023-12-18T16:20:00.000Z'
        },
        {
          agent_id: 'agent-005',
          name: 'Dr. Virtual Assistant',
          type: AgentType.GENERAL_PHYSICIAN,
          status: AgentStatus.MAINTENANCE,
          capabilities: ['diagnosis_support', 'treatment_recommendation', 'medical_record_analysis'],
          specialties: ['internal_medicine'],
          version: '2.0.0',
          current_workload: 0,
          max_workload: 20,
          performance_metrics: {
            accuracy_rate: 0.89,
            avg_completion_time: 120.5,
            efficiency_score: 0.82,
            diagnostic_accuracy: 0.91
          },
          last_active: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          created_at: '2023-09-30T09:10:00.000Z'
        }
      ];
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgentById(agentId: string): Promise<Agent> {
    try {
      return apiClient.get(`${this.BASE_PATH}/agents/${agentId}`);
    } catch (error) {
      console.error(`Error fetching agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new agent
   */
  async createAgent(request: AgentCreationRequest): Promise<Agent> {
    try {
      return apiClient.post(`${this.BASE_PATH}/agents`, request);
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<Agent> {
    try {
      return apiClient.patch(`${this.BASE_PATH}/agents/${agentId}/status`, {
        status: status
      });
    } catch (error) {
      console.error(`Error updating status for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/agents/${agentId}`);
    } catch (error) {
      console.error(`Error deleting agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get tasks assigned to an agent
   */
  async getAgentTasks(agentId: string): Promise<Task[]> {
    try {
      return apiClient.get(`${this.BASE_PATH}/agents/${agentId}/tasks`);
    } catch (error) {
      console.error(`Error fetching tasks for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get all tasks
   */
  async getTasks(status?: string, domain?: string): Promise<Task[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/tasks`;
      // if (status || domain) {
      //   url += '?';
      //   if (status) url += `status=${status}`;
      //   if (status && domain) url += '&';
      //   if (domain) url += `domain=${domain}`;
      // }
      // return apiClient.get(url);
      
      // Simulated data
      return [
        {
          task_id: 'task-001',
          title: 'Patient Triage Assessment',
          description: 'Assess incoming patients and assign priority based on symptoms and medical history',
          status: 'in_progress',
          priority: 'high',
          assigned_agent_id: 'agent-001',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date().toISOString(),
          deadline: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
          domain: 'healthcare',
          metadata: {
            patient_count: 15,
            department: 'Emergency',
            requires_specialized_knowledge: true
          }
        },
        {
          task_id: 'task-002',
          title: 'Manufacturing Quality Control Review',
          description: 'Review production line output and identify potential quality issues',
          status: 'completed',
          priority: 'medium',
          assigned_agent_id: 'agent-002',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          domain: 'manufacturing',
          workflow_id: 'workflow-005',
          metadata: {
            production_line: 'Line-A',
            products_reviewed: 1247,
            defects_identified: 12
          }
        },
        {
          task_id: 'task-003',
          title: 'IoT Device Health Check',
          description: 'Perform health check on all connected IoT devices and identify potential issues',
          status: 'pending',
          priority: 'low',
          created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          updated_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          deadline: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
          domain: 'iot',
          metadata: {
            device_count: 327,
            check_types: ['connectivity', 'firmware', 'security', 'performance']
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(task: Omit<Task, 'task_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      return apiClient.post(`${this.BASE_PATH}/tasks`, task);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Assign task to an agent
   */
  async assignTask(taskId: string, agentId: string): Promise<Task> {
    try {
      return apiClient.post(`${this.BASE_PATH}/tasks/${taskId}/assign`, {
        agent_id: agentId
      });
    } catch (error) {
      console.error(`Error assigning task ${taskId} to agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentPerformanceMetrics(agentId: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      return apiClient.get(`${this.BASE_PATH}/agents/${agentId}/performance?timeframe=${timeframe}`);
    } catch (error) {
      console.error(`Error fetching performance metrics for agent ${agentId}:`, error);
      throw error;
    }
  }
}

export const agentService = new AgentService();