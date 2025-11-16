import React from 'react';
import { Info } from 'lucide-react';
import type { ModuleDefinition, SettingDefinition } from '@/types/module.types';

interface ModuleSettingsProps {
  module: ModuleDefinition;
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
}

export const ModuleSettings: React.FC<ModuleSettingsProps> = ({
  module,
  settings,
  onChange
}) => {
  const handleSettingChange = (key: string, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const renderSetting = (setting: SettingDefinition) => {
    const value = settings[setting.key] ?? setting.defaultValue;

    // Check if setting depends on another setting
    if (setting.dependsOn) {
      const [depKey, depValue] = setting.dependsOn.split('=');
      const currentDepValue = settings[depKey];

      if (depValue) {
        if (currentDepValue !== depValue) return null;
      } else {
        if (!currentDepValue) return null;
      }
    }

    switch (setting.type) {
      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{setting.label}</span>
          </label>
        );

      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {setting.label}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleSettingChange(setting.key, Number(e.target.value))}
              min={setting.validation?.min}
              max={setting.validation?.max}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'string':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {setting.label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {setting.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {setting.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {setting.label}
            </label>
            <div className="space-y-2">
              {setting.options?.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value?.includes(option.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(value || []), option.value]
                        : (value || []).filter((v: any) => v !== option.value);
                      handleSettingChange(setting.key, newValue);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const groupedSettings: Record<string, SettingDefinition[]> = {};

  if (module.settings) {
    Object.entries(module.settings).forEach(([category, categorySettings]) => {
      groupedSettings[category] = Object.values(categorySettings);
    });
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <div key={category} className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
            {category.replace(/_/g, ' ')}
          </h3>

          <div className="space-y-4">
            {categorySettings.map((setting: SettingDefinition) => {
              const rendered = renderSetting(setting);
              if (!rendered) return null;

              return (
                <div key={setting.key} className="relative">
                  {rendered}

                  {setting.description && (
                    <p className="mt-1 text-xs text-gray-500 flex items-start">
                      <Info className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                      {setting.description}
                    </p>
                  )}

                  {setting.advanced && (
                    <span className="absolute -left-2 top-0 w-1 h-full bg-yellow-400 rounded"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(groupedSettings).length === 0 && (
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Ce module n'a pas de paramètres configurables
          </p>
        </div>
      )}
    </div>
  );
};
