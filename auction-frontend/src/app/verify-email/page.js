'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import { verifyEmail } from '../../lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleVerification = useCallback(async () => {
    try {
      await verifyEmail(token);
      setSuccess(true);
      setVerifying(false);
    } catch (err) {
      setError(
        err?.response?.data?.message || 
        'Verification failed. The link may be invalid or expired.'
      );
      setVerifying(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      handleVerification();
    } else {
      setVerifying(false);
      setError('Invalid verification link');
    }
  }, [token, handleVerification]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-500 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="text-center">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Shield className="text-white" size={64} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Email Verification
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Securing your account
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
            {verifying && (
              <>
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-200 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="text-blue-700 animate-spin" size={48} />
                </div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-600 bg-clip-text text-transparent mb-4">
                  Verifying Your Email...
                </h2>
                <p className="text-slate-600 text-lg">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {!verifying && success && (
              <>
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-300 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                  Email Verified!
                </h2>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    Your email has been successfully verified. 
                    <span className="font-bold text-slate-900"> You can now login to your account and start bidding!</span>
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    Go to Login
                    <ArrowRight size={20} />
                  </span>
                </Button>
              </>
            )}

            {!verifying && error && (
              <>
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-rose-100 border-4 border-red-300 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="text-red-600" size={48} />
                </div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-4">
                  Verification Failed
                </h2>
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-8">
                  <p className="text-slate-700 text-lg leading-relaxed">
                    {error}
                  </p>
                </div>
                <div className="space-y-4">
                  <Button
                    onClick={() => router.push('/register')}
                    className="w-full bg-gradient-to-r from-blue-800 via-indigo-950 to-blue-700 hover:from-blue-900 hover:via-indigo-950 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Register Again
                      <ArrowRight size={20} />
                    </span>
                  </Button>
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
