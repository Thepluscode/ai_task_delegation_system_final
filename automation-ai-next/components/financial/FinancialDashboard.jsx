'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CpuChipIcon,
  ScaleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts'

const FinancialDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedPortfolio, setSelectedPortfolio] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [riskMetrics, setRiskMetrics] = useState(null)

  useEffect(() => {
    fetchFinancialData()
    fetchRiskAlerts()
    fetchRiskMetrics()
    
    const interval = setInterval(() => {
      fetchFinancialData()
      fetchRiskAlerts()
      fetchRiskMetrics()
    }, 5000) // High frequency for financial data
    
    return () => clearInterval(interval)
  }, [selectedPortfolio])

  const fetchFinancialData = async () => {
    try {
      const response = await fetch(`/api/financial/dashboard?portfolio=${selectedPortfolio}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRiskAlerts = async () => {
    try {
      const response = await fetch(`/api/financial/risk-alerts?portfolio=${selectedPortfolio}`)
      const alertData = await response.json()
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error('Error fetching risk alerts:', error)
    }
  }

  const fetchRiskMetrics = async () => {
    try {
      const response = await fetch(`/api/financial/risk-metrics?portfolio=${selectedPortfolio}`)
      const riskData = await response.json()
      setRiskMetrics(riskData)
    } catch (error) {
      console.error('Error fetching risk metrics:', error)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="h-8 w-8 text-purple-600" />
            Financial Services Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Algorithmic trading, risk management, and compliance monitoring</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            SOX Compliant
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Real-time Trading
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Risk Monitored
          </Badge>
        </div>
      </div>

      {/* Critical Risk Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
              alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
              alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {alert.severity === 'critical' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : alert.severity === 'high' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                ) : (
                  <ShieldCheckIcon className="h-5 w-5 text-yellow-600" />
                )}
                <AlertDescription className="font-medium">
                  <span className="font-semibold">{alert.type}:</span> {alert.message}
                  <span className="text-sm text-gray-500 ml-2">({alert.timestamp})</span>
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.portfolioValue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {(dashboardData?.portfolioChange || 0) >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${(dashboardData?.portfolioChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(Math.abs(dashboardData?.portfolioChange || 0))}
                  </span>
                </div>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily P&L</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.dailyPnL || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-blue-600">
                    {formatNumber(dashboardData?.tradesExecuted || 0)} trades
                  </span>
                </div>
              </div>
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">VaR (95%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(riskMetrics?.var95 || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Within limits</span>
                </div>
              </div>
              <ScaleIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(riskMetrics?.sharpeRatio || 0).toFixed(2)}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Excellent</span>
                </div>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Services Tabs */}
      <Tabs defaultValue="trading" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="risk">Risk Management</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trading Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Algorithmic Trading Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dashboardData?.tradingPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="volume" fill="#8B5CF6" name="Volume ($M)" />
                    <Line yAxisId="right" type="monotone" dataKey="pnl" stroke="#10B981" strokeWidth={3} name="P&L ($K)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Strategy Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.strategyPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="strategy" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="pnl" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Trading Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Active Trading Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.activeStrategies || []).map((strategy, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${
                        strategy.status === 'active' ? 'bg-green-500' :
                        strategy.status === 'paused' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Asset Class:</span>
                        <span className="font-medium">{strategy.assetClass}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Daily P&L:</span>
                        <span className={`font-medium ${strategy.dailyPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(strategy.dailyPnL)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trades Today:</span>
                        <span className="font-medium">{strategy.tradesCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Win Rate:</span>
                        <span className="font-medium text-green-600">{strategy.winRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(riskMetrics?.var95 || 0)}
                      </p>
                      <p className="text-sm text-gray-600">VaR 95%</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(riskMetrics?.var99 || 0)}
                      </p>
                      <p className="text-sm text-gray-600">VaR 99%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expected Shortfall:</span>
                      <span className="text-sm text-red-600">{formatCurrency(riskMetrics?.expectedShortfall || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Portfolio Beta:</span>
                      <span className="text-sm text-blue-600">{(riskMetrics?.beta || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Max Drawdown:</span>
                      <span className="text-sm text-orange-600">{formatPercentage(riskMetrics?.maxDrawdown || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Volatility:</span>
                      <span className="text-sm text-purple-600">{formatPercentage(riskMetrics?.volatility || 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Limits Monitoring */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Limits Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.riskLimits || []).map((limit, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{limit.name}</span>
                        <span className={`${
                          limit.utilization > 0.9 ? 'text-red-600' :
                          limit.utilization > 0.7 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {formatPercentage(limit.utilization)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            limit.utilization > 0.9 ? 'bg-red-500' :
                            limit.utilization > 0.7 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${limit.utilization * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Current: {formatCurrency(limit.current)}</span>
                        <span>Limit: {formatCurrency(limit.limit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stress Testing Results */}
          <Card>
            <CardHeader>
              <CardTitle>Stress Testing Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(dashboardData?.stressTests || []).map((test, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{test.scenario}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Portfolio Impact:</span>
                        <span className="font-medium text-red-600">{formatPercentage(test.impact)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Value Change:</span>
                        <span className="font-medium text-red-600">{formatCurrency(test.valueChange)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Recovery Time:</span>
                        <span className="font-medium text-gray-600">{test.recoveryDays} days</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.assetAllocation || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.assetAllocation || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Attribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Attribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.performanceAttribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatPercentage(value)} />
                    <Bar dataKey="contribution" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.complianceStatus || []).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{item.framework}</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Compliant
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData?.auditTrail || []).map((audit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{audit.action}</p>
                        <p className="text-xs text-gray-500">{audit.timestamp} - {audit.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Portfolio Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Client Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.clientPortfolios || []).map((client, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{client.name}</h4>
                        <Badge variant={client.riskProfile === 'high' ? 'destructive' : client.riskProfile === 'medium' ? 'default' : 'secondary'}>
                          {client.riskProfile} risk
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">AUM:</span>
                          <span className="font-medium ml-2">{formatCurrency(client.aum)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">YTD Return:</span>
                          <span className={`font-medium ml-2 ${client.ytdReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(client.ytdReturn)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Client Onboarding */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Client Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(dashboardData?.recentOnboarding || []).map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserGroupIcon className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-600">{client.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(client.initialDeposit)}</p>
                        <p className="text-xs text-gray-500">{client.onboardingDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk-Return Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Risk-Return Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={dashboardData?.riskReturnData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="risk" name="Risk" />
                    <YAxis dataKey="return" name="Return" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="return" fill="#8B5CF6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Correlation */}
            <Card>
              <CardHeader>
                <CardTitle>Market Correlation Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {(dashboardData?.correlationMatrix || []).map((row, rowIndex) => (
                    row.map((value, colIndex) => (
                      <div 
                        key={`${rowIndex}-${colIndex}`}
                        className={`p-2 text-center rounded ${
                          value > 0.7 ? 'bg-red-100 text-red-800' :
                          value > 0.3 ? 'bg-yellow-100 text-yellow-800' :
                          value > -0.3 ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {value.toFixed(2)}
                      </div>
                    ))
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialDashboard
