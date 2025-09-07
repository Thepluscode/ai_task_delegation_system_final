import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme, notification } from 'antd';
import {
  MonitorOutlined,
  RobotOutlined,
  BankOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  WifiOutlined
} from '@ant-design/icons';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';

// Pages
import Dashboard from './pages/Dashboard';
import ServicesPage from './pages/ServicesPage';
import TasksPage from './pages/TasksPage';
import UsersPage from './pages/UsersPage';
import DatabasePage from './pages/DatabasePage';
import MonitoringPage from './pages/MonitoringPage';
import SettingsPage from './pages/SettingsPage';

// Service Pages
import ServicesOverviewPage from './pages/services/ServicesOverviewPage';
import AuthServicePage from './pages/services/AuthServicePage';
import DatabaseServicePage from './pages/services/DatabaseServicePage';
import TradingServicePage from './pages/services/TradingServicePage';
import GenericServicePage from './pages/services/GenericServicePage';
import IoTServicePage from './pages/services/IoTServicePage';
import RetailServicePage from './pages/services/RetailServicePage';
import HealthcareServicePage from './pages/services/HealthcareServicePage';
import BankingServicePage from './pages/services/BankingServicePage';
import AILearningServicePage from './pages/services/AILearningServicePage';
import MonitoringServicePage from './pages/services/MonitoringServicePage';
import RobotFleetPage from './pages/RobotFleetPage';
import AgentSelectionPage from './pages/AgentSelectionPage';

// Analytics Pages
import PerformancePage from './pages/analytics/PerformancePage';
import UsagePage from './pages/analytics/UsagePage';
import ReportsPage from './pages/analytics/ReportsPage';

// Services
import { authService } from './services/authService';
import { websocketService } from './services/websocketService';

const { Content } = Layout;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    checkAuthStatus();

    // Initialize WebSocket connection
    websocketService.connect();

    // Setup notification listeners
    websocketService.on('notification', (data) => {
      notification[data.type]({
        message: data.title,
        description: data.message,
        duration: 4.5,
      });
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // Auto-collapse sidebar on mobile
      if (mobile) {
        setCollapsed(true);
        setMobileMenuVisible(false);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData = await authService.verifyToken(token);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('auth_token', response.access_token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      notification.success({
        message: 'Login Successful',
        description: `Welcome back, ${response.user.full_name}!`,
      });
      
      return true;
    } catch (error) {
      notification.error({
        message: 'Login Failed',
        description: error.message || 'Invalid credentials',
      });
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setIsAuthenticated(false);
    websocketService.disconnect();
    
    notification.info({
      message: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Enterprise Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <LoginPage onLogin={handleLogin} darkMode={darkMode} toggleTheme={toggleTheme} />
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar
            collapsed={collapsed}
            darkMode={darkMode}
            isMobile={isMobile}
            mobileMenuVisible={mobileMenuVisible}
            setMobileMenuVisible={setMobileMenuVisible}
          />

          <Layout className={`site-layout ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
            <Header
              user={user}
              onLogout={handleLogout}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
              isMobile={isMobile}
              mobileMenuVisible={mobileMenuVisible}
              setMobileMenuVisible={setMobileMenuVisible}
            />
            
            <Content
              className="site-layout-content"
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: 280,
                background: darkMode ? '#141414' : '#fff',
                borderRadius: 6,
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/services" element={<ServicesPage />} />

                {/* Service Routes */}
                <Route path="/services/overview" element={<ServicesOverviewPage />} />
                <Route path="/services/auth" element={<AuthServicePage />} />
                <Route path="/services/database" element={<DatabaseServicePage />} />
                <Route path="/services/monitoring" element={<MonitoringServicePage />} />
                <Route path="/services/learning" element={<AILearningServicePage />} />
                <Route path="/services/trading" element={<TradingServicePage />} />
                <Route path="/services/banking" element={<BankingServicePage />} />
                <Route path="/services/healthcare" element={<HealthcareServicePage />} />
                <Route path="/services/retail" element={<RetailServicePage />} />
                <Route path="/services/iot" element={<IoTServicePage />} />

                {/* Robot Fleet Management */}
                <Route path="/robots" element={<RobotFleetPage />} />

                {/* AI Agent Selection */}
                <Route path="/agents" element={<AgentSelectionPage />} />

                {/* Analytics Routes */}
                <Route path="/analytics/performance" element={<PerformancePage />} />
                <Route path="/analytics/usage" element={<UsagePage />} />
                <Route path="/analytics/reports" element={<ReportsPage />} />

                {/* Other Routes */}
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/users" element={<UsersPage user={user} />} />
                <Route path="/database" element={<DatabasePage />} />
                <Route path="/monitoring" element={<MonitoringPage />} />
                <Route path="/settings" element={<SettingsPage user={user} />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
