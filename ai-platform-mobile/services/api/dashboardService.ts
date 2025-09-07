import apiClient from './apiClient';
import { WorkflowDomain } from './workflowService';

// Types for Dashboard data
export interface KPI {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trend_value?: number;
  target?: number;
  domain: WorkflowDomain;
  category: string;
  description?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface ChartData {
  id: string;
  title: string;
  description?: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  domain: WorkflowDomain;
  category: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }[];
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year';
}

export interface AlertData {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  domain: WorkflowDomain;
  category: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  related_entity_id?: string;
  related_entity_type?: string;
}

export interface DashboardConfig {
  domain: WorkflowDomain;
  layout: {
    kpis: string[];
    charts: string[];
    alerts: boolean;
  };
  refresh_interval?: number; // in seconds
}

// Dashboard Service for data visualization and analytics
class DashboardService {
  private BASE_PATH = '/dashboard';

  /**
   * Get KPIs for a specific domain
   */
  async getKPIs(domain: WorkflowDomain, category?: string): Promise<KPI[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/kpis?domain=${domain}`;
      // if (category) url += `&category=${category}`;
      // return apiClient.get(url);
      
      // Simulated data based on domain
      if (domain === WorkflowDomain.HEALTHCARE) {
        return [
          {
            id: 'kpi-001',
            name: 'Patient Satisfaction',
            value: 92,
            unit: '%',
            trend: 'up',
            trend_value: 3.2,
            target: 95,
            domain: WorkflowDomain.HEALTHCARE,
            category: 'patient',
            description: 'Overall patient satisfaction score'
          },
          {
            id: 'kpi-002',
            name: 'Average Wait Time',
            value: '14.5',
            unit: 'min',
            trend: 'down',
            trend_value: 2.1,
            target: 10,
            domain: WorkflowDomain.HEALTHCARE,
            category: 'operations',
            description: 'Average patient wait time in ER'
          },
          {
            id: 'kpi-003',
            name: 'Bed Utilization',
            value: 87.3,
            unit: '%',
            trend: 'up',
            trend_value: 1.5,
            target: 85,
            domain: WorkflowDomain.HEALTHCARE,
            category: 'resources',
            description: 'Percentage of beds currently in use'
          },
          {
            id: 'kpi-004',
            name: 'Staff Efficiency',
            value: 94.2,
            unit: '%',
            trend: 'stable',
            trend_value: 0.3,
            target: 95,
            domain: WorkflowDomain.HEALTHCARE,
            category: 'staff',
            description: 'Staff efficiency based on task completion'
          }
        ];
      } else if (domain === WorkflowDomain.MANUFACTURING) {
        return [
          {
            id: 'kpi-005',
            name: 'Production Output',
            value: '1,247',
            unit: 'units',
            trend: 'up',
            trend_value: 5.7,
            target: 1300,
            domain: WorkflowDomain.MANUFACTURING,
            category: 'production',
            description: 'Daily production output'
          },
          {
            id: 'kpi-006',
            name: 'Defect Rate',
            value: 0.82,
            unit: '%',
            trend: 'down',
            trend_value: 0.15,
            target: 0.5,
            domain: WorkflowDomain.MANUFACTURING,
            category: 'quality',
            description: 'Percentage of defective units'
          },
          {
            id: 'kpi-007',
            name: 'Machine Uptime',
            value: 98.7,
            unit: '%',
            trend: 'stable',
            trend_value: 0.1,
            target: 99.5,
            domain: WorkflowDomain.MANUFACTURING,
            category: 'equipment',
            description: 'Percentage of time machines are operational'
          },
          {
            id: 'kpi-008',
            name: 'Energy Efficiency',
            value: 87.3,
            unit: '%',
            trend: 'up',
            trend_value: 2.4,
            target: 90,
            domain: WorkflowDomain.MANUFACTURING,
            category: 'sustainability',
            description: 'Energy efficiency ratio'
          }
        ];
      } else if (domain === WorkflowDomain.IOT) {
        return [
          {
            id: 'kpi-009',
            name: 'Device Connectivity',
            value: 99.2,
            unit: '%',
            trend: 'stable',
            trend_value: 0.1,
            target: 99.9,
            domain: WorkflowDomain.IOT,
            category: 'connectivity',
            description: 'Percentage of devices with active connections'
          },
          {
            id: 'kpi-010',
            name: 'Security Score',
            value: 92.8,
            unit: '%',
            trend: 'up',
            trend_value: 1.7,
            target: 95,
            domain: WorkflowDomain.IOT,
            category: 'security',
            description: 'Overall IoT device security score'
          },
          {
            id: 'kpi-011',
            name: 'Data Transmission',
            value: '1.28',
            unit: 'TB/day',
            trend: 'up',
            trend_value: 0.15,
            domain: WorkflowDomain.IOT,
            category: 'data',
            description: 'Daily data transmitted from all IoT devices'
          },
          {
            id: 'kpi-012',
            name: 'Edge Latency',
            value: 4.7,
            unit: 'ms',
            trend: 'down',
            trend_value: 0.3,
            target: 5,
            domain: WorkflowDomain.IOT,
            category: 'performance',
            description: 'Average latency in edge computing nodes'
          }
        ];
      } else {
        // General domain KPIs
        return [
          {
            id: 'kpi-013',
            name: 'Workflow Efficiency',
            value: 91.5,
            unit: '%',
            trend: 'up',
            trend_value: 2.3,
            target: 95,
            domain: WorkflowDomain.GENERAL,
            category: 'workflows',
            description: 'Overall workflow efficiency score'
          },
          {
            id: 'kpi-014',
            name: 'Agent Utilization',
            value: 78.2,
            unit: '%',
            trend: 'up',
            trend_value: 3.5,
            target: 85,
            domain: WorkflowDomain.GENERAL,
            category: 'agents',
            description: 'Percentage of agent capacity currently in use'
          },
          {
            id: 'kpi-015',
            name: 'Task Completion Rate',
            value: 94.7,
            unit: '%',
            trend: 'stable',
            trend_value: 0.2,
            target: 95,
            domain: WorkflowDomain.GENERAL,
            category: 'tasks',
            description: 'Percentage of tasks completed successfully'
          },
          {
            id: 'kpi-016',
            name: 'System Uptime',
            value: 99.97,
            unit: '%',
            trend: 'stable',
            trend_value: 0.01,
            target: 99.99,
            domain: WorkflowDomain.GENERAL,
            category: 'system',
            description: 'System availability over the past 30 days'
          }
        ];
      }
    } catch (error) {
      console.error(`Error fetching KPIs for domain ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Get charts data for a specific domain
   */
  async getCharts(domain: WorkflowDomain, category?: string): Promise<ChartData[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/charts?domain=${domain}`;
      // if (category) url += `&category=${category}`;
      // return apiClient.get(url);
      
      // Simulated chart data based on domain
      if (domain === WorkflowDomain.HEALTHCARE) {
        return [
          {
            id: 'chart-001',
            title: 'Patient Admissions by Department',
            type: 'bar',
            domain: WorkflowDomain.HEALTHCARE,
            category: 'patient',
            labels: ['Emergency', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology', 'Oncology'],
            datasets: [
              {
                label: 'Admissions',
                data: [124, 85, 67, 45, 38, 29],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
              }
            ],
            timeframe: 'week'
          },
          {
            id: 'chart-002',
            title: 'Patient Satisfaction Trends',
            type: 'line',
            domain: WorkflowDomain.HEALTHCARE,
            category: 'patient',
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Satisfaction Score',
                data: [88, 87, 89, 90, 92, 92],
                borderColor: '#10b981',
                fill: false
              },
              {
                label: 'Target',
                data: [95, 95, 95, 95, 95, 95],
                borderColor: '#94a3b8',
                fill: false
              }
            ],
            timeframe: 'month'
          },
          {
            id: 'chart-003',
            title: 'Staff Distribution',
            type: 'pie',
            domain: WorkflowDomain.HEALTHCARE,
            category: 'staff',
            labels: ['Doctors', 'Nurses', 'Technicians', 'Administrative', 'Support'],
            datasets: [
              {
                label: 'Staff Count',
                data: [45, 120, 35, 25, 15],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8']
              }
            ]
          }
        ];
      } else if (domain === WorkflowDomain.MANUFACTURING) {
        return [
          {
            id: 'chart-004',
            title: 'Production Output by Line',
            type: 'bar',
            domain: WorkflowDomain.MANUFACTURING,
            category: 'production',
            labels: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
            datasets: [
              {
                label: 'Actual',
                data: [1247, 982, 1104, 876, 1325],
                backgroundColor: ['#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6']
              },
              {
                label: 'Target',
                data: [1300, 1000, 1100, 900, 1350],
                backgroundColor: ['#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8', '#94a3b8']
              }
            ],
            timeframe: 'day'
          },
          {
            id: 'chart-005',
            title: 'Defect Rate Trends',
            type: 'line',
            domain: WorkflowDomain.MANUFACTURING,
            category: 'quality',
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [
              {
                label: 'Defect Rate (%)',
                data: [1.2, 1.1, 0.97, 0.92, 0.85, 0.82],
                borderColor: '#ef4444',
                fill: false
              }
            ],
            timeframe: 'week'
          },
          {
            id: 'chart-006',
            title: 'Energy Consumption by Department',
            type: 'pie',
            domain: WorkflowDomain.MANUFACTURING,
            category: 'sustainability',
            labels: ['Production Floor', 'Assembly', 'Packaging', 'Warehouse', 'Offices', 'Other'],
            datasets: [
              {
                label: 'Energy Consumption (kWh)',
                data: [12500, 7800, 4500, 3200, 1800, 900],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#94a3b8', '#6b7280']
              }
            ]
          }
        ];
      } else if (domain === WorkflowDomain.IOT) {
        return [
          {
            id: 'chart-007',
            title: 'Device Status Distribution',
            type: 'doughnut',
            domain: WorkflowDomain.IOT,
            category: 'devices',
            labels: ['Online', 'Offline', 'Maintenance', 'Quarantined'],
            datasets: [
              {
                label: 'Devices',
                data: [287, 12, 17, 3],
                backgroundColor: ['#10b981', '#6b7280', '#f59e0b', '#ef4444']
              }
            ]
          },
          {
            id: 'chart-008',
            title: 'Security Incidents by Type',
            type: 'bar',
            domain: WorkflowDomain.IOT,
            category: 'security',
            labels: ['Unauthorized Access', 'DDoS', 'Malware', 'Data Breach', 'Firmware Exploit', 'Other'],
            datasets: [
              {
                label: 'Incidents',
                data: [23, 17, 8, 3, 5, 11],
                backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#a3e635', '#3b82f6', '#6b7280']
              }
            ],
            timeframe: 'month'
          },
          {
            id: 'chart-009',
            title: 'Edge Computing Latency Trends',
            type: 'line',
            domain: WorkflowDomain.IOT,
            category: 'performance',
            labels: ['12am', '4am', '8am', '12pm', '4pm', '8pm'],
            datasets: [
              {
                label: 'Latency (ms)',
                data: [5.2, 4.8, 6.5, 7.3, 5.9, 4.7],
                borderColor: '#3b82f6',
                fill: false
              }
            ],
            timeframe: 'day'
          }
        ];
      } else {
        // General domain charts
        return [
          {
            id: 'chart-010',
            title: 'Workflow Completion Status',
            type: 'pie',
            domain: WorkflowDomain.GENERAL,
            category: 'workflows',
            labels: ['Completed', 'In Progress', 'Paused', 'Failed'],
            datasets: [
              {
                label: 'Workflows',
                data: [98, 24, 11, 5],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']
              }
            ]
          },
          {
            id: 'chart-011',
            title: 'Task Distribution by Domain',
            type: 'bar',
            domain: WorkflowDomain.GENERAL,
            category: 'tasks',
            labels: ['Healthcare', 'Manufacturing', 'IoT', 'Other'],
            datasets: [
              {
                label: 'Active Tasks',
                data: [47, 32, 28, 15],
                backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280']
              }
            ]
          },
          {
            id: 'chart-012',
            title: 'Agent Performance Metrics',
            type: 'radar',
            domain: WorkflowDomain.GENERAL,
            category: 'agents',
            labels: ['Accuracy', 'Efficiency', 'Speed', 'Reliability', 'Autonomy'],
            datasets: [
              {
                label: 'Healthcare Agents',
                data: [95, 87, 78, 92, 84],
                borderColor: '#3b82f6',
                backgroundColor: ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.2)']
              },
              {
                label: 'Manufacturing Agents',
                data: [88, 92, 95, 89, 78],
                borderColor: '#f59e0b',
                backgroundColor: ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.2)']
              },
              {
                label: 'IoT Agents',
                data: [86, 85, 97, 94, 89],
                borderColor: '#8b5cf6',
                backgroundColor: ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.2)']
              }
            ]
          }
        ];
      }
    } catch (error) {
      console.error(`Error fetching charts for domain ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Get alerts for a specific domain
   */
  async getAlerts(domain: WorkflowDomain, status?: 'active' | 'acknowledged' | 'resolved'): Promise<AlertData[]> {
    try {
      // In a real implementation:
      // let url = `${this.BASE_PATH}/alerts?domain=${domain}`;
      // if (status) url += `&status=${status}`;
      // return apiClient.get(url);
      
      // Simulated alert data based on domain
      if (domain === WorkflowDomain.HEALTHCARE) {
        return [
          {
            id: 'alert-001',
            title: 'High ER Wait Times',
            description: 'Emergency Room wait times exceeded threshold for past 2 hours',
            severity: 'high',
            domain: WorkflowDomain.HEALTHCARE,
            category: 'operations',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            status: 'active'
          },
          {
            id: 'alert-002',
            title: 'Staff Shortage - Pediatrics',
            description: 'Pediatrics department is currently understaffed by 2 nurses',
            severity: 'medium',
            domain: WorkflowDomain.HEALTHCARE,
            category: 'staff',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            status: 'acknowledged'
          },
          {
            id: 'alert-003',
            title: 'Critical Equipment Maintenance',
            description: 'MRI scanner #2 requires urgent maintenance',
            severity: 'critical',
            domain: WorkflowDomain.HEALTHCARE,
            category: 'equipment',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            status: 'resolved',
            related_entity_id: 'equipment-mri-2',
            related_entity_type: 'equipment'
          }
        ];
      } else if (domain === WorkflowDomain.MANUFACTURING) {
        return [
          {
            id: 'alert-004',
            title: 'Production Line Slowdown',
            description: 'Line B is operating 15% below normal capacity',
            severity: 'medium',
            domain: WorkflowDomain.MANUFACTURING,
            category: 'production',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            status: 'active',
            related_entity_id: 'production-line-b',
            related_entity_type: 'equipment'
          },
          {
            id: 'alert-005',
            title: 'High Defect Rate Detected',
            description: 'Defect rate on Line C has increased to 1.8% (threshold: 1.0%)',
            severity: 'high',
            domain: WorkflowDomain.MANUFACTURING,
            category: 'quality',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            status: 'acknowledged',
            related_entity_id: 'production-line-c',
            related_entity_type: 'equipment'
          },
          {
            id: 'alert-006',
            title: 'Material Shortage Warning',
            description: 'Inventory of component X-27 is below minimum threshold',
            severity: 'medium',
            domain: WorkflowDomain.MANUFACTURING,
            category: 'inventory',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'resolved'
          }
        ];
      } else if (domain === WorkflowDomain.IOT) {
        return [
          {
            id: 'alert-007',
            title: 'Security Breach Attempt',
            description: 'Multiple unauthorized access attempts detected on IoT gateway 3',
            severity: 'critical',
            domain: WorkflowDomain.IOT,
            category: 'security',
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            status: 'active',
            related_entity_id: 'gateway-003',
            related_entity_type: 'device'
          },
          {
            id: 'alert-008',
            title: 'Connectivity Issues - Building B',
            description: '12 devices in Building B reporting intermittent connectivity',
            severity: 'high',
            domain: WorkflowDomain.IOT,
            category: 'connectivity',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            status: 'acknowledged'
          },
          {
            id: 'alert-009',
            title: 'Edge Node Performance Degradation',
            description: 'Edge Node Beta showing 35% increase in processing latency',
            severity: 'medium',
            domain: WorkflowDomain.IOT,
            category: 'performance',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            status: 'resolved',
            related_entity_id: 'edge-node-beta',
            related_entity_type: 'node'
          }
        ];
      } else {
        // General domain alerts
        return [
          {
            id: 'alert-010',
            title: 'System Update Required',
            description: 'Critical system update available for deployment',
            severity: 'high',
            domain: WorkflowDomain.GENERAL,
            category: 'system',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'active'
          },
          {
            id: 'alert-011',
            title: 'Agent Performance Alert',
            description: 'Agent ID agent-003 showing degraded performance metrics',
            severity: 'medium',
            domain: WorkflowDomain.GENERAL,
            category: 'agents',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            status: 'acknowledged',
            related_entity_id: 'agent-003',
            related_entity_type: 'agent'
          },
          {
            id: 'alert-012',
            title: 'Database Storage Warning',
            description: 'Main database storage usage exceeded 85% threshold',
            severity: 'medium',
            domain: WorkflowDomain.GENERAL,
            category: 'system',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'resolved'
          }
        ];
      }
    } catch (error) {
      console.error(`Error fetching alerts for domain ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Get dashboard configuration for a specific domain
   */
  async getDashboardConfig(domain: WorkflowDomain): Promise<DashboardConfig> {
    try {
      // In a real implementation:
      // return apiClient.get(`${this.BASE_PATH}/config?domain=${domain}`);
      
      // Simulated dashboard config based on domain
      return {
        domain: domain,
        layout: {
          kpis: ['kpi-001', 'kpi-002', 'kpi-003', 'kpi-004'],
          charts: ['chart-001', 'chart-002', 'chart-003'],
          alerts: true
        },
        refresh_interval: 30 // 30 seconds
      };
    } catch (error) {
      console.error(`Error fetching dashboard config for domain ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Update dashboard configuration
   */
  async updateDashboardConfig(config: DashboardConfig): Promise<DashboardConfig> {
    try {
      return apiClient.put(`${this.BASE_PATH}/config`, config);
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      throw error;
    }
  }

  /**
   * Get time series data for a specific KPI
   */
  async getTimeSeriesData(
    kpiId: string, 
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<TimeSeriesData[]> {
    try {
      // In a real implementation:
      // return apiClient.get(`${this.BASE_PATH}/timeseries/${kpiId}?timeframe=${timeframe}`);
      
      // Simulated time series data
      const now = new Date();
      const data: TimeSeriesData[] = [];
      
      if (timeframe === 'hour') {
        // 60 data points, one per minute
        for (let i = 59; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 60000));
          data.push({
            timestamp: timestamp.toISOString(),
            value: Math.random() * 100
          });
        }
      } else if (timeframe === 'day') {
        // 24 data points, one per hour
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 3600000));
          data.push({
            timestamp: timestamp.toISOString(),
            value: Math.random() * 100
          });
        }
      } else if (timeframe === 'week') {
        // 7 data points, one per day
        for (let i = 6; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 86400000));
          data.push({
            timestamp: timestamp.toISOString(),
            value: Math.random() * 100
          });
        }
      } else {
        // 30 data points, one per day
        for (let i = 29; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 86400000));
          data.push({
            timestamp: timestamp.toISOString(),
            value: Math.random() * 100
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching time series data for KPI ${kpiId}:`, error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();