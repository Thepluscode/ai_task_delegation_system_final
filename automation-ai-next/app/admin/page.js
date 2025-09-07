'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Key,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  FileText,
  BarChart3,
  Zap,
  RefreshCw
} from 'lucide-react';

const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
  ROBOT: 'robot',
  SYSTEM: 'system'
};

export default function SystemAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [securityMetrics, setSecurityMetrics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: USER_ROLES.VIEWER
  });

  // Fetch system data
  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchServices(),
          fetchAuditLogs(),
          fetchSystemMetrics(),
          fetchSecurityMetrics()
        ]);
      } catch (error) {
        console.error('Error fetching system data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemData();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8007/api/v1/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/services');
      const data = await response.json();
      setServices(data.services || {});
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('http://localhost:8007/api/v1/audit/events?limit=50');
      const data = await response.json();
      setAuditLogs(data.events || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8008/api/v1/analytics/dashboard');
      const data = await response.json();
      setSystemMetrics(data);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8007/api/v1/security/metrics');
      const data = await response.json();
      setSecurityMetrics(data);
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('http://localhost:8007/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        await fetchUsers();
        setShowCreateUser(false);
        setNewUser({ username: '', email: '', password: '', role: USER_ROLES.VIEWER });
        alert('User created successfully!');
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'bg-red-100 text-red-800';
      case USER_ROLES.OPERATOR: return 'bg-blue-100 text-blue-800';
      case USER_ROLES.VIEWER: return 'bg-green-100 text-green-800';
      case USER_ROLES.ROBOT: return 'bg-purple-100 text-purple-800';
      case USER_ROLES.SYSTEM: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading system administration dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          <p className="text-gray-600">Manage users, services, and system configuration</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => {
            fetchUsers();
            fetchServices();
            fetchAuditLogs();
            fetchSystemMetrics();
            fetchSecurityMetrics();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(services).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.values(services).filter(s => s.status === 'healthy').length} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {securityMetrics.authentication_stats?.login_success_rate ? 
                (securityMetrics.authentication_stats.login_success_rate * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Login success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityMetrics.security_metrics?.active_sessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Current sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="services">Service Status</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system with appropriate permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(USER_ROLES).map(role => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createUser} className="w-full">
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                              <Edit className="h-3 w-3" />
                            </button>
                            <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                              {user.is_active ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <h2 className="text-xl font-semibold">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(services).map(([serviceName, serviceData]) => (
              <Card key={serviceName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{serviceName}</span>
                    <Badge className={getStatusColor(serviceData.status)}>
                      {getStatusIcon(serviceData.status)}
                      <span className="ml-1">{serviceData.status}</span>
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Response Time</p>
                      <p className="text-lg font-bold">{serviceData.response_time_ms?.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-lg font-bold">{serviceData.uptime_percentage?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Error Rate</p>
                      <p className="text-lg font-bold">{serviceData.error_rate?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Throughput</p>
                      <p className="text-lg font-bold">{serviceData.throughput?.toFixed(1)} rps</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Last check: {new Date(serviceData.last_check).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <h2 className="text-xl font-semibold">Security Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span>{(securityMetrics.authentication_stats?.login_success_rate * 100)?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Logins (24h)</span>
                    <span>{securityMetrics.authentication_stats?.failed_logins_24h || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Attempts (24h)</span>
                    <span>{securityMetrics.authentication_stats?.total_login_attempts_24h || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>User Sessions</span>
                    <span>{securityMetrics.security_metrics?.active_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Robot Sessions</span>
                    <span>{securityMetrics.security_metrics?.active_robot_sessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Violations (24h)</span>
                    <span>{securityMetrics.security_metrics?.security_violations_24h || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Events</span>
                    <span>{securityMetrics.audit_trail_stats?.total_events || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption</span>
                    <span>{securityMetrics.audit_trail_stats?.encryption_enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Real-time Monitoring</span>
                    <span>{securityMetrics.audit_trail_stats?.real_time_monitoring ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <h2 className="text-xl font-semibold">Audit Logs</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resource
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.slice(0, 20).map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="outline">{log.event_type}</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user_id || 'System'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.resource}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <h2 className="text-xl font-semibold">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current</span>
                    <span>{systemMetrics.key_metrics?.['system.cpu.usage']?.current_value?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={systemMetrics.key_metrics?.['system.cpu.usage']?.current_value || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current</span>
                    <span>{systemMetrics.key_metrics?.['system.memory.usage']?.current_value?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={systemMetrics.key_metrics?.['system.memory.usage']?.current_value || 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Disk Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current</span>
                    <span>{systemMetrics.key_metrics?.['system.disk.usage']?.current_value?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={systemMetrics.key_metrics?.['system.disk.usage']?.current_value || 0} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
