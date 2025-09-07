import React from 'react';
import { Typography, Card, Button, Space } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SettingsPage = ({ user }) => {
  return (
    <div>
      <Title level={2}>
        <SettingOutlined /> Settings
      </Title>
      <Text type="secondary">
        Configure system settings and preferences
      </Text>
      
      <Card style={{ marginTop: 24, textAlign: 'center', padding: '40px' }}>
        <SettingOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: 16 }} />
        <Title level={3}>Settings Panel Coming Soon</Title>
        <Text type="secondary">
          System configuration, user preferences, and advanced settings will be available here.
        </Text>
        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" icon={<SaveOutlined />}>
              System Config
            </Button>
            <Button>
              User Preferences
            </Button>
          </Space>
        </div>
        
        <div style={{ marginTop: 32, textAlign: 'left' }}>
          <Text strong>Current User: </Text>
          <Text>{user?.full_name} ({user?.email})</Text>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
