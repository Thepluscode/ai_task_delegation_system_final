'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Brain,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard() {
  const [insights, setInsights] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [selectedService, setSelectedService] = useState('workflow-state-service');
  const [selectedMetric, setSelectedMetric] = useState('cpu_usage');
  const [timeRange, setTimeRange] = useState('24');
  const [isLoading, setIsLoading] = useState(true);

  const services = [
    'workflow-state-service',
    'ai-task-delegation',
    'robot-abstraction-protocol',
    'edge-computing',
    'security-compliance'
  ];

  const metrics = [
    'cpu_usage',
    'memory_usage',
    'response_time_p95',
    'error_rate',
    'throughput'
  ];

  // Fetch system insights
  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/analytics/insights');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  // Fetch trend analysis
  const fetchTrendAnalysis = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/analytics/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedService,
          metric: selectedMetric,
          time_range_hours: parseInt(timeRange)
        })
      });
      const data = await response.json();
      setTrendAnalysis(data);
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchInsights(), fetchTrendAnalysis()]);
      setIsLoading(false);
    };
    fetchData();
  }, [selectedService, selectedMetric, timeRange]);

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'increasing': return 'text-red-600';
      case 'decreasing': return 'text-green-600';
      default: return 'text-blue-600';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'high_cpu_usage': return <Zap className="h-5 w-5 text-orange-500" />;
      case 'high_response_time': return <Clock className="h-5 w-5 text-red-500" />;
      case 'cpu_capacity_warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'memory_capacity_warning': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Brain className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Analyzing system performance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-gray-600">AI-powered performance analysis and predictive insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => {
            fetchInsights();
            fetchTrendAnalysis();
          }}>
            <Brain className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* System Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>System Health Score</span>
          </CardTitle>
          <CardDescription>Overall system performance and reliability assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {insights?.system_health_score?.toFixed(1) || 0}%
              </div>
              <p className="text-sm text-gray-500">Health Score</p>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights?.performance_insights?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Performance Issues</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {insights?.capacity_insights?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Capacity Warnings</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {insights?.optimization_recommendations?.length || 0}
                  </div>
                  <p className="text-sm text-gray-500">Optimizations</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          {/* Trend Analysis Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis Configuration</CardTitle>
              <CardDescription>Analyze performance trends for specific services and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service} value={service}>{service}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="metric">Metric</Label>
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      {metrics.map(metric => (
                        <SelectItem key={metric} value={metric}>{metric}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeRange">Time Range (hours)</Label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Hour</SelectItem>
                      <SelectItem value="6">6 Hours</SelectItem>
                      <SelectItem value="24">24 Hours</SelectItem>
                      <SelectItem value="168">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis Results */}
          {trendAnalysis && !trendAnalysis.error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getTrendIcon(trendAnalysis.trend?.direction)}
                    <span>Trend Analysis</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedService} - {selectedMetric} over {timeRange} hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Trend Direction</p>
                        <p className={`text-lg font-bold ${getTrendColor(trendAnalysis.trend?.direction)}`}>
                          {trendAnalysis.trend?.direction || 'stable'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-lg font-bold">
                          {(trendAnalysis.trend?.confidence * 100)?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current Value</p>
                        <p className="text-lg font-bold">
                          {trendAnalysis.statistics?.current_value?.toFixed(2) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Average</p>
                        <p className="text-lg font-bold">
                          {trendAnalysis.statistics?.average?.toFixed(2) || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Detection</CardTitle>
                  <CardDescription>Statistical anomalies in the selected metric</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Anomalies Detected</p>
                        <p className="text-2xl font-bold text-red-600">
                          {trendAnalysis.anomalies?.count || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Anomaly Rate</p>
                        <p className="text-2xl font-bold">
                          {(trendAnalysis.anomalies?.anomaly_rate * 100)?.toFixed(1) || 0}%
                        </p>
                      </div>
                    </div>
                    {trendAnalysis.anomalies?.recent_anomalies?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recent Anomalies</p>
                        <div className="space-y-2">
                          {trendAnalysis.anomalies.recent_anomalies.slice(0, 3).map((anomaly, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                              <span className="text-sm">Value: {anomaly.value?.toFixed(2)}</span>
                              <Badge variant="destructive">Z-Score: {anomaly.z_score?.toFixed(2)}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance Insights</span>
                </CardTitle>
                <CardDescription>AI-detected performance issues and bottlenecks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights?.performance_insights?.length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-gray-500">No performance issues detected</p>
                    </div>
                  ) : (
                    insights?.performance_insights?.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{insight.service}</h4>
                            <Badge className={getSeverityColor(insight.severity)}>
                              {insight.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{insight.recommendation}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Current: {insight.current_value?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Capacity Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Capacity Insights</span>
                </CardTitle>
                <CardDescription>Resource capacity warnings and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights?.capacity_insights?.length === 0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-gray-500">Capacity levels are healthy</p>
                    </div>
                  ) : (
                    insights?.capacity_insights?.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.type.replace('_', ' ').toUpperCase()}</h4>
                          <p className="text-sm text-gray-600 mt-1">{insight.recommendation}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Current Usage: {insight.current_usage?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          {trendAnalysis?.predictions && !trendAnalysis.predictions.error && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Predictive Analysis</span>
                </CardTitle>
                <CardDescription>
                  Future value predictions for {selectedService} - {selectedMetric}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Prediction Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="font-medium">{trendAnalysis.predictions.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Prediction:</span>
                        <span className="font-medium">
                          {trendAnalysis.predictions.base_prediction?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium">
                          {(trendAnalysis.predictions.overall_confidence * 100)?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Future Predictions</h4>
                    <div className="space-y-2">
                      {trendAnalysis.predictions.predictions?.slice(0, 5).map((pred, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">+{pred.time_offset_hours}h</span>
                          <span className="font-medium">{pred.predicted_value?.toFixed(2)}</span>
                          <Badge variant="outline">
                            {(pred.confidence * 100)?.toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights?.optimization_recommendations?.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{rec.category.toUpperCase()}</span>
                    <Badge variant="outline">{rec.impact} impact</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{rec.recommendation}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Effort: {rec.effort}</span>
                    <Badge className={
                      rec.impact === 'high' ? 'bg-green-100 text-green-800' :
                      rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {rec.impact}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
