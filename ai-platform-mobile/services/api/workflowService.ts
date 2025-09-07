import apiClient from './apiClient';
import { Agent } from './agentService';

// Types for Workflow service
export enum WorkflowStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WorkflowTriggerType {
  SCHEDULED = 'scheduled',
  EVENT_BASED = 'event_based',
  MANUAL = 'manual',
  CONDITIONAL = 'conditional',
}

export enum WorkflowDomain {
  HEALTHCARE = 'healthcare',
  MANUFACTURING = 'manufacturing',
  IOT = 'iot',
  GENERAL = 'general',
}

export interface WorkflowStep {
  step_id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  agent_id?: string;
  depends_on?: string[];
  estimated_duration?: number; // In seconds
  actual_duration?: number; // In seconds
  started_at?: string;
  completed_at?: string;
  order: number;
  is_critical: boolean;
  metadata: Record<string, any>;
}

export interface Workflow {
  workflow_id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  domain: WorkflowDomain;
  trigger_type: WorkflowTriggerType;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_duration?: number; // In seconds
  actual_duration?: number; // In seconds
  owner_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  steps: WorkflowStep[];
  metadata: Record<string, any>;
}

export interface WorkflowCreationRequest {
  name: string;
  description: string;
  domain: WorkflowDomain;
  trigger_type: WorkflowTriggerType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  steps: Omit<WorkflowStep, 'step_id' | 'status' | 'started_at' | 'completed_at' | 'actual_duration'>[];
  metadata?: Record<string, any>;
}

export interface WorkflowStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  avgCompletionTime: number;
  successRate: number;
  byDomain: Record<string, number>;
}

// Workflow Orchestration Service
class WorkflowService {
  private BASE_PATH = '/workflow/orchestration';

