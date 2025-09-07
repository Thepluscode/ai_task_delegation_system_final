import useSWR from 'swr'
import { bankingApi } from '@/lib/api/banking'
import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

// Custom hook for banking service status
export function useBankingServiceStatus() {
  const { data, error, mutate, isLoading } = useSWR(
    'banking-service-status',
    bankingApi.getServiceInfo,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    serviceInfo: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for banking analytics
export function useBankingAnalytics() {
  const { data, error, mutate, isLoading } = useSWR(
    'banking-analytics',
    bankingApi.getBankingAnalytics,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    analytics: data,
    isLoading,
    error,
    mutate,
  }
}

// Custom hook for loan processing operations
export function useLoanProcessing() {
  const [loading, setLoading] = useState(false)

  const delegateLoan = useCallback(async (loanRequest) => {
    setLoading(true)
    try {
      // Validate the loan application
      const validation = bankingApi.validateLoanApplication(loanRequest)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const result = await bankingApi.delegateLoanApplication(loanRequest)

      // Handle simplified API response format
      const delegation = result.delegation || result
      const processingTime = delegation.estimated_processing_time
      const agentId = delegation.assigned_agent

      toast.success(
        `Loan ${delegation.application_id} delegated to ${agentId} (Est. ${processingTime} min)`
      )
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to delegate loan application')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const submitFeedback = useCallback(async (feedbackRequest) => {
    setLoading(true)
    try {
      const result = await bankingApi.submitLoanFeedback(feedbackRequest)
      
      toast.success(
        `Feedback submitted for ${feedbackRequest.application_id} (Quality: ${(result.quality_score * 100).toFixed(1)}%)`
      )
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    delegateLoan,
    submitFeedback,
  }
}

// Custom hook for loan application builder
export function useLoanApplicationBuilder() {
  const [application, setApplication] = useState({
    application_id: '',
    loan_type: 'personal_loan',
    loan_amount: 25000,
    credit_score: 720,
    debt_to_income: 0.3,
    documentation_quality: 0.8,
    applicant_history: 'new'
  })

  const [calculatedMetrics, setCalculatedMetrics] = useState({
    risk_level: 'low_risk',
    complexity_score: 0.0,
    recommended_agent: null,
    estimated_processing_time: 0
  })

  const updateApplication = useCallback((updates) => {
    setApplication(prev => {
      const updated = { ...prev, ...updates }
      
      // Auto-generate application ID if not provided
      if (!updated.application_id) {
        updated.application_id = bankingApi.generateApplicationId()
      }
      
      return updated
    })
  }, [])

  const calculateMetrics = useCallback(() => {
    const riskLevel = bankingApi.calculateRiskLevel(
      application.credit_score,
      application.debt_to_income,
      application.loan_amount
    )
    
    const complexityScore = bankingApi.calculateComplexityScore(
      application.loan_type,
      application.loan_amount,
      application.credit_score,
      application.documentation_quality
    )
    
    const recommendedAgent = bankingApi.getRecommendedAgent(
      application.loan_type,
      riskLevel,
      complexityScore,
      application.loan_amount
    )
    
    const estimatedProcessingTime = bankingApi.calculateExpectedProcessingTime(
      application.loan_type,
      complexityScore,
      recommendedAgent.type
    )
    
    setCalculatedMetrics({
      risk_level: riskLevel,
      complexity_score: complexityScore,
      recommended_agent: recommendedAgent,
      estimated_processing_time: estimatedProcessingTime
    })
  }, [application])

  const resetApplication = useCallback(() => {
    setApplication({
      application_id: bankingApi.generateApplicationId(),
      loan_type: 'personal_loan',
      loan_amount: 25000,
      credit_score: 720,
      debt_to_income: 0.3,
      documentation_quality: 0.8,
      applicant_history: 'new'
    })
    setCalculatedMetrics({
      risk_level: 'low_risk',
      complexity_score: 0.0,
      recommended_agent: null,
      estimated_processing_time: 0
    })
  }, [])

  const validateApplication = useCallback(() => {
    return bankingApi.validateLoanApplication(application)
  }, [application])

  return {
    application,
    calculatedMetrics,
    updateApplication,
    calculateMetrics,
    resetApplication,
    validateApplication,
  }
}

// Custom hook for loan performance tracking
export function useLoanPerformanceTracking() {
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(false)

  const addLoanResult = useCallback((loanResult) => {
    setPerformanceData(prev => [loanResult, ...prev.slice(0, 99)]) // Keep last 100 results
  }, [])

  const clearPerformanceData = useCallback(() => {
    setPerformanceData([])
  }, [])

  const generateReport = useCallback((period = { start: null, end: null }) => {
    setLoading(true)
    try {
      const report = bankingApi.generatePerformanceReport(performanceData, period)
      return report
    } finally {
      setLoading(false)
    }
  }, [performanceData])

  const getPerformanceMetrics = useCallback(() => {
    return bankingApi.analyzeLoanPerformance(performanceData)
  }, [performanceData])

  return {
    performanceData,
    loading,
    addLoanResult,
    clearPerformanceData,
    generateReport,
    getPerformanceMetrics,
  }
}

// Custom hook for bulk loan processing
export function useBulkLoanProcessing() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])

  const processBulkLoans = useCallback(async (applications, options = {}) => {
    setLoading(true)
    try {
      const defaultOptions = {
        parallel_processing: true,
        max_concurrent: 5,
        priority_order: 'risk'
      }
      
      const processingOptions = { ...defaultOptions, ...options }
      
      // Sort applications based on priority order
      let sortedApplications = [...applications]
      if (processingOptions.priority_order === 'risk') {
        sortedApplications.sort((a, b) => {
          const riskA = bankingApi.calculateRiskLevel(a.credit_score, a.debt_to_income, a.loan_amount)
          const riskB = bankingApi.calculateRiskLevel(b.credit_score, b.debt_to_income, b.loan_amount)
          const priorityA = bankingApi.calculateProcessingPriority(a.loan_type, a.loan_amount, riskA)
          const priorityB = bankingApi.calculateProcessingPriority(b.loan_type, b.loan_amount, riskB)
          return priorityB - priorityA
        })
      } else if (processingOptions.priority_order === 'amount') {
        sortedApplications.sort((a, b) => b.loan_amount - a.loan_amount)
      }
      
      const startTime = Date.now()
      const delegationResults = []
      const errors = []
      
      // Process applications
      if (processingOptions.parallel_processing) {
        // Process in batches
        const batchSize = processingOptions.max_concurrent
        for (let i = 0; i < sortedApplications.length; i += batchSize) {
          const batch = sortedApplications.slice(i, i + batchSize)
          const batchPromises = batch.map(async (app) => {
            try {
              const result = await bankingApi.delegateLoanApplication(app)
              return { success: true, result }
            } catch (error) {
              return { success: false, error: error.message, application_id: app.application_id }
            }
          })
          
          const batchResults = await Promise.all(batchPromises)
          batchResults.forEach(result => {
            if (result.success) {
              delegationResults.push(result.result.delegation)
            } else {
              errors.push({ application_id: result.application_id, error: result.error })
            }
          })
        }
      } else {
        // Process sequentially
        for (const app of sortedApplications) {
          try {
            const result = await bankingApi.delegateLoanApplication(app)
            delegationResults.push(result.delegation)
          } catch (error) {
            errors.push({ application_id: app.application_id, error: error.message })
          }
        }
      }
      
      const endTime = Date.now()
      const processingTime = endTime - startTime
      
      const bulkResult = {
        total_applications: applications.length,
        successful_delegations: delegationResults.length,
        failed_delegations: errors.length,
        processing_time: processingTime,
        delegations: delegationResults,
        errors
      }
      
      setResults(prev => [bulkResult, ...prev.slice(0, 9)]) // Keep last 10 bulk results
      
      toast.success(
        `Bulk processing completed: ${delegationResults.length}/${applications.length} successful`
      )
      
      return bulkResult
    } catch (error) {
      toast.error(error.message || 'Bulk processing failed')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  return {
    loading,
    results,
    processBulkLoans,
    clearResults,
  }
}

// Custom hook for banking configuration
export function useBankingConfiguration() {
  const [config, setConfig] = useState({
    risk_thresholds: {
      high_risk_credit_score: 600,
      high_risk_debt_ratio: 0.5,
      regulatory_amount_threshold: 1000000
    },
    delegation_rules: {
      ai_max_amount: 50000,
      ai_min_credit_score: 720,
      senior_required_amount: 500000,
      compliance_required_amount: 1000000
    },
    performance_targets: {
      max_processing_time: {
        'personal_loan': 60,
        'auto_loan': 90,
        'mortgage_loan': 240,
        'business_loan': 360,
        'credit_line': 120
      },
      min_approval_accuracy: 0.85,
      min_compliance_score: 0.90,
      min_customer_satisfaction: 0.80
    }
  })

  const updateConfig = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const resetConfig = useCallback(() => {
    setConfig({
      risk_thresholds: {
        high_risk_credit_score: 600,
        high_risk_debt_ratio: 0.5,
        regulatory_amount_threshold: 1000000
      },
      delegation_rules: {
        ai_max_amount: 50000,
        ai_min_credit_score: 720,
        senior_required_amount: 500000,
        compliance_required_amount: 1000000
      },
      performance_targets: {
        max_processing_time: {
          'personal_loan': 60,
          'auto_loan': 90,
          'mortgage_loan': 240,
          'business_loan': 360,
          'credit_line': 120
        },
        min_approval_accuracy: 0.85,
        min_compliance_score: 0.90,
        min_customer_satisfaction: 0.80
      }
    })
  }, [])

  return {
    config,
    updateConfig,
    resetConfig,
  }
}
