import apiClient from './apiClient';

// Types from the healthcare adapter service
export enum PatientStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  URGENT = 'urgent',
}

export enum PatientPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum DepartmentStatus {
  OPTIMAL = 'optimal',
  BUSY = 'busy',
  CRITICAL = 'critical',
}

export interface Patient {
  id: string;
  name: string;
  room: string;
  status: PatientStatus;
  waitTime: number;
  priority: PatientPriority;
  department: string;
  estimatedTime: number;
  assignedStaff?: string;
}

export interface Department {
  id: string;
  name: string;
  currentPatients: number;
  capacity: number;
  averageWaitTime: number;
  efficiency: number;
  status: DepartmentStatus;
}

export interface FlowMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface TaskDelegationRequest {
  task_id: string;
  task_type: string;
  urgency_level: string;
  required_specialties: string[];
  patient_info: {
    patient_id_hash: string;
    age: number;
    gender: 'male' | 'female' | 'other' | 'unknown';
    encrypted_chief_complaint: string;
    encrypted_symptoms: string;
    risk_indicators: string[];
  };
}

export interface HealthcareResponse {
  success: boolean;
  delegation?: {
    delegation_id: string;
    task_id: string;
    assigned_agent_id: string;
    agent_name: string;
    agent_type: string;
    confidence: number;
    reasoning: string;
    estimated_completion: string;
    priority_score: number;
    status: string;
  };
  message: string;
  compliance_status: string;
  audit_id: string;
  timestamp: string;
}

export interface HealthcareAgent {
  agent_id: string;
  agent_type: string;
  name: string;
  specialties: string[];
  current_workload: number;
  max_workload: number;
  availability_status: 'available' | 'busy' | 'offline';
  performance_metrics: {
    accuracy_rate: number;
    avg_completion_time: number;
    patient_satisfaction: number;
  };
  security_clearance_level: number;
}

// Healthcare API service
class HealthcareService {
  private BASE_PATH = '/api/v1/healthcare';

  /**
   * Get health check from the healthcare service
   */
  async getHealthStatus(): Promise<any> {
    return apiClient.get('/health');
  }

  /**
   * Get all patients
   */
  async getPatients(): Promise<Patient[]> {
    // In a real implementation, we would connect to our backend
    // For now, we'll simulate the response
    try {
      // This would be the real API call:
      // return apiClient.get(`${this.BASE_PATH}/patients`);
      
      // Simulated data (similar to what's in the UI now)
      return [
        {
          id: '1',
          name: 'John Smith',
          room: 'A-101',
          status: PatientStatus.WAITING,
          waitTime: 15,
          priority: PatientPriority.MEDIUM,
          department: 'Emergency',
          estimatedTime: 30,
          assignedStaff: 'Dr. Johnson'
        },
        {
          id: '2',
          name: 'Mary Johnson',
          room: 'B-205',
          status: PatientStatus.IN_PROGRESS,
          waitTime: 45,
          priority: PatientPriority.HIGH,
          department: 'Cardiology',
          estimatedTime: 60
        },
        {
          id: '3',
          name: 'Robert Davis',
          room: 'C-301',
          status: PatientStatus.URGENT,
          waitTime: 5,
          priority: PatientPriority.CRITICAL,
          department: 'ICU',
          estimatedTime: 120,
          assignedStaff: 'Dr. Williams'
        },
        {
          id: '4',
          name: 'Sarah Wilson',
          room: 'A-102',
          status: PatientStatus.COMPLETED,
          waitTime: 0,
          priority: PatientPriority.LOW,
          department: 'Outpatient',
          estimatedTime: 0
        },
        {
          id: '5',
          name: 'Michael Brown',
          room: 'B-210',
          status: PatientStatus.WAITING,
          waitTime: 25,
          priority: PatientPriority.MEDIUM,
          department: 'Radiology',
          estimatedTime: 45
        }
      ];
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  /**
   * Get all departments
   */
  async getDepartments(): Promise<Department[]> {
    try {
      // This would be the real API call:
      // return apiClient.get(`${this.BASE_PATH}/departments`);
      
      // Simulated data
      return [
        {
          id: '1',
          name: 'Emergency',
          currentPatients: 12,
          capacity: 15,
          averageWaitTime: 18,
          efficiency: 85,
          status: DepartmentStatus.BUSY
        },
        {
          id: '2',
          name: 'Cardiology',
          currentPatients: 8,
          capacity: 12,
          averageWaitTime: 25,
          efficiency: 92,
          status: DepartmentStatus.OPTIMAL
        },
        {
          id: '3',
          name: 'ICU',
          currentPatients: 18,
          capacity: 20,
          averageWaitTime: 5,
          efficiency: 98,
          status: DepartmentStatus.CRITICAL
        },
        {
          id: '4',
          name: 'Radiology',
          currentPatients: 6,
          capacity: 10,
          averageWaitTime: 35,
          efficiency: 78,
          status: DepartmentStatus.OPTIMAL
        },
        {
          id: '5',
          name: 'Outpatient',
          currentPatients: 15,
          capacity: 25,
          averageWaitTime: 12,
          efficiency: 88,
          status: DepartmentStatus.OPTIMAL
        }
      ];
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
  }

  /**
   * Get flow metrics
   */
  async getFlowMetrics(): Promise<FlowMetric[]> {
    try {
      // This would be the real API call:
      // return apiClient.get(`${this.BASE_PATH}/metrics/flow`);
      
      // Simulated data
      return [
        {
          title: 'Total Patients',
          value: '247',
          change: '+12.5%',
          isPositive: true
        },
        {
          title: 'Avg Wait Time',
          value: '18min',
          change: '-8.2%',
          isPositive: true
        },
        {
          title: 'Bed Utilization',
          value: '87%',
          change: '+5.1%',
          isPositive: true
        },
        {
          title: 'Critical Cases',
          value: '3',
          change: '-2',
          isPositive: true
        }
      ];
    } catch (error) {
      console.error('Error fetching flow metrics:', error);
      throw error;
    }
  }

  /**
   * Delegate a healthcare task to an agent (uses the healthcare-adapter service)
   */
  async delegateTask(request: TaskDelegationRequest): Promise<HealthcareResponse> {
    try {
      return apiClient.post(`${this.BASE_PATH}/delegate-task`, request);
    } catch (error) {
      console.error('Error delegating task:', error);
      throw error;
    }
  }

  /**
   * Get list of available healthcare agents
   */
  async getAgents(): Promise<HealthcareAgent[]> {
    try {
      return apiClient.get(`${this.BASE_PATH}/agents`);
    } catch (error) {
      console.error('Error fetching healthcare agents:', error);
      throw error;
    }
  }

  /**
   * Get AI optimization suggestions for patient flow
   */
  async getOptimizationSuggestions(departmentId?: string): Promise<any> {
    try {
      const endpoint = departmentId 
        ? `${this.BASE_PATH}/optimize?department_id=${departmentId}`
        : `${this.BASE_PATH}/optimize`;
      
      return apiClient.get(endpoint);
    } catch (error) {
      console.error('Error fetching optimization suggestions:', error);
      throw error;
    }
  }
}

export const healthcareService = new HealthcareService();