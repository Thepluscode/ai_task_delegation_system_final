'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Save,
  Play,
  Pause,
  Square,
  Settings,
  Trash2,
  Copy,
  Download,
  Upload,
  Zap,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Cpu,
  Brain,
  Eye,
  Workflow
} from 'lucide-react';

// Workflow node types
const NODE_TYPES = {
  START: 'start',
  END: 'end',
  TASK: 'task',
  DECISION: 'decision',
  PARALLEL: 'parallel',
  MERGE: 'merge',
  DELAY: 'delay',
  HUMAN_APPROVAL: 'human_approval',
  ROBOT_ACTION: 'robot_action',
  AI_PROCESSING: 'ai_processing'
};

// Task types
const TASK_TYPES = {
  ASSEMBLY: 'assembly',
  INSPECTION: 'inspection',
  WELDING: 'welding',
  PAINTING: 'painting',
  PACKAGING: 'packaging',
  QUALITY_CONTROL: 'quality_control',
  MATERIAL_HANDLING: 'material_handling',
  MAINTENANCE: 'maintenance'
};

// Agent types
const AGENT_TYPES = {
  HUMAN: 'human',
  ROBOT: 'robot',
  AI_SYSTEM: 'ai_system'
};

export default function WorkflowDesigner() {
  const [workflow, setWorkflow] = useState({
    id: '',
    name: 'New Workflow',
    description: '',
    nodes: [],
    connections: [],
    variables: {},
    settings: {
      timeout: 3600,
      retryAttempts: 3,
      priority: 'normal',
      parallelExecution: false
    }
  });

  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [draggedNodeType, setDraggedNodeType] = useState(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('http://localhost:8005/api/v1/agents');
        const data = await response.json();
        setAvailableAgents(data.agents || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    fetchAgents();
  }, []);

  // Node creation
  const createNode = useCallback((type, position) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: {
        label: getNodeLabel(type),
        config: getDefaultNodeConfig(type)
      }
    };
    
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
    
    return newNode;
  }, []);

  const getNodeLabel = (type) => {
    const labels = {
      [NODE_TYPES.START]: 'Start',
      [NODE_TYPES.END]: 'End',
      [NODE_TYPES.TASK]: 'Task',
      [NODE_TYPES.DECISION]: 'Decision',
      [NODE_TYPES.PARALLEL]: 'Parallel',
      [NODE_TYPES.MERGE]: 'Merge',
      [NODE_TYPES.DELAY]: 'Delay',
      [NODE_TYPES.HUMAN_APPROVAL]: 'Human Approval',
      [NODE_TYPES.ROBOT_ACTION]: 'Robot Action',
      [NODE_TYPES.AI_PROCESSING]: 'AI Processing'
    };
    return labels[type] || 'Unknown';
  };

  const getDefaultNodeConfig = (type) => {
    const configs = {
      [NODE_TYPES.TASK]: {
        taskType: TASK_TYPES.ASSEMBLY,
        agentType: AGENT_TYPES.ROBOT,
        parameters: {},
        timeout: 300,
        retryAttempts: 2
      },
      [NODE_TYPES.DECISION]: {
        condition: '',
        branches: ['true', 'false']
      },
      [NODE_TYPES.DELAY]: {
        duration: 60,
        unit: 'seconds'
      },
      [NODE_TYPES.HUMAN_APPROVAL]: {
        approvers: [],
        timeout: 3600,
        escalation: true
      },
      [NODE_TYPES.ROBOT_ACTION]: {
        robotId: '',
        action: '',
        parameters: {},
        safetyChecks: true
      },
      [NODE_TYPES.AI_PROCESSING]: {
        model: '',
        inputData: {},
        confidence: 0.8
      }
    };
    return configs[type] || {};
  };

  // Connection creation
  const createConnection = useCallback((sourceId, targetId) => {
    const newConnection = {
      id: `conn_${Date.now()}`,
      source: sourceId,
      target: targetId,
      condition: null
    };
    
    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  }, []);

  // Node deletion
  const deleteNode = useCallback((nodeId) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(
        conn => conn.source !== nodeId && conn.target !== nodeId
      )
    }));
    setSelectedNode(null);
  }, []);

  // Save workflow
  const saveWorkflow = async () => {
    try {
      const response = await fetch('http://localhost:8003/api/v1/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow)
      });
      
      if (response.ok) {
        const savedWorkflow = await response.json();
        setWorkflow(prev => ({ ...prev, id: savedWorkflow.id }));
        alert('Workflow saved successfully!');
      } else {
        throw new Error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow');
    }
  };

  // Execute workflow
  const executeWorkflow = async () => {
    try {
      setIsRunning(true);
      const response = await fetch(`http://localhost:8003/api/v1/workflows/${workflow.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: {},
          context: {}
        })
      });
      
      if (response.ok) {
        const execution = await response.json();
        setExecutionHistory(prev => [execution, ...prev]);
        alert('Workflow execution started!');
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow');
    } finally {
      setIsRunning(false);
    }
  };

  // Canvas event handlers
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (draggedNodeType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: (e.clientX - rect.left - canvasOffset.x) / zoom,
        y: (e.clientY - rect.top - canvasOffset.y) / zoom
      };
      createNode(draggedNodeType, position);
      setDraggedNodeType(null);
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  // Node component
  const WorkflowNode = ({ node }) => {
    const getNodeIcon = (type) => {
      const icons = {
        [NODE_TYPES.START]: <Play className="h-4 w-4" />,
        [NODE_TYPES.END]: <Square className="h-4 w-4" />,
        [NODE_TYPES.TASK]: <Zap className="h-4 w-4" />,
        [NODE_TYPES.DECISION]: <GitBranch className="h-4 w-4" />,
        [NODE_TYPES.PARALLEL]: <GitBranch className="h-4 w-4" />,
        [NODE_TYPES.MERGE]: <GitBranch className="h-4 w-4" />,
        [NODE_TYPES.DELAY]: <Clock className="h-4 w-4" />,
        [NODE_TYPES.HUMAN_APPROVAL]: <Users className="h-4 w-4" />,
        [NODE_TYPES.ROBOT_ACTION]: <Cpu className="h-4 w-4" />,
        [NODE_TYPES.AI_PROCESSING]: <Brain className="h-4 w-4" />
      };
      return icons[type] || <Workflow className="h-4 w-4" />;
    };

    const getNodeColor = (type) => {
      const colors = {
        [NODE_TYPES.START]: 'bg-green-100 border-green-300',
        [NODE_TYPES.END]: 'bg-red-100 border-red-300',
        [NODE_TYPES.TASK]: 'bg-blue-100 border-blue-300',
        [NODE_TYPES.DECISION]: 'bg-yellow-100 border-yellow-300',
        [NODE_TYPES.PARALLEL]: 'bg-purple-100 border-purple-300',
        [NODE_TYPES.MERGE]: 'bg-purple-100 border-purple-300',
        [NODE_TYPES.DELAY]: 'bg-gray-100 border-gray-300',
        [NODE_TYPES.HUMAN_APPROVAL]: 'bg-orange-100 border-orange-300',
        [NODE_TYPES.ROBOT_ACTION]: 'bg-cyan-100 border-cyan-300',
        [NODE_TYPES.AI_PROCESSING]: 'bg-indigo-100 border-indigo-300'
      };
      return colors[type] || 'bg-gray-100 border-gray-300';
    };

    return (
      <div
        className={`absolute p-3 rounded-lg border-2 cursor-pointer min-w-[120px] ${getNodeColor(node.type)} ${
          selectedNode?.id === node.id ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom})`
        }}
        onClick={() => setSelectedNode(node)}
      >
        <div className="flex items-center space-x-2">
          {getNodeIcon(node.type)}
          <span className="text-sm font-medium">{node.data.label}</span>
        </div>
        {node.type === NODE_TYPES.TASK && (
          <div className="text-xs text-gray-600 mt-1">
            {node.data.config.taskType}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Workflow Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Designer</CardTitle>
              <CardDescription>Drag and drop to create workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflowName">Name</Label>
                <Input
                  id="workflowName"
                  value={workflow.name}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="workflowDescription">Description</Label>
                <Textarea
                  id="workflowDescription"
                  value={workflow.description}
                  onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Node Palette */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Node Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(NODE_TYPES).map(nodeType => (
                  <button
                    key={nodeType}
                    className="h-auto p-2 flex flex-col items-center space-y-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    draggable
                    onDragStart={() => setDraggedNodeType(nodeType)}
                  >
                    <span className="text-xs">{getNodeLabel(nodeType)}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Node Properties */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Node Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Label</Label>
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      const updatedNodes = workflow.nodes.map(node =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      );
                      setWorkflow(prev => ({ ...prev, nodes: updatedNodes }));
                      setSelectedNode(prev => ({ ...prev, data: { ...prev.data, label: e.target.value } }));
                    }}
                  />
                </div>

                {selectedNode.type === NODE_TYPES.TASK && (
                  <>
                    <div>
                      <Label>Task Type</Label>
                      <Select
                        value={selectedNode.data.config.taskType}
                        onValueChange={(value) => {
                          const updatedNodes = workflow.nodes.map(node =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, config: { ...node.data.config, taskType: value } } }
                              : node
                          );
                          setWorkflow(prev => ({ ...prev, nodes: updatedNodes }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TASK_TYPES).map(taskType => (
                            <SelectItem key={taskType} value={taskType}>
                              {taskType.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Agent Type</Label>
                      <Select
                        value={selectedNode.data.config.agentType}
                        onValueChange={(value) => {
                          const updatedNodes = workflow.nodes.map(node =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, config: { ...node.data.config, agentType: value } } }
                              : node
                          );
                          setWorkflow(prev => ({ ...prev, nodes: updatedNodes }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(AGENT_TYPES).map(agentType => (
                            <SelectItem key={agentType} value={agentType}>
                              {agentType.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteNode(selectedNode.id)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Node
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={saveWorkflow} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
              <Button 
                onClick={executeWorkflow} 
                disabled={isRunning || !workflow.id}
                className="w-full"
              >
                {isRunning ? (
                  <Pause className="h-4 w-4 mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Running...' : 'Execute'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="w-full h-full bg-white relative"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Workflow nodes */}
          {workflow.nodes.map(node => (
            <WorkflowNode key={node.id} node={node} />
          ))}

          {/* Connections would be rendered here with SVG */}
          <svg className="absolute inset-0 pointer-events-none">
            {workflow.connections.map(connection => {
              const sourceNode = workflow.nodes.find(n => n.id === connection.source);
              const targetNode = workflow.nodes.find(n => n.id === connection.target);
              
              if (!sourceNode || !targetNode) return null;
              
              return (
                <line
                  key={connection.id}
                  x1={sourceNode.position.x + 60}
                  y1={sourceNode.position.y + 25}
                  x2={targetNode.position.x + 60}
                  y2={targetNode.position.y + 25}
                  stroke="#6b7280"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6b7280"
                />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Canvas controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors" onClick={() => setZoom(zoom * 1.2)}>
            +
          </button>
          <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors" onClick={() => setZoom(zoom / 1.2)}>
            -
          </button>
          <button className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors" onClick={() => setZoom(1)}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
