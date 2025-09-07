'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  UserGroupIcon,
  BoltIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts'

// Real-time data hook
function useRealTimeData(endpoint, refreshInterval = 5000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to fetch data')
      const newData = await response.json()
      setData(newData)
      setLastUpdate(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { data, loading, error, lastUpdate, refetch: fetchData }
}

// KPI Card Component
function KPICard({ title, value, change, trend, icon: Icon, color = 'blue', format = 'number' }) {
  const formatValue = (val) => {
    if (format === 'currency') return `$${val?.toLocaleString() || 0}`
    if (format === 'percentage') return `${val?.toFixed(1) || 0}%`
    if (format === 'time') return `${val || 0}h`
    return val?.toLocaleString() || 0
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <TrendingDownIcon className="w-4 h-4 text-red-500" />
    return null
  }

  const getChangeColor = () => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {getTrendIcon()}
                <span className={`text-sm ml-1 ${getChangeColor()}`}>
                  {change > 0 ? '+' : ''}{change?.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Real-time Chart Component
function RealTimeChart({ title, data, type = 'line', height = 300 }) {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} />
          </AreaChart>
        )
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} />
          </LineChart>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Alert Component
function AlertPanel({ alerts }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800'
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800'
      case 'info': return 'bg-blue-100 border-blue-500 text-blue-800'
      default: return 'bg-gray-100 border-gray-500 text-gray-800'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'info': return <CheckCircleIcon className="w-5 h-5" />
      default: return <CheckCircleIcon className="w-5 h-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BoltIcon className="w-5 h-5" />
          <span>Real-Time Alerts</span>
          <Badge variant="secondary">{alerts?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts?.length > 0 ? (
            alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 border-l-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm opacity-90">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Main Executive Dashboard
export function ExecutiveDashboard() {
  const { data: kpiData, lastUpdate: kpiUpdate } = useRealTimeData('/api/dashboard/kpis', 10000)
  const { data: chartData } = useRealTimeData('/api/dashboard/charts', 30000)
  const { data: alertData } = useRealTimeData('/api/dashboard/alerts', 5000)
  const { data: systemHealth } = useRealTimeData('/api/dashboard/health', 15000)

  // Mock data for demonstration
  const mockKPIs = kpiData || {
    totalTasks: { value: 15420, change: 12.5, trend: 'up' },
    efficiency: { value: 94.2, change: 3.1, trend: 'up' },
    costSavings: { value: 2847000, change: 18.7, trend: 'up' },
    activeRobots: { value: 47, change: 2.1, trend: 'up' },
    humanWorkers: { value: 156, change: -1.2, trend: 'down' },
    avgResponseTime: { value: 2.3, change: -15.2, trend: 'down' }
  }

  const mockChartData = chartData || {
    efficiency: [
      { time: '00:00', value: 92 },
      { time: '04:00', value: 89 },
      { time: '08:00', value: 95 },
      { time: '12:00', value: 97 },
      { time: '16:00', value: 94 },
      { time: '20:00', value: 91 }
    ],
    taskDistribution: [
      { name: 'Robot Tasks', value: 65 },
      { name: 'Human Tasks', value: 25 },
      { name: 'Hybrid Tasks', value: 10 }
    ],
    costAnalysis: [
      { time: 'Jan', value: 2100000 },
      { time: 'Feb', value: 2350000 },
      { time: 'Mar', value: 2847000 }
    ]
  }

  const mockAlerts = alertData || [
    {
      severity: 'warning',
      title: 'Robot UR5e_003 Maintenance Due',
      message: 'Scheduled maintenance required within 24 hours',
      timestamp: new Date().toISOString()
    },
    {
      severity: 'info',
      title: 'New Workflow Deployed',
      message: 'Assembly Line Optimization v2.1 is now active',
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Executive Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time automation platform overview and key performance indicators
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {kpiUpdate?.toLocaleTimeString() || 'Never'}
          </div>
          <Button size="sm" className="flex items-center space-x-2">
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <KPICard
          title="Total Tasks Today"
          value={mockKPIs.totalTasks.value}
          change={mockKPIs.totalTasks.change}
          trend={mockKPIs.totalTasks.trend}
          icon={ChartBarIcon}
          color="blue"
        />
        <KPICard
          title="System Efficiency"
          value={mockKPIs.efficiency.value}
          change={mockKPIs.efficiency.change}
          trend={mockKPIs.efficiency.trend}
          icon={TrendingUpIcon}
          color="green"
          format="percentage"
        />
        <KPICard
          title="Cost Savings"
          value={mockKPIs.costSavings.value}
          change={mockKPIs.costSavings.change}
          trend={mockKPIs.costSavings.trend}
          icon={CurrencyDollarIcon}
          color="emerald"
          format="currency"
        />
        <KPICard
          title="Active Robots"
          value={mockKPIs.activeRobots.value}
          change={mockKPIs.activeRobots.change}
          trend={mockKPIs.activeRobots.trend}
          icon={CpuChipIcon}
          color="purple"
        />
        <KPICard
          title="Human Workers"
          value={mockKPIs.humanWorkers.value}
          change={mockKPIs.humanWorkers.change}
          trend={mockKPIs.humanWorkers.trend}
          icon={UserGroupIcon}
          color="indigo"
        />
        <KPICard
          title="Avg Response Time"
          value={mockKPIs.avgResponseTime.value}
          change={mockKPIs.avgResponseTime.change}
          trend={mockKPIs.avgResponseTime.trend}
          icon={ClockIcon}
          color="orange"
          format="time"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart
          title="System Efficiency Over Time"
          data={mockChartData.efficiency}
          type="area"
        />
        <RealTimeChart
          title="Task Distribution"
          data={mockChartData.taskDistribution}
          type="pie"
          height={300}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealTimeChart
            title="Monthly Cost Analysis"
            data={mockChartData.costAnalysis}
            type="bar"
          />
        </div>
        <AlertPanel alerts={mockAlerts} />
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>System Health Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2.1ms</div>
              <div className="text-sm text-gray-600">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">47/50</div>
              <div className="text-sm text-gray-600">Active Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12.3GB</div>
              <div className="text-sm text-gray-600">Data Processed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
