"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Phone, 
  MapPin, 
  Image as ImageIcon 
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location' | 'system';
  imageUrl?: string;
  location?: { lat: number; lng: number; address: string };
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  currentUser: ChatUser;
  otherUser: ChatUser;
  taskTitle: string;
  onCall?: () => void;
  onLocationShare?: () => void;
  onImageUpload?: () => void;
  className?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onToggle,
  currentUser,
  otherUser,
  taskTitle,
  onCall,
  onLocationShare,
  onImageUpload,
  className = ""
}) => {
    const [messages, setMessages] = useState<Message[]>([
        {
          id: '1',
          senderId: 'system',
          senderName: 'System',
          content: `Chat started for task: ${taskTitle}`,
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          type: 'system'
        },
        {
          id: '2',
          senderId: otherUser.id,
          senderName: otherUser.name,
          // Fixed line 380
          content: "Hi! I&apos;ve accepted your task. I can be there in about 15 minutes.", 
          timestamp: new Date(Date.now() - 1000 * 60 * 8),
          type: 'text'
        },
        {
          id: '3',
          senderId: currentUser.id,
          senderName: currentUser.name,
          // Fixed line 383
          content: "Perfect! I&apos;ll be waiting at the front entrance. It&apos;s the building with the blue door.", 
          timestamp: new Date(Date.now() - 1000 * 60 * 7),
          type: 'text'
        },
        {
          id: '4',
          senderId: otherUser.id,
          senderName: otherUser.name,
          content: "Great! I&apos;m on my way now. I&apos;ll message you when I arrive.",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'text'
        }
      ]);

  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate response (in real app, this would come via WebSocket)
      const response: Message = {
        id: (Date.now() + 1).toString(),
        senderId: otherUser.id,
        senderName: otherUser.name,
        content: "Thanks for the update! I&apos;ll be there soon.",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`fixed bottom-4 right-4 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-50 ${className}`}
      >
        <MessageCircle size={24} />
        {/* Notification dot for new messages */}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                {otherUser.avatar ? (
                  <Image 
                    src={otherUser.avatar} 
                    alt={otherUser.name} 
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-indigo-600 font-medium text-sm">
                    {otherUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              {otherUser.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{otherUser.name}</h4>
              <p className="text-xs text-gray-500">
                {otherUser.isOnline ? 'Online' : `Last seen ${formatLastSeen(otherUser.lastSeen || new Date())}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onCall && (
              <button
                onClick={onCall}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Start voice call"
              >
                <Phone size={16} />
              </button>
            )}
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Task Context */}
        <div className="mt-2 p-2 bg-indigo-50 rounded text-xs">
          <span className="text-indigo-600 font-medium">Task:</span> {taskTitle}
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'system' ? (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {message.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderId === currentUser.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      
                      {message.type === 'image' && (
                        <div>
                          {message.imageUrl && (
                            <div className="relative w-full h-48">
                              <Image 
                                src={message.imageUrl} 
                                alt="Shared image" 
                                fill
                                className="rounded mb-1 object-cover"
                              />
                            </div>
                          )}
                          {message.content && <p className="text-sm">{message.content}</p>}
                        </div>
                      )}
                      
                      {message.type === 'location' && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <div>
                            <p className="text-sm font-medium">Location shared</p>
                            {message.location && (
                              <p className="text-xs opacity-80">{message.location.address}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              {/* Attachment Options */}
              <div className="flex gap-1">
                {onImageUpload && (
                  <button
                    onClick={onImageUpload}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Upload image"
                  >
                    <ImageIcon size={16} />
                  </button>
                )}
                
                {onLocationShare && (
                  <button
                    onClick={onLocationShare}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Share location"
                  >
                    <MapPin size={16} />
                  </button>
                )}
              </div>
              
              {/* Message Input */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-2">
              <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                I&apos;m running late
              </button>
              <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                I&apos;m here
              </button>
              <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                Task completed
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;