  /**
   * Get all workflows
   */
  async getWorkflows(domain?: WorkflowDomain, status?: WorkflowStatus): Promise<Workflow[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/workflows`;
      // if (domain || status) {
      //   url += '?';
      //   if (domain) url += `domain=${domain}`;
      //   if (domain && status) url += '&';
      //   if (status) url += `status=${status}`;
      // }
      // return apiClient.get(url);
      
      // Simulated data
      return [
        {
          workflow_id: 'wf-001',
          name: 'Patient Admission Process',
          description: 'Complete workflow for patient admission including triage, initial assessment, and room assignment',
          status: WorkflowStatus.ACTIVE,
          domain: WorkflowDomain.HEALTHCARE,
          trigger_type: WorkflowTriggerType.EVENT_BASED,
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          updated_at: new Date().toISOString(),
          started_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
          estimated_duration: 7200, // 2 hours
          priority: 'high',
          tags: ['patient', 'admission', 'triage'],
          steps: [
            {
              step_id: 'step-001',
              name: 'Initial Triage',
              description: 'Assess patient condition and assign priority',
              status: 'completed',
              agent_id: 'agent-001',
              order: 1,
              is_critical: true,
              started_at: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
              completed_at: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
              estimated_duration: 900, // 15 minutes
              actual_duration: 300, // 5 minutes
              metadata: {
                triage_category: 'urgent',
                vitals_checked: true
              }
            },
            {
              step_id: 'step-002',
              name: 'Doctor Assessment',
              description: 'Complete physician assessment and initial diagnosis',
              status: 'in_progress',
              agent_id: 'agent-005',
              depends_on: ['step-001'],
              order: 2,
              is_critical: true,
              started_at: new Date(Date.now() - 2400000).toISOString(), // 40 minutes ago
              estimated_duration: 1800, // 30 minutes
              metadata: {
                assessment_type: 'comprehensive',
                diagnostic_tests_required: true
              }
            },
            {
              step_id: 'step-003',
              name: 'Room Assignment',
              description: 'Assign appropriate room based on patient condition',
              status: 'pending',
              depends_on: ['step-002'],
              order: 3,
              is_critical: false,
              estimated_duration: 600, // 10 minutes
              metadata: {
                room_preferences: ['private', 'quiet']
              }
            }
          ],
          metadata: {
            patient_id: 'p-10045',
            emergency_contact: 'John Doe',
            special_requirements: 'Language translator needed'
          }
        },
        {
          workflow_id: 'wf-002',
          name: 'Manufacturing Quality Control Process',
          description: 'End-to-end quality control process for production line A',
          status: WorkflowStatus.COMPLETED,
          domain: WorkflowDomain.MANUFACTURING,
          trigger_type: WorkflowTriggerType.SCHEDULED,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          started_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          completed_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          estimated_duration: 43200, // 12 hours
          actual_duration: 43200, // 12 hours
          priority: 'medium',
          tags: ['production', 'quality', 'batch-A1'],
          steps: [
            {
              step_id: 'step-004',
              name: 'Initial Batch Testing',
              description: 'Test initial product samples for quality metrics',
              status: 'completed',
              agent_id: 'agent-002',
              order: 1,
              is_critical: true,
              started_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              completed_at: new Date(Date.now() - 79200000).toISOString(), // 22 hours ago
              estimated_duration: 7200, // 2 hours
              actual_duration: 7200, // 2 hours
              metadata: {
                samples_tested: 50,
                defects_found: 2
              }
            },
            {
              step_id: 'step-005',
              name: 'Production Line Monitoring',
              description: 'Continuous monitoring of production quality metrics',
              status: 'completed',
              agent_id: 'agent-002',
              depends_on: ['step-004'],
              order: 2,
              is_critical: true,
              started_at: new Date(Date.now() - 79200000).toISOString(), // 22 hours ago
              completed_at: new Date(Date.now() - 50400000).toISOString(), // 14 hours ago
              estimated_duration: 28800, // 8 hours
              actual_duration: 28800, // 8 hours
              metadata: {
                units_produced: 5000,
                quality_threshold: 99.5,
                actual_quality_score: 99.8
              }
            },
            {
              step_id: 'step-006',
              name: 'Final Batch Verification',
              description: 'Verify final batch meets all quality standards',
              status: 'completed',
              agent_id: 'agent-002',
              depends_on: ['step-005'],
              order: 3,
              is_critical: true,
              started_at: new Date(Date.now() - 50400000).toISOString(), // 14 hours ago
              completed_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
              estimated_duration: 7200, // 2 hours
              actual_duration: 7200, // 2 hours
              metadata: {
                verification_method: 'statistical_sampling',
                batch_approved: true
              }
            }
          ],
          metadata: {
            batch_id: 'B2023-A1',
            production_line: 'Line A',
            product_sku: 'PROD-X1'
          }
        },
        {
          workflow_id: 'wf-003',
          name: 'IoT Security Audit',
          description: 'Comprehensive security audit of all IoT devices',
          status: WorkflowStatus.ACTIVE,
          domain: WorkflowDomain.IOT,
          trigger_type: WorkflowTriggerType.SCHEDULED,
          created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          updated_at: new Date().toISOString(),
          started_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
          estimated_duration: 86400, // 24 hours
          priority: 'high',
          tags: ['security', 'audit', 'compliance'],
          steps: [
            {
              step_id: 'step-007',
              name: 'Device Inventory',
              description: 'Create complete inventory of all connected devices',
              status: 'completed',
              agent_id: 'agent-004',
              order: 1,
              is_critical: true,
              started_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
              completed_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
              estimated_duration: 3600, // 1 hour
              actual_duration: 3600, // 1 hour
              metadata: {
                devices_found: 327,
                new_devices: 5,
                unrecognized_devices: 1
              }
            },
            {
              step_id: 'step-008',
              name: 'Vulnerability Scanning',
              description: 'Scan all devices for known vulnerabilities',
              status: 'in_progress',
              agent_id: 'agent-004',
              depends_on: ['step-007'],
              order: 2,
              is_critical: true,
              started_at: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
              estimated_duration: 21600, // 6 hours
              metadata: {
                scan_type: 'comprehensive',
                databases_used: ['CVE', 'NIST', 'Proprietary']
              }
            },
            {
              step_id: 'step-009',
              name: 'Security Compliance Check',
              description: 'Verify all devices meet security policy requirements',
              status: 'pending',
              depends_on: ['step-008'],
              order: 3,
              is_critical: true,
              estimated_duration: 14400, // 4 hours
              metadata: {
                compliance_frameworks: ['NIST', 'ISO27001', 'Internal']
              }
            },
            {
              step_id: 'step-010',
              name: 'Report Generation',
              description: 'Generate comprehensive security audit report',
              status: 'pending',
              depends_on: ['step-009'],
              order: 4,
              is_critical: false,
              estimated_duration: 7200, // 2 hours
              metadata: {
                report_format: 'pdf',
                include_executive_summary: true,
                include_remediation_plan: true
              }
            }
          ],
          metadata: {
            audit_id: 'AUDIT-2023-09',
            requester: 'Security Team',
            priority_devices: ['gateway-001', 'sensor-cluster-A']
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(workflowId: string): Promise<Workflow> {
    try {
      return apiClient.get(`${this.BASE_PATH}/workflows/${workflowId}`);
    } catch (error) {
      console.error(`Error fetching workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(request: WorkflowCreationRequest): Promise<Workflow> {
    try {
      return apiClient.post(`${this.BASE_PATH}/workflows`, request);
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Update workflow status
   */
  async updateWorkflowStatus(workflowId: string, status: WorkflowStatus): Promise<Workflow> {
    try {
      return apiClient.patch(`${this.BASE_PATH}/workflows/${workflowId}/status`, {
        status: status
      });
    } catch (error) {
      console.error(`Error updating status for workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Update workflow step status
   */
  async updateStepStatus(
    workflowId: string,
    stepId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  ): Promise<WorkflowStep> {
    try {
      return apiClient.patch(
        `${this.BASE_PATH}/workflows/${workflowId}/steps/${stepId}/status`,
        { status }
      );
    } catch (error) {
      console.error(`Error updating status for step ${stepId} in workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Assign agent to workflow step
   */
  async assignAgentToStep(workflowId: string, stepId: string, agentId: string): Promise<WorkflowStep> {
    try {
      return apiClient.post(
        `${this.BASE_PATH}/workflows/${workflowId}/steps/${stepId}/assign`,
        { agent_id: agentId }
      );
    } catch (error) {
      console.error(`Error assigning agent to step ${stepId} in workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStatistics(domain?: WorkflowDomain, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<WorkflowStats> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/statistics?timeframe=${timeframe}`;
      // if (domain) url += `&domain=${domain}`;
      // return apiClient.get(url);
      
      // Simulated data
      return {
        total: 127,
        active: 24,
        completed: 98,
        failed: 5,
        avgCompletionTime: 12600, // 3.5 hours in seconds
        successRate: 0.95, // 95%
        byDomain: {
          'healthcare': 45,
          'manufacturing': 32,
          'iot': 28,
          'general': 22
        }
      };
    } catch (error) {
      console.error('Error fetching workflow statistics:', error);
      throw error;
    }
  }

  /**
   * Get agents capable of handling a particular workflow step
   */
  async getEligibleAgentsForStep(
    workflowId: string,
    stepId: string
  ): Promise<Agent[]> {
    try {
      return apiClient.get(`${this.BASE_PATH}/workflows/${workflowId}/steps/${stepId}/eligible-agents`);
    } catch (error) {
      console.error(`Error fetching eligible agents for step ${stepId} in workflow ${workflowId}:`, error);
      throw error;
    }
  }
}

export const workflowService = new WorkflowService();