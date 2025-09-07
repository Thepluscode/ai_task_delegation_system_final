'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  PlusIcon,
  ArrowLeftIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  WifiIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useRobots } from '@/lib/hooks/useRobots'

export default function FleetManagementPage() {
  const { robots, isLoading, error } = useRobots()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    robot_id: '',
    robot_type: 'universal_robots',
    name: '',
    ip_address: '',
    port: '',
    capabilities: []
  })

  const robotTypes = [
    { value: 'universal_robots', label: 'Universal Robots (UR)' },
    { value: 'abb', label: 'ABB Industrial Robots' },
    { value: 'kuka', label: 'KUKA Robots' },
    { value: 'fanuc', label: 'FANUC Robots' },
    { value: 'boston_dynamics', label: 'Boston Dynamics' },
    { value: 'custom', label: 'Custom Robot' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // TODO: Implement robot registration
    console.log('Registering robot:', formData)
    setShowAddForm(false)
    setFormData({
      robot_id: '',
      robot_type: 'universal_robots',
      name: '',
      ip_address: '',
      port: '',
      capabilities: []
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/robots">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Fleet</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Fleet Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Add and configure robots for your automation fleet
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Robot</span>
        </Button>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-100 dark:bg-success-900/20 rounded-lg">
                <RocketLaunchIcon className="w-6 h-6 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Robots
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {robots?.filter(r => r.status === 'online').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <CpuChipIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Robots
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {robots?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                <WifiIcon className="w-6 h-6 text-warning-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Fleet Efficiency
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {robots?.length > 0 ? Math.round((robots.filter(r => r.status === 'online').length / robots.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Robot Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Robot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Robot ID
                  </label>
                  <Input
                    value={formData.robot_id}
                    onChange={(e) => handleInputChange('robot_id', e.target.value)}
                    placeholder="e.g., ur5e_002"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Robot Type
                  </label>
                  <Select
                    value={formData.robot_type}
                    onChange={(value) => handleInputChange('robot_type', value)}
                    options={robotTypes}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Assembly Robot #2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    IP Address
                  </label>
                  <Input
                    value={formData.ip_address}
                    onChange={(e) => handleInputChange('ip_address', e.target.value)}
                    placeholder="e.g., 192.168.1.100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Port
                  </label>
                  <Input
                    type="number"
                    value={formData.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    placeholder="e.g., 30001"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Robot
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/robots/connect">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <WifiIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Connect Robot
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect an existing robot to the fleet
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/robots/control">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <CpuChipIcon className="w-12 h-12 text-success-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Control Panel
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Access robot control interface
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/robots">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <RocketLaunchIcon className="w-12 h-12 text-warning-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Fleet Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor all robots in real-time
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
