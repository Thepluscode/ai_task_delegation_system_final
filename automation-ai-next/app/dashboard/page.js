'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BanknotesIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [serviceStatus, setServiceStatus] = useState({})
  const [platformStats, setPlatformStats] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Platform Overview', icon: ChartBarIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'system', name: 'System Health', icon: ExclamationTriangleIcon },
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Load platform stats
    setPlatformStats({
      totalTasks: 15420,
      activeAgents: 47,
      completionRate: 94.2,
      systemUptime: 99.8,
      servicesOnline: 0,
      totalPlatforms: 10
    })

    // Check service status
    checkAllServices()
  }, [isAuthenticated, router])

  const platforms = [
    {
      id: 'ai-delegation',
      title: 'AI Task Delegation',
      description: 'Core AI engine with 95%+ accuracy',
      icon: CpuChipIcon,
      href: '/ai/delegation',
      color: 'blue',
      service: 'AI Delegation',
      port: 8005,
      metrics: { tasks: '15.4K', accuracy: '95%' }
    },
    {
      id: 'agents',
      title: 'Agent Management',
      description: '47+ AI agents across platforms',
      icon: UserGroupIcon,
      href: '/agents',
      color: 'purple',
      service: 'AI Delegation',
      port: 8005,
      metrics: { agents: '47', active: '42' }
    },
    {
      id: 'banking',
      title: 'Banking Platform',
      description: 'Financial services automation',
      icon: BanknotesIcon,
      href: '/banking',
      color: 'green',
      service: 'Banking',
      port: 8005,
      metrics: { compliance: 'PCI DSS', transactions: '2.1M' }
    },
    {
      id: 'healthcare',
      title: 'Healthcare Platform',
      description: 'Medical automation with HIPAA',
      icon: HeartIcon,
      href: '/healthcare',
      color: 'red',
      service: 'Healthcare',
      port: 8012,
      metrics: { compliance: 'HIPAA', patients: '150K' }
    },
    {
      id: 'iot',
      title: 'IoT Security Platform',
      description: '10M+ devices, 2.5B events/day',
      icon: ShieldCheckIcon,
      href: '/iot-platform',
      color: 'indigo',
      service: 'IoT Integration',
      port: 8011,
      metrics: { devices: '10M+', events: '2.5B/day' }
    },
    {
      id: 'manufacturing',
      title: 'Smart Manufacturing',
      description: 'Industrial automation & QC',
      icon: WrenchScrewdriverIcon,
      href: '/manufacturing',
      color: 'orange',
      service: 'Manufacturing',
      port: 8013,
      metrics: { compliance: 'ISO 9001', efficiency: '+45%' }
    },
    {
      id: 'edge',
      title: 'Edge Computing',
      description: '247 nodes, sub-10ms decisions',
      icon: RocketLaunchIcon,
      href: '/edge',
      color: 'cyan',
      service: 'Edge Computing',
      port: 8006,
      metrics: { nodes: '247', latency: '<10ms' }
    },
    {
      id: 'robots',
      title: 'Robot Fleet',
      description: 'Universal robot control',
      icon: Cog6ToothIcon,
      href: '/robots',
      color: 'emerald',
      service: 'Robot Protocol',
      port: 8004,
      metrics: { robots: '23', brands: '5' }
    }
  ]

  const checkAllServices = async () => {
    setRefreshing(true)
    const status = {}
    let onlineCount = 0

    for (const platform of platforms) {
      try {
        const response = await fetch(`http://localhost:${platform.port}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        })
        status[platform.service] = response.ok
        if (response.ok) onlineCount++
      } catch (error) {
        status[platform.service] = false
      }
    }

    setServiceStatus(status)
    setPlatformStats(prev => ({ ...prev, servicesOnline: onlineCount }))
    setRefreshing(false)
  }

  const handleRefresh = () => {
    checkAllServices()
  }

  const getServiceStatus = (serviceName) => {
    return serviceStatus[serviceName] !== undefined ? serviceStatus[serviceName] : null
  }

  const getStatusColor = (status) => {
    if (status === null) return 'text-gray-400'
    return status ? 'text-green-500' : 'text-red-500'
  }

  const getStatusIcon = (status) => {
    if (status === null) return ClockIcon
    return status ? CheckCircleIcon : XCircleIcon
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive view of your automation platform performance
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Badge variant="success" className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-success-500" />
            <span>All Systems Operational</span>
          </Badge>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            variant="primary"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Configure</span>
          </Button>
        </div>
      </div>

      {/* Platform Content */}
        <div className="space-y-8">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {platformStats.totalTasks?.toLocaleString()}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {platformStats.activeAgents}
                  </p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {platformStats.completionRate}%
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Services Online</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {platformStats.servicesOnline}/{platforms.length}
                  </p>
                </div>
                <Cog6ToothIcon className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Platform Grid */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Platform Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {platforms.map((platform) => {
                const serviceOnline = getServiceStatus(platform.service)
                const StatusIcon = getStatusIcon(serviceOnline)

                return (
                  <Card
                    key={platform.id}
                    className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800"
                    onClick={() => router.push(platform.href)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg bg-${platform.color}-100 dark:bg-${platform.color}-900/30`}>
                          <platform.icon className={`w-6 h-6 text-${platform.color}-600 dark:text-${platform.color}-400`} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(serviceOnline)}`} />
                          <span className={`text-xs font-medium ${getStatusColor(serviceOnline)}`}>
                            {serviceOnline === null ? 'Checking...' : serviceOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {platform.title}
                      </h4>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                        {platform.description}
                      </p>

                      <div className="space-y-2">
                        {Object.entries(platform.metrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400 capitalize">{key}:</span>
                            <span className="font-medium text-gray-700 dark:text-gray-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
    </div>
  )
}
