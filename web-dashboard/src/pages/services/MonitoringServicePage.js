import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress, Alert, Tabs } from 'antd';
import {
  MonitorOutlined,
  AlertOutlined,
  BarChartOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MonitoringServicePage = () => {
  const [serviceData, setServiceData] = useState({});
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setServiceData({
        status: 'healthy',
        uptime: 99.8,
        responseTime: 12,
        throughput: 5000,
        errorRate: 0.05,
        instances: 4,
        version: 'v2.8.1',
        monitoredServices: 15,
        activeAlerts: 3,
        metricsCollected: 1847592
      });

      setSystemAlerts([
        {
          key: '1',
          alertId: 'ALT-2024-001',
          service: 'Banking Service',
          severity: 'high',
          message: 'High CPU usage detected (85%)',
          status: 'active',
          timestamp: '5 minutes ago'
        },
        {
          key: '2',
          alertId: 'ALT-2024-002',
          service: 'IoT Service',
          severity: 'medium',
          message: 'Memory usage above threshold (78%)',
          status: 'acknowledged',
          timestamp: '15 minutes ago'
        },
        {
          key: '3',
          alertId: 'ALT-2024-003',
          service: 'Healthcare Service',
          severity: 'low',
          message: 'Disk space usage at 70%',
          status: 'resolved',
          timestamp: '1 hour ago'
        }
      ]);

      setSystemMetrics([
        {
          key: '1',
          service: 'Banking Service',
          cpu: 85,
          memory: 67,
          disk: 45,
          network: 234,
          status: 'warning'
        },
        {
          key: '2',
          service: 'Healthcare Service',
          cpu: 45,
          memory: 52,
          disk: 70,
          network: 156,
          status: 'normal'
        },
        {
          key: '3',
          service: 'IoT Service',
          cpu: 62,
          memory: 78,
          disk: 38,
          network: 445,
          status: 'warning'
        },
        {
          key: '4',
          service: 'Retail Service',
          cpu: 38,
          memory: 41,
          disk: 25,
          network: 189,
          status: 'normal'
        }
      ]);

      setPerformanceData([
        {
          key: '1',
          metric: 'Alert Response Time',
          value: '2.3',
          unit: 'seconds',
          status: 'normal',
          trend: 'down'
        },
        {
          key: '2',
          metric: 'Metrics Collection Rate',
          value: '5,000',
          unit: 'metrics/sec',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '3',
          metric: 'False Positive Rate',
          value: '1.2',
          unit: '%',
          status: 'normal',
          trend: 'down'
        },
        {
          key: '4',
          metric: 'System Coverage',
          value: '98.7',
          unit: '%',
          status: 'normal',
          trend: 'stable'
        }
      ]);

      setAlerts([
        {
          key: '1',
          type: 'warning',
          message: 'Banking Service CPU usage is high (85%)',
          timestamp: '5 minutes ago'
        },
        {
          key: '2',
          type: 'info',
          message: 'IoT Service memory alert acknowledged',
          timestamp: '15 minutes ago'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const alertColumns = [
    {
      title: 'Alert ID',
      dataIndex: 'alertId',
      key: 'alertId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service'
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => {
        const colorMap = { low: 'green', medium: 'orange', high: 'red' };
        return <Tag color={colorMap[severity]}>{severity.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          active: 'red',
          acknowledged: 'orange',
          resolved: 'green'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => <Text type="secondary">{text}</Text>
    }
  ];

  const metricsColumns = [
    {
      title: 'Service',
      dataIndex: 'service',
      key: 'service'
    },
    {
      title: 'CPU %',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu) => {
        const color = cpu > 80 ? 'red' : cpu > 60 ? 'orange' : 'green';
        return <Text style={{ color }}>{cpu}%</Text>;
      }
    },
    {
      title: 'Memory %',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory) => {
        const color = memory > 80 ? 'red' : memory > 60 ? 'orange' : 'green';
        return <Text style={{ color }}>{memory}%</Text>;
      }
    },
    {
      title: 'Disk %',
      dataIndex: 'disk',
      key: 'disk',
      render: (disk) => {
        const color = disk > 80 ? 'red' : disk > 60 ? 'orange' : 'green';
        return <Text style={{ color }}>{disk}%</Text>;
      }
    },
    {
      title: 'Network MB/s',
      dataIndex: 'network',
      key: 'network'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    }
  ];

  const performanceColumns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric'
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => <Text strong>{value} {record.unit}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Trend',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => {
        const color = trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray';
        const symbol = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
        return <Text style={{ color }}>{symbol} {trend}</Text>;
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <MonitorOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Monitoring Service
        </Title>
        <Text type="secondary">System monitoring, alerting, and performance analytics</Text>
      </div>

      {alerts.length > 0 && (
        <Alert
          message={`${alerts.length} active alert(s)`}
          description={alerts.map(alert => alert.message).join(', ')}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Status"
              value={serviceData.status}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monitored Services"
              value={serviceData.monitoredServices}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={serviceData.activeAlerts}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Metrics Collected"
              value={serviceData.metricsCollected}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="alerts" style={{ marginTop: 24 }}>
        <TabPane tab="System Alerts" key="alerts">
          <Card title="Active Alerts" extra={
            <Button type="primary" icon={<ReloadOutlined />}>
              Refresh
            </Button>
          }>
            <Table
              columns={alertColumns}
              dataSource={systemAlerts}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="System Metrics" key="metrics">
          <Card title="Real-time System Metrics">
            <Table
              columns={metricsColumns}
              dataSource={systemMetrics}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Performance Analytics" key="performance">
          <Card title="Monitoring Performance">
            <Table
              columns={performanceColumns}
              dataSource={performanceData}
              loading={loading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Service Configuration" key="config">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Service Information">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div><Text strong>Version: </Text><Text>{serviceData.version}</Text></div>
                  <div><Text strong>Instances: </Text><Text>{serviceData.instances}</Text></div>
                  <div><Text strong>Error Rate: </Text><Text>{serviceData.errorRate}%</Text></div>
                  <div><Text strong>Collection Rate: </Text><Text>{serviceData.throughput} metrics/sec</Text></div>
                </Space>
                <Space style={{ marginTop: 16 }}>
                  <Button type="primary" icon={<ReloadOutlined />}>Restart Service</Button>
                  <Button icon={<SettingOutlined />}>Configure</Button>
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
                <div style={{ marginTop: 16 }}>
                  <Text>Response Time: {serviceData.responseTime}ms</Text>
                  <br />
                  <Text>Throughput: {serviceData.throughput} metrics/sec</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MonitoringServicePage;
