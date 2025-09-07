'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheckIcon, 
  CpuChipIcon, 
  GlobeAltIcon, 
  LockClosedIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function IoTLandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Enterprise Security",
      description: "Military-grade encryption and multi-layer security protocols protecting your IoT infrastructure"
    },
    {
      icon: CpuChipIcon,
      title: "Edge Computing",
      description: "Real-time processing at the edge with 247 security-validated nodes worldwide"
    },
    {
      icon: ChartBarIcon,
      title: "AI-Powered Analytics",
      description: "Advanced threat detection and predictive analytics powered by machine learning"
    },
    {
      icon: GlobeAltIcon,
      title: "Global Compliance",
      description: "ISO27001, IEC62443, NIST CSF, and NERC CIP compliance frameworks"
    },
    {
      icon: LockClosedIcon,
      title: "Zero Trust Architecture",
      description: "Role-based access control with security clearance levels and audit logging"
    },
    {
      icon: UserGroupIcon,
      title: "Enterprise Management",
      description: "Centralized device management with real-time monitoring and control"
    }
  ]

  const stats = [
    { label: "Devices Protected", value: "10M+", icon: ShieldCheckIcon },
    { label: "Security Events/Day", value: "2.5B", icon: ChartBarIcon },
    { label: "Global Nodes", value: "247", icon: GlobeAltIcon },
    { label: "Uptime SLA", value: "99.99%", icon: CheckCircleIcon }
  ]

  const handleGetStarted = () => {
    router.push('/iot/register')
  }

  const handleLogin = () => {
    router.push('/iot/login')
  }

  const handleDemo = () => {
    router.push('/iot-platform')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <ShieldCheckIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Secure IoT
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Enterprise-grade IoT security platform with AI-powered threat detection, 
              global compliance, and billion-dollar scaling capabilities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                Get Started Free
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                onClick={handleLogin}
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                Sign In
              </Button>
              
              <Button 
                onClick={handleDemo}
                variant="ghost"
                size="lg"
                className="px-8 py-4 text-lg"
              >
                View Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Enterprise-Grade Security Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive IoT security platform designed for billion-dollar enterprises 
              with advanced threat detection and global compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                    <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Secure Your IoT Infrastructure?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of enterprises protecting their IoT devices with our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Start Free Trial
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              onClick={() => window.open('mailto:contact@iot-security.com')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure IoT Platform</h3>
            <p className="text-gray-400 mb-4">
              Enterprise-grade IoT security with billion-dollar scaling capabilities
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Security</a>
              <a href="#" className="hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
