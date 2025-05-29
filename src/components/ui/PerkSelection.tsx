// File: src/components/ui/PerkSelection.tsx
// Component: PerkSelection
// Type: Client Component (uses useState, form handling)
// Dependencies: lucide-react

"use client";

import React, { useState } from 'react';
import { Gift, CreditCard, Repeat, Palette, Package, Plus, Info } from 'lucide-react';

interface PerkOption {
  id: string;
  category: 'monetary' | 'service' | 'physical' | 'creative';
  type: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  valueFactor: number;
  disputeFactor: number;
  reciprocityRisk: number;
  fields: FormField[];
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface PerkData {
  category: string;
  type: string;
  details: Record<string, string | number | undefined>;
}

interface PerkSelectionProps {
  onPerkSelect: (perk: PerkData) => void;
  allowNegotiation?: boolean;
  onNegotiationToggle?: (allow: boolean) => void;
  className?: string;
}

const PerkSelection: React.FC<PerkSelectionProps> = ({
  onPerkSelect,
  allowNegotiation = true,
  onNegotiationToggle,
  className = ""
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPerk, setSelectedPerk] = useState<PerkOption | null>(null);
  const [formData, setFormData] = useState<Record<string, string | undefined>>({});
  const [showNegotiation, setShowNegotiation] = useState(allowNegotiation);

  const perkOptions: PerkOption[] = [
    // Monetary Perks
    {
      id: 'cash_payment',
      category: 'monetary',
      type: 'cash',
      name: 'Cash Payment',
      description: 'Direct cash payment in person',
      icon: CreditCard,
      valueFactor: 9,
      disputeFactor: 2,
      reciprocityRisk: 1,
      fields: [
        { id: 'amount', label: 'Amount (£)', type: 'number', required: true, min: 1, max: 500 },
        { id: 'currency', label: 'Currency', type: 'select', required: true, options: ['GBP', 'EUR', 'USD'] }
      ]
    },
    {
      id: 'gift_card',
      category: 'monetary',
      type: 'gift_card',
      name: 'Gift Card',
      description: 'Digital or physical gift card',
      icon: Gift,
      valueFactor: 8,
      disputeFactor: 4,
      reciprocityRisk: 2,
      fields: [
        { id: 'retailer', label: 'Retailer', type: 'text', required: true, placeholder: 'e.g., Amazon, Tesco' },
        { id: 'amount', label: 'Value (£)', type: 'number', required: true, min: 5, max: 200 },
        { id: 'expiry', label: 'Expiry Date', type: 'text', required: false, placeholder: 'e.g., No expiry, Dec 2025' }
      ]
    },
    // Service Exchange Perks
    {
      id: 'household_task',
      category: 'service',
      type: 'personal_service',
      name: 'Household Task',
      description: 'Cleaning, organizing, or yard work',
      icon: Repeat,
      valueFactor: 8,
      disputeFactor: 6,
      reciprocityRisk: 5,
      fields: [
        { id: 'service_type', label: 'Service Type', type: 'select', required: true, options: ['Cleaning', 'Organizing', 'Yard Work', 'Other'] },
        { id: 'duration', label: 'Estimated Duration', type: 'text', required: true, placeholder: 'e.g., 2 hours' },
        { id: 'location', label: 'Service Location', type: 'text', required: true, placeholder: 'Your address or area' },
        { id: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe what needs to be done...' }
      ]
    },
    {
      id: 'professional_service',
      category: 'service',
      type: 'professional_service',
      name: 'Professional Service',
      description: 'Design, writing, coding, or consulting',
      icon: Package,
      valueFactor: 7,
      disputeFactor: 8,
      reciprocityRisk: 7,
      fields: [
        { id: 'service_category', label: 'Service Category', type: 'select', required: true, options: ['Design', 'Writing', 'Coding', 'Consulting', 'Other'] },
        { id: 'scope', label: 'Scope of Work', type: 'textarea', required: true, placeholder: 'Detailed description of deliverables...' },
        { id: 'timeline', label: 'Timeline', type: 'text', required: true, placeholder: 'e.g., 1 week, 3 days' },
        { id: 'revisions', label: 'Number of Revisions', type: 'number', required: false, min: 0, max: 5 }
      ]
    },
    // Physical Goods
    {
      id: 'retail_product',
      category: 'physical',
      type: 'new_item',
      name: 'Retail Product',
      description: 'New item from store or online',
      icon: Package,
      valueFactor: 7,
      disputeFactor: 4,
      reciprocityRisk: 2,
      fields: [
        { id: 'product_name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Apple AirPods Pro' },
        { id: 'brand', label: 'Brand/Model', type: 'text', required: false, placeholder: 'e.g., Apple, Samsung' },
        { id: 'condition', label: 'Condition', type: 'select', required: true, options: ['Brand New', 'Like New', 'Good', 'Fair'] },
        { id: 'estimated_value', label: 'Estimated Value (£)', type: 'number', required: true, min: 1 },
        { id: 'photos', label: 'Photos', type: 'file', required: false }
      ]
    },
    // Creative Perks
    {
      id: 'custom_artwork',
      category: 'creative',
      type: 'artistic_creation',
      name: 'Custom Artwork',
      description: 'Drawing, painting, or digital art',
      icon: Palette,
      valueFactor: 4,
      disputeFactor: 9,
      reciprocityRisk: 7,
      fields: [
        { id: 'art_type', label: 'Art Type', type: 'select', required: true, options: ['Drawing', 'Painting', 'Digital Art', 'Photography', 'Other'] },
        { id: 'subject', label: 'Subject/Theme', type: 'text', required: true, placeholder: 'e.g., Portrait, landscape, abstract' },
        { id: 'dimensions', label: 'Size/Dimensions', type: 'text', required: false, placeholder: 'e.g., A4, 12x16 inches' },
        { id: 'timeline', label: 'Creation Timeline', type: 'text', required: true, placeholder: 'e.g., 1 week, 3 days' },
        { id: 'materials', label: 'Materials/Medium', type: 'text', required: false, placeholder: 'e.g., Oil paint, digital, pencil' }
      ]
    }
  ];

  const categories = [
    { id: 'monetary', name: 'Cash & Cards', icon: CreditCard, description: 'Direct payments and gift cards' },
    { id: 'service', name: 'Service Exchange', icon: Repeat, description: 'Trade services and skills' },
    { id: 'physical', name: 'Physical Items', icon: Package, description: 'Products and tangible goods' },
    { id: 'creative', name: 'Creative & Custom', icon: Palette, description: 'Artistic and personalized items' }
  ];

  const getRiskColor = (factor: number) => {
    if (factor <= 3) return 'text-green-600';
    if (factor <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedPerk(null);
    setFormData({});
  };

  const handlePerkSelect = (perk: PerkOption) => {
    setSelectedPerk(perk);
    setFormData({});
  };

  const handleFormChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    if (!selectedPerk) return;

    const isValid = selectedPerk.fields
      .filter(field => field.required)
      .every(field => formData[field.id] && formData[field.id]!.toString().trim());

    if (!isValid) {
      alert('Please fill in all required fields.');
      return;
    }

    const perkData: PerkData = {
      category: selectedPerk.category,
      type: selectedPerk.type,
      details: {
        ...formData,
        perkName: selectedPerk.name,
        valueFactor: selectedPerk.valueFactor,
        disputeFactor: selectedPerk.disputeFactor,
        reciprocityRisk: selectedPerk.reciprocityRisk
      }
    };

    onPerkSelect(perkData);
  };

  const toggleNegotiation = () => {
    setShowNegotiation(!showNegotiation);
    onNegotiationToggle?.(!showNegotiation);
  };

  const filteredPerks = selectedCategory 
    ? perkOptions.filter(perk => perk.category === selectedCategory)
    : [];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">What will you offer as a perk?</h3>
        <p className="text-gray-600">Choose how you&apos;d like to reward the person helping you</p>
      </div>

      {/* Category Selection */}
      {!selectedCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent size={24} className="text-indigo-600" />
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Perk Type Selection */}
      {selectedCategory && !selectedPerk && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory('')}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              ← Back to categories
            </button>
          </div>
          
          <div className="space-y-3">
            {filteredPerks.map((perk) => {
              const IconComponent = perk.icon;
              return (
                <button
                  key={perk.id}
                  onClick={() => handlePerkSelect(perk)}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent size={20} className="text-indigo-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900">{perk.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{perk.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Info size={12} className="text-gray-400" />
                      <span className={getRiskColor(perk.disputeFactor)}>
                        Risk: {perk.disputeFactor}/10
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Perk Details Form */}
      {selectedPerk && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedPerk(null)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              ← Back to {selectedCategory} options
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-3 mb-2">
              <selectedPerk.icon size={20} className="text-indigo-600" />
              <h4 className="font-medium text-gray-900">{selectedPerk.name}</h4>
            </div>
            <p className="text-sm text-gray-600">{selectedPerk.description}</p>
            
            {/* Risk Indicators */}
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="font-medium">Value Appeal:</span>
                <span className={getRiskColor(10 - selectedPerk.valueFactor)}>
                  {selectedPerk.valueFactor}/10
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="font-medium">Dispute Risk:</span>
                <span className={getRiskColor(selectedPerk.disputeFactor)}>
                  {selectedPerk.disputeFactor}/10
                </span>
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {selectedPerk.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
                
                {field.type === 'number' && (
                  <input
                    type="number"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
                
                {field.type === 'textarea' && (
                  <textarea
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                )}
                
                {field.type === 'select' && (
                  <select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFormChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'file' && (
                  <button
                    type="button"
                    onClick={() => {/* Open photo upload modal */}}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                    Add Photos
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Negotiation Toggle */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showNegotiation}
                onChange={toggleNegotiation}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div>
                <span className="font-medium text-gray-900">Allow counter-offers</span>
                <p className="text-sm text-gray-600">Let helpers suggest alternative perks</p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Confirm Perk Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default PerkSelection;