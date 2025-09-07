import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { DatabaseOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DatabasePage = () => {
  return (
    <div>
      <Title level={2}>
        <DatabaseOutlined /> Database Console
      </Title>
      <Text type="secondary">
        Execute queries and manage the centralized database
      </Text>
      
      <Card style={{ marginTop: 24, textAlign: 'center', padding: '40px' }}>
        <DatabaseOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>Database Console Coming Soon</Title>
        <Text type="secondary">
          Advanced database query interface, schema management, and performance monitoring will be available here.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" icon={<PlayCircleOutlined />}>
              Query Builder
            </Button>
            <Button>
              Schema Explorer
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default DatabasePage;
