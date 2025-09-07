'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CogIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  CpuChipIcon,
  BeakerIcon,
  DocumentChartBarIcon
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
  RadialBarChart,
  RadialBar
} from 'recharts'

const ManufacturingDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedLine, setSelectedLine] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchManufacturingData()
    fetchManufacturingAlerts()
    
    const interval = setInterval(() => {
      fetchManufacturingData()
      fetchManufacturingAlerts()
    }, 10000) // More frequent updates for manufacturing
    
    return () => clearInterval(interval)
  }, [selectedLine])

  const fetchManufacturingData = async () => {
    try {
      const response = await fetch(`/api/manufacturing/dashboard?line=${selectedLine}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching manufacturing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchManufacturingAlerts = async () => {
    try {
      const response = await fetch(`/api/manufacturing/alerts?line=${selectedLine}`)
      const alertData = await response.json()
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error('Error fetching manufacturing alerts:', error)
    }
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CogIcon className="h-8 w-8 text-orange-600" />
            Manufacturing Automation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Production control, quality management, and lean optimization</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            ISO 9001 Certified
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Lean Manufacturing
          </Badge>
        </div>
      </div>

      {/* Critical Manufacturing Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.type === 'equipment_breakdown' ? 'border-red-500 bg-red-50' :
              alert.type === 'quality_issue' ? 'border-yellow-500 bg-yellow-50' :
              alert.type === 'production_delay' ? 'border-orange-500 bg-orange-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {alert.type === 'equipment_breakdown' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : alert.type === 'quality_issue' ? (
                  <BeakerIcon className="h-5 w-5 text-yellow-600" />
                ) : (
                  <ClockIcon className="h-5 w-5 text-orange-600" />
                )}
                <AlertDescription className="font-medium">
                  <span className="font-semibold">{alert.line}:</span> {alert.message}
                  <span className="text-sm text-gray-500 ml-2">({alert.timestamp})</span>
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Manufacturing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">OEE Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.oeeScore || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    Target: 85%
                  </span>
                </div>
              </div>
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Units Produced</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.unitsProduced || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    +12% vs yesterday
                  </span>
                </div>
              </div>
              <CpuChipIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.qualityRate || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Above target</span>
                </div>
              </div>
              <BeakerIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment Uptime</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.equipmentUptime || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <BoltIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
              </div>
              <WrenchScrewdriverIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manufacturing-Specific Tabs */}
      <Tabs defaultValue="production" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
          <TabsTrigger value="oee">OEE Analysis</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="lean">Lean Optimization</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="production" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Line Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Production Line Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dashboardData?.productionData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="unitsProduced" fill="#F59E0B" name="Units Produced" />
                    <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} name="Efficiency %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Production Orders Status */}
            <Card>
              <CardHeader>
                <CardTitle>Production Orders Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.orderStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.orderStatus || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Production Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Production Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(dashboardData?.productionLines || []).map((line, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{line.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${
                        line.status === 'running' ? 'bg-green-500' :
                        line.status === 'maintenance' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Order:</span>
                        <span className="font-medium">{line.currentOrder}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress:</span>
                        <span className="font-medium">{line.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${line.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Rate:</span>
                        <span className="font-medium">{line.rate} units/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Metrics Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.qualityTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="passRate" stroke="#10B981" strokeWidth={2} name="Pass Rate %" />
                    <Line type="monotone" dataKey="defectRate" stroke="#EF4444" strokeWidth={2} name="Defect Rate %" />
                    <Line type="monotone" dataKey="reworkRate" stroke="#F59E0B" strokeWidth={2} name="Rework Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Defect Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Defect Analysis by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.defectAnalysis || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quality Control Stations */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Control Stations Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.qualityStations || []).map((station, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{station.name}</h4>
                      <Badge variant={station.status === 'active' ? 'default' : 'secondary'}>
                        {station.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Inspections Today:</span>
                        <span className="font-medium">{station.inspectionsToday}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pass Rate:</span>
                        <span className="font-medium text-green-600">{station.passRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Inspection Time:</span>
                        <span className="font-medium">{station.avgInspectionTime}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oee" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* OEE Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>OEE Component Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={dashboardData?.oeeBreakdown || []}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(dashboardData?.availability || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Availability</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPercentage(dashboardData?.performance || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Performance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(dashboardData?.quality || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Quality</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OEE Trends */}
            <Card>
              <CardHeader>
                <CardTitle>OEE Trends by Production Line</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.oeeTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="line1" stroke="#10B981" strokeWidth={2} name="Line 1" />
                    <Line type="monotone" dataKey="line2" stroke="#3B82F6" strokeWidth={2} name="Line 2" />
                    <Line type="monotone" dataKey="line3" stroke="#F59E0B" strokeWidth={2} name="Line 3" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Predictive Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle>Predictive Maintenance Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.maintenanceAlerts || []).map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      alert.priority === 'high' ? 'border-red-500 bg-red-50' :
                      alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{alert.equipment}</p>
                          <p className="text-sm text-gray-600">{alert.issue}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {alert.daysUntilMaintenance} days
                          </p>
                          <Badge variant={
                            alert.priority === 'high' ? 'destructive' :
                            alert.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {alert.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData?.maintenanceSchedule || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <WrenchScrewdriverIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{item.equipment}</p>
                          <p className="text-sm text-gray-600">{item.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{item.scheduledDate}</p>
                        <p className="text-xs text-gray-500">{item.estimatedDuration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lean" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waste Identification */}
            <Card>
              <CardHeader>
                <CardTitle>Waste Identification & Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.wasteAnalysis || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="wasteType" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="impact" fill="#EF4444" />
                    <Bar dataKey="improvementPotential" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lean Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Lean Manufacturing Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData?.leanMetrics?.cycleTime || 0}s
                      </p>
                      <p className="text-sm text-gray-600">Cycle Time</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData?.leanMetrics?.leadTime || 0}h
                      </p>
                      <p className="text-sm text-gray-600">Lead Time</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {(dashboardData?.leanOpportunities || []).map((opportunity, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{opportunity.area}</p>
                            <p className="text-sm text-gray-600">{opportunity.recommendation}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              ${opportunity.potentialSavings}k/year
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Production Schedule Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData?.scheduling?.totalOrders || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(dashboardData?.scheduling?.onTimeDelivery || 0)}
                    </p>
                    <p className="text-sm text-gray-600">On-time Delivery</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {formatPercentage(dashboardData?.scheduling?.resourceUtilization || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Resource Utilization</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Upcoming Production Schedule</h4>
                  <div className="space-y-2">
                    {(dashboardData?.upcomingSchedule || []).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{item.orderNumber}</p>
                            <p className="text-sm text-gray-600">{item.product} - {item.quantity} units</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.scheduledStart}</p>
                          <p className="text-xs text-gray-500">Line {item.assignedLine}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ManufacturingDashboard
