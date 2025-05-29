"use client";

import React, { useState, useId } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const emailInputId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Demo: Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      console.log('Demo: Password reset email would be sent to:', email);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center" role="alertdialog" aria-labelledby="success-title" aria-describedby="success-desc">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" aria-hidden="true" />
          </div>
          <h2 id="success-title" className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p id="success-desc" className="text-gray-600 mb-6">
            We&apos;ve sent password reset instructions to {email}.
          </p>
          <Link 
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white text-center">
          <Link href="/" className="text-2xl font-bold mb-2 block">TaskForPerks</Link>
          <p className="opacity-90">Reset your password</p>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/login" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Back to Login">
              <ArrowLeft size={20} className="text-gray-600" aria-hidden="true" />
            </Link>            
            <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor={emailInputId} className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
                <input
                  id={emailInputId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="your@email.com"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              aria-busy={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 text-sm">
              Remember your password? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;