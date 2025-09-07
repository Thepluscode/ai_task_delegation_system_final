/**
 * Robot Service - Main Application Entry
 * 
 * This is the entry point for the Robot Service microservice in the AutomatedAIPlatform.
 * It handles robot management, telemetry processing, and command distribution.
 * 
 * Part of the Billion-Dollar App Architecture
 */

import 'reflect-metadata'; // Required for dependency injection
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';
import { RequestTimeoutInterceptor } from './interceptors/request-timeout.interceptor';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

// Define process for TypeScript
declare global {
  namespace NodeJS {
    interface Process {
      exit(code?: number): never;
    }
  }
  var process: NodeJS.Process;
}

// Type-safe wrapper for config service
function getConfigValue<T>(configService: ConfigService, key: string, defaultValue: T): T {
  return configService.get(key, defaultValue) as T;
}

async function bootstrap() {
  // Create the NestJS application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  
  // Get configuration service
  const configService = app.get(ConfigService);
  
  // Configure logger
  app.useLogger(app.get(Logger));
  
  // Configure global middlewares
  app.use(compression());
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(new CorrelationIdMiddleware().use);
  
  // Configure CORS for frontend access
  app.enableCors({
    origin: getConfigValue(configService, 'CORS_ORIGINS', '*').split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Correlation-ID',
    credentials: true,
    maxAge: 86400, // 24 hours
  });
  
  // Configure global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );
  
  // Configure global interceptors
  app.useGlobalInterceptors(new RequestTimeoutInterceptor());
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api/v1');
  
  // Configure Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Robot Service API')
      .setDescription('API for managing robots and processing telemetry data')
      .setVersion('1.0')
      .addTag('robots')
      .addTag('telemetry')
      .addTag('commands')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
  
  // Connect to Kafka for event streaming
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'robot-service',
        brokers: getConfigValue(configService, 'KAFKA_BROKERS', 'localhost:9092').split(','),
        ssl: getConfigValue(configService, 'KAFKA_SSL', false),
        sasl: getConfigValue(configService, 'KAFKA_SASL_ENABLED', false)
          ? {
              mechanism: 'plain',
              username: getConfigValue(configService, 'KAFKA_SASL_USERNAME', ''),
              password: getConfigValue(configService, 'KAFKA_SASL_PASSWORD', ''),
            }
          : undefined,
      },
      consumer: {
        groupId: 'robot-service-consumer',
        allowAutoTopicCreation: true,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      },
      producer: {
        allowAutoTopicCreation: true,
        transactionalId: 'robot-service-producer',
        idempotent: true,
      },
    },
  });
  
  // Start microservices
  await app.startAllMicroservices();
  
  // Start HTTP server
  const port = getConfigValue(configService, 'PORT', 3000);
  await app.listen(port);
  
  console.log(`🤖 Robot Service is running on port ${port}`);
  console.log(`📝 API Documentation is available at /docs`);
}

bootstrap().catch(err => {
  console.error('Failed to start Robot Service', err);
  process.exit(1);
});