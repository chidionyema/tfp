import React from 'react';
import { Shield } from 'lucide-react';
import { BackgroundCheckData, CountryConfig } from '../../../types/backgroundCheck';

interface ConsentStepProps {
  formData: BackgroundCheckData;
  countryConfig: CountryConfig;
  onConsentChange: (consent: boolean) => void;
  errors: Record<string, string>;
}

export const ConsentStep: React.FC<ConsentStepProps> = ({
  formData,
  countryConfig,
  onConsentChange,
  errors
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
        <Shield size={24} />
        {countryConfig.legal.consentTitle}
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please review and provide consent for the background check process under {countryConfig.name} law.
      </p>
    </div>

    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
      <div className="prose max-w-none">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Background Check Authorization & Data Processing Consent
        </h3>
        
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <p>
            By checking the box below, I hereby authorize and consent to the procurement of background information for {countryConfig.legal.processingPurpose}, which may include but is not limited to:
          </p>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Criminal history records and police checks</li>
            <li>Employment verification and reference checks</li>
            <li>Education and qualification verification</li>
            <li>Professional licensing verification</li>
            {formData.country === 'US' && <li>Credit history (if applicable to role)</li>}
            {formData.country === 'US' && <li>Driving records (if applicable to role)</li>}
            {formData.country === 'UK' && <li>Right to work verification</li>}
            {formData.country === 'UK' && <li>DBS (Disclosure and Barring Service) check</li>}
          </ul>
          
          <p>
            I understand that this information will be processed in accordance with {countryConfig.legal.dataProtectionAct} and all applicable federal, state, and local laws.
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border-l-4 border-blue-400">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Rights:</h4>
            <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-200">
              {countryConfig.legal.additionalRights.map((right, index) => (
                <li key={index}>{right}</li>
              ))}
            </ul>
          </div>
          
          <p className="font-medium">
            This authorization will remain in effect during the application process and, if successful, throughout the duration of engagement.
          </p>

          {formData.country === 'UK' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded border-l-4 border-yellow-400">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                <strong>UK Specific:</strong> Under UK GDPR, you have additional rights including the right to withdraw consent at any time. 
                However, this may affect our ability to process your application or continue your engagement.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.consent}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div className="text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            I have read and agree to the background check authorization above.
          </span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            I certify that all information provided is true and complete to the best of my knowledge, and I understand that any false information may result in rejection of my application.
          </p>
        </div>
      </label>
      {errors.consent && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.consent}</p>}
    </div>
  </div>
);
