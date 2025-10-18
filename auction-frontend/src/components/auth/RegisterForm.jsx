'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, AlertCircle, CheckCircle, Mail, ArrowRight, Sparkles } from 'lucide-react';
import FormInput from './FormInput';
import Button from '../ui/Button';
import { registerUser } from '../../lib/api';

const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.username) errs.username = 'Username required';
    if (!formData.email) errs.email = 'Email required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter valid email';
    if (!formData.password) errs.password = 'Password required';
    if (formData.password.length < 8) errs.password = 'Password too short';
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
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
    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        passwordHash: formData.password
      });
      
      setRegistrationSuccess(true);
      setUserEmail(formData.email);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Success Screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
            <div className="text-center">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
                <CheckCircle className="text-white" size={64} />
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                You're Almost There!
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                One more step to start your auction journey
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

        {/* Content Section */}
        <div className="relative -mt-24 pb-24">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-green-600" size={40} />
              </div>
              
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 bg-clip-text text-transparent mb-4">
                Check Your Email!
              </h2>
              
              <p className="text-slate-600 text-lg mb-4">
                We've sent a verification email to:
              </p>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl mb-6">
                <p className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  {userEmail}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-8">
                <p className="text-slate-700 leading-relaxed">
                  Please click the verification link in your email to activate your account. 
                  <span className="font-semibold text-slate-900"> The link will expire in 24 hours.</span>
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Go to Login
                    <ArrowRight size={20} />
                  </span>
                </Button>
                
                <button
                  onClick={() => setRegistrationSuccess(false)}
                  className="w-full py-3 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
                >
                  Didn't receive the email? Try registering again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
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
              <Sparkles className="text-white" size={48} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Join Our Community!
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Create your account and start winning amazing auctions
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
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h2>
              <p className="text-slate-600">
                Fill in your details to get started
              </p>
            </div>

            <FormInput
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Choose a username"
              required
            />
            
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
              placeholder="Minimum 8 characters"
              required
            />
            
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Re-enter your password"
              required
            />

            {submitError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{submitError}</p>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              loading={isLoading} 
              className="w-full bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isLoading ? 'Creating Account...' : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight size={20} />
                </span>
              )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Already have an account?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full py-4 border-2 border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all duration-300"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
