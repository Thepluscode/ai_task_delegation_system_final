import { api, apiUtils } from './client'

// Enhanced Banking Learning Service API Client with V1/V2 support
export const bankingV2Api = {
  // Service version management
  getServiceVersion: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('banking_service_version') || 'v1'
    }
    return 'v1'
  },

  setServiceVersion: (version) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('banking_service_version', version)
    }
  },

  getServiceBaseURL: (version = null) => {
    const selectedVersion = version || bankingV2Api.getServiceVersion()
    if (selectedVersion === 'v2') {
      return process.env.NEXT_PUBLIC_BANKING_V2_SERVICE_URL || 'http://localhost:8006'
    }
    return process.env.NEXT_PUBLIC_BANKING_SERVICE_URL || 'http://localhost:8005'
  },

  getServiceInfo: async (version = null) => {
    const selectedVersion = version || bankingV2Api.getServiceVersion()
    return {
      service: `Banking Learning Service ${selectedVersion.toUpperCase()}`,
      version: selectedVersion === 'v2' ? 'v2.0.0' : 'v1.0.0',
      status: 'operational',
      uptime: selectedVersion === 'v2' ? '99.9%' : '99.8%',
      demo_mode: true,
      features: selectedVersion === 'v2'
        ? ['advanced_ai_reasoning', 'explainable_decisions', 'multi_agent_coordination', 'real_time_learning']
        : ['loan_processing', 'risk_assessment', 'compliance_checking'],
      performance: {
        avg_response_time: selectedVersion === 'v2' ? '32ms' : '45ms',
        requests_per_second: selectedVersion === 'v2' ? 4200 : 2500,
        success_rate: selectedVersion === 'v2' ? 99.9 : 99.7
      }
    }
  },

  healthCheck: async (version = null) => {
    const selectedVersion = version || bankingV2Api.getServiceVersion()
    return {
      status: 'healthy',
      service: 'banking',
      version: selectedVersion,
      timestamp: new Date().toISOString(),
      enhanced_features: selectedVersion === 'v2'
    }
  },

  getBankingAnalytics: async (version = null) => {
    const selectedVersion = version || bankingV2Api.getServiceVersion()

    if (selectedVersion === 'v2') {
      return {
        overview: {
          total_applications: 18947,
          processed_today: 456,
          approval_rate: 82.3,
          avg_processing_time: '1.8 minutes',
          cost_savings: '$2.1M annually',
          efficiency_improvement: '89%'
        },
        ai_reasoning: {
          explainable_decisions: 98.7,
          confidence_scores: 96.4,
          human_oversight_required: 3.2,
          automated_approvals: 96.8
        },
        advanced_metrics: {
          multi_agent_coordination: 94.5,
          real_time_learning_rate: 87.3,
          adaptive_risk_modeling: 91.8,
          predictive_accuracy: 97.2
        },
        recommendations: [
          'Deploy advanced neural networks for complex commercial loan assessments',
          'Implement multi-agent consensus for high-risk applications above $1M',
          'Enable real-time market data integration for dynamic risk modeling',
          'Activate explainable AI features for regulatory compliance reporting',
          'Scale edge computing nodes for sub-second decision making'
        ],
        version: 'v2',
        demo_mode: true,
        timestamp: new Date().toISOString()
      }
    } else {
      // Return V1 analytics (same as banking.js)
      return {
        overview: {
          total_applications: 15847,
          processed_today: 342,
          approval_rate: 78.5,
          avg_processing_time: '2.3 minutes',
          cost_savings: '$1.2M annually',
          efficiency_improvement: '67%'
        },
        recommendations: [
          'Increase AI agent capacity during peak hours (9-11 AM) to reduce queue times',
          'Implement advanced risk scoring for business loans to improve approval accuracy',
          'Deploy additional fraud detection agents for high-value transactions',
          'Optimize document processing workflow to reduce manual review by 15%',
          'Enable real-time learning for mortgage application patterns'
        ],
        version: 'v1',
        demo_mode: true,
        timestamp: new Date().toISOString()
      }
    }
  },

  // V2 specific endpoints
  getDelegationRules: async () => {
    return api.get('/api/v1/banking/rules-explanation', {
      baseURL: bankingV2Api.getServiceBaseURL('v2')
    })
  },

  // Enhanced loan delegation for V2 API (supports both JSON and query params)
  delegateLoanApplication: async (loanRequest, version = null) => {
    const selectedVersion = version || bankingV2Api.getServiceVersion()
    const baseURL = bankingV2Api.getServiceBaseURL(selectedVersion)
    
    if (selectedVersion === 'v2') {
      // V2 uses JSON body (Pydantic models)
      return api.post('/api/v1/banking/delegate-loan', loanRequest, { baseURL })
    } else {
      // V1 uses query parameters
      const params = new URLSearchParams({
        application_id: loanRequest.application_id,
        loan_type: loanRequest.loan_type,
        loan_amount: loanRequest.loan_amount.toString(),
        credit_score: loanRequest.credit_score.toString(),
        debt_to_income: loanRequest.debt_to_income.toString(),
        documentation_quality: loanRequest.documentation_quality.toString(),
        applicant_history: loanRequest.applicant_history || 'new'
      })
      
      return api.post(`/api/v1/banking/delegate-loan?${params.toString()}`, {}, { baseURL })
    }
  },

  // Enhanced feedback submission for V2 API
  submitLoanFeedback: async (feedbackRequest, version = null) => {
    const selectedVersion = version || bankingV2Api.getServiceVersion()
    const baseURL = bankingV2Api.getServiceBaseURL(selectedVersion)
    
    if (selectedVersion === 'v2') {
      // V2 uses JSON body (Pydantic models)
      return api.post('/api/v1/banking/feedback', feedbackRequest, { baseURL })
    } else {
      // V1 uses query parameters
      const params = new URLSearchParams({
        application_id: feedbackRequest.application_id,
        agent_id: feedbackRequest.agent_id,
        loan_type: feedbackRequest.loan_type,
        estimated_duration: feedbackRequest.estimated_duration.toString(),
        actual_duration: feedbackRequest.actual_duration.toString(),
        approved: feedbackRequest.approved.toString(),
        approval_accuracy: feedbackRequest.approval_accuracy.toString(),
        compliance_score: feedbackRequest.compliance_score.toString(),
        customer_satisfaction: feedbackRequest.customer_satisfaction.toString(),
        processing_quality: feedbackRequest.processing_quality.toString()
      })
      
      return api.post(`/api/v1/banking/feedback?${params.toString()}`, {}, { baseURL })
    }
  },

  // Service comparison utilities
  compareServices: async () => {
    try {
      const [v1Info, v2Info] = await Promise.all([
        bankingV2Api.getServiceInfo('v1'),
        bankingV2Api.getServiceInfo('v2')
      ])
      
      return {
        v1: {
          available: true,
          info: v1Info,
          version: v1Info.version || '1.0.0',
          features: v1Info.capabilities || []
        },
        v2: {
          available: true,
          info: v2Info,
          version: v2Info.version || '2.0.0',
          features: v2Info.capabilities || [],
          improvements: v2Info.improvements || []
        }
      }
    } catch (error) {
      return {
        v1: { available: false, error: error.message },
        v2: { available: false, error: error.message }
      }
    }
  },

  // Test delegation with both services
  testDelegationComparison: async (loanRequest) => {
    try {
      const [v1Result, v2Result] = await Promise.all([
        bankingV2Api.delegateLoanApplication(loanRequest, 'v1'),
        bankingV2Api.delegateLoanApplication(loanRequest, 'v2')
      ])
      
      return {
        v1: {
          success: true,
          result: v1Result,
          delegation: v1Result.delegation || v1Result
        },
        v2: {
          success: true,
          result: v2Result,
          delegation: v2Result.delegation || v2Result
        },
        comparison: bankingV2Api.analyzeDelegationDifferences(
          v1Result.delegation || v1Result,
          v2Result.delegation || v2Result
        )
      }
    } catch (error) {
      return {
        error: error.message,
        v1: { success: false, error: error.message },
        v2: { success: false, error: error.message }
      }
    }
  },

  // Analyze differences between V1 and V2 delegation results
  analyzeDelegationDifferences: (v1Result, v2Result) => {
    const differences = []
    
    if (v1Result.assigned_agent !== v2Result.assigned_agent) {
      differences.push({
        type: 'agent_assignment',
        v1: v1Result.assigned_agent,
        v2: v2Result.assigned_agent,
        description: 'Different agents selected'
      })
    }
    
    if (v1Result.estimated_processing_time !== v2Result.estimated_processing_time) {
      differences.push({
        type: 'processing_time',
        v1: v1Result.estimated_processing_time,
        v2: v2Result.estimated_processing_time,
        description: 'Different processing time estimates'
      })
    }
    
    if (v1Result.confidence !== v2Result.confidence) {
      differences.push({
        type: 'confidence',
        v1: v1Result.confidence,
        v2: v2Result.confidence,
        description: 'Different confidence levels'
      })
    }
    
    if (v2Result.reasoning && !v1Result.reasoning) {
      differences.push({
        type: 'reasoning',
        v1: 'Not provided',
        v2: v2Result.reasoning,
        description: 'V2 provides detailed reasoning'
      })
    }
    
    return {
      hasDifferences: differences.length > 0,
      differences,
      summary: differences.length > 0 
        ? `${differences.length} difference(s) found between V1 and V2`
        : 'Both versions produced identical results'
    }
  },

  // Enhanced delegation reasoning for V2
  getEnhancedDelegationInsights: (delegationResult) => {
    if (!delegationResult.reasoning) {
      return null
    }
    
    const insights = {
      reasoning: delegationResult.reasoning,
      version: delegationResult.version || 'Unknown',
      factors: []
    }
    
    // Parse reasoning for key factors
    if (delegationResult.reasoning.includes('AI-suitable')) {
      insights.factors.push({
        type: 'ai_optimization',
        description: 'Loan meets AI processing criteria',
        impact: 'positive'
      })
    }
    
    if (delegationResult.reasoning.includes('High-value')) {
      insights.factors.push({
        type: 'value_threshold',
        description: 'High-value loan requires human oversight',
        impact: 'neutral'
      })
    }
    
    if (delegationResult.reasoning.includes('High-risk')) {
      insights.factors.push({
        type: 'risk_management',
        description: 'High-risk loan needs senior expertise',
        impact: 'caution'
      })
    }
    
    if (delegationResult.reasoning.includes('Regulatory')) {
      insights.factors.push({
        type: 'compliance',
        description: 'Regulatory review required',
        impact: 'mandatory'
      })
    }
    
    return insights
  },

  // Performance comparison utilities
  calculatePerformanceImprovement: (v1Metrics, v2Metrics) => {
    const improvements = {}
    
    if (v1Metrics.processing_time && v2Metrics.processing_time) {
      const timeImprovement = ((v1Metrics.processing_time - v2Metrics.processing_time) / v1Metrics.processing_time) * 100
      improvements.processing_time = {
        improvement_percentage: timeImprovement,
        description: timeImprovement > 0 ? 'Faster processing' : 'Slower processing'
      }
    }
    
    if (v1Metrics.confidence && v2Metrics.confidence) {
      const confidenceImprovement = ((v2Metrics.confidence - v1Metrics.confidence) / v1Metrics.confidence) * 100
      improvements.confidence = {
        improvement_percentage: confidenceImprovement,
        description: confidenceImprovement > 0 ? 'Higher confidence' : 'Lower confidence'
      }
    }
    
    return improvements
  },

  // Utility functions (inherited from original banking API)
  calculateRiskLevel: (creditScore, debtToIncome, loanAmount) => {
    if (loanAmount > 1000000) return 'regulatory_review'
    if (creditScore < 600 || debtToIncome > 0.5) return 'high_risk'
    if (creditScore < 700 || debtToIncome > 0.36) return 'medium_risk'
    return 'low_risk'
  },

  calculateComplexityScore: (loanType, loanAmount, creditScore, documentationQuality) => {
    let complexity = 0.0
    
    // Loan amount factor
    if (loanAmount > 500000) complexity += 0.3
    else if (loanAmount > 100000) complexity += 0.2
    else complexity += 0.1
    
    // Credit score factor
    if (creditScore < 600) complexity += 0.3
    else if (creditScore < 700) complexity += 0.2
    else complexity += 0.1
    
    // Documentation quality factor
    complexity += (1 - documentationQuality) * 0.2
    
    // Loan type factor
    const typeComplexity = {
      'personal_loan': 0.1,
      'auto_loan': 0.2,
      'mortgage_loan': 0.3,
      'business_loan': 0.4,
      'credit_line': 0.2
    }
    complexity += typeComplexity[loanType] || 0.2
    
    return Math.min(complexity, 1.0)
  },

  generateApplicationId: () => {
    return `LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },

  formatLoanAmount: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  },

  getLoanTypeLabel: (loanType) => {
    const labels = {
      'personal_loan': 'Personal Loan',
      'auto_loan': 'Auto Loan',
      'mortgage_loan': 'Mortgage Loan',
      'business_loan': 'Business Loan',
      'credit_line': 'Credit Line'
    }
    return labels[loanType] || loanType.replace('_', ' ').toUpperCase()
  },

  getAgentTypeLabel: (agentType) => {
    const labels = {
      'ai_underwriter': 'AI Underwriter',
      'junior_loan_officer': 'Junior Loan Officer',
      'senior_loan_officer': 'Senior Loan Officer',
      'loan_specialist': 'Loan Specialist',
      'compliance_officer': 'Compliance Officer'
    }
    return labels[agentType] || agentType.replace('_', ' ').toUpperCase()
  },

  getRiskLevelColor: (riskLevel) => {
    const colors = {
      'low_risk': 'success',
      'medium_risk': 'warning',
      'high_risk': 'error',
      'regulatory_review': 'purple'
    }
    return colors[riskLevel] || 'gray'
  },

  getAgentTypeColor: (agentType) => {
    const colors = {
      'ai_underwriter': 'blue',
      'junior_loan_officer': 'green',
      'senior_loan_officer': 'purple',
      'loan_specialist': 'orange',
      'compliance_officer': 'red'
    }
    return colors[agentType] || 'gray'
  },

  // V2 Enhanced Analytics Utilities
  parseV2Analytics: (analytics) => {
    if (!analytics) return null

    return {
      overview: {
        totalLoans: analytics.banking_overview?.total_loans_processed || 'N/A',
        activeAgents: analytics.banking_overview?.agents_active || 0,
        loanTypes: analytics.banking_overview?.loan_types_handled || [],
        version: analytics.banking_overview?.version || '2.0'
      },
      performance: {
        avgProcessingTime: analytics.performance_metrics?.average_processing_time || 'N/A',
        approvalAccuracy: analytics.performance_metrics?.approval_accuracy || 'N/A',
        systemEfficiency: analytics.performance_metrics?.system_efficiency || 'unknown',
        aiVsHuman: analytics.performance_metrics?.ai_vs_human_performance || {}
      },
      rankings: analytics.agent_rankings || [],
      insights: analytics.optimization_insights || [],
      recommendations: analytics.recommendations || [],
      dataSource: analytics.data_source || 'unknown'
    }
  },

  // V2 Rules Analysis
  analyzeRuleCompliance: (loanApplication, delegationRules) => {
    if (!delegationRules?.delegation_rules) return null

    const rules = delegationRules.delegation_rules
    const compliance = []

    // Check regulatory review
    if (loanApplication.loan_amount > 1000000) {
      compliance.push({
        rule: 'regulatory_review',
        triggered: true,
        condition: rules.regulatory_review.condition,
        expectedAgent: rules.regulatory_review.agent,
        reasoning: rules.regulatory_review.reasoning
      })
    }

    // Check high value
    if (loanApplication.loan_amount > 500000) {
      compliance.push({
        rule: 'high_value',
        triggered: true,
        condition: rules.high_value.condition,
        expectedAgent: rules.high_value.agent,
        reasoning: rules.high_value.reasoning
      })
    }

    // Check high risk
    if (loanApplication.credit_score < 600 || loanApplication.debt_to_income > 0.5) {
      compliance.push({
        rule: 'high_risk',
        triggered: true,
        condition: rules.high_risk.condition,
        expectedAgent: rules.high_risk.agent,
        reasoning: rules.high_risk.reasoning
      })
    }

    // Check AI suitable
    const aiSuitable = (
      ['low_risk', 'medium_risk'].includes(bankingV2Api.calculateRiskLevel(loanApplication.credit_score, loanApplication.debt_to_income, loanApplication.loan_amount)) &&
      loanApplication.loan_amount <= 100000 &&
      loanApplication.credit_score >= 700 &&
      ['personal_loan', 'auto_loan'].includes(loanApplication.loan_type) &&
      loanApplication.documentation_quality >= 0.8
    )

    if (aiSuitable) {
      compliance.push({
        rule: 'ai_suitable',
        triggered: true,
        condition: rules.ai_suitable.condition,
        expectedAgent: rules.ai_suitable.agent,
        reasoning: rules.ai_suitable.reasoning
      })
    }

    // Check complex loan types
    if (['business_loan', 'mortgage_loan'].includes(loanApplication.loan_type)) {
      compliance.push({
        rule: 'complex_loan_types',
        triggered: true,
        condition: rules.complex_loan_types.condition,
        expectedAgent: rules.complex_loan_types.agent,
        reasoning: rules.complex_loan_types.reasoning
      })
    }

    return {
      triggeredRules: compliance,
      totalRules: Object.keys(rules).length,
      triggeredCount: compliance.length,
      primaryRule: compliance[0] || null
    }
  },

  // Performance Comparison Utilities
  comparePerformanceMetrics: (v1Analytics, v2Analytics) => {
    if (!v1Analytics || !v2Analytics) return null

    const v1Parsed = bankingV2Api.parseV2Analytics(v1Analytics)
    const v2Parsed = bankingV2Api.parseV2Analytics(v2Analytics)

    return {
      processingTime: {
        v1: v1Parsed.performance.avgProcessingTime,
        v2: v2Parsed.performance.avgProcessingTime,
        improvement: 'V2 optimized delegation rules'
      },
      accuracy: {
        v1: v1Parsed.performance.approvalAccuracy,
        v2: v2Parsed.performance.approvalAccuracy,
        improvement: 'Enhanced risk assessment'
      },
      aiPerformance: {
        v1: v1Parsed.performance.aiVsHuman.ai_avg_quality || 'N/A',
        v2: v2Parsed.performance.aiVsHuman.ai_avg_quality || 'N/A',
        improvement: 'Stricter AI delegation criteria'
      },
      insights: {
        v1Count: v1Parsed.insights.length,
        v2Count: v2Parsed.insights.length,
        v2Advantages: [
          'Enhanced delegation rules',
          'Detailed reasoning for decisions',
          'Better AI/human optimization',
          'Improved fallback predictions'
        ]
      }
    }
  },

  // V2 Optimization Insights
  generateOptimizationReport: (analytics, delegationHistory) => {
    const parsed = bankingV2Api.parseV2Analytics(analytics)

    const report = {
      summary: {
        version: parsed.overview.version,
        dataSource: parsed.dataSource,
        totalLoans: parsed.overview.totalLoans,
        systemEfficiency: parsed.performance.systemEfficiency
      },
      strengths: [],
      improvements: [],
      recommendations: parsed.recommendations
    }

    // Analyze strengths
    if (parsed.performance.systemEfficiency === 'optimized') {
      report.strengths.push('System operating at optimized efficiency')
    }

    if (parsed.performance.aiVsHuman.ai_avg_quality) {
      const aiQuality = parseFloat(parsed.performance.aiVsHuman.ai_avg_quality)
      if (aiQuality > 90) {
        report.strengths.push('AI performance exceeds 90% quality threshold')
      }
    }

    // Analyze improvements
    if (parsed.dataSource === 'fallback_estimates') {
      report.improvements.push('Connect to learning service for real-time analytics')
    }

    if (delegationHistory && delegationHistory.length < 10) {
      report.improvements.push('Process more loans to improve ML model accuracy')
    }

    return report
  }
}
