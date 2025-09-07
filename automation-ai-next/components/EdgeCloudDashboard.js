import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Cpu, 
  Cloud, 
  Zap, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react'

const EdgeCloudDashboard = () => {
  const [edgeStatus, setEdgeStatus] = useState(null)
  const [agentsStatus, setAgentsStatus] = useState(null)
  const [safetyStatus, setSafetyStatus] = useState(null)
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    edgeLatency: 0,
    cloudLatency: 0,
    edgeDecisions: 0,
    cloudDecisions: 0,
    hybridDecisions: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      const [edgeResponse, agentsResponse, safetyResponse] = await Promise.all([
        fetch('/api/v1/edge/status'),
        fetch('/api/v1/agents/status'),
        fetch('/api/v1/safety/status')
      ])

      const edgeData = await edgeResponse.json()
      const agentsData = await agentsResponse.json()
      const safetyData = await safetyResponse.json()

      setEdgeStatus(edgeData)
      setAgentsStatus(agentsData)
      setSafetyStatus(safetyData)

      // Update real-time metrics
      setRealTimeMetrics(prev => ({
        ...prev,
        edgeLatency: edgeData.performance_metrics?.avg_decision_time_ms || 0,
        cloudLatency: Math.random() * 50 + 30, // Simulated cloud latency
        edgeDecisions: prev.edgeDecisions + Math.floor(Math.random() * 5),
        cloudDecisions: prev.cloudDecisions + Math.floor(Math.random() * 3),
        hybridDecisions: prev.hybridDecisions + Math.floor(Math.random() * 2)
      }))

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setIsLoading(false)
    }
  }

  const getLatencyColor = (latency) => {
    if (latency < 10) return 'text-green-600'
    if (latency < 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSafetyLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Edge-Cloud Hybrid Control Center</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Wifi className="w-4 h-4 mr-1" />
            System Online
          </Badge>
          <Button onClick={fetchSystemStatus} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Edge Latency</p>
                <p className={`text-2xl font-bold ${getLatencyColor(realTimeMetrics.edgeLatency)}`}>
                  {realTimeMetrics.edgeLatency.toFixed(1)}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Target: &lt;10ms
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cloud Latency</p>
                <p className={`text-2xl font-bold ${getLatencyColor(realTimeMetrics.cloudLatency)}`}>
                  {realTimeMetrics.cloudLatency.toFixed(1)}ms
                </p>
              </div>
              <Cloud className="h-8 w-8 text-gray-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Avg: 35-50ms
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Edge Decisions</p>
                <p className="text-2xl font-bold text-green-600">
                  {realTimeMetrics.edgeDecisions}
                </p>
              </div>
              <Cpu className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                Real-time
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hybrid Coordination</p>
                <p className="text-2xl font-bold text-purple-600">
                  {realTimeMetrics.hybridDecisions}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                Edge + Cloud
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edge Computing Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="w-5 h-5 mr-2 text-blue-600" />
              Edge Computing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Nodes</span>
              <Badge variant="outline">{edgeStatus?.edge_nodes_active || 0}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Edge Load</span>
                <span>{((edgeStatus?.current_edge_load || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(edgeStatus?.current_edge_load || 0) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sub-10ms Decisions</span>
                <span className="text-green-600 font-medium">
                  {edgeStatus?.performance_metrics?.sub_10ms_decisions_percent || 0}%
                </span>
              </div>
              <Progress 
                value={edgeStatus?.performance_metrics?.sub_10ms_decisions_percent || 0} 
                className="h-2" 
              />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                Uptime: {edgeStatus?.performance_metrics?.edge_uptime_percent || 0}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Coordination Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Agent Coordination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {agentsStatus?.active_agents || 0}
                </p>
                <p className="text-xs text-gray-600">Active Agents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {agentsStatus?.coordination_groups || 0}
                </p>
                <p className="text-xs text-gray-600">Coord Groups</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Agent Utilization</span>
                <span>{((agentsStatus?.performance_summary?.agent_utilization || 0) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(agentsStatus?.performance_summary?.agent_utilization || 0) * 100} 
                className="h-2" 
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Tasks</span>
              <Badge variant="outline">{agentsStatus?.active_tasks || 0}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Pending Tasks</span>
              <Badge variant="outline">{agentsStatus?.pending_tasks || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Safety Monitoring Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-600" />
              Safety Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Events</span>
              <Badge 
                variant={safetyStatus?.active_safety_events > 0 ? "destructive" : "outline"}
              >
                {safetyStatus?.active_safety_events || 0}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Safety Rules</span>
              <Badge variant="outline">{safetyStatus?.safety_rules_active || 0}</Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monitored Zones</span>
              <Badge variant="outline">{safetyStatus?.safety_zones_monitored || 0}</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sensor Connectivity</span>
                <span className="text-green-600 font-medium">
                  {((safetyStatus?.system_health?.sensor_connectivity || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={(safetyStatus?.system_health?.sensor_connectivity || 0) * 100} 
                className="h-2" 
              />
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                Response: {safetyStatus?.system_health?.response_time_ms || 0}ms
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Safety Events */}
      {safetyStatus?.recent_events && safetyStatus.recent_events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Recent Safety Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safetyStatus.recent_events.map((event, index) => (
                <Alert key={index} className="border-l-4 border-l-orange-500">
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{event.description}</span>
                        <div className="flex items-center mt-1 space-x-2">
                          <Badge 
                            variant="outline" 
                            className={getSafetyLevelColor(event.safety_level)}
                          >
                            {event.safety_level.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {event.hazard_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Decision Distribution (Real-time)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeMetrics.edgeDecisions}
              </div>
              <div className="text-sm text-blue-700">Edge Decisions</div>
              <div className="text-xs text-gray-600 mt-1">
                Ultra-low latency (&lt;10ms)
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {realTimeMetrics.cloudDecisions}
              </div>
              <div className="text-sm text-gray-700">Cloud Decisions</div>
              <div className="text-xs text-gray-600 mt-1">
                Complex processing (30-50ms)
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeMetrics.hybridDecisions}
              </div>
              <div className="text-sm text-purple-700">Hybrid Decisions</div>
              <div className="text-xs text-gray-600 mt-1">
                Edge + Cloud coordination
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EdgeCloudDashboard
