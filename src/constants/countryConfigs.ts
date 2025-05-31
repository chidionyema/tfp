// File: src/constants/countryConfigs.ts
// Purpose: Country configuration constants for background checks

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
  
  export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
    US: {
      code: 'US',
      name: 'United States',
      flag: '🇺🇸',
      personalInfo: {
        nationalId: {
          label: 'Social Security Number',
          placeholder: 'XXX-XX-XXXX',
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '');
            if (numbers.length <= 3) return numbers;
            if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`;
          },
          validate: (value: string) => /^\d{3}-?\d{2}-?\d{4}$/.test(value),
          required: true
        },
        postcode: {
          label: 'ZIP Code',
          placeholder: '10001',
          format: (value: string) => value.replace(/\D/g, '').slice(0, 5),
          validate: (value: string) => /^\d{5}$/.test(value)
        },
        phone: {
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '');
            if (numbers.length <= 3) return numbers;
            if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
            return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
          },
          placeholder: '(555) 123-4567'
        },
        addressFields: ['street', 'city', 'state', 'zipCode']
      },
      documents: {
        required: ['Government-issued photo ID'],
        optional: ['Social Security Card', 'Proof of address'],
        photoId: ['Driver\'s License', 'Passport', 'State ID Card']
      },
      legal: {
        consentTitle: 'Background Check Authorization & Disclosure (FCRA)',
        dataProtectionAct: 'Fair Credit Reporting Act (FCRA)',
        additionalRights: [
          'Right to receive a copy of any background report',
          'Right to dispute inaccurate information',
          'Right to know if information was used against you'
        ],
        processingPurpose: 'employment screening and ongoing employment verification'
      }
    },
    UK: {
      code: 'UK',
      name: 'United Kingdom',
      flag: '🇬🇧',
      personalInfo: {
        nationalId: {
          label: 'National Insurance Number',
          placeholder: 'QQ 12 34 56 C',
          format: (value: string) => {
            const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            if (cleaned.length <= 2) return cleaned;
            if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
            if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
            if (cleaned.length <= 8) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6)}`;
            return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 9)}`;
          },
          validate: (value: string) => /^[A-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]$/i.test(value.replace(/\s/g, '')),
          required: false
        },
        postcode: {
          label: 'Postcode',
          placeholder: 'SW1A 1AA',
          format: (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{3,4})(.{3})$/, '$1 $2'),
          validate: (value: string) => /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(value)
        },
        phone: {
          format: (value: string) => {
            const numbers = value.replace(/\D/g, '');
            if (numbers.startsWith('44')) {
              const withoutCode = numbers.slice(2);
              if (withoutCode.length <= 3) return `+44 ${withoutCode}`;
              if (withoutCode.length <= 7) return `+44 ${withoutCode.slice(0, 3)} ${withoutCode.slice(3)}`;
              return `+44 ${withoutCode.slice(0, 3)} ${withoutCode.slice(3, 6)} ${withoutCode.slice(6, 10)}`;
            }
            if (numbers.startsWith('0')) {
              if (numbers.length <= 4) return numbers;
              if (numbers.length <= 8) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
              return `${numbers.slice(0, 4)} ${numbers.slice(4, 7)} ${numbers.slice(7, 11)}`;
            }
            return numbers.slice(0, 11);
          },
          placeholder: '07123 456789 or +44 7123 456789'
        },
        addressFields: ['street', 'city', 'county', 'postcode']
      },
      documents: {
        required: ['Government-issued photo ID'],
        optional: ['Proof of address', 'Bank statement'],
        photoId: ['Passport', 'Driving Licence', 'EU National ID Card']
      },
      legal: {
        consentTitle: 'DBS Check Authorization & Data Processing Consent',
        dataProtectionAct: 'UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018',
        additionalRights: [
          'Right to access your personal data',
          'Right to rectification of inaccurate data',
          'Right to erasure ("right to be forgotten")',
          'Right to restrict processing',
          'Right to data portability',
          'Right to object to processing'
        ],
        processingPurpose: 'employment vetting and ongoing employment monitoring'
      }
    }
  };