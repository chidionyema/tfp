// File: src/components/task-wizard/Step1_BasicInfo.tsx
// Purpose: fix uncontrolled-to-controlled warnings and improve location UX

"use client";

import React from "react";
import { InputField, OptionGrid } from "@/components/form";
import { LocationButton } from "./LocationButton";
import { MapPin, Laptop2, Globe2 } from "lucide-react";
import type { TaskFormData, TaskMode } from "@/types/task";

interface S1Props {
  data: TaskFormData;
  categories: ReturnType<typeof import("@/constants/task-constants").getCategories>;
  urgencyOptions: ReturnType<typeof import("@/constants/task-constants").getUrgencyOptions>;
  errors: Record<string, string>;
  onChange: (field: keyof TaskFormData, value: unknown) => void;
  openLocation: () => void;
  openDropoff: () => void;
}

export const Step1_BasicInfo: React.FC<S1Props> = ({
  data,
  categories,
  urgencyOptions,
  errors,
  onChange,
  openLocation,
  openDropoff,
}) => {
  /* -------------------------------------------------------------------- */
  /*  Mode helpers                                                         */
  /* -------------------------------------------------------------------- */
  const modes: { id: TaskMode; label: string; icon: React.ReactNode }[] = [
    { id: "physical", label: "On-site", icon: <MapPin size={16} /> },
    { id: "online", label: "Online", icon: <Laptop2 size={16} /> },
    { id: "hybrid", label: "Both", icon: <Globe2 size={16} /> },
  ];

  const isPhysicalMode = data.mode === "physical";
  const isHybridMode = data.mode === "hybrid";
  // Removed unused isOnlineMode variable

  /* -------------------------------------------------------------------- */
  /*  Helpers to avoid uncontrolled-to-controlled switches                 */
  /* -------------------------------------------------------------------- */
  const title = data.title ?? "";
  const description = data.description ?? "";
  const requiresPickup = Boolean(data.requiresPickup);
  const needsDropoff = Boolean(data.needsDropoff);

  // Removed unused needsAnyLocation variable
  const showLocationOptions = isPhysicalMode || isHybridMode;

  /* -------------------------------------------------------------------- */
  /*  Render                                                               */
  /* -------------------------------------------------------------------- */
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
          Tell us about your task
        </h2>
        <p className="text-sm text-gray-600">
          Be specific and clear to get the best helpers.
        </p>
      </div>

      {/* Title */}
      <InputField label="Task Title" required id="task-title" error={errors.title}>
        <>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange("title", e.target.value)}
            maxLength={100}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${errors.title ? "border-red-500" : "border-gray-300"}`}
            placeholder="e.g., Print and drop off documents"
            aria-describedby="title-counter"
          />
          <small
            id="title-counter"
            className="block text-xs text-gray-500 mt-1 text-right"
          >
            {title.length}/100
          </small>
        </>
      </InputField>

      {/* Description */}
      <InputField
        label="Detailed Description"
        required
        id="task-description"
        error={errors.description}
      >
        <>
          <textarea
            value={description}
            onChange={(e) => onChange("description", e.target.value)}
            maxLength={1000}
            rows={4}
            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base ${errors.description ? "border-red-500" : "border-gray-300"}`}
            placeholder="Describe exactly what needs to be done, any specific instructions..."
            aria-describedby="desc-counter"
          />
          <small
            id="desc-counter"
            className="block text-xs text-gray-500 mt-1 text-right"
          >
            {description.length}/1000
          </small>
        </>
      </InputField>

      {/* Category */}
      <InputField
        label="Category"
        required
        id="task-category-selection"
        error={errors.category}
      >
        <OptionGrid
          options={categories}
          selected={data.category}
          onSelect={(id: string) => onChange("category", id)}
          ariaLabel="Select task category"
          name="task-category"
          renderOption={(c) => (
            <div className="text-sm">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-900">{c.name}</h3>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {c.successRate} success
                </span>
              </div>
              <p className="text-xs text-gray-600">{c.desc}</p>
            </div>
          )}
        />
      </InputField>

      {/* Urgency */}
      <InputField
        label="Urgency Level"
        id="task-urgency-selection"
        error={errors.urgency}
      >
        <OptionGrid
          options={urgencyOptions}
          selected={data.urgency}
          onSelect={(id: string) =>
            onChange("urgency", id as TaskFormData["urgency"])
          }
          ariaLabel="Select urgency level"
          name="task-urgency"
          renderOption={(o) => (
            <div className="text-sm">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-900">{o.name}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${o.color} whitespace-nowrap`}
                >
                  {o.multiplier}
                </span>
              </div>
              <p className="text-xs text-gray-600">{o.desc}</p>
            </div>
          )}
        />
      </InputField>

      {/* Task Mode */}
      <InputField label="Task Mode" id="task-mode-picker" error={errors.mode}>
        <>
          <div
            className="flex gap-2 sm:gap-3"
            role="radiogroup"
            aria-label="Select task mode"
          >
            {modes.map((m) => {
              const selected = data.mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange("mode", m.id)}
                  aria-pressed={selected}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base transition-colors ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {m.icon} {m.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            &ldquo;Both&rdquo; lets helpers decide whether to work remotely, on‑site, or a mix.
          </p>
        </>
      </InputField>

      {/* Location Options Section - shows for physical and hybrid modes */}
      {showLocationOptions && (
        <>
          {/* For physical mode, show location type selector */}
          {isPhysicalMode && (
            <InputField 
              label="Location Requirements" 
              required 
              id="location-requirements"
              error={errors.location || errors.dropoffLocation}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresPickup"
                    checked={requiresPickup}
                    onChange={(e) => {
                      onChange("requiresPickup", e.target.checked);
                      // Ensure at least one location is selected for physical mode
                      if (!e.target.checked && !needsDropoff && isPhysicalMode) {
                        onChange("needsDropoff", true);
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="requiresPickup" className="text-sm font-medium text-gray-700">
                    Task has a pickup/work location
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="needsDropoff"
                    checked={needsDropoff}
                    onChange={(e) => {
                      onChange("needsDropoff", e.target.checked);
                      // Ensure at least one location is selected for physical mode
                      if (!e.target.checked && !requiresPickup && isPhysicalMode) {
                        onChange("requiresPickup", true);
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="needsDropoff" className="text-sm font-medium text-gray-700">
                    Task has a drop-off location
                  </label>
                </div>

                {!requiresPickup && !needsDropoff && isPhysicalMode && (
                  <p className="text-xs text-red-600">
                    Physical tasks require at least one location
                  </p>
                )}
              </div>
            </InputField>
          )}

          {/* For hybrid mode, show simplified toggles */}
          {isHybridMode && (
            <>
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  id="requiresPickup"
                  checked={requiresPickup}
                  onChange={(e) => onChange("requiresPickup", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2"
                />
                <label htmlFor="requiresPickup" className="text-sm font-medium text-gray-700">
                  Helper needs to visit a pickup/work location
                </label>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  id="needsDropoff"
                  checked={needsDropoff}
                  onChange={(e) => onChange("needsDropoff", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2"
                />
                <label htmlFor="needsDropoff" className="text-sm font-medium text-gray-700">
                  Task requires a drop-off at a different location
                </label>
              </div>
            </>
          )}

          {/* Show pickup location if needed */}
          {requiresPickup && (
            <InputField
              label={needsDropoff ? "Pickup/Work Location" : "Task Location"}
              required
              id="task-location-button"
              error={errors.location}
            >
              <LocationButton
                location={data.location}
                onClick={openLocation}
                label={needsDropoff ? "Pickup/Work Location" : "Task Location"}
              />
            </InputField>
          )}

          {/* Show dropoff location if needed */}
          {needsDropoff && (
            <InputField
              label="Drop-off Location"
              required
              id="task-dropoff-button"
              error={errors.dropoffLocation}
            >
              <LocationButton
                location={data.dropoffLocation}
                onClick={openDropoff}
                label="Drop-off Location"
                icon="green"
              />
            </InputField>
          )}

          {/* Help text for drop-off only scenario */}
          {!requiresPickup && needsDropoff && (
            <p className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
              <strong>Example:</strong> You&apos;ll email documents to the helper, who will print and deliver them to the drop-off location.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Step1_BasicInfo;