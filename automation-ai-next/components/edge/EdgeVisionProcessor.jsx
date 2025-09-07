'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { 
  CameraIcon,
  PlayIcon,
  StopIcon,
  PhotoIcon,
  EyeIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { edgeApi } from '@/lib/api/edge'
import { formatNumber } from '@/lib/utils/helpers'
import toast from 'react-hot-toast'

export function EdgeVisionProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingType, setProcessingType] = useState('quality_inspection')
  const [results, setResults] = useState([])
  const [streamActive, setStreamActive] = useState(false)
  const [metrics, setMetrics] = useState({
    frames_processed: 0,
    avg_processing_time: 0,
    frames_per_second: 0,
    error_rate: 0
  })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)

  const processingTypeOptions = [
    { 
      value: 'quality_inspection', 
      label: 'Quality Inspection',
      icon: MagnifyingGlassIcon,
      description: 'Detect defects and quality issues',
      targetTime: '5ms'
    },
    { 
      value: 'safety_monitoring', 
      label: 'Safety Monitoring',
      icon: ShieldCheckIcon,
      description: 'Monitor for safety violations',
      targetTime: '2ms'
    },
    { 
      value: 'object_detection', 
      label: 'Object Detection',
      icon: EyeIcon,
      description: 'Detect and classify objects',
      targetTime: '8ms'
    },
  ]

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          frameRate: 30
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      
      toast.success('Camera started successfully')
    } catch (error) {
      toast.error('Failed to access camera: ' + error.message)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setStreamActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    toast.success('Camera stopped')
  }, [])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  const processFrame = useCallback(async (frameData) => {
    if (!frameData) return

    const startTime = performance.now()
    
    try {
      // Convert data URL to blob
      const response = await fetch(frameData)
      const blob = await response.blob()
      
      const result = await edgeApi.processVisionFrame(blob, processingType)
      const endTime = performance.now()
      const processingTime = endTime - startTime

      const processedResult = {
        ...result.vision_result,
        processing_type: processingType,
        client_processing_time: processingTime,
        timestamp: new Date().toISOString(),
        frame_data: frameData
      }

      setResults(prev => [processedResult, ...prev.slice(0, 49)]) // Keep last 50 results
      
      // Update metrics
      setMetrics(prev => {
        const newFrameCount = prev.frames_processed + 1
        const newAvgTime = (prev.avg_processing_time * prev.frames_processed + processingTime) / newFrameCount
        
        return {
          frames_processed: newFrameCount,
          avg_processing_time: newAvgTime,
          frames_per_second: prev.frames_per_second, // Will be calculated separately
          error_rate: result.vision_result.error ? 
            (prev.error_rate * prev.frames_processed + 1) / newFrameCount :
            (prev.error_rate * prev.frames_processed) / newFrameCount
        }
      })

    } catch (error) {
      console.error('Frame processing failed:', error)
      setMetrics(prev => ({
        ...prev,
        error_rate: (prev.error_rate * prev.frames_processed + 1) / (prev.frames_processed + 1),
        frames_processed: prev.frames_processed + 1
      }))
    }
  }, [processingType])

  const processSingleFrame = useCallback(async () => {
    setIsProcessing(true)
    const frameData = captureFrame()
    if (frameData) {
      await processFrame(frameData)
    }
    setIsProcessing(false)
  }, [captureFrame, processFrame])

  const startContinuousProcessing = useCallback(() => {
    if (streamActive) {
      stopContinuousProcessing()
      return
    }

    setStreamActive(true)
    let frameCount = 0
    const startTime = Date.now()

    intervalRef.current = setInterval(async () => {
      const frameData = captureFrame()
      if (frameData) {
        frameCount++
        await processFrame(frameData)
        
        // Update FPS every 5 seconds
        if (frameCount % 10 === 0) {
          const elapsed = (Date.now() - startTime) / 1000
          const fps = frameCount / elapsed
          setMetrics(prev => ({ ...prev, frames_per_second: fps }))
        }
      }
    }, 100) // Process every 100ms (10 FPS)
  }, [streamActive, captureFrame, processFrame])

  const stopContinuousProcessing = useCallback(() => {
    setStreamActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setMetrics({
      frames_processed: 0,
      avg_processing_time: 0,
      frames_per_second: 0,
      error_rate: 0
    })
  }, [])

  const getResultIcon = (result) => {
    if (result.error) {
      return <XCircleIcon className="w-4 h-4 text-error-500" />
    }

    switch (result.processing_type) {
      case 'quality_inspection':
        return result.result?.defect_detected ? 
          <XCircleIcon className="w-4 h-4 text-error-500" /> :
          <CheckCircleIcon className="w-4 h-4 text-success-500" />
      case 'safety_monitoring':
        return result.result?.safety_violation ? 
          <ExclamationTriangleIcon className="w-4 h-4 text-error-500" /> :
          <ShieldCheckIcon className="w-4 h-4 text-success-500" />
      case 'object_detection':
        return <EyeIcon className="w-4 h-4 text-primary-500" />
      default:
        return <PhotoIcon className="w-4 h-4 text-gray-500" />
    }
  }

  const getResultSummary = (result) => {
    if (result.error) {
      return `Error: ${result.error}`
    }

    switch (result.processing_type) {
      case 'quality_inspection':
        return `Quality: ${((result.result?.quality_score || 0) * 100).toFixed(1)}% | Confidence: ${((result.result?.confidence || 0) * 100).toFixed(1)}%`
      case 'safety_monitoring':
        return `Risk: ${result.result?.risk_level || 'unknown'} | Confidence: ${((result.result?.confidence || 0) * 100).toFixed(1)}%`
      case 'object_detection':
        return `Objects: ${result.result?.objects_detected?.length || 0} detected`
      default:
        return 'Processed'
    }
  }

  const selectedProcessingType = processingTypeOptions.find(opt => opt.value === processingType)

  useEffect(() => {
    return () => {
      stopCamera()
      stopContinuousProcessing()
    }
  }, [stopCamera, stopContinuousProcessing])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edge Vision Processor
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Real-time computer vision processing with minimal latency
          </p>
        </div>
      </div>

      {/* Camera and Processing Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={startCamera}
                  disabled={!!streamRef.current}
                  className="flex items-center space-x-2"
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>Start Camera</span>
                </Button>
                
                <Button
                  variant="error"
                  onClick={stopCamera}
                  disabled={!streamRef.current}
                  className="flex items-center space-x-2"
                >
                  <StopIcon className="w-4 h-4" />
                  <span>Stop Camera</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select
                label="Processing Type"
                value={processingType}
                onChange={setProcessingType}
                options={processingTypeOptions}
              />
              
              {selectedProcessingType && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <selectedProcessingType.icon className="w-4 h-4 text-primary-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedProcessingType.label}
                    </span>
                    <Badge variant="primary" size="sm">
                      Target: {selectedProcessingType.targetTime}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProcessingType.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={processSingleFrame}
                  disabled={!streamRef.current || isProcessing}
                  loading={isProcessing}
                  className="flex items-center justify-center space-x-2"
                >
                  <PhotoIcon className="w-4 h-4" />
                  <span>Single Frame</span>
                </Button>
                
                <Button
                  variant={streamActive ? 'error' : 'primary'}
                  onClick={startContinuousProcessing}
                  disabled={!streamRef.current}
                  className="flex items-center justify-center space-x-2"
                >
                  {streamActive ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  <span>{streamActive ? 'Stop Stream' : 'Start Stream'}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {formatNumber(metrics.frames_processed)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Frames Processed</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {metrics.avg_processing_time.toFixed(1)}ms
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Processing Time</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">
                {metrics.frames_per_second.toFixed(1)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">FPS</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-error-600">
                {(metrics.error_rate * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Processing Results ({results.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearResults}
              disabled={results.length === 0}
            >
              Clear Results
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No processing results yet. Start the camera and process some frames.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getResultIcon(result)}
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {result.processing_type.replace('_', ' ')}
                      </span>
                      <Badge 
                        variant={result.error ? 'error' : 'success'} 
                        size="sm"
                      >
                        {result.error ? 'Error' : 'Success'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-primary-600">
                        {result.processing_time_ms?.toFixed(2) || result.client_processing_time?.toFixed(2)}ms
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getResultSummary(result)}
                  </p>
                  
                  {result.result?.objects_detected && result.result.objects_detected.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detected Objects:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.result.objects_detected.map((obj, objIndex) => (
                          <Badge key={objIndex} variant="secondary" size="sm">
                            {obj.type} ({(obj.confidence * 100).toFixed(0)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
