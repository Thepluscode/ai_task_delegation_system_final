'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  BookOpenIcon,
  ComputerDesktopIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CpuChipIcon,
  LightBulbIcon,
  TrophyIcon,
  CalendarIcon
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

const EducationDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedInstitution, setSelectedInstitution] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchEducationData()
    fetchEducationAlerts()
    
    const interval = setInterval(() => {
      fetchEducationData()
      fetchEducationAlerts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedInstitution])

  const fetchEducationData = async () => {
    try {
      const response = await fetch(`/api/education/dashboard?institution=${selectedInstitution}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching education data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEducationAlerts = async () => {
    try {
      const response = await fetch(`/api/education/alerts?institution=${selectedInstitution}`)
      const alertData = await response.json()
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error('Error fetching education alerts:', error)
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="h-8 w-8 text-cyan-600" />
            Education Automation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Personalized learning, educational robots, and campus management</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-cyan-600 border-cyan-600">
            AI Personalization
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Educational Robots
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Smart Campus
          </Badge>
        </div>
      </div>

      {/* Critical Education Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.type === 'student_at_risk' ? 'border-red-500 bg-red-50' :
              alert.type === 'robot_maintenance' ? 'border-yellow-500 bg-yellow-50' :
              alert.type === 'resource_shortage' ? 'border-orange-500 bg-orange-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {alert.type === 'student_at_risk' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : alert.type === 'robot_maintenance' ? (
                  <CpuChipIcon className="h-5 w-5 text-yellow-600" />
                ) : (
                  <BuildingOfficeIcon className="h-5 w-5 text-orange-600" />
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

      {/* Key Education Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.activeStudents || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-blue-600">
                    {formatNumber(dashboardData?.newEnrollments || 0)} new this week
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
                <p className="text-sm font-medium text-gray-600">Educational Robots</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.activeRobots || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    {formatPercentage(dashboardData?.robotUtilization || 0)} utilization
                  </span>
                </div>
              </div>
              <CpuChipIcon className="h-8 w-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.learningEfficiency || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Above target</span>
                </div>
              </div>
              <LightBulbIcon className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Student Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((dashboardData?.studentSatisfaction || 0) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">4.7/5 rating</span>
                </div>
              </div>
              <TrophyIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Education-Specific Tabs */}
      <Tabs defaultValue="personalized-learning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personalized-learning">Personalized Learning</TabsTrigger>
          <TabsTrigger value="educational-robots">Educational Robots</TabsTrigger>
          <TabsTrigger value="campus-management">Campus Management</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="personalized-learning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Path Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>AI Learning Path Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData?.learningPathData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="completionRate" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Completion Rate" />
                    <Area type="monotone" dataKey="engagementScore" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Engagement Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Learning Style Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Style Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.learningStyles || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.learningStyles || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Student Progress Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Student Progress & Adaptive Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.studentProgress || []).map((student, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                      <Badge variant={student.performance === 'excellent' ? 'default' : student.performance === 'good' ? 'secondary' : 'outline'}>
                        {student.performance}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Course Progress:</span>
                        <span className="font-medium">{student.courseProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-cyan-600 h-2 rounded-full" 
                          style={{ width: `${student.courseProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Learning Style:</span>
                        <span className="font-medium">{student.learningStyle}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Engagement Level:</span>
                        <span className="font-medium text-green-600">{student.engagementLevel}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="educational-robots" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Robot Teaching Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Educational Robot Teaching Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.robotSessions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sessions" fill="#06B6D4" name="Sessions" />
                    <Bar dataKey="studentEngagement" fill="#10B981" name="Engagement Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Robot Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Robot Performance & Student Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.robotPerformance || []).map((robot, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{robot.name}</h4>
                        <div className={`w-3 h-3 rounded-full ${
                          robot.status === 'active' ? 'bg-green-500' :
                          robot.status === 'maintenance' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Subject:</span>
                          <span className="font-medium ml-2">{robot.subject}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium ml-2">{robot.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Sessions Today:</span>
                          <span className="font-medium ml-2">{robot.sessionsToday}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Student Rating:</span>
                          <span className="font-medium ml-2 text-yellow-600">{robot.studentRating}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Learning Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Learning Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Most Popular Activities</h4>
                  <div className="space-y-2">
                    {(dashboardData?.popularActivities || []).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpenIcon className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">{activity.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{activity.participations} students</p>
                          <p className="text-xs text-gray-500">{activity.avgScore}/100 avg score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Learning Outcomes</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={dashboardData?.learningOutcomes || []}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Before Robot" dataKey="before" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                      <Radar name="After Robot" dataKey="after" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campus-management" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resource Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Campus Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.resourceUtilization || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="resource" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="utilization" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Classroom Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle>Smart Classroom Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(dashboardData?.schedulingMetrics?.efficiency || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Scheduling Efficiency</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData?.schedulingMetrics?.conflictsResolved || 0}
                      </p>
                      <p className="text-sm text-gray-600">Conflicts Resolved</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Today's Schedule Optimization</h4>
                    {(dashboardData?.todaySchedule || []).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{item.room}</p>
                            <p className="text-sm text-gray-600">{item.course} - {item.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{item.capacity}% capacity</p>
                          <p className="text-xs text-gray-500">{item.equipment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Energy & Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle>Campus Operations & Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.campusMetrics?.energySavings || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Energy Savings</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData?.campusMetrics?.maintenanceEfficiency || 0}%
                  </p>
                  <p className="text-sm text-gray-600">Maintenance Efficiency</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    ${formatNumber(dashboardData?.campusMetrics?.costSavings || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Cost Savings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Performance */}
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Assessment Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.assessmentTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="averageScore" stroke="#10B981" strokeWidth={2} name="Average Score" />
                    <Line type="monotone" dataKey="passRate" stroke="#3B82F6" strokeWidth={2} name="Pass Rate %" />
                    <Line type="monotone" dataKey="improvementRate" stroke="#8B5CF6" strokeWidth={2} name="Improvement Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subject Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.subjectPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#06B6D4" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Adaptive Assessment Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Assessment Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Learning Gaps Identified</h4>
                  <div className="space-y-3">
                    {(dashboardData?.learningGaps || []).map((gap, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{gap.concept}</p>
                            <p className="text-sm text-gray-600">{gap.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-red-600">{gap.studentsAffected} students</p>
                            <p className="text-xs text-gray-500">Difficulty: {gap.difficulty}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommended Interventions</h4>
                  <div className="space-y-3">
                    {(dashboardData?.recommendations || []).map((rec, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <LightBulbIcon className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">{rec.intervention}</p>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                            <p className="text-xs text-green-600 mt-1">Expected improvement: {rec.expectedImprovement}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Engagement Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData?.engagementAnalytics || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="onlineEngagement" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Online Engagement" />
                    <Area type="monotone" dataKey="classroomEngagement" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Classroom Engagement" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Learning Outcome Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Outcome Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(dashboardData?.predictions?.successRate || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Predicted Success Rate</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {dashboardData?.predictions?.atRiskStudents || 0}
                      </p>
                      <p className="text-sm text-gray-600">At-Risk Students</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {dashboardData?.predictions?.interventionsNeeded || 0}
                      </p>
                      <p className="text-sm text-gray-600">Interventions Needed</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Predictive Insights</h4>
                    <div className="space-y-2">
                      {(dashboardData?.predictiveInsights || []).map((insight, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">{insight.insight}</p>
                          <p className="text-xs text-gray-600 mt-1">Confidence: {insight.confidence}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EducationDashboard
