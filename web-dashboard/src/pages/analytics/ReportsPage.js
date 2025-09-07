import React, { useState } from 'react';
import { Card, Row, Col, Button, Table, DatePicker, Select, Space, Typography, Tag } from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('performance');

  const reports = [
    {
      key: '1',
      name: 'Performance Report',
      type: 'Performance',
      date: '2024-01-15',
      status: 'completed',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      key: '2',
      name: 'Usage Analytics',
      type: 'Usage',
      date: '2024-01-14',
      status: 'completed',
      size: '1.8 MB',
      format: 'Excel'
    },
    {
      key: '3',
      name: 'Security Audit',
      type: 'Security',
      date: '2024-01-13',
      status: 'processing',
      size: '-',
      format: 'PDF'
    },
    {
      key: '4',
      name: 'System Health',
      type: 'Health',
      date: '2024-01-12',
      status: 'completed',
      size: '3.1 MB',
      format: 'PDF'
    }
  ];

  const columns = [
    {
      title: 'Report Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <FileTextOutlined />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          Performance: 'blue',
          Usage: 'green',
          Security: 'red',
          Health: 'orange'
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'processing'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Format',
      dataIndex: 'format',
      key: 'format',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<DownloadOutlined />}
            disabled={record.status !== 'completed'}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const handleGenerateReport = () => {
    setLoading(true);
    // Simulate report generation
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <Title level={2}>Reports & Analytics</Title>
      <Text type="secondary">Generate and download system reports</Text>
      
      <Card title="Generate New Report" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Report Type</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={reportType}
              onChange={setReportType}
            >
              <Option value="performance">Performance Report</Option>
              <Option value="usage">Usage Analytics</Option>
              <Option value="security">Security Audit</Option>
              <Option value="health">System Health</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Date Range</Text>
            <RangePicker style={{ width: '100%', marginTop: 8 }} />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong>Format</Text>
            <Select style={{ width: '100%', marginTop: 8 }} defaultValue="pdf">
              <Option value="pdf">PDF</Option>
              <Option value="excel">Excel</Option>
              <Option value="csv">CSV</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginTop: 32 }}>
              <Button 
                type="primary" 
                icon={<FileTextOutlined />}
                loading={loading}
                onClick={handleGenerateReport}
                block
              >
                Generate Report
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Total Reports</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {reports.length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>This Month</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  12
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <DownloadOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Downloads</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  89
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <FilterOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <div style={{ marginTop: 8 }}>
                <Text strong>Scheduled</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>
                  5
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Recent Reports" style={{ marginTop: 24 }}>
        <Table
          columns={columns}
          dataSource={reports}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;
