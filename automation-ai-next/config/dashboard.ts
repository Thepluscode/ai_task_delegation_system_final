/**
 * Comprehensive Dashboard Configuration
 * Supports real-time monitoring, analytics, and advanced features
 */

// Dashboard Refresh Intervals (milliseconds)
export const DASHBOARD_REFRESH_INTERVALS = {
  REAL_TIME: 5000,        // 5 seconds for critical metrics
  STANDARD: 30000,        // 30 seconds for general dashboard
  ANALYTICS: 60000,       // 1 minute for analytics data
  HISTORICAL: 300000,     // 5 minutes for historical data
  HEALTH_CHECK: 10000,    // 10 seconds for health monitoring
} as const

// Alert Thresholds
export const ALERT_THRESHOLDS = {
  RESPONSE_TIME: {
    WARNING: 2.0,          // seconds
    CRITICAL: 5.0,         // seconds
  },
  CPU_USAGE: {
    WARNING: 75,           // percentage
    CRITICAL: 90,          // percentage
  },
  MEMORY_USAGE: {
    WARNING: 80,           // percentage
    CRITICAL: 95,          // percentage
  },
  ERROR_RATE: {
    WARNING: 5,            // percentage
    CRITICAL: 15,          // percentage
  },
  QUEUE_SIZE: {
    WARNING: 100,          // tasks
    CRITICAL: 500,         // tasks
  },
  PROCESSING_TIME: {
    WARNING: 120,          // seconds
    CRITICAL: 300,         // seconds
  },
  SUCCESS_RATE: {
    WARNING: 90,           // percentage (below this triggers warning)
    CRITICAL: 80,          // percentage (below this triggers critical)
  },
} as const

// Theme Configuration
export const THEME_COLORS = {
  PRIMARY: '#667eea',
  SECONDARY: '#764ba2',
  SUCCESS: '#48bb78',
  WARNING: '#ed8936',
  ERROR: '#f56565',
  INFO: '#4299e1',
  NEUTRAL: '#718096',
  
  // Glassmorphism colors
  GLASS_PRIMARY: 'rgba(102, 126, 234, 0.1)',
  GLASS_SECONDARY: 'rgba(118, 75, 162, 0.1)',
  GLASS_BACKGROUND: 'rgba(255, 255, 255, 0.05)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.1)',
  
  // Chart colors
  CHART_COLORS: [
    '#667eea', '#764ba2', '#48bb78', '#ed8936', 
    '#f56565', '#4299e1', '#9f7aea', '#38b2ac'
  ],
} as const

// Service Endpoints
export const SERVICE_ENDPOINTS = {
  AGENT_SELECTION_SERVICE: process.env.NEXT_PUBLIC_AGENT_SELECTION_URL || 'http://localhost:8001',
  ROBOT_ABSTRACTION_SERVICE: process.env.NEXT_PUBLIC_ROBOT_ABSTRACTION_URL || 'http://localhost:8002',
  WORKFLOW_STATE_SERVICE: process.env.NEXT_PUBLIC_WORKFLOW_STATE_URL || 'http://localhost:8003',
  EDGE_COMPUTING_SERVICE: process.env.NEXT_PUBLIC_EDGE_COMPUTING_URL || 'http://localhost:8008',
  LEARNING_SERVICE: process.env.NEXT_PUBLIC_LEARNING_SERVICE_URL || 'http://localhost:8004',
  BANKING_V1_SERVICE: process.env.NEXT_PUBLIC_BANKING_SERVICE_URL || 'http://localhost:8005',
  BANKING_V2_SERVICE: process.env.NEXT_PUBLIC_BANKING_V2_SERVICE_URL || 'http://localhost:8006',
  DASHBOARD_API: process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:8007',
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8008',
} as const

// Dashboard Sections Configuration
export const DASHBOARD_SECTIONS = {
  SYSTEM_OVERVIEW: {
    id: 'system-overview',
    title: 'System Overview',
    icon: 'ChartBarIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.STANDARD,
    priority: 1,
  },
  AGENT_SELECTION: {
    id: 'agent-selection',
    title: 'Agent Selection',
    icon: 'CpuChipIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.STANDARD,
    priority: 2,
  },
  ROBOT_CONTROL: {
    id: 'robot-control',
    title: 'Robot Control',
    icon: 'RobotIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.REAL_TIME,
    priority: 3,
  },
  WORKFLOW_MANAGEMENT: {
    id: 'workflow-management',
    title: 'Workflow Management',
    icon: 'DocumentTextIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.STANDARD,
    priority: 4,
  },
  EDGE_COMPUTING: {
    id: 'edge-computing',
    title: 'Edge Computing',
    icon: 'BoltIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.REAL_TIME,
    priority: 5,
  },
  BANKING_SERVICE: {
    id: 'banking-service',
    title: 'Banking Service',
    icon: 'BanknotesIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.STANDARD,
    priority: 6,
  },
  LEARNING_ANALYTICS: {
    id: 'learning-analytics',
    title: 'Learning Analytics',
    icon: 'AcademicCapIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.ANALYTICS,
    priority: 7,
  },
  AGENT_PERFORMANCE: {
    id: 'agent-performance',
    title: 'Agent Performance',
    icon: 'UserGroupIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.STANDARD,
    priority: 8,
  },
  TASK_MANAGEMENT: {
    id: 'task-management',
    title: 'Task Management',
    icon: 'ClipboardDocumentListIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.REAL_TIME,
    priority: 9,
  },
  SYSTEM_ALERTS: {
    id: 'system-alerts',
    title: 'System Alerts',
    icon: 'ExclamationTriangleIcon',
    refreshInterval: DASHBOARD_REFRESH_INTERVALS.REAL_TIME,
    priority: 10,
  },
} as const

