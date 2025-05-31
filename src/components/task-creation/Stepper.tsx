"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import dynamic from "next/dynamic";
import { ChevronRight, Loader2, Shield } from "lucide-react";

import { Modal } from "./Modal";
import type { Location } from "@/components/ui/LocationPicker";
import type { UploadedPhoto } from "@/components/ui/PhotoUpload";
import { STEP_TITLES } from "@/constants/task-constants";
import { useTaskForm } from "@/hooks/useTaskForm";
import { Step1_BasicInfo } from "./Step1_BasicInfo";
import { Step2_Details } from "./Step2_Details";
import { Step3_Perks } from "./Step3_Perks";
import { Step4_Review } from "./Step4_Review";

// ——— Type‐only imports ———
import type {
  PerkItem,
  TaskMode,
  TaskFormData,
} from "@/types/task";

// ——— Value (runtime) imports ———
import {
  calculateTotalTaskCost,
  getDbsProcessingTime,
} from "@/types/task";

// ─────────────────────────────────────────────────────────────────────────────

// --- Enums & constants -----------------------------------------------
enum Step {
  Basic = 1,
  Details,
  Perks,
  Review,
}
const TOTAL_STEPS = 4;

// --- Dynamic imports --------------------------------------------------
const LocationPicker = dynamic(
  () => import("@/components/ui/LocationPicker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
      </div>
    ),
  }
);

const PhotoUpload = dynamic(
  () => import("@/components/ui/PhotoUpload").then((m) => m.PhotoUpload),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
      </div>
    ),
  }
);

// --- Modal reducer ----------------------------------------------------
type ModalKey = "location" | "dropoff" | "photos" | null;
interface ModalState {
  open: ModalKey;
}

const modalReducer = (
  state: ModalState,
  action: { type: "OPEN"; modal: ModalKey } | { type: "CLOSE" }
): ModalState => {
  switch (action.type) {
    case "OPEN":
      return { open: action.modal };
    case "CLOSE":
      return { open: null };
    default:
      return state;
  }
};

// --- Validation --------------------------------------------------------
interface ValidationErrors {
  [key: string]: string;
}

const validateFormData = (data: TaskFormData, step: Step): ValidationErrors => {
  const e: ValidationErrors = {};

  if (step >= Step.Basic) {
    if (!data.title?.trim()) e.title = "Please enter a title";
    if (!data.category) e.category = "Please select a category";
    if (!data.urgency) e.urgency = "Please select urgency";
    if (!data.mode) e.mode = "Please select task mode";
    const needsPhysical = data.mode === "physical" || data.mode === "hybrid";
    if (needsPhysical && !data.location) e.location = "Please set a location";
  }

  if (step >= Step.Details) {
    if (!data.description?.trim()) e.description = "Please provide a description";
    if (!data.estimatedDuration) e.estimatedDuration = "Please estimate the time required";

    // DBS validation - ensure a selection is made
    if (!data.dbsRequirement) {
      e.dbsRequirement = "Please select a DBS requirement level";
    }

    // Validate specific requirements length if provided
    if (data.specificRequirements && data.specificRequirements.length > 500) {
      e.specificRequirements = "Requirements must be 500 characters or less";
    }
  }

  if (step >= Step.Perks) {
    if (!data.perks || data.perks.length === 0) e.perks = "Add at least one perk";

    // Additional validation: if DBS check is required, ensure appropriate perks
    if (data.dbsRequirement && data.dbsRequirement !== "none") {
      const totalPerkValue = data.perks.reduce((sum, perk) => {
        return sum + ((perk.customValue ?? perk.estimatedValue) * (perk.quantity || 1));
      }, 0);

      // Suggest higher compensation for DBS-required tasks
      const minValueForDbs = data.dbsRequirement === "enhanced" ? 50 : 30;
      if (totalPerkValue < minValueForDbs) {
        e.perks = `Tasks requiring ${data.dbsRequirement} DBS checks typically offer £${minValueForDbs}+ to attract qualified helpers`;
      }
    }
  }

  if (step === Step.Review && !data.escrowAgreed) {
    e.escrowAgreed = "You must agree to escrow terms";
  }

  return e;
};

// --- Helper functions -----------------------------------------------------------
const needsPhysical = (mode: TaskMode) => mode === "physical" || mode === "hybrid";

