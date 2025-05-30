"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Eye, ChevronRight, X, DollarSign } from 'lucide-react';
import Link from 'next/link';
import LocationPicker from '@/components/ui/LocationPicker';
import PhotoUpload from '@/components/ui/PhotoUpload';
import {
      STEP_TITLES,
      PLATFORM_FEE_RATE,
      MIN_PERK_VALUE,
      getCategories,
     getUrgencyOptions,
    } from '@/constants/task-constants';
// TaskCreationPage.tsx
import type { TaskFormData, PerkItem } from '@/types/task';
import { InputField, OptionGrid } from '@/components/form';
import {
       calculateTotalPerkValue,
       calculatePlatformFee,
       isCombinationPerk,
       getCombinationBonus,
       estimatedSuccessRate,
       getPerkIcon,
       getDeliveryInfo,
     } from '@/utils/task-utils';


// Moved stepTitles outside the component

const TaskCreationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isDropoffPickerOpen, setIsDropoffPickerOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '', description: '', category: '', urgency: 'medium', location: null, dropoffLocation: null, needsDropoff: false,
    estimatedDuration: '', specificRequirements: '', allowNegotiation: true, perks: [], photos: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  // Removed unused firstErrorRef

  useEffect(() => {
    document.title = `${STEP_TITLES[currentStep - 1]} - Create Task | TaskForPerks`;
    stepHeadingRef.current?.focus();
  }, [currentStep]); // Removed stepTitles from dependency as it's a stable constant

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
        const firstInvalidField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalidField?.focus();
    }
  }, [errors]);


  const categories      = useMemo(getCategories, []);
  const urgencyOptions  = useMemo(getUrgencyOptions, []);

  const perkTemplates = useMemo(() => ({
    payment: { name: 'Digital Payment', description: 'Secure payment processed through platform escrow', baseValue: 15 },
    good: { name: 'Electronics/Designer Item', description: 'New electronics, designer goods, or premium products', baseValue: 25 },
    service: { name: 'Transportation Service', description: 'Ride-share voucher or delivery service', baseValue: 18 }
  }), []);

  const handleInputChange = (field: keyof TaskFormData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'category') {
        const category = categories.find(c => c.id === value);
        newData.needsDropoff = !!category?.needsDropoff;
      }
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addPerk = (type: 'payment' | 'good' | 'service') => {
    const template = perkTemplates[type];
    const newPerk: PerkItem = {
      id: `perk-${Date.now().toString()}`,
      type, name: template.name, description: template.description,
      estimatedValue: template.baseValue, quantity: 1
    };
    setFormData(prev => ({ ...prev, perks: [...prev.perks, newPerk] }));
    if (errors.perks && formData.perks.length === 0) {
        setErrors(prev => {
            const newErrors = {...prev};
            delete newErrors.perks;
            return newErrors;
        });
    }
  };


  const updatePerk = (perkId: string, updates: Partial<PerkItem>) => {
    setFormData(prev => ({
      ...prev,
      perks: prev.perks.map(perk =>
        perk.id === perkId ? { ...perk, ...updates } : perk
      )
    }));
    const fieldKeysWithError = Object.keys(updates).map(key => `perk_${perkId}_${key}`);
    setErrors(prev => {
        const newErrors = {...prev};
        fieldKeysWithError.forEach(errorKey => delete newErrors[errorKey]);
        if (!Object.keys(newErrors).some(k => k.startsWith('perk_'))) {
            delete newErrors.perks;
        }
        return newErrors;
    });
  };

  const removePerk = (perkId: string) => {
    setFormData(prev => ({ ...prev, perks: prev.perks.filter(perk => perk.id !== perkId) }));
  };

  
  const validateStep = (step: number) => {
    const newValidationErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.title.trim()) newValidationErrors.title = 'Task title is required.';
      else if (formData.title.trim().length > 100) newValidationErrors.title = 'Title must be 100 characters or less.';
      
      if (!formData.description.trim()) newValidationErrors.description = 'Task description is required.';
      else if (formData.description.trim().length > 1000) newValidationErrors.description = 'Description must be 1000 characters or less.';
      
      if (!formData.category) newValidationErrors.category = 'Please select a category.';
      if (!formData.location) newValidationErrors.location = 'Please set a pickup/task location.';
      if (formData.needsDropoff && !formData.dropoffLocation) newValidationErrors.dropoffLocation = 'Please set a drop-off location for this task.';
    }
    if (step === 3) {
      if (formData.perks.length === 0) {
        newValidationErrors.perks = 'Please add at least one perk for your task.';
      } else if (calculateTotalPerkValue(formData.perks) < MIN_PERK_VALUE) {
        newValidationErrors.perks = `Total perk value must be at least $${MIN_PERK_VALUE}.`;
      } else {
        let hasPerkError = false;
        formData.perks.forEach(perk => {
          if (!perk.name.trim()) {
            newValidationErrors[`perk_${perk.id}_name`] = 'Name is required.';
            hasPerkError = true;
          }
          if (!perk.description.trim()) {
             newValidationErrors[`perk_${perk.id}_description`] = 'Description is required.';
             hasPerkError = true;
          }
          if ((perk.customValue ?? perk.estimatedValue) <= 0) {
            newValidationErrors[`perk_${perk.id}_value`] = 'Value must be positive.';
            hasPerkError = true;
          }
        });
        if (hasPerkError && !newValidationErrors.perks) { 
            newValidationErrors.perks = 'Please complete all required details for each perk.';
        }
      }
    }
    setErrors(newValidationErrors);
    return Object.keys(newValidationErrors).length === 0;
  };



  const LocationButton = ({ location, onClick, label, icon = "indigo" }: {
    location: { address: string; lat: number; lng: number; } | null;
    onClick: () => void;
    label: string;
    icon?: string;
  }) => (
    <button 
        onClick={onClick} 
        type="button"
        aria-label={location ? `Change ${label}: ${location.address}` : `Set ${label}`}
        className={`w-full p-3 sm:p-4 border-2 border-dashed rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            location ? `border-${icon}-300 bg-${icon}-50` : 'border-gray-300 hover:border-gray-400'
        }`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <MapPin size={20} className={location ? `text-${icon}-600` : 'text-gray-400'} aria-hidden="true" />
        <div>
          <p className="font-medium text-gray-900 text-sm sm:text-base">{location ? `${label} Set` : `Set ${label}`}</p>
          <p className="text-xs sm:text-sm text-gray-600">{location?.address || `Click to select ${label.toLowerCase()}`}</p>
        </div>
      </div>
    </button>
  );

  const PerkCard = ({ perk }: { perk: PerkItem }) => {
    const perkIdPrefix = `perk-card-${perk.id}`;
    return (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border" role="region" aria-labelledby={`${perkIdPrefix}-heading`}>
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {getPerkIcon(perk.type)}
          <h4 id={`${perkIdPrefix}-heading`} className="font-medium text-gray-900 capitalize text-sm sm:text-base">{perk.type} Perk</h4>
          {perk.brand && perk.model && (
            <span className="text-xs sm:text-sm text-indigo-600 bg-indigo-100 px-2 py-1 rounded">{perk.brand} {perk.model}</span>
          )}
        </div>
        <button onClick={() => removePerk(perk.id)}
                className="p-1 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                aria-label={`Remove ${perk.name || perk.type} perk with value $${((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1)).toFixed(2)}`}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <InputField label="Perk Name" required id={`${perkIdPrefix}-name`} error={errors[`perk_${perk.id}_name`]}>
          <input type="text" 
                 value={perk.name}
                 onChange={(e) => updatePerk(perk.id, { name: e.target.value })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                 placeholder={perk.type === 'payment' ? 'e.g., Digital payment' : 
                            perk.type === 'good' ? 'e.g., iPhone 15, Gift card' :
                            'e.g., Uber rides'} />
        </InputField>
        
        <InputField label="Est. Value ($)" required id={`${perkIdPrefix}-value`} error={errors[`perk_${perk.id}_value`]}>
          <input type="number"
                 value={perk.customValue ?? perk.estimatedValue}
                 onChange={(e) => updatePerk(perk.id, { customValue: parseFloat(e.target.value) || 0 })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                 min="0.01" step="0.01" />
        </InputField>

        {perk.type === 'good' && (
          <>
            <InputField label="Brand (Optional)" id={`${perkIdPrefix}-brand`}>
              <input type="text" value={perk.brand || ''} 
                     onChange={(e) => updatePerk(perk.id, { brand: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                     placeholder="e.g., Apple, Gucci" />
            </InputField>
            <InputField label="Model/Product (Optional)" id={`${perkIdPrefix}-model`}>
              <input type="text" value={perk.model || ''} 
                     onChange={(e) => updatePerk(perk.id, { model: e.target.value })}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                     placeholder="e.g., iPhone 15 Pro" />
            </InputField>
            <InputField label="Condition" id={`${perkIdPrefix}-condition`}>
              <select value={perk.condition || 'new'} 
                      onChange={(e) => updatePerk(perk.id, { condition: e.target.value as PerkItem['condition'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white pr-8 bg-no-repeat"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}>
                <option value="new">Brand New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
              </select>
            </InputField>
            <div className="md:col-span-2">
              <InputField label="How will item be provided?" required id={`${perkIdPrefix}-delivery`}>
                <select value={perk.deliveryMethod || 'local_handoff'} 
                        onChange={(e) => updatePerk(perk.id, { deliveryMethod: e.target.value as PerkItem['deliveryMethod'] })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white pr-8 bg-no-repeat"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}>
                  <option value="local_handoff">Local handoff after task</option>
                  <option value="ship_to_platform">Ship to platform for escrow</option>
                  <option value="direct_delivery">Direct delivery to helper</option>
                </select>
              </InputField>
              
              {perk.deliveryMethod && perk.deliveryMethod !== 'local_handoff' && (
                <div className="mt-2">
                  {(() => {
                    const deliveryInfo = getDeliveryInfo(perk.deliveryMethod);
                    return deliveryInfo && (
                      <div className={`text-xs sm:text-sm text-${deliveryInfo.color}-700 bg-${deliveryInfo.color}-50 p-2 sm:p-3 rounded-md`} role="note">
                        <strong>{perk.deliveryMethod === 'ship_to_platform' ? 'Platform Escrow:' : 'Lower Protection:'}</strong> {deliveryInfo.text}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </>
        )}

        {perk.type === 'service' && (
          <div className="md:col-span-2">
            <InputField label="Service Details" required id={`${perkIdPrefix}-service-desc`} error={errors[`perk_${perk.id}_description`]}>
              <textarea value={perk.description} 
                        onChange={(e) => updatePerk(perk.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        rows={3} placeholder="Timeline, completion criteria..." />
            </InputField>
            <div className="mt-2 text-xs sm:text-sm text-green-700 bg-green-50 p-2 sm:p-3 rounded-md" role="note">
              <strong>Service Mediation:</strong> Platform will track milestones and mediate disputes.
            </div>
          </div>
        )}

        {perk.type !== 'service' && (
          <div className="md:col-span-2">
            <InputField label="Description" required id={`${perkIdPrefix}-description`} error={errors[`perk_${perk.id}_description`]}>
              <textarea value={perk.description} 
                        onChange={(e) => updatePerk(perk.id, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        rows={2} 
                        placeholder={'Describe the perk in detail...'} />
            </InputField>
          </div>
        )}

        {perk.type !== 'payment' && (
          <InputField label="Quantity" id={`${perkIdPrefix}-quantity`}>
            <input type="number" value={perk.quantity || 1}
                   onChange={(e) => updatePerk(perk.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                   min="1" />
          </InputField>
        )}
      </div>
      <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
        Total value: <span className="font-medium text-gray-900">${((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1)).toFixed(2)}</span>
      </div>
    </div>
    );
  };

  // Modal component with useId called unconditionally
  const Modal = ({ isOpen, onClose, children, title }: { 
    isOpen: boolean; 
    onClose: () => void; 
    children: React.ReactNode; 
    title: string 
  }) => {
    const modalContentRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<Element | null>(null);
    const modalGeneratedId = React.useId(); // Moved to top, called unconditionally
    // Ensure titleId is stable and derived from modalGeneratedId or a predictable title prop
    const titleId = `modal-${title.toLowerCase().replace(/\s+/g, '-')}-${modalGeneratedId}`;


    useEffect(() => {
      if (isOpen) {
        triggerRef.current = document.activeElement; 
        const focusableElements = modalContentRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      } else {
        if (triggerRef.current && typeof (triggerRef.current as HTMLElement).focus === 'function') {
          (triggerRef.current as HTMLElement).focus();
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
      }
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4" 
           role="dialog" aria-modal="true" aria-labelledby={titleId}
           onClick={onClose} 
           >
        <div 
            ref={modalContentRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col" 
            onClick={(e) => e.stopPropagation()}
        > 
          <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
            <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
            <button onClick={onClose} aria-label="Close modal" className="p-1 text-gray-500 hover:text-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="p-4 sm:p-6 flex-grow overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md z-[110]">
        Skip to main content
      </a>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-[60]" role="banner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-600 p-2 -ml-2 sm:p-0 sm:-ml-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded" aria-label="Back to dashboard">
                <ArrowLeft size={20} aria-hidden="true"/>
              </Link>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Create New Task</h1>
            </div>
            <div className="flex flex-col items-end text-xs sm:text-sm sm:flex-row sm:items-center gap-1 sm:gap-4">
              <div className="text-gray-600" aria-live="polite">Step {currentStep} of {STEP_TITLES.length}</div>
              {formData.perks.length > 0 && (
                <div className="flex items-center gap-2" role="status" aria-live="polite">
                  <div className="bg-green-100 text-green-800 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full font-medium whitespace-nowrap">{estimatedSuccessRate(formData.perks, formData.category, formData.urgency, categories)}% success</div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs sm:px-3 sm:py-1 sm:text-sm rounded-full font-medium whitespace-nowrap">${calculateTotalPerkValue(formData.perks).toFixed(0)} value</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <nav aria-label="Task creation progress" className="mb-6 sm:mb-8">
          <ol className="flex items-center justify-between">
            {STEP_TITLES.map((title, index) => (
              <React.Fragment key={index}>
                <li className="flex flex-col items-center text-center" aria-label={`Step ${index + 1}, ${title}${index + 1 === currentStep ? ', current step' : ''}`}>
                  <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 text-xs sm:text-sm ${
                    index + 1 <= currentStep ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'
                  }`} aria-current={index + 1 === currentStep ? 'step' : undefined}>
                    <span className="sr-only">Step {index + 1}</span>
                    {index + 1}
                  </div>
                  <div className={`mt-1 text-xs font-medium ${index + 1 <= currentStep ? 'text-indigo-600' : 'text-gray-500'} hidden sm:block`}>{title}</div>
                </li>
                {index < STEP_TITLES.length - 1 && <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${index + 1 < currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`} aria-hidden="true" />}
              </React.Fragment>
            ))}
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 lg:p-8">
          {currentStep === 1 && (
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 ref={stepHeadingRef} className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" tabIndex={-1}>Tell us about your task</h2>
                <p className="text-sm text-gray-600">Be specific and clear to get the best helpers.</p>
              </div>

              <InputField label="Task Title" required id="task-title" error={errors.title}>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={100}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Pickup and deliver documents"
                />
              </InputField>

              <InputField label="Detailed Description" required id="task-description" error={errors.description}>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe exactly what needs to be done, any specific instructions..."
                />
              </InputField>

              <InputField label="Category" required id="task-category-selection" error={errors.category}>
                  <OptionGrid
                    options={categories}
                    selected={formData.category}
                    onSelect={(id: string) => handleInputChange('category', id)}
                    ariaLabel="Select task category"
                    name="task-category"
                    renderOption={(category) => (
                        <div className="text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">{category.successRate} success</span>
                          </div>
                          <p className="text-xs text-gray-600">{category.desc}</p>
                        </div>
                      )
                    }
                  />
              </InputField>

              <InputField label="Urgency Level" id="task-urgency-selection" error={errors.urgency}>
                <OptionGrid
                  options={urgencyOptions}
                  selected={formData.urgency}
                  onSelect={(id: string) => handleInputChange('urgency', id as TaskFormData['urgency'])}
                  ariaLabel="Select urgency level"
                  name="task-urgency"
                  renderOption={(option) => (
                      <div className="text-sm">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900">{option.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${option.color} whitespace-nowrap`}>{option.multiplier}</span>
                        </div>
                        <p className="text-xs text-gray-600">{option.desc}</p>
                      </div>
                    )
                  }
                />
              </InputField>

              <InputField label="Task Location" required id="task-location-button" error={errors.location}>
                <LocationButton location={formData.location} onClick={() => setIsLocationPickerOpen(true)}
                               label="Pickup/Task Location" />
              </InputField>

              <div className="flex items-center gap-2 sm:gap-3">
                <input type="checkbox" id="needsDropoff" checked={formData.needsDropoff}
                       onChange={(e) => handleInputChange('needsDropoff', e.target.checked)}
                       className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2" />
                <label htmlFor="needsDropoff" className="text-sm font-medium text-gray-700">
                  This task requires a drop-off location
                </label>
              </div>

              {formData.needsDropoff && (
                <InputField label="Drop-off Location" required id="task-dropoff-button" error={errors.dropoffLocation}>
                  <LocationButton location={formData.dropoffLocation} onClick={() => setIsDropoffPickerOpen(true)}
                                 label="Drop-off Location" icon="green" />
                </InputField>
              )}
            </div>
          )}

          {currentStep === 2 && (
             <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 ref={stepHeadingRef} className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" tabIndex={-1}>Additional Requirements</h2>
                <p className="text-sm text-gray-600">Help helpers understand exactly what you need.</p>
              </div>

              <InputField label="Estimated Duration (Optional)" id="estimated-duration">
                <select
                        value={formData.estimatedDuration} 
                        onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base appearance-none bg-white pr-8 bg-no-repeat"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                        >
                  <option value="">Not specified</option>
                  {['15min', '30min', '45min', '1hour', '1.5hours', '2hours', '3hours', '4hours+'].map(time => (
                    <option key={time} value={time}>
                      {time.replace('hours', ' hours').replace('hour', ' hour').replace('min', ' minutes')}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Specific Requirements & Instructions (Optional)" id="specific-requirements">
                <textarea 
                          value={formData.specificRequirements} 
                          onChange={(e) => handleInputChange('specificRequirements', e.target.value)} rows={4}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                          placeholder="Any special instructions, tools needed, or things the helper should know..." />
              </InputField>

              <InputField label="Task Photos (Optional, Max 5)" id="photo-upload-button">
                <button onClick={() => setIsPhotoUploadOpen(true)} type="button"
                        aria-label={formData.photos.length > 0 ? `Change task photos, ${formData.photos.length} selected` : "Add task photos"}
                        className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <div className="text-center">
                    <div className="text-gray-400 mb-1 sm:mb-2 text-2xl sm:text-3xl" role="img" aria-hidden="true">📸</div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {formData.photos.length > 0 ? `View/Edit Photos (${formData.photos.length})` : 'Add Photos'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formData.photos.length > 0 ? `Up to 5 photos. Tap to change.` : 'Visually show what needs to be done.'}
                    </p>
                  </div>
                </button>
              </InputField>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4" role="complementary" aria-labelledby="pro-tips-heading">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 id="pro-tips-heading" className="font-medium text-yellow-800 text-sm sm:text-base">Pro Tips for Better Results</h4>
                    <ul className="text-xs sm:text-sm text-yellow-700 mt-1 sm:mt-2 space-y-1 list-disc list-inside">
                      <li>Be specific about timing and deadlines.</li>
                      <li>Include backup contact methods if needed.</li>
                      <li>Mention any access requirements (keys, codes).</li>
                      <li>Photos can significantly increase task acceptance.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 ref={stepHeadingRef} className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" tabIndex={-1}>Offer Your Perks</h2>
                <p className="text-sm text-gray-600">Combine payments, goods, or services to create an attractive offer.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4" role="complementary" aria-labelledby="escrow-info-heading">
                <div className="flex items-start gap-2 sm:gap-3">
                  <DollarSign size={20} className="text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 id="escrow-info-heading" className="font-medium text-blue-800 text-sm sm:text-base">Multi-Type Escrow System</h4>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">Different perk types have different escrow protections:</p>
                    <ul className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li><strong>Payments:</strong> Held in digital escrow until task completion.</li>
                      <li><strong>Physical Goods:</strong> Optional platform storage/verification.</li>
                      <li><strong>Services:</strong> Milestone tracking and completion mediation.</li>
                    </ul>
                    {calculateTotalPerkValue(formData.perks) > 0 && (
                      <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-blue-800">
                        Platform fee: ${calculatePlatformFee(formData.perks).toFixed(2)}
                        <span className="block text-xs sm:inline"> (Note: Escrow for goods may have additional fees)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Add Perks to Your Task</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {(['payment', 'good', 'service'] as const).map(type => (
                    <button key={type} onClick={() => addPerk(type)} type="button"
                            aria-label={`Add ${type} perk`}
                            className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <div className="text-center">
                        {getPerkIcon(type)}
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base mt-1">Add {type.charAt(0).toUpperCase() + type.slice(1)}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                          {type === 'payment' ? 'Cash, Credits' : 
                           type === 'good' ? 'Items, Vouchers' :
                           'Rides, Delivery'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {isCombinationPerk(formData.perks) && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4" role="status">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 text-lg" role="img" aria-label="gift indicating combination bonus" aria-hidden="true">🎁</span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-purple-800">Combination Perk Bonus!</h4>
                        <p className="text-xs text-purple-700">Increased appeal (+{getCombinationBonus(formData.perks)}% success rate).</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {formData.perks.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Your Perk Offer Details</h3>
                  <div className="space-y-3 sm:space-y-4" role="list" aria-label="Current perks list">
                    {formData.perks.map(perk => <PerkCard key={perk.id} perk={perk} />)}
                  </div>
                   {errors.perks && !Object.keys(errors).some(k => k.startsWith("perk_") && k !== "perks") && (
                    <p className="text-red-500 text-xs mt-2" role="alert">{errors.perks}</p>
                   )}
                </div>
              )}

              {formData.perks.length === 0 && errors.perks && (
                 <p className="text-red-500 text-sm text-center py-4" role="alert">{errors.perks}</p>
              )}


              {formData.perks.length > 0 && (
                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-200 mt-4 sm:mt-6" role="region" aria-labelledby="perk-summary-heading">
                  <h4 id="perk-summary-heading" className="font-medium text-indigo-900 mb-2 text-sm sm:text-base">Perk Offer Summary</h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Total Value:</span>
                      <span className="font-medium text-indigo-900">${calculateTotalPerkValue(formData.perks).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-indigo-700">Platform Fee ({(PLATFORM_FEE_RATE * 100).toFixed(0)}%):</span>
                      <span className="font-medium text-indigo-900">-${calculatePlatformFee(formData.perks).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-indigo-200 pt-1 sm:pt-2 mt-1 sm:mt-2">
                      <span className="text-indigo-700 font-medium">Net to Helper:</span>
                      <span className="font-bold text-indigo-900">${(calculateTotalPerkValue(formData.perks) - calculatePlatformFee(formData.perks)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 pt-2">
                <input type="checkbox" id="allowNegotiation" checked={formData.allowNegotiation}
                       onChange={(e) => handleInputChange('allowNegotiation', e.target.checked)}
                       className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2" />
                <label htmlFor="allowNegotiation" className="text-sm font-medium text-gray-700">
                  Allow helpers to negotiate perk details
                </label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
             <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 ref={stepHeadingRef} className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2" tabIndex={-1}>Review Your Task</h2>
                <p className="text-sm text-gray-600">Make sure everything looks good before publishing.</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6" role="region" aria-labelledby="task-review-summary-heading">
                <h3 id="task-review-summary-heading" className="sr-only">Task Review Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 text-center">
                  {[
                    { label: 'Success Rate', value: `${estimatedSuccessRate(formData.perks, formData.category, formData.urgency, categories)}%`, highlight: true },
                    { label: 'Avg. Claim Time', value: '8 min' },
                    { label: 'Expected Helpers', value: Math.max(1, Math.floor(calculateTotalPerkValue(formData.perks) / 15) + (isCombinationPerk(formData.perks) ? 1 : 0) + (formData.urgency === 'emergency' ? 1:0) ).toString() },
                    { label: 'Total Value', value: `${calculateTotalPerkValue(formData.perks).toFixed(0)}`, highlight: true }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className={`text-xl sm:text-2xl font-bold ${stat.highlight ? (stat.label === 'Success Rate' ? 'text-green-600' : 'text-purple-600') : 'text-blue-600'}`}>{stat.value}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">{formData.title || "Untitled Task"}</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.description || "No description provided."}</p>
                  </div>

                  <div className="flex flex-wrap gap-2" role="list" aria-label="Task attributes">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${urgencyOptions.find(u => u.id === formData.urgency)?.color || 'bg-gray-100 text-gray-800'}`}>
                      {urgencyOptions.find(u => u.id === formData.urgency)?.name || formData.urgency}
                    </span>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                      {categories.find(c => c.id === formData.category)?.name || formData.category || "Uncategorized"}
                    </span>
                    {formData.estimatedDuration && (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 flex items-center">
                        <Clock size={12} className="inline mr-1" aria-hidden="true" />{formData.estimatedDuration.replace('min','m').replace('hour','h').replace('hours','h')}
                      </span>
                    )}
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
                      {formData.perks.length} Perk{formData.perks.length !== 1 ? 's' : ''} {isCombinationPerk(formData.perks) && '(Combo)'}
                    </span>
                  </div>

                  {formData.location && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div><strong className="font-medium text-indigo-600">Pickup:</strong> {formData.location.address}</div>
                    </div>
                  )}

                  {formData.dropoffLocation && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div><strong className="font-medium text-green-600">Drop-off:</strong> {formData.dropoffLocation.address}</div>
                    </div>
                  )}
                  
                  {formData.specificRequirements && (
                     <div>
                        <h4 className="font-medium text-gray-700 text-sm mb-1">Specific Requirements:</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{formData.specificRequirements}</p>
                    </div>
                  )}

                  {formData.photos.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-700 text-sm mb-1">Photos:</h4>
                        <div className="flex flex-wrap gap-2">
                            {formData.photos.map((file, index) => {
                                const imageUrl = URL.createObjectURL(file);
                                return (
                                    <div key={index} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md border overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={`Task photo ${index + 1}`}
                                            layout="fill"
                                            objectFit="cover"
                                            onLoadingComplete={() => URL.revokeObjectURL(imageUrl)} 
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  )}


                  {formData.perks.length > 0 && (
                    <div className="bg-white rounded-lg p-3 sm:p-4 border" role="region" aria-labelledby="review-perk-package-heading">
                      <h4 id="review-perk-package-heading" className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Perk Package{isCombinationPerk(formData.perks) ? ' (Combination)' : ''}:
                      </h4>
                      <ul className="space-y-2 sm:space-y-3" aria-label="List of perks in the package">
                        {formData.perks.map(perk => (
                          <li key={perk.id} className="flex items-start gap-2 sm:gap-3">
                            <div className="flex-shrink-0 pt-0.5" aria-hidden="true">{getPerkIcon(perk.type)}</div>
                            <div className="flex-1 text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <span className="font-medium text-gray-900">{perk.name}</span>
                                <span className="text-xs sm:text-sm text-indigo-600 font-medium">
                                  ${((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1)).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{perk.description}</p>
                              {perk.quantity && perk.quantity > 1 && <p className="text-xs text-gray-500">Quantity: {perk.quantity}</p>}
                              {perk.type === 'good' && perk.deliveryMethod && (
                                <p className="text-xs text-blue-600 mt-0.5">
                                  {perk.deliveryMethod === 'ship_to_platform' ? '📦 Platform Escrow' :
                                   perk.deliveryMethod === 'local_handoff' ? '🤝 Local Handoff' : '🚚 Direct Delivery'}
                                </p>
                              )}
                              {perk.type === 'service' && <p className="text-xs text-purple-600 mt-0.5">🛠️ Platform Mediated</p>}
                            </div>
                          </li>
                        ))}
                        
                        <li className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Value:</span>
                            <span className="font-medium">${calculateTotalPerkValue(formData.perks).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Platform Fee:</span>
                            <span className="text-red-600">-${calculatePlatformFee(formData.perks).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-medium mt-1">
                            <span>Net to Helper:</span>
                            <span className="text-green-600">${(calculateTotalPerkValue(formData.perks) - calculatePlatformFee(formData.perks)).toFixed(2)}</span>
                          </div>
                        </li>
                        
                        <li className="text-xs sm:text-sm text-gray-600 mt-1">
                          {formData.allowNegotiation ? '✓ Negotiation allowed with helper' : '✗ Perk offer is fixed'}
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-sm" role="alert">
                <h4 className="font-medium text-blue-800 mb-1 sm:mb-2">Ready to Publish?</h4>
                <p className="text-blue-700">
                  Your task will be visible to verified helpers. Payments are held in escrow, goods secured via chosen method, and services mediated by the platform. Review all details carefully before publishing.
                </p>
              </div>
            </div>
          )}

          <nav className="flex flex-col-reverse gap-3 pt-6 mt-6 sm:mt-8 border-t sm:flex-row sm:justify-between" aria-label="Form step navigation">
            <button 
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} 
                disabled={currentStep === 1}
                type="button"
                className="w-full px-6 py-2.5 sm:py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
              Previous
            </button>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {currentStep === 4 && (
                <button 
                    onClick={() => setShowPreview(!showPreview)} 
                    type="button"
                    className="w-full px-6 py-2.5 sm:py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                    aria-pressed={showPreview}>
                  <Eye size={16} aria-hidden="true" />
                  {showPreview ? 'Hide Preview' : 'Preview Task'}
                </button>
              )}
              
              {currentStep < 4 ? (
                <button 
                    onClick={() => validateStep(currentStep) && setCurrentStep(prev => Math.min(STEP_TITLES.length, prev + 1))}
                    type="button"
                    className="w-full px-6 py-2.5 sm:py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
                  Next <ChevronRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button 
                    type="button" 
                    onClick={() => {
                        if (validateStep(1) && validateStep(3)) { 
                            console.log('Submitting task:', {
                                ...formData, 
                                totalPerkValue: calculateTotalPerkValue(formData.perks), 
                                platformFee: calculatePlatformFee(formData.perks),
                                netPerkValue: calculateTotalPerkValue(formData.perks) - calculatePlatformFee(formData.perks)
                            });
                             alert('Task Submitted! (Check console for data). This is a demo action.');
                        } else {
                            alert('Please correct the errors before publishing.');
                            const firstInvalidField = document.querySelector<HTMLElement>('[aria-invalid="true"]');
                            firstInvalidField?.focus();
                        }
                    }} 
                    className="w-full px-8 py-2.5 sm:py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto">
                  Publish Task 
                  <span className="block text-xs sm:inline sm:ml-1">(${calculatePlatformFee(formData.perks).toFixed(2)} fee)</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </main>

      <Modal isOpen={isLocationPickerOpen} onClose={() => setIsLocationPickerOpen(false)} title="Set Task Location">
        <LocationPicker isOpen={isLocationPickerOpen} onClose={() => setIsLocationPickerOpen(false)}
                        onLocationSelect={(location) => { handleInputChange('location', location); setIsLocationPickerOpen(false); }} />
      </Modal>
      
      <Modal isOpen={isDropoffPickerOpen} onClose={() => setIsDropoffPickerOpen(false)} title="Set Drop-off Location">
        <LocationPicker isOpen={isDropoffPickerOpen} onClose={() => setIsDropoffPickerOpen(false)}
                        onLocationSelect={(location) => { handleInputChange('dropoffLocation', location); setIsDropoffPickerOpen(false); }} />
      </Modal>
      
      <Modal isOpen={isPhotoUploadOpen} onClose={() => setIsPhotoUploadOpen(false)} title="Upload Task Photos">
        <PhotoUpload isOpen={isPhotoUploadOpen} onClose={() => setIsPhotoUploadOpen(false)}
                     onPhotosSelected={(photos) => { handleInputChange('photos', photos); setIsPhotoUploadOpen(false); }}
                     title="Add Task Photos" description="Help helpers understand your task better with photos (max 5)." maxPhotos={5} />
      </Modal>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {Object.keys(errors).length > 0 && `Form has ${Object.keys(errors).length} error${Object.keys(errors).length !== 1 ? 's' : ''}. Please review highlighted fields.`}
      </div>
      
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {formData.perks.length > 0 && `${formData.perks.length} perk${formData.perks.length !== 1 ? 's' : ''} added, total value ${calculateTotalPerkValue(formData.perks).toFixed(2)}.`}
      </div>
    </div>
  );
};

export default TaskCreationPage;