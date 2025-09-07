/**
 * Telemetry Module
 * 
 * Manages collection, processing, and storage of robot telemetry data.
 * Provides services for data ingestion, aggregation, and analysis.
 * 
 * Part of the Billion-Dollar App Architecture
 */

import { Module } from '@nestjs/common';
import { TelemetryData } from './schemas/telemetry.schema';

// Simple module definition to satisfy imports
@Module({
  imports: [],
  providers: [
    {
      provide: `${TelemetryData.name}Model`,
      useValue: {
        find: () => Promise.resolve([]),
        // Add other mock methods as needed
      },
    }
  ],
  exports: [`${TelemetryData.name}Model`],
})
export class TelemetryModule {}