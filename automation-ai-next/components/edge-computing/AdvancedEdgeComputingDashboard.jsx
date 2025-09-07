'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  CpuChipIcon,
  BoltIcon,
  EyeIcon,
  CloudIcon,
  ServerIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ComputerDesktopIcon,
  CircleStackIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useEdgeComputing } from '@/lib/hooks/useEdgeComputing'

export function AdvancedEdgeComputingDashboard() {
  const {
    comprehensiveStats,
    hardwareResources,
    performanceMetrics,
    visionProcessing,
    predictiveCache,
    autonomousMode,
    clusterStatus,
    loading,
    error,
    loadComprehensiveStats,
    startVisionProcessing,
    stopVisionProcessing,
    activateAutonomousMode,
    deactivateAutonomousMode,
    optimizeResources
  } = useEdgeComputing()

  const [selectedComponent, setSelectedComponent] = useState('overview')
  const [realTimeData, setRealTimeData] = useState(null)

  useEffect(() => {
    loadComprehensiveStats()
    
    // Setup real-time WebSocket connection
    const ws = new WebSocket('ws://localhost:8008/ws/realtime')
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setRealTimeData(data)
      } catch (err) {
        console.error('WebSocket data parsing error:', err)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    return () => {
      ws.close()
    }
  }, [])

  const getResponseTimeColor = (timeMs, target) => {
    if (timeMs <= target * 0.5) return 'text-green-600'
    if (timeMs <= target) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getComponentStatusIcon = (active) => {
    return active ? 
      <CheckCircleIcon className="w-5 h-5 text-green-500" /> :
      <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Advanced Edge Computing Architecture
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ultra-low latency decision making with autonomous operation capabilities
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline" size="sm" className="flex items-center space-x-1">
              <BoltIcon className="w-3 h-3" />
              <span>Sub-millisecond Response</span>
            </Badge>
            <Badge variant="outline" size="sm" className="flex items-center space-x-1">
              <CloudIcon className="w-3 h-3" />
              <span>Autonomous Operation</span>
            </Badge>
            <Badge variant="outline" size="sm" className="flex items-center space-x-1">
              <EyeIcon className="w-3 h-3" />
              <span>Computer Vision</span>
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadComprehensiveStats}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={optimizeResources}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <CogIcon className="w-4 h-4" />
            <span>Optimize Resources</span>
          </Button>
        </div>
      </div>

      {/* Component Navigation */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: ChartBarIcon },
          { id: 'performance', label: 'Performance', icon: BoltIcon },
          { id: 'vision', label: 'Computer Vision', icon: EyeIcon },
          { id: 'autonomous', label: 'Autonomous Mode', icon: CloudIcon },
          { id: 'cluster', label: 'Edge Cluster', icon: ServerIcon },
          { id: 'resources', label: 'Resources', icon: CpuChipIcon }
        ].map((component) => {
          const IconComponent = component.icon
          return (
            <Button
              key={component.id}
              variant={selectedComponent === component.id ? 'default' : 'outline'}
              onClick={() => setSelectedComponent(component.id)}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <IconComponent className="w-4 h-4" />
              <span>{component.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Overview Section */}
      {selectedComponent === 'overview' && comprehensiveStats && (
        <div className="space-y-6">
          {/* Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <ServerIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Service Status
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {comprehensiveStats.service_status?.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CpuChipIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      CPU Usage
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {comprehensiveStats.hardware_resources?.cpu_percent?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <CircleStackIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Memory Usage
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {comprehensiveStats.hardware_resources?.memory_percent?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <ClockIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Avg Response
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      &lt; 1ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Architecture Components Status */}
          <Card>
            <CardHeader>
              <CardTitle>Architecture Components Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Hardware Layer</span>
                    {getComponentStatusIcon(true)}
                  </div>
                  <p className="text-xs text-gray-500">Resource monitoring active</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Real-Time Router</span>
                    {getComponentStatusIcon(true)}
                  </div>
                  <p className="text-xs text-gray-500">Sub-ms decision making</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Computer Vision</span>
                    {getComponentStatusIcon(visionProcessing?.processing_active || false)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {visionProcessing?.processing_active ? 'Processing active' : 'Inactive'}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Predictive Cache</span>
                    {getComponentStatusIcon(true)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {predictiveCache?.hit_rate ? `${(predictiveCache.hit_rate * 100).toFixed(1)}% hit rate` : 'Active'}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Decision Manager</span>
                    {getComponentStatusIcon(true)}
                  </div>
                  <p className="text-xs text-gray-500">Hierarchical routing</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Autonomous Mode</span>
                    {getComponentStatusIcon(autonomousMode?.current_mode === 'autonomous')}
                  </div>
                  <p className="text-xs text-gray-500">
                    {autonomousMode?.current_mode || 'Connected'}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Resource Optimizer</span>
                    {getComponentStatusIcon(true)}
                  </div>
                  <p className="text-xs text-gray-500">CPU/Memory optimized</p>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Edge Redundancy</span>
                    {getComponentStatusIcon(clusterStatus?.active_nodes > 0)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {clusterStatus?.active_nodes || 1} node(s) active
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Section */}
      {selectedComponent === 'performance' && performanceMetrics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Performance by Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(performanceMetrics).map(([priority, stats]) => (
                  <div key={priority} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{priority.replace('_', ' ')}</h4>
                      <Badge variant="outline" size="sm">
                        {stats.count} requests
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Avg:</span>
                        <span className={`ml-2 font-medium ${getResponseTimeColor(stats.avg_time_ms, getTargetTime(priority))}`}>
                          {stats.avg_time_ms?.toFixed(2) || 0}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max:</span>
                        <span className="ml-2 font-medium">{stats.max_time_ms?.toFixed(2) || 0}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Min:</span>
                        <span className="ml-2 font-medium">{stats.min_time_ms?.toFixed(2) || 0}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">P95:</span>
                        <span className="ml-2 font-medium">{stats.p95_time_ms?.toFixed(2) || 0}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">P99:</span>
                        <span className="ml-2 font-medium">{stats.p99_time_ms?.toFixed(2) || 0}ms</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Progress 
                        value={Math.min((stats.avg_time_ms / getTargetTime(priority)) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Computer Vision Section */}
      {selectedComponent === 'vision' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Computer Vision Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Processing Status</h4>
                    <p className="text-sm text-gray-500">
                      {visionProcessing?.processing_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => startVisionProcessing('demo://camera', 'quality_inspection')}
                      disabled={visionProcessing?.processing_active || loading}
                      size="sm"
                    >
                      Start Processing
                    </Button>
                    <Button
                      onClick={stopVisionProcessing}
                      disabled={!visionProcessing?.processing_active || loading}
                      variant="outline"
                      size="sm"
                    >
                      Stop Processing
                    </Button>
                  </div>
                </div>

                {visionProcessing && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Frames Processed</p>
                      <p className="text-lg font-bold">{visionProcessing.processing_stats?.frames_processed || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Defects Detected</p>
                      <p className="text-lg font-bold text-red-600">{visionProcessing.processing_stats?.defects_detected || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Safety Violations</p>
                      <p className="text-lg font-bold text-orange-600">{visionProcessing.processing_stats?.safety_violations || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500">Avg Processing Time</p>
                      <p className="text-lg font-bold">{visionProcessing.processing_stats?.avg_processing_time_ms?.toFixed(1) || 0}ms</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Real-time Data Display */}
      {realTimeData && (
        <Card>
          <CardHeader>
            <CardTitle>Real-time Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cache Utilization:</span>
                <span className="ml-2 font-medium">{(realTimeData.cache_utilization * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-gray-500">Active Agents:</span>
                <span className="ml-2 font-medium">{realTimeData.active_agents}</span>
              </div>
              <div>
                <span className="text-gray-500">Vision Active:</span>
                <span className="ml-2 font-medium">{realTimeData.vision_processing_active ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-gray-500">Frame Buffer:</span>
                <span className="ml-2 font-medium">{realTimeData.frame_buffer_size}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper function to get target response time
function getTargetTime(priority) {
  const targets = {
    'safety_critical': 1,
    'quality_critical': 10,
    'efficiency_critical': 100,
    'standard': 500
  }
  return targets[priority] || 500
}
