'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CpuChipIcon,
  BellIcon,
  MapPinIcon,
  CalendarIcon,
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
  RadialBarChart,
  RadialBar
} from 'recharts'

const HealthcareDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedFacility, setSelectedFacility] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchHealthcareData()
    fetchHealthcareAlerts()
    
    const interval = setInterval(() => {
      fetchHealthcareData()
      fetchHealthcareAlerts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedFacility])

  const fetchHealthcareData = async () => {
    try {
      // Use demo data for investor presentation
      const demoData = {
        facilities: {
          total: 12,
          active: 11,
          maintenance: 1
        },
        patients: {
          total: 847,
          critical: 23,
          stable: 824
        },
        devices: {
          total: 1247,
          online: 1235,
          offline: 12,
          alerts: 3
        },
        performance: {
          uptime: 99.8,
          response_time: 0.12,
          accuracy: 99.9,
          efficiency_gain: 34.2
        },
        roi: {
          annual_savings: 3800000,
          cost_reduction: 28.5,
          payback_months: 3.8
        }
      }
      setDashboardData(demoData)
    } catch (error) {
      console.error('Error fetching healthcare data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHealthcareAlerts = async () => {
    try {
      // Use demo alerts for investor presentation
      const demoAlerts = [
        {
          id: 'alert_001',
          type: 'critical',
          title: 'Patient Vitals Alert',
          message: 'Heart rate anomaly detected in ICU Room 101',
          timestamp: new Date(Date.now() - 5*60*1000).toISOString(),
          resolved: false
        },
        {
          id: 'alert_002',
          type: 'warning',
          title: 'Device Maintenance',
          message: 'Infusion pump PUMP_002 requires calibration',
          timestamp: new Date(Date.now() - 15*60*1000).toISOString(),
          resolved: false
        },
        {
          id: 'alert_003',
          type: 'info',
          title: 'System Optimization',
          message: 'AI model improved prediction accuracy by 2.3%',
          timestamp: new Date(Date.now() - 30*60*1000).toISOString(),
          resolved: true
        }
      ]
      setAlerts(demoAlerts)
    } catch (error) {
      console.error('Error fetching healthcare alerts:', error)
    }
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <HeartIcon className="h-8 w-8 text-green-600" />
            Healthcare Automation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Patient care, social robots, and facility management</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            HIPAA Compliant
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Real-time Monitoring
          </Badge>
        </div>
      </div>

      {/* Critical Healthcare Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.type === 'fall_detected' ? 'border-red-500 bg-red-50' :
              alert.type === 'medication_missed' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {alert.type === 'fall_detected' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : (
                  <BellIcon className="h-5 w-5 text-yellow-600" />
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

      {/* Key Healthcare Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.activePatients || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    {dashboardData?.patientCapacity || 0}% capacity
                  </span>
                </div>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Social Robots Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.activeSocialRobots || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    {dashboardData?.robotUtilization || 0}% utilization
                  </span>
                </div>
              </div>
              <CpuChipIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(dashboardData?.averageWaitTime || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">-15% vs last week</span>
                </div>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((dashboardData?.safetyScore || 0) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare-Specific Tabs */}
      <Tabs defaultValue="patient-flow" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="patient-flow">Patient Flow</TabsTrigger>
          <TabsTrigger value="social-robots">Social Robots</TabsTrigger>
          <TabsTrigger value="safety-monitoring">Safety</TabsTrigger>
          <TabsTrigger value="cognitive-assessment">Cognitive Care</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="patient-flow" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Flow Optimization */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Flow Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData?.patientFlowData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="admissions" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="discharges" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="transfers" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Room Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Room Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.roomUtilization || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="utilization" fill="#10B981" />
                    <Bar dataKey="capacity" fill="#E5E7EB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Patient Flow Bottlenecks */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Bottlenecks & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData?.flowBottlenecks || []).map((bottleneck, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-gray-900">{bottleneck.location}</p>
                        <p className="text-sm text-gray-600">{bottleneck.issue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">Impact: {bottleneck.impact}</p>
                      <p className="text-xs text-gray-500">{bottleneck.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social-robots" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Robot Interaction Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Social Robot Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.robotInteractions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="companionSessions" stroke="#10B981" strokeWidth={2} name="Companion Sessions" />
                    <Line type="monotone" dataKey="medicationReminders" stroke="#3B82F6" strokeWidth={2} name="Medication Reminders" />
                    <Line type="monotone" dataKey="cognitiveAssessments" stroke="#8B5CF6" strokeWidth={2} name="Cognitive Assessments" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Robot Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Robot Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.robotPerformance || []).map((robot, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${robot.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{robot.name}</p>
                          <p className="text-sm text-gray-600">{robot.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {robot.interactionsToday} interactions today
                        </p>
                        <p className="text-xs text-gray-500">
                          Satisfaction: {(robot.satisfactionScore * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety-monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fall Detection System */}
            <Card>
              <CardHeader>
                <CardTitle>Fall Detection & Safety Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData?.fallDetection?.monitored || 0}
                      </p>
                      <p className="text-sm text-gray-600">Patients Monitored</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {dashboardData?.fallDetection?.incidents || 0}
                      </p>
                      <p className="text-sm text-gray-600">Fall Incidents (24h)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Detection Accuracy</span>
                      <span className="font-medium">
                        {((dashboardData?.fallDetection?.accuracy || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(dashboardData?.fallDetection?.accuracy || 0) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Response Times */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Response Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboardData?.emergencyResponse || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}s`} />
                    <Bar dataKey="responseTime" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cognitive-assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cognitive Assessment Results */}
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Assessment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.cognitiveAssessments || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="memoryScore" stroke="#10B981" strokeWidth={2} name="Memory" />
                    <Line type="monotone" dataKey="attentionScore" stroke="#3B82F6" strokeWidth={2} name="Attention" />
                    <Line type="monotone" dataKey="executiveScore" stroke="#8B5CF6" strokeWidth={2} name="Executive Function" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Assessment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.assessmentDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.assessmentDistribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HIPAA Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>HIPAA Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.complianceStatus || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{item.requirement}</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Compliant
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Audit Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData?.auditTrail || []).map((audit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{audit.action}</p>
                        <p className="text-xs text-gray-500">{audit.timestamp} - {audit.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default HealthcareDashboard
