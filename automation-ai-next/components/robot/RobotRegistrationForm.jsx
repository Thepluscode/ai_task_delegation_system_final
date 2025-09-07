'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { 
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useRobotOperations } from '@/lib/hooks/useRobots'
import { RobotBrand } from '@/types/robot'

export function RobotRegistrationForm({ isOpen, onClose, onSuccess }) {
  const { registerRobot, loading } = useRobotOperations()
  const [formData, setFormData] = useState({
    robot_id: '',
    brand: '',
    model: '',
    ip_address: '',
    port: 502,
    protocol: 'tcp',
    credentials: {},
    custom_config: {}
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Network Config, 3: Advanced

  const brandOptions = [
    { value: RobotBrand.UNIVERSAL_ROBOTS, label: 'Universal Robots' },
    { value: RobotBrand.ABB, label: 'ABB' },
    { value: RobotBrand.KUKA, label: 'KUKA' },
    { value: RobotBrand.FANUC, label: 'Fanuc' },
    { value: RobotBrand.BOSTON_DYNAMICS, label: 'Boston Dynamics' },
    { value: RobotBrand.CUSTOM, label: 'Custom' },
  ]

  const protocolOptions = [
    { value: 'tcp', label: 'TCP' },
    { value: 'modbus', label: 'Modbus' },
    { value: 'ethernet_ip', label: 'Ethernet/IP' },
    { value: 'opcua', label: 'OPC UA' },
    { value: 'custom', label: 'Custom' },
  ]

  const validateStep = (stepNumber) => {
    const newErrors = {}

    if (stepNumber === 1) {
      if (!formData.robot_id.trim()) {
        newErrors.robot_id = 'Robot ID is required'
      }
      if (!formData.brand) {
        newErrors.brand = 'Robot brand is required'
      }
      if (!formData.model.trim()) {
        newErrors.model = 'Robot model is required'
      }
    }

    if (stepNumber === 2) {
      if (!formData.ip_address.trim()) {
        newErrors.ip_address = 'IP address is required'
      } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip_address)) {
        newErrors.ip_address = 'Invalid IP address format'
      }
      if (!formData.port || formData.port < 1 || formData.port > 65535) {
        newErrors.port = 'Port must be between 1 and 65535'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(step)) {
      return
    }

    try {
      const result = await registerRobot(formData)
      
      if (result.success) {
        onSuccess?.(result)
        onClose()
        // Reset form
        setFormData({
          robot_id: '',
          brand: '',
          model: '',
          ip_address: '',
          port: 502,
          protocol: 'tcp',
          credentials: {},
          custom_config: {}
        })
        setStep(1)
        setErrors({})
      }
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const getBrandInfo = (brand) => {
    const brandInfo = {
      [RobotBrand.UNIVERSAL_ROBOTS]: {
        defaultPort: 30002,
        protocols: ['tcp', 'modbus'],
        description: 'Collaborative robots with URScript programming'
      },
      [RobotBrand.ABB]: {
        defaultPort: 80,
        protocols: ['tcp', 'ethernet_ip'],
        description: 'Industrial robots with RAPID programming'
      },
      [RobotBrand.KUKA]: {
        defaultPort: 7000,
        protocols: ['tcp', 'ethernet_ip'],
        description: 'Industrial robots with KRL programming'
      },
      [RobotBrand.FANUC]: {
        defaultPort: 8193,
        protocols: ['tcp', 'ethernet_ip'],
        description: 'Industrial robots with KAREL programming'
      },
      [RobotBrand.BOSTON_DYNAMICS]: {
        defaultPort: 443,
        protocols: ['tcp'],
        description: 'Mobile robots with advanced mobility'
      },
      [RobotBrand.CUSTOM]: {
        defaultPort: 502,
        protocols: ['tcp', 'modbus', 'custom'],
        description: 'Custom robot implementation'
      }
    }
    return brandInfo[brand] || brandInfo[RobotBrand.CUSTOM]
  }

  // Update default port when brand changes
  const handleBrandChange = (brand) => {
    const brandInfo = getBrandInfo(brand)
    handleInputChange('brand', brand)
    handleInputChange('port', brandInfo.defaultPort)
    handleInputChange('protocol', brandInfo.protocols[0])
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Robot Information
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter the basic details for your robot
              </p>
            </div>

            <Input
              label="Robot ID"
              value={formData.robot_id}
              onChange={(e) => handleInputChange('robot_id', e.target.value)}
              error={errors.robot_id}
              placeholder="e.g., UR5e-001, ABB-IRB120-01"
              required
            />

            <Select
              label="Robot Brand"
              value={formData.brand}
              onChange={handleBrandChange}
              options={brandOptions}
              error={errors.brand}
              required
            />

            {formData.brand && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      {brandOptions.find(b => b.value === formData.brand)?.label}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {getBrandInfo(formData.brand).description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Input
              label="Robot Model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              error={errors.model}
              placeholder="e.g., UR5e, IRB120, KR AGILUS"
              required
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Network Configuration
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure the network connection to your robot
              </p>
            </div>

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
              onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 502)}
              error={errors.port}
              helperText={`Default port for ${formData.brand}: ${getBrandInfo(formData.brand).defaultPort}`}
              required
            />

            <Select
              label="Protocol"
              value={formData.protocol}
              onChange={(value) => handleInputChange('protocol', value)}
              options={protocolOptions.filter(p => 
                getBrandInfo(formData.brand).protocols.includes(p.value)
              )}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Review & Register
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Review your robot configuration before registering
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Robot ID</p>
                    <p className="text-gray-900 dark:text-white">{formData.robot_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Brand</p>
                    <p className="text-gray-900 dark:text-white">
                      {brandOptions.find(b => b.value === formData.brand)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Model</p>
                    <p className="text-gray-900 dark:text-white">{formData.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</p>
                    <p className="text-gray-900 dark:text-white">{formData.ip_address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Port</p>
                    <p className="text-gray-900 dark:text-white">{formData.port}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Protocol</p>
                    <p className="text-gray-900 dark:text-white">{formData.protocol.toUpperCase()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-warning-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                    Connection Test
                  </p>
                  <p className="text-sm text-warning-600 dark:text-warning-300">
                    The system will attempt to connect to your robot during registration. 
                    Make sure the robot is powered on and accessible on the network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Robot"
      size="lg"
      closeOnOverlayClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}>
                {step > stepNumber ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>
              {stepNumber < 3 && (
                <div className={`
                  w-12 h-0.5 mx-2
                  ${step > stepNumber ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Register Robot</span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
