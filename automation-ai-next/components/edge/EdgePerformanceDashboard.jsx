'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BoltIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CloudIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import { 
  useEdgeSystemStatus, 
  useEdgePerformance, 
  useRealTimePerformance,
  useCacheStatistics,
  useDecisionMetrics 
} from '@/lib/hooks/useEdge'
import { TaskPriority, EdgeDecisionType } from '@/types/edge'
import { formatNumber, formatPercentage } from '@/lib/utils/helpers'

export function EdgePerformanceDashboard() {
  const { systemStatus, isLoading: statusLoading, mutate: mutateStatus } = useEdgeSystemStatus()
  const { performanceStats, isLoading: perfLoading } = useEdgePerformance()
  const { performanceData, isConnected } = useRealTimePerformance()
  const { cacheStats } = useCacheStatistics()
  const { decisionMetrics } = useDecisionMetrics()

  const [alertsVisible, setAlertsVisible] = useState(true)

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success-500'
      case 'degraded':
        return 'text-warning-500'
      case 'offline':
        return 'text-error-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status) => {
    const iconProps = { className: "w-5 h-5" }
    
    switch (status) {
      case 'online':
        return <CheckCircleIcon {...iconProps} className="text-success-500" />
      case 'degraded':
        return <ExclamationTriangleIcon {...iconProps} className="text-warning-500" />
      case 'offline':
        return <XCircleIcon {...iconProps} className="text-error-500" />
      default:
        return <ClockIcon {...iconProps} className="text-gray-500" />
    }
  }

  const getResponseTimeStatus = (priority, avgTime) => {
    const targets = {
      [TaskPriority.SAFETY_CRITICAL]: 1,
      [TaskPriority.QUALITY_CRITICAL]: 10,
      [TaskPriority.EFFICIENCY_CRITICAL]: 100,
      [TaskPriority.STANDARD]: 500
    }
    
    const target = targets[priority]
    if (!target) return 'unknown'
    
    if (avgTime <= target) return 'excellent'
    if (avgTime <= target * 1.5) return 'good'
    if (avgTime <= target * 2) return 'warning'
    return 'critical'
  }

  const getComplianceColor = (percentage) => {
    if (percentage >= 95) return 'text-success-600'
    if (percentage >= 85) return 'text-warning-600'
    return 'text-error-600'
  }

  const currentData = performanceData || performanceStats

  if (statusLoading || perfLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <BoltIcon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <CardTitle>Edge Computing Service</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {systemStatus && getStatusIcon(systemStatus.service_status)}
                  <span className={`text-sm font-medium ${getStatusColor(systemStatus?.service_status)}`}>
                    {systemStatus?.service_status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <Badge variant={isConnected ? 'success' : 'error'} size="sm">
                    {isConnected ? 'Real-time' : 'Polling'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutateStatus()}
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                <ClockIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemStatus?.avg_response_time?.toFixed(1) || '0.0'}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100 dark:bg-success-900/20">
                <ChartBarIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Requests/Second
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(systemStatus?.requests_per_second || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100 dark:bg-warning-900/20">
                <CpuChipIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cache Hit Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(cacheStats?.hit_rate || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${
                systemStatus?.cloud_connectivity 
                  ? 'bg-success-100 dark:bg-success-900/20' 
                  : 'bg-error-100 dark:bg-error-900/20'
              }`}>
                <CloudIcon className={`h-6 w-6 ${
                  systemStatus?.cloud_connectivity ? 'text-success-600' : 'text-error-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cloud Status
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemStatus?.cloud_connectivity ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Compliance by Priority */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Compliance by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentData && Object.entries(currentData).map(([priority, stats]) => {
              const target = {
                'safety_critical': 1,
                'quality_critical': 10,
                'efficiency_critical': 100,
                'standard': 500
              }[priority]
              
              return (
                <div key={priority} className="flex items-center space-x-4">
                  <div className="w-32">
                    <Badge 
                      variant={priority === 'safety_critical' ? 'error' : 
                              priority === 'quality_critical' ? 'warning' : 
                              priority === 'efficiency_critical' ? 'primary' : 'secondary'}
                      size="sm"
                    >
                      {priority.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Target: {target}ms | Avg: {stats.avg_response_time?.toFixed(1)}ms
                      </span>
                      <span className={`text-sm font-medium ${getComplianceColor(stats.target_met_percentage)}`}>
                        {stats.target_met_percentage?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stats.target_met_percentage >= 95 ? 'bg-success-500' :
                          stats.target_met_percentage >= 85 ? 'bg-warning-500' :
                          'bg-error-500'
                        }`}
                        style={{ width: `${Math.min(stats.target_met_percentage || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="w-20 text-right">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.total_requests || 0} reqs
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Decision Type Distribution */}
      {decisionMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Decision Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(decisionMetrics.decisions_by_type || {}).map(([type, count]) => {
                  const percentage = decisionMetrics.total_decisions > 0 
                    ? (count / decisionMetrics.total_decisions) * 100 
                    : 0
                  
                  const getTypeColor = (decisionType) => {
                    switch (decisionType) {
                      case EdgeDecisionType.CACHED:
                        return 'bg-success-500'
                      case EdgeDecisionType.LIGHTWEIGHT_MODEL:
                        return 'bg-primary-500'
                      case EdgeDecisionType.RULE_BASED:
                        return 'bg-warning-500'
                      case EdgeDecisionType.CLOUD_FALLBACK:
                        return 'bg-purple-500'
                      default:
                        return 'bg-gray-500'
                    }
                  }
                  
                  return (
                    <div key={type} className="flex items-center space-x-3">
                      <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {type.replace('_', ' ')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {count} decisions
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getTypeColor(type)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Local Agents</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {systemStatus?.local_agents_count || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
                  <span className={`font-medium ${
                    (systemStatus?.error_rate || 0) < 0.01 ? 'text-success-600' :
                    (systemStatus?.error_rate || 0) < 0.05 ? 'text-warning-600' :
                    'text-error-600'
                  }`}>
                    {formatPercentage(systemStatus?.error_rate || 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {systemStatus?.uptime_seconds 
                      ? `${Math.floor(systemStatus.uptime_seconds / 3600)}h ${Math.floor((systemStatus.uptime_seconds % 3600) / 60)}m`
                      : '0h 0m'
                    }
                  </span>
                </div>
                
                {cacheStats && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cache Size</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cacheStats.total_entries} / {cacheStats.max_size || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {cacheStats.memory_usage_mb?.toFixed(1) || '0.0'} MB
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Alerts */}
      {alertsVisible && systemStatus && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance Alerts</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertsVisible(false)}
              >
                Dismiss
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.avg_response_time > 50 && (
                <div className="flex items-start space-x-3 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                      High Response Time
                    </p>
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      Average response time is {systemStatus.avg_response_time.toFixed(1)}ms, above optimal threshold.
                    </p>
                  </div>
                </div>
              )}
              
              {!systemStatus.cloud_connectivity && (
                <div className="flex items-start space-x-3 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                  <XCircleIcon className="w-5 h-5 text-error-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-error-800 dark:text-error-200">
                      Cloud Connectivity Lost
                    </p>
                    <p className="text-sm text-error-700 dark:text-error-300">
                      Operating in offline mode. Some features may be limited.
                    </p>
                  </div>
                </div>
              )}
              
              {(cacheStats?.hit_rate || 0) < 0.8 && (
                <div className="flex items-start space-x-3 p-3 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-warning-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                      Low Cache Hit Rate
                    </p>
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      Cache hit rate is {formatPercentage(cacheStats?.hit_rate || 0)}, below optimal 80%.
                    </p>
                  </div>
                </div>
              )}
              
              {(!systemStatus.avg_response_time || systemStatus.avg_response_time <= 10) && 
               systemStatus.cloud_connectivity && 
               (cacheStats?.hit_rate || 0) >= 0.8 && (
                <div className="flex items-start space-x-3 p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-success-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-success-800 dark:text-success-200">
                      System Operating Optimally
                    </p>
                    <p className="text-sm text-success-700 dark:text-success-300">
                      All performance metrics are within optimal ranges.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
