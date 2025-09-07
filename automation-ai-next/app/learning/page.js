'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { LearningDashboard } from '@/components/learning/LearningDashboard'
import { FeedbackSubmission } from '@/components/learning/FeedbackSubmission'
import { 
  CpuChipIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  LightBulbIcon,
  BeakerIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { useLearningServiceStatus, useLearningDashboard, useAgentRankings, useLearningInsightsAnalysis } from '@/lib/hooks/useLearning'
import { learningApi } from '@/lib/api/learning'

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  
  const { serviceInfo, isLoading: serviceLoading, error: serviceError } = useLearningServiceStatus()
  const { dashboard } = useLearningDashboard()
  const { rankings } = useAgentRankings()
  const { insights, getInsightsSummary } = useLearningInsightsAnalysis()

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
    const iconProps = { className: "w-6 h-6" }
    
    switch (status) {
      case 'running':
        return <CheckCircleIcon {...iconProps} className="text-success-500" />
      case 'degraded':
        return <ExclamationTriangleIcon {...iconProps} className="text-warning-500" />
      case 'offline':
        return <ExclamationTriangleIcon {...iconProps} className="text-error-500" />
      default:
        return <CpuChipIcon {...iconProps} className="text-gray-500" />
    }
  }

  const tabs = [
    {
      id: 'dashboard',
      label: 'Learning Dashboard',
      icon: ChartBarIcon,
      content: <LearningDashboard />
    },
    {
      id: 'feedback',
      label: 'Submit Feedback',
      icon: PaperAirplaneIcon,
      content: <FeedbackSubmission />
    },
    {
      id: 'agents',
      label: 'Agent Performance',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              {rankings && rankings.rankings ? (
                <div className="space-y-4">
                  {rankings.rankings.map((agent, index) => (
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
                              {agent.agent_id}
                            </h4>
                            <Badge variant="outline" size="sm">
                              {agent.specialization}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {(agent.composite_score * 100).toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Composite Score
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(agent.success_rate * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Quality Score</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(agent.quality_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Efficiency</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(agent.efficiency_score * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agent.total_tasks}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${agent.composite_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No agent performance data available yet. Submit feedback to start building agent profiles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: LightBulbIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {insights && insights.insights ? (
                <div className="space-y-6">
                  {/* Insights Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {insights.total_insights}
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">Total Insights</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {insights.categories?.performance_optimization || 0}
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200">Performance</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {insights.categories?.agent_recommendations || 0}
                      </p>
                      <p className="text-sm text-purple-800 dark:text-purple-200">Agent Insights</p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {insights.categories?.system_improvements || 0}
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200">System</p>
                    </div>
                  </div>

                  {/* Recent Insights */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Recent Insights
                    </h3>
                    
                    {insights.insights.slice(0, 5).map((insight, index) => (
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
                              <span className="text-xs text-gray-400">
                                {new Date(insight.generated_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              {insight.description}
                            </p>
                            
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Recommendations:
                              </p>
                              {insight.actionable_recommendations.map((rec, recIndex) => (
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <LightBulbIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No insights generated yet. Submit more feedback to enable AI-powered insights.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'test',
      label: 'Service Test',
      icon: BeakerIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Service Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Service Connection Test
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Test the connection to the AI Learning Service and verify all endpoints are working correctly.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Service Status
                    </h5>
                    <div className="flex items-center space-x-2">
                      {serviceInfo && getServiceStatusIcon(serviceInfo.status)}
                      <span className={`text-sm font-medium ${getServiceStatusColor(serviceInfo?.status)}`}>
                        {serviceInfo?.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    {serviceInfo && (
                      <p className="text-xs text-gray-500 mt-1">
                        {serviceInfo.training_samples} training samples, {serviceInfo.models_trained} models
                      </p>
                    )}
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Available Capabilities
                    </h5>
                    {serviceInfo?.capabilities ? (
                      <div className="space-y-1">
                        {serviceInfo.capabilities.slice(0, 3).map((capability) => (
                          <div key={capability} className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-3 h-3 text-success-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {capability.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No capabilities data</p>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the other tabs to interact with the learning service and submit feedback for training.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ]

  if (serviceError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Learning Service
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              ML-based performance optimization and prediction
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
              Unable to connect to the AI Learning Service. Please ensure the service is running on port 8004.
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
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
            {serviceInfo && getServiceStatusIcon(serviceInfo.status)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Learning Service
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                ML-based performance optimization and prediction
              </p>
              {serviceInfo && (
                <Badge 
                  variant={serviceInfo.status === 'running' ? 'success' : 
                          serviceInfo.status === 'degraded' ? 'warning' : 'error'}
                  size="sm"
                >
                  {serviceInfo.status?.toUpperCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {dashboard.system_overview.total_training_samples.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Training Samples</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-success-600">
                {dashboard.system_overview.agents_profiled}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Agents Profiled</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-warning-600">
                {dashboard.system_overview.task_types_analyzed}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Task Types</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {dashboard.system_overview.insights_generated}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Insights</p>
            </CardContent>
          </Card>
        </div>
      )}

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
