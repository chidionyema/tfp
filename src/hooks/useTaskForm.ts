"use client";

import { useState, useMemo } from "react";
import type { TaskFormData, PerkItem, TaskMode } from "@/types/task";
import {
  MIN_PERK_VALUE,
  getCategories,
  getUrgencyOptions,
} from "@/constants/task-constants";
import {
  calculatePlatformFee,
  calculateTotalPerkValue,
  isCombinationPerk,
  getCombinationBonus,
  estimatedSuccessRate,
} from "@/utils/task-utils";

/**
 * Bundles all mutable state + validation for the multi-step form.
 */
export function useTaskForm() {
  /* ---------------------------------------------------------------------- */
  /*  Static look-ups                                                       */
  /* ---------------------------------------------------------------------- */
  const categories = useMemo(getCategories, []);
  const urgencyOptions = useMemo(getUrgencyOptions, []);

  /* ---------------------------------------------------------------------- */
  /*  Local state                                                           */
  /* ---------------------------------------------------------------------- */
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TaskFormData>(() => ({
    /* Basics */
    title: "",
    description: "",
    category: "",
    urgency: "medium",
    mode: "physical",
  
    /* Locations */
    location: null,
    requiresPickup: false,   // ← NEW default
    dropoffLocation: null,
    needsDropoff: false,
  
    /* Extras */
    estimatedDuration: "",
    specificRequirements: "",
    allowNegotiation: true,
  
    /* Agreement */
    escrowAgreed: false,     // ← NEW default
  
    /* Online */
    meetingLink: "",         // optional, keep empty string
  
    /* Perks & media */
    perks: [],
    photos: [],
  }));
  

  /* ---------------------------------------------------------------------- */
  /*  Derived helpers                                                       */
  /* ---------------------------------------------------------------------- */
  const needsPhysical = (mode: TaskMode) =>
    mode === "physical" || mode === "hybrid";

  /* ---------------------------------------------------------------------- */
  /*  Mutators                                                              */
  /* ---------------------------------------------------------------------- */
  const handleInputChange = (field: keyof TaskFormData, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as TaskFormData;

      /* Category-driven convenience flag */
      if (field === "category") {
        const cat = categories.find((c) => c.id === value);
        next.needsDropoff = !!cat?.needsDropoff;
      }

      return next;
    });

    /* Clear error for that field */
    if (errors[field]) {
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  /* --- perks ------------------------------------------------------------ */
  const addPerk = (
    template: Omit<PerkItem, "id"> & { type: PerkItem["type"] }
  ) => {
    const newPerk: PerkItem = { ...template, id: `perk-${Date.now()}` };
    // FIXED: Add new perks at the beginning so most recent appears first
    setFormData((p) => ({ ...p, perks: [newPerk, ...p.perks] }));
  };

  const updatePerk = (id: string, updates: Partial<PerkItem>) =>
    setFormData((p) => ({
      ...p,
      perks: p.perks.map((k) => (k.id === id ? { ...k, ...updates } : k)),
    }));

  const removePerk = (id: string) =>
    setFormData((p) => ({ ...p, perks: p.perks.filter((k) => k.id !== id) }));

  /* ---------------------------------------------------------------------- */
  /*  Validation                                                            */
  /* ---------------------------------------------------------------------- */
  const validateStep = (s: number) => {
    const v: Record<string, string> = {};
    const d = formData;

    /* ---------------- step 1 ---------------- */
    if (s === 1) {
      if (!d.title.trim()) v.title = "Task title is required.";
      else if (d.title.length > 100) v.title = "Max 100 characters.";

      if (!d.description.trim())
        v.description = "Task description is required.";
      else if (d.description.length > 1000)
        v.description = "Max 1000 characters.";

      if (!d.category) v.category = "Select a category.";

      if (needsPhysical(d.mode) && !d.location)
        v.location = "Set a task location.";

      if (needsPhysical(d.mode) && d.needsDropoff && !d.dropoffLocation)
        v.dropoffLocation = "Set a drop-off location.";
    }

    /* ---------------- step 2 ---------------- */
    if (s === 2) {
      // REMOVED: Meeting link validation since you don't want this feature
      // if (d.mode !== "physical" && !d.meetingLink?.trim())
      //   v.meetingLink = "Provide an online meeting link.";
    }

    /* ---------------- step 3 ---------------- */
    if (s === 3) {
      if (d.perks.length === 0) v.perks = "Add at least one perk.";
      else if (calculateTotalPerkValue(d.perks) < MIN_PERK_VALUE)
        v.perks = `Total perk value must be ≥ $${MIN_PERK_VALUE}.`;
    }

    setErrors(v);
    return Object.keys(v).length === 0;
  };

  /* ---------------------------------------------------------------------- */
  /*  Derived metrics                                                       */
  /* ---------------------------------------------------------------------- */
  const totalPerkValue = useMemo(
    () => calculateTotalPerkValue(formData.perks),
    [formData.perks]
  );

  const platformFee = useMemo(
    () => calculatePlatformFee(formData.perks),
    [formData.perks]
  );

  const successRate = useMemo(
    () =>
      estimatedSuccessRate(
        formData.perks,
        formData.category,
        formData.urgency,
        categories
      ),
    [formData.perks, formData.category, formData.urgency, categories]
  );

  /* ---------------------------------------------------------------------- */
  /*  Public API                                                            */
  /* ---------------------------------------------------------------------- */
  return {
    currentStep,
    setCurrentStep,
    formData,
    errors,
    handleInputChange,
    addPerk,
    updatePerk,
    removePerk,
    validateStep,
    categories,
    urgencyOptions,
    totalPerkValue,
    platformFee,
    successRate,
    isCombo: isCombinationPerk(formData.perks),
    comboBonus: getCombinationBonus(formData.perks),
  } as const;
}