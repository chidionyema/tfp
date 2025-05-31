import React from 'react';
import { Globe } from 'lucide-react';
import { COUNTRY_CONFIGS } from '@/constants/countryConfigs'

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ 
  selectedCountry, 
  onCountryChange 
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      <Globe size={16} className="inline mr-2" />
      Select your country <span className="text-red-500">*</span>
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.values(COUNTRY_CONFIGS).map((config) => (
        <button
          key={config.code}
          onClick={() => onCountryChange(config.code)}
          className={`p-4 rounded-lg border-2 text-left transition-all hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            selectedCountry === config.code
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
          }`}
          type="button"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.flag}</span>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {config.name}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {config.legal.dataProtectionAct.split(' ')[0]} background checks
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);
