'use client'

import { useState } from 'react'

export function IoTDeviceRegistration({ onDeviceRegistered }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    device_id: '',
    device_type: 'patient_monitor',
    manufacturer: '',
    model: '',
    firmware_version: '',
    location: '',
    edge_capabilities: []
  })

  const deviceTypes = [
    { value: 'patient_monitor', label: 'Patient Monitor' },
    { value: 'ventilator', label: 'Ventilator' },
    { value: 'infusion_pump', label: 'Infusion Pump' },
    { value: 'defibrillator', label: 'Defibrillator' },
    { value: 'dialysis_machine', label: 'Dialysis Machine' },
    { value: 'anesthesia_machine', label: 'Anesthesia Machine' }
  ]

  const edgeCapabilities = [
    'real_time_vitals',
    'alert_generation',
    'respiratory_analysis',
    'predictive_maintenance',
    'dose_accuracy',
    'flow_monitoring',
    'cardiac_analysis',
    'trend_prediction'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate successful device registration for demo
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay

      const result = {
        device_id: formData.device_id,
        status: 'registered',
        estimated_roi: {
          annual_savings: Math.floor(Math.random() * 50000) + 25000 // Random savings between $25k-$75k
        },
        edge_capabilities: formData.edge_capabilities,
        registration_time: new Date().toISOString()
      }

      console.log('Device registered successfully:', result)

      // Reset form
      setFormData({
        device_id: '',
        device_type: 'patient_monitor',
        manufacturer: '',
        model: '',
        firmware_version: '',
        location: '',
        edge_capabilities: []
      })

      setIsOpen(false)

      // Notify parent component
      if (onDeviceRegistered) {
        onDeviceRegistered(result)
      }

      // Show success message
      alert(`Device ${result.device_id} registered successfully! Estimated ROI: $${result.estimated_roi?.annual_savings?.toLocaleString() || 'N/A'}`)
    } catch (error) {
      console.error('Error registering device:', error)
      alert('Failed to register device. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCapabilityChange = (capability) => {
    setFormData(prev => ({
      ...prev,
      edge_capabilities: prev.edge_capabilities.includes(capability)
        ? prev.edge_capabilities.filter(c => c !== capability)
        : [...prev.edge_capabilities, capability]
    }))
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Register New IoT Device
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Register IoT Device</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device ID
                </label>
                <input
                  type="text"
                  required
                  value={formData.device_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, device_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., PM_001, VP_002"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Type
                </label>
                <select
                  value={formData.device_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, device_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {deviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  required
                  value={formData.manufacturer}
                  onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Philips, Medtronic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., IntelliVue MX800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firmware Version
                </label>
                <input
                  type="text"
                  required
                  value={formData.firmware_version}
                  onChange={(e) => setFormData(prev => ({ ...prev, firmware_version: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2.1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ICU_Room_101"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Edge Computing Capabilities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {edgeCapabilities.map(capability => (
                  <label key={capability} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.edge_capabilities.includes(capability)}
                      onChange={() => handleCapabilityChange(capability)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {capability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
