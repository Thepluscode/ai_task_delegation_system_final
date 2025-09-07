'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  BoltIcon,
  CloudIcon,
  CpuChipIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ServerIcon,
  WifiIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline'
import {
  useEdgeComputingService,
  useAgentManagement,
  usePerformanceMonitoring,
  useTaskRouting,
  useEdgeRealTimeUpdates
} from '@/lib/hooks/useEdgeComputing'
import { edgeComputingApi } from '@/lib/api/edgeComputing'
import { TaskPriority, AgentStatus, EdgeDecisionType } from '@/types/edge-computing'
import { VisionProcessing } from './VisionProcessing'
import toast from 'react-hot-toast'

export function EdgeComputingDashboard() {
  const { 
    serviceInfo, 
    healthStatus, 
    loading: serviceLoading, 
    checkServiceHealth, 
    isOnline,
    cloudConnected 
  } = useEdgeComputingService()
  
  const { 
    agents, 
    totalAgents, 
    availableAgents, 
    getAgentUtilization 
  } = useAgentManagement()
  
  const { 
    performanceData, 
    cacheStats, 
    clearCache, 
    getOverallCompliance,
    getAverageResponseTime 
  } = usePerformanceMonitoring()
  
  const { 
    routeTaskWithPriority, 
    recentDecisions 
  } = useTaskRouting()
  
  const { 
    latestData, 
    connected: wsConnected 
  } = useEdgeRealTimeUpdates()

  const [selectedTab, setSelectedTab] = useState('overview')
  const [showVisionProcessing, setShowVisionProcessing] = useState(false)

  const getServiceStatusIcon = () => {
    if (serviceLoading) return <ArrowPathIcon className="w-5 h-5 animate-spin text-blue-500" />
    if (isOnline) return <CheckCircleIcon className="w-5 h-5 text-success-500" />
    return <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />
  }

  const getCloudStatusIcon = () => {
    if (cloudConnected) return <CloudIcon className="w-5 h-5 text-blue-500" />
    return <NoSymbolIcon className="w-5 h-5 text-gray-400" />
  }

  const handleTestTask = async (priority) => {
    const taskTypes = ['data_processing', 'fraud_detection', 'monitoring', 'analysis']
    const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)]
    
    await routeTaskWithPriority(taskType, priority, {
      complexity: Math.floor(Math.random() * 10) + 1,
      test_task: true
    })
  }

  const overallCompliance = getOverallCompliance()
  const avgResponseTime = getAverageResponseTime()
  const agentUtilization = getAgentUtilization()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edge Computing Dashboard
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              Sub-10ms real-time decision engine
            </p>
            <div className="flex items-center space-x-2">
              {getServiceStatusIcon()}
              <Badge variant={isOnline ? 'success' : 'error'} size="sm">
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
              {getCloudStatusIcon()}
              <Badge variant={cloudConnected ? 'primary' : 'outline'} size="sm">
                {cloudConnected ? 'Cloud Connected' : 'Local Only'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setShowVisionProcessing(!showVisionProcessing)}
            className="flex items-center space-x-2"
          >
            <CpuChipIcon className="w-4 h-4" />
            <span>{showVisionProcessing ? 'Hide Vision' : 'Show Vision'}</span>
          </Button>

          <Button
            variant="outline"
            onClick={checkServiceHealth}
            disabled={serviceLoading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Service Status */}
      {serviceInfo && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getServiceStatusIcon()}
                  <span className="font-medium text-gray-900 dark:text-white">
                    Edge Computing Service
                  </span>
                </div>
                <Badge variant="outline" size="sm">
                  v{serviceInfo.version}
                </Badge>
                <Badge variant="primary" size="sm">
                  {serviceInfo.features.length} Features
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <ServerIcon className="w-4 h-4" />
                  <span>{totalAgents} Agents</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CpuChipIcon className="w-4 h-4" />
                  <span>{cacheStats?.cache_size || 0} Cached</span>
                </div>
                <div className="flex items-center space-x-1">
                  <WifiIcon className="w-4 h-4" />
                  <span>{wsConnected ? 'Live' : 'Disconnected'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Computer Vision Processing */}
      {showVisionProcessing && (
        <VisionProcessing />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Response Time
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {edgeComputingApi.formatResponseTime(avgResponseTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Target Compliance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallCompliance.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <ServerIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Available Agents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {availableAgents}/{totalAgents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <CpuChipIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cache Hit Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cacheStats ? `${cacheStats.utilization.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Targets by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TaskPriority).map(([key, priority]) => {
              const targetTime = edgeComputingApi.RESPONSE_TARGETS?.[priority] || 0
              const stats = performanceData?.performance_by_priority?.[priority]
              const actualTime = stats?.avg_response_time || 0
              const compliance = stats?.target_met_percentage || 0
              
              return (
                <div key={priority} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="outline" 
                      size="sm"
                      style={{ color: edgeComputingApi.getPriorityColor(priority) }}
                    >
                      {edgeComputingApi.formatPriority(priority)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Target: {edgeComputingApi.formatResponseTime(targetTime)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Actual:</span>
                      <span className="font-medium">
                        {edgeComputingApi.formatResponseTime(actualTime)}
                      </span>
                    </div>
                    
                    <Progress 
                      value={compliance} 
                      className="h-2"
                      style={{ 
                        '--progress-color': compliance >= 90 ? '#10B981' : compliance >= 80 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Compliance:</span>
                      <span className={`font-medium ${compliance >= 90 ? 'text-green-600' : compliance >= 80 ? 'text-orange-600' : 'text-red-600'}`}>
                        {compliance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestTask(priority)}
                    className="w-full mt-3 text-xs"
                  >
                    Test {edgeComputingApi.formatPriority(priority)}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Agent Status and Recent Decisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Local Agents</CardTitle>
              <Badge variant="outline" size="sm">
                {edgeComputingApi.formatLoadPercentage(agentUtilization)} Avg Load
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {agents.map((agent) => (
                <div key={agent.agent_id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: edgeComputingApi.getAgentStatusColor(agent.status) }}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agent.agent_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {edgeComputingApi.formatAgentStatus(agent.status)} • {agent.agent_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {edgeComputingApi.formatLoadPercentage(agent.current_load)}
                    </p>
                    <Progress 
                      value={agent.current_load * 100} 
                      className="h-1 w-16"
                    />
                  </div>
                </div>
              ))}
              
              {agents.length === 0 && (
                <div className="text-center py-8">
                  <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No agents registered
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentDecisions.slice(0, 10).map((decision) => (
                <div key={decision.task_id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="outline" 
                      size="sm"
                      style={{ color: edgeComputingApi.getDecisionTypeColor(decision.decision_type) }}
                    >
                      {edgeComputingApi.formatDecisionType(decision.decision_type)}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {edgeComputingApi.formatResponseTime(decision.processing_time_ms)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      → {decision.assigned_agent_id}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      Confidence: {(decision.confidence * 100).toFixed(1)}%
                      {decision.cached && <span className="ml-2 text-green-600">• Cached</span>}
                    </p>
                  </div>
                </div>
              ))}
              
              {recentDecisions.length === 0 && (
                <div className="text-center py-8">
                  <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No recent decisions
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management */}
      {cacheStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Decision Cache</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCache}
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Clear Cache</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Cache Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cacheStats.cache_size.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  of {cacheStats.max_size.toLocaleString()} max
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Utilization</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cacheStats.utilization.toFixed(1)}%
                </p>
                <Progress value={cacheStats.utilization} className="h-2 mt-2" />
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Performance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {edgeComputingApi.getPerformanceRating(overallCompliance)}
                </p>
                <p className="text-xs text-gray-500">
                  Based on compliance rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
