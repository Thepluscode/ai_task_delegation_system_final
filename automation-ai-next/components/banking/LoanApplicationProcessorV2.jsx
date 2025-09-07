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
  ShieldCheckIcon,
  LightBulbIcon,
  BeakerIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { 
  useLoanApplicationBuilderV2, 
  useLoanProcessingV2, 
  useDelegationInsights,
  useBankingServiceStatusV2 
} from '@/lib/hooks/useBankingV2'
import { bankingV2Api } from '@/lib/api/bankingV2'
import { LoanType } from '@/types/banking'
import toast from 'react-hot-toast'

export function LoanApplicationProcessorV2() {
  const { 
    application, 
    calculatedMetrics, 
    v2Insights,
    updateApplication, 
    resetApplication, 
    validateApplication 
  } = useLoanApplicationBuilderV2()
  
  const { 
    delegateLoan, 
    compareVersions, 
    loading, 
    selectedVersion, 
    switchVersion 
  } = useLoanProcessingV2()
  
  const { insights, addInsight, getRecentInsights } = useDelegationInsights()
  const { serviceInfo } = useBankingServiceStatusV2()

  const [processingResults, setProcessingResults] = useState([])
  const [comparisonMode, setComparisonMode] = useState(false)
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

  const handleProcessLoan = async () => {
    try {
      const validation = validateApplication()
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`)
        return
      }

      let result
      if (comparisonMode) {
        // Compare both versions
        result = await compareVersions(application)
        
        // Add comparison result to processing results
        setProcessingResults(prev => [
          { 
            type: 'comparison',
            result, 
            application: { ...application }, 
            timestamp: new Date().toISOString() 
          },
          ...prev.slice(0, 49)
        ])
      } else {
        // Single version delegation
        result = await delegateLoan(application)
        
        // Extract delegation info
        const delegation = result.delegation || result
        
        // Add to processing results
        setProcessingResults(prev => [
          { 
            type: 'single',
            result: { delegation }, 
            application: { ...application }, 
            timestamp: new Date().toISOString(),
            version: selectedVersion
          },
          ...prev.slice(0, 49)
        ])
        
        // Add insights for V2
        if (selectedVersion === 'v2' && delegation.reasoning) {
          addInsight(delegation)
        }
      }
      
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
      [LoanType.PERSONAL]: [5000, 15000, 25000, 35000, 50000, 75000, 150000],
      [LoanType.AUTO]: [15000, 25000, 35000, 45000, 65000],
      [LoanType.MORTGAGE]: [200000, 350000, 500000, 750000, 1200000],
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
      application_id: bankingV2Api.generateApplicationId(),
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

  const getV2InsightIcon = (factor) => {
    switch (factor) {
      case 'ai_suitable':
        return <CpuChipIcon className="w-4 h-4 text-blue-500" />
      case 'high_value_oversight':
        return <UserIcon className="w-4 h-4 text-orange-500" />
      case 'regulatory_review':
        return <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
      case 'human_required':
        return <UserIcon className="w-4 h-4 text-green-500" />
      default:
        return <LightBulbIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const recentInsights = getRecentInsights(3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Enhanced Loan Processor
          </h2>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-gray-600 dark:text-gray-400">
              AI-powered loan processing with V1/V2 comparison
            </p>
            <Badge variant={selectedVersion === 'v2' ? 'primary' : 'outline'} size="sm">
              {selectedVersion.toUpperCase()} Active
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateRandomLoan}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Random Loan</span>
          </button>

          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${comparisonMode ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            {comparisonMode ? 'Single Mode' : 'Compare V1/V2'}
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showAdvanced ? 'Simple View' : 'Advanced View'}
          </button>
        </div>
      </div>

      {/* Version Switcher */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Service:
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedVersion === 'v1' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => switchVersion('v1')}
                >
                  V1 (Original)
                </Button>
                <Button
                  variant={selectedVersion === 'v2' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => switchVersion('v2')}
                >
                  V2 (Optimized)
                </Button>
              </div>
            </div>
            
            {serviceInfo && (
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {serviceInfo.version || 'Connected'}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                {comparisonMode ? (
                  <>
                    <BeakerIcon className="w-4 h-4" />
                    <span>Compare V1 vs V2</span>
                  </>
                ) : (
                  <>
                    <BanknotesIcon className="w-4 h-4" />
                    <span>Process with {selectedVersion.toUpperCase()}</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Risk Assessment & V2 Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment & V2 Insights</CardTitle>
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
                  <Badge variant={bankingV2Api.getRiskLevelColor(calculatedMetrics.risk_level)} size="sm">
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
              
              {/* V2 Enhanced Insights */}
              {v2Insights && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    V2 Processing Insights
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2 rounded text-xs ${v2Insights.ai_suitable ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                      <div className="flex items-center space-x-1">
                        <CpuChipIcon className="w-3 h-3" />
                        <span>AI Suitable: {v2Insights.ai_suitable ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded text-xs ${v2Insights.high_value_oversight ? 'bg-orange-50 text-orange-800 border border-orange-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-3 h-3" />
                        <span>High Value: {v2Insights.high_value_oversight ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded text-xs ${v2Insights.regulatory_review ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                      <div className="flex items-center space-x-1">
                        <ShieldCheckIcon className="w-3 h-3" />
                        <span>Regulatory: {v2Insights.regulatory_review ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    <div className={`p-2 rounded text-xs ${v2Insights.human_required ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-3 h-3" />
                        <span>Human Req: {v2Insights.human_required ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {showAdvanced && v2Insights.complexity_factors && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Complexity Factors:
                      </p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Amount:</span>
                          <Badge variant="outline" size="sm">{v2Insights.complexity_factors.amount_factor}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Credit:</span>
                          <Badge variant="outline" size="sm">{v2Insights.complexity_factors.credit_factor}</Badge>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Documentation:</span>
                          <Badge variant="outline" size="sm">{v2Insights.complexity_factors.documentation_factor}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent V2 Insights */}
      {recentInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Delegation Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInsights.map((insight, index) => (
                <div key={insight.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <LightBulbIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {insight.reasoning}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" size="sm">{insight.version}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {insight.factors.length > 0 && (
                        <div className="flex items-center space-x-2 mt-2">
                          {insight.factors.slice(0, 3).map((factor, factorIndex) => (
                            <div key={factorIndex} className="flex items-center space-x-1">
                              {getV2InsightIcon(factor.type)}
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {factor.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Processing Results ({processingResults.length})</CardTitle>
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
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {processingResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  {result.type === 'comparison' ? (
                    // Comparison result
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <BeakerIcon className="w-4 h-4 text-blue-500" />
                        <Badge variant="primary" size="sm">V1 vs V2 Comparison</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">V1 Result:</p>
                          <p className="text-sm">{result.result.v1?.delegation?.assigned_agent || 'Failed'}</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300">V2 Result:</p>
                          <p className="text-sm">{result.result.v2?.delegation?.assigned_agent || 'Failed'}</p>
                        </div>
                      </div>
                      
                      {result.result.comparison?.differences?.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Differences Found:
                          </p>
                          {result.result.comparison.differences.slice(0, 2).map((diff, diffIndex) => (
                            <div key={diffIndex} className="flex items-center space-x-2 text-xs">
                              <ArrowRightIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">{diff.description}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Single result
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                            {result.result.delegation.application_id}
                          </span>
                          <Badge variant="outline" size="sm">
                            {result.version?.toUpperCase() || 'V1'}
                          </Badge>
                          <Badge variant={bankingV2Api.getRiskLevelColor(result.result.delegation.risk_level)} size="sm">
                            {result.result.delegation.risk_level?.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <span className="text-sm text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Agent: {result.result.delegation.assigned_agent}
                        </span>
                        <span className="text-primary-600">
                          {result.result.delegation.estimated_processing_time} min
                        </span>
                      </div>
                      
                      {result.result.delegation.reasoning && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded mt-2">
                          {result.result.delegation.reasoning}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
