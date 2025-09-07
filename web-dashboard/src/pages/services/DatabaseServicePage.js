import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Progress, Button, Spin, Alert } from 'antd';
import {
  DatabaseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  HddOutlined,
  ThunderboltOutlined,
  TeamOutlined
} from '@ant-design/icons';

import { apiService } from '../../services/apiService';
import { websocketService } from '../../services/websocketService';

const { Title, Text } = Typography;

const DatabaseServicePage = () => {
  const [dbStats, setDbStats] = useState({});
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDatabaseData();
    
    // Setup real-time updates
    websocketService.on('service_status', handleServiceUpdate);
    websocketService.on('database_metrics', handleDatabaseMetricsUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDatabaseData, 30000);
    
    return () => {
      clearInterval(interval);
      websocketService.off('service_status', handleServiceUpdate);
      websocketService.off('database_metrics', handleDatabaseMetricsUpdate);
    };
  }, []);

  const loadDatabaseData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Get service health data
      const services = await apiService.getServiceHealth();
      const dbService = services.find(s => s.name === 'Database Service');
      setServiceData(dbService);
      
      // Get database-specific metrics
      const dbData = await apiService.getDatabaseStats();
      setDbStats(dbData);
      
    } catch (error) {
      console.error('Failed to load database data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleServiceUpdate = (data) => {
    if (data.service_name === 'Database Service') {
      setServiceData(prev => ({ ...prev, ...data }));
    }
  };

  const handleDatabaseMetricsUpdate = (data) => {
    setDbStats(data);
  };

  const connectionColumns = [
    {
      title: 'Connection ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Database',
      dataIndex: 'database',
      key: 'database',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading database service data...</Text>
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
            <DatabaseOutlined /> Database Service
          </Title>
          <Text type="secondary">Monitor database performance and connections</Text>
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
            onClick={loadDatabaseData}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Failed to load database data"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      {/* Database Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Connections"
              value={dbStats.total_connections || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Connections"
              value={dbStats.active_connections || 0}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Queries/sec"
              value={dbStats.queries_per_second || 0}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Storage Used"
              value={dbStats.storage_used || 0}
              suffix="GB"
              prefix={<HddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Connection Pool Usage">
            <Progress
              type="circle"
              percent={dbStats.connection_pool_usage || 0}
              format={percent => `${percent}%`}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Cache Hit Ratio">
            <Progress
              type="circle"
              percent={dbStats.cache_hit_ratio || 0}
              format={percent => `${percent}%`}
              strokeColor="#1890ff"
            />
          </Card>
        </Col>
      </Row>

      {/* Active Connections Table */}
      <Card title="Active Database Connections" style={{ marginTop: 24 }}>
        <Table
          columns={connectionColumns}
          dataSource={dbStats.active_connections_list || []}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default DatabaseServicePage;
