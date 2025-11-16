import React from 'react';
import { ModuleManager } from './ModuleManager';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Wrapper page for ModuleManager that provides authentication context
 */
export const ModuleManagerPage: React.FC = () => {
  const { clubId } = useAuth();

  const handleNotification = (message: string, type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
        toast(message);
        break;
    }
  };

  return (
    <ModuleManager
      clubId={clubId}
      onNotification={handleNotification}
    />
  );
};
