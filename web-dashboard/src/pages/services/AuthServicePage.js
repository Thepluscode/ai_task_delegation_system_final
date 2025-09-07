import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Progress, Button, Spin, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyOutlined,
  LoginOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import { apiService } from '../../services/apiService';
import { websocketService } from '../../services/websocketService';

const { Title, Text } = Typography;

const AuthServicePage = () => {
  const [authStats, setAuthStats] = useState({});
  const [recentLogins, setRecentLogins] = useState([]);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAuthData();

    // Setup real-time updates for auth service
    websocketService.on('service_status', handleServiceUpdate);
    websocketService.on('auth_metrics', handleAuthMetricsUpdate);

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAuthData, 30000);

    return () => {
      clearInterval(interval);
      websocketService.off('service_status', handleServiceUpdate);
      websocketService.off('auth_metrics', handleAuthMetricsUpdate);
    };
  }, []);

  const loadAuthData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Get service health data
      const services = await apiService.getServiceHealth();
      const authService = services.find(s => s.name === 'Auth Service');
      setServiceData(authService);

      // Get auth-specific metrics
      const authData = await apiService.getAuthStats();
      setAuthStats(authData);
      setRecentLogins(authData.recentLogins || []);

    } catch (error) {
      console.error('Failed to load auth data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleServiceUpdate = (data) => {
    if (data.service_name === 'Auth Service') {
      setServiceData(prev => ({ ...prev, ...data }));
    }
  };

  const handleAuthMetricsUpdate = (data) => {
    setAuthStats(data);
    setRecentLogins(data.recentLogins || []);
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text) => (
        <Space>
          <UserOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading authentication service data...</Text>
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
            <UserOutlined /> Authentication Service
          </Title>
          <Text type="secondary">Monitor user authentication and security metrics</Text>
          {serviceData && (
            <div style={{ marginTop: 8 }}>
              <Tag
                color={serviceData.status === 'healthy' ? 'green' : 'red'}
                icon={serviceData.status === 'healthy' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              >
                {serviceData.status?.toUpperCase()} - Port {serviceData.port}
              </Tag>
              {serviceData.response_time && (
                <Tag color="blue">Response: {serviceData.response_time}</Tag>
              )}
            </div>
          )}
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={loadAuthData}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Failed to load authentication data"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={authStats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={authStats.activeUsers}
              prefix={<LoginOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Today's Logins"
              value={authStats.todayLogins}
              prefix={<KeyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Failed Attempts"
              value={authStats.failedAttempts}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Token Validation Rate">
            <Progress
              type="circle"
              percent={authStats.tokenValidation}
              format={percent => `${percent}%`}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Average Session Duration">
            <Statistic
              value={authStats.sessionDuration}
              suffix="minutes"
              prefix={<SafetyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Recent Login Attempts" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={recentLogins}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default AuthServicePage;
