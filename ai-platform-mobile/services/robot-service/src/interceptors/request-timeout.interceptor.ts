/**
 * Request Timeout Interceptor
 * 
 * Automatically times out requests that take too long to process.
 * Helps prevent resource exhaustion and improves system resilience.
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RequestTimeoutInterceptor implements NestInterceptor {
  private readonly timeoutValue: number = 30000;
  
  constructor(private readonly configService?: ConfigService) {
    if (this.configService) {
      this.timeoutValue = this.configService.get<number>('REQUEST_TIMEOUT_MS', 30000);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    return next.handle().pipe(
      timeout(this.timeoutValue),
      catchError((err: unknown) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException(
            'Request processing time exceeded the limit'
          ));
        }
        return throwError(() => err);
      }),
    );
  }
}