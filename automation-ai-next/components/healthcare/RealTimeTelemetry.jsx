'use client'

import { useState, useEffect, useRef } from 'react'

export function RealTimeTelemetry({ deviceId }) {
  const [telemetryData, setTelemetryData] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [error, setError] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!deviceId) return

    // Connect to WebSocket for real-time telemetry
    const connectWebSocket = () => {
      try {
        const wsUrl = `ws://localhost:8009/api/v2/iot/realtime/${deviceId}`
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          console.log(`WebSocket connected for device ${deviceId}`)
          setConnectionStatus('connected')
          setError(null)
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setTelemetryData(data)
          } catch (err) {
            console.error('Error parsing WebSocket message:', err)
          }
        }

        wsRef.current.onclose = () => {
          console.log(`WebSocket disconnected for device ${deviceId}`)
          setConnectionStatus('disconnected')
          
          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (deviceId) {
              connectWebSocket()
            }
          }, 3000)
        }

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          setError('WebSocket connection failed')
          setConnectionStatus('error')
        }
      } catch (err) {
        console.error('Error creating WebSocket:', err)
        setError('Failed to create WebSocket connection')
        setConnectionStatus('error')
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [deviceId])

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100'
      case 'disconnected':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatTelemetryValue = (key, value) => {
    if (typeof value === 'number') {
      if (key.includes('temperature')) return `${value}°C`
      if (key.includes('pressure')) return `${value} mmHg`
      if (key.includes('rate')) return `${value}/min`
      if (key.includes('percentage') || key.includes('accuracy')) return `${value}%`
      if (key.includes('latency') || key.includes('time')) return `${value}ms`
      return value.toFixed(2)
    }
    return value
  }

  if (!deviceId) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">Select a device to view real-time telemetry</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Real-time Telemetry - {deviceId}
        </h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor()}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
            connectionStatus === 'disconnected' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></div>
          {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {telemetryData ? (
        <div className="space-y-6">
          {/* Timestamp */}
          <div className="text-sm text-gray-500">
            Last Update: {new Date(telemetryData.timestamp).toLocaleString()}
          </div>

          {/* Processing Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-900">Processing Time</div>
              <div className="text-2xl font-bold text-blue-600">
                {telemetryData.processing_time_ms?.toFixed(1)}ms
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-900">Edge Processed</div>
              <div className="text-2xl font-bold text-green-600">
                {telemetryData.edge_processed ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-900">Data Integrity</div>
              <div className="text-2xl font-bold text-purple-600">
                {telemetryData.data?.data_integrity || '99.9'}%
              </div>
            </div>
          </div>

          {/* Device Data */}
          {telemetryData.data && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Device Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(telemetryData.data).map(([key, value]) => {
                  if (key === 'timestamp' || key === 'edge_processed') return null
                  
                  return (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatTelemetryValue(key, value)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Alerts */}
          {telemetryData.data?.alerts_generated > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 font-medium">
                  {telemetryData.data.alerts_generated} Alert(s) Generated
                </span>
              </div>
            </div>
          )}

          {/* Predictive Insights */}
          {telemetryData.data?.maintenance_prediction_days && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-yellow-900">Maintenance Prediction</div>
                  <div className="text-lg font-bold text-yellow-800">
                    {telemetryData.data.maintenance_prediction_days} days until maintenance
                  </div>
                </div>
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Waiting for telemetry data...</p>
        </div>
      )}
    </div>
  )
}
