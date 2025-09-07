/**
 * Robots Module
 * 
 * Handles all robot-related functionality including management,
 * telemetry processing, and command distribution.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

// This will contain entity imports once they're created
// import { Robot } from './entities/robot.entity';
// import { RobotTelemetry } from './entities/robot-telemetry.entity';

// This will contain controller and service imports once they're created
// import { RobotsController } from './robots.controller';
// import { RobotsService } from './robots.service';

@Module({
  imports: [
    // Register robot-related entities with TypeORM
    TypeOrmModule.forFeature([
      // Robot, 
      // RobotTelemetry
    ]),
    
    // Register Kafka client for event-driven communication
    ClientsModule.registerAsync([
      {
        name: 'ROBOT_EVENTS',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'robot-service-events',
              brokers: configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(','),
            },
            consumer: {
              groupId: 'robot-events-consumer',
            },
          },
        }),
      },
    ]),
  ],
  controllers: [
    // RobotsController
  ],
  providers: [
    // RobotsService
  ],
  exports: [
    // RobotsService
  ],
})
export class RobotsModule {}