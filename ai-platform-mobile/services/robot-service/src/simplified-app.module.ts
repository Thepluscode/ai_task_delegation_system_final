/**
 * Simplified App Module
 * 
 * A minimal module configuration for testing bootstrap process
 * without complex dependencies like databases or external services.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    // Configuration - required for most services
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Logging - simplified configuration
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production' 
          ? { target: 'pino-pretty' }
          : undefined,
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class SimplifiedAppModule {}