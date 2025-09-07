import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Statistic,
  Progress,
  Alert,
  Spin,
  Tooltip,
  Modal,
  Descriptions,
  Badge
} from 'antd';
import {
  CloudServerOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  SettingOutlined,
  ApiOutlined,
  DatabaseOutlined,
  MonitorOutlined,
  UserOutlined,
  RobotOutlined,
  LineChartOutlined,
  BankOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  WifiOutlined
} from '@ant-design/icons';

import { apiService } from '../services/apiService';
import { websocketService } from '../services/websocketService';

const { Title, Text } = Typography;

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    loadServices();
    
    // Setup real-time updates
    websocketService.on('service_status', handleServiceUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadServices, 30000);
    
    return () => {
      clearInterval(interval);
      websocketService.off('service_status', handleServiceUpdate);
    };
  }, []);

  const loadServices = async () => {
    try {
      setRefreshing(true);
      const servicesData = await apiService.getServiceHealth();
      setServices(servicesData);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleServiceUpdate = (data) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.name === data.service_name 
          ? { ...service, status: data.status, ...data }
          : service
      )
    );
  };

  const getServiceIcon = (serviceName) => {
    const iconMap = {
      'API Gateway': <ApiOutlined />,
      'Auth Service': <UserOutlined />,
      'Database Service': <DatabaseOutlined />,
      'Monitoring Service': <MonitorOutlined />,
      'Learning Service': <RobotOutlined />,
      'Trading Service': <LineChartOutlined />,
      'Market Signals': <LineChartOutlined />,
      'Banking Service': <BankOutlined />,
      'Healthcare Service': <MedicineBoxOutlined />,
      'Retail Service': <ShoppingCartOutlined />,
      'IoT Service': <WifiOutlined />,
      'Main Platform': <CloudServerOutlined />
    };
    return iconMap[serviceName] || <CloudServerOutlined />;
  };

  const getServiceDescription = (serviceName) => {
    const descriptions = {
      'API Gateway': 'Unified entry point for all API requests with routing and load balancing',
      'Auth Service': 'Authentication and authorization with email integration',
      'Database Service': 'Centralized database management with connection pooling',
      'Monitoring Service': 'Real-time task monitoring and anomaly detection',
      'Learning Service': 'AI-powered performance optimization and agent learning',
      'Trading Service': 'High-frequency trading and market operations',
      'Market Signals': 'AI-driven market analysis and signal generation',
      'Banking Service': 'Loan processing and credit assessment automation',
      'Healthcare Service': 'HIPAA-compliant healthcare data routing',
      'Retail Service': 'E-commerce automation and customer interaction',
      'IoT Service': 'Smart device management and sensor data processing',
      'Main Platform': 'Core enterprise automation and task delegation hub'
    };
    return descriptions[serviceName] || 'Enterprise service component';
  };

  const showServiceDetails = (service) => {
    setSelectedService(service);
    setDetailsVisible(true);
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {getServiceIcon(text)}
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getServiceDescription(text)}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'healthy' ? 'green' : 'red'} 
          icon={status === 'healthy' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      render: (port) => (
        <Tag color="blue">{port}</Tag>
      ),
    },
    {
      title: 'Response Time',
      dataIndex: 'response_time',
      key: 'response_time',
      render: (time) => {
        if (time === 'N/A') return <Text type="secondary">N/A</Text>;
        const numTime = parseFloat(time);
        const color = numTime < 100 ? 'green' : numTime < 500 ? 'orange' : 'red';
        return <Text style={{ color }}>{time}ms</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => showServiceDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Service Settings">
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              onClick={() => {
                // Navigate to service settings
                console.log('Settings for', record.name);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;
  const healthPercentage = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading services...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <CloudServerOutlined /> Service Management
          </Title>
          <Text type="secondary">
            Monitor and manage all enterprise platform services
          </Text>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined spin={refreshing} />} 
            onClick={loadServices}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Service Health Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Services"
              value={totalServices}
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Healthy Services"
              value={healthyServices}
              suffix={`/ ${totalServices}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ marginBottom: 8 }}>
              <Text strong>System Health</Text>
            </div>
            <Progress
              percent={healthPercentage}
              status={healthPercentage === 100 ? 'success' : healthPercentage > 80 ? 'normal' : 'exception'}
              strokeColor={healthPercentage === 100 ? '#52c41a' : healthPercentage > 80 ? '#1890ff' : '#ff4d4f'}
            />
          </Card>
        </Col>
      </Row>

      {/* Health Alert */}
      {healthPercentage < 100 && (
        <Alert
          message="Service Health Warning"
          description={`${totalServices - healthyServices} service(s) are currently unhealthy. Please check the service status below.`}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Services Table */}
      <Card title="Service Status" extra={
        <Badge count={totalServices - healthyServices} showZero>
          <Tag color="blue">Services</Tag>
        </Badge>
      }>
        <Table
          dataSource={services}
          columns={columns}
          rowKey="name"
          pagination={false}
          size="middle"
          rowClassName={(record) => 
            record.status === 'healthy' ? 'service-row-healthy' : 'service-row-unhealthy'
          }
        />
      </Card>

      {/* Service Details Modal */}
      <Modal
        title={
          <Space>
            {selectedService && getServiceIcon(selectedService.name)}
            {selectedService?.name} Details
          </Space>
        }
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedService && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Service Name">
              {selectedService.name}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag 
                color={selectedService.status === 'healthy' ? 'green' : 'red'} 
                icon={selectedService.status === 'healthy' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              >
                {selectedService.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Port">
              {selectedService.port}
            </Descriptions.Item>
            <Descriptions.Item label="URL">
              {selectedService.url}
            </Descriptions.Item>
            <Descriptions.Item label="Response Time">
              {selectedService.response_time}ms
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {getServiceDescription(selectedService.name)}
            </Descriptions.Item>
            {selectedService.data && (
              <Descriptions.Item label="Additional Info">
                <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {JSON.stringify(selectedService.data, null, 2)}
                </pre>
              </Descriptions.Item>
            )}
            {selectedService.error && (
              <Descriptions.Item label="Error">
                <Text type="danger">{selectedService.error}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ServicesPage;
