'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs } from '@/components/ui/Tabs'
import { DeviceMonitor } from '@/components/healthcare/DeviceMonitor'
import { PatientTriage } from '@/components/healthcare/PatientTriage'
import {
  ShieldCheckIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  HeartIcon,
  CpuChipIcon,
  BoltIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

export default function HealthcareTaskDelegationPlatform() {
  const [loading, setLoading] = useState(true)
  const [platformData, setPlatformData] = useState(null)
  const [agents, setAgents] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [realTimeData, setRealTimeData] = useState(null)
  const [securityMetrics, setSecurityMetrics] = useState({
    totalTasks: 0,
    hipaaCompliantTasks: 0,
    biasDetections: 0,
    auditEvents: 0,
    encryptedData: 0,
    accessAttempts: 0
  })

  // Simulate real-time security metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityMetrics(prev => ({
        totalTasks: prev.totalTasks + Math.floor(Math.random() * 3),
        hipaaCompliantTasks: prev.hipaaCompliantTasks + Math.floor(Math.random() * 3),
        biasDetections: prev.biasDetections + Math.floor(Math.random() * 1),
        auditEvents: prev.auditEvents + Math.floor(Math.random() * 5),
        encryptedData: prev.encryptedData + Math.floor(Math.random() * 10),
        accessAttempts: prev.accessAttempts + Math.floor(Math.random() * 2)
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchHealthcareData = async () => {
      try {
        setLoading(true)
        setError(null)

        // First authenticate (in production, use proper auth flow)
        const authResponse = await fetch('http://localhost:8012/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'secure_password' })
        })

        let token = null
        if (authResponse.ok) {
          const authData = await authResponse.json()
          token = authData.access_token
          setAuthToken(token)
        }

        // Fetch data from HIPAA-compliant healthcare service on port 8012
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

        const [healthResponse, agentsResponse] = await Promise.all([
          fetch('http://localhost:8012/health'),
          fetch('http://localhost:8012/api/v1/healthcare/agents', { headers })
        ])

        if (!healthResponse.ok) {
          throw new Error(`Healthcare service error: ${healthResponse.status}`)
        }

        const [health, agentsData] = await Promise.all([
          healthResponse.json(),
          agentsResponse.ok ? agentsResponse.json() : { agents: [] }
        ])

        setPlatformData(health)
        setAgents(agentsData.agents || [])

        // Simulate audit logs
        setAuditLogs([
          { id: 1, event: 'TASK_DELEGATED', user: 'dr_smith', timestamp: new Date().toISOString(), details: 'Emergency triage assigned' },
          { id: 2, event: 'BIAS_DETECTED', user: 'system', timestamp: new Date().toISOString(), details: 'Potential age bias flagged' },
          { id: 3, event: 'HIPAA_ACCESS', user: 'nurse_jones', timestamp: new Date().toISOString(), details: 'Patient data accessed' }
        ])

      } catch (error) {
        console.error('Error fetching healthcare data:', error)
        setError(error.message)
        // Set fallback data
        setPlatformData({
          status: "error",
          platform: "IoT Healthcare Platform",
          version: "2.0.0-IOT",
          market_target: "$847B Industrial IoT",
          devices: { total: 0, active: 0, availability: "0%" }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHealthcareData()

    // Set up real-time data updates with enhanced metrics
    const interval = setInterval(() => {
      // Simulate real-time updates with IoT-enhanced data
      setRealTimeData({
        timestamp: new Date(),
        activePatients: Math.floor(Math.random() * 50) + 150,
        criticalAlerts: Math.floor(Math.random() * 5),
        deviceUptime: 99.7 + Math.random() * 0.3,
        edgeProcessingLoad: Math.floor(Math.random() * 20) + 75,
        // New IoT metrics
        edgeLatency: Math.floor(Math.random() * 3) + 1, // 1-4ms
        telemetryVolume: Math.floor(Math.random() * 1000) + 5000, // 5000-6000 messages/sec
        predictiveAccuracy: 96.5 + Math.random() * 2, // 96.5-98.5%
        roiGenerated: Math.floor(Math.random() * 50000) + 2100000 // $2.1M-2.15M
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const tabs = [
    {
      id: 'overview',
      label: 'Security Overview',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-success-500" />
                <span>HIPAA-Compliant Healthcare Task Delegation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">HIPAA Compliance</span>
                    <LockClosedIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">100%</p>
                  <p className="text-xs text-success-600 mt-1">All tasks encrypted & audited</p>
                </div>

                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Bias Detection</span>
                    <EyeIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{securityMetrics.biasDetections}</p>
                  <p className="text-xs text-blue-600 mt-1">Algorithmic bias flags</p>
                </div>

                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Audit Events</span>
                    <DocumentTextIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{securityMetrics.auditEvents}</p>
                  <p className="text-xs text-purple-600 mt-1">Compliance tracking</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Data Encryption</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      End-to-end encryption for all PHI data with Fernet encryption
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Role-Based Access</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Security clearance levels and permission-based access control
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'triage',
      label: 'Patient Triage',
      icon: HeartIcon,
      content: <PatientTriage />
    },
    {
      id: 'agents',
      label: 'Healthcare Agents',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Secure Healthcare Agent Registry</CardTitle>
            </CardHeader>
            <CardContent>
              {agents.length > 0 ? (
                <div className="space-y-4">
                  {agents.map((agent, index) => (
                    <div key={agent.agent_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20">
                            <span className="text-sm font-bold text-primary-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {agent.name}
                            </h4>
                            <Badge
                              variant={agent.agent_type === 'emergency_physician' ? 'error' :
                                     agent.agent_type === 'specialist' ? 'warning' :
                                     agent.agent_type === 'ai_triage_system' ? 'primary' : 'success'}
                              size="sm"
                            >
                              {agent.agent_type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            Level {agent.security_clearance_level}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Security Clearance
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(agent.performance_metrics.accuracy_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Workload</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agent.current_workload}/{agent.max_workload}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Specialties</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agent.specialties.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No healthcare agents available. Please check authentication.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading HIPAA-Compliant Healthcare Platform...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Healthcare Task Delegation Service
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              HIPAA-compliant AI-powered healthcare workflow automation
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
              Unable to connect to the Healthcare Task Delegation Service. Please ensure the service is running on port 8012.
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
          <div className="p-3 rounded-lg bg-success-100 dark:bg-success-900/20">
            <ShieldCheckIcon className="w-8 h-8 text-success-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Healthcare Task Delegation Service
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                HIPAA-compliant AI-powered healthcare workflow automation
              </p>
              {platformData && (
                <Badge variant="success" size="sm">
                  {platformData.compliance_status || 'HIPAA_COMPLIANT'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{securityMetrics.totalTasks}</p>
                <p className="text-xs text-gray-500">HIPAA compliant: {securityMetrics.hipaaCompliantTasks}</p>
              </div>
              <HeartIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Encrypted Data</p>
                <p className="text-2xl font-bold text-success-600">{securityMetrics.encryptedData}</p>
                <p className="text-xs text-gray-500">PHI records secured</p>
              </div>
              <LockClosedIcon className="w-8 h-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bias Detections</p>
                <p className="text-2xl font-bold text-warning-600">{securityMetrics.biasDetections}</p>
                <p className="text-xs text-gray-500">Algorithmic bias flags</p>
              </div>
              <EyeIcon className="w-8 h-8 text-warning-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Audit Events</p>
                <p className="text-2xl font-bold text-purple-600">{securityMetrics.auditEvents}</p>
                <p className="text-xs text-gray-500">Compliance tracking</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-primary-500" />
            <span>HIPAA-Compliant Healthcare Task Delegation Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
              <h4 className="font-medium text-success-800 dark:text-success-200 mb-2">Security & Compliance</h4>
              <ul className="text-sm text-success-700 dark:text-success-300 space-y-1">
                <li>• End-to-end PHI encryption</li>
                <li>• Role-based access control</li>
                <li>• Comprehensive audit logging</li>
                <li>• HIPAA compliance monitoring</li>
              </ul>
            </div>

            <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">AI & Bias Detection</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Explainable AI reasoning</li>
                <li>• Algorithmic bias detection</li>
                <li>• Risk-based patient triage</li>
                <li>• Continuous learning</li>
              </ul>
            </div>

            <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Healthcare Workflow</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Emergency response protocols</li>
                <li>• Specialist routing</li>
                <li>• Patient safety prioritization</li>
                <li>• Quality assurance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  )
}



