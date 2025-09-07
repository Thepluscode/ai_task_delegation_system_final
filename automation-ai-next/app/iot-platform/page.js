'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CpuChipIcon,
  BoltIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  CircleStackIcon,
  QueueListIcon,
  KeyIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline'

export default function SecureIoTPlatform() {
  const [loading, setLoading] = useState(true)
  const [platformData, setPlatformData] = useState(null)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('security-overview')
  const [authToken, setAuthToken] = useState(null)
  const [securityMetrics, setSecurityMetrics] = useState({
    threatLevel: 'LOW',
    blockedAttacks24h: 247,
    complianceScore: 98.7,
    vulnerabilityScore: 92.4,
    devicesQuarantined: 3,
    securityEvents: 156,
    encryptedConnections: 1847,
    failedLogins: 12
  })

  // Simulate real-time security metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityMetrics(prev => ({
        ...prev,
        blockedAttacks24h: prev.blockedAttacks24h + Math.floor(Math.random() * 3),
        securityEvents: prev.securityEvents + Math.floor(Math.random() * 5),
        encryptedConnections: prev.encryptedConnections + Math.floor(Math.random() * 10),
        failedLogins: prev.failedLogins + Math.floor(Math.random() * 2),
        complianceScore: Math.max(95, Math.min(100, prev.complianceScore + (Math.random() - 0.5) * 0.5)),
        vulnerabilityScore: Math.max(90, Math.min(100, prev.vulnerabilityScore + (Math.random() - 0.5) * 0.3))
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchPlatformData = async () => {
      try {
        setLoading(true)
        setError(null)

        // First authenticate (in production, use proper auth flow)
        const authResponse = await fetch('http://localhost:8011/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'secure_iot_password' })
        })

        let token = null
        if (authResponse.ok) {
          const authData = await authResponse.json()
          token = authData.access_token
          setAuthToken(token)
        }

        // Fetch data from secure IoT service on port 8011
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}

        const [healthResponse, securityResponse] = await Promise.all([
          fetch('http://localhost:8011/health'),
          fetch('http://localhost:8011/api/v1/iot/security/metrics', { headers })
        ])

        if (!healthResponse.ok) {
          throw new Error(`IoT service error: ${healthResponse.status}`)
        }

        const [health, securityData] = await Promise.all([
          healthResponse.json(),
          securityResponse.ok ? securityResponse.json() : null
        ])

        setPlatformData(health)
        if (securityData) {
          setSecurityMetrics(prev => ({ ...prev, ...securityData }))
        }

      } catch (error) {
        console.error('Error fetching IoT platform data:', error)
        setError(error.message)
        // Set fallback data for demo
        setPlatformData({
          status: "operational",
          service: "Secure IoT Integration Service",
          version: "2.0.0-enterprise",
          security_level: "enterprise",
          compliance_frameworks: ["ISO27001", "IEC62443", "NIST_CSF"],
          threat_level: "LOW"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPlatformData()
  }, [])

  const tabs = [
    {
      id: 'security-overview',
      label: 'Security Overview',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="w-5 h-5 text-success-500" />
                <span>Enterprise IoT Security Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Threat Level</span>
                    <ShieldCheckIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">{securityMetrics.threatLevel}</p>
                  <p className="text-xs text-success-600 mt-1">All systems secure</p>
                </div>

                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Compliance Score</span>
                    <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{securityMetrics.complianceScore.toFixed(1)}%</p>
                  <p className="text-xs text-blue-600 mt-1">Multi-framework certified</p>
                </div>

                <div className="p-4 border border-warning-200 dark:border-warning-800 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-warning-700 dark:text-warning-300">Blocked Attacks</span>
                    <ShieldCheckIcon className="w-4 h-4 text-warning-500" />
                  </div>
                  <p className="text-2xl font-bold text-warning-600">{securityMetrics.blockedAttacks24h}</p>
                  <p className="text-xs text-warning-600 mt-1">Last 24 hours</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Frameworks</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Industrial Security</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">IEC 62443</span>
                        <Badge variant="success" size="sm">Certified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">NERC CIP</span>
                        <Badge variant="success" size="sm">Compliant</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Information Security</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ISO 27001</span>
                        <Badge variant="success" size="sm">Certified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">NIST CSF</span>
                        <Badge variant="success" size="sm">Compliant</Badge>
                      </div>
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
      id: 'threat-detection',
      label: 'Threat Detection',
      icon: ExclamationTriangleIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning-500" />
                <span>AI-Powered Threat Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="p-4 border border-error-200 dark:border-error-800 rounded-lg bg-error-50 dark:bg-error-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-error-700 dark:text-error-300">Security Events</span>
                    <ExclamationCircleIcon className="w-4 h-4 text-error-500" />
                  </div>
                  <p className="text-2xl font-bold text-error-600">{securityMetrics.securityEvents}</p>
                  <p className="text-xs text-error-600 mt-1">Real-time monitoring</p>
                </div>

                <div className="p-4 border border-warning-200 dark:border-warning-800 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-warning-700 dark:text-warning-300">Quarantined</span>
                    <ShieldExclamationIcon className="w-4 h-4 text-warning-500" />
                  </div>
                  <p className="text-2xl font-bold text-warning-600">{securityMetrics.devicesQuarantined}</p>
                  <p className="text-xs text-warning-600 mt-1">Devices isolated</p>
                </div>

                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Failed Logins</span>
                    <KeyIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{securityMetrics.failedLogins}</p>
                  <p className="text-xs text-blue-600 mt-1">Authentication attempts</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Vulnerability Score</span>
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">{securityMetrics.vulnerabilityScore.toFixed(1)}%</p>
                  <p className="text-xs text-success-600 mt-1">Security posture</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Threat Categories</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">Unauthorized Access</span>
                    </div>
                    <span className="text-sm text-red-700 dark:text-red-300">Automatic device isolation</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Cog6ToothIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Firmware Tampering</span>
                    </div>
                    <span className="text-sm text-orange-700 dark:text-orange-300">Integrity verification</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Network Intrusion</span>
                    </div>
                    <span className="text-sm text-purple-700 dark:text-purple-300">Traffic analysis & blocking</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'access-control',
      label: 'Access Control',
      icon: LockClosedIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LockClosedIcon className="w-5 h-5 text-primary-500" />
                <span>Role-Based Access Control (RBAC)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Sessions</span>
                    <UserGroupIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{securityMetrics.encryptedConnections}</p>
                  <p className="text-xs text-blue-600 mt-1">Encrypted connections</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">JWT Tokens</span>
                    <KeyIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">Active</p>
                  <p className="text-xs text-success-600 mt-1">Secure authentication</p>
                </div>

                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Security Clearance</span>
                    <EyeIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">5 Levels</p>
                  <p className="text-xs text-purple-600 mt-1">Public → Top Secret</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Clearance Levels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">PUBLIC</span>
                    </div>
                    <span className="text-sm text-green-700 dark:text-green-300">Basic device information</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">INTERNAL</span>
                    </div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Operational metrics</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">CONFIDENTIAL</span>
                    </div>
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">Security configurations</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">RESTRICTED</span>
                    </div>
                    <span className="text-sm text-orange-700 dark:text-orange-300">Critical infrastructure</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-800 dark:text-red-200">TOP SECRET</span>
                    </div>
                    <span className="text-sm text-red-700 dark:text-red-300">National security systems</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'edge-computing',
      label: 'Secure Edge',
      icon: CpuChipIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CpuChipIcon className="w-5 h-5 text-primary-500" />
                <span>Security-Validated Edge Computing</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Edge Nodes</span>
                    <CpuChipIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">247</p>
                  <p className="text-xs text-blue-600 mt-1">Security validated</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Processing Time</span>
                    <BoltIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">&lt;5ms</p>
                  <p className="text-xs text-success-600 mt-1">Security clearance verified</p>
                </div>

                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Encrypted Cache</span>
                    <LockClosedIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">AES-256</p>
                  <p className="text-xs text-purple-600 mt-1">Decision caching</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edge Security Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Permission Validation</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Every edge task validated against user permissions and security clearance
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Audit Trails</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Complete audit logging for all edge decisions and actions
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Enabled</span>
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
      id: 'compliance',
      label: 'Compliance',
      icon: DocumentTextIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                <span>Regulatory Compliance Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">ISO 27001</span>
                    <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">98.7%</p>
                  <p className="text-xs text-blue-600 mt-1">Compliance score</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">IEC 62443</span>
                    <ShieldCheckIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">Certified</p>
                  <p className="text-xs text-success-600 mt-1">Industrial security</p>
                </div>

                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">NIST CSF</span>
                    <DocumentTextIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">Level 4</p>
                  <p className="text-xs text-purple-600 mt-1">Adaptive framework</p>
                </div>

                <div className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">NERC CIP</span>
                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">Compliant</p>
                  <p className="text-xs text-orange-600 mt-1">Critical infrastructure</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compliance Reports</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Assessment Report</span>
                    <Badge variant="success" size="sm">Generated</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vulnerability Scan Results</span>
                    <Badge variant="success" size="sm">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audit Trail Export</span>
                    <Badge variant="primary" size="sm">Available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'device-management',
      label: 'Device Security',
      icon: Cog6ToothIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cog6ToothIcon className="w-5 h-5 text-primary-500" />
                <span>Secure Device Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Secure Devices</span>
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">1,847</p>
                  <p className="text-xs text-success-600 mt-1">Encrypted connections</p>
                </div>

                <div className="p-4 border border-warning-200 dark:border-warning-800 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-warning-700 dark:text-warning-300">Quarantined</span>
                    <ExclamationTriangleIcon className="w-4 h-4 text-warning-500" />
                  </div>
                  <p className="text-2xl font-bold text-warning-600">{securityMetrics.devicesQuarantined}</p>
                  <p className="text-xs text-warning-600 mt-1">Security isolation</p>
                </div>

                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Security Score</span>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{securityMetrics.vulnerabilityScore.toFixed(1)}</p>
                  <p className="text-xs text-blue-600 mt-1">Average device score</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Security Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Identity Protection</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Device ID hashing for privacy</li>
                      <li>• Encrypted metadata storage</li>
                      <li>• Security classification tagging</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Threat Response</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Automatic device isolation</li>
                      <li>• Firmware integrity verification</li>
                      <li>• Incident response automation</li>
                    </ul>
                  </div>
                </div>
              </div>
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
          <p className="mt-4 text-gray-600">Loading Secure IoT Platform...</p>
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
              Secure IoT Integration Service
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Enterprise-grade IoT security with multi-framework compliance
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
              Unable to connect to the IoT Integration Service. Please ensure the service is running on port 8011.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
            <ShieldCheckIcon className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Secure IoT Integration Service
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                Enterprise-grade IoT security with multi-framework compliance
              </p>
              {platformData && (
                <Badge variant="success" size="sm">
                  {platformData.threat_level || 'LOW'} THREAT
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Threat Level</p>
                <p className="text-2xl font-bold text-success-600">{securityMetrics.threatLevel}</p>
                <p className="text-xs text-gray-500">All systems secure</p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blocked Attacks</p>
                <p className="text-2xl font-bold text-warning-600">{securityMetrics.blockedAttacks24h}</p>
                <p className="text-xs text-gray-500">Last 24 hours</p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-warning-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                <p className="text-2xl font-bold text-blue-600">{securityMetrics.complianceScore.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Multi-framework</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Events</p>
                <p className="text-2xl font-bold text-purple-600">{securityMetrics.securityEvents}</p>
                <p className="text-xs text-gray-500">Real-time monitoring</p>
              </div>
              <ExclamationCircleIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-primary-500" />
            <span>Enterprise IoT Security Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Authentication & Authorization</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• JWT-based authentication</li>
                <li>• Role-based access control</li>
                <li>• Security clearance levels</li>
                <li>• Failed login tracking</li>
              </ul>
            </div>

            <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
              <h4 className="font-medium text-success-800 dark:text-success-200 mb-2">Data Protection</h4>
              <ul className="text-sm text-success-700 dark:text-success-300 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• Device ID hashing</li>
                <li>• Security classification</li>
                <li>• Secure transmission</li>
              </ul>
            </div>

            <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Compliance & Audit</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Comprehensive audit logging</li>
                <li>• Compliance tracking</li>
                <li>• Security event monitoring</li>
                <li>• Regulatory reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
