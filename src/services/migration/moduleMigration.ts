import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  getDocs,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { CORE_MODULES, OPTIONAL_MODULES } from '@/config/modules/coreModules';
import type { MigrationPlan, MigrationStatus, MigrationLog } from '@/types/migration.types';

export class ModuleMigrationService {
  private status: MigrationStatus;
  private logs: MigrationLog[] = [];

  constructor() {
    this.status = {
      planId: 'modular-migration-v1',
      status: 'pending',
      progress: 0,
      logs: []
    };
  }

  // Main migration method
  async executeMigration(clubId: string): Promise<void> {
    try {
      this.log('info', 'Starting modular migration...');
      this.status.status = 'running';
      this.status.startedAt = new Date();

      // Step 1: Backup existing data
      await this.backupExistingData(clubId);
      this.updateProgress(10);

      // Step 2: Create module definitions
      await this.createModuleDefinitions();
      this.updateProgress(20);

      // Step 3: Migrate existing roles
      await this.migrateRoles(clubId);
      this.updateProgress(30);

      // Step 4: Install core modules
      await this.installCoreModules(clubId);
      this.updateProgress(50);

      // Step 5: Migrate existing settings
      await this.migrateSettings(clubId);
      this.updateProgress(70);

      // Step 6: Migrate existing data
      await this.migrateData(clubId);
      this.updateProgress(90);

      // Step 7: Validate migration
      await this.validateMigration(clubId);
      this.updateProgress(100);

      this.status.status = 'completed';
      this.status.completedAt = new Date();
      this.log('success', 'Migration completed successfully!');

    } catch (error) {
      this.status.status = 'failed';
      this.status.errors = [error.message];
      this.log('error', `Migration failed: ${error.message}`);
      throw error;
    }
  }

  // Step 1: Backup existing data
  private async backupExistingData(clubId: string): Promise<void> {
    this.log('info', 'Creating backup of existing data...');

    const batch = writeBatch(db);
    const backupPath = `clubs/${clubId}/backups/pre-modular-${Date.now()}`;

    // Backup settings
    const settingsRef = collection(db, `clubs/${clubId}/settings`);
    const settingsSnapshot = await getDocs(settingsRef);

    settingsSnapshot.forEach((docSnapshot) => {
      batch.set(
        doc(db, `${backupPath}/settings/${docSnapshot.id}`),
        docSnapshot.data()
      );
    });

    // Backup members
    const membersRef = collection(db, `clubs/${clubId}/members`);
    const membersSnapshot = await getDocs(membersRef);

    membersSnapshot.forEach((docSnapshot) => {
      batch.set(
        doc(db, `${backupPath}/members/${docSnapshot.id}`),
        docSnapshot.data()
      );
    });

    await batch.commit();
    this.log('success', 'Backup created successfully');
  }

  // Step 2: Create module definitions
  private async createModuleDefinitions(): Promise<void> {
    this.log('info', 'Creating module definitions...');

    const batch = writeBatch(db);

    // Create core modules
    for (const module of CORE_MODULES) {
      batch.set(
        doc(db, `module_definitions/${module.id}`),
        {
          ...module,
          createdAt: serverTimestamp()
        }
      );
    }

    // Create optional modules
    for (const module of OPTIONAL_MODULES) {
      batch.set(
        doc(db, `module_definitions/${module.id}`),
        {
          ...module,
          createdAt: serverTimestamp()
        }
      );
    }

    await batch.commit();
    this.log('success', `Created ${CORE_MODULES.length + OPTIONAL_MODULES.length} module definitions`);
  }

