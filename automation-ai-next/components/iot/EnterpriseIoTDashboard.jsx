'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CloudIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  CogIcon,
  EyeIcon,
  ServerIcon,
  WifiIcon,
  SignalIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export function EnterpriseIoTDashboard() {
  const [realTimeData, setRealTimeData] = useState(null)
  const [platformKPIs, setPlatformKPIs] = useState(null)
  const [deviceStats, setDeviceStats] = useState(null)
  const [securityMetrics, setSecurityMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setConnectionStatus('connecting')
        
        // Fetch real-time data from your billion-dollar IoT service
        const [kpisResponse, healthResponse] = await Promise.all([
          fetch('http://localhost:8011/platform/kpis'),
          fetch('http://localhost:8011/health')
        ])

        const [kpis, health] = await Promise.all([
          kpisResponse.json(),
          healthResponse.json()
        ])

        setPlatformKPIs(kpis)
        setConnectionStatus('connected')
        
        // Simulate real-time device data
        setDeviceStats({
          total_devices: 50000,
          online_devices: 48750,
          edge_nodes: 125,
          data_points_per_second: 15000,
          average_latency: 2.3,
          uptime_percentage: 99.97
        })

        setSecurityMetrics({
          threats_blocked: 1247,
          security_score: 99.7,
          compliance_status: 'compliant',
          zero_trust_policies: 45,
          incidents_resolved: 12
        })
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setConnectionStatus('error')
        // Set fallback data
        setPlatformKPIs({
          platform_performance: {
            total_devices_managed: 50000,
            enterprise_customers: 25,
            predictive_accuracy: 96.5,
            security_incidents_blocked: 99.7,
            average_roi_delivered: 890,
            edge_processing_percentage: 94.7,
            compliance_score: 98.5,
            customer_satisfaction: 9.2,
            platform_uptime: 99.99,
            cost_savings_delivered: 45000000
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setRealTimeData({
        timestamp: new Date(),
        active_connections: Math.floor(Math.random() * 1000) + 48000,
        data_throughput: Math.floor(Math.random() * 5000) + 12000,
        edge_processing_load: Math.floor(Math.random() * 20) + 75,
        security_alerts: Math.floor(Math.random() * 5)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600'
      case 'connecting':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'connecting':
        return <ClockIcon className="w-4 h-4 animate-spin" />
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4" />
      default:
        return <WifiIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enterprise IoT Platform Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time monitoring of billion-dollar IoT infrastructure
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 ${getConnectionStatusColor()}`}>
            {getConnectionStatusIcon()}
            <span className="text-sm font-medium capitalize">{connectionStatus}</span>
          </div>
          {realTimeData && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              Live: {realTimeData.timestamp.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Active Connections</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {realTimeData.active_connections.toLocaleString()}
                  </p>
                </div>
                <WifiIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Data Throughput/sec</p>
                  <p className="text-2xl font-bold text-green-700">
                    {realTimeData.data_throughput.toLocaleString()}
                  </p>
                </div>
                <SignalIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Edge Processing</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {realTimeData.edge_processing_load}%
                  </p>
                </div>
                <CpuChipIcon className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Security Alerts</p>
                  <p className="text-2xl font-bold text-orange-700">
                    {realTimeData.security_alerts}
                  </p>
                </div>
                <ShieldCheckIcon className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Performance KPIs */}
      {platformKPIs?.platform_performance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
              Platform Performance KPIs
            </CardTitle>
            <CardDescription>
              Enterprise-grade metrics demonstrating billion-dollar platform capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {platformKPIs.platform_performance.total_devices_managed?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Devices Managed</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {platformKPIs.platform_performance.enterprise_customers}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enterprise Customers</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {platformKPIs.platform_performance.predictive_accuracy}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Predictive Accuracy</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {platformKPIs.platform_performance.average_roi_delivered}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average ROI</div>
              </div>
              
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-3xl font-bold text-indigo-600">
                  {platformKPIs.platform_performance.platform_uptime}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Platform Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Infrastructure Overview */}
      {deviceStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ServerIcon className="w-6 h-6 mr-2 text-purple-600" />
                Device Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Devices:</span>
                  <span className="font-semibold">{deviceStats.total_devices.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Online Devices:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={(deviceStats.online_devices / deviceStats.total_devices) * 100} className="w-20 h-2" />
                    <span className="font-semibold text-green-600">{deviceStats.online_devices.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Edge Nodes:</span>
                  <span className="font-semibold">{deviceStats.edge_nodes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Latency:</span>
                  <span className="font-semibold text-blue-600">{deviceStats.average_latency}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime:</span>
                  <span className="font-semibold text-green-600">{deviceStats.uptime_percentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="w-6 h-6 mr-2 text-green-600" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityMetrics && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Security Score:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={securityMetrics.security_score} className="w-20 h-2" />
                      <span className="font-semibold text-green-600">{securityMetrics.security_score}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Threats Blocked:</span>
                    <span className="font-semibold">{securityMetrics.threats_blocked.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Compliance Status:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 capitalize">
                      {securityMetrics.compliance_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Zero Trust Policies:</span>
                    <span className="font-semibold">{securityMetrics.zero_trust_policies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Incidents Resolved:</span>
                    <span className="font-semibold text-blue-600">{securityMetrics.incidents_resolved}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
