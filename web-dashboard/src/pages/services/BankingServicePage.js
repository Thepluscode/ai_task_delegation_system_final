import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress, Alert, Tabs } from 'antd';
import {
  BankOutlined,
  DollarOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  SecurityScanOutlined,
  TransactionOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const BankingServicePage = () => {
  const [serviceData, setServiceData] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [fraudDetection, setFraudDetection] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setServiceData({
        status: 'healthy',
        uptime: 99.98,
        responseTime: 18,
        throughput: 2500,
        errorRate: 0.01,
        instances: 8,
        version: 'v5.2.1',
        totalTransactions: 847592,
        dailyVolume: 12847592.45,
        fraudPrevented: 234
      });

      setTransactions([
        {
          key: '1',
          transactionId: 'TXN-2024-001',
          amount: 1250.00,
          type: 'transfer',
          status: 'completed',
          timestamp: '2 minutes ago',
          riskScore: 'low'
        },
        {
          key: '2',
          transactionId: 'TXN-2024-002',
          amount: 89.99,
          type: 'payment',
          status: 'completed',
          timestamp: '5 minutes ago',
          riskScore: 'low'
        },
        {
          key: '3',
          transactionId: 'TXN-2024-003',
          amount: 5000.00,
          type: 'withdrawal',
          status: 'pending',
          timestamp: '10 minutes ago',
          riskScore: 'medium'
        },
        {
          key: '4',
          transactionId: 'TXN-2024-004',
          amount: 15000.00,
          type: 'transfer',
          status: 'flagged',
          timestamp: '15 minutes ago',
          riskScore: 'high'
        }
      ]);

      setFraudDetection([
        {
          key: '1',
          alertId: 'FRD-2024-001',
          type: 'Unusual Amount',
          severity: 'high',
          description: 'Transaction amount 10x higher than average',
          status: 'investigating',
          timestamp: '5 minutes ago'
        },
        {
          key: '2',
          alertId: 'FRD-2024-002',
          type: 'Location Anomaly',
          severity: 'medium',
          description: 'Transaction from unusual geographic location',
          status: 'resolved',
          timestamp: '1 hour ago'
        }
      ]);

      setMetrics([
        {
          key: '1',
          metric: 'Transaction Processing Rate',
          value: '2,500',
          unit: 'txn/sec',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '2',
          metric: 'Fraud Detection Accuracy',
          value: '99.7',
          unit: '%',
          status: 'normal',
          trend: 'stable'
        },
        {
          key: '3',
          metric: 'Average Processing Time',
          value: '18',
          unit: 'ms',
          status: 'normal',
          trend: 'down'
        },
        {
          key: '4',
          metric: 'Compliance Score',
          value: '98.5',
          unit: '%',
          status: 'normal',
          trend: 'up'
        }
      ]);

      setAlerts([
        {
          key: '1',
          type: 'warning',
          message: 'High-value transaction flagged for manual review',
          timestamp: '15 minutes ago'
        },
        {
          key: '2',
          type: 'info',
          message: 'Daily transaction volume approaching limit',
          timestamp: '1 hour ago'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const transactionColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>${amount.toLocaleString()}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type.toUpperCase()}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          completed: 'green',
          pending: 'orange',
          flagged: 'red',
          failed: 'red'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      render: (risk) => {
        const colorMap = { low: 'green', medium: 'orange', high: 'red' };
        return <Tag color={colorMap[risk]}>{risk.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => <Text type="secondary">{text}</Text>
    }
  ];

  const fraudColumns = [
    {
      title: 'Alert ID',
      dataIndex: 'alertId',
      key: 'alertId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type'
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = { investigating: 'orange', resolved: 'green', escalated: 'red' };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  const metricsColumns = [
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
          <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Banking Service
        </Title>
        <Text type="secondary">Secure banking operations and transaction processing</Text>
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
              title="Daily Volume"
              value={serviceData.dailyVolume}
              prefix={<DollarOutlined />}
              precision={2}
              formatter={(value) => `$${value?.toLocaleString()}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={serviceData.totalTransactions}
              prefix={<TransactionOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Fraud Prevented"
              value={serviceData.fraudPrevented}
              prefix={<SecurityScanOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="transactions" style={{ marginTop: 24 }}>
        <TabPane tab="Transaction Processing" key="transactions">
          <Card title="Recent Transactions" extra={
            <Button type="primary" icon={<ReloadOutlined />}>
              Refresh
            </Button>
          }>
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Fraud Detection" key="fraud">
          <Card title="Fraud Alerts">
            <Table
              columns={fraudColumns}
              dataSource={fraudDetection}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Performance Metrics" key="metrics">
          <Card title="Banking Performance Metrics">
            <Table
              columns={metricsColumns}
              dataSource={metrics}
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
                  <div><Text strong>Processing Rate: </Text><Text>{serviceData.throughput} txn/sec</Text></div>
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
                  <Text>Throughput: {serviceData.throughput} txn/sec</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default BankingServicePage;
