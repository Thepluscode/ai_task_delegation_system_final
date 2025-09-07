import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Table, Progress } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const UsagePage = () => {
  const [usageData, setUsageData] = useState({});
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsageData({
        totalUsers: 1247,
        activeUsers: 892,
        apiCalls: 125000,
        dataTransfer: 2.4,
        storageUsed: 68,
        bandwidthUsed: 45
      });

      setTopUsers([
        {
          key: '1',
          user: 'john.doe@company.com',
          apiCalls: 2450,
          dataTransfer: '145 MB',
          lastActive: '2 minutes ago'
        },
        {
          key: '2',
          user: 'jane.smith@company.com',
          apiCalls: 1890,
          dataTransfer: '98 MB',
          lastActive: '5 minutes ago'
        },
        {
          key: '3',
          user: 'admin@company.com',
          apiCalls: 3200,
          dataTransfer: '210 MB',
          lastActive: '1 minute ago'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'API Calls',
      dataIndex: 'apiCalls',
      key: 'apiCalls',
      sorter: (a, b) => a.apiCalls - b.apiCalls,
    },
    {
      title: 'Data Transfer',
      dataIndex: 'dataTransfer',
      key: 'dataTransfer',
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
  ];

  return (
    <div>
      <Title level={2}>Usage Statistics</Title>
      <Text type="secondary">Monitor platform usage and user activity</Text>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={usageData.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={usageData.activeUsers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="API Calls Today"
              value={usageData.apiCalls}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Data Transfer"
              value={usageData.dataTransfer}
              suffix="GB"
              precision={1}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card title="Storage Usage">
            <Progress
              type="circle"
              percent={usageData.storageUsed}
              format={percent => `${percent}%`}
              strokeColor={usageData.storageUsed > 80 ? '#ff4d4f' : '#52c41a'}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">68GB of 100GB used</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Bandwidth Usage">
            <Progress
              type="circle"
              percent={usageData.bandwidthUsed}
              format={percent => `${percent}%`}
              strokeColor={usageData.bandwidthUsed > 80 ? '#ff4d4f' : '#52c41a'}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">4.5GB of 10GB used</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Server Load">
            <Progress
              type="circle"
              percent={72}
              format={percent => `${percent}%`}
              strokeColor="#1890ff"
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">Current load average</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Top Users by Activity" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={topUsers}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default UsagePage;
