/**
 * Security Components - Reusable security-related UI components
 * 
 * This file contains enterprise-grade security UI components that can be used
 * across the application to maintain consistent security visualization and controls.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { Shield, Lock, AlertTriangle, FileText, CheckCircle, XCircle } from 'lucide-react-native';
import colors from '../../design-system/foundations/colors';
import { SecurityClassification } from '../../services/hooks/useWebSocket';
import { getSecurityClassificationColor, getSecurityClassificationLabel } from '../../services/security/SecurityUtils';

// Props for security classification badge
interface SecurityBadgeProps {
  classification: SecurityClassification;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onPress?: () => void;
}

/**
 * SecurityBadge - Displays a badge with security classification
 */
export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ 
  classification, 
  size = 'md', 
  showIcon = true,
  onPress
}) => {
  const backgroundColor = getSecurityClassificationColor(classification, 0.9);
  
  const sizeStyles = {
    sm: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    md: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    lg: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }
  };
  
  const textStyles = {
    sm: { fontSize: 10 },
    md: { fontSize: 12 },
    lg: { fontSize: 14 }
  };
  
  const iconSize = {
    sm: 10,
    md: 12,
    lg: 16
  };
  
  const Badge = () => (
    <View style={[
      styles.securityBadge,
      sizeStyles[size],
      { backgroundColor }
    ]}>
      {showIcon && <Shield size={iconSize[size]} color="#fff" />}
      <Text style={[styles.securityBadgeText, textStyles[size]]}>
        {getSecurityClassificationLabel(classification)}
      </Text>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Badge />
      </TouchableOpacity>
    );
  }
  
  return <Badge />;
};

// Props for security score display
interface SecurityScoreProps {
  score: number;
  size?: number;
  showLabel?: boolean;
  label?: string;
}

/**
 * SecurityScore - Displays a security score with color coding
 */
export const SecurityScore: React.FC<SecurityScoreProps> = ({ 
  score, 
  size = 40, 
  showLabel = true,
  label = 'Security Score'
}) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.palette.success[500];
    if (score >= 80) return colors.palette.success[600];
    if (score >= 70) return colors.palette.warning[500];
    if (score >= 60) return colors.palette.warning[600];
    return colors.palette.error[500];
  };
  
  // Get the appropriate label based on score
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Acceptable';
    if (score >= 60) return 'Needs Improvement';
    return 'At Risk';
  };
  
  const color = getScoreColor(score);
  const scoreValue = typeof score === 'number' ? Math.round(score) : 0;
  
  return (
    <View style={styles.securityScoreContainer}>
      <View style={[
        styles.securityScoreCircle, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderColor: color 
        }
      ]}>
        <Text style={[styles.securityScoreValue, { color, fontSize: size / 3 }]}>
          {scoreValue}
        </Text>
      </View>
      
      {showLabel && (
        <View style={styles.securityScoreLabels}>
          <Text style={styles.securityScoreTitle}>{label}</Text>
          <Text style={[styles.securityScoreRating, { color }]}>
            {getScoreLabel(scoreValue)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Props for compliance badge
interface ComplianceBadgeProps {
  standard: string;
  status: 'compliant' | 'non_compliant' | 'in_progress';
  score?: number;
  onPress?: () => void;
}

/**
 * ComplianceBadge - Displays compliance framework status
 */
export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ 
  standard, 
  status,
  score,
  onPress
}) => {
  // Determine color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return colors.palette.success[500];
      case 'in_progress': return colors.palette.warning[500];
      case 'non_compliant': return colors.palette.error[500];
      default: return colors.palette.neutral[500];
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle size={14} color={getStatusColor(status)} />;
      case 'in_progress': return <AlertTriangle size={14} color={getStatusColor(status)} />;
      case 'non_compliant': return <XCircle size={14} color={getStatusColor(status)} />;
      default: return <FileText size={14} color={getStatusColor(status)} />;
    }
  };
  
  const Badge = () => (
    <View style={styles.complianceBadge}>
      <View style={styles.complianceBadgeHeader}>
        <Text style={styles.complianceBadgeName}>{standard}</Text>
        {score !== undefined && (
          <Text style={[
            styles.complianceBadgeScore,
            { color: getStatusColor(status) }
          ]}>
            {score}%
          </Text>
        )}
      </View>
      <View style={styles.complianceBadgeStatus}>
        {getStatusIcon(status)}
        <Text style={[
          styles.complianceBadgeStatusText,
          { color: getStatusColor(status) }
        ]}>
          {status === 'compliant' ? 'Compliant' : 
           status === 'in_progress' ? 'In Progress' : 'Non-Compliant'}
        </Text>
      </View>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Badge />
      </TouchableOpacity>
    );
  }
  
  return <Badge />;
};

