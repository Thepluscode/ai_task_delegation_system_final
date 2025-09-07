'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Bot, // Using Bot instead of Robot
  Play,
  Pause,
  Square,
  RotateCcw,
  Zap,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Target,
  Move,
  Wrench,
  Shield,
  Activity,
  Gauge,
  MapPin,
  Camera,
  Cpu,
  Battery
} from 'lucide-react';

const ROBOT_TYPES = {
  UR5E: 'Universal Robots UR5e',
  ABB_IRB: 'ABB IRB 6700',
  KUKA_KR: 'KUKA KR AGILUS',
  FANUC_LR: 'Fanuc LR Mate 200iD',
  BOSTON_SPOT: 'Boston Dynamics Spot'
};

const ROBOT_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  ERROR: 'error',
  MAINTENANCE: 'maintenance'
};

export default function RobotControlDashboard() {
  const [robots, setRobots] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [robotStatus, setRobotStatus] = useState({
    status: 'offline',
    position: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
    safety_violations: [],
    mode: 'manual'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [manualControl, setManualControl] = useState(false);

  // Robot control state
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
  const [speed, setSpeed] = useState(50);
  const [acceleration, setAcceleration] = useState(50);
  const [payload, setPayload] = useState(0);

  // Fetch robots
  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await fetch('http://localhost:8004/api/v1/robots');
        const data = await response.json();

        // Transform API data to match expected format
        const transformedRobots = (data.robots || []).map(robot => ({
          id: robot.robot_id,
          name: robot.robot_id, // Use robot_id as name if no name provided
          type: robot.robot_type,
          status: robot.status,
          capabilities: robot.capabilities || [],
          last_heartbeat: robot.last_heartbeat
        }));

        setRobots(transformedRobots);
        if (transformedRobots.length > 0) {
          setSelectedRobot(transformedRobots[0]);
        }
      } catch (error) {
        console.error('Error fetching robots:', error);
        // Set demo robots if service is not available
        const demoRobots = [
          {
            id: 'ur5e_001',
            name: 'UR5e Assembly Robot',
            type: 'Universal Robots UR5e',
            status: 'online'
          },
          {
            id: 'abb_irb120_001',
            name: 'ABB IRB120 Precision Robot',
            type: 'ABB IRB 1200',
            status: 'online'
          }
        ];
        setRobots(demoRobots);
        setSelectedRobot(demoRobots[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRobots();
  }, []);

  // Fetch robot status
  useEffect(() => {
    if (!selectedRobot) return;

    const fetchRobotStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8004/api/v1/robots/${selectedRobot.id}/status`);
        const data = await response.json();

        // Extract the actual status object from the nested response
        const actualStatus = data.status || data;
        setRobotStatus({
          status: actualStatus.status || 'offline',
          position: actualStatus.position || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
          joint_angles: actualStatus.joint_angles || [],
          tool_status: actualStatus.tool_status || {},
          error_codes: actualStatus.error_codes || [],
          last_updated: actualStatus.last_updated,
          safety_violations: actualStatus.safety_violations || [],
          mode: actualStatus.mode || 'manual',
          speed: actualStatus.speed || 0,
          cpu_usage: actualStatus.cpu_usage || 0,
          battery: actualStatus.battery || 100,
          payload: actualStatus.payload || 0
        });

        // Handle position data - convert array to object if needed
        if (actualStatus.position) {
          if (Array.isArray(actualStatus.position) && actualStatus.position.length >= 6) {
            setPosition({
              x: actualStatus.position[0] * 1000, // Convert to mm
              y: actualStatus.position[1] * 1000,
              z: actualStatus.position[2] * 1000,
              rx: actualStatus.position[3] * 180 / Math.PI, // Convert to degrees
              ry: actualStatus.position[4] * 180 / Math.PI,
              rz: actualStatus.position[5] * 180 / Math.PI
            });
          } else if (typeof actualStatus.position === 'object') {
            setPosition(actualStatus.position);
          }
        }
      } catch (error) {
        console.error('Error fetching robot status:', error);
      }
    };

    fetchRobotStatus();
    const interval = setInterval(fetchRobotStatus, 1000); // Update every second

    return () => clearInterval(interval);
  }, [selectedRobot]);

  // Robot control functions
  const sendCommand = async (command, parameters = {}) => {
    if (!selectedRobot) return;

    try {
      const response = await fetch(`http://localhost:8004/api/v1/robots/${selectedRobot.id}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          parameters,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Command failed');
      }

      const result = await response.json();
      console.log('Command result:', result);
    } catch (error) {
      console.error('Error sending command:', error);
      alert('Error sending command to robot');
    }
  };

  const handleEmergencyStop = async () => {
    setEmergencyStop(true);
    await sendCommand('emergency_stop');
    setTimeout(() => setEmergencyStop(false), 3000);
  };

  const handleStart = () => sendCommand('start');
  const handlePause = () => sendCommand('pause');
  const handleStop = () => sendCommand('stop');
  const handleReset = () => sendCommand('reset');

  const handleMoveToPosition = () => {
    sendCommand('move_to_position', {
      position,
      speed: speed / 100,
      acceleration: acceleration / 100
    });
  };

  const handleJogMove = (axis, direction) => {
    const jogDistance = 10; // mm
    const newPosition = { ...position };
    newPosition[axis] += direction * jogDistance;
    setPosition(newPosition);
    
    sendCommand('jog_move', {
      axis,
      distance: direction * jogDistance,
      speed: speed / 100
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case ROBOT_STATUS.ONLINE: return 'text-green-600 bg-green-100';
      case ROBOT_STATUS.BUSY: return 'text-blue-600 bg-blue-100';
      case ROBOT_STATUS.ERROR: return 'text-red-600 bg-red-100';
      case ROBOT_STATUS.MAINTENANCE: return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ROBOT_STATUS.ONLINE: return <CheckCircle className="h-4 w-4" />;
      case ROBOT_STATUS.BUSY: return <Activity className="h-4 w-4" />;
      case ROBOT_STATUS.ERROR: return <AlertTriangle className="h-4 w-4" />;
      case ROBOT_STATUS.MAINTENANCE: return <Wrench className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading robot control dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Robot Control Dashboard</h1>
          <p className="text-gray-600">Real-time robot monitoring and control</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant={emergencyStop ? "destructive" : "outline"}
            size="lg"
            onClick={handleEmergencyStop}
            disabled={emergencyStop}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Shield className="h-5 w-5 mr-2" />
            {emergencyStop ? 'STOPPING...' : 'EMERGENCY STOP'}
          </Button>
        </div>
      </div>

      {/* Robot Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Robot Fleet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {robots.map((robot, index) => (
              <Card
                key={robot.id || robot.robot_id || `robot-${index}`}
                className={`cursor-pointer transition-all ${
                  selectedRobot?.id === robot.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRobot(robot)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{robot.name}</h3>
                    <Badge className={getStatusColor(robot.status)}>
                      {getStatusIcon(robot.status)}
                      <span className="ml-1">{robot.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{robot.type}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {robot.id}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedRobot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Robot Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Robot Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={getStatusColor(robotStatus.status)}>
                    {getStatusIcon(robotStatus.status)}
                    <span className="ml-1">{robotStatus.status || 'Unknown'}</span>
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Mode</p>
                  <p className="text-lg font-bold">{robotStatus.mode || 'Auto'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Speed</p>
                  <p className="text-lg font-bold">{robotStatus.speed || 0}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Load</p>
                  <p className="text-lg font-bold">{robotStatus.payload || 0} kg</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">CPU Usage</span>
                  <span className="text-sm">{robotStatus.cpu_usage || 0}%</span>
                </div>
                <Progress value={robotStatus.cpu_usage || 0} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Battery</span>
                  <span className="text-sm">{robotStatus.battery || 100}%</span>
                </div>
                <Progress value={robotStatus.battery || 100} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Last Update</p>
                <p className="text-xs text-gray-500">
                  {robotStatus.last_updated ? new Date(robotStatus.last_updated).toLocaleString() : 'Never'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Robot Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Robot Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Controls */}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleStart} disabled={robotStatus.status === ROBOT_STATUS.BUSY}>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
                <button onClick={handlePause} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </button>
                <button onClick={handleStop} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </button>
                <button onClick={handleReset} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
              </div>

              {/* Manual Control Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={manualControl}
                  onCheckedChange={setManualControl}
                />
                <Label>Manual Control Mode</Label>
              </div>

              {/* Speed and Acceleration */}
              <div className="space-y-4">
                <div>
                  <Label>Speed: {speed}%</Label>
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    max={100}
                    step={1}
                    disabled={!manualControl}
                  />
                </div>
                <div>
                  <Label>Acceleration: {acceleration}%</Label>
                  <Slider
                    value={[acceleration]}
                    onValueChange={(value) => setAcceleration(value[0])}
                    max={100}
                    step={1}
                    disabled={!manualControl}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Position Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Position */}
              <div>
                <p className="text-sm font-medium mb-2">Current Position</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">X</p>
                    <p className="font-mono">{position.x.toFixed(1)} mm</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Y</p>
                    <p className="font-mono">{position.y.toFixed(1)} mm</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Z</p>
                    <p className="font-mono">{position.z.toFixed(1)} mm</p>
                  </div>
                  <div>
                    <p className="text-gray-500">RX</p>
                    <p className="font-mono">{position.rx.toFixed(1)}°</p>
                  </div>
                  <div>
                    <p className="text-gray-500">RY</p>
                    <p className="font-mono">{position.ry.toFixed(1)}°</p>
                  </div>
                  <div>
                    <p className="text-gray-500">RZ</p>
                    <p className="font-mono">{position.rz.toFixed(1)}°</p>
                  </div>
                </div>
              </div>

              {/* Jog Controls */}
              {manualControl && (
                <div>
                  <p className="text-sm font-medium mb-2">Jog Control</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['x', 'y', 'z'].map((axis) => (
                      <div key={axis} className="text-center">
                        <p className="text-xs text-gray-500 mb-1">{axis.toUpperCase()}</p>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleJogMove(axis, 1)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleJogMove(axis, -1)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Move to Position */}
              <div className="space-y-2">
                <Button
                  onClick={handleMoveToPosition}
                  disabled={!manualControl}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Move to Position
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Safety Alerts */}
      {robotStatus.safety_violations && Array.isArray(robotStatus.safety_violations) && robotStatus.safety_violations.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Safety Violations Detected</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside">
              {robotStatus.safety_violations.map((violation, index) => (
                <li key={`violation-${index}`}>{violation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
