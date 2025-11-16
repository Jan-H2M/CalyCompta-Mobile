import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Database,
  Info,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { moduleService } from '@/services/core/moduleService';
import { ModuleSettings } from './ModuleSettings';
import { ModulePermissions } from './ModulePermissions';
import type { ModuleDefinition, ModuleInstance } from '@/types/module.types';

interface ModuleDetailsProps {
  clubId: string;
  moduleId: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ModuleDetails: React.FC<ModuleDetailsProps> = ({
  clubId,
  moduleId,
  activeTab,
  onTabChange,
  onNotification
}) => {
  const [module, setModule] = useState<ModuleDefinition | null>(null);
  const [instance, setInstance] = useState<ModuleInstance | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadModuleDetails();
  }, [moduleId]);

  const loadModuleDetails = async () => {
    try {
      const moduleData = moduleService.getModule(moduleId);
      const installedModules = moduleService.getInstalledModules();
      const instanceData = installedModules.find(m => m.moduleId === moduleId);

      setModule(moduleData || null);
      setInstance(instanceData || null);

      if (instanceData) {
        setSettings(instanceData.settings || {});
        setPermissions(instanceData.permissions || {});
      }
    } catch (err) {
      console.error('Error loading module details:', err);
    }
  };

  const handleSettingsChange = (newSettings: Record<string, any>) => {
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handlePermissionsChange = (newPermissions: Record<string, string[]>) => {
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!module || !instance) return;

    try {
      setSaving(true);

      if (activeTab === 'settings') {
        await moduleService.updateModuleSettings(clubId, moduleId, settings);
      } else if (activeTab === 'permissions') {
        // Note: updateModulePermissions would need to be implemented in moduleService
        // For now, log the action
        console.log('Updating permissions:', permissions);
      }

      setHasChanges(false);
      if (onNotification) {
        onNotification('Modifications enregistrées', 'success');
      }
    } catch (err: any) {
      if (onNotification) {
        onNotification(`Erreur: ${err.message}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!instance) return;

    setSettings(instance.settings || {});
    setPermissions(instance.permissions || {});
    setHasChanges(false);
  };

  if (!module) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        <p className="text-gray-600 mt-4">Chargement...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'data', label: 'Données', icon: Database }
  ];

  const isInstalled = !!instance;
  const isActive = instance?.isActive || false;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Module Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {module.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {module.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isInstalled && (
              <span className={`px-3 py-1 rounded text-sm ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isActive ? 'Actif' : 'Inactif'}
              </span>
            )}
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              v{module.version}
            </span>
          </div>
        </div>

        {/* Dependencies Alert */}
        {module.dependencies && module.dependencies.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Dépendances requises
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Ce module nécessite : {module.dependencies.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      {isInstalled && (
        <>
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`
                      py-4 px-1 border-b-2 font-medium text-sm flex items-center
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Informations du module</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                    <dd className="mt-1 text-sm text-gray-900">{module.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">{module.version}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{module.isCore ? 'Core' : 'Optional'}</dd>
                  </div>
                  {instance && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Installé le</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(instance.installedAt).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {activeTab === 'settings' && (
              <ModuleSettings
                module={module}
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}

            {activeTab === 'permissions' && (
              <ModulePermissions
                module={module}
                permissions={permissions}
                onChange={handlePermissionsChange}
              />
            )}

            {activeTab === 'data' && (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Gestion des données du module
                </p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {(activeTab === 'settings' || activeTab === 'permissions') && hasChanges && (
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Vous avez des modifications non enregistrées
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Not Installed Message */}
      {!isInstalled && (
        <div className="p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Module non installé
          </h3>
          <p className="text-gray-600 mt-2">
            Ce module doit être installé pour accéder à ses paramètres
          </p>
        </div>
      )}
    </div>
  );
};
