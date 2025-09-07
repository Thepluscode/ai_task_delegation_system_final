/**
 * Notification Module
 * 
 * Handles sending notifications and alerts for robot events, failures,
 * and system status changes.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [],
  providers: [
    NotificationService,
  ],
  exports: [
    NotificationService,
  ],
})
export class NotificationModule {}