// File: src/components/backgroundCheck/steps/DocumentsStep.tsx
// Purpose: Documents upload step component

import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { DocumentCard } from '../DocumentCard';
import { BackgroundCheckData, CountryConfig } from '../../../types/backgroundCheck';

interface DocumentsStepProps {
  formData: BackgroundCheckData;
  countryConfig: CountryConfig;
  onShowPhotoUpload: () => void;
  onRemoveDocument: (photoId: string) => void;
}

export const DocumentsStep: React.FC<DocumentsStepProps> = ({
  formData,
  countryConfig,
  onShowPhotoUpload,
  onRemoveDocument
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Identity Documents</h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please upload clear photos of your documents as required by {countryConfig.name} regulations.
      </p>
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
        <FileText size={18} />
        Required Documents for {countryConfig.flag} {countryConfig.name}:
      </h3>
      <div className="space-y-2">
        <div>
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Required:</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 ml-4">
            {countryConfig.documents.required.map((doc, index) => (
              <li key={index}>• {doc}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Accepted Photo ID:</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 ml-4">
            {countryConfig.documents.photoId.map((doc, index) => (
              <li key={index}>• {doc}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-blue-800 dark:text-blue-200">Optional but recommended:</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 ml-4">
            {countryConfig.documents.optional.map((doc, index) => (
              <li key={index}>• {doc}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    {formData.documents.length > 0 && (
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Uploaded Documents ({formData.documents.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} onRemove={onRemoveDocument} />
          ))}
        </div>
      </div>
    )}

    <div className="flex justify-center">
      <button
        onClick={onShowPhotoUpload}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <Upload size={20} />
        {formData.documents.length > 0 ? 'Add More Documents' : 'Upload Documents'}
      </button>
    </div>
  </div>
);