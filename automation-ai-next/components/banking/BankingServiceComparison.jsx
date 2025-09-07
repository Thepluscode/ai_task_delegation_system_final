'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  BeakerIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { bankingV2Api } from '@/lib/api/bankingV2'
import { LoanType } from '@/types/banking'
import toast from 'react-hot-toast'

export function BankingServiceComparison() {
  const [serviceComparison, setServiceComparison] = useState(null)
  const [testLoan, setTestLoan] = useState({
    application_id: bankingV2Api.generateApplicationId(),
    loan_type: LoanType.PERSONAL,
    loan_amount: 25000,
    credit_score: 720,
    debt_to_income: 0.3,
    documentation_quality: 0.8,
    applicant_history: 'new'
  })
  const [comparisonResult, setComparisonResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(bankingV2Api.getServiceVersion())

  const loanTypeOptions = [
    { value: LoanType.PERSONAL, label: 'Personal Loan' },
    { value: LoanType.AUTO, label: 'Auto Loan' },
    { value: LoanType.MORTGAGE, label: 'Mortgage Loan' },
    { value: LoanType.BUSINESS, label: 'Business Loan' },
    { value: LoanType.CREDIT_LINE, label: 'Credit Line' },
  ]

  useEffect(() => {
    loadServiceComparison()
  }, [])

  const loadServiceComparison = async () => {
    setLoading(true)
    try {
      const comparison = await bankingV2Api.compareServices()
      setServiceComparison(comparison)
    } catch (error) {
      toast.error('Failed to load service comparison')
      console.error('Service comparison error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testDelegationComparison = async () => {
    setLoading(true)
    try {
      const result = await bankingV2Api.testDelegationComparison(testLoan)
      setComparisonResult(result)
      
      if (result.comparison.hasDifferences) {
        toast.success(`Comparison complete: ${result.comparison.differences.length} differences found`)
      } else {
        toast.success('Comparison complete: Both services produced identical results')
      }
    } catch (error) {
      toast.error('Failed to test delegation comparison')
      console.error('Delegation comparison error:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchToVersion = (version) => {
    bankingV2Api.setServiceVersion(version)
    setSelectedVersion(version)
    toast.success(`Switched to Banking Service ${version.toUpperCase()}`)
  }

  const generateRandomLoan = () => {
    const loanTypes = Object.values(LoanType)
    const randomLoanType = loanTypes[Math.floor(Math.random() * loanTypes.length)]
    
    const loanAmounts = {
      [LoanType.PERSONAL]: [5000, 15000, 25000, 35000, 50000, 75000],
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
    
    setTestLoan({
      application_id: bankingV2Api.generateApplicationId(),
      loan_type: randomLoanType,
      loan_amount: randomAmount,
      credit_score: randomCreditScore,
      debt_to_income: randomDebtRatio,
      documentation_quality: randomDocQuality,
      applicant_history: Math.random() > 0.7 ? 'existing' : 'new'
    })
  }

  const getServiceStatusIcon = (available) => {
    return available ? (
      <CheckCircleIcon className="w-5 h-5 text-success-500" />
    ) : (
      <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />
    )
  }

  const getDifferenceIcon = (type) => {
    const icons = {
      'agent_assignment': <UserIcon className="w-4 h-4 text-blue-500" />,
      'processing_time': <ClockIcon className="w-4 h-4 text-orange-500" />,
      'confidence': <ChartBarIcon className="w-4 h-4 text-purple-500" />,
      'reasoning': <LightBulbIcon className="w-4 h-4 text-green-500" />
    }
    return icons[type] || <DocumentTextIcon className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Banking Service Comparison
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Compare V1 and V2 banking services and test delegation differences
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={loadServiceComparison}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Service Status Comparison */}
      {serviceComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* V1 Service */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Banking Service V1</CardTitle>
                <div className="flex items-center space-x-2">
                  {getServiceStatusIcon(serviceComparison.v1.available)}
                  <Badge variant={selectedVersion === 'v1' ? 'primary' : 'outline'} size="sm">
                    {selectedVersion === 'v1' ? 'Active' : 'Available'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {serviceComparison.v1.available ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Version: {serviceComparison.v1.version}
                    </p>
                    <p className="text-xs text-gray-500">
                      Port: 8005 (Original Implementation)
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features:
                    </p>
                    <div className="space-y-1">
                      {serviceComparison.v1.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-3 h-3 text-success-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {feature.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => switchToVersion('v1')}
                    disabled={selectedVersion === 'v1'}
                    size="sm"
                    className="w-full"
                  >
                    {selectedVersion === 'v1' ? 'Currently Active' : 'Switch to V1'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-error-500 mx-auto mb-2" />
                  <p className="text-sm text-error-600">Service V1 Unavailable</p>
                  <p className="text-xs text-gray-500">Check if service is running on port 8005</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* V2 Service */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Banking Service V2</CardTitle>
                <div className="flex items-center space-x-2">
                  {getServiceStatusIcon(serviceComparison.v2.available)}
                  <Badge variant={selectedVersion === 'v2' ? 'primary' : 'outline'} size="sm">
                    {selectedVersion === 'v2' ? 'Active' : 'Available'}
                  </Badge>
                  <Badge variant="success" size="sm">NEW</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {serviceComparison.v2.available ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Version: {serviceComparison.v2.version}
                    </p>
                    <p className="text-xs text-gray-500">
                      Port: 8006 (Optimized Rules)
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Improvements:
                    </p>
                    <div className="space-y-1">
                      {serviceComparison.v2.improvements?.map((improvement, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <LightBulbIcon className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {improvement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => switchToVersion('v2')}
                    disabled={selectedVersion === 'v2'}
                    size="sm"
                    className="w-full"
                  >
                    {selectedVersion === 'v2' ? 'Currently Active' : 'Switch to V2'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-error-500 mx-auto mb-2" />
                  <p className="text-sm text-error-600">Service V2 Unavailable</p>
                  <p className="text-xs text-gray-500">Check if service is running on port 8006</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delegation Test */}
      <Card>
        <CardHeader>
          <CardTitle>Delegation Comparison Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Test Loan Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Application ID"
                value={testLoan.application_id}
                onChange={(e) => setTestLoan(prev => ({ ...prev, application_id: e.target.value }))}
              />
              
              <Select
                label="Loan Type"
                value={testLoan.loan_type}
                onChange={(value) => setTestLoan(prev => ({ ...prev, loan_type: value }))}
                options={loanTypeOptions}
              />
              
              <Input
                label="Loan Amount"
                type="number"
                value={testLoan.loan_amount}
                onChange={(e) => setTestLoan(prev => ({ ...prev, loan_amount: parseInt(e.target.value) }))}
              />
              
              <Input
                label="Credit Score"
                type="number"
                value={testLoan.credit_score}
                onChange={(e) => setTestLoan(prev => ({ ...prev, credit_score: parseInt(e.target.value) }))}
                min="300"
                max="850"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={testDelegationComparison}
                disabled={loading}
                loading={loading}
                className="flex items-center space-x-2"
              >
                <BeakerIcon className="w-4 h-4" />
                <span>Test Both Services</span>
              </Button>
              
              <button
                onClick={generateRandomLoan}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Random Loan</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle>Delegation Comparison Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Side-by-side Results */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* V1 Result */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" size="sm">V1 Result</Badge>
                    {comparisonResult.v1.success ? (
                      <CheckCircleIcon className="w-4 h-4 text-success-500" />
                    ) : (
                      <ExclamationTriangleIcon className="w-4 h-4 text-error-500" />
                    )}
                  </div>
                  
                  {comparisonResult.v1.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Agent:</span>
                        <span className="text-sm font-medium">{comparisonResult.v1.delegation.assigned_agent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Processing Time:</span>
                        <span className="text-sm font-medium">{comparisonResult.v1.delegation.estimated_processing_time} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                        <span className="text-sm font-medium">{(comparisonResult.v1.delegation.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-error-600">Failed to get V1 result</p>
                  )}
                </div>

                {/* V2 Result */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="primary" size="sm">V2 Result</Badge>
                    {comparisonResult.v2.success ? (
                      <CheckCircleIcon className="w-4 h-4 text-success-500" />
                    ) : (
                      <ExclamationTriangleIcon className="w-4 h-4 text-error-500" />
                    )}
                  </div>
                  
                  {comparisonResult.v2.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Agent:</span>
                        <span className="text-sm font-medium">{comparisonResult.v2.delegation.assigned_agent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Processing Time:</span>
                        <span className="text-sm font-medium">{comparisonResult.v2.delegation.estimated_processing_time} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                        <span className="text-sm font-medium">{(comparisonResult.v2.delegation.confidence * 100).toFixed(1)}%</span>
                      </div>
                      {comparisonResult.v2.delegation.reasoning && (
                        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            <strong>Reasoning:</strong> {comparisonResult.v2.delegation.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-error-600">Failed to get V2 result</p>
                  )}
                </div>
              </div>

              {/* Differences Analysis */}
              {comparisonResult.comparison && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Differences Analysis
                  </h4>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comparisonResult.comparison.summary}
                    </p>
                  </div>
                  
                  {comparisonResult.comparison.differences.length > 0 && (
                    <div className="space-y-3">
                      {comparisonResult.comparison.differences.map((diff, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          {getDifferenceIcon(diff.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {diff.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">V1: {diff.v1}</span>
                              <ArrowRightIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">V2: {diff.v2}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
