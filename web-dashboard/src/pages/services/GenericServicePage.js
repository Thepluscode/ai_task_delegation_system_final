import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const GenericServicePage = ({ serviceName, serviceIcon, serviceDescription }) => {
  const [serviceData, setServiceData] = useState({});
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setServiceData({
        status: 'healthy',
        uptime: 99.8,
        responseTime: Math.floor(Math.random() * 50) + 20,
        throughput: Math.floor(Math.random() * 500) + 100,
        errorRate: (Math.random() * 0.5).toFixed(2),
        instances: Math.floor(Math.random() * 3) + 1,
        version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`
      });

      setMetrics([
        {
          key: '1',
          metric: 'CPU Usage',
          value: Math.floor(Math.random() * 40) + 40,
          unit: '%',
          status: 'normal'
        },
        {
          key: '2',
          metric: 'Memory Usage',
          value: Math.floor(Math.random() * 30) + 50,
          unit: '%',
          status: 'normal'
        },
        {
          key: '3',
          metric: 'Network I/O',
          value: Math.floor(Math.random() * 100) + 50,
          unit: 'MB/s',
          status: 'normal'
        },
        {
          key: '4',
          metric: 'Disk I/O',
          value: Math.floor(Math.random() * 50) + 20,
          unit: 'MB/s',
          status: 'normal'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => `${value} ${record.unit}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'normal' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <Space>
          {serviceIcon}
          {serviceName}
        </Space>
      </Title>
      <Text type="secondary">{serviceDescription}</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Status"
              value={serviceData.status}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: serviceData.status === 'healthy' ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={serviceData.uptime}
              suffix="%"
              precision={1}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Response Time"
              value={serviceData.responseTime}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Throughput"
              value={serviceData.throughput}
              suffix="req/s"
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Service Information">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Version: </Text>
                <Text>{serviceData.version}</Text>
              </div>
              <div>
                <Text strong>Instances: </Text>
                <Text>{serviceData.instances}</Text>
              </div>
              <div>
                <Text strong>Error Rate: </Text>
                <Text>{serviceData.errorRate}%</Text>
              </div>
            </Space>
            <Space style={{ marginTop: 16 }}>
              <Button type="primary" icon={<ReloadOutlined />}>
                Restart Service
              </Button>
              <Button icon={<SettingOutlined />}>
                Configure
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Health Check">
            <Progress
              type="circle"
              percent={serviceData.uptime}
              format={percent => `${percent}%`}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Performance Metrics" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={metrics}
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default GenericServicePage;
