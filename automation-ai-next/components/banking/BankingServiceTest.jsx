'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { bankingApi } from '@/lib/api/banking'
import { LoanType } from '@/types/banking'
import toast from 'react-hot-toast'

export function BankingServiceTest() {
  const [testLoan, setTestLoan] = useState({
    application_id: 'TEST-' + Date.now(),
    loan_type: LoanType.PERSONAL,
    loan_amount: 25000,
    credit_score: 720,
    debt_to_income: 0.3,
    documentation_quality: 0.8,
    applicant_history: 'new'
  })

  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [serviceStatus, setServiceStatus] = useState(null)

  const loanTypeOptions = [
    { value: LoanType.PERSONAL, label: 'Personal Loan' },
    { value: LoanType.AUTO, label: 'Auto Loan' },
    { value: LoanType.MORTGAGE, label: 'Mortgage Loan' },
    { value: LoanType.BUSINESS, label: 'Business Loan' },
    { value: LoanType.CREDIT_LINE, label: 'Credit Line' },
  ]

  const testServiceConnection = async () => {
    setLoading(true)
    try {
      const result = await bankingApi.getServiceInfo()
      setServiceStatus({ status: 'connected', data: result })
      toast.success('Banking service connected successfully!')
    } catch (error) {
      setServiceStatus({ status: 'error', error: error.message })
      toast.error('Failed to connect to banking service')
    } finally {
      setLoading(false)
    }
  }

  const testLoanDelegation = async () => {
    setLoading(true)
    try {
      const result = await bankingApi.delegateLoanApplication(testLoan)
      setTestResult(result)
      toast.success('Loan delegation test completed!')
    } catch (error) {
      setTestResult({ error: error.message })
      toast.error('Loan delegation test failed')
    } finally {
      setLoading(false)
    }
  }

  const testAnalytics = async () => {
    setLoading(true)
    try {
      const result = await bankingApi.getBankingAnalytics()
      setTestResult(result)
      toast.success('Analytics test completed!')
    } catch (error) {
      setTestResult({ error: error.message })
      toast.error('Analytics test failed')
    } finally {
      setLoading(false)
    }
  }

  const generateRandomLoan = () => {
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
    
    setTestLoan({
      application_id: 'TEST-' + Date.now(),
      loan_type: randomLoanType,
      loan_amount: randomAmount,
      credit_score: randomCreditScore,
      debt_to_income: randomDebtRatio,
      documentation_quality: randomDocQuality,
      applicant_history: Math.random() > 0.7 ? 'existing' : 'new'
    })
  }

  const getRiskLevel = () => {
    return bankingApi.calculateRiskLevel(
      testLoan.credit_score,
      testLoan.debt_to_income,
      testLoan.loan_amount
    )
  }

  const getComplexityScore = () => {
    return bankingApi.calculateComplexityScore(
      testLoan.loan_type,
      testLoan.loan_amount,
      testLoan.credit_score,
      testLoan.documentation_quality
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Banking Service Test
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Test connection and functionality of the Banking Learning Service
          </p>
        </div>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              onClick={testServiceConnection}
              disabled={loading}
              loading={loading}
              className="flex items-center space-x-2"
            >
              <BanknotesIcon className="w-4 h-4" />
              <span>Test Connection</span>
            </Button>
            
            {serviceStatus && (
              <div className="flex items-center space-x-2">
                {serviceStatus.status === 'connected' ? (
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-error-500" />
                )}
                <Badge 
                  variant={serviceStatus.status === 'connected' ? 'success' : 'error'} 
                  size="sm"
                >
                  {serviceStatus.status === 'connected' ? 'Connected' : 'Failed'}
                </Badge>
              </div>
            )}
          </div>
          
          {serviceStatus?.data && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <pre className="text-xs text-gray-700 dark:text-gray-300">
                {JSON.stringify(serviceStatus.data, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Test Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Loan Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Application ID"
                value={testLoan.application_id}
                onChange={(e) => setTestLoan(prev => ({ ...prev, application_id: e.target.value }))}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Credit Score"
                  type="number"
                  value={testLoan.credit_score}
                  onChange={(e) => setTestLoan(prev => ({ ...prev, credit_score: parseInt(e.target.value) }))}
                  min="300"
                  max="850"
                />
                
                <Input
                  label="Debt-to-Income"
                  type="number"
                  step="0.01"
                  value={testLoan.debt_to_income}
                  onChange={(e) => setTestLoan(prev => ({ ...prev, debt_to_income: parseFloat(e.target.value) }))}
                  min="0"
                  max="1"
                />
              </div>
              
              <Button
                onClick={generateRandomLoan}
                variant="outline"
                className="w-full"
              >
                Generate Random Loan
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculated Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk Level
                  </p>
                  <Badge variant={bankingApi.getRiskLevelColor(getRiskLevel())} size="sm">
                    {getRiskLevel().replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Complexity Score
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {(getComplexityScore() * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Formatted Amount
                </p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {bankingApi.formatLoanAmount(testLoan.loan_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              onClick={testLoanDelegation}
              disabled={loading}
              loading={loading}
              className="flex items-center space-x-2"
            >
              <BanknotesIcon className="w-4 h-4" />
              <span>Test Loan Delegation</span>
            </Button>
            
            <Button
              onClick={testAnalytics}
              disabled={loading}
              loading={loading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ClockIcon className="w-4 h-4" />
              <span>Test Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.error ? (
              <div className="flex items-start space-x-3 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-error-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error-800 dark:text-error-200">
                    Test Failed
                  </p>
                  <p className="text-sm text-error-700 dark:text-error-300">
                    {testResult.error}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="w-5 h-5 text-success-500" />
                  <span className="text-sm font-medium text-success-800 dark:text-success-200">
                    Test Completed Successfully
                  </span>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
