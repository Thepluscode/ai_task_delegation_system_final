import React from 'react';
import { Layout, Menu, Drawer } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  CloudServerOutlined,
  UnorderedListOutlined,
  UserOutlined,
  DatabaseOutlined,
  MonitorOutlined,
  SettingOutlined,
  TrophyOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  MedicineBoxOutlined,
  WifiOutlined,
  LineChartOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar = ({ collapsed, darkMode, isMobile, mobileMenuVisible, setMobileMenuVisible }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/services',
      icon: <CloudServerOutlined />,
      label: 'Services',
      children: [
        {
          key: '/services/overview',
          icon: <CloudServerOutlined />,
          label: 'Overview',
        },
        {
          key: '/services/auth',
          icon: <UserOutlined />,
          label: 'Authentication',
        },
        {
          key: '/services/database',
          icon: <DatabaseOutlined />,
          label: 'Database',
        },
        {
          key: '/services/monitoring',
          icon: <MonitorOutlined />,
          label: 'Monitoring',
        },
        {
          key: '/services/learning',
          icon: <RobotOutlined />,
          label: 'AI Learning',
        },
        {
          key: '/services/trading',
          icon: <LineChartOutlined />,
          label: 'Trading',
        },
        {
          key: '/services/banking',
          icon: <BankOutlined />,
          label: 'Banking',
        },
        {
          key: '/services/healthcare',
          icon: <MedicineBoxOutlined />,
          label: 'Healthcare',
        },
        {
          key: '/services/retail',
          icon: <ShoppingCartOutlined />,
          label: 'Retail',
        },
        {
          key: '/services/iot',
          icon: <WifiOutlined />,
          label: 'IoT',
        },
      ],
    },
    {
      key: '/robots',
      icon: <RobotOutlined />,
      label: 'Robot Fleet',
    },
    {
      key: '/agents',
      icon: <RobotOutlined />,
      label: 'AI Agent Selection',
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: 'Task Management',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: '/database',
      icon: <DatabaseOutlined />,
      label: 'Database Console',
    },
    {
      key: '/monitoring',
      icon: <MonitorOutlined />,
      label: 'System Monitoring',
    },
    {
      key: '/analytics',
      icon: <TrophyOutlined />,
      label: 'Analytics',
      children: [
        {
          key: '/analytics/performance',
          icon: <LineChartOutlined />,
          label: 'Performance',
        },
        {
          key: '/analytics/usage',
          icon: <TrophyOutlined />,
          label: 'Usage Stats',
        },
        {
          key: '/analytics/reports',
          icon: <DatabaseOutlined />,
          label: 'Reports',
        },
      ],
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    // Close mobile menu after navigation
    if (isMobile) {
      setMobileMenuVisible(false);
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    
    // Check for exact matches first
    if (menuItems.some(item => item.key === path)) {
      return [path];
    }
    
    // Check for submenu matches
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) {
            return [child.key];
          }
        }
      }
    }
    
    // Default to dashboard if no match
    return ['/dashboard'];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys = [];
    
    // Check which parent menus should be open
    for (const item of menuItems) {
      if (item.children) {
        for (const child of item.children) {
          if (child.key === path) {
            openKeys.push(item.key);
          }
        }
      }
    }
    
    return openKeys;
  };

  const sidebarContent = (
    <>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${darkMode ? '#303030' : '#f0f0f0'}`,
          marginBottom: 8,
        }}
      >
        {!collapsed || isMobile ? (
          <div style={{
            color: darkMode ? '#fff' : '#000',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Enterprise Platform
          </div>
        ) : (
          <div style={{
            color: darkMode ? '#fff' : '#000',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            EP
          </div>
        )}
      </div>

      <Menu
        theme={darkMode ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          borderRight: 0,
        }}
      />
    </>
  );

  // Mobile layout with Drawer
  if (isMobile) {
    return (
      <Drawer
        title={null}
        placement="left"
        closable={false}
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        bodyStyle={{ padding: 0 }}
        width={250}
        style={{
          zIndex: 1001,
        }}
      >
        <div style={{
          background: darkMode ? '#001529' : '#fff',
          height: '100%'
        }}>
          {sidebarContent}
        </div>
      </Drawer>
    );
  }

  // Desktop layout with Sider
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={darkMode ? 'dark' : 'light'}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
      width={250}
    >
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
