'use client'

import React, { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  SaveIcon,
  PlusIcon,
  CpuChipIcon,
  UserIcon,
  CogIcon,
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

// Custom Node Types
const nodeTypes = {
  humanTask: HumanTaskNode,
  robotTask: RobotTaskNode,
  aiDecision: AIDecisionNode,
  condition: ConditionNode,
  start: StartNode,
  end: EndNode,
}

// Node Components
function HumanTaskNode({ data, isConnectable }) {
  return (
    <Card className="min-w-[200px] border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <CardTitle className="text-sm">{data.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <Badge variant="secondary" size="sm">Human Task</Badge>
          {data.estimatedTime && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <ClockIcon className="w-3 h-3" />
              <span>{data.estimatedTime}</span>
            </div>
          )}
          {data.skills && (
            <div className="text-xs text-gray-600">
              Skills: {data.skills.join(', ')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RobotTaskNode({ data, isConnectable }) {
  return (
    <Card className="min-w-[200px] border-green-200 bg-green-50 dark:bg-green-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="w-4 h-4 text-green-600" />
          <CardTitle className="text-sm">{data.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <Badge variant="success" size="sm">Robot Task</Badge>
          {data.robotType && (
            <div className="text-xs text-gray-600">
              Type: {data.robotType}
            </div>
          )}
          {data.precision && (
            <div className="text-xs text-gray-600">
              Precision: {data.precision}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AIDecisionNode({ data, isConnectable }) {
  return (
    <Card className="min-w-[200px] border-purple-200 bg-purple-50 dark:bg-purple-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <BoltIcon className="w-4 h-4 text-purple-600" />
          <CardTitle className="text-sm">{data.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          <Badge variant="primary" size="sm">AI Decision</Badge>
          {data.confidence && (
            <div className="text-xs text-gray-600">
              Confidence: {data.confidence}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ConditionNode({ data, isConnectable }) {
  return (
    <Card className="min-w-[180px] border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
          <CardTitle className="text-sm">{data.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Badge variant="warning" size="sm">Condition</Badge>
      </CardContent>
    </Card>
  )
}

function StartNode({ data, isConnectable }) {
  return (
    <Card className="min-w-[120px] border-gray-200 bg-gray-50 dark:bg-gray-800">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <PlayIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Start</span>
        </div>
      </CardContent>
    </Card>
  )
}

function EndNode({ data, isConnectable }) {
  return (
    <Card className="min-w-[120px] border-gray-200 bg-gray-50 dark:bg-gray-800">
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircleIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">End</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Node Palette Component
function NodePalette({ onAddNode }) {
  const nodeTemplates = [
    {
      type: 'humanTask',
      label: 'Human Task',
      icon: UserIcon,
      color: 'blue',
      defaultData: {
        label: 'New Human Task',
        estimatedTime: '30 min',
        skills: ['general']
      }
    },
    {
      type: 'robotTask',
      label: 'Robot Task',
      icon: CpuChipIcon,
      color: 'green',
      defaultData: {
        label: 'New Robot Task',
        robotType: 'Universal Robot',
        precision: 'High'
      }
    },
    {
      type: 'aiDecision',
      label: 'AI Decision',
      icon: BoltIcon,
      color: 'purple',
      defaultData: {
        label: 'AI Decision Point',
        confidence: 85
      }
    },
    {
      type: 'condition',
      label: 'Condition',
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      defaultData: {
        label: 'If/Then Condition'
      }
    }
  ]

  return (
    <Card className="w-64">
      <CardHeader>
        <CardTitle className="text-lg">Workflow Components</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {nodeTemplates.map((template) => (
          <Button
            key={template.type}
            variant="outline"
            className="w-full justify-start"
            onClick={() => onAddNode(template)}
          >
            <template.icon className="w-4 h-4 mr-2" />
            {template.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

// Main Workflow Designer Component
export function WorkflowDesigner({ workflowId, initialNodes = [], initialEdges = [] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedNode, setSelectedNode] = useState(null)
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance, setNodes]
  )

  const onAddNode = useCallback((template) => {
    const newNode = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: template.defaultData,
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes])

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
  }, [])

  const handleSaveWorkflow = async () => {
    const workflowData = {
      id: workflowId,
      nodes,
      edges,
      lastModified: new Date().toISOString(),
    }
    
    try {
      // Save workflow to backend
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData),
      })
      
      if (response.ok) {
        console.log('Workflow saved successfully')
      }
    } catch (error) {
      console.error('Error saving workflow:', error)
    }
  }

  const handleRunWorkflow = () => {
    setIsRunning(true)
    // Implement workflow execution logic
    console.log('Running workflow with nodes:', nodes)
    console.log('Running workflow with edges:', edges)
    
    // Simulate workflow execution
    setTimeout(() => {
      setIsRunning(false)
    }, 3000)
  }

  const handleStopWorkflow = () => {
    setIsRunning(false)
    console.log('Stopping workflow')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Node Palette */}
      <div className="p-4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <NodePalette onAddNode={onAddNode} />
      </div>

      {/* Main Workflow Canvas */}
      <div className="flex-1 relative">
        <ReactFlowProvider>
          <div className="w-full h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
              
              {/* Control Panel */}
              <Panel position="top-right">
                <div className="flex space-x-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <Button
                    size="sm"
                    onClick={handleSaveWorkflow}
                    className="flex items-center space-x-1"
                  >
                    <SaveIcon className="w-4 h-4" />
                    <span>Save</span>
                  </Button>
                  
                  {!isRunning ? (
                    <Button
                      size="sm"
                      onClick={handleRunWorkflow}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                    >
                      <PlayIcon className="w-4 h-4" />
                      <span>Run</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleStopWorkflow}
                      variant="error"
                      className="flex items-center space-x-1"
                    >
                      <StopIcon className="w-4 h-4" />
                      <span>Stop</span>
                    </Button>
                  )}
                </div>
              </Panel>

              {/* Status Panel */}
              {isRunning && (
                <Panel position="bottom-center">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Workflow Running...</span>
                    </div>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>

      {/* Properties Panel */}
      {selectedNode && (
        <div className="w-80 p-4 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <Card>
            <CardHeader>
              <CardTitle>Node Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    setNodes((nds) =>
                      nds.map((node) =>
                        node.id === selectedNode.id
                          ? { ...node, data: { ...node.data, label: e.target.value } }
                          : node
                      )
                    )
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {selectedNode.type === 'humanTask' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Time</label>
                    <input
                      type="text"
                      value={selectedNode.data.estimatedTime || ''}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, estimatedTime: e.target.value } }
                              : node
                          )
                        )
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Required Skills</label>
                    <input
                      type="text"
                      value={selectedNode.data.skills?.join(', ') || ''}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, skills: e.target.value.split(', ') } }
                              : node
                          )
                        )
                      }}
                      placeholder="skill1, skill2, skill3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
              
              {selectedNode.type === 'robotTask' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Robot Type</label>
                    <select
                      value={selectedNode.data.robotType || ''}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, robotType: e.target.value } }
                              : node
                          )
                        )
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Universal Robot">Universal Robot</option>
                      <option value="ABB Robot">ABB Robot</option>
                      <option value="KUKA Robot">KUKA Robot</option>
                      <option value="FANUC Robot">FANUC Robot</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Precision Level</label>
                    <select
                      value={selectedNode.data.precision || ''}
                      onChange={(e) => {
                        setNodes((nds) =>
                          nds.map((node) =>
                            node.id === selectedNode.id
                              ? { ...node, data: { ...node.data, precision: e.target.value } }
                              : node
                          )
                        )
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Ultra High">Ultra High</option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
