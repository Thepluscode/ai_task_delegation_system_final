declare module '@nestjs/common' {
  export function Injectable(): ClassDecorator;
  export class Logger {
    constructor(context?: string);
    log(message: string, context?: string): void;
    error(message: string, error?: any, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
  }
  export class ValidationPipe {
    constructor(options?: any);
  }
}

declare module '@nestjs/core' {
  export const NestFactory: {
    create(appModule: any, options?: any): Promise<any>;
    createMicroservice(app: any, options: any): Promise<any>;
  };
}

declare module '@nestjs/typeorm' {
  export function InjectRepository(entity: any): ParameterDecorator;
  export interface Repository<T> {
    find(options?: any): Promise<T[]>;
    findOne(options?: any): Promise<T | null>;
    create(entityLike: any): T;
    save(entity: any): Promise<T>;
    count(options?: any): Promise<number>;
    createQueryBuilder(alias?: string): any;
  }
}

declare module '@nestjs/config' {
  export class ConfigService {
    get<T>(propertyPath: string, defaultValue?: T): T;
  }
}

declare module '@nestjs/mongoose' {
  export function InjectModel(model: any): ParameterDecorator;
}

declare module '@nestjs/swagger' {
  export const DocumentBuilder: any;
  export const SwaggerModule: any;
}

declare module '@nestjs/microservices' {
  export enum Transport {
    KAFKA,
    REDIS,
    MQTT,
    NATS,
    RMQ,
    GRPC,
    TCP,
    TLS
  }
  export interface MicroserviceOptions {
    transport: Transport;
    options: any;
  }
}

declare module 'mongoose' {
  export interface Model<T> {
    find(criteria: any): any;
    sort(options: any): any;
    limit(n: number): any;
    lean(): any;
    exec(): Promise<any[]>;
  }
}

declare module 'typeorm' {
  export interface Repository<T> {
    find(options?: any): Promise<T[]>;
    findOne(options?: any): Promise<T | null>;
    create(entityLike: any): T;
    save(entity: any): Promise<T>;
    count(options?: any): Promise<number>;
    createQueryBuilder(alias?: string): any;
  }
}

declare module '@tensorflow/tfjs-node' {
  export function loadLayersModel(path: string): Promise<LayersModel>;
  export function tensor3d(data: any, shape: number[]): Tensor;
  export function ones(shape: number[]): Tensor;
  
  export interface LayersModel {
    predict(tensor: Tensor): Tensor;
  }
  
  export interface Tensor {
    data(): Promise<Float32Array>;
    dispose(): void;
  }
}

declare module 'nestjs-pino' {
  export class Logger {}
}

declare module 'compression' {
  function compression(): any;
  namespace compression {}
  export = compression;
}

declare module 'helmet' {
  function helmet(): any;
  namespace helmet {}
  export = helmet;
}

declare module 'morgan' {
  function morgan(format: string, options?: any): any;
  namespace morgan {}
  export = morgan;
}

declare module 'fs' {
  export function existsSync(path: string): boolean;
}

declare module 'path' {
  export function basename(path: string, ext?: string): string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      PORT: string;
      [key: string]: string | undefined;
    }

    interface Process {
      env: ProcessEnv;
      exit(code?: number): never;
    }
    
    interface Timeout {}
  }

  var process: NodeJS.Process;
}