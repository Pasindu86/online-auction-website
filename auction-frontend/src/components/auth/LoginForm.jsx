'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, AlertCircle, Mail } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-800 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your auction account
          </p>
        </div>

        {registered && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Registration successful! Please check your email to verify your account before logging in.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <FormInput
            label="Email"
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

          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            </div>
          )}

          {emailNotVerified && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={16} className="text-yellow-600" />
                <p className="text-sm text-yellow-800 font-medium">
                  Email Not Verified
                </p>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Please check your email and click the verification link to activate your account.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={handleResendVerification}
                loading={resendLoading}
                className="w-full"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              {resendSuccess && (
                <p className="text-sm text-green-600 mt-2">
                  Verification email sent successfully!
                </p>
              )}
            </div>
          )}

          <Button type="submit" loading={isLoading} className="w-full">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-red-800 hover:underline font-medium"
              >
                Create account
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
