import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography } from 'antd';
import {
  CloudServerOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ServicesOverviewPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setServices([
        {
          key: '1',
          name: 'API Gateway',
          status: 'healthy',
          port: 8000,
          uptime: '99.9%',
          responseTime: '45ms',
          version: 'v2.1.0',
          instances: 3
        },
        {
          key: '2',
          name: 'Auth Service',
          status: 'healthy',
          port: 8001,
          uptime: '99.8%',
          responseTime: '32ms',
          version: 'v1.5.2',
          instances: 2
        },
        {
          key: '3',
          name: 'Database Service',
          status: 'healthy',
          port: 8002,
          uptime: '99.9%',
          responseTime: '28ms',
          version: 'v3.0.1',
          instances: 2
        },
        {
          key: '4',
          name: 'Monitoring Service',
          status: 'healthy',
          port: 8003,
          uptime: '99.7%',
          responseTime: '51ms',
          version: 'v1.2.0',
          instances: 1
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <CloudServerOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'healthy' ? 'green' : 'red'} icon={<CheckCircleOutlined />}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
    },
    {
      title: 'Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Instances',
      dataIndex: 'instances',
      key: 'instances',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<ReloadOutlined />}>
            Restart
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            Configure
          </Button>
        </Space>
      ),
    },
  ];

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;

  return (
    <div>
      <Title level={2}>Services Overview</Title>
      <Text type="secondary">Monitor and manage all microservices in your platform</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={totalServices}
              prefix={<CloudServerOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Healthy Services"
              value={healthyServices}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Unhealthy Services"
              value={totalServices - healthyServices}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Uptime"
              value={99.8}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Service Details" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={services}
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ServicesOverviewPage;
