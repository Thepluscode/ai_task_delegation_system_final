'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'

export default function AIModelsPage() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState(null)
  const [deploymentStatus, setDeploymentStatus] = useState({})

  useEffect(() => {
    // Simulate loading AI models
    setTimeout(() => {
      setModels([
        {
          id: 1,
          name: 'Healthcare Diagnostic AI',
          version: 'v2.1.0',
          type: 'Deep Learning',
          accuracy: 98.7,
          status: 'deployed',
          industry: 'Healthcare',
          description: 'Advanced medical image analysis and diagnostic assistance',
          parameters: '175B',
          trainingData: '2.3M medical images',
          lastUpdated: '2024-01-15',
          performance: {
            latency: '45ms',
            throughput: '1,200 req/min',
            memory: '8.2GB'
          }
        },
        {
          id: 2,
          name: 'Financial Risk Analyzer',
          version: 'v1.8.3',
          type: 'Ensemble',
          accuracy: 96.4,
          status: 'training',
          industry: 'Banking',
          description: 'Real-time fraud detection and risk assessment',
          parameters: '89B',
          trainingData: '15M transactions',
          lastUpdated: '2024-01-12',
          performance: {
            latency: '12ms',
            throughput: '5,000 req/min',
            memory: '4.1GB'
          }
        },
        {
          id: 3,
          name: 'Manufacturing Optimizer',
          version: 'v3.0.1',
          type: 'Reinforcement Learning',
          accuracy: 94.8,
          status: 'deployed',
          industry: 'Manufacturing',
          description: 'Production line optimization and predictive maintenance',
          parameters: '45B',
          trainingData: '500K production cycles',
          lastUpdated: '2024-01-10',
          performance: {
            latency: '78ms',
            throughput: '800 req/min',
            memory: '6.7GB'
          }
        },
        {
          id: 4,
          name: 'IoT Data Processor',
          version: 'v1.5.2',
          type: 'Time Series',
          accuracy: 97.1,
          status: 'testing',
          industry: 'IoT',
          description: 'Real-time sensor data analysis and anomaly detection',
          parameters: '23B',
          trainingData: '100M sensor readings',
          lastUpdated: '2024-01-08',
          performance: {
            latency: '8ms',
            throughput: '10,000 req/min',
            memory: '2.8GB'
          }
        },
        {
          id: 5,
          name: 'Edge Computing AI',
          version: 'v2.3.0',
          type: 'Lightweight CNN',
          accuracy: 92.3,
          status: 'deployed',
          industry: 'Edge Computing',
          description: 'Optimized for edge devices with minimal resource usage',
          parameters: '1.2B',
          trainingData: '50M edge scenarios',
          lastUpdated: '2024-01-05',
          performance: {
            latency: '3ms',
            throughput: '15,000 req/min',
            memory: '512MB'
          }
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-100'
      case 'training': return 'text-blue-600 bg-blue-100'
      case 'testing': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDeploy = async (modelId) => {
    setDeploymentStatus(prev => ({ ...prev, [modelId]: 'deploying' }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, status: 'deployed' } : model
      ))
      setDeploymentStatus(prev => ({ ...prev, [modelId]: 'success' }))
    } catch (error) {
      setDeploymentStatus(prev => ({ ...prev, [modelId]: 'error' }))
    }
  }

  const handleRetrain = async (modelId) => {
    setDeploymentStatus(prev => ({ ...prev, [modelId]: 'retraining' }))
    
    try {
      await new Promise(resolve => setTimeout(resolve, 5000))
      setModels(prev => prev.map(model => 
        model.id === modelId ? { ...model, status: 'training' } : model
      ))
      setDeploymentStatus(prev => ({ ...prev, [modelId]: 'success' }))
    } catch (error) {
      setDeploymentStatus(prev => ({ ...prev, [modelId]: 'error' }))
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Model Management</h1>
          <p className="text-gray-600 mt-1">
            Deploy and manage enterprise AI models across your <span className="font-semibold text-purple-600">$1B automation platform</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Deploy New Model
          </Button>
        </div>
      </div>

      {/* Model Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Models</p>
              <p className="text-3xl font-bold text-blue-600">{models.length}</p>
            </div>
            <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Deployed</p>
              <p className="text-3xl font-bold text-green-600">{models.filter(m => m.status === 'deployed').length}</p>
            </div>
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
              <p className="text-3xl font-bold text-yellow-600">
                {(models.reduce((acc, model) => acc + model.accuracy, 0) / models.length).toFixed(1)}%
              </p>
            </div>
            <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Parameters</p>
              <p className="text-3xl font-bold text-purple-600">333B+</p>
            </div>
            <svg className="h-12 w-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </Card>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                <p className="text-sm text-gray-500">{model.version} • {model.type}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                {model.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium text-green-600">{model.accuracy}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Industry:</span>
                <span className="font-medium">{model.industry}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Parameters:</span>
                <span className="font-medium">{model.parameters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Training Data:</span>
                <span className="font-medium">{model.trainingData}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{model.description}</p>

            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-gray-500">Latency</p>
                  <p className="font-medium">{model.performance.latency}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Throughput</p>
                  <p className="font-medium">{model.performance.throughput}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Memory</p>
                  <p className="font-medium">{model.performance.memory}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {model.status === 'deployed' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRetrain(model.id)}
                    disabled={deploymentStatus[model.id] === 'retraining'}
                  >
                    {deploymentStatus[model.id] === 'retraining' ? 'Retraining...' : 'Retrain'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedModel(model)}
                  >
                    Monitor
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    onClick={() => handleDeploy(model.id)}
                    disabled={deploymentStatus[model.id] === 'deploying'}
                  >
                    {deploymentStatus[model.id] === 'deploying' ? 'Deploying...' : 'Deploy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedModel(model)}
                  >
                    Details
                  </Button>
                </>
              )}
            </div>

            {deploymentStatus[model.id] === 'success' && (
              <Alert className="mt-3 border-green-200 bg-green-50 text-green-800">
                Operation completed successfully!
              </Alert>
            )}

            {deploymentStatus[model.id] === 'error' && (
              <Alert className="mt-3 border-red-200 bg-red-50 text-red-800">
                Operation failed. Please try again.
              </Alert>
            )}
          </Card>
        ))}
      </div>

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedModel.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModel(null)}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Model Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{selectedModel.version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">{selectedModel.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Industry:</span>
                      <span className="ml-2 font-medium">{selectedModel.industry}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 font-medium">{selectedModel.lastUpdated}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedModel.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Accuracy:</span>
                        <span className="ml-2 font-medium text-green-600">{selectedModel.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Parameters:</span>
                        <span className="ml-2 font-medium">{selectedModel.parameters}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Training Data:</span>
                        <span className="ml-2 font-medium">{selectedModel.trainingData}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedModel.status)}`}>
                          {selectedModel.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Runtime Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Latency</p>
                      <p className="text-lg font-bold text-blue-600">{selectedModel.performance.latency}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Throughput</p>
                      <p className="text-lg font-bold text-green-600">{selectedModel.performance.throughput}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-600">Memory Usage</p>
                      <p className="text-lg font-bold text-purple-600">{selectedModel.performance.memory}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
