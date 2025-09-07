import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { MonitorOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MonitoringPage = () => {
  return (
    <div>
      <Title level={2}>
        <MonitorOutlined /> System Monitoring
      </Title>
      <Text type="secondary">
        Real-time system monitoring and performance analytics
      </Text>
      
      <Card style={{ marginTop: 24, textAlign: 'center', padding: '40px' }}>
        <MonitorOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>Advanced Monitoring Coming Soon</Title>
        <Text type="secondary">
          Real-time performance metrics, alerting, and comprehensive system monitoring will be available here.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" icon={<EyeOutlined />}>
              Live Metrics
            </Button>
            <Button>
              Alert Settings
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default MonitoringPage;
