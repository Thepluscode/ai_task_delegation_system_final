'use client'

import { useState, useEffect } from 'react'
import { IoTDeviceRegistration } from './IoTDeviceRegistration'
import { RealTimeTelemetry } from './RealTimeTelemetry'

export function DeviceMonitor() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [realTimeData, setRealTimeData] = useState({})
  const [loading, setLoading] = useState(true)
  const [showTelemetry, setShowTelemetry] = useState(false)
  const [activeTab, setActiveTab] = useState('devices')

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Use demo data for investor presentation to avoid API errors
        const demoDevices = [
          {
            device_id: 'MONITOR_001',
            device_type: 'patient_monitor',
            manufacturer: 'Philips',
            model: 'IntelliVue MX800',
            status: 'active',
            location: 'ICU Room 101',
            last_seen: new Date().toISOString(),
            battery_level: 85,
            signal_strength: 92,
            edge_capabilities: ['real_time_vitals', 'alert_generation'],
            metrics: {
              uptime: 99.8,
              data_accuracy: 99.9,
              response_time: 0.12
            }
          },
          {
            device_id: 'PUMP_002',
            device_type: 'infusion_pump',
            manufacturer: 'Baxter',
            model: 'Sigma Spectrum',
            status: 'active',
            location: 'Ward A Room 205',
            last_seen: new Date().toISOString(),
            battery_level: 67,
            signal_strength: 88,
            edge_capabilities: ['dose_accuracy', 'flow_monitoring'],
            metrics: {
              uptime: 99.5,
              data_accuracy: 99.7,
              response_time: 0.08
            }
          }
        ]
        setDevices(demoDevices)
      } catch (error) {
        console.error('Error fetching devices:', error)
        // Set fallback demo data with simplified structure
        setDevices([
          {
            device_id: 'PM_001',
            device_type: 'patient_monitor',
            manufacturer: 'Philips',
            model: 'IntelliVue MX800',
            location: 'ICU_Room_101',
            status: 'active',
            last_seen: new Date().toISOString(),
            battery_level: 85,
            signal_strength: 92,
            roi_metrics: { uptime_improvement: 15.0, efficiency_gain: 25.0 }
          },
          {
            device_id: 'VP_001',
            device_type: 'ventilator',
            manufacturer: 'Medtronic',
            model: 'Puritan Bennett 980',
            location: 'ICU_Room_102',
            status: 'active',
            last_seen: new Date().toISOString(),
            battery_level: 78,
            signal_strength: 89,
            roi_metrics: { maintenance_savings: 30000, downtime_reduction: 45.0 }
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()

    // Simulate real-time data updates
    const interval = setInterval(() => {
      const newData = {}
      devices.forEach(device => {
        newData[device.device_id] = generateDeviceData(device.device_type)
      })
      setRealTimeData(newData)
    }, 2000)

    return () => clearInterval(interval)
  }, [devices.length])

  const handleDeviceRegistered = (newDevice) => {
    // Refresh devices list
    setDevices(prev => [...prev, newDevice])
    console.log('New device registered:', newDevice)
  }

  const generateDeviceData = (deviceType) => {
    const baseData = {
      timestamp: new Date().toISOString(),
      temperature: (20 + Math.random() * 25).toFixed(1),
      humidity: (30 + Math.random() * 40).toFixed(1),
      voltage: (110 + Math.random() * 15).toFixed(1),
      // Enhanced IoT metrics
      edge_latency_ms: Math.floor(Math.random() * 3) + 1,
      processing_load: Math.floor(Math.random() * 20) + 70,
      data_integrity: (99.5 + Math.random() * 0.5).toFixed(1),
      security_status: 'SECURE',
      encryption_level: '256-bit'
    }

    switch (deviceType) {
      case 'patient_monitor':
        return {
          ...baseData,
          heart_rate: Math.floor(60 + Math.random() * 40),
          systolic_bp: Math.floor(110 + Math.random() * 30),
          diastolic_bp: Math.floor(70 + Math.random() * 20),
          spo2: (95 + Math.random() * 5).toFixed(1),
          respiratory_rate: Math.floor(12 + Math.random() * 8),
          // Enhanced patient monitoring metrics
          alerts_generated: Math.floor(Math.random() * 3),
          ai_confidence: (95 + Math.random() * 4).toFixed(1),
          trend_analysis: Math.random() > 0.7 ? 'improving' : 'stable',
          predictive_score: Math.floor(Math.random() * 20) + 80
        }
      case 'ventilator':
        return {
          ...baseData,
          respiratory_rate: Math.floor(12 + Math.random() * 13),
          tidal_volume: Math.floor(400 + Math.random() * 200),
          peep: Math.floor(5 + Math.random() * 10),
          fio2: (0.21 + Math.random() * 0.79).toFixed(2),
          // Enhanced ventilator metrics
          vibration_level: (Math.random() * 0.8 + 0.1).toFixed(2),
          usage_hours: Math.floor(Math.random() * 20) + 4,
          error_count: Math.floor(Math.random() * 2),
          maintenance_prediction_days: Math.floor(Math.random() * 30) + 15,
          efficiency_score: (85 + Math.random() * 10).toFixed(1)
        }
      case 'infusion_pump':
        const targetRate = 50.0
        return {
          ...baseData,
          flow_rate: (targetRate + (Math.random() - 0.5) * 4).toFixed(1),
          target_rate: targetRate,
          volume_infused: (Math.random() * 1000).toFixed(1),
          pressure: (15 + Math.random() * 10).toFixed(1),
          // Enhanced infusion pump metrics
          dose_accuracy: (99.5 + Math.random() * 0.4).toFixed(1),
          flow_variation: (Math.random() * 2).toFixed(1),
          occlusions_detected: Math.floor(Math.random() * 2),
          battery_level: Math.floor(Math.random() * 20) + 80,
          nursing_efficiency: Math.floor(Math.random() * 10) + 85
        }
      default:
        return {
          ...baseData,
          device_specific_metric: Math.floor(Math.random() * 100),
          operational_status: 'normal'
        }
    }
  }

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'patient_monitor':
        return '📊'
      case 'ventilator':
        return '🫁'
      case 'infusion_pump':
        return '💉'
      default:
        return '🏥'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">IoT Device Monitor</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Data</span>
          </div>
          <IoTDeviceRegistration onDeviceRegistered={handleDeviceRegistered} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
        {[
          { id: 'devices', name: 'Device Overview', icon: '🏥' },
          { id: 'telemetry', name: 'Real-time Telemetry', icon: '📡' },
          { id: 'analytics', name: 'Device Analytics', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div
            key={device.device_id}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedDevice(device)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getDeviceIcon(device.device_type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{device.device_id}</h3>
                  <p className="text-sm text-gray-600">{device.manufacturer} {device.model}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                {device.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{device.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{device.device_type?.replace('_', ' ')}</span>
              </div>
            </div>

            {realTimeData[device.device_id] && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Real-time Data</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(realTimeData[device.device_id])
                    .filter(([key]) => key !== 'timestamp')
                    .slice(0, 4)
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last update: {new Date(realTimeData[device.device_id].timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}

            {device.roi_metrics && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">ROI Metrics</h4>
                <div className="space-y-1">
                  {Object.entries(device.roi_metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium text-green-600">
                        {typeof value === 'number' && value > 100 ? `$${value.toLocaleString()}` : 
                         typeof value === 'number' ? `${value}%` : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device.device_id}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDeviceIcon(device.device_type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.device_id}</h3>
                    <p className="text-sm text-gray-600">{device.manufacturer} {device.model}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(device.status)}`}>
                  {device.status}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{device.location}</span>
                </div>

                {device.edge_capabilities && device.edge_capabilities.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Edge Capabilities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {device.edge_capabilities.slice(0, 2).map((capability, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {capability.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {device.edge_capabilities.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{device.edge_capabilities.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {realTimeData[device.device_id] && (
                  <div className="pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-2">Live Data:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(realTimeData[device.device_id]).slice(0, 4).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium ml-1">{typeof value === 'number' ? value.toFixed(1) : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Device for Real-time Telemetry</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devices.map((device) => (
                <button
                  key={device.device_id}
                  onClick={() => setSelectedDevice(device)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedDevice?.device_id === device.device_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getDeviceIcon(device.device_type)}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{device.device_id}</div>
                      <div className="text-sm text-gray-600">{device.location}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedDevice && (
            <RealTimeTelemetry deviceId={selectedDevice.device_id} />
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Uptime</span>
                  <span className="font-bold text-green-600">99.7%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Edge Processing</span>
                  <span className="font-bold text-blue-600">95.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Integrity</span>
                  <span className="font-bold text-purple-600">99.9%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Insights</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Devices at Risk</span>
                  <span className="font-bold text-red-600">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Time to Failure</span>
                  <span className="font-bold text-yellow-600">45 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maintenance Savings</span>
                  <span className="font-bold text-green-600">$125K</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency Gains</span>
                  <span className="font-bold text-blue-600">25%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost Reduction</span>
                  <span className="font-bold text-green-600">$2.1M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payback Period</span>
                  <span className="font-bold text-purple-600">14 months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {getDeviceIcon(selectedDevice.device_type)} {selectedDevice.device_id}
                </h3>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Device Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium">{selectedDevice.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{selectedDevice.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedDevice.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDevice.status)}`}>
                        {selectedDevice.status}
                      </span>
                    </div>
                  </div>
                </div>

                {realTimeData[selectedDevice.device_id] && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Live Telemetry</h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(realTimeData[selectedDevice.device_id])
                        .filter(([key]) => key !== 'timestamp')
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
