// File: src/components/BackgroundCheck.tsx
// Purpose: Production-ready background check component - optimized version

"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Shield, 
  Upload,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { PhotoUpload, UploadedPhoto } from "./ui/PhotoUpload";

export interface BackgroundCheckData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  documents: UploadedPhoto[];
  consent: boolean;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  results?: {
    criminalRecord: 'clear' | 'flagged' | 'pending';
    employmentHistory: 'verified' | 'discrepancy' | 'pending';
    education: 'verified' | 'discrepancy' | 'pending';
    references: 'positive' | 'mixed' | 'pending';
  };
}

interface BackgroundCheckProps {
  onSubmit: (data: BackgroundCheckData) => void;
  initialData?: Partial<BackgroundCheckData>;
  className?: string;
}

// Reusable input component to reduce code duplication
const FormInput: React.FC<{
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}> = ({ id, label, type = "text", value, onChange, error, placeholder, maxLength, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && "*"}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder={placeholder}
      maxLength={maxLength}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Reusable document card component
const DocumentCard: React.FC<{
  doc: UploadedPhoto;
  onRemove: (id: string) => void;
}> = ({ doc, onRemove }) => (
  <div className="border rounded-lg p-3 bg-white shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-900 truncate">{doc.name}</span>
      <button
        onClick={() => onRemove(doc.id)}
        className="text-red-600 hover:text-red-800 p-1"
        aria-label={`Remove ${doc.name}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
    <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden mb-2 relative">
      <Image
        src={doc.url}
        alt={doc.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
      <button
        onClick={() => window.open(doc.url, '_blank')}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
      >
        <Eye size={12} />
        View
      </button>
    </div>
  </div>
);

// Step indicator component
const StepIndicator: React.FC<{
  currentStep: string;
  steps: Array<{ key: string; label: string; icon: React.ElementType }>;
}> = ({ currentStep, steps }) => {
  const getStepStatus = (step: string) => {
    const stepIndex = steps.findIndex(s => s.key === step);
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map(({ key, label, icon: Icon }, index) => {
          const status = getStepStatus(key);
          return (
            <div key={key} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                  status === 'completed'
                    ? 'bg-green-500 border-green-500 text-white'
                    : status === 'current'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                <Icon size={20} />
              </div>
              <span
                className={`text-sm font-medium ${
                  status === 'current' ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full mt-2 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BackgroundCheck: React.FC<BackgroundCheckProps> = ({
  onSubmit,
  initialData,
  className = "",
}) => {
  const [formData, setFormData] = useState<BackgroundCheckData>({
    personalInfo: {
      firstName: initialData?.personalInfo?.firstName || "",
      lastName: initialData?.personalInfo?.lastName || "",
      dateOfBirth: initialData?.personalInfo?.dateOfBirth || "",
      ssn: initialData?.personalInfo?.ssn || "",
      email: initialData?.personalInfo?.email || "",
      phone: initialData?.personalInfo?.phone || "",
      address: {
        street: initialData?.personalInfo?.address?.street || "",
        city: initialData?.personalInfo?.address?.city || "",
        state: initialData?.personalInfo?.address?.state || "",
        zipCode: initialData?.personalInfo?.address?.zipCode || "",
      },
    },
    documents: initialData?.documents || [],
    consent: initialData?.consent || false,
    status: initialData?.status || 'pending',
    results: initialData?.results,
  });

  const [currentStep, setCurrentStep] = useState<'info' | 'documents' | 'consent' | 'review'>('info');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { key: 'info', label: 'Personal Info', icon: FileText },
    { key: 'documents', label: 'Documents', icon: Upload },
    { key: 'consent', label: 'Consent', icon: Shield },
    { key: 'review', label: 'Review', icon: CheckCircle },
  ];

  // Utility functions
  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const clearError = useCallback((field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validation
  const validatePersonalInfo = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const { personalInfo } = formData;

    const validations = [
      { field: 'firstName', value: personalInfo.firstName.trim(), message: 'First name is required' },
      { field: 'lastName', value: personalInfo.lastName.trim(), message: 'Last name is required' },
      { field: 'dateOfBirth', value: personalInfo.dateOfBirth, message: 'Date of birth is required' },
      { field: 'email', value: personalInfo.email.trim(), message: 'Email is required' },
      { field: 'phone', value: personalInfo.phone.trim(), message: 'Phone number is required' },
      { field: 'street', value: personalInfo.address.street.trim(), message: 'Street address is required' },
      { field: 'city', value: personalInfo.address.city.trim(), message: 'City is required' },
      { field: 'state', value: personalInfo.address.state.trim(), message: 'State is required' },
      { field: 'zipCode', value: personalInfo.address.zipCode.trim(), message: 'ZIP code is required' },
    ];

    validations.forEach(({ field, value, message }) => {
      if (!value) newErrors[field] = message;
    });

    // Special validations
    if (personalInfo.ssn.trim()) {
      if (!/^\d{3}-?\d{2}-?\d{4}$/.test(personalInfo.ssn)) {
        newErrors.ssn = "Invalid SSN format";
      }
    } else {
      newErrors.ssn = "SSN is required";
    }

    if (personalInfo.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

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
    if (currentStep === 'info' && !validatePersonalInfo()) return;
    
    const stepOrder = ['info', 'documents', 'consent', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as typeof currentStep);
    }
  }, [currentStep, validatePersonalInfo]);

  const handleBack = useCallback(() => {
    const stepOrder = ['info', 'documents', 'consent', 'review'];
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

  // Step renderers
  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Please provide accurate information for identity verification.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          id="firstName"
          label="First Name"
          value={formData.personalInfo.firstName}
          onChange={(value) => updatePersonalInfo('firstName', value)}
          error={errors.firstName}
          placeholder="Enter your first name"
          required
        />
        <FormInput
          id="lastName"
          label="Last Name"
          value={formData.personalInfo.lastName}
          onChange={(value) => updatePersonalInfo('lastName', value)}
          error={errors.lastName}
          placeholder="Enter your last name"
          required
        />
        <FormInput
          id="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formData.personalInfo.dateOfBirth}
          onChange={(value) => updatePersonalInfo('dateOfBirth', value)}
          error={errors.dateOfBirth}
          required
        />
        <FormInput
          id="ssn"
          label="Social Security Number"
          value={formData.personalInfo.ssn}
          onChange={(value) => updatePersonalInfo('ssn', formatSSN(value))}
          error={errors.ssn}
          placeholder="XXX-XX-XXXX"
          maxLength={11}
          required
        />
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          value={formData.personalInfo.email}
          onChange={(value) => updatePersonalInfo('email', value)}
          error={errors.email}
          placeholder="your.email@example.com"
          required
        />
        <FormInput
          id="phone"
          label="Phone Number"
          type="tel"
          value={formData.personalInfo.phone}
          onChange={(value) => updatePersonalInfo('phone', formatPhone(value))}
          error={errors.phone}
          placeholder="(555) 123-4567"
          maxLength={14}
          required
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
        <div className="space-y-4">
          <FormInput
            id="street"
            label="Street Address"
            value={formData.personalInfo.address.street}
            onChange={(value) => updateAddress('street', value)}
            error={errors.street}
            placeholder="123 Main Street"
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              id="city"
              label="City"
              value={formData.personalInfo.address.city}
              onChange={(value) => updateAddress('city', value)}
              error={errors.city}
              placeholder="New York"
              required
            />
            <FormInput
              id="state"
              label="State"
              value={formData.personalInfo.address.state}
              onChange={(value) => updateAddress('state', value)}
              error={errors.state}
              placeholder="NY"
              required
            />
            <FormInput
              id="zipCode"
              label="ZIP Code"
              value={formData.personalInfo.address.zipCode}
              onChange={(value) => updateAddress('zipCode', value)}
              error={errors.zipCode}
              placeholder="10001"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocumentsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Documents</h2>
        <p className="text-gray-600">Please upload clear photos of your government-issued ID and any supporting documents.</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <FileText size={18} />
          Required Documents:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Government-issued photo ID (Driver&apos;s License, Passport, etc.)</li>
          <li>• Social Security Card (optional but recommended)</li>
          <li>• Proof of address (utility bill, bank statement, etc.)</li>
        </ul>
      </div>

      {formData.documents.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Uploaded Documents ({formData.documents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onRemove={removeDocument} />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => setShowPhotoUpload(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Upload size={20} />
          {formData.documents.length > 0 ? 'Add More Documents' : 'Upload Documents'}
        </button>
      </div>
    </div>
  );

  const renderConsentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Shield size={24} />
          Background Check Consent
        </h2>
        <p className="text-gray-600">Please review and provide consent for the background check process.</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="prose max-w-none">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Background Check Authorization & Disclosure
          </h3>
          
          <div className="space-y-4 text-sm text-gray-700">
            <p>By checking the box below, I hereby authorize and consent to the procurement of background information, which may include but is not limited to:</p>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>Criminal history records</li>
              <li>Employment verification</li>
              <li>Education verification</li>
              <li>Professional references</li>
              <li>Credit history (if applicable)</li>
              <li>Driving records (if applicable)</li>
            </ul>
            
            <p>I understand that this information will be used for employment screening purposes and will be handled in accordance with the Fair Credit Reporting Act (FCRA) and all applicable federal, state, and local laws.</p>
            
            <p>I acknowledge that I have the right to receive a copy of any background report and to dispute any inaccurate information contained therein.</p>
            
            <p className="font-medium">This authorization will remain in effect during the application process and, if hired, throughout my employment.</p>
          </div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.consent}
            onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="text-sm">
            <span className="font-medium text-gray-900">I have read and agree to the background check authorization above.</span>
            <p className="text-gray-600 mt-1">I certify that all information provided is true and complete to the best of my knowledge.</p>
          </div>
        </label>
        {errors.consent && <p className="mt-2 text-sm text-red-600">{errors.consent}</p>}
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CheckCircle size={24} />
          Review & Submit
        </h2>
        <p className="text-gray-600">Please review your information before submitting your background check request.</p>
      </div>

      <div className="bg-white border rounded-lg divide-y">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{formData.personalInfo.firstName} {formData.personalInfo.lastName}</span>
            </div>
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <span className="ml-2 font-medium">{formData.personalInfo.dateOfBirth}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{formData.personalInfo.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{formData.personalInfo.phone}</span>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-600">Address:</span>
              <span className="ml-2 font-medium">
                {formData.personalInfo.address.street}, {formData.personalInfo.address.city}, {formData.personalInfo.address.state} {formData.personalInfo.address.zipCode}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText size={18} />
            Documents
          </h3>
          {formData.documents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.documents.map((doc) => (
                <div key={doc.id} className="text-center">
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-1 relative">
                    <Image
                      src={doc.url}
                      alt={doc.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{doc.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No documents uploaded</p>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={18} />
            Consent
          </h3>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-700">Background check authorization provided</span>
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700">{errors.submit}</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info': return renderPersonalInfoStep();
      case 'documents': return renderDocumentsStep();
      case 'consent': return renderConsentStep();
      case 'review': return renderReviewStep();
      default: return renderPersonalInfoStep();
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderCurrentStep()}
        
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={handleBack}
            disabled={currentStep === 'info'}
            className={`px-6 py-2 rounded-lg border transition-colors ${
              currentStep === 'info'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Back
          </button>
          
          {currentStep !== 'review' ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.consent}
              className={`px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
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
        description="Please upload clear photos of your government-issued ID and supporting documents"
        maxPhotos={10}
        maxSizePerPhoto={15}
        required={false}
      />

      {formData.status === 'in-progress' && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">Background check is currently in progress...</span>
          </div>
        </div>
      )}
    </div>
  );
};