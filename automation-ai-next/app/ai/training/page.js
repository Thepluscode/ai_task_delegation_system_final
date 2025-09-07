'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert } from '@/components/ui/alert'

export default function AITrainingPage() {
  const [trainingJobs, setTrainingJobs] = useState([])
  const [datasets, setDatasets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTraining, setNewTraining] = useState({
    name: '',
    dataset: '',
    modelType: '',
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001
  })

  useEffect(() => {
    // Simulate loading training data
    setTimeout(() => {
      setDatasets([
        { id: 1, name: 'Healthcare Images Dataset', size: '2.3M samples', type: 'Medical Images' },
        { id: 2, name: 'Financial Transactions', size: '15M records', type: 'Tabular Data' },
        { id: 3, name: 'Manufacturing Sensors', size: '500K cycles', type: 'Time Series' },
        { id: 4, name: 'IoT Device Logs', size: '100M readings', type: 'Sensor Data' },
        { id: 5, name: 'Edge Computing Metrics', size: '50M scenarios', type: 'Performance Data' }
      ])

      setTrainingJobs([
        {
          id: 1,
          name: 'Healthcare Diagnostic Model v2.2',
          status: 'training',
          progress: 67,
          epoch: 67,
          totalEpochs: 100,
          accuracy: 96.8,
          loss: 0.032,
          eta: '2h 15m',
          startTime: '2024-01-15 09:30',
          dataset: 'Healthcare Images Dataset',
          modelType: 'CNN'
        },
        {
          id: 2,
          name: 'Financial Risk Analyzer v1.9',
          status: 'completed',
          progress: 100,
          epoch: 150,
          totalEpochs: 150,
          accuracy: 98.4,
          loss: 0.018,
          eta: 'Completed',
          startTime: '2024-01-14 14:20',
          dataset: 'Financial Transactions',
          modelType: 'Ensemble'
        },
        {
          id: 3,
          name: 'Manufacturing Optimizer v3.1',
          status: 'queued',
          progress: 0,
          epoch: 0,
          totalEpochs: 200,
          accuracy: 0,
          loss: 0,
          eta: 'Waiting',
          startTime: 'Queued',
          dataset: 'Manufacturing Sensors',
          modelType: 'LSTM'
        },
        {
          id: 4,
          name: 'IoT Anomaly Detector v1.6',
          status: 'failed',
          progress: 23,
          epoch: 23,
          totalEpochs: 100,
          accuracy: 78.2,
          loss: 0.245,
          eta: 'Failed',
          startTime: '2024-01-13 11:45',
          dataset: 'IoT Device Logs',
          modelType: 'Autoencoder'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'training': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'queued': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleStartTraining = async (e) => {
    e.preventDefault()
    
    const newJob = {
      id: trainingJobs.length + 1,
      name: newTraining.name,
      status: 'queued',
      progress: 0,
      epoch: 0,
      totalEpochs: newTraining.epochs,
      accuracy: 0,
      loss: 0,
      eta: 'Queued',
      startTime: 'Queued',
      dataset: datasets.find(d => d.id === parseInt(newTraining.dataset))?.name || '',
      modelType: newTraining.modelType
    }

    setTrainingJobs(prev => [...prev, newJob])
    setNewTraining({
      name: '',
      dataset: '',
      modelType: '',
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">AI Model Training</h1>
          <p className="text-gray-600 mt-1">
            Train and optimize AI models for your <span className="font-semibold text-indigo-600">$1B automation platform</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">GPU Utilization</p>
            <p className="text-2xl font-bold text-green-600">87%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Active Jobs</p>
            <p className="text-2xl font-bold text-blue-600">{trainingJobs.filter(j => j.status === 'training').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Training Job Form */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start New Training
          </h2>

          <form onSubmit={handleStartTraining} className="space-y-4">
            <div>
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                value={newTraining.name}
                onChange={(e) => setNewTraining(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter model name"
                required
              />
            </div>

            <div>
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={newTraining.dataset} onValueChange={(value) => setNewTraining(prev => ({ ...prev, dataset: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id.toString()}>
                      {dataset.name} ({dataset.size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modelType">Model Type</Label>
              <Select value={newTraining.modelType} onValueChange={(value) => setNewTraining(prev => ({ ...prev, modelType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CNN">Convolutional Neural Network</SelectItem>
                  <SelectItem value="LSTM">Long Short-Term Memory</SelectItem>
                  <SelectItem value="Transformer">Transformer</SelectItem>
                  <SelectItem value="Ensemble">Ensemble Model</SelectItem>
                  <SelectItem value="Autoencoder">Autoencoder</SelectItem>
                  <SelectItem value="GAN">Generative Adversarial Network</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="epochs">Epochs</Label>
                <Input
                  id="epochs"
                  type="number"
                  value={newTraining.epochs}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, epochs: parseInt(e.target.value) }))}
                  min="1"
                  max="1000"
                />
              </div>
              <div>
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={newTraining.batchSize}
                  onChange={(e) => setNewTraining(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  min="1"
                  max="512"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="learningRate">Learning Rate</Label>
              <Input
                id="learningRate"
                type="number"
                step="0.0001"
                value={newTraining.learningRate}
                onChange={(e) => setNewTraining(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                min="0.0001"
                max="1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Start Training Job
            </Button>
          </form>
        </Card>

        {/* Available Datasets */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="h-6 w-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            Available Datasets
          </h2>

          <div className="space-y-3">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                  <span className="text-sm text-gray-500">{dataset.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{dataset.size}</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" className="w-full">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload New Dataset
            </Button>
          </div>
        </Card>
      </div>

      {/* Training Jobs */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Training Jobs
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Model Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Accuracy</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Loss</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">ETA</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainingJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{job.name}</p>
                      <p className="text-sm text-gray-500">{job.dataset} • {job.modelType}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{job.progress}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Epoch {job.epoch}/{job.totalEpochs}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-green-600">{job.accuracy}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-red-600">{job.loss.toFixed(3)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{job.eta}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {job.status === 'training' && (
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Stop
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Training Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Training Hours</p>
              <p className="text-3xl font-bold text-blue-600">2,847</p>
            </div>
            <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Models Trained</p>
              <p className="text-3xl font-bold text-green-600">156</p>
            </div>
            <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
              <p className="text-3xl font-bold text-purple-600">96.8%</p>
            </div>
            <svg className="h-12 w-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">GPU Cost Saved</p>
              <p className="text-3xl font-bold text-yellow-600">$1.2M</p>
            </div>
            <svg className="h-12 w-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </Card>
      </div>
    </div>
  )
}
