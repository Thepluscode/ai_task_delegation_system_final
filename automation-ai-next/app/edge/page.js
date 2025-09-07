'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { EdgePerformanceDashboard } from '@/components/edge/EdgePerformanceDashboard'
import { EdgeTaskProcessor } from '@/components/edge/EdgeTaskProcessor'
import { EdgeVisionProcessor } from '@/components/edge/EdgeVisionProcessor'
import {
  BoltIcon,
  CpuChipIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  ServerIcon,
  CloudIcon,
  CameraIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useEdgeSystemStatus, useLocalAgents, useEdgeConfig } from '@/lib/hooks/useEdge'
import { TaskPriority } from '@/types/edge'

export default function EdgeComputingPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const { systemStatus, isLoading: statusLoading, error: statusError } = useEdgeSystemStatus()
  const { agents, isLoading: agentsLoading } = useLocalAgents()
  const { config } = useEdgeConfig()

  const getSystemStatusColor = (status) => {
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

  const getSystemStatusIcon = (status) => {
    const iconProps = { className: "w-6 h-6" }
    
    switch (status) {
      case 'online':
        return <BoltIcon {...iconProps} className="text-success-500" />
      case 'degraded':
        return <ExclamationTriangleIcon {...iconProps} className="text-warning-500" />
      case 'offline':
        return <ServerIcon {...iconProps} className="text-error-500" />
      default:
        return <ClockIcon {...iconProps} className="text-gray-500" />
    }
  }

  const tabs = [
    {
      id: 'dashboard',
      label: 'Performance Dashboard',
      icon: ChartBarIcon,
      content: <EdgePerformanceDashboard />
    },
    {
      id: 'processor',
      label: 'Task Processor',
      icon: CpuChipIcon,
      content: <EdgeTaskProcessor />
    },
    {
      id: 'vision',
      label: 'Vision Processor',
      icon: CameraIcon,
      content: <EdgeVisionProcessor />
    },
    {
      id: 'agents',
      label: 'Local Agents',
      icon: ServerIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Local Agent Fleet ({agents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No local agents registered yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.agent_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            agent.status === 'available' ? 'bg-success-500' :
                            agent.status === 'busy' ? 'bg-warning-500' :
                            'bg-error-500'
                          }`} />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {agent.agent_id}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {agent.agent_type} • {agent.location}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={agent.status === 'available' ? 'success' : 
                                   agent.status === 'busy' ? 'warning' : 'error'}
                            size="sm"
                          >
                            {agent.status}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Load: {(agent.current_load * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(agent.capabilities).map(([capability, proficiency]) => (
                          <div key={capability} className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {capability.replace('_', ' ')}
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {(proficiency * 100).toFixed(0)}%
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Current Load</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {(agent.current_load * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              agent.current_load < 0.5 ? 'bg-success-500' :
                              agent.current_load < 0.8 ? 'bg-warning-500' :
                              'bg-error-500'
                            }`}
                            style={{ width: `${agent.current_load * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: Cog6ToothIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edge Computing Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="space-y-6">
                  {/* Performance Targets */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Response Time Targets
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(config.performance_targets || {}).map(([priority, target]) => (
                        <div key={priority} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">
                            {priority.replace('_', ' ')}
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {target}ms
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cache Settings */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Cache Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cache Size</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {config.cache_size?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">TTL</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          30s
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Model Settings */}
                  {config.model_settings && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        ML Model Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Confidence Threshold
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(config.model_settings.confidence_threshold * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Retrain Interval
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {config.model_settings.retrain_interval}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cloud Fallback */}
                  {config.cloud_fallback && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Cloud Fallback Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Enabled
                          </span>
                          <Badge variant={config.cloud_fallback.enabled ? 'success' : 'error'} size="sm">
                            {config.cloud_fallback.enabled ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Timeout
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {config.cloud_fallback.timeout_ms}ms
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Retry Attempts
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {config.cloud_fallback.retry_attempts}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Configuration not available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }
  ]

  if (statusError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edge Computing Service
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sub-10ms real-time decision engine
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Service Connection Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to connect to the Edge Computing Service. Please ensure the service is running on port 8008.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
            {systemStatus && getSystemStatusIcon(systemStatus.service_status)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edge Computing Service
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                Sub-10ms real-time decision engine
              </p>
              {systemStatus && (
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={systemStatus.service_status === 'online' ? 'success' : 
                            systemStatus.service_status === 'degraded' ? 'warning' : 'error'}
                    size="sm"
                  >
                    {systemStatus.service_status?.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant={systemStatus.cloud_connectivity ? 'success' : 'error'}
                    size="sm"
                  >
                    <CloudIcon className="w-3 h-3 mr-1" />
                    {systemStatus.cloud_connectivity ? 'Cloud Online' : 'Offline Mode'}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary-600">
                {systemStatus.avg_response_time?.toFixed(1) || '0.0'}ms
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-success-600">
                {systemStatus.requests_per_second?.toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Requests/Second</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-warning-600">
                {systemStatus.local_agents_count || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Local Agents</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-error-600">
                {((systemStatus.error_rate || 0) * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
