import React, { useState, useEffect } from 'react';
import { Shield, Users, Lock, Unlock, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { moduleService } from '@/services/core/moduleService';
import type { ModuleDefinition, ModularRole } from '@/types/module.types';

interface ModulePermissionsProps {
  module: ModuleDefinition;
  clubId: string;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ModulePermissions: React.FC<ModulePermissionsProps> = ({
  module,
  clubId,
  onNotification
}) => {
  const [roles, setRoles] = useState<ModularRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole]);

  const loadRoles = () => {
    const allRoles = moduleService.getAllRoles();
    setRoles(allRoles);
    if (allRoles.length > 0 && !selectedRole) {
      setSelectedRole(allRoles[0].id);
    }
  };

  const loadRolePermissions = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role) {
      const perms = role.modulePermissions[module.id] || [];
      setRolePermissions(perms);
      setHasChanges(false);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    const hasPermission = rolePermissions.includes(permissionId);

    const newPermissions = hasPermission
      ? rolePermissions.filter(p => p !== permissionId)
      : [...rolePermissions, permissionId];

    setRolePermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);

      await moduleService.updateRoleModulePermissions(
        clubId,
        selectedRole,
        module.id,
        rolePermissions
      );

      setHasChanges(false);

      if (onNotification) {
        onNotification('Permissions enregistrées avec succès', 'success');
      }

      // Reload roles to get fresh data
      loadRoles();
    } catch (error: any) {
      if (onNotification) {
        onNotification(`Erreur: ${error.message}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedRole) {
      loadRolePermissions(selectedRole);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    const colors: Record<string, string> = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[riskLevel] || 'text-gray-600';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[riskLevel] || 'bg-gray-100 text-gray-800';
  };

  const groupedPermissions: Record<string, any[]> = {};

  if (module.permissions) {
    Object.entries(module.permissions).forEach(([category, perms]) => {
      groupedPermissions[category] = perms;
    });
  }

  if (!module.permissions || Object.keys(groupedPermissions).length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Ce module n'a pas de permissions configurables
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionner un rôle
        </label>
        <select
          value={selectedRole || ''}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} {role.isSystem ? '(Système)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Permissions Grid */}
      {selectedRole && (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                {category.replace(/_/g, ' ')}
              </h3>

              <div className="space-y-3">
                {perms.map((perm: any) => {
                  const hasPermission = rolePermissions.includes(perm.id);

                  return (
                    <div
                      key={perm.id}
                      className="flex items-start justify-between p-3 bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              onChange={() => handlePermissionToggle(perm.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 font-medium text-gray-900">
                              {perm.label}
                            </span>
                          </label>

                          <span className={`ml-3 px-2 py-1 text-xs rounded ${getRiskBadgeColor(perm.riskLevel)}`}>
                            {perm.riskLevel}
                          </span>
                        </div>

                        <p className="ml-8 mt-1 text-sm text-gray-600">
                          {perm.description}
                        </p>

                        {perm.requiresCondition && (
                          <div className="ml-8 mt-2 flex items-start">
                            <AlertCircle className="w-4 h-4 text-yellow-500 mr-1 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">
                              Condition requise: {perm.requiresCondition}
                            </p>
                          </div>
                        )}

                        {perm.impliedPermissions && perm.impliedPermissions.length > 0 && (
                          <div className="ml-8 mt-2">
                            <p className="text-xs text-gray-500">
                              Inclut: {perm.impliedPermissions.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {hasPermission ? (
                          <Unlock className={`w-5 h-5 ${getRiskColor(perm.riskLevel)}`} />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Permission Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Résumé des permissions
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {rolePermissions.length} permission(s) accordée(s) pour ce rôle
                </p>
              </div>
            </div>
          </div>

          {/* Save/Reset Buttons */}
          {hasChanges && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
