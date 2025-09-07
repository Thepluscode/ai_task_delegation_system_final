'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CpuChipIcon,
  ChartBarIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  BeakerIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import { useLearningDashboard, useLearningServiceStatus, useLearningInsightsAnalysis } from '@/lib/hooks/useLearning'
import { learningApi } from '@/lib/api/learning'
import { formatNumber, formatPercentage } from '@/lib/utils/helpers'

export function LearningDashboard() {
  const { dashboard, isLoading: dashboardLoading, error: dashboardError, mutate } = useLearningDashboard()
  const { serviceInfo, isLoading: serviceLoading, error: serviceError } = useLearningServiceStatus()
  const { insights, getInsightsSummary, getHighImpactInsights } = useLearningInsightsAnalysis()

  const [selectedMetric, setSelectedMetric] = useState('overview')

  const getServiceStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-success-500'
      case 'degraded':
        return 'text-warning-500'
      case 'offline':
        return 'text-error-500'
      default:
        return 'text-gray-500'
    }
  }

  const getServiceStatusIcon = (status) => {
    const iconProps = { className: "w-5 h-5" }
    
    switch (status) {
      case 'running':
        return <CheckCircleIcon {...iconProps} className="text-success-500" />
      case 'degraded':
        return <ExclamationTriangleIcon {...iconProps} className="text-warning-500" />
      case 'offline':
        return <ExclamationTriangleIcon {...iconProps} className="text-error-500" />
      default:
        return <ClockIcon {...iconProps} className="text-gray-500" />
    }
  }

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-success-500" />
      case 'needs_attention':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-error-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-warning-500" />
    }
  }

  const getMaturityColor = (maturity) => {
    if (maturity >= 0.8) return 'text-success-500'
    if (maturity >= 0.6) return 'text-warning-500'
    return 'text-error-500'
  }

  const getRecommendationQualityColor = (quality) => {
    return learningApi.getRecommendationQualityColor(quality)
  }

  if (serviceError || dashboardError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Learning Service Connection Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to connect to the AI Learning Service. Please ensure the service is running on port 8004.
            </p>
            <Button onClick={() => mutate()} className="mt-4">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (serviceLoading || dashboardLoading) {
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

  const insightsSummary = getInsightsSummary()
  const highImpactInsights = getHighImpactInsights()

  return (
    <div className="space-y-6">
      {/* Service Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <CpuChipIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>AI Learning Service</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {serviceInfo && getServiceStatusIcon(serviceInfo.status)}
                  <span className={`text-sm font-medium ${getServiceStatusColor(serviceInfo?.status)}`}>
                    {serviceInfo?.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <Badge variant="outline" size="sm">
                    ML-Powered
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => mutate()}
                className="flex items-center space-x-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <BeakerIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Training Samples
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(dashboard.system_overview.total_training_samples)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Agents Profiled
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.system_overview.agents_profiled}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Task Types Analyzed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.system_overview.task_types_analyzed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <LightBulbIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Insights Generated
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboard.system_overview.insights_generated}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Trends */}
      {dashboard && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Recent Success Rate
                  </span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(dashboard.performance_trends.trend_direction)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPercentage(dashboard.performance_trends.recent_success_rate)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Quality Score
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatPercentage(dashboard.performance_trends.recent_quality_score)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Prediction Accuracy
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatPercentage(dashboard.performance_trends.duration_prediction_accuracy)}
                  </span>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(dashboard.performance_trends.trend_direction)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      System is {dashboard.performance_trends.trend_direction.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Model Maturity
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getMaturityColor(dashboard.learning_status.model_maturity)}`}>
                      {formatPercentage(dashboard.learning_status.model_maturity)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence Level
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatPercentage(dashboard.learning_status.confidence_level)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Recommendation Quality
                  </span>
                  <Badge 
                    variant={dashboard.learning_status.recommendation_quality === 'high' ? 'success' : 
                            dashboard.learning_status.recommendation_quality === 'medium' ? 'warning' : 'error'}
                    size="sm"
                  >
                    {dashboard.learning_status.recommendation_quality.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dashboard.learning_status.model_maturity * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Model Training Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      {dashboard && dashboard.top_performers && dashboard.top_performers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.top_performers.map((performer, index) => (
                <div key={performer.agent_id} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20">
                    <span className="text-sm font-bold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {performer.agent_id}
                        </p>
                        <Badge variant="outline" size="sm">
                          Top Performer
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatPercentage(performer.quality_score)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quality Score
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${performer.quality_score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complex Tasks */}
      {dashboard && dashboard.complex_tasks && dashboard.complex_tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Complex Task Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.complex_tasks.map((task, index) => (
                <div key={task.task_type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40">
                      <span className="text-xs font-bold text-orange-600">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {task.task_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-orange-600">
                      {(task.complexity_score * 100).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500">complexity</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Impact Insights */}
      {highImpactInsights && highImpactInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>High Impact Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highImpactInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <span className="text-lg">
                        {learningApi.getInsightTypeIcon(insight.insights_type)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="outline" 
                          size="sm"
                          className={learningApi.getInsightTypeColor(insight.insights_type)}
                        >
                          {insight.insights_type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Impact: {(insight.impact_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        {insight.description}
                      </p>
                      
                      <div className="space-y-1">
                        {insight.actionable_recommendations.slice(0, 2).map((rec, recIndex) => (
                          <div key={recIndex} className="flex items-start space-x-2">
                            <span className="text-xs text-blue-500 mt-1">•</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {rec}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Capabilities */}
      {serviceInfo && serviceInfo.capabilities && (
        <Card>
          <CardHeader>
            <CardTitle>AI Learning Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {serviceInfo.capabilities.map((capability) => (
                <div key={capability} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <AcademicCapIcon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {capability.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
