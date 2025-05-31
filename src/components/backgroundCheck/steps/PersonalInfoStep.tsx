import React from 'react';
import { FormInput } from '../FormInput';
import { BackgroundCheckData, CountryConfig } from '../../../types/backgroundCheck';

interface PersonalInfoStepProps {
  formData: BackgroundCheckData;
  countryConfig: CountryConfig;
  errors: Record<string, string>;
  updatePersonalInfo: (field: string, value: string) => void;
  updateAddress: (field: string, value: string) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  countryConfig,
  errors,
  updatePersonalInfo,
  updateAddress
}) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Personal Information
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Please provide accurate information for identity verification in {countryConfig.name}.
      </p>
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
        id="nationalId"
        label={countryConfig.personalInfo.nationalId.label}
        value={formData.personalInfo.nationalId}
        onChange={(value) => updatePersonalInfo('nationalId', countryConfig.personalInfo.nationalId.format(value))}
        error={errors.nationalId}
        placeholder={countryConfig.personalInfo.nationalId.placeholder}
        required={countryConfig.personalInfo.nationalId.required}
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
        onChange={(value) => updatePersonalInfo('phone', countryConfig.personalInfo.phone.format(value))}
        error={errors.phone}
        placeholder={countryConfig.personalInfo.phone.placeholder}
        required
      />
    </div>

    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Address</h3>
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
            placeholder={formData.country === 'UK' ? "London" : "New York"}
            required
          />
          {formData.country === 'US' && (
            <FormInput
              id="state"
              label="State"
              value={formData.personalInfo.address.state || ""}
              onChange={(value) => updateAddress('state', value)}
              error={errors.state}
              placeholder="NY"
              required
            />
          )}
          {formData.country === 'UK' && (
            <FormInput
              id="county"
              label="County"
              value={formData.personalInfo.address.county || ""}
              onChange={(value) => updateAddress('county', value)}
              error={errors.county}
              placeholder="Greater London"
            />
          )}
          <FormInput
            id={formData.country === 'US' ? "zipCode" : "postcode"}
            label={countryConfig.personalInfo.postcode.label}
            value={formData.country === 'US' ? (formData.personalInfo.address.zipCode || "") : (formData.personalInfo.address.postcode || "")}
            onChange={(value) => {
              const formatted = countryConfig.personalInfo.postcode.format(value);
              updateAddress(formData.country === 'US' ? 'zipCode' : 'postcode', formatted);
            }}
            error={errors[formData.country === 'US' ? 'zipCode' : 'postcode']}
            placeholder={countryConfig.personalInfo.postcode.placeholder}
            required
          />
        </div>
      </div>
    </div>
  </div>
);
