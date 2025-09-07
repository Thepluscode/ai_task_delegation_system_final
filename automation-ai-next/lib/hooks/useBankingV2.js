import useSWR from 'swr'
import { bankingV2Api } from '@/lib/api/bankingV2'
import { useState, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'

// Custom hook for banking service status with V1/V2 support
export function useBankingServiceStatusV2() {
  const [selectedVersion, setSelectedVersion] = useState(bankingV2Api.getServiceVersion())
  
  const { data, error, mutate, isLoading } = useSWR(
    ['banking-service-status', selectedVersion],
    () => bankingV2Api.getServiceInfo(selectedVersion),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  const switchVersion = useCallback((version) => {
    bankingV2Api.setServiceVersion(version)
    setSelectedVersion(version)
    mutate() // Refresh data for new version
  }, [mutate])

  return {
    serviceInfo: data,
    isLoading,
    error,
    mutate,
    selectedVersion,
    switchVersion,
  }
}

// Custom hook for banking analytics with V1/V2 support
export function useBankingAnalyticsV2() {
  const [selectedVersion, setSelectedVersion] = useState(bankingV2Api.getServiceVersion())
  
  const { data, error, mutate, isLoading } = useSWR(
    ['banking-analytics', selectedVersion],
    () => bankingV2Api.getBankingAnalytics(selectedVersion),
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
    selectedVersion,
  }
}

// Custom hook for enhanced loan processing with V2 features
export function useLoanProcessingV2() {
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(bankingV2Api.getServiceVersion())

  const delegateLoan = useCallback(async (loanRequest, version = null) => {
    setLoading(true)
    try {
      const useVersion = version || selectedVersion
      
      // Validate the loan application
      const validation = bankingV2Api.validateLoanApplication ? 
        bankingV2Api.validateLoanApplication(loanRequest) : { isValid: true, errors: [] }
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      const result = await bankingV2Api.delegateLoanApplication(loanRequest, useVersion)
      
      // Handle different response formats between V1 and V2
      const delegation = result.delegation || result
      const processingTime = delegation.estimated_processing_time
      const agentId = delegation.assigned_agent
      const version_info = delegation.version || useVersion.toUpperCase()
      
      // Enhanced success message for V2
      if (useVersion === 'v2' && delegation.reasoning) {
        toast.success(
          `Loan ${delegation.application_id} delegated to ${agentId} (${version_info})\nReasoning: ${delegation.reasoning}`,
          { duration: 6000 }
        )
      } else {
        toast.success(
          `Loan ${delegation.application_id} delegated to ${agentId} (Est. ${processingTime} min)`
        )
      }
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to delegate loan application')
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedVersion])

  const submitFeedback = useCallback(async (feedbackRequest, version = null) => {
    setLoading(true)
    try {
      const useVersion = version || selectedVersion
      const result = await bankingV2Api.submitLoanFeedback(feedbackRequest, useVersion)
      
      // Enhanced feedback message for V2
      if (useVersion === 'v2' && result.quality_score) {
        toast.success(
          `Feedback submitted for ${feedbackRequest.application_id} (Quality: ${(result.quality_score * 100).toFixed(1)}%) - V2`
        )
      } else {
        toast.success(
          `Feedback submitted for ${feedbackRequest.application_id}`
        )
      }
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to submit feedback')
      throw error
    } finally {
      setLoading(false)
    }
  }, [selectedVersion])

  const compareVersions = useCallback(async (loanRequest) => {
    setLoading(true)
    try {
      const result = await bankingV2Api.testDelegationComparison(loanRequest)
      
      if (result.comparison.hasDifferences) {
        toast.success(
          `Comparison complete: ${result.comparison.differences.length} differences found between V1 and V2`,
          { duration: 5000 }
        )
      } else {
        toast.success('Comparison complete: Both versions produced identical results')
      }
      
      return result
    } catch (error) {
      toast.error(error.message || 'Failed to compare versions')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const switchVersion = useCallback((version) => {
    bankingV2Api.setServiceVersion(version)
    setSelectedVersion(version)
    toast.success(`Switched to Banking Service ${version.toUpperCase()}`)
  }, [])

  return {
    loading,
    selectedVersion,
    delegateLoan,
    submitFeedback,
    compareVersions,
    switchVersion,
  }
}

// Custom hook for service comparison
export function useBankingServiceComparison() {
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadComparison = useCallback(async () => {
    setLoading(true)
    try {
      const result = await bankingV2Api.compareServices()
      setComparison(result)
      return result
    } catch (error) {
      toast.error('Failed to load service comparison')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const testDelegation = useCallback(async (loanRequest) => {
    setLoading(true)
    try {
      const result = await bankingV2Api.testDelegationComparison(loanRequest)
      
      if (result.comparison.hasDifferences) {
        toast.success(
          `Test complete: Found ${result.comparison.differences.length} differences`,
          { duration: 4000 }
        )
      } else {
        toast.success('Test complete: Both services produced identical results')
      }
      
      return result
    } catch (error) {
      toast.error('Failed to test delegation comparison')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-load comparison on mount
  useEffect(() => {
    loadComparison()
  }, [loadComparison])

  return {
    comparison,
    loading,
    loadComparison,
    testDelegation,
  }
}

// Custom hook for enhanced loan application builder with V2 features
export function useLoanApplicationBuilderV2() {
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

  const [v2Insights, setV2Insights] = useState(null)

  const updateApplication = useCallback((updates) => {
    setApplication(prev => {
      const updated = { ...prev, ...updates }
      
      // Auto-generate application ID if not provided
      if (!updated.application_id) {
        updated.application_id = bankingV2Api.generateApplicationId()
      }
      
      return updated
    })
  }, [])

  const calculateMetrics = useCallback(() => {
    const riskLevel = bankingV2Api.calculateRiskLevel(
      application.credit_score,
      application.debt_to_income,
      application.loan_amount
    )
    
    const complexityScore = bankingV2Api.calculateComplexityScore(
      application.loan_type,
      application.loan_amount,
      application.credit_score,
      application.documentation_quality
    )
    
    // Enhanced V2 insights
    const insights = {
      ai_suitable: (
        riskLevel === 'low_risk' &&
        application.loan_amount <= 100000 &&
        application.credit_score >= 700 &&
        ['personal_loan', 'auto_loan'].includes(application.loan_type) &&
        application.documentation_quality >= 0.8
      ),
      high_value_oversight: application.loan_amount > 500000,
      regulatory_review: application.loan_amount > 1000000,
      human_required: ['business_loan', 'mortgage_loan'].includes(application.loan_type),
      complexity_factors: {
        amount_factor: application.loan_amount > 500000 ? 'high' : application.loan_amount > 100000 ? 'medium' : 'low',
        credit_factor: application.credit_score < 600 ? 'high' : application.credit_score < 700 ? 'medium' : 'low',
        documentation_factor: application.documentation_quality < 0.7 ? 'poor' : application.documentation_quality < 0.9 ? 'good' : 'excellent'
      }
    }
    
    setCalculatedMetrics({
      risk_level: riskLevel,
      complexity_score: complexityScore,
      recommended_agent: null, // Will be determined by delegation
      estimated_processing_time: 0 // Will be determined by delegation
    })
    
    setV2Insights(insights)
  }, [application])

  const resetApplication = useCallback(() => {
    setApplication({
      application_id: bankingV2Api.generateApplicationId(),
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
    setV2Insights(null)
  }, [])

  const validateApplication = useCallback(() => {
    const errors = []
    
    if (!application.application_id) errors.push('Application ID is required')
    if (!application.loan_type) errors.push('Loan type is required')
    if (application.loan_amount <= 0) errors.push('Loan amount must be positive')
    if (application.credit_score < 300 || application.credit_score > 850) {
      errors.push('Credit score must be between 300 and 850')
    }
    if (application.debt_to_income < 0 || application.debt_to_income > 1) {
      errors.push('Debt-to-income ratio must be between 0 and 1')
    }
    if (application.documentation_quality < 0 || application.documentation_quality > 1) {
      errors.push('Documentation quality must be between 0 and 1')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [application])

  // Auto-calculate metrics when application changes
  useEffect(() => {
    calculateMetrics()
  }, [application, calculateMetrics])

  return {
    application,
    calculatedMetrics,
    v2Insights,
    updateApplication,
    calculateMetrics,
    resetApplication,
    validateApplication,
  }
}

// Custom hook for delegation insights analysis
export function useDelegationInsights() {
  const [insights, setInsights] = useState([])

  const addInsight = useCallback((delegationResult) => {
    const insight = bankingV2Api.getEnhancedDelegationInsights(delegationResult)
    if (insight) {
      setInsights(prev => [
        { ...insight, timestamp: new Date().toISOString(), id: Date.now() },
        ...prev.slice(0, 19) // Keep last 20 insights
      ])
    }
  }, [])

  const clearInsights = useCallback(() => {
    setInsights([])
  }, [])

  const getInsightsByType = useCallback((type) => {
    return insights.filter(insight =>
      insight.factors.some(factor => factor.type === type)
    )
  }, [insights])

  const getRecentInsights = useCallback((count = 5) => {
    return insights.slice(0, count)
  }, [insights])

  return {
    insights,
    addInsight,
    clearInsights,
    getInsightsByType,
    getRecentInsights,
  }
}

// Custom hook for V2 delegation rules
export function useBankingRulesV2() {
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadRules = useCallback(async () => {
    setLoading(true)
    try {
      const result = await bankingV2Api.getDelegationRules()
      setRules(result)
      return result
    } catch (error) {
      toast.error('Failed to load delegation rules')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const analyzeCompliance = useCallback((loanApplication) => {
    if (!rules) return null
    return bankingV2Api.analyzeRuleCompliance(loanApplication, rules)
  }, [rules])

  const getRuleByPriority = useCallback(() => {
    if (!rules?.delegation_rules) return []

    const priorities = {
      'regulatory_review': 1,
      'high_value': 2,
      'high_risk': 3,
      'complex_loan_types': 4,
      'ai_suitable': 5
    }

    return Object.entries(rules.delegation_rules).sort(
      ([a], [b]) => (priorities[a] || 6) - (priorities[b] || 6)
    )
  }, [rules])

  // Auto-load rules on mount
  useEffect(() => {
    loadRules()
  }, [loadRules])

  return {
    rules,
    loading,
    loadRules,
    analyzeCompliance,
    getRuleByPriority,
  }
}
