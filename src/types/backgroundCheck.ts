// File: src/types/backgroundCheck.ts
// Purpose: TypeScript type definitions for background check components
export type DbsLevel = "none" | "basic" | "standard" | "enhanced";
export interface UploadedPhoto {
    id: string;
    name: string;
    url: string;
    size: number;
  }
  
  export interface CountryConfig {
    code: string;
    name: string;
    flag: string;
    personalInfo: {
      nationalId: {
        label: string;
        placeholder: string;
        format: (value: string) => string;
        validate: (value: string) => boolean;
        required: boolean;
      };
      postcode: {
        label: string;
        placeholder: string;
        format: (value: string) => string;
        validate: (value: string) => boolean;
      };
      phone: {
        format: (value: string) => string;
        placeholder: string;
      };
      addressFields: string[];
    };
    documents: {
      required: string[];
      optional: string[];
      photoId: string[];
    };
    legal: {
      consentTitle: string;
      dataProtectionAct: string;
      additionalRights: string[];
      processingPurpose: string;
    };
  }
  
  export interface BackgroundCheckData {
    country: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      nationalId: string;
      email: string;
      phone: string;
      level: DbsLevel; 
      address: {
        street: string;
        city: string;
        state?: string;
        county?: string;
        zipCode?: string;
        postcode?: string;
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
  
  export interface BackgroundCheckProps {
    onSubmit: (data: BackgroundCheckData) => void;
    initialData?: Partial<BackgroundCheckData>;
    className?: string;
    defaultCountry?: string;
  }
  
  export interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
  }
  
  export interface CountrySelectorProps {
    selectedCountry: string;
    onCountryChange: (country: string) => void;
  }
  
  export interface StepIndicatorProps {
    currentStep: string;
    steps: Array<{
      key: string;
      label: string;
      icon: React.ElementType;
    }>;
  }
  
  export interface DocumentCardProps {
    doc: UploadedPhoto;
    onRemove: (id: string) => void;
  }
  
  export interface CountryStepProps {
    selectedCountry: string;
    onCountryChange: (country: string) => void;
    countryConfig: CountryConfig;
  }
  
  export interface PersonalInfoStepProps {
    formData: BackgroundCheckData;
    countryConfig: CountryConfig;
    errors: Record<string, string>;
    updatePersonalInfo: (field: string, value: string) => void;
    updateAddress: (field: string, value: string) => void;
  }
  
  export interface DocumentsStepProps {
    formData: BackgroundCheckData;
    countryConfig: CountryConfig;
    onShowPhotoUpload: () => void;
    onRemoveDocument: (photoId: string) => void;
  }
  
  export interface ConsentStepProps {
    formData: BackgroundCheckData;
    countryConfig: CountryConfig;
    onConsentChange: (consent: boolean) => void;
    errors: Record<string, string>;
  }
  
  export interface ReviewStepProps {
    formData: BackgroundCheckData;
    countryConfig: CountryConfig;
    errors: Record<string, string>;
  }
  
  export type BackgroundCheckStep = 'country' | 'info' | 'documents' | 'consent' | 'review';
  
  export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
  }
  
  export interface UseBackgroundCheckValidationReturn {
    validatePersonalInfo: () => ValidationResult;
  }