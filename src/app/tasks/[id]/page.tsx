// File: src/app/tasks/[id]/page.tsx
// Task Detail & Negotiation Page

"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, Star, User } from 'lucide-react';


const TaskDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const mockTask = {
    id: taskId,
    title: 'Emergency Document Delivery',
    description: 'Need passport collected from Camden and delivered to US Embassy before 3 PM today.',
    location: 'Camden → Mayfair',
    urgency: 'emergency',
    perk: '£35 PayPal',
    requesterName: 'Sarah K.',
    requesterRating: 4.8,
    successRate: 96
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-indigo-600">TaskForPerks</h1>
            <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              🚀 DEMO MODE
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{mockTask.title}</h1>
              <p className="text-gray-600 mb-4">{mockTask.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {mockTask.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  ~90 minutes
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{mockTask.perk}</div>
              <div className="text-sm text-green-600">{mockTask.successRate}% success</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium">{mockTask.requesterName}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star size={14} className="text-yellow-500" />
                    {mockTask.requesterRating} rating
                  </div>
                </div>
              </div>
              <button 
                onClick={() => alert('Demo: Task claimed!')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Claim This Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