  // Step 3: Migrate existing roles to modular roles
  private async migrateRoles(clubId: string): Promise<void> {
    this.log('info', 'Migrating existing roles...');

    const existingRoles = [
      { id: 'superadmin', name: 'Super Administrateur', level: 3 },
      { id: 'admin', name: 'Administrateur', level: 2 },
      { id: 'validateur', name: 'Validateur', level: 1 },
      { id: 'user', name: 'Utilisateur', level: 0 },
      { id: 'membre', name: 'Membre', level: -1 }
    ];

    const batch = writeBatch(db);

    for (const role of existingRoles) {
      const modulePermissions = this.mapLegacyPermissions(role.id);

      batch.set(
        doc(db, `clubs/${clubId}/roles/${role.id}`),
        {
          id: role.id,
          clubId,
          name: role.name,
          description: `Rôle système migré`,
          level: role.level,
          color: this.getRoleColor(role.id),
          icon: this.getRoleIcon(role.id),
          isSystem: true,
          isActive: true,
          modulePermissions,
          canManage: this.getRoleHierarchy(role.id),
          createdAt: serverTimestamp(),
          createdBy: 'system-migration'
        }
      );
    }

    await batch.commit();
    this.log('success', `Migrated ${existingRoles.length} roles`);
  }

  // Step 4: Install core modules for the club
  private async installCoreModules(clubId: string): Promise<void> {
    this.log('info', 'Installing core modules...');

    const batch = writeBatch(db);

    for (const module of CORE_MODULES) {
      batch.set(
        doc(db, `clubs/${clubId}/modules/${module.id}`),
        {
          moduleId: module.id,
          clubId,
          settings: this.extractModuleSettings(module),
          permissions: this.getDefaultModulePermissions(module),
          isActive: true,
          installedAt: serverTimestamp(),
          installedBy: 'system-migration'
        }
      );

      // Create module data structure
      batch.set(
        doc(db, `clubs/${clubId}/module_data/${module.id}/metadata`),
        {
          createdAt: serverTimestamp(),
          version: module.version,
          schemaVersion: 1
        }
      );
    }

    await batch.commit();
    this.log('success', `Installed ${CORE_MODULES.length} core modules`);
  }

  // Step 5: Migrate existing settings to module settings
  private async migrateSettings(clubId: string): Promise<void> {
    this.log('info', 'Migrating existing settings...');

    // Load existing settings
    const generalSettings = await this.loadDocument(`clubs/${clubId}/settings/general`);
    const securitySettings = await this.loadDocument(`clubs/${clubId}/settings/security`);
    const downloadSettings = await this.loadDocument(`clubs/${clubId}/settings/downloads`);
    const communicationSettings = await this.loadDocument(`clubs/${clubId}/settings/communication`);

    const batch = writeBatch(db);

    // Map settings to appropriate modules
    if (downloadSettings) {
      batch.update(
        doc(db, `clubs/${clubId}/modules/transactions`),
        {
          'settings.download': downloadSettings,
          updatedAt: serverTimestamp()
        }
      );
    }

    if (generalSettings) {
      // Map general settings to relevant modules
      if (generalSettings.doubleApprovalThreshold !== undefined) {
        batch.update(
          doc(db, `clubs/${clubId}/modules/expenses`),
          {
            'settings.workflow.autoApproveThreshold': generalSettings.doubleApprovalThreshold,
            updatedAt: serverTimestamp()
          }
        );
      }
    }

    if (communicationSettings) {
      // Communication module will handle these settings
      batch.set(
        doc(db, `clubs/${clubId}/modules/communication`),
        {
          moduleId: 'communication',
          clubId,
          settings: communicationSettings,
          isActive: true,
          installedAt: serverTimestamp(),
          installedBy: 'system-migration'
        }
      );
    }

    await batch.commit();
    this.log('success', 'Settings migrated successfully');
  }

  // Step 6: Migrate existing data to module data structure
  private async migrateData(clubId: string): Promise<void> {
    this.log('info', 'Migrating existing data...');

    // Migrate transactions
    await this.migrateTransactions(clubId);

    // Migrate expenses (demandes)
    await this.migrateExpenses(clubId);

    // Migrate events (operations)
    await this.migrateEvents(clubId);

    this.log('success', 'Data migration completed');
  }

