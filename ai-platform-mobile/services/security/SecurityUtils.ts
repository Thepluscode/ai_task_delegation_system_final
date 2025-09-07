/**
 * SecurityUtils - Enterprise-grade security utilities for the AutomatedAI Platform
 * 
 * This module provides centralized security-related utilities, helpers, and functions
 * that enforce consistent security controls across the application.
 */

import { SecurityClassification } from '../hooks/useWebSocket';
import colors from '../../design-system/foundations/colors';

/**
 * Maps a security classification to its color representation
 * @param classification - The security classification level
 * @param opacity - Optional opacity value (0-1)
 * @returns Color string with optional opacity
 */
export const getSecurityClassificationColor = (
  classification: SecurityClassification,
  opacity: number = 1
): string => {
  const colorUtils = {
    withOpacity: (color: string, opacity: number): string => {
      // Simple opacity addition for hex colors
      if (opacity === 1) return color;
      return color + Math.round(opacity * 255).toString(16).padStart(2, '0');
    }
  };

  switch (classification) {
    case SecurityClassification.PUBLIC:
      return colorUtils.withOpacity(colors.palette.success[500], opacity);
    case SecurityClassification.INTERNAL:
      return colorUtils.withOpacity(colors.palette.primary[500], opacity);
    case SecurityClassification.CONFIDENTIAL:
      return colorUtils.withOpacity(colors.palette.warning[500], opacity);
    case SecurityClassification.RESTRICTED:
      return colorUtils.withOpacity(colors.palette.error[600], opacity);
    case SecurityClassification.TOP_SECRET:
      return colorUtils.withOpacity(colors.palette.error[800], opacity);
    default:
      return colorUtils.withOpacity(colors.palette.neutral[500], opacity);
  }
};

/**
 * Returns a human-readable label for a security classification
 * @param classification - The security classification level
 * @returns User-friendly label
 */
export const getSecurityClassificationLabel = (classification: SecurityClassification): string => {
  switch (classification) {
    case SecurityClassification.PUBLIC:
      return 'Public';
    case SecurityClassification.INTERNAL:
      return 'Internal';
    case SecurityClassification.CONFIDENTIAL:
      return 'Confidential';
    case SecurityClassification.RESTRICTED:
      return 'Restricted';
    case SecurityClassification.TOP_SECRET:
      return 'Top Secret';
    default:
      return 'Unknown';
  }
};

/**
 * Determines if a user has appropriate clearance for a specified classification level
 * @param userClearance - The user's security clearance level
 * @param requiredClearance - The required security clearance level
 * @returns Boolean indicating if user has appropriate clearance
 */
export const hasSecurityClearance = (
  userClearance: SecurityClassification,
  requiredClearance: SecurityClassification
): boolean => {
  const clearanceLevels = {
    [SecurityClassification.PUBLIC]: 0,
    [SecurityClassification.INTERNAL]: 1,
    [SecurityClassification.CONFIDENTIAL]: 2,
    [SecurityClassification.RESTRICTED]: 3,
    [SecurityClassification.TOP_SECRET]: 4
  };

  return clearanceLevels[userClearance] >= clearanceLevels[requiredClearance];
};

/**
 * Calculates a security score color based on the numeric score
 * @param score - Numeric security score (0-100)
 * @returns Color string
 */
export const getSecurityScoreColor = (score: number): string => {
  if (score >= 90) return colors.palette.success[500];
  if (score >= 80) return colors.palette.success[600];
  if (score >= 70) return colors.palette.warning[500];
  if (score >= 60) return colors.palette.warning[600];
  return colors.palette.error[500];
};

/**
 * Returns a list of common compliance frameworks with descriptions
 * @returns Array of compliance framework objects
 */
export const getComplianceFrameworks = () => [
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information security management standard',
    category: 'security',
  },
  {
    id: 'iec62443',
    name: 'IEC 62443',
    description: 'Industrial network and system security',
    category: 'security',
  },
  {
    id: 'nist_csf',
    name: 'NIST CSF',
    description: 'Cybersecurity Framework by NIST',
    category: 'security',
  },
  {
    id: 'soc2',
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    category: 'security',
  },
  {
    id: 'hipaa',
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    category: 'privacy',
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    category: 'privacy',
  },
  {
    id: 'pci_dss',
    name: 'PCI-DSS',
    description: 'Payment Card Industry Data Security Standard',
    category: 'industry',
  }
];

/**
 * Security-related event types for monitoring
 */
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  DATA_ACCESS = 'data_access',
  CONFIGURATION_CHANGE = 'configuration_change',
  PERMISSION_CHANGE = 'permission_change',
  SYSTEM_ERROR = 'system_error',
  SECURITY_ALERT = 'security_alert',
}

/**
 * Security event severity levels
 */
export enum SecurityEventSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Interface for security audit events
 */
export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  source: string;
  actor: string;
  details: string;
  resource?: string;
  securityClassification?: SecurityClassification;
}