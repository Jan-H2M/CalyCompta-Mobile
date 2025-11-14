import React from 'react';
import { useNavigate } from 'react-router-dom';
import CommunicationSettings from './CommunicationSettings';
import { Mail, ArrowLeft } from 'lucide-react';

/**
 * Standalone Communication Settings Page
 * Accessible via /parametres/communication
 *
 * Note: No Layout wrapper needed - parent route already provides it
 */
export function CommunicationSettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/parametres')}
          className="flex items-center gap-2 text-gray-600 dark:text-dark-text-secondary hover:text-gray-900 dark:hover:text-dark-text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Retour aux paramètres
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
              📧 Communication
            </h1>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1">
              Emails automatiques et rappels planifiés
            </p>
          </div>
          <button
            onClick={() => navigate('/parametres/communication/templates')}
            className="bg-calypso-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Mail className="h-5 w-5" />
            Gérer les templates
          </button>
        </div>
      </div>
      <CommunicationSettings />
    </div>
  );
}
