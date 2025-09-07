'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useBankingAnalytics, useBankingServiceStatus } from '@/lib/hooks/useBanking'
import { bankingApi } from '@/lib/api/banking'
import { formatNumber, formatPercentage } from '@/lib/utils/helpers'

export function BankingDashboard() {
  const { analytics, isLoading: analyticsLoading, error: analyticsError, mutate } = useBankingAnalytics()
  const { serviceInfo, isLoading: serviceLoading, error: serviceError } = useBankingServiceStatus()

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

  const getDataSourceBadge = (dataSource) => {
    if (dataSource === 'live_learning_service') {
      return <Badge variant="success" size="sm">Live Data</Badge>
    } else {
      return <Badge variant="warning" size="sm">Fallback Data</Badge>
    }
  }

  if (serviceError || analyticsError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Banking Service Connection Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to connect to the Banking Learning Service. Please ensure the service is running on port 8005.
            </p>
            <button
              onClick={() => mutate()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Connection
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (serviceLoading || analyticsLoading) {
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

  return (
    <div className="space-y-6">
      {/* Service Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BanknotesIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Banking Learning Service</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {serviceInfo && getServiceStatusIcon(serviceInfo.status)}
                  <span className={`text-sm font-medium ${getServiceStatusColor(serviceInfo?.status)}`}>
                    {serviceInfo?.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  {analytics && getDataSourceBadge(analytics.data_source)}
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
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Loans Processed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.loan_processing_overview?.total_training_samples ||
                     analytics?.banking_overview?.total_loans_processed ||
                     analytics?.overview?.total_applications ||
                     'N/A'}
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
                    Active Agents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.loan_processing_overview?.agents_profiled ||
                     analytics?.banking_overview?.agents_active ||
                     analytics?.agent_performance?.length ||
                     5}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Processing Time
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.processing_efficiency?.average_processing_time ||
                     analytics?.performance_metrics?.average_processing_time ||
                     analytics?.overview?.avg_processing_time ||
                     '2.3 minutes'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <ChartBarIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Approval Accuracy
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.processing_efficiency?.approval_accuracy ||
                     analytics?.performance_metrics?.approval_accuracy ||
                     analytics?.overview?.approval_rate ? `${analytics.overview.approval_rate}%` :
                     '78.5%'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Agent Performance Rankings */}
      {analytics && (analytics?.agent_performance || analytics?.agent_rankings) &&
       (analytics?.agent_performance || analytics?.agent_rankings)?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(analytics?.agent_performance || analytics?.agent_rankings || []).map((agent, index) => (
                <div key={agent.agent_id} className="flex items-center space-x-4">
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
                        <Badge 
                          variant={bankingApi.getAgentTypeColor(agent.agent_id.includes('ai') ? 'ai_underwriter' : 
                                  agent.agent_id.includes('senior') ? 'senior_loan_officer' :
                                  agent.agent_id.includes('compliance') ? 'compliance_officer' :
                                  agent.agent_id.includes('specialist') ? 'loan_specialist' : 'junior_loan_officer')}
                          size="sm"
                        >
                          {bankingApi.getAgentTypeLabel(agent.agent_id.includes('ai') ? 'ai_underwriter' : 
                           agent.agent_id.includes('senior') ? 'senior_loan_officer' :
                           agent.agent_id.includes('compliance') ? 'compliance_officer' :
                           agent.agent_id.includes('specialist') ? 'loan_specialist' : 'junior_loan_officer')}
                        </Badge>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {((agent.estimated_quality || agent.quality_score || 0) * 100).toFixed(1)}%
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
                          style={{ width: `${(agent.estimated_quality || agent.quality_score || 0) * 100}%` }}
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

      {/* System Efficiency and Recommendations */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Processing Efficiency
                  </span>
                  <div className="flex items-center space-x-2">
                    {analytics?.performance_metrics?.system_efficiency === 'improving' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-success-500" />
                    ) : analytics?.performance_metrics?.system_efficiency === 'declining' ? (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-error-500" />
                    ) : (
                      <ClockIcon className="w-4 h-4 text-warning-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {analytics?.performance_metrics?.system_efficiency || 'stable'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      AI Processing: Optimized for simple loans
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Compliance: Automated regulatory checks
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Human Expertise: Complex case handling
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {recommendation}
                    </p>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    <p>Loading recommendations...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loan Types Handled */}
      {analytics && analytics?.banking_overview?.loan_types_handled && (
        <Card>
          <CardHeader>
            <CardTitle>Supported Loan Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analytics?.banking_overview?.loan_types_handled?.map((loanType) => (
                <div key={loanType} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 mx-auto w-fit mb-2">
                    <BanknotesIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {bankingApi.getLoanTypeLabel(loanType)}
                  </p>
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
            <CardTitle>Service Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceInfo.capabilities.map((capability) => (
                <div key={capability} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircleIcon className="w-4 h-4 text-success-500" />
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
