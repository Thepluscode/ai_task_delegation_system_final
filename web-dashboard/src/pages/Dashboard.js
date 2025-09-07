import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Alert,
  Spin,
  Typography,
  Space,
  Button,
  Tooltip
} from 'antd';
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
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  DashboardOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  MonitorOutlined,
  UserOutlined,
  TrophyOutlined,
  AlertOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import { apiService } from '../services/apiService';
import { websocketService } from '../services/websocketService';

const { Title, Text } = Typography;

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [recentTasks, setRecentTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Setup real-time updates
    websocketService.on('service_status', handleServiceUpdate);
    websocketService.on('performance_metrics', handlePerformanceUpdate);
    websocketService.on('monitoring_alert', handleNewAlert);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => {
      clearInterval(interval);
      websocketService.off('service_status', handleServiceUpdate);
      websocketService.off('performance_metrics', handlePerformanceUpdate);
      websocketService.off('monitoring_alert', handleNewAlert);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Load all dashboard data in parallel
      const [
        servicesData,
        databaseStats,
        monitoringData,
        learningStats
      ] = await Promise.allSettled([
        apiService.getServiceHealth(),
        apiService.getDatabaseStats(),
        apiService.getMonitoringDashboard(),
        apiService.getLearningStats()
      ]);

      // Process services data
      if (servicesData.status === 'fulfilled') {
        setServices(servicesData.value);
      }

      // Process system stats
      const stats = {
        totalServices: servicesData.value?.length || 0,
        healthyServices: servicesData.value?.filter(s => s.status === 'healthy').length || 0,
        totalQueries: databaseStats.value?.query_statistics?.total_queries || 0,
        cacheHits: databaseStats.value?.cache_info?.size || 0,
        activeMonitors: monitoringData.value?.active_monitors || 0,
        learningAccuracy: learningStats.value?.average_accuracy || 0
      };
      setSystemStats(stats);

      // Generate performance data for charts
      generatePerformanceData();
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generatePerformanceData = () => {
    // Generate sample performance data for charts
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        response_time: Math.random() * 500
      });
    }
    
    setPerformanceData(data);
  };

  const handleServiceUpdate = (data) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.name === data.service_name 
          ? { ...service, status: data.status, ...data }
          : service
      )
    );
  };

  const handlePerformanceUpdate = (data) => {
    setPerformanceData(prevData => {
      const newData = [...prevData.slice(1), {
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ...data
      }];
      return newData;
    });
  };

  const handleNewAlert = (alert) => {
    setAlerts(prevAlerts => [alert, ...prevAlerts.slice(0, 4)]);
  };

  const serviceColumns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'healthy' ? 'green' : 'red'} icon={
          status === 'healthy' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />
        }>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port'
    },
    {
      title: 'Response Time',
      dataIndex: 'response_time',
      key: 'response_time',
      render: (time) => time !== 'N/A' ? `${time}ms` : 'N/A'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading dashboard data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <DashboardOutlined /> Enterprise Dashboard
          </Title>
          <Text type="secondary">
            Welcome back, {user?.full_name}! Here's your platform overview.
          </Text>
        </Col>
        <Col>
          <Button 
            icon={<SyncOutlined spin={refreshing} />} 
            onClick={loadDashboardData}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={systemStats.totalServices}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Healthy Services"
              value={systemStats.healthyServices}
              suffix={`/ ${systemStats.totalServices}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Database Queries"
              value={systemStats.totalQueries}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Monitors"
              value={systemStats.activeMonitors}
              prefix={<MonitorOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Service Health Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Service Health Status" extra={
            <Tag color="blue">{services.filter(s => s.status === 'healthy').length} / {services.length} Healthy</Tag>
          }>
            <Table
              dataSource={services}
              columns={serviceColumns}
              pagination={false}
              size="small"
              rowKey="name"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Service Distribution">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Healthy', value: systemStats.healthyServices, color: '#52c41a' },
                    { name: 'Unhealthy', value: systemStats.totalServices - systemStats.healthyServices, color: '#ff4d4f' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Healthy', value: systemStats.healthyServices, color: '#52c41a' },
                    { name: 'Unhealthy', value: systemStats.totalServices - systemStats.healthyServices, color: '#ff4d4f' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="System Performance">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Request Volume">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="requests" stroke="#1890ff" fill="#1890ff" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Alerts and Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Alerts" extra={<AlertOutlined />}>
            {alerts.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {alerts.map((alert, index) => (
                  <Alert
                    key={index}
                    message={alert.title}
                    description={alert.message}
                    type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                    showIcon
                    closable
                  />
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                <div style={{ marginTop: 16 }}>
                  <Text>No active alerts</Text>
                </div>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<UserOutlined />}>
                Create New Task
              </Button>
              <Button block icon={<DatabaseOutlined />}>
                Database Console
              </Button>
              <Button block icon={<MonitorOutlined />}>
                System Monitoring
              </Button>
              <Button block icon={<TrophyOutlined />}>
                Performance Reports
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
