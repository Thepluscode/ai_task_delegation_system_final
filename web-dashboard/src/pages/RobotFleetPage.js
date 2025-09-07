import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Button, Modal, Form, Input, Select, notification, App } from 'antd';
import { RobotOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ToolOutlined, AlertOutlined } from '@ant-design/icons';

const { Option } = Select;

const RobotFleetPage = () => {
  const [fleetSummary, setFleetSummary] = useState(null);
  const [taskQueue, setTaskQueue] = useState(null);
  const [robots, setRobots] = useState([]);
  const [efficiency, setEfficiency] = useState(null);
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      // Add cache-busting parameter to force fresh data
      const timestamp = Date.now();
      const [summaryRes, queueRes, robotsRes, efficiencyRes, maintenanceRes] = await Promise.all([
        fetch(`http://localhost:8002/api/v1/fleet/summary?t=${timestamp}`),
        fetch(`http://localhost:8002/api/v1/fleet/tasks/queue?t=${timestamp}`),
        fetch(`http://localhost:8002/api/v1/robots?t=${timestamp}`),
        fetch(`http://localhost:8002/api/v1/fleet/analytics/efficiency?t=${timestamp}`),
        fetch(`http://localhost:8002/api/v1/fleet/maintenance/schedule?t=${timestamp}`)
      ]);

      // Check if all responses are ok
      if (!summaryRes.ok || !queueRes.ok || !robotsRes.ok || !efficiencyRes.ok || !maintenanceRes.ok) {
        throw new Error('One or more API requests failed');
      }

      const [summary, queue, robotsData, efficiencyData, maintenanceData] = await Promise.all([
        summaryRes.json(),
        queueRes.json(),
        robotsRes.json(),
        efficiencyRes.json(),
        maintenanceRes.json()
      ]);

      setFleetSummary(summary);
      setTaskQueue(queue);
      setRobots(robotsData.robots || []);
      setEfficiency(efficiencyData);
      setMaintenance(maintenanceData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fleet data:', error);
      notification.error({
        message: 'Connection Error',
        description: 'Failed to fetch robot fleet data. Please check if the robot service is running.',
      });
      setLoading(false);
    }
  };

  const handleCreateTask = async (values) => {
    try {
      const response = await fetch('http://localhost:8002/api/v1/fleet/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          estimated_duration: parseFloat(values.estimated_duration),
          commands: []
        }),
      });

      if (response.ok) {
        notification.success({
          message: 'Task Created',
          description: 'Robot task has been successfully added to the queue.',
        });
        setCreateTaskModal(false);
        form.resetFields();
        fetchFleetData();
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to create task. Please try again.',
      });
    }
  };

  const handleEmergencyStop = async () => {
    try {
      const response = await fetch('http://localhost:8002/api/v1/fleet/emergency-stop', {
        method: 'POST',
      });

      if (response.ok) {
        notification.warning({
          message: 'Emergency Stop Activated',
          description: 'All robots have been stopped for safety.',
        });
        fetchFleetData();
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to execute emergency stop.',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle': return 'blue';
      case 'running': return 'green';
      case 'error': return 'red';
      case 'maintenance': return 'orange';
      case 'emergency_stop': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return 'red';
      case 'safety_critical': return 'orange';
      case 'high': return 'gold';
      case 'normal': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const robotColumns = [
    {
      title: 'Robot ID',
      dataIndex: 'robot_id',
      key: 'robot_id',
      render: (text) => <span><RobotOutlined /> {text}</span>,
    },
    {
      title: 'Brand',
      dataIndex: 'brand',
      key: 'brand',
      render: (brand) => <Tag color="blue">{brand.toUpperCase()}</Tag>,
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Connection',
      dataIndex: 'is_connected',
      key: 'is_connected',
      render: (connected) => (
        <Tag color={connected ? 'green' : 'red'}>
          {connected ? 'Connected' : 'Disconnected'}
        </Tag>
      ),
    },
    {
      title: 'Capabilities',
      dataIndex: 'capabilities',
      key: 'capabilities',
      render: (capabilities) => {
        // Handle complex capability data structure with robust error handling
        let capArray = [];

        try {
          if (!capabilities) {
            return <span style={{ color: '#999' }}>No capabilities</span>;
          }

          if (Array.isArray(capabilities)) {
            capArray = capabilities;
          } else if (capabilities && typeof capabilities === 'object') {
            // Extract key capabilities from the complex object structure
            const keyCapabilities = [];

            // Check movement capabilities
            if (capabilities.movement) {
              keyCapabilities.push('Movement');
            }

            // Check sensor capabilities
            if (capabilities.sensors) {
              if (capabilities.sensors.force_feedback) keyCapabilities.push('Force Feedback');
              if (capabilities.sensors.vision_system) keyCapabilities.push('Vision');
              if (capabilities.sensors.collision_detection) keyCapabilities.push('Collision Detection');
            }

            // Check specialized tools
            if (capabilities.specialized_tools) {
              if (capabilities.specialized_tools.gripper_types?.length > 0) keyCapabilities.push('Gripper');
              if (capabilities.specialized_tools.welding_capability) keyCapabilities.push('Welding');
              if (capabilities.specialized_tools.painting_capability) keyCapabilities.push('Painting');
            }

            // Check safety features
            if (capabilities.safety_features) {
              keyCapabilities.push('Safety Systems');
            }

            // Check communication protocols
            if (capabilities.communication_protocols) {
              keyCapabilities.push('Communication');
            }

            capArray = keyCapabilities.length > 0 ? keyCapabilities : Object.keys(capabilities);
          } else if (typeof capabilities === 'string') {
            capArray = capabilities.split(',').map(s => s.trim());
          } else {
            // Fallback for any other data type
            capArray = [String(capabilities)];
          }

          // Ensure capArray is always an array
          if (!Array.isArray(capArray)) {
            capArray = [];
          }

          return (
            <div>
              {capArray.slice(0, 2).map((cap, index) => (
                <Tag key={`${cap}-${index}`} size="small" color="blue">{cap}</Tag>
              ))}
              {capArray.length > 2 && <Tag size="small" color="geekblue">+{capArray.length - 2} more</Tag>}
              {capArray.length === 0 && <span style={{ color: '#999' }}>No capabilities</span>}
            </div>
          );
        } catch (error) {
          console.error('Error rendering capabilities:', error, capabilities);
          return <span style={{ color: '#ff4d4f' }}>Error loading capabilities</span>;
        }
      },
    },
  ];

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading fleet data...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🤖 Robot Fleet Management</h1>
        <div>
          <Button 
            type="primary" 
            onClick={() => setCreateTaskModal(true)}
            style={{ marginRight: '10px' }}
          >
            Create Task
          </Button>
          <Button 
            danger 
            onClick={handleEmergencyStop}
            icon={<StopOutlined />}
          >
            Emergency Stop All
          </Button>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Robots"
              value={fleetSummary?.total_robots || 0}
              prefix={<RobotOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Robots"
              value={fleetSummary?.active_robots || 0}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Idle Robots"
              value={fleetSummary?.idle_robots || 0}
              prefix={<PauseCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Error/Maintenance"
              value={(fleetSummary?.error_robots || 0) + (fleetSummary?.maintenance_robots || 0)}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <Card title="Fleet Performance" extra={<ToolOutlined />}>
            <div style={{ marginBottom: '10px' }}>
              <span>Average Efficiency: </span>
              <Progress 
                percent={Math.round(fleetSummary?.average_efficiency || 0)} 
                status={fleetSummary?.average_efficiency > 80 ? 'success' : 'normal'}
              />
            </div>
            <div>
              <span>Fleet Uptime: </span>
              <Progress 
                percent={Math.round(fleetSummary?.total_uptime || 0)} 
                status={fleetSummary?.total_uptime > 90 ? 'success' : 'normal'}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Task Queue Status">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="Queued" value={taskQueue?.queued_tasks || 0} />
              </Col>
              <Col span={8}>
                <Statistic title="Active" value={taskQueue?.active_tasks || 0} />
              </Col>
              <Col span={8}>
                <Statistic title="Completed" value={taskQueue?.completed_tasks || 0} />
              </Col>
            </Row>
            <div style={{ marginTop: '10px' }}>
              <span>Priority Distribution: </span>
              {taskQueue?.queue_by_priority && Object.entries(taskQueue.queue_by_priority).map(([priority, count]) => (
                count > 0 && <Tag key={priority} color={getPriorityColor(priority)}>{priority}: {count}</Tag>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Robot Fleet Table */}
      <Card title="Robot Fleet Status" style={{ marginBottom: '20px' }}>
        <Table
          columns={robotColumns}
          dataSource={robots}
          rowKey="robot_id"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Maintenance Schedule */}
      {maintenance?.maintenance_schedule?.length > 0 && (
        <Card title="Maintenance Schedule" extra={<Tag color="orange">Attention Required</Tag>}>
          <Table
            columns={[
              { title: 'Robot ID', dataIndex: 'robot_id', key: 'robot_id' },
              { title: 'Type', dataIndex: 'maintenance_type', key: 'maintenance_type' },
              { title: 'Priority', dataIndex: 'priority', key: 'priority', render: (priority) => <Tag color={priority === 'high' ? 'red' : 'orange'}>{priority}</Tag> },
              { title: 'Recommended Date', dataIndex: 'recommended_date', key: 'recommended_date', render: (date) => new Date(date).toLocaleDateString() },
              { title: 'Reason', dataIndex: 'reason', key: 'reason' },
            ]}
            dataSource={maintenance.maintenance_schedule}
            rowKey="robot_id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Create Task Modal */}
      <Modal
        title="Create New Robot Task"
        open={createTaskModal}
        onCancel={() => setCreateTaskModal(false)}
        onOk={() => form.submit()}
        okText="Create Task"
      >
        <Form form={form} onFinish={handleCreateTask} layout="vertical">
          <Form.Item name="robot_id" label="Robot" rules={[{ required: true }]}>
            <Select placeholder="Select a robot">
              {robots.map(robot => (
                <Option key={robot.robot_id} value={robot.robot_id}>
                  {robot.robot_id} ({robot.brand})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="task_type" label="Task Type" rules={[{ required: true }]}>
            <Input placeholder="e.g., assembly, inspection, packaging" />
          </Form.Item>
          <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
            <Select>
              <Option value="emergency">Emergency</Option>
              <Option value="safety_critical">Safety Critical</Option>
              <Option value="high">High</Option>
              <Option value="normal">Normal</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item name="estimated_duration" label="Estimated Duration (seconds)" rules={[{ required: true }]}>
            <Input type="number" placeholder="120" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RobotFleetPage;
