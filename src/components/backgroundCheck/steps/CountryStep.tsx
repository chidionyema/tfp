// File: src/components/backgroundCheck/steps/CountryStep.tsx
// Purpose: Country selection step component

import React from 'react';
import { CountrySelector } from '../CountrySelector';
import { CountryConfig } from '@/types/backgroundCheck';

interface CountryStepProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  countryConfig: CountryConfig;
}

export const CountryStep: React.FC<CountryStepProps> = ({ 
  selectedCountry, 
  onCountryChange, 
  countryConfig 
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Select Your Location
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Choose your country to ensure we comply with local data protection and background check requirements.
      </p>
    </div>
    
    <CountrySelector
      selectedCountry={selectedCountry}
      onCountryChange={onCountryChange}
    />

    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
        {countryConfig.flag} {countryConfig.name} Requirements
      </h3>
      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
        Your background check will be processed in accordance with {countryConfig.legal.dataProtectionAct}.
      </p>
      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
        <li>• Required documents: {countryConfig.documents.required.join(', ')}</li>
        <li>• Processing time: 3-5 business days</li>
        <li>• Data stored securely and encrypted</li>
      </ul>
    </div>
  </div>
);