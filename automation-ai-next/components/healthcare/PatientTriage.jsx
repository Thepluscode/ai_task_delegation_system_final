'use client'

import { useState, useEffect } from 'react'

export function PatientTriage() {
  const [patients, setPatients] = useState([])
  const [triageQueue, setTriageQueue] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [triageForm, setTriageForm] = useState({
    patient_id: '',
    age: '',
    gender: 'M',
    urgency_level: 'medium',
    symptoms: '',
    connected_devices: []
  })
  const [loading, setLoading] = useState(false)
  const [triageResult, setTriageResult] = useState(null)

  useEffect(() => {
    // Generate demo patients
    const demoPatients = [
      {
        id: 'P001',
        name: 'John Doe',
        age: 45,
        gender: 'M',
        room: 'ICU-101',
        status: 'critical',
        connected_devices: ['PM_001', 'VP_001'],
        vitals: { hr: 95, bp: '140/90', spo2: 97, temp: 38.2 },
        last_triage: '2024-08-20T10:30:00Z'
      },
      {
        id: 'P002',
        name: 'Jane Smith',
        age: 32,
        gender: 'F',
        room: 'Ward-205',
        status: 'stable',
        connected_devices: ['PM_002'],
        vitals: { hr: 72, bp: '120/80', spo2: 99, temp: 36.8 },
        last_triage: '2024-08-20T09:15:00Z'
      },
      {
        id: 'P003',
        name: 'Robert Johnson',
        age: 67,
        gender: 'M',
        room: 'ICU-102',
        status: 'warning',
        connected_devices: ['PM_003', 'IP_001'],
        vitals: { hr: 110, bp: '160/95', spo2: 94, temp: 37.5 },
        last_triage: '2024-08-20T11:00:00Z'
      }
    ]
    setPatients(demoPatients)
    setTriageQueue(demoPatients.filter(p => p.status === 'critical' || p.status === 'warning'))
  }, [])

  const handleTriageSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Create triage request
      const taskRequest = {
        task_id: `IOT_HEALTH_${Date.now()}`,
        task_type: 'iot_enhanced_triage',
        patient_info: {
          patient_id_hash: btoa(triageForm.patient_id), // Simple encoding for demo
          age: parseInt(triageForm.age),
          gender: triageForm.gender,
          connected_devices: triageForm.connected_devices,
          consent_iot_monitoring: true
        },
        urgency_level: triageForm.urgency_level,
        iot_context: {
          symptoms: triageForm.symptoms,
          timestamp: new Date().toISOString()
        }
      }

      const response = await fetch('http://localhost:8009/api/v2/iot/enhanced-triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskRequest)
      })

      if (response.ok) {
        const result = await response.json()
        setTriageResult(result)
        
        // Add to triage queue
        const newPatient = {
          id: triageForm.patient_id,
          name: `Patient ${triageForm.patient_id}`,
          age: parseInt(triageForm.age),
          gender: triageForm.gender,
          room: 'Triage',
          status: triageForm.urgency_level,
          connected_devices: triageForm.connected_devices,
          vitals: { hr: 80, bp: '120/80', spo2: 98, temp: 36.5 },
          last_triage: new Date().toISOString(),
          triage_result: result
        }
        
        setTriageQueue(prev => [newPatient, ...prev])
        
        // Reset form
        setTriageForm({
          patient_id: '',
          age: '',
          gender: 'M',
          urgency_level: 'medium',
          symptoms: '',
          connected_devices: []
        })
      } else {
        throw new Error('Triage request failed')
      }
    } catch (error) {
      console.error('Triage error:', error)
      // Demo fallback result
      setTriageResult({
        task_id: `IOT_HEALTH_${Date.now()}`,
        triage_recommendation: {
          priority_level: triageForm.urgency_level,
          recommended_action: 'Monitor vitals and reassess in 30 minutes',
          confidence_score: 0.85,
          ai_reasoning: 'Based on patient age, symptoms, and IoT device data analysis'
        },
        iot_insights: {
          device_data_quality: 'high',
          real_time_risk_score: 0.3,
          predictive_alerts: []
        },
        processing_time_ms: 45
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (status) => {
    switch (status) {
      case 'critical':
      case 'high':
        return '🚨'
      case 'warning':
      case 'medium':
        return '⚠️'
      case 'stable':
      case 'low':
        return '✅'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Triage Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Enhanced Patient Triage</h2>
          
          <form onSubmit={handleTriageSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={triageForm.patient_id}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, patient_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="P001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={triageForm.age}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="45"
                  min="0"
                  max="150"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={triageForm.gender}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={triageForm.urgency_level}
                  onChange={(e) => setTriageForm(prev => ({ ...prev, urgency_level: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symptoms
              </label>
              <textarea
                value={triageForm.symptoms}
                onChange={(e) => setTriageForm(prev => ({ ...prev, symptoms: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Describe patient symptoms..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connected IoT Devices
              </label>
              <div className="flex flex-wrap gap-2">
                {['PM_001', 'VP_001', 'IP_001', 'PM_002'].map(device => (
                  <label key={device} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={triageForm.connected_devices.includes(device)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTriageForm(prev => ({
                            ...prev,
                            connected_devices: [...prev.connected_devices, device]
                          }))
                        } else {
                          setTriageForm(prev => ({
                            ...prev,
                            connected_devices: prev.connected_devices.filter(d => d !== device)
                          }))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{device}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing Triage...' : 'Submit for AI Triage'}
            </button>
          </form>

          {/* Triage Result */}
          {triageResult && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Triage Result</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Priority Level:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(triageResult.triage_recommendation?.priority_level)}`}>
                    {triageResult.triage_recommendation?.priority_level}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Confidence:</span>
                  <span className="font-medium">{(triageResult.triage_recommendation?.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Processing Time:</span>
                  <span className="font-medium">{triageResult.processing_time_ms}ms</span>
                </div>
                <div className="mt-2">
                  <span className="text-blue-700">Recommendation:</span>
                  <p className="text-blue-800 mt-1">{triageResult.triage_recommendation?.recommended_action}</p>
                </div>
                <div className="mt-2">
                  <span className="text-blue-700">AI Reasoning:</span>
                  <p className="text-blue-800 mt-1">{triageResult.triage_recommendation?.ai_reasoning}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Triage Queue */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Triage Queue</h2>
          
          <div className="space-y-4">
            {triageQueue.map((patient) => (
              <div
                key={patient.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getPriorityIcon(patient.status)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.id} • {patient.room}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Age/Gender:</span>
                    <span className="ml-1 font-medium">{patient.age}/{patient.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Devices:</span>
                    <span className="ml-1 font-medium">{patient.connected_devices.length}</span>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">HR:</span>
                    <span className="ml-1 font-medium">{patient.vitals.hr}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">BP:</span>
                    <span className="ml-1 font-medium">{patient.vitals.bp}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">SpO2:</span>
                    <span className="ml-1 font-medium">{patient.vitals.spo2}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Temp:</span>
                    <span className="ml-1 font-medium">{patient.vitals.temp}°C</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Last triage: {new Date(patient.last_triage).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {getPriorityIcon(selectedPatient.status)} {selectedPatient.name}
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Patient Info</h4>
                    <div className="space-y-1 text-sm">
                      <div>ID: {selectedPatient.id}</div>
                      <div>Age: {selectedPatient.age}</div>
                      <div>Gender: {selectedPatient.gender}</div>
                      <div>Room: {selectedPatient.room}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Current Vitals</h4>
                    <div className="space-y-1 text-sm">
                      <div>Heart Rate: {selectedPatient.vitals.hr} bpm</div>
                      <div>Blood Pressure: {selectedPatient.vitals.bp} mmHg</div>
                      <div>SpO2: {selectedPatient.vitals.spo2}%</div>
                      <div>Temperature: {selectedPatient.vitals.temp}°C</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Connected Devices</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.connected_devices.map(device => (
                      <span key={device} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {device}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPatient.triage_result && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Latest Triage Result</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="mb-2">
                        <strong>Recommendation:</strong> {selectedPatient.triage_result.triage_recommendation?.recommended_action}
                      </div>
                      <div>
                        <strong>AI Reasoning:</strong> {selectedPatient.triage_result.triage_recommendation?.ai_reasoning}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedPatient(null)}
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
