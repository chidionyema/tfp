"use client";

import React, { useState, useCallback, useMemo } from "react";
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  Shield, 
  Globe,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { PhotoUpload, UploadedPhoto } from "@/components/ui/PhotoUpload";
import { BackgroundCheckData } from "@/types/backgroundCheck";
import { COUNTRY_CONFIGS } from "@/constants/countryConfigs";
import { useBackgroundCheckValidation } from "@/hooks/useBackgroundCheckValidation";
import { StepIndicator } from "@/components/backgroundCheck/StepIndicator";
import { CountryStep } from "@/components/backgroundCheck/steps/CountryStep";
import { PersonalInfoStep } from "@/components/backgroundCheck/steps/PersonalInfoStep";
import { DocumentsStep } from "@/components/backgroundCheck/steps/DocumentsStep";
import { ConsentStep } from "@/components/backgroundCheck/steps/ConsentStep";
import { ReviewStep } from "@/components/backgroundCheck/steps/ReviewStep";

interface BackgroundCheckProps {
  onSubmit: (data: BackgroundCheckData) => void;
  initialData?: Partial<BackgroundCheckData>;
  className?: string;
  defaultCountry?: string;
}

export const BackgroundCheck: React.FC<BackgroundCheckProps> = ({
  onSubmit,
  initialData,
  className = "",
  defaultCountry = "UK"
}) => {
  const [formData, setFormData] = useState<BackgroundCheckData>({
    country: initialData?.country || defaultCountry,
    personalInfo: {
      firstName: initialData?.personalInfo?.firstName || "",
      lastName: initialData?.personalInfo?.lastName || "",
      dateOfBirth: initialData?.personalInfo?.dateOfBirth || "",
      nationalId: initialData?.personalInfo?.nationalId || "",
      email: initialData?.personalInfo?.email || "",
      phone: initialData?.personalInfo?.phone || "",
      address: {
        street: initialData?.personalInfo?.address?.street || "",
        city: initialData?.personalInfo?.address?.city || "",
        state: initialData?.personalInfo?.address?.state || "",
        county: initialData?.personalInfo?.address?.county || "",
        zipCode: initialData?.personalInfo?.address?.zipCode || "",
        postcode: initialData?.personalInfo?.address?.postcode || "",
      },
    },
    documents: initialData?.documents || [],
    consent: initialData?.consent || false,
    status: initialData?.status || 'pending',
    results: initialData?.results,
  });

  const [currentStep, setCurrentStep] = useState<'country' | 'info' | 'documents' | 'consent' | 'review'>('country');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current country configuration
  const countryConfig = useMemo(() => COUNTRY_CONFIGS[formData.country], [formData.country]);

  // Use validation hook
  const { validatePersonalInfo } = useBackgroundCheckValidation(formData, countryConfig);

  const steps = [
    { key: 'country', label: 'Location', icon: Globe },
    { key: 'info', label: 'Personal Info', icon: FileText },
    { key: 'documents', label: 'Documents', icon: Upload },
    { key: 'consent', label: 'Consent', icon: Shield },
    { key: 'review', label: 'Review', icon: CheckCircle },
  ];

  const clearError = useCallback((field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Update handlers
  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
    clearError(field);
  }, [clearError]);

  const updateAddress = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        address: { ...prev.personalInfo.address, [field]: value },
      },
    }));
    clearError(field);
  }, [clearError]);

  const handleCountryChange = useCallback((country: string) => {
    setFormData(prev => ({
      ...prev,
      country,
      personalInfo: {
        ...prev.personalInfo,
        nationalId: "",
        address: {
          street: prev.personalInfo.address.street,
          city: prev.personalInfo.address.city,
          state: "",
          county: "",
          zipCode: "",
          postcode: "",
        },
      },
    }));
    setErrors({});
  }, []);

  const handlePhotoUpload = useCallback((photos: UploadedPhoto[]) => {
    setFormData(prev => ({ ...prev, documents: photos }));
    setShowPhotoUpload(false);
  }, []);

  const removeDocument = useCallback((photoId: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== photoId),
    }));
  }, []);

  // Navigation
  const handleNext = useCallback(() => {
    if (currentStep === 'info') {
      const validation = validatePersonalInfo();
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
    }
    
    const stepOrder = ['country', 'info', 'documents', 'consent', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as typeof currentStep);
    }
  }, [currentStep, validatePersonalInfo]);

  const handleBack = useCallback(() => {
    const stepOrder = ['country', 'info', 'documents', 'consent', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1] as typeof currentStep);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!formData.consent) {
      setErrors({ consent: "You must provide consent to proceed" });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Background check submission failed:', error);
      setErrors({ submit: "Failed to submit background check. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  // Step renderer
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'country': 
        return (
          <CountryStep
            selectedCountry={formData.country}
            onCountryChange={handleCountryChange}
            countryConfig={countryConfig}
          />
        );
      case 'info': 
        return (
          <PersonalInfoStep
            formData={formData}
            countryConfig={countryConfig}
            errors={errors}
            updatePersonalInfo={updatePersonalInfo}
            updateAddress={updateAddress}
          />
        );
      case 'documents':
        return (
          <DocumentsStep
            formData={formData}
            countryConfig={countryConfig}
            onShowPhotoUpload={() => setShowPhotoUpload(true)}
            onRemoveDocument={removeDocument}
          />
        );
      case 'consent':
        return (
          <ConsentStep
            formData={formData}
            countryConfig={countryConfig}
            onConsentChange={(consent) => setFormData(prev => ({ ...prev, consent }))}
            errors={errors}
          />
        );
      case 'review':
        return (
          <ReviewStep
            formData={formData}
            countryConfig={countryConfig}
            errors={errors}
          />
        );
      default: 
        return (
          <CountryStep
            selectedCountry={formData.country}
            onCountryChange={handleCountryChange}
            countryConfig={countryConfig}
          />
        );
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-900 ${className}`}>
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {renderCurrentStep()}
        
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleBack}
            disabled={currentStep === 'country'}
            className={`px-6 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              currentStep === 'country'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border-gray-200 dark:border-gray-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Back
          </button>
          
          {currentStep !== 'review' ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.consent}
              className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                isSubmitting || !formData.consent
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download size={16} />
                  Submit Background Check
                </div>
              )}
            </button>
          )}
        </div>
      </div>

      <PhotoUpload
        isOpen={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onPhotosSelected={handlePhotoUpload}
        title="Upload Identity Documents"
        description={`Please upload clear photos of your documents as required for ${countryConfig.name} background checks`}
        maxPhotos={10}
        maxSizePerPhoto={15}
        required={false}
      />

      {formData.status === 'in-progress' && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Background check is currently in progress for {countryConfig.name}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};