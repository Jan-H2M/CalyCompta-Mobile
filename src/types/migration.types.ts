export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  execute: () => Promise<void>;
  rollback?: () => Promise<void>;
  validate?: () => Promise<boolean>;
  estimatedDuration?: number;  // en secondes
}

export interface MigrationPlan {
  id: string;
  version: string;
  steps: MigrationStep[];
  beforeMigration?: () => Promise<void>;
  afterMigration?: () => Promise<void>;
  rollbackPlan?: () => Promise<void>;
}

export interface MigrationStatus {
  planId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  currentStep?: string;
  progress: number;  // 0-100
  startedAt?: Date;
  completedAt?: Date;
  errors?: string[];
  logs: MigrationLog[];
}

export interface MigrationLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
}
