import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  ModuleDefinition,
  ModuleInstance,
  ModuleSettings,
  ModulePermissions,
  ModularRole
} from '@/types/module.types';

export class ModuleService {
  private static instance: ModuleService;
  private modules: Map<string, ModuleDefinition> = new Map();
  private moduleInstances: Map<string, ModuleInstance> = new Map();
  private roles: Map<string, ModularRole> = new Map();
  private currentClubId?: string;

  private constructor() {}

  static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService();
    }
    return ModuleService.instance;
  }

  // ========== Initialisation ==========

  async initialize(clubId: string): Promise<void> {
    this.currentClubId = clubId;

    try {
      // Charger les définitions de modules
      await this.loadModuleDefinitions();

      // Charger les instances de modules pour ce club
      await this.loadModuleInstances(clubId);

      // Charger les rôles modulaires
      await this.loadModularRoles(clubId);

      // Vérifier les mises à jour
      await this.checkForUpdates();

      console.log(`ModuleService initialized for club ${clubId}`);
    } catch (error) {
      console.error('Failed to initialize ModuleService:', error);
      throw error;
    }
  }

  // ========== Gestion des Modules ==========

  async loadModuleDefinitions(): Promise<void> {
    // Charger depuis la collection globale des modules
    const modulesRef = collection(db, 'module_definitions');
    const snapshot = await getDocs(modulesRef);

    this.modules.clear();
    snapshot.forEach((doc) => {
      const module = { id: doc.id, ...doc.data() } as ModuleDefinition;
      this.modules.set(module.id, module);
    });
  }

  async loadModuleInstances(clubId: string): Promise<void> {
    const instancesRef = collection(db, `clubs/${clubId}/modules`);
    const snapshot = await getDocs(instancesRef);

    this.moduleInstances.clear();
    snapshot.forEach((doc) => {
      const instance = { moduleId: doc.id, ...doc.data() } as ModuleInstance;
      this.moduleInstances.set(instance.moduleId, instance);
    });
  }

  async installModule(
    clubId: string,
    moduleId: string,
    initialSettings?: Record<string, any>
  ): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Vérifier les dépendances
    if (module.dependencies) {
      for (const depId of module.dependencies) {
        if (!this.isModuleInstalled(depId)) {
          throw new Error(`Dependency ${depId} must be installed first`);
        }
      }
    }

    // Vérifier les incompatibilités
    if (module.incompatibleWith) {
      for (const incompId of module.incompatibleWith) {
        if (this.isModuleInstalled(incompId)) {
          throw new Error(`Module ${incompId} is incompatible with ${moduleId}`);
        }
      }
    }

    // Créer l'instance du module
    const instance: ModuleInstance = {
      moduleId,
      clubId,
      settings: initialSettings || this.getDefaultSettings(module),
      permissions: this.getDefaultPermissions(module),
      isActive: true,
      installedAt: new Date(),
      installedBy: this.getCurrentUserId(),
    };

    // Sauvegarder dans Firebase
    const batch = writeBatch(db);

    // Instance du module
    const instanceRef = doc(db, `clubs/${clubId}/modules/${moduleId}`);
    batch.set(instanceRef, {
      ...instance,
      installedAt: serverTimestamp(),
    });

    // Créer les collections de données du module
    await this.createModuleDataStructure(clubId, moduleId);

    // Exécuter le hook d'installation si présent
    if (module.config?.hooks?.onInstall) {
      await this.executeHook(module.config.hooks.onInstall, { clubId, moduleId });
    }

    await batch.commit();

    // Mettre à jour le cache local
    this.moduleInstances.set(moduleId, instance);

    console.log(`Module ${moduleId} installed successfully for club ${clubId}`);
  }

  async uninstallModule(clubId: string, moduleId: string): Promise<void> {
    const module = this.modules.get(moduleId);
    const instance = this.moduleInstances.get(moduleId);

    if (!module || !instance) {
      throw new Error(`Module ${moduleId} is not installed`);
    }

    if (module.isCore) {
      throw new Error(`Core module ${moduleId} cannot be uninstalled`);
    }

    // Vérifier si d'autres modules en dépendent
    for (const [otherId, otherModule] of this.modules) {
      if (otherModule.dependencies?.includes(moduleId) &&
          this.isModuleInstalled(otherId)) {
        throw new Error(`Module ${otherId} depends on ${moduleId}`);
      }
    }

    // Exécuter le hook de désinstallation
    if (module.config?.hooks?.onUninstall) {
      await this.executeHook(module.config.hooks.onUninstall, { clubId, moduleId });
    }

    // Supprimer l'instance
    await deleteDoc(doc(db, `clubs/${clubId}/modules/${moduleId}`));

    // Optionnel : archiver les données au lieu de les supprimer
    await this.archiveModuleData(clubId, moduleId);

    this.moduleInstances.delete(moduleId);

    console.log(`Module ${moduleId} uninstalled from club ${clubId}`);
  }

  async enableModule(clubId: string, moduleId: string): Promise<void> {
    const instance = this.moduleInstances.get(moduleId);
    if (!instance) {
      throw new Error(`Module ${moduleId} is not installed`);
    }

    if (instance.isActive) {
      return; // Déjà actif
    }

    const module = this.modules.get(moduleId);

    // Exécuter le hook d'activation
    if (module?.config?.hooks?.onEnable) {
      await this.executeHook(module.config.hooks.onEnable, { clubId, moduleId });
    }

    await updateDoc(doc(db, `clubs/${clubId}/modules/${moduleId}`), {
      isActive: true,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: this.getCurrentUserId(),
    });

    instance.isActive = true;

    console.log(`Module ${moduleId} enabled for club ${clubId}`);
  }

  async disableModule(clubId: string, moduleId: string): Promise<void> {
    const instance = this.moduleInstances.get(moduleId);
    const module = this.modules.get(moduleId);

    if (!instance || !module) {
      throw new Error(`Module ${moduleId} is not installed`);
    }

    if (module.isCore) {
      throw new Error(`Core module ${moduleId} cannot be disabled`);
    }

    if (!instance.isActive) {
      return; // Déjà inactif
    }

    // Exécuter le hook de désactivation
    if (module.config?.hooks?.onDisable) {
      await this.executeHook(module.config.hooks.onDisable, { clubId, moduleId });
    }

    await updateDoc(doc(db, `clubs/${clubId}/modules/${moduleId}`), {
      isActive: false,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: this.getCurrentUserId(),
    });

    instance.isActive = false;

    console.log(`Module ${moduleId} disabled for club ${clubId}`);
  }

  // ========== Gestion des Paramètres ==========

  async getModuleSettings(moduleId: string): Promise<Record<string, any>> {
    const instance = this.moduleInstances.get(moduleId);
    if (!instance) {
      throw new Error(`Module ${moduleId} is not installed`);
    }
    return instance.settings;
  }

  async updateModuleSettings(
    clubId: string,
    moduleId: string,
    settings: Record<string, any>
  ): Promise<void> {
    const instance = this.moduleInstances.get(moduleId);
    const module = this.modules.get(moduleId);

    if (!instance || !module) {
      throw new Error(`Module ${moduleId} is not installed`);
    }

    // Valider les paramètres
    this.validateSettings(module, settings);

    await updateDoc(doc(db, `clubs/${clubId}/modules/${moduleId}`), {
      settings,
      lastUpdated: serverTimestamp(),
      lastUpdatedBy: this.getCurrentUserId(),
    });

    instance.settings = settings;

    console.log(`Settings updated for module ${moduleId}`);
  }

  private validateSettings(
    module: ModuleDefinition,
    settings: Record<string, any>
  ): void {
    // Parcourir toutes les définitions de paramètres
    if (!module.settings) return;

    for (const category of Object.keys(module.settings)) {
      for (const setting of Object.values(module.settings[category])) {
        const value = settings[setting.key];

        // Vérifier les champs requis
        if (setting.required && value === undefined) {
          throw new Error(`Setting ${setting.key} is required`);
        }

        // Valider selon le type
        if (value !== undefined && setting.validation) {
          const validation = setting.validation;

          if (validation.min !== undefined && value < validation.min) {
            throw new Error(`${setting.key} must be at least ${validation.min}`);
          }

          if (validation.max !== undefined && value > validation.max) {
            throw new Error(`${setting.key} must be at most ${validation.max}`);
          }

          if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
              throw new Error(`${setting.key} format is invalid`);
            }
          }

          if (validation.custom) {
            const result = validation.custom(value);
            if (result !== true) {
              throw new Error(typeof result === 'string' ? result : `${setting.key} validation failed`);
            }
          }
        }
      }
    }
  }

  // ========== Gestion des Permissions ==========

  async hasModulePermission(
    userId: string,
    moduleId: string,
    permissionId: string
  ): Promise<boolean> {
    // Récupérer le rôle de l'utilisateur
    const userRole = await this.getUserRole(userId);
    if (!userRole) return false;

    // Vérifier si le module est actif
    const instance = this.moduleInstances.get(moduleId);
    if (!instance?.isActive) return false;

    // Vérifier les permissions du rôle pour ce module
    const modulePermissions = userRole.modulePermissions[moduleId] || [];
    return modulePermissions.includes(permissionId);
  }

  async grantModulePermission(
    clubId: string,
    roleId: string,
    moduleId: string,
    permissionId: string
  ): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Vérifier que la permission existe dans le module
    const permissionExists = this.moduleHasPermission(module, permissionId);
    if (!permissionExists) {
      throw new Error(`Permission ${permissionId} not found in module ${moduleId}`);
    }

    // Ajouter la permission
    if (!role.modulePermissions[moduleId]) {
      role.modulePermissions[moduleId] = [];
    }

    if (!role.modulePermissions[moduleId].includes(permissionId)) {
      role.modulePermissions[moduleId].push(permissionId);

      await updateDoc(doc(db, `clubs/${clubId}/roles/${roleId}`), {
        [`modulePermissions.${moduleId}`]: role.modulePermissions[moduleId],
        updatedAt: serverTimestamp(),
        updatedBy: this.getCurrentUserId(),
      });
    }
  }

  async revokeModulePermission(
    clubId: string,
    roleId: string,
    moduleId: string,
    permissionId: string
  ): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    if (!role.modulePermissions[moduleId]) {
      return; // Aucune permission pour ce module
    }

    const index = role.modulePermissions[moduleId].indexOf(permissionId);
    if (index > -1) {
      role.modulePermissions[moduleId].splice(index, 1);

      await updateDoc(doc(db, `clubs/${clubId}/roles/${roleId}`), {
        [`modulePermissions.${moduleId}`]: role.modulePermissions[moduleId],
        updatedAt: serverTimestamp(),
        updatedBy: this.getCurrentUserId(),
      });
    }
  }

  // ========== Gestion des Rôles Modulaires ==========

  async loadModularRoles(clubId: string): Promise<void> {
    const rolesRef = collection(db, `clubs/${clubId}/roles`);
    const snapshot = await getDocs(rolesRef);

    this.roles.clear();
    snapshot.forEach((doc) => {
      const role = { id: doc.id, ...doc.data() } as ModularRole;
      this.roles.set(role.id, role);
    });
  }

  async createRole(
    clubId: string,
    role: Omit<ModularRole, 'id' | 'clubId' | 'createdAt' | 'createdBy'>
  ): Promise<string> {
    const roleId = this.generateId('role');

    const newRole: ModularRole = {
      ...role,
      id: roleId,
      clubId,
      createdAt: new Date(),
      createdBy: this.getCurrentUserId(),
    };

    await setDoc(doc(db, `clubs/${clubId}/roles/${roleId}`), {
      ...newRole,
      createdAt: serverTimestamp(),
    });

    this.roles.set(roleId, newRole);

    return roleId;
  }

  async updateRole(
    clubId: string,
    roleId: string,
    updates: Partial<ModularRole>
  ): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    if (role.isSystem) {
      // Limiter les modifications sur les rôles système
      const allowedUpdates = ['description', 'color', 'icon'];
      for (const key of Object.keys(updates)) {
        if (!allowedUpdates.includes(key)) {
          throw new Error(`Cannot modify ${key} of system role`);
        }
      }
    }

    await updateDoc(doc(db, `clubs/${clubId}/roles/${roleId}`), {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: this.getCurrentUserId(),
    });

    Object.assign(role, updates);
  }

  async deleteRole(clubId: string, roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    if (role.isSystem) {
      throw new Error('Cannot delete system role');
    }

    // Vérifier qu'aucun utilisateur n'a ce rôle
    const usersWithRole = await this.getUsersWithRole(clubId, roleId);
    if (usersWithRole.length > 0) {
      throw new Error(`Cannot delete role: ${usersWithRole.length} users have this role`);
    }

    await deleteDoc(doc(db, `clubs/${clubId}/roles/${roleId}`));
    this.roles.delete(roleId);
  }

  // ========== Méthodes Utilitaires ==========

  getModule(moduleId: string): ModuleDefinition | undefined {
    return this.modules.get(moduleId);
  }

  getInstalledModules(): ModuleInstance[] {
    return Array.from(this.moduleInstances.values());
  }

  getActiveModules(): ModuleInstance[] {
    return this.getInstalledModules().filter(m => m.isActive);
  }

  isModuleInstalled(moduleId: string): boolean {
    return this.moduleInstances.has(moduleId);
  }

  isModuleActive(moduleId: string): boolean {
    return this.moduleInstances.get(moduleId)?.isActive || false;
  }

  getAllRoles(): ModularRole[] {
    return Array.from(this.roles.values());
  }

  getRole(roleId: string): ModularRole | undefined {
    return this.roles.get(roleId);
  }

  private async createModuleDataStructure(
    clubId: string,
    moduleId: string
  ): Promise<void> {
    // Créer les collections spécifiques au module
    const batch = writeBatch(db);

    // Structure de base pour chaque module
    const dataPath = `clubs/${clubId}/module_data/${moduleId}`;

    // Document de métadonnées
    batch.set(doc(db, `${dataPath}/metadata`), {
      createdAt: serverTimestamp(),
      version: '1.0.0',
      schemaVersion: 1,
    });

    await batch.commit();
  }

  private async archiveModuleData(
    clubId: string,
    moduleId: string
  ): Promise<void> {
    // Archiver les données au lieu de les supprimer
    const sourcePath = `clubs/${clubId}/module_data/${moduleId}`;
    const archivePath = `clubs/${clubId}/archived_modules/${moduleId}`;

    // TODO: Implémenter la copie récursive des données
    console.log(`Archiving data from ${sourcePath} to ${archivePath}`);
  }

  private getDefaultSettings(module: ModuleDefinition): Record<string, any> {
    const settings: Record<string, any> = {};

    if (!module.settings) return settings;

    for (const category of Object.values(module.settings)) {
      for (const setting of Object.values(category)) {
        settings[setting.key] = setting.defaultValue;
      }
    }

    return settings;
  }

  private getDefaultPermissions(module: ModuleDefinition): Record<string, string[]> {
    // Permissions par défaut pour les rôles système
    return {
      superadmin: this.getAllModulePermissions(module),
      admin: this.getAdminModulePermissions(module),
      validateur: this.getValidateurModulePermissions(module),
      user: this.getUserModulePermissions(module),
    };
  }

  private getAllModulePermissions(module: ModuleDefinition): string[] {
    const permissions: string[] = [];

    if (!module.permissions) return permissions;

    for (const category of Object.values(module.permissions)) {
      for (const permission of category) {
        permissions.push(permission.id);
      }
    }

    return permissions;
  }

  private getAdminModulePermissions(module: ModuleDefinition): string[] {
    const permissions: string[] = [];

    if (!module.permissions) return permissions;

    for (const category of Object.values(module.permissions)) {
      for (const permission of category) {
        // Admin a tout sauf les permissions critiques
        if (permission.riskLevel !== 'critical') {
          permissions.push(permission.id);
        }
      }
    }

    return permissions;
  }

  private getValidateurModulePermissions(module: ModuleDefinition): string[] {
    const permissions: string[] = [];

    if (!module.permissions) return permissions;

    for (const category of Object.values(module.permissions)) {
      for (const permission of category) {
        // Validateur a les permissions opérationnelles
        if (permission.category !== 'admin' && permission.riskLevel !== 'high') {
          permissions.push(permission.id);
        }
      }
    }

    return permissions;
  }

  private getUserModulePermissions(module: ModuleDefinition): string[] {
    const permissions: string[] = [];

    if (!module.permissions) return permissions;

    for (const category of Object.values(module.permissions)) {
      for (const permission of category) {
        // User a uniquement les permissions de base
        if (permission.category === 'view' || permission.riskLevel === 'low') {
          permissions.push(permission.id);
        }
      }
    }

    return permissions;
  }

  private moduleHasPermission(
    module: ModuleDefinition,
    permissionId: string
  ): boolean {
    if (!module.permissions) return false;

    for (const category of Object.values(module.permissions)) {
      if (category.some(p => p.id === permissionId)) {
        return true;
      }
    }

    return false;
  }

  private async getUserRole(userId: string): Promise<ModularRole | undefined> {
    // TODO: Implémenter la récupération du rôle de l'utilisateur
    const memberDoc = await getDoc(
      doc(db, `clubs/${this.currentClubId}/members/${userId}`)
    );

    if (!memberDoc.exists()) return undefined;

    const roleId = memberDoc.data().roleId;
    return this.roles.get(roleId);
  }

  private async getUsersWithRole(
    clubId: string,
    roleId: string
  ): Promise<string[]> {
    const membersRef = collection(db, `clubs/${clubId}/members`);
    const q = query(membersRef, where('roleId', '==', roleId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.id);
  }

  private async executeHook(
    hookName: string,
    context: Record<string, any>
  ): Promise<void> {
    // TODO: Implémenter l'exécution des hooks
    console.log(`Executing hook: ${hookName}`, context);
  }

  private async checkForUpdates(): Promise<void> {
    // TODO: Vérifier les mises à jour des modules
    console.log('Checking for module updates...');
  }

  private getCurrentUserId(): string {
    // TODO: Récupérer l'ID de l'utilisateur actuel
    return 'current-user-id';
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton
export const moduleService = ModuleService.getInstance();
