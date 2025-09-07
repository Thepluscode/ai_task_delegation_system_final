import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Progress, Button, Spin, Alert } from 'antd';
import {
  LineChartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DollarOutlined,
  TrophyOutlined,
  RiseOutlined
} from '@ant-design/icons';

import { apiService } from '../../services/apiService';
import { websocketService } from '../../services/websocketService';

const { Title, Text } = Typography;

const TradingServicePage = () => {
  const [tradingStats, setTradingStats] = useState({});
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTradingData();
    
    // Setup real-time updates
    websocketService.on('service_status', handleServiceUpdate);
    websocketService.on('trading_metrics', handleTradingMetricsUpdate);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadTradingData, 30000);
    
    return () => {
      clearInterval(interval);
      websocketService.off('service_status', handleServiceUpdate);
      websocketService.off('trading_metrics', handleTradingMetricsUpdate);
    };
  }, []);

  const loadTradingData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Get service health data
      const services = await apiService.getServiceHealth();
      const tradingService = services.find(s => s.name === 'Trading Service');
      setServiceData(tradingService);
      
      // Get trading-specific metrics
      const tradingData = await apiService.getTradingStats();
      setTradingStats(tradingData);
      
    } catch (error) {
      console.error('Failed to load trading data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleServiceUpdate = (data) => {
    if (data.service_name === 'Trading Service') {
      setServiceData(prev => ({ ...prev, ...data }));
    }
  };

  const handleTradingMetricsUpdate = (data) => {
    setTradingStats(data);
  };

  const positionColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (position) => (
        <Tag color={position > 0 ? 'green' : 'red'}>
          {position > 0 ? 'LONG' : 'SHORT'} {Math.abs(position)}
        </Tag>
      ),
    },
    {
      title: 'Entry Price',
      dataIndex: 'entry_price',
      key: 'entry_price',
      render: (price) => `$${price?.toFixed(2)}`,
    },
    {
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (price) => `$${price?.toFixed(2)}`,
    },
    {
      title: 'P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl) => (
        <Text style={{ color: pnl >= 0 ? '#3f8600' : '#cf1322' }}>
          {pnl >= 0 ? '+' : ''}${pnl?.toFixed(2)}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading trading service data...</Text>
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
            <LineChartOutlined /> Trading Service
          </Title>
          <Text type="secondary">Monitor trading operations and market positions</Text>
          {serviceData && (
            <div style={{ marginTop: 8 }}>
              <Tag 
                color={serviceData.status === 'healthy' ? 'green' : 'red'} 
                icon={serviceData.status === 'healthy' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              >
                {serviceData.status?.toUpperCase()} - Port {serviceData.port}
              </Tag>
              {serviceData.response_time && (
                <Tag color="blue">Response: {serviceData.response_time}</Tag>
              )}
            </div>
          )}
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined spin={refreshing} />} 
            onClick={loadTradingData}
            loading={refreshing}
          >
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Failed to load trading data"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      {/* Trading Statistics */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total P&L"
              value={tradingStats.total_pnl || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: (tradingStats.total_pnl || 0) >= 0 ? '#3f8600' : '#cf1322' }}
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Positions"
              value={tradingStats.active_positions || 0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Win Rate"
              value={tradingStats.win_rate || 0}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Daily Volume"
              value={tradingStats.daily_volume || 0}
              prefix={<LineChartOutlined />}
              formatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card title="Portfolio Performance">
            <Progress
              type="circle"
              percent={Math.min(100, Math.max(0, (tradingStats.portfolio_performance || 0) + 50))}
              format={() => `${(tradingStats.portfolio_performance || 0).toFixed(1)}%`}
              strokeColor={tradingStats.portfolio_performance >= 0 ? '#52c41a' : '#ff4d4f'}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Risk Exposure">
            <Progress
              type="circle"
              percent={tradingStats.risk_exposure || 0}
              format={percent => `${percent}%`}
              strokeColor="#faad14"
            />
          </Card>
        </Col>
      </Row>

      {/* Active Positions Table */}
      <Card title="Active Trading Positions" style={{ marginTop: 24 }}>
        <Table
          columns={positionColumns}
          dataSource={tradingStats.positions || []}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default TradingServicePage;
