import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Shield,
  Palette,
  Tag,
  AlertCircle,
  CheckCircle,
  Users
} from 'lucide-react';
import { moduleService } from '@/services/core/moduleService';
import type { ModularRole, ModuleDefinition } from '@/types/module.types';

interface RoleFormProps {
  clubId: string;
  role: ModularRole | null;
  isEditing: boolean;
  onClose: (success?: boolean) => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  clubId,
  role,
  isEditing,
  onClose,
  onNotification
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 1,
    color: 'blue',
    icon: 'Shield'
  });
  const [modulePermissions, setModulePermissions] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [modules, setModules] = useState<ModuleDefinition[]>([]);

  const availableColors = [
    'blue', 'green', 'purple', 'red', 'yellow', 'indigo', 'pink', 'gray'
  ];

  const availableIcons = [
    'Shield', 'User', 'UserCheck', 'CheckCircle', 'Crown'
  ];

  useEffect(() => {
    loadModules();
    if (role && isEditing) {
      setFormData({
        name: role.name,
        description: role.description,
        level: role.level,
        color: role.color,
        icon: role.icon
      });
      setModulePermissions(role.modulePermissions || {});
    }
  }, [role, isEditing]);

  const loadModules = () => {
    const allModules = moduleService.getAvailableModules();
    setModules(allModules);
  };

  const handlePermissionToggle = (moduleId: string, permissionId: string) => {
    const currentPerms = modulePermissions[moduleId] || [];
    const hasPermission = currentPerms.includes(permissionId);

    const newPerms = hasPermission
      ? currentPerms.filter(p => p !== permissionId)
      : [...currentPerms, permissionId];

    setModulePermissions({
      ...modulePermissions,
      [moduleId]: newPerms
    });
  };

  const handleModuleToggleAll = (moduleId: string, allPermissions: string[]) => {
    const currentPerms = modulePermissions[moduleId] || [];
    const hasAll = allPermissions.every(p => currentPerms.includes(p));

    setModulePermissions({
      ...modulePermissions,
      [moduleId]: hasAll ? [] : allPermissions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      if (onNotification) {
        onNotification('Le nom du rôle est requis', 'error');
      }
      return;
    }

    try {
      setSaving(true);

      const roleData: Partial<ModularRole> = {
        clubId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        level: formData.level,
        color: formData.color,
        icon: formData.icon,
        modulePermissions,
        isActive: true,
        isSystem: false
      };

      if (isEditing && role) {
        await moduleService.updateRole(clubId, role.id, roleData);
        if (onNotification) {
          onNotification(`Rôle "${formData.name}" modifié avec succès`, 'success');
        }
      } else {
        await moduleService.createRole(clubId, roleData as Omit<ModularRole, 'id' | 'createdAt' | 'updatedAt'>);
        if (onNotification) {
          onNotification(`Rôle "${formData.name}" créé avec succès`, 'success');
        }
      }

      onClose(true);
    } catch (error: any) {
      if (onNotification) {
        onNotification(`Erreur: ${error.message}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const getAllPermissionIds = (module: ModuleDefinition): string[] => {
    if (!module.permissions) return [];

    const allPerms: string[] = [];
    Object.values(module.permissions).forEach((perms: any[]) => {
      perms.forEach((perm: any) => {
        allPerms.push(perm.id);
      });
    });
    return allPerms;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              {isEditing ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
            </h2>
            {role?.isSystem && (
              <p className="text-sm text-yellow-600 mt-1">
                ⚠️ Rôle système - Certaines modifications sont limitées
              </p>
            )}
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du rôle *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Gestionnaire"
                  disabled={role?.isSystem}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau (0-4)
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>0 - Basique</option>
                  <option value={1}>1 - Standard</option>
                  <option value={2}>2 - Avancé</option>
                  <option value={3}>3 - Admin</option>
                  <option value={4}>4 - Super Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Décrivez les responsabilités de ce rôle..."
              />
            </div>

            {/* Color and Icon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Couleur
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: `var(--color-${color}-500, #${color === 'blue' ? '3B82F6' : color === 'green' ? '10B981' : color === 'purple' ? '8B5CF6' : color === 'red' ? 'EF4444' : color === 'yellow' ? 'F59E0B' : color === 'indigo' ? '6366F1' : color === 'pink' ? 'EC4899' : '6B7280'})` }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Icône
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Module Permissions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Permissions des modules
              </h3>

              <div className="space-y-4">
                {modules.map((module) => {
                  if (!module.permissions || Object.keys(module.permissions).length === 0) {
                    return null;
                  }

                  const allPerms = getAllPermissionIds(module);
                  const selectedPerms = modulePermissions[module.id] || [];
                  const hasAll = allPerms.length > 0 && allPerms.every(p => selectedPerms.includes(p));

                  return (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{module.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleModuleToggleAll(module.id, allPerms)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {hasAll ? 'Tout désélectionner' : 'Tout sélectionner'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(module.permissions).map(([category, perms]: [string, any[]]) => (
                          <div key={category}>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                              {category.replace(/_/g, ' ')}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {perms.map((perm: any) => {
                                const hasPermission = selectedPerms.includes(perm.id);
                                return (
                                  <label
                                    key={perm.id}
                                    className="flex items-start cursor-pointer p-2 rounded hover:bg-gray-50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={hasPermission}
                                      onChange={() => handlePermissionToggle(module.id, perm.id)}
                                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-2">
                                      <span className="text-sm text-gray-900">{perm.label}</span>
                                      {perm.riskLevel === 'high' || perm.riskLevel === 'critical' ? (
                                        <AlertCircle className="w-3 h-3 text-red-500 inline ml-1" />
                                      ) : null}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Configuration des permissions
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Sélectionnez les permissions que ce rôle pourra exercer dans chaque module. Les permissions critiques sont marquées d'une icône d'alerte.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={saving}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Mettre à jour' : 'Créer le rôle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
