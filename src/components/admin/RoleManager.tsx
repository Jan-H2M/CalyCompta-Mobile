import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertTriangle,
  Crown,
  UserCheck,
  CheckCircle,
  User
} from 'lucide-react';
import { moduleService } from '@/services/core/moduleService';
import type { ModularRole } from '@/types/module.types';
import { RoleForm } from './RoleForm';

interface RoleManagerProps {
  clubId: string;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RoleManager: React.FC<RoleManagerProps> = ({
  clubId,
  onNotification
}) => {
  const [roles, setRoles] = useState<ModularRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<ModularRole | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const allRoles = moduleService.getAllRoles();
    setRoles(allRoles);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditRole = (role: ModularRole) => {
    setSelectedRole(role);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteRole = async (role: ModularRole) => {
    if (role.isSystem) {
      if (onNotification) {
        onNotification('Les rôles système ne peuvent pas être supprimés', 'error');
      }
      return;
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`
    );

    if (!confirmed) return;

    try {
      await moduleService.deleteRole(clubId, role.id);

      if (onNotification) {
        onNotification(`Rôle "${role.name}" supprimé avec succès`, 'success');
      }

      loadRoles();
    } catch (error: any) {
      if (onNotification) {
        onNotification(`Erreur: ${error.message}`, 'error');
      }
    }
  };

  const handleFormClose = (success?: boolean) => {
    setShowForm(false);
    setSelectedRole(null);
    setIsEditing(false);

    if (success) {
      loadRoles();
    }
  };

  const getRoleIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      User: User,
      UserCheck: UserCheck,
      CheckCircle: CheckCircle,
      Shield: Shield,
      Crown: Crown,
    };
    const Icon = icons[iconName] || Shield;
    return <Icon className="w-5 h-5" />;
  };

  const getLevelBadge = (level: number) => {
    const badges: Record<number, { label: string; color: string }> = {
      0: { label: 'Basique', color: 'bg-gray-100 text-gray-800' },
      1: { label: 'Standard', color: 'bg-blue-100 text-blue-800' },
      2: { label: 'Avancé', color: 'bg-green-100 text-green-800' },
      3: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
      4: { label: 'Super Admin', color: 'bg-red-100 text-red-800' },
    };

    const badge = badges[level] || badges[0];
    return (
      <span className={`px-2 py-1 text-xs rounded ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getTotalPermissions = (role: ModularRole) => {
    return Object.values(role.modulePermissions).reduce(
      (total, perms) => total + perms.length,
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Gestion des Rôles
          </h2>
          <p className="text-gray-600 mt-1">
            Créez et gérez les rôles avec leurs permissions modulaires
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Rôle
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Role Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg bg-${role.color}-100 text-${role.color}-600 mr-3`}>
                  {getRoleIcon(role.icon)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.name}</h3>
                  {role.isSystem && (
                    <span className="text-xs text-gray-500">Système</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditRole(role)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDeleteRole(role)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Role Description */}
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>

            {/* Role Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Niveau</span>
                {getLevelBadge(role.level)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Permissions</span>
                <span className="text-sm font-medium text-gray-900">
                  {getTotalPermissions(role)} total
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Modules</span>
                <span className="text-sm font-medium text-gray-900">
                  {Object.keys(role.modulePermissions).length} configurés
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Statut</span>
                <span
                  className={`text-sm font-medium ${
                    role.isActive ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  {role.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucun rôle trouvé</p>
          <button
            onClick={handleCreateRole}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Créer le premier rôle
          </button>
        </div>
      )}

      {/* Role Form Modal */}
      {showForm && (
        <RoleForm
          clubId={clubId}
          role={selectedRole}
          isEditing={isEditing}
          onClose={handleFormClose}
          onNotification={onNotification}
        />
      )}
    </div>
  );
};
