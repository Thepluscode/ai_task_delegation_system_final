import { api, apiUtils } from './client'

// Banking Learning Service API Client with Demo Data
export const bankingApi = {
  // Service Health and Info
  getServiceInfo: async () => {
    // Return demo service info for investor presentations
    return {
      service: 'Banking Learning Service',
      version: 'v1.0.0',
      status: 'operational',
      uptime: '99.8%',
      demo_mode: true,
      features: ['loan_processing', 'risk_assessment', 'compliance_checking'],
      performance: {
        avg_response_time: '45ms',
        requests_per_second: 2500,
        success_rate: 99.7
      }
    }
  },

  healthCheck: async () => {
    return {
      status: 'healthy',
      service: 'banking',
      version: 'v1',
      timestamp: new Date().toISOString()
    }
  },

  // Loan Processing
  delegateLoanApplication: async (loanRequest) => {
    // Convert object to query parameters for the simplified API
    const params = new URLSearchParams({
      application_id: loanRequest.application_id,
      loan_type: loanRequest.loan_type,
      loan_amount: loanRequest.loan_amount.toString(),
      credit_score: loanRequest.credit_score.toString(),
      debt_to_income: loanRequest.debt_to_income.toString(),
      documentation_quality: loanRequest.documentation_quality.toString(),
      applicant_history: loanRequest.applicant_history || 'new'
    })

    return api.post(`/api/v1/banking/delegate-loan?${params.toString()}`, {}, {
      baseURL: process.env.NEXT_PUBLIC_BANKING_SERVICE_URL || 'http://localhost:8005'
    })
  },

  submitLoanFeedback: async (feedbackRequest) => {
    // Convert object to query parameters for the simplified API
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

    return api.post(`/api/v1/banking/feedback?${params.toString()}`, {}, {
      baseURL: process.env.NEXT_PUBLIC_BANKING_SERVICE_URL || 'http://localhost:8005'
    })
  },

  getBankingAnalytics: async () => {
    // Return comprehensive demo analytics for investor presentations
    return {
      overview: {
        total_applications: 15847,
        processed_today: 342,
        approval_rate: 78.5,
        avg_processing_time: '2.3 minutes',
        cost_savings: '$1.2M annually',
        efficiency_improvement: '67%'
      },
      performance_metrics: {
        accuracy: 99.7,
        speed_improvement: '85x faster',
        human_agent_utilization: 23,
        ai_agent_utilization: 77,
        customer_satisfaction: 94.8
      },
      risk_assessment: {
        high_risk_detected: 156,
        medium_risk: 892,
        low_risk: 14799,
        fraud_prevention_rate: 99.2,
        compliance_score: 98.9
      },
      financial_impact: {
        revenue_increase: '$3.8M',
        operational_cost_reduction: '$1.2M',
        processing_cost_per_loan: '$2.45',
        traditional_cost_per_loan: '$47.80',
        roi_percentage: 340
      },
      agent_performance: [
        {
          agent_id: 'BANKING_AI_001',
          specialization: 'mortgage_loans',
          applications_processed: 4567,
          accuracy: 99.8,
          avg_processing_time: '1.8 minutes'
        },
        {
          agent_id: 'BANKING_AI_002',
          specialization: 'personal_loans',
          applications_processed: 6234,
          accuracy: 99.6,
          avg_processing_time: '2.1 minutes'
        },
        {
          agent_id: 'BANKING_AI_003',
          specialization: 'business_loans',
          applications_processed: 3456,
          accuracy: 99.9,
          avg_processing_time: '3.2 minutes'
        }
      ],
      real_time_stats: {
        current_queue: 23,
        processing_now: 8,
        completed_today: 342,
        success_rate_today: 97.8,
        avg_wait_time: '0.3 minutes'
      },
      recommendations: [
        'Increase AI agent capacity during peak hours (9-11 AM) to reduce queue times',
        'Implement advanced risk scoring for business loans to improve approval accuracy',
        'Deploy additional fraud detection agents for high-value transactions',
        'Optimize document processing workflow to reduce manual review by 15%',
        'Enable real-time learning for mortgage application patterns'
      ],
      banking_overview: {
        total_loans_processed: 15847,
        agents_active: 3,
        loan_types_handled: [
          'Personal Loans',
          'Mortgage Loans',
          'Business Loans',
          'Auto Loans',
          'Student Loans'
        ],
        average_approval_time: '2.3 minutes',
        success_rate: 97.8
      },
      demo_mode: true,
      timestamp: new Date().toISOString()
    }
  },

  // Utility functions for client-side operations
  calculateRiskLevel: (creditScore, debtToIncome, loanAmount) => {
    if (loanAmount > 1000000) {
      return 'regulatory_review'
    } else if (creditScore < 600 || debtToIncome > 0.5) {
      return 'high_risk'
    } else if (creditScore < 700 || debtToIncome > 0.36) {
      return 'medium_risk'
    } else {
      return 'low_risk'
    }
  },

  calculateComplexityScore: (loanType, loanAmount, creditScore, documentationQuality) => {
    let complexity = 0.0
    
    // Loan amount factor
    if (loanAmount > 500000) {
      complexity += 0.3
    } else if (loanAmount > 100000) {
      complexity += 0.2
    } else {
      complexity += 0.1
    }
    
    // Credit score factor
    if (creditScore < 600) {
      complexity += 0.3
    } else if (creditScore < 700) {
      complexity += 0.2
    } else {
      complexity += 0.1
    }
    
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
      'mortgage_loan': 'Mortgage Loan',
      'business_loan': 'Business Loan',
      'auto_loan': 'Auto Loan',
      'credit_line': 'Credit Line'
    }
    return labels[loanType] || loanType
  },

  getAgentTypeLabel: (agentType) => {
    const labels = {
      'ai_underwriter': 'AI Underwriter',
      'junior_loan_officer': 'Junior Loan Officer',
      'senior_loan_officer': 'Senior Loan Officer',
      'loan_specialist': 'Loan Specialist',
      'compliance_officer': 'Compliance Officer'
    }
    return labels[agentType] || agentType
  },

  getRiskLevelColor: (riskLevel) => {
    const colors = {
      'low_risk': 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
      'medium_risk': 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
      'high_risk': 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
      'regulatory_review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }
    return colors[riskLevel] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  },

  getAgentTypeColor: (agentType) => {
    const colors = {
      'ai_underwriter': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'junior_loan_officer': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'senior_loan_officer': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'loan_specialist': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'compliance_officer': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[agentType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  },

  validateLoanApplication: (application) => {
    const errors = []
    
    if (!application.application_id) {
      errors.push('Application ID is required')
    }
    
    if (!application.loan_type) {
      errors.push('Loan type is required')
    }
    
    if (!application.loan_amount || application.loan_amount <= 0) {
      errors.push('Valid loan amount is required')
    }
    
    if (!application.credit_score || application.credit_score < 300 || application.credit_score > 850) {
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
  },

  generateApplicationId: () => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `LOAN-${timestamp}-${random}`.toUpperCase()
  },

  calculateProcessingPriority: (loanType, loanAmount, riskLevel) => {
    let priority = 0
    
    // Risk level priority
    const riskPriorities = {
      'regulatory_review': 100,
      'high_risk': 80,
      'medium_risk': 60,
      'low_risk': 40
    }
    priority += riskPriorities[riskLevel] || 40
    
    // Loan amount priority
    if (loanAmount > 1000000) priority += 30
    else if (loanAmount > 500000) priority += 20
    else if (loanAmount > 100000) priority += 10
    
    // Loan type priority
    const typePriorities = {
      'business_loan': 20,
      'mortgage_loan': 15,
      'credit_line': 10,
      'auto_loan': 5,
      'personal_loan': 0
    }
    priority += typePriorities[loanType] || 0
    
    return Math.min(priority, 150) // Cap at 150
  },

  getRecommendedAgent: (loanType, riskLevel, complexity, loanAmount) => {
    // Regulatory review required
    if (riskLevel === 'regulatory_review' || loanAmount > 1000000) {
      return {
        type: 'compliance_officer',
        reasoning: 'Large loan amount requires regulatory compliance review'
      }
    }
    
    // High-risk loans need senior analysts
    if (riskLevel === 'high_risk' || complexity > 0.7) {
      return {
        type: 'senior_loan_officer',
        reasoning: 'High-risk/complex loan requires senior analyst expertise'
      }
    }
    
    // Low-risk, simple loans can go to AI
    if (riskLevel === 'low_risk' && complexity < 0.3 && loanAmount < 50000) {
      return {
        type: 'ai_underwriter',
        reasoning: 'Low-risk, simple loan suitable for AI processing'
      }
    }
    
    // Business loans need specialists
    if (loanType === 'business_loan') {
      return {
        type: 'loan_specialist',
        reasoning: 'Business loan requires specialized expertise'
      }
    }
    
    // Default to junior officer
    return {
      type: 'junior_loan_officer',
      reasoning: 'Standard loan processing assignment'
    }
  },

  calculateExpectedProcessingTime: (loanType, complexity, agentType) => {
    // Base processing times by loan type (in minutes)
    const baseTimes = {
      'personal_loan': 30,
      'auto_loan': 45,
      'credit_line': 60,
      'mortgage_loan': 120,
      'business_loan': 180
    }
    
    // Agent efficiency multipliers
    const agentMultipliers = {
      'ai_underwriter': 0.3,
      'junior_loan_officer': 1.0,
      'senior_loan_officer': 0.8,
      'loan_specialist': 0.9,
      'compliance_officer': 1.2
    }
    
    const baseTime = baseTimes[loanType] || 60
    const agentMultiplier = agentMultipliers[agentType] || 1.0
    const complexityMultiplier = 1 + (complexity * 0.5)
    
    return Math.round(baseTime * agentMultiplier * complexityMultiplier)
  },

  // Performance analysis helpers
  analyzeLoanPerformance: (loans) => {
    if (!loans || loans.length === 0) {
      return {
        totalLoans: 0,
        approvalRate: 0,
        avgProcessingTime: 0,
        avgLoanAmount: 0,
        qualityScore: 0
      }
    }
    
    const totalLoans = loans.length
    const approvedLoans = loans.filter(loan => loan.approved).length
    const totalProcessingTime = loans.reduce((sum, loan) => sum + loan.processing_time, 0)
    const totalAmount = loans.reduce((sum, loan) => sum + loan.loan_amount, 0)
    const totalQuality = loans.reduce((sum, loan) => {
      const quality = (
        loan.quality_metrics.approval_accuracy * 0.4 +
        loan.quality_metrics.compliance_score * 0.3 +
        loan.quality_metrics.customer_satisfaction * 0.2 +
        loan.quality_metrics.processing_quality * 0.1
      )
      return sum + quality
    }, 0)
    
    return {
      totalLoans,
      approvalRate: (approvedLoans / totalLoans) * 100,
      avgProcessingTime: totalProcessingTime / totalLoans,
      avgLoanAmount: totalAmount / totalLoans,
      qualityScore: (totalQuality / totalLoans) * 100
    }
  },

  generatePerformanceReport: (loans, period) => {
    const analysis = bankingApi.analyzeLoanPerformance(loans)
    
    // Group by loan type
    const byLoanType = loans.reduce((acc, loan) => {
      if (!acc[loan.loan_type]) {
        acc[loan.loan_type] = []
      }
      acc[loan.loan_type].push(loan)
      return acc
    }, {})
    
    const loanTypeMetrics = Object.entries(byLoanType).map(([type, typeLoans]) => ({
      loan_type: type,
      ...bankingApi.analyzeLoanPerformance(typeLoans)
    }))
    
    return {
      period,
      summary: analysis,
      by_loan_type: loanTypeMetrics,
      recommendations: bankingApi.generateRecommendations(analysis, loanTypeMetrics)
    }
  },

  generateRecommendations: (summary, loanTypeMetrics) => {
    const recommendations = []
    
    if (summary.approvalRate < 70) {
      recommendations.push('Review underwriting criteria - approval rate is below industry standard')
    }
    
    if (summary.avgProcessingTime > 120) {
      recommendations.push('Consider process optimization - average processing time exceeds 2 hours')
    }
    
    if (summary.qualityScore < 80) {
      recommendations.push('Implement quality improvement measures - quality score below target')
    }
    
    // Check for loan type specific issues
    loanTypeMetrics.forEach(metric => {
      if (metric.approvalRate < 60) {
        recommendations.push(`Review ${metric.loan_type} underwriting - low approval rate`)
      }
      if (metric.avgProcessingTime > 180) {
        recommendations.push(`Optimize ${metric.loan_type} processing workflow`)
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges')
    }
    
    return recommendations
  }
}
