/**
 * AI Module
 * 
 * Handles AI-related functionality for robots including
 * decision making, learning models, and task optimization.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Module imports
import { NotificationModule } from '../notification/notification.module';

// Service imports
import { FailurePredictionService } from './failure-prediction.service';
import { FeatureService } from './feature.service';
// import { AiDecisionService } from './ai-decision.service';
// import { AiLearningService } from './ai-learning.service';

@Module({
  imports: [
    ConfigModule,
    NotificationModule,
  ],
  controllers: [
    // AI-related controllers will go here
  ],
  providers: [
    FailurePredictionService,
    FeatureService,
    // AiDecisionService,
    // AiLearningService
  ],
  exports: [
    FailurePredictionService,
    FeatureService,
    // AiDecisionService,
    // AiLearningService
  ],
})
export class AiModule {}