// Props for security confirmation dialog
interface SecurityConfirmationProps {
  visible: boolean;
  title: string;
  message: string;
  classification?: SecurityClassification;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

/**
 * SecurityConfirmation - Dialog for confirming security-sensitive actions
 */
export const SecurityConfirmation: React.FC<SecurityConfirmationProps> = ({
  visible,
  title,
  message,
  classification = SecurityClassification.INTERNAL,
  onCancel,
  onConfirm,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel'
}) => {
  const classificationColor = getSecurityClassificationColor(classification);
  
  // For native platforms, use the built-in Alert
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    React.useEffect(() => {
      if (visible) {
        const classificationLabel = getSecurityClassificationLabel(classification);
        const titleWithClass = `[${classificationLabel}] ${title}`;
        
        Alert.alert(
          titleWithClass,
          message,
          [
            { text: cancelButtonText, style: 'cancel', onPress: onCancel },
            { text: confirmButtonText, style: 'destructive', onPress: onConfirm }
          ]
        );
      }
    }, [visible]);
    
    return null;
  }
  
  // For web, use a modal
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={[styles.modalHeader, { backgroundColor: classificationColor }]}>
            <Shield size={20} color="#fff" />
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalMessage}>{message}</Text>
            
            <View style={styles.securityClassification}>
              <Lock size={14} color={classificationColor} />
              <Text style={[styles.securityClassificationText, { color: classificationColor }]}>
                {getSecurityClassificationLabel(classification)}
              </Text>
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: classificationColor }]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmButtonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Props for security alert component
interface SecurityAlertProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp?: string;
  onPress?: () => void;
}

/**
 * SecurityAlert - Displays a security alert or notification
 */
export const SecurityAlert: React.FC<SecurityAlertProps> = ({
  severity,
  message,
  timestamp,
  onPress
}) => {
  // Get color based on severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return colors.palette.primary[500];
      case 'medium': return colors.palette.warning[500];
      case 'high': return colors.palette.error[600];
      case 'critical': return colors.palette.error[800];
      default: return colors.palette.neutral[500];
    }
  };
  
  const color = getSeverityColor(severity);
  
  const Alert = () => (
    <View style={[styles.securityAlert, { borderLeftColor: color }]}>
      <View style={styles.securityAlertContent}>
        <View style={styles.securityAlertHeader}>
          <AlertTriangle size={16} color={color} />
          <Text style={[styles.securityAlertSeverity, { color }]}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </Text>
        </View>
        
        <Text style={styles.securityAlertMessage}>{message}</Text>
        
        {timestamp && (
          <Text style={styles.securityAlertTimestamp}>
            {new Date(timestamp).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <Alert />
      </TouchableOpacity>
    );
  }
  
  return <Alert />;
};

const styles = StyleSheet.create({
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.palette.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  securityBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  securityScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityScoreCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.palette.success[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityScoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.palette.success[500],
  },
  securityScoreLabels: {
    marginLeft: 12,
  },
  securityScoreTitle: {
    fontSize: 12,
    color: colors.palette.neutral[600],
  },
  securityScoreRating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.palette.success[500],
  },
  complianceBadge: {
    backgroundColor: colors.palette.neutral[50],
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  complianceBadgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  complianceBadgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.palette.neutral[800],
  },
  complianceBadgeScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.palette.success[500],
  },
  complianceBadgeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  complianceBadgeStatusText: {
    fontSize: 12,
    color: colors.palette.success[500],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
  },
  modalHeader: {
    backgroundColor: colors.palette.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalBody: {
    padding: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.palette.neutral[800],
    marginBottom: 16,
  },
  securityClassification: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  securityClassificationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.palette.primary[500],
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.palette.neutral[200],
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.palette.neutral[200],
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.palette.neutral[700],
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: colors.palette.primary[500],
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  securityAlert: {
    flexDirection: 'row',
    backgroundColor: colors.palette.neutral[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.palette.primary[500],
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  securityAlertContent: {
    padding: 12,
    flex: 1,
  },
  securityAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  securityAlertSeverity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.palette.primary[500],
  },
  securityAlertMessage: {
    fontSize: 14,
    color: colors.palette.neutral[800],
    marginBottom: 4,
  },
  securityAlertTimestamp: {
    fontSize: 12,
    color: colors.palette.neutral[500],
  },
});