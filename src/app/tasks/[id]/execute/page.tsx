// File: src/app/tasks/[id]/execute/page.tsx
// Component: TaskExecutionPage
// Type: Client Component (real-time tracking, live updates)
// Dependencies: lucide-react

"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Camera, MessageCircle, Phone, CheckCircle, Navigation, AlertTriangle, Star } from 'lucide-react';

interface TaskExecution {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'accepted' | 'traveling' | 'at_pickup' | 'in_transit' | 'at_dropoff' | 'completed' | 'confirmed';
  
  // Location details
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
    instructions: string;
  };
  dropoffLocation?: {
    address: string;
    lat: number;
    lng: number;
    instructions: string;
  };
  
  // Helper details
  helper: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    currentLocation?: {
      lat: number;
      lng: number;
      timestamp: string;
    };
  };
  
  // Requester details
  requester: {
    id: string;
    name: string;
    phone: string;
    rating: number;
  };
  
  // Timing
  acceptedAt: string;
  estimatedArrival: string;
  estimatedCompletion: string;
  
  // Progress tracking
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    timestamp?: string;
    photo?: string;
    notes?: string;
  }>;
  
  // Perk details
  perk: {
    name: string;
    details: string;
    value: string;
  };
}

const TaskExecutionPage = () => {
  const [userRole] = useState<'helper' | 'requester'>('helper'); // Demo: helper executing task
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [notes, setNotes] = useState('');

  // Mock task data
  const [task, setTask] = useState<TaskExecution>({
    id: '1',
    title: 'Emergency Document Delivery',
    description: 'Collect passport and deliver to embassy',
    category: 'Delivery',
    urgency: 'emergency',
    status: 'traveling',
    
    pickupLocation: {
      address: '123 Camden High Street, Camden, London NW1 7JE',
      lat: 51.5390,
      lng: -0.1426,
      instructions: 'Ring doorbell twice. 2nd floor flat, door marked "2A"'
    },
    dropoffLocation: {
      address: '1 Grosvenor Square, Mayfair, London W1K 4AB',
      lat: 51.5129,
      lng: -0.1519,
      instructions: 'Security desk at main entrance. Show your ID and mention passport delivery for Sarah Johnson'
    },
    
    helper: {
      id: 'help1',
      name: 'Mike Rodriguez',
      phone: '+44 7700 900123',
      rating: 4.9,
      currentLocation: {
        lat: 51.5350,
        lng: -0.1400,
        timestamp: '2 minutes ago'
      }
    },
    
    requester: {
      id: 'req1',
      name: 'Sarah Johnson',
      phone: '+44 7700 900456',
      rating: 4.8
    },
    
    acceptedAt: '25 minutes ago',
    estimatedArrival: '8 minutes',
    estimatedCompletion: '2:45 PM',
    
    milestones: [
      {
        id: 'accepted',
        name: 'Task Accepted',
        description: 'Helper accepted the task',
        status: 'completed',
        timestamp: '25 minutes ago'
      },
      {
        id: 'traveling_pickup',
        name: 'Traveling to Pickup',
        description: 'En route to collect passport',
        status: 'in_progress'
      },
      {
        id: 'at_pickup',
        name: 'At Pickup Location',
        description: 'Arrived at pickup address',
        status: 'pending'
      },
      {
        id: 'item_collected',
        name: 'Item Collected',
        description: 'Passport collected successfully',
        status: 'pending'
      },
      {
        id: 'traveling_dropoff',
        name: 'Traveling to Dropoff',
        description: 'En route to embassy',
        status: 'pending'
      },
      {
        id: 'delivered',
        name: 'Delivered',
        description: 'Passport delivered to embassy',
        status: 'pending'
      },
      {
        id: 'completed',
        name: 'Task Complete',
        description: 'Task marked as complete',
        status: 'pending'
      }
    ],
    
    perk: {
      name: 'Cash Payment',
      details: '£35 GBP cash',
      value: '£35'
    }
  });

  // Simulate location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate helper moving closer to destination
      setTask(prev => ({
        ...prev,
        helper: {
          ...prev.helper,
          currentLocation: {
            lat: prev.helper.currentLocation!.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.helper.currentLocation!.lng + (Math.random() - 0.5) * 0.001,
            timestamp: 'Just now'
          }
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'traveling': return 'bg-blue-100 text-blue-800';
      case 'at_pickup': return 'bg-orange-100 text-orange-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'at_dropoff': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-green-600" />;
      case 'in_progress': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const handleMarkMilestone = (milestoneId: string) => {
    setTask(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => 
        m.id === milestoneId 
          ? { ...m, status: 'completed', timestamp: 'Just now' }
          : m
      )
    }));
  };

  const handleUploadPhoto = (milestoneId: string) => {
    console.log('Upload photo for milestone:', milestoneId);
    setIsPhotoUploadOpen(true);
  };

  const handleCompleteTask = () => {
    setTask(prev => ({ ...prev, status: 'completed' }));
  };

  const getCurrentMilestone = () => {
    return task.milestones.find(m => m.status === 'in_progress') || 
           task.milestones.find(m => m.status === 'pending');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Task Execution</h1>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MessageCircle size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <Phone size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{task.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock size={20} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-sm font-medium text-gray-900">ETA</div>
                  <div className="text-xs text-gray-600">{task.estimatedArrival}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Navigation size={20} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-sm font-medium text-gray-900">Distance</div>
                  <div className="text-xs text-gray-600">1.2 km away</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <CheckCircle size={20} className="mx-auto text-gray-400 mb-1" />
                  <div className="text-sm font-medium text-gray-900">Complete by</div>
                  <div className="text-xs text-gray-600">{task.estimatedCompletion}</div>
                </div>
              </div>

              {/* Current Milestone */}
              {getCurrentMilestone() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {getMilestoneIcon(getCurrentMilestone()!.status)}
                    <h3 className="font-medium text-blue-900">
                      Current: {getCurrentMilestone()!.name}
                    </h3>
                  </div>
                  <p className="text-sm text-blue-800">{getCurrentMilestone()!.description}</p>
                </div>
              )}
            </div>

            {/* Live Map (Placeholder) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Live Tracking</h3>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Live map showing helper location</p>
                  <p className="text-sm text-gray-500">Last updated: {task.helper.currentLocation?.timestamp}</p>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Progress Timeline</h3>
              <div className="space-y-4">
                {task.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {getMilestoneIcon(milestone.status)}
                      {index < task.milestones.length - 1 && (
                        <div className={`w-0.5 h-12 mt-2 ${
                          milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${
                          milestone.status === 'completed' ? 'text-green-900' : 
                          milestone.status === 'in_progress' ? 'text-blue-900' : 'text-gray-600'
                        }`}>
                          {milestone.name}
                        </h4>
                        {milestone.timestamp && (
                          <span className="text-xs text-gray-500">{milestone.timestamp}</span>
                        )}
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        milestone.status === 'completed' ? 'text-green-700' : 
                        milestone.status === 'in_progress' ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {milestone.description}
                      </p>

                      {milestone.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{milestone.notes}&rdquo;</p>
                      )}

                      {/* Action buttons for helpers */}
                      {userRole === 'helper' && milestone.status === 'in_progress' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleMarkMilestone(milestone.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => handleUploadPhoto(milestone.id)}
                            className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
                          >
                            <Camera size={14} />
                            Add Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Task Button */}
            {userRole === 'helper' && task.status !== 'completed' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Ready to Complete?</h3>
                    <p className="text-sm text-gray-600">Mark the entire task as finished</p>
                  </div>
                  <button
                    onClick={handleCompleteTask}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Complete Task
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {userRole === 'helper' ? 'Requester' : 'Helper'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {userRole === 'helper' ? task.requester.name : task.helper.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      {userRole === 'helper' ? task.requester.rating : task.helper.rating}
                    </span>
                  </div>
                  <button className="mt-2 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    <Phone size={14} />
                    {userRole === 'helper' ? task.requester.phone : task.helper.phone}
                  </button>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Locations</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-green-600" />
                    Pickup
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{task.pickupLocation.address}</p>
                  {task.pickupLocation.instructions && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <strong>Instructions:</strong> {task.pickupLocation.instructions}
                    </div>
                  )}
                </div>
                
                {task.dropoffLocation && (
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <MapPin size={16} className="text-red-600" />
                      Dropoff
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{task.dropoffLocation.address}</p>
                    {task.dropoffLocation.instructions && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        <strong>Instructions:</strong> {task.dropoffLocation.instructions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Perk Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Your Perk</h3>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900">{task.perk.name}</h4>
                <p className="text-sm text-indigo-700 mt-1">{task.perk.details}</p>
                <div className="text-lg font-bold text-indigo-900 mt-2">{task.perk.value}</div>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Safety Reminder</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Keep communication on platform</li>
                    <li>• Take photos for proof</li>
                    <li>• Report any issues immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Widget (Simplified version without external component) */}
      {isChatOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            <div className="p-4 border-b bg-gray-50 rounded-t-lg flex items-center justify-between">
              <h4 className="font-medium text-gray-900">
                Chat with {userRole === 'helper' ? task.requester.name : task.helper.name}
              </h4>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="h-64 p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="text-center text-xs text-gray-500">
                  Task chat started
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-xs">
                    <p className="text-sm">I&apos;m on my way to the pickup location now!</p>
                    <p className="text-xs text-gray-500 mt-1">5 min ago</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg max-w-xs">
                    <p className="text-sm">Great! Thank you for the update.</p>
                    <p className="text-xs text-indigo-200 mt-1">3 min ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Photo Upload Modal (Simplified version) */}
      {isPhotoUploadOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setIsPhotoUploadOpen(false)}
          />
          <div className="fixed inset-x-4 top-20 max-w-md mx-auto bg-white rounded-lg shadow-xl z-50">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Upload Photo Proof</h3>
              <button
                onClick={() => setIsPhotoUploadOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 mb-4">Upload proof photo for milestone</p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Choose Photo
                </button>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add any notes about this step..."
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsPhotoUploadOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Photo uploaded with notes:', notes);
                    setIsPhotoUploadOpen(false);
                    setNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskExecutionPage;