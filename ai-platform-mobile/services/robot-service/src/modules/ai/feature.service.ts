/**
 * Feature Engineering Service
 * 
 * Responsible for extracting, transforming, and processing telemetry data
 * into features that can be used by machine learning models for predictions.
 */

import { Injectable, Logger } from '@nestjs/common';

// Define inline TelemetryData interface to avoid import issues
interface TelemetryData {
  robotId: string;
  timestamp: Date;
  batteryLevel: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  vibration?: number;
  motorSpeed?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  sensorData?: {
    voltage?: number;
    current?: number;
    load?: number;
  };
  errorCodes?: string[];
  status?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  /**
   * Extract features from telemetry data for failure prediction
   * @param telemetryData Array of telemetry data points
   * @returns Processed features for ML model input
   */
  async extractFeaturesFromTelemetry(telemetryData: TelemetryData[]): Promise<{
    timeSeries: number[][];
    scalar: Record<string, number>;
  }> {
    this.logger.log(`Extracting features from ${telemetryData.length} telemetry data points`);
    
    // Sort telemetry data by timestamp to ensure chronological order
    const sortedData = [...telemetryData].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Extract time series features (for LSTM/sequence models)
    const timeSeriesFeatures = this.extractTimeSeriesFeatures(sortedData);
    
    // Extract scalar features (statistical aggregates)
    const scalarFeatures = this.extractScalarFeatures(sortedData);
    
    return {
      timeSeries: timeSeriesFeatures,
      scalar: scalarFeatures,
    };
  }

  /**
   * Extract time series features for sequential models
   * @param sortedData Chronologically sorted telemetry data
   * @returns Matrix of time series features
   */
  private extractTimeSeriesFeatures(sortedData: TelemetryData[]): number[][] {
    // Normalize the data length to 24 data points (can be adjusted based on model requirements)
    const targetLength = 24;
    const stride = Math.max(1, Math.floor(sortedData.length / targetLength));
    
    const features: number[][] = [];
    
    // Sample data points with stride to get representative time series
    for (let i = 0; i < sortedData.length; i += stride) {
      if (features.length >= targetLength) break;
      
      const dataPoint = sortedData[i];
      
      // Extract relevant numeric metrics from telemetry
      const pointFeatures = [
        dataPoint.temperature || 0,
        dataPoint.vibration || 0,
        dataPoint.humidity || 0,
        dataPoint.pressure || 0,
        dataPoint.sensorData?.voltage || 0,
        dataPoint.sensorData?.current || 0,
        dataPoint.sensorData?.load || 0,
        dataPoint.motorSpeed || 0,
        dataPoint.errorCodes?.length || 0,
        dataPoint.batteryLevel || 0,
      ];
      
      features.push(pointFeatures);
    }
    
    // Pad or truncate to ensure consistent dimensions
    while (features.length < targetLength) {
      // Padding with last known values or zeros if empty
      const lastFeatures = features.length > 0 ? [...features[features.length - 1]] : Array(10).fill(0);
      features.push(lastFeatures);
    }
    
    return features;
  }

  /**
   * Extract scalar features (statistical aggregations)
   * @param sortedData Chronologically sorted telemetry data
   * @returns Object with scalar features
   */
  private extractScalarFeatures(sortedData: TelemetryData[]): Record<string, number> {
    // Initialize result object
    const result: Record<string, number> = {};
    
    // Get all temperature readings
    const temps = sortedData.map(d => d.temperature || 0);
    if (temps.length > 0) {
      result.temperature_mean = temps.reduce((a, b) => a + b, 0) / temps.length;
      result.temperature_min = Math.min(...temps);
      result.temperature_max = Math.max(...temps);
    }
    
    // Get all vibration readings
    const vibs = sortedData.map(d => d.vibration || 0);
    if (vibs.length > 0) {
      result.vibration_mean = vibs.reduce((a, b) => a + b, 0) / vibs.length;
      result.vibration_min = Math.min(...vibs);
      result.vibration_max = Math.max(...vibs);
    }
    
    // Get all humidity readings
    const humid = sortedData.map(d => d.humidity || 0);
    if (humid.length > 0) {
      result.humidity_mean = humid.reduce((a, b) => a + b, 0) / humid.length;
    }
    
    // Get all error counts
    const errors = sortedData.map(d => d.errorCodes?.length || 0);
    if (errors.length > 0) {
      result.error_count_mean = errors.reduce((a, b) => a + b, 0) / errors.length;
    }
    
    // Add data quality metrics
    result.data_points = sortedData.length;
    
    return result;
  }
}