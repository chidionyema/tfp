"use client";
import React from "react";
import { InputField } from "@/components/form";
import { Shield, AlertCircle, Info } from "lucide-react";
import type { TaskFormData } from "@/types/task";

// DBS check types and fees
const DBS_OPTIONS = [
  {
    id: "none",
    name: "No DBS Check Required",
    description: "Task doesn't involve vulnerable groups or sensitive work",
    fee: 0,
    processingTime: "N/A"
  },
  {
    id: "basic",
    name: "Basic DBS Check",
    description: "Standard criminal record check for general employment",
    fee: 18,
    processingTime: "2-4 weeks"
  },
  {
    id: "standard",
    name: "Standard DBS Check", 
    description: "Includes spent and unspent convictions, cautions, reprimands",
    fee: 38,
    processingTime: "2-4 weeks"
  },
  {
    id: "enhanced",
    name: "Enhanced DBS Check",
    description: "Most comprehensive - includes police intelligence and barred lists",
    fee: 44,
    processingTime: "4-6 weeks"
  }
] as const;

interface S2Props {
  data: TaskFormData;
  errors: Record<string, string>;
  onChange: (field: keyof TaskFormData, value: unknown) => void;
  openPhotoUpload: () => void;
}

export const Step2_Details: React.FC<S2Props> = ({ 
  data, 
  errors, 
  onChange, 
  openPhotoUpload 
}) => {
  // Ensure we have default values to prevent uncontrolled inputs
  const dbsRequirement = data.dbsRequirement ?? "none";
  const estimatedDuration = data.estimatedDuration ?? "";
  const specificRequirements = data.specificRequirements ?? "";
  
  const selectedDbs = DBS_OPTIONS.find(option => option.id === dbsRequirement);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Additional Requirements
        </h2>
        <p className="text-sm text-gray-600">
          Help helpers understand exactly what you need.
        </p>
      </div>

      {/* DBS Check Requirement */}
      <InputField 
        label="Background Check Requirement" 
        id="dbs-requirement"
        error={errors.dbsRequirement}
      >
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3" role="complementary">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 text-sm">
                  DBS Background Checks
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Required for tasks involving children, vulnerable adults, or sensitive work. 
                  Fees are paid by the helper but you determine the requirement level.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {DBS_OPTIONS.map((option) => {
              const isSelected = dbsRequirement === option.id;
              return (
                <label
                  key={option.id}
                  className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="dbs-requirement"
                    value={option.id}
                    checked={isSelected}
                    onChange={(e) => onChange("dbsRequirement", e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-1 items-start gap-3">
                    <div className="flex items-center">
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 text-sm flex items-center gap-1">
                          {option.id !== "none" && (
                            <Shield size={14} className="text-indigo-600" />
                          )}
                          {option.name}
                        </h3>
                        {option.fee > 0 && (
                          <span className="text-sm font-medium text-indigo-600">
                            £{option.fee}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {option.description}
                      </p>
                      {option.fee > 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            Processing: {option.processingTime}
                          </span>
                          <span className="text-xs text-gray-500">
                            Fee paid by helper
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Warning for enhanced DBS */}
          {dbsRequirement === "enhanced" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">
                    Enhanced DBS Required
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    This level is typically required for roles involving regular contact with 
                    children or vulnerable adults. Helpers will need 4-6 weeks to obtain certification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fee summary */}
          {selectedDbs && selectedDbs.fee > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  DBS Check Fee (paid by helper):
                </span>
                <span className="font-medium text-gray-900">
                  £{selectedDbs.fee}
                </span>
              </div>
            </div>
          )}
        </div>
      </InputField>

      {/* Estimated Duration */}
      <InputField 
        label="Estimated Duration (Optional)" 
        id="estimated-duration"
        error={errors.estimatedDuration}
      >
        <select 
          value={estimatedDuration}
          onChange={(e) => onChange("estimatedDuration", e.target.value)}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base appearance-none bg-white pr-8 bg-no-repeat ${
            errors.estimatedDuration ? "border-red-500" : "border-gray-300"
          }`}
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1.5em 1.5em"
          }}
        >
          <option value="">Not specified</option>
          {["15min", "30min", "45min", "1hour", "1.5hours", "2hours", "3hours", "4hours+"].map((t) => (
            <option key={t} value={t}>
              {t.replace("hours", " hours").replace("hour", " hour").replace("min", " minutes")}
            </option>
          ))}
        </select>
      </InputField>

      {/* Specific Requirements */}
      <InputField 
        label="Specific Requirements & Instructions (Optional)" 
        id="specific-requirements"
        error={errors.specificRequirements}
      >
        <textarea 
          value={specificRequirements}
          onChange={(e) => onChange("specificRequirements", e.target.value)}
          rows={4}
          maxLength={500}
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${
            errors.specificRequirements ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Any special instructions, tools needed, or things the helper should know..."
          aria-describedby="requirements-counter"
        />
        <small 
          id="requirements-counter"
          className="block text-xs text-gray-500 mt-1 text-right"
        >
          {specificRequirements.length}/500
        </small>
      </InputField>

      {/* Photo Upload */}
      <InputField 
        label="Task Photos (Optional, Max 5)" 
        id="photo-upload-button"
        error={errors.photos}
      >
        <button 
          onClick={openPhotoUpload}
          type="button"
          aria-label={
            data.photos?.length 
              ? `Change task photos, ${data.photos.length} selected` 
              : "Add task photos"
          }
          className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <div className="text-center">
            <div 
              className="text-gray-400 mb-1 sm:mb-2 text-2xl sm:text-3xl" 
              role="img" 
              aria-hidden="true"
            >
              📸
            </div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">
              {data.photos?.length 
                ? `View/Edit Photos (${data.photos.length})` 
                : "Add Photos"
              }
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {data.photos?.length 
                ? "Up to 5 photos. Tap to change." 
                : "Visually show what needs to be done."
              }
            </p>
          </div>
        </button>
      </InputField>

      {/* Pro Tips */}
      <div 
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4" 
        role="complementary" 
        aria-labelledby="pro-tips-heading"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <span 
            className="text-yellow-600 mt-0.5 flex-shrink-0" 
            aria-hidden="true"
          >
            💡
          </span>
          <div>
            <h4 
              id="pro-tips-heading" 
              className="font-medium text-yellow-800 text-sm sm:text-base"
            >
              Pro Tips for Better Results
            </h4>
            <ul className="text-xs sm:text-sm text-yellow-700 mt-1 sm:mt-2 space-y-1 list-disc list-inside">
              <li>Be specific about timing and deadlines.</li>
              <li>Include backup contact methods if needed.</li>
              <li>Mention any access requirements (keys, codes).</li>
              <li>Photos can significantly increase task acceptance.</li>
              <li>DBS checks are only required for sensitive/vulnerable work.</li>
              <li>Higher DBS requirements may reduce available helpers but increase trust.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2_Details;