  private async migrateTransactions(clubId: string): Promise<void> {
    const transactionsRef = collection(db, `clubs/${clubId}/transactions_bancaires`);
    const snapshot = await getDocs(transactionsRef);

    if (snapshot.empty) return;

    let batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((docSnapshot) => {
      batch.set(
        doc(db, `clubs/${clubId}/module_data/transactions/items/${docSnapshot.id}`),
        {
          ...docSnapshot.data(),
          migratedAt: serverTimestamp()
        }
      );
      count++;

      if (count % 500 === 0) {
        // Commit batch every 500 documents (Firestore limit)
        batch.commit();
        batch = writeBatch(db);
      }
    });

    if (count % 500 !== 0) {
      await batch.commit();
    }

    this.log('info', `Migrated ${count} transactions`);
  }

  private async migrateExpenses(clubId: string): Promise<void> {
    const expensesRef = collection(db, `clubs/${clubId}/demandes_remboursement`);
    const snapshot = await getDocs(expensesRef);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      batch.set(
        doc(db, `clubs/${clubId}/module_data/expenses/requests/${docSnapshot.id}`),
        {
          ...data,
          requesterId: data.demandeur_id, // Rename field
          migratedAt: serverTimestamp()
        }
      );
      count++;
    });

    await batch.commit();
    this.log('info', `Migrated ${count} expense requests`);
  }

  private async migrateEvents(clubId: string): Promise<void> {
    const eventsRef = collection(db, `clubs/${clubId}/operations`);
    const snapshot = await getDocs(eventsRef);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      batch.set(
        doc(db, `clubs/${clubId}/module_data/events/items/${docSnapshot.id}`),
        {
          ...data,
          organizerId: data.organisateur_id, // Rename field
          migratedAt: serverTimestamp()
        }
      );
      count++;
    });

    await batch.commit();
    this.log('info', `Migrated ${count} events`);
  }

  // Step 7: Validate migration
  private async validateMigration(clubId: string): Promise<void> {
    this.log('info', 'Validating migration...');

    const checks = [
      this.checkModulesInstalled(clubId),
      this.checkRolesMigrated(clubId),
      this.checkDataMigrated(clubId)
    ];

    const results = await Promise.all(checks);

    if (results.every(r => r)) {
      this.log('success', 'Migration validation passed');
    } else {
      throw new Error('Migration validation failed');
    }
  }

  // Helper methods
  private mapLegacyPermissions(roleId: string): Record<string, string[]> {
    // Map old permissions to new module-based permissions
    const mappings = {
      superadmin: {
        transactions: ['view', 'create', 'update', 'delete', 'sign', 'reconcile', 'link', 'configure', 'audit'],
        expenses: ['view_all', 'create', 'update_all', 'delete_all', 'approve', 'reject', 'export', 'configure'],
        events: ['view', 'create', 'update_all', 'delete', 'manage_participants', 'send_messages', 'financial_report', 'configure'],
        inventory: ['view', 'search', 'add_items', 'edit_items', 'delete_items', 'create_loan', 'approve_loans', 'manage_cautions', 'configure'],
        admin: ['view_modules', 'install_modules', 'uninstall_modules', 'manage_roles']
      },
      admin: {
        transactions: ['view', 'create', 'update', 'delete', 'sign', 'reconcile', 'link', 'export'],
        expenses: ['view_all', 'create', 'update_all', 'approve', 'reject', 'export'],
        events: ['view', 'create', 'update_all', 'delete', 'manage_participants', 'send_messages'],
        users: ['view', 'create', 'update', 'activate', 'assignRole']
      },
      validateur: {
        transactions: ['view', 'create', 'update', 'categorize', 'sign', 'link', 'export'],
        expenses: ['view_all', 'approve', 'reject', 'comment'],
        events: ['view', 'create', 'update_own', 'manage_participants']
      },
      user: {
        expenses: ['view_own', 'create', 'update_own', 'delete_own'],
        events: ['view', 'register', 'cancel_registration']
      },
      membre: {}
    };

    return mappings[roleId] || {};
  }

  private getRoleColor(roleId: string): string {
    const colors = {
      superadmin: '#7C3AED',  // purple-600
      admin: '#DC2626',       // red-600
      validateur: '#2563EB',  // blue-600
      user: '#10B981',        // green-600
      membre: '#6B7280'       // gray-500
    };
    return colors[roleId] || '#6B7280';
  }

  private getRoleIcon(roleId: string): string {
    const icons = {
      superadmin: 'Crown',
      admin: 'Shield',
      validateur: 'CheckCircle',
      user: 'User',
      membre: 'UserMinus'
    };
    return icons[roleId] || 'User';
  }

  private getRoleHierarchy(roleId: string): string[] {
    const hierarchy = {
      superadmin: ['superadmin', 'admin', 'validateur', 'user', 'membre'],
      admin: ['validateur', 'user', 'membre'],
      validateur: [],
      user: [],
      membre: []
    };
    return hierarchy[roleId] || [];
  }

  private extractModuleSettings(module: any): Record<string, any> {
    const settings = {};

    if (module.settings) {
      Object.values(module.settings).forEach((category) => {
        Object.values(category).forEach((setting: any) => {
          settings[setting.key] = setting.defaultValue;
        });
      });
    }

    return settings;
  }

  private getDefaultModulePermissions(module: any): Record<string, string[]> {
    // Return default permissions for system roles
    return {
      superadmin: this.getAllPermissions(module),
      admin: this.getAdminPermissions(module),
      validateur: this.getValidateurPermissions(module),
      user: this.getUserPermissions(module)
    };
  }

  private getAllPermissions(module: any): string[] {
    const permissions = [];
    if (module.permissions) {
      Object.values(module.permissions).forEach((category: any) => {
        category.forEach((perm: any) => {
          permissions.push(perm.id);
        });
      });
    }
    return permissions;
  }

  private getAdminPermissions(module: any): string[] {
    const permissions = [];
    if (module.permissions) {
      Object.values(module.permissions).forEach((category: any) => {
        category.forEach((perm: any) => {
          if (perm.riskLevel !== 'critical') {
            permissions.push(perm.id);
          }
        });
      });
    }
    return permissions;
  }

  private getValidateurPermissions(module: any): string[] {
    const permissions = [];
    if (module.permissions) {
      Object.values(module.permissions).forEach((category: any) => {
        category.forEach((perm: any) => {
          if (perm.category !== 'admin' && perm.riskLevel !== 'high') {
            permissions.push(perm.id);
          }
        });
      });
    }
    return permissions;
  }

  private getUserPermissions(module: any): string[] {
    const permissions = [];
    if (module.permissions) {
      Object.values(module.permissions).forEach((category: any) => {
        category.forEach((perm: any) => {
          if (perm.category === 'view' || perm.riskLevel === 'low') {
            permissions.push(perm.id);
          }
        });
      });
    }
    return permissions;
  }

  private async loadDocument(path: string): Promise<any> {
    try {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch {
      return null;
    }
  }

  private async checkModulesInstalled(clubId: string): Promise<boolean> {
    const modulesRef = collection(db, `clubs/${clubId}/modules`);
    const snapshot = await getDocs(modulesRef);
    return snapshot.size >= CORE_MODULES.length;
  }

  private async checkRolesMigrated(clubId: string): Promise<boolean> {
    const rolesRef = collection(db, `clubs/${clubId}/roles`);
    const snapshot = await getDocs(rolesRef);
    return snapshot.size >= 5; // At least 5 system roles
  }

  private async checkDataMigrated(clubId: string): Promise<boolean> {
    // Check if module_data structure exists
    const metadataRef = doc(db, `clubs/${clubId}/module_data/transactions/metadata`);
    const docSnap = await getDoc(metadataRef);
    return docSnap.exists();
  }

  private log(level: 'info' | 'warning' | 'error' | 'success', message: string): void {
    const log: MigrationLog = {
      timestamp: new Date(),
      level,
      message
    };

    this.logs.push(log);
    this.status.logs.push(log);

    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  private updateProgress(progress: number): void {
    this.status.progress = progress;
    this.log('info', `Progress: ${progress}%`);
  }

  // Public methods
  getStatus(): MigrationStatus {
    return this.status;
  }

  getLogs(): MigrationLog[] {
    return this.logs;
  }
}

// Export singleton
export const moduleMigration = new ModuleMigrationService();
