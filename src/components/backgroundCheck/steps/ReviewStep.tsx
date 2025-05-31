import React from 'react';
import Image from 'next/image';
import { CheckCircle, FileText, Shield, AlertTriangle } from 'lucide-react';
import { BackgroundCheckData, CountryConfig } from '../../../types/backgroundCheck';

interface ReviewStepProps {
  formData: BackgroundCheckData;
  countryConfig: CountryConfig;
  errors: Record<string, string>;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  countryConfig,
  errors
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
        <CheckCircle size={24} />
        Review & Submit
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please review your information before submitting your {countryConfig.name} background check request.
      </p>
    </div>

    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          {countryConfig.flag}
          Background Check for {countryConfig.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Processed under {countryConfig.legal.dataProtectionAct}
        </p>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Name:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {formData.personalInfo.firstName} {formData.personalInfo.lastName}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {formData.personalInfo.dateOfBirth}
            </span>
          </div>
          {formData.personalInfo.nationalId && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">{countryConfig.personalInfo.nationalId.label}:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                {formData.personalInfo.nationalId}
              </span>
            </div>
          )}
          <div>
            <span className="text-gray-600 dark:text-gray-400">Email:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {formData.personalInfo.email}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {formData.personalInfo.phone}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-600 dark:text-gray-400">Address:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
              {formData.personalInfo.address.street}, {formData.personalInfo.address.city}
              {formData.country === 'US' && formData.personalInfo.address.state && `, ${formData.personalInfo.address.state}`}
              {formData.country === 'UK' && formData.personalInfo.address.county && `, ${formData.personalInfo.address.county}`}
              {formData.country === 'US' ? ` ${formData.personalInfo.address.zipCode}` : ` ${formData.personalInfo.address.postcode}`}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <FileText size={18} />
          Documents
        </h3>
        {formData.documents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {formData.documents.map((doc) => (
              <div key={doc.id} className="text-center">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden mb-1 relative">
                  <Image
                    src={doc.url}
                    alt={doc.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{doc.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No documents uploaded</p>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Shield size={18} />
          Consent & Authorization
        </h3>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {countryConfig.legal.consentTitle} authorization provided
          </span>
        </div>
      </div>
    </div>

    {errors.submit && (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700 dark:text-red-400">{errors.submit}</span>
        </div>
      </div>
    )}
  </div>
);