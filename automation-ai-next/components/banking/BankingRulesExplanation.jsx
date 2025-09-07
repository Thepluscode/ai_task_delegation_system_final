'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  ShieldCheckIcon,
  UserIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { bankingV2Api } from '@/lib/api/bankingV2'
import toast from 'react-hot-toast'

export function BankingRulesExplanation() {
  const [rules, setRules] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedRule, setSelectedRule] = useState(null)
  const [testLoan, setTestLoan] = useState({
    loan_amount: 25000,
    credit_score: 720,
    debt_to_income: 0.3,
    loan_type: 'personal_loan',
    documentation_quality: 0.8
  })
  const [ruleCompliance, setRuleCompliance] = useState(null)

  useEffect(() => {
    loadRules()
  }, [])

  useEffect(() => {
    if (rules) {
      analyzeCompliance()
    }
  }, [testLoan, rules])

  const loadRules = async () => {
    setLoading(true)
    try {
      const result = await bankingV2Api.getDelegationRules()
      setRules(result)
    } catch (error) {
      toast.error('Failed to load delegation rules')
      console.error('Rules loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeCompliance = () => {
    if (!rules) return
    
    const compliance = bankingV2Api.analyzeRuleCompliance(testLoan, rules)
    setRuleCompliance(compliance)
  }

  const getRuleIcon = (ruleKey) => {
    const icons = {
      'regulatory_review': <ShieldCheckIcon className="w-5 h-5 text-purple-500" />,
      'high_value': <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />,
      'high_risk': <ExclamationTriangleIcon className="w-5 h-5 text-error-500" />,
      'ai_suitable': <CpuChipIcon className="w-5 h-5 text-blue-500" />,
      'complex_loan_types': <DocumentTextIcon className="w-5 h-5 text-green-500" />
    }
    return icons[ruleKey] || <InformationCircleIcon className="w-5 h-5 text-gray-500" />
  }

  const getRuleColor = (ruleKey) => {
    const colors = {
      'regulatory_review': 'purple',
      'high_value': 'orange',
      'high_risk': 'error',
      'ai_suitable': 'blue',
      'complex_loan_types': 'green'
    }
    return colors[ruleKey] || 'gray'
  }

  const getRulePriority = (ruleKey) => {
    const priorities = {
      'regulatory_review': 1,
      'high_value': 2,
      'high_risk': 3,
      'complex_loan_types': 4,
      'ai_suitable': 5
    }
    return priorities[ruleKey] || 6
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!rules) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Rules
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load delegation rules. Please ensure the V2 service is running.
            </p>
            <Button onClick={loadRules} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sortedRules = Object.entries(rules.delegation_rules).sort(
    ([a], [b]) => getRulePriority(a) - getRulePriority(b)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            V2 Delegation Rules
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Enhanced delegation rules with optimized AI routing and human oversight
          </p>
        </div>
        
        <Badge variant="primary" size="sm">
          Version {rules.version}
        </Badge>
      </div>

      {/* Test Loan Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Loan Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loan Amount
              </label>
              <input
                type="number"
                value={testLoan.loan_amount}
                onChange={(e) => setTestLoan(prev => ({ ...prev, loan_amount: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credit Score
              </label>
              <input
                type="number"
                value={testLoan.credit_score}
                onChange={(e) => setTestLoan(prev => ({ ...prev, credit_score: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                min="300"
                max="850"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Debt-to-Income
              </label>
              <input
                type="number"
                step="0.01"
                value={testLoan.debt_to_income}
                onChange={(e) => setTestLoan(prev => ({ ...prev, debt_to_income: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                min="0"
                max="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loan Type
              </label>
              <select
                value={testLoan.loan_type}
                onChange={(e) => setTestLoan(prev => ({ ...prev, loan_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
              >
                <option value="personal_loan">Personal</option>
                <option value="auto_loan">Auto</option>
                <option value="mortgage_loan">Mortgage</option>
                <option value="business_loan">Business</option>
                <option value="credit_line">Credit Line</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Doc Quality
              </label>
              <input
                type="number"
                step="0.01"
                value={testLoan.documentation_quality}
                onChange={(e) => setTestLoan(prev => ({ ...prev, documentation_quality: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                min="0"
                max="1"
              />
            </div>
          </div>
          
          {/* Rule Compliance Results */}
          {ruleCompliance && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Rule Analysis Results
                </h4>
                <Badge variant="outline" size="sm">
                  {ruleCompliance.triggeredCount} of {ruleCompliance.totalRules} rules triggered
                </Badge>
              </div>
              
              {ruleCompliance.triggeredRules.length > 0 ? (
                <div className="space-y-2">
                  {ruleCompliance.triggeredRules.map((rule, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-white dark:bg-gray-700 rounded border">
                      {getRuleIcon(rule.rule)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {rule.rule.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Expected Agent: {rule.expectedAgent}
                        </p>
                      </div>
                      <Badge variant={getRuleColor(rule.rule)} size="sm">
                        Triggered
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No specific rules triggered - would use default delegation logic
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delegation Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedRules.map(([ruleKey, rule]) => (
          <Card 
            key={ruleKey}
            className={`cursor-pointer transition-all duration-200 ${
              selectedRule === ruleKey ? 'ring-2 ring-primary-500' : ''
            } ${
              ruleCompliance?.triggeredRules.some(r => r.rule === ruleKey) 
                ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
                : ''
            }`}
            onClick={() => setSelectedRule(selectedRule === ruleKey ? null : ruleKey)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getRuleIcon(ruleKey)}
                  <CardTitle className="text-lg">
                    {ruleKey.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                </div>
                
                <div className="flex items-center space-x-2">
                  {ruleCompliance?.triggeredRules.some(r => r.rule === ruleKey) && (
                    <Badge variant={getRuleColor(ruleKey)} size="sm">
                      Active
                    </Badge>
                  )}
                  <Badge variant="outline" size="sm">
                    Priority {getRulePriority(ruleKey)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {rule.condition}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Agent: {rule.agent}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reasoning:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rule.reasoning}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Goals */}
      <Card>
        <CardHeader>
          <CardTitle>V2 Optimization Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.optimization_goals.map((goal, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-success-500 mt-0.5" />
                <p className="text-sm text-green-800 dark:text-green-200">
                  {goal}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rule Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Evaluation Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Rules are evaluated in priority order. The first matching rule determines the agent assignment.
            </p>
            
            <div className="space-y-2">
              {sortedRules.map(([ruleKey, rule], index) => (
                <div key={ruleKey} className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20">
                    <span className="text-sm font-bold text-primary-600">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getRuleIcon(ruleKey)}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ruleKey.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                  
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rule.agent}
                  </span>
                  
                  {ruleCompliance?.triggeredRules.some(r => r.rule === ruleKey) && (
                    <Badge variant={getRuleColor(ruleKey)} size="sm">
                      Would Apply
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
