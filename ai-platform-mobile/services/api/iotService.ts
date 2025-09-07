import apiClient from './apiClient';

// Types for IoT service
export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  QUARANTINED = 'quarantined',
}

export enum SecurityThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface IoTDevice {
  device_id: string;
  name: string;
  type: string;
  firmware_version: string;
  status: DeviceStatus;
  last_seen: string;
  security_score: number;
  location: string;
  metadata: Record<string, any>;
  telemetry?: Record<string, any>;
}

export interface SecurityMetrics {
  threatLevel: SecurityThreatLevel;
  blockedAttacks24h: number;
  complianceScore: number;
  vulnerabilityScore: number;
  devicesQuarantined: number;
  securityEvents: number;
  encryptedConnections: number;
  failedLogins: number;
}

export interface EdgeNode {
  node_id: string;
  name: string;
  status: 'active' | 'inactive';
  connected_devices: number;
  latency: number;
  location: string;
  processing_capacity: number;
  storage_used: number;
  storage_total: number;
  last_sync: string;
}

// IoT Platform service
class IoTService {
  private BASE_PATH = '/api/v1/iot';

  /**
   * Get health check from IoT service
   */
  async getHealthStatus(): Promise<any> {
    return apiClient.get('/health');
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      // In a real implementation, we'd call the actual endpoint
      // return apiClient.get(`${this.BASE_PATH}/security/metrics`);
      
      // Simulated data based on frontend content
      return {
        threatLevel: SecurityThreatLevel.LOW,
        blockedAttacks24h: 247,
        complianceScore: 98.7,
        vulnerabilityScore: 92.4,
        devicesQuarantined: 3,
        securityEvents: 156,
        encryptedConnections: 1847,
        failedLogins: 12
      };
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      throw error;
    }
  }

  /**
   * Get all connected devices
   */
  async getDevices(): Promise<IoTDevice[]> {
    try {
      // In a real implementation:
      // return apiClient.get(`${this.BASE_PATH}/devices`);
      
      // Simulated data
      return [
        {
          device_id: 'd-001',
          name: 'Temperature Sensor A1',
          type: 'sensor',
          firmware_version: '2.3.1',
          status: DeviceStatus.ONLINE,
          last_seen: new Date().toISOString(),
          security_score: 92,
          location: 'Building A - Floor 1',
          metadata: {
            manufacturer: 'IoTech',
            model: 'TS-2000',
            installation_date: '2024-01-15'
          },
          telemetry: {
            temperature: 23.5,
            humidity: 45,
            battery: 87
          }
        },
        {
          device_id: 'd-002',
          name: 'Smart Lock B12',
          type: 'access_control',
          firmware_version: '1.8.4',
          status: DeviceStatus.ONLINE,
          last_seen: new Date().toISOString(),
          security_score: 97,
          location: 'Building B - Floor 2',
          metadata: {
            manufacturer: 'SecureTech',
            model: 'SL-500',
            installation_date: '2023-11-30'
          }
        },
        {
          device_id: 'd-003',
          name: 'Industrial Controller C5',
          type: 'controller',
          firmware_version: '4.2.0',
          status: DeviceStatus.MAINTENANCE,
          last_seen: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          security_score: 85,
          location: 'Factory Zone C',
          metadata: {
            manufacturer: 'IndustrialSystems',
            model: 'IC-9000',
            installation_date: '2023-05-22'
          }
        },
        {
          device_id: 'd-004',
          name: 'Camera D7',
          type: 'camera',
          firmware_version: '2.1.7',
          status: DeviceStatus.QUARANTINED,
          last_seen: new Date().toISOString(),
          security_score: 65,
          location: 'Parking Lot D',
          metadata: {
            manufacturer: 'SecureVision',
            model: 'SV-Cam-4K',
            installation_date: '2023-08-10'
          }
        },
        {
          device_id: 'd-005',
          name: 'Gateway E1',
          type: 'gateway',
          firmware_version: '3.5.2',
          status: DeviceStatus.ONLINE,
          last_seen: new Date().toISOString(),
          security_score: 94,
          location: 'Network Room E',
          metadata: {
            manufacturer: 'NetConnect',
            model: 'Enterprise-GW',
            installation_date: '2023-03-15'
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching IoT devices:', error);
      throw error;
    }
  }

  /**
   * Get edge computing nodes
   */
  async getEdgeNodes(): Promise<EdgeNode[]> {
    try {
      // In a real implementation:
      // return apiClient.get(`${this.BASE_PATH}/edge/nodes`);
      
      // Simulated data
      return [
        {
          node_id: 'edge-001',
          name: 'Edge Node Alpha',
          status: 'active',
          connected_devices: 24,
          latency: 3.2,
          location: 'Building A',
          processing_capacity: 75,
          storage_used: 128,
          storage_total: 512,
          last_sync: new Date().toISOString()
        },
        {
          node_id: 'edge-002',
          name: 'Edge Node Beta',
          status: 'active',
          connected_devices: 18,
          latency: 2.8,
          location: 'Building B',
          processing_capacity: 82,
          storage_used: 210,
          storage_total: 512,
          last_sync: new Date().toISOString()
        },
        {
          node_id: 'edge-003',
          name: 'Edge Node Gamma',
          status: 'inactive',
          connected_devices: 0,
          latency: 0,
          location: 'Factory Zone C',
          processing_capacity: 0,
          storage_used: 45,
          storage_total: 256,
          last_sync: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
    } catch (error) {
      console.error('Error fetching edge nodes:', error);
      throw error;
    }
  }

  /**
   * Quarantine a device
   */
  async quarantineDevice(deviceId: string): Promise<any> {
    try {
      return apiClient.post(`${this.BASE_PATH}/devices/${deviceId}/quarantine`);
    } catch (error) {
      console.error(`Error quarantining device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Update device firmware
   */
  async updateDeviceFirmware(deviceId: string, version: string): Promise<any> {
    try {
      return apiClient.post(`${this.BASE_PATH}/devices/${deviceId}/firmware`, {
        version: version
      });
    } catch (error) {
      console.error(`Error updating firmware for device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get device telemetry history
   */
  async getDeviceTelemetry(deviceId: string, timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<any> {
    try {
      return apiClient.get(`${this.BASE_PATH}/devices/${deviceId}/telemetry?timeframe=${timeframe}`);
    } catch (error) {
      console.error(`Error fetching telemetry for device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Get security audit logs
   */
  async getSecurityAuditLogs(limit: number = 100, offset: number = 0): Promise<any> {
    try {
      return apiClient.get(`${this.BASE_PATH}/security/audit?limit=${limit}&offset=${offset}`);
    } catch (error) {
      console.error('Error fetching security audit logs:', error);
      throw error;
    }
  }

  /**
   * Run security vulnerability scan on device
   */
  async runVulnerabilityScan(deviceId: string): Promise<any> {
    try {
      return apiClient.post(`${this.BASE_PATH}/security/scan`, {
        device_id: deviceId
      });
    } catch (error) {
      console.error(`Error running vulnerability scan for device ${deviceId}:`, error);
      throw error;
    }
  }
}

export const iotService = new IoTService();