import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress, Alert, Tabs } from 'antd';
import {
  MedicineBoxOutlined,
  SecurityScanOutlined,
  UserOutlined,
  SettingOutlined,
  ReloadOutlined,
  FileTextOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const HealthcareServicePage = () => {
  const [serviceData, setServiceData] = useState({});
  const [patients, setPatients] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for Healthcare service data
    setTimeout(() => {
      setServiceData({
        status: 'healthy',
        uptime: 99.95,
        responseTime: 22,
        throughput: 450,
        errorRate: 0.02,
        instances: 6,
        version: 'v4.1.2',
        totalPatients: 15847,
        activeRecords: 8934,
        hipaaCompliant: true
      });

      setPatients([
        {
          key: '1',
          patientId: 'PAT-2024-001',
          name: 'John D.',
          age: 45,
          status: 'active',
          lastVisit: '2024-01-15',
          condition: 'Routine Checkup',
          priority: 'normal'
        },
        {
          key: '2',
          patientId: 'PAT-2024-002',
          name: 'Sarah M.',
          age: 32,
          status: 'active',
          lastVisit: '2024-01-14',
          condition: 'Diabetes Management',
          priority: 'high'
        },
        {
          key: '3',
          patientId: 'PAT-2024-003',
          name: 'Robert K.',
          age: 67,
          status: 'discharged',
          lastVisit: '2024-01-10',
          condition: 'Post-Surgery Follow-up',
          priority: 'normal'
        },
        {
          key: '4',
          patientId: 'PAT-2024-004',
          name: 'Emily R.',
          age: 28,
          status: 'active',
          lastVisit: '2024-01-16',
          condition: 'Pregnancy Care',
          priority: 'high'
        }
      ]);

      setCompliance([
        {
          key: '1',
          requirement: 'HIPAA Privacy Rule',
          status: 'compliant',
          lastAudit: '2024-01-01',
          nextAudit: '2024-04-01',
          score: 98
        },
        {
          key: '2',
          requirement: 'HIPAA Security Rule',
          status: 'compliant',
          lastAudit: '2024-01-01',
          nextAudit: '2024-04-01',
          score: 96
        },
        {
          key: '3',
          requirement: 'Data Encryption',
          status: 'compliant',
          lastAudit: '2024-01-15',
          nextAudit: '2024-04-15',
          score: 100
        },
        {
          key: '4',
          requirement: 'Access Controls',
          status: 'warning',
          lastAudit: '2024-01-10',
          nextAudit: '2024-04-10',
          score: 89
        }
      ]);

      setMetrics([
        {
          key: '1',
          metric: 'Patient Record Processing',
          value: '450',
          unit: 'records/hour',
          status: 'normal',
          trend: 'stable'
        },
        {
          key: '2',
          metric: 'Data Encryption Rate',
          value: '100',
          unit: '%',
          status: 'normal',
          trend: 'stable'
        },
        {
          key: '3',
          metric: 'HIPAA Compliance Score',
          value: '96.2',
          unit: '%',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '4',
          metric: 'Average Response Time',
          value: '22',
          unit: 'ms',
          status: 'normal',
          trend: 'down'
        }
      ]);

      setAlerts([
        {
          key: '1',
          type: 'warning',
          message: 'Access Controls compliance score below 90% (89%)',
          timestamp: '30 minutes ago'
        },
        {
          key: '2',
          type: 'info',
          message: 'Scheduled HIPAA audit reminder for next week',
          timestamp: '2 hours ago'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const patientColumns = [
    {
      title: 'Patient ID',
      dataIndex: 'patientId',
      key: 'patientId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          active: 'green',
          discharged: 'blue',
          admitted: 'orange'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Last Visit',
      dataIndex: 'lastVisit',
      key: 'lastVisit'
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition'
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colorMap = {
          high: 'red',
          normal: 'green',
          low: 'blue'
        };
        return <Tag color={colorMap[priority]}>{priority.toUpperCase()}</Tag>;
      }
    }
  ];

  const complianceColumns = [
    {
      title: 'Requirement',
      dataIndex: 'requirement',
      key: 'requirement'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          compliant: 'green',
          warning: 'orange',
          non_compliant: 'red'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => {
        const color = score >= 95 ? 'green' : score >= 90 ? 'orange' : 'red';
        return <Text style={{ color }}>{score}%</Text>;
      }
    },
    {
      title: 'Last Audit',
      dataIndex: 'lastAudit',
      key: 'lastAudit'
    },
    {
      title: 'Next Audit',
      dataIndex: 'nextAudit',
      key: 'nextAudit'
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
      render: (value, record) => (
        <Text strong>{value} {record.unit}</Text>
      )
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
          <MedicineBoxOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Healthcare Service
        </Title>
        <Text type="secondary">HIPAA-compliant healthcare data processing and management</Text>
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
              title="HIPAA Status"
              value={serviceData.hipaaCompliant ? 'Compliant' : 'Non-Compliant'}
              prefix={<SecurityScanOutlined style={{ color: serviceData.hipaaCompliant ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: serviceData.hipaaCompliant ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Patients"
              value={serviceData.totalPatients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Records"
              value={serviceData.activeRecords}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={serviceData.uptime}
              suffix="%"
              prefix={<HeartOutlined />}
              valueStyle={{ color: serviceData.uptime > 99 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="patients" style={{ marginTop: 24 }}>
        <TabPane tab="Patient Records" key="patients">
          <Card title="Patient Management">
            <Table
              columns={patientColumns}
              dataSource={patients}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="HIPAA Compliance" key="compliance">
          <Card title="Compliance Status">
            <Table
              columns={complianceColumns}
              dataSource={compliance}
              loading={loading}
              pagination={false}
            />
          </Card>
        </TabPane>

        <TabPane tab="Performance Metrics" key="metrics">
          <Card title="Healthcare Metrics">
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
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HealthcareServicePage;
