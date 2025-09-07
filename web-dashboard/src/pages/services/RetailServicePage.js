import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Space, Typography, Progress, Alert, Tabs } from 'antd';
import {
  ShoppingCartOutlined,
  DollarOutlined,
  PackageOutlined,
  SettingOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const RetailServicePage = () => {
  const [serviceData, setServiceData] = useState({});
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for Retail service data
    setTimeout(() => {
      setServiceData({
        status: 'healthy',
        uptime: 99.9,
        responseTime: 28,
        throughput: 850,
        errorRate: 0.08,
        instances: 4,
        version: 'v3.2.1',
        totalOrders: 12847,
        revenue: 2847592,
        activeCustomers: 8934
      });

      setOrders([
        {
          key: '1',
          orderId: 'ORD-2024-001',
          customer: 'John Smith',
          amount: 299.99,
          status: 'processing',
          items: 3,
          timestamp: '2 minutes ago'
        },
        {
          key: '2',
          orderId: 'ORD-2024-002',
          customer: 'Sarah Johnson',
          amount: 149.50,
          status: 'shipped',
          items: 2,
          timestamp: '15 minutes ago'
        },
        {
          key: '3',
          orderId: 'ORD-2024-003',
          customer: 'Mike Wilson',
          amount: 89.99,
          status: 'delivered',
          items: 1,
          timestamp: '1 hour ago'
        },
        {
          key: '4',
          orderId: 'ORD-2024-004',
          customer: 'Emily Davis',
          amount: 459.99,
          status: 'pending',
          items: 5,
          timestamp: '2 hours ago'
        }
      ]);

      setInventory([
        {
          key: '1',
          productId: 'PROD-001',
          name: 'Wireless Headphones',
          category: 'Electronics',
          stock: 245,
          reserved: 12,
          price: 99.99,
          status: 'in_stock'
        },
        {
          key: '2',
          productId: 'PROD-002',
          name: 'Smart Watch',
          category: 'Electronics',
          stock: 8,
          reserved: 3,
          price: 299.99,
          status: 'low_stock'
        },
        {
          key: '3',
          productId: 'PROD-003',
          name: 'Running Shoes',
          category: 'Apparel',
          stock: 0,
          reserved: 0,
          price: 129.99,
          status: 'out_of_stock'
        },
        {
          key: '4',
          productId: 'PROD-004',
          name: 'Coffee Maker',
          category: 'Home & Kitchen',
          stock: 156,
          reserved: 8,
          price: 89.99,
          status: 'in_stock'
        }
      ]);

      setMetrics([
        {
          key: '1',
          metric: 'Order Processing Rate',
          value: '850',
          unit: 'orders/hour',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '2',
          metric: 'Conversion Rate',
          value: '3.2',
          unit: '%',
          status: 'normal',
          trend: 'up'
        },
        {
          key: '3',
          metric: 'Average Order Value',
          value: '221.45',
          unit: '$',
          status: 'normal',
          trend: 'stable'
        },
        {
          key: '4',
          metric: 'Inventory Turnover',
          value: '12.5',
          unit: 'times/year',
          status: 'normal',
          trend: 'up'
        }
      ]);

      setAlerts([
        {
          key: '1',
          type: 'warning',
          message: 'Smart Watch (PROD-002) is running low on stock (8 units)',
          timestamp: '10 minutes ago'
        },
        {
          key: '2',
          type: 'error',
          message: 'Running Shoes (PROD-003) is out of stock',
          timestamp: '1 hour ago'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>${amount}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          pending: 'orange',
          processing: 'blue',
          shipped: 'cyan',
          delivered: 'green'
        };
        return <Tag color={colorMap[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items'
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => <Text type="secondary">{text}</Text>
    }
  ];

  const inventoryColumns = [
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'productId',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock, record) => {
        const color = stock > 50 ? 'green' : stock > 10 ? 'orange' : 'red';
        return <Text style={{ color }}>{stock} ({record.reserved} reserved)</Text>;
      }
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <Text>${price}</Text>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          in_stock: 'green',
          low_stock: 'orange',
          out_of_stock: 'red'
        };
        return <Tag color={colorMap[status]}>{status.replace('_', ' ').toUpperCase()}</Tag>;
      }
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
          <ShoppingCartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Retail Service
        </Title>
        <Text type="secondary">E-commerce order processing and inventory management</Text>
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
              title="Total Orders"
              value={serviceData.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={serviceData.revenue}
              prefix={<DollarOutlined />}
              precision={0}
              formatter={(value) => `$${value?.toLocaleString()}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={serviceData.activeCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="orders" style={{ marginTop: 24 }}>
        <TabPane tab="Order Management" key="orders">
          <Card title="Recent Orders" extra={
            <Button type="primary" icon={<ReloadOutlined />}>
              Refresh
            </Button>
          }>
            <Table
              columns={orderColumns}
              dataSource={orders}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Inventory" key="inventory">
          <Card title="Product Inventory">
            <Table
              columns={inventoryColumns}
              dataSource={inventory}
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Performance Metrics" key="metrics">
          <Card title="Retail Performance Metrics">
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
                  <div>
                    <Text strong>Version: </Text>
                    <Text>{serviceData.version}</Text>
                  </div>
                  <div>
                    <Text strong>Instances: </Text>
                    <Text>{serviceData.instances}</Text>
                  </div>
                  <div>
                    <Text strong>Error Rate: </Text>
                    <Text>{serviceData.errorRate}%</Text>
                  </div>
                  <div>
                    <Text strong>Processing Rate: </Text>
                    <Text>{serviceData.throughput} orders/hour</Text>
                  </div>
                </Space>
                <Space style={{ marginTop: 16 }}>
                  <Button type="primary" icon={<ReloadOutlined />}>
                    Restart Service
                  </Button>
                  <Button icon={<SettingOutlined />}>
                    Configure
                  </Button>
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
                  <Text>Throughput: {serviceData.throughput} req/s</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RetailServicePage;
