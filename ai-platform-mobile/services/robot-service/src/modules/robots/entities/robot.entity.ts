/**
 * Robot Entity
 * 
 * Represents a robot in the system with all relevant properties.
 * Used for database operations and business logic.
 * 
 * Part of the Billion-Dollar App Architecture
 */

// Simple class definition without TypeORM decorators to resolve import issues
export class Robot {
  id!: string;
  name!: string;
  serialNumber!: string;
  model!: string;
  manufacturer!: string;
  status!: 'Active' | 'Inactive' | 'Maintenance' | 'Error';
  domain!: 'Manufacturing' | 'Healthcare' | 'Logistics' | 'Retail' | 'Education' | 'Other';
  description?: string;
  capabilities?: Record<string, any>;
  configuration?: Record<string, any>;
  location?: string;
  lastMaintenanceDate?: Date;
  nextScheduledMaintenance?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<Robot>) {
    Object.assign(this, partial);
  }
}