/**
 * Debug Bootstrap
 * 
 * A verbose startup script to help diagnose NestJS initialization issues.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Type-safe wrapper for config service
function getConfigValue<T>(configService: ConfigService, key: string, defaultValue: T): T {
  return configService.get(key, defaultValue) as T;
}

async function debugBootstrap() {
  // Create custom logger
  const logger = new Logger('DebugBootstrap');
  
  try {
    logger.log('Starting NestJS application with verbose debug logging...');
    
    // Attempt to create the app with all logs enabled
    logger.log('Creating NestJS application instance...');
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      abortOnError: false,
      bufferLogs: true,
    });
    
    logger.log('NestJS application instance created successfully!');
    
    // Get configuration service
    logger.log('Accessing ConfigService...');
    const configService = app.get(ConfigService);
    logger.log('ConfigService initialized successfully!');
    
    // Configure logger
    logger.log('Setting up application logger...');
    app.useLogger(app.get(Logger));
    logger.log('Logger configured!');
    
    // Configure CORS
    logger.log('Setting up CORS...');
    const corsOrigins = getConfigValue(configService, 'CORS_ORIGINS', '*').split(',');
    logger.log(`CORS Origins: ${corsOrigins.join(', ')}`);
    app.enableCors({
      origin: corsOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Accept,Authorization,X-Correlation-ID',
      credentials: true,
    });
    logger.log('CORS configured successfully!');
    
    // Start HTTP server
    const port = getConfigValue(configService, 'PORT', 3001);
    logger.log(`Attempting to listen on port ${port}...`);
    await app.listen(port);
    
    logger.log(`🤖 Robot Service is running on port ${port}`);
    logger.log('Startup complete! Service is ready to accept connections.');
  } catch (error) {
    logger.error('CRITICAL ERROR DURING BOOTSTRAP:');
    
    // Handle error properly with type checking
    if (error instanceof Error) {
      logger.error(`Error name: ${error.name}`);
      logger.error(`Error message: ${error.message}`);
      logger.error(`Error stack: ${error.stack || 'No stack trace available'}`);
    } else {
      logger.error(`Unknown error type: ${String(error)}`);
    }
    
    process.exit(1);
  }
}

// Run the debug bootstrap
debugBootstrap()
  .then(() => {
    console.log('Debug bootstrap executed successfully');
  })
  .catch(err => {
    console.error('Uncaught error in debug bootstrap:', err);
    process.exit(1);
  });