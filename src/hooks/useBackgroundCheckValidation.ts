import { useMemo } from 'react';
import { BackgroundCheckData, CountryConfig } from '../types/backgroundCheck';

export const useBackgroundCheckValidation = (
  formData: BackgroundCheckData,
  countryConfig: CountryConfig
) => {
  const validatePersonalInfo = useMemo(() => {
    return () => {
      const errors: Record<string, string> = {};
      const { personalInfo } = formData;

      // Basic required fields
      if (!personalInfo.firstName.trim()) errors.firstName = 'First name is required';
      if (!personalInfo.lastName.trim()) errors.lastName = 'Last name is required';
      if (!personalInfo.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
      if (!personalInfo.email.trim()) errors.email = 'Email is required';
      if (!personalInfo.phone.trim()) errors.phone = 'Phone number is required';
      if (!personalInfo.address.street.trim()) errors.street = 'Street address is required';
      if (!personalInfo.address.city.trim()) errors.city = 'City is required';

      // Country-specific validations
      if (countryConfig.personalInfo.nationalId.required && !personalInfo.nationalId.trim()) {
        errors.nationalId = `${countryConfig.personalInfo.nationalId.label} is required`;
      } else if (personalInfo.nationalId.trim() && !countryConfig.personalInfo.nationalId.validate(personalInfo.nationalId)) {
        errors.nationalId = `Invalid ${countryConfig.personalInfo.nationalId.label} format`;
      }

      // Address field validation based on country
      if (formData.country === 'US') {
        if (!personalInfo.address.state?.trim()) errors.state = 'State is required';
        if (!personalInfo.address.zipCode?.trim()) errors.zipCode = 'ZIP code is required';
        else if (!countryConfig.personalInfo.postcode.validate(personalInfo.address.zipCode)) {
          errors.zipCode = 'Invalid ZIP code format';
        }
      } else if (formData.country === 'UK') {
        if (!personalInfo.address.postcode?.trim()) errors.postcode = 'Postcode is required';
        else if (!countryConfig.personalInfo.postcode.validate(personalInfo.address.postcode)) {
          errors.postcode = 'Invalid postcode format';
        }
      }

      // Email validation
      if (personalInfo.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
        errors.email = "Invalid email format";
      }

      return { isValid: Object.keys(errors).length === 0, errors };
    };
  }, [formData, countryConfig]);

  return { validatePersonalInfo };
};