import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Trash2,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  HardDrive,
  Calendar,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { moduleService } from '@/services/core/moduleService';
import type { ModuleDefinition } from '@/types/module.types';

interface ModuleDataProps {
  clubId: string;
  module: ModuleDefinition;
  onNotification?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ModuleData: React.FC<ModuleDataProps> = ({
  clubId,
  module,
  onNotification
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadDataStats();
  }, [module.id]);

  const loadDataStats = async () => {
    try {
      setLoading(true);
      const moduleStats = await moduleService.getModuleDataStats(clubId, module.id);
      setStats(moduleStats);
    } catch (error) {
      console.error('Error loading module data stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      setExporting(true);
      await moduleService.exportModuleData(clubId, module.id, format);

      if (onNotification) {
        onNotification(`Données exportées avec succès (${format.toUpperCase()})`, 'success');
      }
    } catch (error: any) {
      if (onNotification) {
        onNotification(`Erreur lors de l'export: ${error.message}`, 'error');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = async () => {
    const confirmed = window.confirm(
      `⚠️ ATTENTION: Voulez-vous vraiment supprimer toutes les données du module "${module.name}"?\n\nCette action est IRRÉVERSIBLE!`
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      'Dernière confirmation: Tapez "SUPPRIMER" dans la console pour confirmer.\n\nÊtes-vous ABSOLUMENT sûr?'
    );

    if (!doubleConfirm) return;

    try {
      await moduleService.clearModuleData(clubId, module.id);

      if (onNotification) {
        onNotification('Données du module supprimées', 'success');
      }

      await loadDataStats();
    } catch (error: any) {
      if (onNotification) {
        onNotification(`Erreur: ${error.message}`, 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Chargement des statistiques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Statistiques des données
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Documents</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {stats?.documentCount || 0}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Collections</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  {stats?.collectionCount || 0}
                </p>
              </div>
              <Database className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Taille estimée</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {stats?.estimatedSize || 'N/A'}
                </p>
              </div>
              <Archive className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {stats?.lastUpdated && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Dernière mise à jour: {new Date(stats.lastUpdated).toLocaleString('fr-FR')}
          </div>
        )}
      </div>

      {/* Data Collections Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Structure des données
        </h3>

        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700">Chemin de base Firestore</p>
            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              clubs/{clubId}/module_data/{module.id}/
            </code>
          </div>

          {module.config?.dataCollections && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Collections de données</p>
              <ul className="space-y-2">
                {module.config.dataCollections.map((collection: string) => (
                  <li key={collection} className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {collection}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Data Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2" />
          Actions sur les données
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON */}
          <button
            onClick={() => handleExportData('json')}
            disabled={exporting}
            className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <FileJson className="w-5 h-5 mr-2" />
            )}
            Exporter en JSON
          </button>

          {/* Export CSV */}
          <button
            onClick={() => handleExportData('csv')}
            disabled={exporting}
            className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exporting ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 mr-2" />
            )}
            Exporter en CSV
          </button>

          {/* Refresh Stats */}
          <button
            onClick={loadDataStats}
            className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Actualiser les stats
          </button>

          {/* Clear Data (Dangerous) */}
          <button
            onClick={handleClearData}
            className="flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Supprimer les données
          </button>
        </div>
      </div>

      {/* Warning about data deletion */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Attention: Gestion des données
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              La suppression des données du module est irréversible. Assurez-vous d'avoir effectué une sauvegarde avant de procéder. L'export des données ne supprime pas les données existantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
