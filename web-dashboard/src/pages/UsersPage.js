import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UsersPage = ({ user }) => {
  return (
    <div>
      <Title level={2}>
        <UserOutlined /> User Management
      </Title>
      <Text type="secondary">
        Manage user accounts, roles, and permissions
      </Text>
      
      <Card style={{ marginTop: 24, textAlign: 'center', padding: '40px' }}>
        <UserOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>User Management Coming Soon</Title>
        <Text type="secondary">
          Comprehensive user management, role-based access control, and permission management will be available here.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              Add User
            </Button>
            <Button>
              Manage Roles
            </Button>
          </Space>
        </div>
        
        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <Text strong>Current User: </Text>
          <Text>{user?.full_name} ({user?.role})</Text>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;
