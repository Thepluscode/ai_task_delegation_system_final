'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { 
  RobotIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useRobotManagement } from '@/lib/hooks/useRobotAbstraction'
import { robotAbstractionApi } from '@/lib/api/robotAbstraction'
import { RobotBrand } from '@/types/robot-abstraction'
import toast from 'react-hot-toast'

export function RobotRegistration({ onRobotRegistered }) {
  const { registerRobot, loading } = useRobotManagement()
  const [formData, setFormData] = useState({
    robot_id: '',
    brand: RobotBrand.UNIVERSAL_ROBOTS,
    model: '',
    ip_address: '',
    port: 502,
    protocol: 'tcp'
  })
  const [errors, setErrors] = useState({})

  const brandOptions = [
    { value: RobotBrand.UNIVERSAL_ROBOTS, label: 'Universal Robots' },
    { value: RobotBrand.ABB, label: 'ABB' },
    { value: RobotBrand.KUKA, label: 'KUKA' },
    { value: RobotBrand.FANUC, label: 'FANUC' },
    { value: RobotBrand.BOSTON_DYNAMICS, label: 'Boston Dynamics' },
    { value: RobotBrand.CUSTOM, label: 'Custom' }
  ]

  const protocolOptions = [
    { value: 'tcp', label: 'TCP' },
    { value: 'modbus', label: 'Modbus' },
    { value: 'ethernet_ip', label: 'Ethernet/IP' },
    { value: 'opcua', label: 'OPC UA' }
  ]

  const validateForm = () => {
    const newErrors = {}

    if (!formData.robot_id.trim()) {
      newErrors.robot_id = 'Robot ID is required'
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }

    if (!formData.ip_address.trim()) {
      newErrors.ip_address = 'IP Address is required'
    } else {
      // Basic IP validation
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
      if (!ipRegex.test(formData.ip_address)) {
        newErrors.ip_address = 'Invalid IP address format'
      }
    }

    if (formData.port < 1 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const robotConfig = {
      robot_id: formData.robot_id,
      brand: formData.brand,
      model: formData.model,
      ip_address: formData.ip_address,
      port: formData.port,
      protocol: formData.protocol
    }

    const success = await registerRobot(robotConfig)
    
    if (success) {
      // Reset form
      setFormData({
        robot_id: '',
        brand: RobotBrand.UNIVERSAL_ROBOTS,
        model: '',
        ip_address: '',
        port: 502,
        protocol: 'tcp'
      })
      setErrors({})
      
      if (onRobotRegistered) {
        onRobotRegistered(robotConfig)
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const generateRobotId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const brandPrefix = formData.brand.split('_')[0].toLowerCase()
    const robotId = `${brandPrefix}_${timestamp}`
    handleInputChange('robot_id', robotId)
  }

  const getDefaultPort = (brand) => {
    const defaultPorts = {
      [RobotBrand.UNIVERSAL_ROBOTS]: 30001,
      [RobotBrand.ABB]: 80,
      [RobotBrand.KUKA]: 7000,
      [RobotBrand.FANUC]: 8193,
      [RobotBrand.BOSTON_DYNAMICS]: 443,
      [RobotBrand.CUSTOM]: 502
    }
    return defaultPorts[brand] || 502
  }

  const handleBrandChange = (brand) => {
    handleInputChange('brand', brand)
    handleInputChange('port', getDefaultPort(brand))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <RobotIcon className="w-6 h-6 text-primary-500" />
          <CardTitle>Register New Robot</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Input
                  label="Robot ID"
                  value={formData.robot_id}
                  onChange={(e) => handleInputChange('robot_id', e.target.value)}
                  error={errors.robot_id}
                  placeholder="e.g., ur_001"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRobotId}
                  className="mt-6"
                >
                  Generate
                </Button>
              </div>
            </div>

            <Select
              label="Robot Brand"
              value={formData.brand}
              onChange={handleBrandChange}
              options={brandOptions}
              required
            />

            <Input
              label="Model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              error={errors.model}
              placeholder="e.g., UR5e, IRB 1200"
              required
            />

            <Input
              label="IP Address"
              value={formData.ip_address}
              onChange={(e) => handleInputChange('ip_address', e.target.value)}
              error={errors.ip_address}
              placeholder="192.168.1.100"
              required
            />

            <Input
              label="Port"
              type="number"
              value={formData.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
              error={errors.port}
              min="1"
              max="65535"
              required
            />

            <Select
              label="Protocol"
              value={formData.protocol}
              onChange={(value) => handleInputChange('protocol', value)}
              options={protocolOptions}
              required
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Register Robot</span>
            </Button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div style={{ color: robotAbstractionApi.getBrandColor(formData.brand) }}>
                  <RobotIcon className="w-4 h-4" />
                </div>
                <span>
                  {robotAbstractionApi.formatBrandName(formData.brand)} robot will be registered
                </span>
              </div>
            </div>
          </div>

          {/* Brand-specific information */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {robotAbstractionApi.formatBrandName(formData.brand)} Information
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>Default Port: {getDefaultPort(formData.brand)}</p>
              <p>Capabilities: {robotAbstractionApi.getCapabilitiesForBrand(formData.brand).join(', ')}</p>
              {formData.brand === RobotBrand.UNIVERSAL_ROBOTS && (
                <p className="text-blue-600">Note: Supports collaborative operation and force control</p>
              )}
              {formData.brand === RobotBrand.BOSTON_DYNAMICS && (
                <p className="text-green-600">Note: Mobile robot with autonomous navigation</p>
              )}
              {formData.brand === RobotBrand.ABB && (
                <p className="text-orange-600">Note: Industrial robot with high payload capacity</p>
              )}
            </div>
          </div>

          {/* Connection Test */}
          <div className="mt-4 p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Connection Requirements
                </p>
                <ul className="mt-1 text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Ensure the robot is powered on and network accessible</li>
                  <li>• Verify the IP address and port are correct</li>
                  <li>• Check that the robot's communication interface is enabled</li>
                  <li>• For Universal Robots: Enable external control mode</li>
                  <li>• For ABB: Ensure Robot Web Services is running</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
