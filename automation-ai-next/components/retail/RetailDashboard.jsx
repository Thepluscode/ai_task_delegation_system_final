'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ShoppingCartIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
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
  FunnelChart,
  Funnel
} from 'recharts'

const RetailDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedChannel, setSelectedChannel] = useState('all')
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchRetailData()
    fetchRetailAlerts()
    
    const interval = setInterval(() => {
      fetchRetailData()
      fetchRetailAlerts()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedChannel])

  const fetchRetailData = async () => {
    try {
      const response = await fetch(`/api/retail/dashboard?channel=${selectedChannel}`)
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching retail data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRetailAlerts = async () => {
    try {
      const response = await fetch(`/api/retail/alerts?channel=${selectedChannel}`)
      const alertData = await response.json()
      setAlerts(alertData.alerts || [])
    } catch (error) {
      console.error('Error fetching retail alerts:', error)
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

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCartIcon className="h-8 w-8 text-red-600" />
            Retail & E-commerce Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Customer service automation, personalization, and inventory optimization</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-red-600 border-red-600">
            Omnichannel
          </Badge>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            AI Personalization
          </Badge>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Real-time Inventory
          </Badge>
        </div>
      </div>

      {/* Critical Retail Alerts */}
      {alerts.length > 0 && (
        <div className="grid gap-3">
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert key={index} className={`border-l-4 ${
              alert.type === 'inventory_low' ? 'border-red-500 bg-red-50' :
              alert.type === 'customer_complaint' ? 'border-yellow-500 bg-yellow-50' :
              alert.type === 'high_cart_abandonment' ? 'border-orange-500 bg-orange-50' :
              'border-blue-500 bg-blue-50'
            }`}>
              <div className="flex items-center gap-2">
                {alert.type === 'inventory_low' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                ) : alert.type === 'customer_complaint' ? (
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-yellow-600" />
                ) : (
                  <ShoppingCartIcon className="h-5 w-5 text-orange-600" />
                )}
                <AlertDescription className="font-medium">
                  <span className="font-semibold">{alert.channel}:</span> {alert.message}
                  <span className="text-sm text-gray-500 ml-2">({alert.timestamp})</span>
                </AlertDescription>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Retail Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-green-600">
                    +18% vs last month
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
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData?.activeCustomers || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-blue-600">
                    {formatNumber(dashboardData?.newCustomers || 0)} new today
                  </span>
                </div>
              </div>
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(dashboardData?.conversionRate || 0)}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Above target</span>
                </div>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((dashboardData?.customerSatisfaction || 0) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600">4.8/5 rating</span>
                </div>
              </div>
              <HeartIcon className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retail-Specific Tabs */}
      <Tabs defaultValue="customer-service" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="customer-service">Customer Service</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="voice">Voice Commerce</TabsTrigger>
          <TabsTrigger value="arvr">AR/VR Shopping</TabsTrigger>
        </TabsList>

        <TabsContent value="customer-service" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Service Performance */}
            <Card>
              <CardHeader>
                <CardTitle>AI Customer Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dashboardData?.customerServiceData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="inquiries" fill="#3B82F6" name="Inquiries" />
                    <Line yAxisId="right" type="monotone" dataKey="resolutionRate" stroke="#10B981" strokeWidth={3} name="Resolution Rate %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.sentimentAnalysis || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(dashboardData?.sentimentAnalysis || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customer Service Channels */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Service Channels Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(dashboardData?.serviceChannels || []).map((channel, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{channel.name}</h4>
                      <div className={`w-3 h-3 rounded-full ${
                        channel.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Interactions Today:</span>
                        <span className="font-medium">{channel.interactionsToday}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg Response Time:</span>
                        <span className="font-medium">{channel.avgResponseTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Resolution Rate:</span>
                        <span className="font-medium text-green-600">{channel.resolutionRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Satisfaction:</span>
                        <span className="font-medium text-yellow-600">{channel.satisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personalization Performance */}
            <Card>
              <CardHeader>
                <CardTitle>AI Personalization Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dashboardData?.personalizationData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="clickThroughRate" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Click-through Rate" />
                    <Area type="monotone" dataKey="conversionRate" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Conversion Rate" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendation Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Product Recommendation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPercentage(dashboardData?.recommendationMetrics?.clickRate || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Click Rate</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(dashboardData?.recommendationMetrics?.conversionRate || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revenue from Recommendations:</span>
                      <span className="text-sm text-green-600">
                        {formatCurrency(dashboardData?.recommendationMetrics?.revenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Avg Order Value Lift:</span>
                      <span className="text-sm text-blue-600">
                        +{formatPercentage(dashboardData?.recommendationMetrics?.aovLift || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Segmentation & Targeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(dashboardData?.customerSegments || []).map((segment, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{segment.name}</h4>
                      <Badge variant={segment.growth > 0 ? 'default' : 'secondary'}>
                        {segment.growth > 0 ? 'Growing' : 'Stable'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Customers:</span>
                        <span className="font-medium">{formatNumber(segment.customerCount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg LTV:</span>
                        <span className="font-medium">{formatCurrency(segment.avgLTV)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Conversion Rate:</span>
                        <span className="font-medium text-green-600">{segment.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Optimization */}
            <Card>
              <CardHeader>
                <CardTitle>AI Inventory Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.inventoryTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="stockLevel" stroke="#3B82F6" strokeWidth={2} name="Stock Level" />
                    <Line type="monotone" dataKey="demandForecast" stroke="#10B981" strokeWidth={2} name="Demand Forecast" />
                    <Line type="monotone" dataKey="reorderPoint" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Reorder Point" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Stockout Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Stockout Risk Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.stockoutRisks || []).map((item, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      item.risk === 'high' ? 'border-red-500 bg-red-50' :
                      item.risk === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.product}</p>
                          <p className="text-sm text-gray-600">Current Stock: {item.currentStock} units</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Stockout in {item.daysUntilStockout} days
                          </p>
                          <Badge variant={
                            item.risk === 'high' ? 'destructive' :
                            item.risk === 'medium' ? 'default' : 'secondary'
                          }>
                            {item.risk} risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData?.inventoryMetrics?.turnoverRate || 0}x
                  </p>
                  <p className="text-sm text-gray-600">Inventory Turnover</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(dashboardData?.inventoryMetrics?.fillRate || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Fill Rate</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {dashboardData?.inventoryMetrics?.daysOfSupply || 0}
                  </p>
                  <p className="text-sm text-gray-600">Days of Supply</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(dashboardData?.inventoryMetrics?.carryingCost || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Carrying Cost</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.salesFunnel || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Lifetime Value */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.clvTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="newCustomers" stroke="#10B981" strokeWidth={2} name="New Customers" />
                    <Line type="monotone" dataKey="returningCustomers" stroke="#3B82F6" strokeWidth={2} name="Returning Customers" />
                    <Line type="monotone" dataKey="vipCustomers" stroke="#8B5CF6" strokeWidth={2} name="VIP Customers" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Omnichannel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.channelPerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Device & Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <ComputerDesktopIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-blue-600">
                      {formatPercentage(dashboardData?.deviceAnalytics?.desktop || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Desktop</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <DevicePhoneMobileIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-green-600">
                      {formatPercentage(dashboardData?.deviceAnalytics?.mobile || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Mobile</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <GlobeAltIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-lg font-bold text-purple-600">
                      {formatPercentage(dashboardData?.deviceAnalytics?.tablet || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Tablet</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(dashboardData?.topPages || []).map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{page.path}</p>
                        <p className="text-sm text-gray-600">{formatNumber(page.views)} views</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatPercentage(page.conversionRate)}</p>
                        <p className="text-xs text-gray-500">conversion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Marketing Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData?.campaignMetrics?.activeCampaigns || 0}
                      </p>
                      <p className="text-sm text-gray-600">Active Campaigns</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPercentage(dashboardData?.campaignMetrics?.avgOpenRate || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Avg Open Rate</p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dashboardData?.campaignTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="roi" stroke="#10B981" strokeWidth={2} name="ROI %" />
                      <Line type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={2} name="Engagement %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI-Powered Marketing Automation */}
            <Card>
              <CardHeader>
                <CardTitle>AI Marketing Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(dashboardData?.campaignMetrics?.totalROI || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total ROI</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {dashboardData?.aiAutomation?.emailsAutomated || 0}
                      </p>
                      <p className="text-sm text-gray-600">Emails Automated</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">AI Optimization Results</h4>
                    {(dashboardData?.aiOptimizations || []).map((optimization, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{optimization.type}</p>
                            <p className="text-sm text-gray-600">{optimization.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              +{optimization.improvement}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(dashboardData?.recentCampaigns || []).map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        campaign.status === 'active' ? 'bg-green-500' :
                        campaign.status === 'completed' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-600">{campaign.type} - {campaign.audience}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">
                        {formatPercentage(campaign.conversionRate)} conversion
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(campaign.revenue)} revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Commerce Tab */}
        <TabsContent value="voice" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Commerce Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Commerce Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(dashboardData?.voiceCommerce?.totalOrders || 1247)}
                      </p>
                      <p className="text-sm text-gray-600">Voice Orders Today</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatPercentage(dashboardData?.voiceCommerce?.conversionRate || 0.067)}
                      </p>
                      <p className="text-sm text-gray-600">Voice Conversion Rate</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Voice Assistant Integration</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Alexa Orders:</span>
                        <span className="font-medium ml-2">847</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Google Assistant:</span>
                        <span className="font-medium ml-2">623</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Siri Orders:</span>
                        <span className="font-medium ml-2">445</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Custom Voice:</span>
                        <span className="font-medium ml-2">289</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Voice Shopping Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Voice Shopping Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Top Voice Commands</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">"Order my usual"</span>
                        <span className="font-medium">342 uses</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">"Add to cart"</span>
                        <span className="font-medium">289 uses</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">"Check order status"</span>
                        <span className="font-medium">234 uses</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">"Find deals"</span>
                        <span className="font-medium">198 uses</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">AI Optimization</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Intent Recognition:</span>
                        <span className="font-medium">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Language Support:</span>
                        <span className="font-medium">12 languages</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Personalization:</span>
                        <span className="font-medium">87.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time:</span>
                        <span className="font-medium">1.2s avg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AR/VR Shopping Tab */}
        <TabsContent value="arvr" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AR/VR Experience Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>AR/VR Shopping Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {formatNumber(dashboardData?.arvrShopping?.activeUsers || 8947)}
                      </p>
                      <p className="text-sm text-gray-600">Active AR/VR Users</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">
                        {formatPercentage(dashboardData?.arvrShopping?.conversionLift || 0.34)}
                      </p>
                      <p className="text-sm text-gray-600">Conversion Lift</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Virtual Try-On Categories</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Fashion & Apparel</span>
                        <span className="font-medium">4,567 sessions</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Eyewear</span>
                        <span className="font-medium">2,834 sessions</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Furniture</span>
                        <span className="font-medium">1,923 sessions</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cosmetics</span>
                        <span className="font-medium">1,456 sessions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AR/VR Technology Performance */}
            <Card>
              <CardHeader>
                <CardTitle>AR/VR Technology Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Load Time:</span>
                        <span className="font-medium">2.3s avg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Frame Rate:</span>
                        <span className="font-medium">60 FPS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="font-medium">96.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device Support:</span>
                        <span className="font-medium">95% compatible</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">User Experience</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Satisfaction:</span>
                        <span className="font-medium">4.6/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ease of Use:</span>
                        <span className="font-medium">4.4/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return Rate:</span>
                        <span className="font-medium">12% lower</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recommendation:</span>
                        <span className="font-medium">89%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AR/VR ROI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>AR/VR ROI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(dashboardData?.arvrROI?.additionalRevenue || 2850000)}
                  </p>
                  <p className="text-sm text-gray-600">Additional Revenue</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPercentage(dashboardData?.arvrROI?.conversionIncrease || 0.34)}
                  </p>
                  <p className="text-sm text-gray-600">Conversion Increase</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercentage(dashboardData?.arvrROI?.returnReduction || 0.23)}
                  </p>
                  <p className="text-sm text-gray-600">Return Reduction</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {dashboardData?.arvrROI?.engagementIncrease || 45}%
                  </p>
                  <p className="text-sm text-gray-600">Engagement Increase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RetailDashboard
