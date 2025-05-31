"use client";
import React from "react";
import { Stepper } from "@/components/task-creation/Stepper";
export default function CreateTaskPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4">Create New Task</h1>
        <Stepper />
      </div>
    </div>
  );
}