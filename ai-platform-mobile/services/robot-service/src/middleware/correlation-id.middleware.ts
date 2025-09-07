/**
 * Correlation ID Middleware
 * 
 * Adds or extracts a correlation ID from requests to enable request tracking
 * across microservices in the distributed system.
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    
    // Add correlation ID to request
    req.headers['x-correlation-id'] = correlationId;
    
    // Add correlation ID to response
    res.setHeader('X-Correlation-ID', correlationId);
    
    next();
  }
}