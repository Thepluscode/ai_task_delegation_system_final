import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Progress, Button, Badge, Avatar, Tooltip, Space, Typography, 
  Table, Tabs, Select, Modal, Form, Input, DatePicker, Slider, Alert, Divider, Tag
} from 'antd';
import {
  BuildOutlined, DollarOutlined, RobotOutlined, ThunderboltOutlined, GlobalOutlined,
  TrophyOutlined, LineChartOutlined, SafetyCertificateOutlined, TeamOutlined,
  ExperimentOutlined, SettingOutlined, AlertOutlined, CheckCircleOutlined,
  RiseOutlined, FireOutlined, CrownOutlined, StarOutlined, BulbOutlined
} from '@ant-design/icons';
import './SmartManufacturingDashboard.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const SmartManufacturingDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [marketIntelligence, setMarketIntelligence] = useState(null);
  const [fortuneCustomers, setFortuneCustomers] = useState([]);
  const [digitalTwins, setDigitalTwins] = useState([]);
  const [predictiveMaintenance, setPredictiveMaintenance] = useState([]);
  const [executiveDashboard, setExecutiveDashboard] = useState(null);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [roiModal, setRoiModal] = useState(false);
  const [proposalModal, setProposalModal] = useState(false);

  const API_BASE = 'http://localhost:8030';

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        marketResp,
        customersResp,
        twinsResp,
        maintenanceResp,
        execResp,
        competitiveResp
      ] = await Promise.all([
        fetch(`${API_BASE}/platform/market-intelligence`),
        fetch(`${API_BASE}/platform/fortune-500-customers`),
        fetch(`${API_BASE}/ai/digital-twins`),
        fetch(`${API_BASE}/ai/predictive-maintenance`),
        fetch(`${API_BASE}/platform/executive-dashboard`),
        fetch(`${API_BASE}/platform/competitive-analysis`)
      ]);

      setMarketIntelligence(await marketResp.json());
      setFortuneCustomers(await customersResp.json());
      setDigitalTwins(await twinsResp.json());
      setPredictiveMaintenance(await maintenanceResp.json());
      setExecutiveDashboard(await execResp.json());
      setCompetitiveAnalysis(await competitiveResp.json());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  const showROICalculator = async (customer) => {
    setSelectedCustomer(customer);
    setRoiModal(true);
  };

  const generateProposal = async (customerId, capabilities) => {
    try {
      const response = await fetch(`${API_BASE}/platform/roi-calculator/${customerId}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requested_capabilities: capabilities,
          deployment_timeline_months: 18,
          success_criteria: ["ROI within 18 months", "99%+ uptime", "30% efficiency gain"]
        })
      });
      const proposal = await response.json();
      console.log('Generated proposal:', proposal);
      setProposalModal(false);
    } catch (error) {
      console.error('Error generating proposal:', error);
    }
  };

  return (
    <div className="smart-manufacturing-dashboard">
      {/* Hero Section */}
      <div className="hero-section">
        <Card className="hero-card">
          <Row align="middle" justify="space-between">
            <Col span={16}>
              <Space direction="vertical" size="small">
                <Title level={1} className="hero-title">
                  <BuildOutlined className="hero-icon" />
                  Fortune 500 Manufacturing 4.0 Platform
                </Title>
                <Text className="hero-subtitle">
                  AI-First Automation Platform • $790B Market Opportunity • 97% AI Gap
                </Text>
                <div className="market-stats">
                  <Space size="large">
                    <Statistic 
                      title="Market TAM 2030" 
                      value="$790B" 
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                    />
                    <Statistic 
                      title="AI Adoption Gap" 
                      value="97%" 
                      suffix="opportunity"
                      prefix={<RobotOutlined />}
                      valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                    />
                    <Statistic 
                      title="Fortune 500 Pipeline" 
                      value={executiveDashboard?.customer_metrics?.total_investment_pipeline || "$8.8B"} 
                      prefix={<TrophyOutlined />}
                      valueStyle={{ color: '#faad14', fontSize: '24px' }}
                    />
                  </Space>
                </div>
              </Space>
            </Col>
            <Col span={8} className="hero-actions">
              <Space direction="vertical" size="middle">
                <Badge status="processing" text="LIVE PLATFORM" />
                <Button type="primary" size="large" icon={<ThunderboltOutlined />}>
                  Schedule Fortune 500 Demo
                </Button>
                <Button size="large" icon={<LineChartOutlined />}>
                  View ROI Calculator
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Executive KPIs */}
      <Row gutter={[24, 24]} className="executive-kpis">
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card revenue-card">
            <Statistic
              title="Platform Revenue Potential"
              value={executiveDashboard?.financial_metrics?.platform_revenue_potential || "$350M"}
              prefix={<DollarOutlined />}
              suffix={
                <Tag color="green">+127% YoY</Tag>
              }
            />
            <Progress percent={85} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card customers-card">
            <Statistic
              title="Fortune 500 Customers"
              value={executiveDashboard?.customer_metrics?.fortune_500_customers || 3}
              prefix={<CrownOutlined />}
              suffix={
                <Tooltip title="GM, Lockheed Martin, Novartis">
                  <StarOutlined />
                </Tooltip>
              }
            />
            <Text className="kpi-subtitle">$4B+ active investments</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card ai-card">
            <Statistic
              title="AI Capabilities Active"
              value={
                (executiveDashboard?.ai_capabilities_adoption?.digital_twins_deployed || 0) +
                (executiveDashboard?.ai_capabilities_adoption?.predictive_maintenance_active || 0)
              }
              prefix={<BulbOutlined />}
              suffix="systems"
            />
            <Text className="kpi-subtitle">30% downtime reduction</Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card roi-card">
            <Statistic
              title="Average ROI Timeline"
              value={executiveDashboard?.financial_metrics?.average_roi_timeline || "16.2 months"}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <Text className="kpi-subtitle">vs 24-48 month industry avg</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Dashboard Tabs */}
      <Card className="main-dashboard">
        <Tabs defaultActiveKey="fortune500" size="large">
          
          {/* Fortune 500 Customers Tab */}
          <TabPane tab={<span><TrophyOutlined />Fortune 500 Pipeline</span>} key="fortune500">
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Alert
                  message="Active Fortune 500 Opportunities"
                  description="$8.8B+ in active manufacturing investments from General Motors ($4B), Lockheed Martin ($4.5B), and pharmaceutical expansion programs."
                  type="success"
                  showIcon
                  className="opportunity-alert"
                />
              </Col>
              
              {fortuneCustomers.map((customer, index) => (
                <Col xs={24} lg={8} key={customer.company_id}>
                  <Card 
                    className="customer-card"
                    title={
                      <Space>
                        <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                          {customer.company_name.charAt(0)}
                        </Avatar>
                        {customer.company_name}
                        <Tag color="gold">Fortune {customer.fortune_ranking}</Tag>
                      </Space>
                    }
                    extra={
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={() => showROICalculator(customer)}
                      >
                        ROI Analysis
                      </Button>
                    }
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Statistic
                        title="Investment Budget"
                        value={formatCurrency(customer.manufacturing_investment_budget)}
                        valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                      />
                      
                      <div>
                        <Text strong>Industry: </Text>
                        <Tag color="blue">{customer.industry_vertical}</Tag>
                      </div>
                      
                      <div>
                        <Text strong>AI Readiness: </Text>
                        <Progress 
                          percent={customer.ai_readiness_score} 
                          size="small" 
                          strokeColor="#1890ff"
                        />
                      </div>
                      
                      <div>
                        <Text strong>Target ROI: </Text>
                        <Text>{customer.target_roi_months} months</Text>
                      </div>
                      
                      <div>
                        <Text strong>Key Pain Points:</Text>
                        <div style={{ marginTop: 4 }}>
                          {customer.pain_points.slice(0, 2).map((pain, idx) => (
                            <Tag key={idx} size="small">{pain}</Tag>
                          ))}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* AI Capabilities Tab */}
          <TabPane tab={<span><RobotOutlined />AI Capabilities</span>} key="ai">
            <Row gutter={[24, 24]}>
              
              {/* Digital Twins Section */}
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <ExperimentOutlined />
                      Digital Twins (44% Market Adoption)
                      <Badge count={digitalTwins.length} style={{ backgroundColor: '#52c41a' }} />
                    </Space>
                  }
                  className="ai-capability-card"
                >
                  <Row gutter={[16, 16]}>
                    {digitalTwins.slice(0, 3).map((twin, index) => (
                      <Col xs={24} md={8} key={twin.twin_id}>
                        <Card size="small" className="twin-card">
                          <Statistic
                            title="Monthly Cost Savings"
                            value={formatCurrency(twin.cost_savings_monthly)}
                            prefix={<DollarOutlined />}
                            valueStyle={{ fontSize: '16px', color: '#52c41a' }}
                          />
                          <div style={{ marginTop: 12 }}>
                            <Text strong>Processing Time Reduction: </Text>
                            <Text>{twin.processing_time_reduction.toFixed(1)}%</Text>
                          </div>
                          <div style={{ marginTop: 8 }}>
                            <Text strong>AI Predictions:</Text>
                            <div style={{ marginTop: 4 }}>
                              <Progress 
                                percent={twin.ai_predictions.energy_optimization.potential_savings} 
                                size="small"
                                format={() => `${twin.ai_predictions.energy_optimization.potential_savings.toFixed(1)}% Energy`}
                              />
                              <Progress 
                                percent={twin.ai_predictions.production_efficiency.improvement} 
                                size="small"
                                strokeColor="#faad14"
                                format={() => `${twin.ai_predictions.production_efficiency.improvement.toFixed(1)}% Efficiency`}
                              />
                            </div>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>

              {/* Predictive Maintenance Section */}
              <Col span={24}>
                <Card 
                  title={
                    <Space>
                      <SettingOutlined />
                      Predictive Maintenance (30% Downtime Reduction)
                      <Badge count={predictiveMaintenance.length} style={{ backgroundColor: '#faad14' }} />
                    </Space>
                  }
                  className="ai-capability-card"
                >
                  <Row gutter={[16, 16]}>
                    {predictiveMaintenance.slice(0, 3).map((pred, index) => (
                      <Col xs={24} md={8} key={pred.prediction_id}>
                        <Card size="small" className="maintenance-card">
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div>
                              <Text strong>Failure Probability: </Text>
                              <Progress 
                                percent={pred.failure_probability * 100} 
                                size="small"
                                strokeColor={pred.failure_probability > 0.3 ? '#ff4d4f' : '#52c41a'}
                              />
                            </div>
                            
                            <Statistic
                              title="Maintenance Cost Savings"
                              value={formatCurrency(pred.maintenance_cost_savings)}
                              valueStyle={{ fontSize: '14px' }}
                            />
                            
                            <div>
                              <Text strong>Energy Savings: </Text>
                              <Text>{pred.energy_savings_percentage}%</Text>
                            </div>
                            
                            <div>
                              <Text strong>Predicted Failure: </Text>
                              <Text>{new Date(pred.predicted_failure_date).toLocaleDateString()}</Text>
                            </div>
                            
                            <Button 
                              size="small" 
                              type="primary"
                              icon={<CheckCircleOutlined />}
                            >
                              Schedule Maintenance
                            </Button>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Market Intelligence Tab */}
          <TabPane tab={<span><GlobalOutlined />Market Intelligence</span>} key="market">
            {marketIntelligence && (
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Alert
                    message="Billion-Dollar Market Opportunity"
                    description="$790-998B TAM by 2030 with 14-15% CAGR. Only 3% of manufacturers currently use AI, creating massive white space opportunity."
                    type="info"
                    showIcon
                    className="market-alert"
                  />
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Market Segments" className="market-card">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {Object.entries(marketIntelligence.market_segments).map(([segment, data]) => (
                        <div key={segment} className="market-segment">
                          <div className="segment-header">
                            <Text strong>{segment.replace('_', ' ').toUpperCase()}</Text>
                            <Text className="segment-value">{formatCurrency(data.market_size_2030)}</Text>
                          </div>
                          <Progress 
                            percent={(data.market_size_2030 / 1000000000000) * 100} 
                            showInfo={false}
                            strokeColor="#1890ff"
                          />
                          <Text className="segment-customers">
                            {data.addressable_customers.toLocaleString()} addressable customers
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Fortune 500 Opportunities" className="opportunities-card">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {Object.entries(marketIntelligence.fortune_500_opportunities).map(([company, data]) => (
                        <Card key={company} size="small" className="opportunity-card">
                          <div className="opportunity-header">
                            <Text strong>{company.replace('_', ' ').toUpperCase()}</Text>
                            <Tag color="gold">{formatCurrency(data.investment_budget)}</Tag>
                          </div>
                          <div className="opportunity-details">
                            <Text>Timeline: {data.timeline}</Text>
                            <div className="focus-areas">
                              {data.focus_areas.map((area, idx) => (
                                <Tag key={idx} size="small">{area}</Tag>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>

          {/* Competitive Analysis Tab */}
          <TabPane tab={<span><FireOutlined />Competitive Edge</span>} key="competitive">
            {competitiveAnalysis && (
              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Alert
                    message="Competitive Advantages"
                    description="AI-first platform addressing 97% market gap vs. traditional vendors struggling with AI transition. 12-18 month ROI vs. 24-48 month industry average."
                    type="success"
                    showIcon
                  />
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Our Platform vs. Traditional Vendors" className="competitive-card">
                    <div className="competitive-comparison">
                      <div className="our-platform">
                        <Title level={4} style={{ color: '#52c41a' }}>Our AI-First Platform</Title>
                        <ul>
                          <li>✅ AI-native architecture</li>
                          <li>✅ 6-12 month implementation</li>
                          <li>✅ 12-18 month ROI</li>
                          <li>✅ Cloud-native scalability</li>
                          <li>✅ Manufacturing domain expertise</li>
                        </ul>
                      </div>
                      
                      <Divider />
                      
                      <div className="traditional-vendors">
                        <Title level={4} style={{ color: '#ff4d4f' }}>Traditional Vendors</Title>
                        <ul>
                          <li>❌ Retrofitted AI solutions</li>
                          <li>❌ 18-36 month implementation</li>
                          <li>❌ 24-48 month ROI</li>
                          <li>❌ Legacy architecture limitations</li>
                          <li>❌ Generic IoT platforms</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Market Position Analysis" className="position-card">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {Object.entries(competitiveAnalysis.market_position.traditional_vendors).map(([vendor, data]) => (
                        <Card key={vendor} size="small" className="vendor-card">
                          <div className="vendor-header">
                            <Text strong>{vendor.replace('_', ' ').toUpperCase()}</Text>
                            <Tag color="orange">{data.market_share || 'Declining'}</Tag>
                          </div>
                          <div className="vendor-weaknesses">
                            <Text strong>Key Weaknesses:</Text>
                            <ul>
                              {data.weaknesses.map((weakness, idx) => (
                                <li key={idx}>{weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* ROI Calculator Modal */}
      <Modal
        title={`ROI Calculator - ${selectedCustomer?.company_name}`}
        visible={roiModal}
        onCancel={() => setRoiModal(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setRoiModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="proposal" 
            type="primary"
            onClick={() => setProposalModal(true)}
          >
            Generate Proposal
          </Button>
        ]}
      >
        {selectedCustomer && (
          <div className="roi-calculator">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Statistic
                  title="Investment Budget"
                  value={formatCurrency(selectedCustomer.manufacturing_investment_budget)}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Target ROI Timeline"
                  value={selectedCustomer.target_roi_months}
                  suffix="months"
                  prefix={<RiseOutlined />}
                />
              </Col>
              <Col span={24}>
                <Title level={4}>Expected Benefits</Title>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>30% reduction in unplanned downtime</div>
                  <div>25% increase in production efficiency</div>
                  <div>15% reduction in energy consumption</div>
                  <div>20% improvement in quality control</div>
                </Space>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SmartManufacturingDashboard;
