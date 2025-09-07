'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TruckIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  DocumentTextIcon
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
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts'

const LogisticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchLogisticsData()
    fetchLogisticsAlerts()
    
    const interval = setInterval(() => {
      fetchLogisticsData()
      fetchLogisticsAlerts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedWarehouse])

  const fetchLogisticsData = async () => {
    try {
      const response = await fetch(`/api/logistics/dashboard?warehouse=${selectedWarehouse}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching logistics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogisticsAlerts = async () => {
    try {
      const response = await fetch(`/api/logistics/alerts?warehouse=${selectedWarehouse}`)
      const alertData = await response.json()
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error('Error fetching logistics alerts:', error)
    }
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brown-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TruckIcon className="h-8 w-8 text-orange-600" />
            Logistics & Supply Chain Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Warehouse automation, fleet management, and supply chain optimization</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Real-time Tracking
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            AI Optimization
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Automated Sorting
          </Badge>
        </div>
      </div>

      {/* Critical Logistics Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.type === 'delivery_delay' ? 'border-red-500 bg-red-50' :
              alert.type === 'inventory_shortage' ? 'border-yellow-500 bg-yellow-50' :
              alert.type === 'route_optimization' ? 'border-blue-500 bg-blue-50' :
              'border-orange-500 bg-orange-50'
            }`}>
              <div className="flex items-center gap-2">
                {alert.type === 'delivery_delay' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : alert.type === 'inventory_shortage' ? (
                  <CubeIcon className="h-5 w-5 text-yellow-600" />
                ) : (
                  <TruckIcon className="h-5 w-5 text-blue-600" />
                )}
                <AlertDescription className="font-medium">
                  <span className="font-semibold">{alert.location}:</span> {alert.message}
                  <span className="text-sm text-gray-500 ml-2">({alert.timestamp})</span>
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Logistics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.activeShipments || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-blue-600">
                    {formatNumber(dashboardData?.shipmentsToday || 0)} today
                  </span>
                </div>
              </div>
              <TruckIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.onTimeDelivery || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Above target</span>
                </div>
              </div>
              <ClockIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warehouse Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.warehouseEfficiency || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <BoltIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">Optimized</span>
                </div>
              </div>
              <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.costSavings || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    +{formatPercentage(dashboardData?.savingsIncrease || 0)} vs last month
                  </span>
                </div>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logistics-Specific Tabs */}
      <Tabs defaultValue="warehouse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
          <TabsTrigger value="routing">Route Optimization</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Warehouse Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Operations Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dashboardData?.warehouseOperations || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="packagesProcessed" fill="#F59E0B" name="Packages Processed" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} name="Efficiency %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Automated Systems Status */}
            <Card>
              <CardHeader>
                <CardTitle>Automated Systems Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.automatedSystems || []).map((system, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{system.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${
                          system.status === 'operational' ? 'bg-green-500' :
                          system.status === 'maintenance' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Throughput:</span>
                          <span className="font-medium ml-2">{system.throughput}/hr</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium ml-2">{system.uptime}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Accuracy:</span>
                          <span className="font-medium ml-2">{system.accuracy}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Efficiency:</span>
                          <span className="font-medium ml-2">{system.efficiency}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warehouse Layout Optimization */}
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Layout & Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(dashboardData?.warehouseMetrics?.spaceUtilization || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Space Utilization</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData?.warehouseMetrics?.avgPickTime || 0}s
                  </p>
                  <p className="text-sm text-gray-600">Avg Pick Time</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatNumber(dashboardData?.warehouseMetrics?.dailyThroughput || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Daily Throughput</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.fleetPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="deliveries" stroke="#10B981" strokeWidth={2} name="Deliveries" />
                    <Line type="monotone" dataKey="fuelEfficiency" stroke="#3B82F6" strokeWidth={2} name="Fuel Efficiency" />
                    <Line type="monotone" dataKey="onTimeRate" stroke="#8B5CF6" strokeWidth={2} name="On-Time Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Vehicle Status */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Fleet Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.vehicleStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.vehicleStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle>Active Vehicle Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.activeVehicles || []).map((vehicle, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{vehicle.id}</h4>
                      <Badge variant={vehicle.status === 'delivering' ? 'default' : vehicle.status === 'loading' ? 'secondary' : 'outline'}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver:</span>
                        <span className="font-medium">{vehicle.driver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route:</span>
                        <span className="font-medium">{vehicle.route}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ETA:</span>
                        <span className="font-medium">{vehicle.eta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Packages:</span>
                        <span className="font-medium">{vehicle.packages}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Route Optimization */}
            <Card>
              <CardHeader>
                <CardTitle>AI Route Optimization Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(dashboardData?.routeOptimization?.fuelSavings || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Fuel Savings</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData?.routeOptimization?.timeSaved || 0}min
                      </p>
                      <p className="text-sm text-gray-600">Time Saved</p>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dashboardData?.routeEfficiency || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="route" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="efficiency" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData?.deliveryPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="onTime" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="On Time" />
                    <Area type="monotone" dataKey="delayed" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Delayed" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Inventory Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.inventoryLevels || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inStock" stroke="#10B981" strokeWidth={2} name="In Stock" />
                    <Line type="monotone" dataKey="reorderPoint" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Reorder Point" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Inventory Turnover */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Turnover Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.inventoryTurnover || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="turnoverRate" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis & Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dashboardData?.costAnalysis || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="operationalCosts" fill="#EF4444" name="Operational Costs" />
                    <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={3} name="Savings" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.performanceTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="efficiency" stroke="#8B5CF6" strokeWidth={2} name="Efficiency %" />
                    <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} name="Accuracy %" />
                    <Line type="monotone" dataKey="customerSatisfaction" stroke="#3B82F6" strokeWidth={2} name="Customer Satisfaction %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Systems Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.automationSystems || []).map((system, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{system.name}</h4>
                      <CpuChipIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant={system.status === 'active' ? 'default' : 'secondary'}>
                          {system.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className="font-medium">{system.efficiency}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tasks/Hour:</span>
                        <span className="font-medium">{system.tasksPerHour}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="font-medium">{system.uptime}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LogisticsDashboard
