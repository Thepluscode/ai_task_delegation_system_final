import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Button, Modal, Form, Input, Select, notification, Tabs, Spin, InputNumber, DatePicker, Switch, Alert } from 'antd';
import { RobotOutlined, BulbOutlined, UserOutlined, ThunderboltOutlined, BarChartOutlined, ExperimentOutlined, SyncOutlined, DashboardOutlined, CrownOutlined, BuildOutlined } from '@ant-design/icons';
import AutomationDashboard from '../components/AutomationDashboard';
import BillionDollarDashboard from '../components/BillionDollarDashboard';
import SmartManufacturingDashboard from '../components/SmartManufacturingDashboard';

const { Option } = Select;
const { TabPane } = Tabs;

const AgentSelectionPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulationModal, setSimulationModal] = useState(false);
  const [taskAssignmentModal, setTaskAssignmentModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [form] = Form.useForm();
  const [taskForm] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, agentsRes, assignmentsRes, insightsRes] = await Promise.all([
        fetch('http://localhost:8001/api/v1/dashboard/summary'),
        fetch('http://localhost:8001/api/v1/agents'),
        fetch('http://localhost:8001/api/v1/assignments'),
        fetch('http://localhost:8001/api/v1/analytics/insights')
      ]);

      const [dashboard, agentsData, assignmentsData, insightsData] = await Promise.all([
        dashboardRes.json(),
        agentsRes.json(),
        assignmentsRes.json(),
        insightsRes.json()
      ]);

      setDashboardData(dashboard);
      setAgents(agentsData.agents || []);
      setAssignments(assignmentsData.assignments || []);
      setInsights(insightsData.insights || {});
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      notification.error({
        message: 'Connection Error',
        description: 'Failed to fetch agent selection data. Please check if the service is running.',
      });
      setLoading(false);
    }
  };

  const handleRunSimulation = async (values) => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/simulation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_type: values.scenario_type,
          custom_params: values.custom_params ? JSON.parse(values.custom_params) : null,
          include_current_tasks: values.include_current_tasks
        }),
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'Simulation Complete',
          description: `Simulation completed with ${result.simulation_result.successful_assignments} successful assignments.`,
        });
        setSimulationModal(false);
        form.resetFields();
        fetchDashboardData();
      } else {
        throw new Error('Failed to run simulation');
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to run simulation. Please try again.',
      });
    }
  };

  const handleSyncSystems = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/integration/sync', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        notification.success({
          message: 'Systems Synced',
          description: `Synced ${result.total_agents_registered} agents from external systems.`,
        });
        fetchDashboardData();
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to sync external systems.',
      });
    }
  };

  const handleAssignTask = async (values) => {
    try {
      const taskData = {
        task_id: `task_${Date.now()}`,
        task_type: values.task_type,
        priority: values.priority,
        complexity: parseFloat(values.complexity),
        estimated_duration: parseInt(values.estimated_duration),
        quality_requirements: parseFloat(values.quality_requirements),
        safety_requirements: parseFloat(values.safety_requirements),
        deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
        location: values.location || 'default',
        industry: values.industry || 'manufacturing',
        auto_assign: values.auto_assign !== false,
        parameters: values.parameters ? JSON.parse(values.parameters) : null
      };

      // Use intelligent automation service
      const response = await fetch('http://localhost:8012/api/v1/automation/submit-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.status === 'success') {
          notification.success({
            message: 'Task Intelligently Assigned',
            description: `Task automatically assigned to ${result.assignment?.agent_id || 'optimal agent'} with ${Math.round((result.assignment?.confidence_score || 0) * 100)}% confidence using AI optimization.`,
          });
        } else if (result.status === 'queued') {
          notification.info({
            message: 'Task Queued',
            description: 'Task queued for intelligent assignment. The system will find the optimal agent automatically.',
          });
        }

        setTaskAssignmentModal(false);
        setSelectedAgent(null);
        taskForm.resetFields();
        fetchDashboardData();
      } else {
        throw new Error('Failed to assign task');
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to assign task. Please try again.',
      });
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setTaskAssignmentModal(true);
  };

  const getAgentTypeIcon = (agentType) => {
    switch (agentType) {
      case 'robot': return <RobotOutlined />;
      case 'ai_system': return <BulbOutlined />;
      case 'human': return <UserOutlined />;
      case 'hybrid': return <ThunderboltOutlined />;
      default: return <UserOutlined />;
    }
  };

  const getAgentTypeColor = (agentType) => {
    switch (agentType) {
      case 'robot': return 'blue';
      case 'ai_system': return 'purple';
      case 'human': return 'green';
      case 'hybrid': return 'orange';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'green';
      case 'busy': return 'orange';
      case 'maintenance': return 'red';
      case 'offline': return 'gray';
      default: return 'default';
    }
  };

  const agentColumns = [
    {
      title: 'Agent ID',
      dataIndex: 'agent_id',
      key: 'agent_id',
      render: (text, record) => (
        <span>
          {getAgentTypeIcon(record.agent_type)} {text}
        </span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'agent_type',
      key: 'agent_type',
      render: (type) => <Tag color={getAgentTypeColor(type)}>{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Capabilities',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities) => {
        const capArray = Object.keys(capabilities || {});
        return (
          <div>
            {capArray.slice(0, 2).map(cap => (
              <Tag key={cap} size="small" color="blue">{cap.replace(/_/g, ' ')}</Tag>
            ))}
            {capArray.length > 2 && <Tag size="small" color="geekblue">+{capArray.length - 2} more</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Workload',
      dataIndex: 'current_workload',
      key: 'current_workload',
      render: (workload) => (
        <Progress
          percent={Math.round(workload * 100)}
          size="small"
          status={workload > 0.8 ? 'exception' : workload > 0.6 ? 'active' : 'success'}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleAgentSelect(record)}
          disabled={record.status !== 'AVAILABLE'}
        >
          Assign Task
        </Button>
      ),
    },
  ];

  const assignmentColumns = [
    {
      title: 'Assignment ID',
      dataIndex: 'assignment_id',
      key: 'assignment_id',
      render: (text) => text.substring(0, 8) + '...',
    },
    {
      title: 'Task Type',
      dataIndex: 'task_type',
      key: 'task_type',
      render: (type) => <Tag color="cyan">{type.replace(/_/g, ' ')}</Tag>,
    },
    {
      title: 'Agent',
      dataIndex: 'agent_id',
      key: 'agent_id',
    },
    {
      title: 'Priority',
      dataIndex: 'task_priority',
      key: 'task_priority',
      render: (priority) => {
        const color = priority === 'safety_critical' ? 'red' : 
                     priority === 'quality_critical' ? 'orange' : 
                     priority === 'efficiency_critical' ? 'gold' : 'blue';
        return <Tag color={color}>{priority.replace(/_/g, ' ')}</Tag>;
      },
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence_score',
      key: 'confidence_score',
      render: (score) => (
        <Progress 
          percent={Math.round(score * 100)} 
          size="small"
          status={score > 0.8 ? 'success' : score > 0.6 ? 'active' : 'exception'}
        />
      ),
    },
    {
      title: 'Quality Prediction',
      dataIndex: 'quality_prediction',
      key: 'quality_prediction',
      render: (quality) => `${Math.round(quality * 100)}%`,
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Loading AI Decision Engine data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🧠 AI Decision Engine - Agent Selection</h1>
        <div>
          <Button 
            type="primary" 
            onClick={() => setSimulationModal(true)}
            style={{ marginRight: '10px' }}
            icon={<ExperimentOutlined />}
          >
            Run Simulation
          </Button>
          <Button 
            onClick={handleSyncSystems}
            style={{ marginRight: '10px' }}
            icon={<SyncOutlined />}
          >
            Sync Systems
          </Button>
          <Button
            type="default"
            onClick={() => notification.info({ message: 'Genetic Optimization', description: 'Feature coming soon!' })}
            icon={<BarChartOutlined />}
            style={{ marginRight: '10px' }}
          >
            Genetic Optimization
          </Button>
          <Button
            type="primary"
            icon={<DashboardOutlined />}
            onClick={() => {
              setSelectedAgent(null);
              setTaskAssignmentModal(true);
            }}
          >
            Quick Assign Task
          </Button>
        </div>
      </div>

      <Tabs defaultActiveKey="overview" type="card">
        <TabPane tab={<span><DashboardOutlined />Overview</span>} key="overview">
          {/* System Overview Cards */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Agents"
                  value={dashboardData?.system_overview?.total_agents || 0}
                  prefix={<RobotOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Available Agents"
                  value={dashboardData?.system_overview?.available_agents || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active Assignments"
                  value={dashboardData?.system_overview?.active_assignments || 0}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Success Rate"
                  value={Math.round((insights?.success_rate || 0) * 100)}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: insights?.success_rate > 0.8 ? '#3f8600' : '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Performance Metrics */}
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={12}>
              <Card title="AI Performance Metrics" extra={<BulbOutlined />}>
                <div style={{ marginBottom: '10px' }}>
                  <span>Duration Accuracy: </span>
                  <Progress 
                    percent={Math.round((insights?.average_duration_accuracy || 0) * 100)} 
                    status={insights?.average_duration_accuracy > 0.8 ? 'success' : 'normal'}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span>Quality Accuracy: </span>
                  <Progress 
                    percent={Math.round((insights?.average_quality_accuracy || 0) * 100)} 
                    status={insights?.average_quality_accuracy > 0.8 ? 'success' : 'normal'}
                  />
                </div>
                <div>
                  <span>ML Models Active: </span>
                  <Tag color="purple">{dashboardData?.ml_models_status?.available_models?.length || 0} models</Tag>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="System Integration Status">
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic 
                      title="Robot Agents" 
                      value={dashboardData?.integration_status?.robot_agents || 0} 
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="IoT Agents" 
                      value={dashboardData?.integration_status?.iot_agents || 0} 
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic 
                      title="Training Data" 
                      value={dashboardData?.ml_models_status?.training_data_points || 0} 
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: '10px' }}>
                  <span>System Status: </span>
                  <Tag color="green">OPERATIONAL</Tag>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Recommendations */}
          {insights?.recommendations?.length > 0 && (
            <Card title="AI Recommendations" style={{ marginBottom: '20px' }}>
              {insights.recommendations.map((rec, index) => (
                <Tag key={index} color="orange" style={{ margin: '4px' }}>{rec}</Tag>
              ))}
            </Card>
          )}
        </TabPane>

        <TabPane tab={<span><RobotOutlined />Agents</span>} key="agents">
          <Card title="Registered Agents" style={{ marginBottom: '20px' }}>
            <Table
              columns={agentColumns}
              dataSource={agents}
              rowKey="agent_id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><ThunderboltOutlined />Assignments</span>} key="assignments">
          <Card title="Active Assignments" style={{ marginBottom: '20px' }}>
            <Table
              columns={assignmentColumns}
              dataSource={assignments}
              rowKey="assignment_id"
              pagination={{ pageSize: 10 }}
              size="middle"
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><ThunderboltOutlined />Intelligent Automation</span>} key="automation">
          <AutomationDashboard />
        </TabPane>

        <TabPane tab={<span><CrownOutlined />Enterprise Platform</span>} key="enterprise">
          <BillionDollarDashboard />
        </TabPane>

        <TabPane tab={<span><BuildOutlined />Smart Manufacturing 4.0</span>} key="manufacturing">
          <SmartManufacturingDashboard />
        </TabPane>
      </Tabs>

      {/* Simulation Modal */}
      <Modal
        title="Run What-If Simulation"
        open={simulationModal}
        onCancel={() => setSimulationModal(false)}
        onOk={() => form.submit()}
        okText="Run Simulation"
      >
        <Form form={form} onFinish={handleRunSimulation} layout="vertical">
          <Form.Item name="scenario_type" label="Scenario Type" rules={[{ required: true }]}>
            <Select placeholder="Select scenario type">
              <Option value="normal">Normal Operations</Option>
              <Option value="high_load">High Load</Option>
              <Option value="agent_failure">Agent Failure</Option>
              <Option value="rush_orders">Rush Orders</Option>
              <Option value="maintenance_window">Maintenance Window</Option>
            </Select>
          </Form.Item>
          <Form.Item name="include_current_tasks" label="Include Current Tasks" valuePropName="checked">
            <input type="checkbox" defaultChecked />
          </Form.Item>
          <Form.Item name="custom_params" label="Custom Parameters (JSON)">
            <Input.TextArea 
              placeholder='{"task_multiplier": 2.0, "agent_availability": 0.8}' 
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Task Assignment Modal */}
      <Modal
        title={selectedAgent ? `Assign Task to ${selectedAgent.name}` : 'Assign Task (Auto-Select Agent)'}
        open={taskAssignmentModal}
        onCancel={() => {
          setTaskAssignmentModal(false);
          setSelectedAgent(null);
          taskForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedAgent && (
          <div style={{
            background: '#f0f2f5',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Tag color={selectedAgent.type === 'ROBOT' ? 'blue' : selectedAgent.type === 'HUMAN' ? 'green' : 'purple'}>
              {selectedAgent.type}
            </Tag>
            <span><strong>{selectedAgent.name}</strong> - {selectedAgent.agent_id}</span>
            <Tag color={selectedAgent.status === 'AVAILABLE' ? 'green' : 'orange'}>
              {selectedAgent.status}
            </Tag>
          </div>
        )}

        <Alert
          message="🤖 Intelligent Auto-Assignment"
          description="This system uses advanced AI and machine learning to automatically assign tasks to the optimal agents across all industries. The system considers agent capabilities, workload, performance history, and industry-specific optimization factors."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />

        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleAssignTask}
          initialValues={{
            auto_assign: true,
            industry: 'manufacturing'
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="industry"
                label="Industry"
                rules={[{ required: true, message: 'Please select industry' }]}
                initialValue="manufacturing"
              >
                <Select placeholder="Select industry">
                  <Option value="manufacturing">Manufacturing</Option>
                  <Option value="healthcare">Healthcare</Option>
                  <Option value="finance">Finance</Option>
                  <Option value="retail">Retail</Option>
                  <Option value="iot">IoT</Option>
                  <Option value="social_media">Social Media</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="task_type"
                label="Task Type"
                rules={[{ required: true, message: 'Please select task type' }]}
              >
                <Select placeholder="Select task type">
                  <Option value="precision_assembly">Precision Assembly</Option>
                  <Option value="quality_inspection">Quality Inspection</Option>
                  <Option value="material_handling">Material Handling</Option>
                  <Option value="data_analysis">Data Analysis</Option>
                  <Option value="creative_problem_solving">Creative Problem Solving</Option>
                  <Option value="pattern_recognition">Pattern Recognition</Option>
                  <Option value="repetitive_tasks">Repetitive Tasks</Option>
                  <Option value="patient_care">Patient Care</Option>
                  <Option value="trading_analysis">Trading Analysis</Option>
                  <Option value="customer_service">Customer Service</Option>
                  <Option value="device_monitoring">Device Monitoring</Option>
                  <Option value="content_moderation">Content Moderation</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="LOW">Low</Option>
                  <Option value="MEDIUM">Medium</Option>
                  <Option value="HIGH">High</Option>
                  <Option value="CRITICAL">Critical</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="complexity"
                label="Complexity (0-1)"
                rules={[{ required: true, message: 'Please enter complexity' }]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  placeholder="0.5"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="estimated_duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <InputNumber
                  min={1}
                  placeholder="60"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="location"
                label="Location"
              >
                <Input placeholder="default" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quality_requirements"
                label="Quality Requirements (0-1)"
                rules={[{ required: true, message: 'Please enter quality requirements' }]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  placeholder="0.8"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="safety_requirements"
                label="Safety Requirements (0-1)"
                rules={[{ required: true, message: 'Please enter safety requirements' }]}
              >
                <InputNumber
                  min={0}
                  max={1}
                  step={0.1}
                  placeholder="0.9"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="deadline"
            label="Deadline (Optional)"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Select deadline"
            />
          </Form.Item>

          <Form.Item
            name="parameters"
            label="Additional Parameters (JSON, Optional)"
          >
            <Input.TextArea
              rows={3}
              placeholder='{"key": "value"}'
            />
          </Form.Item>

          <Form.Item
            name="auto_assign"
            label="Intelligent Auto-Assignment"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="AI Enabled"
              unCheckedChildren="Manual"
              defaultChecked={true}
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setTaskAssignmentModal(false);
                setSelectedAgent(null);
                taskForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Assign Task
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AgentSelectionPage;
