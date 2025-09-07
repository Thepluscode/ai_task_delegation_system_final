/**
 * Robot Service - App Module
 * 
 * This is the root module for the Robot Service microservice in the AutomatedAIPlatform.
 * It integrates all the required modules and dependencies.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';

// Add Node.js process declaration
declare const process: {
  env: {
    [key: string]: string | undefined;
    NODE_ENV?: string;
  };
};

// Import application modules
import { RobotsModule } from './modules/robots/robots.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'robot_service'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        ssl: configService.get<boolean>('DB_SSL', false) 
          ? { rejectUnauthorized: false }
          : undefined,
      }),
    }),
    
    // Logging
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get<string>('LOG_LEVEL', 'info'),
          transport: process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        },
      }),
    }),
    
    // Application Modules
    RobotsModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}