// Performance Metrics Configuration
export const PERFORMANCE_METRICS = {
  AI_VS_HUMAN: {
    AI_QUALITY_TARGET: 95,        // percentage
    HUMAN_QUALITY_TARGET: 90,     // percentage
    AI_SPEED_TARGET: 15,          // minutes
    HUMAN_SPEED_TARGET: 45,       // minutes
  },
  SYSTEM_HEALTH: {
    UPTIME_TARGET: 99.9,          // percentage
    RESPONSE_TIME_TARGET: 1.0,    // seconds
    THROUGHPUT_TARGET: 1000,      // tasks per hour
  },
  BUSINESS_METRICS: {
    COST_SAVINGS_TARGET: 2000000, // dollars annually
    EFFICIENCY_GAIN_TARGET: 40,   // percentage
    ACCURACY_TARGET: 97,          // percentage
  },
} as const

// Alert Severity Levels
export const ALERT_SEVERITY = {
  CRITICAL: {
    level: 'critical',
    color: THEME_COLORS.ERROR,
    icon: 'ExclamationTriangleIcon',
    priority: 1,
    autoAcknowledge: false,
  },
  WARNING: {
    level: 'warning',
    color: THEME_COLORS.WARNING,
    icon: 'ExclamationTriangleIcon',
    priority: 2,
    autoAcknowledge: false,
  },
  INFO: {
    level: 'info',
    color: THEME_COLORS.INFO,
    icon: 'InformationCircleIcon',
    priority: 3,
    autoAcknowledge: true,
  },
  SUCCESS: {
    level: 'success',
    color: THEME_COLORS.SUCCESS,
    icon: 'CheckCircleIcon',
    priority: 4,
    autoAcknowledge: true,
  },
} as const

// Chart Configuration
export const CHART_CONFIG = {
  DEFAULT_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
  REAL_TIME_OPTIONS: {
    animation: {
      duration: 0, // Disable animation for real-time updates
    },
    scales: {
      x: {
        type: 'realtime' as const,
        realtime: {
          duration: 300000, // 5 minutes
          refresh: 5000,    // 5 seconds
          delay: 1000,      // 1 second
        },
      },
    },
  },
} as const

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 5000,      // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL: 30000,     // 30 seconds
  MESSAGE_TYPES: {
    SYSTEM_HEALTH: 'system_health',
    PERFORMANCE_UPDATE: 'performance_update',
    ALERT: 'alert',
    TASK_UPDATE: 'task_update',
    AGENT_STATUS: 'agent_status',
  },
} as const

// Data Retention Configuration
export const DATA_RETENTION = {
  REAL_TIME_DATA: 3600000,       // 1 hour (milliseconds)
  HOURLY_DATA: 86400000,         // 24 hours
  DAILY_DATA: 2592000000,        // 30 days
  MONTHLY_DATA: 31536000000,     // 1 year
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  REAL_TIME_UPDATES: true,
  WEBSOCKET_ENABLED: true,
  ADVANCED_ANALYTICS: true,
  MOBILE_OPTIMIZED: true,
  DARK_MODE: true,
  EXPORT_FUNCTIONALITY: true,
  CUSTOM_ALERTS: true,
  HISTORICAL_DATA: true,
  PREDICTIVE_ANALYTICS: false,   // Future feature
  MULTI_TENANT: false,           // Future feature
} as const

// Mobile Configuration
export const MOBILE_CONFIG = {
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },
  TOUCH_GESTURES: {
    SWIPE_THRESHOLD: 50,          // pixels
    TAP_TIMEOUT: 300,             // milliseconds
  },
  PERFORMANCE: {
    REDUCED_REFRESH_RATE: 60000,  // 1 minute on mobile
    LAZY_LOADING: true,
    IMAGE_OPTIMIZATION: true,
  },
} as const

// Export Configuration
export const EXPORT_CONFIG = {
  FORMATS: ['PDF', 'CSV', 'JSON', 'XLSX'],
  MAX_RECORDS: 10000,
  COMPRESSION: true,
  INCLUDE_CHARTS: true,
} as const

// Security Configuration
export const SECURITY_CONFIG = {
  CORS_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:8007',
    process.env.NEXT_PUBLIC_FRONTEND_URL,
  ].filter(Boolean),
  REQUEST_TIMEOUT: 30000,        // 30 seconds
  RATE_LIMITING: {
    WINDOW_MS: 900000,           // 15 minutes
    MAX_REQUESTS: 1000,          // per window
  },
  CSRF_PROTECTION: true,
  XSS_PROTECTION: true,
} as const

// Default Dashboard Layout
export const DEFAULT_LAYOUT = {
  GRID_COLUMNS: 12,
  GRID_ROWS: 8,
  WIDGET_MIN_WIDTH: 2,
  WIDGET_MIN_HEIGHT: 2,
  WIDGET_MARGIN: 16,
  RESPONSIVE_BREAKPOINTS: {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
  },
} as const

// Type definitions for configuration
export type DashboardSection = keyof typeof DASHBOARD_SECTIONS
export type AlertSeverity = keyof typeof ALERT_SEVERITY
export type ThemeColor = keyof typeof THEME_COLORS
export type ServiceEndpoint = keyof typeof SERVICE_ENDPOINTS
export type PerformanceMetric = keyof typeof PERFORMANCE_METRICS
export type FeatureFlag = keyof typeof FEATURE_FLAGS
