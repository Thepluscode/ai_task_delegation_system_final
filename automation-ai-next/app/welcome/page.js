'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  CpuChipIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  BanknotesIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  BeakerIcon,
  Cog6ToothIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function WelcomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeAgents: 0,
    completionRate: 0,
    systemUptime: 0,
    servicesOnline: 0,
    totalPlatforms: 0
  })

  const [serviceStatus, setServiceStatus] = useState({})

  useEffect(() => {
    // Load platform stats
    setStats({
      totalTasks: 15420,
      activeAgents: 47,
      completionRate: 94.2,
      systemUptime: 99.8,
      servicesOnline: 12,
      totalPlatforms: 10
    })

    // Check service status
    checkServiceStatus()
  }, [])

  const checkServiceStatus = async () => {
    const services = [
      { name: 'IoT Integration', port: 8011 },
      { name: 'Healthcare', port: 8012 },
      { name: 'Banking', port: 8005 },
      { name: 'AI Delegation', port: 8005 },
      { name: 'Edge Computing', port: 8006 },
      { name: 'Robot Protocol', port: 8004 }
    ]

    const status = {}
    for (const service of services) {
      try {
        const response = await fetch(`http://localhost:${service.port}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000)
        })
        status[service.name] = response.ok
      } catch (error) {
        status[service.name] = false
      }
    }
    setServiceStatus(status)
  }

  const platforms = [
    {
      id: 'ai-delegation',
      title: 'AI Task Delegation',
      description: 'Intelligent task assignment with ML-powered optimization and 95%+ accuracy',
      icon: CpuChipIcon,
      href: '/ai/delegation',
      color: 'blue',
      status: 'active',
      metrics: '15.4K tasks processed',
      service: 'AI Delegation'
    },
    {
      id: 'agents',
      title: 'Agent Management',
      description: 'Manage and monitor 47+ AI agents across all industry platforms',
      icon: UserGroupIcon,
      href: '/agents',
      color: 'purple',
      status: 'active',
      metrics: '47 active agents',
      service: 'AI Delegation'
    },
    {
      id: 'banking',
      title: 'Banking Platform',
      description: 'Financial services automation with Basel III and SOX compliance',
      icon: BanknotesIcon,
      href: '/banking',
      color: 'green',
      status: 'active',
      metrics: 'PCI DSS compliant',
      service: 'Banking'
    },
    {
      id: 'healthcare',
      title: 'Healthcare Platform',
      description: 'Medical automation with HIPAA compliance and FDA regulations',
      icon: HeartIcon,
      href: '/healthcare',
      color: 'red',
      status: 'active',
      metrics: 'HIPAA certified',
      service: 'Healthcare'
    },
    {
      id: 'iot',
      title: 'IoT Security Platform',
      description: 'Enterprise IoT security managing 10M+ devices with 2.5B events/day',
      icon: ShieldCheckIcon,
      href: '/iot-platform',
      color: 'indigo',
      status: 'active',
      metrics: '10M+ devices',
      service: 'IoT Integration'
    },
    {
      id: 'manufacturing',
      title: 'Smart Manufacturing',
      description: 'Industrial automation with predictive maintenance and quality control',
      icon: WrenchScrewdriverIcon,
      href: '/manufacturing',
      color: 'orange',
      status: 'active',
      metrics: 'ISO 9001 certified',
      service: 'Manufacturing'
    }
  ]

  const handlePlatformAccess = (platform) => {
    if (!isAuthenticated) {
      // Store intended destination and redirect to login
      localStorage.setItem('redirectAfterLogin', platform.href)
      router.push('/login')
    } else {
      router.push(platform.href)
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    }
    return colors[color] || colors.blue
  }

  const getServiceStatus = (serviceName) => {
    return serviceStatus[serviceName] !== undefined ? serviceStatus[serviceName] : null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Task Delegation System</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Billion-Dollar Enterprise Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user?.name || 'User'}
                </span>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                Enterprise AI
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Task Delegation System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Billion-dollar automation platform with 10+ industry-specific dashboards,
                20+ microservices, and AI-powered task delegation across Banking, Healthcare,
                IoT, Manufacturing, and Edge Computing.
              </p>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTasks.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Processed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.activeAgents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.systemUptime}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
                >
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 text-lg"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Platform Overview */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Industry-Leading Automation Platforms
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Access specialized automation platforms designed for specific industries,
              each with enterprise-grade security, compliance, and AI optimization.
            </p>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platforms.map((platform) => {
              const serviceOnline = getServiceStatus(platform.service)
              return (
                <Card
                  key={platform.id}
                  className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 dark:hover:border-blue-800"
                  onClick={() => handlePlatformAccess(platform)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${getColorClasses(platform.color)} text-white`}>
                        <platform.icon className="w-8 h-8" />
                      </div>
                      <div className="flex items-center space-x-2">
                        {serviceOnline !== null && (
                          <div className={`w-3 h-3 rounded-full ${serviceOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                        )}
                        <span className={`text-xs font-medium ${serviceOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {serviceOnline === null ? 'Checking...' : serviceOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {platform.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                      {platform.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {platform.metrics}
                      </span>
                      <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              )
            })}
          </div>
        </div>

        {/* Business Value Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 bg-white/50 dark:bg-gray-800/50 rounded-2xl mx-6 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Proven Business Impact
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join Fortune 500 companies achieving measurable results with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="p-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">$2M+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Annual Cost Savings</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">40-60%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency Improvement</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.99%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">10M+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Devices Protected</div>
            </Card>
          </div>

          {!isAuthenticated && (
            <div className="text-center mt-12">
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <CpuChipIcon className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">AI Task Delegation</span>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise automation platform with billion-dollar scaling capabilities
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platforms</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/banking" className="hover:text-white">Banking</a></li>
                <li><a href="/healthcare" className="hover:text-white">Healthcare</a></li>
                <li><a href="/iot-platform" className="hover:text-white">IoT Security</a></li>
                <li><a href="/manufacturing" className="hover:text-white">Manufacturing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/ai/delegation" className="hover:text-white">AI Delegation</a></li>
                <li><a href="/edge" className="hover:text-white">Edge Computing</a></li>
                <li><a href="/robots" className="hover:text-white">Robot Control</a></li>
                <li><a href="/analytics" className="hover:text-white">Analytics</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/security" className="hover:text-white">Security</a></li>
                <li><a href="/compliance" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AI Task Delegation System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
