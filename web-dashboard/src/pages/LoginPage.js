import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Switch,
  Divider,
  Alert,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  BulbOutlined,
  DashboardOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  MonitorOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const LoginPage = ({ onLogin, darkMode, toggleTheme }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const success = await onLogin(values);
      if (!success) {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator' },
    { username: 'manager', password: 'manager123', role: 'Manager' },
    { username: 'user', password: 'user123', role: 'User' }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <Row gutter={[32, 32]} style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Left side - Branding and Features */}
        <Col xs={24} lg={12}>
          <div style={{ color: '#fff', padding: '40px 20px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={1} style={{ color: '#fff', marginBottom: 8 }}>
                  <DashboardOutlined /> Enterprise Platform
                </Title>
                <Title level={3} style={{ color: '#fff', opacity: 0.9, fontWeight: 300 }}>
                  Unified Automation & Management Dashboard
                </Title>
              </div>

              <Paragraph style={{ color: '#fff', opacity: 0.8, fontSize: '16px' }}>
                Access your comprehensive enterprise automation platform with real-time monitoring,
                AI-powered task delegation, and centralized service management.
              </Paragraph>

              <div>
                <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
                  Platform Features:
                </Title>
                <Space direction="vertical" size="middle">
                  <div style={{ color: '#fff', opacity: 0.9 }}>
                    <CloudServerOutlined style={{ marginRight: 8 }} />
                    12 Enterprise Services with Real-time Health Monitoring
                  </div>
                  <div style={{ color: '#fff', opacity: 0.9 }}>
                    <DatabaseOutlined style={{ marginRight: 8 }} />
                    Centralized Database Management with Performance Analytics
                  </div>
                  <div style={{ color: '#fff', opacity: 0.9 }}>
                    <MonitorOutlined style={{ marginRight: 8 }} />
                    AI-Powered Task Delegation and Learning Systems
                  </div>
                  <div style={{ color: '#fff', opacity: 0.9 }}>
                    <DashboardOutlined style={{ marginRight: 8 }} />
                    Comprehensive Analytics and Reporting Dashboard
                  </div>
                </Space>
              </div>
            </Space>
          </div>
        </Col>

        {/* Right side - Login Form */}
        <Col xs={24} lg={12}>
          <Card
            style={{
              maxWidth: 400,
              margin: '0 auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              borderRadius: 12,
              background: darkMode ? '#1f1f1f' : '#fff'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2} style={{ color: darkMode ? '#fff' : '#000', marginBottom: 8 }}>
                Welcome Back
              </Title>
              <Text type="secondary">
                Sign in to access your enterprise dashboard
              </Text>
            </div>

            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please enter your username!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your username"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter your password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  block
                  style={{ height: 48 }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>Demo Credentials</Divider>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Use these demo credentials to explore the platform:
              </Text>
            </div>

            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {demoCredentials.map((cred, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{
                    background: darkMode ? '#262626' : '#f5f5f5',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Auto-fill form with demo credentials
                    form.setFieldsValue({
                      username: cred.username,
                      password: cred.password
                    });
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ color: darkMode ? '#fff' : '#000' }}>
                        {cred.username}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {cred.role}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Click to use
                    </Text>
                  </div>
                </Card>
              ))}
            </Space>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Theme
              </Text>
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                checkedChildren={<BulbOutlined />}
                unCheckedChildren={<BulbOutlined />}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
