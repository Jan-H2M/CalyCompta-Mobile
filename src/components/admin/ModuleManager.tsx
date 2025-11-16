import React, { useState, useEffect } from 'react';
import {
  Package,
  Settings,
  Shield,
  BarChart,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Upload,
  RefreshCw,
  Power,
  Trash2,
  Users
} from 'lucide-react';
import { moduleService } from '@/services/core/moduleService';
import { ModuleDetails } from './ModuleDetails';
import { RoleManager } from './RoleManager';
import { ALL_MODULES } from '@/config/modules/coreModules';
import type { ModuleDefinition, ModuleInstance } from '@/types/module.types';

interface ModuleManagerProps {
  clubId: string;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ModuleManager: React.FC<ModuleManagerProps> = ({ clubId, onNotification }) => {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [installedModules, setInstalledModules] = useState<ModuleInstance[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'permissions' | 'data'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'modules' | 'roles'>('modules');

  useEffect(() => {
    loadModules();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    if (onNotification) {
      onNotification(message, type);
    } else {
      // Fallback to console if no notification handler provided
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };

  const loadModules = async () => {
    try {
      setLoading(true);
      // Initialize module service with clubId
      await moduleService.initialize(clubId);

      // Load all module definitions from config
      const allModules = ALL_MODULES;
      // Get installed modules for this club
      const installed = moduleService.getInstalledModules();

      setModules(allModules);
      setInstalledModules(installed);
      setError(null);
    } catch (err: any) {
      setError('Erreur lors du chargement des modules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallModule = async (moduleId: string) => {
    try {
      await moduleService.installModule(clubId, moduleId);
      await loadModules();
      showNotification('Module installé avec succès', 'success');
    } catch (err: any) {
      showNotification(`Erreur: ${err.message}`, 'error');
    }
  };

  const handleUninstallModule = async (moduleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir désinstaller ce module ?')) return;

    try {
      await moduleService.uninstallModule(clubId, moduleId);
      await loadModules();
      showNotification('Module désinstallé', 'success');
    } catch (err: any) {
      showNotification(`Erreur: ${err.message}`, 'error');
    }
  };

  const handleToggleModule = async (moduleId: string, enable: boolean) => {
    try {
      if (enable) {
        await moduleService.enableModule(clubId, moduleId);
      } else {
        await moduleService.disableModule(clubId, moduleId);
      }
      await loadModules();
      showNotification(`Module ${enable ? 'activé' : 'désactivé'}`, 'success');
    } catch (err: any) {
      showNotification(`Erreur: ${err.message}`, 'error');
    }
  };

  const getModuleStatus = (moduleId: string) => {
    const installed = installedModules.find(m => m.moduleId === moduleId);
    if (!installed) return 'not-installed';
    return installed.isActive ? 'active' : 'inactive';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-purple-100 text-purple-800',
      finance: 'bg-blue-100 text-blue-800',
      operations: 'bg-green-100 text-green-800',
      communication: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-red-100 text-red-800',
      extension: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.extension;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="mr-3" />
          Gestionnaire de Modules
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez les modules et fonctionnalités de votre application
        </p>

        {/* Main Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setMainTab('modules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                mainTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-5 h-5 mr-2" />
              Modules
            </button>
            <button
              onClick={() => setMainTab('roles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                mainTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Rôles
            </button>
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {mainTab === 'modules' ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Module List */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Modules Disponibles</h2>
              </div>

              <div className="divide-y">
                {modules.map((module) => {
                  const status = getModuleStatus(module.id);
                  const isSelected = selectedModule === module.id;

                  return (
                    <div
                      key={module.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedModule(module.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900">
                              {module.name}
                            </h3>
                            {module.isCore && (
                              <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                Core
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {module.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(module.category)}`}>
                              {module.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              v{module.version}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusIcon(status)}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      {status !== 'not-installed' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleModule(module.id, status === 'inactive');
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              status === 'active'
                                ? 'bg-gray-200 hover:bg-gray-300'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            <Power className="w-3 h-3 inline mr-1" />
                            {status === 'active' ? 'Désactiver' : 'Activer'}
                          </button>

                          {!module.isCore && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUninstallModule(module.id);
                              }}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3 inline mr-1" />
                              Désinstaller
                            </button>
                          )}
                        </div>
                      )}

                      {status === 'not-installed' && !module.isCore && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInstallModule(module.id);
                          }}
                          className="mt-3 w-full px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          <Download className="w-3 h-3 inline mr-1" />
                          Installer
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module Details */}
          <div className="col-span-8">
            {selectedModule ? (
              <ModuleDetails
                clubId={clubId}
                moduleId={selectedModule}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onNotification={showNotification}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Sélectionnez un module
                </h3>
                <p className="text-gray-600 mt-2">
                  Choisissez un module dans la liste pour voir ses détails et paramètres
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Roles Tab */
        <RoleManager
          clubId={clubId}
          onNotification={showNotification}
        />
      )}
    </div>
  );
};
