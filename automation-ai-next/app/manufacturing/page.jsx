'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { businessIntelligence } from '@/lib/services/businessIntelligence'
import {
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CpuChipIcon,
  GlobeAltIcon,
  TrophyIcon,
  RocketLaunchIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const SmartManufacturingPage = () => {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard')
  const [marketConditions, setMarketConditions] = useState('stable')
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    marketSize: 790,
    pipelineValue: 2.4,
    efficiency: 47,
    costSavings: 2.1,
    clients: 12,
    aiModels: 156
  })

  // Adaptive data that changes based on market conditions
  const [fortune500Pipeline, setFortune500Pipeline] = useState([])
  const [aiCapabilities, setAiCapabilities] = useState([])
  const [marketIntelligence, setMarketIntelligence] = useState([])
  const [roiData, setRoiData] = useState({})

  // Simulate real-time market condition changes
  useEffect(() => {
    const conditions = ['bull', 'stable', 'bear', 'volatile']
    const interval = setInterval(() => {
      const newCondition = conditions[Math.floor(Math.random() * conditions.length)]
      setMarketConditions(newCondition)
    }, 30000) // Change every 30 seconds for demo

    return () => clearInterval(interval)
  }, [])

  // Update data when market conditions change
  useEffect(() => {
    const updateData = async () => {
      setIsLoading(true)

      try {
        // Generate adaptive data based on current market conditions
        const pipeline = businessIntelligence.generateAdaptivePipeline(marketConditions)
        const capabilities = businessIntelligence.generateAICapabilities()
        const intelligence = businessIntelligence.generateMarketIntelligence(marketConditions)

        // Calculate adaptive ROI for different scenarios
        const roiScenarios = {
          starter: businessIntelligence.calculateAdaptiveROI(2.5, 'automotive', 12, marketConditions),
          enterprise: businessIntelligence.calculateAdaptiveROI(8.7, 'aerospace', 12, marketConditions),
          global: businessIntelligence.calculateAdaptiveROI(25, 'pharmaceuticals', 12, marketConditions)
        }

        setFortune500Pipeline(pipeline)
        setAiCapabilities(capabilities)
        setMarketIntelligence(intelligence)
        setRoiData(roiScenarios)

        // Update metrics based on market conditions
        const adaptation = await businessIntelligence.adaptToMarketConditions({ sector: 'automotive' })
        setMetrics(prev => ({
          ...prev,
          efficiency: Math.round(adaptation.efficiencyTarget * 100),
          costSavings: (prev.costSavings * (1 + adaptation.costReduction)).toFixed(1),
          aiModels: adaptation.aiModelCount
        }))

      } catch (error) {
        console.error('Error updating adaptive data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    updateData()
  }, [marketConditions])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Manufacturing 4.0
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-2">
                Revolutionizing Global Manufacturing with AI-Powered Automation
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="success" className="text-lg px-4 py-2">
                  $790B Market Opportunity
                </Badge>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    marketConditions === 'bull' ? 'bg-green-500 animate-pulse' :
                    marketConditions === 'stable' ? 'bg-blue-500' :
                    marketConditions === 'bear' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Market: {marketConditions.charAt(0).toUpperCase() + marketConditions.slice(1)}
                  </span>
                  {marketConditions !== 'stable' && (
                    <ArrowTrendingUpIcon className={`h-4 w-4 ${
                      marketConditions === 'bull' ? 'text-green-500' :
                      marketConditions === 'bear' ? 'text-red-500 rotate-180' :
                      'text-yellow-500'
                    }`} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Pipeline Value</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">${metrics.pipelineValue}B</p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Efficiency Gain</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{metrics.efficiency}%</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Cost Savings</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">${metrics.costSavings}M</p>
                  </div>
                  <TrophyIcon className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">AI Models</p>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{metrics.aiModels}</p>
                  </div>
                  <CpuChipIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => {
          const url = new URL(window.location)
          url.searchParams.set('tab', value)
          window.history.pushState({}, '', url)
          setActiveTab(value)
        }} defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BuildingOffice2Icon className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <TrophyIcon className="h-4 w-4" />
              Fortune 500
            </TabsTrigger>
            <TabsTrigger value="capabilities" className="flex items-center gap-2">
              <CpuChipIcon className="h-4 w-4" />
              AI Capabilities
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <GlobeAltIcon className="h-4 w-4" />
              Market Intel
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-4 w-4" />
              ROI Calculator
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RocketLaunchIcon className="h-5 w-5 text-blue-500" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Market Penetration</span>
                      <span className="text-sm text-blue-600">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revenue Growth</span>
                      <span className="text-sm text-green-600">+156%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Client Satisfaction</span>
                      <span className="text-sm text-purple-600">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BoltIcon className="h-5 w-5 text-green-500" />
                    Real-Time Operations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Deployments</span>
                      <Badge variant="success">67 Live</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Processing Tasks</span>
                      <Badge variant="primary">1,247</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Uptime</span>
                      <Badge variant="success">99.97%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Response Time</span>
                      <Badge variant="primary">12ms</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fortune 500 Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-gold-500" />
                  Fortune 500 Enterprise Pipeline
                </CardTitle>
                <CardDescription>
                  Strategic partnerships with global manufacturing leaders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fortune500Pipeline.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{client.company}</h3>
                          <Badge variant="outline">{client.industry}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Contract Value: {client.value}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={client.status === 'Negotiation' ? 'success' : 'primary'}
                          className="mb-2"
                        >
                          {client.status}
                        </Badge>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {client.probability}% probability
                        </div>
                        <Progress value={client.probability} className="w-24 h-2 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiCapabilities.map((capability, index) => (
                <Card key={index} className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                  <CardHeader>
                    <CardTitle className="text-lg">{capability.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Accuracy</span>
                        <span className="font-semibold text-green-600">{capability.accuracy}%</span>
                      </div>
                      <Progress value={capability.accuracy} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Deployments</span>
                        <Badge variant="primary">{capability.deployments}</Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Cost Savings</span>
                        <span className="font-semibold text-blue-600">{capability.savings}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Intelligence Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {marketIntelligence.map((intel, index) => (
                <Card key={index} className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{intel.metric}</h3>
                      <ChartBarIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">{intel.value}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{intel.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ROI Calculator Tab */}
          <TabsContent value="roi" className="space-y-6">
            <Card className="bg-gradient-to-br from-gold-50 to-yellow-100 dark:from-yellow-900/20 dark:to-gold-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-gold-500" />
                  ROI Impact Calculator
                </CardTitle>
                <CardDescription>
                  Calculate your potential return on investment with our Smart Manufacturing platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Investment Scenarios</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="font-medium">Starter Package</div>
                        <div className="text-2xl font-bold text-green-600">$2.5M</div>
                        <div className="text-sm text-gray-600">12-month ROI: 240%</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="font-medium">Enterprise Package</div>
                        <div className="text-2xl font-bold text-blue-600">$8.7M</div>
                        <div className="text-sm text-gray-600">12-month ROI: 340%</div>
                      </div>
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                        <div className="font-medium">Global Package</div>
                        <div className="text-2xl font-bold text-purple-600">$25M</div>
                        <div className="text-sm text-gray-600">12-month ROI: 420%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Key Benefits</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">47% efficiency improvement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">$2.1M annual cost savings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">99.97% system uptime</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">6-month implementation</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Implementation Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <div className="font-medium">Discovery & Planning</div>
                          <div className="text-sm text-gray-600">30 days</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <div className="font-medium">Pilot Deployment</div>
                          <div className="text-sm text-gray-600">60 days</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <div className="font-medium">Full Rollout</div>
                          <div className="text-sm text-gray-600">90 days</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default SmartManufacturingPage
