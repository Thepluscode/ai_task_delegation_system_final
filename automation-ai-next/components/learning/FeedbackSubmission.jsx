'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  UserIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { useFeedbackBuilder, useLearningOperations, usePerformanceTracking } from '@/lib/hooks/useLearning'
import { learningApi } from '@/lib/api/learning'
import toast from 'react-hot-toast'

export function FeedbackSubmission() {
  const { 
    feedback, 
    calculatedMetrics, 
    updateFeedback, 
    resetFeedback, 
    validateFeedback 
  } = useFeedbackBuilder()
  
  const { submitFeedback, loading } = useLearningOperations()
  const { addPerformanceData, performanceHistory } = usePerformanceTracking()

  const [submissionResults, setSubmissionResults] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const taskTypeOptions = [
    { value: 'general', label: 'General Task' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'mortgage_loan', label: 'Mortgage Loan' },
    { value: 'business_loan', label: 'Business Loan' },
    { value: 'auto_loan', label: 'Auto Loan' },
    { value: 'credit_line', label: 'Credit Line' },
    { value: 'data_analysis', label: 'Data Analysis' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'content_creation', label: 'Content Creation' },
    { value: 'quality_assurance', label: 'Quality Assurance' },
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' },
  ]

  const requirementOptions = [
    'general_processing',
    'financial_analysis',
    'risk_assessment',
    'compliance_check',
    'customer_interaction',
    'data_validation',
    'quality_control',
    'documentation',
    'regulatory_review',
    'technical_expertise'
  ]

  const handleSubmitFeedback = async () => {
    try {
      const validation = validateFeedback()
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`)
        return
      }

      const result = await submitFeedback(feedback)
      
      // Add to submission results
      setSubmissionResults(prev => [
        { ...result, feedback: { ...feedback }, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49)
      ])
      
      // Add to performance tracking
      const performanceData = {
        ...feedback,
        ...calculatedMetrics,
        timestamp: new Date().toISOString()
      }
      addPerformanceData(performanceData)
      
      // Reset for next submission
      resetFeedback()
      
    } catch (error) {
      console.error('Feedback submission failed:', error)
    }
  }

  const handleGenerateRandomFeedback = () => {
    const agentIds = [
      'ai_underwriter_001',
      'junior_officer_jane',
      'senior_officer_john',
      'specialist_sarah',
      'compliance_officer_mike',
      'robot_assistant_01',
      'human_analyst_bob',
      'ai_processor_02'
    ]
    
    const randomAgentId = agentIds[Math.floor(Math.random() * agentIds.length)]
    const randomTaskType = taskTypeOptions[Math.floor(Math.random() * taskTypeOptions.length)].value
    const randomPriority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)].value
    
    const estimatedDuration = Math.floor(Math.random() * 180) + 15 // 15-195 minutes
    const actualDuration = Math.floor(estimatedDuration * (0.7 + Math.random() * 0.6)) // 70%-130% of estimated
    
    const success = Math.random() > 0.2 // 80% success rate
    const qualityScore = success ? 0.6 + Math.random() * 0.4 : 0.3 + Math.random() * 0.4
    
    const randomRequirements = requirementOptions
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1)
    
    updateFeedback({
      delegation_id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task_id: `task-${Date.now()}`,
      agent_id: randomAgentId,
      task_type: randomTaskType,
      priority: randomPriority,
      requirements: randomRequirements,
      estimated_duration: estimatedDuration,
      actual_duration: actualDuration,
      success: success,
      quality_score: Math.round(qualityScore * 100) / 100,
      completion_timestamp: new Date().toISOString(),
      performance_metrics: {
        accuracy: 0.7 + Math.random() * 0.3,
        efficiency: 0.6 + Math.random() * 0.4,
        customer_satisfaction: 0.65 + Math.random() * 0.35
      }
    })
  }

  const getPerformanceGrade = (score) => {
    return learningApi.getPerformanceGrade(score)
  }

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 1.2) return 'text-success-600'
    if (efficiency >= 0.8) return 'text-warning-600'
    return 'text-error-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Learning Feedback Submission
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Submit task completion feedback to train the AI learning system
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleGenerateRandomFeedback}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Random Feedback</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Simple View' : 'Advanced View'}
          </Button>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Delegation ID"
                  value={feedback.delegation_id}
                  onChange={(e) => updateFeedback({ delegation_id: e.target.value })}
                  placeholder="feedback-12345"
                />
                
                <Input
                  label="Task ID"
                  value={feedback.task_id}
                  onChange={(e) => updateFeedback({ task_id: e.target.value })}
                  placeholder="task-12345"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Agent ID"
                  value={feedback.agent_id}
                  onChange={(e) => updateFeedback({ agent_id: e.target.value })}
                  placeholder="agent_001"
                />
                
                <Select
                  label="Task Type"
                  value={feedback.task_type}
                  onChange={(value) => updateFeedback({ task_type: value })}
                  options={taskTypeOptions}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  value={feedback.priority}
                  onChange={(value) => updateFeedback({ priority: value })}
                  options={priorityOptions}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Success
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={feedback.success === true}
                        onChange={() => updateFeedback({ success: true })}
                        className="mr-2"
                      />
                      <span className="text-sm">Success</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={feedback.success === false}
                        onChange={() => updateFeedback({ success: false })}
                        className="mr-2"
                      />
                      <span className="text-sm">Failed</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Estimated Duration (min)"
                  type="number"
                  value={feedback.estimated_duration}
                  onChange={(e) => updateFeedback({ estimated_duration: parseInt(e.target.value) })}
                  min="1"
                  max="1440"
                />
                
                <Input
                  label="Actual Duration (min)"
                  type="number"
                  value={feedback.actual_duration}
                  onChange={(e) => updateFeedback({ actual_duration: parseInt(e.target.value) })}
                  min="1"
                  max="1440"
                />
              </div>
              
              <Input
                label="Quality Score (0-1)"
                type="number"
                step="0.01"
                value={feedback.quality_score}
                onChange={(e) => updateFeedback({ quality_score: parseFloat(e.target.value) })}
                min="0"
                max="1"
              />
              
              {showAdvanced && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Requirements
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {requirementOptions.map((req) => (
                        <label key={req} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={feedback.requirements.includes(req)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFeedback({ 
                                  requirements: [...feedback.requirements, req] 
                                })
                              } else {
                                updateFeedback({ 
                                  requirements: feedback.requirements.filter(r => r !== req) 
                                })
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-xs">{req.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Accuracy"
                      type="number"
                      step="0.01"
                      value={feedback.performance_metrics.accuracy}
                      onChange={(e) => updateFeedback({ 
                        performance_metrics: {
                          ...feedback.performance_metrics,
                          accuracy: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      max="1"
                    />
                    
                    <Input
                      label="Efficiency"
                      type="number"
                      step="0.01"
                      value={feedback.performance_metrics.efficiency}
                      onChange={(e) => updateFeedback({ 
                        performance_metrics: {
                          ...feedback.performance_metrics,
                          efficiency: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      max="1"
                    />
                    
                    <Input
                      label="Satisfaction"
                      type="number"
                      step="0.01"
                      value={feedback.performance_metrics.customer_satisfaction}
                      onChange={(e) => updateFeedback({ 
                        performance_metrics: {
                          ...feedback.performance_metrics,
                          customer_satisfaction: parseFloat(e.target.value)
                        }
                      })}
                      min="0"
                      max="1"
                    />
                  </div>
                </div>
              )}
              
              <Button
                onClick={handleSubmitFeedback}
                disabled={loading}
                loading={loading}
                className="w-full flex items-center justify-center space-x-2"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Submit Feedback</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calculated Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Calculated Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ClockIcon className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration Accuracy
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {(calculatedMetrics.duration_accuracy * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    Lower is better
                  </p>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Efficiency Score
                    </span>
                  </div>
                  <p className={`text-lg font-bold ${getEfficiencyColor(calculatedMetrics.efficiency_score)}`}>
                    {calculatedMetrics.efficiency_score.toFixed(2)}x
                  </p>
                  <p className="text-xs text-gray-500">
                    {calculatedMetrics.efficiency_score > 1 ? 'Faster than expected' : 'Slower than expected'}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <UserIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Overall Performance Score
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {(calculatedMetrics.performance_score * 100).toFixed(1)}%
                  </p>
                  <Badge 
                    variant={getPerformanceGrade(calculatedMetrics.performance_score).grade === 'A+' || 
                            getPerformanceGrade(calculatedMetrics.performance_score).grade === 'A' ? 'success' : 
                            getPerformanceGrade(calculatedMetrics.performance_score).grade === 'B' ? 'warning' : 'error'}
                    size="sm"
                  >
                    Grade {getPerformanceGrade(calculatedMetrics.performance_score).grade}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Performance Breakdown
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-medium">{feedback.success ? '100%' : '0%'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score</span>
                    <span className="text-sm font-medium">{(feedback.quality_score * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Time Efficiency</span>
                    <span className="text-sm font-medium">{(calculatedMetrics.efficiency_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Feedback Submissions ({submissionResults.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmissionResults([])}
              disabled={submissionResults.length === 0}
            >
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submissionResults.length === 0 ? (
            <div className="text-center py-8">
              <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No feedback submitted yet. Submit feedback to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissionResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {result.feedback.agent_id}
                      </span>
                      <Badge variant="outline" size="sm">
                        {result.feedback.task_type}
                      </Badge>
                      <Badge 
                        variant={result.feedback.success ? 'success' : 'error'} 
                        size="sm"
                      >
                        {result.feedback.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-primary-600">
                        {result.training_samples} samples
                      </span>
                      <span className="text-sm text-gray-500">
                        {result.insights_generated} insights
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Quality: {(result.feedback.quality_score * 100).toFixed(1)}%
                    </span>
                    <span className="text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
