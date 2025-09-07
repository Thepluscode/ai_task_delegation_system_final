import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Table } from 'antd';
import {
  DashboardOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PerformancePage = () => {
  const [performanceData, setPerformanceData] = useState({});
  const [serviceMetrics, setServiceMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPerformanceData({
        avgResponseTime: 45,
        throughput: 1250,
        errorRate: 0.2,
        cpuUsage: 68,
        memoryUsage: 72,
        diskUsage: 45
      });

      setServiceMetrics([
        {
          key: '1',
          service: 'API Gateway',
          responseTime: '45ms',
          throughput: '500 req/s',
          errorRate: '0.1%',
          cpuUsage: 65
        },
        {
          key: '2',
          service: 'Auth Service',
          responseTime: '32ms',
          throughput: '200 req/s',
          errorRate: '0.2%',
          cpuUsage: 45
        },
        {
          key: '3',
          service: 'Database Service',
          responseTime: '28ms',
          throughput: '300 req/s',
          errorRate: '0.1%',
          cpuUsage: 70
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
    },
    {
      title: 'Throughput',
      dataIndex: 'throughput',
      key: 'throughput',
    },
    {
      title: 'Error Rate',
      dataIndex: 'errorRate',
      key: 'errorRate',
    },
    {
      title: 'CPU Usage',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      render: (value) => <Progress percent={value} size="small" />
    },
  ];

  return (
    <div>
      <Title level={2}>Performance Analytics</Title>
      <Text type="secondary">Monitor system performance and resource utilization</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Avg Response Time"
              value={performanceData.avgResponseTime}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Throughput"
              value={performanceData.throughput}
              suffix="req/s"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Error Rate"
              value={performanceData.errorRate}
              suffix="%"
              precision={1}
              prefix={<DashboardOutlined />}
              valueStyle={{ color: performanceData.errorRate > 1 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Database Queries"
              value={850}
              suffix="/min"
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card title="CPU Usage">
            <Progress
              type="circle"
              percent={performanceData.cpuUsage}
              format={percent => `${percent}%`}
              strokeColor={performanceData.cpuUsage > 80 ? '#ff4d4f' : '#52c41a'}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Memory Usage">
            <Progress
              type="circle"
              percent={performanceData.memoryUsage}
              format={percent => `${percent}%`}
              strokeColor={performanceData.memoryUsage > 80 ? '#ff4d4f' : '#52c41a'}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Disk Usage">
            <Progress
              type="circle"
              percent={performanceData.diskUsage}
              format={percent => `${percent}%`}
              strokeColor={performanceData.diskUsage > 80 ? '#ff4d4f' : '#52c41a'}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Service Performance Metrics" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={serviceMetrics}
          loading={loading}
          pagination={false}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default PerformancePage;
