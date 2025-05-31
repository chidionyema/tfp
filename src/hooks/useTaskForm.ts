// File: /src/hooks/useTaskForm.ts

import { useState, useCallback, useEffect, useMemo } from "react";
import type { TaskFormData, DbsRequirement, PerkItem } from "@/types/task";
import { getRecommendedDbsLevel, suggestDbsFromDescription } from "@/constants/dbs-constants";
import { getCategories, getUrgencyOptions } from "@/constants/task-constants";
import { calculateTotalTaskCost } from "@/types/task";

// Generate unique ID for perks
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTaskForm = () => {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TaskFormData>(getDefaultFormData());

  // Constants
  const categories = useMemo(() => getCategories(), []);
  const urgencyOptions = useMemo(() => getUrgencyOptions(), []);

  // Default form data with DBS requirement
  function getDefaultFormData(): TaskFormData {
    return {
      title: "",
      description: "",
      category: "",
      urgency: "medium",
      mode: "physical",
      location: null,
      requiresPickup: false,
      dropoffLocation: null,
      needsDropoff: false,
      estimatedDuration: "",
      specificRequirements: "",
      allowNegotiation: false,
      escrowAgreed: false,
      dbsRequirement: "none", // Default to no DBS requirement
      perks: [],
      photos: []
    };
  }

  // Enhanced form initialization to include DBS requirement
  const initializeFormData = useCallback(() => {
    const savedDraft = localStorage.getItem("taskWizardDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Ensure dbsRequirement has a default value
        if (!parsed.dbsRequirement) {
          parsed.dbsRequirement = "none";
        }
        // Ensure other required fields have defaults
        const completeData = { ...getDefaultFormData(), ...parsed };
        setFormData(completeData);
      } catch (error) {
        console.error("Failed to parse saved draft:", error);
        setFormData(getDefaultFormData());
      }
    } else {
      setFormData(getDefaultFormData());
    }
  }, []);

  // Initialize form data on mount
  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

  // Enhanced handleInputChange to include DBS auto-suggestions
  const handleInputChange = useCallback((field: keyof TaskFormData, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-suggest DBS level based on category selection
      if (field === "category" && typeof value === "string") {
        const recommendedDbs = getRecommendedDbsLevel(value);
        if (recommendedDbs !== "none" && (!prev.dbsRequirement || prev.dbsRequirement === "none")) {
          newData.dbsRequirement = recommendedDbs;
        }
      }

      // Auto-suggest DBS level based on description content
      if (field === "description" && typeof value === "string") {
        const suggestedDbs = suggestDbsFromDescription(value);
        if (suggestedDbs !== "none" && (!prev.dbsRequirement || prev.dbsRequirement === "none")) {
          newData.dbsRequirement = suggestedDbs;
        }
      }

      return newData;
    });
  }, []);

  // Helper function to get minimum perk value based on DBS requirement
  const getMinimumPerkValueForDbs = useCallback((dbsRequirement: DbsRequirement): number => {
    switch (dbsRequirement) {
      case "enhanced": return 50;
      case "standard": return 40;
      case "basic": return 30;
      default: return 20;
    }
  }, []);

  // Calculate total perk value
  const calculateTotalPerkValue = useCallback((perks: PerkItem[]): number => {
    return perks.reduce((sum, perk) => {
      return sum + ((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1));
    }, 0);
  }, []);

  // Enhanced validation that considers DBS requirements
  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    // Step 1 validation
    if (currentStep >= 1) {
      if (!formData.title?.trim()) errors.title = "Please enter a title";
      if (!formData.category) errors.category = "Please select a category";
      if (!formData.urgency) errors.urgency = "Please select urgency";
      if (!formData.mode) errors.mode = "Please select task mode";

      const needsPhysical = formData.mode === "physical" || formData.mode === "hybrid";
      if (needsPhysical && !formData.location) errors.location = "Please set a location";
    }

    // Step 2 validation including DBS
    if (currentStep >= 2) {
      if (!formData.description?.trim()) errors.description = "Please provide a description";
      if (!formData.estimatedDuration) errors.estimatedDuration = "Please estimate the time required";

      // DBS validation
      if (!formData.dbsRequirement) {
        errors.dbsRequirement = "Please select a DBS requirement level";
      }

      // Validate specific requirements length if provided
      if (formData.specificRequirements && formData.specificRequirements.length > 500) {
        errors.specificRequirements = "Requirements must be 500 characters or less";
      }
    }

    // Step 3 validation with enhanced DBS perk validation
    if (currentStep >= 3) {
      if (!formData.perks || formData.perks.length === 0) {
        errors.perks = "Add at least one perk";
      } else if (formData.dbsRequirement && formData.dbsRequirement !== "none") {
        const totalPerkValue = calculateTotalPerkValue(formData.perks);
        const minValue = getMinimumPerkValueForDbs(formData.dbsRequirement);

        if (totalPerkValue < minValue) {
          errors.perks = `Tasks requiring ${formData.dbsRequirement} DBS checks typically offer £${minValue}+ to attract qualified helpers`;
        }
      }
    }

    // Step 4 validation
    if (currentStep >= 4 && !formData.escrowAgreed) {
      errors.escrowAgreed = "You must agree to escrow terms";
    }

    return errors;
  }, [formData, currentStep, calculateTotalPerkValue, getMinimumPerkValueForDbs]);

  // Perk management functions
  const addPerk = useCallback((perkData: Omit<PerkItem, "id">) => {
    const id = generateId();

    // Merge incoming perkData into defaults, ensuring no duplicate keys
    const newPerk: PerkItem = {
      id,                                       // Always generate a new ID
      ...perkData,                              // Spread incoming data first
      name: perkData.name ?? "",                // Provide default if missing/undefined
      description: perkData.description ?? "",  // Provide default if missing/undefined
      estimatedValue: perkData.estimatedValue ?? 0,
      quantity: perkData.quantity ?? 1,
      // If PerkItem ever adds more fields, set defaults here or let them be optional.
      // e.g.: type: perkData.type ?? "standard",
      // e.g.: customValue: perkData.customValue ?? perkData.estimatedValue ?? 0
    };

    setFormData(prev => ({
      ...prev,
      perks: [...prev.perks, newPerk]
    }));
  }, []);

  const updatePerk = useCallback((id: string, updates: Partial<PerkItem>) => {
    setFormData(prev => ({
      ...prev,
      perks: prev.perks.map(perk =>
        perk.id === id ? { ...perk, ...updates } : perk
      )
    }));
  }, []);

  const removePerk = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      perks: prev.perks.filter(perk => perk.id !== id)
    }));
  }, []);

  // Calculated values
  const totalPerkValue = useMemo(() => calculateTotalPerkValue(formData.perks), [formData.perks, calculateTotalPerkValue]);

  const platformFee = useMemo(() => totalPerkValue * 0.05, [totalPerkValue]); // 5% platform fee

  const isCombo = useMemo(() => {
    const perkTypes = new Set(formData.perks.map(p => p.type));
    return perkTypes.size > 1;
  }, [formData.perks]);

  const comboBonus = useMemo(() => isCombo ? 15 : 0, [isCombo]); // 15% bonus for combo perks

  const successRate = useMemo(() => {
    let baseRate = 85; // Base success rate

    // Category bonus
    const category = categories.find(c => c.id === formData.category);
    if (category) {
      const categoryRate = parseInt(category.successRate.replace('%', ''));
      baseRate = Math.max(baseRate, categoryRate);
    }

    // Urgency modifier
    const urgencyModifiers: Record<string, number> = { low: -5, medium: 0, high: 10, emergency: 20 };
    baseRate += urgencyModifiers[formData.urgency as keyof typeof urgencyModifiers] || 0;

    // Combo bonus
    baseRate += comboBonus;

    // DBS requirement modifier (higher requirements may reduce pool but increase trust)
    if (formData.dbsRequirement === "enhanced") baseRate += 5;
    else if (formData.dbsRequirement === "standard") baseRate += 3;
    else if (formData.dbsRequirement === "basic") baseRate += 1;

    // Perk value modifier
    if (totalPerkValue > 100) baseRate += 10;
    else if (totalPerkValue > 50) baseRate += 5;
    else if (totalPerkValue < 20) baseRate -= 10;

    return Math.min(Math.max(baseRate, 10), 99); // Clamp between 10-99%
  }, [formData.category, formData.urgency, formData.dbsRequirement, totalPerkValue, comboBonus, categories]);

  // Task costs including DBS
  const taskCosts = useMemo(() => calculateTotalTaskCost(formData), [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setCurrentStep(1);
    localStorage.removeItem("taskWizardDraft");
  }, []);

  // Clear draft
  const clearDraft = useCallback(() => {
    localStorage.removeItem("taskWizardDraft");
  }, []);

  return {
    // Form state
    currentStep,
    setCurrentStep,
    formData,

    // Constants
    categories,
    urgencyOptions,

    // Form actions
    handleInputChange,
    resetForm,
    clearDraft,

    // Perk management
    addPerk,
    updatePerk,
    removePerk,

    // Calculated values
    totalPerkValue,
    platformFee,
    isCombo,
    comboBonus,
    successRate,
    taskCosts,

    // Validation
    validateCurrentStep,

    // Utilities
    getMinimumPerkValueForDbs,
    calculateTotalPerkValue
  };
};
