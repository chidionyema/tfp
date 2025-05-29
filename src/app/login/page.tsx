"use client";

import React, { useState, useId } from 'react';
// Removed unused CheckCircle
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  agreeToTerms: boolean;
}

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null); // Track which provider is loading
  const [phoneVerification, setPhoneVerification] = useState({ sent: false, code: '' });
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Unique IDs for form elements
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const termsId = useId();
  const phoneVerificationCodeId = useId();


  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';

    if (!formData.password.trim()) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';


    if (!isLogin) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      // Basic phone validation example (can be more complex)
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\+?[0-9\s-()]{7,}$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
      
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm password';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      // if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'; // Demo mode makes this optional
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (isLogin) {
        console.log('DEMO LOGIN SUCCESS:', { email: formData.email });
        alert(`Demo Login Successful!\nWelcome back, ${formData.email}!\n\nRedirecting to dashboard...`);
        localStorage.setItem('taskforperks-demo-user', JSON.stringify({
          email: formData.email, isLoggedIn: true, loginTime: new Date().toISOString()
        }));
        router.push('/dashboard');
      } else {
        console.log('DEMO REGISTRATION SUCCESS:', formData);
        alert(`Demo Registration Successful!\nWelcome ${formData.firstName} ${formData.lastName}!\n\nRedirecting to dashboard...`);
        localStorage.setItem('taskforperks-demo-user', JSON.stringify({
          email: formData.email, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone,
          isLoggedIn: true, registrationTime: new Date().toISOString()
        }));
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Handle actual API errors here, perhaps set a general error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setLoadingProvider(provider); // Set which provider is loading
    setTimeout(() => {
      console.log(`DEMO ${provider.toUpperCase()} LOGIN SUCCESS`);
      alert(`Demo ${provider} Login Successful!\nWelcome to TaskForPerks!\n\nRedirecting to dashboard...`);
      localStorage.setItem('taskforperks-demo-user', JSON.stringify({
        email: `demo-${provider}@taskforperks.com`, firstName: 'Demo', lastName: 'User', provider: provider,
        isLoggedIn: true, loginTime: new Date().toISOString()
      }));
      setIsLoading(false);
      setLoadingProvider(null); // Clear loading provider
      router.push('/dashboard');
    }, 1000);
  };

  const handlePhoneVerification = async () => {
    if (phoneVerification.code.length >= 1) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('DEMO PHONE VERIFICATION SUCCESS');
        alert('Demo Phone Verification Successful!\nWelcome to TaskForPerks!\n\nRedirecting to dashboard...');
        localStorage.setItem('taskforperks-demo-user', JSON.stringify({
          email: formData.email, firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone,
          phoneVerified: true, isLoggedIn: true, registrationTime: new Date().toISOString()
        }));
        router.push('/dashboard');
      } catch (error) {
        console.error('Verification error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (phoneVerification.sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-indigo-600" aria-hidden="true"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Phone Number</h2>
            <p className="text-gray-600 mt-2">DEMO MODE: Enter any code to continue</p>
            <p className="text-sm text-orange-600 mt-1">(Original: {formData.phone})</p>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor={phoneVerificationCodeId} className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code (Demo: any code works)
              </label>
              <input
                id={phoneVerificationCodeId}
                type="text"
                maxLength={6}
                value={phoneVerification.code}
                onChange={(e) => setPhoneVerification(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-lg tracking-wider"
                placeholder="123456"
                inputMode="numeric"
              />
            </div>
            <button
              type="button"
              onClick={handlePhoneVerification}
              disabled={phoneVerification.code.length === 0 || isLoading}
              aria-busy={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? 'Verifying...' : 'Verify Phone (Demo)'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setPhoneVerification({ sent: false, code: '' })}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Back to Registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-white text-center">
          <Link href="/" className="text-2xl font-bold mb-2 block">TaskForPerks</Link>
          <p className="opacity-90">{isLogin ? 'Welcome back!' : 'Join thousands trading tasks for perks'}</p>
          <div className="mt-3 px-3 py-1 bg-orange-500 bg-opacity-20 rounded-full text-xs">
            🚀 DEMO MODE - Any credentials work
          </div>
        </div>
        <div className="p-8">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8" role="tablist" aria-label="Authentication type">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
              <strong>Demo Mode:</strong> Enter any email/password to {isLogin ? 'login' : 'register'}. 
              All social logins also work instantly.
            </div>

            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={firstNameId} className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true"/>
                    <input id={firstNameId} type="text" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="John" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? `${firstNameId}-error` : undefined}
                    />
                  </div>
                  {errors.firstName && <p id={`${firstNameId}-error`} className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label htmlFor={lastNameId} className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input id={lastNameId} type="text" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Doe" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? `${lastNameId}-error` : undefined}
                  />
                  {errors.lastName && <p id={`${lastNameId}-error`} className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
            )}

            <div>
              <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 mb-2">
                Email Address {isLogin && <span className="text-orange-600 text-xs">(any email works)</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true"/>
                <input id={emailId} type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="demo@taskforperks.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${emailId}-error` : undefined}
                />
              </div>
              {errors.email && <p id={`${emailId}-error`} className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor={phoneId} className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-orange-600 text-xs">(any number works)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true"/>
                  <input id={phoneId} type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+44 7xxx xxx xxx" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
                  />
                </div>
                {errors.phone && <p id={`${phoneId}-error`} className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            )}

            <div>
              <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 mb-2">
                Password {isLogin && <span className="text-orange-600 text-xs">(any password works)</span>}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true"/>
                <input id={passwordId} type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="demo123" aria-invalid={!!errors.password} aria-describedby={errors.password ? `${passwordId}-error` : undefined}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p id={`${passwordId}-error`} className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div>
                <label htmlFor={confirmPasswordId} className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-orange-600 text-xs">(any password works)</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true"/>
                  <input id={confirmPasswordId} type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="demo123" aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? `${confirmPasswordId}-error` : undefined}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p id={`${confirmPasswordId}-error`} className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {!isLogin && (
              <div className="flex items-start gap-3">
                <input id={termsId} type="checkbox" checked={formData.agreeToTerms} onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  aria-describedby={errors.agreeToTerms ? `${termsId}-error` : undefined}
                />
                <div>
                  <label htmlFor={termsId} className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-indigo-600 hover:text-indigo-800">Terms of Service</Link>{' '}
                    and{' '}<Link href="/privacy" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</Link>
                    <span className="text-orange-600 ml-1">(Demo: optional)</span>
                  </label>
                  {errors.agreeToTerms && <p id={`${termsId}-error`} className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>}
                </div>
              </div>
            )}

            <button type="submit" disabled={isLoading} aria-busy={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
              ) : (
                <>
                  {isLogin ? 'Sign In (Demo)' : 'Create Account (Demo)'}
                  <ArrowRight size={16} aria-hidden="true"/>
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="text-center mt-4">
              <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Forgot your password? <span className="text-orange-600">(Demo: works instantly)</span>
              </Link>
            </div>
          )}

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => handleSocialLogin('google')} disabled={isLoading} aria-busy={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isLoading && loadingProvider === 'google' ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </>
              )}
            </button>
            <button type="button" onClick={() => handleSocialLogin('apple')} disabled={isLoading} aria-busy={isLoading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isLoading && loadingProvider === 'apple' ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  Apple
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">🚀 Quick Demo Login:</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setFormData(prev => ({ ...prev, email: 'demo@user.com', password: 'demo123' })); setIsLogin(true); }}
                className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">Demo User</button>
              <button type="button" onClick={() => { setFormData(prev => ({ ...prev, email: 'admin@taskforperks.com', password: 'admin123', firstName: 'Demo', lastName: 'Admin', phone: '+44 7123 456789' })); setIsLogin(false); }}
                className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">Demo Admin</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegisterPage;