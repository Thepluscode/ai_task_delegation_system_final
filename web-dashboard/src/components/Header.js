import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  Avatar,
  Dropdown,
  Space,
  Badge,
  Typography,
  Switch,
  Tooltip,
  notification
} from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  BulbOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';

import { websocketService } from '../services/websocketService';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = ({ user, onLogout, collapsed, setCollapsed, darkMode, toggleTheme, isMobile, mobileMenuVisible, setMobileMenuVisible }) => {
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(false);

  useEffect(() => {
    // Listen for WebSocket connection status
    websocketService.on('connection_status', (data) => {
      setConnectionStatus(data.connected);
    });

    // Listen for real-time notifications
    websocketService.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
    });

    // Check initial connection status
    setConnectionStatus(websocketService.isConnected());

    return () => {
      websocketService.off('connection_status');
      websocketService.off('notification');
    };
  }, []);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
      onClick: () => {
        // Navigate to profile page
        notification.info({
          message: 'Profile Settings',
          description: 'Profile settings page coming soon!',
        });
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
      onClick: () => {
        // Navigate to settings page
        notification.info({
          message: 'Account Settings',
          description: 'Account settings page coming soon!',
        });
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: onLogout
    },
  ];

  const notificationMenuItems = notifications.length > 0 ? [
    ...notifications.map((notif, index) => ({
      key: `notif-${index}`,
      label: (
        <div style={{ maxWidth: 250 }}>
          <Text strong>{notif.title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {notif.message}
          </Text>
        </div>
      ),
    })),
    {
      type: 'divider',
    },
    {
      key: 'clear-all',
      label: 'Clear All Notifications',
      onClick: () => setNotifications([])
    }
  ] : [
    {
      key: 'no-notifications',
      label: (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">No new notifications</Text>
        </div>
      ),
    }
  ];

  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileMenuVisible(!mobileMenuVisible);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <AntHeader
      style={{
        padding: '0 16px',
        background: darkMode ? '#001529' : '#fff',
        borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 250),
        width: isMobile ? '100%' : (collapsed ? 'calc(100% - 80px)' : 'calc(100% - 250px)'),
        transition: 'all 0.2s',
      }}
    >
      {/* Left side - Menu toggle */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={isMobile ? <MenuUnfoldOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
          onClick={handleMenuToggle}
          style={{
            fontSize: '16px',
            width: 48,
            height: 48,
            color: darkMode ? '#fff' : '#000',
          }}
        />
        
        {/* Connection Status */}
        <Tooltip title={connectionStatus ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}>
          <Badge
            status={connectionStatus ? 'success' : 'error'}
            text={
              <Text style={{ color: darkMode ? '#fff' : '#000', fontSize: '12px' }}>
                {connectionStatus ? 'Live' : 'Offline'}
              </Text>
            }
          />
        </Tooltip>
      </div>

      {/* Right side - User controls */}
      <Space size="middle">
        {/* Theme Toggle */}
        <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <Switch
            checked={darkMode}
            onChange={toggleTheme}
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
            style={{ backgroundColor: darkMode ? '#1890ff' : '#d9d9d9' }}
          />
        </Tooltip>

        {/* Notifications */}
        <Dropdown
          menu={{ items: notificationMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={
              <Badge count={notifications.length} size="small">
                <BellOutlined style={{ color: darkMode ? '#fff' : '#000' }} />
              </Badge>
            }
            style={{ color: darkMode ? '#fff' : '#000' }}
          />
        </Dropdown>

        {/* Connection Status Icon */}
        <Tooltip title={connectionStatus ? 'Real-time connection active' : 'Real-time connection inactive'}>
          {connectionStatus ? (
            <WifiOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
          ) : (
            <DisconnectOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
          )}
        </Tooltip>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" style={{ height: 'auto', padding: '4px 8px' }}>
            <Space>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  color: darkMode ? '#fff' : '#000', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  lineHeight: 1.2 
                }}>
                  {user?.full_name || 'User'}
                </div>
                <div style={{ 
                  color: darkMode ? '#bfbfbf' : '#666', 
                  fontSize: '12px',
                  lineHeight: 1.2 
                }}>
                  {user?.role || 'User'}
                </div>
              </div>
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
