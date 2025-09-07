'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  CameraIcon,
  EyeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import { useVisionProcessing } from '@/lib/hooks/useEdgeComputing'
import { edgeComputingApi } from '@/lib/api/edgeComputing'
import { VisionProcessingType } from '@/types/edge-computing'

export function VisionProcessing() {
  const {
    processTestFrame,
    recentResults,
    clearRecentResults,
    getAverageProcessingTime,
    processingStats,
    loading
  } = useVisionProcessing()

  const [selectedProcessingType, setSelectedProcessingType] = useState(VisionProcessingType.QUALITY_INSPECTION)
  const [isProcessing, setIsProcessing] = useState(false)

  const processingTypes = [
    {
      type: VisionProcessingType.QUALITY_INSPECTION,
      icon: <CheckCircleIcon className="w-5 h-5" />,
      description: 'Detect defects and quality issues',
      targetTime: '5ms'
    },
    {
      type: VisionProcessingType.SAFETY_MONITORING,
      icon: <ShieldCheckIcon className="w-5 h-5" />,
      description: 'Monitor safety violations',
      targetTime: '2ms'
    },
    {
      type: VisionProcessingType.OBJECT_DETECTION,
      icon: <EyeIcon className="w-5 h-5" />,
      description: 'Detect and classify objects',
      targetTime: '8ms'
    }
  ]

  const handleProcessFrame = async (processingType) => {
    setIsProcessing(true)
    try {
      await processTestFrame(processingType)
    } finally {
      setIsProcessing(false)
    }
  }

  const getProcessingTypeIcon = (processingType) => {
    const typeConfig = processingTypes.find(t => t.type === processingType)
    return typeConfig?.icon || <CameraIcon className="w-5 h-5" />
  }

  const getResultIcon = (result) => {
    if (result.error) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
    }
    
    if (result.result.defect_detected || result.result.safety_violation) {
      return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
    }
    
    return <CheckCircleIcon className="w-4 h-4 text-green-500" />
  }

  const formatResult = (result) => {
    if (result.error) {
      return `Error: ${result.error}`
    }

    const { result: analysisResult } = result
    
    if (analysisResult.defect_detected !== undefined) {
      return `Quality: ${analysisResult.defect_detected ? 'Defect Detected' : 'Pass'} (${(analysisResult.quality_score * 100).toFixed(1)}%)`
    }
    
    if (analysisResult.safety_violation !== undefined) {
      return `Safety: ${analysisResult.safety_violation ? 'Violation' : 'Safe'} (${analysisResult.risk_level})`
    }
    
    if (analysisResult.objects_detected) {
      return `Objects: ${analysisResult.objects_detected.length} detected`
    }
    
    return 'Analysis completed'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Computer Vision Processing
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time vision analysis with minimal latency
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" size="sm">
            {processingStats.totalFrames} Frames Processed
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={clearRecentResults}
            disabled={recentResults.length === 0}
          >
            Clear Results
          </Button>
        </div>
      </div>

      {/* Processing Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {processingTypes.map((typeConfig) => {
          const avgTime = getAverageProcessingTime(typeConfig.type)
          const isSelected = selectedProcessingType === typeConfig.type
          
          return (
            <Card 
              key={typeConfig.type}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
              onClick={() => setSelectedProcessingType(typeConfig.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: `${edgeComputingApi.getVisionProcessingColor(typeConfig.type)}20`,
                      color: edgeComputingApi.getVisionProcessingColor(typeConfig.type)
                    }}
                  >
                    {typeConfig.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {edgeComputingApi.formatVisionProcessingType(typeConfig.type)}
                    </h4>
                    <p className="text-xs text-gray-500">
                      Target: {typeConfig.targetTime}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {typeConfig.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Avg: {avgTime > 0 ? edgeComputingApi.formatResponseTime(avgTime) : 'N/A'}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProcessFrame(typeConfig.type)
                    }}
                    disabled={loading || isProcessing}
                    className="flex items-center space-x-1"
                  >
                    {loading || isProcessing ? (
                      <StopIcon className="w-3 h-3" />
                    ) : (
                      <PlayIcon className="w-3 h-3" />
                    )}
                    <span>Test</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Processing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <CameraIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Frames
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {processingStats.totalFrames}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <ClockIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg Time
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {edgeComputingApi.formatResponseTime(processingStats.averageTime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {processingStats.successRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <EyeIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Processing
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {loading || isProcessing ? 'Active' : 'Idle'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vision Processing Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentResults.slice(0, 10).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getResultIcon(result)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {formatResult(result)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {edgeComputingApi.formatResponseTime(result.processing_time_ms)}
                  </p>
                  {result.result.confidence && (
                    <p className="text-xs text-gray-500">
                      {(result.result.confidence * 100).toFixed(1)}% confidence
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {recentResults.length === 0 && (
              <div className="text-center py-8">
                <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No vision processing results yet
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Test" on any processing type to start
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
