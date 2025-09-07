'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function MonitoringDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [services, setServices] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/analytics/dashboard');
      const data = await response.json();
      setDashboardData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/alerts');
      const data = await response.json();
      setAlerts(data.active_alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/metrics');
      const data = await response.json();
      setMetrics(data.metrics || {});
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchAlerts(),
        fetchMetrics(),
        fetchServices()
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchAlerts();
      fetchMetrics();
      fetchServices();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8008/ws/monitoring');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'monitoring_update') {
        // Update dashboard with real-time data
        setDashboardData(prev => ({
          ...prev,
          system_overview: data.data.system_overview,
          key_metrics: data.data.key_metrics
        }));
        setLastUpdate(new Date());
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-gray-600">Real-time system performance and health monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center" onClick={() => {
            fetchDashboardData();
            fetchAlerts();
            fetchMetrics();
            fetchServices();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dashboardData?.system_overview?.healthy_services || 0}/
              {dashboardData?.system_overview?.total_services || 0}
            </div>
            <p className="text-xs text-muted-foreground">Services Online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.key_metrics?.['system.cpu.usage']?.current_value?.toFixed(1) || 0}%
            </div>
            <Progress 
              value={dashboardData?.key_metrics?.['system.cpu.usage']?.current_value || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.key_metrics?.['system.memory.usage']?.current_value?.toFixed(1) || 0}%
            </div>
            <Progress 
              value={dashboardData?.key_metrics?.['system.memory.usage']?.current_value || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} Critical
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance Trends</CardTitle>
                <CardDescription>CPU and Memory usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData?.performance_data?.['workflow-state-service']?.slice(-12) || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu_usage" stroke="#8884d8" name="CPU %" />
                    <Line type="monotone" dataKey="memory_usage" stroke="#82ca9d" name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status Distribution</CardTitle>
                <CardDescription>Current status of all monitored services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.services && Object.entries(services.services).map(([serviceName, serviceData]) => (
                    <div key={serviceName} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(serviceData.status)}
                        <span className="font-medium">{serviceName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(serviceData.status)}>
                          {serviceData.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {serviceData.response_time_ms?.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.services && Object.entries(services.services).map(([serviceName, serviceData]) => (
              <Card key={serviceName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{serviceName}</span>
                    {getStatusIcon(serviceData.status)}
                  </CardTitle>
                  <CardDescription>Service health and performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-2xl font-bold">{serviceData.response_time_ms?.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Error Rate</p>
                      <p className="text-2xl font-bold">{serviceData.error_rate?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Throughput</p>
                      <p className="text-2xl font-bold">{serviceData.throughput?.toFixed(1)} rps</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-2xl font-bold">{serviceData.uptime_percentage?.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Last check: {new Date(serviceData.last_check).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Active Alerts</h3>
                    <p className="text-gray-500">All systems are operating normally</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.name}</span>
                    <Badge variant="outline">{alert.severity}</Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <p>{alert.message}</p>
                    <p className="text-sm mt-2">
                      Service: {alert.service} | Triggered: {new Date(alert.triggered_at).toLocaleString()}
                    </p>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(metrics).map(([metricName, metricData]) => (
              <Card key={metricName}>
                <CardHeader>
                  <CardTitle className="text-sm">{metricName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {metricData.error ? (
                    <p className="text-red-500">{metricData.error}</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {metricData.current_value?.toFixed(2)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Avg</p>
                          <p className="font-medium">{metricData.avg_value?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Max</p>
                          <p className="font-medium">{metricData.max_value?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData?.performance_data && Object.entries(dashboardData.performance_data).map(([serviceName, performanceData]) => (
              <Card key={serviceName}>
                <CardHeader>
                  <CardTitle>{serviceName} Performance</CardTitle>
                  <CardDescription>Response time trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={performanceData.slice(-10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="response_time_p95" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
