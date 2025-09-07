'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ChartBarIcon,
  CpuChipIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { bankingV2Api } from '@/lib/api/bankingV2'
import { formatNumber, formatPercentage } from '@/lib/utils/helpers'
import toast from 'react-hot-toast'

export function BankingAnalyticsV2() {
  const [analytics, setAnalytics] = useState(null)
  const [v1Analytics, setV1Analytics] = useState(null)
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState('v2')

  useEffect(() => {
    loadAnalytics()
  }, [selectedVersion])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      if (selectedVersion === 'both') {
        // Load both versions for comparison
        const [v1Data, v2Data] = await Promise.all([
          bankingV2Api.getBankingAnalytics('v1'),
          bankingV2Api.getBankingAnalytics('v2')
        ])
        
        setV1Analytics(v1Data)
        setAnalytics(v2Data)
        
        const comparisonData = bankingV2Api.comparePerformanceMetrics(v1Data, v2Data)
        setComparison(comparisonData)
      } else {
        const data = await bankingV2Api.getBankingAnalytics(selectedVersion)
        setAnalytics(data)
        setComparison(null)
      }
    } catch (error) {
      toast.error('Failed to load analytics')
      console.error('Analytics loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDataSourceIcon = (source) => {
    switch (source) {
      case 'live_learning_service':
        return <CheckCircleIcon className="w-4 h-4 text-success-500" />
      case 'fallback_estimates':
        return <ExclamationTriangleIcon className="w-4 h-4 text-warning-500" />
      default:
        return <InformationCircleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getEfficiencyIcon = (efficiency) => {
    switch (efficiency) {
      case 'improving':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-success-500" />
      case 'optimized':
        return <CheckCircleIcon className="w-4 h-4 text-success-500" />
      case 'stable':
        return <ClockIcon className="w-4 h-4 text-warning-500" />
      default:
        return <ArrowTrendingDownIcon className="w-4 h-4 text-error-500" />
    }
  }

  const parseAnalytics = (data) => {
    return bankingV2Api.parseV2Analytics(data)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const parsed = analytics ? parseAnalytics(analytics) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enhanced Banking Analytics
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              V2 analytics with AI/Human performance tracking
            </p>
            {parsed && (
              <div className="flex items-center space-x-2">
                {getDataSourceIcon(parsed.dataSource)}
                <Badge variant="outline" size="sm">
                  {parsed.dataSource === 'live_learning_service' ? 'Live Data' : 'Estimates'}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedVersion === 'v1'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedVersion('v1')}
            >
              V1 Only
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedVersion === 'v2'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedVersion('v2')}
            >
              V2 Only
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                selectedVersion === 'both'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedVersion('both')}
            >
              Compare
            </button>
          </div>
          
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {parsed && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Loans
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof parsed.overview.totalLoans === 'number' 
                      ? formatNumber(parsed.overview.totalLoans)
                      : parsed.overview.totalLoans
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Agents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parsed.overview.activeAgents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Processing
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parsed.performance.avgProcessingTime}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Approval Accuracy
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {parsed.performance.approvalAccuracy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI vs Human Performance */}
      {parsed && parsed.performance.aiVsHuman && (
        <Card>
          <CardHeader>
            <CardTitle>AI vs Human Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <CpuChipIcon className="w-6 h-6 text-blue-500" />
                  <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200">
                    AI Performance
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Average Quality:</span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {parsed.performance.aiVsHuman.ai_avg_quality || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Handles simple, low-risk loans with high efficiency
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <UserIcon className="w-6 h-6 text-green-500" />
                  <h4 className="text-lg font-medium text-green-800 dark:text-green-200">
                    Human Performance
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-700 dark:text-green-300">Average Quality:</span>
                    <span className="text-lg font-bold text-green-900 dark:text-green-100">
                      {parsed.performance.aiVsHuman.human_avg_quality || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Handles complex, high-value, and high-risk loans
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Efficiency */}
      {parsed && (
        <Card>
          <CardHeader>
            <CardTitle>System Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {getEfficiencyIcon(parsed.performance.systemEfficiency)}
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                  {parsed.performance.systemEfficiency.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  V2 delegation rules are operating efficiently
                </p>
              </div>
              <Badge 
                variant={parsed.performance.systemEfficiency === 'optimized' ? 'success' : 'warning'} 
                size="sm"
              >
                {parsed.overview.version}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison View */}
      {comparison && selectedVersion === 'both' && (
        <Card>
          <CardHeader>
            <CardTitle>V1 vs V2 Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Processing Time
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>V1:</span>
                      <span>{comparison.processingTime.v1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>V2:</span>
                      <span>{comparison.processingTime.v2}</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {comparison.processingTime.improvement}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Approval Accuracy
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>V1:</span>
                      <span>{comparison.accuracy.v1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>V2:</span>
                      <span>{comparison.accuracy.v2}</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {comparison.accuracy.improvement}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    AI Performance
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>V1:</span>
                      <span>{comparison.aiPerformance.v1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>V2:</span>
                      <span>{comparison.aiPerformance.v2}</span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {comparison.aiPerformance.improvement}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  V2 Advantages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {comparison.insights.v2Advantages.map((advantage, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {advantage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Insights */}
      {parsed && parsed.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parsed.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <LightBulbIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {parsed && parsed.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>V2 Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parsed.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-success-500 mt-0.5" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Rankings */}
      {parsed && parsed.rankings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parsed.rankings.map((agent, index) => (
                <div key={agent.agent_id} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20">
                    <span className="text-sm font-bold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {agent.agent_id}
                        </p>
                        <Badge variant="outline" size="sm">
                          {agent.specialization || 'General'}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {agent.estimated_quality ? 
                            `${(agent.estimated_quality * 100).toFixed(1)}%` :
                            agent.quality_score ? 
                            `${(agent.quality_score * 100).toFixed(1)}%` :
                            'N/A'
                          }
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quality Score
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
