
"use client";
import React from "react";
import { InputField } from "@/components/form";
import type { TaskFormData } from "@/types/task";
interface S2Props {
  data: TaskFormData;
  errors: Record<string, string>;
  onChange: (field: keyof TaskFormData, value: unknown) => void;
  openPhotoUpload: () => void;
}
export const Step2_Details: React.FC<S2Props> = ({ data, onChange, openPhotoUpload }) => (
  <div className="space-y-5 sm:space-y-6">
    <div><h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Additional Requirements</h2><p className="text-sm text-gray-600">Help helpers understand exactly what you need.</p></div>
    <InputField label="Estimated Duration (Optional)" id="estimated-duration">
      <select value={data.estimatedDuration} onChange={(e) => onChange("estimatedDuration", e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base appearance-none bg-white pr-8 bg-no-repeat" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundSize: "1.5em 1.5em" }}>
        <option value="">Not specified</option>{["15min","30min","45min","1hour","1.5hours","2hours","3hours","4hours+"].map((t) => (<option key={t} value={t}>{t.replace("hours"," hours").replace("hour"," hour").replace("min"," minutes")}</option>))}
      </select>
    </InputField>
    <InputField label="Specific Requirements & Instructions (Optional)" id="specific-requirements">
      <textarea value={data.specificRequirements} onChange={(e) => onChange("specificRequirements", e.target.value)} rows={4} className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base" placeholder="Any special instructions, tools needed, or things the helper should know..." />
    </InputField>
    <InputField label="Task Photos (Optional, Max 5)" id="photo-upload-button">
      <button onClick={openPhotoUpload} type="button" aria-label={data.photos.length ? `Change task photos, ${data.photos.length} selected` : "Add task photos"} className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <div className="text-center"><div className="text-gray-400 mb-1 sm:mb-2 text-2xl sm:text-3xl" role="img" aria-hidden="true">📸</div><p className="font-medium text-gray-900 text-sm sm:text-base">{data.photos.length ? `View/Edit Photos (${data.photos.length})` : "Add Photos"}</p><p className="text-xs sm:text-sm text-gray-600">{data.photos.length ? "Up to 5 photos. Tap to change." : "Visually show what needs to be done."}</p></div>
      </button>
    </InputField>
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4" role="complementary" aria-labelledby="pro-tips-heading"><div className="flex items-start gap-2 sm:gap-3"><span className="text-yellow-600 mt-0.5 flex-shrink-0" aria-hidden="true">⚠️</span><div><h4 id="pro-tips-heading" className="font-medium text-yellow-800 text-sm sm:text-base">Pro Tips for Better Results</h4><ul className="text-xs sm:text-sm text-yellow-700 mt-1 sm:mt-2 space-y-1 list-disc list-inside"><li>Be specific about timing and deadlines.</li><li>Include backup contact methods if needed.</li><li>Mention any access requirements (keys, codes).</li><li>Photos can significantly increase task acceptance.</li></ul></div></div></div>
  </div>
);
