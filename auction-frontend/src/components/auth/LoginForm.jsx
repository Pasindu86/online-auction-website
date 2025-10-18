'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertCircle, Mail, Shield, ArrowRight } from 'lucide-react';
import FormInput from './FormInput';
import Button from '../ui/Button';
import { loginUser, resendVerificationEmail } from '../../lib/api';

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter valid email';
    if (!formData.password) errs.password = 'Password required';
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    setEmailNotVerified(false);
    setResendSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    setSubmitError('');
    setEmailNotVerified(false);
    
    try {
      await loginUser({
        email: formData.email,
        password: formData.password
      });
      router.push('/');
    } catch (err) {
      if (err?.response?.data?.emailNotVerified) {
        setEmailNotVerified(true);
        setSubmitError(err.response.data.message);
      } else {
        setSubmitError(
          err?.response?.data?.message || 
          'Invalid email or password'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendVerificationEmail(formData.email);
      setResendSuccess(true);
    } catch (err) {
      setSubmitError('Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center">
            <button 
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 hover:bg-white/20 transition-all"
            >
              ← Back to Home
            </button>
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Shield className="text-white" size={48} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Welcome Back!
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Sign in to continue your auction journey
            </p>
          </div>
        </div>
        
        {/* Wave Design */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,74.7C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Form Section */}
      <div className="relative -mt-24 pb-24">
        <div className="max-w-md mx-auto px-4">
          {registered && (
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Check Your Email!</p>
                  <p className="text-sm text-blue-700">
                    Registration successful! Please verify your email before logging in.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 bg-clip-text text-transparent mb-2">
                Sign In
              </h2>
              <p className="text-slate-600">
                Enter your credentials to access your account
              </p>
            </div>

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your.email@example.com"
              required
            />
            
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            {submitError && !emailNotVerified && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{submitError}</p>
                </div>
              </div>
            )}

            {emailNotVerified && (
              <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={20} className="text-yellow-700" />
                  <p className="text-sm text-yellow-900 font-bold">
                    Email Not Verified
                  </p>
                </div>
                <p className="text-sm text-yellow-800 mb-4">
                  Please check your email and click the verification link to activate your account.
                </p>
                <Button
                  type="button"
                  onClick={handleResendVerification}
                  loading={resendLoading}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </Button>
                {resendSuccess && (
                  <p className="text-sm text-green-700 font-semibold mt-3 text-center">
                    ✓ Verification email sent successfully!
                  </p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              loading={isLoading} 
              className="w-full bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? 'Signing In...' : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight size={20} />
                </span>
              )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">New to our platform?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/register')}
              className="w-full py-4 border-2 border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all duration-300"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
