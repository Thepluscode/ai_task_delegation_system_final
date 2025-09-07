/**
 * Telemetry Data Schema
 * 
 * Schema for robot telemetry data collected from various sensors and systems.
 * This data is used for monitoring, analytics, and predictive maintenance.
 * 
 * Part of the Billion-Dollar App Architecture
 */

// Create a class instead of an interface to support @InjectModel
export class TelemetryData {
  static schemaName = 'TelemetryData'; // Renamed to avoid conflict with Function.name
  
  id?: string;
  _id?: any;
  robotId!: string;
  timestamp!: Date;
  sensorData?: Record<string, number>;
  batteryLevel!: number;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  vibration?: number;
  motorSpeed?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
  errorCodes?: string[];
  location?: {
    x: number;
    y: number;
    z: number;
  };
  status?: string;
  metadata?: Record<string, any>;
}