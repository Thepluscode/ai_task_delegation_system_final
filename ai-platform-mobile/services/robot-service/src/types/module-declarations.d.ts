/**
 * Type declarations for external modules
 * 
 * This file provides type declarations for modules used in the application
 * to resolve TypeScript errors. In a real deployment, these would come from
 * installed @types packages or the modules themselves.
 */

// NestJS Common
declare module '@nestjs/common' {
  export function Module(options: any): ClassDecorator;
  
  export namespace Module {
    function forRoot(options?: any): any;
    function forRootAsync(options?: any): any;
    function forFeature(options?: any): any;
    function register(options?: any): any;
    function registerAsync(options?: any): any;
  }
  
  export function Injectable(): ClassDecorator;
  
  export interface NestMiddleware {
    use(req: any, res: any, next: any): void;
  }
  
  export class ValidationPipe {
    constructor(options?: any);
  }
  
  export class RequestTimeoutException {
    constructor(message?: string);
  }
  
  export interface NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
  }
  
  export interface ExecutionContext {
    switchToHttp(): any;
    switchToRpc(): any;
    switchToWs(): any;
    getClass(): any;
    getHandler(): any;
  }
  
  export interface CallHandler {
    handle(): Observable<any>;
  }
}

// NestJS Core
declare module '@nestjs/core' {
  export class NestFactory {
    static create(module: any, options?: any): Promise<any>;
  }
}

// NestJS Config
declare module '@nestjs/config' {
  export class ConfigModule {
    static forRoot(options?: any): any;
  }
  
  export class ConfigService {
    get<T>(key: string, defaultValue?: T): T;
  }
}

// NestJS TypeORM
declare module '@nestjs/typeorm' {
  export class TypeOrmModule {
    static forRoot(options?: any): any;
    static forRootAsync(options?: any): any;
    static forFeature(entities?: any[]): any;
  }
}

// NestJS Swagger
declare module '@nestjs/swagger' {
  export class DocumentBuilder {
    setTitle(title: string): this;
    setDescription(description: string): this;
    setVersion(version: string): this;
    addTag(tag: string): this;
    addBearerAuth(): this;
    build(): any;
  }
  
  export class SwaggerModule {
    static createDocument(app: any, config: any): any;
    static setup(path: string, app: any, document: any): void;
  }
}

// NestJS Microservices
declare module '@nestjs/microservices' {
  export enum Transport {
    KAFKA = 'KAFKA',
    TCP = 'TCP',
    REDIS = 'REDIS',
    NATS = 'NATS',
    MQTT = 'MQTT',
    RMQ = 'RMQ',
    GRPC = 'GRPC'
  }
  
  export interface MicroserviceOptions {
    transport: Transport;
    options?: any;
  }
  
  export class ClientsModule {
    static register(clients: any[]): any;
    static registerAsync(clients: any[]): any;
  }
}

// Nestjs-Pino
declare module 'nestjs-pino' {
  export class Logger {
    constructor(options?: any);
    log(message: any): void;
    error(message: any): void;
    warn(message: any): void;
    debug(message: any): void;
    verbose(message: any): void;
  }
  
  export class LoggerModule {
    static forRoot(options?: any): any;
    static forRootAsync(options?: any): any;
  }
}

// Express
declare module 'express' {
  export interface Request {
    headers: Record<string, any>;
    [key: string]: any;
  }
  
  export interface Response {
    setHeader(name: string, value: string | string[]): this;
    [key: string]: any;
  }
  
  export type NextFunction = (error?: any) => void;
}

// UUID
declare module 'uuid' {
  export function v4(): string;
}

// RxJS
declare module 'rxjs' {
  export class Observable<T> {
    pipe(...operators: any[]): Observable<any>;
  }
  
  export function throwError(factory: () => any): Observable<any>;
  
  export class TimeoutError extends Error {}
}

declare module 'rxjs/operators' {
  export function timeout(due: number): any;
  export function catchError(selector: (err: any) => any): any;
}