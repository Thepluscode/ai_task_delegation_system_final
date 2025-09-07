'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  PlayIcon,
  StopIcon,
  BoltIcon,
  ClockIcon,
  CpuChipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useEdgeOperations, useLocalAgents } from '@/lib/hooks/useEdge'
import { TaskPriority, EdgeDecisionType } from '@/types/edge'
import { formatNumber } from '@/lib/utils/helpers'
import toast from 'react-hot-toast'

export function EdgeTaskProcessor() {
  const { routeTask, loading } = useEdgeOperations()
  const { agents } = useLocalAgents()

  const [taskConfig, setTaskConfig] = useState({
    task_id: '',
    priority: TaskPriority.STANDARD,
    task_type: 'assembly',
    parameters: {},
    timeout_ms: 5000,
    require_response: true
  })

  const [bulkConfig, setBulkConfig] = useState({
    task_count: 10,
    priority: TaskPriority.STANDARD,
    task_type: 'assembly',
    parallel_processing: true,
    max_concurrent: 5
  })

  const [testResults, setTestResults] = useState([])
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testStats, setTestStats] = useState(null)

  useEffect(() => {
    // Generate unique task ID
    setTaskConfig(prev => ({
      ...prev,
      task_id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
  }, [])

  const priorityOptions = [
    { value: TaskPriority.SAFETY_CRITICAL, label: 'Safety Critical (1ms)' },
    { value: TaskPriority.QUALITY_CRITICAL, label: 'Quality Critical (10ms)' },
    { value: TaskPriority.EFFICIENCY_CRITICAL, label: 'Efficiency Critical (100ms)' },
    { value: TaskPriority.STANDARD, label: 'Standard (500ms)' },
  ]

  const taskTypeOptions = [
    { value: 'assembly', label: 'Assembly Task' },
    { value: 'quality_check', label: 'Quality Check' },
    { value: 'material_handling', label: 'Material Handling' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'sensor_reading', label: 'Sensor Reading' },
    { value: 'calibration', label: 'Calibration' },
  ]

  const handleSingleTaskProcess = async () => {
    try {
      const task = {
        ...taskConfig,
        parameters: {
          complexity: Math.random(),
          urgency: taskConfig.priority === TaskPriority.SAFETY_CRITICAL ? 1.0 : Math.random(),
          location: 'station_1',
          ...taskConfig.parameters
        }
      }

      const result = await routeTask(task)

      setTestResults(prev => [result, ...prev.slice(0, 99)]) // Keep last 100 results

      // Update task ID for next test
      setTaskConfig(prev => ({
        ...prev,
        task_id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))

    } catch (error) {
      console.error('Task processing failed:', error)
    }
  }

  const handleBulkTaskProcess = async () => {
    setIsRunningTest(true)
    try {
      const tasks = Array.from({ length: bulkConfig.task_count }, (_, i) => ({
        task_id: `bulk-task-${Date.now()}-${i}`,
        priority: bulkConfig.priority,
        task_type: bulkConfig.task_type,
        parameters: {
          complexity: Math.random(),
          urgency: Math.random(),
          location: `station_${(i % 3) + 1}`,
          batch_id: Date.now()
        },
        timeout_ms: 5000,
        require_response: true
      }))

      const bulkRequest = {
        tasks,
        processing_options: {
          parallel_processing: bulkConfig.parallel_processing,
          max_concurrent: bulkConfig.max_concurrent,
          timeout_ms: 30000,
          fail_fast: false
        }
      }

      const startTime = performance.now()
      const result = await processBulkTasks(bulkRequest)
      const endTime = performance.now()

      const stats = {
        total_tasks: result.total_tasks,
        successful: result.successful,
        failed: result.failed,
        total_time_ms: endTime - startTime,
        avg_processing_time: result.avg_processing_time,
        throughput: result.total_tasks / ((endTime - startTime) / 1000),
        success_rate: (result.successful / result.total_tasks) * 100
      }

      setTestStats(stats)
      setTestResults(prev => [...result.decisions, ...prev.slice(0, 50)])

    } catch (error) {
      console.error('Bulk processing failed:', error)
    } finally {
      setIsRunningTest(false)
    }
  }

  const getDecisionTypeColor = (type) => {
    switch (type) {
      case EdgeDecisionType.CACHED:
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
      case EdgeDecisionType.LIGHTWEIGHT_MODEL:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
      case EdgeDecisionType.RULE_BASED:
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200'
      case EdgeDecisionType.CLOUD_FALLBACK:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getResponseTimeColor = (time, priority) => {
    const targets = {
      [TaskPriority.SAFETY_CRITICAL]: 1,
      [TaskPriority.QUALITY_CRITICAL]: 10,
      [TaskPriority.EFFICIENCY_CRITICAL]: 100,
      [TaskPriority.STANDARD]: 500
    }
    
    const target = targets[priority]
    if (time <= target) return 'text-success-600'
    if (time <= target * 1.5) return 'text-warning-600'
    return 'text-error-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edge Task Processor
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Test real-time task processing with sub-10ms response times
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant={isConnected ? 'success' : 'error'} size="sm">
            {isConnected ? 'Real-time Connected' : 'Polling Mode'}
          </Badge>
          
          <Button
            variant={realtimeEnabled ? 'error' : 'primary'}
            size="sm"
            onClick={realtimeEnabled ? disableRealtime : enableRealtime}
            className="flex items-center space-x-2"
          >
            {realtimeEnabled ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            <span>{realtimeEnabled ? 'Stop' : 'Start'} Real-time</span>
          </Button>
        </div>
      </div>

      {/* Task Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Task Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Single Task Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Task ID"
                  value={taskConfig.task_id}
                  onChange={(e) => setTaskConfig(prev => ({ ...prev, task_id: e.target.value }))}
                  placeholder="task-12345"
                />
                
                <Select
                  label="Priority"
                  value={taskConfig.priority}
                  onChange={(value) => setTaskConfig(prev => ({ ...prev, priority: value }))}
                  options={priorityOptions}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Task Type"
                  value={taskConfig.task_type}
                  onChange={(value) => setTaskConfig(prev => ({ ...prev, task_type: value }))}
                  options={taskTypeOptions}
                />
                
                <Input
                  label="Timeout (ms)"
                  type="number"
                  value={taskConfig.timeout_ms}
                  onChange={(e) => setTaskConfig(prev => ({ ...prev, timeout_ms: parseInt(e.target.value) }))}
                  min="100"
                  max="10000"
                />
              </div>
              
              <Button
                onClick={handleSingleTaskProcess}
                disabled={loading || !taskConfig.task_id}
                loading={loading}
                className="w-full flex items-center justify-center space-x-2"
              >
                <BoltIcon className="w-4 h-4" />
                <span>Process Task</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Task Processing */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Task Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Task Count"
                  type="number"
                  value={bulkConfig.task_count}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, task_count: parseInt(e.target.value) }))}
                  min="1"
                  max="1000"
                />
                
                <Select
                  label="Priority"
                  value={bulkConfig.priority}
                  onChange={(value) => setBulkConfig(prev => ({ ...prev, priority: value }))}
                  options={priorityOptions}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Task Type"
                  value={bulkConfig.task_type}
                  onChange={(value) => setBulkConfig(prev => ({ ...prev, task_type: value }))}
                  options={taskTypeOptions}
                />
                
                <Input
                  label="Max Concurrent"
                  type="number"
                  value={bulkConfig.max_concurrent}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, max_concurrent: parseInt(e.target.value) }))}
                  min="1"
                  max="20"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parallel"
                  checked={bulkConfig.parallel_processing}
                  onChange={(e) => setBulkConfig(prev => ({ ...prev, parallel_processing: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="parallel" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable parallel processing
                </label>
              </div>
              
              <Button
                onClick={handleBulkTaskProcess}
                disabled={isRunningTest || bulkConfig.task_count < 1}
                loading={isRunningTest}
                className="w-full flex items-center justify-center space-x-2"
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>Run Bulk Test</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Statistics */}
      {testStats && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {testStats.total_tasks}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-success-600">
                  {testStats.successful}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {testStats.avg_processing_time?.toFixed(2)}ms
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-warning-600">
                  {testStats.throughput?.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tasks/sec</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {testStats.success_rate?.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    testStats.success_rate >= 95 ? 'bg-success-500' :
                    testStats.success_rate >= 85 ? 'bg-warning-500' :
                    'bg-error-500'
                  }`}
                  style={{ width: `${testStats.success_rate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Task Results ({testResults.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestResults([])}
              disabled={testResults.length === 0}
            >
              Clear Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <BoltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No task results yet. Process some tasks to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => {
                const decision = result.decision || result
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {decision.task_id}
                        </span>
                        <Badge variant={getDecisionTypeColor(decision.decision_type)} size="sm">
                          {decision.decision_type.replace('_', ' ')}
                        </Badge>
                        {decision.cached && (
                          <Badge variant="success" size="sm">Cached</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${getResponseTimeColor(decision.processing_time_ms, decision.task_priority)}`}>
                          {decision.processing_time_ms?.toFixed(2)}ms
                        </span>
                        <span className="text-sm text-gray-500">
                          {(decision.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Agent: {decision.assigned_agent_id}
                      </span>
                      <span className="text-gray-500">
                        {new Date(decision.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {decision.reasoning && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                        {decision.reasoning}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
