import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress, Alert, Tabs } from 'antd';
import {
  RobotOutlined,
  BulbOutlined,
  BarChartOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AILearningServicePage = () => {
  const [serviceData, setServiceData] = useState({});
  const [models, setModels] = useState([]);
  const [trainingJobs, setTrainingJobs] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setServiceData({
        status: 'healthy',
        uptime: 99.6,
        responseTime: 45,
        throughput: 320,
        errorRate: 0.15,
        instances: 5,
        version: 'v3.4.2',
        activeModels: 12,
        trainingJobs: 8,
        totalPredictions: 2847592
      });

      setModels([
        {
          key: '1',
          modelId: 'MODEL-001',
          name: 'Fraud Detection Neural Network',
          type: 'Classification',
          status: 'deployed',
          accuracy: 98.7,
          lastTrained: '2024-01-10',
          version: 'v2.1'
        },
        {
          key: '2',
          modelId: 'MODEL-002',
          name: 'Customer Behavior Predictor',
          type: 'Regression',
          status: 'training',
          accuracy: 94.2,
          lastTrained: '2024-01-15',
          version: 'v1.8'
        },
        {
          key: '3',
          modelId: 'MODEL-003',
          name: 'Market Trend Analyzer',
          type: 'Time Series',
          status: 'deployed',
          accuracy: 91.5,
          lastTrained: '2024-01-08',
          version: 'v3.0'
        },
        {
          key: '4',
          modelId: 'MODEL-004',
          name: 'Risk Assessment Engine',
          type: 'Ensemble',
          status: 'testing',
          accuracy: 96.8,
          lastTrained: '2024-01-16',
          version: 'v1.2'
        }
      ]);

      setTrainingJobs([
        {
          key: '1',
          jobId: 'JOB-2024-001',
          modelName: 'Customer Behavior Predictor',
          status: 'running',
          progress: 75,
          startTime: '2024-01-16 09:00',
          estimatedCompletion: '2024-01-16 15:30'
        },
        {
          key: '2',
          jobId: 'JOB-2024-002',
          modelName: 'Sentiment Analysis Model',
          status: 'queued',
          progress: 0,
          startTime: 'Pending',
          estimatedCompletion: 'TBD'
        },
        {
          key: '3',
          jobId: 'JOB-2024-003',
          modelName: 'Image Recognition CNN',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-15 14:00',
          estimatedCompletion: '2024-01-15 20:45'
        }
      ]);

      setMetrics([
        {
          key: '1',
          metric: 'Model Inference Rate',
          value: '320',
          unit: 'predictions/sec',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '2',
          metric: 'Average Model Accuracy',
          value: '95.3',
          unit: '%',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '3',
          metric: 'Training Queue Length',
          value: '3',
          unit: 'jobs',
          status: 'normal',
          trend: 'stable'
        },
        {
          key: '4',
          metric: 'GPU Utilization',
          value: '78',
          unit: '%',
          status: 'normal',
          trend: 'stable'
        }
      ]);

      setAlerts([
        {
          key: '1',
          type: 'info',
          message: 'Model training job JOB-2024-001 is 75% complete',
          timestamp: '10 minutes ago'
        },
        {
          key: '2',
          type: 'warning',
          message: 'Model MODEL-003 accuracy dropped below 92%',
          timestamp: '2 hours ago'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const modelColumns = [
    {
      title: 'Model ID',
      dataIndex: 'modelId',
      key: 'modelId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          deployed: 'green',
          training: 'blue',
          testing: 'orange',
          failed: 'red'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Accuracy',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (accuracy) => {
        const color = accuracy >= 95 ? 'green' : accuracy >= 90 ? 'orange' : 'red';
        return <Text style={{ color }}>{accuracy}%</Text>;
      }
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version'
    }
  ];

  const trainingColumns = [
    {
      title: 'Job ID',
      dataIndex: 'jobId',
      key: 'jobId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Model Name',
      dataIndex: 'modelName',
      key: 'modelName'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          running: 'blue',
          queued: 'orange',
          completed: 'green',
          failed: 'red'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" />
      )
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime'
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
          <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          AI Learning Service
        </Title>
        <Text type="secondary">Machine learning model training and inference</Text>
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
              title="Active Models"
              value={serviceData.activeModels}
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Training Jobs"
              value={serviceData.trainingJobs}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Predictions"
              value={serviceData.totalPredictions}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="models" style={{ marginTop: 24 }}>
        <TabPane tab="Model Management" key="models">
          <Card title="Deployed Models" extra={
            <Button type="primary" icon={<ReloadOutlined />}>
              Refresh
            </Button>
          }>
            <Table
              columns={modelColumns}
              dataSource={models}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Training Jobs" key="training">
          <Card title="Training Pipeline">
            <Table
              columns={trainingColumns}
              dataSource={trainingJobs}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Performance Metrics" key="metrics">
          <Card title="AI Learning Metrics">
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
                  <div><Text strong>Inference Rate: </Text><Text>{serviceData.throughput} pred/sec</Text></div>
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
                  <Text>Throughput: {serviceData.throughput} pred/sec</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AILearningServicePage;
