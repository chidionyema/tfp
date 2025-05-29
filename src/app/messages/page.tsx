// File: src/app/messages/page.tsx
"use client";

import React from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MessagesPage = () => {
  const router = useRouter();

  const mockConversations = [
    {
      id: '1',
      name: 'Sarah K.',
      lastMessage: 'Documents collected! On my way to embassy now.',
      time: '2 min ago',
      unread: true,
      task: 'Emergency Document Delivery'
    },
    {
      id: '2',
      name: 'Mike R.',
      lastMessage: 'Perfect! I can pick up the charger in 20 minutes.',
      time: '15 min ago',
      unread: false,
      task: 'Laptop Charger Emergency'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-indigo-600">Messages</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="divide-y">
            {mockConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => router.push(`/messages/${conv.id}`)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <MessageCircle size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{conv.name}</h3>
                        {conv.unread && (
                          <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{conv.task}</p>
                      <p className="text-sm text-gray-500">{conv.lastMessage}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{conv.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
