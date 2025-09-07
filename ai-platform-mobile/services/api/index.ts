// Export all API services for easy importing throughout the app
export * from './apiClient';
export * from './authService';
export * from './healthcareService';
export * from './iotService';
export * from './agentService';
export * from './workflowService';
export * from './dashboardService';
export * from './notificationService';

// Re-export default instances
import apiClient from './apiClient';
import { authService } from './authService';
import { healthcareService } from './healthcareService';
import { iotService } from './iotService';
import { agentService } from './agentService';

export {
  apiClient,
  authService,
  healthcareService,
  iotService,
  agentService,
};