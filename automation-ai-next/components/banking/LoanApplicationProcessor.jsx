'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  BanknotesIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CpuChipIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useLoanApplicationBuilder, useLoanProcessing, useLoanPerformanceTracking } from '@/lib/hooks/useBanking'
import { bankingApi } from '@/lib/api/banking'
import { LoanType } from '@/types/banking'
import { formatNumber } from '@/lib/utils/helpers'
import toast from 'react-hot-toast'

export function LoanApplicationProcessor() {
  const { 
    application, 
    calculatedMetrics, 
    updateApplication, 
    calculateMetrics, 
    resetApplication, 
    validateApplication 
  } = useLoanApplicationBuilder()
  
  const { delegateLoan, loading } = useLoanProcessing()
  const { performanceData, addLoanResult, getPerformanceMetrics } = useLoanPerformanceTracking()

  const [processingResults, setProcessingResults] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)

  const loanTypeOptions = [
    { value: LoanType.PERSONAL, label: 'Personal Loan' },
    { value: LoanType.AUTO, label: 'Auto Loan' },
    { value: LoanType.MORTGAGE, label: 'Mortgage Loan' },
    { value: LoanType.BUSINESS, label: 'Business Loan' },
    { value: LoanType.CREDIT_LINE, label: 'Credit Line' },
  ]

  const applicantHistoryOptions = [
    { value: 'new', label: 'New Customer' },
    { value: 'existing', label: 'Existing Customer' },
    { value: 'returning', label: 'Returning Customer' },
  ]

  // Auto-calculate metrics when application changes
  useEffect(() => {
    calculateMetrics()
  }, [application, calculateMetrics])

  // Auto-generate application ID on mount
  useEffect(() => {
    if (!application.application_id) {
      updateApplication({ application_id: bankingApi.generateApplicationId() })
    }
  }, [application.application_id, updateApplication])

  const handleProcessLoan = async () => {
    try {
      const validation = validateApplication()
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`)
        return
      }

      const result = await delegateLoan(application)

      // Handle simplified API response format
      const delegation = result.delegation || result

      // Add to processing results
      setProcessingResults(prev => [{ delegation }, ...prev.slice(0, 49)]) // Keep last 50 results

      // Add to performance tracking
      const loanResult = {
        application_id: application.application_id,
        loan_type: application.loan_type,
        loan_amount: application.loan_amount,
        assigned_agent: delegation.assigned_agent,
        processing_time: delegation.estimated_processing_time,
        approved: true, // Simulated for demo
        quality_metrics: {
          approval_accuracy: 0.9,
          compliance_score: 0.95,
          customer_satisfaction: 0.85,
          processing_quality: 0.88
        },
        timestamp: new Date().toISOString()
      }
      addLoanResult(loanResult)
      
      // Reset for next application
      resetApplication()
      
    } catch (error) {
      console.error('Loan processing failed:', error)
    }
  }

  const handleGenerateRandomLoan = () => {
    const loanTypes = Object.values(LoanType)
    const randomLoanType = loanTypes[Math.floor(Math.random() * loanTypes.length)]
    
    const loanAmounts = {
      [LoanType.PERSONAL]: [5000, 15000, 25000, 35000, 50000],
      [LoanType.AUTO]: [15000, 25000, 35000, 45000, 65000],
      [LoanType.MORTGAGE]: [200000, 350000, 500000, 750000, 1000000],
      [LoanType.BUSINESS]: [50000, 100000, 250000, 500000, 1500000],
      [LoanType.CREDIT_LINE]: [10000, 25000, 50000, 100000, 200000]
    }
    
    const amounts = loanAmounts[randomLoanType]
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)]
    
    const creditScores = [580, 620, 650, 680, 720, 750, 780, 820]
    const randomCreditScore = creditScores[Math.floor(Math.random() * creditScores.length)]
    
    const debtRatios = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65]
    const randomDebtRatio = debtRatios[Math.floor(Math.random() * debtRatios.length)]
    
    const docQualities = [0.6, 0.7, 0.8, 0.9, 0.95]
    const randomDocQuality = docQualities[Math.floor(Math.random() * docQualities.length)]
    
    updateApplication({
      application_id: bankingApi.generateApplicationId(),
      loan_type: randomLoanType,
      loan_amount: randomAmount,
      credit_score: randomCreditScore,
      debt_to_income: randomDebtRatio,
      documentation_quality: randomDocQuality,
      applicant_history: Math.random() > 0.7 ? 'existing' : 'new'
    })
  }

  const getRiskLevelIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'low_risk':
        return <CheckCircleIcon className="w-4 h-4 text-success-500" />
      case 'medium_risk':
        return <ExclamationTriangleIcon className="w-4 h-4 text-warning-500" />
      case 'high_risk':
        return <ExclamationTriangleIcon className="w-4 h-4 text-error-500" />
      case 'regulatory_review':
        return <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getAgentTypeIcon = (agentType) => {
    if (agentType && agentType.includes('ai')) {
      return <CpuChipIcon className="w-4 h-4 text-blue-500" />
    }
    return <UserIcon className="w-4 h-4 text-gray-500" />
  }

  const performanceMetrics = getPerformanceMetrics()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loan Application Processor
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            AI-powered loan processing task delegation
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleGenerateRandomLoan}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Random Loan</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Simple View' : 'Advanced View'}
          </Button>
        </div>
      </div>

      {/* Loan Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loan Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Application ID"
                value={application.application_id}
                onChange={(e) => updateApplication({ application_id: e.target.value })}
                placeholder="LOAN-12345"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Loan Type"
                  value={application.loan_type}
                  onChange={(value) => updateApplication({ loan_type: value })}
                  options={loanTypeOptions}
                />
                
                <Input
                  label="Loan Amount"
                  type="number"
                  value={application.loan_amount}
                  onChange={(e) => updateApplication({ loan_amount: parseInt(e.target.value) })}
                  min="1000"
                  max="5000000"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Credit Score"
                  type="number"
                  value={application.credit_score}
                  onChange={(e) => updateApplication({ credit_score: parseInt(e.target.value) })}
                  min="300"
                  max="850"
                />
                
                <Input
                  label="Debt-to-Income Ratio"
                  type="number"
                  step="0.01"
                  value={application.debt_to_income}
                  onChange={(e) => updateApplication({ debt_to_income: parseFloat(e.target.value) })}
                  min="0"
                  max="1"
                />
              </div>
              
              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Documentation Quality"
                    type="number"
                    step="0.01"
                    value={application.documentation_quality}
                    onChange={(e) => updateApplication({ documentation_quality: parseFloat(e.target.value) })}
                    min="0"
                    max="1"
                  />
                  
                  <Select
                    label="Applicant History"
                    value={application.applicant_history}
                    onChange={(value) => updateApplication({ applicant_history: value })}
                    options={applicantHistoryOptions}
                  />
                </div>
              )}
              
              <Button
                onClick={handleProcessLoan}
                disabled={loading}
                loading={loading}
                className="w-full flex items-center justify-center space-x-2"
              >
                <BanknotesIcon className="w-4 h-4" />
                <span>Process Loan Application</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calculated Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment & Delegation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {getRiskLevelIcon(calculatedMetrics.risk_level)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Risk Level
                    </span>
                  </div>
                  <Badge variant={bankingApi.getRiskLevelColor(calculatedMetrics.risk_level)} size="sm">
                    {calculatedMetrics.risk_level?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ChartBarIcon className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Complexity Score
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {(calculatedMetrics.complexity_score * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {calculatedMetrics.recommended_agent && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    {getAgentTypeIcon(calculatedMetrics.recommended_agent.type)}
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Recommended Agent
                    </span>
                  </div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {bankingApi.getAgentTypeLabel(calculatedMetrics.recommended_agent.type)}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {calculatedMetrics.recommended_agent.reasoning}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calculatedMetrics.estimated_processing_time} min
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Est. Processing Time
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {bankingApi.formatLoanAmount(application.loan_amount)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loan Amount
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      {performanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Performance ({performanceData.length} loans)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {performanceMetrics.totalLoans}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Processed</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">
                  {performanceMetrics.approvalRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approval Rate</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">
                  {performanceMetrics.avgProcessingTime.toFixed(0)} min
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Processing</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {bankingApi.formatLoanAmount(performanceMetrics.avgLoanAmount)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Amount</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.qualityScore.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Processing Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Processing Results ({processingResults.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProcessingResults([])}
              disabled={processingResults.length === 0}
            >
              Clear Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {processingResults.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No loan applications processed yet. Submit an application to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {processingResults.map((result, index) => {
                const delegation = result.delegation
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {delegation.application_id}
                        </span>
                        <Badge variant={bankingApi.getRiskLevelColor(delegation.risk_level)} size="sm">
                          {delegation.risk_level.replace('_', ' ')}
                        </Badge>
                        <Badge variant={bankingApi.getAgentTypeColor(delegation.agent_type)} size="sm">
                          {bankingApi.getAgentTypeLabel(delegation.agent_type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-primary-600">
                          {delegation.estimated_processing_time} min
                        </span>
                        <span className="text-sm text-gray-500">
                          {(delegation.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Agent: {delegation.assigned_agent}
                      </span>
                      <span className="text-gray-500">
                        {new Date(delegation.delegation_timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {delegation.reasoning}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
