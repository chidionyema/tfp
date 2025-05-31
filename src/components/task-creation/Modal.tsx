// ==================================
// components/task-creation/Modal.tsx
// ==================================

"use client";
import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-${title.replace(/\s+/g, "-").toLowerCase()}`;
  useEffect(() => {
    if (!isOpen) return;
    const first = contentRef.current?.querySelector<HTMLElement>(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    first?.focus();

    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg flex flex-col"
      >
        <header className="flex items-center justify-between border-b p-4 sticky top-0 bg-white z-10">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </header>
        <section className="p-4 sm:p-6 flex-grow">{children}</section>
      </div>
    </div>
  );
};