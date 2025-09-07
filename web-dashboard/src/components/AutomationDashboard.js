import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Modal, Form, Select, notification, Switch, Alert } from 'antd';
import { RobotOutlined, ThunderboltOutlined, BarChartOutlined, SettingOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const AutomationDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [industries, setIndustries] = useState({});
  const [configModal, setConfigModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('manufacturing');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAutomationData();
    const interval = setInterval(fetchAutomationData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAutomationData = async () => {
    try {
      // Fetch automation metrics
      const metricsResponse = await fetch('http://localhost:8012/api/v1/automation/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
        setAutomationEnabled(metricsData.metrics.automation_enabled);
      }

      // Fetch supported industries
      const industriesResponse = await fetch('http://localhost:8012/api/v1/intelligent-assignment/industries');
      if (industriesResponse.ok) {
        const industriesData = await industriesResponse.json();
        setIndustries(industriesData.industries);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching automation data:', error);
      setLoading(false);
    }
  };

  const handleStartContinuousAutomation = async () => {
    try {
      const response = await fetch('http://localhost:8012/api/v1/automation/start-continuous', {
        method: 'POST',
      });

      if (response.ok) {
        notification.success({
          message: 'Automation Started',
          description: 'Continuous automation processes have been started successfully.',
        });
        fetchAutomationData();
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to start automation processes.',
      });
    }
  };

  const handleConfigureIndustry = async (values) => {
    try {
      const configData = {
        industry: selectedIndustry,
        optimization_weights: {
          speed: parseFloat(values.speed_weight),
          quality: parseFloat(values.quality_weight),
          cost: parseFloat(values.cost_weight),
          safety: parseFloat(values.safety_weight),
          energy: parseFloat(values.energy_weight)
        },
        constraints: {
          max_workload: parseFloat(values.max_workload),
          safety_threshold: parseFloat(values.safety_threshold)
        }
      };

      const response = await fetch('http://localhost:8012/api/v1/automation/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });

      if (response.ok) {
        notification.success({
          message: 'Configuration Updated',
          description: `Industry configuration for ${selectedIndustry} has been updated successfully.`,
        });
        setConfigModal(false);
        fetchAutomationData();
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to update industry configuration.',
      });
    }
  };

  const industryColumns = [
    {
      title: 'Industry',
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RobotOutlined />
          <span>{Object.keys(industries)[index]}</span>
        </div>
      ),
    },
    {
      title: 'Optimization Focus',
      key: 'focus',
      render: (_, record, index) => {
        const industryKey = Object.keys(industries)[index];
        const weights = industries[industryKey]?.weights || {};
        const maxWeight = Math.max(...Object.values(weights));
        const focusArea = Object.keys(weights).find(key => weights[key] === maxWeight);
        
        return (
          <Tag color="blue">
            {focusArea?.replace('_', ' ').toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Configuration',
      key: 'config',
      render: (_, record, index) => (
        <Button
          size="small"
          icon={<SettingOutlined />}
          onClick={() => {
            const industryKey = Object.keys(industries)[index];
            setSelectedIndustry(industryKey);
            const config = industries[industryKey];
            form.setFieldsValue({
              speed_weight: config.weights.speed,
              quality_weight: config.weights.quality,
              cost_weight: config.weights.cost,
              safety_weight: config.weights.safety,
              energy_weight: config.weights.energy,
              max_workload: config.constraints.max_workload,
              safety_threshold: config.constraints.safety_threshold
            });
            setConfigModal(true);
          }}
        >
          Configure
        </Button>
      ),
    },
  ];

  const industryData = Object.values(industries);

  if (loading) {
    return <div>Loading automation dashboard...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThunderboltOutlined />
          Intelligent Automation Dashboard
        </h2>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          AI-powered task assignment and workflow orchestration across all industries
        </p>
      </div>

      <Alert
        message="🚀 Multi-Industry Automation Active"
        description="The system automatically assigns tasks to optimal agents using machine learning, genetic optimization, and industry-specific rules across Manufacturing, Healthcare, Finance, Retail, IoT, and Social Media."
        type="success"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Automation Metrics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Agent Utilization"
              value={Math.round((metrics?.utilization_rate || 0) * 100)}
              suffix="%"
              prefix={<RobotOutlined />}
              valueStyle={{ color: metrics?.utilization_rate > 0.8 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Workflows"
              value={metrics?.active_workflows || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Tasks"
              value={metrics?.pending_tasks || 0}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Queue Length"
              value={metrics?.queue_length || 0}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Automation Controls */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <Card title="Automation Status" size="small">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Intelligent Auto-Assignment:</span>
              <Switch
                checked={automationEnabled}
                checkedChildren="Enabled"
                unCheckedChildren="Disabled"
                onChange={(checked) => setAutomationEnabled(checked)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
              <span>Load Balancing:</span>
              <Switch
                checked={metrics?.load_balancing_enabled}
                checkedChildren="Active"
                unCheckedChildren="Inactive"
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="System Controls" size="small">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartContinuousAutomation}
              style={{ marginRight: '8px' }}
            >
              Start Continuous Automation
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setConfigModal(true)}
            >
              Configure Industries
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Average Workload Progress */}
      <Card title="System Performance" style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: '16px' }}>
              <span>Average Agent Workload</span>
              <Progress
                percent={Math.round((metrics?.average_workload || 0) * 100)}
                status={metrics?.average_workload > 0.8 ? 'exception' : 'success'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: '16px' }}>
              <span>Available Agents</span>
              <Progress
                percent={Math.round(((metrics?.available_agents || 0) / Math.max(metrics?.total_agents || 1, 1)) * 100)}
                status="success"
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Industry Configurations */}
      <Card title="Industry-Specific Configurations">
        <Table
          columns={industryColumns}
          dataSource={industryData}
          pagination={false}
          size="small"
          rowKey={(record, index) => Object.keys(industries)[index]}
        />
      </Card>

      {/* Configuration Modal */}
      <Modal
        title={`Configure ${selectedIndustry} Industry`}
        open={configModal}
        onCancel={() => setConfigModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConfigureIndustry}
        >
          <Alert
            message="Optimization Weights"
            description="Adjust the importance of different factors for task assignment in this industry. All weights should sum to 1.0."
            type="info"
            style={{ marginBottom: '16px' }}
          />
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="speed_weight" label="Speed Weight">
                <Select>
                  <Option value="0.1">0.1 - Low Priority</Option>
                  <Option value="0.2">0.2 - Medium-Low</Option>
                  <Option value="0.3">0.3 - Medium</Option>
                  <Option value="0.4">0.4 - High</Option>
                  <Option value="0.5">0.5 - Very High</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="quality_weight" label="Quality Weight">
                <Select>
                  <Option value="0.1">0.1 - Low Priority</Option>
                  <Option value="0.2">0.2 - Medium-Low</Option>
                  <Option value="0.3">0.3 - Medium</Option>
                  <Option value="0.4">0.4 - High</Option>
                  <Option value="0.5">0.5 - Very High</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="cost_weight" label="Cost Weight">
                <Select>
                  <Option value="0.1">0.1</Option>
                  <Option value="0.2">0.2</Option>
                  <Option value="0.3">0.3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="safety_weight" label="Safety Weight">
                <Select>
                  <Option value="0.1">0.1</Option>
                  <Option value="0.2">0.2</Option>
                  <Option value="0.3">0.3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="energy_weight" label="Energy Weight">
                <Select>
                  <Option value="0.05">0.05</Option>
                  <Option value="0.1">0.1</Option>
                  <Option value="0.15">0.15</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="max_workload" label="Max Agent Workload">
                <Select>
                  <Option value="0.75">75% - Conservative</Option>
                  <Option value="0.85">85% - Balanced</Option>
                  <Option value="0.95">95% - Aggressive</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="safety_threshold" label="Safety Threshold">
                <Select>
                  <Option value="0.75">75% - Standard</Option>
                  <Option value="0.85">85% - High</Option>
                  <Option value="0.95">95% - Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => setConfigModal(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Update Configuration
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AutomationDashboard;