// --- Component --------------------------------------------------------
export const Stepper: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    formData,
    categories,
    urgencyOptions,
    handleInputChange,
    addPerk,
    updatePerk,
    removePerk,
    totalPerkValue,
    platformFee,
    successRate,
    isCombo,
    comboBonus,
  } = useTaskForm();

  const [modalState, modalDispatch] = useReducer(modalReducer, { open: null });
  const validationErrors = useMemo(() => validateFormData(formData, currentStep as Step), [
    formData,
    currentStep,
  ]);

  // Calculate total costs including DBS
  const taskCosts = useMemo(() => calculateTotalTaskCost(formData), [formData]);

  // ---------------- Handlers ------------------
  const openModal = useCallback((m: ModalKey) => modalDispatch({ type: "OPEN", modal: m }), []);
  const closeModal = useCallback(() => modalDispatch({ type: "CLOSE" }), []);

  const addPerkByType = useCallback(
    (type: "payment" | "good" | "service") => {
      addPerk({ type } as Omit<PerkItem, "id"> & { type: PerkItem["type"] });
    },
    [addPerk]
  );

  const navigateNext = useCallback(() => {
    const errs = validateFormData(formData, currentStep as Step);
    if (Object.keys(errs).length === 0) setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }, [currentStep, formData, setCurrentStep]);

  const navigatePrev = useCallback(() => setCurrentStep((s) => Math.max(Step.Basic, s - 1)), [
    setCurrentStep,
  ]);

  const handlePublish = useCallback(() => {
    const errs = validateFormData(formData, Step.Review);
    if (Object.keys(errs).length === 0) {
      console.log("Publishing task with costs:", taskCosts);
      alert(`Publishing task… 🎉 

Task Details:
- Perk Value: £${taskCosts.perkValue.toFixed(2)}
- DBS Fee: £${taskCosts.dbsFee.toFixed(2)} (paid by helper)
- Platform Fee: £${taskCosts.platformFee.toFixed(2)}
- Total Helper Cost: £${taskCosts.total.toFixed(2)}

(This is a demo - task would be published to the platform)`);
    }
  }, [formData, taskCosts]);

  // ---------------- Location handlers --------
  const openLocation = useCallback(() => {
    if (needsPhysical(formData.mode)) openModal("location");
  }, [formData.mode, openModal]);

  const openDropoff = useCallback(() => {
    if (needsPhysical(formData.mode)) openModal("dropoff");
  }, [formData.mode, openModal]);

  const openPhotoUpload = useCallback(() => {
    openModal("photos");
  }, [openModal]);

  // ---------------- Steps array -------------
  const steps = useMemo(
    () => [
      <Step1_BasicInfo
        key="step1"
        data={formData}
        categories={categories}
        urgencyOptions={urgencyOptions}
        errors={validationErrors}
        onChange={handleInputChange}
        openLocation={openLocation}
        openDropoff={openDropoff}
      />,
      <Step2_Details
        key="step2"
        data={formData}
        errors={validationErrors}
        onChange={handleInputChange}
        openPhotoUpload={openPhotoUpload}
      />,
      <Step3_Perks
        key="step3"
        data={formData}
        errors={validationErrors}
        addPerk={addPerkByType}
        updatePerk={updatePerk}
        removePerk={removePerk}
        totalValue={totalPerkValue}
        platformFee={platformFee}
        isCombo={isCombo}
        comboBonus={comboBonus}
        onChange={handleInputChange}
      />,
      <Step4_Review
        key="step4"
        data={formData}
        categories={categories}
        urgencyOptions={urgencyOptions}
        successRate={successRate}
        totalValue={totalPerkValue}
        isCombo={isCombo}
        platformFee={platformFee}
        onChange={handleInputChange}
      />,
    ],
    [
      formData,
      categories,
      urgencyOptions,
      validationErrors,
      handleInputChange,
      addPerkByType,
      updatePerk,
      removePerk,
      totalPerkValue,
      platformFee,
      isCombo,
      comboBonus,
      successRate,
      openLocation,
      openDropoff,
      openPhotoUpload,
    ]
  );

  // ---------------- Draft persistence --------
  useEffect(() => {
    if (Object.keys(formData).length) {
      localStorage.setItem("taskWizardDraft", JSON.stringify(formData));
    }
  }, [formData]);

  // ---------------- Render -------------------
  return (
    <div className="bg-white rounded-xl border p-4 sm:p-6">
      {/* Progress bar */}
      <nav aria-label="progress" className="mb-6">
        <ol className="flex items-center justify-between">
          {STEP_TITLES.map((t, i) => (
            <React.Fragment key={t}>
              <li className="flex flex-col items-center text-center">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs ${
                    i + 1 <= currentStep
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1 text-xs ${
                    i + 1 <= currentStep ? "text-indigo-600" : "text-gray-500"
                  }`}
                >
                  {t}
                </span>
              </li>
              {i < STEP_TITLES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    i + 1 < currentStep ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className="min-h-[400px]">{steps[currentStep - 1]}</div>

      {/* DBS Cost Summary (appears when DBS requirement is set) */}
      {formData.dbsRequirement && formData.dbsRequirement !== "none" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-blue-800 text-sm">
                DBS Check Required:{" "}
                {formData.dbsRequirement.charAt(0).toUpperCase() +
                  formData.dbsRequirement.slice(1)}
              </h4>
              <div className="grid grid-cols-2 gap-4 mt-2 text-xs text-blue-700">
                <div>
                  <span className="font-medium">Fee:</span> £{taskCosts.dbsFee} (helper pays)
                </div>
                <div>
                  <span className="font-medium">Processing:</span>{" "}
                  {getDbsProcessingTime(formData.dbsRequirement)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={navigatePrev}
          disabled={currentStep === Step.Basic}
          className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep < Step.Review ? (
          <button
            onClick={navigateNext}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={Object.keys(validationErrors).length > 0}
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={Object.keys(validationErrors).length > 0}
            className="px-8 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700"
          >
            Publish Task
          </button>
        )}
      </div>

      {/* Modals */}
      {needsPhysical(formData.mode) && (
        <>
          <Modal isOpen={modalState.open === "location"} onClose={closeModal} title="Task Location">
            <LocationPicker
              isOpen={modalState.open === "location"}
              onClose={closeModal}
              onLocationSelect={(loc: Location) => {
                handleInputChange("location", loc);
                closeModal();
              }}
            />
          </Modal>
          <Modal isOpen={modalState.open === "dropoff"} onClose={closeModal} title="Drop-off Location">
            <LocationPicker
              isOpen={modalState.open === "dropoff"}
              onClose={closeModal}
              onLocationSelect={(loc: Location) => {
                handleInputChange("dropoffLocation", loc);
                closeModal();
              }}
            />
          </Modal>
        </>
      )}
      <Modal isOpen={modalState.open === "photos"} onClose={closeModal} title="Upload Photos">
        <PhotoUpload
          isOpen={modalState.open === "photos"}
          onClose={closeModal}
          onPhotosSelected={(p: UploadedPhoto[]) => {
            handleInputChange("photos", p);
            closeModal();
          }}
          maxPhotos={5}
          required={false}
        />
      </Modal>
    </div>
  );
};

export default Stepper;
