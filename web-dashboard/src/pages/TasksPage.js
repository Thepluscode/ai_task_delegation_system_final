import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { UnorderedListOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TasksPage = () => {
  return (
    <div>
      <Title level={2}>
        <UnorderedListOutlined /> Task Management
      </Title>
      <Text type="secondary">
        Manage and monitor all platform tasks and delegations
      </Text>
      
      <Card style={{ marginTop: 24, textAlign: 'center', padding: '40px' }}>
        <UnorderedListOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>Task Management Coming Soon</Title>
        <Text type="secondary">
          Advanced task delegation, monitoring, and management features will be available here.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              Create Task
            </Button>
            <Button>
              View All Tasks
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default TasksPage;
