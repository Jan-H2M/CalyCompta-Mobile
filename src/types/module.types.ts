// Types de base pour l'architecture modulaire
export interface ModuleDefinition {
  // Identification
  id: string;                          // Identifiant unique du module
  name: string;                        // Nom affiché
  description: string;                 // Description détaillée
  icon: string;                        // Icône Lucide React
  version: string;                     // Version du module

  // Classification
  category: 'core' | 'finance' | 'operations' | 'communication' | 'admin' | 'extension';
  isCore: boolean;                     // Module système non désactivable
  isActive: boolean;                   // État d'activation

  // Dépendances
  dependencies?: string[];              // Modules requis
  incompatibleWith?: string[];         // Modules incompatibles

  // Settings et permissions
  settings?: ModuleSettings;
  permissions?: ModulePermissions;
  config?: ModuleConfig;

  // Métadonnées
  author?: string;
  createdAt: Date;
  updatedAt?: Date;
  installedAt?: Date;
  installedBy?: string;
}

export interface ModuleSettings {
  [category: string]: {
    [key: string]: SettingDefinition;
  };
}

export interface SettingDefinition {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'number' | 'string' | 'select' | 'multiselect' | 'json' | 'date' | 'color';
  defaultValue: any;
  required?: boolean;
  validation?: SettingValidation;
  options?: Array<{ value: any; label: string }>;  // Pour select/multiselect
  dependsOn?: string;                              // Dépendance conditionnelle
  category?: string;                               // Groupe de paramètres
  advanced?: boolean;                              // Paramètre avancé
}

export interface SettingValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

export interface ModulePermission {
  id: string;                          // permission.id unique dans le module
  label: string;                       // Nom affiché
  description: string;                 // Description détaillée
  category: 'view' | 'create' | 'update' | 'delete' | 'manage' | 'admin';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresCondition?: string;          // Condition supplémentaire
  impliedPermissions?: string[];       // Permissions incluses
}

export interface ModulePermissions {
  [category: string]: ModulePermission[];
}

export interface ModuleConfig {
  // Routes
  routes: ModuleRoute[];

  // Navigation
  menuItems: ModuleMenuItem[];

  // Widgets dashboard
  widgets?: ModuleWidget[];

  // Hooks et événements
  hooks?: ModuleHooks;

  // API endpoints
  apiEndpoints?: ModuleApiEndpoint[];

  // Tâches planifiées
  scheduledTasks?: ModuleScheduledTask[];
}

export interface ModuleRoute {
  path: string;
  component: string;
  permission?: string;
  exact?: boolean;
  props?: Record<string, any>;
}

export interface ModuleMenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  permission?: string;
  badge?: { type: 'count' | 'new' | 'alert'; value?: number | string };
  subItems?: ModuleMenuItem[];
  position?: number;
}

export interface ModuleWidget {
  id: string;
  component: string;
  position: 'dashboard' | 'sidebar' | 'header';
  permission?: string;
  defaultSize?: { w: number; h: number };
  resizable?: boolean;
}

export interface ModuleHooks {
  onInstall?: string;         // Fonction à exécuter à l'installation
  onUninstall?: string;       // Fonction à exécuter à la désinstallation
  onEnable?: string;          // Fonction à exécuter à l'activation
  onDisable?: string;         // Fonction à exécuter à la désactivation
  onUpdate?: string;          // Fonction à exécuter à la mise à jour
}

export interface ModuleApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: string;
  permission?: string;
  rateLimit?: number;
}

export interface ModuleScheduledTask {
  id: string;
  name: string;
  schedule: string;           // Cron expression
  handler: string;
  enabled: boolean;
}

// Instance d'un module pour un club
export interface ModuleInstance {
  moduleId: string;
  clubId: string;
  settings: Record<string, any>;
  permissions: Record<string, string[]>;  // roleId -> permissions[]
  isActive: boolean;
  installedAt: Date;
  installedBy: string;
  lastUpdated?: Date;
  lastUpdatedBy?: string;
  customData?: Record<string, any>;
}

// Rôle avec permissions modulaires
export interface ModularRole {
  id: string;
  clubId: string;
  name: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  isSystem: boolean;
  isActive: boolean;

  // Permissions par module
  modulePermissions: {
    [moduleId: string]: string[];  // Liste des permissions pour ce module
  };

  // Hiérarchie
  canManage: string[];              // Rôles que ce rôle peut gérer

  // Métadonnées
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// Export pour compatibilité
export type ModuleId = string;
export type PermissionId = string;
export type RoleId = string;
