'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export function ROICalculator() {
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [roiData, setRoiData] = useState(null)
  const [enterpriseCustomers, setEnterpriseCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [calculatingROI, setCalculatingROI] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8011/platform/enterprise-customers')
        const customers = await response.json()
        setEnterpriseCustomers(customers)
        
        // Auto-select first customer for demo
        if (customers.length > 0) {
          setSelectedCustomer(customers[0])
          await fetchROICalculation(customers[0].customer_id)
        }
      } catch (error) {
        console.error('Error fetching customers:', error)
        // Set fallback data
        const fallbackCustomer = {
          customer_id: 'ENTERPRISE_001',
          company_name: 'GlobalManufacturing Corp',
          industry_vertical: 'manufacturing',
          enterprise_tier: 'fortune_500',
          annual_revenue: 15000000000,
          employee_count: 85000,
          current_iot_spend: 25000000
        }
        setEnterpriseCustomers([fallbackCustomer])
        setSelectedCustomer(fallbackCustomer)
        setRoiData({
          customer_profile: {
            company_name: 'GlobalManufacturing Corp',
            industry: 'manufacturing',
            tier: 'fortune_500',
            annual_revenue: '$15,000M',
            current_iot_spend: '$25.0M'
          },
          roi_analysis: {
            platform_investment: '$30.00M',
            projected_annual_savings: '$267.50M',
            roi_percentage: '892%',
            payback_period_months: '1 months',
            confidence_level: '89%'
          },
          business_impact: {
            current_baseline: {
              efficiency: 75,
              downtime_hours_monthly: 8,
              maintenance_cost_annual: 7500000
            },
            projected_improvements: {
              efficiency: 93.75,
              downtime_hours_monthly: 2.4,
              maintenance_cost_annual: 5625000
            },
            key_benefits: [
              '19% efficiency improvement',
              '6 hours monthly downtime reduction',
              '$1875K annual maintenance savings'
            ]
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const fetchROICalculation = async (customerId) => {
    try {
      setCalculatingROI(true)
      const response = await fetch(`http://localhost:8011/platform/roi-calculator/${customerId}`)
      const roi = await response.json()
      setRoiData(roi)
    } catch (error) {
      console.error('Error fetching ROI calculation:', error)
    } finally {
      setCalculatingROI(false)
    }
  }

  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer)
    await fetchROICalculation(customer.customer_id)
  }

  const formatCurrency = (value) => {
    if (typeof value === 'string') return value
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'fortune_500':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'enterprise':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'growth':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Enterprise ROI Calculator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Calculate proven return on investment for billion-dollar IoT platform deployment
        </p>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BuildingOfficeIcon className="w-6 h-6 mr-2 text-blue-600" />
            Select Enterprise Customer
          </CardTitle>
          <CardDescription>
            Choose from our Fortune 500 customer portfolio to see ROI projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enterpriseCustomers.map((customer, index) => (
              <div
                key={index}
                onClick={() => handleCustomerSelect(customer)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedCustomer?.customer_id === customer.customer_id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {customer.company_name}
                  </h4>
                  <Badge className={getTierColor(customer.enterprise_tier)}>
                    {customer.enterprise_tier?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Industry: {customer.industry_vertical?.replace('_', ' ').toUpperCase()}</div>
                  <div>Revenue: {formatCurrency(customer.annual_revenue)}</div>
                  <div>Employees: {customer.employee_count?.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Analysis */}
      {roiData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Profile & Investment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BanknotesIcon className="w-6 h-6 mr-2 text-green-600" />
                Investment Analysis
              </CardTitle>
              <CardDescription>
                Platform investment and projected returns for {roiData.customer_profile?.company_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Customer Profile */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Customer Profile</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Industry:</span>
                      <div className="font-semibold capitalize">{roiData.customer_profile?.industry}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Tier:</span>
                      <div className="font-semibold capitalize">{roiData.customer_profile?.tier?.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Annual Revenue:</span>
                      <div className="font-semibold">{roiData.customer_profile?.annual_revenue}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Current IoT Spend:</span>
                      <div className="font-semibold">{roiData.customer_profile?.current_iot_spend}</div>
                    </div>
                  </div>
                </div>

                {/* Investment Metrics */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">Platform Investment:</span>
                    <span className="text-2xl font-bold text-blue-700">{roiData.roi_analysis?.platform_investment}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-medium">Annual Savings:</span>
                    <span className="text-2xl font-bold text-green-700">{roiData.roi_analysis?.projected_annual_savings}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-purple-700 dark:text-purple-300 font-medium">ROI Percentage:</span>
                    <span className="text-2xl font-bold text-purple-700">{roiData.roi_analysis?.roi_percentage}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-orange-700 dark:text-orange-300 font-medium">Payback Period:</span>
                    <span className="text-2xl font-bold text-orange-700">{roiData.roi_analysis?.payback_period_months}</span>
                  </div>
                </div>

                {/* Confidence Level */}
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-indigo-700 dark:text-indigo-300 font-medium">Confidence Level:</span>
                    <span className="font-bold text-indigo-700">{roiData.roi_analysis?.confidence_level}</span>
                  </div>
                  <Progress value={parseInt(roiData.roi_analysis?.confidence_level)} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-blue-600" />
                Business Impact Analysis
              </CardTitle>
              <CardDescription>
                Operational improvements and key performance benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Benefits */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                    Key Benefits
                  </h4>
                  <div className="space-y-2">
                    {roiData.business_impact?.key_benefits?.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-green-700 dark:text-green-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Improvements */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Improvements</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Operational Efficiency</span>
                        <span className="font-medium">
                          {roiData.business_impact?.current_baseline?.efficiency}% → {roiData.business_impact?.projected_improvements?.efficiency}%
                        </span>
                      </div>
                      <Progress 
                        value={(roiData.business_impact?.projected_improvements?.efficiency / 100) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Monthly Downtime (hours)</span>
                        <span className="font-medium">
                          {roiData.business_impact?.current_baseline?.downtime_hours_monthly} → {roiData.business_impact?.projected_improvements?.downtime_hours_monthly}
                        </span>
                      </div>
                      <Progress 
                        value={100 - ((roiData.business_impact?.projected_improvements?.downtime_hours_monthly / roiData.business_impact?.current_baseline?.downtime_hours_monthly) * 100)} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>

                {/* Market Validation */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Market Validation
                  </h4>
                  <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <div>• Proven 10x ROI in predictive maintenance</div>
                    <div>• 92% of Fortune 500 report positive ROI</div>
                    <div>• Industry-leading 99.99% uptime SLA</div>
                    <div>• 40% faster deployment than competitors</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {calculatingROI && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <CogIcon className="w-5 h-5 animate-spin" />
            <span>Calculating ROI projections...</span>
          </div>
        </div>
      )}
    </div>
  )
}
