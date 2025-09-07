'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { BankingDashboard } from '@/components/banking/BankingDashboard'
import { LoanApplicationProcessor } from '@/components/banking/LoanApplicationProcessor'
import { BankingServiceTest } from '@/components/banking/BankingServiceTest'
import { BankingServiceComparison } from '@/components/banking/BankingServiceComparison'
import { BankingAnalyticsV2 } from '@/components/banking/BankingAnalyticsV2'
import { BankingRulesExplanation } from '@/components/banking/BankingRulesExplanation'
import { LoanApplicationProcessorV2 } from '@/components/banking/LoanApplicationProcessorV2'
import {
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BeakerIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  CpuChipIcon,
  QueueListIcon,
  BoltIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'
import { useBankingServiceStatus, useBankingAnalytics } from '@/lib/hooks/useBanking'
import { bankingApi } from '@/lib/api/banking'

export default function BankingPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    taskQueue: { pending: 0, processing: 0, completed: 0, failed: 0 },
    errorRecovery: { totalErrors: 0, recoveredErrors: 0, escalatedErrors: 0 },
    performance: { avgProcessingTime: 0, successRate: 0, throughput: 0 },
    messageQueue: { published: 0, consumed: 0, pending: 0 }
  })

  const { serviceInfo, isLoading: serviceLoading, error: serviceError } = useBankingServiceStatus()
  const { analytics } = useBankingAnalytics()

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        taskQueue: {
          pending: Math.floor(Math.random() * 50),
          processing: Math.floor(Math.random() * 20),
          completed: prev.taskQueue.completed + Math.floor(Math.random() * 5),
          failed: prev.taskQueue.failed + Math.floor(Math.random() * 2)
        },
        errorRecovery: {
          totalErrors: prev.errorRecovery.totalErrors + Math.floor(Math.random() * 2),
          recoveredErrors: prev.errorRecovery.recoveredErrors + Math.floor(Math.random() * 2),
          escalatedErrors: prev.errorRecovery.escalatedErrors + Math.floor(Math.random() * 1)
        },
        performance: {
          avgProcessingTime: 2500 + Math.random() * 1000,
          successRate: 0.92 + Math.random() * 0.06,
          throughput: 150 + Math.random() * 50
        },
        messageQueue: {
          published: prev.messageQueue.published + Math.floor(Math.random() * 10),
          consumed: prev.messageQueue.consumed + Math.floor(Math.random() * 8),
          pending: Math.floor(Math.random() * 15)
        }
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
        return <BanknotesIcon {...iconProps} className="text-gray-500" />
    }
  }

  const tabs = [
    {
      id: 'dashboard',
      label: 'Analytics Dashboard',
      icon: ChartBarIcon,
      content: <BankingDashboard />
    },
    {
      id: 'processor-v2',
      label: 'AI Task Delegation',
      icon: CpuChipIcon,
      content: <LoanApplicationProcessorV2 />
    },
    {
      id: 'error-handling',
      label: 'Error Recovery',
      icon: ExclamationCircleIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExclamationCircleIcon className="w-5 h-5 text-error-500" />
                <span>Error Recovery System</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-error-200 dark:border-error-800 rounded-lg bg-error-50 dark:bg-error-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-error-700 dark:text-error-300">Total Errors</span>
                    <ExclamationTriangleIcon className="w-4 h-4 text-error-500" />
                  </div>
                  <p className="text-2xl font-bold text-error-600">{realTimeMetrics.errorRecovery.totalErrors}</p>
                  <p className="text-xs text-error-600 mt-1">Last 24 hours</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Auto Recovered</span>
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">{realTimeMetrics.errorRecovery.recoveredErrors}</p>
                  <p className="text-xs text-success-600 mt-1">
                    {realTimeMetrics.errorRecovery.totalErrors > 0
                      ? `${((realTimeMetrics.errorRecovery.recoveredErrors / realTimeMetrics.errorRecovery.totalErrors) * 100).toFixed(1)}% recovery rate`
                      : 'No errors to recover'
                    }
                  </p>
                </div>

                <div className="p-4 border border-warning-200 dark:border-warning-800 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-warning-700 dark:text-warning-300">Escalated</span>
                    <ArrowTrendingUpIcon className="w-4 h-4 text-warning-500" />
                  </div>
                  <p className="text-2xl font-bold text-warning-600">{realTimeMetrics.errorRecovery.escalatedErrors}</p>
                  <p className="text-xs text-warning-600 mt-1">Human intervention required</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Error Handling Strategies</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Transient Errors</span>
                    </div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">Exponential backoff retry (max 3 attempts)</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Permanent Errors</span>
                    </div>
                    <span className="text-sm text-purple-700 dark:text-purple-300">Fallback agent assignment</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-800 dark:text-orange-200">System Errors</span>
                    </div>
                    <span className="text-sm text-orange-700 dark:text-orange-300">Human escalation + system recovery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'message-queue',
      label: 'Message Queue',
      icon: QueueListIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QueueListIcon className="w-5 h-5 text-primary-500" />
                <span>Asynchronous Message Queue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-primary-200 dark:border-primary-800 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Messages Published</span>
                    <BoltIcon className="w-4 h-4 text-primary-500" />
                  </div>
                  <p className="text-2xl font-bold text-primary-600">{realTimeMetrics.messageQueue.published}</p>
                  <p className="text-xs text-primary-600 mt-1">Total published</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Messages Consumed</span>
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">{realTimeMetrics.messageQueue.consumed}</p>
                  <p className="text-xs text-success-600 mt-1">Successfully processed</p>
                </div>

                <div className="p-4 border border-warning-200 dark:border-warning-800 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-warning-700 dark:text-warning-300">Pending Messages</span>
                    <ClockIcon className="w-4 h-4 text-warning-500" />
                  </div>
                  <p className="text-2xl font-bold text-warning-600">{realTimeMetrics.messageQueue.pending}</p>
                  <p className="text-xs text-warning-600 mt-1">Awaiting processing</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Queue Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Task Events</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Real-time task lifecycle events (started, completed, failed)
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Error Events</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Error notifications and recovery actions
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
      id: 'performance',
      label: 'Performance Metrics',
      icon: ArrowTrendingUpIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowTrendingUpIcon className="w-5 h-5 text-success-500" />
                <span>Real-time Performance Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Processing Time</span>
                    <ClockIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{realTimeMetrics.performance.avgProcessingTime.toFixed(0)}ms</p>
                  <p className="text-xs text-blue-600 mt-1">Target: &lt; 5000ms</p>
                </div>

                <div className="p-4 border border-success-200 dark:border-success-800 rounded-lg bg-success-50 dark:bg-success-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-success-700 dark:text-success-300">Success Rate</span>
                    <CheckCircleIcon className="w-4 h-4 text-success-500" />
                  </div>
                  <p className="text-2xl font-bold text-success-600">{(realTimeMetrics.performance.successRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-success-600 mt-1">Target: &gt; 95%</p>
                </div>

                <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Throughput</span>
                    <BoltIcon className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{realTimeMetrics.performance.throughput.toFixed(0)}</p>
                  <p className="text-xs text-purple-600 mt-1">Tasks/hour</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Processing Time</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">5,000ms</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Success Rate</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">95%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Concurrent Tasks</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">1,000</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'test',
      label: 'Service Test',
      icon: BeakerIcon,
      content: <BankingServiceTest />
    },
    {
      id: 'analytics-v2',
      label: 'V2 Analytics',
      icon: ChartBarIcon,
      content: <BankingAnalyticsV2 />
    },
    {
      id: 'rules',
      label: 'Delegation Rules',
      icon: AcademicCapIcon,
      content: <BankingRulesExplanation />
    },
    {
      id: 'agents',
      label: 'Agent Performance',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics && analytics.agent_rankings ? (
                <div className="space-y-4">
                  {analytics.agent_rankings.map((agent, index) => (
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
                            <Badge 
                              variant={bankingApi.getAgentTypeColor(
                                agent.agent_id.includes('ai') ? 'ai_underwriter' : 
                                agent.agent_id.includes('senior') ? 'senior_loan_officer' :
                                agent.agent_id.includes('compliance') ? 'compliance_officer' :
                                agent.agent_id.includes('specialist') ? 'loan_specialist' : 'junior_loan_officer'
                              )}
                              size="sm"
                            >
                              {bankingApi.getAgentTypeLabel(
                                agent.agent_id.includes('ai') ? 'ai_underwriter' : 
                                agent.agent_id.includes('senior') ? 'senior_loan_officer' :
                                agent.agent_id.includes('compliance') ? 'compliance_officer' :
                                agent.agent_id.includes('specialist') ? 'loan_specialist' : 'junior_loan_officer'
                              )}
                            </Badge>
                          </div>
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
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agent.success_rate ? `${(agent.success_rate * 100).toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agent.total_tasks || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Specialization</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {agent.agent_id.includes('ai') ? 'Simple Loans' :
                             agent.agent_id.includes('senior') ? 'Complex Cases' :
                             agent.agent_id.includes('compliance') ? 'Regulatory' :
                             agent.agent_id.includes('specialist') ? 'Business Loans' : 'General'}
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
                    No agent performance data available yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'config',
      label: 'Configuration',
      icon: Cog6ToothIcon,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banking Service Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Risk Thresholds */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Risk Assessment Thresholds
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        High Risk Credit Score
                      </p>
                      <p className="text-2xl font-bold text-error-600">
                        &lt; 600
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        High Risk Debt Ratio
                      </p>
                      <p className="text-2xl font-bold text-error-600">
                        &gt; 50%
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Regulatory Review
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        &gt; $1M
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delegation Rules */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Agent Delegation Rules
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          AI Underwriter
                        </span>
                      </div>
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Low risk, &lt; $50K, credit score &gt; 720
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <UserGroupIcon className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Senior Analyst
                        </span>
                      </div>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        High risk or complex cases
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Compliance Officer
                        </span>
                      </div>
                      <span className="text-sm text-purple-700 dark:text-purple-300">
                        Regulatory review (&gt; $1M)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Targets */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Performance Targets
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Approval Accuracy</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        &gt; 85%
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        &gt; 90%
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Customer Satisfaction</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        &gt; 80%
                      </p>
                    </div>
                  </div>
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
              Banking Learning Service
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              AI-powered loan processing task delegation
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
              Unable to connect to the Banking Learning Service. Please ensure the service is running on port 8005.
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
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            {serviceInfo && getServiceStatusIcon(serviceInfo.status)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Banking Learning Service
            </h1>
            <div className="flex items-center space-x-3 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered loan processing task delegation
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

      {/* Advanced Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Task Queue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {realTimeMetrics.taskQueue.pending + realTimeMetrics.taskQueue.processing}
                </p>
                <p className="text-xs text-gray-500">
                  {realTimeMetrics.taskQueue.pending} pending, {realTimeMetrics.taskQueue.processing} processing
                </p>
              </div>
              <QueueListIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Error Recovery</p>
                <p className="text-2xl font-bold text-success-600">
                  {realTimeMetrics.errorRecovery.totalErrors > 0
                    ? `${((realTimeMetrics.errorRecovery.recoveredErrors / realTimeMetrics.errorRecovery.totalErrors) * 100).toFixed(0)}%`
                    : '100%'
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {realTimeMetrics.errorRecovery.recoveredErrors}/{realTimeMetrics.errorRecovery.totalErrors} recovered
                </p>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-success-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Performance</p>
                <p className="text-2xl font-bold text-purple-600">
                  {realTimeMetrics.performance.avgProcessingTime.toFixed(0)}ms
                </p>
                <p className="text-xs text-gray-500">
                  {(realTimeMetrics.performance.successRate * 100).toFixed(1)}% success rate
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Message Queue</p>
                <p className="text-2xl font-bold text-orange-600">
                  {realTimeMetrics.messageQueue.pending}
                </p>
                <p className="text-xs text-gray-500">
                  {realTimeMetrics.messageQueue.published} published, {realTimeMetrics.messageQueue.consumed} consumed
                </p>
              </div>
              <CircleStackIcon className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CpuChipIcon className="w-5 h-5 text-primary-500" />
            <span>Advanced Banking Task Delegation Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Microservices Architecture</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Task decomposition & routing</li>
                <li>• Agent selection optimization</li>
                <li>• Performance monitoring</li>
                <li>• Error recovery system</li>
              </ul>
            </div>

            <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">AI-Driven Delegation</h4>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <li>• Risk-based agent matching</li>
                <li>• Continuous learning</li>
                <li>• Predictive performance</li>
                <li>• Adaptive strategies</li>
              </ul>
            </div>

            <div className="p-4 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Enterprise Features</h4>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                <li>• Multi-layered error handling</li>
                <li>• Asynchronous messaging</li>
                <li>• Real-time monitoring</li>
                <li>• Compliance tracking</li>
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
