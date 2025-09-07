import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Button, Badge, Avatar, Tooltip, Space, Typography } from 'antd';
import { 
  DollarOutlined, 
  RocketOutlined, 
  GlobalOutlined, 
  ThunderboltOutlined,
  TrophyOutlined,
  CrownOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import './BillionDollarDashboard.css';

const { Title, Text } = Typography;

const BillionDollarDashboard = () => {
  const [metrics, setMetrics] = useState({
    platform_valuation: 1200000000, // $1.2B
    monthly_revenue: 45000000, // $45M
    active_enterprises: 2847,
    global_agents: 125000,
    daily_tasks: 2500000,
    ai_accuracy: 99.7,
    cost_savings: 890000000, // $890M saved for clients
    market_share: 34.2,
    growth_rate: 127.5,
    uptime: 99.99
  });

  const [realtimeData, setRealtimeData] = useState({
    current_revenue_rate: 1736, // $/minute
    active_users: 47832,
    tasks_processing: 18429,
    ai_decisions_per_second: 2847,
    global_efficiency: 94.7
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        current_revenue_rate: prev.current_revenue_rate + Math.random() * 100 - 50,
        active_users: prev.active_users + Math.floor(Math.random() * 200 - 100),
        tasks_processing: prev.tasks_processing + Math.floor(Math.random() * 1000 - 500),
        ai_decisions_per_second: prev.ai_decisions_per_second + Math.floor(Math.random() * 200 - 100),
        global_efficiency: Math.min(99.9, prev.global_efficiency + (Math.random() * 0.2 - 0.1))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="billion-dollar-dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="glassmorphism-card hero-card">
          <Row align="middle" justify="space-between">
            <Col>
              <Space direction="vertical" size="small">
                <Title level={1} className="hero-title">
                  <CrownOutlined className="crown-icon" />
                  Enterprise AI Platform
                </Title>
                <Text className="hero-subtitle">
                  Powering the Future of Intelligent Automation
                </Text>
                <div className="valuation-display">
                  <Text className="valuation-label">Platform Valuation</Text>
                  <Title level={1} className="valuation-amount">
                    {formatCurrency(metrics.platform_valuation)}
                  </Title>
                </div>
              </Space>
            </Col>
            <Col>
              <div className="live-metrics">
                <Badge status="processing" text="LIVE" className="live-badge" />
                <div className="metric-item">
                  <Text className="metric-label">Revenue Rate</Text>
                  <Text className="metric-value">
                    {formatCurrency(realtimeData.current_revenue_rate)}/min
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <Row gutter={[24, 24]} className="kpi-section">
        <Col xs={24} sm={12} lg={6}>
          <Card className="glassmorphism-card kpi-card revenue-card">
            <Statistic
              title={
                <span className="kpi-title">
                  <DollarOutlined /> Monthly Revenue
                </span>
              }
              value={formatCurrency(metrics.monthly_revenue)}
              suffix={
                <span className="growth-indicator positive">
                  +{metrics.growth_rate}%
                </span>
              }
              className="kpi-statistic"
            />
            <Progress 
              percent={85} 
              showInfo={false} 
              strokeColor="#52c41a"
              className="kpi-progress"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="glassmorphism-card kpi-card enterprise-card">
            <Statistic
              title={
                <span className="kpi-title">
                  <GlobalOutlined /> Enterprise Clients
                </span>
              }
              value={formatNumber(metrics.active_enterprises)}
              suffix={
                <Tooltip title="Fortune 500 Companies">
                  <TrophyOutlined className="fortune-icon" />
                </Tooltip>
              }
              className="kpi-statistic"
            />
            <Text className="kpi-subtitle">Across 47 countries</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="glassmorphism-card kpi-card ai-card">
            <Statistic
              title={
                <span className="kpi-title">
                  <ThunderboltOutlined /> AI Accuracy
                </span>
              }
              value={metrics.ai_accuracy}
              suffix="%"
              precision={1}
              className="kpi-statistic"
            />
            <div className="ai-metrics">
              <Text className="ai-metric">
                {formatNumber(realtimeData.ai_decisions_per_second)} decisions/sec
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="glassmorphism-card kpi-card savings-card">
            <Statistic
              title={
                <span className="kpi-title">
                  <RocketOutlined /> Client Savings
                </span>
              }
              value={formatCurrency(metrics.cost_savings)}
              className="kpi-statistic"
            />
            <Text className="kpi-subtitle">Total cost reduction delivered</Text>
          </Card>
        </Col>
      </Row>

      {/* Real-time Operations */}
      <Row gutter={[24, 24]} className="operations-section">
        <Col xs={24} lg={16}>
          <Card className="glassmorphism-card operations-card">
            <Title level={3} className="section-title">
              <FireOutlined /> Real-time Operations
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div className="operation-metric">
                  <div className="metric-icon active-users">
                    <Avatar size={48} icon={<GlobalOutlined />} />
                  </div>
                  <div className="metric-content">
                    <Text className="metric-label">Active Users</Text>
                    <Title level={4} className="metric-number">
                      {formatNumber(realtimeData.active_users)}
                    </Title>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div className="operation-metric">
                  <div className="metric-icon processing-tasks">
                    <Avatar size={48} icon={<ThunderboltOutlined />} />
                  </div>
                  <div className="metric-content">
                    <Text className="metric-label">Tasks Processing</Text>
                    <Title level={4} className="metric-number">
                      {formatNumber(realtimeData.tasks_processing)}
                    </Title>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div className="operation-metric">
                  <div className="metric-icon global-efficiency">
                    <Avatar size={48} icon={<StarOutlined />} />
                  </div>
                  <div className="metric-content">
                    <Text className="metric-label">Global Efficiency</Text>
                    <Title level={4} className="metric-number">
                      {realtimeData.global_efficiency.toFixed(1)}%
                    </Title>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="efficiency-chart">
              <Progress 
                percent={realtimeData.global_efficiency} 
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                className="efficiency-progress"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="glassmorphism-card market-card">
            <Title level={3} className="section-title">
              <TrophyOutlined /> Market Position
            </Title>
            
            <div className="market-metrics">
              <div className="market-metric">
                <Text className="market-label">Market Share</Text>
                <Title level={2} className="market-value">
                  {metrics.market_share}%
                </Title>
                <Text className="market-subtitle">#1 in Enterprise AI</Text>
              </div>

              <div className="market-metric">
                <Text className="market-label">System Uptime</Text>
                <Title level={2} className="market-value">
                  {metrics.uptime}%
                </Title>
                <Text className="market-subtitle">Industry Leading</Text>
              </div>

              <div className="market-metric">
                <Text className="market-label">Global Agents</Text>
                <Title level={2} className="market-value">
                  {formatNumber(metrics.global_agents)}
                </Title>
                <Text className="market-subtitle">Across all industries</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Industry Impact */}
      <Row gutter={[24, 24]} className="impact-section">
        <Col span={24}>
          <Card className="glassmorphism-card impact-card">
            <Title level={3} className="section-title">
              <GlobalOutlined /> Global Industry Impact
            </Title>
            
            <Row gutter={[24, 24]}>
              {[
                { industry: 'Manufacturing', efficiency: 94, savings: '245M', color: '#1890ff' },
                { industry: 'Healthcare', efficiency: 97, savings: '189M', color: '#52c41a' },
                { industry: 'Finance', efficiency: 99, savings: '312M', color: '#faad14' },
                { industry: 'Retail', efficiency: 91, savings: '144M', color: '#eb2f96' },
              ].map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <div className="industry-impact">
                    <div className="industry-header">
                      <Title level={4} className="industry-name">{item.industry}</Title>
                      <Text className="industry-savings">{formatCurrency(item.savings)} saved</Text>
                    </div>
                    <Progress 
                      percent={item.efficiency} 
                      strokeColor={item.color}
                      className="industry-progress"
                    />
                    <Text className="industry-efficiency">{item.efficiency}% efficiency</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Action Center */}
      <Row gutter={[24, 24]} className="action-section">
        <Col span={24}>
          <Card className="glassmorphism-card action-card">
            <Title level={3} className="section-title">Mission Control</Title>
            <Space size="large" wrap>
              <Button type="primary" size="large" icon={<RocketOutlined />} className="action-button">
                Launch New Market
              </Button>
              <Button size="large" icon={<ThunderboltOutlined />} className="action-button">
                Optimize Global Performance
              </Button>
              <Button size="large" icon={<GlobalOutlined />} className="action-button">
                Expand Enterprise Network
              </Button>
              <Button size="large" icon={<TrophyOutlined />} className="action-button">
                View Executive Report
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BillionDollarDashboard;
